# RLS Contract V1
- Date: 2026-03-05
- Version: V1.1
- Status: Approved

## Canonical Roles
- `tenant`
- `landlord`
- `admin`

Invariant: authorization checks must use canonical English roles only. Arabic values are UI labels only.

## unlocked_properties (Implemented in Phase 2)
- Gap Status: Closed (Task 2.3).
- SELECT: own records only (`user_id = auth.uid()`).
- INSERT: blocked for direct client access (deny-by-default, no INSERT policy).
- DELETE: admin only (`EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`).
- RPC insertion path:
- `unlock_property_with_payment(p_user_id UUID, p_property_id UUID, p_payment_id UUID) RETURNS VOID`
- Execution: `SECURITY DEFINER`.

## PR2 Canonicalization Note
- PR2 completed: role canonicalization is enforced in DB and app.
- `profiles.role` is constrained to `tenant|landlord|admin`.
- Unknown app-side role input is normalized to `tenant` with warning log.

## Change Log
- V1.0 (2026-03-05): initial contract.
- V1.1 (2026-03-05): closed `unlocked_properties` RLS gap, enforced composite key path, secured RPC insertion, and documented PR2 role canonicalization completion.
