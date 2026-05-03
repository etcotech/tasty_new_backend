<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PosIntegration;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosIntegrationController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.dashboard')->with('error', 'Please select a restaurant first.');
        }

        $integrations = PosIntegration::where('restaurant_id', $restaurant->id)->get()->keyBy('provider');

        // Available providers with default states
        $availableProviders = [
            'foodics' => [
                'name' => 'Foodics',
                'logo' => '/images/pos/foodics.png',
                'description' => 'Connect your Foodics account to sync orders automatically.'
            ],
            'rewaa' => [
                'name' => 'Rewaa',
                'logo' => '/images/pos/rewaa.png',
                'description' => 'Sync your inventory and orders with Rewaa POS.'
            ],
            'odoo' => [
                'name' => 'Odoo',
                'logo' => '/images/pos/odoo.png',
                'description' => 'Integrate with Odoo ERP for complete business management.'
            ],
        ];

        return Inertia::render('Admin/PosIntegrations', [
            'restaurant' => $restaurant,
            'integrations' => $integrations,
            'availableProviders' => $availableProviders
        ]);
    }

    public function update(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['success' => false, 'message' => 'Restaurant not found'], 404);

        $validated = $request->validate([
            'provider' => 'required|string',
            'api_key' => 'nullable|string',
            'access_token' => 'nullable|string',
            'business_id' => 'nullable|string',
            'branch_id' => 'nullable|string',
            'is_enabled' => 'boolean',
            'environment' => 'required|in:sandbox,live',
        ]);

        $integration = PosIntegration::updateOrCreate(
            [
                'restaurant_id' => $restaurant->id,
                'provider' => $validated['provider']
            ],
            $validated
        );

        return redirect()->back()->with('success', 'POS Integration settings updated successfully.');
    }

    public function testConnection(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['success' => false, 'message' => 'Restaurant not found'], 404);

        $provider = $request->input('provider');
        
        // This is a placeholder for actual API calls
        // In a real implementation, you'd call the Foodics/Rewaa API here
        
        return response()->json([
            'success' => true,
            'message' => "Connection to {$provider} successful (Simulation)."
        ]);
    }
}
