-- =============================================
-- دوال (Functions) وقوادح (Triggers) Supabase
-- =============================================

-- 1. دالة إنشاء ملف شخصي تلقائيًا عند التسجيل (Critical)
-- هذه الدالة تعمل مع Trigger لإنشاء صف في جدول profiles عند تسجيل مستخدم جديد
-- تم تحديثها لضمان التوافق مع بيانات التعريف (metadata) وتجاوز مشاكل RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
  );
  RETURN NEW;
END;
$$;

-- اجعل المالك postgres (مهم لتجاوز RLS داخل trigger)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

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

-- 4. إحصائيات لوحة التحكم للمالك
-- تعيد عدد العقارات، الحجوزات النشطة، وإجمالي الأرباح المتوقعة
-- تم التحديث ليشمل حالات الحجز الجديدة (request_sent, pending_landlord, approved, booked, occupied)
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
       AND b.status IN ('request_sent', 'pending_landlord', 'approved', 'booked', 'occupied')),
    (SELECT COALESCE(SUM(total_amount), 0) FROM bookings b 
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

-- 6. نظام سجل حالة العقار (Property Status History)
-- يقوم بتسجيل كل حركة تغيير في حالة العقار للمتابعة والتدقيق

CREATE TABLE IF NOT EXISTS public.property_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- دالة لتشغيل التسجيل التلقائي
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

-- Trigger لتفعيل الدالة
DROP TRIGGER IF EXISTS trg_log_property_status_change ON properties;
CREATE TRIGGER trg_log_property_status_change
  AFTER UPDATE OF status ON properties
  FOR EACH ROW
  EXECUTE FUNCTION log_property_status_change();
;
