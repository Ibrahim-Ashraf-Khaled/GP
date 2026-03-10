-- Prevent profile bootstrap failures from blocking auth signup.
-- Keeps canonical role mapping and upserts profile row safely.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw_role TEXT;
  v_role TEXT;
BEGIN
  v_raw_role := COALESCE(NEW.raw_user_meta_data->>'role', 'tenant');
  v_role := CASE
    WHEN btrim(lower(v_raw_role)) IN ('tenant') THEN 'tenant'
    WHEN v_raw_role IN ('مستأجر', 'مستاجر') THEN 'tenant'
    WHEN btrim(lower(v_raw_role)) IN ('landlord', 'owner') THEN 'landlord'
    WHEN v_raw_role IN ('مؤجر', 'موجر', 'صاحب عقار') THEN 'landlord'
    WHEN btrim(lower(v_raw_role)) IN ('admin') THEN 'admin'
    WHEN v_raw_role IN ('مشرف', 'مدير') THEN 'admin'
    ELSE 'tenant'
  END;

  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, phone, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'phone',
      v_role
    )
    ON CONFLICT (id) DO UPDATE
    SET
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
