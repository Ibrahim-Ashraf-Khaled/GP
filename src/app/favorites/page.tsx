'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { PropertyCard } from '@/components/PropertyCard';
import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { Property } from '@/types';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            fetchFavorites();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchFavorites = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Get favorite IDs
            const favoriteIds = await supabaseService.getFavorites(user.id);

            // 2. Fetch property details
            const properties = [];
            for (const id of favoriteIds) {
                const p = await supabaseService.getPropertyById(id);
                if (p) properties.push(p);
            }

            // 3. Map to Property type
            const mappedProperties: Property[] = properties.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description || '',
                price: row.price,
                priceUnit: row.price_unit || 'يوم',
                category: row.category,
                status: row.status as any,
                images: row.images || [],
                location: {
                    lat: row.location_lat || 0,
                    lng: row.location_lng || 0,
                    address: row.address || '',
                    area: row.area || '',
                },
                ownerPhone: row.owner_phone || '',
                ownerId: row.owner_id,
                ownerName: row.owner_name || '',
                features: row.features || [],
                bedrooms: row.bedrooms || 1,
                bathrooms: row.bathrooms || 1,
                area: row.floor_area || 0,
                floor: row.floor_number || 1,
                isVerified: row.is_verified,
                viewsCount: row.views_count,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            }));

            setFavorites(mappedProperties);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
                <Header />
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-5xl text-gray-400">lock</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">يجب تسجيل الدخول</h1>
                    <p className="text-gray-500 mb-8 max-w-sm">
                        لعرض العقارات المفضلة لديك، يرجى تسجيل الدخول أو إنشاء حساب جديد.
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <Header />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المفضلة</h1>
                    <span className="bg-red-500/10 text-red-500 text-sm font-bold px-3 py-1 rounded-full">{favorites.length}</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((p) => (
                            <div key={p.id} className="animate-fadeIn">
                                <PropertyCard {...p} image={p.images[0]} location={p.location.address} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-white/5 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-red-400">favorite_border</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد عقارات مفضلة</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            اضغط على زر القلب في أي عقار لإضافته إلى قائمتك.
                        </p>
                        <Link href="/search" className="text-primary font-bold hover:underline">
                            تصفح العقارات
                        </Link>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
