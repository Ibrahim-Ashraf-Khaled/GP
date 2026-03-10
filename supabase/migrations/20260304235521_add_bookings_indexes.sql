CREATE INDEX IF NOT EXISTS idx_bookings_property_dates_status
  ON bookings(property_id, start_date, end_date, status)
  WHERE status IN ('confirmed', 'active');

CREATE INDEX IF NOT EXISTS idx_bookings_user_created
  ON bookings(user_id, created_at DESC);
;
