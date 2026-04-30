<?php

namespace App\Http\Controllers\SaaS;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SignupController extends Controller
{
    public function create()
    {
        return Inertia::render('SaaS/Signup');
    }

    public function store(Request $request)
    {
        $request->validate([
            'restaurant_name' => 'required|string|max:255',
            'admin_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $slug = Str::slug($request->restaurant_name);
        
        // Ensure slug is unique
        $originalSlug = $slug;
        $count = 1;
        while (Restaurant::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        $restaurant = Restaurant::create([
            'name_ar' => $request->restaurant_name,
            'name_en' => $request->restaurant_name,
            'slug' => $slug,
            'is_active' => true,
            'tax_percentage' => 15,
            'currency' => 'SAR',
        ]);

        $user = User::create([
            'name' => $request->admin_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'restaurant_admin',
            'restaurant_id' => $restaurant->id,
        ]);

        Auth::login($user);

        return redirect()->route('admin.dashboard');
    }
}
