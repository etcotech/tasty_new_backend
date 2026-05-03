import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage } from '@inertiajs/react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const pageStyles = `
.ai-card { background: ${SURF}; border-radius: 16px; border: 1px solid ${BORDER}; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 1.5rem; }
.ai-title { font-size: 1.5rem; font-weight: 800; color: ${GOLD}; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.stat-box { background: #fcfbf8; border: 1px solid ${BORDER}; border-radius: 12px; padding: 1.2rem; text-align: center; }
.stat-value { display: block; font-size: 1.8rem; font-weight: 800; color: ${TEXT}; margin-bottom: 0.2rem; }
.stat-label { font-size: 0.85rem; color: ${MUTED}; font-weight: 600; }

.suggestion-box { background: linear-gradient(135deg, #fff9eb 0%, #fff 100%); border: 1px dashed ${GOLD}; border-radius: 12px; padding: 1.5rem; position: relative; min-height: 100px; }
.suggestion-text { font-size: 1.1rem; line-height: 1.7; color: ${TEXT}; font-weight: 600; }
.suggestion-placeholder { color: ${MUTED}; font-style: italic; }

.btn-ai { background: ${GOLD}; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.6rem; }
.btn-ai:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(201, 168, 76, 0.3); }
.btn-ai:disabled { background: #d1d5db; cursor: not-allowed; transform: none; }

.template-card { border: 1px solid ${BORDER}; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; background: white; }
.template-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.template-badge { background: #e8f5e9; color: #2e7d32; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; }
.template-body { font-size: 0.9rem; color: ${MUTED}; line-height: 1.5; }

.coming-soon { background: #f3f4f6; color: #6b7280; padding: 1.5rem; border-radius: 12px; text-align: center; font-weight: 600; border: 1px dashed #d1d5db; }
`;

export default function AIAutomation({ stats, recentLogs }) {
    const [suggestion, setSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateSuggestion = async () => {
        setIsLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/ai-automation/suggest-offer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            const data = await res.json();
            if (data.success) {
                setSuggestion(data.suggestion);
            } else {
                alert(data.error || 'فشل في الحصول على اقتراح');
            }
        } catch (e) {
            console.error(e);
            alert('خطأ في الاتصال بالخادم');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout title="الأتمتة والذكاء الاصطناعي">
            <style>{pageStyles}</style>
            
            <div className="ai-card">
                <h2 className="ai-title">
                    <svg style={{width: '28px', height: '28px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    الأتمتة والذكاء الاصطناعي
                </h2>

                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-value">{stats.weeklyOrdersCount}</span>
                        <span className="stat-label">طلبات هذا الأسبوع</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{stats.weeklyRevenue} ر.س</span>
                        <span className="stat-label">إيرادات الأسبوع</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{stats.returningCustomers}</span>
                        <span className="stat-label">عملاء متكررون</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value" style={{fontSize: '1.2rem'}}>{stats.topSellingItem}</span>
                        <span className="stat-label">الأكثر مبيعاً</span>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        اقتراح ذكي من AI
                        <button className="btn-ai" onClick={generateSuggestion} disabled={isLoading}>
                            {isLoading ? 'جاري التحليل...' : 'اقترح عرض اليوم ✨'}
                        </button>
                    </h3>
                    <div className="suggestion-box">
                        {suggestion ? (
                            <p className="suggestion-text">{suggestion}</p>
                        ) : (
                            <p className="suggestion-placeholder">انقر على الزر أعلاه لتحليل بيانات مبيعاتك واقتراح أفضل عرض ترويجي لليوم.</p>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>رسائل واتساب ذكية (قوالب)</h3>
                    <div className="template-card">
                        <div className="template-header">
                            <strong>شكراً لطلبك</strong>
                            <span className="template-badge">نشط ✅</span>
                        </div>
                        <p className="template-body">مرحباً [اسم العميل]، شكراً لطلبك من [اسم المطعم]. طلبك رقم [رقم الطلب] قيد التحضير الآن!</p>
                    </div>
                    <div className="template-card">
                        <div className="template-header">
                            <strong>طلب تقييم</strong>
                            <span className="template-badge">نشط ✅</span>
                        </div>
                        <p className="template-body">كيف كانت تجربتك؟ نود سماع رأيك في [اسم المطعم]. يمكنك تقييمنا هنا: [رابط التقييم]</p>
                    </div>
                    <div className="coming-soon">
                        🚀 قريباً: إرسال رسائل تلقائية للعملاء غير النشطين (Reactivation) لاستعادتهم بعد 7-30 يوم.
                    </div>
                </div>
            </div>

            {recentLogs.length > 0 && (
                <div className="ai-card">
                    <h3 style={{ marginBottom: '1rem' }}>سجل الاقتراحات الأخيرة</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.8rem' }}>التاريخ</th>
                                <th style={{ padding: '0.8rem' }}>الاقتراح</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLogs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.8rem', color: MUTED }}>{new Date(log.created_at).toLocaleDateString('ar-SA')}</td>
                                    <td style={{ padding: '0.8rem' }}>{log.output_text.substring(0, 100)}...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
