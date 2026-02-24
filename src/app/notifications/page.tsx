'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    getAllNotifications,
    markNotificationAsRead,
    getUnreadCount,
    Notification
} from '@/lib/notifications';
import NotificationCard from '@/components/notifications/NotificationCard';
import EmptyState from '@/components/notifications/EmptyState';

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user]);

    const refreshData = () => {
        if (!user) return;
        const data = getAllNotifications(user.id);
        setNotifications(data);
        setUnreadCount(getUnreadCount(user.id));
        setIsLoading(false);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification.status === 'unread') {
            markNotificationAsRead(notification.id);
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, status: 'read' } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Dispatch event to update global header badge
            window.dispatchEvent(new Event('storage'));
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="animate-pulse w-8 h-8 bg-blue-500 rounded-full" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            {/* 
              Hero Context (Compact) 
              h-[18vh] as per spec
            */}
            <section className="relative h-[25vh] min-h-[180px] flex items-end pb-8 justify-center overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                {/* Glass Container */}
                <div className="
                    relative z-10 w-full max-w-lg mx-4 p-6 text-center
                    bg-white/30 dark:bg-black/30 backdrop-blur-md
                    rounded-3xl border border-white/20 shadow-xl
                ">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        مركز الإشعارات
                    </h1>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {unreadCount > 0
                            ? `لديك ${unreadCount} إشعارات جديدة بانتظارك`
                            : 'كل شيء محدث، لا يوجد ما يفوتك'
                        }
                    </p>
                </div>
            </section>

            {/* Notifications List */}
            <div className="max-w-3xl mx-auto px-4 mt-8 space-y-4">
                {isLoading ? (
                    // Skeleton Loading
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))
                ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="animate-fadeIn">
                                <NotificationCard
                                    notification={notification}
                                    onClick={handleNotificationClick}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-fadeIn mt-12">
                        <EmptyState />
                    </div>
                )}
            </div>

            {/* 
               Bottom Safe Area Spacer 
               Ensures content isn't hidden behind mobile home indicators or bottom nav
            */}
            <div className="h-12" />
        </main>
    );
}
