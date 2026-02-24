'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuth();

    const navItems = [
        { href: '/', label: 'الرئيسية', icon: 'home', filled: true },
        { href: '/favorites', label: 'المفضلة', icon: 'favorite' },
        {
            href: isAuthenticated ? '/add-property' : '/login',
            label: 'إضافة عقار',
            icon: 'add_circle',
            isSpecial: true
        },
        { href: '/search', label: 'حجوزاتي', icon: 'calendar_month' },
        {
            href: isAuthenticated ? '/profile' : '/login',
            label: isAuthenticated ? 'حسابي' : 'دخول',
            icon: 'person'
        },
    ];

    return (
        <nav className="navbar-bottom">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto w-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    // Special handling for "add property" button style if needed, 
                    // but keeping consistent for now as per original design

                    return (
                        <Link
                            key={item.label} // href might change so label is better key here
                            href={item.href}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span
                                className={`material-symbols-outlined text-[24px] ${isActive && item.filled ? 'fill-current' : ''}`}
                                style={{ fontVariationSettings: isActive && item.filled ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
