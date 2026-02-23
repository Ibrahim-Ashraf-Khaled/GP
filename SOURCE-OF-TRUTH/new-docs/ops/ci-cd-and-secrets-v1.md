# 🚀 DevOps – CI/CD & Secrets (V1)
**Project:** Gamasa Properties (عقارات جمصة)  
**Doc Path:** `docs/devops/ci-cd-and-secrets-v1.md`  
**Version:** V1  
**Last Updated:** 20 Feb 2026  
**Status:** Draft → Ready for Implementation

---

## 0) لماذا هذا المستند؟
الخطط الحالية توضح **"ماذا"** سنبني (features + booking rules)، لكن هذا المستند يحدد **"كيف"** سنشغّل النظام بشكل آمن ومستقر:

- CI: فحوصات تلقائية (Quality + Security + DB invariants) على كل PR.
- CD: نشر (Preview/Production) مُقنن ببوابات (Gates) + حماية من نشر Mock/Secrets.
- Secrets: سياسة تخزين/تدوير مفاتيح Supabase ومتغيرات البيئة بدون تعريضها للكود أو للعميل.

> **قاعدة ذهبية:** أي Release بدون Gates = احتمال عالي لنشر Mock Mode أو كسر قواعد الأمان/الحجز.

---

## 1) مبادئ إلزامية (Non‑Negotiables)

### 1.1 منع تشغيل الإنتاج على Mock
- أي Build في Production **يجب أن يفشل فوراً** إذا كان `IS_MOCK_MODE=true`.
- تنفيذ ذلك عبر **Env Gate** يتم تحميله مبكراً في التطبيق (مثلاً import في `layout.tsx`).

✅ هذا الشرط جزء من جاهزية الإنتاج، ويعتبر **Release Blocker**.  
(انظر ملف: production readiness)

### 1.2 لا أسرار داخل الكود أو داخل المتصفح
- ممنوع تخزين `password` أو `access_token` أو `refresh_token` في `localStorage` أو أي تخزين عميل.
- **مفتاح Service Role** ممنوع أن يصل للـ Client بأي شكل (لا `NEXT_PUBLIC_*` ولا bundling).

### 1.3 قاعدة البيانات هي الـ Source of Truth للحجز
- حالات الحجز، ومنع التداخل، وحماية الانتقالات، يجب أن تكون **محكومة على مستوى DB** (Triggers/Constraints/RLS).
- CI لازم يختبر وجود هذه الضمانات (على الأقل كـ invariants checks).

---

## 2) البيئات (Environments) واستراتيجية الفروع (Branching)

### 2.1 البيئات
| بيئة | الهدف | بيانات Supabase | نشر |
|---|---|---|---|
| **Local** | تطوير | Local Supabase أو مشروع Dev | `npm run dev` |
| **Preview** | تجربة PR | مشروع Supabase Staging/Preview | Deploy تلقائي لكل PR |
| **Production** | مستخدمين فعليين | مشروع Supabase Prod منفصل | Deploy على `main`/Release tag |

> **مهم:** لا تستخدم مشروع Supabase واحد لكل البيئات. فصل البيئات يقلل مخاطر خلط البيانات/المفاتيح.

### 2.2 الفروع
- `main`: خط الإنتاج (Production line)
- `develop` (اختياري): تجميع قبل الإنتاج
- `feature/*`: تطوير ميزات
- `hotfix/*`: إصلاحات عاجلة

**قواعد حماية (Branch Protection) مقترحة:**
- منع الـ push المباشر إلى `main`.
- Require PR + 1–2 approvals.
- Require status checks: `lint`, `typecheck`, `test`, `build`, `security`.

---

## 3) CI Pipeline (GitHub Actions) – ماذا يحدث في كل PR؟

### 3.1 أهداف CI
1) منع إدخال أخطاء TypeScript/ESLint/Build  
2) منع إدخال ثغرات (Dependencies / Secrets / SAST)  
3) منع كسر قواعد النظام الجوهرية (DB invariants & security)  
4) إنتاج Artifact قابل للنشر (Preview) بدون أسرار

### 3.2 مراحل CI (Recommended Jobs)

