'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property, CATEGORY_AR, STATUS_AR, PropertyStatus } from '@/types';

interface MyPropertyCardProps {
    property: Property;
    onDelete: (id: string) => void;
    onStatusChange?: (id: string, newStatus: PropertyStatus) => Promise<void>;
    isDeleting?: boolean;
}

export default function MyPropertyCard({ property, onDelete, onStatusChange, isDeleting: externalIsDeleting }: MyPropertyCardProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const isDeleting = externalIsDeleting || false;

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(property.id);
        setShowConfirm(false);
    };

    const handleStatusChange = async (newStatus: PropertyStatus) => {
        if (onStatusChange) {
            await onStatusChange(property.id, newStatus);
        }
        setShowStatusMenu(false);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex gap-4 transition-all hover:shadow-md">
            <div className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <Image
                    src={property.images[0] || '/placeholder-house.jpg'}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="128px"
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
                        <div className="relative">
                            <button
                                onClick={() => setShowStatusMenu(!showStatusMenu)}
                                disabled={!onStatusChange}
                                className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity relative ${property.status === 'available'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}
                            >
                                {STATUS_AR[property.status]}
                                {onStatusChange && <span className="material-symbols-outlined text-[12px] mr-1">expand_more</span>}
                            </button>
                            {showStatusMenu && onStatusChange && (
                                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 py-1 z-10 min-w-[120px]">
                                    {(Object.keys(STATUS_AR) as PropertyStatus[]).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className="w-full text-right px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                                        >
                                            {STATUS_AR[status]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="حذف العقار"
                        >
                            {isDeleting ? (
                                <span className="material-symbols-outlined text-[20px] animate-spin">hourglass_empty</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            )}
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

            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-6 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-red-500">delete_forever</span>
                        </div>
                        <h3 className="text-center font-bold text-gray-900 dark:text-white text-lg mb-2">حذف العقار</h3>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-1">هل أنت متأكد من حذف</p>
                        <p className="text-center font-semibold text-gray-900 dark:text-white text-sm mb-6 line-clamp-1">"{property.title}"</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium text-sm"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                )}
                                {isDeleting ? 'جاري الحذف...' : 'حذف'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
