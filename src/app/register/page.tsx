'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const { register, loading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        const success = await register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
        });

        if (success) {
            router.push('/');
        } else {
            // Error is handled in context/alert, but we can set generic error here if needed
            // Ideally register should return error message
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4 py-8">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">إنشاء حساب جديد</h1>
                    <p className="text-gray-500 dark:text-gray-400">انضم إلينا في عقارات جمصة</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="محمد أحمد"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="01xxxxxxxxx"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تأكيد كلمة المرور</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'جاري التحميل...' : 'إنشاء الحساب'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    لديك حساب بالفعل؟{' '}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        تسجيل الدخول
                    </Link>
                </div>
            </div>
        </div>
    );
}
