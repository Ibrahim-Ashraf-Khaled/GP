# ROUTES_MAP — Gamasa Properties

> **Generated:** 2026-02-20

هذا الملف يربط **كل Route** في App Router بالملفات المسؤولة عنها، وأهم الاعتماديات (Components/Services) ومصادر البيانات والتنقلات (Links/redirects/router.push).

---

## 1) Route Tree (Layout Nesting)

```text
RootLayout: src/app/layout.tsx
/add-property
/admin
  /payments
  /properties
  /users
/auth
/bookings
/favorites
/login
/messages
  /[id]
/my-properties
/notifications
/profile
/property
  /[id]
    /booking
      /confirmation
/register
/search

Special route handlers:
/robots.txt  -> src/app/robots.ts
/sitemap.xml -> src/app/sitemap.ts
```

---

## 2) Global Navigation Sources

- `src/components/BottomNav.tsx` → `/`, `/add-property`, `/bookings`, `/favorites`, `/profile`
- `src/components/Header.tsx` → `/login`, `/profile`, `/register`

---

## 3) Route Table (Route → Files → Dependencies → Data → Navigation)

### /

- **layout**: `src/app/layout.tsx` — **Server**
  - **Key imports:** `./providers`, `@/components/IOSInstallPrompt`
- **page**: `src/app/page.tsx` — **Server**
  - **Key imports:** `@/components/BottomNav`, `@/components/Header`, `@/components/PropertyCard`, `@/components/CategoryFilter`, `@/components/JsonLd`
  - **Navigation (outgoing):** `/search`, `/search?featured=true`, `/search?recent=true`, `/add-property`
- **Companion files (non-route TSX in folder):** `src/app/providers.tsx`

### /add-property

- **page**: `src/app/add-property/page.tsx` — **Client**
  - **Key imports:** `@/components/Navbar`, `@/components/ProtectedRoute`, `@/types`, `@/lib/storage`
  - **Data sources (heuristic):** lib/storage
  - **Navigation (outgoing):** `/`

### /admin

- **layout**: `src/app/admin/layout.tsx` — **Server**
  - **Key imports:** `@/components/auth/AdminGuard`
- **page**: `src/app/admin/page.tsx` — **Client**
  - **Key imports:** `@/services/supabaseService`, `@/components/ui/glass`, `@/types`
  - **Data sources (heuristic):** supabaseService

### /auth

- **page**: `src/app/auth/page.tsx` — **Client**
  - **Key imports:** `@/components/auth/SignUpForm`, `@/components/auth/LoginForm`, `@/components/auth/ResetPasswordForm`

### /bookings

- **page**: `src/app/bookings/page.tsx` — **Client**
  - **Key imports:** `@/components/BottomNav`

### /favorites

- **page**: `src/app/favorites/page.tsx` — **Server**
  - **Key imports:** `./FavoritesClient`
- **Companion files (non-route TSX in folder):** `src/app/favorites/FavoritesClient.tsx`

### /login

- **page**: `src/app/login/page.tsx` — **Client**
  - **Key imports:** `@/context/AuthContext`
  - **Navigation (outgoing):** `/register`

### /messages

- **page**: `src/app/messages/page.tsx` — **Client**
  - **Key imports:** `@/context/AuthContext`, `@/services/supabaseService`, `@/lib/supabase`, `@/components/Header`, `@/components/chat/SecurityAlert`, `@/components/chat/UnreadBadge`, `@/components/chat/OnlineIndicator`
  - **Data sources (heuristic):** supabaseService
  - **Navigation (outgoing):** `/auth`

### /my-properties

- **page**: `src/app/my-properties/page.tsx` — **Client**
  - **Key imports:** `@/components/Header`, `@/components/BottomNav`, `@/components/MyPropertyCard`, `@/types`, `@/lib/storage`, `@/context/AuthContext`, `@/components/ProtectedRoute`
  - **Data sources (heuristic):** lib/storage, localStorage
  - **Navigation (outgoing):** `/auth`, `/add-property`

### /notifications

- **page**: `src/app/notifications/page.tsx` — **Client**
  - **Key imports:** `@/hooks/useUser`, `@/lib/notifications`, `@/components/notifications/NotificationCard`, `@/components/notifications/EmptyState`

### /profile

