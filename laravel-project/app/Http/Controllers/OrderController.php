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
use App\Services\PaymobService;

class OrderController extends Controller
{
    use HasOrderWebhooks, HasLoyaltyRewards, HasPosSync, HasCustomerSync;

    protected $subscriptionService;
    protected $paymobService;

    public function __construct(SubscriptionService $subscriptionService, PaymobService $paymobService)
    {
        $this->subscriptionService = $subscriptionService;
        $this->paymobService = $paymobService;
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

            // Coupon Validation and Discount Calculation
            $discountAmount = 0;
            $couponId = null;
            $couponCode = null;

            if ($request->coupon_code) {
                $coupon = \App\Models\Coupon::where('restaurant_id', $restaurant->id)
                    ->where('code', $request->coupon_code)
                    ->first();

                if ($coupon) {
                    list($isValid, $message) = $coupon->isValidFor($subtotal, $request->order_type, $request->phone);
                    if ($isValid) {
                        $discountAmount = $coupon->calculateDiscount($subtotal);
                        $couponId = $coupon->id;
                        $couponCode = $coupon->code;
                    }
                }
            }

            // Wallet Redemption Calculation
            $walletDiscountAmount = 0;
            $pointsToRedeem = (int)($request->points_to_redeem ?? 0);
            $cashbackToRedeem = (float)($request->cashback_to_redeem ?? 0);

            if ($pointsToRedeem > 0 || $cashbackToRedeem > 0) {
                $normalizedPhone = $this->normalizePhoneNumber($request->phone);
                $wallet = \App\Models\CustomerWallet::where('phone', $normalizedPhone)
                    ->where('restaurant_id', $restaurant->id)
                    ->first();

                if (!$wallet) {
                    return response()->json(['success' => false, 'message' => 'Wallet not found'], 422);
                }

                if ($subtotal < $restaurant->min_order_amount_for_wallet_redeem) {
                    return response()->json(['success' => false, 'message' => 'Order total below minimum for wallet redemption'], 422);
                }

                if ($pointsToRedeem > 0) {
                    if ($pointsToRedeem < $restaurant->min_points_to_redeem) {
                        return response()->json(['success' => false, 'message' => 'Minimum points to redeem not reached'], 422);
                    }
                    if ($wallet->points < $pointsToRedeem) {
                        return response()->json(['success' => false, 'message' => 'Insufficient points balance'], 422);
                    }
                    $pointsDiscount = ($pointsToRedeem / $restaurant->min_points_to_redeem) * $restaurant->points_redeem_value;
                    $walletDiscountAmount += $pointsDiscount;
                }

                if ($cashbackToRedeem > 0) {
                    if ($cashbackToRedeem < $restaurant->min_cashback_to_redeem) {
                        return response()->json(['success' => false, 'message' => 'Minimum cashback to redeem not reached'], 422);
                    }
                    if ($wallet->cashback_balance < $cashbackToRedeem) {
                        return response()->json(['success' => false, 'message' => 'Insufficient cashback balance'], 422);
                    }
                    $walletDiscountAmount += $cashbackToRedeem;
                }

                $maxAllowedDiscount = $subtotal * ($restaurant->max_wallet_discount_percentage / 100);
                if ($walletDiscountAmount > $maxAllowedDiscount + 0.01) { // 0.01 for float precision
                    return response()->json(['success' => false, 'message' => 'Wallet discount exceeds maximum allowed percentage'], 422);
                }
            }

            $taxableAmount = max(0, $subtotal - $discountAmount - $walletDiscountAmount);
            $taxRate = ($restaurant->tax_percentage ?? 15) / 100;
            $tax = $taxableAmount * $taxRate;
            $total = $taxableAmount + $tax;

            $gateway = $restaurant->paymentGateway;
            $paymentEnabled = $gateway && $gateway->is_enabled;

            $paymentMethod = $paymentEnabled ? 'paymob_online' : 'manual';
            $paymentStatus = $paymentEnabled ? 'pending' : 'unpaid';
            $orderStatus = $paymentEnabled ? 'pending_payment' : 'pending';

            // Generate unique order number
            $orderNumber = 'ORD' . rand(1000, 9999) . strtoupper(Str::random(2));

            $order = Order::create([
                'restaurant_id' => $restaurant->id,
                'branch_id' => $request->branch_id,
                'order_number' => $orderNumber,
                'order_type' => $request->order_type,
                'status' => $orderStatus,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'payment_provider' => $paymentMethod === 'paymob' ? 'paymob' : null,
                'table_number' => $request->table_number,
                'car_number' => $request->car_number,
                'phone' => $request->phone,
                'customer_name' => $request->customer_name,
                'notes' => $request->notes,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'coupon_id' => $couponId,
                'coupon_code' => $couponCode,
                'tax' => $tax,
                'total' => $total,
                'points_used' => $pointsToRedeem,
                'cashback_used' => $cashbackToRedeem,
                'wallet_discount_amount' => $walletDiscountAmount,
            ]);

            // Increment coupon usage
            if ($couponId) {
                \App\Models\Coupon::where('id', $couponId)->increment('usage_count');
            }

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

            // Apply wallet deduction
            $this->applyWalletRedemption($order);

            // Sync customer record (restaurant_customers table)
            $this->syncRestaurantCustomer($order);

            // If Paymob is enabled, generate payment link
            if ($paymentEnabled) {
                try {
                    $gateway = $restaurant->paymentGateway;
                    if (!$gateway || !$gateway->is_enabled) {
                        throw new \Exception('إعدادات Paymob غير مكتملة (بوابة الدفع غير مفعلة)');
                    }

                    $currency = $restaurant->currency ?? 'SAR';
                    $amountCents = (int)round($order->total * 100);

                    // CASE 1: New Intention API (Unified Checkout) - Preferred for KSA
                    if ($gateway->paymob_secret_key && $gateway->paymob_public_key) {
                        $items = [];
                        foreach ($order->items as $item) {
                            $items[] = [
                                'name' => $item->product_name_ar ?: $item->product_name_en,
                                'amount' => (int)round($item->unit_price * 100),
                                'description' => 'Quantity: ' . $item->quantity,
                                'quantity' => (int)$item->quantity
                            ];
                        }

                        $intention = $this->paymobService->createPaymentIntention(
                            $gateway->paymob_secret_key,
                            $amountCents,
                            $currency,
                            $gateway->paymob_integration_id,
                            [
                                'first_name' => $order->customer_name ?: 'Customer',
                                'last_name' => 'Tasty',
                                'phone_number' => $order->phone,
                                'email' => 'customer@tasty.com'
                            ],
                            [
                                'order_id' => $order->id,
                                'items' => $items
                            ]
                        );

                        $order->update([
                            'paymob_order_id' => $intention['order']['id'] ?? null,
                            'payment_reference' => $intention['id'] ?? null
                        ]);

                        $clientSecret = $intention['client_secret'];
                        $publicKey = $gateway->paymob_public_key;
                        
                        // Construction of Unified Checkout URL for KSA
                        $baseUrl = ($currency === 'SAR') ? 'https://ksa.paymob.com' : 'https://accept.paymob.com';
                        $paymentUrl = "{$baseUrl}/unifiedcheckout/?publicKey={$publicKey}&clientSecret={$clientSecret}";

                        return response()->json([
                            'success' => true,
                            'requires_payment' => true,
                            'payment_url' => $paymentUrl,
                            'order_number' => $orderNumber,
                            'order' => $order,
                            'message' => 'Order created, redirecting to payment'
                        ]);
                    }

                    // CASE 2: Legacy Iframe Flow (API Key based)
                    $token = $this->paymobService->authenticate($gateway->paymob_api_key, $currency);
                    
                    $paymobOrder = $this->paymobService->createOrder($token, $amountCents, $order->id, $currency);
                    
                    $order->update([
                        'paymob_order_id' => $paymobOrder['id']
                    ]);

                    $paymentToken = $this->paymobService->getPaymentKey(
                        $token, 
                        $paymobOrder['id'], 
                        $amountCents, 
                        $gateway->paymob_integration_id, 
                        $currency,
                        [
                            'first_name' => $order->customer_name ?: 'Customer',
                            'last_name' => 'Tasty',
                            'phone_number' => $order->phone,
                            'email' => 'customer@tasty.com'
                        ]
                    );

                    $iframeId = $gateway->paymob_iframe_id;
                    if (empty($iframeId)) {
                        throw new \Exception('Iframe ID غير صحيح أو مفقود');
                    }

                    $baseUrl = ($currency === 'SAR') ? 'https://ksa.paymob.com' : 'https://accept.paymob.com';
                    $paymentUrl = "{$baseUrl}/api/acceptance/iframes/{$iframeId}?payment_token={$paymentToken}";

                    return response()->json([
                        'success' => true,
                        'requires_payment' => true,
                        'payment_url' => $paymentUrl,
                        'order_number' => $orderNumber,
                        'order' => $order,
                        'message' => 'Order created, redirecting to payment'
                    ]);

                } catch (\Exception $paymobException) {
                    // Log the technical details
                    Log::error('Paymob Checkout Failure', [
                        'restaurant_id' => $restaurant->id,
                        'order_id' => $order->id,
                        'amount' => $order->total,
                        'currency' => $restaurant->currency ?? 'SAR',
                        'error' => $paymobException->getMessage(),
                        // 'trace' => $paymobException->getTraceAsString() // Removed to avoid bloat in response during test
                    ]);

                    // Rollback the order creation if Paymob fails
                    DB::rollBack();
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'فشل إنشاء رابط الدفع: ' . $paymobException->getMessage()
                    ], 422);
                }
            }

            // POS Sync: Sync order to external POS system (Foodics, Rewaa, etc.)
            // This is optional and will only run if an integration is enabled for this restaurant.
            $this->syncOrderToPos($order);

            // First n8n automation integration: Send order data to n8n and log the attempt.
            // This is triggered after the order is saved successfully.
            $this->sendOrderCreatedWebhook($order);

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
            Log::error('General Checkout Error', [
                'error' => $e->getMessage(),
                'restaurant' => $request->restaurant_slug
            ]);
            return response()->json([
                'success' => false,
                'message' => 'فشل إنشاء الطلب: ' . $e->getMessage()
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

        $earned_points = \App\Models\WalletTransaction::where('order_id', $order->id)
            ->where('type', 'points_earned')
            ->sum('amount');

        $earned_cashback = \App\Models\WalletTransaction::where('order_id', $order->id)
            ->where('type', 'cashback_earned')
            ->sum('amount');

        return response()->json([
            'success' => true, 
            'order' => $order,
            'earned_points' => (int)$earned_points,
            'earned_cashback' => (float)$earned_cashback
        ]);
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
