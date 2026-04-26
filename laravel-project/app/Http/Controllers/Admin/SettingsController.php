<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $restaurant = Restaurant::first();

        if (!$restaurant) {
            $restaurant = Restaurant::create([
                'name_ar'        => 'مطعم سيفور',
                'name_en'        => 'Savor Restaurant',
                'slug'           => 'savor',
                'is_active'      => true,
                'tax_percentage' => 8.00,
                'currency'       => 'SAR',
                'is_open'        => true,
            ]);
        }

        return Inertia::render('Admin/Settings', [
            'restaurant' => $restaurant,
        ]);
    }

    public function update(Request $request)
    {
        $restaurant = Restaurant::first();

        $validated = $request->validate([
            'name_ar'        => 'required|string|max:255',
            'name_en'        => 'required|string|max:255',
            'phone'          => 'nullable|string|max:30',
            'address_ar'     => 'nullable|string|max:500',
            'address_en'     => 'nullable|string|max:500',
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'currency'       => 'required|string|max:10',
            'working_hours'  => 'nullable|string|max:500',
            'logo_url'       => 'nullable|string|max:1000',
            'hero_image_url' => 'nullable|string|max:1000',
            'is_open'        => 'boolean',
        ]);

        $restaurant->update($validated);

        return redirect()->back()->with('success', 'تم حفظ الإعدادات بنجاح');
    }
}