#### A) Quality Gate (Mandatory)
- Install (locked): `npm ci`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck` (أو `tsc -p . --noEmit`)
- Unit tests: `npm test` (إن وُجدت)

#### B) Build Gate (Mandatory)
- `npm run build`
- (اختياري) `npm run start` smoke test (server boots)

#### C) Security Gate (Mandatory minimum)
- Dependency audit:
  - `npm audit --audit-level=high` (أو بديل مضبوط)
- Secret scan:
  - gitleaks (أو GitHub Advanced Security لو متاح)
- SAST:
  - CodeQL (JS/TS) أو ESLint security rules

> **ملاحظة:** لا تجعل أدوات السكيورتي “اختيارية” على `main`. الأفضل: Fail on High/Critical.

#### D) DB Invariants Gate (Highly Recommended)
تشغّل Supabase محلياً داخل CI (Docker) ثم:
- Apply migrations (schema + triggers + policies)
- Run invariant checks:

**أمثلة invariants:**
- RLS enabled على الجداول الحساسة
- وجود triggers: `validate_booking_transition`
- وجود constraint يمنع overlap للحجوزات `confirmed/active`
- عدم وجود أي عمود/جدول يخزن Availability (Derived only)

> الهدف ليس اختبار كل شيء الآن، بل منع Regression قاتل قبل دمجه.

---

## 4) CD Pipeline – النشر (Preview + Production)

### 4.1 Preview Deploy (PR)
**الهدف:** أي PR له Preview URL لاختبار UI + flows بسرعة.

**أفضل خيار (بساطة/أمان):**
- استخدم منصة الاستضافة (مثل Vercel) عبر Git Integration:
  - PR → Preview Deploy تلقائي
  - `main` → Production Deploy

**فوائد:**
- لا تحتاج تخزين Vercel tokens في GitHub secrets
- إدارة env vars تتم داخل منصة الاستضافة بسهولة

### 4.2 Production Deploy (main / releases)
**اقتراح عملي:**
- Production Deploy يتم فقط عند:
  - Merge إلى `main` + كل status checks PASS
  - (اختياري) إنشاء Tag `vX.Y.Z` لتثبيت release

**مهم جداً:**
- Production Deploy يجب أن يمر على:
  - Env Gate (يفشل لو env ناقصة أو Mock true)
  - Security checks
  - Manual approval (GitHub Environments) لو الفريق كبير أو فيه أموال

### 4.3 DB Migrations في CD (Staging → Prod)
**قاعدة:** لا تنشر تطبيق جديد على Production قبل تطبيق migrations المطلوبة على قاعدة البيانات.

**نموذج عمل مقترح:**
1) Apply migrations على **Preview/Staging DB** أولاً
2) Run DB invariants tests على staging
3) Apply migrations على **Production DB** (مع Approval)
4) Deploy app على production

> تنفيذ migrations يمكن يكون:
> - Manual controlled (SQL migration checklist) في البداية
> - أو Automation لاحقاً عبر Supabase CLI + GitHub environment protections

---

## 5) Secrets Management – السياسة الرسمية (V1)

### 5.1 تصنيف المتغيرات
#### A) Public (مسموح في العميل)
تكون فقط بأسماء `NEXT_PUBLIC_*` وبدون أي صلاحيات حساسة:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(مفتاح عمومي – أمانه يعتمد على RLS)*
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_IS_MOCK_MODE` *(يجب أن يكون false في Production)*

#### B) Secret (Server‑Only)
بدون `NEXT_PUBLIC_`، وممنوع ظهورها في الـ client bundle:
- `SUPABASE_SERVICE_ROLE_KEY` *(حرج جداً)*
- أي مفاتيح Webhooks / Payment verification / Admin tokens
- `SENTRY_AUTH_TOKEN` (لو استخدمته لرفع sourcemaps)
- مفاتيح SMTP (لو تم إضافة email later)

> **قاعدة:** أي شيء يسمح بقراءة/كتابة غير مقيدة على DB = Secret.

### 5.2 أين نخزن الأسرار؟
- **Local:** `.env.local` (ضمن `.gitignore`)
- **CI (GitHub Actions):** GitHub Secrets + GitHub Environments (production requires reviewers)
- **Deployment Platform:** Environment Variables/Secrets لكل بيئة (Preview/Production)
- **Supabase Edge Functions:** استخدم Secret Store الخاص بها (ولا تضع secrets في كود function)

### 5.3 منع تسريب الأسرار (Controls)
- تأكد أن `.env*` (عدا `.env.example`) في `.gitignore`.
- استخدم secret scanning (gitleaks/GitHub secret scanning).
- امنع طباعة env values في logs (خاصة server logs).
- اجعل PR checks تمنع merge لو ظهر secret pattern.

---

## 6) تدوير مفاتيح Supabase (Key Rotation) – Playbook

> الهدف: تدوير المفاتيح بدون downtime وبأقل مخاطرة.

