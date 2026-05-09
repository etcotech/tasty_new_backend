<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemAddon extends Model
{
    protected $fillable = ['order_item_id', 'addon_id', 'addon_name_ar', 'addon_name_en', 'price', 'quantity', 'total'];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function addon()
    {
        return $this->belongsTo(Addon::class);
    }
}
