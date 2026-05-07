import React, { useRef, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const GOLD = '#C9A84C';

/* ── helpers ── */
function getFlagEmoji(code) {
    if (!code || code.length !== 2) return code;
    return code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt())
        .map(code => String.fromCodePoint(code))
        .join('');
}

const Field = ({ label, hint, error, children }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
            {label}
        </label>
        {hint && <p style={{ fontSize: '0.77rem', color: '#9CA3AF', marginBottom: '0.35rem' }}>{hint}</p>}
        {children}
        {error && <p style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
);

const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.9rem',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    background: '#fff',
    transition: 'border-color 0.15s',
};

const TextInput = ({ value, onChange, type = 'text', placeholder = '', step }) => (
    <input
        type={type} step={step} value={value ?? ''} onChange={onChange} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = GOLD}
        onBlur={e => e.target.style.borderColor = '#D1D5DB'}
    />
);

const TextArea = ({ value, onChange, placeholder = '', rows = 2 }) => (
    <textarea
        rows={rows} value={value ?? ''} onChange={onChange} placeholder={placeholder}
        style={{ ...inputStyle, resize: 'vertical' }}
        onFocus={e => e.target.style.borderColor = GOLD}
        onBlur={e => e.target.style.borderColor = '#D1D5DB'}
    />
);

const SectionTitle = ({ children }) => (
    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', borderRight: `3px solid ${GOLD}`, paddingRight: '0.75rem', marginBottom: '1.25rem' }}>
        {children}
    </h3>
);

const Card = ({ children }) => (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.75rem', marginBottom: '1.5rem' }}>
        {children}
    </div>
);

const GRID2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' };

