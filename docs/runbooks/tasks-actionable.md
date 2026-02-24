# 📋 Gamasa Properties - قائمة المهام القابلة للتنفيذ

## 🎯 نظام الأولويات

- **P0 (حرج):** يمنع النشر - يجب الإصلاح فوراً
- **P1 (عالي):** يؤثر على الأمان/الإيرادات - يُصلح في الأسبوع الأول
- **P2 (متوسط):** يحسّن الجودة - يُصلح في الأسابيع 2-3
- **P3 (منخفض):** تحسينات - يُصلح لاحقاً

---

## 🔴 المرحلة 1: إصلاحات حرجة (الأسبوع 1)

### Task #1.1: إصلاح علامة Mock Mode المُثبتة
**الأولوية:** P0 (حرج - عائق للنشر)
**الوقت المقدر:** 1 ساعة
**المُكلف:** Backend Developer

**الملفات المتأثرة:**
- `src/services/supabaseService.ts` (السطر 6)

**الخطوات:**
1. افتح `src/services/supabaseService.ts`
2. ابحث عن السطر: `export const IS_MOCK_MODE = true;`
3. استبدله بـ:
```typescript
export const IS_MOCK_MODE = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true';
```
4. تأكد من وجود `.env.local` مع:
```
NEXT_PUBLIC_IS_MOCK_MODE=false
```
5. اختبر التطبيق في الوضعين (mock وحقيقي)

**معايير القبول:**
- ✅ المتغير يقرأ من البيئة
- ✅ يمكن التبديل بين الأوضاع بتغيير `.env.local`
- ✅ التطبيق يعمل في كلا الوضعين

---

### Task #1.2: حذف/إعادة كتابة AdminGuard المعطل
**الأولوية:** P0 (حرج - خطأ تنفيذي)
**الوقت المقدر:** 2 ساعات
**المُكلف:** Frontend Developer

**الملفات المتأثرة:**
- `src/components/auth/AdminGuard.tsx`
- `src/app/admin/**/page.tsx` (جميع صفحات الإدارة)

**الخطوات:**
1. **الخيار A: حذف AdminGuard**
   - احذف `src/components/auth/AdminGuard.tsx`
   - في كل صفحة إدارة، أضف:
   ```typescript
   import { useUser } from '@/hooks/useUser';
   import { redirect } from 'next/navigation';
   
   const { user, loading } = useUser();
   
   useEffect(() => {
     if (!loading && !user?.profile?.is_admin) {
       redirect('/');
     }
   }, [user, loading]);
   ```

2. **الخيار B: إعادة كتابة AdminGuard**
   ```typescript
   // src/components/auth/AdminGuard.tsx
   'use client';
   
   import { useUser } from '@/hooks/useUser';
   import { redirect } from 'next/navigation';
   import { useEffect } from 'react';
   
   export function AdminGuard({ children }: { children: React.ReactNode }) {
     const { user, loading } = useUser();
     
     useEffect(() => {
       if (!loading && !user?.profile?.is_admin) {
         redirect('/');
       }
     }, [user, loading]);
     
     if (loading) {
       return <div>جاري التحميل...</div>;
     }
     
     if (!user?.profile?.is_admin) {
       return null;
     }
     
     return <>{children}</>;
   }
   ```

**معايير القبول:**
- ✅ لا توجد أخطاء console
- ✅ المستخدم العادي لا يمكنه الوصول لصفحات الإدارة
- ✅ المشرف يمكنه الوصول بدون مشاكل
- ✅ التحويل التلقائي يعمل

---

### Task #1.3: إضافة تحقق من صحة الدفع
**الأولوية:** P0 (حرج - خطر احتيال)
**الوقت المقدر:** 2 ساعات
**المُكلف:** Backend Developer

**الملفات المتأثرة:**
- `src/services/supabaseService.ts` (دالة `createPaymentRequest`)

**الخطوات:**
1. افتح `src/services/supabaseService.ts`
2. ابحث عن دالة `createPaymentRequest`
3. أضف التحققات في البداية:
```typescript
async createPaymentRequest(params: {
  userId: string;
  propertyId: string;
  amount: number;
  paymentMethod: 'vodafone_cash' | 'instapay' | 'fawry';
  receiptImage?: string;
}): Promise<void> {
  // ===== إضافة التحققات =====
  
  // 1. التحقق من الحد الأدنى للمبلغ
  if (params.amount < 50) {
    throw new Error('الحد الأدنى للدفع 50 جنيه');
  }
  
  // 2. التحقق من وجود الإيصال
  if (!params.receiptImage) {
    throw new Error('يجب رفع صورة الإيصال');
  }
  
  // 3. التحقق من وجود العقار
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('id')
    .eq('id', params.propertyId)
    .single();
    
  if (propError || !property) {
    throw new Error('العقار غير موجود');
  }
  
  // 4. منع الطلبات المكررة
  const { data: existing } = await supabase
    .from('payment_requests')
    .select('id')
    .eq('user_id', params.userId)
    .eq('property_id', params.propertyId)
    .eq('status', 'pending')
    .maybeSingle();
    
  if (existing) {
    throw new Error('لديك طلب دفع قيد المراجعة بالفعل');
  }
  
  // ===== الكود الأصلي يستمر =====
  if (IS_MOCK_MODE) {
    return;
  }
  
  // ... باقي الدالة
}
```

**معايير القبول:**
- ✅ لا يمكن إرسال دفع أقل من 50 جنيه
- ✅ لا يمكن إرسال دفع بدون إيصال
- ✅ لا يمكن إرسال طلب مكرر
- ✅ رسالة خطأ واضحة للمستخدم

