-- Migration: Create core tables and RLS policies
-- Date: 2026-02-06

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 2. Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  floor_area INTEGER,
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

-- 3. Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

-- 5. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT CHECK (type IN ('success', 'info', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- 7. Unlocked properties
CREATE TABLE IF NOT EXISTS public.unlocked_properties (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- Enable RLS on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_properties ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for properties
DROP POLICY IF EXISTS "Approved properties are viewable by everyone" ON public.properties;
CREATE POLICY "Approved properties are viewable by everyone" ON public.properties
  FOR SELECT USING (status = 'available');
DROP POLICY IF EXISTS "Users can insert own properties" ON public.properties;
CREATE POLICY "Users can insert own properties" ON public.properties FOR INSERT WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own properties" ON public.properties;
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete own properties" ON public.properties;
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE USING (owner_id = auth.uid());

-- Policies for bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (guest_id = auth.uid());
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (guest_id = auth.uid());

-- Policies for reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Policies for favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (user_id = auth.uid());

-- Policies for unlocked_properties
DROP POLICY IF EXISTS "Users can view own unlocked properties" ON public.unlocked_properties;
CREATE POLICY "Users can view own unlocked properties" ON public.unlocked_properties FOR SELECT USING (user_id = auth.uid());
