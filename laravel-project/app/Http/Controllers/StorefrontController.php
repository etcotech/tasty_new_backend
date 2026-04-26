<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function page($slug = 'savor')
    {
        return Inertia::render('Storefront/Menu', [
            'slug' => $slug,
        ]);
    }

    public function menu($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        $categories = Category::where('restaurant_id', $restaurant->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'name_ar', 'name_en', 'sort_order']);

        $products = Product::where('restaurant_id', $restaurant->id)
            ->where('is_available', true)
            ->with(['addons' => function($query) {
                $query->where('is_active', true)->select('addons.id', 'name_ar', 'name_en', 'price');
            }])
            ->orderBy('sort_order')
            ->get([
                'id', 'category_id', 'name_ar', 'name_en', 
                'description_ar', 'description_en', 'price', 
                'image_path', 'is_available', 'sort_order'
            ]);

        return response()->json([
            'restaurant' => [
                'id'             => $restaurant->id,
                'name_ar'        => $restaurant->name_ar,
                'name_en'        => $restaurant->name_en,
                'slug'           => $restaurant->slug,
                'logo_path'      => $restaurant->logo_path,
                'logo_url'       => $restaurant->logo_url,
                'hero_image_url' => $restaurant->hero_image_url,
                'country_code'   => $restaurant->country_code ?? '+966',
                'phone'          => $restaurant->phone,
                'address_ar'     => $restaurant->address_ar,
                'address_en'     => $restaurant->address_en,
                'tax_percentage' => (float)$restaurant->tax_percentage,
                'currency'       => $restaurant->currency,
                'working_hours'  => $restaurant->working_hours,
                'subtitle_ar'    => $restaurant->subtitle_ar,
                'subtitle_en'    => $restaurant->subtitle_en,
                'is_open'        => (bool)$restaurant->is_open,
            ],
            'categories' => $categories,
            'products' => $products
        ]);
    }
}
