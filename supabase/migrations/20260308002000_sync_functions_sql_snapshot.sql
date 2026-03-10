-- Migration: Sync functions.sql canonical snapshot
-- Date: 2026-03-08
-- Purpose: keep remote DB function definitions aligned with supabase/functions.sql

-- Supabase functions and triggers (canonical snapshot)
-- Keep this file in sync with migrations that alter function bodies/signatures.

-- 1) Profile bootstrap on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
-- 2) Atomic property view increment
CREATE OR REPLACE FUNCTION public.increment_views(property_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.properties
  SET views_count = views_count + 1
  WHERE id = property_id;
END;
$$;
-- 3) Landlord dashboard aggregate
CREATE OR REPLACE FUNCTION public.get_landlord_stats(target_user_id UUID)
RETURNS TABLE (
  total_properties BIGINT,
  active_bookings BIGINT,
  total_earnings DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.properties WHERE owner_id = target_user_id),
    (
      SELECT COUNT(*)
      FROM public.bookings b
      JOIN public.properties p ON b.property_id = p.id
      WHERE p.owner_id = target_user_id
        AND b.status IN ('confirmed', 'active')
    ),
    (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM public.bookings b
      JOIN public.properties p ON b.property_id = p.id
      WHERE p.owner_id = target_user_id
        AND b.status = 'completed'
    );
END;
$$;
-- 4) Payment-gated unlock operation (single atomic transaction)
CREATE OR REPLACE FUNCTION public.unlock_property_with_payment(
  p_user_id UUID,
  p_property_id UUID,
  p_payment_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.payment_requests
  SET is_consumed = TRUE,
      processed_at = NOW()
  WHERE id = p_payment_id
    AND user_id = p_user_id
    AND property_id = p_property_id
    AND status = 'approved'
    AND is_consumed = FALSE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found, already consumed, or not approved';
  END IF;

  INSERT INTO public.unlocked_properties (user_id, property_id)
  VALUES (p_user_id, p_property_id)
  ON CONFLICT (user_id, property_id) DO NOTHING;
END;
$$;
-- 5) Property status history audit hook
CREATE OR REPLACE FUNCTION public.log_property_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.property_status_history (property_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_log_property_status_change ON public.properties;
CREATE TRIGGER trg_log_property_status_change
  AFTER UPDATE OF status ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.log_property_status_change();
