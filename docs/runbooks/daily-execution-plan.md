# 📅 Gamasa Properties - خطة التنفيذ اليومية المفصلة

## 🎯 نظرة عامة

هذا الملف يحتوي على خطة تنفيذ يومية دقيقة لمدة 4 أسابيع (20 يوم عمل).
كل يوم مقسّم إلى مهام محددة بالساعة مع الكود الجاهز للتطبيق.

**جدول العمل:** 8 ساعات يومياً (9:00 صباحاً - 5:00 مساءً)
**أيام العمل:** الأحد - الخميس (5 أيام/أسبوع)

---

## 🔴 الأسبوع الأول: إصلاحات حرجة

### 📆 اليوم 1 (الأحد)

#### ⏰ 9:00 - 10:00 (1 ساعة): Setup & Planning
```bash
# 1. Clone repository
git clone [repo-url]
cd gamasa-properties

# 2. Create backup branch
git checkout -b backup-before-fixes
git push origin backup-before-fixes

# 3. Create development branch
git checkout -b week1-critical-fixes

# 4. Install dependencies
npm install

# 5. Setup environment
cp .env.example .env.local
# Edit .env.local with proper Supabase credentials
```

**Checklist:**
- [ ] Repository cloned
- [ ] Backup created
- [ ] Dev branch created
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Project runs locally

---

#### ⏰ 10:00 - 11:00 (1 ساعة): Fix IS_MOCK_MODE

**Task #1.1: إصلاح المتغير في supabaseService.ts**

```typescript
// File: src/services/supabaseService.ts

// ❌ BEFORE - Line 6
export const IS_MOCK_MODE = true;

// ✅ AFTER - Line 6
export const IS_MOCK_MODE = 
  typeof window !== 'undefined'
    ? window.localStorage.getItem('DEV_MOCK_MODE') === 'true'
    : process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true';
```

**Task #1.2: إصلاح AuthContext.tsx**

```typescript
// File: src/context/AuthContext.tsx

// ❌ BEFORE - Line 9
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true' || true;

// ✅ AFTER - Line 9
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true';
```

**Task #1.3: إعداد Environment Files**

```bash
# File: .env.production
NEXT_PUBLIC_IS_MOCK_MODE=false
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key

# File: .env.local (للتطوير)
NEXT_PUBLIC_IS_MOCK_MODE=true
NEXT_PUBLIC_SUPABASE_URL=your-dev-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-key
```

**Testing:**
```bash
# Test mock mode ON
export NEXT_PUBLIC_IS_MOCK_MODE=true
npm run dev
# Verify mock data appears

# Test mock mode OFF
export NEXT_PUBLIC_IS_MOCK_MODE=false
npm run dev
# Verify Supabase data appears
```

**Commit:**
```bash
git add .
git commit -m "fix: Remove hardcoded IS_MOCK_MODE flag

- Changed IS_MOCK_MODE to read from environment
- Removed || true fallback in AuthContext
- Added proper .env files
- Tested both modes

Fixes #1 (Mock Mode Blocker)"
```

**Checklist:**
- [ ] supabaseService.ts updated
- [ ] AuthContext.tsx updated
- [ ] .env files created
- [ ] Both modes tested
- [ ] Committed

---

#### ⏰ 11:00 - 12:00 (1 ساعة): Fix SQL Injection

**Task #2.1: بحث عن جميع الحالات**

```bash
# Find all potential SQL injection points
grep -rn "\.or(\`" src/
grep -rn "\${" src/services/*.ts
```

**Task #2.2: إصلاح checkAvailability**

```typescript
// File: src/services/supabaseService.ts

// ❌ BEFORE - Line ~1131
async checkAvailability(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<{ available: boolean; error: any }> {
  if (IS_MOCK_MODE) {
    return { available: true, error: null };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('property_id', propertyId)
    .in('status', ['confirmed', 'pending'])
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);
    // ❌ SQL INJECTION RISK

  return {
    available: !data || data.length === 0,
    error
  };
}

// ✅ AFTER
async checkAvailability(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<{ available: boolean; error: any }> {
  if (IS_MOCK_MODE) {
    return { available: true, error: null };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('property_id', propertyId)
    .in('status', ['confirmed', 'pending'])
    .gte('end_date', startDate)      // ✅ Safe
    .lte('start_date', endDate);     // ✅ Safe

  return {
    available: !data || data.length === 0,
    error
  };
}
```

