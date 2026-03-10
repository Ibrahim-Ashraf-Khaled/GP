-- إضافة الحقول الناقصة
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS owner_phone TEXT,
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rental_config JSONB,
ADD COLUMN IF NOT EXISTS available_dates JSONB;

-- تحديث owner_id ليكون NOT NULL إذا لم يكن كذلك بالفعل
-- سنتركه nullable حالياً للبيانات القديمة
-- ALTER TABLE properties ALTER COLUMN owner_id SET NOT NULL;

-- تحديث البيانات الافتراضية
UPDATE properties 
SET is_verified = FALSE 
WHERE is_verified IS NULL;

UPDATE properties 
SET views_count = 0 
WHERE views_count IS NULL;;
