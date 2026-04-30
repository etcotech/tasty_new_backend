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

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('SaaS/Landing');
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

    Route::resource('categories', CategoryController::class);
    
    Route::get('/products/export-template', [ProductController::class, 'exportTemplate'])->name('products.export-template');
    Route::get('/products/export', [ProductController::class, 'export'])->name('products.export');
    Route::post('/products/import', [ProductController::class, 'import'])->name('products.import');
    Route::resource('products', ProductController::class);
    
    Route::resource('extras', AddonController::class);
    Route::resource('branches', BranchController::class);
    
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');

    // QR Codes
    Route::get('/qr-codes', [QrCodeController::class, 'index'])->name('qr-codes.index');
    Route::post('/qr-codes', [QrCodeController::class, 'store'])->name('qr-codes.store');
    Route::delete('/qr-codes/{qrCode}', [QrCodeController::class, 'destroy'])->name('qr-codes.destroy');
});

/*
|--------------------------------------------------------------------------
| Kitchen Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::get('/kitchen', function () {
        return Inertia::render('Kitchen/Dashboard');
    })->name('kitchen');

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
