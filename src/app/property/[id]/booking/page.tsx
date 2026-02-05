'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { PropertyRow } from '@/services/supabaseService';
import { RentalConfig, RentalType } from '@/types';
import DateSelector from '@/components/booking/DateSelector';
import TenantForm from '@/components/booking/TenantForm';
import PaymentMethods from '@/components/booking/PaymentMethods';
import PriceBreakdown from '@/components/booking/PriceBreakdown';
import Image from 'next/image';

export default function BookingPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const propertyId = params.id as string;

    // حالة العقار
    const [property, setProperty] = useState<PropertyRow | null>(null);
    const [loading, setLoading] = useState(true);

    // حالة التواريخ
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // حالة بيانات المستأجر
    const [tenantName, setTenantName] = useState('');
    const [tenantPhone, setTenantPhone] = useState('');
    const [tenantEmail, setTenantEmail] = useState('');

    // حالة الدفع
    const [paymentMethod, setPaymentMethod] = useState<'vodafone_cash' | 'instapay' | 'cash_on_delivery' | null>(null);

    // حالة الحساب
    const [priceDetails, setPriceDetails] = useState({
        basePrice: 0,
        serviceFee: 0,
        depositAmount: 0,
        totalAmount: 0,
        duration: 0
    });

    // حالة الإرسال
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // تكوين افتراضي للإيجار (سيتم استبداله بالبيانات الفعلية)
    const getDefaultRentalConfig = (): RentalConfig => {
        if (!property) {
            return {
                type: 'daily',
                pricePerUnit: 0,
                minDuration: 1,
                maxDuration: 30
            };
        }

        // تحديد نوع الإيجار بناءً على priceUnit
        let type: RentalType = 'daily';
        if (property.price_unit === 'شهر' || property.price_unit === 'موسم') {
            type = property.price_unit === 'موسم' ? 'seasonal' : 'monthly';
        }

        // استخدام rentalConfig إذا كان موجوداً، وإلا إنشاء تكوين افتراضي
        const propertyAsAny = property as any;
        return propertyAsAny.rentalConfig || {
            type,
            pricePerUnit: property.price,
            minDuration: type === 'daily' ? 1 : type === 'monthly' ? 1 : 10,
            maxDuration: type === 'daily' ? 60 : type === 'monthly' ? 12 : 10,
            seasonalConfig: type === 'seasonal' ? {
                startMonth: 9,
                endMonth: 6,
                requiresDeposit: true,
                depositAmount: property.price
            } : undefined
        };
    };

    // جلب بيانات العقار
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const data = await supabaseService.getPropertyById(propertyId);
                if (data) {
                    setProperty(data);
                } else {
                    setError('لم يتم العثور على العقار');
                }
            } catch (err) {
                setError('حدث خطأ أثناء تحميل بيانات العقار');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    // ملء بيانات المستخدم تلقائياً
    useEffect(() => {
        if (user) {
            const userAsAny = user as any;
            setTenantName(userAsAny.name || userAsAny.full_name || '');
            setTenantPhone(user.phone || '');
            setTenantEmail(user.email || '');
        }
    }, [user]);

    // حساب السعر عند تغيير التواريخ
    useEffect(() => {
        if (startDate && endDate && property) {
            const rentalConfig = getDefaultRentalConfig();
            const calculation = supabaseService.calculateTotalPrice(
                rentalConfig,
                startDate,
                endDate
            );
            setPriceDetails(calculation);
        }
    }, [startDate, endDate, property]);

    // معالجة إرسال الحجز
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            router.push('/login?redirect=/property/' + propertyId + '/booking');
            return;
        }

        if (!startDate || !endDate || !paymentMethod) {
            setError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const rentalConfig = getDefaultRentalConfig();

            // التحقق من التوفر
            const { available } = await supabaseService.checkAvailability(
                propertyId,
                startDate.toISOString(),
                endDate.toISOString()
            );

            if (!available) {
                setError('عذراً، العقار غير متاح في هذه الفترة');
                setIsSubmitting(false);
                return;
            }

            // إنشاء الحجز
            const { data: booking, error: bookingError } = await supabaseService.createBooking({
                propertyId,
                userId: user.id,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                totalNights: rentalConfig.type === 'daily' ? priceDetails.duration : undefined,
                totalMonths: rentalConfig.type !== 'daily' ? priceDetails.duration : undefined,
                rentalType: rentalConfig.type,
                tenantName,
                tenantPhone,
                tenantEmail: tenantEmail || undefined,
                basePrice: priceDetails.basePrice,
                serviceFee: priceDetails.serviceFee,
                depositAmount: priceDetails.depositAmount || undefined,
                totalAmount: priceDetails.totalAmount,
                paymentMethod,
                paymentStatus: paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending',
                status: paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending',
            });

            if (bookingError) {
                throw new Error('فشل إنشاء الحجز');
            }

            // الانتقال إلى صفحة التأكيد
            router.push(`/property/${propertyId}/booking/confirmation?bookingId=${booking?.id}`);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إنشاء الحجز');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>جاري تحميل بيانات الحجز...</p>
            </div>
        );
    }

    if (error && !property) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={() => router.back()} className="btn-back">
                    العودة
                </button>
            </div>
        );
    }

    if (!property) return null;

    const rentalConfig = getDefaultRentalConfig();

    return (
        <div className="booking-page">
            <div className="container">
                <button onClick={() => router.back()} className="back-btn">
                    ← العودة
                </button>

                <h1 className="page-title">إتمام الحجز</h1>

                <div className="booking-grid">
                    {/* القسم الأيمن: النموذج */}
                    <div className="booking-form-section">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ملخص العقار */}
                            <div className="property-summary">
                                <div className="property-image">
                                    <Image
                                        src={property.images[0] || '/placeholder.jpg'}
                                        alt={property.title}
                                        width={120}
                                        height={80}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                                <div className="property-info">
                                    <h3 className="property-title">{property.title}</h3>
                                    <p className="property-location">📍 {property.address || property.area}</p>
                                    {property.is_verified && (
                                        <span className="verified-badge">✓ معاين ومؤكد</span>
                                    )}
                                </div>
                            </div>

                            {/* اختيار التواريخ */}
                            <DateSelector
                                rentalConfig={rentalConfig}
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={setStartDate}
                                onEndDateChange={setEndDate}
                            />

                            {/* بيانات المستأجر */}
                            <TenantForm
                                tenantName={tenantName}
                                tenantPhone={tenantPhone}
                                tenantEmail={tenantEmail}
                                onNameChange={setTenantName}
                                onPhoneChange={setTenantPhone}
                                onEmailChange={setTenantEmail}
                            />

                            {/* طرق الدفع */}
                            <PaymentMethods
                                selectedMethod={paymentMethod}
                                onMethodChange={setPaymentMethod}
                            />

                            {/* رسالة خطأ */}
                            {error && (
                                <div className="error-alert">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* زر الإرسال */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !startDate || !endDate || !paymentMethod}
                                className="submit-btn"
                            >
                                {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
                            </button>
                        </form>
                    </div>

                    {/* القسم الأيسر: تفاصيل السعر */}
                    <div className="price-section">
                        <div className="sticky-container">
                            {startDate && endDate && (
                                <PriceBreakdown
                                    rentalType={rentalConfig.type}
                                    duration={priceDetails.duration}
                                    pricePerUnit={rentalConfig.pricePerUnit}
                                    basePrice={priceDetails.basePrice}
                                    serviceFee={priceDetails.serviceFee}
                                    depositAmount={priceDetails.depositAmount}
                                    totalAmount={priceDetails.totalAmount}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .booking-page {
                    min-height: 100vh;
                    background: radial-gradient(circle at top right, #f3f4f6 0%, #e5e7eb 100%);
                    padding: 3rem 0;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                    animation: fadeIn 0.6s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .back-btn {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    color: #4b5563;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .back-btn:hover {
                    background: white;
                    transform: translateX(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    color: #111827;
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 2.5rem;
                    color: #111827;
                    letter-spacing: -0.025em;
                }

                .booking-grid {
                    display: grid;
                    grid-template-columns: 1fr 420px;
                    gap: 2.5rem;
                    align-items: start;
                }

                @media (max-width: 1024px) {
                    .booking-grid {
                        grid-template-columns: 1fr;
                    }
                    .page-title {
                        font-size: 2rem;
                    }
                }

                .booking-form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .space-y-6 > * + * {
                    margin-top: 2rem;
                }

                .property-summary {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    border-radius: 20px;
                    padding: 2rem;
                    display: flex;
                    gap: 1.5rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                    transition: transform 0.3s ease;
                }
                
                .property-summary:hover {
                    transform: translateY(-2px);
                }

                .property-image {
                    flex-shrink: 0;
                    overflow: hidden;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .property-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .property-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: #1f2937;
                }

                .property-location {
                    color: #6b7280;
                    font-size: 0.95rem;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .verified-badge {
                    display: inline-flex;
                    align-items: center;
                    background: #ecfdf5;
                    color: #059669;
                    padding: 0.35rem 1rem;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border: 1px solid #d1fae5;
                    width: fit-content;
                }

                .sticky-container {
                    position: sticky;
                    top: 2rem;
                    animation: slideInRight 0.6s ease-out;
                }

                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .error-alert {
                    background: #fef2f2;
                    border: 1px solid #fee2e2;
                    color: #dc2626;
                    padding: 1.25rem;
                    border-radius: 12px;
                    text-align: center;
                    font-weight: 500;
                    box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1);
                }

                .submit-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    color: white;
                    padding: 1.25rem;
                    border-radius: 16px;
                    font-size: 1.25rem;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                    position: relative;
                    overflow: hidden;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.01);
                    box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }

                .submit-btn:active:not(:disabled) {
                    transform: translateY(0) scale(0.98);
                }

                .submit-btn:disabled {
                    background: #d1d5db;
                    color: #9ca3af;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .loading-container, .error-container {
                    min-height: 60vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                }

                .spinner {
                    width: 56px;
                    height: 56px;
                    border: 5px solid rgba(37, 99, 235, 0.1);
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .error-message {
                    color: #b91c1c;
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .btn-back {
                    background: #2563eb;
                    color: white;
                    padding: 0.875rem 2rem;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-back:hover {
                    background: #1e40af;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }
            `}</style>
        </div>
    );
}
