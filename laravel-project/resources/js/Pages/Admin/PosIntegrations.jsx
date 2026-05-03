import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, usePage } from '@inertiajs/react';

const GOLD = '#C9A84C';
const BORDER = 'rgba(0,0,0,0.06)';

export default function PosIntegrations({ integrations, availableProviders }) {
    const { flash } = usePage().props;
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [isTesting, setIsTesting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        provider: '',
        api_key: '',
        access_token: '',
        business_id: '',
        branch_id: '',
        is_enabled: false,
        environment: 'sandbox',
    });

    const openSettings = (providerKey) => {
        const existing = integrations[providerKey] || {};
        setSelectedProvider(providerKey);
        setData({
            provider: providerKey,
            api_key: existing.api_key || '',
            access_token: existing.access_token || '',
            business_id: existing.business_id || '',
            branch_id: existing.branch_id || '',
            is_enabled: !!existing.is_enabled,
            environment: existing.environment || 'sandbox',
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.pos-integrations.update'), {
            onSuccess: () => setSelectedProvider(null)
        });
    };

    const testConnection = async () => {
        setIsTesting(true);
        try {
            const res = await fetch(route('admin.pos-integrations.test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ provider: selectedProvider })
            });
            const result = await res.json();
            alert(result.message);
        } catch (e) {
            alert('Error testing connection.');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <AdminLayout title="تكاملات نقاط البيع">
            <div style={{ maxWidth: '1000px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>تكاملات نقاط البيع (POS Integrations)</h1>
                    <p style={{ color: '#6B6460' }}>اربط متجرك بأنظمة نقاط البيع العالمية لمزامنة الطلبات والمخزون.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(availableProviders).map(([key, provider]) => {
                        const isConnected = !!integrations[key];
                        const isEnabled = isConnected && integrations[key].is_enabled;

                        return (
                            <div key={key} style={{ 
                                background: '#fff', 
                                padding: '2rem', 
                                borderRadius: '20px', 
                                border: `1px solid ${selectedProvider === key ? GOLD : BORDER}`,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        background: '#F8F9FA', 
                                        borderRadius: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <img src={provider.logo} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} 
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=' + provider.name }}
                                        />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 700 }}>{provider.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ 
                                                width: '8px', 
                                                height: '8px', 
                                                borderRadius: '50%', 
                                                background: isConnected ? (isEnabled ? '#2ECC71' : '#F1C40F') : '#E74C3C' 
                                            }}></span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B6460' }}>
                                                {isConnected ? (isEnabled ? 'متصل ومفعل' : 'متصل - غير مفعل') : 'غير متصل'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.9rem', color: '#6B6460', marginBottom: '2rem', minHeight: '3em' }}>{provider.description}</p>

                                <button 
                                    onClick={() => openSettings(key)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.8rem', 
                                        borderRadius: '12px', 
                                        border: isConnected ? `1px solid ${GOLD}` : 'none',
                                        background: isConnected ? 'transparent' : GOLD,
                                        color: isConnected ? GOLD : '#fff',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isConnected ? 'تعديل الإعدادات' : 'ربط الآن'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {selectedProvider && (
                    <div style={{ 
                        position: 'fixed', 
                        inset: 0, 
                        background: 'rgba(0,0,0,0.5)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }} onClick={() => setSelectedProvider(null)}>
                        <div style={{ 
                            background: '#fff', 
                            width: '100%', 
                            maxWidth: '500px', 
                            borderRadius: '24px', 
                            padding: '2.5rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontWeight: 800 }}>إعدادات {availableProviders[selectedProvider].name}</h2>
                                <button onClick={() => setSelectedProvider(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>

                            <form onSubmit={submit}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#6B6460' }}>البيئة (Environment)</label>
                                        <select 
                                            value={data.environment} 
                                            onChange={e => setData('environment', e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: `1px solid ${BORDER}`, fontWeight: 600 }}
                                        >
                                            <option value="sandbox">Sandbox (تجريبي)</option>
                                            <option value="live">Live (مباشر)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#6B6460' }}>API Key / Access Token</label>
                                        <input 
                                            type="password"
                                            value={data.access_token} 
                                            onChange={e => setData('access_token', e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: `1px solid ${BORDER}` }}
                                            placeholder="Enter your token here..."
                                        />
                                        {errors.access_token && <span style={{ color: '#E74C3C', fontSize: '0.8rem' }}>{errors.access_token}</span>}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#6B6460' }}>Branch ID (من نظام POS)</label>
                                        <input 
                                            type="text"
                                            value={data.branch_id} 
                                            onChange={e => setData('branch_id', e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: `1px solid ${BORDER}` }}
                                            placeholder="e.g. branch_123"
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F8F9FA', borderRadius: '12px' }}>
                                        <input 
                                            type="checkbox" 
                                            id="is_enabled"
                                            checked={data.is_enabled} 
                                            onChange={e => setData('is_enabled', e.target.checked)}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="is_enabled" style={{ fontWeight: 700, cursor: 'pointer' }}>تفعيل المزامنة التلقائية للطلبات</label>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button 
                                            type="submit" 
                                            disabled={processing}
                                            style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: GOLD, color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                                        >
                                            {processing ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={testConnection}
                                            disabled={isTesting}
                                            style={{ padding: '1rem', borderRadius: '12px', border: `1px solid ${BORDER}`, background: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            {isTesting ? '...' : 'اختبار الاتصال'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
