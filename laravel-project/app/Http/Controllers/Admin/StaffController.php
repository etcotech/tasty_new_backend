<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\RestaurantStaff;
use App\Models\Branch;

class StaffController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user->role === 'super_admin') {
            return redirect()->route('admin.dashboard');
        }

        $restaurant_id = $user->restaurant_id;

        $staff = RestaurantStaff::where('restaurant_id', $restaurant_id)
            ->with('branch')
            ->latest()
            ->get();
            
        $branches = Branch::where('restaurant_id', $restaurant_id)->get();

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'branches' => $branches
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'role' => 'required|in:cashier,manager,waiter,kitchen,delivery',
            'branch_id' => 'nullable|exists:branches,id',
            'employee_code' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['restaurant_id'] = $user->restaurant_id;

        RestaurantStaff::create($validated);

        return redirect()->back()->with('success', 'تم إضافة الموظف بنجاح');
    }

    public function update(Request $request, RestaurantStaff $staff)
    {
        $user = auth()->user();
        if ($staff->restaurant_id !== $user->restaurant_id) abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'role' => 'required|in:cashier,manager,waiter,kitchen,delivery',
            'branch_id' => 'nullable|exists:branches,id',
            'employee_code' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $staff->update($validated);

        return redirect()->back()->with('success', 'تم تحديث الموظف بنجاح');
    }

    public function destroy(RestaurantStaff $staff)
    {
        $user = auth()->user();
        if ($staff->restaurant_id !== $user->restaurant_id) abort(403);

        $staff->delete();

        return redirect()->back()->with('success', 'تم حذف الموظف بنجاح');
    }
}
