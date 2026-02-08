'use client';

import Link from 'next/link';
import { Property, CATEGORY_AR, STATUS_AR } from '@/types';

interface MyPropertyCardProps {
    property: Property;
    onDelete: (id: string) => void;
}

export default function MyPropertyCard({ property, onDelete }: MyPropertyCardProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex gap-4 transition-all hover:shadow-md">
            {/* Thumbnail */}
            <div className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <img
                    src={property.images[0] || '/placeholder-house.jpg'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg">
                    {CATEGORY_AR[property.category]}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <Link href={`/property/${property.id}`} className="font-bold text-gray-900 dark:text-white line-clamp-1 hover:text-primary transition-colors">
                            {property.title}
                        </Link>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${property.status === 'available'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {STATUS_AR[property.status]}
                        </span>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {property.location.area}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            {property.viewsCount} مشاهدة
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            {new Date(property.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3 mt-1">
                    <span className="font-bold text-primary">
                        {property.price} ج.م / {property.priceUnit}
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => confirm('هل أنت متأكد من حذف هذا العقار؟') && onDelete(property.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="حذف العقار"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        <Link
                            href={`/add-property?edit=${property.id}`}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            title="تعديل العقار"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
