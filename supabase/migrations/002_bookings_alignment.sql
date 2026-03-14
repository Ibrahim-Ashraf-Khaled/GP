-- Migration 002: Bookings column cleanup + canonical status + status history view
-- Covers: 20260227012622_definitive_bookings_alignment_v4.sql

-- Merge legacy columns if they still exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_id') THEN
        UPDATE bookings SET user_id = guest_id WHERE user_id IS NULL;
        ALTER TABLE bookings DROP COLUMN guest_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'tenant_id') THEN
        UPDATE bookings SET user_id = tenant_id WHERE user_id IS NULL;
        ALTER TABLE bookings DROP COLUMN tenant_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'check_in') THEN
        UPDATE bookings SET start_date = CAST(check_in AS DATE) WHERE start_date IS NULL;
        ALTER TABLE bookings DROP COLUMN check_in;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'check_out') THEN
        UPDATE bookings SET end_date = CAST(check_out AS DATE) WHERE end_date IS NULL;
        ALTER TABLE bookings DROP COLUMN check_out;
    END IF;
END $$;

-- Migrate legacy status values
UPDATE bookings SET status = 'requested' WHERE status = 'request_sent';
UPDATE bookings SET status = 'requested' WHERE status = 'pending_landlord';
UPDATE bookings SET status = 'confirmed' WHERE status = 'approved';
UPDATE bookings SET status = 'active'    WHERE status = 'booked';
UPDATE bookings SET status = 'active'    WHERE status = 'occupied';

NOTIFY pgrst, 'reload schema';
