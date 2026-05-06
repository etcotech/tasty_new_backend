<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'usage_count',
        'per_customer_limit',
        'starts_at',
        'expires_at',
        'is_active',
        'applies_to',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'discount_value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function isValidFor($subtotal, $orderType, $phone = null)
    {
        if (!$this->is_active) {
            return [false, 'الكوبون غير فعال'];
        }

        $now = now();
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return [false, 'الكوبون لم يبدأ بعد'];
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return [false, 'الكوبون منتهي الصلاحية'];
        }

        if ($this->applies_to !== 'all_orders' && $this->applies_to !== $orderType) {
            return [false, 'هذا الكوبون غير صالح لهذا النوع من الطلبات'];
        }

        if ($subtotal < $this->min_order_amount) {
            return [false, 'قيمة الطلب أقل من الحد الأدنى لتطبيق الكوبون: ' . $this->min_order_amount];
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return [false, 'لقد تم تجاوز الحد الأقصى لاستخدام الكوبون'];
        }

        if ($this->per_customer_limit && $phone) {
            $customerUsage = Order::where('coupon_id', $this->id)
                ->where('phone', $phone)
                ->whereNotIn('status', ['cancelled'])
                ->count();
            
            if ($customerUsage >= $this->per_customer_limit) {
                return [false, 'لقد استنفدت حد استخدام هذا الكوبون لعميل واحد'];
            }
        }

        return [true, 'تم تطبيق الكوبون بنجاح'];
    }

    public function calculateDiscount($subtotal)
    {
        $discount = 0;
        if ($this->discount_type === 'percentage') {
            $discount = ($subtotal * $this->discount_value) / 100;
            if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
                $discount = $this->max_discount_amount;
            }
        } else {
            $discount = $this->discount_value;
        }

        return min($discount, $subtotal);
    }
}
