# Gamasa Properties — Codebase Analysis Report

---

## 1. Route Table

| Route | File Path | نوع الملف | Server / Client |
|-------|-----------|-----------|-----------------|
| `/` | `src/app/page.tsx` | page | **Server** |
| `/layout` (root) | `src/app/layout.tsx` | layout | **Server** |
| `/add-property` | `src/app/add-property/page.tsx` | page | Client (`'use client'`) |
| `/admin` | `src/app/admin/page.tsx` | page | Client |
| `/admin` (layout) | `src/app/admin/layout.tsx` | layout | **Server** (wraps AdminGuard) |
| `/admin/payments` | `src/app/admin/payments/page.tsx` | page | Client |
| `/admin/properties` | `src/app/admin/properties/page.tsx` | page | Client |
| `/admin/users` | `src/app/admin/users/page.tsx` | page | Client |
| `/auth` | `src/app/auth/page.tsx` | page | Client |
| `/bookings` | `src/app/bookings/page.tsx` | page | Client (`'use client'`) |
| `/favorites` | `src/app/favorites/page.tsx` | page | **Server** |
| `/favorites` (client) | `src/app/favorites/FavoritesClient.tsx` | client component | Client |
| `/login` | `src/app/login/page.tsx` | page | Client |
| `/messages` | `src/app/messages/page.tsx` | page | Client |
| `/messages/[id]` | `src/app/messages/[id]/page.tsx` | page | Client |
| `/my-properties` | `src/app/my-properties/page.tsx` | page | Client |
| `/notifications` | `src/app/notifications/page.tsx` | page | Client |
| `/profile` | `src/app/profile/page.tsx` | page | Client |
| `/property/[id]` | `src/app/property/[id]/page.tsx` | page | **Server** |
| `/property/[id]` (details) | `src/app/property/[id]/client.tsx` | client component | Client |
| `/property/[id]/booking` | `src/app/property/[id]/booking/page.tsx` | page | **Server** |
| `/property/[id]/booking` (form) | `src/app/property/[id]/booking/client.tsx` | client component | Client (`'use client'`) |
| `/property/[id]/booking/confirmation` | `src/app/property/[id]/booking/confirmation/page.tsx` | page | Client (`'use client'`) |
| `/register` | `src/app/register/page.tsx` | page | Client |
| `/search` | `src/app/search/page.tsx` | page | **Server** |
| `/search` (client) | `src/app/search/client.tsx` | client component | Client |
| `robots.ts` | `src/app/robots.ts` | route handler (robots.txt) | Server |
| `sitemap.ts` | `src/app/sitemap.ts` | route handler (sitemap.xml) | Server |
| `providers.tsx` | `src/app/providers.tsx` | special (Provider wrapper) | Client |

---

## 2. Route Tree (Layout Nesting)

```
RootLayout (src/app/layout.tsx) — lang="ar", dir="rtl", wraps Providers + IOSInstallPrompt
├── /                         → page.tsx (Server — mock data, no Supabase)
├── /search                   → page.tsx (Server) → SearchClient.tsx
├── /property/[id]            → page.tsx (Server, fetches from Supabase)
│   ├── client.tsx            (Client component for interactivity)
│   └── /booking              → page.tsx (Server, fetches property from Supabase)
│       ├── client.tsx        (Client, handles booking form + createBooking RPC)
│       └── /confirmation     → page.tsx (Client, fetches booking + receipt upload)
├── /add-property             → page.tsx (Client)
├── /bookings                 → page.tsx (Client — MOCK DATA ONLY, no Supabase)
├── /favorites                → page.tsx (Server) → FavoritesClient.tsx
├── /my-properties            → page.tsx (Client)
├── /profile                  → page.tsx (Client)
├── /notifications            → page.tsx (Client)
├── /messages                 → page.tsx (Client)
│   └── /messages/[id]        → page.tsx (Client)
├── /auth                     → page.tsx (Client)
├── /login                    → page.tsx (Client)
├── /register                 → page.tsx (Client)
└── AdminLayout (src/app/admin/layout.tsx) — wraps <AdminGuard>
    ├── /admin                → page.tsx (Client)
    ├── /admin/payments       → page.tsx (Client)
    ├── /admin/properties     → page.tsx (Client)
    └── /admin/users          → page.tsx (Client)
```

