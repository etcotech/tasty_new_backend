<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingSettingsController extends Controller
{
    private function superAdminOnly()
    {
        if (auth()->user()?->role !== 'super_admin') {
            abort(403, 'Super admin only.');
        }
    }

    private function defaults(): array
    {
        return [
            'logo_url'        => '',
            'platform_name_ar' => 'منصة تيستي',
            'platform_name_en' => 'Tasty Platform',
            'hero_badge'       => 'إصدار 2026 الجديد 🚀',
            'headline_ar'      => 'نظام ذكي لإدارة طلبات المطاعم والفروع والمطابخ',
            'headline_en'      => 'Smart Restaurant Management System',
            'subtitle_ar'      => 'منصة تيستي تساعد المطاعم على إدارة المنيو الإلكتروني، الطلبات، الفروع، وشاشات المطبخ من لوحة تحكم واحدة.',
            'subtitle_en'      => 'Manage your menu, orders, branches, and kitchen screens from one dashboard.',
            'primary_btn_text' => 'تسجيل مطعم جديد',
            'primary_btn_link' => '/restaurant-signup',
            'secondary_btn_text' => 'تجربة تيستي',
            'secondary_btn_link' => '/tasty',
            'hero_image_url'   => '/images/hero-mockup.png',
        ];
    }

    private function defaultCards(): array
    {
        return [
            ['icon' => '🏪', 'title_ar' => 'إدارة الفروع',     'title_en' => 'Branch Management', 'description_ar' => 'أضف فروعك وخصص إعدادات كل فرع بشكل مستقل مع عزل كامل للطلبات والتقارير.', 'description_en' => 'Add branches and manage each independently.', 'sort_order' => 1, 'is_active' => true],
            ['icon' => '📜', 'title_ar' => 'منيو إلكتروني',    'title_en' => 'Digital Menu',       'description_ar' => 'منيو QR احترافي وسريع، يتيح لعملائك الطلب والدفع بسهولة تامة.',           'description_en' => 'Professional QR menu for easy ordering.',        'sort_order' => 2, 'is_active' => true],
            ['icon' => '🍳', 'title_ar' => 'شاشة مطبخ KDS',   'title_en' => 'Kitchen Display',    'description_ar' => 'نظام إدارة مطبخ متطور ينظم تدفق الطلبات ويقلل وقت الانتظار والأخطاء.',    'description_en' => 'Advanced KDS to reduce wait times.',             'sort_order' => 3, 'is_active' => true],
            ['icon' => '📊', 'title_ar' => 'طلبات حسب الفرع', 'title_en' => 'Branch Orders',      'description_ar' => 'نظام ذكي يوجه كل طلب إلى الفرع الأقرب أو المختار تلقائياً.',             'description_en' => 'Smart order routing by branch.',                 'sort_order' => 4, 'is_active' => true],
            ['icon' => '🛡️', 'title_ar' => 'لوحة تحكم SaaS',  'title_en' => 'SaaS Dashboard',    'description_ar' => 'تحكم شامل بجميع جوانب المنصة، من الأسعار إلى الموظفين والصلاحيات.',       'description_en' => 'Full SaaS control over pricing and permissions.', 'sort_order' => 5, 'is_active' => true],
            ['icon' => '🚀', 'title_ar' => 'أداء فائق',        'title_en' => 'High Performance',   'description_ar' => 'تقنيات حديثة تضمن سرعة تحميل خيالية واستقرار تام حتى في أوقات الذروة.', 'description_en' => 'Modern tech for speed and stability.',           'sort_order' => 6, 'is_active' => true],
        ];
    }

    public function index()
    {
        $this->superAdminOnly();

        $general = Setting::get('landing_general', $this->defaults());
        $cards   = Setting::get('landing_cards',   $this->defaultCards());

        return Inertia::render('Admin/LandingSettings', [
            'general' => $general,
            'cards'   => $cards,
        ]);
    }

    public function update(Request $request)
    {
        $this->superAdminOnly();

        $request->validate([
            'general.platform_name_ar' => 'required|string|max:255',
            'general.platform_name_en' => 'required|string|max:255',
            'cards'                    => 'required|array',
            'cards.*.title_ar'         => 'required|string',
            'cards.*.icon'             => 'required|string',
            'cards.*.sort_order'       => 'required|integer',
        ]);

        Setting::set('landing_general', $request->input('general'));
        Setting::set('landing_cards', $request->input('cards'));

        return redirect()->back()->with('success', 'تم حفظ إعدادات صفحة الهبوط بنجاح ✅');
    }
}
