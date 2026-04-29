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
    --bg-new: #eff6ff;
    --bg-preparing: #fffbeb;
    --bg-ready: #f0fdf4;
    --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
    --warning: #f59e0b;
    --danger: #ef4444;
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
    gap: 1rem;
    padding: 1rem;
    overflow: hidden;
}

.k-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    padding: 1rem;
    border-radius: 20px;
    border: 1px solid var(--card-border);
}

.k-column-new { background: var(--bg-new); border-color: #dbeafe; }
.k-column-preparing { background: var(--bg-preparing); border-color: #fef3c7; }
.k-column-ready { background: var(--bg-ready); border-color: #dcfce7; }

.k-column-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
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
    max-width: 100%;
    display: flex;
    flex-direction: column;
    animation: kCardSlideIn 0.35s ease-out forwards;
}

@keyframes kCardSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
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

.k-rollback-btn {
    background: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
    padding: 0.5rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
}

.k-rollback-btn:hover {
    background: #fef2f2;
    color: var(--accent-red);
    border-color: #fee2e2;
}

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

.k-timer {
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: #f3f4f6;
    color: #4b5563;
}

.k-timer-warning {
    background: #fef3c7;
    color: #b45309;
    animation: kPulse 2s infinite;
}

.k-timer-danger {
    background: #fee2e2;
    color: #dc2626;
    animation: kPulse 1s infinite;
}

@keyframes kPulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}

.k-btn-control {
    background: #ffffff;
    border: 1px solid var(--card-border);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.2s;
}

.k-btn-control:hover { background: #f9fafb; border-color: var(--gold); }
.k-btn-control.active { background: var(--gold); color: #fff; border-color: var(--gold); }

.k-print-btn {
    background: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
    padding: 0.4rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
}

.k-print-btn:hover { background: #e5e7eb; }
`;

const playSound = (type, enabled) => {
    if (!enabled) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'new') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        }
    } catch (e) {
        console.warn("Audio Context failed", e);
    }
};

const printOrder = (order, restaurant) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const subtotal = order.items.reduce((acc, item) => acc + parseFloat(item.total_price), 0);
    const taxPercentage = parseFloat(restaurant?.tax_percentage || 0);
    const taxAmount = (subtotal * (taxPercentage / 100));
    const total = subtotal + taxAmount;

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
                    .no-print { display: none; }
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
                <div class="total-row"><span>المجموع الفرعي:</span> <span>${subtotal.toFixed(2)} ر.س</span></div>
                <div class="total-row"><span>الضريبة (${taxPercentage}%):</span> <span>${taxAmount.toFixed(2)} ر.س</span></div>
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

const OrderTimer = ({ createdAt }) => {
    const [elapsed, setElapsed] = React.useState('00:00');
    const [status, setStatus] = React.useState('normal');

    React.useEffect(() => {
        const update = () => {
            const start = new Date(createdAt);
            const now = new Date();
            const diff = Math.floor((now - start) / 1000);
            const mins = Math.floor(diff / 60);
            const secs = diff % 60;
            setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            
            if (mins >= 20) setStatus('danger');
            else if (mins >= 10) setStatus('warning');
            else setStatus('normal');
        };
        update();
        const tid = setInterval(update, 1000);
        return () => clearInterval(tid);
    }, [createdAt]);

    return <span className={`k-timer k-timer-${status}`}>{elapsed}</span>;
};

export default function KitchenDashboard() {
    const [orders, setOrders] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [autoPrint, setAutoPrint] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const lastOrderIds = React.useRef(new Set());

    const fetchOrders = async (isInitial = false) => {
        try {
            const url = selectedBranch 
                ? `/api/kitchen/orders?branch_id=${selectedBranch}` 
                : '/api/kitchen/orders';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                const activeOrders = data.orders.filter(o => o.status !== 'completed');
                
                // New Order Detection & Auto Print
                if (!isInitial) {
                    const currentIds = new Set(activeOrders.map(o => o.id));
                    const newOrders = activeOrders.filter(o => !lastOrderIds.current.has(o.id) && o.status === 'pending');
                    
                    if (newOrders.length > 0) {
                        playSound('new', soundEnabled);
                        
                        if (autoPrint) {
                            const printedIds = JSON.parse(localStorage.getItem('kds_printed_ids') || '[]');
                            newOrders.forEach(order => {
                                if (!printedIds.includes(order.id)) {
                                    printOrder(order, data.restaurant);
                                    printedIds.push(order.id);
                                }
                            });
                            localStorage.setItem('kds_printed_ids', JSON.stringify(printedIds.slice(-100)));
                        }
                    }
                    lastOrderIds.current = currentIds;
                } else {
                    lastOrderIds.current = new Set(activeOrders.map(o => o.id));
                }

                setOrders(activeOrders);
                setRestaurant(data.restaurant);
                setBranches(data.branches || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(true);
        const interval = setInterval(() => fetchOrders(false), 10000);
        
        const fsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', fsChange);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('fullscreenchange', fsChange);
        };
    }, [soundEnabled, autoPrint, selectedBranch]); // Refresh interval depends on these for detection closure if needed

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
                playSound('status', soundEnabled);
                fetchOrders(false);
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

    const handleRollback = (id, newStatus) => {
        if (window.confirm("هل تريد إرجاع الطلب للمرحلة السابقة؟")) {
            updateStatus(id, newStatus);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.error(e));
        } else {
            document.exitFullscreen();
        }
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
                <div className="k-order-time" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        {formatTime(order.created_at)}
                    </div>
                    <OrderTimer createdAt={order.created_at} />
                </div>
            </div>

            <div className="k-context-line">
                {getContextLabel(order)} {order.customer_name ? `| ${order.customer_name}` : ''}
                {order.branch && (
                    <span style={{ float: 'left', background: '#FEF3C7', color: '#B45309', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        📍 {order.branch.name_ar}
                    </span>
                )}
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="k-total-lbl">الإجمالي</span>
                        <span className="k-total-val">{parseFloat(order.total).toFixed(2)} ر.س</span>
                    </div>
                    <button className="k-print-btn" onClick={() => printOrder(order, restaurant)} title="طباعة">
                        <span>🖨️</span>
                        <span>طباعة</span>
                    </button>
                </div>
                
                {/* Actions Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {order.status === 'pending' && (
                        <button className="k-action-btn k-btn-blue" onClick={() => updateStatus(order.id, 'preparing')}>
                            بدء التحضير
                        </button>
                    )}
                    
                    {order.status === 'preparing' && (
                        <>
                            <button className="k-action-btn k-btn-gold" onClick={() => updateStatus(order.id, 'ready')}>
                                جاهز
                            </button>
                            <button className="k-rollback-btn" onClick={() => handleRollback(order.id, 'pending')}>
                                إرجاع إلى جديد
                            </button>
                        </>
                    )}
                    
                    {order.status === 'ready' && (
                        <>
                            <button className="k-action-btn k-btn-green" onClick={() => updateStatus(order.id, 'completed')}>
                                تم التسليم
                            </button>
                            <button className="k-rollback-btn" onClick={() => handleRollback(order.id, 'preparing')}>
                                إرجاع إلى التحضير
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="k-layout">
            <Head title="شاشة المطبخ | CitySoft KDS" />
            <style>{css}</style>

            <header className="k-top-bar">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button className="k-refresh-btn" onClick={() => fetchOrders(false)}>
                        <span>🔄</span>
                        تحديث
                    </button>

                    <button 
                        className={`k-btn-control ${soundEnabled ? 'active' : ''}`} 
                        onClick={() => {
                            setSoundEnabled(!soundEnabled);
                            if (!soundEnabled) playSound('status', true); // Test sound on enable
                        }}
                    >
                        <span>{soundEnabled ? '🔊' : '🔈'}</span>
                        {soundEnabled ? 'تعطيل الصوت' : 'تفعيل الصوت'}
                    </button>

                    <button 
                        className={`k-btn-control ${autoPrint ? 'active' : ''}`} 
                        onClick={() => setAutoPrint(!autoPrint)}
                    >
                        <span>🖨️</span>
                        {autoPrint ? 'إيقاف الطباعة' : 'طباعة تلقائية'}
                    </button>

                    <button className="k-btn-control" onClick={toggleFullscreen}>
                        <span>{isFullscreen ? '↙️' : '↗️'}</span>
                        {isFullscreen ? 'خروج من الشاشة' : 'ملء الشاشة'}
                    </button>

                    {branches.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.4rem', borderRight: '1px solid #eee', paddingRight: '0.75rem', marginRight: '0.75rem' }}>
                            <button 
                                className={`k-btn-control ${!selectedBranch ? 'active' : ''}`}
                                onClick={() => setSelectedBranch(null)}
                            >
                                الكل
                            </button>
                            {branches.map(b => (
                                <button 
                                    key={b.id}
                                    className={`k-btn-control ${selectedBranch === b.id ? 'active' : ''}`}
                                    onClick={() => setSelectedBranch(b.id)}
                                >
                                    {b.name_ar}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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
                <section className="k-column k-column-new">
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
                <section className="k-column k-column-preparing">
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
                <section className="k-column k-column-ready">
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
