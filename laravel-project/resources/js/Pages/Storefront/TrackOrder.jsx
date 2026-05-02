import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

/* ======================================
   STYLES (Compact & Horizontal Layout)
   ====================================== */
const GOLD   = '#C9A84C';
const GOLD_H = '#B8942F';
const BG     = '#F7F5F0';
const SURF   = '#FFFFFF';
const TEXT   = '#1A1714';
const MUTED  = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Outfit:wght@300;400;500;600;700&family=Cairo:wght@400;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.tr-page { background: ${BG}; font-family: 'Cairo', 'Outfit', sans-serif; color: ${TEXT}; min-height: 100vh; direction: rtl; display: flex; flex-direction: column; align-items: center; padding: 1.5rem 1rem; -webkit-font-smoothing: antialiased; }

.tr-container { width: 100%; max-width: 650px; }

/* COMPACT CARDS */
.tr-card { background: ${SURF}; border-radius: 16px; border: 1px solid ${BORDER}; padding: 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 1rem; position: relative; }

/* NAV BUTTONS */
.tr-nav-row { display: flex; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; }
.tr-nav-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: 1px solid ${BORDER}; font-family: inherit; text-decoration: none; }
.tr-nav-btn--back { background: #fff; color: ${TEXT}; }
.tr-nav-btn--back:hover { background: #f9f9f9; border-color: ${GOLD}; }
.tr-nav-btn--refresh { background: ${GOLD}; color: #fff; border: none; }
.tr-nav-btn--refresh:hover { background: ${GOLD_H}; transform: translateY(-1px); }

/* SEARCH SECTION */
.tr-search-card { padding: 1.5rem; text-align: center; }
.tr-header { margin-bottom: 1.25rem; }
.tr-title { font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: 800; color: ${TEXT}; margin-bottom: 0.25rem; }
.tr-subtitle { color: ${MUTED}; font-size: 0.9rem; }

.tr-search-box { display: flex; gap: 0.5rem; }
.tr-input { flex: 1; padding: 0.75rem 1rem; border: 1.5px solid ${BORDER}; border-radius: 10px; font-size: 1rem; font-family: inherit; outline: none; transition: all 0.2s; background: #fafafa; }
.tr-input:focus { border-color: ${GOLD}; background: #fff; }
.tr-search-btn { background: ${GOLD}; color: #fff; border: none; padding: 0 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }

/* STATUS HEADER */
.tr-status-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid ${BORDER}; }
.tr-ord-num { font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 800; color: ${GOLD_H}; }
.tr-status-badge { background: rgba(34,197,94,0.1); color: #16A34A; padding: 0.3rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }

/* HORIZONTAL TIMELINE */
.tr-timeline-horiz { display: flex; position: relative; margin: 1.5rem 0 2.5rem; padding: 0 0.5rem; }
.tr-timeline-horiz::before { content: ''; position: absolute; top: 11px; left: 10%; right: 10%; height: 2px; background: #E5E7EB; z-index: 1; }

.tr-step-h { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; text-align: center; }
.tr-step-h__dot { width: 22px; height: 22px; border-radius: 50%; background: #E5E7EB; border: 4px solid #fff; box-shadow: 0 0 0 1px #E5E7EB; transition: all 0.4s; margin-bottom: 0.75rem; }
.tr-step-h.active .tr-step-h__dot { background: ${GOLD}; box-shadow: 0 0 0 4px rgba(201,168,76,0.2), 0 0 0 1px ${GOLD}; transform: scale(1.1); }
.tr-step-h.done .tr-step-h__dot { background: #22C55E; box-shadow: 0 0 0 1px #22C55E; }

.tr-step-h__label { font-size: 0.8rem; font-weight: 800; color: ${MUTED}; line-height: 1.2; max-width: 80px; }
.tr-step-h.active .tr-step-h__label { color: ${TEXT}; font-size: 0.85rem; }
.tr-step-h.done .tr-step-h__label { color: #16A34A; }

/* REFRESH TEXT */
.tr-refresh-mini { color: ${MUTED}; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 0.5rem; }
.tr-refresh-mini span { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22C55E; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }

/* COMPACT DETAILS */
.tr-details-card { padding: 0; overflow: hidden; }
.tr-details-title { background: #fafafa; padding: 0.75rem 1.25rem; font-weight: 800; font-size: 1rem; border-bottom: 1px solid ${BORDER}; }
.tr-details-content { padding: 1rem 1.25rem; }
.tr-detail-item { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
.tr-detail-item:last-child { margin-bottom: 0; }
.tr-detail-label { color: ${MUTED}; }
.tr-detail-val { font-weight: 700; }

.tr-items-list { border-top: 1px dashed ${BORDER}; margin-top: 0.75rem; padding-top: 0.75rem; }
.tr-item-row { display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.9rem; }
.tr-item-name { font-weight: 700; }
.tr-item-addons { font-size: 0.8rem; color: ${MUTED}; margin-top: -0.2rem; margin-bottom: 0.4rem; padding-right: 0.75rem; border-right: 1.5px solid ${GOLD}; }

.tr-total-footer { background: #faf9f6; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; font-weight: 900; border-top: 1.5px solid ${GOLD}; }
.tr-total-price { color: ${GOLD_H}; }

@media (max-width: 480px) {
    .tr-timeline-horiz::before { left: 15%; right: 15%; }
    .tr-step-h__label { font-size: 0.7rem; }
    .tr-step-h.active .tr-step-h__label { font-size: 0.75rem; }
}

/* REVIEW BUTTON */
.tr-review-btn { display: inline-flex; align-items: center; justify-content: center; background: #fff; border: 2px solid #E8EAED; color: #3C4043; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 1rem; text-decoration: none; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
.tr-review-btn:hover { border-color: #4285F4; color: #1A73E8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15); }
`;

export default function TrackOrder({ initialOrderNumber }) {
    const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchOrder = async (num) => {
        const cleanNum = num?.trim().toUpperCase();
        if (!cleanNum) {
            setError('يرجى إدخال رقم الطلب');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/orders/${cleanNum}/track`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.order);
            } else {
                setOrder(null);
                setError('لم يتم العثور على الطلب. يرجى التأكد من الرقم.');
            }
        } catch (e) {
            setError('حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.');
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
        
        // Don't refresh if completed
        if (order.status === 'completed') return;

        const interval = setInterval(() => {
            fetchOrder(order.order_number);
        }, 10000);
        
        return () => clearInterval(interval);
    }, [order]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrder(orderNumber);
    };

    const statuses = [
        { id: 'pending',   label: 'تم الاستلام' },
        { id: 'preparing', label: 'قيد التحضير' },
        { id: 'ready',     label: 'جاهز' },
        { id: 'completed', label: 'تم التسليم' }
    ];

    const getStatusIndex = (status) => statuses.findIndex(s => s.id === status);

    const backUrl = order?.restaurant?.slug ? `/${order.restaurant.slug}` : '/';

    return (
        <div className="tr-page">
            <Head title="تتبع الطلب | Track Order" />
            <style>{css}</style>
            
            <div className="tr-container">
                
                {/* Nav Buttons */}
                {order && (
                    <div className="tr-nav-row">
                        <Link href={backUrl} className="tr-nav-btn tr-nav-btn--back">
                            <span>←</span>
                            <span>العودة للقائمة</span>
                        </Link>
                        <button className="tr-nav-btn tr-nav-btn--refresh" onClick={() => fetchOrder(order.order_number)} disabled={loading}>
                            {loading ? 'جاري...' : 'تحديث الحالة'}
                        </button>
                    </div>
                )}

                {/* Search Card (Show only if no order or searching) */}
                {!order && (
                    <div className="tr-card tr-search-card">
                        <div className="tr-header">
                            <h1 className="tr-title">تتبع طلبك</h1>
                            <p className="tr-subtitle">أدخل رقم الطلب لمعرفة حالته الحالية</p>
                        </div>
                        <form className="tr-search-box" onSubmit={handleSearch}>
                            <input 
                                type="text" 
                                className="tr-input" 
                                placeholder="ORD12345" 
                                value={orderNumber}
                                onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                            />
                            <button type="submit" className="tr-search-btn" disabled={loading}>
                                {loading ? '...' : 'تتبع'}
                            </button>
                        </form>
                        {error && <div style={{ color: '#991B1B', marginTop: '1rem', fontWeight: 600 }}>{error}</div>}
                    </div>
                )}

                {order && (
                    <>
                        {/* Status Card */}
                        <div className="tr-card">
                            <div className="tr-status-header">
                                <div className="tr-ord-num">{order.order_number}</div>
                                <div className="tr-status-badge">
                                    {statuses.find(s => s.id === order.status)?.label}
                                </div>
                            </div>
                            
                            <div className="tr-timeline-horiz">
                                {statuses.map((s, idx) => {
                                    const currentIndex = getStatusIndex(order.status);
                                    let stepClass = 'tr-step-h';
                                    if (idx < currentIndex) stepClass += ' done';
                                    else if (idx === currentIndex) stepClass += ' active';
                                    
                                    return (
                                        <div key={s.id} className={stepClass}>
                                            <div className="tr-step-h__dot" />
                                            <div className="tr-step-h__label">{s.label}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {order.status !== 'completed' && (
                                <div className="tr-refresh-mini">
                                    <span /> يتم التحديث تلقائياً كل 10 ثواني
                                </div>
                            )}

                            {order.status === 'completed' && order.restaurant?.google_review_url && (
                                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => window.open(order.restaurant?.google_review_url, '_blank')}
                                        className="tr-review-btn"
                                    >
                                        ⭐ إذا أعجبتك التجربة، قيّمنا على Google
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Details Card */}
                        <div className="tr-card tr-details-card">
                            <div className="tr-details-title">تفاصيل الطلب</div>
                            <div className="tr-details-content">
                                <div className="tr-detail-item">
                                    <span className="tr-detail-label">نوع الطلب</span>
                                    <span className="tr-val">
                                        {order.order_type === 'dine_in' ? 'داخل المطعم' : 
                                         order.order_type === 'takeaway' ? 'استلام' : 'في السيارة'}
                                    </span>
                                </div>
                                {order.table_number && (
                                    <div className="tr-detail-item">
                                        <span className="tr-detail-label">رقم الطاولة</span>
                                        <span className="tr-val">{order.table_number}</span>
                                    </div>
                                )}
                                <div className="tr-detail-item">
                                    <span className="tr-detail-label">الوقت</span>
                                    <span className="tr-val" style={{ direction: 'ltr' }}>
                                        {new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="tr-items-list">
                                    {order.items.map(item => (
                                        <div key={item.id}>
                                            <div className="tr-item-row">
                                                <span className="tr-item-name">{item.quantity}x {item.product_name_ar || item.product_name_en}</span>
                                                <span>{parseFloat(item.total_price).toFixed(2)}</span>
                                            </div>
                                            {item.addons && item.addons.length > 0 && (
                                                <div className="tr-item-addons">
                                                    {item.addons.map(a => (
                                                        <div key={a.id} style={{ display: 'flex', justifySelf: 'space-between' }}>
                                                            <span>+ {a.addon_name_ar || a.addon_name_en}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="tr-total-footer">
                                <span>الإجمالي</span>
                                <span className="tr-total-price">{parseFloat(order.total).toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
