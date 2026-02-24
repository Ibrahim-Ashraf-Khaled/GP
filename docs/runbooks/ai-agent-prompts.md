# 🤖 AI Agent Review Prompt - Gamasa Properties

## 📋 نظرة عامة

هذا الملف يحتوي على prompt مُحسّن لمراجعة كود مشروع Gamasa Properties باستخدام AI Agent (مثل Claude، GPT-4، أو أي LLM آخر). تم تصميم الـ prompt ليكون شاملاً ودقيقاً ويُنتج نتائج قابلة للتنفيذ.

---

## 🎯 الـ Prompt الأساسي

```
أنت senior full-stack code reviewer متخصص في Next.js 16، React 19، TypeScript، و Supabase.
مهمتك: مراجعة شاملة لمشروع Gamasa Properties (منصة عقارية).

# معلومات المشروع
- **التقنيات:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase
- **الميزات:** مصادقة، إدارة عقارات، نظام حجز (يومي/شهري/موسمي), Leaflet maps، رسائل
- **الحالة:** Mock Mode حالياً

# تم تحديد المشاكل التالية في تقرير سابق:
1. IS_MOCK_MODE مُثبت على true
2. AdminGuard معطل (خاصية profile غير موجودة)
3. Race condition في نظام الحجز
4. تجاوز الدفع - unlockProperty بدون تحقق
5. SQL Injection في استعلام التوافر
6. تعارض طبقات البيانات (storage.ts، AuthContext، supabaseService)
7. صفر تحقق من صحة الدفع
8. الجميع admin في Mock Mode
9. فلترة من جانب العميل
10. وظائف المصادقة الاجتماعية مفقودة

# مهمتك:
1. **تأكيد/نفي** كل مشكلة بناءً على الكود الفعلي
2. **تحديد شدة** كل مشكلة (P0-P3)
3. **اقتراح حل** محدد لكل مشكلة
4. **تقدير الوقت** المطلوب للإصلاح

# تنسيق المخرجات:
استخدم هذا التنسيق:

## المشكلة #X: [اسم المشكلة]
**الحالة:** [✅ مُثبت | ⚠️ جزئي | ❌ غير موجود]
**الشدة:** [P0 حرج | P1 عالي | P2 متوسط | P3 منخفض]
**الملفات المتأثرة:** [قائمة الملفات]
**الكود المشكل:**
```typescript
// الكود الفعلي من المشروع
```
**التأثير:** [وصف موجز للتأثير]
**الحل المقترح:**
```typescript
// الكود المُصلح
```
**الوقت المقدر:** [X ساعات]
**الأولوية في الخطة:** [الأسبوع X، اليوم Y]

# ابدأ المراجعة الآن
```

---

## 🔍 Prompts متخصصة لكل مشكلة

### Prompt 1: التحقق من Mock Mode

```
راجع ملف `src/services/supabaseService.ts` وحدد:

1. هل يوجد السطر: `export const IS_MOCK_MODE = true;`؟
2. أين يُستخدم IS_MOCK_MODE في الملف؟
3. كم دالة تعتمد على هذا المتغير؟
4. هل يوجد بيانات mock مُضمنة في الملف؟

أعطني:
- رقم السطر الدقيق
- عدد الدوال المتأثرة
- حجم البيانات المُضمنة (عدد الأسطر)
- هل يقرأ من environment variable أم مُثبت؟

نسق الرد:
```json
{
  "issue_confirmed": true/false,
  "line_number": X,
  "affected_functions": [أسماء الدوال],
  "mock_data_lines": X,
  "reads_from_env": true/false
}
```
```

### Prompt 2: التحقق من AdminGuard

```
راجع ملفات:
- `src/components/auth/AdminGuard.tsx`
- `src/context/AuthContext.tsx`

حدد:
1. ما هي الـ return type لـ useAuth()؟
2. هل يحتوي على خاصية `profile`؟
3. أين يُستخدم AdminGuard في المشروع؟
4. ما هي البدائل المتاحة (مثل useUser)؟

نسق الرد:
```json
{
  "issue_confirmed": true/false,
  "useAuth_return_type": {...},
  "has_profile_property": true/false,
  "usage_count": X,
  "alternative_solutions": [...]
}
```
```

### Prompt 3: التحقق من Race Condition