---

## 3. Route Guards & Redirects

| Location | الآلية | المسار المحمي | يعمل كيف؟ |
|----------|--------|--------------|-----------|
| `src/middleware.ts` | Security Headers فقط — **لا يوجد auth guard** | جميع المسارات | يضيف CSP + X-Frame + إلخ. ثم `NextResponse.next()` |
| `src/app/admin/layout.tsx` | `<AdminGuard>` component | `/admin/**` | Client-side: useEffect → redirect to `/auth` if not logged in, redirect to `/` if not admin |
| `src/components/auth/AdminGuard.tsx` | `useAuth()` + `isAdmin(user?.role)` | `/admin/**` | إذا لم يكن مدير → `router.push('/')`, إذا لم يكن مسجلاً → `router.push('/auth')` |
| `src/app/property/[id]/booking/client.tsx` L108 | `user?.id \|\| 'guest'` | `/property/[id]/booking` | ⚠️ **لا يوجد guard**: يقبل الحجز كـ`guest` بدون تسجيل دخول |

> **⚠️ نقص أمني:** الـ middleware لا يحمي أي مسار. `/add-property`، `/my-properties`، `/bookings`، `/profile` بدون حماية على مستوى الـ Server. الحماية تعتمد فقط على الـ Client (ProtectedRoute/AdminGuard components) مما يعني أن Server-Side Rendering يحدث دائماً حتى للمسارات المحمية.

---

## 4. Page → Dependencies → Data Sources → Navigation

### `/` (Home)
- **Imports:** `Link`, `BottomNav`, `Header`, `PropertyCard`, `CategoryFilter`, `JsonLd`
- **Data Sources:** ⚠️ **Mock data فقط** (hardcoded arrays `featuredProperties`, `recentProperties`)
- **Navigation FROM:**
  - `<Link href="/search">` (filter button + "عرض الكل")
  - `<Link href="/search?featured=true">` (مميز section)
  - `<Link href="/search?recent=true">` (حديث section)
  - `<Link href="/add-property">` (CTA)
- **Navigation TO:** من BottomNav، Header

---

### `/property/[id]` (تفاصيل العقار)
- **Imports:** `supabaseService.getPropertyById`, `supabaseService.incrementPropertyViews`, `ClientPropertyDetails`, `JsonLd`
- **Data Sources:** Supabase → `properties` table (via `getPropertyById`)
- **Navigation FROM:**
  - `<Link href="/property/[id]/booking">` (from ClientPropertyDetails presumably)
  - `router.back()` داخل booking/client.tsx (L184)
- **Navigation TO:** من PropertyCard components

---

### `/property/[id]/booking` (صفحة الحجز)
- **Imports:** `supabaseService.getPropertyById`, `supabaseService.checkAvailability`, `supabaseService.createBooking`, `supabaseService.calculateTotalPrice`, `useAuth`, `DateSelector`, `TenantForm`, `PaymentMethods`, `PriceBreakdown`
- **Data Sources:** 
  - Supabase: `supabaseService.getPropertyById(id)` (server-side)
  - Supabase: `supabase.rpc('create_atomic_booking')` (via createBooking)
  - Supabase: `bookings` table (checkAvailability query)
- **Navigation FROM:**
  - `router.push('/property/${propertyId}/booking/confirmation?bookingId=${booking.id}')` (L169)
  - `router.back()` (L184)

---

### `/property/[id]/booking/confirmation`
- **Imports:** `supabaseService.getBookingById`, `supabaseService.uploadPaymentReceipt`, `useAuth`, `useRouter`, `useSearchParams`
- **Data Sources:**
  - Supabase: `bookings` join `properties` join `profiles` (via `getBookingById`)
  - Supabase: Storage bucket `payment-receipts` (receipt upload)
- **Navigation FROM:**
  - `router.push('/profile/bookings')` (L283)
  - `router.push('/')` (L286)

---

### `/bookings` (الحجوزات)
- **Imports:** `useState`, `Link`, `BottomNav`
- **Data Sources:** ⚠️ **Mock data فقط** — `INITIAL_MY_BOOKINGS`, `INITIAL_INCOMING_REQUESTS` (hardcoded)
- **Navigation FROM:**
  - `<Link href="/properties/${booking.propertyId}">` ⚠️ رابط خاطئ! يجب أن يكون `/property/[id]`
  - `<Link href="/messages/${booking.id}">` (مراسلة المالك)

