'use client';

import React, { useState } from 'react';

type PaymentMethod = 'vodafone_cash' | 'instapay' | 'cash_on_delivery';

interface PaymentMethodsProps {
    selectedMethod: PaymentMethod | null;
    onMethodChange: (method: PaymentMethod) => void;
}

export default function PaymentMethods({ selectedMethod, onMethodChange }: PaymentMethodsProps) {
    const paymentOptions: { value: PaymentMethod; label: string; icon: string; description: string }[] = [
        {
            value: 'vodafone_cash',
            label: 'محفظة فودافون كاش',
            icon: '📱',
            description: 'الدفع عبر محفظة فودافون كاش'
        },
        {
            value: 'instapay',
            label: 'إنستاباي (InstaPay)',
            icon: '💳',
            description: 'التحويل الفوري عبر إنستاباي'
        },
        {
            value: 'cash_on_delivery',
            label: 'الدفع عند الاستلام',
            icon: '💵',
            description: 'ادفع نقداً عند استلام العقار'
        }
    ];

    return (
        <div className="payment-methods">
            <h3 className="text-lg font-semibold mb-4">طريقة الدفع</h3>

            <div className="space-y-3">
                {paymentOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onMethodChange(option.value)}
                        className={`payment-option ${selectedMethod === option.value ? 'selected' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="icon-container">
                                <span className="text-2xl">{option.icon}</span>
                            </div>
                            <div className="flex-1 text-right">
                                <div className="font-semibold text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                            </div>
                            <div className="radio-indicator">
                                {selectedMethod === option.value && (
                                    <div className="radio-inner"></div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <style jsx>{`
                .payment-methods {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }

                .payment-option {
                    width: 100%;
                    text-align: right;
                    padding: 1.25rem;
                    border: 1px solid rgba(209, 213, 219, 0.5);
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .payment-option:hover {
                    border-color: #2563eb;
                    background: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .payment-option.selected {
                    border-color: #2563eb;
                    background: rgba(37, 99, 235, 0.05);
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .icon-container {
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .payment-option.selected .icon-container {
                    background: #2563eb;
                    color: white;
                }

                .radio-indicator {
                    width: 24px;
                    height: 24px;
                    border: 2px solid rgba(209, 213, 219, 0.8);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    background: white;
                }

                .payment-option.selected .radio-indicator {
                    border-color: #2563eb;
                    background: white;
                }

                .radio-inner {
                    width: 12px;
                    height: 12px;
                    background: #2563eb;
                    border-radius: 50%;
                    animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes scaleIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
