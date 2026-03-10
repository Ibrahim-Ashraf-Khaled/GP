'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import ScrollAwareShell from './ScrollAwareShell';

export default function ChromeGate({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const isHome = pathname === '/';
    const isFavorites = pathname === '/favorites'; // صفحة القائمة فقط
    const enableChrome = isHome || isFavorites;

    // Blocklist: strictly block property detail pages
    const isPropertyDetails =
        pathname?.startsWith('/property/') ||
        pathname?.startsWith('/properties/') ||
        pathname?.startsWith('/listing/');

    const finalEnable = enableChrome && !isPropertyDetails;

    if (finalEnable) {
        return <ScrollAwareShell>{children}</ScrollAwareShell>;
    }

    return <>{children}</>;
}
