# نظام الحجز المتقدم - عقارات جمصة 🏖️

## 📋 نظرة عامة

تم إضافة نظام حجز متكامل وشامل يدعم **3 أنواع من الإيجار** (يومي، شهري، موسمي) مع صفحات احترافية للحجز والتأكيد.

---

## ✨ المميزات الرئيسية

### 1. أنواع الإيجار المدعومة

#### 🌙 الإيجار اليومي
- الوحدة: ليلة واحدة
- مثال: 800 ج.م/ليلة × 10 ليالي = 8,000 ج.م

#### 📅 الإيجار الشهري
- الوحدة: شهر كامل
- مثال: 3,000 ج.م/شهر × 3 أشهر = 9,000 ج.م

#### 🎓 الإيجار الموسمي (الدراسي)
- الفترة: من سبتمبر (9) إلى يونيو (6) = 10 أشهر
- دعم التأمين القابل للاسترداد
- مثال: 3,000 ج.م/شهر × 10 + 3,000 ج.م تأمين = 33,000 ج.م

### 2. طرق الدفع

1. **💳 محفظة فودافون كاش** - مع رفع الإيصال
2. **💸 إنستاباي (InstaPay)** - تحويل فوري
3. **💵 الدفع عند الاستلام** - نقداً

### 3. رسوم الخدمة

- **10%** رسوم خدمة على السعر الأساسي
- مثال: سعر أساسي 10,000 ج.م → رسوم 1,000 ج.م

---

## 🗂️ الهيكل التقني

### الملفات الجديدة

```
src/
├── types/index.ts                           ✅ محدث (RentalType, RentalConfig, Booking)
├── services/supabaseService.ts              ✅ محدث (وظائف الحجز)
├── components/booking/
│   ├── DateSelector.tsx                     ✅ جديد
│   ├── TenantForm.tsx                       ✅ جديد
│   ├── PaymentMethods.tsx                   ✅ جديد
│   └── PriceBreakdown.tsx                   ✅ جديد
└── app/property/[id]/
    ├── client.tsx                           ✅ محدث (زر حجز الآن)
    ├── booking/
    │   └── page.tsx                         ✅ جديد (صفحة الحجز)
    └── booking/confirmation/
        └── page.tsx                         ✅ جديد (صفحة التأكيد)
```

---

## 🎯 مسار المستخدم (User Flow)

```
1. تصفح العقار
   ↓
2. الضغط على "حجز الآن" (بعد فتح قفل العقار)
   ↓
3. اختيار التواريخ (حسب نوع الإيجار)
   ↓
4. ملء بيانات المستأجر (تُملأ تلقائياً من الملف الشخصي)
   ↓
5. اختيار طريقة الدفع
   ↓
6. مراجعة تفاصيل الفاتورة
   ↓
7. تأكيد الحجز
   ↓
8. صفحة التأكيد (مع خيارات حسب طريقة الدفع)
```

---

## 📦 الأنواع (Types)

### RentalConfig

```typescript
interface RentalConfig {
    type: RentalType;           // 'daily' | 'monthly' | 'seasonal'
    pricePerUnit: number;       // السعر لكل وحدة
    minDuration: number;        // الحد الأدنى
    maxDuration: number;        // الحد الأقصى
    
    seasonalConfig?: {
        startMonth: number;         // 9 (سبتمبر)
        endMonth: number;           // 6 (يونيو)
        requiresDeposit: boolean;
        depositAmount?: number;
    };
}
```

### Booking

```typescript
interface Booking {
    id: string;
    propertyId: string;
    userId: string;
    
    // التواريخ
    startDate: string;
    endDate: string;
    totalNights?: number;
    totalMonths?: number;
    rentalType: RentalType;
    
    // المستأجر
    tenantName: string;
    tenantPhone: string;
    tenantEmail?: string;
    
    // التكاليف
    basePrice: number;
    serviceFee: number;          // 10%
    depositAmount?: number;
    totalAmount: number;
    
    // الدفع
    paymentMethod: 'vodafone_cash' | 'instapay' | 'cash_on_delivery';
    paymentStatus: 'pending' | 'confirmed' | 'failed';
    paymentProof?: string;
    
    // الحالة
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: string;
    confirmedAt?: string;
}
```

---

## 🔧 الوظائف الجديدة في supabaseService

### 1. حساب السعر

```typescript
supabaseService.calculateTotalPrice(
    rentalConfig: RentalConfig,
    startDate: Date,
    endDate: Date
): {
    basePrice: number;
    serviceFee: number;
    depositAmount: number;
    totalAmount: number;
    duration: number;
}
```

### 2. التحقق من التوفر

```typescript
supabaseService.checkAvailability(
    propertyId: string,
    startDate: string,
    endDate: string
): Promise<{ available: boolean; error: any }>
```

### 3. إنشاء حجز

