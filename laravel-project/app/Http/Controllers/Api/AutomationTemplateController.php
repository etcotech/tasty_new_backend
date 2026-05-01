<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutomationTemplate;
use Illuminate\Http\Request;

class AutomationTemplateController extends Controller
{
    /**
     * List all active automation templates.
     */
    public function index()
    {
        $templates = AutomationTemplate::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $templates,
        ]);
    }

    /**
     * Get a single template.
     */
    public function show($id)
    {
        $template = AutomationTemplate::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    /**
     * Create a new automation template.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'code'          => 'required|string|max:100|unique:automation_templates,code',
            'trigger_event' => 'required|string|max:100',
            'webhook_url'   => 'nullable|url|max:1000',
            'is_active'     => 'boolean',
        ]);

        $template = AutomationTemplate::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Automation template created.',
            'data'    => $template,
        ], 201);
    }

    /**
     * Update an existing automation template.
     */
    public function update(Request $request, $id)
    {
        $template = AutomationTemplate::findOrFail($id);

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'code'          => 'sometimes|required|string|max:100|unique:automation_templates,code,' . $id,
            'trigger_event' => 'sometimes|required|string|max:100',
            'webhook_url'   => 'nullable|url|max:1000',
            'is_active'     => 'boolean',
        ]);

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Automation template updated.',
            'data'    => $template,
        ]);
    }

    /**
     * Delete an automation template.
     */
    public function destroy($id)
    {
        $template = AutomationTemplate::findOrFail($id);
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Automation template deleted.',
        ]);
    }
}
