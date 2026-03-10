-- 1. Drop EVERYTHING on bookings
DROP POLICY IF EXISTS "Owners can view bookings for their properties" ON bookings;
DROP POLICY IF EXISTS "Tenants can create bookings" ON bookings;
DROP POLICY IF EXISTS "Tenants can insert booking" ON bookings;
DROP POLICY IF EXISTS "Tenants can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;

DROP VIEW IF EXISTS bookings_with_details;

-- 2. Merge columns and cleanup
DO $$
BEGIN
    -- Merge and drop guest_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_id') THEN
        UPDATE bookings SET user_id = guest_id WHERE user_id IS NULL;
        ALTER TABLE bookings DROP COLUMN guest_id;
    END IF;

    -- Merge and drop tenant_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'tenant_id') THEN
        UPDATE bookings SET user_id = tenant_id WHERE user_id IS NULL;
        ALTER TABLE bookings DROP COLUMN tenant_id;
    END IF;

    -- Merge and drop check_in
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'check_in') THEN
        UPDATE bookings SET start_date = CAST(check_in AS DATE) WHERE start_date IS NULL;
        ALTER TABLE bookings DROP COLUMN check_in;
    END IF;

    -- Merge and drop check_out
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'check_out') THEN
        UPDATE bookings SET end_date = CAST(check_out AS DATE) WHERE end_date IS NULL;
        ALTER TABLE bookings DROP COLUMN check_out;
    END IF;
    
    -- Ensure columns are NOT NULL where required
    ALTER TABLE bookings ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE bookings ALTER COLUMN start_date SET NOT NULL;
    ALTER TABLE bookings ALTER COLUMN end_date SET NOT NULL;
END $$;

-- 3. Re-create View
CREATE VIEW bookings_with_details AS
 SELECT b.id,
    b.property_id,
    b.user_id,
    b.start_date,
    b.end_date,
    b.status,
    b.total_amount,
    b.created_at,
    b.updated_at,
    p.title AS property_title,
    p.address AS property_address,
    pt.full_name AS tenant_name,
    pt.phone AS tenant_phone,
    po.full_name AS owner_name,
    po.phone AS owner_phone
   FROM (((bookings b
     LEFT JOIN properties p ON ((b.property_id = p.id)))
     LEFT JOIN profiles pt ON ((b.user_id = pt.id)))
     LEFT JOIN profiles po ON ((p.owner_id = po.id)));

-- 4. Re-create core policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners can view bookings for their properties" ON bookings FOR SELECT 
USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = bookings.property_id AND properties.owner_id = auth.uid()));

-- 5. Fix Message Table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 6. Add status_history if missing
CREATE TABLE IF NOT EXISTS public.property_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
;
