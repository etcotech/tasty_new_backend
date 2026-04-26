<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RestaurantController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Restaurants', [
            'restaurants' => Restaurant::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
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
        ]);

        Restaurant::create(array_merge($validated, [
            'is_active' => true,
            'country_code' => '+966',
        ]));

        return redirect()->back()->with('success', 'تم الحفظ بنجاح');
    }

    public function update(Request $request, Restaurant $restaurant)
    {
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
        ]);

        $restaurant->update($validated);

        return redirect()->back()->with('success', 'تم الحفظ بنجاح');
    }

    public function switch(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id'
        ]);

        $request->session()->put('selected_restaurant_id', $request->restaurant_id);

        return redirect()->back()->with('success', 'تم تغيير المتجر بنجاح');
    }

    public function destroy(Restaurant $restaurant)
    {
        // Don't allow deleting the last restaurant for safety
        if (Restaurant::count() <= 1) {
            return redirect()->back()->with('error', 'لا يمكن حذف المطعم الوحيد');
        }

        $restaurant->delete();

        return redirect()->back()->with('success', 'تم الحذف بنجاح');
    }
}
