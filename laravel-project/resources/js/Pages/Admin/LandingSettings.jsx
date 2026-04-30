import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';

const GOLD = '#C9A84C';
const BORDER = 'rgba(0,0,0,0.08)';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const SURF = '#FFFFFF';

const css = `
.ls-section { background: ${SURF}; border-radius: 20px; border: 1px solid ${BORDER}; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 2px 12px rgba(0,0,0,0.03); }
.ls-section-title { font-size: 1.1rem; font-weight: 800; color: ${TEXT}; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid ${BORDER}; display: flex; align-items: center; gap: 0.6rem; }
.ls-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
.ls-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.2rem; }
@media (max-width: 900px) { .ls-grid, .ls-grid-3 { grid-template-columns: 1fr; } }
.ls-field { display: flex; flex-direction: column; gap: 0.4rem; }
.ls-label { font-size: 0.85rem; font-weight: 700; color: ${MUTED}; }
.ls-input { padding: 0.7rem 1rem; border: 1.5px solid ${BORDER}; border-radius: 10px; font-family: inherit; font-size: 0.95rem; color: ${TEXT}; background: #FAFAFA; transition: border-color 0.2s; }
.ls-input:focus { outline: none; border-color: ${GOLD}; background: #FFF; }
.ls-textarea { padding: 0.7rem 1rem; border: 1.5px solid ${BORDER}; border-radius: 10px; font-family: inherit; font-size: 0.95rem; color: ${TEXT}; background: #FAFAFA; resize: vertical; min-height: 80px; transition: border-color 0.2s; }
.ls-textarea:focus { outline: none; border-color: ${GOLD}; background: #FFF; }
.ls-checkbox-label { display: flex; align-items: center; gap: 0.6rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
.ls-checkbox { width: 18px; height: 18px; accent-color: ${GOLD}; cursor: pointer; }

.card-edit { background: #FAFAFA; border: 1px solid ${BORDER}; border-radius: 14px; padding: 1.2rem; position: relative; }
.card-edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-icon-preview { font-size: 1.5rem; }
.card-delete-btn { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; padding: 0.35rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.card-delete-btn:hover { background: #FEE2E2; }

.add-card-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: rgba(201,168,76,0.08); color: ${GOLD}; border: 2px dashed ${GOLD}; border-radius: 14px; padding: 1rem; cursor: pointer; font-weight: 700; font-size: 0.95rem; transition: all 0.2s; margin-top: 1rem; }
.add-card-btn:hover { background: rgba(201,168,76,0.15); }

.save-btn { background: linear-gradient(135deg, #C9A84C, #B8962E); color: #FFF; border: none; padding: 1rem 2.5rem; border-radius: 14px; font-size: 1rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(201,168,76,0.3); }
.save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(201,168,76,0.4); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.flash-success { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; border-radius: 12px; padding: 1rem 1.5rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
`;