```
راجع الدوال التالية في `src/services/supabaseService.ts`:
- checkAvailability()
- createBooking()

حدد:
1. هل يُستدعى checkAvailability قبل createBooking؟
2. هل هناك قفل (lock) أو معاملة (transaction)؟
3. هل الاستعلام يستخدم `FOR UPDATE`؟
4. كيف يتعامل الكود مع concurrent requests؟

قدّم:
- تحليل flow مفصل
- نقاط الضعف المحددة
- احتمالية حدوث double booking
- حل atomic محدد

نسق الرد:
```typescript
// التدفق الحالي
async bookProperty() {
  const available = await checkAvailability(); // Step 1
  if (available) {
    await createBooking(); // Step 2
  }
}

// نقاط الضعف:
// 1. بين Step 1 و Step 2 يمكن لمستخدم آخر الحجز
// 2. ...

// الحل المقترح:
// [كود SQL function ذري]
```
```

### Prompt 4: التحقق من تجاوز الدفع

```
راجع دالة `unlockProperty` في `src/services/supabaseService.ts`

تحقق من:
1. هل تفحص جدول `payment_requests`؟
2. هل تتحقق من `status = 'approved'`؟
3. هل تتحقق من المبلغ (amount >= 50)?
4. هل تتحقق من عدم استهلاك الدفع مسبقاً؟
5. هل يمكن استدعاء الدالة مباشرة من العميل؟

أعطني:
- الكود الحالي كاملاً
- قائمة بالتحققات المفقودة
- مثال exploit محتمل
- كود الإصلاح الكامل مع جميع التحققات

نسق الرد:
```typescript
// الكود الحالي:
[...]

// التحققات المفقودة:
// ❌ لا يتحقق من الدفع
// ❌ لا يتحقق من المبلغ
// ...

// مثال Exploit:
// يمكن للمستخدم استدعاء:
await unlockProperty('user_id', 'property_id');
// بدون دفع أي شيء

// الكود المُصلح:
[كود كامل مع جميع التحققات]
```
```

### Prompt 5: التحقق من SQL Injection

```
ابحث في `src/services/supabaseService.ts` عن:
- استخدام template literals مع قيم المستخدم
- string concatenation في الاستعلامات
- `.or()` مع interpolation

خصوصاً في دالة `checkAvailability`.

حدد:
1. الأسطر الدقيقة بها المشكلة
2. المدخلات التي يمكن استغلالها
3. مثال payload للاستغلال
4. الطريقة الآمنة (parameterized queries)

نسق الرد:
```typescript
// السطر المُشكل:
// Line X: .or(`start_date.lte.${endDate}...`)

// Payload محتمل:
const maliciousEndDate = "2024-01-01' OR '1'='1";

// النتيجة:
.or(`start_date.lte.2024-01-01' OR '1'='1...`)

// الإصلاح:
.filter('start_date', 'lte', endDate) // آمن
```
```

---

## 🔄 Prompts للتحليل الشامل

### Prompt: تحليل البنية المعمارية

```
راجع البنية المعمارية للمشروع:

```
/src
├── app/              (Next.js routes)
├── components/       (React components)
├── services/         (Business logic)
├── lib/              (Utilities)
├── hooks/            (Custom hooks)
├── types/            (TypeScript types)
├── context/          (React contexts)
└── ...
```

حدد:
1. **تعارضات معمارية:**
   - أنظمة متعددة للوظيفة الواحدة
   - مسؤوليات مختلطة
   - circular dependencies

2. **أنماط سيئة:**
   - God objects (ملفات/مكونات ضخمة)
   - Tight coupling
   - Missing abstractions

3. **ملفات مشبوهة:**
   - unused imports
   - dead code
   - duplicate code

4. **فرص التحسين:**
   - ملفات يمكن دمجها
   - مكونات يمكن تقسيمها
   - logic يمكن استخراجه

أعطني:
```json
{
  "conflicts": [
    {
      "type": "Dual data access",
      "files": ["storage.ts", "supabaseService.ts"],
      "impact": "High",
      "solution": "..."
    }
  ],
  "anti_patterns": [...],
  "suspicious_files": [...],
  "improvements": [...]
}
```
```

### Prompt: تحليل الأمان الشامل

