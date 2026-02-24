---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

 Enforces Gamasa Properties V1 code-level architecture, security, and TDD practices."
---

# 🏗️ SpecKit Implement Workflow - Gamasa Properties

## 🎯 Objective
Your goal as an AI Agent is to systematically execute the implementation tasks defined in `tasks.md`. You must translate the technical plan into high-quality, production-ready code while strictly adhering to the **Gamasa Properties V1** architectural constraints and business rules.

## 📥 Execution Flow

### Step 1: Context & Prerequisites Validation
Before writing any code, load and process the following:
1. `.specify/memory/constitution.md` (Core rules)
2. `specs/[feature-name].md` (Functional requirements)
3. `plan.md` (Technical architecture)
4. `tasks.md` (The step-by-step breakdown)
*Abort implementation if `tasks.md` does not exist.*

### Step 2: Step-by-Step Task Execution
Parse `tasks.md` and execute each task sequentially. For each task:
1. **Test-Driven Development (TDD):** If a testing task precedes an implementation task, write the test first (e.g., Jest/Vitest/Playwright).
2. **Execute Local Commands:** Run necessary terminal commands (e.g., `npm install`, `npx supabase gen types`) if required by the task.
3. **Write Code:** Implement the required logic.

### Step 3: Gamasa Code-Level Guardrails (CRITICAL)
While generating code, you MUST respect these strict project boundaries:

#### 1. Database & Booking State Machine
*   **NEVER** write a direct `supabase.from('bookings').update({ status: '...' })` query in the frontend or service layer to transition a booking state. 
*   **ALWAYS** use the dedicated Database RPCs (e.g., `supabase.rpc('rpc_confirm_checkin')`) to ensure atomic transitions and trigger the Postgres state guards.
*   **NEVER** add or check a `booked` or `rented` status in the `properties` table. Availability is strictly derived.

#### 2. Authentication & Security
*   **NEVER** use `localStorage` to store or retrieve user profiles, access tokens, or passwords. Rely exclusively on `@supabase/ssr` or `supabase.auth.getUser()`.
*   Ensure all API Routes and Server Actions validate `auth.uid()` before performing any DB operations.

#### 3. Frontend Standards (Next.js App Router)
*   Ensure proper use of `'use client'` only at the leaves of the component tree. Keep data fetching in Server Components wherever possible.
*   **NEVER** use raw `alert()` for user feedback. Always use the project's unified `Toast` notification system.
*   Validate all form inputs and API payloads using **Zod** schemas.

#### 4. Environment & Production Readiness
*   Ensure any mock-related code is wrapped in an Environment Gate. No mock code should execute if `NEXT_PUBLIC_IS_MOCK_MODE=false`.

### Step 4: Verification & Progression
After completing a task or a group of related tasks:
1. Run local linters or TypeScript checks (`npm run typecheck` or similar if available) to ensure the code compiles.
2. Check off the task in your internal memory.
3. Provide a brief progress update to the user.

## 📤 Output Generation
Upon completing all tasks in `tasks.md`, generate a final implementation summary:

```markdown
### 🚀 Implementation Complete

*   **Feature:** [Feature Name]
*   **Tasks Executed:** [Number] of [Total Tasks]
*   **Tests Passed:** [Test Results Summary, if applicable]

#### 🛠️ Key Architectural Alignments:
*   [Briefly mention how DB RPCs, RLS, and Next.js standards were applied in this specific implementation].

#### 🔍 Next Steps:
*   Please review the generated code. 
*   Run the application locally to verify functionality.
*   If you encounter any runtime errors, paste the error logs here so I can fix them.

### 💡 كيف يعمل هذا الملف في بيئة Spec Kit؟
*   **الترتيب المنطقي:** هذا هو الأمر الأخير في دورتك البرمجية. بعد أن قمت بتجهيز المواصفات `/speckit.specify`، والخطة التقنية `/speckit.plan`، وتقسيم المهام `/speckit.tasks`، تقوم الآن باستدعاء `/speckit.implement`.
*   **وظيفة الملف:** يقوم هذا الـ Prompt بتذكير الـ AI Agent (مثل OpenCode أو Cursor) بقواعد كتابة الكود الصارمة في مشروعك أثناء قيامه بالتكويد الفعلي (مثل: استخدام الـ RPCs بدلاً من التحديث المباشر لحالة الحجز، وتجنب `localStorage`، واستخدام `Toast` بدلاً من `alert()`) [208، 513، 620].
*   **مكان الحفظ:** احفظ هذا الكود في ملف باسم `speckit.implement.md` داخل مجلد `.agent/