# Gamasa Properties — Monitoring & Alerting Blueprint (BLUE)

**الملف:** `docs/observability/monitoring-alerting-blue.md`  
**الإصدار:** V1  
**تاريخ التحديث:** 2026-02-20  
**النطاق:** Booking + Payments + Availability + Security Signals + Ops Readiness  

> هذا المستند يحدد **خطة تنفيذ** للمراقبة والتنبيه (Observability) بشكل قابل للتطبيق في كود Next.js + Supabase، مع ربط كامل لمسار الحجز عبر `correlationId` من أول حدث (اختيار تواريخ/التوفر) حتى الإنهاء (completed / cancelled / expired / rejected).

---

## 0) مبادئ غير قابلة للتفاوض

هذه القواعد مستمدة مباشرة من مصادر الحقيقة الرسمية V1 (State Machine / Business Rules / Database Flow / EDA):

1) **Availability لا تُخزّن داخل `properties`**. التوفر دائمًا مشتق من:
   - حجوزات `confirmed + active`
   - + جدول `property_unavailability` للحظر اليدوي  
2) **آلة حالات الحجز تُفرض (DB-First / Guards)** — لا توجد تحديثات حالة “عشوائية”.
3) **العمولة تُحصّل فقط بعد `active`**.
4) **كل انتقال حالة يجب أن يُسجل في `activity_logs`** (Auditability).
5) **كل Flow لازم يكون له `correlationId`** لتجميع: Errors + Logs + DB audit + Events + Metrics.

---

## 1) الهدف من الـ Observability في Gamasa

### 1.1 ما الذي نريد رؤيته؟
- أخطاء الإنتاج بشكل فوري (Client/Server/Edge) مع سياق الحجز.
- أين تتعطل رحلة الحجز؟ (Funnel & Drop-offs)
- لماذا يفشل الدفع؟ (Spike/Regression)
- أين يوجد تأخير في التأكيد؟ (SLA & p95 latency)
- هل هناك سلوك مشبوه أو spam أو محاولات كسر الـ state machine؟

### 1.2 ما الذي لا نفعله هنا؟
- لا نقرر Vendor نهائي لكل شيء (يمكن البدء بـ Sentry + Logs على Vercel، ثم إضافة Grafana/Metabase لاحقًا).
- لا ندخل في Load Testing أو Chaos هنا (له ملف مستقل).

---

## 2) مكونات المراقبة الأساسية

### 2.1 طبقات المراقبة
**A) Error Tracking + Tracing (Sentry)**
- Client Errors (React) + unhandled rejections
- Server Errors (Route Handlers / Server Actions)
- Edge errors (middleware/edge routes)
- Performance tracing لمسارات الحجز والدفع

**B) Structured Logs (JSON logs)**
- سجل موحد يحمل Context ثابت (correlationId, bookingId, userId, actorRole...)
- يمنع طباعة PII/Secrets في الإنتاج

**C) Business KPIs + Alerts**
- تُحسب من DB (bookings/payments/activity_logs)
- تنبيهات threshold + anomaly detection

---

## 3) معيار correlationId الرسمي

### 3.1 لماذا correlationId؟
- `bookingId` غير موجود قبل إنشاء الحجز.
- رحلة الحجز تبدأ قبل الإنشاء: `checkAvailability → Pay 50 → create requested → ...`
- نحتاج معرف يربط كامل الـ flow حتى لو فشل قبل الإنشاء.

### 3.2 القواعد
- **النوع:** UUID v4
- **يُولد:** عند بداية “محاولة حجز” (أول زيارة لمسار booking، أو أول click على “حجز الآن”)
- **يمتد:** حتى نهاية الرحلة (completed / cancelled / expired / rejected)
- **طريقة النقل:**
  - **Client → Server:** Header `x-correlation-id` + حقل `correlationId` في body (مهم في Server Actions)
  - **Server → DB:** عمود `bookings.correlation_id` + في `activity_logs.metadata`
  - **Server → Events (اختياري):** `event_outbox.correlation_id`

### 3.3 قواعد التسمية والتخزين
- **لا تستخدم** أرقام الهواتف أو البريد كـ correlationId.
- **لا تربط** correlationId بالـ session token.
- **تخزين** correlationId في `sessionStorage` على العميل.
- في حال logout/login أثناء نفس المحاولة: يحتفظ بنفس correlationId حتى تنتهي العملية (أو تبدأ محاولة جديدة).

---

## 4) Sentry Integration (Client + Server + Edge)

> الهدف: كل error/perf event في Sentry لازم يحمل `correlation_id` + (booking_id إن وجد) + (property_id إن وجد).

