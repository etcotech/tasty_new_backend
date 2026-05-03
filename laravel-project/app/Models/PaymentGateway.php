<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    protected $fillable = [
        'restaurant_id',
        'paymob_api_key',
        'paymob_integration_id',
        'paymob_iframe_id',
        'paymob_hmac_secret',
        'currency',
        'mode',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
