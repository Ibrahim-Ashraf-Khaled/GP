'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SignUpForm from '@/components/auth/SignUpForm';
import LoginForm from '@/components/auth/LoginForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import AuthHeroPanel from '@/components/auth/AuthHeroPanel';

type AuthView = 'login' | 'signup' | 'reset';

const isAuthView = (value: string | null): value is AuthView =>
    value === 'login' || value === 'signup' || value === 'reset';

const sanitizeRedirectPath = (value: string | null) => {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return '/';
    }

    if (value.startsWith('/auth')) {
        return '/';
    }

    return value;
};

function AuthPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { loading: authLoading, isAuthenticated } = useAuth();

    const modeParam = searchParams.get('mode');
    const mode: AuthView = isAuthView(modeParam) ? modeParam : 'login';
    const redirectTo = sanitizeRedirectPath(searchParams.get('redirect'));
    const [view, setView] = useState<AuthView>(mode);

    useEffect(() => {
        if (mode !== view) {
            setView(mode);
        }
    }, [mode, view]);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace(redirectTo);
        }
    }, [authLoading, isAuthenticated, redirectTo, router]);

    const switchView = (nextView: AuthView) => {
        setView(nextView);
        const params = new URLSearchParams(searchParams.toString());
        params.set('mode', nextView);
        params.set('redirect', redirectTo);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const isSplitView = view === 'login' || view === 'signup';

    return (
        <div className="bg-background-light dark:bg-background-dark font-display relative flex min-h-screen items-center justify-center px-3 py-4 sm:px-5 sm:py-6 lg:p-6">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 left-[-120px] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-16 right-[-120px] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>

            {isSplitView ? (
                <div
                    dir="ltr"
                    className="relative z-10 w-full max-w-[1240px] overflow-hidden rounded-3xl lg:border lg:border-border-light/80 lg:dark:border-border-dark/80 lg:bg-surface-light/80 lg:dark:bg-surface-dark/70 lg:shadow-2xl lg:grid lg:min-h-[700px] lg:grid-cols-[1.05fr_0.95fr]"
                >
                    <div className="pointer-events-none absolute inset-y-0 left-[52.5%] z-20 hidden w-14 -translate-x-1/2 bg-gradient-to-r from-slate-900/25 via-slate-500/12 to-transparent blur-md lg:block" />
                    <div className="pointer-events-none absolute inset-y-0 left-[52.5%] z-20 hidden w-px -translate-x-1/2 bg-white/35 lg:block" />
                    <AuthHeroPanel />

                    <section dir="rtl" className="flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-10">
                        <div className="w-full max-w-md rounded-2xl border border-border-light/80 dark:border-border-dark/80 bg-surface-light dark:bg-surface-dark shadow-xl lg:border-0 lg:bg-transparent lg:shadow-none">
                            {view === 'login' ? (
                                <LoginForm
                                    onSwitchToSignUp={() => switchView('signup')}
                                    onSwitchToReset={() => switchView('reset')}
                                    redirectUrl={redirectTo}
                                />
                            ) : (
                                <SignUpForm
                                    onSwitchToLogin={() => switchView('login')}
                                    redirectUrl={redirectTo}
                                />
                            )}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="relative z-10 w-full max-w-md">
                    <ResetPasswordForm
                        onSwitchToLogin={() => switchView('login')}
                        redirectUrl={redirectTo}
                    />
                </div>
            )}
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense
            fallback={
                <div className="bg-background-light dark:bg-background-dark font-display flex min-h-screen items-center justify-center p-4">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                            <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
                    </div>
                </div>
            }
        >
            <AuthPageContent />
        </Suspense>
    );
}
