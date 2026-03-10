-- حذف القيود القديمة
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_category_check;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_price_unit_check;

-- إضافة قيود جديدة تدعم النصوص العربية والإنجليزية
ALTER TABLE properties 
ADD CONSTRAINT properties_category_check 
CHECK (category IN (
    'apartment', 'room', 'studio', 'villa', 'chalet',
    'شقة', 'غرفة', 'استوديو', 'فيلا', 'شاليه'
));

ALTER TABLE properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN (
    'pending', 'available', 'rented', 'rejected',
    'معلق', 'متاح', 'محجوز', 'مؤجر', 'مرفوض'
));

ALTER TABLE properties 
ADD CONSTRAINT properties_price_unit_check 
CHECK (price_unit IN (
    'day', 'week', 'month', 'season',
    'يوم', 'أسبوع', 'شهر', 'موسم'
));;
