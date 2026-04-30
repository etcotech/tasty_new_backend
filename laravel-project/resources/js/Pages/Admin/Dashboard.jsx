import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { usePage } from '@inertiajs/react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
    ShoppingBag, DollarSign, Clock, Package, TrendingUp, MapPin, 
    Utensils, Car, ShoppingCart
} from 'lucide-react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.08)';

const pageStyles = `
.dashboard-container { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.admin-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 2rem; color: ${TEXT}; }

/* KPI Cards with Colored Backgrounds */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.stat-card { 
    padding: 1.8rem; border-radius: 24px; display: flex; align-items: center; gap: 1.2rem;
    transition: transform 0.2s, box-shadow 0.2s; border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 4px 15px rgba(0,0,0,0.03); color: #FFF;
}
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
.stat-icon-box { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(255,255,255,0.2); }
.stat-content { display: flex; flex-direction: column; }
.stat-label { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.2rem; opacity: 0.9; }
.stat-value { font-size: 1.8rem; font-weight: 800; }
.stat-subtitle { font-size: 0.75rem; margin-top: 0.2rem; opacity: 0.8; }

/* KPI Card Themes (Soft Gradients) */
.stat-theme-blue   { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); }
.stat-theme-green  { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); }
.stat-theme-orange { background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); }
.stat-theme-gold   { background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); }

/* Chart and Containers */
.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
@media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }

.card-container { background: ${SURF}; padding: 1.8rem; border-radius: 24px; border: 1px solid ${BORDER}; box-shadow: 0 4px 20px rgba(0,0,0,0.03); height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; }
.card-title { font-size: 1.15rem; font-weight: 800; color: ${TEXT}; display: flex; align-items: center; gap: 0.6rem; }

/* Branch Stats */
.branch-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.2rem; }
.branch-card { 
    background: #FAFAFA; border: 1px solid ${BORDER}; border-radius: 18px; padding: 1.2rem;
    transition: all 0.2s;
}
.branch-card:hover { background: #FFF; border-color: ${GOLD}; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.branch-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px dashed ${BORDER}; }
.branch-name { font-weight: 800; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.branch-total { font-weight: 800; color: ${GOLD}; }

.type-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
.type-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: ${MUTED}; font-weight: 600; padding: 0.4rem; background: #FFF; border-radius: 8px; border: 1px solid rgba(0,0,0,0.03); }
.type-val { color: ${TEXT}; margin-right: auto; }

/* Top Products */
.product-item { display: flex; align-items: center; gap: 1rem; padding: 0.8rem; border-radius: 12px; background: #FBFBFB; margin-bottom: 0.8rem; }
.product-rank { width: 28px; height: 28px; background: ${GOLD}; color: #FFF; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
.product-info { flex: 1; }
.product-name { font-weight: 700; font-size: 0.9rem; color: ${TEXT}; }
.product-sold { font-size: 0.75rem; color: ${MUTED}; }
`;

