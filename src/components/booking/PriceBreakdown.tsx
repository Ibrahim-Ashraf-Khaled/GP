'use client';

import React from 'react';
import { RentalType } from '@/types';

interface PriceBreakdownProps {
    rentalType: RentalType;
    duration: number;
    pricePerUnit: number;
    basePrice: number;
    serviceFee: number;
    depositAmount?: number;
    totalAmount: number;
}

export default function PriceBreakdown({
    rentalType,
    duration,
    pricePerUnit,
    basePrice,
    serviceFee,
    depositAmount,
    totalAmount
}: PriceBreakdownProps) {
    const getUnitLabel = () => {
        switch (rentalType) {
            case 'daily':
                return duration === 1 ? 'ليلة' : duration === 2 ? 'ليلتان' : 'ليالي';
            case 'monthly':
                return duration === 1 ? 'شهر' : duration === 2 ? 'شهران' : 'أشهر';
            case 'seasonal':
                return 'أشهر';
            default:
                return '';
        }
    };

    return (
        <div className="price-breakdown">
            <h3 className="text-lg font-semibold mb-4">تفاصيل الفاتورة</h3>

            <div className="space-y-3">
                {/* السعر الأساسي */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                        {duration} {getUnitLabel()} × {pricePerUnit.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span className="font-medium">
                        {basePrice.toLocaleString('ar-EG')} ج.م
                    </span>
                </div>

                {/* رسوم الخدمة */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">رسوم الخدمة (10%)</span>
                    <span className="font-medium">
                        {serviceFee.toLocaleString('ar-EG')} ج.م
                    </span>
                </div>

                {/* التأمين (للإيجار الموسمي فقط) */}
                {depositAmount && depositAmount > 0 && (
                    <div className="deposit-card">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-gray-700 font-bold">تأمين قابل للاسترداد</span>
                                <p className="text-xs text-gray-500 mt-1">
                                    سيتم استرداد التأمين عند نهاية الإيجار
                                </p>
                            </div>
                            <span className="font-bold text-amber-700">
                                {depositAmount.toLocaleString('ar-EG')} ج.م
                            </span>
                        </div>
                    </div>
                )}

                {/* الفاصل */}
                <div className="divider"></div>

                {/* المجموع الكلي */}
                <div className="total-card">
                    <span className="text-lg font-bold text-gray-700">المجموع الكلي</span>
                    <span className="total-amount">
                        {totalAmount.toLocaleString('ar-EG')} ج.م
                    </span>
                </div>
            </div>

            <style jsx>{`
                .price-breakdown {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }

                .total-card {
                    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%);
                    backdrop-filter: blur(4px);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 1px solid rgba(37, 99, 235, 0.2);
                    margin-top: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .total-amount {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #2563eb;
                    text-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
                }

                .deposit-card {
                    background: rgba(254, 243, 199, 0.5);
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(252, 211, 77, 0.4);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .divider {
                    border-top: 1px solid rgba(209, 213, 219, 0.4);
                    margin: 1.5rem 0;
                }
            `}</style>
        </div>
    );
}