```
قم بمراجعة أمنية شاملة:

# نقاط الفحص:
1. **المصادقة والتفويض:**
   - هل جميع routes المحمية تُحقق من المستخدم؟
   - هل هناك bypass محتمل للمشرف؟
   
2. **حماية البيانات:**
   - هل البيانات الحساسة مُشفرة؟
   - هل هناك بيانات تُخزن في localStorage بدون داعي؟
   
3. **الاستعلامات:**
   - جميع أماكن SQL injection المحتملة
   - NoSQL injection (إذا كان applicable)
   
4. **رفع الملفات:**
   - تحقق من نوع الملف
   - تحقق من حجم الملف
   - معالجة الصور

5. **Rate Limiting:**
   - هل موجود؟
   - على أي endpoints؟
   - ما الحدود؟

6. **CORS وCSRF:**
   - التكوينات الحالية
   - نقاط الضعف

7. **Logging:**
   - هل البيانات الحساسة تُسجل؟
   - هل هناك proper error handling؟

نسق الرد:
```markdown
## الثغرات الأمنية المكتشفة

### حرجة (P0):
1. [اسم الثغرة]
   - **الملف:** X
   - **السطر:** Y
   - **التأثير:** Z
   - **الإصلاح:** [...]

### عالية (P1):
[...]

### متوسطة (P2):
[...]

## التوصيات الأمنية
[...]
```
```

### Prompt: تحليل الأداء

```
راجع الأداء المحتمل:

# نقاط الفحص:
1. **Client-side vs Server-side:**
   - ما الصفحات تستخدم 'use client' بدون داعي؟
   - أي data fetching يحدث client-side؟

2. **Re-renders:**
   - مكونات بدون memoization
   - useEffect بدون dependencies صحيحة
   - Props drilling

3. **Data fetching:**
   - N+1 queries
   - جلب بيانات غير مستخدمة
   - عدم وجود pagination

4. **Bundle size:**
   - مكتبات ضخمة غير ضرورية
   - code splitting غير مُحسّن

5. **Images:**
   - استخدام next/image
   - lazy loading
   - image optimization

نسق الرد:
```typescript
## مشاكل الأداء

### Client-side rendering غير ضروري:
```typescript
// src/app/page.tsx
'use client'; // ❌ غير ضروري

// الحل:
// حذف 'use client' + نقل التفاعلات لمكونات فرعية
```

### Re-render issues:
```typescript
// PropertyCard.tsx:45
useEffect(() => {
  checkFavoriteStatus();
}, [user, id]); // ❌ checkFavoriteStatus مفقودة

// الحل:
const checkFavoriteStatus = useCallback(async () => {
  // ...
}, [user]);
```

[...]
```
```

---

## 📊 Prompt للمقارنة

### Prompt: مقارنة التقرير بالكود

```
لديك تقرير مراجعة سابق حدد المشاكل التالية:

[نسخ قائمة المشاكل العشرة]

مهمتك:
1. **تأكيد كل مشكلة** من الكود الفعلي
2. **تحديد أي false positives** (مشاكل غير موجودة)
3. **اكتشاف مشاكل جديدة** لم تُذكر في التقرير

نسق الرد:
```json
{
  "confirmed_issues": [
    {
      "id": "#1",
      "name": "IS_MOCK_MODE hardcoded",
      "status": "confirmed",
      "evidence": "Line 6 in supabaseService.ts",
      "severity": "P0"
    }
  ],
  "false_positives": [
    {
      "id": "#2",
      "name": "AdminGuard broken",
      "reason": "profile property exists in updated AuthContext"
    }
  ],
  "new_issues": [
    {
      "name": "Missing input validation in X",
      "severity": "P1",
      "file": "...",
      "line": X
    }
  ]
}
```
```

---

## 🎯 Prompts حسب الأولوية

### الأسبوع 1: Prompts للمشاكل الحرجة

```
راجع المشاكل ذات الأولوية P0 فقط:

1. IS_MOCK_MODE hardcoded
2. Payment bypass
3. SQL Injection
4. Booking race condition

لكل مشكلة، قدّم:
- ✅ تأكيد من الكود
- 🔧 حل كامل جاهز للتطبيق
- ⏱️ وقت تقديري دقيق
- 🧪 خطوات اختبار

تنسيق الحل:
```typescript
// ===== BEFORE (Current Code) =====
[كود حالي كامل]

// ===== AFTER (Fixed Code) =====
[كود مُصلح كامل]

// ===== TESTING =====
// 1. Test case: ...
// 2. Expected result: ...
// 3. Edge cases: ...
```
```

### الأسبوع 2: Prompts للأمان

