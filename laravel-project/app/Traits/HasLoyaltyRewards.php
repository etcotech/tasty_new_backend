<?php

namespace App\Traits;

use App\Models\Order;
use App\Models\CustomerWallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

trait HasLoyaltyRewards
{
    /**
     * Calculate and apply loyalty rewards for a completed order.
     */
    protected function applyOrderRewards(Order $order)
    {
        Log::info("applyOrderRewards START", [
            'order_id' => $order->id,
            'restaurant_id' => $order->restaurant_id,
            'customer_phone' => $order->phone,
            'total' => $order->total
        ]);

        // Normalize phone to 9665XXXXXXXX
        $phone = $order->phone;
        $normalizedPhone = preg_replace('/\D/', '', $phone);
        
        // Remove leading 966 if it exists to clean up
        if (str_starts_with($normalizedPhone, '966')) {
            $normalizedPhone = substr($normalizedPhone, 3);
        }
        
        // Remove leading zero
        if (str_starts_with($normalizedPhone, '0')) {
            $normalizedPhone = substr($normalizedPhone, 1);
        }
        
        // Prepend 966 to 9-digit Saudi numbers
        if (strlen($normalizedPhone) === 9 && str_starts_with($normalizedPhone, '5')) {
            $normalizedPhone = '966' . $normalizedPhone;
        } else {
            // If not a standard 9-digit Saudi number, re-attach original prefix if it was 966
            if (str_starts_with($phone, '966') || str_starts_with($phone, '+966')) {
                $normalizedPhone = '966' . $normalizedPhone;
            }
        }

        // Force refresh restaurant settings
        $restaurant = $order->restaurant()->first();
        if (!$restaurant) {
            Log::warning("Loyalty Rewards: No restaurant found for order {$order->id}");
            return ['error' => 'settings not found'];
        }

        $total = (float) $order->total;
        $minOrder = (float) ($restaurant->min_order_amount ?? 0);

        $points_enabled = (bool) $restaurant->points_enabled;
        $cashback_enabled = (bool) $restaurant->cashback_enabled;

        Log::info("Loyalty Settings Debug", [
            'order_id' => $order->id,
            'points_enabled' => $points_enabled,
            'cashback_enabled' => $cashback_enabled,
            'points_rate' => $restaurant->points_rate,
            'cashback_percentage' => $restaurant->cashback_percentage,
            'min_order_amount' => $minOrder,
            'total' => $total,
        ]);

        if ($total < $minOrder) {
            Log::info("Loyalty Rewards: Order total {$total} is less than min amount {$minOrder} for order {$order->id}");
            return ['error' => 'total below min amount', 'min_order' => $minOrder];
        }

        if (!$points_enabled && !$cashback_enabled) {
            Log::info("Loyalty Rewards: Both points and cashback are disabled for restaurant {$restaurant->id}");
            return ['error' => 'rewards disabled'];
        }

        $pointsEarned = 0;
        $pointsAddedToWallet = false;
        if ($points_enabled) {
            if ($restaurant->points_rate > 0) {
                $exists = WalletTransaction::where('order_id', $order->id)
                    ->where('type', 'points_earned')
                    ->exists();
                
                if (!$exists) {
                    $pointsEarned = floor($total / $restaurant->points_rate);
                    $pointsAddedToWallet = true;
                } else {
                    Log::info("Loyalty Rewards: Points already processed for order {$order->id}");
                }
            } else {
                Log::warning("Loyalty Rewards: Points rate invalid (0 or null) for restaurant {$restaurant->id}");
            }
        }

        $cashbackEarned = 0;
        $cashbackAddedToWallet = false;
        if ($cashback_enabled) {
            if ($restaurant->cashback_percentage > 0) {
                $exists = WalletTransaction::where('order_id', $order->id)
                    ->where('type', 'cashback_earned')
                    ->exists();
                
                if (!$exists) {
                    $cashbackEarned = round($total * ($restaurant->cashback_percentage / 100), 2);
                    $cashbackAddedToWallet = true;
                } else {
                    Log::info("Loyalty Rewards: Cashback already processed for order {$order->id}");
                }
            } else {
                Log::warning("Loyalty Rewards: Cashback percentage invalid (0 or null) for restaurant {$restaurant->id}");
            }
        }

        if (!$pointsAddedToWallet && !$cashbackAddedToWallet) {
            Log::info("Loyalty Rewards: No new rewards to apply for order {$order->id}");
            return ['points' => 0, 'cashback' => 0, 'reason' => 'already processed or invalid settings'];
        }

        DB::transaction(function () use ($order, $restaurant, $pointsEarned, $cashbackEarned, $total, $normalizedPhone, $pointsAddedToWallet, $cashbackAddedToWallet) {
            $wallet = CustomerWallet::firstOrCreate(
                ['phone' => $normalizedPhone, 'restaurant_id' => $restaurant->id],
                ['points' => 0, 'cashback_balance' => 0, 'total_spent' => 0]
            );

            // Only increment total_spent if this is the FIRST reward transaction for this order
            $hasAnyTransaction = WalletTransaction::where('order_id', $order->id)->exists();
            if (!$hasAnyTransaction) {
                $wallet->total_spent += $total;
            }

            if ($pointsAddedToWallet && $pointsEarned > 0) {
                $wallet->points += (int)$pointsEarned;
                WalletTransaction::create([
                    'customer_phone' => $normalizedPhone,
                    'restaurant_id' => $restaurant->id,
                    'type' => 'points_earned',
                    'amount' => (int)$pointsEarned,
                    'order_id' => $order->id,
                    'description' => "نقاط مكتسبة من الطلب {$order->order_number}"
                ]);
            }

            if ($cashbackAddedToWallet && $cashbackEarned > 0) {
                $wallet->cashback_balance += (float)$cashbackEarned;
                WalletTransaction::create([
                    'customer_phone' => $normalizedPhone,
                    'restaurant_id' => $restaurant->id,
                    'type' => 'cashback_earned',
                    'amount' => (float)$cashbackEarned,
                    'order_id' => $order->id,
                    'description' => "كاش باك مكتسب من الطلب {$order->order_number}"
                ]);
            }

            $wallet->save();
            
            Log::info("applyOrderRewards SUCCESS", [
                'order_id' => $order->id,
                'points_added' => $pointsEarned,
                'cashback_added' => $cashbackEarned,
                'wallet_after' => [
                    'points' => $wallet->points,
                    'cashback' => $wallet->cashback_balance
                ]
            ]);
        });

        return [
            'points' => (int)$pointsEarned,
            'cashback' => (float)$cashbackEarned,
            'success' => true
        ];
    }

    /**
     * Calculate expected rewards for an order before completion (for display).
     */
    protected function calculateExpectedRewards(Order $order, $restaurant)
    {
        $expectedPoints = 0;
        $expectedCashback = 0;

        $total = (float) $order->total;
        $minOrder = (float) $restaurant->min_order_amount;

        if ($total >= $minOrder) {
            if ($restaurant->points_enabled && $restaurant->points_rate > 0) {
                $expectedPoints = floor($total / $restaurant->points_rate);
            }

            if ($restaurant->cashback_enabled && $restaurant->cashback_percentage > 0) {
                $expectedCashback = $total * ($restaurant->cashback_percentage / 100);
            }
        }

        return [
            'points' => $expectedPoints,
            'cashback' => $expectedCashback
        ];
    }
}
