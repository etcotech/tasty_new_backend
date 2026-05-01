<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\AddonController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\RestaurantController;
use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\SystemCheckController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\Admin\QrCodeController;
use App\Http\Controllers\SaaS\SignupController;
use App\Http\Controllers\Admin\PlanController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    $setting = \App\Models\Setting::where('key', 'site_config')->first();
    $config = $setting ? json_decode($setting->value, true) : [];
    
    $stats = [
        'totalRestaurants' => 0,
        'totalBranches' => 0,
        'completedOrders' => 0,
        'totalOrders' => 0,
    ];

    try {
        if (\Illuminate\Support\Facades\Schema::hasTable('restaurants')) {
            $stats['totalRestaurants'] = \DB::table('restaurants')->count();
        }
        if (\Illuminate\Support\Facades\Schema::hasTable('branches')) {
            $stats['totalBranches'] = \DB::table('branches')->count();
        }
        if (\Illuminate\Support\Facades\Schema::hasTable('orders')) {
            $stats['totalOrders'] = \DB::table('orders')->count();
            $stats['completedOrders'] = \DB::table('orders')->whereIn('status', ['completed', 'delivered'])->count();
        }
    } catch (\Exception $e) {
        // Fallback to 0
    }

    return Inertia::render('SaaS/Landing', [
        'settings' => array_merge($config, [
            'site_logo' => $setting?->site_logo ? asset('storage/' . $setting->site_logo) : null
        ]),
        'stats' => $stats
    ]);
});

Route::get('/restaurant-signup', [SignupController::class, 'create'])->name('restaurant-signup');
Route::post('/restaurant-signup', [SignupController::class, 'store']);

Route::get('/track/{order_number?}', function ($order_number = null) {
    return Inertia::render('Storefront/TrackOrder', ['initialOrderNumber' => $order_number]);
})->name('track');

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders');
    Route::get('/system-check', [SystemCheckController::class, 'index'])->name('system-check');
    
    // Restaurants Management (Super Admin only check inside controller)
    Route::get('/restaurants', [RestaurantController::class, 'index'])->name('restaurants.index');
    Route::post('/restaurants', [RestaurantController::class, 'store'])->name('restaurants.store');
    Route::put('/restaurants/{restaurant}', [RestaurantController::class, 'update'])->name('restaurants.update');
    Route::delete('/restaurants/{restaurant}', [RestaurantController::class, 'destroy'])->name('restaurants.destroy');
    Route::post('/restaurants/switch', [RestaurantController::class, 'switch'])->name('restaurants.switch');
    Route::post('/restaurants/{restaurant}/update-subscription', [RestaurantController::class, 'updateSubscription'])->name('restaurants.update-subscription');

    Route::resource('categories', CategoryController::class);
    
    Route::get('/products/export-template', [ProductController::class, 'exportTemplate'])->name('products.export-template');
    Route::get('/products/export', [ProductController::class, 'export'])->name('products.export');
    Route::post('/products/import', [ProductController::class, 'import'])->name('products.import');
    Route::resource('products', ProductController::class);
    
    Route::resource('extras', AddonController::class);
    
    Route::middleware('feature:branches')->group(function () {
        Route::resource('branches', BranchController::class);
    });
    
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::get('/site-settings', [SettingsController::class, 'systemIndex'])->name('site-settings');
    Route::post('/site-settings', [SettingsController::class, 'updateSite'])->name('site-settings.update');
    Route::get('/payment-gateways', [SettingsController::class, 'paymentGatewaysIndex'])->name('payment-gateways');
    
    Route::get('/reports', [DashboardController::class, 'reportsIndex'])
        ->middleware('feature:reports')
        ->name('reports');

    Route::get('/automation', function() {
        return back()->with('error', 'نظام الأتمتة قيد التطوير.');
    })->middleware('feature:automation')->name('automation');

    Route::get('/smart-orders', function() {
        return back()->with('error', 'الطلبات الذكية قيد التطوير.');
    })->middleware('feature:smart_orders')->name('smart-orders');

    // QR Codes
    Route::middleware('feature:qr')->group(function () {
        Route::get('/qr-codes', [QrCodeController::class, 'index'])->name('qr-codes.index');
        Route::post('/qr-codes', [QrCodeController::class, 'store'])->name('qr-codes.store');
        Route::delete('/qr-codes/{qrCode}', [QrCodeController::class, 'destroy'])->name('qr-codes.destroy');
    });

    // Subscription Plans
    Route::resource('plans', PlanController::class);
});

/*
|--------------------------------------------------------------------------
| Kitchen Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'feature:kds'])->group(function () {
    Route::get('/kitchen', [KitchenController::class, 'dashboard'])->name('kitchen');

    Route::get('/api/kitchen/orders', [KitchenController::class, 'index']);
    Route::patch('/api/kitchen/orders/{id}/status', [KitchenController::class, 'updateStatus']);
});

/*
|--------------------------------------------------------------------------
| Auth & Profile
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Storefront Route (MUST BE LAST)
|--------------------------------------------------------------------------
*/

Route::get('/{slug}', [StorefrontController::class, 'page'])
    ->where('slug', '^(?!api|login|logout|register|dashboard|profile|admin|kitchen|track|_debugbar|up|storage).*$')
    ->name('storefront');