---

### Task #1.4: إصلاح SQL Injection في استعلام التوافر
**الأولوية:** P0 (حرج - ثغرة أمنية)
**الوقت المقدر:** 30 دقيقة
**المُكلف:** Backend Developer

**الملفات المتأثرة:**
- `src/services/supabaseService.ts` (دالة `checkAvailability`)

**الخطوات:**
1. ابحث عن السطر:
```typescript
.or(`start_date.lte.${endDate},end_date.gte.${startDate}`);
```

2. استبدله بـ:
```typescript
.or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
// يُستبدل بـ:
.gte('end_date', startDate)
.lte('start_date', endDate)
```

أو الأفضل:
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select('id')
  .eq('property_id', propertyId)
  .in('status', ['confirmed', 'pending'])
  .filter('start_date', 'lte', endDate)
  .filter('end_date', 'gte', startDate);
```

**معايير القبول:**
- ✅ لا يوجد string interpolation مباشر
- ✅ الاستعلام يعمل بشكل صحيح
- ✅ اختبار مع تواريخ مختلفة

---

### Task #1.5: تطبيق معاملة حجز ذرية (Atomic Booking)
**الأولوية:** P1 (عالي - خطر حجز مزدوج)
**الوقت المقدر:** 4 ساعات
**المُكلف:** Backend Developer + Database Admin

**الملفات المتأثرة:**
- ملف SQL جديد: `supabase/migrations/add_atomic_booking.sql`
- `src/services/supabaseService.ts` (دالة `createBooking`)

**الخطوات:**

**الجزء 1: إنشاء دالة قاعدة البيانات**

1. أنشئ ملف `supabase/migrations/YYYYMMDD_atomic_booking.sql`:
```sql
-- دالة لإنشاء حجز بشكل ذري
CREATE OR REPLACE FUNCTION create_booking_atomically(
  p_property_id UUID,
  p_user_id UUID,
  p_guest_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_total_price DECIMAL,
  p_booking_type TEXT,
  p_status TEXT DEFAULT 'pending'
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_conflict_count INT;
BEGIN
  -- قفل الصفوف للتحقق من التوافر
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE property_id = p_property_id
    AND status IN ('confirmed', 'pending')
    AND (start_date, end_date) OVERLAPS (p_start_date, p_end_date)
  FOR UPDATE;
  
  -- إذا كان هناك تعارض، ارفع استثناء
  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'العقار محجوز في هذه الفترة';
  END IF;
  
  -- إنشاء الحجز
  INSERT INTO bookings (
    property_id,
    user_id,
    guest_id,
    start_date,
    end_date,
    total_price,
    booking_type,
    status
  ) VALUES (
    p_property_id,
    p_user_id,
    p_guest_id,
    p_start_date,
    p_end_date,
    p_total_price,
    p_booking_type,
    p_status
  ) RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;
```

2. نفّذ الترحيل في Supabase Dashboard

**الجزء 2: تحديث الكود**

3. في `src/services/supabaseService.ts`، استبدل `createBooking`:
```typescript
async createBooking(bookingData: any): Promise<{ data: any; error: any }> {
  if (IS_MOCK_MODE) {
    // ... الكود الموجود
  }

  try {
    const { data, error } = await supabase.rpc('create_booking_atomically', {
      p_property_id: bookingData.propertyId,
      p_user_id: bookingData.userId,
      p_guest_id: bookingData.guestId,
      p_start_date: bookingData.startDate,
      p_end_date: bookingData.endDate,
      p_total_price: bookingData.totalPrice,
      p_booking_type: bookingData.bookingType,
      p_status: 'pending'
    });

    if (error) throw error;

    return { 
      data: { id: data }, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}
```

**معايير القبول:**
- ✅ لا يمكن حجز نفس التواريخ مرتين
- ✅ رسالة خطأ واضحة عند التعارض
- ✅ اختبار concurrent requests (طلبين في نفس الوقت)

---

### Task #1.6: إضافة تحقق من الدفع في unlockProperty
**الأولوية:** P0 (حرج - تجاوز دفع)
**الوقت المقدر:** 3 ساعات
**المُكلف:** Backend Developer

**الملفات المتأثرة:**
- `supabase/migrations/add_payment_consumed.sql`
- `src/services/supabaseService.ts` (دالة `unlockProperty`)

**الخطوات:**

**الجزء 1: إضافة عمود في قاعدة البيانات**

1. أنشئ ملف ترحيل SQL:
```sql
-- إضافة عمود is_consumed إلى payment_requests
ALTER TABLE payment_requests 
ADD COLUMN IF NOT EXISTS is_consumed BOOLEAN DEFAULT FALSE;

-- فهرس للاستعلامات السريعة
CREATE INDEX IF NOT EXISTS idx_payment_requests_consumed 
ON payment_requests(user_id, property_id, status, is_consumed);
```

**الجزء 2: تحديث دالة unlockProperty**

2. استبدل الدالة بالكامل:
```typescript
async unlockProperty(userId: string, propertyId: string): Promise<void> {
  if (IS_MOCK_MODE) {
    _mockUnlocked.add(propertyId);
    return;
  }

  // 1. التحقق من وجود دفع معتمد وغير مستهلك
  const { data: payment, error: paymentError } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .eq('status', 'approved')
    .eq('is_consumed', false)
    .maybeSingle();

  if (paymentError) {
    throw new Error('خطأ في التحقق من الدفع');
  }

  if (!payment) {
    throw new Error('لا يوجد دفع معتمد لهذا العقار');
  }

  if (payment.amount < 50) {
    throw new Error('المبلغ المدفوع غير كافٍ');
  }

  // 2. التحقق من عدم فتح العقار مسبقاً
  const { data: alreadyUnlocked } = await supabase
    .from('unlocked_properties')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (alreadyUnlocked) {
    throw new Error('العقار مفتوح بالفعل');
  }

  // 3. معاملة لتحديث الدفع وفتح العقار
  try {
    // تحديد الدفع كمستهلك
    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({ is_consumed: true })
      .eq('id', payment.id);

    if (updateError) throw updateError;

    // فتح العقار
    const { error: unlockError } = await supabase
      .from('unlocked_properties')
      .insert({
        user_id: userId,
        property_id: propertyId
      });

    if (unlockError) {
      // إعادة الدفع لحالة غير مستهلك إذا فشل الفتح
      await supabase
        .from('payment_requests')
        .update({ is_consumed: false })
        .eq('id', payment.id);
      
      throw unlockError;
    }
  } catch (error: any) {
    throw new Error(`فشل فتح العقار: ${error.message}`);
  }
}
```

**معايير القبول:**
- ✅ لا يمكن فتح عقار بدون دفع معتمد
- ✅ لا يمكن استخدام نفس الدفع مرتين
- ✅ رسائل خطأ واضحة
- ✅ Rollback تلقائي عند الفشل

---

### Task #1.7: إصلاح وظائف المصادقة المفقودة في AuthContext
**الأولوية:** P1 (عالي - خطأ تنفيذي)
**الوقت المقدر:** 2 ساعات
**المُكلف:** Frontend Developer

**الملفات المتأثرة:**
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignUpForm.tsx`
- أو `src/context/AuthContext.tsx` (إذا قررنا الإبقاء عليه)

**الخيارات:**

**الخيار A: حذف الأزرار الاجتماعية (سريع)**
1. في `LoginForm.tsx` و `SignUpForm.tsx`
2. احذف جميع أزرار تسجيل الدخول الاجتماعي:
```typescript
// احذف هذه الأقسام:
<button onClick={() => signInWithGoogle()}>
  Google
</button>
<button onClick={() => signInWithFacebook()}>
  Facebook
</button>
// إلخ...
```

**الخيار B: تطبيق التسجيل الاجتماعي (أطول)**
1. في `src/context/AuthContext.tsx`، أضف:
```typescript
const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  } catch (error: any) {
    console.error('خطأ في تسجيل الدخول بـ Google:', error);
    throw error;
  }
};

const signInWithFacebook = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  } catch (error: any) {
    console.error('خطأ في تسجيل الدخول بـ Facebook:', error);
    throw error;
  }
};
```

2. أضفهم لـ AuthContextType و return value

3. أنشئ `/app/auth/callback/page.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/');
      }
    });
  }, [router]);

  return <div>جاري المصادقة...</div>;
}
```

**معايير القبول:**
- ✅ لا توجد أخطاء console
- ✅ الأزرار تعمل أو محذوفة
- ✅ التدفق كامل (تسجيل → callback → تحويل)

---

## 🟡 المرحلة 2: الأمان والاستقرار (الأسبوع 2)

### Task #2.1: حذف/دمج نظام المصادقة المزدوج
**الأولوية:** P1 (عالي - تعارض معماري)
**الوقت المقدر:** 8 ساعات
**المُكلف:** Full-stack Developer

**الملفات المتأثرة:**
- `src/context/AuthContext.tsx` (احذف)
- `src/lib/storage.ts` (احذف)
- جميع الملفات المستوردة من الملفين أعلاه (~15 ملف)

**الخطوات:**

1. **تحديد جميع الملفات المستخدمة:**
```bash
# ابحث في المشروع
grep -r "from '@/context/AuthContext'" src/
grep -r "from '@/lib/storage'" src/
```

2. **إنشاء hook موحد:**
```typescript
// src/hooks/useAuth.ts (جديد)
'use client';

import { useUser } from './useUser';

export function useAuth() {
  const { user, loading, refreshUser } = useUser();

  return {
    user: user?.profile || null,
    loading,
    isAuthenticated: !!user,
    login: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (!error) await refreshUser();
      return !error;
    },
    register: async (userData: any) => {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone
          }
        }
      });
      if (!error) await refreshUser();
      return !error;
    },
    logout: async () => {
      await supabase.auth.signOut();
      await refreshUser();
    }
  };
}
```

3. **استبدال جميع الاستيرادات:**
```typescript
// قديم:
import { useAuth } from '@/context/AuthContext';

// جديد:
import { useAuth } from '@/hooks/useAuth';
```

4. **حذف الملفات القديمة:**
- احذف `src/context/AuthContext.tsx`
- احذف `src/lib/storage.ts`

5. **تحديث المكونات:**
   - `Header.tsx`
   - `ProtectedRoute.tsx`
   - `UnlockModal.tsx`
   - جميع صفحات المصادقة

**معايير القبول:**
- ✅ لا توجد أخطاء استيراد
- ✅ تسجيل الدخول/الخروج يعمل
- ✅ الحالة متسقة عبر التطبيق
- ✅ لا توجد بيانات في localStorage (فقط Supabase)

---

### Task #2.2: إضافة Error Boundaries
**الأولوية:** P2 (متوسط - استقرار)
**الوقت المقدر:** 2 ساعات
**المُكلف:** Frontend Developer

**الملفات الجديدة:**
- `src/components/ErrorBoundary.tsx`
- `src/app/error.tsx` (Next.js error page)

**الخطوات:**

1. **إنشاء مكون ErrorBoundary:**
```typescript
// src/components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('خطأ تم اصطياده بواسطة ErrorBoundary:', error, errorInfo);
    // يمكن إرسال إلى خدمة تتبع الأخطاء (مثل Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-text-main mb-4">
              عذراً، حدث خطأ غير متوقع
            </h2>
            <p className="text-text-muted mb-6">
              {this.state.error?.message || 'حاول تحديث الصفحة'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

2. **إضافة error.tsx لـ Next.js:**
```typescript
// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">حدث خطأ!</h2>
        <p className="mb-4">{error.message}</p>
        <button onClick={reset} className="bg-primary text-white px-4 py-2 rounded">
          حاول مرة أخرى
        </button>
      </div>
    </div>
  );
}
```

3. **تغليف المكونات الحرجة:**
```typescript
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**معايير القبول:**
- ✅ الأخطاء لا تُظهر شاشة بيضاء
- ✅ رسالة خطأ واضحة للمستخدم
- ✅ زر "حاول مرة أخرى" يعمل
- ✅ الأخطاء تُسجل في console

---

### Task #2.3: إضافة تحقق من رفع الملفات
**الأولوية:** P1 (عالي - أمان)
**الوقت المقدر:** 3 ساعات
**المُكلف:** Backend Developer

**الملفات المتأثرة:**
- `src/services/supabaseService.ts` (دالة `uploadPropertyImages`)
- `src/lib/utils/fileValidation.ts` (جديد)

**الخطوات:**

1. **إنشاء utility للتحقق:**
```typescript
// src/lib/utils/fileValidation.ts
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_IMAGE_DIMENSION = 400;
const MAX_IMAGE_DIMENSION = 4000;

export interface FileValidationError {
  file: string;
  error: string;
}

export async function validateImageFile(file: File): Promise<FileValidationError | null> {
  // 1. التحقق من النوع
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      file: file.name,
      error: 'نوع الملف غير مدعوم. استخدم JPEG أو PNG أو WebP'
    };
  }

  // 2. التحقق من الحجم
  if (file.size > MAX_FILE_SIZE) {
    return {
      file: file.name,
      error: 'حجم الملف كبير جداً (الحد الأقصى 5MB)'
    };
  }

  // 3. التحقق من أبعاد الصورة
  try {
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width < MIN_IMAGE_DIMENSION || dimensions.height < MIN_IMAGE_DIMENSION) {
      return {
        file: file.name,
        error: `جودة الصورة منخفضة (الحد الأدنى ${MIN_IMAGE_DIMENSION}px)`
      };
    }
    
    if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
      return {
        file: file.name,
        error: `الصورة كبيرة جداً (الحد الأقصى ${MAX_IMAGE_DIMENSION}px)`
      };
    }
  } catch (error) {
    return {
      file: file.name,
      error: 'فشل قراءة الصورة'
    };
  }

  return null;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
```

2. **تحديث دالة الرفع:**
```typescript
// src/services/supabaseService.ts
import { validateImageFile, FileValidationError } from '@/lib/utils/fileValidation';

async uploadPropertyImages(files: File[], userId: string): Promise<string[]> {
  if (IS_MOCK_MODE) {
    return files.map(() =>
      `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800`
    );
  }

  // التحقق من جميع الملفات أولاً
  const validationErrors: FileValidationError[] = [];
  for (const file of files) {
    const error = await validateImageFile(file);
    if (error) {
      validationErrors.push(error);
    }
  }

  // إذا كان هناك أخطاء، ارفع استثناء بجميعها
  if (validationErrors.length > 0) {
    const errorMessage = validationErrors
      .map(e => `${e.file}: ${e.error}`)
      .join('\n');
    throw new Error(`أخطاء في رفع الملفات:\n${errorMessage}`);
  }

  // رفع الملفات
  const uploadedUrls: string[] = [];
  const failedUploads: string[] = [];

  for (const file of files) {
    try {
      const url = await uploadImage(file, `${userId}/`);
      uploadedUrls.push(url);
    } catch (error: any) {
      console.error('خطأ في رفع الصورة:', file.name, error);
      failedUploads.push(file.name);
      
      // حذف الملفات المرفوعة إذا فشل أحدها
      for (const url of uploadedUrls) {
        try {
          // استخراج المسار من URL
          const path = new URL(url).pathname.split('/storage/v1/object/public/')[1];
          await supabase.storage.from('property-images').remove([path]);
        } catch (deleteError) {
          console.error('فشل حذف الملف:', url);
        }
      }
      
      throw new Error(`فشل رفع الملفات: ${failedUploads.join(', ')}`);
    }
  }

  return uploadedUrls;
}
```

**معايير القبول:**
- ✅ لا يمكن رفع ملفات غير صور
- ✅ لا يمكن رفع ملفات أكبر من 5MB
- ✅ لا يمكن رفع صور صغيرة جداً أو كبيرة جداً
- ✅ رسائل خطأ واضحة
- ✅ Rollback عند فشل أي ملف

---

### Task #2.4: إصلاح حساب السعر
**الأولوية:** P1 (عالي - منطق مالي)
**الوقت المقدر:** 2 ساعات
**المُكلف:** Backend Developer

**الملفات المتأثرة:**
- `src/services/supabaseService.ts` (دالة `calculateBookingPrice`)

**الخطوات:**

1. ابحث عن دالة `calculateBookingPrice`
2. استبدل منطق الحساب:

```typescript
async calculateBookingPrice(
  propertyId: string,
  startDate: string,
  endDate: string,
  bookingType: 'daily' | 'monthly' | 'seasonal'
): Promise<{ basePrice: number; discount: number; totalPrice: number }> {
  // جلب بيانات العقار
  const property = await this.getPropertyById(propertyId);
  if (!property) throw new Error('العقار غير موجود');

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // التحقق من صحة التواريخ
  if (end <= start) {
    throw new Error('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية');
  }

  let duration: number;
  let pricePerUnit: number;
  let basePrice: number;

  switch (bookingType) {
    case 'daily':
      // حساب عدد الليالي (وليس الأيام)
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      duration = Math.max(1, nights); // الحد الأدنى ليلة واحدة
      pricePerUnit = property.price_per_day || 0;
      basePrice = duration * pricePerUnit;
      break;

    case 'monthly':
      // حساب عدد الأشهر الفعلية
      const monthsDiff = 
        (end.getFullYear() - start.getFullYear()) * 12 + 
        (end.getMonth() - start.getMonth());
      
      // إذا كان هناك أيام إضافية، تُحسب كشهر كامل
      const hasExtraDays = end.getDate() > start.getDate();
      duration = Math.max(1, monthsDiff + (hasExtraDays ? 1 : 0));
      
      pricePerUnit = property.price_per_month || 0;
      basePrice = duration * pricePerUnit;
      break;

    case 'seasonal':
      // تحديد الموسم بناءً على الأشهر
      const startMonth = start.getMonth();
      let seasonPrice: number;
      
      // الصيف: يونيو - سبتمبر (5-8)
      // الشتاء: ديسمبر - فبراير (11, 0-1)
      // الربيع/الخريف: باقي الأشهر
      if (startMonth >= 5 && startMonth <= 8) {
        seasonPrice = property.price_per_season_summer || property.price_per_day || 0;
      } else if (startMonth >= 11 || startMonth <= 1) {
        seasonPrice = property.price_per_season_winter || property.price_per_day || 0;
      } else {
        seasonPrice = property.price_per_day || 0;
      }
      
      const seasonDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      duration = Math.max(1, seasonDays);
      pricePerUnit = seasonPrice;
      basePrice = duration * pricePerUnit;
      break;

    default:
      throw new Error('نوع حجز غير صالح');
  }

  // حساب الخصم
  let discountPercentage = 0;
  if (property.discount_percentage && property.discount_percentage > 0) {
    discountPercentage = property.discount_percentage;
  }

  const discount = (basePrice * discountPercentage) / 100;
  const totalPrice = basePrice - discount;

  return {
    basePrice: Math.round(basePrice * 100) / 100, // تقريب لرقمين عشريين
    discount: Math.round(discount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
}
```

**معايير القبول:**
- ✅ حجز يوم واحد = ليلة واحدة (سعر صحيح)
- ✅ 31 يوم = شهر واحد (ليس شهرين)
- ✅ حساب الأشهر الفعلية (يناير-فبراير = شهر واحد)
- ✅ الحد الأدنى دائماً 1 وحدة
- ✅ الأسعار مُقربة لرقمين عشريين

---

### Task #2.5: إضافة Rate Limiting
**الأولوية:** P2 (متوسط - حماية)
**الوقت المقدر:** 4 ساعات
**المُكلف:** Backend Developer

**الملفات الجديدة:**
- `src/lib/rateLimit.ts`
- `src/middleware.ts` (Next.js middleware)

**الخطوات:**

1. **إنشاء Rate Limiter:**
```typescript
// src/lib/rateLimit.ts
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  interval: number; // بالميلي ثانية
  uniqueTokenPerInterval: number; // عدد الطلبات المسموحة
}

// تخزين مؤقت في الذاكرة (للتطوير)
// في الإنتاج، استخدم Redis
const cache = new Map<string, number[]>();

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // دقيقة واحدة
    uniqueTokenPerInterval: 10 // 10 طلبات في الدقيقة
  }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  
  // الحصول على IP من الطلب
  const token = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  const now = Date.now();
  const windowStart = now - config.interval;
  
  // الحصول على طلبات المستخدم
  const requests = cache.get(token) || [];
  
  // حذف الطلبات القديمة
  const recentRequests = requests.filter(time => time > windowStart);
  
  // تحديث الكاش
  recentRequests.push(now);
  cache.set(token, recentRequests);
  
  const success = recentRequests.length <= config.uniqueTokenPerInterval;
  
  return {
    success,
    limit: config.uniqueTokenPerInterval,
    remaining: Math.max(0, config.uniqueTokenPerInterval - recentRequests.length),
    reset: windowStart + config.interval
  };
}

// تنظيف الكاش كل 10 دقائق
setInterval(() => {
  const now = Date.now();
  for (const [token, requests] of cache.entries()) {
    const recentRequests = requests.filter(time => time > now - 60 * 60 * 1000);
    if (recentRequests.length === 0) {
      cache.delete(token);
    } else {
      cache.set(token, recentRequests);
    }
  }
}, 10 * 60 * 1000);
```

2. **إضافة Middleware:**
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rateLimit';

// المسارات التي تحتاج rate limiting
const protectedPaths = [
  '/api/properties',
  '/api/bookings',
  '/api/payments',
  '/api/messages'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // التحقق إذا كان المسار محمي
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtected) {
    const limiter = await rateLimit(request);
    
    if (!limiter.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'عدد الطلبات كبير جداً. حاول مرة أخرى لاحقاً',
          retryAfter: Math.ceil((limiter.reset - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter.limit.toString(),
            'X-RateLimit-Remaining': limiter.remaining.toString(),
            'X-RateLimit-Reset': limiter.reset.toString(),
            'Retry-After': Math.ceil((limiter.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    // إضافة Headers للطلبات الناجحة
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limiter.limit.toString());
    response.headers.set('X-RateLimit-Remaining', limiter.remaining.toString());
    response.headers.set('X-RateLimit-Reset', limiter.reset.toString());
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

3. **إضافة rate limiting محدد في الدوال:**
```typescript
// في supabaseService.ts، لكل دالة حرجة:

async createProperty(propertyData: any) {
  // يمكن إضافة rate limiting إضافي هنا
  // مثل: 5 عقارات كحد أقصى في اليوم لكل مستخدم
  
  const { count } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', propertyData.owner_id)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
  if (count && count >= 5) {
    throw new Error('لا يمكن إضافة أكثر من 5 عقارات في اليوم');
  }
  
  // ... باقي الكود
}
```

**معايير القبول:**
- ✅ الطلبات الزائدة تُرفض بـ 429
- ✅ Headers تحتوي على معلومات الحد
- ✅ رسالة خطأ واضحة
- ✅ اختبار 15 طلب متتالي (10 ينجح، 5 يُرفض)

---

## 🔵 المرحلة 3: إعادة الهيكلة (الأسبوع 3)

### Task #3.1: تقسيم صفحة الحجز الكبيرة
**الأولوية:** P2 (متوسط - قابلية الصيانة)
**الوقت المقدر:** 4 ساعات
**المُكلف:** Frontend Developer

**الملفات المتأثرة:**
- `src/app/property/[id]/booking/page.tsx` (551 سطر → 100 سطر)

**الملفات الجديدة:**
```
src/app/property/[id]/booking/
├── page.tsx (100 سطر)
├── components/
│   ├── BookingForm.tsx
│   ├── PropertySummary.tsx
│   ├── DateSelection.tsx
│   ├── GuestInfo.tsx
│   ├── PaymentMethod.tsx
│   └── BookingSuccess.tsx
└── styles.module.css
```

**الخطوات:**

1. **استخراج PropertySummary:**
```typescript
// src/app/property/[id]/booking/components/PropertySummary.tsx
'use client';

interface PropertySummaryProps {
  property: {
    title: string;
    images: string[];
    location: { address: string };
    price_per_day?: number;
    price_per_month?: number;
  };
}

export function PropertySummary({ property }: PropertySummaryProps) {
  return (
    <div className="bg-background-light p-6 rounded-2xl">
      <img 
        src={property.images[0]} 
        alt={property.title}
        className="w-full h-48 object-cover rounded-xl mb-4"
      />
      <h3 className="font-bold text-xl mb-2">{property.title}</h3>
      <p className="text-text-muted mb-4">{property.location.address}</p>
      {property.price_per_day && (
        <p className="text-primary font-bold">
          {property.price_per_day} جنيه / يوم
        </p>
      )}
    </div>
  );
}
```

2. **استخراج BookingForm:**
```typescript
// src/app/property/[id]/booking/components/BookingForm.tsx
'use client';

import { useState } from 'react';
import { DateSelection } from './DateSelection';
import { GuestInfo } from './GuestInfo';
import { PaymentMethod } from './PaymentMethod';

interface BookingFormProps {
  propertyId: string;
  onSubmit: (data: any) => Promise<void>;
}

export function BookingForm({ propertyId, onSubmit }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 1 && (
        <DateSelection 
          onNext={(data) => {
            setFormData(prev => ({ ...prev, ...data }));
            setStep(2);
          }}
        />
      )}
      
      {step === 2 && (
        <GuestInfo 
          onNext={(data) => {
            setFormData(prev => ({ ...prev, ...data }));
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}
      
      {step === 3 && (
        <PaymentMethod 
          onSubmit={(data) => {
            const finalData = { ...formData, ...data };
            onSubmit(finalData);
          }}
          onBack={() => setStep(2)}
        />
      )}
    </form>
  );
}
```

3. **استخراج الأنماط:**
```css
/* src/app/property/[id]/booking/styles.module.css */
.bookingPage {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* ... باقي الأنماط */

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
}
```

4. **تحديث صفحة الحجز الرئيسية:**
```typescript
// src/app/property/[id]/booking/page.tsx
import { BookingForm } from './components/BookingForm';
import { PropertySummary } from './components/PropertySummary';
import styles from './styles.module.css';

export default async function BookingPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);

  const handleBooking = async (data: any) => {
    'use server';
    // منطق الحجز
  };

  return (
    <div className={styles.bookingPage}>
      <div className={styles.container}>
        <PropertySummary property={property} />
        <BookingForm propertyId={params.id} onSubmit={handleBooking} />
      </div>
    </div>
  );
}
```

**معايير القبول:**
- ✅ الملف الرئيسي أقل من 150 سطر
- ✅ كل مكون مستقل وقابل لإعادة الاستخدام
- ✅ الأنماط في ملف CSS منفصل
- ✅ الوظيفة تعمل كما هي

---

### Task #3.2: دمج نماذج المصادقة المكررة
**الأولوية:** P2 (متوسط - تقليل التكرار)
**الوقت المقدر:** 3 ساعات
**المُكلف:** Frontend Developer

**الملفات المتأثرة:**
- `src/components/auth/LoginForm.tsx` (احذف)
- `src/components/auth/SignUpForm.tsx` (احذف)
- `src/components/auth/AuthForm.tsx` (أعد كتابته)

**الخطوات:**

1. **إنشاء AuthForm موحد:**
```typescript
// src/components/auth/AuthForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(formData.email, formData.password);
        if (success) onSuccess?.();
        else setError('فشل تسجيل الدخول');
      } else if (mode === 'signup') {
        const success = await register(formData);
        if (success) onSuccess?.();
        else setError('فشل التسجيل');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* حقول مشتركة */}
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={formData.email}
        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
        required
        className="w-full px-4 py-3 rounded-xl"
      />

      {mode !== 'reset' && (
        <input
          type="password"
          placeholder="كلمة المرور"
          value={formData.password}
          onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
          className="w-full px-4 py-3 rounded-xl"
        />
      )}

      {/* حقول إضافية للتسجيل */}
      {mode === 'signup' && (
        <>
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={formData.fullName}
            onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl"
          />
          <input
            type="tel"
            placeholder="رقم الهاتف"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl"
          />
        </>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-3 rounded-xl"
      >
        {loading ? 'جاري التحميل...' : getButtonText(mode)}
      </button>
    </form>
  );
}

function getButtonText(mode: AuthMode): string {
  switch (mode) {
    case 'login': return 'تسجيل الدخول';
    case 'signup': return 'إنشاء حساب';
    case 'reset': return 'إرسال رابط إعادة التعيين';
  }
}
```

2. **تحديث صفحة المصادقة:**
```typescript
// src/app/auth/page.tsx
'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('login')}
            className={mode === 'login' ? 'font-bold' : ''}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setMode('signup')}
            className={mode === 'signup' ? 'font-bold' : ''}
          >
            إنشاء حساب
          </button>
        </div>

        <AuthForm 
          mode={mode} 
          onSuccess={() => window.location.href = '/'} 
        />
      </div>
    </div>
  );
}
```

**معايير القبول:**
- ✅ ملف واحد فقط بدلاً من 3
- ✅ أقل من 200 سطر
- ✅ تسجيل الدخول والتسجيل يعملان
- ✅ التبديل بين الأوضاع سلس

---

### Task #3.3: إضافة Pagination للقوائم
**الأولوية:** P2 (متوسط - أداء)
**الوقت المقدر:** 3 ساعات
**المُكلف:** Full-stack Developer

**الملفات المتأثرة:**
- `src/app/search/page.tsx`
- `src/app/my-properties/page.tsx`
- `src/app/favorites/page.tsx`
- `src/services/supabaseService.ts`

**الخطوات:**

1. **إضافة pagination للخدمة:**
```typescript
// src/services/supabaseService.ts

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

async getProperties(
  filters?: any, 
  pagination?: PaginationParams
): Promise<PaginatedResult<PropertyRow>> {
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (IS_MOCK_MODE) {
    const filtered = MOCK_PROPERTIES; // تطبيق الفلاتر
    return {
      data: filtered.slice(from, to + 1),
      pagination: {
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize)
      }
    };
  }

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  // تطبيق الفلاتر
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  // ... باقي الفلاتر

  const { data, error, count } = await query
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    }
  };
}
```

2. **إنشاء مكون Pagination:**
```typescript
// src/components/Pagination.tsx
'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // عرض 5 صفحات كحد أقصى
  const visiblePages = pages.slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2)
  );

  return (
    <div className="flex justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-background-light disabled:opacity-50"
      >
        السابق
      </button>

      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg ${
            page === currentPage
              ? 'bg-primary text-white'
              : 'bg-background-light'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-background-light disabled:opacity-50"
      >
        التالي
      </button>
    </div>
  );
}
```

3. **تحديث صفحة البحث:**
```typescript
// src/app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@/components/Pagination';

export default function SearchPage() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchProperties = async (page: number) => {
    setLoading(true);
    const result = await supabaseService.getProperties(
      filters,
      { page, pageSize: 12 }
    );
    setProperties(result.data);
    setPagination(result.pagination);
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties(pagination.page);
  }, [pagination.page, filters]);

  return (
    <div>
      {/* قائمة العقارات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map(p => <PropertyCard key={p.id} {...p} />)}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        />
      )}
    </div>
  );
}
```

**معايير القبول:**
- ✅ يتم تحميل 12 عقار فقط في كل مرة
- ✅ أزرار التنقل تعمل
- ✅ رقم الصفحة الحالي مميز
- ✅ تُعطل الأزرار عند الحدود (أول/آخر صفحة)

---

## 🟢 المرحلة 4: الأداء (الأسبوع 4)

### Task #4.1: تحويل الصفحات لـ Server Components
**الأولوية:** P2 (متوسط - SEO وأداء)
**الوقت المقدر:** 4 ساعات
**المُكلف:** Frontend Developer

**الملفات المتأثرة:**
- `src/app/page.tsx` (الصفحة الرئيسية)
- `src/app/search/page.tsx`
- `src/app/property/[id]/page.tsx`

**الخطوات:**

1. **تحويل الصفحة الرئيسية:**
```typescript
// src/app/page.tsx
// حذف 'use client'

import { supabaseService } from '@/services/supabaseService';
import { PropertyGrid } from '@/components/PropertyGrid'; // client component
import { SearchBar } from '@/components/SearchBar'; // client component

export default async function HomePage() {
  // جلب البيانات من الخادم
  const { data: featuredProperties } = await supabaseService.getProperties({
    featured: true
  }, { page: 1, pageSize: 6 });

  const { data: recentProperties } = await supabaseService.getProperties(
    {},
    { page: 1, pageSize: 4 }
  );

  return (
    <main>
      <SearchBar /> {/* client component للتفاعل */}
      
      <section>
        <h2>عقارات مميزة</h2>
        <PropertyGrid properties={featuredProperties} />
      </section>

      <section>
        <h2>أحدث العقارات</h2>
        <PropertyGrid properties={recentProperties} />
      </section>
    </main>
  );
}
```

2. **تحويل صفحة العقار:**
```typescript
// src/app/property/[id]/page.tsx
// حذف 'use client'

import { supabaseService } from '@/services/supabaseService';
import { PropertyClient } from './client'; // client component للتفاعل
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const property = await supabaseService.getPropertyById(params.id);
  
  if (!property) return {};

  return {
    title: property.title,
    description: property.description,
    openGraph: {
      images: property.images,
    },
  };
}

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await supabaseService.getPropertyById(params.id);
  
  if (!property) {
    notFound();
  }

  return <PropertyClient property={property} />;
}
```

3. **إنشاء client component:**
```typescript
// src/app/property/[id]/client.tsx
'use client';

import { useState } from 'react';
import { PropertyGallery } from '@/components/PropertyGallery';
import { PropertyDetails } from '@/components/PropertyDetails';

export function PropertyClient({ property }: { property: any }) {
  const [selectedImage, setSelectedImage] = useState(0);

  // كل التفاعلات هنا

  return (
    <div>
      <PropertyGallery 
        images={property.images}
        selectedIndex={selectedImage}
        onSelect={setSelectedImage}
      />
      <PropertyDetails property={property} />
    </div>
  );
}
```

**معايير القبول:**
- ✅ البيانات تُجلب من الخادم
- ✅ الصفحة تُعرض حتى بدون JavaScript
- ✅ SEO metadata صحيح
- ✅ التفاعلات تعمل (favorites، gallery، إلخ)

---

### Task #4.2: إضافة React.memo للمكونات الثقيلة
**الأولوية:** P3 (منخفض - تحسين)
**الوقت المقدر:** 2 ساعات
**المُكلف:** Frontend Developer

**الملفات المتأثرة:**
- `src/components/PropertyCard.tsx`
- `src/components/PropertyGallery.tsx`
- `src/components/SearchFilters.tsx`

**الخطوات:**

```typescript
// src/components/PropertyCard.tsx
import React from 'react';

interface PropertyCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  // ... باقي الخصائص
}

function PropertyCardComponent(props: PropertyCardProps) {
  // ... الكود الموجود
}

// تصدير مع memo
export const PropertyCard = React.memo(PropertyCardComponent, (prevProps, nextProps) => {
  // تحديث فقط إذا تغيرت الخصائص المهمة
  return (
    prevProps.id === nextProps.id &&
    prevProps.isFavorite === nextProps.isFavorite
  );
});
```

**معايير القبول:**
- ✅ PropertyCard لا يُعاد رسمه بدون سبب
- ✅ الأداء محسّن في القوائم الطويلة
- ✅ الوظيفة تعمل بدون تغيير

---

## 📝 ملخص المهام

### حسب الأولوية:
- **P0 (حرج):** 7 مهام - الوقت الإجمالي: ~18 ساعة
- **P1 (عالي):** 8 مهام - الوقت الإجمالي: ~28 ساعة  
- **P2 (متوسط):** 10 مهام - الوقت الإجمالي: ~32 ساعة
- **P3 (منخفض):** 2 مهام - الوقت الإجمالي: ~4 ساعة

### حسب الأسبوع:
- **الأسبوع 1:** 7 مهام (إصلاحات حرجة)
- **الأسبوع 2:** 5 مهام (أمان واستقرار)
- **الأسبوع 3:** 5 مهام (إعادة هيكلة)
- **الأسبوع 4:** 3 مهام (أداء)

**الوقت الإجمالي المقدر:** 82 ساعة = ~10-11 يوم عمل

---

## ✅ قائمة التحقق للنشر

قبل النشر للإنتاج، تأكد من:

### أساسي:
- [ ] IS_MOCK_MODE = false في الإنتاج
- [ ] جميع المتغيرات البيئية مُعدة صحيحاً
- [ ] AdminGuard يعمل
- [ ] التحقق من الدفع مُفعّل
- [ ] SQL injection مُصلح
- [ ] معاملة الحجز الذرية مُطبقة

### أمان:
- [ ] Rate limiting مُفعّل
- [ ] التحقق من رفع الملفات يعمل
- [ ] RLS policies مُختبرة
- [ ] HTTPS فقط
- [ ] CORS مُعد بشكل صحيح

### أداء:
- [ ] Pagination يعمل
- [ ] Server components للصفحات الرئيسية
- [ ] الصور محسّنة (WebP, lazy loading)
- [ ] CSS/JS مُصغّر

### تجربة المستخدم:
- [ ] Error boundaries تعمل
- [ ] رسائل الخطأ واضحة بالعربية
- [ ] التطبيق يعمل على الموبايل
- [ ] PWA يعمل

### اختبارات:
- [ ] اختبار تسجيل دخول/تسجيل
- [ ] اختبار إنشاء حجز
- [ ] اختبار الدفع
- [ ] اختبار concurrent bookings
- [ ] اختبار rate limiting
