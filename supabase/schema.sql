-- ===========================================
-- Gamasa Properties - Supabase Schema
-- Version: 1.2 (Fix Role Constraint)
-- Run this in Supabase SQL Editor
-- ===========================================

-- 1. جدول الملف الشخصي (Profiles) - مرتبط بنظام Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  national_id TEXT, -- للتوثيق
  role TEXT DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تحديث الأعمدة المفقودة وإصلاح القيود
DO $$
BEGIN
    -- إضافة الأعمدة إذا لم تكن موجودة
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'tenant';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS national_id TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    
    -- إصلاح قيد role ليقبل القيم الإنجليزية (tenant, landlord) بدلاً من العربية
    -- لأن الكود يرسل القيم بالإنجليزية
    BEGIN
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('tenant', 'landlord', 'admin'));
        ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'tenant';
    EXCEPTION
        WHEN OTHERS THEN NULL; -- تجاهل الأخطاء إذا كان القيد غير موجود أو هناك مشكلة أخرى بسيطة
    END;
END $$;

-- 2. جدول العقارات (Properties)
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  price_unit TEXT DEFAULT 'day' CHECK (price_unit IN ('day', 'week', 'month', 'season')),
  category TEXT CHECK (category IN ('apartment', 'room', 'studio', 'villa', 'chalet')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'rented', 'rejected')),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  address TEXT,
  area TEXT, -- منطقة الكرنك، البحر، إلخ
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  floor_area INTEGER, -- المساحة بالمتر المربع
  floor_number INTEGER DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  owner_phone TEXT,
  owner_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تحديث أعمدة وقيود العقارات
DO $$
BEGIN
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_unit TEXT DEFAULT 'day';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_area INTEGER;
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_number INTEGER DEFAULT 0;
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
    ALTER TABLE properties ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

    -- تحديث القيود لاستخدام الإنجليزية لضمان التوافق
    BEGIN
        ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_price_unit_check;
        ALTER TABLE properties ADD CONSTRAINT properties_price_unit_check CHECK (price_unit IN ('day', 'week', 'month', 'season'));
        
        ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_category_check;
        ALTER TABLE properties ADD CONSTRAINT properties_category_check CHECK (category IN ('apartment', 'room', 'studio', 'villa', 'chalet'));

        ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
        ALTER TABLE properties ADD CONSTRAINT properties_status_check CHECK (status IN ('pending', 'available', 'rented', 'rejected'));
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- 3. جدول الحجوزات (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تحديث الأعمدة للحجوزات
DO $$
BEGIN
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in DATE;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out DATE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. جدول طلبات الدفع (Payment Requests)
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('vodafone_cash', 'instapay', 'fawry')),
  receipt_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جدول المراجعات (Reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

-- 6. جدول الإشعارات (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT CHECK (type IN ('success', 'info', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. جدول المفضلات (Favorites)
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- 8. جدول العقارات المفتوحة (Unlocked Properties)
CREATE TABLE IF NOT EXISTS unlocked_properties (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- ===========================================
-- تفعيل Row Level Security (RLS)
-- ===========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_properties ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- سياسات الأمان (RLS Policies)
-- ===========================================
-- نقوم بحذف السياسات القديمة أولاً لتجنب التكرار

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties
DROP POLICY IF EXISTS "Approved properties are viewable by everyone" ON properties;
CREATE POLICY "Approved properties are viewable by everyone" ON properties
  FOR SELECT USING (status = 'available' OR status = 'rented' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own properties" ON properties;
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (owner_id = auth.uid());

-- Bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (guest_id = auth.uid());

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (guest_id = auth.uid());

-- Payment Requests
DROP POLICY IF EXISTS "Users can view own payment requests" ON payment_requests;
CREATE POLICY "Users can view own payment requests" ON payment_requests FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create payment requests" ON payment_requests;
CREATE POLICY "Users can create payment requests" ON payment_requests FOR INSERT WITH CHECK (user_id = auth.uid());

-- Reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (user_id = auth.uid());

-- Unlocked Properties
DROP POLICY IF EXISTS "Users can view own unlocked properties" ON unlocked_properties;
CREATE POLICY "Users can view own unlocked properties" ON unlocked_properties FOR SELECT USING (user_id = auth.uid());

-- ===========================================
-- Triggers للتحديث التلقائي
-- ===========================================

-- 1. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Helpful RPC Functions
-- ===========================================

CREATE OR REPLACE FUNCTION increment_views(property_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET views_count = views_count + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin Policies
DROP POLICY IF EXISTS "Admins can do everything on properties" ON properties;
CREATE POLICY "Admins can do everything on properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage payment requests" ON payment_requests;
CREATE POLICY "Admins can manage payment requests" ON payment_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
CREATE POLICY "Admins can manage notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- ===========================================
-- 9. جدول المحادثات (Conversations)
-- ===========================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, buyer_id, owner_id)
);

-- ===========================================
-- 10. جدول الرسائل (Messages)
-- ===========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- تفعيل RLS للمحادثات والرسائل
-- ===========================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- سياسات الأمان (RLS) للمحادثات
-- ===========================================

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can start conversations as buyer" ON conversations;
CREATE POLICY "Users can start conversations as buyer" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- ===========================================
-- سياسات الأمان (RLS) للرسائل
-- ===========================================

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.buyer_id = auth.uid() OR conversations.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages in own conversations" ON messages;
CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.buyer_id = auth.uid() OR conversations.owner_id = auth.uid())
    )
  );

-- ===========================================
-- تفعيل Realtime للرسائل
-- ===========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
