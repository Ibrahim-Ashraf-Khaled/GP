# 🤖 Cursor AI Agent - Prompts للتنفيذ التدريجي

## 📋 نظرة عامة

هذا الملف يحتوي على سلسلة Prompts متدرجة لـ Cursor AI Agent لتنفيذ خطة إصلاح مشروع Gamasa Properties.
استخدم هذه الـ Prompts **بالترتيب** وانتظر إتمام كل prompt قبل الانتقال للتالي.

**المدة الإجمالية:** 4 أسابيع (80 ساعة)
**الأولوية:** P0 (Blocker) → P1 (High) → P2 (Medium) → P3 (Low)

---

## 🎯 Prompt #0: التهيئة الأولية (Context Loading)

```
أنت Cursor AI Agent متخصص في Next.js 16، React 19، TypeScript، و Supabase.

مهمتك: إصلاح مشروع Gamasa Properties (منصة عقارية) بناءً على تحليل تقني شامل.

# معلومات المشروع:
- التقنيات: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase
- الميزات: مصادقة، إدارة عقارات، حجوزات، خرائط Leaflet، رسائل
- الحالة: Mock Mode حالياً، به 10 مشاكل حرجة

# الملفات التحليلية المتوفرة:
1. gamasa_technical_analysis.md - التحليل الفني الكامل
2. gamasa_tasks_actionable.md - المهام القابلة للتنفيذ
3. gamasa_unified_analysis.md - التحليل الموحد
4. gamasa_daily_execution_plan.md - الخطة اليومية
5. gamasa_comparison_analysis.md - المقارنة والقرارات
6. gamasa_ai_agent_prompts.md - دليل الـ Prompts

# خطوتك الأولى:
1. اقرأ ملف `gamasa_unified_analysis.md` بالكامل
2. افهم المشاكل الحرجة العشرة
3. راجع خطة التنفيذ (4 أسابيع)
4. أكّد فهمك بملخص قصير

أخبرني عندما تنتهي من القراءة وأنت جاهز للبدء.
```

**انتظر رد Cursor ثم انتقل للـ Prompt التالي**

---

## 🔴 Prompt #1: الأسبوع الأول - Day 1 Setup

```
ممتاز! الآن سنبدأ الأسبوع الأول: إصلاحات حرجة.

# اليوم الأول - المهام:

## Task 1.1: Git Setup
أنشئ branch جديد للعمل:

```bash
git checkout -b week1-critical-fixes
```

## Task 1.2: Fix IS_MOCK_MODE (P0 - Blocker)

**المشكلة:** `IS_MOCK_MODE = true` مُثبت في الكود.

**الملفات المتأثرة:**
- src/services/supabaseService.ts (Line 6)
- src/context/AuthContext.tsx (Line 9)

**المطلوب:**
1. في `src/services/supabaseService.ts` Line 6، غيّر:
```typescript
// من:
export const IS_MOCK_MODE = true;

// إلى:
export const IS_MOCK_MODE = 
  typeof window !== 'undefined'
    ? window.localStorage.getItem('DEV_MOCK_MODE') === 'true'
    : process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true';
```

2. في `src/context/AuthContext.tsx` Line 9، غيّر:
```typescript
// من:
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true' || true;

// إلى:
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true';
```

3. تأكد من وجود `.env.local`:
```env
NEXT_PUBLIC_IS_MOCK_MODE=true
NEXT_PUBLIC_SUPABASE_URL=your-dev-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-key
```

**التحقق:**
- [ ] الكود يعمل في mock mode (NEXT_PUBLIC_IS_MOCK_MODE=true)
- [ ] الكود يعمل في production mode (NEXT_PUBLIC_IS_MOCK_MODE=false)
- [ ] لا توجد أخطاء console

**Commit Message:**
```
fix: Remove hardcoded IS_MOCK_MODE flag

- Changed IS_MOCK_MODE to read from environment
- Removed || true fallback in AuthContext
- Added proper .env files

