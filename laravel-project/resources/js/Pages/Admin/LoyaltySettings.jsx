import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const GOLD = '#C9A84C';

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

export default function LoyaltySettings({ restaurant }) {
    const [toast, setToast] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        points_enabled: restaurant?.points_enabled ?? false,
        cashback_enabled: restaurant?.cashback_enabled ?? false,
        points_rate: restaurant?.points_rate ?? 10,
        cashback_percentage: restaurant?.cashback_percentage ?? 5,
        min_order_amount: restaurant?.min_order_amount ?? 0,
        point_value: restaurant?.point_value ?? 10,
        min_points_to_redeem: restaurant?.min_points_to_redeem ?? 100,
        points_redeem_value: restaurant?.points_redeem_value ?? 10,
        min_cashback_to_redeem: restaurant?.min_cashback_to_redeem ?? 10,
        max_wallet_discount_percentage: restaurant?.max_wallet_discount_percentage ?? 30,
        min_order_amount_for_wallet_redeem: restaurant?.min_order_amount_for_wallet_redeem ?? 50,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.loyalty-settings.update'), {
            onSuccess: () => {
                setToast({ message: 'تم حفظ إعدادات الولاء بنجاح ✅', type: 'success' });
            },
            onError: () => {
                setToast({ message: 'حدث خطأ أثناء الحفظ ❌', type: 'error' });
            }
        });
    };

    return (
        <AdminLayout title="إعدادات الولاء والكاش باك">
            <Head title="إعدادات الولاء والكاش باك" />
            <style>{toastStyles}</style>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#111827', margin: 0 }}>الولاء والكاش باك</h1>
                <p style={{ color: '#6B7280', marginTop: '0.3rem', fontSize: '0.9rem' }}>إدارة برامج النقاط والمكافآت وقواعد استبدال الرصيد</p>
            </div>

            <form onSubmit={submit}>
                <Card>
                    <SectionTitle>🎁 تفعيل البرامج</SectionTitle>
                    <div style={GRID2}>
                        <Field label="تفعيل نظام النقاط" error={errors.points_enabled}>
                            <select style={inputStyle} value={data.points_enabled} onChange={e => setData('points_enabled', e.target.value === 'true')}>
                                <option value="false">معطل</option>
                                <option value="true">مفعل</option>
                            </select>
                        </Field>
                        <Field label="تفعيل الكاش باك" error={errors.cashback_enabled}>
                            <select style={inputStyle} value={data.cashback_enabled} onChange={e => setData('cashback_enabled', e.target.value === 'true')}>
                                <option value="false">معطل</option>
                                <option value="true">مفعل</option>
                            </select>
                        </Field>
                    </div>
                </Card>

                <Card>
                    <SectionTitle>⚙️ إعدادات الاكتساب</SectionTitle>
                    <div style={GRID2}>
                        <Field label="معدل اكتساب النقاط" hint="مثال: 10 يعني نقطة لكل 10 ريال" error={errors.points_rate}>
                            <TextInput type="number" step="1" value={data.points_rate} onChange={e => setData('points_rate', e.target.value)} />
                        </Field>
                        <Field label="نسبة الكاش باك (%)" hint="مثال: 5 يعني 5% من قيمة الطلب" error={errors.cashback_percentage}>
                            <TextInput type="number" step="0.1" value={data.cashback_percentage} onChange={e => setData('cashback_percentage', e.target.value)} />
                        </Field>
                    </div>

                    <div style={{ ...GRID2, marginTop: '1.25rem' }}>
                        <Field label="الحد الأدنى للطلب (للمكافآت)" hint="لن يتم احتساب النقاط للطلبات أقل من هذا المبلغ" error={errors.min_order_amount}>
                            <TextInput type="number" step="0.5" value={data.min_order_amount} onChange={e => setData('min_order_amount', e.target.value)} />
                        </Field>
                        <Field label="قيمة النقاط (الاسترداد)" hint="مثال: 10 يعني 100 نقطة = 10 ريال (استرداد لاحقاً)" error={errors.point_value}>
                            <TextInput type="number" step="0.5" value={data.point_value} onChange={e => setData('point_value', e.target.value)} />
                        </Field>
                    </div>
                </Card>

                <Card>
                    <SectionTitle>🔄 قواعد الاستبدال (Redemption Rules)</SectionTitle>
                    <div style={GRID2}>
                        <Field label="الحد الأدنى للنقاط للاستبدال" hint="مثال: 100 نقطة" error={errors.min_points_to_redeem}>
                            <TextInput type="number" step="1" value={data.min_points_to_redeem} onChange={e => setData('min_points_to_redeem', e.target.value)} />
                        </Field>
                        <Field label="قيمة النقاط عند الاستبدال" hint="القيمة المالية لعدد نقاط الاستبدال المذكورة أعلاه" error={errors.points_redeem_value}>
                            <TextInput type="number" step="0.5" value={data.points_redeem_value} onChange={e => setData('points_redeem_value', e.target.value)} />
                        </Field>
                    </div>

                    <div style={{ ...GRID2, marginTop: '1.25rem' }}>
                        <Field label="الحد الأدنى للكاش باك للاستبدال" hint="مثال: 10 ريال" error={errors.min_cashback_to_redeem}>
                            <TextInput type="number" step="0.5" value={data.min_cashback_to_redeem} onChange={e => setData('min_cashback_to_redeem', e.target.value)} />
                        </Field>
                        <Field label="أقصى نسبة خصم من المحفظة (%)" hint="أقصى نسبة يمكن خصمها من قيمة الطلب باستخدام المحفظة" error={errors.max_wallet_discount_percentage}>
                            <TextInput type="number" step="1" value={data.max_wallet_discount_percentage} onChange={e => setData('max_wallet_discount_percentage', e.target.value)} />
                        </Field>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                        <Field label="الحد الأدنى للطلب لاستخدام المحفظة" hint="المبلغ الذي يجب أن يصل إليه الطلب للسماح بالخصم من المحفظة" error={errors.min_order_amount_for_wallet_redeem}>
                            <TextInput type="number" step="0.5" value={data.min_order_amount_for_wallet_redeem} onChange={e => setData('min_order_amount_for_wallet_redeem', e.target.value)} />
                        </Field>
                    </div>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        disabled={processing}
                        style={{ background: processing ? '#D1D5DB' : GOLD, color: '#fff', border: 'none', padding: '0.85rem 2.5rem', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: processing ? 'not-allowed' : 'pointer', boxShadow: processing ? 'none' : '0 4px 14px rgba(201,168,76,0.35)', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    >
                        {processing ? 'جاري الحفظ...' : '💾 حفظ إعدادات الولاء'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
