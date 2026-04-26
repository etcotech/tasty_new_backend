import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const css = `
.check-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.check-card { background: ${SURF}; border-radius: 12px; border: 1px solid ${BORDER}; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s; }
.check-card:hover { transform: translateY(-3px); }

.check-header { display: flex; justify-content: space-between; align-items: center; }
.check-label { font-weight: 700; color: ${MUTED}; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }

.check-value { font-size: 1.2rem; font-weight: 800; color: ${TEXT}; }

.status-indicator { width: 12px; height: 12px; border-radius: 50%; }
.status-success { background: #22C55E; box-shadow: 0 0 10px rgba(34, 197, 94, 0.4); }
.status-warning { background: #F59E0B; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
.status-danger { background: #EF4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }

.check-note { font-size: 0.85rem; color: ${MUTED}; line-height: 1.5; padding: 0.75rem; background: #F9FAFB; border-radius: 8px; border-right: 3px solid #DDD; }
.note-success { border-right-color: #22C55E; color: #166534; background: #F0FDF4; }
.note-warning { border-right-color: #F59E0B; color: #92400E; background: #FFFBEB; }
.note-danger { border-right-color: #EF4444; color: #991B1B; background: #FEF2F2; }

.summary-card { background: ${GOLD}; color: #fff; padding: 2rem; border-radius: 16px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
.summary-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
.summary-desc { opacity: 0.9; font-size: 1rem; }
`;

export default function SystemCheck({ checks }) {
    const totalChecks = checks.length;
    const successCount = checks.filter(c => c.status === 'success').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    const dangerCount = checks.filter(c => c.status === 'danger').length;

    const getNoteClass = (status) => {
        if (status === 'success') return 'note-success';
        if (status === 'warning') return 'note-warning';
        return 'note-danger';
    };

    const getStatusClass = (status) => {
        if (status === 'success') return 'status-success';
        if (status === 'warning') return 'status-warning';
        return 'status-danger';
    };

    return (
        <AdminLayout title="فحص جاهزية النظام">
            <style>{css}</style>

            <div className="summary-card" style={{ background: dangerCount > 0 ? '#EF4444' : warningCount > 0 ? '#F59E0B' : GOLD }}>
                <div>
                    <h1 className="summary-title">حالة النظام (System Readiness)</h1>
                    <p className="summary-desc">
                        {dangerCount > 0 
                            ? `تنبيه: يوجد ${dangerCount} مشاكل حرجة يجب إصلاحها قبل الإطلاق.` 
                            : warningCount > 0 
                                ? `ملاحظة: النظام يعمل ولكن يوجد ${warningCount} تحذيرات يفضل مراجعتها.`
                                : 'تهانينا! النظام جاهز تماماً للإنتاج.'
                        }
                    </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '2.5rem', fontWeight: 900, opacity: 0.5 }}>
                    {successCount}/{totalChecks}
                </div>
            </div>

            <div className="check-grid">
                {checks.map((check, idx) => (
                    <div key={idx} className="check-card">
                        <div className="check-header">
                            <span className="check-label">{check.label}</span>
                            <div className={`status-indicator ${getStatusClass(check.status)}`}></div>
                        </div>
                        <div className="check-value">
                            {check.value}
                        </div>
                        <div className={`check-note ${getNoteClass(check.status)}`}>
                            {check.note}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem', padding: '1.5rem', border: `1px dashed ${BORDER}`, borderRadius: '12px', color: MUTED, fontSize: '0.9rem' }}>
                <strong>💡 نصيحة للإنتاج:</strong> تأكد دائماً من تفعيل <code>HTTPS</code> وتحديث <code>APP_URL</code> إلى الرابط الفعلي للموقع. كما ينصح بتشغيل <code>php artisan optimize</code> لتحسين الأداء بعد كل تحديث.
            </div>
        </AdminLayout>
    );
}
