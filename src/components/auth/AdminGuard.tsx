'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AdminGuardProps {
    children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const { profile, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/auth');
            } else if (!profile?.is_admin) {
                router.push('/');
            }
        }
    }, [profile, loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !profile?.is_admin) {
        return null;
    }

    return <>{children}</>;
}
