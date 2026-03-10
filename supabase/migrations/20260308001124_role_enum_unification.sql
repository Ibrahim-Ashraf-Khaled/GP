-- Normalizing known Arabic/legacy role aliases.
UPDATE public.profiles
SET role = 'tenant'
WHERE role IN ('مستأجر', 'tenant_user', 'renter');

UPDATE public.profiles
SET role = 'landlord'
WHERE role IN ('مؤجر', 'owner', 'صاحب عقار', 'lessor');

UPDATE public.profiles
SET role = 'admin'
WHERE role IN ('مشرف', 'مدير', 'administrator', 'super_admin');

-- Re-assert canonical constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('tenant', 'landlord', 'admin'));
;
