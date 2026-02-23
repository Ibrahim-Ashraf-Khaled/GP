# Gamasa Properties – DB-First Booking Architecture
### RPC + SECURITY DEFINER | بنية الحجز المعتمدة على قاعدة البيانات

---

## 1. Core Principles

| Principle | Description |
|-----------|-------------|
| **Source of Truth = Database** | The DB is the single authority for all booking state |
| **Derived Availability** | Availability is never stored — always computed from `confirmed` + `active` bookings |
| **No Overlap Confirmed/Active** | Two bookings cannot overlap for the same property in these states |
| **Commission Event-Driven** | Commission is recorded only after a booking becomes `active` |
| **State Machine at DB Level** | No service-layer assumption — the DB enforces all transitions |

---

## 2. Booking State Machine (Final)

```
requested ──► approved ──► payment_pending ──► payment_uploaded ──► confirmed ──► active ──► completed
    │              │               │                                     │             │
    └──► rejected  └──► cancelled  └──► expired / cancelled              └──► cancelled └──► (auto)
```

### Allowed Transitions

| From | To (allowed) | Actor |
|------|-------------|-------|
| `requested` | `approved`, `rejected`, `cancelled` | Landlord |
| `approved` | `payment_pending`, `confirmed` (COD), `cancelled` | Tenant / Landlord |
| `payment_pending` | `payment_uploaded`, `expired`, `cancelled` | Tenant / System |
| `payment_uploaded` | `confirmed` | Admin / Landlord |
| `confirmed` | `active`, `cancelled`, `expired` (system repair) | Landlord / System |
| `active` | `completed` | System |

---

## 3. Database Guards

### 3.1 State Transition Guard (`validate_booking_transition`)

Enforced via `BEFORE UPDATE` trigger on `public.bookings`. Raises `P0001` on any illegal transition.

```sql
CREATE OR REPLACE FUNCTION public.validate_booking_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (OLD.status = 'requested'        AND NEW.status IN ('approved','rejected','cancelled'))
      OR (OLD.status = 'approved'      AND NEW.status IN ('payment_pending','confirmed','cancelled'))
      OR (OLD.status = 'payment_pending' AND NEW.status IN ('payment_uploaded','expired','cancelled'))
      OR (OLD.status = 'payment_uploaded' AND NEW.status = 'confirmed')
      OR (OLD.status = 'confirmed'     AND NEW.status IN ('active','cancelled','expired'))
      OR (OLD.status = 'active'        AND NEW.status = 'completed')
    ) THEN
      RAISE EXCEPTION 'Invalid booking status transition: % -> %', OLD.status, NEW.status
        USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
```

### 3.2 Payment Guard (`validate_payment_before_confirm`)

Prevents `confirmed` status without verified payment. Enforced via `BEFORE UPDATE` trigger.

- `approved → confirmed`: only allowed if `payment_method = 'cash_on_delivery'`
- `payment_uploaded → confirmed`: only allowed if `payment_status = 'verified'`

