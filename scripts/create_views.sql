-- Admin views for Menahariya Smart Backend
-- Run this against your MySQL database to create views used by models

-- ============================================================
-- CARGO DETAIL VIEW
-- ============================================================
DROP VIEW IF EXISTS cargo_detail_view;

CREATE VIEW cargo_detail_view AS
SELECT
  c.cargo_id,
  c.owner_id,
  c.trip_id,
  c.description,
  c.weight,
  c.fee,
  c.status,
  c.created_at,
  u.full_name AS owner_name,
  t.departure_time,
  t.arrival_time,
  t.price AS trip_price,
  r.origin,
  r.destination,
  CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
  v.plate_number AS vehicle_plate,
  driver.full_name AS driver_name
FROM cargo c
LEFT JOIN users u ON c.owner_id = u.user_id
LEFT JOIN trips t ON c.trip_id = t.trip_id
LEFT JOIN routes r ON t.route_id = r.route_id
LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
LEFT JOIN users driver ON t.driver_id = driver.user_id;

-- ============================================================
-- PAYMENT DETAIL VIEW (admin payments with full context)
-- ============================================================
DROP VIEW IF EXISTS payment_detail_view;

CREATE VIEW payment_detail_view AS
SELECT
  p.payment_id,
  p.ticket_id,
  p.amount,
  p.payment_status,
  p.payment_method,
  p.created_at,
  u.full_name AS passenger_name,
  u.phone AS passenger_phone,
  u.email AS passenger_email,
  tk.seat_number,
  tk.ticket_status,
  tk.payment_status AS ticket_payment_status,
  tk.issued_at,
  t.trip_id,
  t.departure_time,
  t.arrival_time,
  t.price AS trip_price,
  t.status AS trip_status,
  r.origin,
  r.destination,
  CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
  v.plate_number AS vehicle_plate
FROM payments p
LEFT JOIN tickets tk ON p.ticket_id = tk.ticket_id
LEFT JOIN users u ON tk.passenger_id = u.user_id
LEFT JOIN trips t ON tk.trip_id = t.trip_id
LEFT JOIN routes r ON t.route_id = r.route_id
LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id;

-- ============================================================
-- TICKET DETAIL VIEW (admin ticket listing with full context)
-- ============================================================
DROP VIEW IF EXISTS ticket_detail_view;

CREATE VIEW ticket_detail_view AS
SELECT
  ti.ticket_id,
  ti.trip_id,
  ti.passenger_id,
  ti.seat_number,
  ti.ticket_status,
  ti.payment_status,
  ti.issued_at,
  ti.qr_code,
  u.full_name AS passenger_name,
  u.phone AS passenger_phone,
  u.email AS passenger_email,
  t.departure_time,
  t.arrival_time,
  t.price AS trip_price,
  t.status AS trip_status,
  r.origin,
  r.destination,
  CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
  v.plate_number AS vehicle_plate,
  driver.full_name AS driver_name
FROM tickets ti
LEFT JOIN users u ON ti.passenger_id = u.user_id
LEFT JOIN trips t ON ti.trip_id = t.trip_id
LEFT JOIN routes r ON t.route_id = r.route_id
LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
LEFT JOIN users driver ON t.driver_id = driver.user_id;

-- ============================================================
-- TRIP DETAIL VIEW (admin trip listing with full context)
-- ============================================================
DROP VIEW IF EXISTS trip_detail_view;

CREATE VIEW trip_detail_view AS
SELECT
  t.trip_id,
  t.route_id,
  t.vehicle_id,
  t.driver_id,
  t.departure_time,
  t.arrival_time,
  t.price,
  t.status,
  t.created_at,
  r.origin,
  r.destination,
  CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
  v.plate_number AS vehicle_plate,
  driver.full_name AS driver_name,
  driver.phone AS driver_phone
FROM trips t
LEFT JOIN routes r ON t.route_id = r.route_id
LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
LEFT JOIN users driver ON t.driver_id = driver.user_id;

-- ============================================================
-- USER ADMIN VIEW (users with role and status)
-- ============================================================
DROP VIEW IF EXISTS user_admin_view;

CREATE VIEW user_admin_view AS
SELECT
  u.user_id,
  u.full_name,
  u.phone,
  u.email,
  u.role_id,
  u.status,
  u.created_at
FROM users u;

-- ============================================================
-- SEAT OCCUPANCY VIEW (per-trip seat stats for admin)
-- ============================================================
DROP VIEW IF EXISTS seat_occupancy_view;

CREATE VIEW seat_occupancy_view AS
SELECT
  t.trip_id,
  t.departure_time,
  t.arrival_time,
  r.origin,
  r.destination,
  CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
  v.plate_number AS vehicle_plate,
  COUNT(s.seat_number) AS total_seats,
  COUNT(CASE WHEN s.status = 'BOOKED' THEN 1 END) AS booked_seats,
  COUNT(CASE WHEN s.status = 'AVAILABLE' THEN 1 END) AS available_seats,
  ROUND(COUNT(CASE WHEN s.status = 'BOOKED' THEN 1 END) / NULLIF(COUNT(s.seat_number), 0) * 100, 2) AS occupancy_percentage
FROM trips t
LEFT JOIN routes r ON t.route_id = r.route_id
LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
LEFT JOIN seats s ON t.trip_id = s.trip_id
GROUP BY t.trip_id, t.departure_time, t.arrival_time, r.origin, r.destination, v.plate_number;

-- ============================================================
-- REVENUE SUMMARY VIEW (route revenue for admin analytics)
-- ============================================================
DROP VIEW IF EXISTS revenue_summary_view;

CREATE VIEW revenue_summary_view AS
SELECT
  r.route_id,
  r.origin,
  r.destination,
  CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
  COUNT(DISTINCT tk.ticket_id) AS tickets_sold,
  COALESCE(SUM(p.amount), 0) AS ticket_revenue
FROM routes r
LEFT JOIN trips t ON r.route_id = t.route_id
LEFT JOIN tickets tk ON t.trip_id = tk.trip_id
LEFT JOIN payments p ON tk.ticket_id = p.ticket_id AND p.payment_status = 'SUCCESS'
GROUP BY r.route_id, r.origin, r.destination;
