import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, usePage } from '@inertiajs/react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const toastStyles = `
@keyframes svFadeInSlide {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes svFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

.admin-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.admin-title { font-size: 1.8rem; font-weight: 700; }

.btn-primary { background: ${GOLD}; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-family: inherit; }
.btn-primary:hover { opacity: 0.9; }

.table-container { background: ${SURF}; border-radius: 12px; border: 1px solid ${BORDER}; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.admin-table { width: 100%; border-collapse: collapse; text-align: right; }
.admin-table th { padding: 1rem 1.5rem; background: #faf9f6; font-weight: 600; color: ${MUTED}; border-bottom: 1px solid ${BORDER}; font-size: 0.9rem; }
.admin-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid ${BORDER}; vertical-align: middle; }

.badge { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge-success { background: rgba(34,197,94,0.1); color: #16a34a; }
.badge-danger { background: rgba(239,68,68,0.1); color: #dc2626; }

.btn-edit { color: ${GOLD}; background: none; border: none; cursor: pointer; font-weight: 600; margin-left: 1rem; font-family: inherit; }
.btn-delete { color: #e74c3c; background: none; border: none; cursor: pointer; font-weight: 600; font-family: inherit; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 1rem; }
.modal { background: ${SURF}; border-radius: 12px; width: 100%; max-width: 700px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid ${BORDER}; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 1.5rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
.form-group { margin-bottom: 1.2rem; }
.form-label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: ${MUTED}; font-size: 0.85rem; }
.form-input { width: 100%; padding: 0.75rem; border: 1px solid ${BORDER}; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: ${GOLD}; }
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

export default function Restaurants({ restaurants }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user.role === 'super_admin';
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [toast, setToast] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        slug: '',
        phone: '',
        address_ar: '',
        address_en: '',
        logo_url: '',
        hero_image_url: '',
        subtitle_ar: '',
        subtitle_en: '',
        tax_percentage: 8,
        currency: 'SAR',
        is_open: true,
        admin_name: '',
        admin_email: '',
        admin_password: ''
    });

    const openModal = (restaurant = null) => {
        if (restaurant) {
            setEditingRestaurant(restaurant);
            setFormData({
                name_ar: restaurant.name_ar,
                name_en: restaurant.name_en,
                slug: restaurant.slug,
                phone: restaurant.phone || '',
                address_ar: restaurant.address_ar || '',
                address_en: restaurant.address_en || '',
                logo_url: restaurant.logo_url || '',
                hero_image_url: restaurant.hero_image_url || '',
                subtitle_ar: restaurant.subtitle_ar || '',
                subtitle_en: restaurant.subtitle_en || '',
                tax_percentage: restaurant.tax_percentage,
                currency: restaurant.currency || 'SAR',
                is_open: !!restaurant.is_open
            });
        } else {
            setEditingRestaurant(null);
            setFormData({
                name_ar: '',
                name_en: '',
                slug: '',
                phone: '',
                address_ar: '',
                address_en: '',
                logo_url: '',
                hero_image_url: '',
                subtitle_ar: '',
                subtitle_en: '',
                tax_percentage: 8,
                currency: 'SAR',
                is_open: true,
                admin_name: '',
                admin_email: '',
                admin_password: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        
        const options = {
            onSuccess: () => {
                setProcessing(false);
                setIsModalOpen(false);
                setToast({ message: 'تم الحفظ بنجاح ✅', type: 'success' });
            },
            onError: () => {
                setProcessing(false);
                setToast({ message: 'حدث خطأ أثناء الحفظ ❌', type: 'error' });
            }
        };

        if (editingRestaurant) {
            router.put(`/admin/restaurants/${editingRestaurant.id}`, formData, options);
        } else {
            router.post('/admin/restaurants', formData, options);
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المطعم؟ سيتم حذف جميع البيانات المرتبطة به.')) {
            router.delete(`/admin/restaurants/${id}`, {
                onSuccess: () => setToast({ message: 'تم الحذف بنجاح ✅', type: 'success' })
            });
        }
    };

    return (
        <AdminLayout title="إدارة المطاعم">
            <style>{toastStyles}</style>

            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            <div className="admin-title-row">
                <h1 className="admin-title">المطاعم (Restaurants)</h1>
                {isSuperAdmin && (
                    <button className="btn-primary" onClick={() => openModal()}>إضافة مطعم جديد</button>
                )}
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>الرابط (Slug)</th>
                            <th>الجوال</th>
                            <th>الضريبة</th>
                            <th>الحالة</th>
                            <th>تاريخ الإنشاء</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.map(res => (
                            <tr key={res.id}>
                                <td>
                                    <div style={{ fontWeight: 700 }}>{res.name_ar}</div>
                                    <div style={{ fontSize: '0.8rem', color: MUTED }}>{res.name_en}</div>
                                </td>
                                <td><code>/{res.slug}</code></td>
                                <td>{res.phone || '-'}</td>
                                <td>{res.tax_percentage}%</td>
                                <td>
                                    <span className={`badge ${res.is_open ? 'badge-success' : 'badge-danger'}`}>
                                        {res.is_open ? 'مفتوح' : 'مغلق'}
                                    </span>
                                </td>
                                <td>{new Date(res.created_at).toLocaleDateString('ar-SA')}</td>
                                <td>
                                    {isSuperAdmin ? (
                                        <>
                                            <button className="btn-edit" onClick={() => openModal(res)}>تعديل</button>
                                            <button className="btn-delete" onClick={() => handleDelete(res.id)}>حذف</button>
                                        </>
                                    ) : (
                                        <button className="btn-edit" onClick={() => openModal(res)}>عرض التفاصيل</button>
                                    )}
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
                            <h2 className="modal-title">{editingRestaurant ? 'تعديل المطعم' : 'إضافة مطعم جديد'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">الاسم بالعربية *</label>
                                        <input className="form-input" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">الاسم بالإنجليزية *</label>
                                        <input className="form-input" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">الرابط الفريد (Slug) *</label>
                                        <input 
                                            className="form-input" 
                                            value={formData.slug} 
                                            onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
                                            placeholder="مثال: savor-restaurant"
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">رقم الجوال</label>
                                        <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">العنوان (عربي)</label>
                                        <input className="form-input" value={formData.address_ar} onChange={e => setFormData({ ...formData, address_ar: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Address (English)</label>
                                        <input className="form-input" value={formData.address_en} onChange={e => setFormData({ ...formData, address_en: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">الوصف الفرعي (عربي)</label>
                                        <input className="form-input" value={formData.subtitle_ar} onChange={e => setFormData({ ...formData, subtitle_ar: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subtitle (English)</label>
                                        <input className="form-input" value={formData.subtitle_en} onChange={e => setFormData({ ...formData, subtitle_en: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">رابط الشعار (Logo URL)</label>
                                        <input className="form-input" value={formData.logo_url} onChange={e => setFormData({ ...formData, logo_url: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">رابط الغلاف (Hero Image URL)</label>
                                        <input className="form-input" value={formData.hero_image_url} onChange={e => setFormData({ ...formData, hero_image_url: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">نسبة الضريبة (%) *</label>
                                        <input type="number" step="0.01" className="form-input" value={formData.tax_percentage} onChange={e => setFormData({ ...formData, tax_percentage: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">العملة *</label>
                                        <input className="form-input" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">حالة المطعم</label>
                                    <select className="form-input" value={formData.is_open ? '1' : '0'} onChange={e => setFormData({ ...formData, is_open: e.target.value === '1' })}>
                                        <option value="1">مفتوح (Open)</option>
                                        <option value="0">مغلق (Closed)</option>
                                    </select>
                                </div>

                                {!editingRestaurant && (
                                    <>
                                        <div style={{ borderTop: '1px solid #eee', margin: '1.5rem 0', paddingTop: '1rem' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>بيانات المدير (Admin Credentials)</h3>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">اسم المدير *</label>
                                            <input className="form-input" value={formData.admin_name} onChange={e => setFormData({ ...formData, admin_name: e.target.value })} required={!editingRestaurant} />
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">البريد الإلكتروني *</label>
                                                <input type="email" className="form-input" value={formData.admin_email} onChange={e => setFormData({ ...formData, admin_email: e.target.value })} required={!editingRestaurant} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">كلمة المرور *</label>
                                                <input type="password" className="form-input" value={formData.admin_password} onChange={e => setFormData({ ...formData, admin_password: e.target.value })} required={!editingRestaurant} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isSuperAdmin ? (
                                    <button type="submit" disabled={processing} className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin" style={{ width: '1.2rem', height: '1.2rem', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24">
                                                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                جاري الحفظ...
                                            </>
                                        ) : 'حفظ بيانات المطعم'}
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                                        إغلاق
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
