<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\RestaurantSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class VerificationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Test Plan
        $testPlan = Plan::create([
            'name_ar' => 'باقة الاختبار',
            'name_en' => 'Test Plan',
            'price' => 0,
            'billing_cycle' => 'monthly',
            'branches_limit' => 0,
            'has_kds' => false,
            'has_qr' => false,
            'has_automation' => false,
            'has_smart_orders' => false,
            'reports_level' => 'basic',
            'monthly_orders_limit' => 1,
            'users_limit' => 1,
            'allowed_order_types' => ['dine_in'],
            'is_active' => true,
        ]);

        // 2. Create Test Restaurant
        $restaurant = Restaurant::create([
            'name_ar' => 'مطعم الاختبار',
            'name_en' => 'Test Restaurant',
            'slug' => 'test-restaurant',
            'tax_percentage' => 15,
            'currency' => 'SAR',
            'is_active' => true,
            'is_open' => true,
        ]);

        // 3. Assign Plan to Restaurant
        RestaurantSubscription::create([
            'restaurant_id' => $restaurant->id,
            'plan_id' => $testPlan->id,
            'status' => 'active',
            'starts_at' => now(),
        ]);

        // 4. Create Restaurant Admin
        User::create([
            'name' => 'Test Admin',
            'email' => 'test@admin.com',
            'password' => Hash::make('password'),
            'role' => 'restaurant_admin',
            'restaurant_id' => $restaurant->id,
        ]);
    }
}
