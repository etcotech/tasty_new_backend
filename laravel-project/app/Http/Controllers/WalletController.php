<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerWallet;
use App\Models\WalletTransaction;
use App\Models\Restaurant;

class WalletController extends Controller
{
    public function getBalance(Request $request, $slug)
    {
        $phone = $this->normalizePhone($request->query('phone'));
        if (!$phone) {
            return response()->json(['success' => false, 'message' => 'Phone required'], 400);
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
            'transactions' => $transactions
        ]);
    }

    protected function normalizePhone($phone)
    {
        if (!$phone) return null;
        
        // Remove all non-digits
        $normalized = preg_replace('/\D/', '', $phone);
        
        // 1. If starts with 966, remove it temporarily to clean up
        if (str_starts_with($normalized, '966')) {
            $normalized = substr($normalized, 3);
        }
        
        // 2. Remove leading zero if exists
        if (str_starts_with($normalized, '0')) {
            $normalized = substr($normalized, 1);
        }
        
        // 3. Prepend 966 to 9-digit Saudi numbers starting with 5
        if (strlen($normalized) === 9 && str_starts_with($normalized, '5')) {
            $normalized = '966' . $normalized;
        } else {
            // Fallback for non-standard numbers that originally had 966
            if (str_starts_with($phone, '966') || str_starts_with($phone, '+966')) {
                $normalized = '966' . $normalized;
            }
        }

        return $normalized;
    }

    public function getWalletByPhone(Request $request, $phone)
    {
        $phone = $this->normalizePhone($phone);
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

        return response()->json([
            'success' => true,
            'points' => $wallet->points,
            'cashback_balance' => (float) $wallet->cashback_balance,
            'total_spent' => (float) $wallet->total_spent
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
}
