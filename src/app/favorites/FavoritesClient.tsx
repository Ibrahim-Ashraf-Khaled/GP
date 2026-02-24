'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { PropertyCard } from '@/components/PropertyCard';
import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { Property } from '@/types';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass';

export default function FavoritesClient() {
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
                priceUnit: row.price_unit || 'day',
                category: row.category,
                status: row.status,
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

    const toggleFavorite = async (propertyId: string) => {
        if (!user) return;
        try {
            await supabaseService.toggleFavorite(user.id, propertyId);
            setFavorites(favorites.filter(fav => fav.id !== propertyId));
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
                <Header />
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <BottomNav />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
                <Header />
                <div className="max-w-md mx-auto px-4 py-8">
                    <GlassCard className="p-6 text-center">
                        <div className="mb-4">
                            <span className="material-symbols-outlined text-4xl text-gray-400">
                                favorite_border
                            </span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                            تسجيل الدخول مطلوب
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            يجب تسجيل الدخول لعرض العقارات المفضلة
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-all"
                        >
                            تسجيل الدخول
                        </Link>
                    </GlassCard>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <Header />
            
            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl">
                        favorite
                    </span>
                    العقارات المفضلة
                </h1>

                {favorites.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                        <div className="mb-4">
                            <span className="material-symbols-outlined text-4xl text-gray-400">
                                favorite_border
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                            لا توجد عقارات مفضلة
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            ابدأ بإضافة العقارات التي تعجبك إلى قائمتك المفضلة
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-all"
                        >
                            استكشاف العقارات
                        </Link>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((property) => (
                            <div key={property.id} className="relative">
                                <PropertyCard {...property} image={property.images[0]} location={property.location.address} />
                                <button
                                    onClick={() => toggleFavorite(property.id)}
                                    className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-black transition-all z-10"
                                    title="إزالة من المفضلة"
                                >
                                    <span className="material-symbols-outlined text-red-500">
                                        favorite
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}