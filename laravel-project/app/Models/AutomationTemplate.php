<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutomationTemplate extends Model
{
    protected $fillable = [
        'name',
        'code',
        'trigger_event',
        'webhook_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tenantAutomations(): HasMany
    {
        return $this->hasMany(TenantAutomation::class);
    }
}
