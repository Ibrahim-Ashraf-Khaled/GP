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
        <div className="group bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 overflow-hidden relative">
            {/* Subtle top glow indicator based on status */}
            <div className={`absolute top-0 inset-x-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${property.status === 'available' ? 'bg-gradient-to-r from-transparent via-green-500 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'}`} />
            
            <div className="relative w-full sm:w-40 h-48 sm:h-auto shrink-0 rounded-[1.1rem] overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <Image
                    src={property.images[0] || '/placeholder-house.jpg'}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, 160px"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    {CATEGORY_AR[property.category]}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="flex items-start justify-between mb-3">
                        <Link href={`/property/${property.id}`} className="font-black text-lg text-gray-900 dark:text-white line-clamp-1 hover:text-primary transition-colors">
                            {property.title}
                        </Link>
                        <div className="relative z-10">
                            <button
                                onClick={() => setShowStatusMenu(!showStatusMenu)}
                                disabled={!onStatusChange}
                                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm ${property.status === 'available'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${property.status === 'available' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {STATUS_AR[property.status]}
                                {onStatusChange && <span className="material-symbols-outlined text-[14px]">expand_more</span>}
                            </button>
                            {showStatusMenu && onStatusChange && (
                                <div className="absolute top-full left-0 mt-2 bg-white/90 dark:bg-zinc-800/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-gray-100 dark:border-white/10 p-1 z-20 min-w-[140px] animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-200">
                                    {(Object.keys(STATUS_AR) as PropertyStatus[]).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className="w-full text-right px-4 py-2.5 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-between group/btn"
                                        >
                                            {STATUS_AR[status]}
                                            {property.status === status && <span className="material-symbols-outlined text-[16px] text-primary">check</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] opacity-70">location_on</span>
                        {property.location.area}
                    </div>

                    <div className="flex items-center gap-5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            {property.viewsCount} مشاهدة
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {new Date(property.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4 mt-4 gap-4">
                    <span className="font-black text-xl text-primary">
                        {property.price} <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">ج.م / {property.priceUnit}</span>
                    </span>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="flex-1 sm:flex-none flex items-center justify-center p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/del"
                            title="حذف العقار"
                        >
                            {isDeleting ? (
                                <span className="material-symbols-outlined text-[22px] animate-spin">hourglass_empty</span>
                            ) : (
                                <span className="material-symbols-outlined text-[22px] group-hover/del:scale-110 transition-transform">delete</span>
                            )}
                        </button>
                        <Link
                            href={`/add-property?edit=${property.id}`}
                            className="flex-1 sm:flex-none flex items-center justify-center p-2.5 rounded-xl text-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors group/edit"
                            title="تعديل العقار"
                        >
                            <span className="material-symbols-outlined text-[22px] group-hover/edit:scale-110 transition-transform">edit</span>
                        </Link>
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-300"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden" />
                        
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
                            <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
                        </div>
                        
                        <h3 className="text-center font-black text-gray-900 dark:text-white text-xl mb-2">تأكيد الحذف</h3>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-1">هل أنت متأكد من رغبتك في حذف عقار</p>
                        <p className="text-center font-bold text-gray-900 dark:text-white text-base mb-8 line-clamp-2 px-4 shadow-sm bg-gray-50 dark:bg-white/5 py-2 rounded-xl mt-3 border border-gray-100 dark:border-white/5">"{property.title}"؟</p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold transition-colors active:scale-95"
                            >
                                العودة للأمان
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all active:scale-95 shadow-lg shadow-red-500/30 disabled:opacity-60 disabled:hover:bg-red-500 disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                                )}
                                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف!'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
