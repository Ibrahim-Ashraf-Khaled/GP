export type NotificationType = 'payment' | 'property' | 'system';

export type NotificationStatus = 'unread' | 'read';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    status: NotificationStatus;
    createdAt: number;
}
