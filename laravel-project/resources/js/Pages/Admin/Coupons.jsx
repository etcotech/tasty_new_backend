import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.06)';

const css = `
.coupon-card { background: ${SURF}; border-radius: 16px; border: 1px solid ${BORDER}; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 1.5rem; }
.coupon-title { font-size: 1.5rem; font-weight: 800; color: ${TEXT}; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.btn-primary { background: ${GOLD}; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; font-size: 0.95rem; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(201, 168, 76, 0.3); }
.btn-outline { background: transparent; color: ${MUTED}; border: 1px solid ${BORDER}; padding: 0.6rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
.btn-outline:hover { background: #f8f9fa; border-color: ${MUTED}; }
.table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.table th { text-align: right; padding: 1.2rem 1rem; border-bottom: 2px solid ${BORDER}; color: ${MUTED}; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
.table td { padding: 1.2rem 1rem; border-bottom: 1px solid ${BORDER}; vertical-align: middle; }
.badge { padding: 0.4rem 0.8rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
.badge-active { background: rgba(46, 204, 113, 0.1); color: #2ECC71; }
.badge-inactive { background: rgba(231, 76, 60, 0.1); color: #E74C3C; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal-content { background: white; padding: 2.5rem; border-radius: 24px; width: 100%; max-width: 600px; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; font-size: 0.9rem; font-weight: 700; color: ${TEXT}; margin-bottom: 0.5rem; }
.form-input { width: 100%; padding: 0.8rem 1rem; border-radius: 12px; border: 1.5px solid ${BORDER}; font-family: inherit; font-size: 1rem; transition: all 0.2s; outline: none; }
.form-input:focus { border-color: ${GOLD}; box-shadow: 0 0 0 4px rgba(201, 168, 76, 0.1); }
.error-text { color: #E74C3C; font-size: 0.8rem; margin-top: 0.4rem; font-weight: 600; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
`;

export default function Coupons({ coupons }) {
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id: '',
        code: '',
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: 0,
        max_discount_amount: '',
        usage_limit: '',
        per_customer_limit: '',
        starts_at: '',
        expires_at: '',
        applies_to: 'all_orders',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setShowModal(true);
    };

    const openEditModal = (coupon) => {
        setData({
            id: coupon.id,
            code: coupon.code,
            name: coupon.name || '',
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_order_amount: coupon.min_order_amount,
            max_discount_amount: coupon.max_discount_amount || '',
            usage_limit: coupon.usage_limit || '',
            per_customer_limit: coupon.per_customer_limit || '',
            starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : '',
            expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
            applies_to: coupon.applies_to,
            is_active: !!coupon.is_active,
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('admin.coupons.update', data.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        } else {
            post(route('admin.coupons.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
            destroy(route('admin.coupons.destroy', id));
        }
    };

    return (
        <AdminLayout title="إدارة الكوبونات">
            <style>{css}</style>
            <Head title="إدارة الكوبونات" />

            <div className="coupon-card">
                <div className="coupon-title">
                    إدارة كوبونات الخصم
                    <button className="btn-primary" onClick={openCreateModal}>
                        <span>+</span> إضافة كوبون جديد
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>الكود</th>
                                <th>الخصم</th>
                                <th>الحد الأدنى</th>
                                <th>الاستخدام</th>
                                <th>الحالة</th>
                                <th>تاريخ الانتهاء</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon.id}>
                                    <td style={{ fontWeight: 800, color: GOLD }}>{coupon.code}</td>
                                    <td>
                                        {coupon.discount_value} {coupon.discount_type === 'percentage' ? '%' : 'ر.س'}
                                    </td>
                                    <td>{coupon.min_order_amount} ر.س</td>
                                    <td>
                                        {coupon.usage_count} / {coupon.usage_limit || '∞'}
                                    </td>
                                    <td>
                                        <span className={`badge ${coupon.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                            {coupon.is_active ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </td>
                                    <td>
                                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('ar-SA') : 'بدون انتهاء'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-outline" onClick={() => openEditModal(coupon)}>تعديل</button>
                                            <button className="btn-outline" style={{ color: '#E74C3C' }} onClick={() => handleDelete(coupon.id)}>
                                                {coupon.usage_count > 0 ? 'تعطيل' : 'حذف'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>
                                        لا توجد كوبونات حالياً. ابدأ بإضافة كوبون جديد.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>{editMode ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">كود الكوبون</label>
                                    <input
                                        className="form-input"
                                        placeholder="مثال: WELCOME10"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value.toUpperCase().replace(/\s/g, ''))}
                                        required
                                    />
                                    {errors.code && <div className="error-text">{errors.code}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">الاسم (اختياري)</label>
                                    <input
                                        className="form-input"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">نوع الخصم</label>
                                    <select
                                        className="form-input"
                                        value={data.discount_type}
                                        onChange={e => setData('discount_type', e.target.value)}
                                    >
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (ر.س)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">قيمة الخصم</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={data.discount_value}
                                        onChange={e => setData('discount_value', e.target.value)}
                                        required
                                    />
                                    {errors.discount_value && <div className="error-text">{errors.discount_value}</div>}
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">الحد الأدنى للطلب</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={data.min_order_amount}
                                        onChange={e => setData('min_order_amount', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">أقصى مبلغ للخصم (للمئوي)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={data.max_discount_amount}
                                        onChange={e => setData('max_discount_amount', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">إجمالي عدد مرات الاستخدام</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={data.usage_limit}
                                        onChange={e => setData('usage_limit', e.target.value)}
                                        placeholder="اتركه فارغاً لغير محدود"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">حد الاستخدام لكل عميل</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={data.per_customer_limit}
                                        onChange={e => setData('per_customer_limit', e.target.value)}
                                        placeholder="اتركه فارغاً لغير محدود"
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">تاريخ البدء</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={data.starts_at}
                                        onChange={e => setData('starts_at', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">تاريخ الانتهاء</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={data.expires_at}
                                        onChange={e => setData('expires_at', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">ينطبق على</label>
                                    <select
                                        className="form-input"
                                        value={data.applies_to}
                                        onChange={e => setData('applies_to', e.target.value)}
                                    >
                                        <option value="all_orders">جميع الطلبات</option>
                                        <option value="dine_in">داخل المطعم</option>
                                        <option value="takeaway">سفري</option>
                                        <option value="car_pickup">استلام من السيارة</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.5rem', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        id="is_active"
                                    />
                                    <label htmlFor="is_active" className="form-label" style={{ marginBottom: 0 }}>الكوبون نشط</label>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary" disabled={processing}>
                                    {processing ? 'جاري الحفظ...' : 'حفظ الكوبون'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
