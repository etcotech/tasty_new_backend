<?php

namespace App\Traits;

use App\Models\Order;
use App\Models\AutomationLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait HasOrderWebhooks
{
    /**
     * Get a human-readable fulfillment label based on order type.
     */
    protected function getFulfillmentLabel(Order $order)
    {
        return match($order->order_type) {
            'dine_in' => 'رقم الطاولة: ' . $order->table_number,
            'takeaway' => 'استلام من المطعم',
            'car' => 'استلام من السيارة',
            default => $order->order_type,
        };
    }

    /**
     * Send the order completed/review webhook to n8n.
     */
    protected function sendOrderCompletedWebhook(Order $order)
    {
        $webhookUrl = config('services.n8n.order_review_webhook');
        if (!$webhookUrl) {
            return;
        }

        // Ensure we only send this once per order successfully
        $alreadySent = AutomationLog::where('restaurant_id', $order->restaurant_id)
            ->where('event_name', 'order.completed')
            ->where('payload->order_id', $order->id)
            ->where('status', 'success')
            ->exists();

        if ($alreadySent) {
            return;
        }

        // Ensure restaurant details are loaded for the review URL
        $order->loadMissing('restaurant');

        $payload = [
            'event_name' => 'order.completed',
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->phone,
            'total' => (float)$order->total,
            'restaurant_id' => $order->restaurant_id,
            'tenant_id' => $order->restaurant_id,
            'branch_id' => $order->branch_id,
            'order_type' => $order->order_type,
            'fulfillment_label' => $this->getFulfillmentLabel($order),
            'google_review_url' => $order->restaurant?->google_review_url,
            'completed_at' => now()->toIso8601String(),
        ];

        try {
            // Send POST request to n8n with 5s timeout to prevent blocking
            $response = Http::timeout(5)->post($webhookUrl, $payload);
            
            // Log the result in automation_logs
            AutomationLog::create([
                'restaurant_id' => $order->restaurant_id,
                'automation_id' => null,
                'event_name' => 'order.completed',
                'payload' => $payload,
                'status' => $response->successful() ? 'success' : 'failed',
                'response' => $response->json() ?? ['raw' => $response->body()],
                'error_message' => $response->successful() ? null : 'HTTP Error: ' . $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::error('n8n Review Automation Failed: ' . $e->getMessage());
            
            // Log the exception failure
            AutomationLog::create([
                'restaurant_id' => $order->restaurant_id,
                'automation_id' => null,
                'event_name' => 'order.completed',
                'payload' => $payload,
                'status' => 'failed',
                'response' => null,
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send the order invoice webhook to n8n.
     */
    protected function sendOrderInvoiceWebhook(Order $order)
    {
        $webhookUrl = config('services.n8n.invoice_webhook');
        if (!$webhookUrl) {
            return;
        }

        // Ensure we only send this once per order successfully
        $alreadySent = AutomationLog::where('restaurant_id', $order->restaurant_id)
            ->where('event_name', 'order.invoice')
            ->where('payload->order_id', $order->id)
            ->where('status', 'success')
            ->exists();

        if ($alreadySent) {
            return;
        }

        // Ensure relations are loaded
        $order->loadMissing(['restaurant', 'items']);

        $itemsPayload = $order->items->map(function ($item) {
            return [
                'name' => $item->product_name_ar ?? $item->product_name_en ?? 'Unknown',
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total_price,
                'addons' => $item->addons->map(function ($addon) {
                    return [
                        'name' => $addon->addon_name_ar ?? $addon->addon_name_en ?? 'Unknown',
                        'quantity' => $addon->quantity,
                        'price' => (float) $addon->price,
                        'total' => (float) $addon->total,
                    ];
                })->toArray(),
            ];
        })->toArray();

        $wallet = \App\Models\CustomerWallet::where('phone', $order->phone)
            ->where('restaurant_id', $order->restaurant_id)
            ->first();

        $payload = [
            'event_name' => 'order.invoice',
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->phone,
            'fulfillment_label' => $this->getFulfillmentLabel($order),
            'subtotal' => (float)$order->subtotal,
            'discount_amount' => (float)$order->discount_amount,
            'coupon_code' => $order->coupon_code,
            'total_after_discount' => (float)($order->subtotal - $order->discount_amount),
            'tax' => (float)$order->tax,
            'final_total' => (float)$order->total,
            'total' => (float)$order->total,
            'currency' => 'ريال',
            'restaurant_name' => $order->restaurant?->name ?? 'المطعم',
            'items' => $itemsPayload,
            'wallet' => [
                'points' => $wallet ? $wallet->points : 0,
                'cashback_balance' => $wallet ? (float) $wallet->cashback_balance : 0,
            ]
        ];

        try {
            // Send POST request to n8n with 5s timeout to prevent blocking
            $response = Http::timeout(5)->post($webhookUrl, $payload);
            
            // Log the result in automation_logs
            AutomationLog::create([
                'restaurant_id' => $order->restaurant_id,
                'automation_id' => null,
                'event_name' => 'order.invoice',
                'payload' => $payload,
                'status' => $response->successful() ? 'success' : 'failed',
                'response' => $response->json() ?? ['raw' => $response->body()],
                'error_message' => $response->successful() ? null : 'HTTP Error: ' . $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::error('n8n Invoice Automation Failed: ' . $e->getMessage());
            
            // Log the exception failure
            AutomationLog::create([
                'restaurant_id' => $order->restaurant_id,
                'automation_id' => null,
                'event_name' => 'order.invoice',
                'payload' => $payload,
                'status' => 'failed',
                'response' => null,
                'error_message' => $e->getMessage(),
            ]);
        }
    }
    /**
     * Send the order created webhook to n8n.
     */
    protected function sendOrderCreatedWebhook(Order $order)
    {
        $webhookUrl = config('services.n8n.order_created_webhook');
        if (!$webhookUrl) {
            return;
        }

        $fulfillmentLabel = $this->getFulfillmentLabel($order);

        $payload = [
            'event_name' => 'order.created',
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->phone,
            'table_number' => $order->table_number,
            'fulfillment_label' => $fulfillmentLabel,
            'subtotal' => (float)$order->subtotal,
            'discount_amount' => (float)$order->discount_amount,
            'coupon_code' => $order->coupon_code,
            'tax' => (float)$order->tax,
            'total' => (float)$order->total,
            'restaurant_id' => $order->restaurant_id,
            'tenant_id' => $order->restaurant_id,
            'branch_id' => $order->branch_id,
            'order_type' => $order->order_type,
            'created_at' => $order->created_at,
        ];

        try {
            $response = Http::timeout(5)->post($webhookUrl, $payload);
            
            AutomationLog::create([
                'restaurant_id' => $order->restaurant_id,
                'automation_id' => null,
                'event_name' => 'order.created',
                'payload' => $payload,
                'status' => $response->successful() ? 'success' : 'failed',
                'response' => $response->json() ?? ['raw' => $response->body()],
                'error_message' => $response->successful() ? null : 'HTTP Error: ' . $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::error('n8n Automation Failed: ' . $e->getMessage());
            
            AutomationLog::create([
                'restaurant_id' => $order->restaurant_id,
                'automation_id' => null,
                'event_name' => 'order.created',
                'payload' => $payload,
                'status' => 'failed',
                'response' => null,
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
