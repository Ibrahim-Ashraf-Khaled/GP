-- 1. Create the property_contacts table
CREATE TABLE IF NOT EXISTS public.property_contacts (
    property_id UUID PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
    owner_phone TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Migrate existing data from properties table (if columns exist)
-- This safely copies existing phone and name data to the new table.
INSERT INTO public.property_contacts (property_id, owner_phone, owner_name)
SELECT 
    id, 
    owner_phone, 
    owner_name 
FROM public.properties
ON CONFLICT (property_id) DO NOTHING;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.property_contacts ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- First, drop existing policies on this table if you are re-running this script
DROP POLICY IF EXISTS "Enable read access for property owners" ON public.property_contacts;
DROP POLICY IF EXISTS "Enable read access for users who unlocked the property" ON public.property_contacts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.property_contacts;

-- Policy A: Owners can read their own property contacts
CREATE POLICY "Enable read access for property owners" ON public.property_contacts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.properties p 
            WHERE p.id = property_contacts.property_id 
            AND p.owner_id = auth.uid()
        )
    );

-- Policy B: Users who unlocked the property can read the contact info
CREATE POLICY "Enable read access for users who unlocked the property" ON public.property_contacts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.unlocked_properties up 
            WHERE up.property_id = property_contacts.property_id 
            AND up.user_id = auth.uid()
        )
    );

-- Policy C: allow user creating a property to insert this row
CREATE POLICY "Enable insert for authenticated users" ON public.property_contacts
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
;
