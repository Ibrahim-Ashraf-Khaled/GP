# 🚀 جاهزية الإنتاج (Production Readiness)

**المشروع:** عقارات جمصة (Gamasa Properties)  
**المستودع:** `gamasa-properties`  
**آخر تحديث:** 20 فبراير 2026  
**الحالة العامة:** ⚠️ غير جاهز للإنتاج (حالياً)

---

## 🎯 نطاق الوثيقة

هذه الوثيقة تحدد **متطلبات التشغيل قبل إطلاق Production**، وتركّز على 3 محاور حرجة:

1) **إدارة البيئة (Environment Management)**  
2) **المراقبة والسجلات (Monitoring & Logging)**  
3) **معالجة الأخطاء في الواجهة (Error Boundaries & UX)**

> **خارج النطاق (حالياً):** تحسينات الأداء المتقدمة، التحمل تحت الضغط (Load Testing)، وإجراءات أمنية تشغيلية موسعة (سيتم تغطيتها ضمن Phase C).

---

## 📌 ملخص تنفيذي (Executive Summary)

- النظام يعمل حالياً في **الوضع التجريبي** (`IS_MOCK_MODE = true`) حسب وثائق نظام الحجز.  
- لا يوجد نظام موحد لتسجيل الأخطاء أو مراقبة الأداء (Observability) بشكل يسمح بالتشخيص في الإنتاج.
- واجهة المستخدم تفتقر إلى **Error Boundaries** وصفحات أخطاء قياسية (App Router) تمنع تجربة “شاشة بيضاء” أو أخطاء تقنية للمستخدم النهائي.

✅ **التوصية:** لا يتم أي إطلاق Production قبل إغلاق Phase A بالكامل.

---

# 1) إدارة البيئة (Environment Management)

## 🔍 الحالة الحالية

- نظام الحجز موثق أنه يعمل في وضع Mock:  
  - “جميع الوظائف تعمل في `IS_MOCK_MODE = true` بدون الحاجة لقاعدة بيانات.”  
  - “عند الجاهزية، قم بتغيير `IS_MOCK_MODE` إلى `false`.”

> هذا مناسب للتجربة والتطوير السريع، لكنه **غير مقبول إطلاقاً** في الإنتاج.

## ⚠️ المخاطر

- **خطر إطلاق Production على بيانات وهمية** (Mock) → قرارات/حجوزات/دفعات غير حقيقية.
- **خطر تعطل الإنتاج بسبب نقص env vars** بدون تحذير مبكر → أخطاء تظهر للمستخدمين بدل التطوير.
- **خطر سوء فصل البيئات** (dev vs prod) → اختلاط بيانات أو مفاتيح أو إعدادات.

## ✅ معايير الجاهزية للإنتاج

قبل Production يجب تحقيق التالي:

- فصل واضح للبيئات (Development / Preview / Production).
- `IS_MOCK_MODE` يجب أن يكون **false** على Production.
- وجود بوابة تحقق (Env Gate) تمنع تشغيل التطبيق إذا نقص متغير بيئة أساسي.

## 🧩 تصميم مقترح لإدارة البيئة

### ملفات البيئة

- `.env.example` ✅ (نموذج بدون قيم حقيقية)
- `.env.local` ✅ (تطوير محلي فقط – في `.gitignore`)
- متغيرات Production يتم ضبطها داخل منصة الاستضافة (Vercel/…)

### `.env.example` المقترح

```env
NEXT_PUBLIC_IS_MOCK_MODE=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ملاحظة: `SUPABASE_ANON_KEY` يُعد “مفتاح عمومي” للاستخدام من العميل، لكن الأمان يعتمد أساساً على **RLS** داخل Supabase.

---

# 2) المراقبة والسجلات (Monitoring & Logging)

## 🔍 الحالة الحالية

- لا توجد منظومة Observability واضحة (Error tracking + performance + structured logs).
- الاعتماد على `console.*` وحده لا يكفي في الإنتاج ولا يحقق:
  - تتبع الأخطاء مع السياق
  - التنبيهات (Alerts)
  - المقاييس (Metrics)

## ⚠️ المخاطر

- أخطاء الإنتاج تصبح “غير مرئية” للفريق.
- صعوبة تشخيص مشاكل الدفع/الحجز أو التقطعات.
- انعدام القدرة على قياس الأداء أو تحديد نقاط البطء.

## ✅ معايير الجاهزية للإنتاج (الحد الأدنى)

- Error Tracking (مثل Sentry) على **Client + Server**.
- Structured Logging موحد بمستويات (`info/warn/error`) + Context.
- القدرة على ربط أحداث حجز واحدة عبر `correlationId`.

---

# 3) معالجة الأخطاء (Error Boundaries & UX)

## 🔍 الحالة الحالية

- لا توجد صفحات أخطاء قياسية ضمن Next.js App Router.
- لا يوجد نمط UI موحد للأخطاء (رسائل + زر إعادة المحاولة).

## ⚠️ المخاطر

- تجربة سيئة للمستخدم (white screen / رسائل تقنية).
- صعوبة عودة المستخدم لمسار طبيعي (لا “Retry”).
- تفاوت التعامل مع الأخطاء داخل الصفحات.

## ✅ معايير الجاهزية للإنتاج

- وجود:
  - `src/app/error.tsx`
  - `src/app/not-found.tsx`
  - (اختياري متقدم) `src/app/global-error.tsx`
- توحيد عرض الأخطاء للمستخدم برسائل عربية واضحة + CTA.
- (Phase B) استبدال `alert()` بنظام Toast موحد.

---

# 🧭 خطة التنفيذ (Three-Phase Plan)

## Phase A — فوري (قبل أي إطلاق)

> الهدف: **منع إطلاق Production على Mock/Env ناقص** + **منع تجربة أخطاء كارثية للمستخدم**.

### ✅ مهام Phase A

#### A1) إغلاق Mock Mode في Production (Blocking Release)

- اجعل `NEXT_PUBLIC_IS_MOCK_MODE=false` كافتراضي في `.env.example`.
- منع تشغيل التطبيق على Production إذا كان Mock:
  - Fail Fast عند الإقلاع.

#### A2) Env Gate إلزامي

إنشاء ملف: `src/lib/env.ts`

```ts
// src/lib/env.ts
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

