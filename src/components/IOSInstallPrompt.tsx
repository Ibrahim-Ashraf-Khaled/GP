'use client';

import { useState, useEffect } from 'react';

export default function IOSInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // التحقق من iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as { standalone: boolean }).standalone;

        // عرض الرسالة فقط لمستخدمي iOS الذين لم يثبتوا التطبيق بعد
        if (isIOSDevice && !isInStandaloneMode) {
            // تأخير تعيين الحالة لتجنب تحديث الحالة المتزامن داخل useEffect
            setTimeout(() => {
                setIsIOS(true);
            }, 0);
            // التحقق من التخزين المحلي
            const dismissed = localStorage.getItem('ios_prompt_dismissed');
            if (!dismissed) {
                // عرض بعد 3 ثواني
                setTimeout(() => setShowPrompt(true), 3000);
            }
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('ios_prompt_dismissed', 'true');
    };

    if (!isIOS || !showPrompt) return null;

    return (
        <div className="ios-install-prompt animate-slideUp">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold mb-1">أضف عقارات جمصة للشاشة الرئيسية</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        افتح التطبيق كأنه تطبيق حقيقي بدون متصفح!
                    </p>
                </div>
                <button onClick={handleDismiss} className="text-gray-400 p-1">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                    </div>
                    <span>اضغط على أيقونة</span>
                    <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    <span>أسفل الشاشة</span>
                </div>
                <div className="flex items-center gap-3 text-sm mt-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                    </div>
                    <span>ثم اختر</span>
                    <span className="text-blue-400 font-bold">&quot;Add to Home Screen&quot;</span>
                </div>
            </div>

            <button
                onClick={handleDismiss}
                className="btn-secondary w-full mt-4"
            >
                فهمت
            </button>
        </div>
    );
}
