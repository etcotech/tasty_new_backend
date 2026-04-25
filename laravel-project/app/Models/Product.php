<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'restaurant_id', 'category_id', 'name_ar', 'name_en', 
        'description_ar', 'description_en', 'price', 
        'image_path', 'is_available', 'sort_order'
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function addons()
    {
        return $this->belongsToMany(Addon::class);
    }
}
