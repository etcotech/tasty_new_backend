import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

const GOLD = '#C9A84C';
const BG = '#F8F9FA';
const SURF = '#FFFFFF';
const TEXT = '#1A1714';
const MUTED = '#6B6460';
const BORDER = 'rgba(0,0,0,0.06)';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cairo:wght@400;600;700;800&display=swap');

:root {
    --gold: ${GOLD};
    --bg: ${BG};
    --surf: ${SURF};
    --text: ${TEXT};
    --muted: ${MUTED};
    --border: ${BORDER};
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { 
    background: var(--bg); 
    font-family: 'Outfit', 'Cairo', sans-serif; 
    color: var(--text);
    -webkit-font-smoothing: antialiased;
}

.admin-wrapper {
    display: flex;
    min-height: 100vh;
    direction: rtl; /* Arabic Default */
}

/* Sidebar */
.admin-sidebar {
    width: 280px;
    background: var(--surf);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
}

.sidebar-brand {
    padding: 2.5rem 2rem;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--gold);
    text-decoration: none;
    letter-spacing: -0.5px;
}

.sidebar-nav {
    flex: 1;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1.2rem;
    text-decoration: none;
    color: var(--muted);
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.nav-item:hover {
    background: rgba(201, 168, 76, 0.05);
    color: var(--gold);
}

.nav-item.active {
    background: rgba(201, 168, 76, 0.1);
    color: var(--gold);
}

.nav-icon {
    width: 20px;
    height: 20px;
    stroke-width: 2;
}

/* Main Content */
.admin-main {
    flex: 1;
    margin-right: 280px; /* Same as sidebar width */
    display: flex;
    flex-direction: column;
}

.admin-top-bar {
    height: 70px;
    background: var(--surf);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 2.5rem;
    position: sticky;
    top: 0;
    z-index: 90;
}

.user-badge {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.5rem 1rem;
    background: #F9F9F9;
    border-radius: 50px;
    border: 1px solid var(--border);
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: var(--gold);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
}

.user-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
}

.content-inner {
    padding: 2.5rem;
    max-width: 1400px;
    width: 100%;
}

.logout-btn {
    margin-top: auto;
    margin-bottom: 2rem;
    color: #E74C3C;
}

.logout-btn:hover {
    background: rgba(231, 76, 60, 0.05);
    color: #C0392B;
}

/* LTR Support (if needed) */
[dir="ltr"] .admin-wrapper { direction: ltr; }
[dir="ltr"] .admin-sidebar { right: auto; left: 0; border-left: none; border-right: 1px solid var(--border); }
[dir="ltr"] .admin-main { margin-right: 0; margin-left: 280px; }
`;

export default function AdminLayout({ children, title }) {
    const { auth, admin } = usePage().props;
    const currentPath = window.location.pathname;

    const handleRestaurantSwitch = (e) => {
        router.post('/admin/restaurants/switch', { 
            restaurant_id: e.target.value 
        });
    };

    const navLinks = [
        { href: '/admin/dashboard', label: 'لوحة القيادة', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { href: '/admin/orders', label: 'الطلبات', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { href: '/admin/categories', label: 'التصنيفات', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
        { href: '/admin/products', label: 'المنتجات', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { href: '/admin/extras', label: 'الإضافات', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
        { href: '/kitchen', label: 'المطبخ', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { href: '/admin/restaurants', label: 'المطاعم', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { href: '/admin/settings', label: 'الإعدادات', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        { href: '/admin/system-check', label: 'فحص النظام', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    return (
        <div className="admin-wrapper" dir="rtl">
            <Head title={title} />
            <style>{css}</style>

            <aside className="admin-sidebar">
                <Link href="/admin/dashboard" className="sidebar-brand">SAVOR</Link>
                
                <nav className="sidebar-nav">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            className={`nav-item ${currentPath === link.href ? 'active' : ''}`}
                        >
                            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                            </svg>
                            {link.label}
                        </Link>
                    ))}

                    <Link 
                        href="/logout" 
                        method="post" 
                        as="button" 
                        className="nav-item logout-btn"
                        style={{ width: '100%', textAlign: 'right', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013-3v1" />
                        </svg>
                        تسجيل الخروج
                    </Link>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-top-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', justifyContent: 'space-between' }}>
                        {/* Restaurant Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: MUTED }}>المتجر الحالي:</span>
                            <select 
                                value={admin?.current_restaurant?.id || ''} 
                                onChange={handleRestaurantSwitch}
                                style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontSize: '0.9rem', fontWeight: 600, outline: 'none', minWidth: '180px', cursor: 'pointer' }}
                            >
                                {admin?.restaurants?.map(res => (
                                    <option key={res.id} value={res.id}>
                                        {res.name_ar}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="user-badge">
                            <div className="user-avatar">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-name">{auth.user.name}</span>
                        </div>
                    </div>
                </header>

                <div className="content-inner">
                    {children}
                </div>
            </main>
        </div>
    );
}
