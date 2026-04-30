import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';

const GOLD = '#C9A84C';
const BG = '#F7F5F0';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const pageStyles = `
.admin-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 1.5rem; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.stat-card { background: ${SURF}; padding: 1.5rem; border-radius: 12px; border: 1px solid ${BORDER}; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
.stat-label { font-size: 0.85rem; color: ${MUTED}; font-weight: 600; margin-bottom: 0.5rem; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: ${TEXT}; }
.stat-trend { font-size: 0.8rem; margin-top: 0.5rem; color: ${GOLD}; font-weight: 700; }

.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
@media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }

.chart-card { background: ${SURF}; padding: 1.5rem; border-radius: 12px; border: 1px solid ${BORDER}; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.chart-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; padding-bottom: 0.8rem; }

/* Simple Bar Chart */
.bar-chart { display: flex; align-items: flex-end; height: 200px; gap: 1rem; padding-top: 2rem; }
.bar-item { flex: 1; background: #f9f9f9; border-radius: 4px 4px 0 0; position: relative; transition: height 0.3s; }
.bar-fill { position: absolute; bottom: 0; left: 0; right: 0; background: ${GOLD}; border-radius: 4px 4px 0 0; transition: height 0.5s ease-out; }
.bar-label { position: absolute; bottom: -1.5rem; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: ${MUTED}; white-space: nowrap; }
.bar-value { position: absolute; top: -1.5rem; left: 50%; transform: translateX(-50%); font-size: 0.75rem; font-weight: 700; color: ${GOLD}; }

.status-list { display: flex; flex-direction: column; gap: 1rem; }
.status-row { display: flex; align-items: center; gap: 1rem; }
.status-pill { width: 12px; height: 12px; border-radius: 50%; }
.status-info { flex: 1; display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 600; }

.top-products-list { display: flex; flex-direction: column; gap: 1rem; }
.product-row { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem; background: #faf9f6; border-radius: 8px; }
.product-name { font-weight: 600; font-size: 0.9rem; }
.product-count { font-weight: 800; color: ${GOLD}; }
`;

export default function Dashboard({ stats, charts }) {
    const maxRevenue = Math.max(...charts.revenueLast7Days.map(d => d.total), 1);

    const statusColors = {
        pending: '#E67E22',
        preparing: '#3498DB',
        ready: '#9B59B6',
        completed: '#2ECC71'
    };

    const statusLabels = {
        pending: 'جديد',
        preparing: 'تجهيز',
        ready: 'جاهز',
        completed: 'مكتمل'
    };

    return (
        <AdminLayout title="لوحة الإحصائيات">
            <style>{pageStyles}</style>

            <h1 className="admin-title">نظرة عامة (Overview)</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">طلبات اليوم</span>
                    <span className="stat-value">{stats.ordersToday}</span>
                    <span className="stat-trend">اليوم</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">مبيعات اليوم</span>
                    <span className="stat-value">{stats.revenueToday.toFixed(2)} ر.س</span>
                    <span className="stat-trend">اليوم</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">طلبات قيد الانتظار</span>
                    <span className="stat-value">{stats.pendingOrders}</span>
                    <span className="stat-trend">بانتظار التحضير</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">إجمالي المنتجات</span>
                    <span className="stat-value">{stats.totalProducts}</span>
                    <span className="stat-trend">في القائمة</span>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h2 className="chart-title">إيرادات آخر 7 أيام (ر.س)</h2>
                    <div className="bar-chart">
                        {charts.revenueLast7Days.map((d, i) => (
                            <div key={i} className="bar-item">
                                <div 
                                    className="bar-fill" 
                                    style={{ height: `${(d.total / maxRevenue) * 100}%` }}
                                >
                                    <span className="bar-value">{parseFloat(d.total).toFixed(0)}</span>
                                    <span className="bar-label">{new Date(d.date).toLocaleDateString('ar-SA', { weekday: 'short' })}</span>
                                </div>
                            </div>
                        ))}
                        {charts.revenueLast7Days.length === 0 && (
                            <div style={{ width: '100%', textAlign: 'center', color: MUTED }}>لا توجد بيانات كافية</div>
                        )}
                    </div>
                </div>

                <div className="chart-card">
                    <h2 className="chart-title">حالة الطلبات</h2>
                    <div className="status-list">
                        {charts.ordersByStatus.map(s => (
                            <div key={s.status} className="status-row">
                                <div className="status-pill" style={{ background: statusColors[s.status] || '#eee' }}></div>
                                <div className="status-info">
                                    <span>{statusLabels[s.status] || s.status}</span>
                                    <span>{s.count}</span>
                                </div>
                            </div>
                        ))}
                        {charts.ordersByStatus.length === 0 && (
                            <div style={{ textAlign: 'center', color: MUTED }}>لا توجد بيانات</div>
                        )}
                    </div>
                </div>

                <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                    <h2 className="chart-title">المنتجات الأكثر مبيعاً (Top 5)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {charts.topProducts.map((p, i) => (
                            <div key={i} className="product-row">
                                <div className="product-name">{p.product_name_ar || p.product_name_en}</div>
                                <div className="product-count">{p.total_sold} قطعة</div>
                            </div>
                        ))}
                        {charts.topProducts.length === 0 && (
                            <div style={{ textAlign: 'center', color: MUTED }}>لا توجد مبيعات بعد</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