export default function Dashboard({ stats, charts }) {
    const { auth } = usePage().props;

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

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#FFF', padding: '10px 15px', borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: MUTED }}>{payload[0].payload.day}</p>
                    <p style={{ margin: '5px 0 0', color: GOLD, fontWeight: 800, fontSize: '1.1rem' }}>
                        {parseFloat(payload[0].value).toLocaleString('ar-SA')} ر.س
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <AdminLayout title="لوحة الإحصائيات">
            <style>{pageStyles}</style>

            <div className="dashboard-container" dir="rtl">
                <h1 className="admin-title">نظرة عامة (Overview)</h1>

                {/* KPI Section for Super Admin */}
                {auth.user.role === 'super_admin' ? (
                    <div className="stats-grid">
                        <div className="stat-card stat-theme-blue">
                            <div className="stat-icon-box">
                                <ShoppingBag size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">إجمالي المطاعم</span>
                                <span className="stat-value">{stats.totalRestaurants}</span>
                                <span className="stat-subtitle">نشط: {stats.activeRestaurants} | موقوف: {stats.inactiveRestaurants}</span>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-theme-green">
                            <div className="stat-icon-box">
                                <DollarSign size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">مبيعات اليوم (المنصة)</span>
                                <span className="stat-value">{stats.revenueToday.toFixed(0)} ر.س</span>
                                <span className="stat-subtitle">إجمالي كل المطاعم</span>
                            </div>
                        </div>

                        <div className="stat-card stat-theme-orange">
                            <div className="stat-icon-box">
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">إجمالي الطلبات</span>
                                <span className="stat-value">{stats.totalOrders}</span>
                                <span className="stat-subtitle">منذ الانطلاق</span>
                            </div>
                        </div>

                        <div className="stat-card stat-theme-gold">
                            <div className="stat-icon-box">
                                <MapPin size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">إجمالي الفروع</span>
                                <span className="stat-value">{stats.totalBranches}</span>
                                <span className="stat-subtitle">فروع المطاعم</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* KPI Section for Restaurant Admin */
                    <div className="stats-grid">
                        <div className="stat-card stat-theme-blue">
                            <div className="stat-icon-box">
                                <ShoppingBag size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">طلبات اليوم</span>
                                <span className="stat-value">{stats.ordersToday}</span>
                                <span className="stat-subtitle">إجمالي اليوم</span>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-theme-green">
                            <div className="stat-icon-box">
                                <DollarSign size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">مبيعات اليوم</span>
                                <span className="stat-value">{stats.revenueToday.toFixed(0)} ر.س</span>
                                <span className="stat-subtitle">صافي الدخل</span>
                            </div>
                        </div>

                        <div className="stat-card stat-theme-orange">
                            <div className="stat-icon-box">
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">قيد التحضير</span>
                                <span className="stat-value">{stats.pendingOrders}</span>
                                <span className="stat-subtitle">بانتظار الانتهاء</span>
                            </div>
                        </div>

                        <div className="stat-card stat-theme-gold">
                            <div className="stat-icon-box">
                                <Package size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">المنتجات</span>
                                <span className="stat-value">{stats.totalProducts}</span>
                                <span className="stat-subtitle">في المنيو</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Revenue Section (Bar Chart) */}
                <div className="charts-grid">
                    <div className="card-container">
                        <div className="card-header">
                            <h2 className="card-title"><TrendingUp size={20} color={GOLD} /> إيرادات المنصة آخر 7 أيام</h2>
                        </div>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.revenueLast7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: MUTED, fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: MUTED, fontSize: 12, fontWeight: 700 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201, 168, 76, 0.05)' }} />
                                    <Bar 
                                        dataKey="total" 
                                        radius={[8, 8, 0, 0]}
                                    >
                                        {charts.revenueLast7Days.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 6 ? GOLD : '#C9A84C88'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {auth.user.role === 'super_admin' ? (
                        <div className="card-container">
                            <div className="card-header">
                                <h2 className="card-title"><Utensils size={20} color={GOLD} /> الأعلى مبيعاً (مطاعم)</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {charts.topRestaurants?.map((res, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#FAFAFA', padding: '1rem', borderRadius: '16px' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${GOLD}15`, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontWeight: 800, color: GOLD }}>{i+1}</span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: TEXT }}>{res.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: MUTED }}>{res.total_orders} طلب</div>
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: GOLD }}>{res.total_sales.toFixed(0)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="card-container">
                            <div className="card-header">
                                <h2 className="card-title"><Utensils size={20} color={GOLD} /> حالة الطلبات</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {charts.ordersByStatus?.map(s => (
                                    <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#FAFAFA', padding: '1rem', borderRadius: '16px' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${statusColors[s.status]}15`, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors[s.status] }}></div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: TEXT }}>{statusLabels[s.status] || s.status}</div>
                                            <div style={{ fontSize: '0.75rem', color: MUTED }}>{((s.count / stats.ordersToday) * 100 || 0).toFixed(0)}% من طلبات اليوم</div>
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: statusColors[s.status] }}>{s.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Branch/Product Statistics Section (Only for Restaurant Admin) */}
                {auth.user.role !== 'super_admin' && (
                    <>
                        <div className="card-container" style={{ marginBottom: '2.5rem' }}>
                            <div className="card-header">
                                <h2 className="card-title"><MapPin size={20} color={GOLD} /> إحصائيات الفروع (Branch Stats)</h2>
                            </div>
                            <div className="branch-grid">
                                {charts.branchStats?.map((b, i) => (
                                    <div key={i} className="branch-card">
                                        <div className="branch-header">
                                            <div className="branch-name">
                                                <MapPin size={16} color={GOLD} />
                                                {b.name}
                                            </div>
                                            <div className="branch-total">{b.total_sales.toFixed(2)} ر.س</div>
                                        </div>
                                        <div className="type-stats">
                                            <div className="type-item">
                                                <Utensils size={14} /> 
                                                <span>محلي</span>
                                                <span className="type-val">{b.dine_in}</span>
                                            </div>
                                            <div className="type-item">
                                                <ShoppingCart size={14} /> 
                                                <span>سفري</span>
                                                <span className="type-val">{b.takeaway}</span>
                                            </div>
                                            <div className="type-item">
                                                <Car size={14} /> 
                                                <span>سيارة</span>
                                                <span className="type-val">{b.car}</span>
                                            </div>
                                            <div className="type-item" style={{ background: 'rgba(201,168,76,0.05)', borderColor: GOLD }}>
                                                <ShoppingBag size={14} color={GOLD} /> 
                                                <span style={{ color: GOLD }}>الإجمالي</span>
                                                <span className="type-val" style={{ color: GOLD }}>{b.total_orders}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card-container">
                            <div className="card-header">
                                <h2 className="card-title"><Package size={20} color={GOLD} /> المنتجات الأكثر مبيعاً (Top 5)</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                {charts.topProducts?.map((p, i) => (
                                    <div key={i} className="product-item">
                                        <div className="product-rank">{i + 1}</div>
                                        <div className="product-info">
                                            <div className="product-name">{p.product_name_ar || p.product_name_en}</div>
                                            <div className="product-sold">{p.total_sold} طلب</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