**Task #2.3: اختبار مع malicious input**

```typescript
// File: tests/sql-injection.test.ts (جديد)

describe('SQL Injection Prevention', () => {
  it('should handle malicious date inputs', async () => {
    const maliciousDate = "2024-01-01' OR '1'='1";
    
    const result = await supabaseService.checkAvailability(
      'property-123',
      '2024-01-01',
      maliciousDate
    );
    
    // Should not cause SQL error
    expect(result.error).toBeNull();
  });
});
```

**Commit:**
```bash
git add .
git commit -m "fix: Prevent SQL injection in availability check

- Replaced .or() string interpolation with .gte()/.lte()
- Removed all template literals from SQL queries
- Added test for malicious inputs

Fixes #5 (SQL Injection)"
```

**Checklist:**
- [ ] checkAvailability fixed
- [ ] All .or() with interpolation found
- [ ] Test added
- [ ] Committed

---

#### ⏰ 12:00 - 1:00 (1 ساعة): غداء 🍽️

---

#### ⏰ 1:00 - 3:00 (2 ساعات): Fix Schema/Types Mismatch

**Task #3.1: تحليل التعارضات**

```bash
# Compare schema and types
diff schema.sql src/types/database.types.ts

# Expected differences:
# - booking_type: 'day' vs 'يوم'
# - category: 'apartment' vs 'شقة'
# - status: 'available' vs 'متاح'
```

**Task #3.2: تحديث Schema للإنجليزية**

```sql
-- File: supabase/migrations/20260208_fix_enum_values.sql

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

-- Fix user roles
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('landlord', 'tenant', 'both'));
```

**Task #3.3: تحديث Types**

```typescript
// File: src/types/database.types.ts

// ✅ Update to match schema
export type BookingType = 'daily' | 'weekly' | 'monthly' | 'seasonal';
export type PropertyCategory = 'apartment' | 'villa' | 'chalet' | 'studio' | 'office' | 'land';
export type PropertyStatus = 'available' | 'unavailable' | 'pending' | 'rented';
export type UserRole = 'landlord' | 'tenant' | 'both';

// Add translation helpers for UI
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

export const STATUS_AR: Record<PropertyStatus, string> = {
  available: 'متاح',
  unavailable: 'غير متاح',
  pending: 'قيد المراجعة',
  rented: 'مؤجر'
};

export const ROLE_AR: Record<UserRole, string> = {
  landlord: 'مؤجر',
  tenant: 'مستأجر',
  both: 'كلاهما'
};
```

**Task #3.4: تحديث الكود المستخدم**

```typescript
// Example: src/components/PropertyCard.tsx

// ❌ BEFORE
<span>{property.category}</span> // Shows 'apartment'

// ✅ AFTER
import { CATEGORY_AR } from '@/types/database.types';
<span>{CATEGORY_AR[property.category]}</span> // Shows 'شقة'
```

**Task #3.5: تطبيق Migration**

```bash
# In Supabase Dashboard > SQL Editor
# Run the migration file
# Or via CLI:
supabase db push
```

**Testing:**
```typescript
// Test CRUD operations
const property = await supabaseService.createProperty({
  category: 'apartment', // ✅ English value
  status: 'available',
  // ...
});

expect(property.category).toBe('apartment');

// Test UI displays Arabic
const label = CATEGORY_AR[property.category];
expect(label).toBe('شقة');
```

**Commit:**
```bash
git add .
git commit -m "fix: Align database schema with TypeScript types

Schema changes:
- booking_type: Arabic → English values
- category: Arabic → English values
- status: Arabic → English values
- role: Arabic → English values

Code changes:
- Updated database.types.ts
- Added translation maps for UI (CATEGORY_AR, etc)
- Updated all components to use translations

Fixes #7 (Schema/Types Mismatch)"
```

