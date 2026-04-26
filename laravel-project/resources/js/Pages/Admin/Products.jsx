import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';

const GOLD = '#C9A84C';
const GOLD_H = '#B8942F';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const pageStyles = `
.admin-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.admin-title { font-size: 1.8rem; font-weight: 700; }

.btn-primary { background: ${GOLD}; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; display: inline-flex; align-items: center; justify-content: center; }
.btn-primary:hover { background: ${GOLD_H}; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.table-container { background: ${SURF}; border-radius: 12px; border: 1px solid ${BORDER}; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.admin-table { width: 100%; border-collapse: collapse; text-align: right; }
.admin-table th { padding: 1rem 1.5rem; background: #faf9f6; font-weight: 600; color: ${MUTED}; border-bottom: 1px solid ${BORDER}; font-size: 0.9rem; }
.admin-table td { padding: 1rem 1.5rem; border-bottom: 1px solid ${BORDER}; vertical-align: middle; }

.status-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
.status-badge--available { background: #E8F5E9; color: #2E7D32; }
.status-badge--unavailable { background: #FFEBEE; color: #C62828; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 2rem; }
.modal { background: ${SURF}; border-radius: 16px; width: 100%; max-width: 850px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.2); animation: modal-slide 0.3s ease-out; }
@keyframes modal-slide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid ${BORDER}; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 2rem; overflow-y: auto; flex: 1; }
.modal-footer { padding: 1.25rem 2rem; border-top: 1px solid ${BORDER}; background: #fafafa; display: flex; justify-content: flex-end; gap: 1rem; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.form-group { margin-bottom: 0; }
.form-group--full { grid-column: span 2; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 700; color: ${TEXT}; font-size: 0.9rem; }
.form-input, .form-select, .form-textarea { width: 100%; padding: 0.75rem 1rem; border: 1.5px solid ${BORDER}; border-radius: 8px; font-family: inherit; font-size: 1rem; outline: none; transition: all 0.2s; background: #fff; }
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: ${GOLD}; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
.form-textarea { resize: vertical; min-height: 80px; }
.form-error { color: #e74c3c; font-size: 0.8rem; margin-top: 0.4rem; font-weight: 600; }

.section-title { grid-column: span 2; font-size: 1rem; font-weight: 800; color: ${GOLD_H}; margin-top: 1rem; margin-bottom: 0.5rem; padding-bottom: 0.4rem; border-bottom: 2px solid rgba(201,168,76,0.1); display: flex; align-items: center; gap: 0.5rem; }

/* EXTRAS GRID */
.extras-selection { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
.extra-card { border: 1.5px solid ${BORDER}; border-radius: 10px; padding: 0.75rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s; background: #fff; }
.extra-card:hover { border-color: ${GOLD}; background: rgba(201,168,76,0.02); }
.extra-card.selected { border-color: ${GOLD}; background: rgba(201,168,76,0.05); }
.extra-card input { width: 18px; height: 18px; cursor: pointer; accent-color: ${GOLD}; }
.extra-info { flex: 1; }
.extra-name { display: block; font-weight: 700; font-size: 0.85rem; }
.extra-price { display: block; font-size: 0.75rem; color: ${GOLD_H}; font-weight: 600; }

/* TOGGLE SWITCH */
.toggle { position: relative; display: inline-block; width: 50px; height: 26px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: #22C55E; }
input:checked + .slider:before { transform: translateX(24px); }

@media (max-width: 768px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-group--full, .section-title { grid-column: span 1; }
    .extras-selection { grid-template-columns: 1fr 1fr; }
}

/* TOAST */
.toast-wrap { position: fixed; top: 2rem; left: 50%; transform: translateX(-50%); z-index: 2000; }
.toast { background: ${TEXT}; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); font-weight: 700; display: flex; align-items: center; gap: 0.75rem; animation: toast-in 0.3s ease-out; }
@keyframes toast-in { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

export default function Products({ products, categories, extras }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [toast, setToast] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        category_id: '',
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        price: '',
        image_path: '',
        is_available: true,
        extra_ids: []
    });

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
    };

    const openModal = (product = null) => {
        clearErrors();
        if (product) {
            setEditingProduct(product);
            setData({
                category_id: product.category_id,
                name_ar: product.name_ar,
                name_en: product.name_en,
                description_ar: product.description_ar || '',
                description_en: product.description_en || '',
                price: product.price,
                image_path: product.image_path || '',
                is_available: !!product.is_available,
                extra_ids: product.addons.map(a => a.id)
            });
        } else {
            setEditingProduct(null);
            reset();
            setData('category_id', categories[0]?.id || '');
        }
        setIsModalOpen(true);
    };

    const handleExtraToggle = (id) => {
        const ids = data.extra_ids.includes(id)
            ? data.extra_ids.filter(x => x !== id)
            : [...data.extra_ids, id];
        setData('extra_ids', ids);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsModalOpen(false);
                showToast(editingProduct ? 'تم تحديث المنتج بنجاح ✅' : 'تم إضافة المنتج بنجاح ✅');
            },
            onError: () => {
                showToast('حدث خطأ أثناء الحفظ ❌', 'error');
            }
        };

        if (editingProduct) {
            put(`/admin/products/${editingProduct.id}`, options);
        } else {
            post('/admin/products', options);
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            router.delete(`/admin/products/${id}`, {
                onSuccess: () => showToast('تم حذف المنتج بنجاح ✅')
            });
        }
    };

    return (
        <AdminLayout title="إدارة المنتجات">
            <style>{pageStyles}</style>

            {toast && (
                <div className="toast-wrap">
                    <div className="toast" style={{ background: toast.type === 'error' ? '#C62828' : '#1A1714' }}>
                        {toast.msg}
                    </div>
                </div>
            )}

            <div className="admin-title-row">
                <h1 className="admin-title">قائمة المنتجات</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <a href="/admin/products/export" className="btn-primary" style={{ background: '#eee', color: TEXT }}>تصدير CSV</a>
                    <button className="btn-primary" onClick={() => openModal()}>إضافة منتج جديد +</button>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>الصورة</th>
                            <th>المنتج</th>
                            <th>التصنيف</th>
                            <th>السعر</th>
                            <th>الحالة</th>
                            <th>الإضافات</th>
                            <th style={{ width: '150px' }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    {product.image_path ? (
                                        <img src={product.image_path} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: `1px solid ${BORDER}` }} />
                                    ) : (
                                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifySelf: 'center', fontSize: '1.2rem' }}>🍽️</div>
                                    )}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{product.name_ar}</div>
                                    <div style={{ fontSize: '0.8rem', color: MUTED }}>{product.name_en}</div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600 }}>{product.category?.name_ar}</span>
                                </td>
                                <td>
                                    <span style={{ color: GOLD, fontWeight: 800, fontSize: '1.1rem' }}>{parseFloat(product.price).toFixed(2)}</span>
                                    <small style={{ color: MUTED, marginRight: '0.2rem' }}>ر.س</small>
                                </td>
                                <td>
                                    <span className={`status-badge ${product.is_available ? 'status-badge--available' : 'status-badge--unavailable'}`}>
                                        {product.is_available ? 'متاح' : 'غير متاح'}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: MUTED }}>{product.addons.length} إضافات</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => openModal(product)}>تعديل</button>
                                        <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#FFEBEE', color: '#C62828' }} onClick={() => handleDelete(product.id)}>حذف</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ fontWeight: 800 }}>{editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: MUTED }}>&times;</button>
                        </div>
                        
                        <div className="modal-body">
                            <form id="product-form" onSubmit={handleSubmit} className="form-grid">
                                
                                <div className="section-title">📦 البيانات الأساسية</div>
                                
                                <div className="form-group">
                                    <label className="form-label">الاسم بالعربية <span style={{ color: 'red' }}>*</span></label>
                                    <input className="form-input" value={data.name_ar} onChange={e => setData('name_ar', e.target.value)} placeholder="مثلاً: برجر كلاسيك" />
                                    {errors.name_ar && <div className="form-error">{errors.name_ar}</div>}
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">الاسم بالإنجليزية <span style={{ color: 'red' }}>*</span></label>
                                    <input className="form-input" value={data.name_en} onChange={e => setData('name_en', e.target.value)} placeholder="e.g. Classic Burger" style={{ direction: 'ltr' }} />
                                    {errors.name_en && <div className="form-error">{errors.name_en}</div>}
                                </div>

                                <div className="section-title">📝 وصف المنتج</div>

                                <div className="form-group">
                                    <label className="form-label">الوصف بالعربية</label>
                                    <textarea className="form-textarea" value={data.description_ar} onChange={e => setData('description_ar', e.target.value)} placeholder="وصف تفصيلي للمنتج..." />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">الوصف بالإنجليزية</label>
                                    <textarea className="form-textarea" value={data.description_en} onChange={e => setData('description_en', e.target.value)} placeholder="Detailed description..." style={{ direction: 'ltr' }} />
                                </div>

                                <div className="section-title">💰 السعر والتوفر</div>

                                <div className="form-group">
                                    <label className="form-label">التصنيف <span style={{ color: 'red' }}>*</span></label>
                                    <select className="form-select" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name_ar} ({c.name_en})</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <div className="form-error">{errors.category_id}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">السعر (ر.س) <span style={{ color: 'red' }}>*</span></label>
                                    <input type="number" step="0.01" className="form-input" value={data.price} onChange={e => setData('price', e.target.value)} placeholder="0.00" />
                                    {errors.price && <div className="form-error">{errors.price}</div>}
                                </div>

                                <div className="form-group--full">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '10px' }}>
                                        <label className="toggle">
                                            <input type="checkbox" checked={data.is_available} onChange={e => setData('is_available', e.target.checked)} />
                                            <span className="slider"></span>
                                        </label>
                                        <div>
                                            <div style={{ fontWeight: 800 }}>حالة التوفر</div>
                                            <div style={{ fontSize: '0.8rem', color: MUTED }}>هل المنتج متاح للطلب الآن؟</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="section-title">🖼️ صورة المنتج</div>

                                <div className="form-group--full">
                                    <label className="form-label">رابط الصورة (URL)</label>
                                    <input className="form-input" value={data.image_path} onChange={e => setData('image_path', e.target.value)} placeholder="https://..." />
                                </div>

                                <div className="section-title">✨ الإضافات (Extras)</div>

                                <div className="form-group--full">
                                    {extras.length > 0 ? (
                                        <div className="extras-selection">
                                            {extras.map(extra => (
                                                <div 
                                                    key={extra.id} 
                                                    className={`extra-card ${data.extra_ids.includes(extra.id) ? 'selected' : ''}`}
                                                    onClick={() => handleExtraToggle(extra.id)}
                                                >
                                                    <input type="checkbox" checked={data.extra_ids.includes(extra.id)} readOnly />
                                                    <div className="extra-info">
                                                        <span className="extra-name">{extra.name_ar}</span>
                                                        <span className="extra-price">{parseFloat(extra.price).toFixed(2)} ر.س</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '10px', color: MUTED }}>لا توجد إضافات متاحة</div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary" style={{ background: '#eee', color: TEXT }} onClick={() => setIsModalOpen(false)}>إلغاء</button>
                            <button type="submit" form="product-form" className="btn-primary" disabled={processing}>
                                {processing ? 'جاري الحفظ...' : 'حفظ المنتج'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
