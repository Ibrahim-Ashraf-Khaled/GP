# PR Checklist — Gamasa Properties

## ✅ Safety & Scope
- [ ] التغيير صغير وواضح (Minimal change) ومفيهوش refactor غير لازم
- [ ] لا توجد تغييرات “كاسرة” في API/contracts بدون توثيق
- [ ] أي تغيير في منطق الحجز/الدفع/الإلغاء مرتبط بمرجع داخل `01-source-docs/`

## 🧠 Business Logic
- [ ] منطق الـ Availability مشتق من bookings (مش cache غير محكوم)
- [ ] منع الحجز المزدوج (race conditions) مُغطى (DB guard/RPC/unique constraints حيث يلزم)
- [ ] State Machine transitions enforced (مش UI-only)

## 🔐 Security
- [ ] RLS policies تم التحقق منها (اقل صلاحيات)
- [ ] لا يوجد تخزين حساس في localStorage (tokens/passwords)
- [ ] أي endpoint/admin function مُحكم (role checks + audit)

## 🧪 Testing
- [ ] اختبارات تغطي happy path + edge cases الأساسية
- [ ] تم اختبار السيناريوهات: duplicate booking / payment spoof / cancellation

## 📈 Observability
- [ ] في logs/metrics مناسبة للأخطاء الحرجة
- [ ] لو أضفت event جديد: موثق في EDA docs

## 📌 Docs
- [ ] تحديث README/Docs لو احتاج
- [ ] رابط/إشارة للملف المرجعي (PDF/Analysis) المستخدم في القرار
