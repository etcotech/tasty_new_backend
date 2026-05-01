<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Plan extends Model
{
    protected $fillable = [
        'name_ar', 'name_en', 'price', 'billing_cycle', 'branches_limit',
        'monthly_orders_limit', 'users_limit', 'allowed_order_types',
        'has_kds', 'has_qr', 'has_automation', 'has_smart_orders',
        'reports_level', 'is_active'
    ];

    protected $casts = [
        'allowed_order_types' => 'array',
        'has_kds' => 'boolean',
        'has_qr' => 'boolean',
        'has_automation' => 'boolean',
        'has_smart_orders' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(RestaurantSubscription::class);
    }
}
