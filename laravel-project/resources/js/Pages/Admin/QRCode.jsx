import React, { useRef, useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, usePage, router } from '@inertiajs/react';

/* ─── colour tokens ─── */
const GOLD   = '#C9A84C';
const BORDER = 'rgba(0,0,0,0.07)';
const SURF   = '#FFFFFF';
const MUTED  = '#6B6460';

/* ─── tiny QR renderer via Google Charts API (no install needed) ─── */
const QR_SIZE = 200;
function qrUrl(text) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=1a1714&margin=10`;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
.qr-page * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }

.qr-grid { display: grid; grid-template-columns: 340px 1fr; gap: 2rem; align-items: start; }
@media(max-width:900px){ .qr-grid { grid-template-columns: 1fr; } }

/* Form card */
.form-card { background:${SURF}; border-radius:16px; border:1px solid ${BORDER};
  box-shadow:0 4px 20px rgba(0,0,0,0.05); padding:1.8rem; position:sticky; top:2rem; }
.form-card h2 { font-size:1.2rem; font-weight:800; margin-bottom:1.5rem; }
.form-group { margin-bottom:1.2rem; }
.form-label { display:block; font-weight:700; font-size:.85rem; color:${MUTED}; margin-bottom:.4rem; }
.form-input, .form-select {
  width:100%; height:44px; padding:0 12px; border:1.5px solid ${BORDER};
  border-radius:10px; font-size:.95rem; font-family:inherit; outline:none;
  transition:border-color .2s;
}
.form-input:focus, .form-select:focus { border-color:${GOLD}; box-shadow:0 0 0 3px rgba(201,168,76,.12); }
.btn-create { width:100%; height:48px; background:${GOLD}; color:#fff; border:none;
  border-radius:12px; font-size:1rem; font-weight:700; cursor:pointer;
  transition:all .2s; font-family:inherit; }
.btn-create:hover { background:#b8942f; transform:translateY(-2px); }
.btn-create:disabled { opacity:.65; cursor:not-allowed; transform:none; }

/* Cards grid */
.cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.5rem; }
.qr-card {
  background:${SURF}; border-radius:16px; border:1px solid ${BORDER};
  box-shadow:0 4px 16px rgba(0,0,0,0.04); overflow:hidden; display:flex;
  flex-direction:column; align-items:center; padding:1.5rem; gap:.8rem;
  transition:box-shadow .2s; position:relative;
}
.qr-card:hover { box-shadow:0 8px 28px rgba(0,0,0,0.09); }
.qr-card img { border-radius:10px; border:1px solid ${BORDER}; }
.qr-card-info { text-align:center; width:100%; }
.qr-card-name { font-weight:700; font-size:1rem; margin-bottom:0.2rem; }
.qr-card-sub { font-size:.82rem; color:${MUTED}; }
.qr-actions { display:flex; gap:.4rem; flex-wrap:wrap; justify-content:center; width:100%; margin-top:0.5rem; }
.btn-action { height:36px; padding:0 10px; border-radius:8px; border:1.5px solid ${BORDER};
  font-size:.75rem; font-weight:700; cursor:pointer; background:${SURF};
  font-family:inherit; transition:all .2s; display:flex; align-items:center; gap:.4rem; }
.btn-action:hover { border-color:${GOLD}; color:${GOLD}; }
.btn-action.danger:hover { border-color:#e74c3c; color:#e74c3c; }

/* Toast */
.qr-toast {
  position:fixed; top:2rem; left:50%; transform:translateX(-50%);
  background:#fff; border:1px solid ${BORDER}; border-radius:12px;
  box-shadow:0 10px 30px rgba(0,0,0,.12); padding:.9rem 1.8rem;
  font-weight:700; z-index:9999; animation:toastIn .3s ease;
}
@keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

/* Print styles */
@media print {
  body * { visibility:hidden; }
  .print-area, .print-area * { visibility:visible; }
  .print-area { position:fixed; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; background:#fff; }
}

.status-badge { font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 800; display: inline-block; vertical-align: middle; }
.status-badge.active { background: #DEF7EC; color: #03543F; }
.status-badge.old { background: #FEF3C7; color: #92400E; }
.status-badge.deleted { background: #FDE2E2; color: #9B1C1C; }

.meta-row { width:100%; font-size:0.75rem; color:${MUTED}; display:flex; flex-direction:column; gap:0.25rem; border-top:1px solid ${BORDER}; padding-top:0.75rem; margin-top:0.25rem; }
.meta-item { display:flex; justify-content:space-between; gap:1rem; }
.meta-val { color:${GOLD}; font-weight:700; direction:ltr; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
`;

