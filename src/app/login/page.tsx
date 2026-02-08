'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const { login, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await login(email, password);

        if (success) {
            router.push(redirectUrl);
        } else {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">تسجيل الدخول</h1>
                    <p className="text-gray-500 dark:text-gray-400">مرحباً بك مجدداً في عقارات جمصة</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    ليس لديك حساب؟{' '}
                    <Link href="/register" className="text-primary font-bold hover:underline">
                        إنشاء حساب جديد
                    </Link>
                </div>
            </div>
        </div>
    );
}
