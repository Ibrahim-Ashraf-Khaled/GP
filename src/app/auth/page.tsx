'use client';

import { useState } from 'react';
import SignUpForm from '@/components/auth/SignUpForm';
import LoginForm from '@/components/auth/LoginForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

type AuthView = 'login' | 'signup' | 'reset';

export default function AuthPage() {
    const [view, setView] = useState<AuthView>('login');

    return (
        <div className="bg-background-light dark:bg-background-dark font-display flex flex-col min-h-screen items-center justify-center p-4 sm:p-0">
            {view === 'signup' && (
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-xl min-[450px]:min-h-[800px] min-[450px]:my-8 min-[450px]:rounded-2xl">
                    <SignUpForm onSwitchToLogin={() => setView('login')} />
                </div>
            )}

            {view === 'login' && (
                <div className="w-full flex justify-center">
                    <LoginForm
                        onSwitchToSignUp={() => setView('signup')}
                        onSwitchToReset={() => setView('reset')}
                    />
                </div>
            )}

            {view === 'reset' && (
                <div className="w-full flex justify-center">
                    <ResetPasswordForm onSwitchToLogin={() => setView('login')} />
                </div>
            )}
        </div>
    );
}