/* ─── Print overlay ─── */
function PrintOverlay({ qr, restaurant, onClose }) {
    useEffect(() => {
        const t = setTimeout(() => window.print(), 400);
        return () => clearTimeout(t);
    }, []);
    return (
        <div style={{ position:'fixed', inset:0, background:'#fff', zIndex:9999,
            display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1.5rem' }}>
            <div className="print-area" style={{ textAlign:'center' }}>
                <img src="/images/tasty-logo.png" alt="logo" style={{ height:52, marginBottom:'1rem' }} />
                <div style={{ fontSize:'1.4rem', fontWeight:800 }}>{restaurant?.name_ar}</div>
                {qr.branch ? (
                    <div style={{ color: MUTED, marginTop:'.3rem' }}>{qr.branch.name_ar}</div>
                ) : (
                    <div style={{ color: MUTED, marginTop:'.3rem' }}>بدون فرع</div>
                )}
                <img src={qrUrl(qr.url)} alt="QR Code" style={{ marginTop:'1.5rem', borderRadius:12 }} />
                <div style={{ fontSize:'.75rem', color: MUTED, marginTop:'1rem', direction:'ltr' }}>{qr.url}</div>
            </div>
            <button
                onClick={onClose}
                style={{ position:'fixed', top:'1rem', left:'1rem',
                    padding:'.5rem 1.2rem', borderRadius:8, border:`1px solid ${BORDER}`,
                    cursor:'pointer', background:'#fff', fontFamily:'inherit', fontWeight:700 }}
                className="no-print"
            >
                ✕ إغلاق
            </button>
        </div>
    );
}

const StatusBadge = ({ status }) => {
    let cls = 'active';
    if (status === 'قديم') cls = 'old';
    if (status === 'محذوف') cls = 'deleted';
    return <span className={`status-badge ${cls}`}>{status}</span>;
};

export default function QRCode({ qrCodes, systemQrs = [], branches, restaurant }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, reset, errors } = useForm({
        branch_id: '',
        name:      '',
    });

    const [toast, setToast]     = useState(null);
    const [printQr, setPrintQr] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.qr-codes.store'), {
            onSuccess: () => { reset('name'); },
        });
    };

    const handleDelete = (id, trashed) => {
        const msg = trashed ? 'هل تريد حذف هذا الرمز نهائياً؟' : 'هل تريد نقل هذا الرمز إلى المحذوفات؟';
        if (!confirm(msg)) return;
        router.delete(route('admin.qr-codes.destroy', id));
    };

    const handleRegenerate = (id) => {
        if (!confirm('سيتم تحديث الرابط ليتوافق مع النطاق الحالي والفرع المختار. هل تريد الاستمرار؟')) return;
        router.post(route('admin.qr-codes.regenerate', id));
    };

    const handleRegenerateAll = () => {
        if (!confirm('سيتم تحديث جميع الروابط لتتوافق مع النطاق الحالي. مفيد بعد تغيير الدومين. هل تريد الاستمرار؟')) return;
        router.post(route('admin.qr-codes.regenerate-all'));
    };

    const handleCopy = (url) => {
        navigator.clipboard.writeText(url);
        setToast('تم نسخ الرابط بنجاح 📋');
        setTimeout(() => setToast(null), 3000);
    };

    const handleDownload = (qr) => {
        const url = qrUrl(qr.url);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `qr-${qr.id}.png`;
        a.target   = '_blank';
        a.click();
    };

    return (
        <AdminLayout title="رموز QR">
            <style>{css}</style>

            {toast && <div className="qr-toast">✅ {toast}</div>}
            {printQr && (
                <PrintOverlay
                    qr={printQr}
                    restaurant={restaurant}
                    onClose={() => setPrintQr(null)}
                />
            )}

            <div className="qr-page" dir="rtl">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.8rem' }}>
                    <div>
                        <h1 style={{ fontSize:'1.8rem', fontWeight:800 }}>رموز QR</h1>
                        <p style={{ color:MUTED, fontSize:'0.9rem', marginTop:'0.2rem' }}>إدارة دورة حياة رموز المنيو وتحديث الروابط</p>
                    </div>
                    <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                        <button 
                            className="btn-action" 
                            style={{ background:GOLD, color:'#fff', border:'none', height:'42px', padding:'0 1.25rem' }}
                            onClick={handleRegenerateAll}
                        >
                            🔄 تحديث الكل
                        </button>
                        <span style={{ fontSize:'.9rem', color:MUTED, background:'rgba(201,168,76,.1)',
                            padding:'.4rem 1rem', borderRadius:100, fontWeight:700 }}>
                            {qrCodes.length + systemQrs.length} رمز
                        </span>
                    </div>
                </div>

                <div className="qr-grid">
                    {/* ── CREATE FORM ── */}
                    <div className="form-card">
                        <h2>إنشاء رمز جديد</h2>
                        <form onSubmit={submit}>
                            {branches.length > 0 && (
                                <div className="form-group">
                                    <label className="form-label">الفرع (اختياري)</label>
                                    <select
                                        className="form-select"
                                        value={data.branch_id}
                                        onChange={e => setData('branch_id', e.target.value)}
                                    >
                                        <option value="">رابط المطعم العام (بدون فرع)</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name_ar}</option>
                                        ))}
                                    </select>
                                    {errors.branch_id && <div style={{ color:'#e74c3c', fontSize:'.8rem', marginTop:'.3rem' }}>{errors.branch_id}</div>}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">تسمية (اختياري)</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="مثال: منيو الفرع الرئيسي"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-create"
                                disabled={processing}
                            >
                                {processing ? 'جاري الإنشاء...' : 'إنشاء الرمز ✨'}
                            </button>
                        </form>
                    </div>

                    {/* ── QR LIST ── */}
                    <div>
                        {systemQrs.length > 0 && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem', color: GOLD }}>رموز النظام الأساسية</h2>
                                <div className="cards-grid">
                                    {systemQrs.map(qr => (
                                        <div key={qr.id} className="qr-card" style={{ borderColor: 'rgba(201,168,76,0.3)', background: '#FFFCF5' }}>
                                            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                                                <StatusBadge status={qr.status_label} />
                                            </div>
                                            <img
                                                src={qrUrl(qr.url)}
                                                alt={`QR ${qr.id}`}
                                                width={QR_SIZE}
                                                height={QR_SIZE}
                                            />
                                            <div className="qr-card-info">
                                                <div className="qr-card-name">{qr.name}</div>
                                                <div className="qr-card-sub">{qr.branch ? qr.branch.name_ar : 'المطعم الرئيسي'}</div>
                                            </div>
                                            <div className="qr-actions">
                                                <button className="btn-action" onClick={() => handleCopy(qr.url)} title="نسخ الرابط">🔗 نسخ</button>
                                                <button className="btn-action" onClick={() => handleDownload(qr)}>⬇️ تحميل</button>
                                                <button className="btn-action" onClick={() => setPrintQr(qr)}>🖨️ طباعة</button>
                                            </div>
                                            <div className="meta-row">
                                                <div className="meta-item"><span>الرابط:</span> <span className="meta-val" title={qr.url}>{qr.url}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem' }}>رموز مخصصة</h2>
                        {qrCodes.length === 0 ? (
                            <div className="empty-state">
                                <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="5" height="5" x="3" y="3" rx="1" />
                                        <rect width="5" height="5" x="16" y="3" rx="1" />
                                        <rect width="5" height="5" x="3" y="16" rx="1" />
                                        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                                        <path d="M21 21v.01" />
                                        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                                        <path d="M3 12h.01" />
                                        <path d="M12 3h.01" />
                                        <path d="M12 16v.01" />
                                        <path d="M16 12h1" />
                                        <path d="M21 12v.01" />
                                        <path d="M12 21v-1" />
                                    </svg>
                                </div>
                                <div style={{ fontWeight:700, fontSize:'1.1rem' }}>لا توجد رموز QR بعد</div>
                                <div style={{ marginTop:'.5rem', fontSize:'.9rem' }}>أنشئ أول رمز من النموذج على اليمين</div>
                            </div>
                        ) : (
                            <div className="cards-grid">
                                {qrCodes.map(qr => (
                                    <div key={qr.id} className="qr-card" style={{ opacity: qr.deleted_at ? 0.7 : 1 }}>
                                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                                            <StatusBadge status={qr.status_label} />
                                        </div>
                                        <img
                                            src={qrUrl(qr.url)}
                                            alt={`QR ${qr.id}`}
                                            width={QR_SIZE}
                                            height={QR_SIZE}
                                        />

                                        <div className="qr-card-info">
                                            <div className="qr-card-name">
                                                {qr.name || (qr.branch ? qr.branch.name_ar : 'رمز المنيو العام')}
                                            </div>
                                            <div className="qr-card-sub">
                                                {qr.branch ? qr.branch.name_ar : 'بدون فرع'}
                                            </div>
                                        </div>

                                        <div className="qr-actions">
                                            <button className="btn-action" onClick={() => handleCopy(qr.url)} title="نسخ الرابط">🔗 نسخ</button>
                                            <button className="btn-action" onClick={() => handleDownload(qr)} title="تحميل">⬇️ تحميل</button>
                                            <button className="btn-action" onClick={() => setPrintQr(qr)} title="طباعة">🖨️ طباعة</button>
                                            <button className="btn-action" onClick={() => handleRegenerate(qr.id)} title="تحديث الرابط">🔄</button>
                                            <button
                                                className="btn-action danger"
                                                onClick={() => handleDelete(qr.id, qr.deleted_at)}
                                                title={qr.deleted_at ? "حذف نهائي" : "حذف"}
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        <div className="meta-row">
                                            <div className="meta-item"><span>الرابط:</span> <span className="meta-val" title={qr.url}>{qr.url}</span></div>
                                            {qr.branch && <div className="meta-item"><span>سلوج الفرع:</span> <span className="meta-val">{qr.branch.slug}</span></div>}
                                            <div className="meta-item"><span>التاريخ:</span> <span className="meta-val">{new Date(qr.created_at).toLocaleDateString('ar-SA')}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
