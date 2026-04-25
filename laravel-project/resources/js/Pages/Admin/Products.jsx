import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const pageStyles = `
.admin-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.admin-title { font-size: 1.8rem; font-weight: 700; }

.btn-primary { background: ${GOLD}; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-family: inherit; display: inline-flex; align-items: center; justify-content: center; }
.btn-primary:hover { opacity: 0.9; }

.table-container { background: ${SURF}; border-radius: 12px; border: 1px solid ${BORDER}; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.admin-table { width: 100%; border-collapse: collapse; text-align: right; }
.admin-table th { padding: 1rem 1.5rem; background: #faf9f6; font-weight: 600; color: ${MUTED}; border-bottom: 1px solid ${BORDER}; font-size: 0.9rem; }
.admin-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid ${BORDER}; vertical-align: middle; }

.btn-edit { color: ${GOLD}; background: none; border: none; cursor: pointer; font-weight: 600; margin-left: 1rem; font-family: inherit; }
.btn-delete { color: #e74c3c; background: none; border: none; cursor: pointer; font-weight: 600; font-family: inherit; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 1rem; }
.modal { background: ${SURF}; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid ${BORDER}; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 1.5rem; }

.form-group { margin-bottom: 1.2rem; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: ${MUTED}; }
.form-input, .form-select { width: 100%; padding: 0.75rem; border: 1px solid ${BORDER}; border-radius: 8px; font-family: inherit; font-size: 1rem; outline: none; transition: border-color 0.2s; background: #fff; }
.form-input:focus, .form-select:focus { border-color: ${GOLD}; }

.extras-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; max-height: 150px; overflow-y: auto; padding: 0.5rem; border: 1px solid ${BORDER}; border-radius: 8px; }
.extra-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
`;

export default function Products({ products, categories, extras }) {
    const [lang, setLang] = useState('ar');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        category_id: '',
        name_ar: '',
        name_en: '',
        price: '',
        image_path: '',
        extra_ids: []
    });

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                category_id: product.category_id,
                name_ar: product.name_ar,
                name_en: product.name_en,
                price: product.price,
                image_path: product.image_path || '',
                extra_ids: product.addons.map(a => a.id)
            });
        } else {
            setEditingProduct(null);
            setFormData({
                category_id: categories[0]?.id || '',
                name_ar: '',
                name_en: '',
                price: '',
                image_path: '',
                extra_ids: []
            });
        }
        setIsModalOpen(true);
    };

    const handleExtraToggle = (id) => {
        setFormData(prev => {
            const ids = prev.extra_ids.includes(id)
                ? prev.extra_ids.filter(x => x !== id)
                : [...prev.extra_ids, id];
            return { ...prev, extra_ids: ids };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProduct) {
            router.put(`/admin/products/${editingProduct.id}`, formData, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            router.post('/admin/products', formData, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            router.delete(`/admin/products/${id}`);
        }
    };

    return (
        <AdminLayout title="إدارة المنتجات">
            <style>{pageStyles}</style>

            <div className="admin-title-row">
                <h1 className="admin-title">المنتجات (Products)</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        style={{ background: 'none', border: `1px solid ${GOLD}`, color: GOLD, padding: '0.2rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                        onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
                    >
                        {lang === 'ar' ? 'English' : 'العربية'}
                    </button>
                    <a href="/admin/products/export-template" className="btn-primary" style={{ background: '#eee', color: TEXT, textDecoration: 'none', fontSize: '0.9rem' }}>قالب Excel</a>
                    <a href="/admin/products/export" className="btn-primary" style={{ background: '#eee', color: TEXT, textDecoration: 'none', fontSize: '0.9rem' }}>تصدير</a>
                    <label className="btn-primary" style={{ background: '#eee', color: TEXT, cursor: 'pointer', fontSize: '0.9rem' }}>
                        استيراد
                        <input type="file" hidden accept=".csv" onChange={e => {
                            if (e.target.files[0]) {
                                const formData = new FormData();
                                formData.append('file', e.target.files[0]);
                                router.post('/admin/products/import', formData, {
                                    onSuccess: () => alert('تم الاستيراد بنجاح'),
                                    onError: (errors) => alert(errors.file || 'حدث خطأ أثناء الاستيراد')
                                });
                            }
                        }} />
                    </label>
                    <button className="btn-primary" onClick={() => openModal()}>إضافة منتج جديد</button>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', border: `1px solid ${BORDER}`, borderRadius: '12px', fontSize: '0.85rem', color: MUTED }}>
                <strong>تعليمات الاستيراد:</strong> يجب أن يحتوي الملف على الأعمدة: <code>category_ar</code>, <code>name_ar</code>, <code>price</code> كحد أدنى. يدعم النظام اللغة العربية من ملفات Excel (UTF-8/Windows-1256).
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>الاسم</th>
                            <th>التصنيف</th>
                            <th>السعر</th>
                            <th>الإضافات</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    {product.image_path ? (
                                        <img src={product.image_path} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#eee' }}></div>
                                    )}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{product.name_ar}</div>
                                    <div style={{ fontSize: '0.85rem', color: MUTED }}>{product.name_en}</div>
                                </td>
                                <td>{product.category?.name_ar}</td>
                                <td style={{ color: GOLD, fontWeight: 700 }}>{parseFloat(product.price).toFixed(2)} ر.س</td>
                                <td style={{ fontSize: '0.85rem' }}>
                                    {product.addons.length} إضافات
                                </td>
                                <td>
                                    <button className="btn-edit" onClick={() => openModal(product)}>تعديل</button>
                                    <button className="btn-delete" onClick={() => handleDelete(product.id)}>حذف</button>
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
                            <h2 className="modal-title">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">الاسم بالعربية</label>
                                        <input className="form-input" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">الاسم بالإنجليزية</label>
                                        <input className="form-input" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">التصنيف</label>
                                        <select className="form-select" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                                            {categories.map(c => {
                                                const ar = c.name_ar;
                                                const en = c.name_en || ar;
                                                const label = lang === 'ar' ? `${ar} (${en})` : `${en} (${ar})`;
                                                return <option key={c.id} value={c.id}>{label}</option>;
                                            })}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">السعر</label>
                                        <input type="number" step="0.01" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">رابط الصورة (URL)</label>
                                    <input className="form-input" value={formData.image_path} onChange={e => setFormData({ ...formData, image_path: e.target.value })} placeholder="https://example.com/image.jpg" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">الإضافات المتاحة (Extras)</label>
                                    <div className="extras-grid">
                                        {extras.map(extra => (
                                            <label key={extra.id} className="extra-item">
                                                <input type="checkbox" checked={formData.extra_ids.includes(extra.id)} onChange={() => handleExtraToggle(extra.id)} />
                                                <span>{extra.name_ar}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>حفظ</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
