<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function getCurrentRestaurant()
    {
        $user = auth()->user();

        // 1. If Super Admin, allow session switching, but NO DEFAULT
        if ($user && $user->role === 'super_admin') {
            $selectedId = session('selected_restaurant_id');
            if ($selectedId) {
                return \App\Models\Restaurant::find($selectedId);
            }
            return null; // Super admin must select a restaurant
        }

        // 2. If Restaurant Admin, force their assigned restaurant ONLY
        if ($user && $user->role === 'restaurant_admin') {
            if ($user->restaurant_id) {
                return \App\Models\Restaurant::find($user->restaurant_id);
            }
            return null; // Controller should handle this as "No restaurant assigned"
        }

        // 3. Public Storefront lookup (handled via slug in StorefrontController)
        // This is only for non-authenticated or generic lookups if needed
        $selectedId = session('selected_restaurant_id');
        if ($selectedId) {
            return \App\Models\Restaurant::find($selectedId);
        }

        return null;
    }

    protected function getCurrentBranch()
    {
        $selectedBranchId = session('selected_branch_id');
        if ($selectedBranchId) {
            $branch = \App\Models\Branch::find($selectedBranchId);
            if ($branch) return $branch;
        }
        return null;
    }
}
