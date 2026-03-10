import { describe, it, expect } from 'vitest';
import {
    rangesOverlap,
    isBlockingStatus,
    isPropertyAvailable,
    type Booking
} from '../bookingRules';

describe('bookingRules', () => {
    it('1) rangesOverlap uses half-open interval: end == start is NOT overlap', () => {
        const r1 = rangesOverlap('2026-03-01', '2026-03-05', '2026-03-05', '2026-03-10');
        expect(r1.ok).toBe(true);
        if (r1.ok) expect(r1.value).toBe(false);

        const r2 = rangesOverlap('2026-03-01', '2026-03-06', '2026-03-05', '2026-03-10');
        expect(r2.ok).toBe(true);
        if (r2.ok) expect(r2.value).toBe(true);
    });

    it('2) only CONFIRMED + ACTIVE are blocking statuses', () => {
        expect(isBlockingStatus('CONFIRMED')).toBe(true);
        expect(isBlockingStatus('ACTIVE')).toBe(true);

        expect(isBlockingStatus('REQUESTED')).toBe(false);
        expect(isBlockingStatus('PENDING')).toBe(false);
        expect(isBlockingStatus('CANCELLED')).toBe(false);
        expect(isBlockingStatus('EXPIRED')).toBe(false);
        expect(isBlockingStatus('COMPLETED')).toBe(false);
    });

    it('3) availability checks only same property bookings', () => {
        const bookings: Booking[] = [
            {
                property_id: 'A',
                start_date: '2026-03-01',
                end_date: '2026-03-10',
                status: 'CONFIRMED',
            },
        ];

        // property B should be available even if A has booking
        const res = isPropertyAvailable('B', '2026-03-05', '2026-03-07', bookings);
        expect(res.ok).toBe(true);
        if (res.ok) expect(res.available).toBe(true);
    });

    it('4) validation rejects invalid dates and start >= end', () => {
        const bad1 = rangesOverlap('2026-03-10', '2026-03-10', '2026-03-01', '2026-03-02');
        expect(bad1.ok).toBe(false);

        const bad2 = isPropertyAvailable('A', 'invalid', '2026-03-02', []);
        expect(bad2.ok).toBe(false);
    });

    it('5) derived availability: ignore non-blocking bookings, block confirmed/active overlaps', () => {
        const bookings: Booking[] = [
            {
                property_id: 'A',
                start_date: '2026-03-01',
                end_date: '2026-03-10',
                status: 'REQUESTED', // should not block
            },
            {
                property_id: 'A',
                start_date: '2026-03-12',
                end_date: '2026-03-15',
                status: 'CONFIRMED', // blocks
            },
        ];

        const ok1 = isPropertyAvailable('A', '2026-03-05', '2026-03-07', bookings);
        expect(ok1.ok).toBe(true);
        if (ok1.ok) expect(ok1.available).toBe(true); // REQUESTED ignored

        const ok2 = isPropertyAvailable('A', '2026-03-13', '2026-03-14', bookings);
        expect(ok2.ok).toBe(true);
        if (ok2.ok) expect(ok2.available).toBe(false); // CONFIRMED blocks
    });
});
