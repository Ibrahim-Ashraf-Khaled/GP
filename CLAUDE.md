# Gamasa Properties — Development Guidelines

## 🔴 SOURCE OF TRUTH — اقرأ الأول قبل أي حاجة

**عند أي تعارض أو شك، الترتيب الحاكم:**

| الأولوية | الملف |
|---------|-------|
| 1 | `docs/SOURCE-OF-TRUTH.pdf` |
| 2 | `docs/architecture/state-machine.pdf` |
| 3 | `docs/db/business-rules.pdf` |
| 4 | `docs/db/schema-and-state-machine.md` |
| 5 | `docs/architecture/flow-diagram.pdf` |
| 6 | `docs/decisions/unified-analysis.md` |

---

## 📚 Project Documentation (docs/)

### Architecture
- `docs/architecture/booking-architecture-v1.md` — بنية نظام الحجز
- `docs/architecture/booking-system-overview.md` — نظرة عامة
- `docs/architecture/master-plan.md` — الخطة الرئيسية
- `docs/architecture/routes-map.md` — خريطة الـ routes
- `docs/architecture/state-machine.pdf` ← **★ ابدأ من هنا لأي تغيير في الحجز**
- `docs/architecture/flow-diagram.pdf` — تدفق النظام
- `docs/architecture/route-table.pdf` — جدول الـ routes
- `docs/architecture/event-driven-architecture.pdf` — المعمارية

### Database
- `docs/db/schema-and-state-machine.md` — Schema + State Machine → SQL/Supabase
- `docs/db/business-rules.pdf` — قواعد العمل
- `docs/db/database-flow.pdf` — تدفق قاعدة البيانات

### Security
- `docs/security/security-foundation-v1.md` — أسس الأمان
- `docs/security/rls-security-flow.pdf` — RLS Security Flow

### Operations
- `docs/ops/ci-cd-and-secrets-v1.md` — CI/CD والـ Secrets
- `docs/ops/infrastructure-audit-v1.md` — Infrastructure Audit
- `docs/ops/monitoring-alerting.md` — Monitoring والـ Alerting
- `docs/ops/production-readiness.md` — جاهزية الـ Production

### Decisions (ADRs)
- `docs/decisions/unified-analysis.md` ← **أشمل تحليل — ابدأ منه**
- `docs/decisions/technical-analysis.md`
- `docs/decisions/comparison-analysis.md`
- `docs/decisions/architectural-analysis-report.md`
- `docs/decisions/codebase-analysis.md`

### Runbooks
- `docs/runbooks/daily-execution-plan.md` — خطة التنفيذ اليومية
- `docs/runbooks/tasks-actionable.md` — Tasks قابلة للتنفيذ
- `docs/runbooks/cursor-ai-prompts-sequence.md` — تسلسل Prompts للـ AI
- `docs/runbooks/ai-agent-prompts.md` — Prompts للـ AI Agent
- `docs/runbooks/edge-case-scenarios.pdf` — Edge Cases

### Templates
- `docs/templates/PR_CHECKLIST.md` — Checklist للـ PR
- `docs/templates/BUG_REPORT.md` — تقرير Bug

---

## 🏗️ Tech Stack

- **Frontend:** Next.js / React
- **Backend:** Supabase (PostgreSQL + RLS + Auth)
- **State Management:** Event-Driven Architecture
- **Security:** Row Level Security (RLS) على كل الجداول
- **CI/CD:** راجع `docs/ops/ci-cd-and-secrets-v1.md`

---

## 📋 Spec-Kit Workflow

| الأمر | الوظيفة |
|-------|---------|
| `/speckit.constitution` | تحديث مبادئ المشروع |
| `/speckit.specify` | تعريف ما تريد بناءه |
| `/speckit.clarify` | توضيح المتطلبات الغامضة |
| `/speckit.plan` | إنشاء خطة تقنية |
| `/speckit.tasks` | تفصيل Tasks |
| `/speckit.implement` | تنفيذ التطوير |
| `/speckit.analyze` | تحليل التوافق بين الـ artifacts |
| `/speckit.checklist` | جودة المتطلبات |

---

## 🔄 قواعد أساسية

> **أي تغيير في منطق الحجز أو الحالات يستوجب:**
> 1. مراجعة `docs/architecture/state-machine.pdf`
> 2. تحديث `docs/db/schema-and-state-machine.md`
> 3. Backend/Services
> 4. UI + Guards

> **قبل أي PR:** راجع `docs/templates/PR_CHECKLIST.md`

---

## ⚙️ Speckit Config

- Constitution: `.speckit/memory/constitution.md`
- Templates: `.speckit/templates/`
- Scripts: `.speckit/scripts/powershell/`
- Workflows: `.agent/workflows/`
