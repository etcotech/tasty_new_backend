<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AddonController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        return Inertia::render('Admin/Extras', [
            'extras' => Addon::where('restaurant_id', $restaurant->id)->get()
        ]);
    }

    public function store(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $data = $request->all();
        $data['restaurant_id'] = $restaurant->id;

        Addon::create($data);

        return redirect()->back()->with('message', 'Extra created successfully');
    }

    public function update(Request $request, Addon $extra)
    {
        $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $extra->update($request->all());

        return redirect()->back()->with('message', 'Extra updated successfully');
    }

    public function destroy(Addon $extra)
    {
        $extra->delete();

        return redirect()->back()->with('message', 'Extra deleted successfully');
    }
}
