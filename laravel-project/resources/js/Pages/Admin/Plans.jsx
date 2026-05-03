import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';

export default function Plans({ plans }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name_ar: '',
        name_en: '',
        price: 0,
        billing_cycle: 'monthly',
        branches_limit: '',
        monthly_orders_limit: '',
        users_limit: '',
        allowed_order_types: ['dine_in', 'takeaway', 'car'],
        has_kds: false,
        has_qr: true,
        has_automation: false,
        has_smart_orders: false,
        has_ai_automation: false,
        reports_level: 'basic',
        is_active: true,
    });

    const openModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setData({
                name_ar: plan.name_ar,
                name_en: plan.name_en,
                price: plan.price,
                billing_cycle: plan.billing_cycle,
                branches_limit: plan.branches_limit || '',
                monthly_orders_limit: plan.monthly_orders_limit || '',
                users_limit: plan.users_limit || '',
                allowed_order_types: plan.allowed_order_types || [],
                has_kds: !!plan.has_kds,
                has_qr: !!plan.has_qr,
                has_automation: !!plan.has_automation,
                has_smart_orders: !!plan.has_smart_orders,
                has_ai_automation: !!plan.has_ai_automation,
                reports_level: plan.reports_level,
                is_active: !!plan.is_active,
            });
        } else {
            setEditingPlan(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingPlan) {
            put(`/admin/plans/${editingPlan.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/plans', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
            router.delete(`/admin/plans/${id}`);
        }
    };

    const toggleOrderType = (type) => {
        const types = [...data.allowed_order_types];
        if (types.includes(type)) {
            setData('allowed_order_types', types.filter(t => t !== type));
        } else {
            setData('allowed_order_types', [...types, type]);
        }
    };

    return (
        <AdminLayout title="إدارة الباقات">
            <style>{`
                .plans-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .btn-add { background: var(--gold); color: white; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s; }
                .btn-add:hover { opacity: 0.9; transform: translateY(-2px); }
                
                .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
                .plan-card { background: white; border-radius: 20px; padding: 2rem; border: 1px solid var(--border); transition: 0.3s; position: relative; }
                .plan-card:hover { border-color: var(--gold); box-shadow: 0 10px 30px rgba(201, 168, 76, 0.08); }
                
                .plan-status { position: absolute; top: 1.5rem; left: 1.5rem; padding: 0.4rem 0.8rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
                .status-active { background: rgba(46, 204, 113, 0.1); color: #27AE60; }
                .status-inactive { background: rgba(231, 76, 60, 0.1); color: #E74C3C; }
                
                .plan-name { font-size: 1.4rem; font-weight: 800; color: var(--text); margin-bottom: 0.5rem; }
                .plan-price { font-size: 2rem; font-weight: 800; color: var(--gold); margin-bottom: 1.5rem; }
                .plan-price span { font-size: 0.9rem; font-weight: 600; color: var(--muted); margin-right: 0.4rem; }
                
                .plan-features { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 2rem; border-top: 1px solid var(--border); padding-top: 1.5rem; }
                .feature-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: var(--muted); font-weight: 600; }
                .feature-icon { color: var(--gold); }
                .feature-disabled { opacity: 0.4; text-decoration: line-through; }
                
                .plan-actions { display: flex; gap: 1rem; }
                .btn-edit { flex: 1; background: #F8F9FA; border: 1px solid var(--border); padding: 0.7rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-edit:hover { background: var(--gold); color: white; border-color: var(--gold); }
                .btn-delete { background: rgba(231, 76, 60, 0.05); color: #E74C3C; border: 1px solid rgba(231, 76, 60, 0.1); padding: 0.7rem; border-radius: 10px; cursor: pointer; transition: 0.2s; }
                .btn-delete:hover { background: #E74C3C; color: white; }

                /* Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
                .modal-content { background: white; border-radius: 24px; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 2.5rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                label { font-weight: 700; font-size: 0.9rem; color: var(--text); }
                input, select, textarea { padding: 0.8rem 1.2rem; border-radius: 12px; border: 1px solid var(--border); font-family: inherit; font-size: 1rem; outline: none; }
                input:focus { border-color: var(--gold); }
                .error-text { color: #E74C3C; font-size: 0.8rem; font-weight: 600; }
                
                .checkbox-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-top: 0.5rem; }
                .check-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.8rem; border: 1px solid var(--border); border-radius: 12px; transition: 0.2s; }
                .check-item.active { border-color: var(--gold); background: rgba(201, 168, 76, 0.05); color: var(--gold); }
                
                .toggle-group { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem; padding: 1.5rem; background: #F9F9F9; border-radius: 16px; }
            `}</style>

            <div className="plans-header">
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '2rem' }}>إدارة باقات الاشتراك</h1>
                    <p style={{ color: 'var(--muted)', fontWeight: 600 }}>تحكم في المميزات والأسعار لكل باقة</p>
                </div>
                <button className="btn-add" onClick={() => openModal()}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة باقة جديدة
                </button>
            </div>

            <div className="plans-grid">
                {plans.map(plan => (
                    <div key={plan.id} className="plan-card">
                        <div className={`plan-status ${plan.is_active ? 'status-active' : 'status-inactive'}`}>
                            {plan.is_active ? 'نشطة' : 'غير نشطة'}
                        </div>
                        <h2 className="plan-name">{plan.name_ar}</h2>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{plan.name_en}</p>
                        
                        <div className="plan-price">
                            {plan.price} <span>رس / {plan.billing_cycle === 'monthly' ? 'شهرياً' : 'سنوياً'}</span>
                        </div>

                        <div className="plan-features">
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                فروع: {plan.branches_limit || 'غير محدود'}
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                طلبات شهرية: {plan.monthly_orders_limit || 'غير محدود'}
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                مستخدمين: {plan.users_limit || 'غير محدود'}
                            </div>
                            <div className={`feature-item ${!plan.has_kds ? 'feature-disabled' : ''}`}>
                                <span className="feature-icon">{plan.has_kds ? '✓' : '✕'}</span>
                                شاشة المطبخ (KDS)
                            </div>
                            <div className={`feature-item ${!plan.has_qr ? 'feature-disabled' : ''}`}>
                                <span className="feature-icon">{plan.has_qr ? '✓' : '✕'}</span>
                                رموز QR
                            </div>
                            <div className={`feature-item ${!plan.has_automation ? 'feature-disabled' : ''}`}>
                                <span className="feature-icon">{plan.has_automation ? '✓' : '✕'}</span>
                                نظام الأتمتة
                            </div>
                            <div className={`feature-item ${!plan.has_smart_orders ? 'feature-disabled' : ''}`}>
                                <span className="feature-icon">{plan.has_smart_orders ? '✓' : '✕'}</span>
                                الطلبات الذكية
                            </div>
                            <div className={`feature-item ${!plan.has_ai_automation ? 'feature-disabled' : ''}`}>
                                <span className="feature-icon">{plan.has_ai_automation ? '✓' : '✕'}</span>
                                الأتمتة والذكاء الاصطناعي
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                مستوى التقارير: {plan.reports_level === 'pro' ? 'احترافي' : plan.reports_level === 'advanced' ? 'متقدم' : 'أساسي'}
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                المطاعم المشتركة: {plan.subscriptions_count}
                            </div>
                        </div>

                        <div className="plan-actions">
                            <button className="btn-edit" onClick={() => openModal(plan)}>تعديل</button>
                            <button 
                                className="btn-delete" 
                                onClick={() => handleDelete(plan.id)}
                                disabled={plan.subscriptions_count > 0}
                                title={plan.subscriptions_count > 0 ? "لا يمكن حذف باقة مرتبطة بمطاعم" : ""}
                            >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 style={{ fontWeight: 800 }}>{editingPlan ? 'تعديل الباقة' : 'إضافة باقة جديدة'}</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>اسم الباقة (عربي)</label>
                                    <input value={data.name_ar} onChange={e => setData('name_ar', e.target.value)} required />
                                    {errors.name_ar && <span className="error-text">{errors.name_ar}</span>}
                                </div>
                                <div className="form-group">
                                    <label>اسم الباقة (إنجليزي)</label>
                                    <input value={data.name_en} onChange={e => setData('name_en', e.target.value)} required />
                                    {errors.name_en && <span className="error-text">{errors.name_en}</span>}
                                </div>
                                <div className="form-group">
                                    <label>السعر</label>
                                    <input type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} required />
                                    {errors.price && <span className="error-text">{errors.price}</span>}
                                </div>
                                <div className="form-group">
                                    <label>دورة الفوترة</label>
                                    <select value={data.billing_cycle} onChange={e => setData('billing_cycle', e.target.value)}>
                                        <option value="monthly">شهرياً</option>
                                        <option value="yearly">سنوياً</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>حد الفروع (فارغ لغير محدود)</label>
                                    <input type="number" value={data.branches_limit} onChange={e => setData('branches_limit', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>حد الطلبات الشهري (فارغ لغير محدود)</label>
                                    <input type="number" value={data.monthly_orders_limit} onChange={e => setData('monthly_orders_limit', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>مستوى التقارير</label>
                                    <select value={data.reports_level} onChange={e => setData('reports_level', e.target.value)}>
                                        <option value="basic">أساسي</option>
                                        <option value="advanced">متقدم</option>
                                        <option value="pro">احترافي</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ justifyContent: 'center' }}>
                                    <label className="check-item active" style={{ cursor: 'pointer' }}>
                                        <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                        باقة نشطة
                                    </label>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>أنواع الطلبات المسموح بها</label>
                                <div className="checkbox-grid">
                                    <div className={`check-item ${data.allowed_order_types.includes('dine_in') ? 'active' : ''}`} onClick={() => toggleOrderType('dine_in')}>طلبات الطاولة</div>
                                    <div className={`check-item ${data.allowed_order_types.includes('takeaway') ? 'active' : ''}`} onClick={() => toggleOrderType('takeaway')}>الاستلام</div>
                                    <div className={`check-item ${data.allowed_order_types.includes('car') ? 'active' : ''}`} onClick={() => toggleOrderType('car')}>طلبات السيارة</div>
                                </div>
                            </div>

                            <label>المميزات الإضافية</label>
                            <div className="toggle-group">
                                <label className="check-item active">
                                    <input type="checkbox" checked={data.has_kds} onChange={e => setData('has_kds', e.target.checked)} />
                                    شاشة المطبخ (KDS)
                                </label>
                                <label className="check-item active">
                                    <input type="checkbox" checked={data.has_qr} onChange={e => setData('has_qr', e.target.checked)} />
                                    رموز QR
                                </label>
                                <label className="check-item active">
                                    <input type="checkbox" checked={data.has_automation} onChange={e => setData('has_automation', e.target.checked)} />
                                    نظام الأتمتة
                                </label>
                                <label className="check-item active">
                                    <input type="checkbox" checked={data.has_smart_orders} onChange={e => setData('has_smart_orders', e.target.checked)} />
                                    الطلبات الذكية
                                </label>
                                <label className="check-item active">
                                    <input type="checkbox" checked={data.has_ai_automation} onChange={e => setData('has_ai_automation', e.target.checked)} />
                                    الأتمتة والذكاء الاصطناعي
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                                <button type="submit" className="btn-add" style={{ flex: 1 }} disabled={processing}>
                                    {editingPlan ? 'حفظ التعديلات' : 'إنشاء الباقة'}
                                </button>
                                <button type="button" onClick={closeModal} className="btn-edit" style={{ flex: 0.3 }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
