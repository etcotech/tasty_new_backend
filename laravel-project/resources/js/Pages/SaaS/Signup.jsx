import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ShoppingBag,
    MessageSquare,
    Gift,
    Store,
    User,
    Mail,
    Phone,
    Lock,
    Globe,
    Info,
    AlertCircle,
    Tag,
    ChevronDown,
} from 'lucide-react';

const Signup = ({ restaurants_count, auth_logo, plans = [], selected_plan = null }) => {
    const [slugTouched, setSlugTouched] = useState(false);
    const [showPlanDropdown, setShowPlanDropdown] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        restaurant_name: '',
        slug: '',
        admin_name: '',
        email: '',
        country_code: '966',
        mobile_number: '',
        password: '',
        password_confirmation: '',
        plan_id: selected_plan ? selected_plan.id : '',
    });

    // Track the currently displayed plan (from preselected or dropdown)
    const [activePlan, setActivePlan] = useState(selected_plan || null);

    // Auto-suggest slug
    useEffect(() => {
        if (data.restaurant_name && !slugTouched) {
            const isArabic = /[\u0600-\u06FF]/.test(data.restaurant_name);
            if (!isArabic) {
                const suggestedSlug = data.restaurant_name
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                    .substring(0, 30);
                setData('slug', suggestedSlug);
            }
        }
    }, [data.restaurant_name]);

    const handleSlugChange = (e) => {
        setSlugTouched(true);
        const val = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setData('slug', val);
    };

    const handlePlanSelect = (plan) => {
        setActivePlan(plan);
        setData('plan_id', plan ? plan.id : '');
        setShowPlanDropdown(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/restaurant-signup');
    };

    const features = [
        { title: "استقبال الطلبات أونلاين", icon: <ShoppingBag className="w-5 h-5 text-amber-500" /> },
        { title: "إدارة الفروع والقائمة", icon: <Store className="w-5 h-5 text-amber-500" /> },
        { title: "واتساب وفواتير تلقائية", icon: <MessageSquare className="w-5 h-5 text-amber-500" /> },
        { title: "نقاط ولاء وكاش باك", icon: <Gift className="w-5 h-5 text-amber-500" /> },
    ];

    const billingLabel = (plan) => {
        if (!plan) return '';
        if (Number(plan.price) === 0) return 'مجاناً';
        return plan.billing_cycle === 'yearly'
            ? `${plan.price} ر.س / سنة`
            : `${plan.price} ر.س / شهر`;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row-reverse font-cairo" dir="rtl">
            <Head title="سجّل مطعمك في منصة تيستي" />

            {/* Left Side: Features */}
            <div className="hidden md:flex md:w-5/12 bg-amber-50 flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-100 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-200 rounded-full opacity-30 blur-3xl"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="mb-12">
                        {auth_logo ? (
                            <img className="h-16 w-auto mb-8" src={auth_logo} alt="Tasty Platform" />
                        ) : (
                            <div className="text-4xl font-extrabold text-amber-600 mb-8">Tasty</div>
                        )}
                        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            ابدأ رحلة النجاح مع تيستي اليوم
                        </h1>
                        <p className="text-xl text-gray-600 mb-10">
                            انضم إلى مئات المطاعم التي طورت أعمالها باستخدام منصتنا المتكاملة
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-start gap-4 transition-transform hover:translate-x-[-8px]">
                                <div className="bg-amber-50 p-3 rounded-xl">{feature.icon}</div>
                                <div><h3 className="font-bold text-gray-800 text-lg">{feature.title}</h3></div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-500 p-2 rounded-full text-white">
                                <Store className="w-6 h-6" />
                            </div>
                            <div className="text-lg">
                                <span className="font-bold text-gray-900">+{restaurants_count} مطعم</span>
                                <span className="text-gray-600 block text-sm">انضموا إلينا مؤخراً</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Signup Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 bg-white overflow-y-auto">
                <div className="mx-auto w-full max-w-lg">
                    <div className="md:hidden mb-8 text-center">
                        {auth_logo ? (
                            <img className="mx-auto h-12 w-auto" src={auth_logo} alt="Tasty Platform" />
                        ) : (
                            <div className="text-3xl font-extrabold text-amber-600">Tasty</div>
                        )}
                    </div>

                    <div className="text-right mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                            سجّل مطعمك في منصة تيستي
                        </h2>
                        <p className="text-gray-500">
                            ابدأ باستقبال الطلبات وإدارة مطعمك بسهولة من لوحة تحكم واحدة
                        </p>
                    </div>

                    {/* Selected Plan Banner */}
                    {activePlan ? (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-500 p-2 rounded-xl text-white">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">الباقة المختارة</div>
                                    <div className="font-bold text-gray-900 text-base">
                                        {activePlan.name_ar || activePlan.name_en}
                                        <span className="mr-2 text-amber-600 font-semibold text-sm">
                                            ({billingLabel(activePlan)})
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                                className="text-amber-600 hover:text-amber-800 text-sm font-bold underline underline-offset-2 whitespace-nowrap"
                            >
                                تغيير الباقة
                            </button>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-50 transition-all text-right"
                            >
                                <div className="flex items-center gap-2 text-gray-500 font-semibold">
                                    <Tag className="w-4 h-4 text-amber-400" />
                                    اختر باقة (اختياري)
                                </div>
                                <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${showPlanDropdown ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    )}

                    {/* Plan Dropdown */}
                    {showPlanDropdown && plans.length > 0 && (
                        <div className="mb-6 border border-amber-200 rounded-2xl overflow-hidden shadow-lg">
                            {activePlan && (
                                <button
                                    type="button"
                                    onClick={() => handlePlanSelect(null)}
                                    className="w-full px-4 py-3 text-right text-sm text-gray-400 hover:bg-gray-50 border-b border-amber-100 font-medium"
                                >
                                    بدون باقة محددة
                                </button>
                            )}
                            {plans.map(plan => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => handlePlanSelect(plan)}
                                    className={`w-full px-4 py-3.5 text-right hover:bg-amber-50 border-b border-amber-50 last:border-0 transition-all flex justify-between items-center ${activePlan?.id === plan.id ? 'bg-amber-50' : ''}`}
                                >
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">{plan.name_ar || plan.name_en}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{billingLabel(plan)}</div>
                                    </div>
                                    {activePlan?.id === plan.id && (
                                        <span className="text-amber-500 text-lg">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {errors.plan_id && (
                        <p className="mb-4 text-sm text-red-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.plan_id}
                        </p>
                    )}

                    {/* Link back to pricing section */}
                    <div className="mb-6 text-center">
                        <a
                            href="/#pricing"
                            className="text-xs text-gray-400 hover:text-amber-600 transition-colors"
                        >
                            عرض جميع الباقات والأسعار
                        </a>
                    </div>

                    <form className="space-y-6" onSubmit={submit}>
                        {/* Hidden plan_id */}
                        <input type="hidden" name="plan_id" value={data.plan_id} />

                        <div className="grid grid-cols-1 gap-6">
                            {/* Restaurant Name + Slug */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Store className="w-4 h-4 text-amber-500" />
                                        اسم المطعم
                                    </label>
                                    <input
                                        type="text"
                                        value={data.restaurant_name}
                                        onChange={e => setData('restaurant_name', e.target.value)}
                                        placeholder="مثلاً: شاورما السلطان"
                                        className="block w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:border-amber-200"
                                        required
                                    />
                                    {errors.restaurant_name && <p className="mt-1 text-xs text-red-500 font-bold">{errors.restaurant_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-amber-500" />
                                        اسم الرابط (Slug)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={handleSlugChange}
                                        placeholder="chickenday"
                                        className="block w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:border-amber-200 text-left font-semibold"
                                        dir="ltr"
                                        required
                                    />
                                    <p className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-1">
                                        <Info className="w-3 h-3" />
                                        (اكتب الرابط بالإنجليزي بدون مسافات، مثال: chickenday)
                                    </p>
                                    {errors.slug && <p className="mt-1 text-xs text-red-500 font-bold">{errors.slug}</p>}
                                    {/[\u0600-\u06FF]/.test(data.slug) && (
                                        <p className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            الرابط يجب أن يكون باللغة الإنجليزية فقط
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Manager Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4 text-amber-500" />
                                    اسم المدير المسؤول
                                </label>
                                <input
                                    type="text"
                                    value={data.admin_name}
                                    onChange={e => setData('admin_name', e.target.value)}
                                    placeholder="الاسم الثلاثي للمدير"
                                    className="block w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:border-amber-200"
                                    required
                                />
                                {errors.admin_name && <p className="mt-1 text-xs text-red-500 font-bold">{errors.admin_name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-amber-500" />
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="example@mail.com"
                                    className="block w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:border-amber-200"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email}</p>}
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-amber-500" />
                                    رقم الجوال
                                </label>
                                <div className="flex gap-2" dir="ltr">
                                    <select
                                        value={data.country_code}
                                        onChange={(e) => setData('country_code', e.target.value)}
                                        className="w-36 px-3 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-amber-500 outline-none text-center font-bold text-sm"
                                    >
                                        <option value="966">🇸🇦 +966</option>
                                        <option value="971">🇦🇪 +971</option>
                                        <option value="965">🇰🇼 +965</option>
                                        <option value="974">🇶🇦 +974</option>
                                        <option value="973">🇧🇭 +973</option>
                                        <option value="968">🇴🇲 +968</option>
                                        <option value="962">🇯🇴 +962</option>
                                        <option value="20">🇪🇬 +20</option>
                                    </select>
                                    <input
                                        type="tel"
                                        value={data.mobile_number}
                                        onChange={e => setData('mobile_number', e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="5XXXXXXXX"
                                        className="flex-1 block w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:border-amber-200 font-bold tracking-wider"
                                        required
                                    />
                                </div>
                                {data.country_code === '966' && data.mobile_number && !data.mobile_number.startsWith('5') && (
                                    <p className="mt-1 text-xs text-amber-600 font-bold">رقم الجوال السعودي يجب أن يبدأ بـ 5</p>
                                )}
                                {errors.mobile_number && <p className="mt-1 text-xs text-red-500 font-bold">{errors.mobile_number}</p>}
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-amber-500" />
                                        كلمة المرور
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="block w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:border-amber-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-amber-500" />
                                        تأكيد كلمة المرور
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className="block w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:border-amber-200"
                                        required
                                    />
                                </div>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500 font-bold">{errors.password}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing || /[\u0600-\u06FF]/.test(data.slug)}
                                className="w-full flex justify-center items-center gap-3 py-4 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-amber-100 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-amber-200"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        جاري المعالجة...
                                    </>
                                ) : 'ابدأ مطعمك الآن'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 font-medium">
                            لديك حساب بالفعل؟{' '}
                            <Link
                                href="/login"
                                className="text-amber-600 font-bold hover:text-amber-700 underline underline-offset-4 decoration-amber-200 hover:decoration-amber-500 transition-all"
                            >
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
                .font-cairo { font-family: 'Cairo', sans-serif; }
                input::placeholder { color: #cbd5e1; font-weight: 500; }
                select {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: left 0.75rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-left: 2.5rem;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }
            `}</style>
        </div>
    );
};

export default Signup;
