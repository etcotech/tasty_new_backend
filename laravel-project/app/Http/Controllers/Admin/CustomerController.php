<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RestaurantCustomer;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return redirect()->route('admin.dashboard');

        $query = RestaurantCustomer::where('restaurant_id', $restaurant->id);

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter
        $filter = $request->get('filter', 'all');
        if ($filter === 'repeat') {
            $query->where('orders_count', '>', 1);
        } elseif ($filter === 'inactive_7') {
            $query->where('last_order_at', '<', now()->subDays(7));
        } elseif ($filter === 'inactive_30') {
            $query->where('last_order_at', '<', now()->subDays(30));
        }

        $customers = $query->latest('last_order_at')->paginate(30)->withQueryString();

        return Inertia::render('Admin/Customers', [
            'customers'  => $customers,
            'filters'    => ['search' => $search, 'filter' => $filter],
        ]);
    }

    public function show($id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return redirect()->route('admin.dashboard');

        $customer = RestaurantCustomer::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $orders = Order::where('restaurant_id', $restaurant->id)
            ->where('phone', $customer->phone)
            ->select('id', 'order_number', 'total', 'status', 'created_at')
            ->latest()
            ->limit(30)
            ->get();

        return response()->json([
            'success'  => true,
            'customer' => $customer,
            'orders'   => $orders,
        ]);
    }
}
