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
        $normalizedPhone = $this->normalizePhoneNumber($order->phone);

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

    /**
     * Recalculate wallet balance from scratch based on completed orders.
     */
    public function recalculateWallet($phone, $restaurantId)
    {
        $restaurant = \App\Models\Restaurant::find($restaurantId);
        if (!$restaurant) return null;

        $normalizedPhone = preg_replace('/\D/', '', $phone);
        if (str_starts_with($normalizedPhone, '966')) {
            $normalizedPhone = substr($normalizedPhone, 3);
        }
        if (str_starts_with($normalizedPhone, '0')) {
            $normalizedPhone = substr($normalizedPhone, 1);
        }
        if (strlen($normalizedPhone) === 9 && str_starts_with($normalizedPhone, '5')) {
            $normalizedPhone = '966' . $normalizedPhone;
        }

        $orders = \App\Models\Order::where('restaurant_id', $restaurantId)
            ->where('phone', $normalizedPhone)
            ->where('status', 'completed')
            ->get();

        return DB::transaction(function () use ($orders, $restaurant, $normalizedPhone) {
            // 1. Clear existing transactions for this customer in this restaurant
            WalletTransaction::where('restaurant_id', $restaurant->id)
                ->where('customer_phone', $normalizedPhone)
                ->delete();

            // 2. Reset wallet
            $wallet = CustomerWallet::updateOrCreate(
                ['phone' => $normalizedPhone, 'restaurant_id' => $restaurant->id],
                ['points' => 0, 'cashback_balance' => 0, 'total_spent' => 0]
            );

            $totalPoints = 0;
            $totalCashback = 0;
            $totalSpent = 0;

            foreach ($orders as $order) {
                $totalSpent += (float)$order->total;
                $rewards = $this->calculateExpectedRewards($order, $restaurant);

                if ($rewards['points'] > 0) {
                    $totalPoints += $rewards['points'];
                    WalletTransaction::create([
                        'customer_phone' => $normalizedPhone,
                        'restaurant_id' => $restaurant->id,
                        'type' => 'points_earned',
                        'amount' => $rewards['points'],
                        'order_id' => $order->id,
                        'description' => "إعادة احتساب: نقاط من الطلب {$order->order_number}"
                    ]);
                }

                if ($rewards['cashback'] > 0) {
                    $totalCashback += $rewards['cashback'];
                    WalletTransaction::create([
                        'customer_phone' => $normalizedPhone,
                        'restaurant_id' => $restaurant->id,
                        'type' => 'cashback_earned',
                        'amount' => $rewards['cashback'],
                        'order_id' => $order->id,
                        'description' => "إعادة احتساب: كاش باك من الطلب {$order->order_number}"
                    ]);
                }
            }

            $wallet->points = $totalPoints;
            $wallet->cashback_balance = $totalCashback;
            $wallet->total_spent = $totalSpent;
            $wallet->save();

            return $wallet;
        });
    }
    /**
     * Normalize phone number to 9665XXXXXXXX format.
     */
    protected function normalizePhoneNumber($phone)
    {
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

        return $normalizedPhone;
    }

    /**
     * Apply wallet redemption (deduct points/cashback and create transactions).
     */
    protected function applyWalletRedemption(Order $order)
    {
        if ($order->points_used <= 0 && $order->cashback_used <= 0) {
            return;
        }

        $normalizedPhone = $this->normalizePhoneNumber($order->phone);
        
        DB::transaction(function () use ($order, $normalizedPhone) {
            $wallet = CustomerWallet::where('phone', $normalizedPhone)
                ->where('restaurant_id', $order->restaurant_id)
                ->first();

            if (!$wallet) return;

            if ($order->points_used > 0) {
                $wallet->points -= (int)$order->points_used;
                WalletTransaction::create([
                    'customer_phone' => $normalizedPhone,
                    'restaurant_id' => $order->restaurant_id,
                    'type' => 'points_used',
                    'amount' => (int)$order->points_used,
                    'order_id' => $order->id,
                    'description' => "استخدام نقاط في الطلب {$order->order_number}"
                ]);
            }

            if ($order->cashback_used > 0) {
                $wallet->cashback_balance -= (float)$order->cashback_used;
                WalletTransaction::create([
                    'customer_phone' => $normalizedPhone,
                    'restaurant_id' => $order->restaurant_id,
                    'type' => 'cashback_used',
                    'amount' => (float)$order->cashback_used,
                    'order_id' => $order->id,
                    'description' => "استخدام كاش باك في الطلب {$order->order_number}"
                ]);
            }

            $wallet->save();
        });
    }
}
