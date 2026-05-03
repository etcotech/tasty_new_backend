<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerWallet extends Model
{
    protected $fillable = [
        'restaurant_id',
        'phone',
        'points',
        'cashback_balance',
        'total_spent'
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
