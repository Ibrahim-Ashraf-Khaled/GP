'use client';

import React from 'react';

interface TenantFormProps {
    tenantName: string;
    tenantPhone: string;
    tenantEmail: string;
    onNameChange: (name: string) => void;
    onPhoneChange: (phone: string) => void;
    onEmailChange: (email: string) => void;
}

export default function TenantForm({
    tenantName,
    tenantPhone,
    tenantEmail,
    onNameChange,
    onPhoneChange,
    onEmailChange
}: TenantFormProps) {
    return (
        <div className="tenant-form">
            <h3 className="text-lg font-semibold mb-4">بيانات المستأجر</h3>

            <div className="space-y-4">
                {/* الاسم الكامل */}
                <div className="form-group">
                    <label className="form-label" htmlFor="tenant-name">
                        الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="tenant-name"
                        type="text"
                        value={tenantName}
                        onChange={(e) => onNameChange(e.target.value)}
                        className="form-input"
                        placeholder="أدخل اسمك الكامل"
                        required
                    />
                </div>

                {/* رقم الهاتف */}
                <div className="form-group">
                    <label className="form-label" htmlFor="tenant-phone">
                        رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="tenant-phone"
                        type="tel"
                        value={tenantPhone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        className="form-input"
                        placeholder="01xxxxxxxxx"
                        pattern="^01[0-9]{9}$"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        سنستخدم هذا الرقم للتواصل معك
                    </p>
                </div>

                {/* البريد الإلكتروني */}
                <div className="form-group">
                    <label className="form-label" htmlFor="tenant-email">
                        البريد الإلكتروني (اختياري)
                    </label>
                    <input
                        id="tenant-email"
                        type="email"
                        value={tenantEmail}
                        onChange={(e) => onEmailChange(e.target.value)}
                        className="form-input"
                        placeholder="example@email.com"
                    />
                </div>
            </div>

            <style jsx>{`
                .tenant-form {
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

                .form-input:hover {
                    border-color: #9ca3af;
                    background: rgba(255, 255, 255, 0.8);
                }

                .form-input::placeholder {
                    color: #9ca3af;
                }
            `}</style>
        </div>
    );
}
