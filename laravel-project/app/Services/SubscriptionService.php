<?php

namespace App\Services;

use App\Models\Restaurant;
use App\Models\Plan;

class SubscriptionService
{
    public function canUseFeature(Restaurant $restaurant, string $feature): bool
    {
        $plan = $restaurant->plan;

        if (!$plan) {
            return false;
        }

        return match ($feature) {
            'branches' => $plan->branches_limit === null || $plan->branches_limit > 0,
            'qr' => (bool) $plan->has_qr,
            'kds' => (bool) $plan->has_kds,
            'automation' => (bool) $plan->has_automation,
            'smart_orders' => (bool) $plan->has_smart_orders,
            'reports' => $plan->reports_level && $plan->reports_level !== 'none',
            default => true,
        };
    }

    public function checkLimit(Restaurant $restaurant, string $limitType): bool
    {
        $plan = $restaurant->plan;

        if (!$plan) {
            return false;
        }

        return match ($limitType) {
            'branches' => $plan->branches_limit === null || $restaurant->branches()->count() < $plan->branches_limit,
            'orders' => $plan->monthly_orders_limit === null || $restaurant->orders()->whereMonth('created_at', now()->month)->count() < $plan->monthly_orders_limit,
            'users' => $plan->users_limit === null || $restaurant->users()->count() < $plan->users_limit,
            default => true,
        };
    }

    public function upgradeMessage(string $featureOrLimit): string
    {
        return match ($featureOrLimit) {
            'branches_limit' => "وصلت إلى الحد الأقصى للفروع في باقتك الحالية. يرجى الترقية لإضافة فروع إضافية.",
            'monthly_orders_limit' => "تم الوصول إلى الحد الشهري للطلبات في باقتك الحالية. يرجى الترقية لزيادة عدد الطلبات.",
            'users_limit' => "وصلت إلى الحد الأقصى للمستخدمين في باقتك الحالية. يرجى الترقية لإضافة مستخدمين.",
            'order_type' => "نوع الطلب هذا غير متاح في باقتك الحالية. يرجى الترقية لتفعيله.",
            'kds' => "شاشة المطبخ غير متاحة في باقتك الحالية. يرجى الترقية لاستخدامها.",
            'qr' => "رموز QR غير متاحة في باقتك الحالية. يرجى الترقية لاستخدامها.",
            'automation' => "نظام الأتمتة غير متاح في باقتك الحالية. يرجى الترقية لاستخدامه.",
            'smart_orders' => "الطلبات الذكية غير متاحة في باقتك الحالية. يرجى الترقية لاستخدامها.",
            'branches' => "هذه الميزة غير متاحة في باقتك الحالية. يرجى الترقية للاستفادة منها.",
            'reports' => "هذه الميزة غير متاحة في باقتك الحالية. يرجى الترقية للاستفادة منها.",
            default => "هذه الميزة غير متاحة في باقتك الحالية. يرجى الترقية للاستفادة منها.",
        };
    }
}
