import React, { useRef, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const GOLD = '#C9A84C';

/* ── helpers ── */
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

/* ── country codes list ── */
const COUNTRIES = [
    { code: '+966', flag: '🇸🇦', name: 'السعودية' },
    { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
    { code: '+974', flag: '🇶🇦', name: 'قطر' },
    { code: '+965', flag: '🇰🇼', name: 'الكويت' },
    { code: '+968', flag: '🇴🇲', name: 'عُمان' },
    { code: '+973', flag: '🇧🇭', name: 'البحرين' },
    { code: '+962', flag: '🇯🇴', name: 'الأردن' },
    { code: '+20',  flag: '🇪🇬', name: 'مصر' },
    { code: '+1',   flag: '🇺🇸', name: 'USA' },
    { code: '+44',  flag: '🇬🇧', name: 'UK' },
];

/* ── component ── */
export default function Settings({ restaurant }) {
    const { flash } = usePage().props;
    const logoInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(restaurant?.logo_url || null);

    const { data, setData, post, processing, errors } = useForm({
        name_ar:        restaurant?.name_ar        ?? '',
        name_en:        restaurant?.name_en        ?? '',
        country_code:   restaurant?.country_code   ?? '+966',
        phone:          restaurant?.phone          ?? '',
        address_ar:     restaurant?.address_ar     ?? '',
        address_en:     restaurant?.address_en     ?? '',
        tax_percentage: restaurant?.tax_percentage ?? 8,
        currency:       restaurant?.currency       ?? 'SAR',
        working_hours:  restaurant?.working_hours  ?? '',
        logo_url:       restaurant?.logo_url       ?? '',
        logo_file:      null,
        hero_image_url: restaurant?.hero_image_url ?? '',
        is_open:        restaurant?.is_open        ?? true,
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
        });
    };

    const selectedCountry = COUNTRIES.find(c => c.code === data.country_code) || COUNTRIES[0];

    return (
        <AdminLayout title="إعدادات المطعم">
            <Head title="إعدادات المطعم" />

            {/* Page header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#111827', margin: 0 }}>إعدادات المطعم</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.3rem', fontSize: '0.9rem' }}>إدارة بيانات المطعم والضريبة والمظهر العام</p>
                </div>
                {flash?.success && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        ✓ {flash.success}
                    </div>
                )}
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

                    {/* Logo */}
                    <div style={{ marginTop: '1.25rem' }}>
                        <Field label="شعار المطعم (Logo)" hint="يظهر في شريط التنقل فقط. يمكنك رفع صورة أو إدخال رابط.">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                {/* Preview circle */}
                                <div
                                    style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid #E5E7EB', overflow: 'hidden', flexShrink: 0, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    onClick={() => logoInputRef.current?.click()}
                                    title="اضغط لرفع صورة"
                                >
                                    {logoPreview
                                        ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setLogoPreview(null)} />
                                        : <span style={{ fontSize: '2rem', color: '#D1D5DB' }}>🖼️</span>
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
                                        {c.flag} {c.code} {c.name}
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

                {/* ── 4. Status ── */}
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
                        {processing ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
