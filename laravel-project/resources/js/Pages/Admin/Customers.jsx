import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';

const GOLD = '#C9A84C';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const pageStyles = `
.cust-card { background: #fff; border-radius: 16px; border: 1px solid ${BORDER}; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 1.5rem; }
.cust-title { font-size: 1.5rem; font-weight: 800; color: ${GOLD}; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
.cust-filters { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; align-items: center; }
.filter-btn { padding: 0.5rem 1.1rem; border-radius: 20px; border: 1.5px solid ${BORDER}; background: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; color: ${MUTED}; transition: all 0.2s; }
.filter-btn.active { border-color: ${GOLD}; color: ${GOLD}; background: rgba(201,168,76,0.07); }
.filter-btn:hover { border-color: ${GOLD}; color: ${GOLD}; }
.search-input { padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid ${BORDER}; font-size: 0.9rem; min-width: 220px; font-family: inherit; outline: none; transition: border-color 0.2s; }
.search-input:focus { border-color: ${GOLD}; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
.cust-table { width: 100%; border-collapse: collapse; }
.cust-table th { text-align: right; padding: 0.9rem 1rem; border-bottom: 2px solid ${BORDER}; color: ${MUTED}; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.cust-table td { padding: 1rem; border-bottom: 1px solid ${BORDER}; vertical-align: middle; font-size: 0.9rem; }
.cust-table tr:last-child td { border-bottom: none; }
.cust-table tr:hover td { background: #fdfcfa; }
.btn-view { background: transparent; color: ${GOLD}; border: 1.5px solid ${GOLD}; padding: 0.35rem 0.85rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
.btn-view:hover { background: rgba(201,168,76,0.08); }
.empty-state { text-align: center; padding: 3rem; color: ${MUTED}; }

/* Pagination */
.pagination { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap; }
.page-btn { padding: 0.4rem 0.85rem; border-radius: 8px; border: 1px solid ${BORDER}; background: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; color: ${MUTED}; transition: all 0.2s; }
.page-btn.active { background: ${GOLD}; color: #fff; border-color: ${GOLD}; }
.page-btn:hover:not(.active) { border-color: ${GOLD}; color: ${GOLD}; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
.modal-box { background: #fff; border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 16px 48px rgba(0,0,0,0.18); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid ${BORDER}; display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-size: 1.2rem; font-weight: 800; color: ${TEXT}; }
.modal-close { background: none; border: none; font-size: 1.6rem; cursor: pointer; color: ${MUTED}; line-height: 1; }
.modal-body { padding: 1.5rem; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
.info-box { background: #f9f8f6; border-radius: 10px; padding: 1rem; }
.info-label { font-size: 0.75rem; font-weight: 700; color: ${MUTED}; margin-bottom: 0.3rem; text-transform: uppercase; }
.info-value { font-size: 1.2rem; font-weight: 800; color: ${TEXT}; }
.orders-list { display: flex; flex-direction: column; gap: 0.6rem; }
.order-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #f9f8f6; border-radius: 8px; font-size: 0.85rem; }
.order-num { font-weight: 700; color: ${GOLD}; }
.order-status { padding: 0.2rem 0.55rem; border-radius: 12px; font-size: 0.72rem; font-weight: 700; }
.status-completed { background: #e8f5e9; color: #2e7d32; }
.status-pending { background: #fff3e0; color: #e65100; }
.status-preparing { background: #e3f2fd; color: #1565c0; }
.status-cancelled { background: #ffebee; color: #c62828; }
.status-ready { background: #f3e5f5; color: #6a1b9a; }
`;

const FILTERS = [
    { key: 'all',        label: 'كل العملاء' },
    { key: 'repeat',     label: 'عملاء متكررون' },
    { key: 'inactive_7', label: 'لم يطلبوا منذ 7 أيام' },
    { key: 'inactive_30',label: 'لم يطلبوا منذ 30 يوم' },
];

