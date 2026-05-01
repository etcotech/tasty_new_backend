<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantAutomation;
use App\Models\AutomationTemplate;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class TenantAutomationController extends Controller
{
    /**
     * Resolve the restaurant. The API consumer passes restaurant_id as a query param
     * or in the request body. This provides multi-tenant isolation.
     */
    private function resolveRestaurant(Request $request): Restaurant
    {
        $id = $request->input('restaurant_id') ?? $request->query('restaurant_id');
        return Restaurant::findOrFail($id);
    }

    /**
     * List all automations for a tenant.
     * GET /api/automations?restaurant_id=1
     */
    public function index(Request $request)
    {
        $restaurant = $this->resolveRestaurant($request);

        $automations = TenantAutomation::with('template')
            ->where('restaurant_id', $restaurant->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $automations,
        ]);
    }

    /**
     * Get a single tenant automation (tenant-scoped).
     * GET /api/automations/{id}?restaurant_id=1
     */
    public function show(Request $request, $id)
    {
        $restaurant = $this->resolveRestaurant($request);

        $automation = TenantAutomation::with(['template', 'logs'])
            ->where('restaurant_id', $restaurant->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $automation,
        ]);
    }

    /**
     * Enable an automation for a tenant.
     * POST /api/automations
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id'          => 'required|exists:restaurants,id',
            'automation_template_id' => 'required|exists:automation_templates,id',
            'name'                   => 'required|string|max:255',
            'settings'               => 'nullable|array',
            'is_enabled'             => 'boolean',
        ]);

        // Verify the template is active
        $template = AutomationTemplate::findOrFail($validated['automation_template_id']);
        if (!$template->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'The selected automation template is not active.',
            ], 422);
        }

        $automation = TenantAutomation::create($validated);
        $automation->load('template');

        return response()->json([
            'success' => true,
            'message' => 'Automation enabled for tenant.',
            'data'    => $automation,
        ], 201);
    }

    /**
     * Update a tenant automation.
     * PUT /api/automations/{id}
     */
    public function update(Request $request, $id)
    {
        $restaurant = $this->resolveRestaurant($request);

        $automation = TenantAutomation::where('restaurant_id', $restaurant->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'settings'   => 'nullable|array',
            'is_enabled' => 'boolean',
        ]);

        $automation->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Automation updated.',
            'data'    => $automation,
        ]);
    }

    /**
     * Remove a tenant automation.
     * DELETE /api/automations/{id}?restaurant_id=1
     */
    public function destroy(Request $request, $id)
    {
        $restaurant = $this->resolveRestaurant($request);

        $automation = TenantAutomation::where('restaurant_id', $restaurant->id)
            ->findOrFail($id);

        $automation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Automation removed.',
        ]);
    }

    /**
     * Toggle automation on/off.
     * PATCH /api/automations/{id}/toggle
     */
    public function toggle(Request $request, $id)
    {
        $restaurant = $this->resolveRestaurant($request);

        $automation = TenantAutomation::where('restaurant_id', $restaurant->id)
            ->findOrFail($id);

        $automation->update(['is_enabled' => !$automation->is_enabled]);

        return response()->json([
            'success'    => true,
            'message'    => 'Automation ' . ($automation->is_enabled ? 'enabled' : 'disabled') . '.',
            'is_enabled' => $automation->is_enabled,
        ]);
    }
}
