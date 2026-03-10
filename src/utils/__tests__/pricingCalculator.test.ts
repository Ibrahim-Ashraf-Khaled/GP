import { describe, it, expect } from 'vitest';
import { calculateBookingPrice } from '../pricingCalculator';

describe('pricingCalculator', () => {
    it('daily: calculates days via ceil and totals', () => {
        const res = calculateBookingPrice(
            {
                rentalType: 'daily',
                basePrice: 200,
                startDate: new Date('2026-03-01T00:00:00Z'),
                endDate: new Date('2026-03-05T00:00:00Z'),
            },
            0
        );

        // 4 days
        expect(res.duration.days).toBe(4);
        expect(res.basePrice).toBe(800);
        expect(res.serviceFee).toBe(80);       // 10%
        expect(res.verificationFee).toBe(50);  // ثابت
        expect(res.totalAmount).toBe(930);
    });

    it('monthly: multiplies by durationMonths', () => {
        const res = calculateBookingPrice(
            {
                rentalType: 'monthly',
                basePrice: 1500,
                startDate: new Date('2026-03-01T00:00:00Z'),
                durationMonths: 3,
            },
            0
        );

        expect(res.duration.months).toBe(3);
        expect(res.basePrice).toBe(4500);
        expect(res.serviceFee).toBe(450);
        expect(res.verificationFee).toBe(50);
        expect(res.totalAmount).toBe(5000);
    });

    it('seasonal: fixed 10 months and adds deposit', () => {
        const res = calculateBookingPrice(
            {
                rentalType: 'seasonal',
                basePrice: 12000,
                startDate: new Date('2026-09-01T00:00:00Z'),
                isSeasonalFullPeriod: true,
            },
            3000
        );

        expect(res.duration.months).toBe(10);
        expect(res.basePrice).toBe(12000);
        expect(res.serviceFee).toBe(1200);
        expect(res.verificationFee).toBe(50);
        expect(res.totalAmount).toBe(16250); // (12000+1200+50)+3000
    });

    it('validation: daily requires endDate and valid range', () => {
        expect(() =>
            calculateBookingPrice(
                { rentalType: 'daily', basePrice: 200, startDate: new Date('2026-03-01T00:00:00Z') },
                0
            )
        ).toThrow();

        expect(() =>
            calculateBookingPrice(
                {
                    rentalType: 'daily',
                    basePrice: 200,
                    startDate: new Date('2026-03-05T00:00:00Z'),
                    endDate: new Date('2026-03-01T00:00:00Z'),
                },
                0
            )
        ).toThrow();
    });

    it('rounding: service fee rounds to 2 decimals', () => {
        const res = calculateBookingPrice(
            {
                rentalType: 'monthly',
                basePrice: 999.99,
                startDate: new Date('2026-03-01T00:00:00Z'),
                durationMonths: 1,
            },
            0
        );

        // 999.99 * 0.1 = 99.999 -> 100.00
        expect(res.serviceFee).toBe(100);
    });
});
