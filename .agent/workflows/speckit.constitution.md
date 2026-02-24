---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
---

s and development guidelines (.specify/memory/constitution.md) for Gamasa Properties."
---

# 📜 SpecKit Constitution Workflow - Gamasa Properties

## 🎯 Objective
Your job as an AI Agent is to generate or update the project's constitution file (`.specify/memory/constitution.md`). This document serves as the absolute foundational rulebook for all subsequent SpecKit phases (Specify, Plan, Task, Implement). 

## 📥 Execution Flow

### Step 1: Collect Gamasa Properties Core Principles
When drafting or updating the constitution, you MUST embed the following **Non-Negotiable Project Invariants** as the highest priority rules. Do not allow any specification or implementation plan to violate them:

#### 1. Architecture & Source of Truth (Database-First)
*   **Derived Availability:** Availability is NEVER stored manually in the `properties` table (e.g., `status='booked'` or `rented` is forbidden) [2-4]. It is dynamically calculated from `bookings` (only `confirmed` and `active` states) and the `property_unavailability` table [2, 5].
*   **DB-Level Guardrails:** State transitions, overlap prevention (Race Conditions), and payment verification checks MUST be enforced via PostgreSQL Constraints, Triggers, and RPCs [3, 6]. The UI or Service layer must not bypass these via direct `UPDATE` statements.
*   **Strict State Machine:** The booking flow strictly follows 10 states: `requested`, `approved`, `payment_pending`, `payment_uploaded`, `confirmed`, `active`, `completed`, `rejected`, `expired`, `cancelled` [7].

#### 2. Security Foundation
*   **No Plaintext Secrets:** Passwords and sensitive tokens (e.g., access/refresh tokens) must NEVER be stored in `localStorage` [8-10]. Rely exclusively on Supabase Server-Side Sessions.
*   **Strict RLS Enforcement:** Row Level Security (RLS) is mandatory. Tenants view only their bookings, Landlords view only their properties' bookings, and Admins cannot bypass the core State Machine transitions [11-13].
*   **No Mock Mode in Prod:** The application MUST fail fast and refuse to build/run in production if `IS_MOCK_MODE=true` [14-16].

#### 3. Financial Invariants
*   **Verification Hold:** A 50 EGP fee must be accounted for before any booking enters the `requested` state [17, 18].
*   **Event-Driven Commission:** The 10% platform commission is collected ONLY when a booking transitions to the `active` (Check-in) state. It is never collected beforehand [19-21].

#### 4. Frontend & Code Quality Standards
*   **Tech Stack:** Next.js App Router (v14+), React 19, TypeScript, Tailwind CSS, Supabase [22].
*   **Component Strategy:** Strict separation between Server Components (data fetching) and Client Components (`'use client'`).
*   **Error Handling:** Use unified `Toast` notifications instead of raw `alert()`. Ensure `error.tsx` and `not-found.tsx` boundaries are effectively utilized [23, 24].
*   **TDD Approach:** Test-driven development is preferred. Tests must be structured before implementation tasks [25, 26].

### Step 2: Incorporate User Input
If the user provided specific arguments (e.g., `/speckit.constitution focus on strict type checking`), merge those gracefully with the core invariants above.

### Step 3: Draft the Constitution File
Generate the complete markdown content for `.specify/memory/constitution.md`. Ensure it is organized into clear sections:
1. Core Architectural Principles
2. Security & Data Integrity
3. Financial Rules
4. Tech Stack & Frontend Standards
5. Quality Gates & TDD

### Step 4: Write to File
Save the generated markdown directly to `.specify/memory/constitution.md`.

## 📤 Output Generation
After successfully writing the file, output the following summary to the user:

```markdown
### 🏛️ Gamasa Properties Constitution Established

*   **Version:** 1.0
*   **Key Pillars Enforced:** DB-First State Machine, Derived Availability, Event-Driven Commission, Strict RLS, Production Readiness.
*   **File Updated:** `.specify/memory/constitution.md`
*   **Next Step:** The foundational rules are set. You can now proceed to specify a new feature by running `/speckit.specify [Feature Description]`.

### 💡 كيف يعمل هذا الملف؟
* **الوظيفة:** عندما تقوم بتشغيل الأمر `/speckit.constitution` في الشات الخاص بالـ AI Agent، سيقوم الـ Agent بقراءة هذا الملف ليعرف "كيف يبني دستور المشروع".
* **الأثر:** سيقوم الـ Agent بإنشاء ملف `.specify/memory/constitution.md` يحتوي على القواعد الذهبية لمشروع جمصة (منع التداخل، حساب التوفر ديناميكياً، تحصيل العمولة عند `active`، إلخ).
* **النتيجة:** في أي مرة تطلب فيها من الـ Agent كتابة كود ميزة جديدة باستخدام `/speckit.implement`، سيقرأ الـ Agent هذا الدستور أولاً، ولن يقترح عليك أبداً تخزين بيانات حساسة في `localStorage` أو تغيير حالة الحجز بدون المرور بقواعد الـ Database [200، 624].
e.