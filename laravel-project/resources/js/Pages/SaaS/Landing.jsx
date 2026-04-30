import React from 'react';
import { Head, Link } from '@inertiajs/react';

const Landing = () => {
    return (
        <div className="landing-wrapper" dir="rtl">
            <Head title="منصة تيستي | نظام إدارة المطاعم المتكامل" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
                
                :root {
                    --primary: #D4AF37;
                    --primary-hover: #B8962E;
                    --secondary: #FF9F43;
                    --success: #28C76F;
                    --bg: #FFFFFF;
                    --bg-soft: #F9FAFB;
                    --text-main: #1F2937;
                    --text-muted: #6B7280;
                    --border: #E5E7EB;
                    --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                }

                * { 
                    box-sizing: border-box; 
                    margin: 0; 
                    padding: 0; 
                    font-family: 'Cairo', 'Inter', sans-serif;
                }
                
                body {
                    background-color: var(--bg);
                    color: var(--text-main);
                    overflow-x: hidden;
                    line-height: 1.6;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                /* Header */
                .header {
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--border);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
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

                @media (max-width: 768px) {
                    .logo-img {
                        height: 42px;
                    }
                }

                .nav-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .btn {
                    padding: 0.6rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.95rem;
                }

                .btn-login {
                    color: var(--text-main);
                    border: 1px solid var(--border);
                }

                .btn-login:hover {
                    background: var(--bg-soft);
                    border-color: var(--primary);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 14px 0 rgba(212, 175, 55, 0.3);
                }

                .btn-primary:hover {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
                }

                .btn-outline {
                    background: white;
                    color: var(--primary);
                    border: 2px solid var(--primary);
                }

                .btn-outline:hover {
                    background: rgba(212, 175, 55, 0.05);
                    transform: translateY(-2px);
                }

                /* Hero */
                .hero {
                    padding: 100px 0 60px;
                    background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.05) 0%, transparent 40%),
                                radial-gradient(circle at bottom left, rgba(255, 159, 67, 0.05) 0%, transparent 40%);
                }

                .hero-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                }

                .hero-content {
                    text-align: right;
                }

                .hero-badge {
                    display: inline-block;
                    padding: 0.4rem 1rem;
                    background: rgba(40, 199, 111, 0.1);
                    color: var(--success);
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    line-height: 1.2;
                    margin-bottom: 1.5rem;
                    color: #111827;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    margin-bottom: 2.5rem;
                    max-width: 540px;
                }

                .hero-visual {
                    position: relative;
                }

                .mockup-container {
                    background: white;
                    padding: 1rem;
                    border-radius: 24px;
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border);
                    transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
                    transition: transform 0.5s ease;
                }

                .mockup-container:hover {
                    transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
                }

                .mockup-img {
                    width: 100%;
                    border-radius: 16px;
                    display: block;
                }

                /* Features */
                .section-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .section-title {
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                }

                .features {
                    padding: 100px 0;
                    background-color: var(--bg-soft);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .feature-card {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 24px;
                    border: 1px solid var(--border);
                    transition: all 0.3s ease;
                    text-align: right;
                    position: relative;
                    overflow: hidden;
                }

                .feature-card::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--primary);
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .feature-card:hover {
                    transform: translateY(-10px);
                    box-shadow: var(--shadow);
                }

                .feature-card:hover::after {
                    opacity: 1;
                }

                .feature-icon-wrapper {
                    width: 60px;
                    height: 60px;
                    background: rgba(212, 175, 55, 0.1);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    margin-bottom: 1.5rem;
                    color: var(--primary);
                }

                .feature-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }

                .feature-desc {
                    color: var(--text-muted);
                    font-size: 1rem;
                }

                /* Categories Section */
                .types-section {
                    padding: 80px 0;
                    text-align: center;
                }

                .types-container {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                    margin-top: 2rem;
                }

                .type-pill {
                    padding: 0.8rem 2rem;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 100px;
                    font-weight: 600;
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                /* Footer */
                .footer {
                    padding: 60px 0;
                    border-top: 1px solid var(--border);
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }

                @media (max-width: 1024px) {
                    .hero-grid { grid-template-columns: 1fr; gap: 3rem; }
                    .hero-content { text-align: center; display: flex; flex-direction: column; align-items: center; }
                    .hero-title { font-size: 2.8rem; }
                    .hero-visual { order: -1; max-width: 600px; margin: 0 auto; }
                    .mockup-container { transform: none; }
                }

                @media (max-width: 768px) {
                    .hero-title { font-size: 2.2rem; }
                    .cta-group { flex-direction: column; width: 100%; gap: 1rem; }
                    .btn { width: 100%; }
                }
            `}</style>

            <header className="header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Link href="/" className="logo">
                        <img src="/images/tasty-logo.png" alt="منصة تيستي" className="logo-img" />
                    </Link>
                    
                    <div className="nav-actions">
                        <Link href="/login" className="btn btn-login">تسجيل الدخول</Link>
                        <Link href="/restaurant-signup" className="btn btn-primary">سجل مطعمك</Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="container">
                        <div className="hero-grid">
                            <div className="hero-content">
                                <div className="hero-badge">إصدار 2026 الجديد 🚀</div>
                                <h1 className="hero-title">نظام ذكي لإدارة طلبات المطاعم والفروع والمطابخ</h1>
                                <p className="hero-subtitle">
                                    منصة تيستي تساعد المطاعم على إدارة المنيو الإلكتروني، الطلبات، الفروع، وشاشات المطبخ من لوحة تحكم واحدة.
                                </p>
                                
                                <div className="cta-group" style={{ display: 'flex', gap: '1rem' }}>
                                    <Link href="/restaurant-signup" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                                        تسجيل مطعم جديد
                                    </Link>
                                    <Link href="/tasty" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                                        تجربة مطعم تيستي
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="hero-visual">
                                <div className="mockup-container">
                                    <img src="/images/hero-mockup.png" alt="Tasty Dashboard" className="mockup-img" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="types-section">
                    <div className="container">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>مناسب للمطاعم، الكافيهات، والمطابخ السحابية</h2>
                        <div className="types-container">
                            <div className="type-pill">🍔 مطاعم الوجبات السريعة</div>
                            <div className="type-pill">☕ كافيهات</div>
                            <div className="type-pill">☁️ مطابخ سحابية</div>
                            <div className="type-pill">🍕 بيتزا وباستا</div>
                            <div className="type-pill">🍨 حلويات</div>
                        </div>
                    </div>
                </section>

                <section className="features">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">مميزات منصة تيستي</h2>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                                كل ما تحتاجه لتنمية نشاطك التجاري في عالم المطاعم، في منصة واحدة سهلة الاستخدام.
                            </p>
                        </div>
                        
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">🏪</div>
                                <h3 className="feature-title">إدارة الفروع</h3>
                                <p className="feature-desc">أضف فروعك وخصص إعدادات كل فرع بشكل مستقل مع عزل كامل للطلبات والتقارير.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">📜</div>
                                <h3 className="feature-title">منيو إلكتروني</h3>
                                <p className="feature-desc">منيو QR احترافي وسريع، يتيح لعملائك الطلب والدفع بسهولة تامة.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">🍳</div>
                                <h3 className="feature-title">شاشة مطبخ KDS</h3>
                                <p className="feature-desc">نظام إدارة مطبخ متطور ينظم تدفق الطلبات ويقلل وقت الانتظار والأخطاء.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">📊</div>
                                <h3 className="feature-title">طلبات حسب الفرع</h3>
                                <p className="feature-desc">نظام ذكي يوجه كل طلب إلى الفرع الأقرب أو المختار تلقائياً لضمان دقة التنفيذ.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">🛡️</div>
                                <h3 className="feature-title">لوحة تحكم SaaS</h3>
                                <p className="feature-desc">تحكم شامل بجميع جوانب المنصة، من الأسعار والضرائب إلى الموظفين والصلاحيات.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">🚀</div>
                                <h3 className="feature-title">أداء فائق</h3>
                                <p className="feature-desc">تقنيات حديثة تضمن سرعة تحميل خيالية واستقرار تام حتى في أوقات الذروة.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} منصة تيستي لتقنية المعلومات. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
