<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiCampaign;
use App\Services\AiCampaignDispatcher;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AiCampaignController extends Controller
{
    public function store(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'target_audience' => 'required|string',
            'suggested_time_window' => 'nullable|string',
            'reason' => 'nullable|string',
        ]);

        $campaign = AiCampaign::create([
            'restaurant_id' => $restaurant->id,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'target_audience' => $validated['target_audience'],
            'suggested_time_window' => $validated['suggested_time_window'],
            'reason' => $validated['reason'],
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم حفظ الحملة كمسودة',
            'campaign' => $campaign
        ]);
    }

    public function update(Request $request, $id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'target_audience' => 'required|string',
        ]);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $campaign->update([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'target_audience' => $validated['target_audience'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الحملة',
            'campaign' => $campaign
        ]);
    }

    public function show($id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $analytics = null;

        if ($campaign->status === 'sent' && $campaign->sent_at) {
            $query = \App\Models\RestaurantCustomer::where('restaurant_id', $restaurant->id)
                ->whereNotNull('phone')
                ->where('phone', '!=', '');

            switch ($campaign->target_audience) {
                case 'repeat':
                case 'repeat_customers':
                    $query->where('orders_count', '>', 1);
                    break;
                case 'inactive_7':
                    $query->where('last_order_at', '<', \Carbon\Carbon::now()->subDays(7));
                    break;
                case 'inactive_30':
                    $query->where('last_order_at', '<', \Carbon\Carbon::now()->subDays(30));
                    break;
            }

            $phones = $query->pluck('phone');

            $ordersAfter = \App\Models\Order::where('restaurant_id', $restaurant->id)
                ->whereIn('phone', $phones)
                ->where('created_at', '>=', $campaign->sent_at)
                ->whereIn('status', ['completed', 'delivered']);
                
            $analytics = [
                'customers_reached' => $campaign->target_count ?? $phones->count(),
                'orders_count' => (clone $ordersAfter)->count(),
                'revenue_generated' => round((clone $ordersAfter)->sum('total'), 2)
            ];
        }

        return response()->json([
            'success' => true,
            'campaign' => $campaign,
            'analytics' => $analytics
        ]);
    }

    public function schedule(Request $request, $id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $validated = $request->validate([
            'scheduled_at' => 'required|date|after:now',
        ]);

        $campaign->update([
            'status' => 'scheduled',
            'scheduled_at' => Carbon::parse($validated['scheduled_at']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم جدولة الحملة بنجاح',
            'campaign' => $campaign
        ]);
    }

    public function cancel($id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $campaign->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إلغاء الحملة',
            'campaign' => $campaign
        ]);
    }

    public function sendNow($id, AiCampaignDispatcher $dispatcher)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        if (in_array($campaign->status, ['draft', 'suggested'])) {
            $campaign->update(['status' => 'scheduled']);
        }

        $result = $dispatcher->dispatch($campaign, true);

        if ($result['success']) {
            $result['message'] = 'تم إرسال الحملة الآن بنجاح';
        }

        return response()->json($result);
    }

    public function previewTarget(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $validated = $request->validate([
            'target_audience' => 'required|string',
            'message' => 'required|string',
        ]);

        $query = \App\Models\RestaurantCustomer::where('restaurant_id', $restaurant->id)
            ->whereNotNull('phone')
            ->where('phone', '!=', '');

        switch ($validated['target_audience']) {
            case 'repeat':
            case 'repeat_customers':
                $query->where('orders_count', '>', 1);
                break;
            case 'inactive_7':
                $query->where('last_order_at', '<', \Carbon\Carbon::now()->subDays(7));
                break;
            case 'inactive_30':
                $query->where('last_order_at', '<', \Carbon\Carbon::now()->subDays(30));
                break;
        }

        $count = $query->count();
        $firstCustomer = $query->first();

        $previewMessage = null;
        if ($firstCustomer) {
            $previewMessage = str_replace(
                ['[اسم العميل]', '[اسم المطعم]'],
                [$firstCustomer->name, $restaurant->name],
                $validated['message']
            );
        }

        return response()->json([
            'success' => true,
            'count' => $count,
            'preview_message' => $previewMessage,
            'customer_name' => $firstCustomer ? $firstCustomer->name : null,
        ]);
    }
}
