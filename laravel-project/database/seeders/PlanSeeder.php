<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\RestaurantSubscription;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plan = Plan::create([
            'name_ar' => 'الباقة الاحترافية',
            'name_en' => 'Pro Plan',
            'price' => 0,
            'billing_cycle' => 'monthly',
            'branches_limit' => null,
            'monthly_orders_limit' => null,
            'users_limit' => null,
            'allowed_order_types' => ['dine_in', 'takeaway', 'car'],
            'has_kds' => true,
            'has_qr' => true,
            'has_automation' => true,
            'has_smart_orders' => true,
            'reports_level' => 'pro',
            'is_active' => true,
        ]);

        $restaurants = Restaurant::all();
        foreach ($restaurants as $restaurant) {
            // Only create if it doesn't have one to avoid double seeding
            if (!$restaurant->subscription) {
                RestaurantSubscription::create([
                    'restaurant_id' => $restaurant->id,
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'starts_at' => now(),
                ]);
            }
        }
    }
}