**Checklist:**
- [ ] Migration created
- [ ] Migration applied in Supabase
- [ ] Types updated
- [ ] Translation maps added
- [ ] Components updated
- [ ] CRUD tested
- [ ] Committed

---

#### ⏰ 3:00 - 5:00 (2 ساعات): Begin Race Condition Fix

**Task #4.1: إنشاء Database Function**

```sql
-- File: supabase/migrations/20260208_atomic_booking.sql

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
  -- Lock the property's booking rows for this transaction
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
      -- New booking starts during existing
      (p_start_date >= start_date AND p_start_date < end_date)
      OR
      -- New booking ends during existing
      (p_end_date > start_date AND p_end_date <= end_date)
      OR
      -- New booking contains existing
      (p_start_date <= start_date AND p_end_date >= end_date)
    );
  
  -- Conflict found
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
  
  -- Check property exists and available
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
  
  -- All checks passed - create booking
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
  
  -- Success
  RETURN QUERY SELECT 
    v_booking_id, 
    TRUE, 
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Add performance index
CREATE INDEX IF NOT EXISTS idx_bookings_property_date_status
ON bookings (property_id, start_date, end_date, status)
WHERE status IN ('confirmed', 'pending');
```

**Task #4.2: تطبيق في Supabase**

```bash
# في Supabase Dashboard > SQL Editor
# 1. Paste the SQL above
# 2. Run
# 3. Verify no errors
# 4. Test the function:

SELECT * FROM create_booking_atomically(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  '123e4567-e89b-12d3-a456-426614174001'::UUID,
  '2026-03-01'::DATE,
  '2026-03-05'::DATE,
  'daily',
  1000.00,
  'online'
);

-- Should return: booking_id, TRUE, NULL
```

**Checklist:**
- [ ] SQL function created
- [ ] Function tested in Supabase
- [ ] Index added
- [ ] No errors

**End of Day 1**
```bash
git add .
git commit -m "wip: Add atomic booking database function

- Created create_booking_atomically function
- Added proper overlap detection logic
- Added validation for dates and property status
- Added performance index

Part of #3 (Race Condition Fix)
Next: Update TypeScript code to use function"

git push origin week1-critical-fixes
```

---

### 📆 اليوم 2 (الإثنين)

#### ⏰ 9:00 - 10:00 (1 ساعة): Daily Standup + Review Day 1

**Activities:**
- [ ] Review yesterday's commits
- [ ] Test IS_MOCK_MODE still works
- [ ] Test SQL injection fix
- [ ] Test schema changes
- [ ] Note any issues

---

#### ⏰ 10:00 - 12:00 (2 ساعات): Complete Race Condition Fix

**Task #4.3: تحديث createBooking في الكود**

```typescript
// File: src/services/supabaseService.ts

// ❌ DELETE OLD IMPLEMENTATION
async checkAvailability(...) { ... } // DELETE ENTIRE FUNCTION
async createBooking(bookingData: any) { ... } // DELETE OLD VERSION

// ✅ ADD NEW IMPLEMENTATION
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
  // Mock mode (for development)
  if (IS_MOCK_MODE) {
    const mockBooking = {
      id: `BK-${Date.now()}`,
      ...params,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: { id: mockBooking.id },
      error: null
    };
  }

  // Production mode - use atomic function
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
      console.error('Booking RPC error:', error);
      return {
        data: null,
        error: { message: 'حدث خطأ في إنشاء الحجز' }
      };
    }

    // data is array with single row
    const result = data?.[0];
    
    if (!result) {
      return {
        data: null,
        error: { message: 'لم يتم إرجاع نتيجة' }
      };
    }

    if (!result.success) {
      return {
        data: null,
        error: { message: result.error_message || 'فشل الحجز' }
      };
    }

    return {
      data: { id: result.booking_id },
      error: null
    };
  } catch (error: any) {
    console.error('Booking error:', error);
    return {
      data: null,
      error: { message: error.message || 'حدث خطأ غير متوقع' }
    };
  }
}
```

