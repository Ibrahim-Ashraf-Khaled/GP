-- دالة لإنشاء حجز بشكل ذري
CREATE OR REPLACE FUNCTION create_booking_atomically(
  p_property_id UUID,
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_total_nights INTEGER,
  p_total_months INTEGER,
  p_rental_type TEXT,
  p_tenant_name TEXT,
  p_tenant_phone TEXT,
  p_tenant_email TEXT,
  p_base_price DECIMAL,
  p_service_fee DECIMAL,
  p_deposit_amount DECIMAL,
  p_total_amount DECIMAL,
  p_payment_method TEXT,
  p_payment_status TEXT,
  p_payment_proof TEXT
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_conflict_count INT;
BEGIN
  -- قفل الصفوف للتحقق من التوافر
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE property_id = p_property_id
    AND status IN ('confirmed', 'pending')
    AND (start_date, end_date) OVERLAPS (p_start_date, p_end_date)
  FOR UPDATE;
  
  -- إذا كان هناك تعارض، ارفع استثناء
  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'العقار محجوز في هذه الفترة';
  END IF;
  
  -- إنشاء الحجز
  INSERT INTO bookings (
    property_id,
    user_id,
    start_date,
    end_date,
    total_nights,
    total_months,
    rental_type,
    tenant_name,
    tenant_phone,
    tenant_email,
    base_price,
    service_fee,
    deposit_amount,
    total_amount,
    payment_method,
    payment_status,
    payment_proof,
    status -- default is 'pending'
  ) VALUES (
    p_property_id,
    p_user_id,
    p_start_date,
    p_end_date,
    p_total_nights,
    p_total_months,
    p_rental_type,
    p_tenant_name,
    p_tenant_phone,
    p_tenant_email,
    p_base_price,
    p_service_fee,
    p_deposit_amount,
    p_total_amount,
    p_payment_method,
    p_payment_status,
    p_payment_proof,
    'pending'
  ) RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;
