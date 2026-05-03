import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Landing({ settings = {}, stats = {} }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "نظام ذكي لإدارة طلبات المطاعم والفروع",
            subtitle: "منصة تيستي تساعدك على إدارة الطلبات، الفروع، المطابخ، والمنيو الإلكتروني من لوحة تحكم واحدة.",
            img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "حوّل تجربة الطلب داخل مطعمك إلى تجربة رقمية",
            subtitle: "QR، شاشة مطبخ، طلبات سيارة، وطاولات ذكية في نظام واحد.",
            img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        { icon: "🏪", title: 'إدارة الفروع', desc: 'تحكم بكل فروعك من مكان واحد' },
        { icon: "🍳", title: 'شاشة المطبخ KDS', desc: 'تنظيم وسرعة في تجهيز الطلبات' },
        { icon: "📱", title: 'الطلبات عبر رمز الاستجابة QR', desc: 'استقبل الطلبات من الطاولات مباشرة' },
        { icon: "🪑", title: 'إدارة الطاولات', desc: 'تنظيم جلوس العملاء ومتابعة طاولاتهم' },
        { icon: "📜", title: 'المنيو الإلكتروني', desc: 'قائمة طعام رقمية تفاعلية' },
        { icon: "🚗", title: 'طلبات السيارة', desc: 'تسهيل استلام الطلبات من السيارات' },
        { icon: "📊", title: 'التقارير والتحليلات', desc: 'لوحة تحكم شاملة لأداء مطعمك' },
        { icon: "🤖", title: 'نظام الأتمتة للمطاعم', desc: 'أتمتة العمليات اليومية مثل استقبال الطلبات، تحديث الحالات، إشعارات العملاء، وربط الفروع والمطبخ لتقليل العمل اليدوي.' },
        { icon: "💡", title: 'الطلبات الذكية', desc: 'تجربة طلب ذكية تساعد العميل على اختيار المنتجات، متابعة الطلب، وتسهيل إدارة الطلبات حسب الفرع ونوع الخدمة.' },
    ];

    // Safe stats with fallback to 0
    const displayStats = {
        restaurants: stats.totalRestaurants || 0,
        branches: stats.totalBranches || 0,
        completed: stats.completedOrders || 0,
        total: stats.totalOrders || 0,
    };

    return (
        <div className="landing-wrapper" dir="rtl">
            <Head title="منصة تيستي | نظام إدارة المطاعم" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap');
                
                :root {
                    --bg: #F9F7F5;
                    --primary: #5D4432;
                    --secondary: #E9E3DD;
                    --accent: #D97706;
                    --text: #3E2B1E;
                    --white: #FFFFFF;
                    --green: #16A34A;
                }

                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', 'Poppins', sans-serif; scroll-behavior: smooth; }
                body { background-color: var(--bg); color: var(--text); overflow-x: hidden; line-height: 1.6; }
                a { text-decoration: none; color: inherit; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                
                /* Header */
                .header { background: var(--bg); box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid var(--secondary); }
                .header-inner { display: flex; justify-content: space-between; align-items: center; height: 80px; }
                .logo-img { height: 48px; width: auto; object-fit: contain; }
                .logo-text { font-weight: 700; font-size: 1.5rem; color: var(--primary); }
                .nav-links { display: flex; gap: 24px; font-weight: 600; color: var(--text); }
                .nav-links a:hover { color: var(--accent); }
                .nav-actions { display: flex; gap: 16px; align-items: center; }
                
                .btn { padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s; text-align: center; display: inline-flex; justify-content: center; align-items: center;}
                .btn-primary { background: var(--primary); color: var(--white); border: 2px solid var(--primary); }
                .btn-primary:hover { background: transparent; color: var(--primary); }
                .btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
                .btn-outline:hover { background: var(--primary); color: var(--white); }
                
                /* Hero Slider */
                .hero-section { position: relative; height: 600px; background: var(--secondary); overflow: hidden; }
                .slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease-in-out; display: flex; align-items: center; justify-content: center; text-align: center;}
                .slide.active { opacity: 1; z-index: 10; }
                .slide-bg { position: absolute; inset: 0; }
                .slide-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.2; }
                .slide-content { position: relative; z-index: 20; max-width: 800px; padding: 0 24px; }
                .slide-title { font-size: 48px; font-weight: 700; color: var(--primary); margin-bottom: 24px; line-height: 1.3; }
                .slide-subtitle { font-size: 20px; color: var(--text); margin-bottom: 32px; font-weight: 600;}
                
                .slider-nav { position: absolute; bottom: 32px; left: 0; right: 0; z-index: 30; display: flex; justify-content: center; gap: 12px; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: var(--primary); opacity: 0.3; cursor: pointer; transition: 0.3s; }
                .dot.active { opacity: 1; width: 32px; border-radius: 8px; }

                /* Features */
                .features { padding: 80px 0; background: var(--bg); }
                .section-title { text-align: center; font-size: 36px; font-weight: 700; color: var(--primary); margin-bottom: 48px; }
                .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; }
                .feature-card { background: var(--white); border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04); transition: transform 0.3s; }
                .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
                .feature-icon { width: 64px; height: 64px; background: var(--secondary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: var(--primary); font-size: 32px;}
                .feature-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }

                /* Stats */
                .stats-section { padding: 64px 0; background: var(--primary); color: var(--white); }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; text-align: center; }
                .stat-card { padding: 24px; }
                .stat-value { font-size: 48px; font-weight: 700; color: var(--secondary); margin-bottom: 8px; }
                .stat-label { font-size: 18px; opacity: 0.9; }

                /* Banners */
                .banner { padding: 80px 0; text-align: center; }
                .banner-1 { background: var(--secondary); }
                .banner-2 { background: var(--bg); border-top: 1px solid var(--secondary); }
                .banner-title { font-size: 36px; font-weight: 700; color: var(--primary); margin-bottom: 16px; }
                .banner-text { font-size: 18px; color: var(--text); margin-bottom: 32px; max-width: 600px; margin-inline: auto; font-weight: 600;}

                /* Marquee */
                .marquee-section { padding: 64px 0; background: var(--white); overflow: hidden; }
                .marquee { display: flex; width: max-content; animation: scroll 30s linear infinite; }
                .marquee:hover { animation-play-state: paused; }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(50%); } 
                }
                .marquee-content { display: flex; gap: 48px; padding-right: 48px; }
                .partner-card { width: 160px; height: 80px; background: var(--bg); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary); font-size: 18px; opacity: 0.7; transition: 0.3s; }
                .partner-card:hover { opacity: 1; transform: scale(1.05); }

                /* Contact */
                .contact { padding: 80px 0; background: var(--primary); text-align: center; color: var(--white); }
                .contact-title { font-size: 32px; margin-bottom: 32px; font-weight: 700; }

                /* Footer */
                .footer { background: var(--bg); padding: 48px 0 24px; border-top: 1px solid var(--secondary); }
                .footer-inner { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 24px; }
                .footer-links { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; font-weight: 600; color: var(--text); }
                .footer-links a:hover { color: var(--primary); }
                .footer-copy { margin-top: 24px; opacity: 0.7; font-size: 14px; }

                @media (max-width: 768px) {
                    .header-inner { flex-direction: column; height: auto; padding: 16px 0; gap: 16px; }
                    .nav-links { display: none; }
                    .slide-title { font-size: 32px; }
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
                    .banner-title { font-size: 28px; }
                }
            `}</style>

            <header className="header" id="header">
                <div className="container header-inner">
                    <Link href="/" className="logo">
                        {settings.landing_logo ? (
                            <img src={settings.landing_logo} alt="منصة تيستي" className="logo-img" />
                        ) : settings.site_logo ? (
                            <img src={settings.site_logo} alt="منصة تيستي" className="logo-img" />
                        ) : (
                            <span className="logo-text">Tasty</span>
                        )}
                    </Link>
                    
                    <nav className="nav-links">
                        <a href="#about">نبذة عن النظام</a>
                        <a href="#features">المميزات</a>
                        <a href="#stats">الأرقام</a>
                        <a href="#contact">اتصل بنا</a>
                    </nav>

                    <div className="nav-actions">
                        <Link href="/restaurant-signup" className="btn btn-primary">سجل مطعمك</Link>
                        <Link href="/login" className="btn btn-outline">تسجيل الدخول</Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Slider */}
                <section className="hero-section" id="about">
                    {slides.map((slide, index) => (
                        <div key={index} className={`slide ${currentSlide === index ? 'active' : ''}`}>
                            <div className="slide-bg">
                                <img src={slide.img} alt="" />
                            </div>
                            <div className="slide-content">
                                <h1 className="slide-title">{slide.title}</h1>
                                <p className="slide-subtitle">{slide.subtitle}</p>
                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                    <Link href="/restaurant-signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
                                        سجل مطعمك
                                    </Link>
                                    <Link href="/tasty" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '18px', background: 'var(--bg)' }}>
                                        تجربة مطعم تيستي
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="slider-nav">
                        {slides.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`dot ${currentSlide === idx ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(idx)}
                            ></div>
                        ))}
                    </div>
                </section>

                {/* Banner 1 */}
                <section className="banner banner-1">
                    <div className="container">
                        <h2 className="banner-title">كل ما يحتاجه مطعمك في منصة واحدة</h2>
                        <p className="banner-text">من استقبال الطلب إلى شاشة المطبخ والفاتورة والتقارير.</p>
                        <Link href="/restaurant-signup" className="btn btn-primary">سجل مطعمك الآن</Link>
                    </div>
                </section>

                {/* Features */}
                <section className="features" id="features">
                    <div className="container">
                        <h2 className="section-title">مميزات المنصة</h2>
                        <div className="features-grid">
                            {features.map((feature, idx) => (
                                <div className="feature-card" key={idx}>
                                    <div className="feature-icon">
                                        {feature.icon}
                                    </div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Real Statistics */}
                <section className="stats-section" id="stats">
                    <div className="container">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">+{displayStats.restaurants}</div>
                                <div className="stat-label">عدد المطاعم</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">+{displayStats.branches}</div>
                                <div className="stat-label">عدد الفروع</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">+{displayStats.completed}</div>
                                <div className="stat-label">عدد الطلبات المنفذة</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">+{displayStats.total}</div>
                                <div className="stat-label">إجمالي الطلبات</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Banner 2 */}
                <section className="banner banner-2">
                    <div className="container">
                        <h2 className="banner-title">مناسب للمطاعم والكافيهات والمطابخ السحابية</h2>
                        <p className="banner-text">ابدأ بنظام مرن يدعم الفروع والتوسع بكل سهولة واحترافية.</p>
                        <Link href="/tasty" className="btn btn-primary" style={{ background: 'var(--primary)' }}>تجربة مطعم تيستي</Link>
                    </div>
                </section>

                {/* Success Partners Marquee */}
                <section className="marquee-section">
                    <div className="container">
                        <h2 className="section-title" style={{ marginBottom: '32px' }}>شركاء النجاح</h2>
                    </div>
                    {/* Using RTL scrolling trick */}
                    <div className="marquee" style={{ animationDirection: 'reverse' }}>
                        <div className="marquee-content">
                            <div className="partner-card">مطعم لذيذ</div>
                            <div className="partner-card">كافيه قهوتي</div>
                            <div className="partner-card">برجر ستيشن</div>
                            <div className="partner-card">بيتزا هت</div>
                            <div className="partner-card">شاورما بلس</div>
                            <div className="partner-card">مطعم لذيذ</div>
                            <div className="partner-card">كافيه قهوتي</div>
                            <div className="partner-card">برجر ستيشن</div>
                            <div className="partner-card">بيتزا هت</div>
                            <div className="partner-card">شاورما بلس</div>
                        </div>
                        <div className="marquee-content">
                            <div className="partner-card">مطعم لذيذ</div>
                            <div className="partner-card">كافيه قهوتي</div>
                            <div className="partner-card">برجر ستيشن</div>
                            <div className="partner-card">بيتزا هت</div>
                            <div className="partner-card">شاورما بلس</div>
                            <div className="partner-card">مطعم لذيذ</div>
                            <div className="partner-card">كافيه قهوتي</div>
                            <div className="partner-card">برجر ستيشن</div>
                            <div className="partner-card">بيتزا هت</div>
                            <div className="partner-card">شاورما بلس</div>
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="contact" id="contact">
                    <div className="container">
                        <h2 className="contact-title">هل تريد تجربة المنصة؟</h2>
                        <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: 'var(--white)', color: 'var(--white)' }}>
                            اتصل بنا الآن
                        </a>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="container footer-inner">
                    <Link href="/" className="logo">
                        {settings.landing_logo ? (
                            <img src={settings.landing_logo} alt="منصة تيستي" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
                        ) : settings.site_logo ? (
                            <img src={settings.site_logo} alt="منصة تيستي" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
                        ) : (
                            <span className="logo-text">Tasty</span>
                        )}
                    </Link>
                    
                    <div className="footer-links">
                        <a href="#about">نبذة عن النظام</a>
                        <a href="#features">المميزات</a>
                        <a href="#stats">الأرقام</a>
                        <Link href="/restaurant-signup">سجل مطعمك</Link>
                        <Link href="/login">تسجيل الدخول</Link>
                    </div>

                    <div className="footer-copy">
                        &copy; {new Date().getFullYear()} منصة تيستي (Tasty Platform). جميع الحقوق محفوظة.
                    </div>
                </div>
            </footer>
        </div>
    );
}
