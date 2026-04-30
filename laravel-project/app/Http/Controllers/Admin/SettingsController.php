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
            'subtitle_ar'    => 'nullable|string|max:255',
            'subtitle_en'    => 'nullable|string|max:255',
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

    public function systemIndex()
    {
        if (auth()->user()->role !== 'super_admin') {
            return redirect()->route('admin.dashboard');
        }

        $setting = Setting::where('key', 'site_config')->first();
        $config = $setting ? json_decode($setting->value, true) : [];
        
        return Inertia::render('Admin/SiteSettings', [
            'settings' => array_merge($config, [
                'site_logo' => $setting?->site_logo ? asset('storage/' . $setting->site_logo) : null
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
            'landing_title' => 'nullable|string|max:255',
            'landing_subtitle' => 'nullable|string|max:255',
            'hero_content' => 'nullable|string|max:1000',
        ]);

        $setting = Setting::firstOrCreate(['key' => 'site_config']);
        
        if ($request->hasFile('site_logo')) {
            if ($setting->site_logo) {
                Storage::disk('public')->delete($setting->site_logo);
            }
            $path = $request->file('site_logo')->store('site', 'public');
            $setting->site_logo = $path;
        }

        $config = json_decode($setting->value, true) ?: [];
        $config['landing_title'] = $request->landing_title ?? ($config['landing_title'] ?? '');
        $config['landing_subtitle'] = $request->landing_subtitle ?? ($config['landing_subtitle'] ?? '');
        $config['hero_content'] = $request->hero_content ?? ($config['hero_content'] ?? '');
        
        $setting->value = json_encode($config);
        $setting->save();

        return redirect()->back()->with('success', 'تم حفظ إعدادات الموقع بنجاح');
    }

    public function paymentGatewaysIndex()
    {
        if (auth()->user()->role !== 'super_admin') {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/PaymentGateways');
    }
}
