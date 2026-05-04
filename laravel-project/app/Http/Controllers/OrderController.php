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
use App\Services\SubscriptionService;
use App\Models\AutomationLog;
use App\Traits\HasOrderWebhooks;
use App\Traits\HasLoyaltyRewards;
use App\Traits\HasPosSync;
use App\Traits\HasCustomerSync;

class OrderController extends Controller
{
    use HasOrderWebhooks, HasLoyaltyRewards, HasPosSync, HasCustomerSync;

    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'restaurant_slug' => 'required|string',
            'order_type' => 'required|in:dine_in,takeaway,car',
            'cart' => 'required|array|min:1',
            'phone' => 'required|string',
            'customer_name' => 'required|string|min:2',
            'table_number' => 'required_if:order_type,dine_in',
            'car_number' => 'required_if:order_type,car',
        ], [
            'customer_name.required' => 'الاسم مطلوب لإتمام الطلب',
            'customer_name.min' => 'الاسم يجب أن يكون حرفين على الأقل',
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

        if (!$restaurant->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant is currently suspended'
            ], 403);
        }

        // Subscription checks
        $plan = $restaurant->subscription?->plan;
        if ($plan) {
            // Check allowed order types
            if ($plan->allowed_order_types && !in_array($request->order_type, $plan->allowed_order_types)) {
                return response()->json([
                    'success' => false,
                    'message' => $this->subscriptionService->upgradeMessage('order_type')
                ], 422);
            }

            // Check monthly order limit
            if (!$this->subscriptionService->checkLimit($restaurant, 'orders')) {
                return response()->json([
                    'success' => false,
                    'message' => $this->subscriptionService->upgradeMessage('monthly_orders_limit')
                ], 422);
            }
        }

        // Validate branch belongs to restaurant
        if ($request->branch_id) {
            $branchExists = DB::table('branches')
                ->where('id', $request->branch_id)
                ->where('restaurant_id', $restaurant->id)
                ->exists();
            if (!$branchExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid branch for this restaurant'
                ], 422);
            }
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

            // Sync customer record (restaurant_customers table)
            $this->syncRestaurantCustomer($order);

            // POS Sync: Sync order to external POS system (Foodics, Rewaa, etc.)
            // This is optional and will only run if an integration is enabled for this restaurant.
            $this->syncOrderToPos($order);

            // First n8n automation integration: Send order data to n8n and log the attempt.
            // This is triggered after the order is saved successfully.
            $webhookUrl = config('services.n8n.order_created_webhook');
            if ($webhookUrl) {
                $fulfillmentLabel = $this->getFulfillmentLabel($order);

                $payload = [
                    'event_name' => 'order.created',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->phone, // Mapping phone to customer_phone as requested
                    'table_number' => $order->table_number,
                    'fulfillment_label' => $fulfillmentLabel,
                    'total' => (float)$order->total,
                    'restaurant_id' => $order->restaurant_id,
                    'tenant_id' => $order->restaurant_id,
                    'branch_id' => $order->branch_id,
                    'order_type' => $order->order_type,
                    'created_at' => $order->created_at,
                ];

                try {
                    $response = Http::timeout(5)->post($webhookUrl, $payload);
                    
                    // Log the success
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
                    // Log the failure
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

            // Trigger n8n invoice webhook for new order
            $this->sendOrderInvoiceWebhook($order);

            $wallet = \App\Models\CustomerWallet::where('phone', $order->phone)
                ->where('restaurant_id', $restaurant->id)
                ->first();

            $expectedRewards = $this->calculateExpectedRewards($order, $restaurant);

            return response()->json([
                'success' => true,
                'order_number' => $orderNumber,
                'total' => $total,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'order' => $order,
                'earned_points' => $expectedRewards['points'],
                'earned_cashback' => $expectedRewards['cashback'],
                'wallet' => [
                    'points' => $wallet ? $wallet->points : 0,
                    'cashback_balance' => $wallet ? (float)$wallet->cashback_balance : 0
                ],
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

        $order = Order::with('restaurant')->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $oldStatus = $order->status;
        $order->status = $request->status;
        $order->save();

        // Trigger n8n review webhook if status changed to completed
        if ($request->status === 'completed' && $oldStatus !== 'completed') {
            \Illuminate\Support\Facades\Log::info("Order Controller Status Updated to Completed", [
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'restaurant_id' => $order->restaurant_id,
                'customer_phone' => $order->phone,
                'total' => $order->total
            ]);
            $this->sendOrderCompletedWebhook($order);
            $this->applyOrderRewards($order->fresh(['restaurant']));
        }

        return response()->json(['success' => true, 'message' => 'Status updated successfully', 'order' => $order]);
    }

    public function track($order_number)
    {
        $order = Order::with(['items.addons', 'restaurant'])->where('order_number', $order_number)->first();
        
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        return response()->json(['success' => true, 'order' => $order]);
    }
    public function recalculateRewards($id)
    {
        $order = Order::with('restaurant')->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $result = $this->applyOrderRewards($order);

        if (isset($result['error'])) {
            $message = 'فشل في تطبيق المكافآت: ';
            switch ($result['error']) {
                case 'total below min amount': $message .= 'إجمالي الطلب أقل من الحد الأدنى (' . ($result['min_order'] ?? '0') . ')'; break;
                case 'rewards disabled': $message .= 'نظام المكافآت معطل للمطعم'; break;
                case 'already processed or invalid settings': $message .= 'تمت المعالجة مسبقاً أو الإعدادات غير صالحة'; break;
                default: $message .= $result['error'];
            }
            return response()->json(['success' => false, 'message' => $message]);
        }

        $walletAfter = \App\Models\CustomerWallet::where('phone', $order->phone)
            ->where('restaurant_id', $order->restaurant_id)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'تم إعادة احتساب المكافآت بنجاح',
            'earned' => $result,
            'wallet_balance' => [
                'points' => $walletAfter ? $walletAfter->points : 0,
                'cashback' => $walletAfter ? (float)$walletAfter->cashback_balance : 0
            ]
        ]);
    }
}