Fixes #1 (Mock Mode Blocker)
```

نفّذ هذه المهمة وأخبرني بالنتيجة.
```

---

## 🔴 Prompt #2: Fix SQL Injection (P0)

```
ممتاز! الآن المهمة التالية.

## Task 1.3: Fix SQL Injection (P0 - Critical Security)

**المشكلة:** استخدام string interpolation في SQL queries.

**الملف:** `src/services/supabaseService.ts`

**ابحث عن:**
```typescript
.or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
```

**استبدله بـ:**
```typescript
.gte('end_date', startDate)
.lte('start_date', endDate)
```

**الخطوات:**
1. افتح `src/services/supabaseService.ts`
2. ابحث عن دالة `checkAvailability`
3. غيّر السطر الذي يحتوي على `.or()`
4. احذف أي استخدام آخر لـ template literals في queries

**اختبار:**
جرّب استدعاء الدالة مع malicious input:
```typescript
checkAvailability('prop-1', '2024-01-01', "2024-01-01' OR '1'='1")
```
يجب ألا يسبب خطأ SQL.

**Commit:**
```
fix: Prevent SQL injection in availability check

- Replaced .or() string interpolation with .gte()/.lte()
- Removed all template literals from SQL queries

Fixes #5 (SQL Injection)
```

نفّذ ثم أخبرني.
```

---

## 🔴 Prompt #3: Fix Schema/Types Mismatch (P1)

```
عظيم! التالي.

## Task 1.4: Schema/Types Alignment (P1 - High)

**المشكلة:** Schema يستخدم إنجليزي، Types تستخدم عربي.

**مثال:**
- Schema: `booking_type IN ('day', 'week', ...)`
- Types: `booking_type: 'يوم' | 'أسبوع' | ...`

**الحل:** توحيد على الإنجليزية في كل مكان.

### Step 1: إنشاء Migration

أنشئ ملف: `supabase/migrations/20260208_fix_enum_values.sql`

```sql
-- Fix booking_type
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_booking_type_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_booking_type_check 
CHECK (booking_type IN ('daily', 'weekly', 'monthly', 'seasonal'));

-- Fix property category
ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_category_check;

ALTER TABLE properties
ADD CONSTRAINT properties_category_check
CHECK (category IN ('apartment', 'villa', 'chalet', 'studio', 'office', 'land'));

-- Fix property status
ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE properties
ADD CONSTRAINT properties_status_check
CHECK (status IN ('available', 'unavailable', 'pending', 'rented'));
```

### Step 2: تحديث Types

في `src/types/database.types.ts`:

```typescript
export type BookingType = 'daily' | 'weekly' | 'monthly' | 'seasonal';
export type PropertyCategory = 'apartment' | 'villa' | 'chalet' | 'studio' | 'office' | 'land';
export type PropertyStatus = 'available' | 'unavailable' | 'pending' | 'rented';

// Add translation maps for UI
export const BOOKING_TYPE_AR: Record<BookingType, string> = {
  daily: 'يومي',
  weekly: 'أسبوعي',
  monthly: 'شهري',
  seasonal: 'موسمي'
};

export const CATEGORY_AR: Record<PropertyCategory, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  chalet: 'شاليه',
  studio: 'استوديو',
  office: 'مكتب',
  land: 'أرض'
};
```

### Step 3: تحديث المكونات

ابحث عن كل مكان يعرض `property.category` أو `booking.type` واستخدم الترجمة:

```typescript
// مثال في PropertyCard.tsx
import { CATEGORY_AR } from '@/types/database.types';

<span>{CATEGORY_AR[property.category]}</span>
```

**ملاحظة:** قد تحتاج تحديث 10-15 ملف.

**Commit:**
```
fix: Align database schema with TypeScript types

Schema changes:
- booking_type: Arabic → English values
- category: Arabic → English values
- status: Arabic → English values

Code changes:
- Updated database.types.ts
- Added translation maps (CATEGORY_AR, etc)
- Updated all components to use translations