export default function LandingSettings({ general: initialGeneral, cards: initialCards }) {
    const { flash } = usePage().props;
    const [general, setGeneral] = useState(initialGeneral || {});
    const [cards, setCards] = useState(initialCards || []);
    const [saving, setSaving] = useState(false);

    const updateGeneral = (key, value) => setGeneral(prev => ({ ...prev, [key]: value }));
    const updateCard = (index, key, value) => {
        setCards(prev => prev.map((c, i) => i === index ? { ...c, [key]: value } : c));
    };
    const addCard = () => {
        setCards(prev => [...prev, {
            icon: '⭐', title_ar: '', title_en: '', description_ar: '', description_en: '',
            sort_order: prev.length + 1, is_active: true
        }]);
    };
    const removeCard = (index) => setCards(prev => prev.filter((_, i) => i !== index));

    const handleSave = () => {
        setSaving(true);
        router.post('/admin/landing-settings', { general, cards }, {
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AdminLayout title="إعدادات صفحة الهبوط">
            <style>{css}</style>
            <div dir="rtl">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>إعدادات صفحة الهبوط</h1>

                {flash?.success && (
                    <div className="flash-success">✅ {flash.success}</div>
                )}

                {/* Header / Branding */}
                <div className="ls-section">
                    <div className="ls-section-title">🎨 العلامة التجارية (Header & Branding)</div>
                    <div className="ls-grid-3">
                        <div className="ls-field" style={{ gridColumn: '1 / -1' }}>
                            <label className="ls-label">رابط صورة الشعار (Logo URL)</label>
                            <input className="ls-input" type="url" placeholder="https://..." value={general.logo_url || ''} onChange={e => updateGeneral('logo_url', e.target.value)} />
                        </div>
                        <div className="ls-field">
                            <label className="ls-label">اسم المنصة بالعربية</label>
                            <input className="ls-input" type="text" value={general.platform_name_ar || ''} onChange={e => updateGeneral('platform_name_ar', e.target.value)} />
                        </div>
                        <div className="ls-field">
                            <label className="ls-label">اسم المنصة بالإنجليزية</label>
                            <input className="ls-input" type="text" value={general.platform_name_en || ''} onChange={e => updateGeneral('platform_name_en', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="ls-section">
                    <div className="ls-section-title">🦸 قسم Hero</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div className="ls-field">
                            <label className="ls-label">نص الشارة (Badge)</label>
                            <input className="ls-input" type="text" value={general.hero_badge || ''} onChange={e => updateGeneral('hero_badge', e.target.value)} />
                        </div>
                        <div className="ls-grid">
                            <div className="ls-field">
                                <label className="ls-label">العنوان الرئيسي بالعربية</label>
                                <textarea className="ls-textarea" value={general.headline_ar || ''} onChange={e => updateGeneral('headline_ar', e.target.value)} />
                            </div>
                            <div className="ls-field">
                                <label className="ls-label">العنوان الرئيسي بالإنجليزية</label>
                                <textarea className="ls-textarea" value={general.headline_en || ''} onChange={e => updateGeneral('headline_en', e.target.value)} />
                            </div>
                            <div className="ls-field">
                                <label className="ls-label">النص الفرعي بالعربية</label>
                                <textarea className="ls-textarea" value={general.subtitle_ar || ''} onChange={e => updateGeneral('subtitle_ar', e.target.value)} />
                            </div>
                            <div className="ls-field">
                                <label className="ls-label">النص الفرعي بالإنجليزية</label>
                                <textarea className="ls-textarea" value={general.subtitle_en || ''} onChange={e => updateGeneral('subtitle_en', e.target.value)} />
                            </div>
                        </div>
                        <div className="ls-grid">
                            <div className="ls-field">
                                <label className="ls-label">نص الزر الأول</label>
                                <input className="ls-input" type="text" value={general.primary_btn_text || ''} onChange={e => updateGeneral('primary_btn_text', e.target.value)} />
                            </div>
                            <div className="ls-field">
                                <label className="ls-label">رابط الزر الأول</label>
                                <input className="ls-input" type="text" value={general.primary_btn_link || ''} onChange={e => updateGeneral('primary_btn_link', e.target.value)} />
                            </div>
                            <div className="ls-field">
                                <label className="ls-label">نص الزر الثاني</label>
                                <input className="ls-input" type="text" value={general.secondary_btn_text || ''} onChange={e => updateGeneral('secondary_btn_text', e.target.value)} />
                            </div>
                            <div className="ls-field">
                                <label className="ls-label">رابط الزر الثاني</label>
                                <input className="ls-input" type="text" value={general.secondary_btn_link || ''} onChange={e => updateGeneral('secondary_btn_link', e.target.value)} />
                            </div>
                        </div>
                        <div className="ls-field">
                            <label className="ls-label">رابط صورة Hero</label>
                            <input className="ls-input" type="url" placeholder="/images/hero-mockup.png" value={general.hero_image_url || ''} onChange={e => updateGeneral('hero_image_url', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="ls-section">
                    <div className="ls-section-title">🃏 بطاقات المميزات (Feature Cards)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {cards.map((card, i) => (
                            <div key={i} className="card-edit">
                                <div className="card-edit-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <span className="card-icon-preview">{card.icon}</span>
                                        <strong style={{ fontSize: '0.95rem' }}>{card.title_ar || `البطاقة ${i + 1}`}</strong>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                        <label className="ls-checkbox-label">
                                            <input type="checkbox" className="ls-checkbox" checked={card.is_active} onChange={e => updateCard(i, 'is_active', e.target.checked)} />
                                            مفعّلة
                                        </label>
                                        <button className="card-delete-btn" onClick={() => removeCard(i)}>🗑️ حذف</button>
                                    </div>
                                </div>
                                <div className="ls-grid">
                                    <div className="ls-field">
                                        <label className="ls-label">الأيقونة (إيموجي)</label>
                                        <input className="ls-input" type="text" value={card.icon} onChange={e => updateCard(i, 'icon', e.target.value)} placeholder="🏪" />
                                    </div>
                                    <div className="ls-field">
                                        <label className="ls-label">الترتيب</label>
                                        <input className="ls-input" type="number" value={card.sort_order} onChange={e => updateCard(i, 'sort_order', parseInt(e.target.value))} />
                                    </div>
                                    <div className="ls-field">
                                        <label className="ls-label">العنوان بالعربية</label>
                                        <input className="ls-input" type="text" value={card.title_ar} onChange={e => updateCard(i, 'title_ar', e.target.value)} />
                                    </div>
                                    <div className="ls-field">
                                        <label className="ls-label">العنوان بالإنجليزية</label>
                                        <input className="ls-input" type="text" value={card.title_en} onChange={e => updateCard(i, 'title_en', e.target.value)} />
                                    </div>
                                    <div className="ls-field">
                                        <label className="ls-label">الوصف بالعربية</label>
                                        <textarea className="ls-textarea" value={card.description_ar} onChange={e => updateCard(i, 'description_ar', e.target.value)} />
                                    </div>
                                    <div className="ls-field">
                                        <label className="ls-label">الوصف بالإنجليزية</label>
                                        <textarea className="ls-textarea" value={card.description_en} onChange={e => updateCard(i, 'description_en', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="add-card-btn" onClick={addCard}>
                            ＋ إضافة بطاقة جديدة
                        </button>
                    </div>
                </div>

                {/* Save */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? '⏳ جاري الحفظ...' : '💾 حفظ الإعدادات'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
