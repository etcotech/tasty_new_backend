import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword, auth_logo }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول" />

            <div className="font-cairo" dir="rtl">
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-6">
                        {auth_logo ? (
                            <img className="h-16 w-auto" src={auth_logo} alt="Tasty Platform" />
                        ) : (
                            <div className="text-4xl font-extrabold text-amber-600">Tasty</div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">مرحباً بك مجدداً</h2>
                    <p className="text-gray-500 mt-2">سجل دخولك لإدارة مطعمك</p>
                </div>

                {status && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-sm font-medium text-green-600 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="email" value="البريد الإلكتروني" className="mb-2 block text-gray-700 font-bold" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full px-4 py-3.5 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500 bg-gray-50/50"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="example@mail.com"
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="كلمة المرور" className="mb-2 block text-gray-700 font-bold" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full px-4 py-3.5 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500 bg-gray-50/50"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span className="ms-2 text-sm text-gray-600 font-medium">
                                تذكرني
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-amber-600 hover:text-amber-700 font-bold"
                            >
                                نسيت كلمة المرور؟
                            </Link>
                        )}
                    </div>

                    <div className="mt-8">
                        <PrimaryButton 
                            className="w-full justify-center py-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl text-lg font-bold shadow-lg shadow-amber-100 transition-all active:scale-[0.98]" 
                            disabled={processing}
                        >
                            تسجيل الدخول
                        </PrimaryButton>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-600 font-medium">
                            ليس لديك حساب؟{' '}
                            <Link
                                href="/restaurant-signup"
                                className="text-amber-600 font-bold hover:text-amber-700"
                            >
                                ابدأ الآن مجاناً
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
                .font-cairo { font-family: 'Cairo', sans-serif; }
            `}</style>
        </GuestLayout>
    );
}