### 4.1 متغيرات البيئة
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN` (CI فقط لرفع sourcemaps)
- `SENTRY_ENVIRONMENT=development|staging|production`
- `SENTRY_RELEASE=<git_sha>` (اختياري لكن يُفضل)

### 4.2 مبادئ تهيئة Sentry
- `sendDefaultPii: false`
- `beforeSend(event)`:
  - احذف/اعمل scrub لأي PII (phone, email, receipt urls…)
  - احذف cookies/headers الحساسة
- Sampling:
  - `tracesSampleRate`: ابدأ 0.1 في production
  - Errors: عادة بدون sampling أو بسيط حسب الحجم
- Breadcrumbs:
  - أضف breadcrumbs لأحداث الدومين: `booking.requested`, `payment.uploaded`… (بدون PII)

### 4.3 Binding Context (Helper موحد)
أنشئ helper واحد يُستخدم في Client + Server:

```ts
// src/lib/observability/sentry-scope.ts
import * as Sentry from "@sentry/nextjs";

export type ObsContext = {
  correlationId: string;
  userId?: string;
  bookingId?: string;
  propertyId?: string;
  actorRole?: "tenant" | "landlord" | "admin" | "system";
  bookingStatus?: string;
  paymentMethod?: string;
};

export function bindSentryContext(ctx: ObsContext) {
  Sentry.setTag("correlation_id", ctx.correlationId);
  if (ctx.bookingId) Sentry.setTag("booking_id", ctx.bookingId);
  if (ctx.propertyId) Sentry.setTag("property_id", ctx.propertyId);
  if (ctx.actorRole) Sentry.setTag("actor_role", ctx.actorRole);

  if (ctx.userId) Sentry.setUser({ id: ctx.userId }); // بدون email/phone

  Sentry.setContext("booking_flow", {
    correlationId: ctx.correlationId,
    bookingId: ctx.bookingId,
    propertyId: ctx.propertyId,
    actorRole: ctx.actorRole,
    bookingStatus: ctx.bookingStatus,
    paymentMethod: ctx.paymentMethod,
  });
}
```

### 4.4 Server wrapper موحد
```ts
// src/lib/observability/with-obs.ts
import * as Sentry from "@sentry/nextjs";
import { bindSentryContext, ObsContext } from "./sentry-scope";

export async function withObs<T>(ctx: ObsContext, fn: () => Promise<T>) {
  bindSentryContext(ctx);
  try {
    return await fn();
  } catch (err) {
    Sentry.captureException(err);
    throw err;
  }
}
```

### 4.5 ربط `error.tsx` (App Router)
في `src/app/error.tsx`:
- أرسل exception مرة واحدة
- اعرض زر Retry

> هذا شرط جاهزية إنتاج أساسي لتفادي “شاشة بيضاء”.

---

## 5) Structured Logging Specification

### 5.1 هدف الـ Logs
- Logs ليست بديلاً عن Sentry.
- Logs هدفها: **سياق تشغيلي** + **تحقيق سريع** + **ربط DB events**.

### 5.2 شكل الـ Log القياسي (JSON)
كل log entry يجب أن يحمل:

| Field | مثال | ملاحظات |
|---|---|---|
| `timestamp` | ISO | إلزامي |
| `level` | info/warn/error | إلزامي |
| `message` | نص مختصر | إلزامي |
| `correlationId` | uuid | إلزامي لمسارات الحجز |
| `bookingId` | uuid | اختياري |
| `propertyId` | uuid | اختياري |
| `userId` | uuid | اختياري |
| `actorRole` | tenant/landlord/admin/system | اختياري |
| `action` | booking.create / payment.upload | اختياري |
| `status` | requested/approved/... | اختياري |
| `durationMs` | رقم | لأداء server |
| `errorCode` | NOT_AVAILABLE / INVALID_TRANSITION | عند الفشل |
| `ip` | masked | لا نخزن full IP في logs إن أمكن |
| `ua` | مختصر | user-agent |

### 5.3 Redaction Rules (إلزامي)
لا تطبع في logs:
- phone/email
- receipt_url
- session tokens / supabase keys
- full address (يمكن area فقط)

### 5.4 متى نكتب Logs؟
- في كل transition للحجز (requested/approved/…)
- في كل خطوة دفع (start payment, upload, verify, reject)
- في أي error من DB مع mapping إلى Domain error

---

## 6) KPIs المطلوبة + Alerts

> الـ KPIs هنا “تشغيلية/تجارية” ويجب أن تُبنى على DB (Source of Truth).

### KPI-1: Payment Failure Rate
**التعريف:**
- Payment attempt = booking دخل `payment_pending`
- Failure = booking أصبح `expired` بسبب deadline أو payment.status = failed/rejected

**تنبيه (مثال):**
- Warning: failure_rate > 5% خلال 30 دقيقة (min 20 attempts)
- Critical: failure_rate > 10% خلال 30 دقيقة أو > 5% لمدة 2 ساعة

**Runbook مختصر:**
1) استخرج أعلى `correlationId` مرتبط بالفشل.
2) راجع أخطاء upload/storage أو verify latency.
3) هل هناك spike في invalid receipts؟ طبّق rate limit + مراجعة يدوية.

---

### KPI-2: Booking Confirmation Delay
نقسمها لمرحلتين:

1) **Time-to-Approve**: `approved_at - requested_at` (SLA رد المؤجر)
2) **Time-to-Confirm**: `confirmed_at - payment_uploaded_at` (تأخير مراجعة الإيصال)

**تنبيه:**
- Stuck in `payment_uploaded` > 2h (count > N)
- p95 verify latency > 2h (Warning) / > 6h (Critical)

---

### KPI-3: Suspicious Booking Attempts (Anomaly / Abuse)
ابدأ بـ rule-based ثم evolve.

**Signals (Rule-based):**
- create booking attempts per `userId` > 5 / 10 min
- per `ip` > 15 / 10 min
- repeated `INVALID_TRANSITION` / `FORBIDDEN` errors from same user/ip

**تنبيه:**
- إذا تجاوز signal threshold → alert security

**استجابة:**
- throttle / block
- إضافة تحدي (CAPTCHA) لمسار create booking (اختياري)

---

## 7) SQL/Views (اقتراحات تنفيذية)

### 7.1 View: Payment Failure Window (30m)
> ملاحظة: تحتاجوا تحديد timestamp fields أو استخراجها من activity_logs.

```sql
-- مثال توضيحي (ليس نهائي)
SELECT
  COUNT(*) FILTER (WHERE status = 'payment_pending') AS attempts,
  COUNT(*) FILTER (WHERE status = 'expired') AS expired_count
