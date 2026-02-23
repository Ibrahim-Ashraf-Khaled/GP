'use client';

import React from 'react';
import { RentalType, RentalConfig } from '@/types';

interface DateSelectorProps {
    rentalConfig: RentalConfig;
    startDate: Date | null;
    endDate: Date | null;
    minDate?: Date; // allow parent to restrict earliest selectable day
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
    onMonthsChange?: (months: number) => void;
}

export default function DateSelector({
    rentalConfig,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onMonthsChange
}: DateSelectorProps) {
    const { type, minDuration, maxDuration, seasonalConfig } = rentalConfig;

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        onStartDateChange(date);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        onEndDateChange(date);
    };

    const handleMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const months = parseInt(e.target.value);
        if (onMonthsChange) {
            onMonthsChange(months);
        }

        if (startDate) {
            const end = new Date(startDate);
            end.setMonth(end.getMonth() + months);
            onEndDateChange(end);
        }
    };

    // الحصول على الحد الأدنى لتاريخ البداية (اليوم)
    const getMinStartDate = () => {
        if (minDate) {
            return formatDate(minDate);
        }
        const today = new Date();
        return formatDate(today);
    };

    // الحصول على الحد الأدنى لتاريخ النهاية
    const getMinEndDate = () => {
        if (!startDate) return getMinStartDate();
        const minEnd = new Date(startDate);

        if (type === 'daily') {
            minEnd.setDate(minEnd.getDate() + minDuration);
        } else if (type === 'monthly') {
            minEnd.setMonth(minEnd.getMonth() + minDuration);
        }

        return formatDate(minEnd);
    };

    // عرض محدد التاريخ للإيجار اليومي
    if (type === 'daily') {
        return (
            <div className="date-selector">
                <h3 className="text-lg font-semibold mb-4">اختر مواعيد الإقامة</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">تاريخ الوصول</label>
                        <input
                            type="date"
                            value={formatDate(startDate)}
                            onChange={handleStartDateChange}
                            min={getMinStartDate()}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">تاريخ المغادرة</label>
                        <input
                            type="date"
                            value={formatDate(endDate)}
                            onChange={handleEndDateChange}
                            min={getMinEndDate()}
                            className="form-input"
                            required
                            disabled={!startDate}
                        />
                    </div>
                </div>

                {startDate && endDate && (
                    <div className="duration-info">
                        <span className="info-icon">📅</span>
                        <span>
                            عدد الليالي: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                    </div>
                )}

                <style jsx>{`
                    ${sharedStyles}
                `}</style>
            </div>
        );
    }

    // عرض محدد التاريخ للإيجار الشهري
    if (type === 'monthly') {
        return (
            <div className="date-selector">
                <h3 className="text-lg font-semibold mb-4">اختر فترة الإيجار</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">تاريخ البداية</label>
                        <input
                            type="date"
                            value={formatDate(startDate)}
                            onChange={handleStartDateChange}
                            min={getMinStartDate()}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">عدد الأشهر</label>
                        <select
                            onChange={handleMonthsChange}
                            className="form-input"
                            required
                            disabled={!startDate}
                        >
                            <option value="">اختر المدة</option>
                            {Array.from({ length: maxDuration - minDuration + 1 }, (_, i) => minDuration + i).map(months => (
                                <option key={months} value={months}>
                                    {months} {months === 1 ? 'شهر' : months === 2 ? 'شهران' : 'أشهر'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {endDate && (
                    <div className="duration-info">
                        <span className="info-icon">📅</span>
                        <span>
                            الإيجار حتى: {endDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                )}

                <style jsx>{`
                    ${sharedStyles}
                `}</style>
            </div>
        );
    }

    // عرض محدد التاريخ للإيجار الموسمي
    if (type === 'seasonal') {
        const startMonth = seasonalConfig?.startMonth || 9; // سبتمبر
        const endMonth = seasonalConfig?.endMonth || 6; // يونيو

        return (
            <div className="date-selector">
                <h3 className="text-lg font-semibold mb-4">الفترة الدراسية</h3>

                <div className="seasonal-info">
                    <div className="info-card">
                        <span className="info-icon">🎓</span>
                        <div>
                            <h4 className="font-semibold">إيجار الفترة الدراسية الكاملة</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                من سبتمبر إلى يونيو (10 أشهر)
                            </p>
                        </div>
                    </div>

                    {seasonalConfig?.requiresDeposit && (
                        <div className="deposit-notice">
                            <span className="warning-icon">⚠️</span>
                            <div>
                                <h4 className="font-semibold text-amber-700">تأمين مطلوب</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    سيتم استرداد التأمين عند نهاية الفترة وتسليم العقار
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <style jsx>{`
                    ${sharedStyles}
                    
                    .seasonal-info {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .info-card {
                        display: flex;
                        gap: 1rem;
                        align-items: start;
                        padding: 1rem;
                        background: #dbeafe;
                        border-radius: 8px;
                        border: 1px solid #93c5fd;
                    }

                    .deposit-notice {
                        display: flex;
                        gap: 1rem;
                        align-items: start;
                        padding: 1rem;
                        background: #fef3c7;
                        border-radius: 8px;
                        border: 1px solid #fcd34d;
                    }

                    .warning-icon {
                        font-size: 1.5rem;
                    }
                `}</style>
            </div>
        );
    }

    return null;
}

// الأنماط المشتركة
const sharedStyles = `
    .date-selector {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-label {
        font-weight: 700;
        font-size: 0.9rem;
        color: #374151;
        text-align: right;
        margin-right: 0.25rem;
    }

    .form-input {
        width: 100%;
        padding: 0.875rem 1.25rem;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(209, 213, 219, 0.5);
        border-radius: 12px;
        font-size: 1rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: right;
        direction: rtl;
        color: #111827;
    }

    .form-input:focus {
        outline: none;
        background: white;
        border-color: #2563eb;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        transform: translateY(-1px);
    }

    .form-input:hover:not(:disabled) {
        border-color: #9ca3af;
        background: rgba(255, 255, 255, 0.8);
    }

    .form-input:disabled {
        background: rgba(243, 244, 246, 0.5);
        cursor: not-allowed;
        color: #9ca3af;
    }

    .duration-info {
        margin-top: 1.5rem;
        padding: 1rem 1.5rem;
        background: rgba(236, 253, 245, 0.6);
        backdrop-filter: blur(4px);
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid rgba(167, 243, 208, 0.5);
        color: #065f46;
        font-weight: 600;
    }

    .info-icon {
        font-size: 1.25rem;
    }
`;
