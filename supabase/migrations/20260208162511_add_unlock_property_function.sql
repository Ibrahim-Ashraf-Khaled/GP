-- 5. Secure Property Unlock Function (Fixes Payment Bypass - Issue #4)
-- Atomic operation to mark payment as consumed and unlock property
CREATE OR REPLACE FUNCTION unlock_property_with_payment(
  p_user_id UUID,
  p_property_id UUID,
  p_payment_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Step 1: Mark payment as consumed (with lock)
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
  
  -- Step 2: Insert unlock record (atomic)
  INSERT INTO unlocked_properties (user_id, property_id)
  VALUES (p_user_id, p_property_id)
  ON CONFLICT (user_id, property_id) DO NOTHING;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback on any error
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;
