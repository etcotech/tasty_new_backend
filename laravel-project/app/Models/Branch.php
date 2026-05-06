<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'restaurant_id',
        'name_ar',
        'name_en',
        'slug',
        'phone',
        'address',
        'is_active',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($branch) {
            if (empty($branch->slug)) {
                $baseSlug = \Illuminate\Support\Str::slug($branch->name_en);
                $slug = $baseSlug;
                $count = 1;

                while (static::where('restaurant_id', $branch->restaurant_id)
                             ->where('slug', $slug)
                             ->where('id', '!=', $branch->id)
                             ->exists()) {
                    $slug = $baseSlug . '-' . $count++;
                }
                
                $branch->slug = $slug;
            }
        });
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
}
