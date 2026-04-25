<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'restaurant_id', 'order_number', 'order_type', 'status', 
        'table_number', 'car_number', 'phone', 'customer_name', 
        'notes', 'subtotal', 'tax', 'total'
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
