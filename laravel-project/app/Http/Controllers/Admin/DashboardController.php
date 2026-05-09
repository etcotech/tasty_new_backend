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
        $user = auth()->user();
        $isSuperAdmin = $user->role === 'super_admin';
        $today = Carbon::today();

        if ($isSuperAdmin) {
            // KPI Cards for Super Admin
            $totalRestaurants = Restaurant::count();
            $activeRestaurants = Restaurant::where('is_active', true)->count();
            $inactiveRestaurants = Restaurant::where('is_active', false)->count();
            $totalOrders = Order::count();
            $totalBranches = DB::table('branches')->count();
            $revenueToday = Order::whereDate('created_at', $today)->sum('total');
            $newRestaurantsThisMonth = Restaurant::whereMonth('created_at', Carbon::now()->month)->count();

            // 7 Days Revenue Platform-wide
            $revenueRaw = Order::select(
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

            // Top Restaurants by Revenue
            $topRestaurants = Restaurant::withCount('orders')
                ->withSum('orders', 'total')
                ->orderBy('orders_sum_total', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($res) {
                    return [
                        'name' => $res->name_ar ?? $res->name_en ?? 'Restaurant',
                        'total_orders' => $res->orders_count ?? 0,
                        'total_sales' => (float)($res->orders_sum_total ?? 0),
                    ];
                });

            return Inertia::render('Admin/Dashboard', [
                'isSuperAdmin' => true,
                'stats' => [
                    'totalRestaurants' => $totalRestaurants,
                    'activeRestaurants' => $activeRestaurants,
                    'inactiveRestaurants' => $inactiveRestaurants,
                    'totalOrders' => $totalOrders,
                    'totalBranches' => $totalBranches,
                    'revenueToday' => (float)$revenueToday,
                    'newRestaurantsThisMonth' => $newRestaurantsThisMonth,
                ],
                'charts' => [
                    'revenueLast7Days' => $revenueLast7Days,
                    'topRestaurants' => $topRestaurants,
                ]
            ]);
        }

        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        // KPI Cards for Restaurant Admin
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

        // Orders by payment method
        $ordersByPaymentMethod = Order::where('restaurant_id', $restaurant->id)
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('SUM(total) as total_sales'))
            ->groupBy('payment_method')
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
            'isSuperAdmin' => false,
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
                'ordersByPaymentMethod' => $ordersByPaymentMethod,
            ]
        ]);
    }

    public function reportsIndex()
    {
        if (auth()->user()->role !== 'super_admin') {
            return redirect()->route('admin.dashboard');
        }

        $totalRestaurants = Restaurant::count();
        $activeRestaurants = Restaurant::where('is_active', true)->count();
        $inactiveRestaurants = Restaurant::where('is_active', false)->count();
        $totalOrders = Order::count();
        $totalSales = Order::sum('total');

        $topRestaurants = Restaurant::withCount('orders')
            ->withSum('orders', 'total')
            ->orderBy('orders_sum_total', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Reports', [
            'stats' => [
                'totalRestaurants' => $totalRestaurants,
                'activeRestaurants' => $activeRestaurants,
                'inactiveRestaurants' => $inactiveRestaurants,
                'totalOrders' => $totalOrders,
                'totalSales' => (float)$totalSales,
            ],
            'topRestaurants' => $topRestaurants
        ]);
    }
}
