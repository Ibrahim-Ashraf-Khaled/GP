'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import SignUpForm from '@/components/auth/SignUpForm';
import LoginForm from '@/components/auth/LoginForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

type AuthView = 'login' | 'signup' | 'reset';

function AuthPageContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') as AuthView | null;
    const view: AuthView = mode || 'login';

    return (
        <div className="bg-background-light dark:bg-background-dark font-display flex flex-col min-h-screen items-center justify-center p-4 sm:p-0">
            {view === 'signup' && (
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-xl min-[450px]:min-h-[800px] min-[450px]:my-8 min-[450px]:rounded-2xl">
                    <SignUpForm onSwitchToLogin={() => window.history.pushState(null, '', '/auth?mode=login')} />
                </div>
            )}

            {view === 'login' && (
                <div className="w-full flex justify-center">
                    <LoginForm
                        onSwitchToSignUp={() => window.history.pushState(null, '', '/auth?mode=signup')}
                        onSwitchToReset={() => window.history.pushState(null, '', '/auth?mode=reset')}
                    />
                </div>
            )}

            {view === 'reset' && (
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-xl min-[450px]:min-h-[500px] min-[450px]:my-8 min-[450px]:rounded-2xl">
                    <ResetPasswordForm onSwitchToLogin={() => window.history.pushState(null, '', '/auth?mode=login')} />
                </div>
            )}
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={null}>
            <AuthPageContent />
        </Suspense>
    );
}
