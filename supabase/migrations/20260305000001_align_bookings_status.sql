-- Migration: Align bookings.status with canonical TypeScript types
-- Date: 2026-03-05
-- PR: PR1 - SQL Hygiene
-- Purpose:
--   20260208_fix_enum_values.sql constrained bookings.status to only 4 values,
--   dropping 'active' which is required by:
--     - src/types/index.ts  (Booking.status canonical union)
--     - docs/db/RLS_CONTRACT_V1.md (blocking statuses = confirmed | active)
--     - src/utils/bookingRules.ts (isBlockingStatus)
--
-- Canonical blocking statuses: 'confirmed' | 'active'
-- Non-blocking: 'pending' | 'cancelled' | 'completed' | 'expired' | 'rejected' | 'requested'
--
-- Rollback: see bottom of file

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
--    (safe: only updates rows that would violate new constraint)
UPDATE bookings SET status = 'requested'  WHERE status = 'request_sent';
UPDATE bookings SET status = 'requested'  WHERE status = 'pending_landlord';
UPDATE bookings SET status = 'confirmed'  WHERE status = 'approved';
UPDATE bookings SET status = 'active'     WHERE status = 'booked';
UPDATE bookings SET status = 'active'     WHERE status = 'occupied';
-- =============================================
-- ROLLBACK SQL (run if this migration needs to be reverted):
-- =============================================
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
-- ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
--   CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
-- NOTE: data migration (UPDATE statements above) cannot be auto-rolled back.
--       Restore from snapshot taken before this migration.
-- =============================================;
