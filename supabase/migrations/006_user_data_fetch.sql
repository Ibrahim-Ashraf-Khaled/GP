-- ================================================================
-- Migration 006: User Data Fetch RPCs
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_user_bookings(uid uuid)
RETURNS TABLE (
  booking_id uuid,
  booking_property_id uuid,
  booking_user_id uuid,
  start_date date,
  end_date date,
  total_amount numeric,
  status text,
  created_at timestamptz,
  tenant_name text,
  booking_type text,
  prop_id uuid,
  prop_title text,
  prop_images text[],
  prop_area text,
  prop_owner_id uuid,
  prop_owner_name text,
  prop_owner_phone text,
  profile_id uuid,
  profile_full_name text,
  profile_avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> uid THEN
    RAISE EXCEPTION 'Unauthorized access' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH tenant_bookings AS (
    SELECT
      b.id AS booking_id,
      b.property_id AS booking_property_id,
      b.user_id AS booking_user_id,
      b.start_date,
      b.end_date,
      b.total_amount,
      b.status,
      b.created_at,
      b.tenant_name,
      'tenant'::text AS booking_type,
      p.id AS prop_id,
      p.title AS prop_title,
      p.images AS prop_images,
      p.area AS prop_area,
      p.owner_id AS prop_owner_id,
      p.owner_name AS prop_owner_name,
      p.owner_phone AS prop_owner_phone,
      NULL::uuid AS profile_id,
      NULL::text AS profile_full_name,
      NULL::text AS profile_avatar_url
    FROM public.bookings b
    LEFT JOIN public.properties p ON b.property_id = p.id
    WHERE b.user_id = uid
  ),
  landlord_bookings AS (
    SELECT
      b.id AS booking_id,
      b.property_id AS booking_property_id,
      b.user_id AS booking_user_id,
      b.start_date,
      b.end_date,
      b.total_amount,
      b.status,
      b.created_at,
      b.tenant_name,
      'owner'::text AS booking_type,
      p.id AS prop_id,
      p.title AS prop_title,
      p.images AS prop_images,
      p.area AS prop_area,
      p.owner_id AS prop_owner_id,
      p.owner_name AS prop_owner_name,
      p.owner_phone AS prop_owner_phone,
      u.id AS profile_id,
      u.full_name AS profile_full_name,
      u.avatar_url AS profile_avatar_url
    FROM public.bookings b
    LEFT JOIN public.properties p ON b.property_id = p.id
    LEFT JOIN public.profiles u ON b.user_id = u.id
    WHERE p.owner_id = uid
  )
  SELECT * FROM tenant_bookings
  UNION ALL
  SELECT * FROM landlord_bookings
  ORDER BY created_at DESC
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_favorites(uid uuid)
RETURNS TABLE (
  id uuid,
  owner_id uuid,
  title text,
  description text,
  price numeric,
  price_unit text,
  category text,
  status text,
  images text[],
  location_lat double precision,
  location_lng double precision,
  address text,
  area text,
  bedrooms integer,
  bathrooms integer,
  floor_area integer,
  floor_number integer,
  features text[],
  owner_phone text,
  owner_name text,
  is_verified boolean,
  views_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> uid THEN
    RAISE EXCEPTION 'Unauthorized access' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.owner_id,
    p.title,
    p.description,
    p.price,
    p.price_unit,
    p.category,
    p.status,
    p.images,
    p.location_lat,
    p.location_lng,
    p.address,
    p.area,
    p.bedrooms,
    p.bathrooms,
    p.floor_area,
    p.floor_number,
    p.features,
    p.owner_phone,
    p.owner_name,
    p.is_verified,
    p.views_count,
    p.created_at,
    p.updated_at
  FROM public.favorites f
  INNER JOIN public.properties p ON f.property_id = p.id
  WHERE f.user_id = uid
  ORDER BY f.created_at DESC
  LIMIT 100;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_bookings(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_bookings(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_favorites(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_favorites(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
