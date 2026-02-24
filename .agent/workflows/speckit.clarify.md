---
description: Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.
---

description: "Clarifies underspecified areas in the functional specification before technical planning. Enforces Gamasa Properties V1 business rules and edge cases."
---

# 🧐 SpecKit Clarify Workflow - Gamasa Properties

## 🎯 Objective
Your goal as an AI Agent is to rigorously analyze the initial functional specification (`specs/`) for missing details, logical gaps, and architectural ambiguities. You must ensure the feature aligns perfectly with the **Gamasa Properties V1** business rules and database constraints before the user proceeds to `/speckit.plan`.

## 📥 Execution Flow

### Step 1: Context Analysis (Gamasa Guardrails)
Analyze the generated specification against the following Gamasa V1 Invariants. Look for anything left ambiguous:
1. **The 10-State Machine:** Does the spec introduce generic terms like "booked" or "done"? It MUST use only the official DB states: `requested`, `approved`, `payment_pending`, `payment_uploaded`, `confirmed`, `active`, `completed`, `rejected`, `expired`, `cancelled`.
2. **Derived Availability:** Does the spec accidentally suggest updating `property.status` to hide a booked property? (Rule: Availability must only be calculated dynamically from `bookings` and `property_unavailability`).
3. **Financial Logic:** If the feature touches payments, does it account for the 50 EGP verification hold? Does it respect that the 10% commission is ONLY triggered when a booking hits the `active` state (Check-in)?
4. **Race Conditions:** Are there overlapping booking vulnerabilities left unaddressed in the requirements?

### Step 2: Gap Identification & Questioning
Identify the highest priority ambiguities. Present them to the user as clear, numbered questions. For each question, provide 2-3 structured options, explicitly highlighting a **Recommended** option that strictly follows Gamasa's DB-first architecture.

*Format Example:*
> **Q1: How should the system handle concurrent booking attempts for the same dates?**
> - **Option A:** Validate in the UI before submitting. (Unsafe)
> - **Option B (Recommended):** Rely on the database EXCLUDE constraint for `confirmed` and `active` statuses to fail atomically.
> - **Option C:** Allow them and let the Landlord decide.

### Step 3: Await User Input
Pause execution and wait for the user to reply with their choices or custom clarifications.

### Step 4: Update the Specification
Once the user provides answers:
1. Rewrite the affected User Stories and Acceptance Criteria in the `specs/` markdown file to incorporate the new logic.
2. Add a `## 📝 Clarifications` section at the end of the spec document, recording the decisions made (e.g., "Decision: Rely on DB constraint for overlap prevention - [Date]").

## 📤 Output Generation
After successfully updating the specification file, output the following summary to the user:

```markdown
### ✅ Clarification Complete

*   **Ambiguities Resolved:** [Brief list of what was decided, e.g., Concurrency handled via DB, Commission tied to active state]
*   **Spec Updated:** The functional specification file has been updated with your decisions and a new Clarifications section.
*   **Next Step:** The specification is solid. You can now proceed to generate the technical implementation plan by running `/speckit.plan`.

### 💡 متى وكيف تستخدم هذا الملف؟
* **كيف يعمل؟** عندما تكتب أمر `/speckit.clarify`، سيقوم الـ Agent بقراءة مواصفات الميزة التي تود بناءها، وإذا وجد أنك نسيت تحديد ماذا سيحدث في حالة (Edge Case) معينة (مثلاً: مستأجر ألغى الحجز بعد الدفع وقبل الاستلام)، سيطرح عليك خيارات لحل هذه المعضلة بناءً على سياسات جمصة [323، 327]، وبمجرد أن تختار (مثلاً: الخيار ب)، سيقوم بتحديث ملف المواصفات تلقائياً [1].
* **متى تستخدمه؟** يتم استخدامه كخطوة فاصلة **بعد** إنشاء المواصفات `/speckit.specify` و**قبل** إنشاء الخطة التقنية `/speckit.plan` [2]. 
* **مكان الحفظ:** ضع هذا المحتوى في ملف `speckit.clarify.md` داخل مجلد `.agent/workflows/`.