Fixes #7 (Schema/Types Mismatch)
```

ابدأ بالخطوة الأولى وأخبرني عند الانتهاء من كل خطوة.
```

---

## 🔴 Prompt #4: Race Condition Fix - Part 1 (Database)

```
ممتاز! الآن نصل للمشكلة الأكبر: Race Condition.

## Task 1.5: Race Condition Fix - Database Function (P0)

**المشكلة:** checkAvailability و createBooking عمليتان منفصلتان.
**النتيجة:** إمكانية حجز مزدوج.

**الحل:** إنشاء database function ذرية (atomic).

### Step 1: إنشاء Function

أنشئ ملف: `supabase/migrations/20260208_atomic_booking.sql`

```sql
CREATE OR REPLACE FUNCTION create_booking_atomically(
  p_property_id UUID,
  p_guest_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_rental_type TEXT,
  p_total_amount DECIMAL,
  p_booking_type TEXT
) RETURNS TABLE(
  booking_id UUID, 
  success BOOLEAN, 
  error_message TEXT
) AS $$
DECLARE
  v_booking_id UUID;
  v_conflict_count INT;
BEGIN
  -- Lock the property's booking rows
  PERFORM id FROM bookings
  WHERE property_id = p_property_id
    AND status IN ('confirmed', 'pending')
  FOR UPDATE;
  
  -- Check for overlapping bookings
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE property_id = p_property_id
    AND status IN ('confirmed', 'pending')
    AND (
      (p_start_date >= start_date AND p_start_date < end_date)
      OR
      (p_end_date > start_date AND p_end_date <= end_date)
      OR
      (p_start_date <= start_date AND p_end_date >= end_date)
    );
  
  IF v_conflict_count > 0 THEN
    RETURN QUERY SELECT 
      NULL::UUID, 
      FALSE, 
      'العقار محجوز في هذه الفترة'::TEXT;
    RETURN;
  END IF;
  
  -- Validate dates
  IF p_end_date <= p_start_date THEN
    RETURN QUERY SELECT 
      NULL::UUID, 
      FALSE, 
      'تاريخ الانتهاء يجب أن يكون بعد البداية'::TEXT;
    RETURN;
  END IF;
  
  -- Check property available
  IF NOT EXISTS (
    SELECT 1 FROM properties 
    WHERE id = p_property_id 
      AND status = 'available'
  ) THEN
    RETURN QUERY SELECT 
      NULL::UUID, 
      FALSE, 
      'العقار غير متاح للحجز'::TEXT;
    RETURN;
  END IF;
  
  -- Create booking
  INSERT INTO bookings (
    property_id,
    guest_id,
    start_date,
    end_date,
    rental_type,
    total_amount,
    booking_type,
    status
  ) VALUES (
    p_property_id,
    p_guest_id,
    p_start_date,
    p_end_date,
    p_rental_type,
    p_total_amount,
    p_booking_type,
    'pending'
  ) RETURNING id INTO v_booking_id;
  
  RETURN QUERY SELECT 
    v_booking_id, 
    TRUE, 
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_property_date_status
ON bookings (property_id, start_date, end_date, status)
WHERE status IN ('confirmed', 'pending');
```

### Step 2: التطبيق

يجب تطبيق هذا الـ migration في Supabase:
1. اذهب لـ Supabase Dashboard
2. SQL Editor
3. انسخ الـ SQL أعلاه
4. Run
5. تأكد من عدم وجود أخطاء

**أو استخدم CLI:**
```bash
supabase db push
```

**Commit:**
```
feat: Add atomic booking database function

- Created create_booking_atomically function
- Added proper overlap detection
- Added date validation
- Added property status check
- Added performance index

Part 1 of fixing #3 (Race Condition)
```

أخبرني عند الانتهاء من هذه الخطوة.
```

---

## 🔴 Prompt #5: Race Condition Fix - Part 2 (TypeScript)