const toastStyles = `
@keyframes svFadeInSlide {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes svFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
.sv-toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 9999;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    font-size: 0.95rem;
    animation: svFadeInSlide 0.4s ease forwards;
    direction: rtl;
    max-width: 350px;
}
.sv-toast.success { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
.sv-toast.error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
.sv-toast.fade-out { animation: svFadeOut 0.4s ease forwards; }
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;

const Toast = ({ message, type = 'success', onClose }) => {
    const [isExiting, setIsExiting] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onClose, 400);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`sv-toast ${type} ${isExiting ? 'fade-out' : ''}`}>
            <span>{type === 'success' ? '✅' : '❌'}</span>
            <span>{message}</span>
        </div>
    );
};

/* ── country codes list ── */
const COUNTRIES = [
    { code: '+966', flag: 'SA', name: 'السعودية' },
    { code: '+971', flag: 'AE', name: 'الإمارات' },
    { code: '+974', flag: 'QA', name: 'قطر' },
    { code: '+965', flag: 'KW', name: 'الكويت' },
    { code: '+968', flag: 'OM', name: 'عُمان' },
    { code: '+973', flag: 'BH', name: 'البحرين' },
    { code: '+962', flag: 'JO', name: 'الأردن' },
    { code: '+20',  flag: 'EG', name: 'مصر' },
    { code: '+1',   flag: 'US', name: 'USA' },
    { code: '+249', flag: 'SD', name: 'السودان' },
];

/* ── component ── */
export default function Settings({ restaurant }) {
    const { flash } = usePage().props;
    const logoInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(restaurant?.logo_url || null);
    const [toast, setToast] = useState(null); // { message, type }
    const [showReviewHelp, setShowReviewHelp] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name_ar: restaurant?.name_ar ?? '',
        name_en: restaurant?.name_en ?? '',
        country_code: restaurant?.country_code ?? '+966',
        phone: restaurant?.phone ?? '',
        address_ar: restaurant?.address_ar ?? '',
        address_en: restaurant?.address_en ?? '',
        tax_percentage: restaurant?.tax_percentage ?? 8,
        currency: restaurant?.currency ?? 'SAR',
        working_hours: restaurant?.working_hours ?? '',
        logo_url: restaurant?.logo_url ?? '',
        logo_file: null,
        hero_image_url: restaurant?.hero_image_url ?? '',
        subtitle_ar: restaurant?.subtitle_ar ?? '',
        subtitle_en: restaurant?.subtitle_en ?? '',
        is_open: restaurant?.is_open ?? true,
        google_review_url: restaurant?.google_review_url ?? '',
    });

    const handleLogoFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('logo_file', file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,   // required for file upload
            onSuccess: () => {
                setToast({ message: 'تم حفظ الإعدادات بنجاح ✅', type: 'success' });
            },
            onError: () => {
                setToast({ message: 'حدث خطأ أثناء الحفظ ❌', type: 'error' });
            }
        });
    };

    const selectedCountry = COUNTRIES.find(c => c.code === data.country_code) || COUNTRIES[0];

    return (
        <AdminLayout title="إعدادات المطعم">
            <Head title="إعدادات المطعم" />
            <style>{toastStyles}</style>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Page header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#111827', margin: 0 }}>إعدادات المطعم</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.3rem', fontSize: '0.9rem' }}>إدارة بيانات المطعم والضريبة والمظهر العام</p>
                </div>
            </div>

            <form onSubmit={submit} encType="multipart/form-data">

                {/* ── 1. Branding ── */}
                <Card>
                    <SectionTitle>🏷️ الاسم والهوية</SectionTitle>
                    <div style={GRID2}>
                        <Field label="اسم المطعم (عربي) *" error={errors.name_ar}>
                            <TextInput value={data.name_ar} onChange={e => setData('name_ar', e.target.value)} />
                        </Field>
                        <Field label="Restaurant Name (English) *" error={errors.name_en}>
                            <TextInput value={data.name_en} onChange={e => setData('name_en', e.target.value)} />
                        </Field>
                    </div>

                    <div style={{ ...GRID2, marginTop: '1.25rem' }}>
                        <Field label="الوصف الفرعي (عربي)" hint="يظهر في قسم الواجهة الرئيسي" error={errors.subtitle_ar}>
                            <TextInput value={data.subtitle_ar} onChange={e => setData('subtitle_ar', e.target.value)} placeholder="مثال: أفضل المأكولات الإيطالية في الرياض" />
                        </Field>
                        <Field label="Subtitle (English)" hint="Appears in the hero section" error={errors.subtitle_en}>
                            <TextInput value={data.subtitle_en} onChange={e => setData('subtitle_en', e.target.value)} placeholder="Example: Best Italian Cuisine in Riyadh" />
                        </Field>
                    </div>

                    {/* Logo */}
                    <div style={{ marginTop: '1.25rem' }}>
                        <Field label="شعار المطعم (Logo)" hint="يظهر في شريط التنقل فقط. يمكنك رفع صورة أو إدخال رابط.">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                {/* Preview rectangular */}
                                <div
                                    style={{ width: 160, height: 60, borderRadius: '8px', border: '2px solid #E5E7EB', overflow: 'hidden', flexShrink: 0, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    onClick={() => logoInputRef.current?.click()}
                                    title="اضغط لرفع صورة"
                                >
                                    {logoPreview
                                        ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setLogoPreview(null)} />
                                        : <span style={{ fontSize: '1.5rem', color: '#D1D5DB' }}>🖼️</span>
                                    }
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        style={{ background: '#F3F4F6', border: '1px dashed #D1D5DB', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit', color: '#374151', width: 'fit-content' }}
                                    >
                                        📤 رفع صورة (PNG/JPG/WebP – max 2MB)
                                    </button>
                                    <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoFile} />

                                    {/* Or: URL fallback */}
                                    <TextInput
                                        value={data.logo_url}
                                        onChange={e => { setData('logo_url', e.target.value); if (!data.logo_file) setLogoPreview(e.target.value); }}
                                        placeholder="أو أدخل رابط مباشر للشعار (اختياري)"
                                    />
                                    {errors.logo_url && <p style={{ color: '#EF4444', fontSize: '0.78rem' }}>{errors.logo_url}</p>}
                                </div>
                            </div>
                        </Field>
                    </div>

                    {/* Hero image */}
                    <div style={{ marginTop: '1.25rem' }}>
                        <Field label="صورة الغلاف (Hero Image URL)" hint="تُعرض كخلفية للقسم الرئيسي. مختلفة عن الشعار." error={errors.hero_image_url}>
                            <TextInput value={data.hero_image_url} onChange={e => setData('hero_image_url', e.target.value)} placeholder="https://..." />
                            {data.hero_image_url && (
                                <img src={data.hero_image_url} alt="hero preview" style={{ marginTop: '0.5rem', height: '60px', borderRadius: '6px', objectFit: 'cover', width: '100%', border: '1px solid #E5E7EB' }} onError={e => e.target.style.display = 'none'} />
                            )}
                        </Field>
                    </div>
                </Card>

                {/* ── 2. Contact ── */}
                <Card>
                    <SectionTitle>📞 التواصل والعنوان</SectionTitle>

                    {/* Phone with country code */}
                    <Field label="رقم الهاتف" hint="اختر رمز البلد ثم أدخل الرقم بدونه">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {/* Country code selector */}
                            <select
                                value={data.country_code}
                                onChange={e => setData('country_code', e.target.value)}
                                style={{ ...inputStyle, width: 'auto', minWidth: '120px', padding: '0.6rem 0.5rem', cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = GOLD}
                                onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                            >
                                {COUNTRIES.map(c => (
                                    <option key={c.code} value={c.code}>
                                        {getFlagEmoji(c.flag)} {c.code} {c.name}
                                    </option>
                                ))}
                            </select>
                            <TextInput
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="5x xxx xxxx"
                            />
                        </div>
                        {data.phone && (
                            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.35rem' }}>
                                سيُعرض للعملاء: <strong>{data.country_code} {data.phone}</strong>
                            </p>
                        )}
                    </Field>

                    <div style={{ ...GRID2, marginTop: '1.25rem' }}>
                        <Field label="العنوان (عربي)" error={errors.address_ar}>
                            <TextArea value={data.address_ar} onChange={e => setData('address_ar', e.target.value)} placeholder="الرياض، المملكة العربية السعودية" />
                        </Field>
                        <Field label="Address (English)" error={errors.address_en}>
                            <TextArea value={data.address_en} onChange={e => setData('address_en', e.target.value)} placeholder="Riyadh, Saudi Arabia" />
                        </Field>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                        <Field label="ساعات العمل" hint='مثال: الأحد – الخميس، 9ص – 12م' error={errors.working_hours}>
                            <TextInput value={data.working_hours} onChange={e => setData('working_hours', e.target.value)} placeholder="الأحد – الخميس، 9 صباحاً – 12 مساءً" />
                        </Field>
                    </div>
                </Card>

                {/* ── 3. Tax & Currency ── */}
                <Card>
                    <SectionTitle>💰 الضريبة والعملة</SectionTitle>
                    <div style={GRID2}>
                        <Field label="نسبة ضريبة القيمة المضافة (%)" hint="تُحتسب تلقائيًا على كل طلب وتظهر في السلة" error={errors.tax_percentage}>
                            <TextInput type="number" step="0.01" value={data.tax_percentage} onChange={e => setData('tax_percentage', e.target.value)} />
                        </Field>
                        <Field label="رمز العملة" hint="مثال: SAR، USD، AED" error={errors.currency}>
                            <TextInput value={data.currency} onChange={e => setData('currency', e.target.value)} placeholder="SAR" />
                        </Field>
                    </div>

                    {/* Tax preview */}
                    <div style={{ marginTop: '1rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#92400E' }}>
                        💡 على طلب بقيمة 100 {data.currency || 'SAR'}: الضريبة = {((data.tax_percentage || 0) * 1).toFixed(1)} {data.currency || 'SAR'} ← الإجمالي = {(100 + (data.tax_percentage || 0) * 1).toFixed(2)} {data.currency || 'SAR'}
                    </div>
                </Card>

                {/* ── 4. Google Reviews ── */}
                <Card>
                    <SectionTitle>⭐ إعدادات التقييم (Google Reviews)</SectionTitle>
                    <Field
                        label="رابط تقييم Google"
                        hint="سيتم استخدام هذا الرابط لإرسال طلب تقييم للعملاء بعد إكمال الطلب"
                        error={errors.google_review_url}
                    >
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <TextInput
                                value={data.google_review_url}
                                onChange={e => setData('google_review_url', e.target.value)}
                                placeholder="https://g.page/your-business/review"
                            />
                            {data.google_review_url && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => window.open(data.google_review_url, '_blank')}
                                        style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 0.75rem', cursor: 'pointer', fontSize: '1.1rem' }}
                                        title="فتح الرابط"
                                    >
                                        🔗
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(data.google_review_url);
                                            setToast({ message: 'تم نسخ الرابط بنجاح ✅', type: 'success' });
                                        }}
                                        style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 0.75rem', cursor: 'pointer', fontSize: '1.1rem' }}
                                        title="نسخ الرابط"
                                    >
                                        📋
                                    </button>
                                </div>
                            )}
                        </div>
                    </Field>

                    {!data.google_review_url && (
                        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.75rem' }}>
                            لم يتم تحديد رابط تقييم بعد.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowReviewHelp(true)}
                        style={{ background: 'transparent', border: 'none', color: GOLD, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline', padding: 0 }}
                    >
                        كيفية الحصول على رابط التقييم؟
                    </button>
                </Card>

                {/* ── 6. Status ── */}
                <Card>
                    <SectionTitle>🟢 حالة المطعم</SectionTitle>
                    <div
                        onClick={() => setData('is_open', !data.is_open)}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '10px', background: data.is_open ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${data.is_open ? '#86EFAC' : '#FECACA'}`, userSelect: 'none', transition: 'all 0.2s' }}
                    >
                        {/* Toggle pill */}
                        <div style={{ width: 52, height: 28, borderRadius: 14, background: data.is_open ? '#16A34A' : '#D1D5DB', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', top: 4, right: data.is_open ? 4 : 'auto', left: data.is_open ? 'auto' : 4, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'all 0.2s' }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: data.is_open ? '#166534' : '#991B1B' }}>
                                {data.is_open ? '🟢 المطعم مفتوح' : '🔴 المطعم مغلق'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '0.2rem' }}>
                                {data.is_open ? 'العملاء يستطيعون تصفح القائمة وتقديم الطلبات' : 'سيظهر للعملاء أن المطعم مغلق حاليًا'}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Save ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        disabled={processing}
                        style={{ background: processing ? '#D1D5DB' : GOLD, color: '#fff', border: 'none', padding: '0.85rem 2.5rem', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: processing ? 'not-allowed' : 'pointer', boxShadow: processing ? 'none' : '0 4px 14px rgba(201,168,76,0.35)', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    >
                        {processing ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg className="animate-spin" style={{ width: '1.2rem', height: '1.2rem', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24">
                                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                جاري الحفظ...
                            </span>
                        ) : '💾 حفظ الإعدادات'}
                    </button>
                </div>
            </form>

            {/* Help Modal */}
            {showReviewHelp && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setShowReviewHelp(false)}>
                    <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '450px', width: '100%', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setShowReviewHelp(false)}>×</button>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>كيفية الحصول على رابط التقييم؟</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', direction: 'rtl' }}>
                            {[
                                'افتح Google Maps',
                                'ابحث عن نشاطك التجاري',
                                'اضغط "مشاركة" (Share)',
                                'اختر "كتابة مراجعة" (Write a review)',
                                'انسخ الرابط والصقه في الحقل المخصص'
                            ].map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: GOLD, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>{i + 1}</div>
                                    <div style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 600 }}>{step}</div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowReviewHelp(false)}
                            style={{ width: '100%', marginTop: '2rem', background: '#111827', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            فهمت ذلك
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
