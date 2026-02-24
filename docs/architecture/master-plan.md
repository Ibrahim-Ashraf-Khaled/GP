# Gamasa Properties — الخطة الكاملة (Master Plan)
> **تاريخ الإنشاء:** 2026-02-20  
> **هدف الملف:** تحويل تقرير التحليل إلى **خطة تنفيذ كاملة** + قائمة مهام مرتبة بالأولوية + مخرجات واضحة لكل مرحلة.

---

## 0) الهدف العام
بناء منصة عقارية لمدينة جمصة تدعم:
- تصفّح + بحث متقدم + خريطة
- تواصل بين المستأجر/المؤجر
- نظام حجز كامل (يومي/شهري/موسمي/سنوي) + دفع + إثبات دفع + تأكيد واستلام
- لوحة تحكم Admin + سياسات أمان RLS قوية
- جاهزية تشغيل Production (Observability + CI/CD + Secrets)

---

## 1) مصادر الحقيقة V1 (Source of Truth)
> هذه المستندات هي المرجع الذي يجب أن يكون التنفيذ مطابقًا له (خاصة الحجز + التوفر + الأمان):

- **BOOKING_ARCHITECTURE_V1.md** (DB-first, RPC, State Machine في DB)
- **Business Rule Document / State Machine / Decision Matrix** (PDFs في مجلد المشروع)
- **security-foundation-v1.md** (منع إطلاق Production بدون تطبيق طبقة الأمان)
- **production-readiness.md** (خطوات Env/Monitoring/Error Boundaries)
- **BOOKING_SYSTEM.md** (التنفيذ الحالي للحجز وواجهة المستخدم)

---

## 2) Snapshot سريع للوضع الحالي (أهم الملاحظات)
### 2.1 مشاكل Routing / Navigation
- ✅ Routes الأساسية موجودة (App Router).
- ⚠️ روابط مكسورة:
  - `/bookings` يحتوي href خطأ: `/properties/[id]` بدل `/property/[id]`
  - `confirmation` يعمل redirect إلى `/profile/bookings` بينما لا يوجد route بهذا الاسم.

### 2.2 مشاكل Auth (حرجة لأنها تكسر البناء)
- يوجد تدفقين متوازيين:
  - `/login` + `/register` يستخدمون `login/register` من `AuthContext`
  - `/auth` يستخدم `LoginForm/SignUpForm` ويستدعي `signIn/signUp/signInWithGoogle...` **غير موجودة** في AuthContext
- هذا غالباً يسبب TypeScript build failure أو UX غير موحد.

### 2.3 الحماية (Guards)
- `middleware.ts` حاليًا يضيف Security Headers فقط، **بدون حماية Auth**.
- الحماية تعتمد على Client guards فقط (ProtectedRoute/AdminGuard) → غير كافي للأمان الحقيقي.

### 2.4 Booking / DB mismatch
- DB schema الأصلي كان `guest_id/check_in/check_out` ثم migration عمل rename إلى `user_id/start_date/end_date`.
- لكن RLS policies في `schema.sql` ما زالت تعتمد على `guest_id` → غالبًا مكسورة.
- حالات الحجز في DB/TS حالياً 4 فقط (`pending/confirmed/cancelled/completed`) بينما V1 تتطلب State Machine أوسع.
- `create_atomic_booking` يستخدم منع تداخل على `confirmed + pending` وبه ثغرة سباق (Race) إذا لا يوجد حجوزات سابقة.

### 2.5 Mock Mode
- صفحات مثل Home و Bookings ما زالت تعتمد على mock/localStorage في أجزاء كبيرة.
- مطلوب فصل واضح: Dev فقط، ومنع تشغيل Production على Mock.

---

## 3) المبادئ اللي هنمشي بيها
1) **DB هي مصدر الحقيقة للحجز** (State machine + guards داخل DB).
2) **التوفر Derived فقط** (لا نخزن availability داخل properties).
3) **No Overlap** على `confirmed + active` فقط باستخدام Exclusion Constraint.
4) **RLS صارمة** + عدم الاعتماد على Client guards وحدها.
5) **لا تخزين كلمات مرور/توكنز في localStorage** (Mock يكون Dev only).

---

# 4) خطة التنفيذ الكاملة (Phases)

> ملاحظة: كل Phase تحتها “Done Criteria” واضحة. ابدأ بالترتيب لأن المراحل الأولى بتفك عقد تمنع التطوير (build/auth/db).

---

## Phase 0 — تثبيت البناء + توحيد الوثائق (Blocking)
### أهداف المرحلة
- المشروع يبني بدون أخطاء TypeScript
- وجود ملف Plan + تعريف واضح للـ flows والمسؤوليات

### مهام
- [ ] **حل تضارب Auth** (اختيار أحد المسارين):
  - **الخيار A (مُفضّل للبساطة):** اجعل `/auth` هو الوحيد، واحذف أو حول `/login` و `/register` لعمل redirect إلى `/auth`.
  - **الخيار B (أقل تغيير):** أبقِ `/login` و `/register` واحذف `/auth` + components/auth أو عدلها لاستخدام `login/register`.