```
رائع! الآن نحدّث الكود ليستخدم الـ Function.

## Task 1.6: Race Condition Fix - TypeScript Integration (P0)

### Step 1: حذف checkAvailability

في `src/services/supabaseService.ts`:
- احذف دالة `checkAvailability` بالكامل (لم تعد ضرورية)

### Step 2: تحديث createBooking

استبدل دالة `createBooking` بالكامل:

```typescript
interface CreateBookingParams {
  propertyId: string;
  guestId: string;
  startDate: string;
  endDate: string;
  rentalType: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  totalAmount: number;
  bookingType: 'online' | 'offline';
}

interface BookingResult {
  data: { id: string } | null;
  error: { message: string } | null;
}

async createBooking(params: CreateBookingParams): Promise<BookingResult> {
  if (IS_MOCK_MODE) {
    const mockBooking = {
      id: `BK-${Date.now()}`,
      ...params,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: { id: mockBooking.id },
      error: null
    };
  }

  try {
    const { data, error } = await supabase.rpc('create_booking_atomically', {
      p_property_id: params.propertyId,
      p_guest_id: params.guestId,
      p_start_date: params.startDate,
      p_end_date: params.endDate,
      p_rental_type: params.rentalType,
      p_total_amount: params.totalAmount,
      p_booking_type: params.bookingType
    });

    if (error) {
      return {
        data: null,
        error: { message: 'حدث خطأ في إنشاء الحجز' }
      };
    }

    const result = data?.[0];
    
    if (!result?.success) {
      return {
        data: null,
        error: { message: result?.error_message || 'فشل الحجز' }
      };
    }

    return {
      data: { id: result.booking_id },
      error: null
    };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message || 'حدث خطأ غير متوقع' }
    };
  }
}
```

### Step 3: تحديث استدعاءات الدالة

ابحث في المشروع عن أي مكان يستخدم `checkAvailability`:
```bash
grep -r "checkAvailability" src/
```

احذف جميع الاستدعاءات لأنها أصبحت جزءاً من `createBooking`.

### Step 4: تحديث BookingPage

في `src/app/property/[id]/booking/page.tsx`:

```typescript
const handleBooking = async () => {
  if (!user) {
    alert('يجب تسجيل الدخول أولاً');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const { data, error } = await supabaseService.createBooking({
      propertyId: params.id,
      guestId: user.id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      rentalType: bookingType,
      totalAmount: priceBreakdown.totalPrice,
      bookingType: 'online'
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/my-bookings'), 2000);
    
  } catch (err: any) {
    setError(err.message || 'حدث خطأ في الحجز');
  } finally {
    setLoading(false);
  }
};
```

**Commit:**
```
fix: Implement atomic booking to prevent race conditions

- Removed checkAvailability (now part of atomic function)
- Updated createBooking to use RPC
- Updated BookingPage to handle new flow
- Added comprehensive error handling

Fixes #3 (Race Condition in Bookings)
```

أخبرني عند الانتهاء.
```

---

## 🔴 Prompt #6: Fix unlockProperty Payment Bypass (P0)

```
ممتاز! الآن مشكلة أمنية حرجة أخرى.

## Task 1.7: Secure unlockProperty (P0 - Critical Security)

**المشكلة:** أي شخص يمكنه فتح أي عقار بدون دفع.

### Step 1: إضافة عمود is_consumed

ملف: `supabase/migrations/20260208_payment_consumed.sql`

```sql
-- Add is_consumed column
ALTER TABLE payment_requests 
ADD COLUMN IF NOT EXISTS is_consumed BOOLEAN DEFAULT FALSE;

-- Add index
CREATE INDEX IF NOT EXISTS idx_payment_requests_active
ON payment_requests(property_id, user_id, status, is_consumed)
WHERE status = 'approved' AND is_consumed = FALSE;

-- Prevent duplicate unconsumed payments
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_requests_unique_active
ON payment_requests(property_id, user_id)
WHERE status = 'approved' AND is_consumed = FALSE;
```

### Step 2: إنشاء دالة Unlock Atomic

ملف: `supabase/migrations/20260208_atomic_unlock.sql`

```sql
CREATE OR REPLACE FUNCTION unlock_property_with_payment(
  p_user_id UUID,
  p_property_id UUID,
  p_payment_id UUID
) RETURNS VOID AS $$
DECLARE
  v_payment_amount DECIMAL;
  v_min_amount DECIMAL := 50.00;
BEGIN
  -- Mark payment as consumed
  UPDATE payment_requests
  SET is_consumed = TRUE
  WHERE id = p_payment_id
    AND user_id = p_user_id
    AND property_id = p_property_id
    AND status = 'approved'
    AND is_consumed = FALSE
  RETURNING amount INTO v_payment_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'لا يوجد دفع معتمد أو تم استخدامه بالفعل';
  END IF;
  
  -- Validate amount
  IF v_payment_amount < v_min_amount THEN
    UPDATE payment_requests SET is_consumed = FALSE WHERE id = p_payment_id;
    RAISE EXCEPTION 'المبلغ المدفوع (% جنيه) أقل من الحد الأدنى (% جنيه)',
      v_payment_amount, v_min_amount;
  END IF;
  
  -- Insert unlock
  INSERT INTO unlocked_properties (user_id, property_id, unlocked_at)
  VALUES (p_user_id, p_property_id, NOW())
  ON CONFLICT (user_id, property_id) DO NOTHING;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;
```

### Step 3: تحديث الكود

في `src/services/supabaseService.ts`:

```typescript
async unlockProperty(
  userId: string, 
  propertyId: string
): Promise<void> {
  if (IS_MOCK_MODE) {
    _mockUnlocked.add(propertyId);
    return;
  }

  try {
    // Find approved unconsumed payment
    const { data: payment, error: paymentError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .eq('status', 'approved')
      .eq('is_consumed', false)
      .maybeSingle();

    if (paymentError) {
      throw new Error(`خطأ في التحقق من الدفع: ${paymentError.message}`);
    }

    if (!payment) {
      throw new Error('لا يوجد دفع معتمد لهذا العقار. يجب دفع 50 جنيه أولاً');
    }

    // Check if already unlocked
    const { data: alreadyUnlocked } = await supabase
      .from('unlocked_properties')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (alreadyUnlocked) {
      throw new Error('العقار مفتوح بالفعل');
    }

    // Atomic unlock
    const { error: unlockError } = await supabase.rpc(
      'unlock_property_with_payment',
      {
        p_user_id: userId,
        p_property_id: propertyId,
        p_payment_id: payment.id
      }
    );

    if (unlockError) {
      throw new Error(unlockError.message);
    }
  } catch (error: any) {
    throw error;
  }
}
```

**طبّق الـ Migrations في Supabase.**

**Commit:**
```
fix: Secure unlockProperty with payment verification

Database:
- Added is_consumed column to payment_requests
- Created unlock_property_with_payment function
- Added indexes and constraints

Code:
- Updated unlockProperty to verify payment
- Added amount validation (min 50 EGP)
- Prevent payment reuse
- Atomic operation

Fixes #4 (Payment Bypass)
```

أخبرني عند الانتهاء.
```

---

## 🟡 Prompt #7: End of Day 1 - Review & Testing

```
عظيم! أنهينا المهام الحرجة لليوم الأول.

## Day 1 Review & Testing

### ✅ ما تم إنجازه:
1. ✅ Fixed IS_MOCK_MODE (P0)
2. ✅ Fixed SQL Injection (P0)
3. ✅ Fixed Schema/Types mismatch (P1)
4. ✅ Fixed Race Condition (P0)
5. ✅ Fixed Payment Bypass (P0)

### 🧪 Testing Required:

**Test 1: Mock Mode Toggle**
```bash
# Test with mock ON
NEXT_PUBLIC_IS_MOCK_MODE=true npm run dev
# Verify mock data appears

# Test with mock OFF
NEXT_PUBLIC_IS_MOCK_MODE=false npm run dev
# Verify real Supabase data
```

**Test 2: Booking Flow**
1. Open property details page
2. Click "احجز الآن"
3. Select dates
4. Complete form
5. Submit booking
6. Verify: Should succeed or show clear error

**Test 3: Try Double Booking**
Open two browser tabs:
- Tab 1: Book property for March 1-5
- Tab 2: Book same property for March 1-5
- Result: Only ONE should succeed

**Test 4: Unlock Property**
1. Submit payment request (50 EGP)
2. Admin approves payment
3. Try unlock property
4. Should succeed
5. Try unlock again
6. Should fail with "العقار مفتوح بالفعل"

### 📝 Final Commits:

```bash
# Create comprehensive commit
git add .
git commit -m "Day 1: Critical fixes completed

Fixed Issues:
- #1: IS_MOCK_MODE hardcoded (P0)
- #5: SQL Injection (P0)
- #7: Schema/Types mismatch (P1)
- #3: Race Condition in bookings (P0)
- #4: Payment bypass (P0)

Total: 5 critical issues resolved
Time: 8 hours
Status: Ready for Day 2

Tests:
- ✅ Mock mode toggle works
- ✅ Booking prevents double booking
- ✅ Payment verification works
- ✅ No SQL injection vulnerabilities"

# Push to remote
git push origin week1-critical-fixes
```

### 📊 Progress Report:

```
=== اليوم الأول - ملخص ===
✅ المهام المكتملة: 5/5
⏱️  الوقت المستخدم: 8 ساعات
🐛 المشاكل المُصلحة: 5 critical
🧪 الاختبارات: Manual testing
📝 Commits: 6

📋 ليوم غداً (Day 2):
- [ ] Fix Client/Server component issues
- [ ] Add input validation
- [ ] Error boundaries
- [ ] Start auth consolidation
```

قم بتشغيل جميع الاختبارات وأخبرني بالنتائج.
إذا كان كل شيء يعمل، نكون جاهزين لليوم الثاني!
```

---

## 🔵 Prompt #8: الأسبوع الأول - Day 2 Start

```
صباح الخير! نبدأ اليوم الثاني.

## Day 2: Client/Server Components & Validation

### Morning Standup (9:00-9:15):
- [ ] Review yesterday's work
- [ ] Test all fixes still working
- [ ] Check for any issues

### Task 2.1: Fix Client/Server Component Issues (10:00-12:00)

**المشكلة:** صفحات تستخدم hooks بدون 'use client'.

**الملفات المتأثرة:**
- src/app/property/[id]/page.tsx
- src/app/property/[id]/booking/page.tsx
- src/app/page.tsx (optional)

**Pattern للإصلاح:**

#### Before (Server Component with Client Logic):
```typescript
// src/app/property/[id]/page.tsx
export default function PropertyPage({ params }) {
  const [selectedImage, setSelectedImage] = useState(0); // ❌ Hook in server component
  // ...
}
```

#### After (Split Server + Client):

**File 1: page.tsx (Server Component)**
```typescript
// src/app/property/[id]/page.tsx
import { supabaseService } from '@/services/supabaseService';
import { PropertyClient } from './client';
import { notFound } from 'next/navigation';

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await supabaseService.getPropertyById(params.id);
  
  if (!property) {
    notFound();
  }

  return <PropertyClient property={property} />;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const property = await supabaseService.getPropertyById(params.id);
  
  if (!property) return {};

  return {
    title: property.title,
    description: property.description,
    openGraph: {
      images: property.images,
    }
  };
}
```

**File 2: client.tsx (Client Component)**
```typescript
// src/app/property/[id]/client.tsx
'use client';

import { useState } from 'react';
import type { Property } from '@/types';

interface Props {
  property: Property;
}

export function PropertyClient({ property }: Props) {
  const [selectedImage, setSelectedImage] = useState(0); // ✅ Now allowed
  
  return (
    <div>
      {/* All interactive UI here */}
    </div>
  );
}
```

**المطلوب:**
1. طبّق هذا النمط على:
   - property/[id]/page.tsx
   - property/[id]/booking/page.tsx
2. تأكد من عدم وجود أخطاء build
3. اختبر أن الصفحات تعمل

**Commit:**
```
fix: Separate client and server components

- Split PropertyPage into page.tsx (server) + client.tsx
- Split BookingPage into page.tsx (server) + client.tsx
- Added generateMetadata for SEO
- Fixed hydration errors

Fixes #6 (Client/Server Component Issues)
```

ابدأ بهذه المهمة.
```

---

## 🔵 Prompt #9: Add Input Validation

```
## Task 2.2: Add Comprehensive Input Validation (1:00-3:00)

**المشكلة:** لا يوجد validation على المدخلات.

### Step 1: Install Zod

```bash
npm install zod
```

### Step 2: إنشاء Validation Schemas

أنشئ ملف: `src/lib/validation.ts`

```typescript
import { z } from 'zod';

// Email & Phone
export const emailSchema = z.string()
  .email('بريد إلكتروني غير صالح');

export const phoneSchema = z.string()
  .regex(/^01[0-9]{9}$/, 'رقم هاتف مصري غير صالح (يبدأ بـ 01 و 11 رقم)');

// Registration
export const registerSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Za-z]/, 'يجب أن تحتوي على حرف واحد على الأقل')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل'),
  fullName: z.string()
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'الاسم طويل جداً'),
  phone: phoneSchema,
  role: z.enum(['landlord', 'tenant', 'both'])
});