export default function Customers({ customers, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [activeFilter, setActiveFilter] = useState(filters?.filter || 'all');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const applyFilter = (key) => {
        setActiveFilter(key);
        router.get('/admin/customers', { filter: key, search }, { preserveState: true, replace: true });
    };

    const applySearch = (e) => {
        e.preventDefault();
        router.get('/admin/customers', { filter: activeFilter, search }, { preserveState: true, replace: true });
    };

    const openCustomer = async (customer) => {
        setSelectedCustomer(customer);
        setLoadingDetail(true);
        setCustomerOrders([]);
        try {
            const res = await fetch(`/admin/customers/${customer.id}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.success) setCustomerOrders(data.orders || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeModal = () => {
        setSelectedCustomer(null);
        setCustomerOrders([]);
    };

    const statusClass = (status) => {
        const map = { completed: 'status-completed', pending: 'status-pending', preparing: 'status-preparing', cancelled: 'status-cancelled', ready: 'status-ready' };
        return map[status] || 'status-pending';
    };

    const statusLabel = (status) => {
        const map = { completed: 'مكتمل', pending: 'انتظار', preparing: 'يُحضَّر', cancelled: 'ملغي', ready: 'جاهز', delivered: 'تم التوصيل' };
        return map[status] || status;
    };

    const fmt = (date) => date ? new Date(date).toLocaleDateString('ar-SA') : '—';

    return (
        <AdminLayout title="العملاء">
            <style>{pageStyles}</style>

            <div className="cust-card">
                <h2 className="cust-title">
                    <svg style={{ width: 28, height: 28 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    العملاء
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: MUTED, marginRight: 'auto' }}>
                        {customers?.total ?? 0} عميل
                    </span>
                </h2>

                {/* Filters + Search */}
                <div className="cust-filters">
                    {FILTERS.map(f => (
                        <button key={f.key} className={`filter-btn ${activeFilter === f.key ? 'active' : ''}`} onClick={() => applyFilter(f.key)}>
                            {f.label}
                        </button>
                    ))}
                    <form onSubmit={applySearch} style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto' }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="بحث بالاسم أو الجوال..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button type="submit" style={{ padding: '0.6rem 1.1rem', background: GOLD, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                            بحث
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="cust-table">
                        <thead>
                            <tr>
                                <th>اسم العميل</th>
                                <th>رقم الجوال</th>
                                <th>عدد الطلبات</th>
                                <th>إجمالي المشتريات</th>
                                <th>آخر طلب</th>
                                <th>آخر تاريخ طلب</th>
                                <th>إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers?.data?.length > 0 ? (
                                customers.data.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 700 }}>{c.name || <span style={{ color: MUTED, fontStyle: 'italic' }}>غير معروف</span>}</td>
                                        <td style={{ direction: 'ltr', textAlign: 'right' }}>{c.phone}</td>
                                        <td>
                                            <span style={{ background: c.orders_count > 1 ? 'rgba(201,168,76,0.1)' : '#f3f4f6', color: c.orders_count > 1 ? GOLD : MUTED, padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
                                                {c.orders_count}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 700, color: TEXT }}>{Number(c.total_spent).toFixed(2)} ر.س</td>
                                        <td style={{ color: MUTED, fontSize: '0.85rem' }}>{c.last_order_id ? `#${c.last_order_id}` : '—'}</td>
                                        <td style={{ color: MUTED, fontSize: '0.85rem' }}>{fmt(c.last_order_at)}</td>
                                        <td>
                                            <button className="btn-view" onClick={() => openCustomer(c)}>عرض التفاصيل</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">لا يوجد عملاء بعد.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {customers?.last_page > 1 && (
                    <div className="pagination">
                        {customers.links.map((link, i) => (
                            <button
                                key={i}
                                className={`page-btn ${link.active ? 'active' : ''}`}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                👤 {selectedCustomer.name || 'عميل'}
                            </div>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            {/* Info Grid */}
                            <div className="info-grid">
                                <div className="info-box">
                                    <div className="info-label">رقم الجوال</div>
                                    <div className="info-value" style={{ fontSize: '1rem', direction: 'ltr', textAlign: 'right' }}>{selectedCustomer.phone}</div>
                                </div>
                                <div className="info-box">
                                    <div className="info-label">عدد الطلبات</div>
                                    <div className="info-value">{selectedCustomer.orders_count}</div>
                                </div>
                                <div className="info-box">
                                    <div className="info-label">إجمالي المشتريات</div>
                                    <div className="info-value">{Number(selectedCustomer.total_spent).toFixed(2)} ر.س</div>
                                </div>
                                <div className="info-box">
                                    <div className="info-label">آخر طلب</div>
                                    <div className="info-value" style={{ fontSize: '1rem' }}>{fmt(selectedCustomer.last_order_at)}</div>
                                </div>
                            </div>

                            {/* Order History */}
                            <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', color: TEXT }}>سجل الطلبات</h3>
                            {loadingDetail ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem', color: MUTED }}>جاري التحميل...</div>
                            ) : (
                                <div className="orders-list">
                                    {customerOrders.length > 0 ? customerOrders.map(o => (
                                        <div key={o.id} className="order-row">
                                            <span className="order-num">#{o.order_number}</span>
                                            <span style={{ color: MUTED, fontSize: '0.8rem' }}>{fmt(o.created_at)}</span>
                                            <span style={{ fontWeight: 700 }}>{Number(o.total).toFixed(2)} ر.س</span>
                                            <span className={`order-status ${statusClass(o.status)}`}>{statusLabel(o.status)}</span>
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', color: MUTED, padding: '1rem' }}>لا توجد طلبات</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
