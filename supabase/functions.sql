-- =============================================
-- دوال (Functions) وقوادح (Triggers) Supabase
-- =============================================

-- 1. دالة إنشاء ملف شخصي تلقائيًا عند التسجيل (Critical)
-- هذه الدالة تعمل مع Trigger لإنشاء صف في جدول profiles عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant') -- الافتراضي: مستأجر
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger لتشغيل الدالة السابقة
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================

-- 3. دالة لزيادة عدد المشاهدات بشكل آمن (Atomic Increment)
-- تستخدم عندما يفتح المستخدم صفحة عقار لتجنب تعارض التحديثات
CREATE OR REPLACE FUNCTION increment_views(property_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET views_count = views_count + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================

-- 4. (اختياري) دالة لجلب إحصائيات لوحة التحكم للمالك
-- تعيد عدد العقارات، الحجوزات النشطة، وإجمالي الأرباح المتوقعة
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
     WHERE p.owner_id = target_user_id AND b.status IN ('confirmed', 'pending')),
    (SELECT COALESCE(SUM(total_price), 0) FROM bookings b 
     JOIN properties p ON b.property_id = p.id 
     WHERE p.owner_id = target_user_id AND b.status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================

-- 6. Atomic Booking Creation Function (Prevents Double Bookings)
-- Creates booking only if dates are available, using row-level locking
CREATE OR REPLACE FUNCTION create_atomic_booking(
  p_property_id UUID,
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_total_nights INTEGER DEFAULT NULL,
  p_total_months INTEGER DEFAULT NULL,
  p_rental_type TEXT DEFAULT 'daily',
  p_tenant_name TEXT,
  p_tenant_phone TEXT,
  p_tenant_email TEXT DEFAULT NULL,
  p_base_price DECIMAL,
  p_service_fee DECIMAL,
  p_deposit_amount DECIMAL DEFAULT NULL,
  p_total_amount DECIMAL,
  p_payment_method TEXT DEFAULT 'cash_on_delivery',
  p_payment_status TEXT DEFAULT 'pending',
  p_payment_proof TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_conflict_count INTEGER;
BEGIN
  -- Step 1: Check for date conflicts with row-level locking
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE property_id = p_property_id
    AND status IN ('confirmed', 'pending')
    AND (
      (p_start_date <= end_date AND p_end_date >= start_date)
    )
  FOR UPDATE; -- Lock conflicting rows

  -- Step 2: Raise exception if dates conflict
  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Booking dates conflict with existing booking';
  END IF;

  -- Step 3: Create the booking atomically
  INSERT INTO bookings (
    property_id, user_id, start_date, end_date, total_nights, total_months,
    rental_type, tenant_name, tenant_phone, tenant_email, base_price,
    service_fee, deposit_amount, total_amount, payment_method, payment_status,
    payment_proof, status, created_at
  ) VALUES (
    p_property_id, p_user_id, p_start_date, p_end_date, p_total_nights, p_total_months,
    p_rental_type, p_tenant_name, p_tenant_phone, p_tenant_email, p_base_price,
    p_service_fee, p_deposit_amount, p_total_amount, p_payment_method, p_payment_status,
    p_payment_proof, 'pending', NOW()
  ) RETURNING id INTO v_booking_id;

  -- Step 4: Return the new booking ID
  RETURN v_booking_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback on any error
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- كيفية الإضافة في Supabase:
-- 1. اذهب إلى SQL Editor في القائمة الجانبية.
-- 2. اضغط على "New query".
-- 3. انسخ هذا الكود بالكامل والصقه.
-- 4. اضغط زر "Run" الأخضر في الأسفل.
-- =============================================
