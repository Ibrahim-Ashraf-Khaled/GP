'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-in slide-in-from-left-5 fade-in duration-300 ${toast.type === 'success' ? 'bg-success' :
                            toast.type === 'error' ? 'bg-error' :
                                'bg-surface-dark'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {toast.type === 'success' ? 'check_circle' :
                                toast.type === 'error' ? 'error' :
                                    'info'}
                        </span>
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
