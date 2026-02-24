'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                </div>
                <h2 className="text-2xl font-bold text-text-main dark:text-white mb-3">
                    حدث خطأ!
                </h2>
                <p className="text-text-muted dark:text-gray-400 mb-6">
                    {error.message || 'حدث خطأ غير متوقع'}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                        حاول مرة أخرى
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 border border-border-light dark:border-border-dark text-text-main dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        تحديث الصفحة
                    </button>
                </div>
            </div>
        </div>
    );
}
