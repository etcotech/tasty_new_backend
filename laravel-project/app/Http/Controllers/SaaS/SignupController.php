<?php

namespace App\Http\Controllers\SaaS;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SignupController extends Controller
{
    public function show()
    {
        return Inertia::render('SaaS/Signup');
    }

    public function store(Request $request)
    {
        $request->validate([
            'restaurant_name_ar' => 'required|string|max:255',
            'restaurant_name_en' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'unique:restaurants,slug', 'regex:/^[a-z0-9-]+$/'],
            'phone' => 'required|string|max:20',
            'address_ar' => 'nullable|string|max:500',
            'address_en' => 'nullable|string|max:500',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|string|email|max:255|unique:users,email',
            'admin_password' => 'required|string|min:8|confirmed',
        ], [
            'slug.regex' => 'الرابط يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطة فقط',
            'slug.unique' => 'هذا الرابط مستخدم بالفعل',
            'admin_email.unique' => 'البريد الإلكتروني مسجل مسبقاً',
            'admin_password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
        ]);

        try {
            DB::beginTransaction();

            $restaurant = Restaurant::create([
                'name_ar' => $request->restaurant_name_ar,
                'name_en' => $request->restaurant_name_en,
                'slug' => $request->slug,
                'phone' => $request->phone,
                'address_ar' => $request->address_ar,
                'address_en' => $request->address_en,
                'country_code' => '+966',
                'currency' => 'SAR',
                'tax_percentage' => 15,
                'is_active' => true,
                'is_open' => true,
            ]);

            $user = User::create([
                'name' => $request->admin_name,
                'email' => $request->admin_email,
                'password' => Hash::make($request->admin_password),
                'role' => 'restaurant_admin',
                'restaurant_id' => $restaurant->id,
            ]);

            DB::commit();

            Auth::login($user);

            // Set session context
            session(['selected_restaurant_id' => $restaurant->id]);

            return redirect()->route('admin.dashboard');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'حدث خطأ أثناء التسجيل: ' . $e->getMessage()]);
        }
    }
}