// Property
export const propertySchema = z.object({
  title: z.string()
    .min(10, 'العنوان قصير جداً (10 أحرف كحد أدنى)')
    .max(100, 'العنوان طويل جداً'),
  description: z.string()
    .min(50, 'الوصف قصير جداً')
    .max(2000, 'الوصف طويل جداً'),
  price_per_day: z.number()
    .min(1, 'السعر يجب أن يكون أكبر من صفر')
    .max(1000000, 'السعر كبير جداً'),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(10),
  area: z.number()
    .min(10, 'المساحة يجب أن تكون 10 متر على الأقل')
    .max(10000, 'المساحة كبيرة جداً')
});

// Message
export const messageSchema = z.object({
  content: z.string()
    .min(1, 'الرسالة فارغة')
    .max(1000, 'الرسالة طويلة جداً (1000 حرف كحد أقصى)')
    .transform(sanitizeHtml)
});

// Payment
export const paymentSchema = z.object({
  amount: z.number()
    .min(50, 'الحد الأدنى للدفع 50 جنيه')
    .max(100000, 'المبلغ كبير جداً'),
  payment_method: z.enum(['vodafone_cash', 'instapay', 'fawry']),
  receipt_image: z.string()
    .url('رابط الإيصال غير صالح')
});

// Booking
export const bookingSchema = z.object({
  start_date: z.string().date('تاريخ البداية غير صالح'),
  end_date: z.string().date('تاريخ الانتهاء غير صالح'),
  rental_type: z.enum(['daily', 'weekly', 'monthly', 'seasonal']),
  total_amount: z.number().min(1)
}).refine(data => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end > start;
}, {
  message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
  path: ['end_date']
});