**Task #4.4: تحديث BookingPage**

```typescript
// File: src/app/property/[id]/booking/page.tsx

// Find the handleBooking function (around line 146)

const handleBooking = async () => {
  if (!user) {
    alert('يجب تسجيل الدخول أولاً');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // ✅ Use new atomic booking
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

    // Success!
    setSuccess(true);
    
    // Optional: Navigate to bookings page
    setTimeout(() => {
      router.push('/my-bookings');
    }, 2000);
    
  } catch (err: any) {
    setError(err.message || 'حدث خطأ في الحجز');
  } finally {
    setLoading(false);
  }
};
```

**Checklist:**
- [ ] createBooking updated
- [ ] checkAvailability removed
- [ ] BookingPage updated
- [ ] Code compiles

---

#### ⏰ 12:00 - 1:00 (1 ساعة): غداء 🍽️

---

#### ⏰ 1:00 - 3:00 (2 ساعات): Test Race Condition Fix

**Task #4.5: كتابة اختبارات Race Condition**

```typescript
// File: tests/booking.race-condition.test.ts (جديد)

import { supabaseService } from '@/services/supabaseService';

describe('Booking Race Condition Prevention', () => {
  const testPropertyId = 'test-prop-123';
  const startDate = '2026-03-01';
  const endDate = '2026-03-05';

  beforeAll(async () => {
    // Create test property
    await supabase
      .from('properties')
      .insert({
        id: testPropertyId,
        title: 'Test Property',
        status: 'available',
        // ... other required fields
      });
  });

  afterAll(async () => {
    // Cleanup
    await supabase
      .from('bookings')
      .delete()
      .eq('property_id', testPropertyId);
      
    await supabase
      .from('properties')
      .delete()
      .eq('id', testPropertyId);
  });

  it('should prevent double booking with concurrent requests', async () => {
    // Create 2 concurrent booking requests
    const booking1Promise = supabaseService.createBooking({
      propertyId: testPropertyId,
      guestId: 'user-1',
      startDate,
      endDate,
      rentalType: 'daily',
      totalAmount: 1000,
      bookingType: 'online'
    });

    const booking2Promise = supabaseService.createBooking({
      propertyId: testPropertyId,
      guestId: 'user-2',
      startDate,
      endDate,
      rentalType: 'daily',
      totalAmount: 1000,
      bookingType: 'online'
    });

    // Execute concurrently
    const [result1, result2] = await Promise.all([
      booking1Promise,
      booking2Promise
    ]);

    // Exactly ONE should succeed
    const successes = [result1, result2].filter(r => !r.error);
    const failures = [result1, result2].filter(r => r.error);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);

    // Error message should be clear
    const failedResult = failures[0];
    expect(failedResult.error?.message).toContain('محجوز');
  });

  it('should allow non-overlapping bookings', async () => {
    // First booking: March 1-5
    const booking1 = await supabaseService.createBooking({
      propertyId: testPropertyId,
      guestId: 'user-1',
      startDate: '2026-03-01',
      endDate: '2026-03-05',
      rentalType: 'daily',
      totalAmount: 1000,
      bookingType: 'online'
    });

    expect(booking1.error).toBeNull();
    expect(booking1.data).toBeTruthy();

    // Second booking: March 6-10 (no overlap)
    const booking2 = await supabaseService.createBooking({
      propertyId: testPropertyId,
      guestId: 'user-2',
      startDate: '2026-03-06',
      endDate: '2026-03-10',
      rentalType: 'daily',
      totalAmount: 1000,
      bookingType: 'online'
    });

    expect(booking2.error).toBeNull();
    expect(booking2.data).toBeTruthy();

    // Both should succeed
  });

  it('should detect partial overlaps', async () => {
    // First booking: March 1-5
    const booking1 = await supabaseService.createBooking({
      propertyId: testPropertyId,
      guestId: 'user-1',
      startDate: '2026-03-01',
      endDate: '2026-03-05',
      rentalType: 'daily',
      totalAmount: 1000,
      bookingType: 'online'
    });

    expect(booking1.error).toBeNull();

    // Try to book March 3-7 (overlaps with 3-5)
    const booking2 = await supabaseService.createBooking({
      propertyId: testPropertyId,
      guestId: 'user-2',
      startDate: '2026-03-03',
      endDate: '2026-03-07',
      rentalType: 'daily',
      totalAmount: 1000,
      bookingType: 'online'
    });

    expect(booking2.error).toBeTruthy();
    expect(booking2.error?.message).toContain('محجوز');
  });
});
```