```
راجع المشاكل الأمنية (P0-P1):

- Rate limiting
- File upload validation  
- Error boundaries
- Input validation

لكل مشكلة، قدّم:
- تحليل المخاطر
- أمثلة exploit
- حل شامل
- اختبارات أمنية

تنسيق:
```markdown
## [اسم المشكلة]

### تحليل المخاطر
- **احتمالية الاستغلال:** High/Medium/Low
- **التأثير:** [...]

### سيناريو Exploit
```typescript
// كيف يمكن استغلالها:
[...]
```

### الحل
```typescript
// الكود المُصلح:
[...]
```

### اختبارات الأمان
```typescript
// Test 1: Normal case
// Test 2: Attack attempt
// Test 3: Edge case
```
```
```

### الأسبوع 3: Prompts لإعادة الهيكلة

```
راجع البنية وحدد:

1. **ملفات للدمج:**
   - ما الملفات المكررة؟
   - أي منطق يمكن توحيده؟

2. **مكونات للتقسيم:**
   - ما الملفات >300 سطر؟
   - أي مكونات تفعل أكثر من شيء؟

3. **تحسينات معمارية:**
   - أي abstractions مفقودة؟
   - ما يمكن استخراجه لـ hooks/utils؟

نسق الرد:
```markdown
## خطة إعادة الهيكلة

### المرحلة 1: الدمج
1. **دمج نماذج المصادقة**
   - Files: LoginForm.tsx, SignUpForm.tsx → AuthForm.tsx
   - Lines saved: ~200
   - Time: 3 hours

[...]

### المرحلة 2: التقسيم
1. **تقسيم BookingPage**
   - Current: 551 lines
   - Split into: [قائمة مكونات]
   - Time: 4 hours

[...]

### المرحلة 3: الاستخراج
[...]
```
```

---

## 🧪 Prompts للاختبار

### Prompt: إنشاء خطة اختبار

```
بناءً على المشاكل المُصلحة، أنشئ خطة اختبار شاملة:

# اختبارات المطلوبة:
1. **Unit tests:** للدوال الحرجة
2. **Integration tests:** للتدفقات الكاملة
3. **E2E tests:** للـ critical paths
4. **Security tests:** لكل ثغرة مُصلحة

نسق الرد:
```typescript
// ===== UNIT TESTS =====

describe('unlockProperty', () => {
  it('should reject without approved payment', async () => {
    // Test code
  });
  
  it('should reject if amount < 50', async () => {
    // Test code
  });
  
  it('should mark payment as consumed', async () => {
    // Test code
  });
});

// ===== INTEGRATION TESTS =====

describe('Booking Flow', () => {
  it('should prevent double booking', async () => {
    // Simulate concurrent requests
  });
});

// ===== E2E TESTS =====

test('Complete booking flow', async ({ page }) => {
  // Playwright test
});

// ===== SECURITY TESTS =====

test('SQL Injection prevention', () => {
  // Malicious input tests
});
```
```

---

## 📝 Prompt النهائي الشامل

```
# المراجعة النهائية الشاملة

أنت senior full-stack code reviewer. راجع مشروع Gamasa Properties بالكامل وقدّم:

## 1. Executive Summary
- درجة عامة (0-10)
- أكبر 3 نقاط قوة
- أكبر 3 نقاط ضعف
- جاهزية الإنتاج (Yes/No + السبب)

## 2. Detailed Analysis

### A. Architecture (0-10)
- البنية العامة
- Separation of concerns
- Design patterns
- Scalability

### B. Security (0-10)
- Authentication/Authorization
- Data protection
- Input validation
- Rate limiting

### C. Performance (0-10)
- Loading speed
- Bundle size
- Database queries
- Rendering optimization

### D. Code Quality (0-10)
- Readability
- Maintainability
- Test coverage
- Documentation

### E. UX/UI (0-10)
- User experience
- Accessibility
- Mobile responsive
- Error handling

## 3. Priority Issues (Top 10)
[قائمة مفصلة]

## 4. Recommended Roadmap
- Week 1: [Tasks]
- Week 2: [Tasks]
- Week 3: [Tasks]
- Week 4: [Tasks]

## 5. Estimated Time to Production
[X weeks with justification]

نسق الرد كـ Markdown report كامل.
```

---

## 🎨 Prompts للـ Frontend

### Prompt: مراجعة المكونات

