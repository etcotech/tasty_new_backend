<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    protected $fillable = ['name_ar', 'name_en', 'price', 'is_active'];

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
}
