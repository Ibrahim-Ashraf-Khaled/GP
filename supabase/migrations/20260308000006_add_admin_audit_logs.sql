-- Migration: Add admin_audit_logs table with strict RLS
-- Date: 2026-03-08
-- Goal: persist admin audit events in DB (no dependency on fallback console logging)

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_audit_logs_action_not_empty CHECK (char_length(trim(action)) > 0),
  CONSTRAINT admin_audit_logs_target_type_not_empty CHECK (char_length(trim(target_type)) > 0),
  CONSTRAINT admin_audit_logs_target_id_not_empty CHECK (char_length(trim(target_id)) > 0)
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at
  ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_user_id
  ON public.admin_audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target
  ON public.admin_audit_logs (target_type, target_id);
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_read_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "admins_read_audit_logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.is_admin = TRUE)
    )
  );
DROP POLICY IF EXISTS "admins_insert_own_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "admins_insert_own_audit_logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (
    actor_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.is_admin = TRUE)
    )
  );