- [ ] إصلاح الروابط المكسورة:
  - [ ] `/bookings`: تعديل `/properties/${id}` → `/property/${id}`
  - [ ] `confirmation`: تعديل redirect `/profile/bookings` → `/bookings` أو إنشاء route جديد.
- [ ] إضافة ملف `docs/MASTER_PLAN.md` (هذا الملف) داخل الريبو.
- [ ] إضافة `src/app/error.tsx` + `src/app/not-found.tsx` (أساسيات App Router).

### Done Criteria
- [ ] `npm run build` ينجح
- [ ] لا يوجد imports تشير لدوال Auth غير موجودة
- [ ] لا يوجد route redirect إلى مسار غير موجود

---

## Phase 1 — Security Gate + Session Foundation (High)
### أهداف المرحلة
- جلسة Supabase صحيحة (SSR + Cookies)
- حماية server-side للمسارات الحساسة
- منع Production على Mock

### مهام
- [ ] إنشاء `src/lib/env.ts` (Env Gate) + منع Production على `IS_MOCK_MODE=true`.
- [ ] تفعيل Supabase SSR:
  - [ ] إنشاء `src/lib/supabase/server.ts` باستخدام `@supabase/ssr`
  - [ ] التأكد من cookies integration
- [ ] حماية Routes (Server-side) واحدة من طريقتين:
  - **Middleware**: حماية `/add-property`, `/my-properties`, `/bookings`, `/messages`, `/profile`, `/admin/*`
  - أو **داخل كل صفحة Server**: `redirect('/auth')` عند عدم وجود user
- [ ] إلغاء “guest booking”:
  - [ ] منع `userId: 'guest'` في إنشاء الحجز.
  - [ ] أي محاولة حجز بدون login → redirect للـ auth.

### Done Criteria
- [ ] لا يمكن فتح صفحات حساسة بدون تسجيل دخول
- [ ] لا يوجد bookings تُنشأ بدون `auth.uid()`
- [ ] Production build يفشل إذا Mock Mode مفعل

---

## Phase 2 — إصلاح DB + RLS + توافق Names (High)
### أهداف المرحلة
- RLS صحيحة ومطابقة للـ schema الحالي
- إزالة الاعتماد على أعمدة قديمة (`guest_id`)

### مهام DB
- [ ] تحديث سياسات RLS على `bookings` لتستخدم `user_id` بدل `guest_id`.
- [ ] مراجعة `unlocked_properties` (Composite PK) وتعديل أي كود يفترض وجود `id`.
- [ ] إضافة Indexes مفيدة:
  - `bookings(property_id, start_date, end_date, status)`
  - `bookings(user_id, created_at)`
- [ ] (اختياري) فصل property statuses:
  - `properties.status` يكون للإدارة/المراجعة (`draft/pending/approved/rejected/blocked/archived`)
  - أما “محجوز/مستأجر” يتم إظهاره UI من الـ bookings وليس تخزينه في properties.

### Done Criteria
- [ ] كل استعلامات bookings تعمل مع RLS بدون أخطاء
- [ ] لا يوجد references لـ guest_id في policies أو الكود

---

## Phase 3 — تطبيق Booking V1 بالكامل (DB-First) (Critical)
### أهداف المرحلة
- State Machine كاملة داخل DB
- منع التداخل 100% (بدون race conditions)
- Availability Derived فقط من `confirmed + active` + `property_unavailability`

### مهام DB (مقترحة حسب V1)
- [ ] توسيع status values في `bookings` لتشمل:
  `requested, approved, payment_pending, payment_uploaded, confirmed, active, completed, rejected, expired, cancelled`
- [ ] إضافة Trigger: `validate_booking_transition()` (BEFORE UPDATE).
- [ ] إضافة Guard للدفع قبل `confirmed` (COD فقط يسمح من approved → confirmed).
- [ ] إضافة Exclusion Constraint لمنع التداخل:
  - `EXCLUDE USING gist (property_id WITH =, daterange(start_date, end_date, '[]') WITH &&) WHERE (status IN ('confirmed','active'))`
- [ ] إنشاء جدول `property_unavailability` (maintenance / blocked / ...).
- [ ] تحديث `create_atomic_booking` أو استبدالها بـ RPCs وفق V1:
  - user RPCs (security invoker)
  - system RPCs (security definer + service_role only)

### مهام في Next.js
- [ ] تحديث `supabaseService.checkAvailability` ليحسب من:
  - bookings في `confirmed/active` فقط
  - + property_unavailability
- [ ] إعادة تصميم createBooking:
  - بدل إدخال `status: 'pending'` → يبدأ بـ `requested`
  - والانتقالات تتم عبر RPCs فقط.

### Done Criteria
- [ ] لا يمكن لأي عميل أن يغيّر status مباشرة بطرق تتجاوز DB Guards
- [ ] التداخل مستحيل حتى تحت ضغط متزامن (constraint تحمي)
- [ ] availability لا تُخزن في properties

