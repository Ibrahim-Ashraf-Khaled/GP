# 📚 Gamasa Properties — Docs

> **قاعدة ذهبية:** أي تغيير في حالات الحجز يبدأ من `SOURCE-OF-TRUTH.pdf` + `architecture/state-machine.pdf`
> ثم يُترجم إلى DB → Backend → UI بالترتيب.

---

## 🗂 هيكل المجلدات

```
docs/
├── SOURCE-OF-TRUTH.pdf          ← المرجع الحاكم عند أي تعارض
│
├── architecture/                ← بنية النظام والتدفق
│   ├── booking-architecture-v1.md
│   ├── booking-system-overview.md
│   ├── master-plan.md
│   ├── routes-map.md
│   ├── state-machine.pdf        ← ★ ابدأ من هنا لأي تغيير في الحجز
│   ├── flow-diagram.pdf
│   ├── route-table.pdf
│   └── event-driven-architecture.pdf
│
├── security/                    ← RLS، Auth، صلاحيات
│   ├── security-foundation-v1.md
│   └── rls-security-flow.pdf
│
├── db/                          ← Schema، State Machine → DB، Business Rules
│   ├── schema-and-state-machine.md   ← تحويل State Machine إلى SQL/Supabase
│   ├── database-flow.pdf
│   └── business-rules.pdf
│
├── ops/                         ← CI/CD، Infrastructure، Monitoring، Production
│   ├── ci-cd-and-secrets-v1.md
│   ├── infrastructure-audit-v1.md
│   ├── monitoring-alerting.md
│   └── production-readiness.md
│
├── decisions/                   ← ADRs، تحليلات تقنية، مقارنات
│   ├── unified-analysis.md      ← أشمل تحليل — ابدأ منه
│   ├── technical-analysis.md
│   ├── comparison-analysis.md
│   ├── architectural-analysis-report.md
│   └── decision-matrix.pdf
│
├── runbooks/                    ← خطط تنفيذ، AI Prompts، Edge Cases
│   ├── daily-execution-plan.md
│   ├── tasks-actionable.md
│   ├── cursor-ai-prompts-sequence.md
│   ├── ai-agent-prompts.md
│   ├── edge-case-scenarios.pdf
│   └── readme-flow-section.pdf
│
└── templates/
    ├── PR_CHECKLIST.md
    └── BUG_REPORT.md
```

---

## ⭐ Source of Truth — ترتيب الحسم عند التعارض

| الأولوية | الملف |
|---------|-------|
| 1 | `SOURCE-OF-TRUTH.pdf` |
| 2 | `architecture/state-machine.pdf` |
| 3 | `db/business-rules.pdf` |
| 4 | `db/schema-and-state-machine.md` |
| 5 | `architecture/flow-diagram.pdf` |
| 6 | `decisions/unified-analysis.md` |

---

## 🚀 How to Run — للعضو الجديد (15 دقيقة)

### 1. افهم المنتج
```
SOURCE-OF-TRUTH.pdf  →  architecture/state-machine.pdf  →  architecture/booking-system-overview.md
```

### 2. افهم قاعدة البيانات
```
db/schema-and-state-machine.md  →  db/business-rules.pdf  →  security/rls-security-flow.pdf
```

### 3. افهم البنية التقنية
```
architecture/booking-architecture-v1.md  →  architecture/master-plan.md  →  decisions/unified-analysis.md
```

### 4. ابدأ التنفيذ
```
runbooks/daily-execution-plan.md  →  runbooks/tasks-actionable.md  →  runbooks/cursor-ai-prompts-sequence.md
```

### 5. قبل أي PR
```
templates/PR_CHECKLIST.md
```

---

## 🔄 قواعد تحديث الوثائق

أي تغيير في منطق الحجز أو الحالات **يستوجب تحديث** بهذا الترتيب:

1. `architecture/state-machine.pdf` (أو توثيق التغيير في `decisions/`)
2. `db/schema-and-state-machine.md` (DB Constraints + RLS)
3. Backend/Services
4. UI + Guards

---

## 📝 Templates

- **PR جديد:** `templates/PR_CHECKLIST.md`
- **Bug report:** `templates/BUG_REPORT.md`
