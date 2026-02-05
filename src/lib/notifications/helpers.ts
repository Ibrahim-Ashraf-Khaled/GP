import { Notification, NotificationType } from './types';
import { loadNotifications, saveNotifications } from './storage';

export function getAllNotifications(userId: string): Notification[] {
    const notifications = loadNotifications();
    return notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
}

export function getUnreadCount(userId: string): number {
    return getAllNotifications(userId).filter(n => n.status === 'unread').length;
}

export function createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}): void {
    const notifications = loadNotifications();
    const newNotification: Notification = {
        id: crypto.randomUUID(),
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        status: 'unread',
        createdAt: Date.now(),
    };
    saveNotifications([newNotification, ...notifications]);
}

export function markNotificationAsRead(notificationId: string): void {
    const notifications = loadNotifications();
    const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, status: 'read' as const } : n
    );
    saveNotifications(updated);
}
