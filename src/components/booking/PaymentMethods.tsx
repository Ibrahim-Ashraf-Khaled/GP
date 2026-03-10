'use client';

import React from 'react';
import Image from 'next/image';

type PaymentMethod = 'vodafone_cash' | 'instapay' | 'cash_on_delivery';

interface PaymentMethodsProps {
    selectedMethod: PaymentMethod | null;
    onMethodChange: (method: PaymentMethod) => void;
    error?: string;
}

export default function PaymentMethods({ selectedMethod, onMethodChange, error }: PaymentMethodsProps) {
    const paymentOptions: {
        value: PaymentMethod;
        label: string;
        description: string;
        instruction: string;
        iconSrc: string;
    }[] = [
        {
            value: 'vodafone_cash',
            label: 'محفظة فودافون كاش',
            description: 'الدفع عبر محفظة فودافون كاش',
            instruction: 'بعد تأكيد الطلب سترفع صورة الإيصال',
            iconSrc: '/payments/vodafone.svg',
        },
        {
            value: 'instapay',
            label: 'إنستاباي (InstaPay)',
            description: 'تحويل فوري عبر إنستاباي',
            instruction: 'بعد تأكيد الطلب سترفع صورة الإيصال',
            iconSrc: '/payments/instapay.svg',
        },
        {
            value: 'cash_on_delivery',
            label: 'الدفع عند الاستلام',
            description: 'الدفع عند استلام العقار',
            instruction: 'سيتم الدفع عند الاستلام',
            iconSrc: '/payments/cash.png',
        },
    ];

    return (
        <fieldset className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" aria-describedby={error ? 'payment-method-error' : undefined}>
            <legend className="mb-4 text-base font-bold text-gray-900 dark:text-zinc-100">طريقة الدفع</legend>

            <div className="space-y-3">
                {paymentOptions.map((option) => {
                    const id = `payment-method-${option.value}`;
                    const isSelected = selectedMethod === option.value;

                    return (
                        <div key={option.value}>
                            <input
                                id={id}
                                type="radio"
                                name="payment_method"
                                value={option.value}
                                checked={isSelected}
                                onChange={() => onMethodChange(option.value)}
                                className="peer sr-only"
                            />

                            <label
                                htmlFor={id}
                                className="block cursor-pointer rounded-2xl border border-gray-300 bg-white p-4 transition hover:border-gray-400 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-950/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                                        <Image
                                            src={option.iconSrc}
                                            alt={option.label}
                                            fill
                                            className="object-contain p-1"
                                            unoptimized
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-zinc-100">{option.label}</p>
                                        <p className="text-xs text-gray-600 dark:text-zinc-400">{option.description}</p>
                                    </div>

                                    <div className={`h-5 w-5 rounded-full border-2 ${isSelected ? 'border-blue-600' : 'border-gray-300 dark:border-zinc-600'} flex items-center justify-center`}>
                                        {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                                    </div>
                                </div>
                            </label>

                            {isSelected ? (
                                <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
                                    {option.instruction}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            {error ? <p id="payment-method-error" className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
        </fieldset>
    );
}
