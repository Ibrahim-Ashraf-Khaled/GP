'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import MyPropertyCard from '@/components/MyPropertyCard';
import { Property } from '@/types';
import { getProperties, addProperty } from '@/lib/storage'; // Removed getCurrentUser as we use useAuth
import { useAuth } from '@/context/AuthContext';

export default function MyPropertiesPage() {
    const { user, profile } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadProperties();
        } else {
            setLoading(false); // Stop loading if no user
        }
    }, [user]);

    const loadProperties = () => {
        if (user) {
            const allProperties = getProperties();
            const userProperties = allProperties.filter(p => p.ownerId === user.id);
            setProperties(userProperties);
        }
        setLoading(false);
    };

    const handleDelete = (id: string) => {
        // Here we would typically call a delete function from storage
        // For now, let's just update the local state to reflect removal
        // Note: Real deletion logic needs to be added to storage.ts if not present
        const currentProps = getProperties();
        const updatedProps = currentProps.filter(p => p.id !== id);
        localStorage.setItem('gamasa_properties', JSON.stringify(updatedProps));

        // Refresh local state
        setProperties(prev => prev.filter(p => p.id !== id));
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
                <Header />
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-5xl text-gray-400">lock</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">يجب تسجيل الدخول</h1>
                    <p className="text-gray-500 mb-8 max-w-sm">
                        لإدارة عقاراتك، يرجى تسجيل الدخول.
                    </p>
                    <Link
                        href="/auth"
                        className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90 transition-transform active:scale-95"
                    >
                        تسجيل الدخول
                    </Link>
                </div>
                <BottomNav />
            </div>
        );
    }

    const handleAddMockData = () => {
        if (!user) return;

        const mocks = [
            {
                title: 'شقة تجريبية 1',
                description: 'شقة تجريبية للإيجار اليومي',
                price: 500,
                priceUnit: 'يوم',
                category: 'شقة',
                status: 'متاح',
                images: ['/images/property1.jpg'],
                location: { lat: 31.44, lng: 31.53, address: 'جمصة', area: 'منطقة البحر' },
                ownerPhone: profile?.phone || '01000000000',
                ownerId: user.id,
                ownerName: profile?.full_name || 'مستخدم تجريبي',
                features: ['تكييف', 'واي فاي'],
                bedrooms: 2,
                bathrooms: 1,
                area: 90,
                floor: 2,
                isVerified: false,
            },
            {
                title: 'شاليه تجريبي 2',
                description: 'شاليه مميز على البحر',
                price: 1200,
                priceUnit: 'يوم',
                category: 'شاليه',
                status: 'متاح',
                images: ['/images/property5.jpg'],
                location: { lat: 31.44, lng: 31.53, address: 'جمصة', area: 'منطقة البحر' },
                ownerPhone: profile?.phone || '01000000000',
                ownerId: user.id,
                ownerName: profile?.full_name || 'مستخدم تجريبي',
                features: ['تكييف', 'بحر'],
                bedrooms: 3,
                bathrooms: 2,
                area: 120,
                floor: 1,
                isVerified: false,
            }
        ];

        // @ts-ignore
        mocks.forEach(m => addProperty(m));
        loadProperties();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <Header />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">عقاراتي</h1>
                        <span className="bg-blue-500/10 text-blue-500 text-sm font-bold px-3 py-1 rounded-full">{properties.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddMockData}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">data_check</span>
                            <span>إضافة بيانات تجريبية</span>
                        </button>
                        <Link
                            href="/add-property"
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            <span>إضافة عقار</span>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {properties.map(property => (
                            <MyPropertyCard
                                key={property.id}
                                property={property}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-white/5 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-blue-400">home_work</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد عقارات مضافة</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            لم تقم بإضافة أي عقارات حتى الآن. ابدأ بإضافة عقارك الأول!
                        </p>
                        <Link
                            href="/add-property"
                            className="text-primary font-bold hover:underline"
                        >
                            إضافة عقار جديد
                        </Link>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
