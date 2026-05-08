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
use App\Http\Controllers\Admin\PaymentGatewayController;
use App\Http\Controllers\Admin\PosIntegrationController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\AiCampaignController;

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

    // Load active plans for the public pricing section
    $plans = [];
    try {
        if (\Illuminate\Support\Facades\Schema::hasTable('plans')) {
            $plans = \App\Models\Plan::where('is_active', true)
                ->orderBy('price', 'asc')
                ->get([
                    'id', 'name_ar', 'name_en', 'price', 'billing_cycle',
                    'branches_limit', 'monthly_orders_limit', 'users_limit',
                    'has_kds', 'has_qr', 'has_automation', 'has_smart_orders',
                    'has_ai_automation', 'reports_level', 'allowed_order_types',
                ])
                ->toArray();
        }
    } catch (\Exception $e) {
        // Fallback to empty
    }

    return Inertia::render('SaaS/Landing', [
        'settings' => array_merge($config, [
            'site_logo' => $setting?->site_logo ? asset('storage/' . $setting->site_logo) : null,
            'landing_logo' => isset($config['landing_logo']) ? asset('storage/' . $config['landing_logo']) : null,
        ]),
        'stats' => $stats,
        'plans' => $plans,
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
    Route::post('/orders/{id}/recalculate-rewards', [AdminOrderController::class, 'recalculateRewards'])->name('orders.recalculate-rewards');
    Route::post('/orders/{order}/mark-paymob-paid', [AdminOrderController::class, 'markPaymobPaid'])->name('orders.mark-paymob-paid');
    Route::get('/payment-reports', [\App\Http\Controllers\Admin\PaymentReportController::class, 'index'])->name('payment-reports');
    
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
    
    Route::get('/loyalty-settings', [SettingsController::class, 'loyaltyIndex'])->name('loyalty-settings');
    Route::post('/loyalty-settings', [SettingsController::class, 'loyaltyUpdate'])->name('loyalty-settings.update');
    
    // Payment Gateways
    Route::get('/payment-gateways', [PaymentGatewayController::class, 'index'])->name('payment-gateways');
    Route::post('/payment-gateways', [PaymentGatewayController::class, 'update'])->name('payment-gateways.update');

    // POS Integrations
    Route::get('/pos-integrations', [PosIntegrationController::class, 'index'])->name('pos-integrations');
    Route::post('/pos-integrations', [PosIntegrationController::class, 'update'])->name('pos-integrations.update');
    Route::post('/pos-integrations/test', [PosIntegrationController::class, 'testConnection'])->name('pos-integrations.test');

    // Customers
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/{id}', [CustomerController::class, 'show'])->name('customers.show');
    
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
        Route::post('/qr-codes/{id}/regenerate', [QrCodeController::class, 'regenerate'])->name('qr-codes.regenerate');
        Route::post('/qr-codes/regenerate-all', [QrCodeController::class, 'regenerateAll'])->name('qr-codes.regenerate-all');
        Route::delete('/qr-codes/{id}', [QrCodeController::class, 'destroy'])->name('qr-codes.destroy');
    });

    // Coupons
    Route::resource('coupons', \App\Http\Controllers\Admin\CouponController::class)->except(['create', 'show', 'edit']);

    // AI Automation
    Route::middleware('feature:ai_automation')->group(function () {
        Route::get('/ai-automation', [\App\Http\Controllers\Admin\AiAutomationController::class, 'index'])->name('ai-automation.index');
        Route::post('/ai-automation/suggest-offer', [\App\Http\Controllers\Admin\AiAutomationController::class, 'suggestOffer'])->name('ai-automation.suggest-offer');
        
        // AI Campaigns
        Route::get('/ai-campaigns/{id}', [AiCampaignController::class, 'show'])->name('ai-campaigns.show');
        Route::post('/ai-campaigns/preview-target', [AiCampaignController::class, 'previewTarget'])->name('ai-campaigns.preview-target');
        Route::post('/ai-campaigns', [AiCampaignController::class, 'store'])->name('ai-campaigns.store');
        Route::put('/ai-campaigns/{id}', [AiCampaignController::class, 'update'])->name('ai-campaigns.update');
        Route::post('/ai-campaigns/{id}/schedule', [AiCampaignController::class, 'schedule'])->name('ai-campaigns.schedule');
        Route::post('/ai-campaigns/{id}/cancel', [AiCampaignController::class, 'cancel'])->name('ai-campaigns.cancel');
        Route::post('/ai-campaigns/{id}/send-now', [AiCampaignController::class, 'sendNow'])->name('ai-campaigns.send-now');
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
