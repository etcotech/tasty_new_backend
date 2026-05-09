<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    protected $fillable = ['restaurant_id', 'name_ar', 'name_en', 'price', 'is_active', 'is_global'];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
}
