import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

const Signup = () => {
    const { data, setData, post, processing, errors } = useForm({
        restaurant_name_ar: '',
        restaurant_name_en: '',
        slug: '',
        phone: '',
        address_ar: '',
        address_en: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        admin_password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/restaurant-signup');
    };

    return (
        <div style={styles.container}>
            <Head title="تسجيل مطعم جديد | SAVOR" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Cairo:wght@400;600;700;800&display=swap');
                
                :root {
                    --primary: #c9a84c;
                    --bg: #0f172a;
                    --text-main: #f8fafc;
                    --text-muted: #94a3b8;
                    --glass: rgba(255, 255, 255, 0.03);
                    --glass-border: rgba(255, 255, 255, 0.1);
                    --danger: #ef4444;
                }

                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                body {
                    background: var(--bg);
                    color: var(--text-main);
                    font-family: 'Cairo', 'Inter', sans-serif;
                    direction: rtl;
                }

                .gradient-bg {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at 50% -20%, #1e293b 0%, #0f172a 100%);
                    z-index: -1;
                }

                .signup-card {
                    max-width: 800px;
                    margin: 60px auto;
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(12px);
                    border-radius: 24px;
                    padding: 3rem;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 2rem 0 1.5rem;
                    color: var(--primary);
                    border-bottom: 1px solid var(--glass-border);
                    padding-bottom: 0.5rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                input {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--glass-border);
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    color: #fff;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary);
                }

                .error-msg {
                    color: var(--danger);
                    font-size: 0.8rem;
                    margin-top: 0.25rem;
                }

                .btn-submit {
                    background: var(--primary);
                    color: #000;
                    border: none;
                    padding: 1rem;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 1.1rem;
                    cursor: pointer;
                    margin-top: 3rem;
                    width: 100%;
                    transition: transform 0.2s;
                }

                .btn-submit:hover {
                    transform: translateY(-2px);
                }

                .btn-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .back-link {
                    display: block;
                    text-align: center;
                    margin-top: 1.5rem;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.9rem;
                }

                .back-link:hover { color: var(--text-main); }

                @media (max-width: 640px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .signup-card { margin: 20px; padding: 1.5rem; }
                }
            `}</style>

            <div className="gradient-bg" />

            <div className="signup-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>انضم إلى SAVOR</h1>
                    <p style={{ color: 'var(--text-muted)' }}>ابدأ إدارة مطعمك وفروعك باحترافية اليوم</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <h3 className="section-title">بيانات المطعم</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>اسم المطعم (عربي) *</label>
                            <input 
                                value={data.restaurant_name_ar} 
                                onChange={e => setData('restaurant_name_ar', e.target.value)} 
                                placeholder="مثال: مطعم سيفور"
                                required 
                            />
                            {errors.restaurant_name_ar && <div className="error-msg">{errors.restaurant_name_ar}</div>}
                        </div>
                        <div className="form-group">
                            <label>اسم المطعم (English) *</label>
                            <input 
                                value={data.restaurant_name_en} 
                                onChange={e => setData('restaurant_name_en', e.target.value)} 
                                placeholder="Example: Savor Restaurant"
                                required 
                            />
                            {errors.restaurant_name_en && <div className="error-msg">{errors.restaurant_name_en}</div>}
                        </div>
                        <div className="form-group">
                            <label>رابط المطعم (Slug) *</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    style={{ paddingLeft: '110px', direction: 'ltr', textAlign: 'left', width: '100%' }}
                                    value={data.slug} 
                                    onChange={e => setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                                    placeholder="my-restaurant"
                                    required 
                                />
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', pointerEvents: 'none' }}>
                                    .savor.com/
                                </span>
                            </div>
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>سيصبح الرابط: saver.test/slug</small>
                            {errors.slug && <div className="error-msg">{errors.slug}</div>}
                        </div>
                        <div className="form-group">
                            <label>رقم الجوال *</label>
                            <input 
                                value={data.phone} 
                                onChange={e => setData('phone', e.target.value)} 
                                placeholder="05xxxxxxxx"
                                required 
                            />
                            {errors.phone && <div className="error-msg">{errors.phone}</div>}
                        </div>
                    </div>

                    <h3 className="section-title">بيانات المدير</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>اسم المدير *</label>
                            <input 
                                value={data.admin_name} 
                                onChange={e => setData('admin_name', e.target.value)} 
                                required 
                            />
                            {errors.admin_name && <div className="error-msg">{errors.admin_name}</div>}
                        </div>
                        <div className="form-group">
                            <label>البريد الإلكتروني *</label>
                            <input 
                                type="email"
                                value={data.admin_email} 
                                onChange={e => setData('admin_email', e.target.value)} 
                                required 
                            />
                            {errors.admin_email && <div className="error-msg">{errors.admin_email}</div>}
                        </div>
                        <div className="form-group">
                            <label>كلمة المرور *</label>
                            <input 
                                type="password"
                                value={data.admin_password} 
                                onChange={e => setData('admin_password', e.target.value)} 
                                required 
                            />
                            {errors.admin_password && <div className="error-msg">{errors.admin_password}</div>}
                        </div>
                        <div className="form-group">
                            <label>تأكيد كلمة المرور *</label>
                            <input 
                                type="password"
                                value={data.admin_password_confirmation} 
                                onChange={e => setData('admin_password_confirmation', e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {errors.error && <div className="error-msg" style={{ marginTop: '1rem', textAlign: 'center' }}>{errors.error}</div>}

                    <button type="submit" className="btn-submit" disabled={processing}>
                        {processing ? 'جاري إنشاء الحساب...' : 'إنشاء حساب المطعم'}
                    </button>

                    <Link href="/" className="back-link">العودة للرئيسية</Link>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        paddingBottom: '40px'
    }
};

export default Signup;