// HTML Sanitization
function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// File Upload Validation
export const IMAGE_VALIDATION = {
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_DIMENSION: 400,
  MAX_DIMENSION: 4000
};

export async function validateImageFile(file: File): Promise<{
  valid: boolean;
  error?: string;
}> {
  if (!IMAGE_VALIDATION.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. استخدم JPEG، PNG، أو WebP'
    };
  }

  if (file.size > IMAGE_VALIDATION.MAX_SIZE) {
    return {
      valid: false,
      error: 'حجم الصورة كبير جداً (الحد الأقصى 5MB)'
    };
  }

  try {
    const dimensions = await getImageDimensions(file);
    
    if (
      dimensions.width < IMAGE_VALIDATION.MIN_DIMENSION ||
      dimensions.height < IMAGE_VALIDATION.MIN_DIMENSION
    ) {
      return {
        valid: false,
        error: `جودة الصورة منخفضة (الحد الأدنى ${IMAGE_VALIDATION.MIN_DIMENSION}px)`
      };
    }
    
    if (
      dimensions.width > IMAGE_VALIDATION.MAX_DIMENSION ||
      dimensions.height > IMAGE_VALIDATION.MAX_DIMENSION
    ) {
      return {
        valid: false,
        error: `الصورة كبيرة جداً (الحد الأقصى ${IMAGE_VALIDATION.MAX_DIMENSION}px)`
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: 'فشل قراءة أبعاد الصورة'
    };
  }

  return { valid: true };
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}
```

### Step 3: تطبيق في النماذج

**مثال: LoginForm**

```typescript
// src/components/auth/LoginForm.tsx
import { registerSchema } from '@/lib/validation';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  try {
    const validData = registerSchema.parse({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone,
      role: formData.role
    });
    
    // Proceed with valid data
    await register(validData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Show validation errors
      const errors = error.errors.map(e => e.message).join('\n');
      setError(errors);
    }
  }
};
```

**المطلوب:**
1. طبّق validation على:
   - Login/Register forms
   - Property creation form
   - Booking form
   - Message form
   - Payment form
2. أضف file upload validation
3. اختبر جميع النماذج

**Commit:**
```
feat: Add comprehensive input validation

