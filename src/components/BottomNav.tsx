"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", icon: "home", label: "الرئيسية" },
    { href: "/favorites", icon: "favorite", label: "المفضلة" },
    { href: "/add-property", icon: "add_circle", label: "أضف عقار" },
    { href: "/bookings", icon: "calendar_month", label: "حجوزاتي" },
    { href: "/profile", icon: "person", label: "حسابي" },
];

export function BottomNav() {
    const pathname = usePathname();

    if (pathname === '/add-property') return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe-bottom">
            <div className="flex justify-around items-center h-16 max-w-4xl mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive
                                ? "text-primary"
                                : "text-gray-400 dark:text-gray-500 hover:text-primary"
                                }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[24px] transition-all ${isActive ? "fill-current" : ""}`}
                                style={{
                                    fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`
                                }}
                            >
                                {item.icon}
                            </span>
                            <span
                                className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
