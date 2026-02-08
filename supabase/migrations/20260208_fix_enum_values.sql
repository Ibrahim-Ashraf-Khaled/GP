-- ===========================================
-- Align schema enums with TypeScript (English values)
-- Run in Supabase SQL Editor or: supabase db push
-- ===========================================

-- 1. Properties: category (add office, land; keep existing)
ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_category_check;

ALTER TABLE properties
ADD CONSTRAINT properties_category_check
CHECK (category IN ('apartment', 'villa', 'chalet', 'studio', 'office', 'land', 'room'));

-- 2. Properties: status (English only)
ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE properties
ADD CONSTRAINT properties_status_check
CHECK (status IN ('pending', 'available', 'rented', 'rejected'));

-- 3. Properties: price_unit (ensure English)
ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_price_unit_check;

ALTER TABLE properties
ADD CONSTRAINT properties_price_unit_check
CHECK (price_unit IN ('day', 'week', 'month', 'season'));

-- 4. Bookings: ensure status constraint
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
