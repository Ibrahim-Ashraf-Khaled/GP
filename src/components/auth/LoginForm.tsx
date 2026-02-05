'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm({
    onSwitchToSignUp,
    onSwitchToReset
}: {
    onSwitchToSignUp: () => void;
    onSwitchToReset: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { error: signInError } = await signIn(email, password);
            if (signInError) {
                setError(
                    signInError.message === 'Invalid login credentials'
                        ? 'بيانات الدخول غير صحيحة'
                        : signInError.message
                );
                return;
            }
            router.push('/');
        } catch (err) {
            setError('حدث خطأ غير متوقع');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md h-full min-h-[100dvh] sm:min-h-0 sm:h-auto sm:my-10 bg-background-light dark:bg-background-dark sm:bg-surface-light sm:dark:bg-surface-dark sm:rounded-2xl sm:shadow-xl sm:border sm:border-border-light sm:dark:border-border-dark flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-text-main dark:text-white"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_forward</span>
                </button>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>apartment</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col px-6 pt-2 pb-8 overflow-y-auto no-scrollbar">
                {/* Headlines */}
                <div className="mb-8 mt-4 text-right">
                    <h1 className="text-text-main dark:text-white text-3xl font-bold leading-tight mb-3">
                        أهلاً بك مجدداً
                    </h1>
                    <p className="text-text-muted dark:text-gray-400 text-base font-normal leading-relaxed">
                        تابع رحلة البحث عن شقتك في جمصة
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="block text-text-main dark:text-gray-200 text-sm font-bold" htmlFor="email">
                            البريد الإلكتروني
                        </label>
                        <div className="relative">
                            <input
                                className="block w-full h-14 rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark/50 text-text-main dark:text-white px-4 text-base focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50 transition-all text-right"
                                id="email"
                                name="email"
                                placeholder="example@mail.com"
                                type="email"
                                required
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="block text-text-main dark:text-gray-200 text-sm font-bold" htmlFor="password">
                            كلمة المرور
                        </label>
                        <div className="relative group">
                            <input
                                className="block w-full h-14 rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark/50 text-text-main dark:text-white px-4 text-base focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50 transition-all text-right"
                                id="password"
                                name="password"
                                placeholder="********"
                                type={showPassword ? 'text' : 'password'}
                                required
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted hover:text-primary transition-colors cursor-pointer outline-none"
                                type="button"
                            >
                                <span className="material-symbols-outlined">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        {/* Forgot Password Link */}
                        <div className="flex justify-end pt-1">
                            <button
                                onClick={onSwitchToReset}
                                type="button"
                                className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
                            >
                                نسيت كلمة المرور؟
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="h-4"></div>

                    {/* Submit Button */}
                    <button
                        disabled={loading}
                        className="w-full h-14 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                    >
                        <span>{loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
                    </button>

                    {/* Divider */}
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-light dark:border-border-dark"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-background-light dark:bg-background-dark sm:bg-surface-light sm:dark:bg-surface-dark px-4 text-text-muted">
                                أو سجل الدخول عبر
                            </span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Google */}
                        <button
                            onClick={() => signInWithGoogle()}
                            className="h-14 flex items-center justify-center rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            type="button"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"></path>
                                <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"></path>
                                <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"></path>
                                <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"></path>
                            </svg>
                        </button>
                        {/* Facebook */}
                        <button
                            onClick={() => signInWithFacebook()}
                            className="h-14 flex items-center justify-center rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            type="button"
                        >
                            <svg className="w-6 h-6 text-[#1877F2] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.415 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.438C19.585 23.094 24 18.1 24 12.073z"></path>
                            </svg>
                        </button>
                        {/* Apple */}
                        <button
                            className="h-14 flex items-center justify-center rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            type="button"
                        >
                            <svg className="w-6 h-6 text-black dark:text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.96 1.77c.88-.85 2.19-1.29 3.03-1.29.1 1.05-.44 2.22-1.11 3.01-.76.88-2.09 1.35-3.03 1.29-.12-1 .49-2.2 1.11-3.01zm3.89 12.98c-.14-2.14 1.76-3.17 1.84-3.21-1-1.47-2.53-1.63-3.06-1.66-1.3-.13-2.54.77-3.2.77-.65 0-1.68-.75-2.77-.73-1.43.02-2.75.83-3.48 2.11-1.48 2.57-.38 6.36 1.06 8.44.71 1.03 1.54 2.18 2.64 2.14 1.06-.04 1.46-.68 2.74-.68 1.27 0 1.63.68 2.73.66 1.14-.02 1.86-1.03 2.56-2.06.8-1.17 1.13-2.3 1.15-2.36-.02-.01-2.22-.85-2.21-3.42z"></path>
                            </svg>
                        </button>
                    </div>
                </form>
            </main>

            {/* Footer */}
            <footer className="p-6 shrink-0 text-center">
                <p className="text-text-main dark:text-gray-300 text-sm">
                    ليس لديك حساب؟
                    <button
                        onClick={onSwitchToSignUp}
                        className="font-bold text-primary hover:underline pr-1"
                    >
                        إنشاء حساب جديد
                    </button>
                </p>
            </footer>

            {/* Bottom Safe Area */}
            <div className="h-6 sm:hidden"></div>
        </div>
    );
}
