<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\KitchenController;

Route::get('/restaurants/{slug}/menu', [StorefrontController::class, 'menu']);
Route::post('/orders', [OrderController::class, 'store']);
Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::get('/orders/{order_number}/track', [OrderController::class, 'track']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
