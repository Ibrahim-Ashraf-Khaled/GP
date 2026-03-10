# Execution PR Plan

## Phase 2

### Task 2.3 Audit Note
- Audit Complete: no `.select('id')` found for `unlocked_properties` in `src/services/supabaseService.ts`; composite key `(user_id, property_id)` usage confirmed.
- RLS gap for `unlocked_properties` is closed under Task 2.3 using Compatibility Lock (RPC signature maintained).

### PR2 — Role Enum Unification
- DB migration added to normalize and enforce canonical roles.
- App checks migrated to shared role normalization layer (`src/lib/roles.ts`).
- Permission logic no longer depends on Arabic role literals.
- Production dependency after Task 2.3 resolved by PR2.