```typescript
supabaseService.createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt'>
): Promise<{ data: Booking | null; error: any }>
```

### 4. جلب حجوزات المستخدم

```typescript
supabaseService.getUserBookings(
    userId: string
): Promise<{ data: Booking[]; error: any }>
```

### 5. رفع إيصال الدفع

```typescript
supabaseService.uploadPaymentReceipt(
    bookingId: string,
    receiptFile: File
): Promise<{ url: string | null; error: any }>
```

### 6. تحديث حالة الحجز

```typescript
supabaseService.updateBookingStatus(
    bookingId: string,
    status: 'pending' | 'confirmed' | 'cancelled',
    paymentStatus?: 'pending' | 'confirmed' | 'failed'
): Promise<{ error: any }>
```

---

## 🎨 المكونات (Components)

### 1. DateSelector

مكون ذكي يتكيف مع نوع الإيجار:
- **يومي**: تقويم لاختيار تاريخ البداية والنهاية
- **شهري**: اختيار تاريخ البداية + عدد الأشهر
- **موسمي**: عرض الفترة الدراسية (ثابتة)

### 2. TenantForm

نموذج بيانات المستأجر:
- الاسم الكامل (مطلوب)
- رقم الهاتف (مطلوب، نمط: 01xxxxxxxxx)
- البريد الإلكتروني (اختياري)

### 3. PaymentMethods

اختيار طريقة الدفع مع أيقونات ووصف:
- فودافون كاش 📱
- إنستاباي 💳  
- الدفع عند الاستلام 💵

### 4. PriceBreakdown

عرض تفصيلي للفاتورة:
- السعر الأساسي
- رسوم الخدمة (10%)
- التأمين (للموسمي)
- المجموع الكلي

---

## 🚀 كيفية الاستخدام

### للمطورين

#### 1. إضافة عقار بنوع إيجار محدد

```typescript
const property = {
    // ... البيانات الأساسية
    rentalConfig: {
        type: 'daily',
        pricePerUnit: 800,
        minDuration: 1,
        maxDuration: 30
    }
};
```

#### 2. الحجز في الوضع التجريبي (Mock Mode)

جميع الوظائف تعمل في `IS_MOCK_MODE = true` بدون الحاجة لقاعدة بيانات.

---

## 📱 صفحات الحجز

### صفحة الحجز (`/property/[id]/booking`)

**المكونات**:
- ملخص العقار
- اختيار التواريخ
- بيانات المستأجر  
- طرق الدفع
- تفاصيل السعر (sticky sidebar)

### صفحة التأكيد (`/property/[id]/booking/confirmation`)

**حالات العرض**:

#### أ) التحويل الإلكتروني (Vodafone/InstaPay)
- رقم التحويل (قابل للنسخ)
- رفع صورة الإيصال
- حالة: "في انتظار التأكيد"

#### ب) الدفع عند الاستلام
- بيانات المالك
- أزرار الاتصال وواتساب
- حالة: "مؤكد"

---

## 🎯 الخطوات التالية (اختياري)

### قاعدة البيانات (Supabase)

إنشاء جدول `bookings`:

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    user_id UUID REFERENCES profiles(id),
    
    -- التواريخ
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    total_nights INT,
    total_months INT,
    rental_type TEXT NOT NULL,
    
    -- المستأجر
    tenant_name TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    tenant_email TEXT,
    
    -- التكاليف
    base_price DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- الدفع
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_proof TEXT,
    
    -- الحالة
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);
```

### إنشاء Storage Bucket للإيصالات

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true);
```

---

## 🎉 النتيجة

✅ نظام حجز احترافي ومتكامل  
✅ دعم 3 أنواع إيجار مختلفة  
✅ 3 طرق دفع متنوعة  
✅ صفحات تأكيد تفاعلية  
✅ حساب تلقائي للأسعار  
✅ تجربة مستخدم سلسة  
✅ تصميم متجاوب  
✅ يعمل في وضع Mock بدون قاعدة بيانات

---

## 📝 ملاحظات

1. **الوضع التجريبي**: النظام يعمل حالياً في `IS_MOCK_MODE = true`
2. **رقم فودافون كاش**: يجب تحديث `VODAFONE_CASH_NUMBER` في `types/index.ts`
3. **قاعدة البيانات**: عند الجاهزية، قم بتغيير `IS_MOCK_MODE` إلى `false`
4. **التوافق**: يعمل مع البيانات القديمة (Property بدون rentalConfig)

---

## 🤝 المساهمة

للإضافات والتحسينات:
1. إضافة تقويم تفاعلي متقدم
2. إشعارات البريد الإلكتروني عند الحجز
3. لوحة تحكم للمؤجر لإدارة الحجوزات
4. نظام تقييمات المستأجرين
5. خريطة توفر الأيام

---

**تم التطوير بواسطة**: Antigravity AI  
**التاريخ**: 2026-02-03  
**الإصدار**: 1.0.0
