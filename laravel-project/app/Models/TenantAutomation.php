<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenantAutomation extends Model
{
    protected $fillable = [
        'restaurant_id',
        'automation_template_id',
        'name',
        'settings',
        'is_enabled',
    ];

    protected $casts = [
        'settings' => 'json',
        'is_enabled' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(AutomationTemplate::class, 'automation_template_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AutomationLog::class, 'automation_id');
    }
}