```
راجع جميع المكونات في `/src/components`:

لكل مكون، حدد:
1. **Props validation:** هل الـ types واضحة وكاملة؟
2. **State management:** هل الـ state في المكان الصحيح؟
3. **Performance:** هل يحتاج memo/callback/useMemo؟
4. **Accessibility:** aria-labels، keyboard navigation، إلخ
5. **Styling:** tailwind classes، responsive، dark mode
6. **Error handling:** loading states، error states
7. **Reusability:** هل يمكن استخدامه في أماكن أخرى؟

نسق الرد:
```typescript
## PropertyCard.tsx

### ✅ نقاط القوة:
- Props well-typed
- Good image handling

### ⚠️ مشاكل:
1. **Performance:**
   ```typescript
   // Current (re-renders unnecessarily)
   export function PropertyCard(props) { ... }
   
   // Fixed
   export const PropertyCard = React.memo(function PropertyCard(props) {
     // ...
   });
   ```

2. **Accessibility:**
   ```typescript
   // Current (missing aria-label)
   <button onClick={handleFavorite}>
     <HeartIcon />
   </button>
   
   // Fixed
   <button 
     onClick={handleFavorite}
     aria-label="إضافة للمفضلة"
   >
     <HeartIcon />
   </button>
   ```

[...]
```
```

---

## 🔧 Prompts للـ Backend

### Prompt: مراجعة الخدمات

```
راجع `/src/services/supabaseService.ts`:

لكل دالة، حدد:
1. **Error handling:** try-catch، رسائل واضحة
2. **Validation:** تحقق من المدخلات
3. **Security:** authorization checks
4. **Performance:** efficient queries، avoid N+1
5. **Type safety:** return types واضحة
6. **Documentation:** JSDoc comments

نسق الرد:
```typescript
## createBooking()

### ⚠️ مشاكل:

1. **Missing validation:**
   ```typescript
   // Add at start:
   if (!bookingData.startDate || !bookingData.endDate) {
     throw new Error('التواريخ مطلوبة');
   }
   
   if (new Date(bookingData.endDate) <= new Date(bookingData.startDate)) {
     throw new Error('تاريخ الانتهاء يجب أن يكون بعد البداية');
   }
   ```

2. **Race condition:**
   [تحليل + حل]

3. **Missing JSDoc:**
   ```typescript
   /**
    * Creates a new booking for a property
    * @param bookingData - Booking details
    * @returns {Promise<{data, error}>} Booking result
    * @throws {Error} If dates are invalid or property unavailable
    */
   async createBooking(bookingData: BookingData): Promise<BookingResult> {
     // ...
   }
   ```

[...]
```
```

---

## 📊 ملخص الاستخدام

### كيفية الاستخدام:

1. **للمراجعة السريعة:**
   استخدم الـ Prompt الأساسي + Prompts المتخصصة للمشاكل المحددة

2. **للمراجعة الشاملة:**
   استخدم Prompt النهائي الشامل

3. **لمراجعة تدريجية:**
   استخدم Prompts حسب الأسبوع (1-4)

4. **لمراجعة محددة:**
   استخدم Prompts المتخصصة (Frontend, Backend, Security, إلخ)

### نصائح:
- ✅ ابدأ بالـ Prompts البسيطة ثم انتقل للشاملة
- ✅ استخدم نسق JSON للنتائج القابلة للمعالجة
- ✅ اطلب أمثلة كود كاملة (قبل/بعد)
- ✅ اطلب تقدير وقت دقيق لكل إصلاح
- ✅ اطلب خطوات اختبار لكل إصلاح

---

## 🎯 Checklist قبل الإرسال

قبل إرسال أي prompt للـ AI:

- [ ] حدد الهدف بوضوح
- [ ] حدد نسق المخرجات المطلوب
- [ ] أعطِ سياق كافٍ (المشروع، التقنيات، إلخ)
- [ ] حدد ما تريد بالضبط (تأكيد، حل، اقتراح، إلخ)
- [ ] اطلب أمثلة كود محددة
- [ ] اطلب تقدير وقت

---

## 📚 مصادر إضافية

### للمراجع السريع:
- [Technical Audit Report](./gamasa_technical_analysis.md)
- [Actionable Tasks](./gamasa_tasks_actionable.md)
- [Comparison Analysis](./gamasa_comparison_analysis.md)

### للفريق:
شارك هذه الـ Prompts مع الفريق ليتمكن أي مطور من:
1. مراجعة الكود بنفس المعايير
2. الحصول على نتائج متسقة
3. توفير الوقت في الكتابة من الصفر
