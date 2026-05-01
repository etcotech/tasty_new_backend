<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\SubscriptionService;
use App\Models\Restaurant;

class CheckSubscriptionFeature
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();
        
        // Super admins can access everything
        if ($user && $user->role === 'super_admin') {
            return $next($request);
        }

        $restaurantId = $request->session()->get('selected_restaurant_id') ?? $user->restaurant_id;
        $restaurant = Restaurant::find($restaurantId);

        if (!$restaurant || !$this->subscriptionService->canUseFeature($restaurant, $feature)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => $this->subscriptionService->upgradeMessage($feature)
                ], 403);
            }

            return redirect()->back()->with('error', $this->subscriptionService->upgradeMessage($feature));
        }

        return $next($request);
    }
}
