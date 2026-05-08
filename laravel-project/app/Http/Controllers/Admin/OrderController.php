<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Restaurant;

class OrderController extends Controller
{
    use \App\Traits\HasLoyaltyRewards;

    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'super_admin') {
            $orders = Order::with(['restaurant', 'branch', 'items.addons'])
                ->latest()
                ->get();
        } else {
            $restaurant = $this->getCurrentRestaurant();
            if (!$restaurant) {
                return redirect()->route('admin.restaurants.index');
            }

            $orders = Order::where('restaurant_id', $restaurant->id)
                ->with(['restaurant', 'branch', 'items.addons'])
                ->latest()
                ->get();
        }

        return Inertia::render('Admin/Orders', [
            'orders' => $orders
        ]);
    }

    public function recalculateRewards($id)
    {
        $order = Order::with('restaurant')->findOrFail($id);
        
        // Security check: ensure admin owns the restaurant
        $user = auth()->user();
        if ($user->role !== 'super_admin' && $order->restaurant_id !== $user->restaurant_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
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

        $txCount = \App\Models\WalletTransaction::where('order_id', $order->id)->count();

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المكافآت بنجاح',
            'points_added' => $result['points'] ?? 0,
            'cashback_added' => $result['cashback'] ?? 0,
            'wallet_points_after' => $walletAfter ? $walletAfter->points : 0,
            'wallet_cashback_after' => $walletAfter ? (float)$walletAfter->cashback_balance : 0,
            'transactions_created' => $txCount
        ]);
    }

    public function markPaymobPaid(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $user = auth()->user();
        if ($user->role !== 'super_admin' && $order->restaurant_id !== $user->restaurant_id) {
            abort(403, 'Unauthorized');
        }

        if ($order->payment_status === 'paid') {
            return back()->with('info', 'الطلب مدفوع مسبقاً');
        }

        $gateway = $order->restaurant->paymentGateway;
        if (!$gateway) {
            return back()->with('error', 'لا توجد إعدادات بوابة دفع');
        }

        $txId = $order->paymob_transaction_id;
        $paymobOrderId = $order->paymob_order_id;
        
        if (!$txId && !$paymobOrderId) {
             return back()->with('error', 'لا يوجد رقم مرجعي لعملية Paymob لهذا الطلب للتحقق منها');
        }

        try {
            $paymobService = app(\App\Services\PaymobService::class);
            $currency = $order->restaurant->currency ?? 'SAR';
            $token = $paymobService->authenticate($gateway->paymob_api_key, $currency);

            $transaction = null;
            if ($txId) {
                $response = \Illuminate\Support\Facades\Http::withToken($token)
                    ->get("https://accept.paymob.com/api/acceptance/transactions/{$txId}");
                $transaction = $response->json();
            } else {
                $response = \Illuminate\Support\Facades\Http::withToken($token)
                    ->get("https://accept.paymob.com/api/acceptance/transactions?order_id={$paymobOrderId}");
                $data = $response->json();
                $transactions = $data['data'] ?? [];
                usort($transactions, function($a, $b) { return $b['id'] <=> $a['id']; });
                $transaction = $transactions[0] ?? null;
            }

            if (!$transaction || !isset($transaction['success'])) {
                return back()->with('error', 'لم يتم العثور على العملية في Paymob');
            }

            if ($transaction['success'] === true && $transaction['pending'] === false) {
                \App\Services\OrderPaymentService::markPaymobOrderAsPaid($order, [
                    'transaction_id' => $transaction['id'],
                    'order_id' => $transaction['order']['id'] ?? $order->paymob_order_id
                ]);

                return back()->with('success', 'تم التحقق من الدفع وتحديث حالة الطلب إلى مدفوع بنجاح');
            } else {
                if ($transaction['pending'] === false && $order->payment_status !== 'paid') {
                    $order->update([
                        'payment_status' => 'failed',
                        'status' => 'payment_failed'
                    ]);
                }
                return back()->with('error', 'حالة العملية في Paymob: ' . ($transaction['pending'] ? 'قيد الانتظار' : 'فاشلة'));
            }

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Manual Paymob Sync Error', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return back()->with('error', 'حدث خطأ أثناء الاتصال بـ Paymob: ' . $e->getMessage());
        }
    }
}
