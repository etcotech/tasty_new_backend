<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                'country_code'   => '+966',
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
            'country_code'   => 'required|string|max:10',
            'phone'          => 'nullable|string|max:30',
            'address_ar'     => 'nullable|string|max:500',
            'address_en'     => 'nullable|string|max:500',
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'currency'       => 'required|string|max:10',
            'working_hours'  => 'nullable|string|max:500',
            'logo_url'       => 'nullable|string|max:1000',
            'hero_image_url' => 'nullable|string|max:1000',
            'is_open'        => 'boolean',
            'logo_file'      => 'nullable|image|max:2048',
        ]);

        // Handle logo file upload
        if ($request->hasFile('logo_file')) {
            // Delete old logo if it was stored locally
            if ($restaurant->logo_url && str_starts_with($restaurant->logo_url, '/storage/')) {
                $oldPath = str_replace('/storage/', 'public/', $restaurant->logo_url);
                Storage::delete($oldPath);
            }
            $path = $request->file('logo_file')->store('public/restaurants/logos');
            $validated['logo_url'] = '/storage/' . str_replace('public/', '', $path);
        }

        // Remove logo_file from validated array (not a DB column)
        unset($validated['logo_file']);

        $restaurant->update($validated);

        return redirect()->back()->with('success', 'تم حفظ الإعدادات بنجاح');
    }
}
