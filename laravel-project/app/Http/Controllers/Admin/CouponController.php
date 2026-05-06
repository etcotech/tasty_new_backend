<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return redirect()->route('admin.dashboard');

        $coupons = Coupon::where('restaurant_id', $restaurant->id)
            ->latest()
            ->get();

        return Inertia::render('Admin/Coupons', [
            'coupons' => $coupons
        ]);
    }

    public function store(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $validated = $request->validate([
            'code' => [
                'required', 
                'string', 
                'regex:/^[A-Z0-9]+$/',
                function ($attribute, $value, $fail) use ($restaurant) {
                    if (Coupon::where('restaurant_id', $restaurant->id)->where('code', $value)->exists()) {
                        $fail('كود الخصم مستخدم مسبقاً في هذا المطعم.');
                    }
                },
            ],
            'name' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0.01',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_customer_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'applies_to' => 'required|in:all_orders,dine_in,takeaway,car_pickup',
            'is_active' => 'boolean',
        ]);

        if ($validated['discount_type'] === 'percentage' && $validated['discount_value'] > 100) {
            return back()->withErrors(['discount_value' => 'النسبة المئوية لا يمكن أن تتجاوز 100%']);
        }

        $coupon = Coupon::create(array_merge($validated, ['restaurant_id' => $restaurant->id]));

        return redirect()->route('admin.coupons.index')->with('success', 'تم إنشاء الكوبون بنجاح');
    }

    public function update(Request $request, $id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $coupon = Coupon::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $validated = $request->validate([
            'code' => [
                'required', 
                'string', 
                'regex:/^[A-Z0-9]+$/',
                function ($attribute, $value, $fail) use ($restaurant, $coupon) {
                    if (Coupon::where('restaurant_id', $restaurant->id)
                        ->where('code', $value)
                        ->where('id', '!=', $coupon->id)
                        ->exists()) {
                        $fail('كود الخصم مستخدم مسبقاً في هذا المطعم.');
                    }
                },
            ],
            'name' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0.01',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_customer_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'applies_to' => 'required|in:all_orders,dine_in,takeaway,car_pickup',
            'is_active' => 'boolean',
        ]);

        if ($validated['discount_type'] === 'percentage' && $validated['discount_value'] > 100) {
            return back()->withErrors(['discount_value' => 'النسبة المئوية لا يمكن أن تتجاوز 100%']);
        }

        $coupon->update($validated);

        return redirect()->route('admin.coupons.index')->with('success', 'تم تحديث الكوبون بنجاح');
    }

    public function destroy($id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $coupon = Coupon::where('restaurant_id', $restaurant->id)->findOrFail($id);

        if ($coupon->usage_count > 0) {
            $coupon->update(['is_active' => false]);
            return redirect()->route('admin.coupons.index')->with('success', 'تم تعطيل الكوبون لأنه مستخدم مسبقاً');
        }

        $coupon->delete();

        return redirect()->route('admin.coupons.index')->with('success', 'تم حذف الكوبون بنجاح');
    }
}
