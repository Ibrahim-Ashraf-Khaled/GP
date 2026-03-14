# Gamasa Supabase — دليل الملفات النظيفة

## 📁 هيكل الملفات

```
clean_supabase/
├── MASTER_SCHEMA.sql     ← الملف الرئيسي (شغّله مرة واحدة على مشروع جديد)
├── functions.sql         ← الدوال فقط (للتحديث السريع بدون إعادة الـ schema)
├── README.md             ← هذا الملف
└── migrations/           ← ملفات الـ migrations للـ Supabase CLI (مرتبة ونظيفة)
    ├── 001_schema.sql
    ├── 002_bookings_alignment.sql
    ├── 003_property_contacts.sql
    ├── 004_admin_features.sql
    ├── 005_location_split.sql
    └── 006_storage_bucket.sql
```

---

## 🚀 طريقة الاستخدام

### للمشاريع الجديدة (Fresh Install)
1. افتح **Supabase Dashboard → SQL Editor**
2. شغّل الملف `MASTER_SCHEMA.sql` كاملاً

### لتحديث الدوال فقط
- شغّل `functions.sql` في SQL Editor

### للـ Supabase CLI
```bash
supabase db push
```

---

## 🗑️ الملفات المحذوفة (كانت في المشروع القديم)

| الملف | السبب |
|-------|--------|
| `20240311_P0-01_rls_properties.sql` | قديم — مُستبدَل بـ RLS أحدث |
| `20240311_P0-02_storage_policies.sql` | قديم — مُستبدَل بـ storage bucket migration |
| `20240311_P0-03_database_indexes.sql` | مُدمَج في MASTER_SCHEMA |
| `20240311_P3-01_increment_views_function.sql` | قديم — يحتوي على `last_viewed_at` غير موجود |
| `20240311_P3-02_user_stats_function.sql` | قديم — مُستبدَل |
| `20240311_P3-03_updated_at_trigger.sql` | قديم — مُستبدَل |
| `20260206230932_add_missing_columns_to_properties.sql` | مُدمَج في الـ schema الرئيسي |
| `20260206232511_update_constraints_for_arabic_support.sql` | مُستبدَل — constraints بالإنجليزية الآن |
| `20260208000001_add_payment_consumed.sql` | **مكرر** من `20260222125400` |
| `20260208000003_extend_bookings.sql` | **مكرر** من `20260222125401` |
| `20260208010000_fix_enum_values.sql` | مُستبدَل بـ constraints نهائية |
| `20260208143453_fix_enum_values_final.sql` | **مكرر** من السابق |
| `20260208162503_add_payment_consumed_column.sql` | **مكرر** |
| `20260208162511_add_unlock_property_function.sql` | مُستبدَل بـ functions.sql |
| `20260208162520_extend_bookings_schema.sql` | **مكرر** |
| `20260211224620_.sql` | تجربة `user_roles` غير مُكملة — لا يستخدمها الكود |
| `20260222125354_initial_schema_sync_retry_2.sql` | مُدمَج في MASTER_SCHEMA |
| `20260222125400_migration_001_payment_consumed_retry_2.sql` | مُدمَج |
| `20260222125401_migration_003_extend_bookings_retry_2.sql` | مُدمَج |
| `20260222125424_functions_sync_v3_fixed_params.sql` | مُستبدَل بـ functions.sql |
| `20260227010036_sync_schema_from_local.sql` | **مكرر** من `20260222125354` |
| `20260227010052_sync_functions_..._really_final.sql` | مُستبدَل بـ functions.sql |
| `20260304235520_align_bookings_status.sql` | **مكرر** من `20260305000001` |
| `20260304235521_add_bookings_indexes.sql` | **مكرر** من `20260305000003` |
| `20260308001123_fix_bookings_rls_v2.sql` | **مكرر** من `20260305000002` |
| `20260308001124_role_enum_unification.sql` | **مكرر** من `20260305000004` |
| `20260308001127_fix_handle_new_user_role_default.sql` | ملف فارغ |
| `20260308002000_sync_functions_sql_snapshot.sql` | مُستبدَل بـ functions.sql |

---

## ✅ الجداول الموجودة في MASTER_SCHEMA

| الجدول | الوصف |
|--------|--------|
| `profiles` | بيانات المستخدمين |
| `properties` | العقارات |
| `bookings` | الحجوزات |
| `payment_requests` | طلبات الدفع |
| `reviews` | التقييمات |
| `notifications` | الإشعارات |
| `favorites` | المفضلات |
| `unlocked_properties` | العقارات المفتوحة |
| `conversations` | المحادثات |
| `messages` | الرسائل |
| `property_status_history` | سجل تغيير حالة العقار |
| `admin_audit_logs` | سجل العمليات الإدارية |
| `property_contacts` | بيانات التواصل للعقارات |
