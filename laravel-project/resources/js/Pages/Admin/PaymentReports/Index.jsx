import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PaymentReportsIndex({ logs, stats, branches, filters }) {
    const [dateFrom, setDateFrom] = React.useState(filters.date_from || '');
    const [dateTo, setDateTo] = React.useState(filters.date_to || '');
    const [branchId, setBranchId] = React.useState(filters.branch_id || '');

    const handleFilter = () => {
        router.get('/admin/payment-reports', {
            date_from: dateFrom,
            date_to: dateTo,
            branch_id: branchId
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setBranchId('');
        router.get('/admin/payment-reports');
    };

    return (
        <AdminLayout title="تقارير مدفوعات Paymob">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>تقارير مدفوعات Paymob</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ color: '#6B6460', marginBottom: '0.5rem', fontWeight: 600 }}>إجمالي المدفوعات (الناجحة)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{parseFloat(stats.total_amount).toFixed(2)} ر.س</div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ color: '#6B6460', marginBottom: '0.5rem', fontWeight: 600 }}>إجمالي العمليات</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{stats.total_transactions}</div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ color: '#6B6460', marginBottom: '0.5rem', fontWeight: 600 }}>العمليات الفاشلة</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{stats.failed_transactions}</div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ color: '#6B6460', marginBottom: '0.5rem', fontWeight: 600 }}>بانتظار الدفع</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{stats.pending_transactions}</div>
                </div>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>تصفية</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                    <select value={branchId} onChange={e => setBranchId(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <option value="">كل الفروع</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleFilter} style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>تطبيق</button>
                        <button onClick={clearFilters} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 1rem', cursor: 'pointer' }}>مسح</button>
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                    <thead style={{ background: '#F8F9FA', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>الطلب</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>التاريخ</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>الحالة</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>المبلغ</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#6B6460' }}>رقم عملية Paymob</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>#{log.order?.order_number}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6B6460' }}>{log.branch ? log.branch.name_ar : 'الرئيسي'}</div>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(log.created_at).toLocaleString('en-US')}</td>
                                <td style={{ padding: '1rem' }}>
                                    {log.payment_status === 'paid' ? (
                                        <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>تم الدفع</span>
                                    ) : log.payment_status === 'failed' ? (
                                        <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>فشل</span>
                                    ) : (
                                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>بانتظار الدفع</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{parseFloat(log.amount).toFixed(2)} ر.س</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                    <div>{log.provider_transaction_id || '-'}</div>
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6B6460' }}>لا يوجد بيانات</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
