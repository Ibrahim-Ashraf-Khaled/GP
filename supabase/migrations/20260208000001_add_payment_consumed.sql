-- Migration: Add is_consumed column to payment_requests table
-- Date: 2026-02-08
-- Purpose: Fix payment bypass vulnerability (Issue #4)

-- Add is_consumed column to track payment consumption
ALTER TABLE payment_requests 
ADD COLUMN IF NOT EXISTS is_consumed BOOLEAN DEFAULT FALSE;

-- Add unique constraint to prevent duplicate active payments
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_requests_property_user_active
ON payment_requests(property_id, user_id)
WHERE status = 'approved' AND is_consumed = FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_consumed
ON payment_requests(user_id, property_id, status, is_consumed)
WHERE status = 'approved';