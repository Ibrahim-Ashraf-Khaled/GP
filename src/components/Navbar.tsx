'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'الرئيسية', icon: 'home', filled: true },
        { href: '/favorites', label: 'المفضلة', icon: 'favorite' },
        { href: '/search', label: 'حجوزاتي', icon: 'calendar_month' },
        { href: '/profile', label: 'حسابي', icon: 'person' },
    ];

    return (
        <nav className="navbar-bottom">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto w-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
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
