import React from 'react';

const GOLD = '#C9A84C';

export default function UpgradeNotice({ title, message, featureName }) {
    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)',
            padding: '2.5rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '2rem auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(201, 168, 76, 0.1)',
                color: GOLD,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '1.5rem'
            }}>
                👑
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1714', marginBottom: '1rem' }}>
                {title || 'هذه الميزة تتطلب ترقية'}
            </h2>
            
            <p style={{ color: '#6B6460', lineHeight: 1.6, marginBottom: '2rem', fontSize: '1.05rem' }}>
                {message || `ميزة ${featureName || 'المحددة'} غير متاحة في باقتك الحالية. يرجى الترقية للاستفادة منها.`}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a 
                    href="https://wa.me/your-whatsapp-number" 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        background: GOLD,
                        color: '#fff',
                        padding: '0.8rem 2rem',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    التواصل مع إدارة المنصة
                </a>
            </div>
        </div>
    );
}