- Installed Zod for schema validation
- Created validation schemas for all forms
- Added file upload validation
- Added XSS prevention (sanitizeHtml)
- Applied validation to all user inputs

Security improvements:
- ✓ Email validation
- ✓ Phone validation (Egyptian numbers)
- ✓ Password strength requirements
- ✓ File type/size validation
- ✓ XSS prevention

Fixes #8 (Input Validation Gaps)
```

نفّذ هذه المهمة.
```

---

## 📝 ملاحظات للاستخدام

### كيفية استخدام هذه الـ Prompts:

1. **ابدأ بـ Prompt #0** (Context Loading)
2. **انتظر رد Cursor** قبل الانتقال للتالي
3. **تحقق من كل خطوة** قبل المتابعة
4. **اختبر كل إصلاح** فوراً
5. **Commit بعد كل مهمة** مكتملة

### إذا واجهت مشاكل:

```
واجهت مشكلة في [اسم المهمة]:

الخطأ:
[نص الخطأ]

ما حاولت:
[وصف المحاولات]

الملفات المتأثرة:
[قائمة الملفات]

من فضلك ساعدني في:
1. فهم سبب الخطأ
2. الحل الصحيح
3. كيف أتجنبه في المستقبل
```

### للتحقق من التقدم:

```
أريد مراجعة التقدم حتى الآن:

1. ما المهام التي أكملناها؟
2. ما المهام المتبقية لهذا الأسبوع؟
3. هل هناك مشاكل يجب معالجتها؟
4. ما هو الوضع العام للمشروع؟

أعطني ملخص شامل.
```

---

## 🎯 الأسابيع المتبقية

الـ Prompts أعلاه تغطي **الأسبوع الأول (الأيام 1-2)**.

**للأسابيع المتبقية:**
- استخدم نفس النمط
- ارجع لـ `gamasa_daily_execution_plan.md`
- اتبع المهام يوماً بيوم
- استخدم `gamasa_unified_analysis.md` كمرجع

---

**ملاحظة نهائية:**
هذه الـ Prompts مصممة لتكون **تدريجية ومفصلة**. كل prompt يحتوي على:
- ✅ السياق الكامل
- ✅ الكود الجاهز
- ✅ خطوات التنفيذ
- ✅ الاختبارات
- ✅ Commit messages

**ابدأ الآن بـ Prompt #0!** 🚀
