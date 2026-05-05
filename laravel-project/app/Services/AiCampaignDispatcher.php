<?php

namespace App\Services;

use App\Models\AiCampaign;
use App\Models\RestaurantCustomer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AiCampaignDispatcher
{
    /**
     * Dispatch a campaign to the n8n webhook.
     */
    public function dispatch(AiCampaign $campaign, $isManual = false): array
    {
        // 1. Verify status and timing
        if (!in_array($campaign->status, ['scheduled', 'failed'])) {
            return ['success' => false, 'message' => "الحملة ليست في حالة مجدولة (الحالة الحالية: {$campaign->status})"];
        }

        // If scheduled, check if it's time yet. If failed, we allow manual retry.
        if (!$isManual && $campaign->status === 'scheduled' && $campaign->scheduled_at && $campaign->scheduled_at->isFuture()) {
            return ['success' => false, 'message' => 'وقت الإرسال لم يحن بعد'];
        }

        $campaign->update(['status' => 'scheduled']);

        try {
            $restaurant = $campaign->restaurant;
            if (!$restaurant) {
                throw new \Exception("المطعم غير موجود");
            }

            // Anti-Spam: Block sending if last campaign < 48 hours
            $lastCampaign = AiCampaign::where('restaurant_id', $restaurant->id)
                ->where('status', 'sent')
                ->where('id', '!=', $campaign->id)
                ->orderBy('sent_at', 'desc')
                ->first();

            if ($lastCampaign && $lastCampaign->sent_at && $lastCampaign->sent_at->diffInHours(now()) < 48) {
                $campaign->update([
                    'status' => 'failed',
                    'failure_reason' => 'تم منع الإرسال لتجنب إزعاج العملاء (يجب مرور 48 ساعة على آخر حملة)',
                ]);
                return ['success' => false, 'message' => 'تم منع الإرسال لتجنب إزعاج العملاء'];
            }

            // Anti-Spam: Do not send more than 2 campaigns per week
            $campaignsThisWeek = AiCampaign::where('restaurant_id', $restaurant->id)
                ->where('status', 'sent')
                ->where('id', '!=', $campaign->id)
                ->where('sent_at', '>=', now()->subDays(7))
                ->count();

            if ($campaignsThisWeek >= 2) {
                $campaign->update([
                    'status' => 'failed',
                    'failure_reason' => 'تم منع الإرسال لتجنب إزعاج العملاء (تم تجاوز الحد الأقصى: حملتين أسبوعياً)',
                ]);
                return ['success' => false, 'message' => 'تم منع الإرسال لتجنب إزعاج العملاء'];
            }

            // 2. Resolve target customers
            $customers = $this->resolveTargetCustomers($campaign);

            if ($customers->isEmpty()) {
                $campaign->update([
                    'status' => 'failed',
                    'failure_reason' => 'لا يوجد عملاء مطابقون للجمهور المستهدف',
                ]);
                return ['success' => false, 'message' => 'لا يوجد عملاء مطابقون للجمهور المستهدف'];
            }

            // 3. Build payload
            $payload = [
                'event_name' => 'ai.campaign.send',
                'campaign_id' => $campaign->id,
                'restaurant_id' => $restaurant->id,
                'restaurant_name' => $restaurant->name,
                'title' => $campaign->title,
                'message' => $campaign->message,
                'target_audience' => $campaign->target_audience,
                'customers' => $customers->map(function ($c) {
                    return [
                        'name' => $c->name,
                        'phone' => $c->phone,
                    ];
                })->toArray(),
            ];

            // 4. POST to N8N
            $webhookUrl = config('services.n8n.ai_campaign_webhook') ?: env('N8N_AI_CAMPAIGN_WEBHOOK');
            
            if (!$webhookUrl) {
                throw new \Exception("رابط webhook الخاص بـ n8n غير مهيأ");
            }

            $response = Http::timeout(30)->post($webhookUrl, $payload);

            if ($response->successful()) {
                $campaign->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'target_count' => $customers->count(),
                    'failure_reason' => null,
                ]);
                
                // Update customers' last_campaign_sent_at
                $customerIds = $customers->pluck('id')->toArray();
                RestaurantCustomer::whereIn('id', $customerIds)->update([
                    'last_campaign_sent_at' => now()
                ]);

                // Log the send action
                \App\Models\AiAutomationLog::create([
                    'restaurant_id' => $restaurant->id,
                    'type' => 'campaign_sent',
                    'input_summary' => ['campaign_id' => $campaign->id, 'target_count' => $customers->count()],
                    'output_text' => "تم إرسال الحملة '{$campaign->title}' بنجاح لـ {$customers->count()} عميل"
                ]);
                
                Log::info("AI Campaign #{$campaign->id} sent successfully to n8n.");
                return ['success' => true, 'message' => 'تم إرسال الحملة إلى n8n بنجاح'];
            } else {
                throw new \Exception("n8n Webhook Error: " . ($response->body() ?: 'Unknown error'));
            }

        } catch (\Exception $e) {
            Log::error("AI Campaign Dispatch Error (#{$campaign->id}): " . $e->getMessage());
            
            $campaign->update([
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
            ]);

            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Resolve customers based on target audience.
     */
    private function resolveTargetCustomers(AiCampaign $campaign)
    {
        $query = RestaurantCustomer::where('restaurant_id', $campaign->restaurant_id)
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->where(function($q) {
                $q->whereNull('last_campaign_sent_at')
                  ->orWhere('last_campaign_sent_at', '<', Carbon::now()->subDays(7));
            });

        switch ($campaign->target_audience) {
            case 'repeat':
                $query->where('orders_count', '>', 1);
                break;
            case 'inactive_7':
                $query->where('last_order_at', '<', Carbon::now()->subDays(7));
                break;
            case 'inactive_30':
                $query->where('last_order_at', '<', Carbon::now()->subDays(30));
                break;
            case 'all':
            default:
                // No extra filters
                break;
        }

        return $query->get();
    }
}
