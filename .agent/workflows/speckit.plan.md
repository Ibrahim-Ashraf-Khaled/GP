---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
---

---
description: "Generates a technical implementation plan (plan.md) from specifications, strictly enforcing Gamasa Properties V1 DB-first architecture."
---

# 📐 SpecKit Plan Workflow - Gamasa Properties

## 🎯 Objective
Your goal as an AI Agent is to read the functional specification (`specs/`) and the project constitution (`.specify/memory/constitution.md`), then generate a rigorous technical implementation plan (`plan.md`). This plan must translate the "what" into the "how" while strictly enforcing the **Gamasa Properties V1** Database-First architecture and Next.js App Router standards.

## 📥 Execution Flow

### Step 1: Context Gathering
1. Read `.specify/memory/constitution.md`.
2. Read the latest feature specification in the `specs/` directory.
3. Review any specific tech stack instructions provided by the user in the prompt.

### Step 2: Gamasa Architectural Alignment (CRITICAL)
When designing the technical plan, you MUST adhere to these architectural pillars:

#### 1. Database-First State Machine (The Core)
*   **Schema & Constraints:** Define the exact PostgreSQL changes needed.
*   **State Transitions:** Plan for PostgreSQL Triggers and RPCs (e.g., `validate_booking_transition`). Do NOT plan to update booking statuses directly from the Next.js service layer using `.update()`.
*   **Overlap Prevention:** If the feature involves dates, plan to use an `EXCLUDE USING gist` constraint in PostgreSQL. Do NOT rely on TypeScript validation to prevent race conditions.

#### 2. Data Access & Availability
*   **Derived Availability:** If the feature displays properties, specify that availability MUST be calculated dynamically from `bookings` (`confirmed` + `active`) and `property_unavailability`. Do NOT plan to add a `status='booked'` column to the `properties` table.
*   **Financials:** If the feature touches money, state clearly that the 10% commission is calculated/inserted via a DB Trigger *only* when a booking hits the `active` state.

#### 3. Security & APIs
*   **RLS Policies:** Explicitly define the Row Level Security policies required (Tenant vs. Landlord vs. Admin).
*   **Server-Side Auth:** Plan to use `@supabase/ssr` for session management. Explicitly forbid `localStorage` for sensitive state.
*   **Data Validation:** Plan to use `zod` for all form and API payload validation.

#### 4. Frontend Architecture (Next.js 14+)
*   **Component Split:** Clearly separate Server Components (data fetching) from Client Components (`'use client'`, interactivity).
*   **Error Handling:** Plan for `error.tsx` boundaries and unified `Toast` notifications instead of `alert()`.

### Step 3: Plan Generation
Generate a detailed markdown document (`plan.md`) in the root directory. Structure it as follows:

```markdown
# 🛠️ Technical Implementation Plan

## 1. Architecture Overview
*   High-level summary of the technical approach.

## 2. Database Schema & DB Guards
*   **Tables & Enums:** New tables or alterations.
*   **RPCs & Triggers:** Exact DB-level functions needed to enforce business rules.
*   **RLS Policies:** Security rules for the involved tables.

## 3. Backend Services & APIs
*   Next.js Server Actions or API Routes.
*   Data fetching strategies (Supabase Client).

## 4. Frontend Components
*   **Server Components:** List of components fetching data.
*   **Client Components:** List of interactive components (`'use client'`).
*   **State Management:** Hooks or Context needed.

## 5. Security & Edge Cases
*   How race conditions, invalid transitions, and auth bypasses are prevented.

## 6. Testing Strategy
*   What unit/integration tests are required (TDD approach).
Step 4: Write and Output
Write the generated content to plan.md.
Output a summary to the user indicating the plan is ready.
📤 Output Generation
After successfully writing plan.md, output the following to the user:
### 📐 Implementation Plan Generated

*   **Plan File:** `plan.md` has been created/updated.
*   **Key Design Choices:** [Briefly list 2-3 major technical decisions, e.g., "Added RPC for atomic booking", "Created Zod schema for validation"].
*   **Next Step:** Please review the plan. If it looks good, run `/speckit.tasks` to break this plan down into actionable development steps.

### 💡 كيف ومتى تستخدم هذا الملف؟
*   **متى تستخدمه؟** بعد الانتهاء من كتابة المواصفات `/speckit.specify` (ومراجعتها بـ `/speckit.clarify` إذا لزم الأمر)، ستقوم بتشغيل أمر `/speckit.plan`.
*   **كيف يعمل؟** سيقرأ الـ AI Agent هذا الموجه وسيقوم بإنشاء ملف `plan.md` يحتوي على التصميم التقني (أسماء الجداول، الـ RPCs المطلوبة، المكونات التي ستكون Server أو Client Component)، مع التأكد من أن هذا التصميم  **لا يخالف** قواعد جمصة (مثل تخزين التوفر في الداتابيز بشكل مباشر، أو الاعتماد على التحديث المباشر لحالة الحجز) [34، 200، 208].
*   **مكان الحفظ:** ضع الكود في ملف `speckit.plan.md` داخل مجلد `.agent/workflows/`.