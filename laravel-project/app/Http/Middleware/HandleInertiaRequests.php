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
            $restaurants = \App\Models\Restaurant::all(['id', 'name_ar', 'name_en', 'slug', 'logo_url', 'tax_percentage']);
            $selectedId = $request->session()->get('selected_restaurant_id');
            
            $currentRestaurant = null;
            if ($selectedId) {
                $currentRestaurant = $restaurants->firstWhere('id', $selectedId);
            }
            
            if (!$currentRestaurant && $restaurants->isNotEmpty()) {
                $currentRestaurant = $restaurants->first();
                $request->session()->put('selected_restaurant_id', $currentRestaurant->id);
            }

            $shared['admin'] = [
                'restaurants' => $restaurants,
                'current_restaurant' => $currentRestaurant
            ];
        }

        return $shared;
    }
}
