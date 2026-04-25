import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Cairo:wght@400;600;700;800&display=swap');

:root {
    --bg-color: #f7f5f0;
    --card-bg: #ffffff;
    --card-border: #e5e7eb;
    --gold: #c9a84c;
    --text-main: #111827;
    --text-muted: #6b7280;
    --accent-blue: #2563eb;
    --accent-green: #16a34a;
    --accent-red: #dc2626;
    --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { 
    background: var(--bg-color); 
    font-family: 'Cairo', 'Outfit', sans-serif; 
    color: var(--text-main);
    direction: rtl;
}

.k-layout { 
    height: 100vh; 
    display: flex; 
    flex-direction: column; 
    overflow: hidden;
}

/* Top Bar */
.k-top-bar {
    height: 72px;
    background: #ffffff;
    border-bottom: 1px solid var(--card-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    flex-shrink: 0;
    z-index: 10;
}

.k-brand { 
    font-size: 1.25rem; 
    font-weight: 800; 
    color: var(--gold);
    letter-spacing: 0.5px;
}

.k-stats-row {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.k-stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f9fafb;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--card-border);
}

.k-stat-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
}

.k-stat-val {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-main);
}

.k-refresh-btn {
    background: #ffffff;
    color: var(--text-main);
    border: 1px solid var(--card-border);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.k-refresh-btn:hover {
    background: #f9fafb;
    border-color: var(--gold);
}

/* Grid Layout */
.k-main {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
    overflow: hidden;
}

.k-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
}

.k-column-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.k-column-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text-main);
}

.k-column-count {
    background: #e5e7eb;
    color: #4b5563;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
}

.k-orders-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 2rem;
}

/* Order Card */
.k-card { 
    background: var(--card-bg); 
    border-radius: 12px; 
    border: 1px solid var(--card-border); 
    box-shadow: var(--card-shadow);
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
}

.k-card-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--card-border);
}

.k-card-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
}

.k-order-num {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-main);
}

.k-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
}