---

## Phase 4 — Payments + Unlocking + Commission (Medium/High)
### أهداف المرحلة
- تدفق دفع مفهوم ومتسق
- العمولة لا تُحصّل إلا بعد `active` (حسب V1)
- “Unlock property contact” (إن وجد) يكون منفصل وواضح

### مهام
- [ ] تحديد نموذج الدفع النهائي:
  - Booking payments (deposit/receipt) داخل bookings
  - Unlock fee (مثلاً 50 جنيه) داخل payment_requests + unlocked_properties
- [ ] فصل `service_fee` عن `total_amount` أو على الأقل عدم اعتباره محصلًا إلا عند `active`
- [ ] Trigger/Job لتسجيل العمولة عند انتقال `confirmed → active`
- [ ] توحيد storage buckets:
  - `payment-receipts` للإيصالات
  - صلاحيات upload عبر signed URLs أو RLS مناسبة

### Done Criteria
- [ ] لا يمكن “فتح” عقار أو تأكيد حجز بدون دفع صحيح/مُوثق حسب نوع الدفع
- [ ] commission لا تسجل قبل active

---

## Phase 5 — استبدال الـ Mock ببيانات Supabase (Medium)
### أهداف المرحلة
- Home/Search/Bookings/Notifications تشتغل فعليًا من DB
- Mock mode يبقى Dev tool فقط

### مهام
- [ ] Home: استبدال mock arrays بـ `supabaseService.getProperties()`
- [ ] Bookings:
  - tenant: `getUserBookings(auth.uid())`
  - landlord: `getIncomingRequestsForMyProperties(auth.uid())`
- [ ] Favorites: تأكيد التكامل مع جدول favorites
- [ ] Notifications: القراءة/التحديث من جدول notifications بدل local storage
- [ ] Messages: تصميم جدول conversations/messages (أو استخدام Supabase Realtime لاحقًا)

### Done Criteria
- [ ] 90% من الصفحات الأساسية لا تعتمد على localStorage كمصدر بيانات

---

## Phase 6 — Admin Panel Hardening (Medium)
### أهداف المرحلة
- Admin actions آمنة ولا تكسر State Machine
- صفحات الإدارة تعتمد على server-side checks وRLS

### مهام
- [ ] نقل AdminGuard إلى server-side check قدر الإمكان
- [ ] Admin Payments: verify receipts → RPC transition `payment_uploaded → confirmed`
- [ ] Admin Properties: approve/reject listing
- [ ] Admin Users: role management مع audit log

### Done Criteria
- [ ] لا يوجد “admin bypass” لتغيير status الحجز مباشرة بدون DB guards

---

## Phase 7 — Production Readiness (Medium)
### أهداف المرحلة
- Observability + Logging + CI/CD + Secrets
- منع المفاجآت في الإنتاج

### مهام
- [ ] Error tracking (مثلاً Sentry) على Client + Server
- [ ] Logging موحد + correlationId لكل booking/payment flow
- [ ] CI pipeline: lint + typecheck + tests
- [ ] Secrets management (Vercel/CI) + عدم تسريب service_role

### Done Criteria
- [ ] يوجد Alerts للأخطاء الحرجة
- [ ] يمكن تتبع أي مشكلة حجز من أول event لآخره

---

# 5) مخرجات (Deliverables)
- ✅ **MASTER_PLAN.md** (هذا الملف)
- ✅ **ROUTES_MAP.md** (خريطة Routes + dependencies + navigation)
- ✅ **DB_MIGRATIONS_V1/** (SQL migrations التي تطبق V1)
- ✅ **SECURITY_CHECKLIST.md**
- ✅ **BOOKING_FLOW_IMPLEMENTATION.md** (كيف UI يستدعي RPCs)

---

# 6) Appendix — أهم ملفات المشروع (Quick Map)
## Frontend Routes
- `src/app/page.tsx` (Home)
- `src/app/search/*`
- `src/app/property/[id]/*`
- `src/app/bookings/page.tsx`
- `src/app/add-property/page.tsx`
- `src/app/admin/*`

## Guards / Auth
- `src/context/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/auth/AdminGuard.tsx`
- `src/middleware.ts`

## Supabase
- `src/lib/supabase.ts`
- `src/services/supabaseService.ts`
- `schema.sql`, `functions.sql`, `20260208*.sql`

---

## 7) Next Step المقترح (ابدأ من هنا)
1) Phase 0: حل Auth + إصلاح الروابط + build ينجح  
2) Phase 1: SSR session + حماية routes + منع guest booking  
3) Phase 2/3: DB/RLS + Booking V1 guards (ده أهم استثمار)

---

> لو حابب، أقدر أطلع لك في ملف منفصل **ROUTES_MAP.md** تلقائيًا من الكود (Route → Components → Services → Navigation) بنفس شكل تقريرك ولكن “مُثبت من الـ ZIP” وبأسماء الملفات الدقيقة.
