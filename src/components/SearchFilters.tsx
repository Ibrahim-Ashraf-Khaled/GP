'use client';

import { useState, useEffect } from 'react';
import { AREAS, FEATURES, PropertyCategory } from '@/types';

interface SearchFiltersProps {
    onFilterChange: (filters: any) => void;
    initialFilters?: any;
}

export default function SearchFilters({ onFilterChange, initialFilters = {} }: SearchFiltersProps) {
    const [priceRange, setPriceRange] = useState<number>(initialFilters.maxPrice || 5000);
    const [bedrooms, setBedrooms] = useState<number>(initialFilters.bedrooms || 0);
    const [bathrooms, setBathrooms] = useState<number>(initialFilters.bathrooms || 0);
    const [selectedArea, setSelectedArea] = useState<string>(initialFilters.area || 'الكل');
    const [categories, setCategories] = useState<PropertyCategory | ''>(initialFilters.category || '');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialFilters.features || []);

    // Debounce filter changes
    useEffect(() => {
        const timeout = setTimeout(() => {
            onFilterChange({
                maxPrice: priceRange,
                bedrooms,
                bathrooms,
                area: selectedArea === 'الكل' ? undefined : selectedArea,
                category: categories || undefined,
                features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
            });
        }, 500);

        return () => clearTimeout(timeout);
    }, [priceRange, bedrooms, bathrooms, selectedArea, categories, selectedFeatures, onFilterChange]);

    const toggleFeature = (feature: string) => {
        if (selectedFeatures.includes(feature)) {
            setSelectedFeatures(prev => prev.filter(f => f !== feature));
        } else {
            setSelectedFeatures(prev => [...prev, feature]);
        }
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-border-light dark:border-border-dark shadow-xl shadow-gray-200/50 dark:shadow-none h-fit space-y-8 sticky top-32">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-text-main">الفلاتر</h3>
                <button
                    onClick={() => {
                        setPriceRange(5000);
                        setBedrooms(0);
                        setBathrooms(0);
                        setSelectedArea('الكل');
                        setCategories('');
                        setSelectedFeatures([]);
                    }}
                    className="text-xs text-primary font-bold hover:underline"
                >
                    إعادة تعيين
                </button>
            </div>

            {/* Price Filter */}
            <div>
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-main">
                    <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                    السعر الأقصى: <span className="text-primary">{priceRange.toLocaleString()} ج.م</span>
                </h4>
                <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-background-light dark:bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-text-muted mt-2">
                    <span>500</span>
                    <span>10,000+</span>
                </div>
            </div>

            {/* Area Filter */}
            <div>
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-main">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    المنطقة
                </h4>
                <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-sm focus:border-primary outline-none text-text-main"
                >
                    <option value="الكل">كل المناطق</option>
                    {AREAS.map(area => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
            </div>

            {/* Rooms & Baths */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-bold mb-3 text-xs text-text-muted">عدد الغرف</h4>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((num) => (
                            <button
                                key={num}
                                onClick={() => setBedrooms(num === bedrooms ? 0 : num)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${bedrooms === num
                                    ? "bg-primary text-white"
                                    : "bg-background-light dark:bg-background-dark text-text-muted"
                                    }`}
                            >
                                {num}+
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold mb-3 text-xs text-text-muted">حمامات</h4>
                    <div className="flex gap-2">
                        {[1, 2].map((num) => (
                            <button
                                key={num}
                                onClick={() => setBathrooms(num === bathrooms ? 0 : num)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${bathrooms === num
                                    ? "bg-primary text-white"
                                    : "bg-background-light dark:bg-background-dark text-text-muted"
                                    }`}
                            >
                                {num}+
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features */}
            <div>
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-main">
                    <span className="material-symbols-outlined text-primary text-[18px]">star</span>
                    المميزات
                </h4>
                <div className="flex flex-wrap gap-2">
                    {FEATURES.slice(0, 6).map((feature) => (
                        <button
                            key={feature}
                            onClick={() => toggleFeature(feature)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedFeatures.includes(feature)
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-transparent border-border-light dark:border-border-dark text-text-muted hover:border-text-muted"
                                }`}
                        >
                            {feature}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
