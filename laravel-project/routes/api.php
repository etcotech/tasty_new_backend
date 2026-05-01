<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\Api\AutomationTemplateController;
use App\Http\Controllers\Api\TenantAutomationController;
use App\Http\Controllers\Api\AutomationLogController;

Route::get('/restaurants/{slug}/menu', [StorefrontController::class, 'menu']);
Route::post('/orders', [OrderController::class, 'store']);
Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::get('/orders/{order_number}/track', [OrderController::class, 'track']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Automation API Routes
|--------------------------------------------------------------------------
| These are open API endpoints for external systems (e.g., n8n, Zapier).
| For production, secure these with an API key or sanctum middleware.
*/

// Automation Templates (platform-level, managed by super admin)
Route::apiResource('automation-templates', AutomationTemplateController::class);

// Tenant Automations (per-restaurant, multi-tenant scoped)
Route::get('automations', [TenantAutomationController::class, 'index']);
Route::get('automations/{id}', [TenantAutomationController::class, 'show']);
Route::post('automations', [TenantAutomationController::class, 'store']);
Route::put('automations/{id}', [TenantAutomationController::class, 'update']);
Route::delete('automations/{id}', [TenantAutomationController::class, 'destroy']);
Route::patch('automations/{id}/toggle', [TenantAutomationController::class, 'toggle']);

// Automation Logs (per-restaurant, multi-tenant scoped)
Route::get('automation-logs', [AutomationLogController::class, 'index']);
Route::get('automation-logs/{id}', [AutomationLogController::class, 'show']);
Route::post('automation-logs', [AutomationLogController::class, 'store']);
Route::delete('automation-logs', [AutomationLogController::class, 'destroy']);
