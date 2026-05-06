<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    protected $fillable = [
        'name_ar', 'name_en', 'slug', 'logo_path', 'is_active',
        // Settings
        'phone', 'country_code', 'address', 'tax_percentage', 'currency',
        'working_hours', 'logo_url', 'hero_image_url',
        'address_ar', 'address_en', 'is_open',
        'subtitle_ar', 'subtitle_en', 'google_review_url',
        'points_enabled', 'cashback_enabled', 'points_rate', 'cashback_percentage', 'min_order_amount', 'point_value',
    ];

    protected $casts = [
        'is_open'        => 'boolean',
        'is_active'      => 'boolean',
        'tax_percentage' => 'float',
        'points_enabled' => 'boolean',
        'cashback_enabled' => 'boolean',
        'points_rate' => 'integer',
        'cashback_percentage' => 'float',
        'min_order_amount' => 'float',
        'point_value' => 'float',
    ];

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function subscription()
    {
        return $this->hasOne(RestaurantSubscription::class)->latestOfMany();
    }

    public function plan()
    {
        return $this->hasOneThrough(
            Plan::class,
            RestaurantSubscription::class,
            'restaurant_id', // Foreign key on restaurant_subscriptions table...
            'id', // Foreign key on plans table...
            'id', // Local key on restaurants table...
            'plan_id' // Local key on restaurant_subscriptions table...
        );
    }

    public function automations()
    {
        return $this->hasMany(TenantAutomation::class);
    }

    public function automationLogs()
    {
        return $this->hasMany(AutomationLog::class);
    }

    public function paymentGateway()
    {
        return $this->hasOne(PaymentGateway::class);
    }
}
