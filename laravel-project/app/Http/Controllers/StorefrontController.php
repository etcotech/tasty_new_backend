<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function page($slug = 'tasty')
    {
        return Inertia::render('Storefront/Menu', [
            'slug' => $slug,
        ]);
    }

    public function menu(Request $request, $slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        $branches = $restaurant->branches()->where('is_active', true)->get([
            'id', 'name_ar', 'name_en', 'phone', 'address', 'slug'
        ]);

        $categories = Category::where('restaurant_id', $restaurant->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'name_ar', 'name_en', 'sort_order']);

        $branchId = $request->query('branch_id');
        $branchSlug = $request->query('branch');

        if (!$branchId && $branchSlug) {
            $branch = \App\Models\Branch::where('restaurant_id', $restaurant->id)
                ->where('slug', $branchSlug)
                ->first();
            if ($branch) {
                $branchId = $branch->id;
            }
        }
        
        $productsQuery = Product::where('restaurant_id', $restaurant->id)
            ->where('is_available', true)
            ->with(['addons' => function($query) {
                $query->where('is_active', true)->select('addons.id', 'name_ar', 'name_en', 'price');
            }]);

        if ($branchId) {
            $productsQuery->where(function($q) use ($branchId) {
                $q->where('available_all_branches', true)
                  ->orWhereHas('branches', function($bq) use ($branchId) {
                      $bq->where('branches.id', $branchId);
                  });
            });
        }

        $products = $productsQuery->orderBy('sort_order')
            ->get([
                'id', 'category_id', 'name_ar', 'name_en', 
                'description_ar', 'description_en', 'price', 
                'image_path', 'is_available', 'available_all_branches', 'sort_order',
                'show_global_extras'
            ]);

        $globalExtras = \App\Models\Addon::where('restaurant_id', $restaurant->id)
            ->where('is_active', true)
            ->where('is_global', true)
            ->get(['id', 'name_ar', 'name_en', 'price']);

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
                'points_enabled' => (bool)$restaurant->points_enabled,
                'cashback_enabled' => (bool)$restaurant->cashback_enabled,
                'points_rate'    => (int)$restaurant->points_rate,
                'cashback_percentage' => (float)$restaurant->cashback_percentage,
                'min_order_amount' => (float)$restaurant->min_order_amount,
                'min_points_to_redeem' => (int)($restaurant->min_points_to_redeem ?? 100),
                'points_redeem_value' => (float)($restaurant->points_redeem_value ?? 10),
                'min_cashback_to_redeem' => (float)($restaurant->min_cashback_to_redeem ?? 10),
                'max_wallet_discount_percentage' => (float)($restaurant->max_wallet_discount_percentage ?? 30),
                'min_order_amount_for_wallet_redeem' => (float)($restaurant->min_order_amount_for_wallet_redeem ?? 50),
                'payment_enabled' => (bool)($restaurant->paymentGateway?->is_enabled ?? false),
                'payment_provider' => 'paymob', // Default to paymob if enabled
            ],
            'branches' => $branches,
            'categories' => $categories,
            'products' => $products,
            'global_extras' => $globalExtras
        ]);
    }

    public function validateCoupon(Request $request, $slug)
    {
        $restaurant = Restaurant::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'code' => 'required|string',
            'order_type' => 'required|string',
            'subtotal' => 'required|numeric',
            'phone' => 'nullable|string',
        ]);

        $coupon = \App\Models\Coupon::where('restaurant_id', $restaurant->id)
            ->where('code', $validated['code'])
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'كود الخصم غير صحيح'
            ]);
        }

        list($isValid, $message) = $coupon->isValidFor(
            $validated['subtotal'], 
            $validated['order_type'], 
            $validated['phone']
        );

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => $message
            ]);
        }

        $discount = $coupon->calculateDiscount($validated['subtotal']);

        return response()->json([
            'success' => true,
            'coupon_id' => $coupon->id,
            'code' => $coupon->code,
            'discount_amount' => $discount,
            'message' => 'تم تطبيق الكوبون بنجاح'
        ]);
    }
}
