---
description: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
---

---
description: "Converts the tasks.md breakdown into actionable GitHub Issues via a bash script, attaching Gamasa Properties V1 architectural rules as acceptance criteria."
---

# 🎫 SpecKit Tasks-to-Issues Workflow - Gamasa Properties

## 🎯 Objective
Your goal as an AI Agent is to parse the `tasks.md` file and convert the actionable development steps into a set of well-structured GitHub Issues. You will generate a shell script (`create_issues.sh`) that uses the GitHub CLI (`gh`) to automatically create these issues with the correct labels, priorities, and Gamasa-specific acceptance criteria.

## 📥 Execution Flow

### Step 1: Context Processing
Load and analyze:
1. `.specify/memory/constitution.md` (Project Principles)
2. `tasks.md` (Task Breakdown)
*Abort if `tasks.md` does not exist.*

### Step 2: Issue Classification & Labeling
Group the tasks logically (e.g., by Phase or User Story). Assign appropriate labels based on the Gamasa DB-First architecture:
*   **Database Schema & Migrations:** Label `database`, `schema`
*   **DB Guards, RPCs & Triggers:** Label `database`, `security`, `core-logic`
*   **Backend Services & APIs:** Label `backend`, `api`
*   **Frontend (Server & Client Components):** Label `frontend`, `ui`
*   **Security & RLS:** Label `security`, `rls`

### Step 3: Issue Content Formatting
For each issue, draft a clear title and a markdown body. The body MUST include:
1.  **Task Description:** Clear instructions on what needs to be implemented.
2.  **Gamasa Acceptance Criteria:** Inject strict guardrails relevant to the task based on the project constitution:
    *   *If DB/Backend:* "Must use RPCs/Triggers. Do NOT use direct UPDATEs for booking statuses."
    *   *If Availability:* "Availability must be derived. Do NOT add a 'status' column to the properties table."
    *   *If Frontend/Auth:* "Do NOT use localStorage for tokens. Rely exclusively on Supabase Server-Side Sessions."
    *   *If Security:* "Ensure RLS policies strictly limit access by `auth.uid()`."
3.  **Dependencies:** Mention what issues must be completed first (e.g., "Blocked by Database Migration issue").

### Step 4: Script Generation
Generate a bash script named `create_issues.sh` containing `gh issue create` commands for each task.

*Example formatting inside the script:*
```bash
#!/bin/bash
echo "Creating Gamasa Properties Issues..."

gh issue create \
  --title "[Phase 1] Create validate_booking_transition trigger" \
  --body "### Description
Implement the PostgreSQL trigger to enforce the 10 allowed booking states.

### 🛡 Gamasa Acceptance Criteria
- [ ] Must prevent bypassing the State Machine via direct SQL.
- [ ] Must map errors correctly to be handled by the frontend.
- [ ] No overlapping for confirmed/active states." \
  --label "database,security"
Step 5: File Output
Write the generated bash script to create_issues.sh in the root directory.
📤 Output Generation
After writing the script, output the following summary to the user:
### 🎫 GitHub Issues Script Generated

*   **Script Created:** `create_issues.sh`
*   **Total Issues Planned:** [Number of issues]
*   **Gamasa Rules Embedded:** Added strict acceptance criteria (DB-First, Derived Availability, Security) to ticket bodies.
*   **Next Step:** Please review `create_issues.sh`. If it looks correct, run `bash create_issues.sh` in your terminal to populate your GitHub repository. (Requires GitHub CLI `gh` to be installed and authenticated).

### 💡 كيف ومتى تستخدم هذا الملف؟
*   **متى تستخدمه؟** بعد تشغيل الأمر `/speckit.tasks` وإنشاء ملف المهام، وإذا كنت تعمل ضمن فريق أو تريد تتبع عملك على GitHub Projects أو Jira.
*   **كيف يعمل؟** بكتابة الأمر `/speckit.taskstoissues` في الشات، سيقوم الـ AI بإنشاء سكربت (ملف نصي تنفيذي `create_issues.sh`). هذا السكربت يحتوي على أوامر جاهزة لإنشاء تذاكر المشروع مع إعطائها التصنيفات (Labels) المناسبة وتضمين شروط القبول الأمنية بداخل كل تذكرة لضمان الجودة [106، 633].
*   **مكان الحفظ:** احفظ هذا الكود في ملف باسم `speckit.taskstoissues.md` داخل مجلد `.agent/workflows/`.