import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const pageStyles = `
.admin-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 1.5rem; }

.table-container { background: ${SURF}; border-radius: 12px; border: 1px solid ${BORDER}; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.admin-table { width: 100%; border-collapse: collapse; text-align: right; }
.admin-table th { padding: 1rem 1.5rem; background: #faf9f6; font-weight: 600; color: ${MUTED}; border-bottom: 1px solid ${BORDER}; font-size: 0.9rem; }
.admin-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid ${BORDER}; vertical-align: middle; }
.admin-table tbody tr:hover { background: rgba(0,0,0,0.01); }

.status-badge { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-block; }
.status-pending { background: #fff3e0; color: #e65100; }
.status-preparing { background: #e3f2fd; color: #1565c0; }
.status-ready { background: #f3e5f5; color: #6a1b9a; }
.status-completed { background: #e8f5e9; color: #2e7d32; }

.status-select { padding: 0.4rem; border-radius: 6px; border: 1px solid ${BORDER}; background: #fff; font-family: inherit; font-size: 0.9rem; cursor: pointer; color: ${TEXT}; margin-right: 1rem; }
.status-select:focus { outline: none; border-color: ${GOLD}; }

.btn-view { background: transparent; color: ${GOLD}; border: 1px solid ${GOLD}; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.btn-view:hover { background: ${GOLD}; color: #fff; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 1rem; }
.modal { background: ${SURF}; border-radius: 12px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid ${BORDER}; display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-weight: 700; font-size: 1.2rem; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${MUTED}; }
.modal-body { padding: 1.5rem; }

.order-detail-item { border: 1px solid ${BORDER}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.order-detail-top { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.5rem; }
.addon-list { margin-top: 0.5rem; padding-right: 1rem; border-right: 2px solid ${GOLD}; color: ${MUTED}; font-size: 0.9rem; }
.addon-row { display: flex; justify-content: space-between; margin-bottom: 0.2rem; }
`;

export default function Orders({ orders: initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const updateStatus = async (orderId, newStatus) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert('Failed to update status');
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ar-SA');
    };

    const statusOptions = {
        'pending': 'جديد (Pending)',
        'preparing': 'قيد التجهيز (Preparing)',
        'ready': 'جاهز (Ready)',
        'completed': 'مكتمل (Completed)'
    };

    return (
        <AdminLayout title="إدارة الطلبات">
            <style>{pageStyles}</style>

            <h1 className="admin-title">الطلبات (Orders)</h1>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>رقم الطلب (Order #)</th>
                            <th>النوع (Type)</th>
                            <th>المجموع (Total)</th>
                            <th>الحالة (Status)</th>
                            <th>الوقت (Time)</th>
                            <th>إجراءات (Actions)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 700 }}>{order.order_number}</td>
                                <td>
                                    {order.order_type === 'dine_in' ? 'داخل المطعم' : 
                                     order.order_type === 'takeaway' ? 'استلام' : 'في السيارة'}
                                </td>
                                <td style={{ color: GOLD, fontWeight: 700 }}>{parseFloat(order.total).toFixed(2)} ر.س</td>
                                <td>
                                    <span className={`status-badge status-${order.status}`}>
                                        {statusOptions[order.status]}
                                    </span>
                                    <select 
                                        className="status-select" 
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        disabled={isUpdating}
                                    >
                                        <option value="pending">جديد</option>
                                        <option value="preparing">تجهيز</option>
                                        <option value="ready">جاهز</option>
                                        <option value="completed">مكتمل</option>
                                    </select>
                                </td>
                                <td style={{ color: MUTED, fontSize: '0.9rem' }}>{formatDate(order.created_at)}</td>
                                <td>
                                    <button className="btn-view" onClick={() => setSelectedOrder(order)}>
                                        عرض التفاصيل
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>
                                    لا توجد طلبات حالياً
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* DETAILS MODAL */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">تفاصيل الطلب: {selectedOrder.order_number}</h2>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                                <div><strong>العميل:</strong> {selectedOrder.customer_name || '-'}</div>
                                <div><strong>الجوال:</strong> {selectedOrder.phone || '-'}</div>
                                {selectedOrder.order_type === 'dine_in' && <div><strong>الطاولة:</strong> {selectedOrder.table_number}</div>}
                                {selectedOrder.order_type === 'car' && <div><strong>السيارة:</strong> {selectedOrder.car_number}</div>}
                            </div>
                            
                            {selectedOrder.notes && (
                                <div style={{ marginBottom: '1.5rem', color: '#c0392b', fontWeight: 600 }}>
                                    ملاحظات: {selectedOrder.notes}
                                </div>
                            )}

                            <h3 style={{ marginBottom: '1rem' }}>المنتجات:</h3>
                            {selectedOrder.items.map(item => (
                                <div key={item.id} className="order-detail-item">
                                    <div className="order-detail-top">
                                        <span>{item.quantity}x {item.product_name_ar || item.product_name_en}</span>
                                        <span>{parseFloat(item.total_price).toFixed(2)} ر.س</span>
                                    </div>
                                    
                                    {item.addons && item.addons.length > 0 && (
                                        <div className="addon-list">
                                            {item.addons.map(addon => (
                                                <div key={addon.id} className="addon-row">
                                                    <span>+ {addon.addon_name_ar || addon.addon_name_en}</span>
                                                    <span>{parseFloat(addon.price).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
