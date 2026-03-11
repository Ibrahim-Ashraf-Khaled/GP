# Supabase Migrations

This directory contains SQL migrations for the Gamasa Properties application. These migrations must be executed manually in the Supabase Dashboard.

## 📋 Quick Setup Guide

### Prerequisites

Before running these migrations, ensure:
1. You have a Supabase project set up
2. The `properties` table exists
3. The `properties-images` storage bucket exists

### Execution Order

Execute the SQL files in this exact order:

1. **Security (P0)** - Must be executed before production use:
   - `20240311_P0-01_rls_properties.sql` - Enable RLS on properties table
   - `20240311_P0-02_storage_policies.sql` - Set up storage bucket policies
   - `20240311_P0-03_database_indexes.sql` - Create performance indexes

2. **Functions & Triggers (P3)** - Optional but recommended:
   - `20240311_P3-01_increment_views_function.sql` - Auto-increment views
   - `20240311_P3-02_user_stats_function.sql` - Aggregate user statistics
   - `20240311_P3-03_updated_at_trigger.sql` - Auto-update timestamps

## 📁 Migration Files

### P0 - Security (Critical)

#### `20240311_P0-01_rls_properties.sql`
**Purpose:** Enable Row Level Security (RLS) on the properties table

**What it does:**
- Enables RLS on properties table
- Creates policies to ensure users can only access their own properties
- Allows public access to available properties (browse page)

**Required for:** Production deployment

---

#### `20240311_P0-02_storage_policies.sql`
**Purpose:** Secure the properties-images storage bucket

**What it does:**
- Creates policies for user folder isolation
- Users can only upload/delete in their own folder
- Public read access for images

**Required for:** Production deployment

---

#### `20240311_P0-03_database_indexes.sql`
**Purpose:** Improve query performance

**What it does:**
- Creates indexes on `owner_id`, `status`, `created_at`
- Adds composite indexes for common query patterns
- Improves search and filtering performance

**Required for:** Production deployment

---

### P3 - Database Functions (Optional but Recommended)

#### `20240311_P3-01_increment_views_function.sql`
**Purpose:** Safely increment property views

**What it does:**
- Creates a secure RPC function to increment views
- Uses `SECURITY DEFINER` for safe execution
- Prevents direct UPDATE access to sensitive data

**Usage:**
```typescript
await supabase.rpc('increment_property_views', { property_id: 'your-id' });
```

---

#### `20240311_P3-02_user_stats_function.sql`
**Purpose:** Get user property statistics efficiently

**What it does:**
- Aggregates property stats in a single query
- Returns: total properties, available count, rented count, total views
- Replaces 4 separate queries for better performance

**Usage:**
```typescript
const { data } = await supabase.rpc('get_user_property_stats', { user_id: 'your-id' });
```

---

#### `20240311_P3-03_updated_at_trigger.sql`
**Purpose:** Auto-update timestamps

**What it does:**
- Creates a trigger to automatically update `updated_at`
- Runs before every UPDATE on properties table
- Prevents manual timestamp errors

**Note:** After this trigger, you no longer need to manually set `updated_at` in your code.

---

## 🚀 How to Execute

### Option 1: Supabase Dashboard (Recommended for quick setup)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy the content of each SQL file
5. Paste and click **Run**

### Option 2: Using Supabase CLI (Recommended for development)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Execute all migrations
supabase db push
```

---

## ✅ Verification

After executing migrations, verify:

### RLS Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'properties';
```

### Storage Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Indexes
```sql
SELECT * FROM pg_indexes WHERE tablename = 'properties';
```

### Functions
```sql
SELECT proname FROM pg_proc WHERE proname LIKE '%property%';
```

### Triggers
```sql
SELECT * FROM information_schema.triggers WHERE event_object_table = 'properties';
```

---

## ⚠️ Important Notes

1. **Execute in order:** Migrations must be executed in the order listed above
2. **No rollback included:** These scripts don't include rollback functionality
3. **Test in development first:** Always test in a development environment before production
4. **Backup your database:** Take a backup before running migrations in production
5. **Check existing policies:** Scripts include `DROP POLICY IF EXISTS` to avoid conflicts

---

## 🔍 Troubleshooting

### Error: "relation 'properties' does not exist"
**Solution:** Make sure the `properties` table exists before running RLS migration

### Error: "bucket 'properties-images' does not exist"
**Solution:** Create the storage bucket first:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties-images', 'properties-images', true);
```

### RLS policies not working
**Solution:** Ensure RLS is enabled:
```sql
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
```

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

---

*Last updated: March 2026*
