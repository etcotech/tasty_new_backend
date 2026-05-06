<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();

        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        return Inertia::render('Admin/Settings', [
            'restaurant' => $restaurant,
        ]);
    }

    public function update(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();

        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'country_code' => 'required|string|max:10',
            'phone' => 'nullable|string|max:30',
            'address_ar' => 'nullable|string|max:500',
            'address_en' => 'nullable|string|max:500',
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'currency' => 'required|string|max:10',
            'working_hours' => 'nullable|string|max:500',
            'logo_url' => 'nullable|string|max:1000',
            'hero_image_url' => 'nullable|string|max:1000',
            'subtitle_ar' => 'nullable|string|max:255',
            'subtitle_en' => 'nullable|string|max:255',
            'is_open' => 'boolean',
            'logo_file' => 'nullable|image|max:2048',
            'google_review_url' => [
                'nullable',
                'url',
                'max:1000',
                function ($attribute, $value, $fail) {
                    if (
                        !str_contains($value, 'google.com') &&
                        !str_contains($value, 'g.page') &&
                        !str_contains($value, 'maps.app.goo.gl')
                    ) {
                        $fail('رابط التقييم يجب أن يكون من Google.');
                    }
                },
            ],
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

        // Ensure boolean values are correctly cast
        $validated['is_open'] = $request->boolean('is_open');

        $restaurant->update($validated);

        return redirect()->back()->with('success', 'تم حفظ الإعدادات بنجاح');
    }

    public function systemIndex()
    {
        if (auth()->user()->role !== 'super_admin') {
            return redirect()->route('admin.dashboard');
        }

        $setting = Setting::where('key', 'site_config')->first();
        $config = $setting ? json_decode($setting->value, true) : [];

        return Inertia::render('Admin/SiteSettings', [
            'settings' => array_merge($config, [
                'site_logo' => $setting?->site_logo ? asset('storage/' . $setting->site_logo) : null,
                'auth_logo' => isset($config['auth_logo']) ? asset('storage/' . $config['auth_logo']) : null,
                'landing_logo' => isset($config['landing_logo']) ? asset('storage/' . $config['landing_logo']) : null,
            ])
        ]);
    }

    public function updateSite(Request $request)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        $validated = $request->validate([
            'site_logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'auth_logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'landing_logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'landing_title' => 'nullable|string|max:255',
            'landing_subtitle' => 'nullable|string|max:255',
            'hero_content' => 'nullable|string|max:1000',
        ]);

        $setting = Setting::firstOrCreate(['key' => 'site_config']);
        $config = json_decode($setting->value, true) ?: [];

        if ($request->hasFile('site_logo')) {
            if ($setting->site_logo) {
                Storage::disk('public')->delete($setting->site_logo);
            }
            $path = $request->file('site_logo')->store('site', 'public');
            $setting->site_logo = $path;
        }

        if ($request->hasFile('auth_logo')) {
            if (isset($config['auth_logo'])) {
                Storage::disk('public')->delete($config['auth_logo']);
            }
            $path = $request->file('auth_logo')->store('site', 'public');
            $config['auth_logo'] = $path;
        }

        if ($request->hasFile('landing_logo')) {
            if (isset($config['landing_logo'])) {
                Storage::disk('public')->delete($config['landing_logo']);
            }
            $path = $request->file('landing_logo')->store('site', 'public');
            $config['landing_logo'] = $path;
        }

        $config['landing_title'] = $request->landing_title ?? ($config['landing_title'] ?? '');
        $config['landing_subtitle'] = $request->landing_subtitle ?? ($config['landing_subtitle'] ?? '');
        $config['hero_content'] = $request->hero_content ?? ($config['hero_content'] ?? '');

        $setting->value = json_encode($config);
        $setting->save();

        return redirect()->back()->with('success', 'تم حفظ إعدادات الموقع بنجاح');
    }
    public function loyaltyIndex()
    {
        $restaurant = $this->getCurrentRestaurant();

        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        return Inertia::render('Admin/LoyaltySettings', [
            'restaurant' => $restaurant,
        ]);
    }

    public function loyaltyUpdate(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();

        $validated = $request->validate([
            'points_enabled' => 'boolean',
            'cashback_enabled' => 'boolean',
            'points_rate' => 'required|integer|min:1',
            'cashback_percentage' => 'required|numeric|min:0|max:100',
            'min_order_amount' => 'required|numeric|min:0',
            'point_value' => 'required|numeric|min:0',
            'min_points_to_redeem' => 'required|integer|min:1',
            'points_redeem_value' => 'required|numeric|min:0',
            'min_cashback_to_redeem' => 'required|numeric|min:0',
            'max_wallet_discount_percentage' => 'required|numeric|min:1|max:100',
            'min_order_amount_for_wallet_redeem' => 'required|numeric|min:0',
        ]);

        $validated['points_enabled'] = $request->boolean('points_enabled');
        $validated['cashback_enabled'] = $request->boolean('cashback_enabled');

        $restaurant->update($validated);

        return redirect()->back()->with('success', 'تم حفظ إعدادات الولاء بنجاح');
    }
}

