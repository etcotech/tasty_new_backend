import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { usePage } from '@inertiajs/react';

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

.btn-print { background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem; font-family: inherit; transition: all 0.2s; }
.btn-print:hover { background: #e5e7eb; color: #111; }

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

const printOrder = (order, restaurant) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const subtotal = order.items.reduce((acc, item) => acc + parseFloat(item.total_price), 0);
    const taxPercentage = parseFloat(restaurant?.tax_percentage || 0);
    const taxAmount = (subtotal * (taxPercentage / 100));

    const itemsHtml = order.items?.map(item => `
        <div style="border-bottom: 1px dashed #eee; padding: 6px 0;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
                <span>${item.quantity}x ${item.product_name_ar || item.product_name_en}</span>
                <span>${parseFloat(item.total_price).toFixed(2)}</span>
            </div>
            ${item.addons?.map(a => `
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #444; padding-right: 15px;">
                    <span>+ ${a.addon_name_ar || a.addon_name_en}</span>
                    <span>${parseFloat(a.price).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
    `).join('') || '';

    const html = `
        <html dir="rtl">
        <head>
            <title>Receipt #${order.order_number}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
                body { font-family: 'Cairo', sans-serif; width: 72mm; padding: 4mm; color: #000; background: #fff; margin: 0; line-height: 1.4; }
                .header { text-align: center; margin-bottom: 10px; }
                .logo { max-width: 120px; max-height: 60px; object-fit: contain; margin-bottom: 5px; }
                .rest-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                .receipt-title { font-size: 14px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 0; margin: 5px 0; }
                
                .info-grid { font-size: 12px; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                
                .items { margin-bottom: 10px; }
                
                .totals { border-top: 1px solid #000; padding-top: 5px; font-size: 13px; }
                .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                .grand-total { font-size: 18px; font-weight: bold; margin-top: 5px; border-top: 2px double #000; padding-top: 5px; }
                
                .notes { background: #f9f9f9; padding: 5px; margin: 10px 0; font-size: 12px; border-right: 3px solid #000; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
                .qr-placeholder { border: 1px solid #ccc; width: 60px; height: 60px; margin: 10px auto; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #999; text-align: center; }
                
                @media print { 
                    body { width: 72mm; } 
                }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <div class="header">
                ${restaurant?.logo_url ? `<img src="${restaurant.logo_url}" class="logo" />` : ''}
                <div class="rest-name">${restaurant?.name_ar || restaurant?.name_en || 'CitySoft Restaurant'}</div>
                <div class="receipt-title">إيصال الطلب / Order Receipt</div>
            </div>

            <div class="info-grid">
                <div class="info-row"><span>رقم الطلب:</span> <b>#${order.order_number}</b></div>
                <div class="info-row"><span>التاريخ:</span> <span>${new Date(order.created_at).toLocaleString('ar-SA')}</span></div>
                <div class="info-row"><span>الفرع:</span> <b>${order.branch ? (order.branch.name_ar || order.branch.name_en) : 'الفرع الرئيسي'}</b></div>
                <div class="info-row"><span>النوع:</span> <b>${order.order_type === 'dine_in' ? '🍽️ محلي' : order.order_type === 'car' ? '🚗 سيارة' : '🥡 سفري'}</b></div>
                ${order.table_number ? `<div class="info-row"><span>الطاولة:</span> <b>${order.table_number}</b></div>` : ''}
                ${order.car_number ? `<div class="info-row"><span>السيارة:</span> <b>${order.car_number}</b></div>` : ''}
                ${order.customer_name ? `<div class="info-row"><span>العميل:</span> <span>${order.customer_name}</span></div>` : ''}
                ${order.phone ? `<div class="info-row"><span>الجوال:</span> <span>${order.phone}</span></div>` : ''}
            </div>

            <div class="items">
                ${itemsHtml}
            </div>

            ${order.notes ? `<div class="notes"><b>ملاحظات:</b> ${order.notes}</div>` : ''}

            <div class="totals">
                <div class="total-row"><span>المجموع الفرعي:</span> <span>${parseFloat(order.subtotal || subtotal).toFixed(2)} ر.س</span></div>
                
                ${order.discount_amount > 0 ? `
                    <div class="total-row" style="color: #c0392b; font-weight: bold;">
                        <span>الخصم (${order.coupon_code}):</span>
                        <span>-${parseFloat(order.discount_amount).toFixed(2)} ر.س</span>
                    </div>
                    <div class="total-row" style="border-top: 1px dashed #eee; padding-top: 3px; margin-top: 3px;">
                        <span>المبلغ بعد الخصم:</span>
                        <span>${(parseFloat(order.subtotal || subtotal) - parseFloat(order.discount_amount)).toFixed(2)} ر.س</span>
                    </div>
                ` : ''}

                <div class="total-row"><span>الضريبة (${taxPercentage}%):</span> <span>${parseFloat(order.tax || taxAmount).toFixed(2)} ر.س</span></div>
                <div class="grand-total total-row"><span>الإجمالي:</span> <span>${parseFloat(order.total).toFixed(2)} ر.س</span></div>
            </div>

            <div class="footer">
                <div>شكراً لك من مطعم ${restaurant?.name_ar || ''}</div>
                <div>نسعد بزيارتك مرة أخرى</div>
                <div class="qr-placeholder">QR للفاتورة الضريبية قريباً</div>
            </div>
        </body>
        </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
};

export default function Orders({ orders: initialOrders }) {
    const { auth, admin } = usePage().props;
    const currentRestaurant = admin?.current_restaurant;

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

    const recalculateRewards = async (orderId) => {
        if (!confirm('هل أنت متأكد من إعادة احتساب المكافآت لهذا الطلب؟ سيتم إضافة النقاط والكاش باك للعميل في حال لم يتم احتسابها مسبقاً.')) return;
        
        setIsUpdating(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/admin/orders/${orderId}/recalculate-rewards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            const data = await res.json();
            if (data.success) {
                alert(`تم بنجاح!\nالنقاط المضافة: ${data.earned.points || 0}\nالكاش باك: ${data.earned.cashback || 0} ر.س\nرصيد المحفظة الحالي: ${data.wallet_balance.points} نقطة و ${data.wallet_balance.cashback} ر.س`);
            } else {
                alert(data.message || 'فشل في إعادة الاحتساب');
            }
        } catch (e) {
            alert('خطأ في الشبكة');
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
                            {auth.user.role === 'super_admin' && <th>المطعم (Restaurant)</th>}
                            <th>الفرع (Branch)</th>
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
                                {auth.user.role === 'super_admin' && (
                                    <td style={{ fontWeight: 600, color: GOLD }}>{order.restaurant?.name_ar || 'N/A'}</td>
                                )}
                                <td>
                                    <span style={{ fontWeight: 600, color: MUTED }}>
                                        {order.branch ? (order.branch.name_ar || order.branch.name_en) : '-'}
                                    </span>
                                </td>
                                <td>
                                    {order.order_type === 'dine_in' ? 'داخل المطعم' : 
                                     order.order_type === 'takeaway' ? 'استلام' : 'في السيارة'}
                                </td>
                                <td style={{ color: GOLD, fontWeight: 700 }}>
                                    {parseFloat(order.total).toFixed(2)} ر.س
                                    {order.discount_amount > 0 && (
                                        <div style={{ fontSize: '0.7rem', color: '#c0392b', fontWeight: 600 }}>
                                            🎫 {order.coupon_code} (-{parseFloat(order.discount_amount).toFixed(2)})
                                        </div>
                                    )}
                                </td>
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
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-view" onClick={() => setSelectedOrder(order)}>
                                            عرض
                                        </button>
                                        <button className="btn-print" onClick={() => printOrder(order, currentRestaurant)}>
                                            🖨️ طباعة
                                        </button>
                                    </div>
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
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {selectedOrder.status === 'completed' && (
                                    <button 
                                        className="btn-view" 
                                        onClick={() => recalculateRewards(selectedOrder.id)}
                                        disabled={isUpdating}
                                        style={{ borderColor: '#2e7d32', color: '#2e7d32' }}
                                    >
                                        ✨ إعادة احتساب المكافآت
                                    </button>
                                )}
                                <button className="btn-print" onClick={() => printOrder(selectedOrder, currentRestaurant)}>
                                    🖨️ طباعة الإيصال
                                </button>
                                <button className="modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                                <div><strong>الفرع:</strong> {selectedOrder.branch ? (selectedOrder.branch.name_ar || selectedOrder.branch.name_en) : '-'}</div>
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

                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#faf9f6', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: MUTED }}>
                                    <span>المجموع الفرعي</span>
                                    <span>{parseFloat(selectedOrder.subtotal).toFixed(2)} ر.س</span>
                                </div>

                                {selectedOrder.discount_amount > 0 && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: '#c0392b', fontWeight: 700 }}>
                                            <span>الخصم ({selectedOrder.coupon_code})</span>
                                            <span>-{parseFloat(selectedOrder.discount_amount).toFixed(2)} ر.س</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', paddingBottom: '0.6rem', borderBottom: '1px dashed #ddd', color: MUTED, fontSize: '0.9rem' }}>
                                            <span>المبلغ بعد الخصم</span>
                                            <span>{(parseFloat(selectedOrder.subtotal) - parseFloat(selectedOrder.discount_amount)).toFixed(2)} ر.س</span>
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: MUTED }}>
                                    <span>الضريبة</span>
                                    <span>{parseFloat(selectedOrder.tax).toFixed(2)} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.3rem', color: TEXT, paddingTop: '0.8rem', borderTop: '2px solid #ddd' }}>
                                    <span>الإجمالي</span>
                                    <span>{parseFloat(selectedOrder.total).toFixed(2)} ر.س</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
