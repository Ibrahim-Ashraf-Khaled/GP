---
description: Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation.
---

```markdown
---
description: "Cross-artifact consistency & coverage analysis workflow for Gamasa Properties. Run after /speckit.tasks and before /speckit.implement."
---

# 🕵️‍♂️ SpecKit Analyze Workflow - Gamasa Properties

## 🎯 Objective
Your goal as an AI Agent is to perform a strict cross-artifact consistency and coverage analysis. You must validate the generated functional specifications (`specs/`), the technical plan (`plan.md`), and the task breakdown (`tasks.md`) against the core architectural principles and business rules of **Gamasa Properties V1**.

## 📥 Execution Flow

### Step 1: Context Gathering
Load and review the following artifacts:
1. `.specify/memory/constitution.md` (Project Principles)
2. The current feature's functional specification (e.g., `specs/XXX-feature.md`)
3. The technical implementation plan (`plan.md`)
4. The generated task breakdown (`tasks.md`)

### Step 2: Gamasa V1 Invariants & Architecture Check (CRITICAL)
Analyze the loaded artifacts against the following non-negotiable project invariants. Flag any violations as **Blockers**:

1. **Database-First State Machine:**
   - Are booking status transitions handled via DB-level constraints, Triggers, and RPCs?
   - Ensure the UI/Service layer does NOT execute direct `UPDATE` statements for booking statuses.
   - Allowed states: `requested`, `approved`, `payment_pending`, `payment_uploaded`, `confirmed`, `active`, `completed`, `rejected`, `expired`, `cancelled`.

2. **Derived Availability:**
   - **MUST NOT** store availability (e.g., `booked`, `rented`) in the `properties` table.
   - Availability **must** be dynamically derived checking `bookings` (only `confirmed` + `active` states) and the `property_unavailability` table.

3. **No Overlapping Bookings:**
   - Does the plan respect the Exclusion Constraint preventing overlap for `confirmed` and `active` bookings?

4. **Event-Driven Commission:**
   - Is commission calculation planned to trigger **only** upon the transition to the `active` state (Check-in)?

5. **Security & Auth Foundation:**
   - Are RLS (Row Level Security) policies strictly enforced (Tenant vs. Landlord vs. Admin)?
   - Ensure there is NO reliance on `localStorage` for authentication state (use Supabase Server-Side Sessions).
   - Ensure passwords or sensitive tokens are NEVER stored in plaintext.

### Step 3: Tech Stack & Frontend Standards Check
Review the technical plan and tasks for adherence to the codebase standards:
- **Next.js App Router (v14+):** Proper separation of Server and Client Components (`'use client'`). Data fetching should happen on the server where possible.
- **Error Handling:** Ensure the use of `error.tsx` and unified `Toast` notifications instead of raw `alert()`.
- **Environment Gates:** Ensure no code executes in production if `IS_MOCK_MODE=true`.

### Step 4: Task Coverage & Actionability
Review the `tasks.md` breakdown:
- **TDD Approach:** Are test tasks scheduled *before* implementation tasks?
- **Granularity:** Are tasks small, actionable, and tied directly to user stories?
- **Dependencies:** Is the execution order logical? (e.g., DB Schema/Migrations -> RPCs/Triggers -> Backend Services -> UI Components).

## 📤 Output Generation
Generate a comprehensive Analysis Report formatted as follows:

```markdown
### 📊 Analysis Report

#### 1. Consistency & Invariants Check
*   **State Machine:** [Pass / Fail - Details]
*   **Availability Logic:** [Pass / Fail - Details]
*   **Security & RLS:** [Pass / Fail - Details]
*   **Commission & Payments:** [Pass / Fail - Details]

#### 2. Coverage Gaps
*   Identify any functional requirements from the spec missing in the `tasks.md`.

#### 3. Architectural Violations (Blockers)
*   List any planned technical choices that violate the Gamasa Master Plan (e.g., saving availability to DB, using `localStorage` for auth, bypassing RPCs).

#### 4. Action Required
*   If violations exist: Output explicit commands or prompts the user should run (e.g., `/speckit.clarify` or manually editing the plan) before proceeding to `/speckit.implement`.
*   If everything passes: Output `✅ Analysis Passed. Ready for /speckit.implement`.
```
```

### شرح للـ Workflow المُصمم:
1. **الخطوة الأولى (Context Gathering):** تُجبر الـ Agent على قراءة كل الملفات السابقة (الخطة، المهام، المواصفات) ليكون على دراية كاملة بما تم تخطيطه.
2. **الخطوة الثانية (Gamasa V1 Invariants Check):** قمت بتضمين القواعد الذهبية لمشروعك (Source of Trutت