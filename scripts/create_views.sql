-- Create cargo_detail_view for admin cargo listing (relation: cargo + users + trips + routes + vehicles)
-- Run this against your MySQL database to create the view used by cargo.model.js

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