- **page**: `src/app/profile/page.tsx` — **Client**
  - **Key imports:** `@/context/AuthContext`, `@/services/supabaseService`, `@/components/BottomNav`, `@/components/profile/EditProfileModal`, `@/types`
  - **Data sources (heuristic):** supabaseService
  - **Navigation (outgoing):** `/auth`, `/support`

### /register

- **page**: `src/app/register/page.tsx` — **Client**
  - **Key imports:** `@/context/AuthContext`
  - **Navigation (outgoing):** `/login`, `/`

### /robots.txt

- **route handler**: `src/app/robots.ts` — **Server**

### /search

- **page**: `src/app/search/page.tsx` — **Server**
  - **Key imports:** `@/components/JsonLd`, `@/services/supabaseService`, `./client`, `@/types`
  - **Data sources (heuristic):** supabaseService
- **Companion files (non-route TSX in folder):** `src/app/search/client.tsx`

### /sitemap.xml

- **route handler**: `src/app/sitemap.ts` — **Server**
  - **Key imports:** `@/services/supabaseService`
  - **Data sources (heuristic):** supabaseService

### /admin/payments

- **page**: `src/app/admin/payments/page.tsx` — **Client**
  - **Key imports:** `@/lib/supabase`, `@/services/supabaseService`, `@/components/ui/glass`
  - **Data sources (heuristic):** supabaseService

### /admin/properties

- **page**: `src/app/admin/properties/page.tsx` — **Client**
  - **Key imports:** `@/services/supabaseService`, `@/components/ui/glass`, `@/types`
  - **Data sources (heuristic):** supabaseService

### /admin/users

- **page**: `src/app/admin/users/page.tsx` — **Client**
  - **Key imports:** `@/services/supabaseService`, `@/types/database.types`, `@/components/ui/glass`
  - **Data sources (heuristic):** supabaseService

### /messages/[id]

- **page**: `src/app/messages/[id]/page.tsx` — **Client**
  - **Key imports:** `@/context/AuthContext`, `@/services/supabaseService`, `@/lib/supabase`, `@/components/chat/PropertyContextCard`, `@/components/chat/ChatInput`, `@/components/chat/MessageBubble`, `@/components/chat/ImageMessage`, `@/components/chat/VoiceNoteBubble`, `@/components/chat/SystemMessage`, `@/components/chat/DateSeparator`
  - **Data sources (heuristic):** supabaseService

### /property/[id]

- **page**: `src/app/property/[id]/page.tsx` — **Server**
  - **Key imports:** `@/services/supabaseService`, `./client`, `@/types`, `@/components/JsonLd`
  - **Data sources (heuristic):** supabaseService
- **Companion files (non-route TSX in folder):** `src/app/property/[id]/client.tsx`

### /property/[id]/booking

- **page**: `src/app/property/[id]/booking/page.tsx` — **Server**
  - **Key imports:** `@/services/supabaseService`, `./client`
  - **Data sources (heuristic):** supabaseService
- **Companion files (non-route TSX in folder):** `src/app/property/[id]/booking/client.tsx`

### /property/[id]/booking/confirmation

- **page**: `src/app/property/[id]/booking/confirmation/page.tsx` — **Client**
  - **Key imports:** `@/context/AuthContext`, `@/services/supabaseService`, `@/types`
  - **Data sources (heuristic):** supabaseService
  - **Navigation (outgoing):** `/`, `/profile/bookings`

---

## 4) Known Broken Links / Mismatches (from code scan)

- `/bookings` يحتوي رابط property خاطئ غالبًا: `'/properties/${id}'` بدل `'/property/${id}'`.

- `booking/confirmation` يعمل redirect إلى `/profile/bookings` بينما لا يوجد Route بهذا الاسم (الموجود: `/profile` و`/bookings`).

- `/add-property` يستورد `ProtectedRoute` لكن يجب التأكد أنه مستخدم فعليًا (وإلا الصفحة غير محمية).

- تدفق Auth غير موحد: وجود `/auth` بجانب `/login` و`/register` قد يسبب استدعاءات دوال غير موجودة داخل `AuthContext`.

- تحقق DB: `unlocked_properties` في `schema.sql` يبدو Composite PK، لذلك أي كود يعمل `.select('id')` قد يكسر.
