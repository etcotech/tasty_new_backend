<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'super_admin') {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Plans', [
            'plans' => Plan::withCount('subscriptions')->get()
        ]);
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|string|in:monthly,yearly',
            'branches_limit' => 'nullable|integer|min:1',
            'monthly_orders_limit' => 'nullable|integer|min:1',
            'users_limit' => 'nullable|integer|min:1',
            'allowed_order_types' => 'nullable|array',
            'has_kds' => 'boolean',
            'has_qr' => 'boolean',
            'has_automation' => 'boolean',
            'has_smart_orders' => 'boolean',
            'reports_level' => 'required|string|in:basic,advanced,pro',
            'is_active' => 'boolean',
        ]);

        Plan::create($validated);

        return redirect()->back()->with('success', 'تم إنشاء الباقة بنجاح');
    }

    public function update(Request $request, Plan $plan)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|string|in:monthly,yearly',
            'branches_limit' => 'nullable|integer|min:1',
            'monthly_orders_limit' => 'nullable|integer|min:1',
            'users_limit' => 'nullable|integer|min:1',
            'allowed_order_types' => 'nullable|array',
            'has_kds' => 'boolean',
            'has_qr' => 'boolean',
            'has_automation' => 'boolean',
            'has_smart_orders' => 'boolean',
            'reports_level' => 'required|string|in:basic,advanced,pro',
            'is_active' => 'boolean',
        ]);

        $plan->update($validated);

        return redirect()->back()->with('success', 'تم تحديث الباقة بنجاح');
    }

    public function destroy(Plan $plan)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        if ($plan->subscriptions()->count() > 0) {
            return redirect()->back()->with('error', 'لا يمكن حذف باقة مرتبطة بمطاعم نشطة');
        }

        $plan->delete();

        return redirect()->back()->with('success', 'تم حذف الباقة بنجاح');
    }
}
