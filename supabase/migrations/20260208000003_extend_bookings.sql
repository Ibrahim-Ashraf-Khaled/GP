-- Migration: Extend bookings table to match TypeScript types
-- Date: 2026-02-08
-- Purpose: Fix schema/types mismatch for booking functionality

-- Add missing columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS total_nights INTEGER,
ADD COLUMN IF NOT EXISTS total_months INTEGER,
ADD COLUMN IF NOT EXISTS rental_type TEXT CHECK (rental_type IN ('daily', 'monthly', 'seasonal')),
ADD COLUMN IF NOT EXISTS tenant_name TEXT,
ADD COLUMN IF NOT EXISTS tenant_phone TEXT,
ADD COLUMN IF NOT EXISTS tenant_email TEXT,
ADD COLUMN IF NOT EXISTS base_price DECIMAL,
ADD COLUMN IF NOT EXISTS service_fee DECIMAL,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('vodafone_cash', 'instapay', 'cash_on_delivery')),
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
ADD COLUMN IF NOT EXISTS payment_proof TEXT,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;

-- Rename columns to match TypeScript naming conventions
DO $$
BEGIN
    -- Only rename if column exists and new name doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'guest_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE bookings RENAME COLUMN guest_id TO user_id;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'check_in'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE bookings RENAME COLUMN check_in TO start_date;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'check_out'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE bookings RENAME COLUMN check_out TO end_date;
    END IF;
END $$;

-- Add total_amount column to match TypeScript (keep total_price for compatibility)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL;

-- Copy existing total_price to total_amount for existing records
UPDATE bookings 
SET total_amount = total_price 
WHERE total_amount IS NULL AND total_price IS NOT NULL;

-- Make total_amount NOT NULL for new records
ALTER TABLE bookings 
ALTER COLUMN total_amount SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);