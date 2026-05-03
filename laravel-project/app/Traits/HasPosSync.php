<?php

namespace App\Traits;

use App\Models\Order;
use App\Models\PosIntegration;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

trait HasPosSync
{
    /**
     * Sync the order to the enabled POS system.
     */
    protected function syncOrderToPos(Order $order)
    {
        $integration = PosIntegration::where('restaurant_id', $order->restaurant_id)
            ->where('is_enabled', true)
            ->first();

        if (!$integration) {
            return;
        }

        Log::info("POS Sync: Starting sync for order {$order->id} to {$integration->provider}");

        try {
            $payload = $this->preparePosPayload($order, $integration);
            
            $response = $this->sendToPosApi($integration, $payload);

            if ($response && $response->successful()) {
                Log::info("POS Sync: Order {$order->id} successfully synced to {$integration->provider}");
                // Store POS external ID if returned
                $externalId = $response->json('data.id') ?? $response->json('id');
                if ($externalId) {
                    $order->update(['pos_external_id' => $externalId]);
                }
            } else {
                $errorMsg = $response ? $response->body() : 'No response from POS API';
                Log::error("POS Sync: Failed to sync order {$order->id} to {$integration->provider}. Error: {$errorMsg}");
            }
        } catch (\Exception $e) {
            Log::error("POS Sync: Exception while syncing order {$order->id}. Message: " . $e->getMessage());
        }
    }

    /**
     * Prepare the payload based on the POS provider requirements.
     */
    protected function preparePosPayload(Order $order, PosIntegration $integration)
    {
        // Structure items for POS
        $items = $order->items->map(function ($item) {
            return [
                'product_id' => $item->product_id, // In real world, this would be POS product ID
                'name' => $item->product_name_en,
                'quantity' => $item->quantity,
                'unit_price' => (float)$item->total_price / $item->quantity,
                'total_price' => (float)$item->total_price,
                'modifiers' => $item->addons ? $item->addons->map(function($a) {
                    return [
                        'name' => $a->addon_name_en,
                        'price' => (float)$a->price
                    ];
                }) : []
            ];
        });

        return [
            'order_number' => $order->order_number,
            'customer' => [
                'name' => $order->customer_name,
                'phone' => $order->phone,
            ],
            'branch_id' => $integration->branch_id ?? $order->branch_id,
            'items' => $items,
            'total' => (float)$order->total,
            'order_type' => $order->order_type,
            'payment_method' => $order->payment_method,
            'created_at' => $order->created_at->toIso8601String(),
        ];
    }

    /**
     * Send the payload to the specific POS API.
     */
    protected function sendToPosApi(PosIntegration $integration, $payload)
    {
        $baseUrl = $this->getPosBaseUrl($integration);
        $token = $integration->access_token;

        if (!$baseUrl || !$token) {
            return null;
        }

        // Foodics Example (Simplified)
        if ($integration->provider === 'foodics') {
            return Http::withToken($token)
                ->withHeaders(['Accept' => 'application/json'])
                ->post("{$baseUrl}/orders", $payload);
        }

        // Simulation for other providers or if no actual implementation yet
        Log::info("POS Sync Simulation: Sending payload to {$integration->provider}", ['payload' => $payload]);
        
        return new class {
            public function successful() { return true; }
            public function body() { return '{"success": true, "message": "Simulation successful"}'; }
            public function json($key = null) { return ['id' => 'pos_sim_' . rand(1000, 9999)]; }
        };
    }

    /**
     * Get the base URL for the POS provider.
     */
    protected function getPosBaseUrl(PosIntegration $integration)
    {
        $envs = [
            'foodics' => [
                'sandbox' => 'https://api-sandbox.foodics.com/v5',
                'live' => 'https://api.foodics.com/v5',
            ],
            'rewaa' => [
                'sandbox' => 'https://sandbox.rewaa.com/api/v1',
                'live' => 'https://api.rewaa.com/api/v1',
            ]
        ];

        return $envs[$integration->provider][$integration->environment] ?? null;
    }
}
