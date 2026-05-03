import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { CreditCard, Save, Info, ExternalLink } from 'lucide-react';

const GOLD = '#C9A84C';
const SURF = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.07)';

export default function PaymentGateways({ gateway, restaurant }) {
    const { data, setData, post, processing, errors } = useForm({
        paymob_api_key: gateway?.paymob_api_key || '',
        paymob_integration_id: gateway?.paymob_integration_id || '',
        paymob_iframe_id: gateway?.paymob_iframe_id || '',
        paymob_hmac_secret: gateway?.paymob_hmac_secret || '',
        currency: gateway?.currency || 'SAR',
        mode: gateway?.mode || 'test',
        is_enabled: gateway?.is_enabled || false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.payment-gateways.update'));
    };

    return (
        <AdminLayout title="بوابات الدفع الإلكتروني">
            <div dir="rtl">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>بوابات الدفع الإلكتروني</h1>
                    <div style={{ background: '#FFF3E0', color: '#E65100', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={16} />
                        إعدادات الدفع لمطعم: {restaurant.name_ar}
                    </div>
                </div>

                <form onSubmit={submit} style={{ background: SURF, padding: '2rem', borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#5D443210', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={24} color="#5D4432" />
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3E2B1E' }}>إعدادات بوابة Paymob</h2>
                                <p style={{ fontSize: '0.85rem', color: '#6B6460' }}>اربط حسابك في Paymob لاستقبال المدفوعات لمطعمك</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>تفعيل الدفع الإلكتروني:</span>
                                <div 
                                    onClick={() => setData('is_enabled', !data.is_enabled)}
                                    style={{ 
                                        width: '50px', 
                                        height: '26px', 
                                        background: data.is_enabled ? GOLD : '#ccc', 
                                        borderRadius: '20px', 
                                        position: 'relative', 
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{ 
                                        width: '20px', 
                                        height: '20px', 
                                        background: 'white', 
                                        borderRadius: '50%', 
                                        position: 'absolute', 
                                        top: '3px', 
                                        right: data.is_enabled ? '3px' : '27px',
                                        transition: 'all 0.3s'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Paymob API Key</label>
                            <input 
                                type="password" 
                                value={data.paymob_api_key}
                                onChange={e => setData('paymob_api_key', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.paymob_api_key ? '1px solid red' : '1px solid #ddd' }} 
                                placeholder="أدخل API Key" 
                            />
                            {errors.paymob_api_key && <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.paymob_api_key}</p>}
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Integration ID</label>
                            <input 
                                value={data.paymob_integration_id}
                                onChange={e => setData('paymob_integration_id', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.paymob_integration_id ? '1px solid red' : '1px solid #ddd' }} 
                                placeholder="أدخل Integration ID" 
                            />
                            {errors.paymob_integration_id && <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.paymob_integration_id}</p>}
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Iframe ID</label>
                            <input 
                                value={data.paymob_iframe_id}
                                onChange={e => setData('paymob_iframe_id', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.paymob_iframe_id ? '1px solid red' : '1px solid #ddd' }} 
                                placeholder="أدخل Iframe ID" 
                            />
                            {errors.paymob_iframe_id && <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.paymob_iframe_id}</p>}
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>HMAC Secret</label>
                            <input 
                                type="password" 
                                value={data.paymob_hmac_secret}
                                onChange={e => setData('paymob_hmac_secret', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.paymob_hmac_secret ? '1px solid red' : '1px solid #ddd' }} 
                                placeholder="أدخل HMAC Secret" 
                            />
                            {errors.paymob_hmac_secret && <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.paymob_hmac_secret}</p>}
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>العملة (Currency)</label>
                            <select 
                                value={data.currency}
                                onChange={e => setData('currency', e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                            >
                                <option value="SAR">ريال سعودي (SAR)</option>
                                <option value="EGP">جنيه مصري (EGP)</option>
                                <option value="USD">دولار أمريكي (USD)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>وضع التشغيل (Mode)</label>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="test" 
                                        checked={data.mode === 'test'} 
                                        onChange={e => setData('mode', e.target.value)} 
                                    /> وضع التجربة (Test)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="live" 
                                        checked={data.mode === 'live'} 
                                        onChange={e => setData('mode', e.target.value)} 
                                    /> الوضع المباشر (Live)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#F9F7F5', borderRadius: '12px', border: '1px dashed #D9770640' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', color: '#D97706' }}>روابط العودة والتنبيه (Shared Platform URLs)</h3>
                        <p style={{ fontSize: '0.8rem', color: '#6B6460', marginBottom: '1rem' }}>يجب ضبط هذه الروابط في لوحة تحكم Paymob الخاصة بك لضمان عمل الدفع بشكل صحيح.</p>
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
                        <button 
                            type="submit"
                            disabled={processing}
                            style={{ 
                                background: processing ? '#ccc' : GOLD, 
                                color: 'white', 
                                padding: '0.8rem 2.5rem', 
                                borderRadius: '8px', 
                                border: 'none', 
                                fontWeight: 800, 
                                cursor: processing ? 'not-allowed' : 'pointer', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.75rem' 
                            }}
                        >
                            <Save size={20} />
                            {processing ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
