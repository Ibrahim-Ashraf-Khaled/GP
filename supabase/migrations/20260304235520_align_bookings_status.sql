-- 1. Drop the restrictive constraint added by 20260208_fix_enum_values.sql
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

-- 2. Add canonical constraint aligned with TypeScript + RLS contract
ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN (
  'pending',     -- non-blocking: awaiting tenant confirmation
  'requested',   -- non-blocking: request sent, not yet reviewed
  'confirmed',   -- BLOCKING: landlord confirmed
  'active',      -- BLOCKING: currently occupied
  'cancelled',   -- non-blocking
  'completed',   -- non-blocking: ended normally
  'expired',     -- non-blocking: timed out
  'rejected'     -- non-blocking: landlord rejected
));

-- 3. Migrate any legacy status values that exist in DB
UPDATE bookings SET status = 'requested'  WHERE status = 'request_sent';
UPDATE bookings SET status = 'requested'  WHERE status = 'pending_landlord';
UPDATE bookings SET status = 'confirmed'  WHERE status = 'approved';
UPDATE bookings SET status = 'active'     WHERE status = 'booked';
UPDATE bookings SET status = 'active'     WHERE status = 'occupied';
;
