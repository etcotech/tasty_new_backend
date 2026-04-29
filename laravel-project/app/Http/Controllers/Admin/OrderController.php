<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Restaurant;

class OrderController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        $orders = Order::where('restaurant_id', $restaurant->id)
            ->with(['restaurant', 'branch', 'items.addons'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Orders', [
            'orders' => $orders
        ]);
    }
}
