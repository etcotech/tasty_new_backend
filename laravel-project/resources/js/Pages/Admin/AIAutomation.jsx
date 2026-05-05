import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage, router } from '@inertiajs/react';

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
.suggestion-title { font-size: 1.2rem; font-weight: 800; color: ${GOLD}; margin-bottom: 0.5rem; }
.suggestion-text { font-size: 1.1rem; line-height: 1.7; color: ${TEXT}; font-weight: 600; margin-bottom: 1rem; }
.suggestion-meta { font-size: 0.9rem; color: ${MUTED}; display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; }
.meta-item { background: rgba(201, 168, 76, 0.1); padding: 0.2rem 0.6rem; border-radius: 6px; }
.suggestion-placeholder { color: ${MUTED}; font-style: italic; }

.btn-ai { background: ${GOLD}; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.6rem; }
.btn-ai:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(201, 168, 76, 0.3); }
.btn-ai:disabled { background: #d1d5db; cursor: not-allowed; transform: none; }

.btn-outline { background: transparent; color: ${GOLD}; border: 1.5px solid ${GOLD}; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background: rgba(201, 168, 76, 0.05); }

.campaign-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.campaign-table th { text-align: right; padding: 1rem; border-bottom: 2px solid ${BORDER}; color: ${MUTED}; font-size: 0.85rem; }
.campaign-table td { padding: 1rem; border-bottom: 1px solid ${BORDER}; vertical-align: middle; }

.status-badge { padding: 0.3rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.status-draft { background: #f3f4f6; color: #6b7280; }
.status-scheduled { background: #e3f2fd; color: #1976d2; }
.status-sending { display: none; }
.status-sent { background: #e8f5e9; color: #2e7d32; }
.status-failed { background: #ffebee; color: #c62828; }
.status-cancelled { background: #f3f4f6; color: #9ca3af; text-decoration: line-through; }

.template-card { border: 1px solid ${BORDER}; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; background: white; }
.template-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.template-badge { background: #e8f5e9; color: #2e7d32; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; }
.template-body { font-size: 0.9rem; color: ${MUTED}; line-height: 1.5; }

.coming-soon { background: #f3f4f6; color: #6b7280; padding: 1.5rem; border-radius: 12px; text-align: center; font-weight: 600; border: 1px dashed #d1d5db; }

.save-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid ${BORDER}; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.select-target { padding: 0.7rem; border-radius: 8px; border: 1px solid ${BORDER}; font-family: inherit; font-weight: 600; color: ${TEXT}; }

/* Modal Styles */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal-content { background: white; padding: 2rem; border-radius: 20px; width: 100%; max-width: 500px; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
.modal-header { margin-bottom: 1.5rem; }
.modal-title { font-size: 1.4rem; font-weight: 800; color: ${GOLD}; }
.modal-close { position: absolute; top: 1rem; left: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${MUTED}; }
.modal-field { margin-bottom: 1.2rem; }
.modal-label { display: block; font-size: 0.9rem; font-weight: 700; color: ${MUTED}; margin-bottom: 0.4rem; }
.modal-value { font-size: 1rem; color: ${TEXT}; font-weight: 600; background: #fcfbf8; padding: 0.8rem; border-radius: 8px; border: 1px solid ${BORDER}; }
.modal-input { width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid ${BORDER}; font-family: inherit; font-size: 1rem; outline: none; }
.modal-input:focus { border-color: ${GOLD}; box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.1); }
.modal-actions { display: flex; gap: 1rem; margin-top: 2rem; justify-content: flex-end; }
`;

export default function AIAutomation({ stats, recentLogs, campaigns }) {
    const [suggestion, setSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [targetAudience, setTargetAudience] = useState('inactive_30');
    const [editableTitle, setEditableTitle] = useState('');
    const [editableMessage, setEditableMessage] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewing, setIsPreviewing] = useState(false);

    // Modal States
    const [viewModal, setViewModal] = useState(null);
    const [scheduleModal, setScheduleModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');

    const fetchPreview = async () => {
        setIsPreviewing(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/ai-campaigns/preview-target', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    target_audience: targetAudience,
                    message: editableMessage
                })
            });
            const data = await res.json();
            if (data.success) {
                setPreviewData(data);
            }
        } catch (e) {
            console.error('Preview error', e);
        } finally {
            setIsPreviewing(false);
        }
    };

    useEffect(() => {
        if (!suggestion || !editableMessage) return;
        const timer = setTimeout(() => {
            fetchPreview();
        }, 800);
        return () => clearTimeout(timer);
    }, [editableMessage, targetAudience, suggestion]);

    const generateSuggestion = async () => {
        setIsLoading(true);
        setSuggestion(null);
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
                setEditableTitle(data.suggestion?.offer_title || '');
                setEditableMessage(data.suggestion?.offer_message || '');
                if (data.suggestion && data.suggestion.target_audience) {
                    setTargetAudience(data.suggestion.target_audience);
                }
                if (data.campaign) {
                    alert(data.message || 'تم إنشاء حملة ذكية كمسودة');
                    router.reload();
                }
            } else {
                alert(data.message || data.error || 'فشل في توليد الاقتراح');
            }
        } catch (e) {
            console.error(e);
            alert('خطأ في الاتصال بالخادم: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAsCampaign = async () => {
        if (!suggestion) return;
        setIsSaving(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/ai-campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    title: editableTitle,
                    message: editableMessage,
                    suggested_time_window: suggestion.suggested_time_window,
                    reason: suggestion.target_reason,
                    target_audience: targetAudience
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('تم حفظ الحملة كمسودة');
                router.reload();
            } else {
                alert('فشل في حفظ الحملة: ' + (data.error || data.message || ''));
            }
        } catch (e) {
            console.error(e);
            alert('خطأ في الاتصال بالخادم: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const viewCampaign = async (id) => {
        try {
            const res = await fetch(`/admin/ai-campaigns/${id}`);
            const data = await res.json();
            if (data.success) {
                setViewModal({ ...data.campaign, analytics: data.analytics });
            }
        } catch (e) {
            alert('فشل تحميل تفاصيل الحملة');
        }
    };

    const submitSchedule = async () => {
        if (!scheduledDate) return alert('يرجى اختيار التاريخ والوقت');
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/admin/ai-campaigns/${scheduleModal.id}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ scheduled_at: scheduledDate })
            });
            const data = await res.json();
            if (data.success) {
                alert('تم جدولة الحملة بنجاح');
                setScheduleModal(null);
                router.reload();
            } else {
                alert(data.message || 'فشل في جدولة الحملة');
            }
        } catch (e) {
            alert('خطأ في الاتصال بالخادم');
        }
    };

    const sendNow = async (id) => {
        if (confirm('هل أنت متأكد من إرسال هذه الحملة الآن؟')) {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const res = await fetch(`/admin/ai-campaigns/${id}/send-now`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    }
                });
                const data = await res.json();
                if (data.success) {
                    alert('تم إرسال الحملة إلى n8n بنجاح');
                } else {
                    alert('فشل الإرسال: ' + data.message);
                }
                router.reload();
            } catch (e) {
                alert('خطأ في الاتصال بالخادم');
            }
        }
    };

    const cancelCampaign = async (id) => {
        if (confirm('هل أنت متأكد من إلغاء هذه الحملة؟')) {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const res = await fetch(`/admin/ai-campaigns/${id}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    }
                });
                const data = await res.json();
                if (data.success) {
                    alert('تم تجاهل/إلغاء الحملة');
                    router.reload();
                }
            } catch (e) {
                alert('خطأ في الاتصال بالخادم');
            }
        }
    };

    const saveEdit = async () => {
        if (!editModal) return;
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/admin/ai-campaigns/${editModal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    title: editModal.title,
                    message: editModal.message,
                    target_audience: editModal.target_audience
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('تم التحديث بنجاح');
                setEditModal(null);
                router.reload();
            } else {
                alert('فشل في التحديث');
            }
        } catch (e) {
            alert('خطأ في الاتصال');
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'draft': 'مسودة',
            'suggested': 'اقتراح ذكي',
            'scheduled': 'مجدولة',

            'sent': 'تم الإرسال',
            'failed': 'فشلت',
            'cancelled': 'ملغاة'
        };
        return labels[status] || status;
    };

    const getTargetLabel = (type) => {
        const labels = {
            'all': 'كل العملاء',
            'repeat': 'العملاء المتكررون',
            'inactive_7': 'العملاء غير النشطين 7 أيام',
            'inactive_30': 'العملاء غير النشطين 30 يوم',
            'all_customers': 'كل العملاء',
            'inactive_customers': 'العملاء غير النشطين',
            'repeat_customers': 'العملاء المتكررون'
        };
        return labels[type] || type;
    };

    const suggestedCampaigns = campaigns ? campaigns.filter(c => c.status === 'suggested') : [];
    const otherCampaigns = campaigns ? campaigns.filter(c => c.status !== 'suggested') : [];

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
                            <>
                                <input 
                                    className="modal-input" 
                                    style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.5rem', background: 'transparent' }}
                                    value={editableTitle} 
                                    onChange={(e) => setEditableTitle(e.target.value)} 
                                    placeholder="عنوان الحملة"
                                />
                                <textarea 
                                    className="modal-input" 
                                    style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text)', fontWeight: 600, marginBottom: '1rem', minHeight: '100px', resize: 'vertical', background: 'transparent' }}
                                    value={editableMessage} 
                                    onChange={(e) => setEditableMessage(e.target.value)} 
                                    placeholder="نص رسالة الحملة"
                                />
                                <div className="suggestion-meta">
                                    <span className="meta-item">🕒 {suggestion.suggested_time_window}</span>
                                    <span className="meta-item">🎯 {suggestion.target_reason}</span>
                                    {suggestion.suggested_products?.map((p, i) => (
                                        <span key={i} className="meta-item">📦 {p}</span>
                                    ))}
                                </div>

                                <div className="save-section">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>الجمهور المستهدف التلقائي:</label>
                                        <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(201, 168, 76, 0.1)', color: 'var(--gold)', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem' }}>
                                            {getTargetLabel(targetAudience)}
                                        </div>
                                    </div>
                                    <button className="btn-ai" onClick={saveAsCampaign} disabled={isSaving || (previewData && previewData.count === 0)}>
                                        {isSaving ? 'جاري الحفظ...' : 'حفظ كحملة 💾'}
                                    </button>
                                </div>
                                {previewData && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            العدد المستهدف: <span style={{ color: 'var(--gold)' }}>{previewData.count}</span> عملاء
                                            {isPreviewing && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>(تحديث...)</span>}
                                        </div>
                                        {previewData.count === 0 ? (
                                            <div style={{ color: '#e74c3c', fontWeight: 600 }}>⚠️ لا يوجد عملاء مستهدفين</div>
                                        ) : (
                                            <>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>مثال للرسالة ({previewData.customer_name}):</div>
                                                <div style={{ background: '#fff', padding: '0.8rem', borderRadius: '6px', fontSize: '0.95rem', whiteSpace: 'pre-wrap', border: '1px solid var(--border)' }}>
                                                    {previewData.preview_message}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="suggestion-placeholder">انقر على الزر أعلاه لتحليل بيانات مبيعاتك واقتراح أفضل عرض ترويجي لليوم.</p>
                        )}
                    </div>
                </div>

                {suggestedCampaigns.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>💡</span> اقتراحات ذكية جديدة
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {suggestedCampaigns.map(campaign => (
                                <div key={campaign.id} style={{ background: '#fff9eb', border: '1px solid var(--gold)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(201, 168, 76, 0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.3rem' }}>{campaign.title}</h4>
                                            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', gap: '1rem' }}>
                                                <span>🎯 العدد المستهدف: <strong>{campaign.target_count || 0} عميل</strong> ({getTargetLabel(campaign.target_audience)})</span>
                                                <span>🕒 أفضل وقت للإرسال: <strong>{campaign.suggested_time_window}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                                        {campaign.message}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="btn-ai" onClick={() => sendNow(campaign.id)}>إرسال الآن 🚀</button>
                                        <button className="btn-outline" onClick={() => setEditModal(campaign)}>تعديل الحملة ✏️</button>
                                        <button className="btn-outline" onClick={() => cancelCampaign(campaign.id)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>تجاهل ❌</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>الحملات الذكية</h3>
                    <div className="ai-card" style={{ padding: '0', overflowX: 'auto' }}>
                        <table className="campaign-table">
                            <thead>
                                <tr>
                                    <th>العنوان</th>
                                    <th>الجمهور</th>
                                    <th>الحالة</th>
                                    <th>مجدولة/مرسلة</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {otherCampaigns.length > 0 ? (
                                    otherCampaigns.map(campaign => (
                                        <tr key={campaign.id}>
                                            <td style={{ fontWeight: 600 }}>{campaign.title}</td>
                                            <td>{getTargetLabel(campaign.target_audience)}</td>
                                            <td>
                                                <span className={`status-badge status-${campaign.status}`}>
                                                    {getStatusLabel(campaign.status)}
                                                </span>
                                            </td>
                                            <td style={{ color: MUTED, fontSize: '0.85rem' }}>
                                                {campaign.status === 'sent' ? (
                                                    <span>تم الإرسال في: {new Date(campaign.sent_at).toLocaleString('ar-SA')}</span>
                                                ) : campaign.scheduled_at ? (
                                                    <span>مجدولة لـ: {new Date(campaign.scheduled_at).toLocaleString('ar-SA')}</span>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button onClick={() => viewCampaign(campaign.id)} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>عرض</button>
                                                
                                                {campaign.status === 'draft' && (
                                                    <button onClick={() => setScheduleModal(campaign)} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>جدولة</button>
                                                )}
                                                
                                                {['scheduled', 'failed'].includes(campaign.status) && (
                                                    <button 
                                                        onClick={() => sendNow(campaign.id)} 
                                                        className="btn-outline" 
                                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'rgba(201, 168, 76, 0.1)' }}
                                                    >
                                                        إرسال الآن
                                                    </button>
                                                )}
                                                
                                                {['draft', 'scheduled', 'failed'].includes(campaign.status) && (
                                                    <button 
                                                        onClick={() => cancelCampaign(campaign.id)}
                                                        className="btn-outline" 
                                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
                                                    >
                                                        إلغاء
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: MUTED }}>
                                            لا يوجد حملات ذكية بعد.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {editModal && (
                    <div className="modal-overlay" onClick={() => setEditModal(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setEditModal(null)}>×</button>
                            <div className="modal-header">
                                <h2 className="modal-title">تعديل الحملة</h2>
                            </div>
                            <div className="modal-field">
                                <span className="modal-label">عنوان الحملة</span>
                                <input 
                                    className="modal-input" 
                                    value={editModal.title}
                                    onChange={e => setEditModal({...editModal, title: e.target.value})}
                                />
                            </div>
                            <div className="modal-field">
                                <span className="modal-label">نص الرسالة</span>
                                <textarea 
                                    className="modal-input" 
                                    style={{ minHeight: '120px', resize: 'vertical' }}
                                    value={editModal.message}
                                    onChange={e => setEditModal({...editModal, message: e.target.value})}
                                />
                            </div>
                            <div className="modal-field">
                                <span className="modal-label">الجمهور المستهدف</span>
                                <select 
                                    className="modal-input" 
                                    value={editModal.target_audience} 
                                    onChange={(e) => setEditModal({...editModal, target_audience: e.target.value})}
                                >
                                    <option value="all">كل العملاء</option>
                                    <option value="repeat">العملاء المتكررون</option>
                                    <option value="inactive_7">العملاء غير النشطين 7 أيام</option>
                                    <option value="inactive_30">العملاء غير النشطين 30 يوم</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-outline" onClick={() => setEditModal(null)}>إلغاء</button>
                                <button className="btn-ai" onClick={saveEdit}>حفظ التعديلات 💾</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Modal */}
                {viewModal && (
                    <div className="modal-overlay" onClick={() => setViewModal(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setViewModal(null)}>×</button>
                            <div className="modal-header">
                                <h2 className="modal-title">تفاصيل الحملة</h2>
                            </div>
                            <div className="modal-field">
                                <span className="modal-label">العنوان</span>
                                <div className="modal-value">{viewModal.title}</div>
                            </div>
                            <div className="modal-field">
                                <span className="modal-label">الرسالة</span>
                                <div className="modal-value" style={{whiteSpace: 'pre-wrap'}}>{viewModal.message}</div>
                            </div>
                            <div className="modal-field">
                                <span className="modal-label">الجمهور المستهدف</span>
                                <div className="modal-value">{getTargetLabel(viewModal.target_audience)}</div>
                            </div>
                            
                            {viewModal.status === 'sent' && (
                                <div className="modal-field" style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '12px', border: '1px solid #c8e6c9' }}>
                                    <span className="modal-label" style={{ color: '#2e7d32', marginBottom: '1rem', fontSize: '1rem', fontWeight: '800' }}>إحصائيات الحملة 📈</span>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '1rem', borderRadius: '8px' }}>
                                            <small style={{ color: MUTED, display: 'block', marginBottom: '0.3rem' }}>العملاء المستهدفين</small>
                                            <strong style={{ fontSize: '1.3rem', color: '#1A1714' }}>{viewModal.analytics?.customers_reached || viewModal.target_count || 0}</strong>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '1rem', borderRadius: '8px' }}>
                                            <small style={{ color: MUTED, display: 'block', marginBottom: '0.3rem' }}>الطلبات بعد الإرسال</small>
                                            <strong style={{ fontSize: '1.3rem', color: '#1A1714' }}>{viewModal.analytics?.orders_count || 0}</strong>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <small style={{ color: MUTED, display: 'block', marginBottom: '0.3rem' }}>العوائد المحققة</small>
                                                <strong style={{ fontSize: '1.6rem', color: '#2e7d32' }}>{viewModal.analytics?.revenue_generated || 0} ر.س</strong>
                                            </div>
                                            <div style={{ fontSize: '2rem' }}>💰</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #c8e6c9', fontSize: '0.85rem', color: MUTED, textAlign: 'center' }}>
                                        تاريخ الإرسال: {new Date(viewModal.sent_at).toLocaleString('ar-SA')}
                                    </div>
                                </div>
                            )}

                            {viewModal.status === 'failed' && (
                                <div className="modal-field" style={{ background: '#ffebee', padding: '1rem', borderRadius: '12px' }}>
                                    <span className="modal-label" style={{ color: '#c62828' }}>سبب الفشل</span>
                                    <div style={{ color: '#c62828', fontWeight: 700 }}>{viewModal.failure_reason}</div>
                                </div>
                            )}

                            <div className="modal-field">
                                <span className="modal-label">الفترة الزمنية المقترحة (AI)</span>
                                <div className="modal-value">{viewModal.suggested_time_window || 'غير محدد'}</div>
                            </div>
                            <div className="modal-field">
                                <span className="modal-label">السبب (AI)</span>
                                <div className="modal-value">{viewModal.reason || 'غير متوفر'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Modal */}
                {scheduleModal && (
                    <div className="modal-overlay" onClick={() => setScheduleModal(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setScheduleModal(null)}>×</button>
                            <div className="modal-header">
                                <h2 className="modal-title">جدولة الحملة</h2>
                            </div>
                            <div className="modal-field">
                                <span className="modal-label">اختر التاريخ والوقت للإرسال</span>
                                <input 
                                    type="datetime-local" 
                                    className="modal-input" 
                                    value={scheduledDate}
                                    onChange={e => setScheduledDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-outline" onClick={() => setScheduleModal(null)}>إلغاء</button>
                                <button className="btn-ai" onClick={submitSchedule}>تأكيد الجدولة</button>
                            </div>
                        </div>
                    </div>
                )}

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
        </AdminLayout>
    );
}
