<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class RestaurantController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isSuperAdmin = $user->role === 'super_admin';
        
        $restaurants = $isSuperAdmin 
            ? Restaurant::with(['subscription.plan'])->latest()->get()
            : Restaurant::with(['subscription.plan'])->where('id', $user->restaurant_id)->get();

        return Inertia::render('Admin/Restaurants', [
            'restaurants' => $restaurants,
            'plans' => $isSuperAdmin ? \App\Models\Plan::where('is_active', true)->get() : []
        ]);
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'super_admin') {
            return redirect()->back()->with('error', 'غير مصرح لك بإنشاء مطاعم جديدة');
        }

        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:restaurants,slug',
            'phone' => 'nullable|string|max:255',
            'address_ar' => 'nullable|string|max:500',
            'address_en' => 'nullable|string|max:500',
            'logo_url' => 'nullable|string|max:1000',
            'hero_image_url' => 'nullable|string|max:1000',
            'subtitle_ar' => 'nullable|string|max:255',
            'subtitle_en' => 'nullable|string|max:255',
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'currency' => 'required|string|max:10',
            'is_open' => 'boolean',
            'plan_id' => 'required|exists:plans,id', // Add plan_id for new restaurants
            // Admin fields
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255|unique:users,email',
            'admin_password' => 'required|string|min:6',
        ]);

        $restaurant = Restaurant::create(array_merge($request->only([
            'name_ar', 'name_en', 'slug', 'phone', 'address_ar', 'address_en', 
            'logo_url', 'hero_image_url', 'subtitle_ar', 'subtitle_en', 
            'tax_percentage', 'currency', 'is_open'
        ]), [
            'is_active' => true,
            'country_code' => '+966',
        ]));

        // Create subscription
        \App\Models\RestaurantSubscription::create([
            'restaurant_id' => $restaurant->id,
            'plan_id' => $validated['plan_id'],
            'status' => 'active',
            'starts_at' => now(),
        ]);

        User::create([
            'name' => $validated['admin_name'],
            'email' => $validated['admin_email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['admin_password']),
            'role' => 'restaurant_admin',
            'restaurant_id' => $restaurant->id,
        ]);

        return redirect()->back()->with('success', 'تم إنشاء المطعم والحساب بنجاح');
    }

    public function update(Request $request, Restaurant $restaurant)
    {
        $user = auth()->user();
        if ($user->role !== 'super_admin' && $user->restaurant_id !== $restaurant->id) {
            return redirect()->back()->with('error', 'غير مصرح لك بتعديل هذا المطعم');
        }

        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:restaurants,slug,' . $restaurant->id,
            'phone' => 'nullable|string|max:255',
            'address_ar' => 'nullable|string|max:500',
            'address_en' => 'nullable|string|max:500',
            'logo_url' => 'nullable|string|max:1000',
            'hero_image_url' => 'nullable|string|max:1000',
            'subtitle_ar' => 'nullable|string|max:255',
            'subtitle_en' => 'nullable|string|max:255',
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'currency' => 'required|string|max:10',
            'is_open' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $restaurant->update($validated);

        return redirect()->back()->with('success', 'تم الحفظ بنجاح');
    }

    public function updateSubscription(Request $request, Restaurant $restaurant)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'status' => 'required|string|in:active,expired,suspended,trial',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);

        \App\Models\RestaurantSubscription::updateOrCreate(
            ['restaurant_id' => $restaurant->id],
            $validated
        );

        return redirect()->back()->with('success', 'تم تحديث اشتراك المطعم بنجاح');
    }

    public function switch(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'super_admin') {
            return redirect()->back()->with('error', 'غير مصرح لك بتغيير المتجر');
        }

        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id'
        ]);

        $request->session()->put('selected_restaurant_id', $request->restaurant_id);

        return redirect()->back()->with('success', 'تم تغيير المتجر بنجاح');
    }

    public function destroy(Restaurant $restaurant)
    {
        if (auth()->user()->role !== 'super_admin') {
            return redirect()->back()->with('error', 'غير مصرح لك بحذف المطاعم');
        }

        // Don't allow deleting the last restaurant for safety
        if (Restaurant::count() <= 1) {
            return redirect()->back()->with('error', 'لا يمكن حذف المطعم الوحيد');
        }

        $restaurant->delete();

        return redirect()->back()->with('success', 'تم الحذف بنجاح');
    }
}
