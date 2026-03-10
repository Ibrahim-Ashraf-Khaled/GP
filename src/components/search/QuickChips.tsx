'use client';

type Filters = {
    category: string;
    area: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    bathrooms?: string;
    features?: string; // csv
};

export default function QuickChips({
    filters,
    onOpenFilters,
}: {
    filters: Filters;
    onOpenFilters: () => void;
}) {
    const chips: { key: string; label: string }[] = [];

    if (filters.category && filters.category !== 'all') chips.push({ key: 'cat', label: `النوع: ${filters.category}` });
    if (filters.area && filters.area !== 'all' && filters.area !== 'الكل') chips.push({ key: 'area', label: `المنطقة: ${filters.area}` });

    if (filters.maxPrice) chips.push({ key: 'price', label: `حتى ${Number(filters.maxPrice).toLocaleString()} ج` });
    if (filters.bedrooms) chips.push({ key: 'beds', label: `${filters.bedrooms}+ غرف` });
    if (filters.bathrooms) chips.push({ key: 'baths', label: `${filters.bathrooms}+ حمامات` });

    if (filters.features) {
        const count = filters.features.split(',').filter(Boolean).length;
        if (count > 0) chips.push({ key: 'feat', label: `مميزات (${count})` });
    }

    if (chips.length === 0) return null;

    return (
        <div className="md:hidden px-4 pt-3 max-w-5xl mx-auto">
            <div className="flex gap-2 overflow-auto no-scrollbar">
                {chips.map((c) => (
                    <button
                        key={c.key}
                        onClick={onOpenFilters}
                        className="shrink-0 px-3 py-2 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-200"
                    >
                        {c.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
