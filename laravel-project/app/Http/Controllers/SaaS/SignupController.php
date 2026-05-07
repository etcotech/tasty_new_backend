<?php

namespace App\Http\Controllers\SaaS;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\RestaurantSubscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use App\Models\Setting;

class SignupController extends Controller
{
    public function create(Request $request)
    {
        $setting = Setting::where('key', 'site_config')->first();
        $config = $setting ? json_decode($setting->value, true) : [];

        $authLogo = null;
        if (isset($config['auth_logo'])) {
            $authLogo = asset('storage/' . $config['auth_logo']);
        } elseif ($setting && $setting->site_logo) {
            $authLogo = asset('storage/' . $setting->site_logo);
        }

        // Load all active plans for optional selector dropdown
        $plans = [];
        try {
            if (Schema::hasTable('plans')) {
                $plans = Plan::where('is_active', true)
                    ->orderBy('price', 'asc')
                    ->get(['id', 'name_ar', 'name_en', 'price', 'billing_cycle',
                           'branches_limit', 'monthly_orders_limit', 'has_kds',
                           'has_ai_automation', 'has_automation', 'has_smart_orders',
                           'has_qr', 'reports_level'])
                    ->toArray();
            }
        } catch (\Exception $e) {
            // fallback empty
        }

        // Resolve preselected plan from query string
        $selectedPlan = null;
        $planId = $request->query('plan');
        if ($planId) {
            try {
                $selectedPlan = Plan::where('id', $planId)->where('is_active', true)->first();
            } catch (\Exception $e) {
                // ignore invalid plan
            }
        }

        return Inertia::render('SaaS/Signup', [
            'restaurants_count' => Restaurant::count(),
            'auth_logo'         => $authLogo,
            'plans'             => $plans,
            'selected_plan'     => $selectedPlan,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'restaurant_name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:30',
                'unique:restaurants,slug',
                'regex:/^[a-z][a-z0-9-]*$/',
            ],
            'admin_name'   => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'country_code' => 'required|string|max:5',
            'mobile_number' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->country_code === '966') {
                        $local = ltrim($value, '0');
                        if (!str_starts_with($local, '5') || strlen($local) !== 9) {
                            $fail('رقم الجوال السعودي غير صحيح. يجب أن يبدأ بـ 5 ويتكون من 9 أرقام.');
                        }
                    }
                }
            ],
            'password' => 'required|string|min:8|confirmed',
            // plan_id is optional but if provided must be valid and active
            'plan_id' => 'nullable|integer|exists:plans,id',
        ]);

        // Validate plan is active if provided
        $plan = null;
        if ($request->plan_id) {
            $plan = Plan::where('id', $request->plan_id)->where('is_active', true)->first();
            if (!$plan) {
                return back()->withErrors(['plan_id' => 'الباقة المختارة غير متاحة.'])->withInput();
            }
        }

        // Phone normalization
        $phone = $request->country_code . ltrim($request->mobile_number, '0');

        $restaurant = Restaurant::create([
            'name_ar'        => $request->restaurant_name,
            'name_en'        => $request->restaurant_name,
            'slug'           => $request->slug,
            'is_active'      => true,
            'tax_percentage' => 15,
            'currency'       => 'SAR',
            'phone'          => $phone,
        ]);

        $user = User::create([
            'name'          => $request->admin_name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'role'          => 'restaurant_admin',
            'restaurant_id' => $restaurant->id,
        ]);

        // Create subscription record if plan was selected
        if ($plan) {
            try {
                RestaurantSubscription::create([
                    'restaurant_id' => $restaurant->id,
                    'plan_id'       => $plan->id,
                    'status'        => 'trial',
                    'starts_at'     => now(),
                    'ends_at'       => now()->addDays(14), // 14-day trial
                ]);
            } catch (\Exception $e) {
                // Don't block signup if subscription creation fails
                \Log::warning('Failed to create subscription for restaurant ' . $restaurant->id . ': ' . $e->getMessage());
            }
        }

        return redirect()->route('login')->with('status', 'تم إنشاء حساب مطعمك بنجاح، يمكنك تسجيل الدخول الآن');
    }
}
