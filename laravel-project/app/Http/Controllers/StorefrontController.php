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
                'id' => $restaurant->id,
                'name_ar' => $restaurant->name_ar,
                'name_en' => $restaurant->name_en,
                'slug' => $restaurant->slug,
                'logo_path' => $restaurant->logo_path,
            ],
            'categories' => $categories,
            'products' => $products
        ]);
    }
}