واستدعاؤه مبكراً (مثلاً في `src/app/layout.tsx`):

```ts
import '@/lib/env';
```

#### A3) صفحات أخطاء أساسية (App Router)

**1) `src/app/error.tsx`**

```tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="text-sm text-gray-500">
          حاول مرة أخرى. إذا تكرر الخطأ، تواصل معنا.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-black text-white"
          >
            إعادة المحاولة
          </button>
          <a href="/" className="px-4 py-2 rounded-md border">
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
```

**2) `src/app/not-found.tsx`**

```tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="text-sm text-gray-500">
          الرابط غير صحيح أو تم نقل الصفحة.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 rounded-md bg-black text-white"
        >
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}
```

### ✅ Definition of Done (Phase A)

- [ ] Production build يفشل فوراً إذا:
  - [ ] متغيرات env ناقصة
  - [ ] `IS_MOCK_MODE=true`
- [ ] `.env.example` آمن و `IS_MOCK_MODE=false` افتراضي
- [ ] `error.tsx` يعمل ويعرض زر “إعادة المحاولة”
- [ ] `not-found.tsx` يعمل ويعرض 404 عربية

---

## Phase B — خلال أسبوع

> الهدف: **رؤية أخطاء الإنتاج فوراً** + **توحيد التسجيل والسياق** + **تحسين UX للأخطاء**.

### ✅ مهام Phase B

#### B1) دمج Sentry (Client + Server)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

- ضبط متغيرات الإنتاج داخل منصة الاستضافة:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - (اختياري) `SENTRY_ENVIRONMENT=production`

#### B2) Logger موحد (Structured Logging)

إنشاء: `src/lib/logger.ts`:
- مستويات: `info | warn | error`
- Context إلزامي في المسارات الحساسة:
  - `userId`, `bookingId`, `propertyId`, `state`, `paymentMethod`, `correlationId`
- في الإنتاج: إرسال الأخطاء لـ Sentry (أو endpoint داخلي لاحقاً)

#### B3) توحيد أخطاء الواجهة (إلغاء alert)

- استبدال `alert()` بـ Toast UI موحد
- إضافة مكون خطأ متكرر الاستخدام (InlineError) يحتوي:
  - رسالة
  - زر Retry
  - رابط للعودة

#### B4) Correlation ID لمسار الحجز

- إنشاء `correlationId` لكل عملية حجز
- تمريره ضمن logs + Sentry breadcrumbs لتجميع أحداث العملية

### ✅ Definition of Done (Phase B)

- [ ] Sentry شغال على Client + Server
- [ ] أخطاء الخدمات الأساسية تستخدم logger موحد بدل `console.error`
- [ ] مسارات الحجز/الدفع تعرض أخطاء UI موحدة (بدون alert)
- [ ] يمكن تتبع عملية حجز كاملة عبر `correlationId`

---

## Phase C — لاحق (تحسينات تشغيلية متقدمة)

> الهدف: **Reliability + Observability متقدم** + **تنبيهات ولوحات** + **تحمل ضغط**.

### ✅ مهام Phase C

- Dashboards + Alerts (Spike errors / latency / فشل دفع / stuck states)
- Tracing End-to-End (Sentry Performance أو OpenTelemetry)
- Business KPIs:
  - conversion funnel (view → request → confirmed → active)
  - failure rates (payments / conflicts)
  - time-to-confirm / time-to-activate
- DB Observability + Audit Log رسمي لانتقالات الحالات
- Runbooks + Incident template + SLOs
- Load/Chaos Testing للحجز المتزامن ومنع overlap

### ✅ Definition of Done (Phase C)

- [ ] Alerts فعالة تصل للفريق عند تجاوز thresholds
- [ ] Trace كامل لعملية الحجز عبر الطبقات
- [ ] لوحة KPIs للأعمال + anomaly alerts
- [ ] Runbooks جاهزة + تمرين Incident واحد على الأقل
- [ ] تقرير Load Test + Baselines

---

# ✅ Checklist إطلاق الإنتاج (Go / No-Go)

> **قرار الإطلاق:** إذا فشل أي بند “حرج” → **No-Go**.

## حرِج (Blocking)
- [ ] Phase A مكتملة 100%
- [ ] Mock Mode مقفول في Production
- [ ] Env Gate يمنع التشغيل عند نقص env
- [ ] صفحات `error.tsx` و `not-found.tsx` موجودة وتعمل

## عالي الأهمية (قبل Scale)
- [ ] Sentry مدمج (Phase B)
- [ ] Logger موحد في الخدمات الحرجة
- [ ] أخطاء الحجز/الدفع تظهر للمستخدم بشكل واضح + Retry

## تحسينات لاحقة
- [ ] Dashboards/Alerts متقدمة (Phase C)
- [ ] Load Testing

---

## 📎 ملاحظات تنفيذية (Notes)

- لا تعتمد على “التطوير يعمل” كدليل جاهزية إنتاج.
- Fail Fast (Env Gate) يوفر ساعات تشخيص أثناء الإطلاق.
- أي منطق حجز/دفع بدون Observability سيؤدي إلى نزاعات تشغيلية.