FROM bookings
WHERE created_at >= now() - interval '30 minutes';
```

### 7.2 Query: Stuck payment_uploaded
```sql
SELECT id, correlation_id, updated_at
FROM bookings
WHERE status = 'payment_uploaded'
  AND updated_at < now() - interval '2 hours'
ORDER BY updated_at ASC
LIMIT 50;
```

### 7.3 Query: Invalid transition spikes
> يفترض أنكم بتسجلوا errorCode في activity_logs أو logs.

```sql
SELECT
  (metadata->>'ip') AS ip,
  COUNT(*) AS cnt
FROM activity_logs
WHERE action_type = 'booking_transition_failed'
  AND (metadata->>'errorCode') IN ('INVALID_TRANSITION','FORBIDDEN')
  AND created_at >= now() - interval '1 hour'
GROUP BY ip
ORDER BY cnt DESC
LIMIT 20;
```

---

## 8) Dashboards المقترحة

### 8.1 Dashboard: Booking Funnel
- availability_checked
- verification_fee_paid (50)
- requested
- approved
- payment_pending
- payment_uploaded
- confirmed
- active
- completed

### 8.2 Dashboard: Payments Health
- failure rate
- stuck uploads
- verify latency p50/p95
- rejected receipts rate

### 8.3 Dashboard: Security & Abuse
- attempts per ip/user
- invalid transitions
- repeated receipt uploads

---

## 9) Alert Routing + Severities

### 9.1 مستويات الشدة
- **SEV-1 (Critical):** توقف الدفع/الحجز أو spike شديد أو تسريب/اختراق
- **SEV-2:** تأخير كبير أو خلل يؤثر على نسبة كبيرة من المستخدمين
- **SEV-3:** تحذير/اتجاه سلبي يحتاج متابعة

### 9.2 قنوات التنبيه
- Sentry Alerts (Email/Slack Integration)
- (اختياري) إشعارات داخل لوحة Admin للحالات stuck

---

## 10) Runbooks (سريع وعملي)

### Runbook: Spike فشل الدفع
1) افتح Sentry وابحث بالـ tag: `correlation_id`.
2) راجع errors المتعلقة بـ storage/upload أو transitions.
3) افحص DB: `payment_uploaded` stuck + `expired` spike.
4) قرار:
   - مشكلة تقنية: rollback/redeploy + degrade mode
   - إساءة استخدام: rate-limit + block ip/user

### Runbook: Stuck payment_uploaded
1) استخرج أقدم 50 booking stuck.
2) اعرضها للأدمن للمراجعة.
3) إن كان الstuck بسبب missing receipt: أرسل notification للمستأجر.

### Runbook: Invalid transitions / forbidden attempts
1) تحقق من الـ IP/User spikes.
2) راجع هل هناك bug بالواجهة يرسل updates غير مسموحة.
3) إن كان هجوم: block / throttle / challenge.

---

## 11) Definition of Done (Acceptance Criteria)

### 11.1 Sentry
- [ ] Client + Server + Edge enabled
- [ ] كل error يحمل `correlation_id` tag
- [ ] sourcemaps شغالة في production (release tracked)

### 11.2 Correlation
- [ ] `x-correlation-id` يصل للسيرفر في كل booking/payment endpoints
- [ ] يُخزن في DB (bookings + activity_logs)

### 11.3 KPIs & Alerts
- [ ] Job كل 5 دقائق يحسب: failure_rate + stuck + p95 latency + abuse signals
- [ ] Alerts تعمل وتصل لقناة التشغيل

### 11.4 Audit
- [ ] كل status change مسجل في `activity_logs` بشكل تلقائي (DB trigger)

---

## 12) خطة تنفيذ مختصرة (مقترح)

**Phase 1 (1–2 أيام):**  
- correlationId end-to-end + Sentry baseline + error.tsx + logger موحد

**Phase 2 (أسبوع):**  
- KPI jobs + dashboards + alert routing + runbooks

**Phase 3 (لاحق):**  
- outbox + events + advanced anomaly detection + SLOs

