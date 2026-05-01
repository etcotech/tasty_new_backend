<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationLog extends Model
{
    protected $fillable = [
        'restaurant_id',
        'automation_id',
        'event_name',
        'payload',
        'status',
        'response',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'json',
        'response' => 'json',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function automation(): BelongsTo
    {
        return $this->belongsTo(TenantAutomation::class, 'automation_id');
    }
}
