'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabaseService } from '@/services/supabaseService';
import type { Notification } from '@/types';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            supabaseService.getNotifications(user.id).then((notifs) => {
                setNotifications(notifs as unknown as Notification[]);
                setUnreadCount(notifs.filter(n => !n.is_read).length);
            });
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const handleNotificationClick = async (notification: Notification) => {
        await supabaseService.markNotificationAsRead(notification.id);
        if (user) {
            const notifs = await supabaseService.getNotifications(user.id);
            setNotifications(notifs as unknown as Notification[]);
            setUnreadCount(notifs.filter(n => !n.is_read).length);
        }
        setShowNotifications(false);

        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    const handleMarkAllAsRead = async () => {
        if (user) {
            await supabaseService.markAllNotificationsAsRead(user.id);
            const notifs = await supabaseService.getNotifications(user.id);
            setNotifications(notifs as unknown as Notification[]);
            setUnreadCount(0);
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return 'check_circle';
            case 'warning':
                return 'warning';
            case 'error':
                return 'error';
            default:
                return 'info';
        }
    };

    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return 'text-green-400';
            case 'warning':
                return 'text-yellow-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-blue-400';
        }
    };

    return (
        <header className="sticky top-0 z-50 glass border-b border-gray-100 dark:border-gray-800 px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-md">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* User Profile Section - LEFT */}
                {isAuthenticated && user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="bg-cover bg-center rounded-full size-10 border-2 border-primary/20 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-gray-500">{user.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-background-dark"></div>
                            </div>
                            <div className="flex flex-col hidden sm:flex">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium group-hover:text-primary transition-colors">
                                    مرحباً بك 👋
                                </span>
                                <h2 className="text-base font-bold leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                    {user.name}
                                </h2>
                            </div>
                        </Link>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="تسجيل الخروج"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link href="/login" className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-sm">
                            تسجيل الدخول
                        </Link>
                        <Link href="/register" className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm">
                            إنشاء حساب
                        </Link>
                    </div>
                )}

                {/* Right Side - Logo or Notifications */}
                <div className="flex items-center gap-3">
                    {/* Notification Button */}
                    {isAuthenticated && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative flex items-center justify-center size-10 rounded-full bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[24px] text-gray-700 dark:text-gray-300">
                                    notifications
                                </span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 left-2 size-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn z-50 origin-top-left">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                                        <h3 className="font-bold text-gray-900 dark:text-white">الإشعارات</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="text-xs text-primary hover:text-primary/80 font-medium"
                                            >
                                                تحديد الكل كمقروء
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                                <div className="size-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                                    <span className="material-symbols-outlined text-gray-400 text-3xl">
                                                        notifications_off
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">لا توجد إشعارات حالياً</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {notifications.map((notification) => (
                                                    <button
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`w-full p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-3 ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                                                            }`}
                                                    >
                                                        <div className={`mt-1 shrink-0 ${getNotificationColor(notification.type)}`}>
                                                            <span className="material-symbols-outlined text-[20px]">
                                                                {getNotificationIcon(notification.type)}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                                <p className={`font-bold text-sm truncate ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                    {notification.title}
                                                                </p>
                                                                {!notification.isRead && (
                                                                    <span className="size-2 bg-primary rounded-full shrink-0 mt-1.5 animate-pulse"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-1.5">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-medium">
                                                                {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
