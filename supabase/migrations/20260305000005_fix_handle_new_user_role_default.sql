-- Migration: Fix signup trigger profile creation to rely on DB default role
-- Date: 2026-03-05
-- Purpose:
--   Avoid "Database error saving new user" when role enum/default differs between environments.
--   Do not force role value in trigger; let profiles.role default/constraint handle it.

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
