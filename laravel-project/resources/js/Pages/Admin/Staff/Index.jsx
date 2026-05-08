import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function StaffIndex({ staff, branches }) {
    const { data, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        name: '',
        phone: '',
        email: '',
        role: 'cashier',
        branch_id: '',
        employee_code: '',
        is_active: true
    });

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState(null);

    const openModal = (staffMember = null) => {
        clearErrors();
        if (staffMember) {
            setEditingId(staffMember.id);
            setData({
                name: staffMember.name,
                phone: staffMember.phone || '',
                email: staffMember.email || '',
                role: staffMember.role,
                branch_id: staffMember.branch_id || '',
                employee_code: staffMember.employee_code || '',
                is_active: staffMember.is_active
            });
        } else {
            setEditingId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(`/admin/staff/${editingId}`, {
                onSuccess: () => closeModal()
            });
        } else {
            post('/admin/staff', {
                onSuccess: () => closeModal()
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            destroy(`/admin/staff/${id}`);
        }
    };

    const toggleStatus = (staffMember) => {
        router.put(`/admin/staff/${staffMember.id}`, {
            ...staffMember,
            is_active: !staffMember.is_active
        });
    };

    const roleNames = {
        cashier: 'كاشير',
        manager: 'مدير',
        waiter: 'نادل',
        kitchen: 'مطبخ',
        delivery: 'توصيل'
    };

    return (
        <AdminLayout title="إدارة الموظفين">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1714' }}>إدارة الموظفين</h1>
                <button 
                    onClick={() => openModal()}
                    style={{ background: '#C9A84C', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + إضافة موظف
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                    <thead style={{ background: '#F8F9FA', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>الاسم</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>الدور</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>الفرع</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>الكود</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>الحالة</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map(member => (
                            <tr key={member.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6B6460' }}>{member.phone || '-'}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>{roleNames[member.role] || member.role}</td>
                                <td style={{ padding: '1rem' }}>{member.branch ? member.branch.name_ar : 'الكل'}</td>
                                <td style={{ padding: '1rem' }}>{member.employee_code || '-'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button 
                                        onClick={() => toggleStatus(member)}
                                        style={{ 
                                            background: member.is_active ? '#e6f4ea' : '#fce8e6', 
                                            color: member.is_active ? '#137333' : '#c5221f', 
                                            border: 'none', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {member.is_active ? 'نشط' : 'غير نشط'}
                                    </button>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button onClick={() => openModal(member)} style={{ background: 'transparent', border: 'none', color: '#3498db', cursor: 'pointer', marginLeft: '10px' }}>تعديل</button>
                                    <button onClick={() => handleDelete(member.id)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>حذف</button>
                                </td>
                            </tr>
                        ))}
                        {staff.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6B6460' }}>لا يوجد موظفين</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>{editingId ? 'تعديل موظف' : 'إضافة موظف'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الاسم</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} required />
                                {errors.name && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.name}</div>}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>رقم الجوال (اختياري)</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الكود التعريفي (اختياري)</label>
                                    <input type="text" value={data.employee_code} onChange={e => setData('employee_code', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الدور</label>
                                    <select value={data.role} onChange={e => setData('role', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                                        <option value="cashier">كاشير</option>
                                        <option value="manager">مدير</option>
                                        <option value="waiter">نادل</option>
                                        <option value="kitchen">مطبخ</option>
                                        <option value="delivery">توصيل</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الفرع (اختياري)</label>
                                    <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                                        <option value="">كل الفروع</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={closeModal} style={{ padding: '0.8rem 1.5rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>إلغاء</button>
                                <button type="submit" style={{ padding: '0.8rem 1.5rem', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
