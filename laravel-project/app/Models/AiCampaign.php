<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiCampaign extends Model
{
    protected $fillable = [
        'restaurant_id',
        'title',
        'message',
        'target_audience',
        'status',
        'suggested_time_window',
        'reason',
        'scheduled_at',
        'created_by',
        'sent_at',
        'target_count',
        'failure_reason',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function toWebhookPayload()
    {
        return [
            'campaign_id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'title' => $this->title,
            'message' => $this->message,
            'target_audience' => $this->target_audience,
            'status' => $this->status,
        ];
    }
}
