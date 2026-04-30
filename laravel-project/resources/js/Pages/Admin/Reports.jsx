import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { FileText, Download, TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

const GOLD = '#C9A84C';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const SURF = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.07)';

export default function Reports({ stats, topRestaurants }) {
    return (
        <AdminLayout title="التقارير">
            <div dir="rtl">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>تقارير المنصة (Platform Reports)</h1>
                        <p style={{ color: MUTED }}>تحليل شامل لأداء المنصة والمطاعم</p>
                    </div>
                    <button style={{ background: 'white', border: `1px solid ${BORDER}`, padding: '0.6rem 1.2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                        <Download size={18} />
                        تصدير التقرير (PDF)
                    </button>
                </div>

                {/* Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ background: SURF, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${BORDER}` }}>
                        <div style={{ color: MUTED, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={16} color={GOLD} /> إجمالي المطاعم
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalRestaurants}</div>
                        <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.5rem' }}>
                            نشط: {stats.activeRestaurants} | موقوف: {stats.inactiveRestaurants}
                        </div>
                    </div>
                    <div style={{ background: SURF, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${BORDER}` }}>
                        <div style={{ color: MUTED, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShoppingBag size={16} color={GOLD} /> إجمالي الطلبات
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalOrders}</div>
                        <div style={{ fontSize: '0.75rem', color: GOLD, marginTop: '0.5rem' }}>منذ انطلاق المنصة</div>
                    </div>
                    <div style={{ background: SURF, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${BORDER}` }}>
                        <div style={{ color: MUTED, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={16} color={GOLD} /> إجمالي المبيعات
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalSales.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>ر.س</span></div>
                        <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.5rem' }}>+12% عن الشهر الماضي</div>
                    </div>
                    <div style={{ background: SURF, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${BORDER}` }}>
                        <div style={{ color: MUTED, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={16} color={GOLD} /> متوسط الطلب
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{(stats.totalSales / (stats.totalOrders || 1)).toFixed(2)} <span style={{ fontSize: '0.9rem' }}>ر.س</span></div>
                        <div style={{ fontSize: '0.75rem', color: GOLD, marginTop: '0.5rem' }}>لكل عملية شراء</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    {/* Growth Chart */}
                    <div style={{ background: SURF, padding: '1.5rem', borderRadius: '20px', border: `1px solid ${BORDER}` }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>نمو المطاعم (آخر 6 أشهر)</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { month: 'يناير', count: 12 },
                                    { month: 'فبراير', count: 18 },
                                    { month: 'مارس', count: 25 },
                                    { month: 'أبريل', count: 32 },
                                    { month: 'مايو', count: 40 },
                                    { month: 'يونيو', count: stats.totalRestaurants },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div style={{ background: SURF, padding: '1.5rem', borderRadius: '20px', border: `1px solid ${BORDER}` }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>أفضل المطاعم أداءً</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {topRestaurants.map((res, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: '12px', background: '#FAFAFA' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: GOLD, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{res.name_ar}</div>
                                        <div style={{ fontSize: '0.7rem', color: MUTED }}>{res.orders_count} طلب</div>
                                    </div>
                                    <div style={{ fontWeight: 800, color: GOLD }}>
                                        {((res.orders_sum_total || 0)).toLocaleString()} <span style={{ fontSize: '0.7rem' }}>ر.س</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
