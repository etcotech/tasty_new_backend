<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutomationLog;
use App\Models\TenantAutomation;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class AutomationLogController extends Controller
{
    /**
     * List logs for a tenant, optionally filtered by automation.
     * GET /api/automation-logs?restaurant_id=1&automation_id=2&status=failed
     */
    public function index(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
        ]);

        $query = AutomationLog::with('automation.template')
            ->where('restaurant_id', $request->query('restaurant_id'));

        if ($request->filled('automation_id')) {
            $query->where('automation_id', $request->query('automation_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('event_name')) {
            $query->where('event_name', $request->query('event_name'));
        }

        $logs = $query->latest()->paginate(50);

        return response()->json([
            'success' => true,
            'data'    => $logs,
        ]);
    }

    /**
     * Get a single log entry (tenant-scoped).
     * GET /api/automation-logs/{id}?restaurant_id=1
     */
    public function show(Request $request, $id)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
        ]);

        $log = AutomationLog::with('automation.template')
            ->where('restaurant_id', $request->query('restaurant_id'))
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $log,
        ]);
    }

    /**
     * Manually write a log entry (for external systems / webhook callbacks).
     * POST /api/automation-logs
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'automation_id' => 'required|exists:tenant_automations,id',
            'event_name'    => 'required|string|max:100',
            'payload'       => 'required|array',
            'status'        => 'required|in:success,failed',
            'response'      => 'nullable|array',
            'error_message' => 'nullable|string',
        ]);

        // Ensure the automation belongs to this restaurant (tenant isolation)
        $automation = TenantAutomation::where('restaurant_id', $validated['restaurant_id'])
            ->where('id', $validated['automation_id'])
            ->firstOrFail();

        $log = AutomationLog::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Log entry recorded.',
            'data'    => $log,
        ], 201);
    }

    /**
     * Delete all logs for a tenant automation (cleanup).
     * DELETE /api/automation-logs?restaurant_id=1&automation_id=2
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'automation_id' => 'required|exists:tenant_automations,id',
        ]);

        // Tenant-scoped deletion
        AutomationLog::where('restaurant_id', $request->restaurant_id)
            ->where('automation_id', $request->automation_id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logs cleared.',
        ]);
    }
}
