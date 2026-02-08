import React from 'react';

export default function AuthLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">جاري التحميل...</p>
            </div>
        </div>
    );
}
