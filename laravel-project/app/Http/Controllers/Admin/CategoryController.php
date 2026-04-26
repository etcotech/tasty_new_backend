<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        return Inertia::render('Admin/Categories', [
            'categories' => Category::where('restaurant_id', $restaurant->id)->get()
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
        ]);

        $data = $request->all();
        $data['restaurant_id'] = $restaurant->id;

        Category::create($data);

        return redirect()->back()->with('message', 'Category created successfully');
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
        ]);

        $category->update($request->all());

        return redirect()->back()->with('message', 'Category updated successfully');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->back()->with('message', 'Category deleted successfully');
    }
}
