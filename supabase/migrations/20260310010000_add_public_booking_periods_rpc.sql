CREATE OR REPLACE FUNCTION public.get_public_property_booking_periods(p_property_id UUID)
RETURNS TABLE(start_date DATE, end_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT b.start_date, b.end_date
  FROM public.bookings b
  WHERE b.property_id = p_property_id
    AND b.status = 'confirmed'
    AND b.end_date >= CURRENT_DATE
  ORDER BY b.start_date ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

REVOKE ALL ON FUNCTION public.get_public_property_booking_periods(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_property_booking_periods(UUID) TO anon, authenticated;
