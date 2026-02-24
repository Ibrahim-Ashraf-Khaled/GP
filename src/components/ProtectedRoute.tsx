'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import AuthLoading from './AuthLoading';

function ProtectedRouteContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push(`/auth?mode=login&redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, loading, router, pathname]);

    if (loading) {
        return <AuthLoading />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRouteContent>{children}</ProtectedRouteContent>
    );
}