---

### `/admin/**`
- **Layout Guard:** `AdminGuard` → checks `isAdmin(user?.role)` from `AuthContext`
- **Data Sources:** Supabase via `supabaseService` (getAllProfiles, getProperties, payment_requests)
- **Navigation FROM:** `<a href="/admin">`, `<a href="/admin/properties">`, etc.

---

## 5. Navigation Graph (نص)

```
/ (Home)
├─→ /search          (Link:L184, L203, L224 in page.tsx)
├─→ /add-property    (Link:L247 in page.tsx)
├─→ /property/[id]   (PropertyCard → Link internally)
└─→ BottomNav → /bookings, /favorites, /messages, /profile, /

/property/[id]
├─→ /property/[id]/booking    (client.tsx → Link/button)
└─→ /messages/[id]            (via conversation)

/property/[id]/booking
├─→ /property/[id]/booking/confirmation?bookingId=xxx  (client.tsx:L169 router.push)
└─→ router.back()                                       (client.tsx:L184)

/property/[id]/booking/confirmation
├─→ /profile/bookings   (confirmation/page.tsx:L283 router.push)
└─→ /                   (confirmation/page.tsx:L286 router.push)

/bookings
└─→ /messages/[bookingId]  (bookings/page.tsx:L193-L196 Link)
    ⚠️ Link /properties/[id] (WRONG path — should be /property/[id])

/admin (layout)
├─→ /admin/properties
├─→ /admin/payments
└─→ /admin/users

/auth | /login
└─→ redirect to / after login (AuthContext logout → window.location.href='/')

AdminGuard (all /admin/*)
├─→ /auth  (if !isAuthenticated)
└─→ /      (if !isAdmin)
```

---

## 6. تحليل قواعد V1 للحجز

### القاعدة 1: Availability لا تُخزن داخل properties، وتُشتق فقط من confirmed+active و property_unavailability

| الحالة | التطبيق في الكود |
|--------|-----------------|
| **متوافق جزئياً** | `checkAvailability` في `supabaseService.ts:L1236-1248` يستعلم من `bookings` table مباشرة |
| **خرق** | `checkAvailability` يفحص `status IN ('confirmed', 'pending')` — يجب أن يكون `confirmed+active` فقط |
| **خرق** | لا يوجد جدول `property_unavailability` في أي من المخططات |
| **خرق** | `create_atomic_booking` في `functions.sql:L131` يستخدم `status IN ('confirmed', 'pending')` للتحقق من التعارض |
| **خرق** | صفحة `/` تعرض عقارات بـ `status: 'available'` من mock data، لا تُشتق من الحجوزات |

**إصلاح مقترح:**
```sql
-- أضف جدول property_unavailability
CREATE TABLE property_unavailability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT -- 'maintenance', 'blocked', etc.
);

-- عدّل checkAvailability لتشمل هذا الجدول
SELECT COUNT(*) FROM bookings
WHERE property_id = p_property_id
  AND status IN ('confirmed', 'active')  -- V1 compliant
  AND (p_start_date <= end_date AND p_end_date >= start_date);
```

---

### القاعدة 2: حالات الحجز المسموحة

**V1 المطلوبة:** `requested / approved / payment_pending / payment_uploaded / confirmed / active / completed / rejected / expired / cancelled`

| الحالة | الكود/DB |
|--------|---------|
| **خرق كبير** | `schema.sql:L102` و `20260208_fix_enum_values.sql:L36` تسمح فقط بـ: `pending, confirmed, cancelled, completed` |
| **خرق** | `bookings/page.tsx:L8` تعرّف `BookingStatus` محلياً كـ `'pending' \| 'confirmed' \| 'completed' \| 'cancelled'` |
| **خرق** | `updateBookingStatus` في `supabaseService.ts:L1490` يقبل فقط `pending / confirmed / cancelled` |
| **مفقود** | لا يوجد `requested, approved, payment_pending, payment_uploaded, active, rejected, expired` |

