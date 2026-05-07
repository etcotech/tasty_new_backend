<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QrCode extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'restaurant_id',
        'branch_id',
        'type',
        'table_number',
        'name',
        'url',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
