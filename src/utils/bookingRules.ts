// src/utils/bookingRules.ts

export type BookingStatus =
    | 'REQUESTED'
    | 'PENDING'
    | 'CONFIRMED'
    | 'ACTIVE'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'COMPLETED';

export type Booking = {
    property_id: string;
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    status: BookingStatus;
};

export function isBlockingStatus(status: BookingStatus): boolean {
    return status === 'CONFIRMED' || status === 'ACTIVE';
}

// Parse date-only safely in UTC
export function parseDateOnly(dateStr: string): Date | null {
    // accept YYYY-MM-DD only
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    // Guard invalid date (NaN)
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

/**
 * Overlap for half-open intervals: [aStart, aEnd) overlaps [bStart, bEnd)
 * True if aStart < bEnd AND bStart < aEnd
 */
export function rangesOverlap(
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string
): { ok: true; value: boolean } | { ok: false; error: string } {
    const as = parseDateOnly(aStart);
    const ae = parseDateOnly(aEnd);
    const bs = parseDateOnly(bStart);
    const be = parseDateOnly(bEnd);

    if (!as || !ae || !bs || !be) return { ok: false, error: 'Invalid date format' };
    if (as.getTime() >= ae.getTime()) return { ok: false, error: 'Start must be before end' };
    if (bs.getTime() >= be.getTime()) return { ok: false, error: 'Start must be before end' };

    const overlap = as.getTime() < be.getTime() && bs.getTime() < ae.getTime();
    return { ok: true, value: overlap };
}

export function isPropertyAvailable(
    propertyId: string,
    start: string,
    end: string,
    bookings: Booking[]
): { ok: true; available: boolean } | { ok: false; error: string } {
    const reqCheck = parseDateOnly(start);
    const reqEnd = parseDateOnly(end);
    if (!reqCheck || !reqEnd) return { ok: false, error: 'Invalid date format' };
    if (reqCheck.getTime() >= reqEnd.getTime()) return { ok: false, error: 'Start must be before end' };

    const relevant = bookings.filter(
        (b) => b.property_id === propertyId && isBlockingStatus(b.status)
    );

    for (const b of relevant) {
        const ov = rangesOverlap(start, end, b.start_date, b.end_date);
        if (!ov.ok) return { ok: false, error: ov.error };
        if (ov.value) return { ok: true, available: false };
    }

    return { ok: true, available: true };
}
