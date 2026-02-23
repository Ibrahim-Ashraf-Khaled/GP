'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { PropertyRow } from '@/services/supabaseService';
import { RentalConfig, RentalType } from '@/types';
import DateSelector from '@/components/booking/DateSelector';
import TenantForm from '@/components/booking/TenantForm';
import PaymentMethods from '@/components/booking/PaymentMethods';
import PriceBreakdown from '@/components/booking/PriceBreakdown';
import Image from 'next/image';

interface BookingPageClientProps {
  propertyId: string;
  initialProperty: PropertyRow;
}

export default function BookingPageClient({ propertyId, initialProperty }: BookingPageClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Property state (initialized with server data)
  const [property, setProperty] = useState<PropertyRow>(initialProperty);
  const [loading, setLoading] = useState(false);

  // Date state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Tenant data state
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'vodafone_cash' | 'instapay' | 'cash_on_delivery' | null>(null);

  // Price calculation state
  const [priceDetails, setPriceDetails] = useState({
    basePrice: 0,
    serviceFee: 0,
    depositAmount: 0,
    totalAmount: 0,
    duration: 0
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default rental configuration (will be replaced with actual property data)
  const [rentalConfig] = useState<RentalConfig>({
    type: 'daily' as RentalType,
    pricePerUnit: property.price,
    minDuration: 1,
    maxDuration: 30,
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setTenantName(user.name || user.email?.split('@')[0] || '');
      setTenantEmail(user.email || '');
      // Note: Phone number would need to be fetched from profile
    }
  }, [user]);

  // Calculate price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const details = supabaseService.calculateTotalPrice(
        rentalConfig,
        startDate,
        endDate
      );
      setPriceDetails(details);
    } else {
      setPriceDetails({
        basePrice: 0,
        serviceFee: 0,
        depositAmount: 0,
        totalAmount: 0,
        duration: 0
      });
    }
  }, [startDate, endDate, rentalConfig]);

  // Check availability
  const checkAvailability = async () => {
    if (!startDate || !endDate) return true;
    
    const { available, error } = await supabaseService.checkAvailability(
      propertyId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    if (error) {
      console.error('Availability check failed:', error);
      return false;
    }
    
    return available;
  };

  // Handle booking submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!startDate || !endDate) {
      setError('يرجى اختيار تاريخ البداية والنهاية');
      return;
    }

    if (!tenantName || !tenantPhone || !tenantEmail) {
      setError('يرجى ملء جميع بيانات المستأجر');
      return;
    }

    if (!paymentMethod) {
      setError('يرجى اختيار طريقة الدفع');
      return;
    }

    // Check availability
    setLoading(true);
    const isAvailable = await checkAvailability();
    setLoading(false);

    if (!isAvailable) {
      setError('العقار غير متاح في التواريخ المحددة');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create booking
      const { data: booking, error: bookingError } = await supabaseService.createBooking({
        propertyId,
        userId: user?.id || 'guest',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalNights: priceDetails.duration,
        totalMonths: Math.ceil(priceDetails.duration / 30),
        rentalType: rentalConfig.type,
        tenantName,
        tenantPhone,
        tenantEmail,
        basePrice: priceDetails.basePrice,
        serviceFee: priceDetails.serviceFee,
        depositAmount: priceDetails.depositAmount,
        totalAmount: priceDetails.totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
      });

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      // Redirect to booking confirmation
      if (booking) {
        router.push(`/property/${propertyId}/booking/confirmation?bookingId=${booking.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'فشل إرسال طلب الحجز. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            رجوع
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info and Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Summary */}
            <div className="bg-white dark:bg-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">{property.title}</h2>
              
              {property.images && property.images.length > 0 && (
                <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-4">
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  {property.address || 'جمصة'}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">bed</span>
                    {property.bedrooms} غرف
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">bath</span>
                    {property.bathrooms} حمام
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">square_foot</span>
                    {property.floor_area} م²
                  </div>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <DateSelector
              rentalConfig={rentalConfig}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              minDate={new Date()}
            />

            {/* Tenant Information */}
            <TenantForm
              tenantName={tenantName}
              tenantPhone={tenantPhone}
              tenantEmail={tenantEmail}
              onNameChange={setTenantName}
              onPhoneChange={setTenantPhone}
              onEmailChange={setTenantEmail}
            />

            {/* Payment Methods */}
            <PaymentMethods
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
            />
          </div>

          {/* Right Column - Price and Action */}
          <div className="space-y-6">
            {/* Price Breakdown */}
            <PriceBreakdown
              rentalType={rentalConfig.type}
              duration={priceDetails.duration}
              pricePerUnit={rentalConfig.pricePerUnit}
              basePrice={priceDetails.basePrice}
              serviceFee={priceDetails.serviceFee}
              depositAmount={priceDetails.depositAmount}
              totalAmount={priceDetails.totalAmount}
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !startDate || !endDate || !paymentMethod}
              className="w-full bg-primary text-white py-4 rounded-2xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الحجز'}
            </button>

            {/* Security Note */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <span className="material-symbols-outlined text-lg">lock</span>
              <div>بياناتك آمنة ومشفرة</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}