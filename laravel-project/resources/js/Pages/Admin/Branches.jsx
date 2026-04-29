import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const pageStyles = `
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

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 1rem; }
.modal { background: ${SURF}; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid ${BORDER}; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 1.5rem; }

.form-group { margin-bottom: 1.2rem; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: ${MUTED}; }
.form-input { width: 100%; padding: 0.75rem; border: 1px solid ${BORDER}; border-radius: 8px; font-family: inherit; font-size: 1rem; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: ${GOLD}; }

.badge { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.badge-active { background: #e6f7ed; color: #1e7e34; }
.badge-inactive { background: #fdf2f2; color: #9b1c1c; }
`;

export default function Branches({ branches, currentRestaurant }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({ 
        name_ar: '', 
        name_en: '', 
        phone: '', 
        address: '', 
        is_active: true 
    });

    const openModal = (branch = null) => {
        if (branch) {
            setEditingBranch(branch);
            setFormData({ 
                name_ar: branch.name_ar, 
                name_en: branch.name_en || '', 
                phone: branch.phone || '', 
                address: branch.address || '', 
                is_active: branch.is_active 
            });
        } else {
            setEditingBranch(null);
            setFormData({ 
                name_ar: '', 
                name_en: '', 
                phone: '', 
                address: '', 
                is_active: true 
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBranch) {
            router.put(`/admin/branches/${editingBranch.id}`, formData, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            router.post('/admin/branches', formData, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
            router.delete(`/admin/branches/${id}`);
        }
    };

    return (
        <AdminLayout title="إدارة الفروع">
            <style>{pageStyles}</style>

            <div className="admin-title-row">
                <h1 className="admin-title">إدارة الفروع - {currentRestaurant?.name}</h1>
                <button className="btn-primary" onClick={() => openModal()}>إضافة فرع جديد</button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>اسم الفرع (العربية)</th>
                            <th>عدد الطلبات</th>
                            <th>الهاتف</th>
                            <th>العنوان</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map(branch => (
                            <tr key={branch.id}>
                                <td>{branch.name_ar}</td>
                                <td style={{ fontWeight: 800, color: GOLD }}>{branch.orders_count || 0}</td>
                                <td>{branch.phone || '-'}</td>
                                <td>{branch.address || '-'}</td>
                                <td>
                                    <span className={`badge ${branch.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                        {branch.is_active ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-edit" onClick={() => openModal(branch)}>تعديل</button>
                                    <button className="btn-delete" onClick={() => handleDelete(branch.id)}>حذف</button>
                                </td>
                            </tr>
                        ))}
                        {branches.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: MUTED }}>لا توجد فروع مضافة حالياً.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">اسم الفرع (بالعربية)</label>
                                    <input className="form-input" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">اسم الفرع (بالإنجليزية - اختياري)</label>
                                    <input className="form-input" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">الهاتف</label>
                                    <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">العنوان</label>
                                    <input className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} id="is_active" />
                                    <label htmlFor="is_active" className="form-label" style={{ marginBottom: 0 }}>نشط</label>
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
