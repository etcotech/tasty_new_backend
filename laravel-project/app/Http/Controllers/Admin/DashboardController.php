<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        $today = Carbon::today();
        
        // KPI Cards
        $ordersToday = Order::where('restaurant_id', $restaurant->id)->whereDate('created_at', $today)->count();
        $revenueToday = Order::where('restaurant_id', $restaurant->id)->whereDate('created_at', $today)->sum('total');
        $pendingOrders = Order::where('restaurant_id', $restaurant->id)->where('status', 'pending')->count();
        $completedOrders = Order::where('restaurant_id', $restaurant->id)->where('status', 'completed')->count();
        $totalProducts = Product::where('restaurant_id', $restaurant->id)->count();

        // 7 Days Revenue
        $revenueLast7Days = Order::where('restaurant_id', $restaurant->id)
        ->select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total) as total')
        )
        ->where('created_at', '>=', Carbon::now()->subDays(6))
        ->groupBy('date')
        ->orderBy('date', 'ASC')
        ->get();

        // Orders by status
        $ordersByStatus = Order::where('restaurant_id', $restaurant->id)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Top 5 Products
        $topProducts = OrderItem::whereHas('order', function($q) use ($restaurant) {
                $q->where('restaurant_id', $restaurant->id);
            })
            ->select('product_name_ar', 'product_name_en', DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('product_name_ar', 'product_name_en')
            ->orderBy('total_sold', 'DESC')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'ordersToday' => $ordersToday,
                'revenueToday' => (float)$revenueToday,
                'pendingOrders' => $pendingOrders,
                'completedOrders' => $completedOrders,
                'totalProducts' => $totalProducts,
            ],
            'charts' => [
                'revenueLast7Days' => $revenueLast7Days,
                'ordersByStatus' => $ordersByStatus,
                'topProducts' => $topProducts,
            ]
        ]);
    }
}
