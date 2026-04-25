<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\AddonController;
use App\Http\Controllers\Admin\DashboardController;

Route::middleware('auth')->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/orders', [AdminOrderController::class, 'index'])->name('admin.orders');
    Route::resource('/admin/categories', CategoryController::class);
    Route::get('/admin/products/export-template', [ProductController::class, 'exportTemplate'])->name('admin.products.export-template');
    Route::get('/admin/products/export', [ProductController::class, 'export'])->name('admin.products.export');
    Route::post('/admin/products/import', [ProductController::class, 'import'])->name('admin.products.import');
    Route::resource('/admin/products', ProductController::class);
    Route::resource('/admin/extras', AddonController::class);

    Route::get('/kitchen', function () {
        return Inertia::render('Kitchen/Dashboard');
    })->name('kitchen');
});

Route::get('/track/{order_number?}', function ($order_number = null) {
    return Inertia::render('Storefront/TrackOrder', ['initialOrderNumber' => $order_number]);
})->name('track');

Route::get('/{slug?}', [StorefrontController::class, 'page'])
    ->where('slug', '^(?!api|login|register|dashboard|profile|admin|kitchen|track|_debugbar|up).*$')
    ->name('storefront');

Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
