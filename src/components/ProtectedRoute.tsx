'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import AuthLoading from './AuthLoading';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Encode the current path to redirect back after login
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return <AuthLoading />;
    }

    if (!isAuthenticated) {
        return null; // Don't render anything while redirecting
    }

    return <>{children}</>;
}