**إصلاح مقترح (minimal):**
```sql
ALTER TABLE bookings DROP CONSTRAINT bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN (
  'requested','approved','payment_pending','payment_uploaded',
  'confirmed','active','completed','rejected','expired','cancelled'
));
```

وفي TypeScript:
```typescript
// src/types/index.ts
export type BookingStatus = 
  | 'requested' | 'approved' | 'payment_pending' | 'payment_uploaded'
  | 'confirmed' | 'active' | 'completed' | 'rejected' | 'expired' | 'cancelled';
```

---

### القاعدة 3: منع التداخل فقط على confirmed+active

| الحالة | التطبيق |
|--------|---------|
| **خرق** | `create_atomic_booking` يمنع التداخل على `status IN ('confirmed', 'pending')` أيضاً، مما يمنع حجوزات جديدة خلال فترة الانتظار (pending) |
| **خرق** | يجب أن يمنع فقط `confirmed + active` |

**إصلاح في `functions.sql`:**
```sql
-- في create_atomic_booking، السطر 131
AND status IN ('confirmed', 'active')  -- بدلاً من ('confirmed', 'pending')
```

وكذلك في `checkAvailability` في `supabaseService.ts:L1240`:
```typescript
.in('status', ['confirmed', 'active'])  // بدلاً من ['confirmed', 'pending']
```

---

### القاعدة 4: تحصيل العمولة فقط بعد الانتقال لـ active

| الحالة | التطبيق |
|--------|---------|
| **غير مطبّق** | لا يوجد أي منطق لتحصيل العمولة في الكود |
| **خرق** | `calculateTotalPrice` في `supabaseService.ts:L1199` يحسب `serviceFee = basePrice * 0.10` ويضيفها للإجمالي فور الحجز (pending) |
| **خرق** | العمولة مدمجة في `total_amount` منذ البداية، وليس فقط عند `active` |