.k-badge-pending { background: #eff6ff; color: #2563eb; }
.k-badge-preparing { background: #fffbeb; color: #b45309; }
.k-badge-ready { background: #f0fdf4; color: #16a34a; }

.k-order-time {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.k-context-line {
    padding: 0.5rem 1rem;
    background: #f9fafb;
    border-bottom: 1px solid var(--card-border);
    font-size: 0.85rem;
    font-weight: 700;
    color: #4b5563;
}

.k-items-area {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.k-item {
    display: flex;
    flex-direction: column;
}

.k-item-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.k-item-name {
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1.4;
}

.k-item-qty {
    background: #f3f4f6;
    padding: 0.1rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 800;
}

.k-addons {
    margin-top: 0.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.k-addon {
    font-size: 0.8rem;
    color: var(--text-muted);
    padding-right: 0.5rem;
}

.k-notes-strip {
    background: #fef2f2;
    border-right: 3px solid var(--accent-red);
    padding: 0.5rem 1rem;
    margin: 0 1rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--accent-red);
    border-radius: 4px;
}

.k-card-footer {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--card-border);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.k-footer-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.k-total-lbl { font-size: 0.8rem; color: var(--text-muted); }
.k-total-val { font-size: 1rem; font-weight: 800; }

.k-action-btn {
    height: 44px;
    border: none;
    border-radius: 8px;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.2s;
    width: 100%;
    color: #ffffff;
}

.k-action-btn:hover { opacity: 0.9; }
.k-btn-blue { background: var(--accent-blue); }
.k-btn-gold { background: var(--gold); }
.k-btn-green { background: var(--accent-green); }

/* Empty Message */
.k-empty-msg {
    padding: 2rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
    border: 1px dashed var(--card-border);
    border-radius: 12px;
}

/* Responsive */
@media (max-width: 1200px) {
    .k-main { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
    .k-main { grid-template-columns: 1fr; overflow-y: auto; height: auto; }
    .k-layout { overflow-y: auto; }
    .k-stats-row { display: none; }
    .k-top-bar { padding: 0 1rem; }
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
`;

export default function KitchenDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/kitchen/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders.filter(o => o.status !== 'completed'));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
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
        }
    };

    const groupedOrders = {
        pending: orders.filter(o => o.status === 'pending'),
        preparing: orders.filter(o => o.status === 'preparing'),
        ready: orders.filter(o => o.status === 'ready')
    };

    const stats = {
        total: orders.length,
        new: groupedOrders.pending.length,
        preparing: groupedOrders.preparing.length,
        ready: groupedOrders.ready.length
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    };

    const getContextLabel = (order) => {
        if (order.order_type === 'dine_in') return `🍽️ طاولة: ${order.table_number || '-'}`;
        if (order.order_type === 'car') return `🚗 سيارة: ${order.car_number || '-'}`;
        if (order.order_type === 'takeaway') return `🥡 سفري`;
        return '';
    };

    const OrderCard = ({ order }) => (
        <div className="k-card">
            <div className="k-card-header">
                <div className="k-card-header-top">
                    <span className="k-order-num">#{order.order_number}</span>
                    <span className={`k-badge k-badge-${order.status}`}>
                        {order.status === 'pending' ? 'جديد' : 
                         order.status === 'preparing' ? 'قيد التحضير' : 'جاهز'}
                    </span>
                </div>
                <div className="k-order-time">{formatTime(order.created_at)}</div>
            </div>

            <div className="k-context-line">
                {getContextLabel(order)} {order.customer_name ? `| ${order.customer_name}` : ''}
            </div>

            <div className="k-items-area">
                {order.items?.map((item, idx) => (
                    <div key={item.id || idx} className="k-item">
                        <div className="k-item-main">
                            <span className="k-item-name">{item.product_name_ar || item.product_name_en}</span>
                            <span className="k-item-qty">x{item.quantity}</span>
                        </div>
                        {item.addons?.length > 0 && (
                            <div className="k-addons">
                                {item.addons.map((addon, aidx) => (
                                    <span key={addon.id || aidx} className="k-addon">
                                        + {addon.addon_name_ar || addon.addon_name_en}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {order.notes && order.notes.trim() !== "" && (
                <div className="k-notes-strip">
                    ⚠️ {order.notes}
                </div>
            )}

            <div className="k-card-footer">
                <div className="k-footer-meta">
                    <span className="k-total-lbl">الإجمالي</span>
                    <span className="k-total-val">{parseFloat(order.total).toFixed(2)} ر.س</span>
                </div>
                {order.status === 'pending' && (
                    <button className="k-action-btn k-btn-blue" onClick={() => updateStatus(order.id, 'preparing')}>
                        بدء التحضير
                    </button>
                )}
                {order.status === 'preparing' && (
                    <button className="k-action-btn k-btn-gold" onClick={() => updateStatus(order.id, 'ready')}>
                        جاهز
                    </button>
                )}
                {order.status === 'ready' && (
                    <button className="k-action-btn k-btn-green" onClick={() => updateStatus(order.id, 'completed')}>
                        تم التسليم
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="k-layout">
            <Head title="شاشة المطبخ | CitySoft KDS" />
            <style>{css}</style>

            <header className="k-top-bar">
                <button className="k-refresh-btn" onClick={fetchOrders}>
                    <span>🔄</span>
                    تحديث
                </button>

                <div className="k-stats-row">
                    <div className="k-stat-item">
                        <span className="k-stat-label">نشط:</span>
                        <span className="k-stat-val">{stats.total}</span>
                    </div>
                    <div className="k-stat-item">
                        <span className="k-stat-label">جديد:</span>
                        <span className="k-stat-val">{stats.new}</span>
                    </div>
                    <div className="k-stat-item">
                        <span className="k-stat-label">تحضير:</span>
                        <span className="k-stat-val">{stats.preparing}</span>
                    </div>
                    <div className="k-stat-item">
                        <span className="k-stat-label">جاهز:</span>
                        <span className="k-stat-val">{stats.ready}</span>
                    </div>
                </div>

                <div className="k-brand">CITYSOFT KDS</div>
            </header>

            <main className="k-main">
                {/* Column: New */}
                <section className="k-column">
                    <div className="k-column-header">
                        <span className="k-column-title">جديد</span>
                        <span className="k-column-count">{stats.new}</span>
                    </div>
                    <div className="k-orders-list">
                        {groupedOrders.pending.length > 0 ? (
                            groupedOrders.pending.map(o => <OrderCard key={o.id} order={o} />)
                        ) : (
                            <div className="k-empty-msg">لا توجد طلبات</div>
                        )}
                    </div>
                </section>

                {/* Column: Preparing */}
                <section className="k-column">
                    <div className="k-column-header">
                        <span className="k-column-title">قيد التحضير</span>
                        <span className="k-column-count">{stats.preparing}</span>
                    </div>
                    <div className="k-orders-list">
                        {groupedOrders.preparing.length > 0 ? (
                            groupedOrders.preparing.map(o => <OrderCard key={o.id} order={o} />)
                        ) : (
                            <div className="k-empty-msg">لا توجد طلبات</div>
                        )}
                    </div>
                </section>

                {/* Column: Ready */}
                <section className="k-column">
                    <div className="k-column-header">
                        <span className="k-column-title">جاهز</span>
                        <span className="k-column-count">{stats.ready}</span>
                    </div>
                    <div className="k-orders-list">
                        {groupedOrders.ready.length > 0 ? (
                            groupedOrders.ready.map(o => <OrderCard key={o.id} order={o} />)
                        ) : (
                            <div className="k-empty-msg">لا توجد طلبات</div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
