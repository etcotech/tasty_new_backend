<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'restaurant_id', 'branch_id', 'order_number', 'order_type', 'status', 
        'table_number', 'car_number', 'phone', 'customer_name', 
        'notes', 'subtotal', 'tax', 'total', 'cashback_used', 'points_used',
        'pos_external_id', 'coupon_id', 'coupon_code', 'discount_amount', 'wallet_discount_amount',
        'payment_method', 'payment_status', 'payment_provider', 'payment_reference', 
        'paymob_order_id', 'paymob_transaction_id'
    ];
    
    protected $casts = [
        'subtotal' => 'float',
        'tax' => 'float',
        'total' => 'float',
        'cashback_used' => 'float',
        'points_used' => 'integer',
        'discount_amount' => 'float',
        'wallet_discount_amount' => 'float',
    ];

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
