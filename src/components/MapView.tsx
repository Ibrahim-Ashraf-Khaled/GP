'use client';

import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { useMemo } from 'react';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2">map</span>
                <span className="text-sm">جاري تحميل الخريطة...</span>
            </div>
        </div>
    )
});

interface MapViewProps {
    properties: Property[];
    className?: string;
}

export default function MapView({ properties, className = "" }: MapViewProps) {
    // Calculate center dynamically based on properties if available
    const center = useMemo(() => {
        if (properties.length === 0) return undefined;
        // Simple average center
        const lat = properties.reduce((sum, p) => sum + (p.location.lat || 31.4456), 0) / properties.length;
        const lng = properties.reduce((sum, p) => sum + (p.location.lng || 31.5477), 0) / properties.length;
        return [lat, lng] as [number, number];
    }, [properties]);

    return (
        <div className={`w-full h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 relative z-0 ${className}`}>
            <PropertyMap properties={properties} center={center} />
        </div>
    );
}
