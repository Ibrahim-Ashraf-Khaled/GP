'use client';

import React, { useMemo, useState } from 'react';
import { RentalType } from '@/types';

interface PriceBreakdownProps {
    rentalType: RentalType;
    duration: number;
    pricePerUnit: number;
    basePrice: number;
    serviceFee: number;
    depositAmount?: number;
    totalAmount: number;
    compact?: boolean;
    className?: string;
}

export default function PriceBreakdown({
    rentalType,
    duration,
    pricePerUnit,
    basePrice,
    serviceFee,
    depositAmount,
    totalAmount,
    compact = false,
    className = '',
}: PriceBreakdownProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatter = useMemo(() => new Intl.NumberFormat('ar-EG'), []);
    const formatNumber = (num: number) => formatter.format(Math.max(0, Number.isFinite(num) ? num : 0));

    const getUnitLabel = () => {
        if (rentalType === 'daily') return duration === 1 ? 'ليلة' : 'ليالي';
        if (rentalType === 'monthly') return duration === 1 ? 'شهر' : 'أشهر';
        return 'أشهر';
    };

    const showDeposit = typeof depositAmount === 'number' && depositAmount > 0;
    const showDetails = !compact || isExpanded;

    return (
        <section className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
            {compact ? (
                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-right text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    aria-expanded={isExpanded}
                >
                    <span>الإجمالي: {formatNumber(totalAmount)} ج.م</span>
                    <span className="text-xs text-blue-600 dark:text-blue-300">{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
                </button>
            ) : (
                <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-zinc-100">تفاصيل الفاتورة</h3>
            )}

            {showDetails ? (
                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3 text-gray-700 dark:text-zinc-300">
                        <span>{formatNumber(duration)} {getUnitLabel()} × {formatNumber(pricePerUnit)} ج.م</span>
                        <span className="font-medium text-gray-900 dark:text-zinc-100">{formatNumber(basePrice)} ج.م</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-gray-700 dark:text-zinc-300">
                        <span>رسوم الخدمة (10%)</span>
                        <span className="font-medium text-gray-900 dark:text-zinc-100">{formatNumber(serviceFee)} ج.م</span>
                    </div>

                    {showDeposit ? (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                            <span>تأمين قابل للاسترداد</span>
                            <span className="font-semibold">{formatNumber(depositAmount!)} ج.م</span>
                        </div>
                    ) : null}

                    <div className="h-px w-full bg-gray-200 dark:bg-zinc-700" />

                    <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-3 py-2 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                        <span className="font-semibold">الإجمالي</span>
                        <span className="text-lg font-black">{formatNumber(totalAmount)} ج.م</span>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
