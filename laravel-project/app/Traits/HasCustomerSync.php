<?php

namespace App\Traits;

use App\Models\RestaurantCustomer;
use Illuminate\Support\Facades\Log;

trait HasCustomerSync
{
    /**
     * Sync or create a restaurant customer record after order creation.
     */
    protected function syncRestaurantCustomer($order): void
    {
        if (!$order->restaurant_id || !$order->phone) {
            return;
        }

        try {
            $customer = RestaurantCustomer::firstOrNew([
                'restaurant_id' => $order->restaurant_id,
                'phone'         => $order->phone,
            ]);

            // Set name only if provided and customer has no name yet
            if (!empty($order->customer_name) && (empty($customer->name) || $customer->name !== $order->customer_name)) {
                $customer->name = $order->customer_name;
            }

            // Set first_order_id only once
            if (!$customer->exists || !$customer->first_order_id) {
                $customer->first_order_id = $order->id;
            }

            $customer->last_order_id = $order->id;
            $customer->orders_count  = ($customer->orders_count ?? 0) + 1;
            $customer->total_spent   = (float)($customer->total_spent ?? 0) + (float)$order->total;
            $customer->last_order_at = $order->created_at ?? now();

            $customer->save();
        } catch (\Exception $e) {
            Log::error('Customer sync failed for order #' . $order->id . ': ' . $e->getMessage());
        }
    }
}