### 6.1 متى ندوّر؟
- دوريًا: كل 90 يوم (اقتراح)
- فوراً عند:
  - تسريب محتمل (commit، log، screenshot)
  - فقدان جهاز Dev عليه secrets
  - خروج عضو من الفريق كان يمتلك صلاحية Production secrets

### 6.2 ما الذي يجب تدويره؟
حسب حساسيته:
1) **Service Role key** (أعلى أولوية)
2) أي مفاتيح Webhooks/Integrations
3) مفاتيح SMTP/Email
4) (عند الضرورة) مفاتيح/إعدادات JWT / API keys حسب منصة Supabase

### 6.3 خطوات عملية (Runbook مختصر)
1) **Freeze deploys** مؤقتاً (أو approval فقط)
2) تدوير المفتاح من Supabase Dashboard
3) تحديث Secrets في:
   - Production env
   - Preview env
   - GitHub Actions secrets (إن وجدت)
4) Redeploy preview + production
5) Smoke tests:
   - Auth
   - Booking create/transition
   - Admin actions
   - Cron jobs (لو موجودة)
6) مراقبة Logs/Alerts لمدة 30–60 دقيقة
7) Post‑rotation note في CHANGELOG + incident log (حتى لو ليس incident)

### 6.4 قواعد حماية إضافية
- لا تعطي Service Role key لأي شخص بشكل مباشر. استخدم 1Password/Bitwarden/Secrets manager.
- اجعل الوصول Production secrets فقط لعدد محدود (Owners).

---

## 7) أتمتة النظام (Cron / Edge Functions) – كيف تدخل في DevOps؟
النظام يحتاج Automations (مثل auto-expire / auto-complete) تعمل بصلاحية service role.

**قواعد:**
- كود الـ cron/edge يجب أن يكون Server‑only.
- يستعمل `SUPABASE_SERVICE_ROLE_KEY` فقط من بيئة آمنة.
- يمنع تشغيل هذه الوظائف على Preview إن كانت ستؤثر على بيانات حقيقية (أو شغّلها على Staging فقط).

> لاحقاً: أضف job monitoring + alerting (فشل cron = مشكلة مالية/تشغيلية).

---

## 8) Definition of Done (DoD) – متى نقول DevOps جاهز؟
### CI (Required)
- [ ] PR لا يندمج بدون: lint + typecheck + tests + build
- [ ] Secret scanning شغال ويفشل على secrets
- [ ] Security audit baseline موجود (على الأقل High/Critical)
- [ ] (مستحسن) DB invariants checks شغال محلياً في CI

### CD (Required)
- [ ] Preview deployments لكل PR
- [ ] Production deploy guarded: approvals + status checks
- [ ] Env Gate مفعل: build يفشل لو env ناقصة أو Mock true

### Secrets (Required)
- [ ] كل secrets موجودة فقط في Secret Stores (لا repo)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` غير موجود بأي `NEXT_PUBLIC_*`
- [ ] Playbook تدوير المفاتيح موجود ومجرّب مرة واحدة على Staging

---

## 9) Appendix – نماذج جاهزة

### 9.1 Example: `.github/workflows/ci.yml`
> هذا نموذج مبسط. عدّله حسب سكربتات المشروع الفعلية.

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Test
        run: npm test --if-present

      - name: Build
        run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: Dependency Audit (high+)
        run: npm audit --audit-level=high

      # gitleaks example (optional)
      # - name: Secret Scan (gitleaks)
      #   uses: gitleaks/gitleaks-action@v2
      #   env:
      #     GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 9.2 Example: `src/lib/env.ts` (Env Gate) – مقتبس من خطة Production Readiness
```ts
const requiredPublic = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
] as const;

for (const key of requiredPublic) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
}

export const ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
  IS_MOCK: process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true',
  NODE_ENV: process.env.NODE_ENV,
} as const;

if (ENV.NODE_ENV === 'production' && ENV.IS_MOCK) {
  throw new Error('Production build cannot run with IS_MOCK_MODE=true');
}
```

### 9.3 Example: DB Invariants Check (SQL فكرة مبدئية)
> يمكن تشغيلها على local supabase في CI.

```sql
-- 1) RLS enabled (example)
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('bookings','payments','properties','profiles');

-- 2) Trigger exists (example)
SELECT tgname
FROM pg_trigger
WHERE tgname IN ('booking_state_guard','audit_booking_status_change');

-- 3) No public availability storage (example)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'properties' AND column_name ILIKE '%avail%';
```

---
