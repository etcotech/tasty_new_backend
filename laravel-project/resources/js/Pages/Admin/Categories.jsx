import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';

const GOLD = '#C9A84C';
const BG = '#F7F5F0';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cairo:wght@400;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${BG}; font-family: 'Outfit', 'Cairo', sans-serif; color: ${TEXT}; }

.admin-layout { min-height: 100vh; display: flex; flex-direction: column; direction: rtl; }
.admin-header { background: ${SURF}; padding: 1rem 2rem; border-bottom: 1px solid ${BORDER}; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.admin-brand { font-size: 1.5rem; font-weight: 700; color: ${GOLD}; text-decoration: none; }

.admin-nav { display: flex; gap: 1.5rem; }
.admin-nav-link { text-decoration: none; color: ${MUTED}; font-weight: 600; font-size: 0.95rem; transition: color 0.2s; }
.admin-nav-link:hover, .admin-nav-link.active { color: ${GOLD}; }

.admin-content { padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
.admin-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.admin-title { font-size: 1.8rem; font-weight: 700; }

.btn-primary { background: ${GOLD}; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-family: inherit; }
.btn-primary:hover { opacity: 0.9; }

.table-container { background: ${SURF}; border-radius: 12px; border: 1px solid ${BORDER}; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.admin-table { width: 100%; border-collapse: collapse; text-align: right; }
.admin-table th { padding: 1rem 1.5rem; background: #faf9f6; font-weight: 600; color: ${MUTED}; border-bottom: 1px solid ${BORDER}; font-size: 0.9rem; }
.admin-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid ${BORDER}; vertical-align: middle; }

.btn-edit { color: ${GOLD}; background: none; border: none; cursor: pointer; font-weight: 600; margin-left: 1rem; font-family: inherit; }
.btn-delete { color: #e74c3c; background: none; border: none; cursor: pointer; font-weight: 600; font-family: inherit; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 1rem; }
.modal { background: ${SURF}; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid ${BORDER}; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 1.5rem; }

.form-group { margin-bottom: 1.2rem; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: ${MUTED}; }
.form-input { width: 100%; padding: 0.75rem; border: 1px solid ${BORDER}; border-radius: 8px; font-family: inherit; font-size: 1rem; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: ${GOLD}; }
`;

export default function Categories({ categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name_ar: '', name_en: '' });

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name_ar: category.name_ar, name_en: category.name_en });
        } else {
            setEditingCategory(null);
            setFormData({ name_ar: '', name_en: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            router.put(`/admin/categories/${editingCategory.id}`, formData, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            router.post('/admin/categories', formData, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            router.delete(`/admin/categories/${id}`);
        }
    };

    return (
        <div className="admin-layout">
            <Head title="إدارة التصنيفات | Categories" />
            <style>{css}</style>

            <header className="admin-header">
                <Link href="/admin/dashboard" className="admin-brand">لوحة القيادة</Link>
                <nav className="admin-nav">
                    <Link href="/admin/dashboard" className="admin-nav-link">الإحصائيات</Link>
                    <Link href="/admin/orders" className="admin-nav-link">الطلبات</Link>
                    <Link href="/admin/categories" className="admin-nav-link active">التصنيفات</Link>
                    <Link href="/admin/products" className="admin-nav-link">المنتجات</Link>
                    <Link href="/admin/extras" className="admin-nav-link">الإضافات</Link>
                </nav>
            </header>

            <main className="admin-content">
                <div className="admin-title-row">
                    <h1 className="admin-title">التصنيفات (Categories)</h1>
                    <button className="btn-primary" onClick={() => openModal()}>إضافة تصنيف جديد</button>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>الاسم (العربية)</th>
                                <th>الاسم (الإنجليزية)</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category.id}>
                                    <td>{category.name_ar}</td>
                                    <td>{category.name_en}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => openModal(category)}>تعديل</button>
                                        <button className="btn-delete" onClick={() => handleDelete(category.id)}>حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">الاسم بالعربية</label>
                                    <input className="form-input" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">الاسم بالإنجليزية</label>
                                    <input className="form-input" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} required />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>حفظ</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
