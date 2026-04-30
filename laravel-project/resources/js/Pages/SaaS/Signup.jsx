import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

const Signup = () => {
    const { data, setData, post, processing, errors } = useForm({
        restaurant_name: '',
        admin_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/restaurant-signup');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir="rtl">
            <Head title="تسجيل مطعم جديد" />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/">
                    <img className="mx-auto h-12 w-auto" src="/images/tasty-logo.png" alt="Tasty Platform" />
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-cairo">
                    سجل مطعمك في منصة تيستي
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={submit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">اسم المطعم</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    value={data.restaurant_name}
                                    onChange={e => setData('restaurant_name', e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                                    required
                                />
                            </div>
                            {errors.restaurant_name && <p className="mt-2 text-sm text-red-600">{errors.restaurant_name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">اسم المدير المسئول</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    value={data.admin_name}
                                    onChange={e => setData('admin_name', e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                                    required
                                />
                            </div>
                            {errors.admin_name && <p className="mt-2 text-sm text-red-600">{errors.admin_name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                                    required
                                />
                            </div>
                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                                    required
                                />
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">تأكيد كلمة المرور</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                {processing ? 'جاري التسجيل...' : 'تسجيل المطعم'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">لديك حساب بالفعل؟</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/login"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                تسجيل الدخول
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                .font-cairo { font-family: 'Cairo', sans-serif; }
            `}</style>
        </div>
    );
};

export default Signup;