### 3.3 Exclusion Constraint (Race Condition Prevention)

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
  ADD CONSTRAINT no_overlap_confirmed_active
  EXCLUDE USING gist (
    property_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
  WHERE (status IN ('confirmed','active'));
```

**Effect:** Any two bookings for the same property with overlapping dates cannot both be in `confirmed` or `active` state. This is 100% atomic — no race condition is possible.

### 3.4 Date Immutability Guard (`prevent_date_edit_after_confirmation`)

```sql
-- Raises P0001 if start_date or end_date is changed when status is confirmed/active
```

### 3.5 Audit Logging (`audit_booking_status_change`)

Every status change is recorded in `public.activity_logs` with `old_values`, `new_values`, `user_id`, and timestamp.

---

## 4. RPC Architecture

### User RPCs (SECURITY INVOKER — RLS applies)

| RPC | Transition | Actor |
|-----|-----------|-------|
| `rpc_start_electronic_payment(p_booking_id)` | `approved → payment_pending` | Tenant |
| `rpc_upload_receipt(p_booking_id, p_receipt_url)` | `payment_pending → payment_uploaded` | Tenant |
| `rpc_verify_payment_and_confirm(p_booking_id)` | `payment_uploaded → confirmed` (atomic: sets `verified` + `confirmed` in one TX) | Admin / Landlord |
| `rpc_confirm_cod(p_booking_id)` | `approved → confirmed` (COD only) | Landlord |
| `rpc_confirm_checkin(p_booking_id)` | `confirmed → active` | Landlord |

### System RPCs (SECURITY DEFINER — service_role only)

| RPC | Purpose |
|-----|---------|
| `rpc_auto_expire_payment_pending(p_deadline_hours)` | Expire stale `payment_pending` bookings |
| `rpc_auto_complete_active()` | Complete `active` bookings past `end_date` |
| `rpc_auto_complete_active(p_date)` | Same, with explicit date (for backfill/staging) |
| `rpc_repair_stuck_confirmed(p_as_of_date, p_grace_days)` | Move stuck `confirmed` → `expired` (count returned) |
| `rpc_repair_stuck_confirmed_ids(p_as_of_date, p_grace_days)` | Same, returns repaired booking IDs |

### Permission Matrix

```sql
-- Applied to all SECURITY DEFINER RPCs:
REVOKE EXECUTE ON FUNCTION public.rpc_* FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rpc_* FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.rpc_* TO service_role;

-- Internal helper:
CREATE OR REPLACE FUNCTION public._assert_service_role()
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
  ...raises 42501 if caller is not service_role...
$$;
```

---

## 5. RLS Enforcement

| Role | Policy |
|------|--------|
| **Tenant** | Can `SELECT` / `INSERT` own bookings only (`tenant_id = auth.uid()`) |
| **Landlord** | Can `SELECT` / `UPDATE` bookings for their properties only (`landlord_id = auth.uid()`) |
| **Admin** | Full access |
| **System (service_role)** | Bypasses RLS — used only for SECURITY DEFINER system jobs |

All User RPCs are `SECURITY INVOKER`, meaning RLS is always active for tenant/landlord actions.

---

## 6. Concurrency Control — Sequence Diagram

```
Tenant A                   Tenant B                   Postgres DB
    │                          │                           │
    │── verifyPaymentAndConfirm(bookingA) ──────────────►  │
    │                          │    SELECT bookingA FOR UPDATE (row lock)
    │                          │    validate_booking_transition ✔
    │                          │    validate_payment_before_confirm ✔
    │                          │    EXCLUDE constraint check → PASS
    │  ◄── confirmed ──────────────────────────────────────│
    │                          │                           │
    │                   verifyPaymentAndConfirm(bookingB) ─►
    │                          │    SELECT bookingB FOR UPDATE
    │                          │    validate_booking_transition ✔
    │                          │    validate_payment_before_confirm ✔
    │                          │    EXCLUDE constraint check → FAIL (23P01)
    │                   ◄── NOT_AVAILABLE ─────────────────│
```

**Result:** Only one booking succeeds. The second fails atomically. No double booking is possible.

---

## 7. Service Layer — BookingService (RPC-Based)

All critical transitions must call RPCs — not direct `UPDATE` statements.

```typescript
// ✅ Correct (RPC)
await supabase.rpc('rpc_verify_payment_and_confirm', { p_booking_id: bookingId });

// ❌ Wrong (bypasses DB guards)
await repo.updateStatus(bookingId, { status: 'confirmed' });
```

### Error Mapping (`mapDbError`)

| Postgres Code | Domain Error |
|--------------|-------------|
| `23P01` (exclusion_violation) | `NOT_AVAILABLE` |
| `42501` (insufficient_privilege) | `FORBIDDEN` |
| `P0002` (no data found) | `NOT_FOUND` |
| `P0001` + "payment" / "verified" | `PAYMENT_NOT_VERIFIED` |
| `P0001` (other) | `INVALID_TRANSITION` |

### Admin Client (Server-Only)

```typescript
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

Used **only** for system jobs (cron/Edge Functions). Never exposed to the client.

---

## 8. System Jobs (Cron / Edge Functions)

```typescript
const admin = createAdminClient(); // service_role key

// Auto-expire stale payment_pending
await admin.rpc('rpc_auto_expire_payment_pending', { p_deadline_hours: 24 });

// Auto-complete active bookings past end_date
await admin.rpc('rpc_auto_complete_active');

// Repair stuck confirmed bookings
await admin.rpc('rpc_repair_stuck_confirmed', {
  p_as_of_date: '2026-02-20',
  p_grace_days: 0
});
```

---

## 9. Database Guarantees Checklist

| Guarantee | Mechanism |
|-----------|-----------|
| ✅ No race condition / double booking | `EXCLUDE USING gist` constraint (atomic) |
| ✅ No illegal state transitions | `validate_booking_transition` trigger |
| ✅ No payment bypass | `validate_payment_before_confirm` trigger |
| ✅ No date edit after confirmation | `prevent_date_edit_after_confirmation` trigger |
| ✅ No stuck confirmed bookings | `rpc_repair_stuck_confirmed` (SECURITY DEFINER) |
| ✅ Availability is always derived | No `availability` table — computed from `confirmed`/`active` |
| ✅ Commission is event-driven | Revenue trigger fires only on `active` |
| ✅ Full audit trail | `audit_booking_status_change` → `activity_logs` |

---

## 10. Architecture Responsibility Map

| Layer | Responsibility |
|-------|---------------|
| **React UI** | Calls API routes / Server Actions only |
| **BookingService / supabaseService** | Calls RPCs — no direct status updates |
| **User RPCs (INVOKER)** | Atomic transitions within a single transaction |
| **DB Triggers** | Block illegal transitions and payment bypass |
| **Exclusion Constraint** | Prevent overlapping confirmed/active bookings |
| **SECURITY DEFINER RPCs** | System-only transitions (expire, complete, repair) |
| **RLS** | Actor-level row access enforcement |
| **MessagingService** | Pure side-effect service — no DB guards responsibility |

---

## 11. Files Requiring Changes After This Architecture

| File | Change Required |
|------|----------------|
| `src/modules/bookings/service.ts` | ✅ Replace direct `updateStatus` with `supabase.rpc(...)` |
| `src/lib/supabase/admin.ts` | ✅ Create admin client (service_role) |
| `src/lib/cron/autoJobs.ts` | ✅ Use `admin.rpc(...)` for system jobs |
| DB Migration (guards + constraints) | ✅ Run once in production |
| DB Migration (User RPCs) | ✅ Run after guards migration |
| DB Migration (SECURITY DEFINER RPCs) | ✅ Run with revoke/grant |
| `src/modules/bookings/db-error.ts` | ✅ Map all Postgres error codes |
| UI / React Components | ❌ No changes needed |
| RLS Policies | ❌ No changes needed |
| `messagingService.ts` | ❌ No changes needed |

---

*Last updated: February 2026 — Gamasa Properties v1*
