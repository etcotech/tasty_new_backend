import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Cairo:wght@400;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #121212; font-family: 'Outfit', 'Cairo', sans-serif; color: #FFFFFF; }

.k-layout { min-height: 100vh; display: flex; flex-direction: column; direction: rtl; padding: 2rem; }
.k-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 1rem; }
.k-brand { font-size: 2rem; font-weight: 800; color: #C9A84C; letter-spacing: 0.05em; }

.k-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }

.k-card { background: #1E1E1E; border-radius: 12px; border: 1px solid #333; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
.k-card-header { padding: 1.2rem; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #333; }
.k-order-num { font-size: 1.4rem; font-weight: 800; color: #fff; }
.k-time { font-size: 0.9rem; color: #888; margin-top: 0.2rem; }

.k-context { padding: 0.8rem 1.2rem; background: #2A2A2A; font-weight: 700; font-size: 1.1rem; color: #C9A84C; border-bottom: 1px solid #333; }

.k-items { padding: 1.2rem; flex: 1; overflow-y: auto; max-height: 300px; }
.k-item { margin-bottom: 1rem; }
.k-item-top { display: flex; font-size: 1.1rem; font-weight: 700; color: #fff; }
.k-qty { min-width: 2rem; color: #C9A84C; }
.k-addons { margin-top: 0.4rem; padding-right: 2rem; color: #aaa; font-size: 0.95rem; }

.k-notes { padding: 0.8rem 1.2rem; background: #311b1b; border-left: 4px solid #e74c3c; color: #ff9999; font-weight: 600; font-size: 0.95rem; }

.k-footer { padding: 1.2rem; border-top: 1px solid #333; display: flex; justify-content: space-between; align-items: center; background: #161616; }
.k-total { font-size: 1.2rem; font-weight: 800; color: #fff; }

.k-btn { padding: 0.8rem 1.5rem; border-radius: 8px; border: none; font-weight: 800; font-size: 1.05rem; cursor: pointer; transition: all 0.2s; font-family: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.k-btn-start { background: #3498db; color: #fff; }
.k-btn-start:hover { background: #2980b9; }
.k-btn-ready { background: #f39c12; color: #fff; }
.k-btn-ready:hover { background: #e67e22; }
.k-btn-done { background: #2ecc71; color: #fff; }
.k-btn-done:hover { background: #27ae60; }

.k-status-badge { padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.05em; }
.k-badge-pending { background: #333; color: #aaa; }
.k-badge-preparing { background: rgba(52, 152, 219, 0.2); color: #3498db; }
.k-badge-ready { background: rgba(243, 156, 18, 0.2); color: #f39c12; }

/* Scrollbar */
.k-items::-webkit-scrollbar { width: 6px; }
.k-items::-webkit-scrollbar-track { background: #1e1e1e; }
.k-items::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
`;

export default function KitchenDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/kitchen/orders');
            const data = await res.json();
            if (data.success) setOrders(data.orders);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/kitchen/orders/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            }
        } catch (e) {
            console.error(e);
            alert('Failed to update status');
        }
    };

    const getActionBtn = (order) => {
        if (order.status === 'pending') {
            return <button className="k-btn k-btn-start" onClick={() => updateStatus(order.id, 'preparing')}>بدء التحضير</button>;
        }
        if (order.status === 'preparing') {
            return <button className="k-btn k-btn-ready" onClick={() => updateStatus(order.id, 'ready')}>جاهز</button>;
        }
        if (order.status === 'ready') {
            return <button className="k-btn k-btn-done" onClick={() => updateStatus(order.id, 'completed')}>تم التسليم</button>;
        }
        return null;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="k-status-badge k-badge-pending">جديد</span>;
            case 'preparing': return <span className="k-status-badge k-badge-preparing">جاري التجهيز</span>;
            case 'ready': return <span className="k-status-badge k-badge-ready">جاهز للاستلام</span>;
            default: return null;
        }
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    };

    const getContext = (order) => {
        if (order.order_type === 'dine_in') return `محلي - طاولة: ${order.table_number}`;
        if (order.order_type === 'car') return `استلام سيارة: ${order.car_number}`;
        return `سفري (Takeaway)`;
    };

    return (
        <div className="k-layout">
            <Head title="شاشة المطبخ | Kitchen Display" />
            <style>{css}</style>

            <header className="k-header">
                <div className="k-brand">شاشة المطبخ (Kitchen Display)</div>
                <button 
                    onClick={fetchOrders} 
                    style={{ background: '#333', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    تحديث (Refresh)
                </button>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', fontSize: '1.5rem', color: '#888' }}>جاري التحميل...</div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', fontSize: '1.5rem', color: '#666' }}>لا توجد طلبات نشطة حالياً.</div>
            ) : (
                <main className="k-grid">
                    {orders.map(order => (
                        <div key={order.id} className="k-card">
                            <div className="k-card-header">
                                <div>
                                    <div className="k-order-num">{order.order_number}</div>
                                    <div className="k-time">منذ: {formatTime(order.created_at)}</div>
                                </div>
                                <div>
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>
                            
                            <div className="k-context">
                                {getContext(order)}
                            </div>

                            <div className="k-items">
                                {order.items.map(item => (
                                    <div key={item.id} className="k-item">
                                        <div className="k-item-top">
                                            <span className="k-qty">{item.quantity}x</span>
                                            <span>{item.product_name_ar || item.product_name_en}</span>
                                        </div>
                                        {item.addons && item.addons.length > 0 && (
                                            <div className="k-addons">
                                                {item.addons.map(addon => (
                                                    <div key={addon.id}>+ {addon.addon_name_ar || addon.addon_name_en}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {order.notes && (
                                <div className="k-notes">ملاحظات: {order.notes}</div>
                            )}

                            <div className="k-footer">
                                <div className="k-total">{parseFloat(order.total).toFixed(2)} ر.س</div>
                                {getActionBtn(order)}
                            </div>
                        </div>
                    ))}
                </main>
            )}
        </div>
    );
}
