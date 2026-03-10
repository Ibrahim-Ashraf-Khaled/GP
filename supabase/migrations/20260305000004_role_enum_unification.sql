-- Migration: PR2 Role enum unification (Arabic/legacy -> canonical)
-- Date: 2026-03-05
-- Goal: enforce canonical profiles.role values: tenant|landlord|admin

-- 1) Normalize known Arabic/legacy role aliases.
UPDATE public.profiles
SET role = 'tenant'
WHERE role IN ('مستأجر', 'tenant_user', 'renter');
UPDATE public.profiles
SET role = 'landlord'
WHERE role IN ('مؤجر', 'owner', 'صاحب عقار', 'lessor');
UPDATE public.profiles
SET role = 'admin'
WHERE role IN ('مشرف', 'مدير', 'administrator', 'super_admin');
-- 2) Re-assert canonical constraint to prevent future drift.
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('tenant', 'landlord', 'admin'));
-- 3) Optional visibility for audits.
-- SELECT role, COUNT(*) FROM public.profiles GROUP BY role;;
