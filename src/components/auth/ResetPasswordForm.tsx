'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);
        const contact = formData.get('contact') as string;

        try {
            const { error: resetError } = await resetPassword(contact);
            if (resetError) {
                setError(resetError.message);
                return;
            }

            setSuccess('تم إرسال رمز التحقق بنجاح إلى البريد الإلكتروني أو رقم الهاتف المسجل');

        } catch (err) {
            setError('حدث خطأ غير متوقع');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex h-full min-h-screen w-full max-w-md mx-auto flex-col overflow-hidden shadow-sm bg-background-light dark:bg-background-dark">
            {/* TopAppBar */}
            <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm">
                <button
                    onClick={onSwitchToLogin}
                    aria-label="Go Back"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-main-light dark:text-text-main-dark"
                >
                    <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                </button>
                <div className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    استعادة الحساب
                </div>
                <div className="size-10"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col px-6 pb-6 pt-2">
                {/* Hero Illustration */}
                <div className="w-full flex justify-center py-6">
                    <div className="relative size-32 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-primary text-[64px]">lock_reset</span>
                        {/* Decorative circles */}
                        <div className="absolute -top-2 -right-2 size-8 bg-orange-400/20 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-0 -left-2 size-6 bg-primary/20 rounded-full"></div>
                    </div>
                </div>

                {/* Headlines */}
                <div className="text-center mb-8 space-y-2">
                    <h2 className="text-2xl font-bold leading-tight text-text-main-light dark:text-text-main-dark">
                        نسيت كلمة المرور؟
                    </h2>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-relaxed max-w-xs mx-auto">
                        لا تقلق، أدخل بريدك الإلكتروني أو رقم الهاتف المسجل أدناه لنرسل لك رمز التحقق.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                    {/* Input Field */}
                    <div className="flex flex-col gap-2">
                        <label
                            className="text-sm font-medium text-text-main-light dark:text-text-main-dark pr-1"
                            htmlFor="contact-input"
                        >
                            البريد الإلكتروني أو رقم الهاتف
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text-secondary-light dark:text-text-secondary-dark group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">contact_mail</span>
                            </div>
                            <input
                                className="form-input flex w-full rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-white/5 pr-11 pl-4 h-14 text-base placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-text-main-light dark:text-text-main-dark"
                                dir="rtl"
                                id="contact-input"
                                name="contact"
                                placeholder="مثال: 010xxxxxxx"
                                type="text"
                                required
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                    >
                        <span>{loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}</span>
                        <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_right_alt</span>
                    </button>
                </form>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Footer Support */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        هل تحتاج إلى مساعدة إضافية؟
                        <a className="text-primary font-semibold hover:underline mr-1" href="#">
                            تواصل مع الدعم
                        </a>
                    </p>
                </div>

                {/* Bottom safe area padding for mobile */}
                <div className="h-4"></div>
            </main>
        </div>
    );
}