**Task #4.6: تشغيل الاختبارات**

```bash
# Install test dependencies if needed
npm install --save-dev @testing-library/react jest

# Run tests
npm test booking.race-condition.test.ts

# Expected output:
# ✓ should prevent double booking with concurrent requests
# ✓ should allow non-overlapping bookings  
# ✓ should detect partial overlaps
```

**Commit:**
```bash
git add .
git commit -m "fix: Implement atomic booking to prevent race conditions

Changes:
- Created create_booking_atomically database function
- Removed checkAvailability (now part of atomic function)
- Updated createBooking to use RPC
- Added comprehensive overlap detection
- Added concurrent request tests

Test results:
- ✓ Prevents double booking
- ✓ Allows non-overlapping bookings
- ✓ Detects partial overlaps

Fixes #3 (Race Condition in Bookings)"
```

**Checklist:**
- [ ] Tests written
- [ ] All tests pass
- [ ] Manual testing done
- [ ] Committed

---

#### ⏰ 3:00 - 5:00 (2 ساعات): Fix unlockProperty

**Task #5.1: إضافة عمود is_consumed**

```sql
-- File: supabase/migrations/20260208_payment_consumed.sql

-- Add is_consumed column
ALTER TABLE payment_requests 
ADD COLUMN IF NOT EXISTS is_consumed BOOLEAN DEFAULT FALSE;

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_payment_requests_active
ON payment_requests(property_id, user_id, status, is_consumed)
WHERE status = 'approved' AND is_consumed = FALSE;

-- Prevent duplicate unconsumed payments
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_requests_unique_active
ON payment_requests(property_id, user_id)
WHERE status = 'approved' AND is_consumed = FALSE;
```

**Task #5.2: إنشاء دالة Unlock Atomic**

```sql
-- File: supabase/migrations/20260208_atomic_unlock.sql

CREATE OR REPLACE FUNCTION unlock_property_with_payment(
  p_user_id UUID,
  p_property_id UUID,
  p_payment_id UUID
) RETURNS VOID AS $$
DECLARE
  v_payment_amount DECIMAL;
  v_min_amount DECIMAL := 50.00;
BEGIN
  -- Get payment and mark as consumed atomically
  UPDATE payment_requests
  SET is_consumed = TRUE
  WHERE id = p_payment_id
    AND user_id = p_user_id
    AND property_id = p_property_id
    AND status = 'approved'
    AND is_consumed = FALSE
  RETURNING amount INTO v_payment_amount;
  
  -- Check if payment was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'لا يوجد دفع معتمد أو تم استخدامه بالفعل';
  END IF;
  
  -- Validate amount
  IF v_payment_amount < v_min_amount THEN
    -- Rollback the update
    UPDATE payment_requests
    SET is_consumed = FALSE
    WHERE id = p_payment_id;
    
    RAISE EXCEPTION 'المبلغ المدفوع (% جنيه) أقل من الحد الأدنى (% جنيه)',
      v_payment_amount, v_min_amount;
  END IF;
  
  -- Insert unlock record (ignore if already exists)
  INSERT INTO unlocked_properties (user_id, property_id, unlocked_at)
  VALUES (p_user_id, p_property_id, NOW())
  ON CONFLICT (user_id, property_id) DO NOTHING;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Ensure rollback on any error
    RAISE;
END;
$$ LANGUAGE plpgsql;
```

**Task #5.3: تحديث unlockProperty في الكود**

