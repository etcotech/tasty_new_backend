import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Landing({ settings = {} }) {
    return (
        <div className="landing-wrapper" dir="rtl">
            <Head title="منصة تيستي | نظام إدارة المطاعم المتكامل" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap');
                
                :root {
                    --bg: #F9F7F5;
                    --primary: #5D4432;
                    --secondary: #E9E3DD;
                    --text: #3E2B1E;
                    --success: #16A34A;
                    --warning: #D97706;
                    --danger: #DC2626;
                    --white: #FFFFFF;
                }

                * { 
                    box-sizing: border-box; 
                    margin: 0; 
                    padding: 0; 
                    font-family: 'Poppins', 'Cairo', sans-serif;
                }
                
                body {
                    background-color: var(--bg);
                    color: var(--text);
                    overflow-x: hidden;
                    line-height: 1.6;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* Header */
                .header {
                    height: 80px;
                    display: flex;
                    align-items: center;
                    background: var(--bg);
                }

                .header-inner {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    align-items: center;
                }

                .logo {
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                }

                .logo-img {
                    height: 52px;
                    width: auto;
                    display: block;
                }

                .nav-actions {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .btn {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .btn-primary {
                    background: var(--primary);
                    color: var(--white);
                    border: 1px solid var(--primary);
                }

                .btn-primary:hover {
                    opacity: 0.9;
                }

                .btn-outline {
                    background: transparent;
                    color: var(--primary);
                    border: 1px solid var(--primary);
                }

                .btn-outline:hover {
                    background: var(--secondary);
                }

                /* Hero */
                .hero {
                    padding: 64px 0;
                    background: var(--bg);
                }

                .hero-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 48px;
                    align-items: center;
                }

                .hero-content {
                    text-align: right;
                }

                .hero-title {
                    font-size: 48px;
                    font-weight: 700;
                    line-height: 1.2;
                    margin-bottom: 24px;
                    color: var(--text);
                }

                .hero-subtitle {
                    font-size: 18px;
                    color: var(--text);
                    margin-bottom: 32px;
                }

                .hero-visual {
                    position: relative;
                    width: 100%;
                }

                /* Custom CSS Mockup */
                .mockup-ui {
                    background: var(--white);
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 10px 40px rgba(62, 43, 30, 0.08);
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    position: relative;
                }

                .mockup-card {
                    background: var(--bg);
                    border-radius: 16px;
                    padding: 16px;
                    box-shadow: 0 4px 12px rgba(62, 43, 30, 0.04);
                }

                .mockup-card.full-width {
                    grid-column: span 2;
                }

                .mockup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .mockup-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                }

                .mockup-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: var(--secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                }

                .mockup-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--primary);
                }

                .mockup-badge {
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                }

                .badge-success { background: rgba(22, 163, 74, 0.1); color: var(--success); }
                .badge-warning { background: rgba(217, 119, 6, 0.1); color: var(--warning); }

                .mockup-bar-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                    height: 60px;
                    margin-top: 16px;
                }

                .mockup-bar {
                    flex: 1;
                    background: var(--secondary);
                    border-radius: 4px;
                    height: 100%;
                    position: relative;
                }

                .mockup-bar-fill {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: var(--primary);
                    border-radius: 4px;
                }

                .mockup-order-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .mockup-order-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px;
                    background: var(--white);
                    border-radius: 8px;
                }

                /* Features */
                .features {
                    padding: 64px 0;
                    background-color: var(--bg);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 24px;
                }

                .feature-card {
                    background: var(--white);
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(62, 43, 30, 0.04);
                    text-align: right;
                }

                .feature-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    background: var(--secondary);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin-bottom: 16px;
                    color: var(--primary);
                }

                .feature-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--text);
                }

                .feature-desc {
                    color: var(--text);
                    font-size: 16px;
                }

                /* CTA Section */
                .cta-section {
                    padding: 64px 0;
                    background-color: var(--secondary);
                    text-align: center;
                }

                .cta-title {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 24px;
                    color: var(--text);
                }

                /* Footer */
                .footer {
                    padding: 48px 0;
                    background: var(--bg);
                    text-align: center;
                    color: var(--text);
                    font-size: 16px;
                }

                @media (max-width: 768px) {
                    .hero-grid { grid-template-columns: 1fr; gap: 32px; }
                    .hero-content { text-align: center; }
                    .hero-title { font-size: 32px; }
                    .hero-visual { order: -1; }
                    .nav-actions { gap: 8px; flex-direction: column; width: 100%; }
                    .btn { padding: 12px 16px; font-size: 14px; width: 100%; }
                    .header-inner { flex-direction: column; gap: 16px; padding: 16px 0; }
                    .header { height: auto; }
                    .cta-group { display: flex; flex-direction: column; gap: 16px; justify-content: center; }
                    .logo-img { height: 42px; }
                }
            `}</style>

            <header className="header">
                <div className="container header-inner">
                    <Link href="/" className="logo">
                        {settings.site_logo ? (
                            <img src={settings.site_logo} alt="منصة تيستي" className="logo-img" />
                        ) : (
                            <span style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary)' }}>تيستي</span>
                        )}
                    </Link>
                    
                    <div className="nav-actions">
                        <Link href="/restaurant-signup" className="btn btn-primary">سجل مطعمك</Link>
                        <Link href="/login" className="btn btn-outline">تسجيل الدخول</Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="container">
                        <div className="hero-grid">
                            <div className="hero-content">
                                <h1 className="hero-title">نظام ذكي لإدارة طلبات المطاعم والفروع</h1>
                                <p className="hero-subtitle">
                                    منصة تيستي تساعدك على إدارة الطلبات، الفروع، والمطابخ من لوحة تحكم واحدة
                                </p>
                                
                                <div className="cta-group" style={{ display: 'flex', gap: '16px' }}>
                                    <Link href="/restaurant-signup" className="btn btn-primary">
                                        سجل مطعمك
                                    </Link>
                                    <Link href="/tasty" className="btn btn-outline">
                                        تجربة مطعم تيستي
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="hero-visual">
                                <div className="mockup-ui">
                                    <div className="mockup-card full-width">
                                        <div className="mockup-header">
                                            <div className="mockup-title">إجمالي المبيعات</div>
                                            <div className="mockup-icon">💰</div>
                                        </div>
                                        <div className="mockup-value">٤,٥٢٠ رس</div>
                                        <div className="mockup-bar-chart">
                                            <div className="mockup-bar"><div className="mockup-bar-fill" style={{ height: '40%' }}></div></div>
                                            <div className="mockup-bar"><div className="mockup-bar-fill" style={{ height: '70%' }}></div></div>
                                            <div className="mockup-bar"><div className="mockup-bar-fill" style={{ height: '50%' }}></div></div>
                                            <div className="mockup-bar"><div className="mockup-bar-fill" style={{ height: '90%' }}></div></div>
                                            <div className="mockup-bar"><div className="mockup-bar-fill" style={{ height: '60%' }}></div></div>
                                        </div>
                                    </div>
                                    
                                    <div className="mockup-card">
                                        <div className="mockup-header">
                                            <div className="mockup-title">الطلبات النشطة</div>
                                            <div className="mockup-badge badge-warning">١٢ طلب</div>
                                        </div>
                                        <div className="mockup-order-list" style={{ marginTop: '12px' }}>
                                            <div className="mockup-order-item">
                                                <span style={{ fontSize: '12px', fontWeight: '600' }}>#1042</span>
                                                <span style={{ fontSize: '12px', color: 'var(--warning)' }}>جاري التجهيز</span>
                                            </div>
                                            <div className="mockup-order-item">
                                                <span style={{ fontSize: '12px', fontWeight: '600' }}>#1041</span>
                                                <span style={{ fontSize: '12px', color: 'var(--success)' }}>مكتمل</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mockup-card">
                                        <div className="mockup-header">
                                            <div className="mockup-title">حالة الفروع</div>
                                            <div className="mockup-icon">🏪</div>
                                        </div>
                                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px' }}>فرع العليا</span>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px' }}>فرع الملقا</span>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="features">
                    <div className="container">
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">🏪</div>
                                <h3 className="feature-title">إدارة الفروع</h3>
                                <p className="feature-desc">تحكم بفروع مطعمك، وخصص إعدادات كل فرع بسهولة تامة.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">🍳</div>
                                <h3 className="feature-title">شاشة المطبخ KDS</h3>
                                <p className="feature-desc">نظم تدفق الطلبات داخل المطبخ لتقليل وقت الانتظار وتجنب الأخطاء.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">📱</div>
                                <h3 className="feature-title">QR للطلبات</h3>
                                <p className="feature-desc">استقبل طلبات عملائك من خلال مسح كود QR بكل سهولة وسرعة.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">📊</div>
                                <h3 className="feature-title">تقارير وتحليلات</h3>
                                <p className="feature-desc">تابع أداء مطعمك ومبيعاتك من خلال تقارير شاملة ومفصلة.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container">
                        <h2 className="cta-title">ابدأ الآن واطلق نظام مطعمك خلال دقائق</h2>
                        <Link href="/restaurant-signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
                            سجل مطعمك
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        {settings.site_logo ? (
                            <img src={settings.site_logo} alt="منصة تيستي" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>تيستي Platform</span>
                        )}
                    </div>
                    <p>&copy; {new Date().getFullYear()} Tasty Platform. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
}
