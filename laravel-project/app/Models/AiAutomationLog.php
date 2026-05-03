<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiAutomationLog extends Model
{
    protected $fillable = [
        'restaurant_id',
        'type',
        'input_summary',
        'output_text'
    ];

    protected $casts = [
        'input_summary' => 'array'
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
