<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Restaurant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemAddon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'restaurant_slug' => 'required|string',
            'order_type' => 'required|in:dine_in,takeaway,car',
            'cart' => 'required|array|min:1',
            'table_number' => 'required_if:order_type,dine_in',
            'phone' => 'required_if:order_type,takeaway,car',
            'car_number' => 'required_if:order_type,car',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $restaurant = Restaurant::where('slug', $request->restaurant_slug)->first();

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        }

        try {
            DB::beginTransaction();

            $subtotal = 0;
            $itemsData = [];

            // Calculate subtotal from cart payload
            foreach ($request->cart as $cartItem) {
                $qty = $cartItem['quantity'] ?? 1;
                $itemBasePrice = $cartItem['price'] ?? 0;
                $addonsSum = 0;

                if (isset($cartItem['addons']) && is_array($cartItem['addons'])) {
                    foreach ($cartItem['addons'] as $addon) {
                        $addonsSum += $addon['price'] ?? 0;
                    }
                }

                $itemTotal = ($itemBasePrice + $addonsSum) * $qty;
                $subtotal += $itemTotal;

                $itemsData[] = [
                    'cartItem' => $cartItem,
                    'itemTotal' => $itemTotal
                ];
            }

            $taxRate = ($restaurant->tax_percentage ?? 8) / 100;
            $tax = $subtotal * $taxRate;
            $total = $subtotal + $tax;

            // Generate unique order number
            $orderNumber = 'ORD' . rand(1000, 9999) . strtoupper(Str::random(2));

            $order = Order::create([
                'restaurant_id' => $restaurant->id,
                'branch_id' => $request->branch_id,
                'order_number' => $orderNumber,
                'order_type' => $request->order_type,
                'status' => 'pending',
                'table_number' => $request->table_number,
                'car_number' => $request->car_number,
                'phone' => $request->phone,
                'customer_name' => $request->customer_name,
                'notes' => $request->notes,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
            ]);

            foreach ($itemsData as $data) {
                $cartItem = $data['cartItem'];
                
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem['product_id'] ?? $cartItem['id'] ?? null,
                    'product_name_ar' => $cartItem['name_ar'] ?? $cartItem['name'] ?? 'Unknown',
                    'product_name_en' => $cartItem['name_en'] ?? $cartItem['name'] ?? 'Unknown',
                    'quantity' => $cartItem['quantity'] ?? 1,
                    'unit_price' => $cartItem['price'] ?? 0,
                    'total_price' => $data['itemTotal'],
                ]);

                if (isset($cartItem['addons']) && is_array($cartItem['addons'])) {
                    foreach ($cartItem['addons'] as $addon) {
                        OrderItemAddon::create([
                            'order_item_id' => $orderItem->id,
                            'addon_id' => $addon['id'] ?? null,
                            'addon_name_ar' => $addon['name_ar'] ?? $addon['name'] ?? 'Unknown',
                            'addon_name_en' => $addon['name_en'] ?? $addon['name'] ?? 'Unknown',
                            'price' => $addon['price'] ?? 0,
                        ]);
                    }
                }
            }

            DB::commit();

            // Trigger n8n webhook
            $webhookUrl = config('services.n8n.order_created_webhook');
            if ($webhookUrl) {
                try {
                    $order->load('items.addons');
                    $payload = [
                        'order_number' => $order->order_number,
                        'restaurant' => $restaurant->name_ar ?? $restaurant->slug,
                        'order_type' => $order->order_type,
                        'status' => $order->status,
                        'customer_name' => $order->customer_name,
                        'phone' => $order->phone,
                        'table_number' => $order->table_number,
                        'car_number' => $order->car_number,
                        'notes' => $order->notes,
                        'subtotal' => (float)$order->subtotal,
                        'tax' => (float)$order->tax,
                        'total' => (float)$order->total,
                        'tracking_url' => url('/track/' . $order->order_number),
                        'items' => $order->items->map(fn($item) => [
                            'name_ar' => $item->product_name_ar,
                            'name_en' => $item->product_name_en,
                            'quantity' => (int)$item->quantity,
                            'unit_price' => (float)$item->unit_price,
                            'total_price' => (float)$item->total_price,
                            'addons' => $item->addons->map(fn($addon) => [
                                'name_ar' => $addon->addon_name_ar,
                                'name_en' => $addon->addon_name_en,
                                'price' => (float)$addon->price,
                            ])->toArray(),
                        ])->toArray(),
                    ];

                    Http::timeout(5)->post($webhookUrl, $payload);
                } catch (\Exception $e) {
                    Log::warning('n8n Order Created Webhook Failed: ' . $e->getMessage(), [
                        'order_number' => $order->order_number,
                        'webhook_url' => $webhookUrl
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'order_number' => $orderNumber,
                'total' => $total,
                'message' => 'Order created successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,preparing,ready,completed'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Invalid status'], 422);
        }

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->status = $request->status;
        $order->save();

        return response()->json(['success' => true, 'message' => 'Status updated successfully', 'order' => $order]);
    }

    public function track($order_number)
    {
        $order = Order::with(['items.addons'])->where('order_number', $order_number)->first();
        
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        return response()->json(['success' => true, 'order' => $order]);
    }
}
