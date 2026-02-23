'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignUpForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!agreedToTerms) {
            setError('يجب الموافقة على الشروط والأحكام');
            setLoading(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        const fullName = formData.get('fullname') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { error: signUpError } = await signUp(email, password, fullName);
            if (signUpError) {
                setError(signUpError.message);
                return;
            }
            // If signup successful, we can optionally redirect or show success
            // For Supabase, usually you are logged in or allow email confirmation.
            // We'll redirect to home.
            router.push('/');
        } catch (err) {
            setError('حدث خطأ غير متوقع');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-transparent backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <button
                    onClick={() => router.back()}
                    className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center pe-10">
                    إنشاء حساب جديد
                </h2>
            </div>

            {/* Headline */}
            <div className="px-6 pt-6 pb-2">
                <h1 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight text-center mb-2">
                    مرحبًا بك في جمصة للإيجار
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-center text-sm font-medium">
                    سجل بياناتك للبدء في رحلتك العقارية
                </p>
            </div>

            {/* Role Selection */}
            <div className="px-6 py-6">
                <div className="relative flex h-12 w-full items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
                    <label className="relative z-10 flex cursor-pointer h-full flex-1 items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 ease-in-out has-[:checked]:text-primary dark:has-[:checked]:text-white has-[:checked]:shadow-sm">
                        <span className="truncate z-20">مستأجر</span>
                        <input
                            checked={role === 'tenant'}
                            onChange={() => setRole('tenant')}
                            className="peer invisible absolute w-0 h-0"
                            name="role"
                            type="radio"
                            value="tenant"
                        />
                        <div className="absolute inset-0 z-10 bg-white dark:bg-primary rounded-lg shadow-sm opacity-0 peer-checked:opacity-100 transition-all duration-200 transform peer-checked:scale-100 scale-95"></div>
                    </label>
                    <label className="relative z-10 flex cursor-pointer h-full flex-1 items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 ease-in-out has-[:checked]:text-primary dark:has-[:checked]:text-white has-[:checked]:shadow-sm">
                        <span className="truncate z-20">مؤجر</span>
                        <input
                            checked={role === 'landlord'}
                            onChange={() => setRole('landlord')}
                            className="peer invisible absolute w-0 h-0"
                            name="role"
                            type="radio"
                            value="landlord"
                        />
                        <div className="absolute inset-0 z-10 bg-white dark:bg-primary rounded-lg shadow-sm opacity-0 peer-checked:opacity-100 transition-all duration-200 transform peer-checked:scale-100 scale-95"></div>
                    </label>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6">
                {/* Name Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-slate-900 dark:text-white text-base font-semibold" htmlFor="fullname">
                        الاسم بالكامل
                    </label>
                    <div className="relative">
                        <input
                            className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark px-4 text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                            id="fullname"
                            name="fullname"
                            placeholder="أدخل اسمك الثلاثي"
                            type="text"
                            required
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined pointer-events-none">
                            person
                        </span>
                    </div>
                </div>

                {/* Phone Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-slate-900 dark:text-white text-base font-semibold" htmlFor="phone">
                        رقم الهاتف
                    </label>
                    <div className="flex w-full items-stretch rounded-xl h-14 overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-surface-light dark:bg-surface-dark transition-all">
                        <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border-e border-slate-200 dark:border-slate-700 px-3 min-w-[70px]">
                            <span className="text-slate-600 dark:text-slate-300 font-bold ltr" dir="ltr">+20</span>
                        </div>
                        <input
                            className="flex-1 h-full border-none bg-transparent px-4 text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0"
                            id="phone"
                            name="phone"
                            placeholder="1xxxxxxxxx"
                            type="tel"
                            required
                        />
                        <div className="flex items-center justify-center px-4 text-slate-400 pointer-events-none">
                            <span className="material-symbols-outlined">smartphone</span>
                        </div>
                    </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-slate-900 dark:text-white text-base font-semibold" htmlFor="email">
                        البريد الإلكتروني <span className="text-slate-400 text-sm font-normal">(اختياري)</span>
                    </label>
                    <div className="relative">
                        <input
                            className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark px-4 text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                            id="email"
                            name="email"
                            placeholder="example@mail.com"
                            type="email"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined pointer-events-none">
                            mail
                        </span>
                    </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-slate-900 dark:text-white text-base font-semibold" htmlFor="password">
                        كلمة المرور
                    </label>
                    <div className="relative group">
                        <input
                            className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark px-4 pe-12 text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                            id="password"
                            name="password"
                            placeholder="********"
                            type={showPassword ? 'text' : 'password'}
                            required
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-0 top-0 h-full w-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors focus:outline-none"
                            type="button"
                        >
                            <span className="material-symbols-outlined">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 mt-2">
                    <div className="relative flex items-center">
                        <input
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-surface-light dark:bg-surface-dark checked:bg-primary checked:border-primary transition-all"
                            id="terms"
                            type="checkbox"
                        />
                        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 material-symbols-outlined text-[16px]">
                            check
                        </span>
                    </div>
                    <label className="text-sm text-slate-600 dark:text-slate-400 leading-tight pt-0.5 cursor-pointer" htmlFor="terms">
                        أوافق على <a className="text-primary font-bold hover:underline" href="#">الشروط والأحكام</a> و <a className="text-primary font-bold hover:underline" href="#">سياسة الخصوصية</a>
                    </label>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    disabled={loading}
                    className="mt-4 w-full h-14 rounded-xl bg-primary text-white text-lg font-bold hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                >
                    <span>{loading ? 'جاري التسجيل...' : 'تسجيل حساب'}</span>
                    <span className="material-symbols-outlined rtl:rotate-180 text-[20px]">arrow_forward</span>
                </button>
            </form>

            {/* Social Login */}
            <div className="px-6 mt-8">
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">أو سجل باستخدام</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => signInWithGoogle()} className="flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <img
                            alt="شعار جوجل"
                            className="w-5 h-5"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuALbAWA2T7nD8VeAqHSk9mZQrbmFqYCdoC3KSnBcHrLmElt7bvNxdyeAN_InaedViiwrmTjnE-bQ3FSYe2ZCnsecdoe4GJrN3yNBvJwdHVnm6s_BbR-6K7_WRs-_g15KhFq8FTM3mmRmaT2cEnCzRN5oqLlWHJYyb68-nkynQwt07Fk4_RK0LidMuCrf6uA1c7a1FtHzQWBgBcYOvlhYh881766IVgdEJX4eEaqTRyPkW_52UvmCp3rjRQby37FBvLugUCDIaKVUEI"
                        />
                        <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">جوجل</span>
                    </button>
                    <button onClick={() => signInWithFacebook()} className="flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <img
                            alt="شعار فيسبوك"
                            className="w-5 h-5"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI-hk8zymX19V0dn4LjYKt-KogyMCTx4uHkemuoHowk_aH7MTzAqmOn_J0fFL_Nyh3y7PtiVo5R3N7IzJ55WZFvM47Fhvck8A418Tzma98HVr57aV-beoDbO_shEZlsgN850uAM1UJfcP-z4ach3B1GI3n2pKV2U54uRbK_WQkBt0iB77p2lWVG1xK3gJ99yxD6QapZGXXQTwJfxcXqzSNleMVhsyeO3ICA2FPl0vBvXOQml2YAds7pNZsIJQurW9O2QwzB0x6Kgw"
                        />
                        <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">فيسبوك</span>
                    </button>
                </div>
            </div>

            {/* Footer Link */}
            <div className="mt-8 text-center pb-6">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    لديك حساب بالفعل؟{' '}
                    <button onClick={onSwitchToLogin} className="text-primary font-bold hover:underline">
                        تسجيل الدخول
                    </button>
                </p>
            </div>

            <div className="h-6 w-full"></div>
        </div>
    );
}
