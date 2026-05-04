<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantCustomer extends Model
{
    protected $fillable = [
        'restaurant_id',
        'name',
        'phone',
        'first_order_id',
        'last_order_id',
        'orders_count',
        'total_spent',
        'last_order_at',
    ];

    protected $casts = [
        'last_order_at' => 'datetime',
        'total_spent' => 'decimal:2',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function firstOrder()
    {
        return $this->belongsTo(Order::class, 'first_order_id');
    }

    public function lastOrder()
    {
        return $this->belongsTo(Order::class, 'last_order_id');
    }

    /**
     * Scope: repeat customers (ordered more than once)
     */
    public function scopeRepeat($query)
    {
        return $query->where('orders_count', '>', 1);
    }

    /**
     * Scope: inactive for N days
     */
    public function scopeInactiveDays($query, int $days)
    {
        return $query->where('last_order_at', '<', now()->subDays($days));
    }
}
