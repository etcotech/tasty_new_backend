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
        'subtitle_ar', 'subtitle_en',
    ];

    protected $casts = [
        'is_open'        => 'boolean',
        'is_active'      => 'boolean',
        'tax_percentage' => 'float',
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
}
