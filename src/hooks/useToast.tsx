'use client';

import { useState, useCallback, createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastMethods {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

interface ToastContextType {
    toast: ToastMethods;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICON: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'cancel',
    info: 'info',
};

const BG: Record<ToastType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    return (
        <div
            className={'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg shadow-black/15 text-white min-w-[260px] max-w-[340px] animate-in slide-in-from-bottom-2 fade-in duration-200 ' + BG[toast.type]}
        >
            <span className="material-symbols-outlined text-[20px] shrink-0">
                {ICON[toast.type]}
            </span>
            <p className="text-sm font-medium flex-1 leading-snug">
                {toast.message}
            </p>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const add = useCallback((type: ToastType, message: string, duration = 3000) => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
        setToasts((prev) => [...prev, { id, type, message, duration }]);
        if (duration !== 0) {
            setTimeout(() => remove(id), duration);
        }
    }, [remove]);

    const methods: ToastMethods = {
        success: (msg, dur) => add('success', msg, dur),
        error: (msg, dur) => add('error', msg, dur),
        info: (msg, dur) => add('info', msg, dur),
    };

    return (
        <ToastContext.Provider value={{ toast: methods }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={remove} />
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}
