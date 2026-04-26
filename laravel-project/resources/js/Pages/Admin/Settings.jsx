import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const GOLD = '#C9A84C';

const Field = ({ label, hint, children }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
            {label}
        </label>
        {hint && <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '0.4rem' }}>{hint}</p>}
        {children}
    </div>
);

const Input = ({ value, onChange, type = 'text', placeholder = '', step }) => (
    <input
        type={type}
        step={step}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        style={{
            width: '100%',
            padding: '0.6rem 0.9rem',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = GOLD}
        onBlur={e => e.target.style.borderColor = '#D1D5DB'}
    />
);

const Textarea = ({ value, onChange, placeholder = '', rows = 2 }) => (
    <textarea
        rows={rows}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        style={{
            width: '100%',
            padding: '0.6rem 0.9rem',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = GOLD}
        onBlur={e => e.target.style.borderColor = '#D1D5DB'}
    />
);

const SectionTitle = ({ children }) => (
    <h3 style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: '#111827',
        borderRight: `3px solid ${GOLD}`,
        paddingRight: '0.75rem',
        marginBottom: '1.25rem',
    }}>
        {children}
    </h3>
);

const Card = ({ children, style = {} }) => (
    <div style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
        ...style,
    }}>
        {children}
    </div>
);

export default function Settings({ restaurant }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name_ar:        restaurant?.name_ar        ?? '',
        name_en:        restaurant?.name_en        ?? '',
        phone:          restaurant?.phone          ?? '',
        address_ar:     restaurant?.address_ar     ?? '',
        address_en:     restaurant?.address_en     ?? '',
        tax_percentage: restaurant?.tax_percentage ?? 8,
        currency:       restaurant?.currency       ?? 'SAR',
        working_hours:  restaurant?.working_hours  ?? '',
        logo_url:       restaurant?.logo_url       ?? '',
        hero_image_url: restaurant?.hero_image_url ?? '',
        is_open:        restaurant?.is_open        ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AdminLayout title="إعدادات المطعم">
            <Head title="إعدادات المطعم" />

            {/* Page header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#111827', margin: 0 }}>إعدادات المطعم</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                        إدارة بيانات المطعم والضريبة والمظهر العام
                    </p>
                </div>
                {flash?.success && (
                    <div style={{
                        background: '#F0FDF4',
                        border: '1px solid #86EFAC',
                        color: '#166534',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}>
                        ✓ {flash.success}
                    </div>
                )}
            </div>

            <form onSubmit={submit}>
                {/* ── Branding ── */}
                <Card>
                    <SectionTitle>🏷️ الاسم والهوية</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <Field label="اسم المطعم (عربي) *">
                            <Input value={data.name_ar} onChange={e => setData('name_ar', e.target.value)} />
                            {errors.name_ar && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name_ar}</p>}
                        </Field>
                        <Field label="Restaurant Name (English) *">
                            <Input value={data.name_en} onChange={e => setData('name_en', e.target.value)} />
                            {errors.name_en && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name_en}</p>}
                        </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
                        <Field label="رابط الشعار (Logo URL)" hint="رابط مباشر للصورة (PNG/JPG/WebP)">
                            <Input value={data.logo_url} onChange={e => setData('logo_url', e.target.value)} placeholder="https://..." />
                            {data.logo_url && (
                                <img src={data.logo_url} alt="logo preview" style={{ marginTop: '0.5rem', height: '48px', borderRadius: '6px', objectFit: 'contain', border: '1px solid #E5E7EB' }} onError={e => e.target.style.display = 'none'} />
                            )}
                        </Field>
                        <Field label="صورة الغلاف / الهيرو (Hero Image URL)" hint="تُعرض كخلفية للقسم الرئيسي في الواجهة">
                            <Input value={data.hero_image_url} onChange={e => setData('hero_image_url', e.target.value)} placeholder="https://..." />
                            {data.hero_image_url && (
                                <img src={data.hero_image_url} alt="hero preview" style={{ marginTop: '0.5rem', height: '48px', borderRadius: '6px', objectFit: 'cover', width: '100%', border: '1px solid #E5E7EB' }} onError={e => e.target.style.display = 'none'} />
                            )}
                        </Field>
                    </div>
                </Card>

                {/* ── Contact ── */}
                <Card>
                    <SectionTitle>📞 التواصل والعنوان</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                        <Field label="رقم الهاتف">
                            <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+966 5x xxx xxxx" />
                        </Field>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <Field label="العنوان (عربي)">
                                <Textarea value={data.address_ar} onChange={e => setData('address_ar', e.target.value)} placeholder="الرياض، المملكة العربية السعودية" />
                            </Field>
                            <Field label="Address (English)">
                                <Textarea value={data.address_en} onChange={e => setData('address_en', e.target.value)} placeholder="Riyadh, Saudi Arabia" />
                            </Field>
                        </div>
                        <Field label="ساعات العمل" hint="مثال: الأحد – الخميس، 9 صباحاً – 12 مساءً">
                            <Input value={data.working_hours} onChange={e => setData('working_hours', e.target.value)} placeholder="الأحد – الخميس، 9ص – 12م" />
                        </Field>
                    </div>
                </Card>

                {/* ── Financials ── */}
                <Card>
                    <SectionTitle>💰 الضريبة والعملة</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <Field label="نسبة ضريبة القيمة المضافة (%)" hint="تُطبَّق تلقائيًا على جميع الطلبات">
                            <Input
                                type="number"
                                step="0.01"
                                value={data.tax_percentage}
                                onChange={e => setData('tax_percentage', e.target.value)}
                            />
                            {errors.tax_percentage && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.tax_percentage}</p>}
                        </Field>
                        <Field label="رمز العملة" hint="مثال: SAR، USD، AED">
                            <Input value={data.currency} onChange={e => setData('currency', e.target.value)} placeholder="SAR" />
                        </Field>
                    </div>
                </Card>

                {/* ── Status ── */}
                <Card>
                    <SectionTitle>🟢 حالة المطعم</SectionTitle>
                    <div
                        onClick={() => setData('is_open', !data.is_open)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            cursor: 'pointer',
                            padding: '1rem',
                            borderRadius: '10px',
                            background: data.is_open ? '#F0FDF4' : '#FEF2F2',
                            border: `1px solid ${data.is_open ? '#86EFAC' : '#FECACA'}`,
                            userSelect: 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        {/* Toggle switch */}
                        <div style={{
                            width: '52px',
                            height: '28px',
                            borderRadius: '14px',
                            background: data.is_open ? '#16A34A' : '#D1D5DB',
                            position: 'relative',
                            transition: 'background 0.2s',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: data.is_open ? '4px' : 'auto',
                                left: data.is_open ? 'auto' : '4px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#fff',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                transition: 'all 0.2s',
                            }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: data.is_open ? '#166534' : '#991B1B' }}>
                                {data.is_open ? '🟢 المطعم مفتوح' : '🔴 المطعم مغلق'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '0.2rem' }}>
                                {data.is_open
                                    ? 'العملاء يستطيعون تصفح القائمة وتقديم الطلبات'
                                    : 'سيظهر للعملاء أن المطعم مغلق حاليًا'}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Save Button ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                    <button
                        type="submit"
                        disabled={processing}
                        style={{
                            background: processing ? '#D1D5DB' : GOLD,
                            color: '#fff',
                            border: 'none',
                            padding: '0.85rem 2.5rem',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '1rem',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            boxShadow: processing ? 'none' : '0 4px 14px rgba(201,168,76,0.35)',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                        }}
                    >
                        {processing ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
