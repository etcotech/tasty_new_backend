<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StorefrontController;

Route::get('/restaurants/{slug}/menu', [StorefrontController::class, 'menu']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
