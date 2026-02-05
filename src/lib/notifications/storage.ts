import { Notification } from './types';

const STORAGE_KEY = 'antigravity_notifications';

export function loadNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveNotifications(notifications: Notification[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
        // Silent fail
    }
}
