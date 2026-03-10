-- Migration: Fix bookings RLS policies using canonical ownership and roles
-- Date: 2026-03-05
-- Phase: 2 (DB + RLS + Names)
-- Scope:
--   - Tenant: SELECT/INSERT own bookings
--   - Landlord: SELECT/UPDATE bookings of owned properties
--   - Admin: SELECT/UPDATE/DELETE all bookings

-- Cleanup old/legacy policy names
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "tenants_select_own_bookings" ON bookings;
DROP POLICY IF EXISTS "tenants_insert_own_bookings" ON bookings;
DROP POLICY IF EXISTS "landlords_manage_property_bookings" ON bookings;
DROP POLICY IF EXISTS "landlords_select_property_bookings" ON bookings;
DROP POLICY IF EXISTS "landlords_update_property_bookings" ON bookings;
DROP POLICY IF EXISTS "admins_full_access" ON bookings;
DROP POLICY IF EXISTS "admins_select_bookings" ON bookings;
DROP POLICY IF EXISTS "admins_update_bookings" ON bookings;
DROP POLICY IF EXISTS "admins_delete_bookings" ON bookings;
-- Tenant policies
CREATE POLICY "tenants_select_own_bookings"
  ON bookings FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "tenants_insert_own_bookings"
  ON bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());
-- Landlord policies (ownership via properties.owner_id)
CREATE POLICY "landlords_select_property_bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = bookings.property_id
        AND p.owner_id = auth.uid()
    )
  );
-- NOTE: RLS cannot enforce column-level "status-only" updates by itself.
-- This policy enforces row ownership; transition/column guards should be handled by trigger/function.
CREATE POLICY "landlords_update_property_bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = bookings.property_id
        AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = bookings.property_id
        AND p.owner_id = auth.uid()
    )
  );
-- Admin policies via canonical role in profiles
CREATE POLICY "admins_select_bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
  );
CREATE POLICY "admins_update_bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
  );
CREATE POLICY "admins_delete_bookings"
  ON bookings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
  );
