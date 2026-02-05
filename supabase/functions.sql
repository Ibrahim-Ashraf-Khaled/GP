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
-- كيفية الإضافة في Supabase:
-- 1. اذهب إلى SQL Editor في القائمة الجانبية.
-- 2. اضغط على "New query".
-- 3. انسخ هذا الكود بالكامل والصقه.
-- 4. اضغط زر "Run" الأخضر في الأسفل.
-- =============================================
