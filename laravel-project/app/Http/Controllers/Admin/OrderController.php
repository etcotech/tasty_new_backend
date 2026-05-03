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
}
