UPDATE public.profiles
SET role = 'admin'
WHERE is_admin = TRUE
  AND role <> 'admin';

UPDATE public.profiles
SET is_admin = TRUE
WHERE role = 'admin'
  AND is_admin IS DISTINCT FROM TRUE;

DROP POLICY IF EXISTS "Admins can do everything on properties" ON public.properties;
CREATE POLICY "Admins can do everything on properties" ON public.properties
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  );

DROP POLICY IF EXISTS "Admins can manage payment requests" ON public.payment_requests;
CREATE POLICY "Admins can manage payment requests" ON public.payment_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  );

DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  );
