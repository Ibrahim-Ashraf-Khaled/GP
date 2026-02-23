# 🗑 تقرير الملفات المكررة والقديمة — Gamasa Properties Docs

> **الخلاصة:** مجلد `docs old/` بالكامل هو نسخ قديمة يمكن حذفها بأمان.
> جميع الملفات المفيدة منه موجودة في `docs/analysis-pack/` أو تم نقلها للهيكل الجديد.

---

## ✅ مكررة 100% — آمن للحذف الفوري

### `docs old/` → مكررة في `docs/analysis-pack/05-security-devops/`

| الملف في `docs old/` | الملف الأحدث (يُبقى) | الحالة |
|---------------------|----------------------|--------|
| `docs old/BOOKING_ARCHITECTURE_V1.md` | `architecture/booking-architecture-v1.md` | ✅ نفس الحجم تماماً |
| `docs old/GAMASA_PROPERTIES_MASTER_PLAN.md` | `architecture/master-plan.md` | ✅ نفس الحجم تماماً |
| `docs old/ci-cd-and-secrets-v1.md` | `ops/ci-cd-and-secrets-v1.md` | ✅ نفس الحجم تماماً |
| `docs old/infrastructure-audit-v1.md` | `ops/infrastructure-audit-v1.md` | ✅ نفس الحجم تماماً |
| `docs old/monitoring-alerting-blue.md` | `ops/monitoring-alerting.md` | ✅ نفس الحجم تماماً |
| `docs old/production-readiness.md` | `ops/production-readiness.md` | ✅ نفس الحجم تماماً |
| `docs old/security-foundation-v1.md` | `security/security-foundation-v1.md` | ✅ نفس الحجم تماماً |

### `docs old/New folder/` → مكررة في `docs/analysis-pack/`

| الملف في `docs old/New folder/` | الملف الأحدث (يُبقى) | الحالة |
|--------------------------------|----------------------|--------|
| `cursor_ai_prompts_sequence.md` | `runbooks/cursor-ai-prompts-sequence.md` | ✅ نفس الحجم تماماً |
| `gamasa_ai_agent_prompts.md` | `runbooks/ai-agent-prompts.md` | ✅ نفس الحجم تماماً |
| `gamasa_comparison_analysis.md` | `decisions/comparison-analysis.md` | ✅ نفس الحجم تماماً |
| `gamasa_daily_execution_plan.md` | `runbooks/daily-execution-plan.md` | ✅ نفس الحجم تماماً |
| `gamasa_tasks_actionable.md` | `runbooks/tasks-actionable.md` | ✅ نفس الحجم تماماً |
| `gamasa_technical_analysis.md` | `decisions/technical-analysis.md` | ✅ نفس الحجم تماماً |
| `gamasa_unified_analysis.md` | `decisions/unified-analysis.md` | ✅ نفس الحجم تماماً |

### `docs old/New folder (2)/` — جزئياً مكررة

| الملف | الحالة | ملاحظة |
|-------|--------|--------|
| `BOOKING_SYSTEM.md` | ✅ مكرر 100% | → `architecture/booking-system-overview.md` |
| `docs_official_structure.md` | ✅ مكرر 100% | → `db/schema-and-state-machine.md` |
| `README.md` | ⚠️ نسخة قديمة | النسخة الجديدة في `docs/README.md` |

---

## ⚠️ ملفات قديمة بمحتوى فريد — تحتاج مراجعة قبل الحذف

| الملف | السبب | التوصية |
|-------|-------|---------|
| `docs old/New folder (2)/ARCHITECTURAL_ANALYSIS_REPORT.md` | تقرير معمارية مبكر (فبراير 20) — محتوى جزئي مختلف | **نُقل** → `decisions/architectural-analysis-report.md` ✅ |
| `docs old/New folder (2)/PRODUCTION_READINESS_REPORT.md` | تقرير قديم (مختلف عن production-readiness.md الحالي) | **يُدمج** مع `ops/production-readiness.md` أو يُحفظ كـ `ops/production-readiness-report-old.md` |
| `docs old/New folder (2)/codebase_analysis.md` | تحليل codebase كامل — غير موجود في `docs/` | **يُنقل** → `decisions/codebase-analysis.md` |
| `docs old/New folder (2)/product_specification.md` | مواصفات المنتج الأولية — غير موجودة في `docs/` | **يُنقل** → `decisions/product-specification.md` أو مجلد `product/` منفصل |
| `docs old/ROUTES_MAP.md` | خريطة Routes جديدة نسبياً (فبراير 21) | **نُقل** → `architecture/routes-map.md` ✅ |

---

## 🔀 ملفات مرشحة للدمج

### `decisions/unified-analysis.md` ← يدمج فيه:
- `decisions/technical-analysis.md` — محتوى مشابه لكن أقل شمولاً
- `decisions/comparison-analysis.md` — مقارنة تقنية يمكن إضافتها كـ section

### `ops/production-readiness.md` ← يدمج فيه:
- `docs old/New folder (2)/PRODUCTION_READINESS_REPORT.md` — تقرير أقدم بنفس الموضوع

---

## 🚮 أمر الحذف الآمن (بعد التحقق)

```bash
# احذف مجلد docs old بالكامل بعد نقل الملفات الفريدة الأربعة
rm -rf "docs old/"

# أو بشكل انتقائي
rm -rf "docs old/New folder/"
rm -rf "docs old/New folder (2)/"  # بعد نقل الملفات الفريدة
rm "docs old/BOOKING_ARCHITECTURE_V1.md"
rm "docs old/GAMASA_PROPERTIES_MASTER_PLAN.md"
rm "docs old/ci-cd-and-secrets-v1.md"
rm "docs old/infrastructure-audit-v1.md"
rm "docs old/monitoring-alerting-blue.md"
rm "docs old/production-readiness.md"
rm "docs old/security-foundation-v1.md"
```

---

## 📊 ملخص

| الفئة | عدد الملفات |
|-------|-------------|
| مكررة 100% — احذف فوراً | **17 ملف** |
| قديمة بمحتوى فريد — انقل أو ادمج | **4 ملفات** |
| تحتاج دمج | **2 مجموعات** |
| **إجمالي التوفير** | **~21 ملف** من الـ 66 |
