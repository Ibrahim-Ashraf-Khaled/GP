-- 1. Atomic Increment views_count
CREATE OR REPLACE FUNCTION increment_views(property_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET views_count = views_count + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Landlord Stats Function (aligned with canonical status)
CREATE OR REPLACE FUNCTION get_landlord_stats(target_user_id UUID)
RETURNS TABLE (
  total_properties BIGINT,
  active_bookings BIGINT,
  total_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM properties WHERE owner_id = target_user_id),
    (SELECT COUNT(*) FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE p.owner_id = target_user_id
       AND b.status IN ('confirmed', 'active')),
    (SELECT COALESCE(SUM(total_amount), 0) FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE p.owner_id = target_user_id AND b.status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Secure Property Unlock Function
CREATE OR REPLACE FUNCTION unlock_property_with_payment(
  p_user_id UUID,
  p_property_id UUID,
  p_payment_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE payment_requests
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

  INSERT INTO unlocked_properties (user_id, property_id)
  VALUES (p_user_id, p_property_id)
  ON CONFLICT (user_id, property_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Property Status Audit Logging
CREATE OR REPLACE FUNCTION log_property_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.property_status_history (property_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_property_status_change ON properties;
CREATE TRIGGER trg_log_property_status_change
  AFTER UPDATE OF status ON properties
  FOR EACH ROW
  EXECUTE FUNCTION log_property_status_change();
;
