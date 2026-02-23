-- Migration: Create payment_requests table
-- Date: 2026-02-07

-- (Optional but safe) ensure UUID generator exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,

  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('vodafone_cash', 'instapay', 'fawry')),

  receipt_image TEXT,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Users can view own
DROP POLICY IF EXISTS "Users can view own payment requests" ON public.payment_requests;
CREATE POLICY "Users can view own payment requests"
ON public.payment_requests
FOR SELECT
USING (user_id = auth.uid());

-- Users can create for self
DROP POLICY IF EXISTS "Users can create payment requests" ON public.payment_requests;
CREATE POLICY "Users can create payment requests"
ON public.payment_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admin manage (IMPORTANT: adjust to your real admin check)
DROP POLICY IF EXISTS "Admins can manage payment requests" ON public.payment_requests;
CREATE POLICY "Admins can manage payment requests"
ON public.payment_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);
