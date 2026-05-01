<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $shared = [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => $request->session()->get('message'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];

        // Share restaurant info if user is authenticated and on an admin route
        if ($request->user() && ($request->is('admin*') || $request->is('kitchen*'))) {
            $user = $request->user();
            
            if ($user->role === 'super_admin') {
                $restaurants = \App\Models\Restaurant::all(['id', 'name_ar', 'name_en', 'slug', 'logo_url', 'tax_percentage']);
            } else {
                $restaurants = \App\Models\Restaurant::where('id', $user->restaurant_id)
                    ->get(['id', 'name_ar', 'name_en', 'slug', 'logo_url', 'tax_percentage']);
            }

            $selectedId = $request->session()->get('selected_restaurant_id');
            
            $currentRestaurant = null;
            if ($selectedId) {
                $currentRestaurant = $restaurants->firstWhere('id', $selectedId);
            }
            
            // Auto-select for restaurant_admin or if super_admin hasn't selected yet (optional, but user said NO fallback for super_admin)
            if (!$currentRestaurant && $restaurants->isNotEmpty()) {
                if ($user->role !== 'super_admin') {
                    $currentRestaurant = $restaurants->first();
                    $request->session()->put('selected_restaurant_id', $currentRestaurant->id);
                }
            }

            $shared['admin'] = [
                'restaurants' => $restaurants,
                'current_restaurant' => $currentRestaurant ? $currentRestaurant->load(['subscription.plan']) : null
            ];

            $shared['subscription'] = [
                'plan' => $currentRestaurant?->subscription?->plan
            ];
        }

        return $shared;
    }
}
