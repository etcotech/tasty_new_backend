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
        auth_logo: null,
        landing_logo: null,
        landing_title: settings.landing_title || '',
        landing_subtitle: settings.landing_subtitle || '',
        hero_content: settings.hero_content || '',
    });

    const [previews, setPreviews] = useState({
        site: settings.site_logo,
        auth: settings.auth_logo,
        landing: settings.landing_logo,
    });

    const handleFileChange = (key, file) => {
        if (file) {
            setData(key, file);
            setPreviews(prev => ({ ...prev, [key.replace('_logo', '')]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.site-settings.update'), {
            forceFormData: true,
        });
    };

    const LogoUpload = ({ label, id, preview, field, error }) => (
        <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: '1rem', fontSize: '1rem' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: '12px', 
                    border: `2px dashed ${GOLD}40`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#FAFAFA',
                    overflow: 'hidden'
                }}>
                    {preview ? (
                        <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" />
                    ) : (
                        <ImageIcon size={32} color={GOLD} style={{ opacity: 0.5 }} />
                    )}
                </div>
                <div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(field, e.target.files[0])} 
                        style={{ display: 'none' }} 
                        id={id}
                    />
                    <label 
                        htmlFor={id} 
                        style={{ 
                            background: GOLD, 
                            color: 'white', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '8px', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            display: 'inline-block',
                            marginBottom: '0.4rem',
                            fontSize: '0.85rem'
                        }}
                    >
                        رفع الشعار
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#6B6460' }}>الحد الأقصى 2MB.</p>
                    {error && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="إعدادات الموقع">
            <div dir="rtl" className="font-cairo">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>إعدادات المنصة (Platform Settings)</h1>
                
                <form onSubmit={handleSubmit} style={{ background: SURF, padding: '2.5rem', borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    
                    {/* Logos Section */}
                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#333' }}>التحكم في الشعارات (Logo Management)</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
                            <LogoUpload 
                                label="شعار الموقع الرئيسي (Site Logo)" 
                                id="site-logo-upload" 
                                preview={previews.site} 
                                field="site_logo" 
                                error={errors.site_logo} 
                            />
                            <LogoUpload 
                                label="شعار صفحات الدخول (Auth Logo)" 
                                id="auth-logo-upload" 
                                preview={previews.auth} 
                                field="auth_logo" 
                                error={errors.auth_logo} 
                            />
                            <LogoUpload 
                                label="شعار الهبوط (Landing Logo)" 
                                id="landing-logo-upload" 
                                preview={previews.landing} 
                                field="landing_logo" 
                                error={errors.landing_logo} 
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#333' }}>محتوى الصفحة الرئيسية</h3>
                        
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>العنوان الرئيسي (Landing Title)</label>
                                <input 
                                    className="form-input" 
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }} 
                                    value={data.landing_title}
                                    onChange={e => setData('landing_title', e.target.value)}
                                    placeholder="مثلاً: ابدأ مشروعك مع منصة تيستي" 
                                />
                                {errors.landing_title && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.landing_title}</p>}
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>العنوان الفرعي (Subtitle)</label>
                                <input 
                                    className="form-input" 
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }} 
                                    value={data.landing_subtitle}
                                    onChange={e => setData('landing_subtitle', e.target.value)}
                                    placeholder="مثلاً: الحل الأمثل لإدارة المطاعم والكافيهات" 
                                />
                                {errors.landing_subtitle && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.landing_subtitle}</p>}
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>محتوى الهيرو (Hero Content)</label>
                            <textarea 
                                className="form-input" 
                                style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e5e7eb', height: '120px', outline: 'none', resize: 'none' }} 
                                value={data.hero_content}
                                onChange={e => setData('hero_content', e.target.value)}
                                placeholder="أدخل وصفاً مشوقاً للمنصة يظهر في الصفحة الرئيسية" 
                            />
                            {errors.hero_content && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{errors.hero_content}</p>}
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                        <button 
                            type="submit"
                            disabled={processing}
                            style={{ 
                                background: GOLD, 
                                color: 'white', 
                                padding: '1rem 3rem', 
                                borderRadius: '12px', 
                                border: 'none', 
                                fontWeight: 800, 
                                cursor: processing ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                opacity: processing ? 0.7 : 1,
                                boxShadow: `0 8px 20px ${GOLD}30`,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Save size={22} />
                            {processing ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                        </button>
                    </div>
                </form>
            </div>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
                .font-cairo { font-family: 'Cairo', sans-serif; }
                .form-input:focus { border-color: ${GOLD} !important; box-shadow: 0 0 0 4px ${GOLD}10 !important; }
            `}</style>
        </AdminLayout>
    );
}
