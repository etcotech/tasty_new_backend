import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

const GOLD = '#C9A84C';
const BG = '#F7F5F0';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cairo:wght@400;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.track-page { background: ${BG}; font-family: 'Outfit', 'Cairo', sans-serif; color: ${TEXT}; min-height: 100vh; direction: rtl; display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; }

.track-container { background: ${SURF}; border-radius: 16px; border: 1px solid ${BORDER}; width: 100%; max-width: 600px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }

.track-header { text-align: center; margin-bottom: 2rem; }
.track-title { font-size: 1.8rem; font-weight: 800; color: ${GOLD}; margin-bottom: 0.5rem; }

.search-box { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
.search-input { flex: 1; padding: 0.8rem 1rem; border: 1px solid ${BORDER}; border-radius: 8px; font-size: 1rem; font-family: inherit; outline: none; }
.search-input:focus { border-color: ${GOLD}; }
.search-btn { background: ${GOLD}; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s; font-family: inherit; }
.search-btn:hover { background: #B8942F; }

.error-msg { background: #ffebee; color: #c0392b; padding: 1rem; border-radius: 8px; text-align: center; font-weight: 600; margin-bottom: 1.5rem; }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 1.5rem; position: relative; margin: 2rem 0; padding-right: 1.5rem; border-right: 3px solid #eee; }
.timeline-item { position: relative; }
.timeline-item::before { content: ''; position: absolute; right: -1.9rem; top: 0; width: 1.2rem; height: 1.2rem; border-radius: 50%; background: #eee; border: 3px solid #fff; box-shadow: 0 0 0 1px #eee; transition: all 0.3s; }
.timeline-item.active::before { background: ${GOLD}; box-shadow: 0 0 0 1px ${GOLD}; }
.timeline-item.done::before { background: #2ecc71; box-shadow: 0 0 0 1px #2ecc71; }
.timeline-content { background: #faf9f6; padding: 1rem; border-radius: 8px; border: 1px solid ${BORDER}; }
.timeline-title { font-weight: 700; font-size: 1.1rem; color: ${MUTED}; }
.timeline-item.active .timeline-title { color: ${TEXT}; }

.order-details { margin-top: 2rem; border-top: 1px solid ${BORDER}; padding-top: 1.5rem; }
.detail-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem; }
.detail-label { color: ${MUTED}; font-weight: 600; }
.detail-val { font-weight: 700; }

.items-list { margin-top: 1.5rem; }
.item-row { border: 1px solid ${BORDER}; border-radius: 8px; padding: 1rem; margin-bottom: 0.8rem; }
.item-top { display: flex; justify-content: space-between; font-weight: 700; }
.addons { margin-top: 0.5rem; padding-right: 1rem; color: ${MUTED}; font-size: 0.85rem; border-right: 2px solid ${GOLD}; }
.addon-row { display: flex; justify-content: space-between; margin-bottom: 0.2rem; }

.total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid ${BORDER}; font-size: 1.2rem; font-weight: 800; color: ${GOLD}; }
`;

export default function TrackOrder({ initialOrderNumber }) {
    const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchOrder = async (num) => {
        if (!num) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/orders/${num}/track`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.order);
            } else {
                setOrder(null);
                setError(data.message || 'الطلب غير موجود');
            }
        } catch (e) {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialOrderNumber) {
            fetchOrder(initialOrderNumber);
        }
    }, [initialOrderNumber]);

    useEffect(() => {
        if (!order) return;
        const interval = setInterval(() => {
            if (order.status !== 'completed') {
                fetchOrder(order.order_number);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [order]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrder(orderNumber);
    };

    const statuses = [
        { id: 'pending', label: 'تم استلام الطلب' },
        { id: 'preparing', label: 'قيد التحضير' },
        { id: 'ready', label: 'جاهز للاستلام' },
        { id: 'completed', label: 'تم التسليم' }
    ];

    const getStatusIndex = (status) => statuses.findIndex(s => s.id === status);

    return (
        <div className="track-page">
            <Head title="تتبع الطلب | Track Order" />
            <style>{css}</style>
            
            <div className="track-container">
                <div className="track-header">
                    <h1 className="track-title">تتبع طلبك</h1>
                    <p style={{ color: MUTED }}>أدخل رقم الطلب لمعرفة حالته</p>
                </div>

                <form className="search-box" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="مثال: ORDXXXX" 
                        value={orderNumber}
                        onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                        required
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? 'جاري...' : 'تتبع'}
                    </button>
                </form>

                {error && <div className="error-msg">{error}</div>}

                {order && (
                    <div className="order-result">
                        <div className="timeline">
                            {statuses.map((s, idx) => {
                                const currentIndex = getStatusIndex(order.status);
                                let itemClass = 'timeline-item';
                                if (idx < currentIndex) itemClass += ' done';
                                else if (idx === currentIndex) itemClass += ' active';
                                
                                return (
                                    <div key={s.id} className={itemClass}>
                                        <div className="timeline-content">
                                            <div className="timeline-title">{s.label}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="order-details">
                            <div className="detail-row">
                                <span className="detail-label">رقم الطلب:</span>
                                <span className="detail-val">{order.order_number}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">نوع الطلب:</span>
                                <span className="detail-val">
                                    {order.order_type === 'dine_in' ? 'داخل المطعم' : 
                                     order.order_type === 'takeaway' ? 'استلام' : 'في السيارة'}
                                </span>
                            </div>
                            {order.table_number && (
                                <div className="detail-row">
                                    <span className="detail-label">الطاولة:</span>
                                    <span className="detail-val">{order.table_number}</span>
                                </div>
                            )}
                            {order.car_number && (
                                <div className="detail-row">
                                    <span className="detail-label">السيارة:</span>
                                    <span className="detail-val">{order.car_number}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="detail-label">وقت الطلب:</span>
                                <span className="detail-val" style={{ direction: 'ltr' }}>
                                    {new Date(order.created_at).toLocaleString('ar-SA')}
                                </span>
                            </div>
                        </div>

                        <div className="items-list">
                            <h3 style={{ marginBottom: '1rem', color: GOLD }}>تفاصيل الفاتورة</h3>
                            {order.items.map(item => (
                                <div key={item.id} className="item-row">
                                    <div className="item-top">
                                        <span>{item.quantity}x {item.product_name_ar || item.product_name_en}</span>
                                        <span>{parseFloat(item.total_price).toFixed(2)} ر.س</span>
                                    </div>
                                    {item.addons && item.addons.length > 0 && (
                                        <div className="addons">
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

                        <div className="total-row">
                            <span>الإجمالي</span>
                            <span>{parseFloat(order.total).toFixed(2)} ر.س</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
