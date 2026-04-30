import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { Save, Image as ImageIcon } from 'lucide-react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.07)';

export default function SiteSettings({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        site_logo: null,
        landing_title: settings.landing_title || '',
        landing_subtitle: settings.landing_subtitle || '',
        hero_content: settings.hero_content || '',
    });

    const [preview, setPreview] = useState(settings.site_logo);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('site_logo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.site-settings.update'), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout title="إعدادات الموقع">
            <div dir="rtl">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>إعدادات الموقع (Site Settings)</h1>
                
                <form onSubmit={handleSubmit} style={{ background: SURF, padding: '2rem', borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    {/* Logo Section */}
                    <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #eee', paddingBottom: '2rem' }}>
                        <label style={{ display: 'block', fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>شعار المنصة (Logo)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ 
                                width: 120, 
                                height: 120, 
                                borderRadius: '12px', 
                                border: `2px dashed ${GOLD}40`, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: '#FAFAFA',
                                overflow: 'hidden'
                            }}>
                                {preview ? (
                                    <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo Preview" />
                                ) : (
                                    <ImageIcon size={40} color={GOLD} style={{ opacity: 0.5 }} />
                                )}
                            </div>
                            <div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    style={{ display: 'none' }} 
                                    id="logo-upload"
                                />
                                <label 
                                    htmlFor="logo-upload" 
                                    style={{ 
                                        background: GOLD, 
                                        color: 'white', 
                                        padding: '0.6rem 1.5rem', 
                                        borderRadius: '8px', 
                                        fontWeight: 700, 
                                        cursor: 'pointer',
                                        display: 'inline-block',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    اختيار الشعار
                                </label>
                                <p style={{ fontSize: '0.85rem', color: '#6B6460' }}>يفضل PNG بخلفية شفافة. الحد الأقصى 2MB.</p>
                                {errors.site_logo && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.site_logo}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>اسم الموقع (Landing Title)</label>
                            <input 
                                className="form-input" 
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                                value={data.landing_title}
                                onChange={e => setData('landing_title', e.target.value)}
                                placeholder="مثلاً: ابدأ مشروعك مع منصة تيستي" 
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>العنوان الفرعي (Subtitle)</label>
                            <input 
                                className="form-input" 
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                                value={data.landing_subtitle}
                                onChange={e => setData('landing_subtitle', e.target.value)}
                                placeholder="مثلاً: الحل الأمثل لإدارة المطاعم والكافيهات" 
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>محتوى الهيرو (Hero Content)</label>
                        <textarea 
                            className="form-input" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', height: '100px' }} 
                            value={data.hero_content}
                            onChange={e => setData('hero_content', e.target.value)}
                            placeholder="أدخل وصفاً مشوقاً للمنصة يظهر في الصفحة الرئيسية" 
                        />
                    </div>

                    <div style={{ marginTop: '2.5rem', textAlign: 'left' }}>
                        <button 
                            type="submit"
                            disabled={processing}
                            style={{ 
                                background: GOLD, 
                                color: 'white', 
                                padding: '0.8rem 2.5rem', 
                                borderRadius: '8px', 
                                border: 'none', 
                                fontWeight: 800, 
                                cursor: processing ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                opacity: processing ? 0.7 : 1
                            }}
                        >
                            <Save size={20} />
                            {processing ? 'جاري الحفظ...' : 'حفظ إعدادات الموقع'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
