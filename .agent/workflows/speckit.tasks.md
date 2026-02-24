---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.speckit/scripts/powershell/check-prerequisites.ps1 -Json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (interface contracts), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map interface contracts to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md**: Use `.speckit/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

5. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)

Context for task generation: $ARGUMENTS

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label  
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Interfaces/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each interface contract → to the user story it serves
   - If tests requested: Each interface contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns
---
description: "Generates an actionable task breakdown (tasks.md) from the technical plan, enforcing Gamasa Properties V1 DB-first execution order and TDD."
---

# 📋 SpecKit Tasks Workflow - Gamasa Properties

## 🎯 Objective
Your goal as an AI Agent is to parse the technical implementation plan (`plan.md`) and the functional specification, then break them down into a highly actionable, sequential task list (`tasks.md`). You must strictly enforce the **Gamasa Properties V1** Database-First development sequence.

## 📥 Execution Flow

### Step 1: Context Processing
Load and analyze:
1. `.specify/memory/constitution.md`
2. `specs/[feature-name].md`
3. `plan.md`

### Step 2: Gamasa Implementation Order (CRITICAL)
Tasks MUST be ordered to respect the "Database is the Source of Truth" architecture. Ensure the execution order follows this strict sequence for every feature:
1. **DB Schema:** Tables, Enums, and Columns migrations.
2. **DB Guards & Logic:** PostgreSQL Constraints (e.g., `EXCLUDE USING gist` for overlaps), Triggers (e.g., `validate_booking_transition`), and RPCs.
3. **DB Security:** Row Level Security (RLS) policies implementation.
4. **Backend Services:** Next.js Server Actions or API routes (these must be planned to call the DB RPCs, avoiding direct DB state updates).
5. **Frontend (Server):** Server Components for robust data fetching.
6. **Frontend (Client):** Client Components (`'use client'`) for interactivity, forms, and Toast UI.

### Step 3: Task Breakdown Rules
When generating `tasks.md`, adhere to these formatting rules:
*   **Group by User Story:** Create a new phase/section for each user story or core technical milestone.
*   **Test-Driven Development (TDD):** Structure tasks so that writing the tests (Unit/Integration) precedes the actual implementation.
*   **Parallel Execution:** Mark independent tasks that can be executed concurrently with `[P]`.
*   **Precise File Paths:** Specify the exact file path for each task (e.g., `supabase/migrations/XXXXXXXX_feature.sql` or `src/app/api/route.ts`).
*   **Granularity:** Ensure each task is small, verifiable, and clearly defined.

### Step 4: Write to File
Generate the detailed task list and write it to `tasks.md` in the current working directory.

## 📤 Output Generation
After successfully writing `tasks.md`, output the following summary to the user:

```markdown
### 📝 Task Breakdown Generated

*   **File Created:** `tasks.md` has been successfully generated.
*   **Total Tasks:** [Number of tasks]
*   **Architecture Aligned:** Enforced Gamasa DB-First structure (Migrations -> RPCs/Triggers -> RLS -> Services -> UI).
*   **Next Step:** Run `/speckit.analyze` to perform a final consistency check, or proceed directly to `/speckit.implement` to start coding.

### 💡 كيف ومتى تستخدم هذا الملف؟
* **متى تستخدمه؟** بعد أن تقوم بإنشاء الخطة التقنية باستخدام أمر `/speckit.plan` [2].
* **كيف يعمل؟** سيقرأ الـ AI Agent هذا الموجه ويقوم بإنشاء ملف `tasks.md` يُقسم المشروع إلى خطوات صغيرة. الميزة الأهم هنا هي أنه **لن يقترح أبداً** بناء واجهة المستخدم قبل بناء قاعدة البيانات وقواعد الحماية (Guards) الخاصة بها، وهو ما يتوافق تماماً مع قواعد تحديث الوثائق والبناء في مشروع جمصة [38، 168].
* **الخطوة التالية:** بمجرد إنشاء المهام، يُنصح بتشغيل `/speckit.analyze` للتأكد من عدم وجود ثغرات، ثم بدء التكويد الفعلي عبر `/speckit.implement` [23، 39].
* **مكان الحفظ:** احفظ هذا الكود في ملف باسم `speckit.tasks.md` داخل مجلد `.agent/workflows/`.
