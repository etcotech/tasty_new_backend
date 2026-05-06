<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerWallet;
use App\Models\WalletTransaction;
use App\Models\Restaurant;

use App\Traits\HasLoyaltyRewards;

class WalletController extends Controller
{
    use HasLoyaltyRewards;
    public function getBalance(Request $request, $slug)
    {
        $phoneRaw = $request->query('phone');
        $phone = $this->normalizePhoneNumber($phoneRaw);
        
        if (!$phone) {
            return response()->json(['success' => false, 'message' => 'Phone required'], 400);
        }

        $restaurant = Restaurant::where('slug', $slug)->first();
        if (!$restaurant) {
            \Illuminate\Support\Facades\Log::warning('Wallet API - Restaurant not found', ['slug' => $slug]);
            return response()->json(['success' => false, 'message' => 'Restaurant not found'], 404);
        }

        $wallet = CustomerWallet::where('phone', $phone)
            ->where('restaurant_id', $restaurant->id)
            ->first();

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'لا توجد محفظة مرتبطة بهذا الرقم'
            ], 404);
        }

        $transactions = WalletTransaction::where('customer_phone', $phone)
            ->where('restaurant_id', $restaurant->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'points' => $wallet->points,
            'cashback_balance' => (float) $wallet->cashback_balance,
            'total_spent' => (float) $wallet->total_spent,
            'transactions' => $transactions,
            'normalized_phone' => $phone,
            'settings' => [
                'min_points_to_redeem' => $restaurant->min_points_to_redeem,
                'points_redeem_value' => $restaurant->points_redeem_value,
                'min_cashback_to_redeem' => $restaurant->min_cashback_to_redeem,
                'max_wallet_discount_percentage' => $restaurant->max_wallet_discount_percentage,
                'min_order_amount_for_wallet_redeem' => $restaurant->min_order_amount_for_wallet_redeem,
            ]
        ]);
    }

    /**
     * Local wrapper for backward compatibility within this controller if needed, 
     * but now pointing to the trait's unified logic.
     */
    protected function normalizePhone($phone)
    {
        return $this->normalizePhoneNumber($phone);
    }

    public function getWalletByPhone(Request $request, $phoneRaw)
    {
        $phone = $this->normalizePhone($phoneRaw);
        
        if (!$phone) {
            return response()->json(['success' => false, 'message' => 'Phone required'], 400);
        }
        
        $slug = $request->query('slug');
        if (!$slug) {
            return response()->json(['success' => false, 'message' => 'Restaurant slug required'], 400);
        }

        $restaurant = Restaurant::where('slug', $slug)->first();
        if (!$restaurant) {
            return response()->json(['success' => false, 'message' => 'Restaurant not found'], 404);
        }

        $wallet = CustomerWallet::where('phone', $phone)
            ->where('restaurant_id', $restaurant->id)
            ->first();

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'لا توجد محفظة مرتبطة بهذا الرقم'
            ], 404);
        }

        $transactions = WalletTransaction::where('customer_phone', $phone)
            ->where('restaurant_id', $restaurant->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'points' => $wallet->points,
            'cashback_balance' => (float) $wallet->cashback_balance,
            'total_spent' => (float) $wallet->total_spent,
            'transactions' => $transactions,
            'normalized_phone' => $phone
        ]);
    }

    public function getTransactions(Request $request, $slug)
    {
        $phone = $this->normalizePhone($request->query('phone'));
        if (!$phone) {
            return response()->json(['success' => false, 'message' => 'Phone required'], 400);
        }

        $restaurant = Restaurant::where('slug', $slug)->first();
        if (!$restaurant) {
            return response()->json(['success' => false, 'message' => 'Restaurant not found'], 404);
        }

        $transactions = WalletTransaction::where('customer_phone', $phone)
            ->where('restaurant_id', $restaurant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'transactions' => $transactions
        ]);
    }

    public function debugWallet(Request $request, $phone)
    {
        $normalized = $this->normalizePhone($phone);
        
        $wallets = CustomerWallet::where('phone', $normalized)->get();
        $transactions = WalletTransaction::where('customer_phone', $normalized)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        $orders = \App\Models\Order::where('phone', $normalized)
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'normalized_phone' => $normalized,
            'current_wallets_count' => $wallets->count(),
            'wallets' => $wallets,
            'latest_transactions' => $transactions,
            'latest_completed_orders' => $orders,
            'server_time' => now()
        ]);
    }
    public function repairRewards(Request $request, $orderId)
    {
        $order = \App\Models\Order::findOrFail($orderId);
        
        $walletBefore = CustomerWallet::where('phone', $order->phone)
            ->where('restaurant_id', $order->restaurant_id)
            ->first();
            
        $earned = $this->applyOrderRewards($order);
        
        $walletAfter = CustomerWallet::where('phone', $order->phone)
            ->where('restaurant_id', $order->restaurant_id)
            ->first();
            
        $transactions = WalletTransaction::where('order_id', $order->id)->get();

        return response()->json([
            'success' => true,
            'order_id' => $order->id,
            'earned' => $earned,
            'wallet_before' => $walletBefore,
            'wallet_after' => $walletAfter,
            'transactions_created' => $transactions
        ]);
    }

    public function recalculate(Request $request, $phone)
    {
        $restaurant = Restaurant::where('slug', $request->query('slug'))->first();
        if (!$restaurant) {
            return response()->json(['success' => false, 'message' => 'Restaurant not found'], 404);
        }

        $wallet = $this->recalculateWallet($phone, $restaurant->id);

        if (!$wallet) {
            return response()->json(['success' => false, 'message' => 'Recalculation failed'], 500);
        }

        $transactions = WalletTransaction::where('customer_phone', $wallet->phone)
            ->where('restaurant_id', $restaurant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Wallet recalculated successfully',
            'points' => $wallet->points,
            'cashback_balance' => (float)$wallet->cashback_balance,
            'transactions_count' => $transactions->count(),
            'wallet' => $wallet
        ]);
    }
}
