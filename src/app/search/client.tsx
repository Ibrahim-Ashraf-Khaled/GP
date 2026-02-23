'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyCard } from '@/components/PropertyCard';
import { BottomNav } from '@/components/BottomNav';
import { Property } from '@/types';
import SearchFilters from '@/components/SearchFilters';
import MapView from '@/components/MapView';

interface SearchPageClientProps {
  initialProperties: Property[];
  initialSearchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    area?: string;
  };
}

export default function SearchPageClient({
  initialProperties,
  initialSearchParams,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Client state
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.q || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Initialize filters from URL params
  const [activeFilters, setActiveFilters] = useState({
    category: initialSearchParams.category || 'all',
    minPrice: initialSearchParams.minPrice || '',
    maxPrice: initialSearchParams.maxPrice || '',
    bedrooms: initialSearchParams.bedrooms || '',
    area: initialSearchParams.area || 'all',
  });

  // Update URL when filters change (triggers server re-fetch)
  const handleFilterChange = (newFilters: typeof activeFilters) => {
    setActiveFilters(newFilters);
    setLoading(true);
    
    // Build new URL with filters
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (newFilters.category && newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms);
    if (newFilters.area && newFilters.area !== 'all') params.set('area', newFilters.area);
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    router.push(newUrl);
  };

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLoading(true);

    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    router.push(newUrl);
  };

  // Sync client state with URL params when navigation occurs
  useEffect(() => {
    const currentParams = Object.fromEntries(searchParams.entries());
    
    setActiveFilters({
      category: currentParams.category || 'all',
      minPrice: currentParams.minPrice || '',
      maxPrice: currentParams.maxPrice || '',
      bedrooms: currentParams.bedrooms || '',
      area: currentParams.area || 'all',
    });
    
    setSearchQuery(currentParams.q || '');
  }, [searchParams]);

  // sync incoming props from server after navigation
  useEffect(() => {
    setProperties(initialProperties);
    setLoading(false);
  }, [initialProperties]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-4 py-4 border-b border-gray-200 dark:border-white/10 transition-all duration-300">
        <div className="max-w-5xl mx-auto relative group">
          <input
            type="text"
            placeholder="ابحث بالاسم أو المنطقة..."
            className="w-full p-4 pr-12 rounded-2xl bg-gray-100 dark:bg-white/10 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-black text-gray-900 dark:text-white transition-all outline-none shadow-sm placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
        </div>
      </div>

      {/* Filters Toggle (Mobile) */}
      <div className="px-4 py-3 max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{properties.length} عقار</span>
          {loading && <span>• جاري البحث...</span>}
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-white dark:bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white dark:bg-white/10 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span className="text-sm">الفلترة</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="px-4 pb-4 max-w-5xl mx-auto">
          <SearchFilters
            initialFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Results */}
      <div className="px-4 py-4 max-w-5xl mx-auto">
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                // convert location object to string address for the card
                location={property.location?.address || ''}
                image={(property as any).images?.[0] || '/images/placeholder.jpg'}
              />
            ))}
          </div>
        ) : (
          <MapView properties={properties} />
        )}

        {/* No Results */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد نتائج</h3>
            <p className="text-gray-600 dark:text-gray-400">جرب تعديل الفلاتر أو البحث بكلمات مختلفة</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}