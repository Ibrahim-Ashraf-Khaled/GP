// src/utils/pricingCalculator.ts

export type RentalType = 'daily' | 'monthly' | 'seasonal';

export interface PricingInput {
    rentalType: RentalType;
    basePrice: number;     // daily: price/day, monthly: price/month, seasonal: price/full season
    startDate: Date;
    endDate?: Date;        // required for daily
    durationMonths?: number; // required for monthly
    isSeasonalFullPeriod?: boolean; // optional guard
}

export interface PricingBreakdown {
    basePrice: number;
    serviceFee: number;        // 10%
    verificationFee: number;   // 50
    depositAmount: number;
    subtotal: number;
    totalAmount: number;
    duration: { days?: number; months?: number };
}

function round2(n: number) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateBookingPrice(
    input: PricingInput,
    depositAmount: number
): PricingBreakdown {
    if (!Number.isFinite(input.basePrice) || input.basePrice < 0) {
        throw new Error('Invalid basePrice');
    }
    if (!Number.isFinite(depositAmount) || depositAmount < 0) {
        throw new Error('Invalid depositAmount');
    }

    let basePrice = 0;
    const duration: { days?: number; months?: number } = {};

    if (input.rentalType === 'daily') {
        if (!input.endDate) throw new Error('endDate is required for daily rentals');
        const diffMs = input.endDate.getTime() - input.startDate.getTime();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (days <= 0) throw new Error('Invalid daily date range');
        duration.days = days;
        basePrice = input.basePrice * days;
    }

    if (input.rentalType === 'monthly') {
        const m = input.durationMonths;
        if (!m || m <= 0) throw new Error('durationMonths is required for monthly rentals');
        duration.months = m;
        basePrice = input.basePrice * m;
    }

    if (input.rentalType === 'seasonal') {
        // الموسمي: سبتمبر - يونيو (10 أشهر)
        if (input.isSeasonalFullPeriod === false) {
            throw new Error('Seasonal booking must be full period');
        }
        // Assuming a full season represents 10 months of duration theoretically
        duration.months = 10;
        basePrice = input.basePrice;
    }

    basePrice = round2(basePrice);

    const serviceFee = round2(basePrice * 0.1);  // 10%
    const verificationFee = 50;                  // 50
    const subtotal = round2(basePrice + serviceFee + verificationFee);
    const totalAmount = round2(subtotal + depositAmount);

    return {
        basePrice,
        serviceFee,
        verificationFee,
        depositAmount,
        subtotal,
        totalAmount,
        duration,
    };
}
