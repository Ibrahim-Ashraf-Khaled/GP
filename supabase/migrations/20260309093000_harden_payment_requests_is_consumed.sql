ALTER TABLE public.payment_requests
ADD COLUMN IF NOT EXISTS is_consumed BOOLEAN DEFAULT FALSE;

UPDATE public.payment_requests
SET is_consumed = FALSE
WHERE is_consumed IS NULL;

ALTER TABLE public.payment_requests
ALTER COLUMN is_consumed SET DEFAULT FALSE;

ALTER TABLE public.payment_requests
ALTER COLUMN is_consumed SET NOT NULL;
