'use client';

import { ToastProvider as CoreToastProvider, useToast as useCoreToast, ToastType } from '@/hooks/useToast';

// Re-export the core provider so existing imports keep working.
export const ToastProvider = CoreToastProvider;

// Legacy-friendly hook that maps the old `showToast(message, type)` API
// to the newer toast helpers provided by the core hook.
export const useToast = () => {
    const { toast } = useCoreToast();

    const showToast = (message: string, type: ToastType = 'info') => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            default:
                toast.info(message);
        }
    };

    return { showToast };
};
