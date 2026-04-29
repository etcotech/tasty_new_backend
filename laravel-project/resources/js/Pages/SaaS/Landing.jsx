import React from 'react';
import { Head, Link } from '@inertiajs/react';

const Landing = () => {
    return (
        <div style={styles.container}>
            <Head title="SAVOR | SaaS Restaurant Management System" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Cairo:wght@400;600;700;800&display=swap');
                
                :root {
                    --primary: #c9a84c;
                    --primary-dark: #b08e35;
                    --bg: #0f172a;
                    --text-main: #f8fafc;
                    --text-muted: #94a3b8;
                    --glass: rgba(255, 255, 255, 0.03);
                    --glass-border: rgba(255, 255, 255, 0.1);
                }

                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                body {
                    background: var(--bg);
                    color: var(--text-main);
                    font-family: 'Inter', 'Cairo', sans-serif;
                    overflow-x: hidden;
                }

                .gradient-bg {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at 50% -20%, #1e293b 0%, #0f172a 100%);
                    z-index: -1;
                }

                .hero-glow {
                    position: absolute;
                    top: -100px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 600px;
                    height: 400px;
                    background: var(--primary);
                    filter: blur(150px);
                    opacity: 0.15;
                    pointer-events: none;
                }

                .nav {
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10%;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--glass-border);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .logo {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: 2px;
                    text-decoration: none;
                }

                .nav-links {
                    display: flex;
                    gap: 2rem;
                }

                .btn-login {
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    color: var(--text-main);
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s;
                }

                .btn-login:hover {
                    background: var(--glass-border);
                }

                .hero {
                    padding: 80px 10% 60px;
                    text-align: center;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .headline {
                    font-size: 3rem;
                    font-weight: 800;
                    margin-bottom: 1.25rem;
                    line-height: 1.2;
                    background: linear-gradient(to bottom, #fff 0%, #cbd5e1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-family: 'Cairo', sans-serif;
                }

                .subtitle {
                    font-size: 1.15rem;
                    color: var(--text-muted);
                    margin-bottom: 2.5rem;
                    line-height: 1.6;
                    max-width: 650px;
                    margin-left: auto;
                    margin-right: auto;
                    font-family: 'Cairo', sans-serif;
                }

                .cta-group {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                }

                .btn-primary {
                    background: var(--primary);
                    color: #000;
                    padding: 0.85rem 2rem;
                    border-radius: 10px;
                    font-weight: 700;
                    text-decoration: none;
                    font-size: 1rem;
                    transition: all 0.3s;
                    box-shadow: 0 8px 24px rgba(201, 168, 76, 0.15);
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    color: var(--text-main);
                    padding: 0.85rem 2rem;
                    border-radius: 10px;
                    font-weight: 700;
                    text-decoration: none;
                    font-size: 1rem;
                    transition: all 0.3s;
                }

                .btn-secondary:hover {
                    background: var(--glass-border);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    padding: 80px 10%;
                }

                .feature-card {
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    padding: 2.5rem;
                    border-radius: 24px;
                    text-align: right;
                    transition: all 0.3s;
                }

                .feature-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.05);
                }

                .feature-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1.5rem;
                }

                .feature-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    font-family: 'Cairo', sans-serif;
                }

                .feature-desc {
                    color: var(--text-muted);
                    line-height: 1.6;
                    font-size: 0.95rem;
                    font-family: 'Cairo', sans-serif;
                }

                @media (max-width: 768px) {
                    .headline { font-size: 2.5rem; }
                    .nav { padding: 0 5%; }
                    .cta-group { flex-direction: column; }
                }
            `}</style>

            <div className="gradient-bg" />
            <div className="hero-glow" />

            <nav className="nav">
                <Link href="/login" className="btn-login">تسجيل الدخول</Link>
                <Link href="/" className="logo">SAVOR</Link>
            </nav>

            <header className="hero">
                <h1 className="headline">نظام طلبات ومطابخ للفروع والمطاعم</h1>
                <p className="subtitle">
                    منصة SaaS لإدارة الطلبات، الفروع، المنتجات، والمطابخ من لوحة تحكم واحدة.
                    حل متكامل للمطاعم العصرية لزيادة الكفاءة والتحكم الكامل.
                </p>
                <div className="cta-group">
                    <Link href="/restaurant-signup" className="btn-primary">ابدأ الآن مجاناً</Link>
                    <Link href="/savor" className="btn-secondary">تجربة مطعم Savor</Link>
                </div>
            </header>

            <section className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">🏪</div>
                    <h3 className="feature-title">إدارة الفروع</h3>
                    <p className="feature-desc">إدارة جميع فروعك من مكان واحد مع صلاحيات مخصصة لكل فرع.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">📜</div>
                    <h3 className="feature-title">منيو إلكتروني</h3>
                    <p className="feature-desc">منيو ذكي وتفاعلي يدعم الطلب المباشر من الطاولة أو السيارة.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🍳</div>
                    <h3 className="feature-title">شاشة مطبخ KDS</h3>
                    <p className="feature-desc">شاشات ذكية للمطابخ لمتابعة الطلبات وتحديث حالتها لحظياً.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3 className="feature-title">طلبات حسب الفرع</h3>
                    <p className="feature-desc">عزل كامل للبيانات وتوجيه الطلبات لكل فرع ومطبخ مخصص.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🛡️</div>
                    <h3 className="feature-title">لوحة تحكم SaaS</h3>
                    <p className="feature-desc">تحكم كامل في إعدادات المنصة، الضرائب، العملات، والعلامة التجارية.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🚀</div>
                    <h3 className="feature-title">أداء فائق</h3>
                    <p className="feature-desc">تجربة مستخدم سريعة جداً مبنية بأحدث تقنيات React و Laravel.</p>
                </div>
            </section>

            <footer style={{ padding: '60px 10%', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} SAVOR SaaS Platform. All rights reserved.
            </footer>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
    }
};

export default Landing;
