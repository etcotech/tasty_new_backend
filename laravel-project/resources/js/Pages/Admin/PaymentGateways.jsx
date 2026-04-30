import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { CreditCard, Save, Info, ExternalLink } from 'lucide-react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.07)';

export default function PaymentGateways() {
    return (
        <AdminLayout title="بوابات الدفع الإلكتروني">
            <div dir="rtl">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>بوابات الدفع الإلكتروني</h1>
                    <div style={{ background: '#E3F2FD', color: '#1976D2', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={16} />
                        هذه إعدادات الدفع على مستوى المنصة
                    </div>
                </div>

                <div style={{ background: SURF, padding: '2rem', borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#5D443210', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={24} color="#5D4432" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3E2B1E' }}>إعدادات بوابة Paymob</h2>
                            <p style={{ fontSize: '0.85rem', color: '#6B6460' }}>اربط حسابك في Paymob لاستقبال المدفوعات من جميع المطاعم</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Paymob API Key</label>
                            <input type="password" width="100%" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="أدخل API Key" />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Integration ID</label>
                            <input width="100%" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="أدخل Integration ID" />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Iframe ID</label>
                            <input width="100%" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="أدخل Iframe ID" />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>HMAC Secret</label>
                            <input type="password" width="100%" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="أدخل HMAC Secret" />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>العملة (Currency)</label>
                            <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}>
                                <option value="SAR">ريال سعودي (SAR)</option>
                                <option value="EGP">جنيه مصري (EGP)</option>
                                <option value="USD">دولار أمريكي (USD)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>وضع التشغيل (Mode)</label>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" name="mode" value="test" defaultChecked /> وضع التجربة (Test)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" name="mode" value="live" /> الوضع المباشر (Live)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#F9F7F5', borderRadius: '12px', border: '1px dashed #D9770640' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', color: '#D97706' }}>روابط العودة والتنبيه (URLs)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ fontWeight: 700 }}>Callback URL:</span>
                                <code style={{ color: GOLD }}>https://tasty.com/api/payments/paymob/callback</code>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ fontWeight: 700 }}>Webhook URL:</span>
                                <code style={{ color: GOLD }}>https://tasty.com/api/payments/paymob/webhook</code>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', textAlign: 'left' }}>
                        <button style={{ background: GOLD, color: 'white', padding: '0.8rem 2.5rem', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Save size={20} />
                            حفظ الإعدادات
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
