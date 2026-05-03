<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosIntegration extends Model
{
    protected $fillable = [
        'restaurant_id',
        'provider',
        'api_key',
        'access_token',
        'business_id',
        'branch_id',
        'is_enabled',
        'environment',
        'settings'
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'settings' => 'array'
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }}
