<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class BranchController extends Controller
{
    protected function getCurrentRestaurant()
    {
        $user = auth()->user();
        if ($user && $user->restaurant_id) {
            return Restaurant::find($user->restaurant_id);
        }

        if ($user && session()->has('selected_restaurant_id')) {
            return Restaurant::find(session()->get('selected_restaurant_id'));
        }

        return null;
    }

    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        
        if (!$restaurant) {
            return Inertia::render('Admin/Branches', [
                'branches' => [],
                'currentRestaurant' => null,
                'error' => 'Please select a restaurant first.'
            ]);
        }

        $branches = Branch::where('restaurant_id', $restaurant->id)->withCount('orders')->get();

        return Inertia::render('Admin/Branches', [
            'branches' => $branches,
            'currentRestaurant' => $restaurant
        ]);
    }

    public function store(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return back()->withErrors(['error' => 'No restaurant context found.']);
        }

        $validator = Validator::make($request->all(), [
            'name_ar' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Branch::create([
            'restaurant_id' => $restaurant->id,
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => $request->is_active ?? true,
        ]);

        return back()->with('success', 'Branch created successfully.');
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);
        $restaurant = $this->getCurrentRestaurant();

        if ($branch->restaurant_id !== $restaurant->id) {
            abort(403);
        }

        $validator = Validator::make($request->all(), [
            'name_ar' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $branch->update($request->all());

        return back()->with('success', 'Branch updated successfully.');
    }

    public function destroy($id)
    {
        $branch = Branch::findOrFail($id);
        $restaurant = $this->getCurrentRestaurant();

        if ($branch->restaurant_id !== $restaurant->id) {
            abort(403);
        }

        $branch->delete();

        return back()->with('success', 'Branch deleted successfully.');
    }
}
