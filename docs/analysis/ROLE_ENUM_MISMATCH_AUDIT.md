# Role Enum Mismatch Audit

## Status
- Fixed in PR2.

## Closed Items
- Unified role source to canonical `tenant|landlord|admin`.
- Removed Arabic literals from authorization checks.
- Added centralized normalization and label mapping in `src/lib/roles.ts`.
- Updated `useUser`, `supabaseService`, `AuthContext`, `AdminGuard`, and profile role presentation flow to canonical checks.
- Added DB migration to normalize legacy role data and enforce guardrails.

## Remaining Rule
- Arabic role strings are presentation-only and must stay outside authorization logic.
