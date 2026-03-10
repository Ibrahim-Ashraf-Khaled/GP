# Actionable Tasks V2

## Phase 2

### Task 2.3: تأمين ومراجعة unlocked_properties
- [x] Implemented + Audited: تفعيل RLS (قراءة ذاتية، حذف للإدارة فقط، ومنع الإدخال المباشر).
- [x] فحص schema: الاعتماد بالكامل على Composite PK `(user_id, property_id)`.
- [x] دليل الفحص:
- `rg -n "select\\('id'\\)" src` لا يحتوي استخدامًا لـ `unlocked_properties`.
- الدالة `unlock_property_with_payment` تعمل بالتوقيع الثلاثي الآمن.

### PR2: Role Enum Unification
- [x] DB migration: ترحيل القيم القديمة إلى canonical (`tenant|landlord|admin`) + إعادة تأكيد القيود.
- [x] App checks: توحيد المقارنات على canonical role عبر `src/lib/roles.ts`.
- [x] Hard guard: أي role غير معروف يُطبّع إلى `tenant` (safe default) مع warning.
- [x] Regression safety: labels العربية محفوظة للعرض فقط.