**إصلاح مقترح:**
```typescript
// في createBooking: احتفظ بـ service_fee لكن لا تضفه للـ total_amount حتى status=active
// أضف trigger في DB:
CREATE OR REPLACE FUNCTION collect_commission_on_active()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    -- هنا يتم تسجيل العمولة في جدول منفصل أو notification للمالك
    INSERT INTO notifications(user_id, title, type)
    VALUES (NEW.user_id, 'تم تحصيل العمولة', 'info');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. جدول DB / RLS / Triggers / Functions

| الاسم | المكان | تستخدم في flow | تمنع bypass للـ state machine؟ |
|-------|--------|----------------|-------------------------------|
| `handle_new_user()` | `schema.sql:L255`, `functions.sql:L7` | يُنشئ `profiles` row تلقائياً عند التسجيل | ❌ ليست ذات صلة بالحجز |
| Trigger `on_auth_user_created` | `schema.sql:L269`, `functions.sql:L23` | Auth signup → profile creation | ❌ |
| `update_updated_at_column()` | `schema.sql:L275` | تحديث `updated_at` تلقائياً في `profiles` و `properties` | ❌ |
| `increment_views(property_id)` | `schema.sql:L297`, `functions.sql:L32` | PropertyPage → يزيد `views_count` | ❌ |
| `get_landlord_stats(target_user_id)` | `functions.sql:L45` | Admin/profile dashboard | ❌ — سوف يُحسب `active_bookings` من `confirmed+pending` وهو خاطئ |
| `unlock_property_with_payment(p_user_id, p_property_id, p_payment_id)` | `functions.sql:L68` | Confirmation page → unlock property | ✅ **Atomic**: يمنع double-consumption عبر `FOR UPDATE` + `is_consumed = FALSE` |
| `create_atomic_booking(...)` | `functions.sql:L104` | Booking form → supabase.rpc() | ⚠️ **جزئياً**: يمنع التعارض على `confirmed+pending` لكن يجب `confirmed+active` فقط. لا يتحقق من state machine transitions |
| RLS: `"Public profiles are viewable by everyone"` | `schema.sql:L189` | أي استعلام على profiles | ✅ |
| RLS: `"Users can update own profile"` | `schema.sql:L192` | Profile page | ✅ |
| RLS: `"Approved properties are viewable by everyone"` | `schema.sql:L199` | Property listings | ✅ |
| RLS: `"Users can insert own properties"` | `schema.sql:L203` | Add property page | ✅ |
| RLS: `"Admins can do everything on properties"` | `schema.sql:L308` | Admin panel | ✅ |
| RLS: `"Users can view own bookings"` | `schema.sql:L213` | Bookings page | ⚠️ يفحص `guest_id` لكن العمود تم rename لـ `user_id` في migration — قد يكون مكسوراً |
| RLS: `"Users can create bookings"` | `schema.sql:L216` | Booking form | ⚠️ نفس المشكلة — يستخدم `guest_id` القديم |
| RLS: `"Users can view own payment requests"` | `schema.sql:L220` | Payment flow | ✅ |
| RLS: `"Admins can manage payment requests"` | `schema.sql:L318` | Admin payments page | ✅ |
| `idx_payment_requests_property_user_active` (UNIQUE INDEX) | `20260208000001_add_payment_consumed.sql:L10` | unlockProperty flow | ✅ يمنع دفعتين نشطتين لنفس العقار/المستخدم |
| `is_consumed` column | `20260208000001_add_payment_consumed.sql:L6` | `unlockProperty` | ✅ يمنع إعادة استخدام نفس الدفع |

---

## 8. خريطة `supabase.rpc()` calls

| الدالة | يُستدعى من | يتحقق من كذا |
|--------|-----------|------------|
| `rpc('increment_views', { property_id })` | `supabaseService.ts:L384` | لا شيء — فقط UPDATE |
| `rpc('create_atomic_booking', {...})` | `supabaseService.ts:L1279` | فحص تعارض التواريخ (جزئي — pending مشمول) |
| `rpc('unlock_property_with_payment', {...})` | `supabaseService.ts:L592` | دفع معتمد + غير مستهلك (✅ حماية كاملة) |

---

## 9. ملخص المخاطر والإصلاحات

| الأولوية | المشكلة | الملف | الإصلاح |
|---------|---------|-------|---------|
| 🔴 **عالية** | Booking status constraint لا يطابق V1 (4 states فقط بدلاً من 9) | `schema.sql:L102`, `20260208_fix_enum_values.sql:L34` | تحديث CHECK constraint لإضافة `requested, approved, payment_pending, payment_uploaded, active, rejected, expired` |
| 🔴 **عالية** | RLS policies على `bookings` تستخدم `guest_id` القديم بعد rename إلى `user_id` | `schema.sql:L213,L216` | تحديث الـ policies لاستخدام `user_id` |
| 🟠 **متوسطة** | `checkAvailability` + `create_atomic_booking` يفحصان `pending` كتعارض (يجب `confirmed+active` فقط) | `supabaseService.ts:L1240`, `functions.sql:L131` | تغيير `IN ('confirmed', 'pending')` إلى `IN ('confirmed', 'active')` |
| 🟠 **متوسطة** | العمولة (service_fee) تُحسب وتُضاف للإجمالي فور الحجز وليس عند `active` | `supabaseService.ts:L1199` | فصل `service_fee` عن `total_amount` حتى transition لـ `active` |
| 🟠 **متوسطة** | `/bookings` page تستخدم mock data فقط — لا تستدعي Supabase | `bookings/page.tsx` | تكامل `supabaseService.getUserBookings()` |
| 🟡 **منخفضة** | رابط خاطئ في bookings page `/properties/[id]` بدلاً من `/property/[id]` | `bookings/page.tsx:L182` | تصحيح الـ href |
| 🟡 **منخفضة** | `/` home page تستخدم mock data فقط (8 عقارات hardcoded) | `app/page.tsx` | تكامل `supabaseService.getProperties()` |
| 🟡 **منخفضة** | Middleware لا يحمي أي route على مستوى Server (Add Property, My Properties, Bookings, Profile) | `middleware.ts` | إضافة auth check في الـ middleware |
| 🟡 **منخفضة** | لا يوجد جدول `property_unavailability` | غير موجود | إضافة الجدول وتحديث `checkAvailability` |
| 🟡 **منخفضة** | `AuthContext` لا يستعيد الـ Supabase session في non-mock mode | `AuthContext.tsx:L38-44` | مزامنة `supabase.auth.getUser()` عند التحميل |