```typescript
// File: src/services/supabaseService.ts

async unlockProperty(
  userId: string, 
  propertyId: string
): Promise<void> {
  if (IS_MOCK_MODE) {
    _mockUnlocked.add(propertyId);
    return;
  }

  try {
    // Step 1: Find approved unconsumed payment
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

    // Step 2: Check if already unlocked
    const { data: alreadyUnlocked } = await supabase
      .from('unlocked_properties')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (alreadyUnlocked) {
      throw new Error('العقار مفتوح بالفعل');
    }

    // Step 3: Atomic unlock with payment consumption
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

    // Success!
  } catch (error: any) {
    console.error('Unlock property error:', error);
    throw error;
  }
}
```

**Task #5.4: اختبار**

```typescript
// File: tests/unlock-property.test.ts

describe('Unlock Property Security', () => {
  it('should require approved payment', async () => {
    await expect(
      supabaseService.unlockProperty('user-1', 'prop-1')
    ).rejects.toThrow('لا يوجد دفع معتمد');
  });

  it('should prevent payment reuse', async () => {
    // Create payment
    const payment = await createTestPayment({
      userId: 'user-1',
      propertyId: 'prop-1',
      amount: 50,
      status: 'approved'
    });

    // First unlock - should succeed
    await supabaseService.unlockProperty('user-1', 'prop-1');

    // Second unlock - should fail (payment consumed)
    await expect(
      supabaseService.unlockProperty('user-1', 'prop-1')
    ).rejects.toThrow('مفتوح بالفعل');
  });

  it('should validate minimum amount', async () => {
    // Create insufficient payment
    await createTestPayment({
      userId: 'user-1',
      propertyId: 'prop-1',
      amount: 30, // Less than 50
      status: 'approved'
    });

    await expect(
      supabaseService.unlockProperty('user-1', 'prop-1')
    ).rejects.toThrow('أقل من الحد الأدنى');
  });
});
```

**Commit:**
```bash
git add .
git commit -m "fix: Secure unlockProperty with payment verification

Database changes:
- Added is_consumed column to payment_requests
- Created unlock_property_with_payment function
- Added indexes and unique constraints

Code changes:
- Updated unlockProperty to verify payment
- Added amount validation (min 50 EGP)
- Prevent payment reuse
- Added comprehensive tests

Security:
- ✓ Requires approved payment
- ✓ Validates amount
- ✓ Prevents double unlock
- ✓ Atomic operation (transaction-safe)

Fixes #4 (Payment Bypass)"
```

**End of Day 2**

---

### 📆 اليوم 3 (الثلاثاء)

[... يستمر التنسيق بنفس التفصيل لبقية الأيام ...]

---

## 📊 ملخص التقدم

### نهاية كل يوم:

```bash
# نموذج Daily Report
echo "=== يوم X - ملخص التقدم ==="
echo "✅ المهام المكتملة: X/Y"
echo "⏱️  الوقت المستخدم: X ساعات"
echo "🐛 المشاكل المُصلحة: [قائمة]"
echo "🧪 الاختبارات: X passed, Y failed"
echo "📝 Commits: X"
echo ""
echo "📋 ليوم غداً:"
echo "- [ ] مهمة 1"
echo "- [ ] مهمة 2"
```

---

## 🎯 مقاييس النجاح اليومية

### Week 1 (Days 1-5):
- [ ] Day 1: IS_MOCK_MODE, SQL Injection, Schema fixed
- [ ] Day 2: Race Condition, unlockProperty fixed
- [ ] Day 3: Client/Server components, Input validation
- [ ] Day 4: Error boundaries, Rate limiting
- [ ] Day 5: Testing, Documentation, Week review

### Week 2 (Days 6-10):
- [ ] Auth system consolidation
- [ ] Full validation implementation
- [ ] Security hardening
- [ ] Performance baseline

### Week 3 (Days 11-15):
- [ ] Component refactoring
- [ ] Database optimization
- [ ] Code cleanup
- [ ] Documentation

### Week 4 (Days 16-20):
- [ ] Server Components
- [ ] Final optimization
- [ ] Production prep
- [ ] Launch!

---

**ملاحظة:** هذا نموذج مفصل لأول يومين. الأيام المتبقية تتبع نفس النمط مع مهام مختلفة.
