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
        $pendingOrders = Order::where('restaurant_id', $restaurant->id)->whereIn('status', ['pending', 'preparing'])->count();
        $totalProducts = Product::where('restaurant_id', $restaurant->id)->count();

        // 7 Days Revenue (Filled with 0s)
        $revenueRaw = Order::where('restaurant_id', $restaurant->id)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->groupBy('date')
            ->get();

        $revenueLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $found = $revenueRaw->firstWhere('date', $date);
            $revenueLast7Days[] = [
                'date' => $date,
                'total' => $found ? (float)$found->total : 0,
                'day' => Carbon::parse($date)->locale('ar')->minDayName,
            ];
        }

        // Branch Statistics
        $branches = $restaurant->branches()->get();
        $branchStats = [];
        
        // Main Branch (Restaurant-level)
        $mainOrdersQuery = Order::where('restaurant_id', $restaurant->id)->whereNull('branch_id');
        $branchStats[] = [
            'name' => 'الفرع الرئيسي',
            'total_orders' => (clone $mainOrdersQuery)->count(),
            'dine_in' => (clone $mainOrdersQuery)->where('order_type', 'dine_in')->count(),
            'takeaway' => (clone $mainOrdersQuery)->where('order_type', 'takeaway')->count(),
            'car' => (clone $mainOrdersQuery)->where('order_type', 'car')->count(),
            'total_sales' => (float)(clone $mainOrdersQuery)->sum('total'),
        ];

        foreach ($branches as $branch) {
            $bQuery = Order::where('restaurant_id', $restaurant->id)->where('branch_id', $branch->id);
            $branchStats[] = [
                'name' => $branch->name_ar ?: $branch->name_en,
                'total_orders' => (clone $bQuery)->count(),
                'dine_in' => (clone $bQuery)->where('order_type', 'dine_in')->count(),
                'takeaway' => (clone $bQuery)->where('order_type', 'takeaway')->count(),
                'car' => (clone $bQuery)->where('order_type', 'car')->count(),
                'total_sales' => (float)(clone $bQuery)->sum('total'),
            ];
        }

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
                'totalProducts' => $totalProducts,
            ],
            'charts' => [
                'revenueLast7Days' => $revenueLast7Days,
                'ordersByStatus' => $ordersByStatus,
                'topProducts' => $topProducts,
                'branchStats' => $branchStats,
            ]
        ]);
    }
}
