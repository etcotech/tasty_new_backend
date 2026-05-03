<?php

namespace App\Http\Controllers\SaaS;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Setting;
use Illuminate\Support\Str;

class SignupController extends Controller
{
    public function create()
    {
        $setting = Setting::where('key', 'site_config')->first();
        $config = $setting ? json_decode($setting->value, true) : [];
        
        $authLogo = null;
        if (isset($config['auth_logo'])) {
            $authLogo = asset('storage/' . $config['auth_logo']);
        } elseif ($setting && $setting->site_logo) {
            $authLogo = asset('storage/' . $setting->site_logo);
        }

        return Inertia::render('SaaS/Signup', [
            'restaurants_count' => Restaurant::count(),
            'auth_logo' => $authLogo,
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
            'admin_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'country_code' => 'required|string|max:5',
            'mobile_number' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    // Check for Saudi numbers specifically
                    if ($request->country_code === '966') {
                        $local = ltrim($value, '0');
                        if (!str_starts_with($local, '5') || strlen($local) !== 9) {
                            $fail('رقم الجوال السعودي غير صحيح. يجب أن يبدأ بـ 5 ويتكون من 9 أرقام.');
                        }
                    }
                }
            ],
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Phone normalization: Concatenate and remove leading zeros from local part
        $phone = $request->country_code . ltrim($request->mobile_number, '0');

        $restaurant = Restaurant::create([
            'name_ar' => $request->restaurant_name,
            'name_en' => $request->restaurant_name,
            'slug' => $request->slug,
            'is_active' => true,
            'tax_percentage' => 15,
            'currency' => 'SAR',
            'phone' => $phone,
        ]);

        $user = User::create([
            'name' => $request->admin_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'restaurant_admin',
            'restaurant_id' => $restaurant->id,
        ]);

        // After successful registration:
        // - Do NOT auto-login the restaurant.
        // - Redirect to login page instead.
        // - Show success message.
        return redirect()->route('login')->with('status', 'تم إنشاء حساب مطعمك بنجاح، يمكنك تسجيل الدخول الآن');
    }
}
