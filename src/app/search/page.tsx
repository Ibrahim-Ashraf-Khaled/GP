'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { PropertyCard } from '@/components/PropertyCard';
import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Property } from '@/types';
import SearchFilters from '@/components/SearchFilters';
import MapView from '@/components/MapView';

export default function SearchPage() {
    // States
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // Filters state
    const [activeFilters, setActiveFilters] = useState({});

    // Fetch properties when filters or search query change
    useEffect(() => {
        fetchProperties();
    }, [activeFilters, searchQuery]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            // Convert database rows to Property type
            const rows = await supabaseService.getProperties({
                status: 'available',
                ...activeFilters
            });

            // Client-side mapping + text search filtering
            // (Ideally text search should also be DB side but RLS/Index limitations might exist, doing hybrid for now)
            const mappedProperties: Property[] = rows.map(row => ({
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

            // Filter by search query if exists (client side for simple text match)
            const filtered = searchQuery
                ? mappedProperties.filter(p =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.location.address.toLowerCase().includes(searchQuery.toLowerCase())
                )
                : mappedProperties;

            setProperties(filtered);
        } catch (error) {
            console.error('Failed to fetch properties', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <Header />

            {/* 1. Sticky Search Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-4 py-4 border-b border-gray-200 dark:border-white/10 transition-all duration-300">
                <div className="max-w-5xl mx-auto relative group">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو المنطقة..."
                        className="w-full p-4 pr-12 rounded-2xl bg-gray-100 dark:bg-white/10 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-black text-gray-900 dark:text-white transition-all outline-none shadow-sm placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-8 relative">

                {/* 2. Filters Sidebar (Desktop) */}
                <aside className="hidden md:block w-72">
                    <SearchFilters onFilterChange={setActiveFilters} />
                </aside>

                {/* 3. Results Grid & Map */}
                <section className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            النتائج
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{properties.length}</span>
                        </h3>

                        {/* View Toggles */}
                        <div className="flex bg-gray-100 dark:bg-surface-dark p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">list</span>
                                قائمة
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'map'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">map</span>
                                خريطة
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : properties.length > 0 ? (
                        viewMode === 'list' ? (
                            <div className="grid grid-cols-1 gap-6">
                                {properties.map((p) => (
                                    <div key={p.id} className="animate-fadeIn">
                                        <PropertyCard {...p} image={p.images[0]} location={p.location.address} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="animate-fadeIn w-full h-[600px]">
                                <MapView properties={properties} />
                            </div>
                        )
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-white/5 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد نتائج</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">حاول تغيير معايير البحث أو إزالة الفلاتر</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Mobile Filter Button (Floating) */}
            <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
                <button
                    onClick={() => setShowFilters(true)}
                    className="bg-black/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                    <span className="font-bold text-sm">تصفية</span>
                </button>
                <button
                    onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
                    className="bg-primary/90 backdrop-blur-xl text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-[20px]">{viewMode === 'list' ? 'map' : 'list'}</span>
                    <span className="font-bold text-sm">{viewMode === 'list' ? 'الخريطة' : 'القائمة'}</span>
                </button>
            </div>

            {/* Mobile Bottom Sheet (Filters) */}
            {showFilters && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowFilters(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[2.5rem] p-6 animate-slideUp pb-safe-bottom max-h-[85vh] overflow-y-auto">
                        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />

                        <SearchFilters
                            onFilterChange={(filters) => {
                                setActiveFilters(filters);
                                // Don't close immediately to allow multiple selections
                            }}
                        />

                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg mt-6 btn-glow sticky bottom-0"
                        >
                            إظهار النتائج ({properties.length})
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
