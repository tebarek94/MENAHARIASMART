import { pool } from "../config/db.js";

// Get all trips
export const getAllTrips = async () => {
  const [rows] = await pool.query(
    `SELECT t.*, r.origin, r.destination, v.plate_number, u.full_name AS driver_name
     FROM trips t
     LEFT JOIN routes r ON t.route_id = r.route_id
     LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
     LEFT JOIN users u ON t.driver_id = u.user_id`,
  );
  return rows;
};

// Get trip by ID
export const getTripById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM trips WHERE trip_id = ?", [
    id,
  ]);
  return rows;
};

// Create trip
export const createTrip = async (
  route_id,
  vehicle_id,
  driver_id,
  departure_time,
  arrival_time,
  price,
  status = "SCHEDULED",
) => {
  const [result] = await pool.query(
    `INSERT INTO trips (route_id, vehicle_id, driver_id, departure_time, arrival_time, price, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      route_id,
      vehicle_id,
      driver_id,
      departure_time,
      arrival_time,
      price,
      status,
    ],
  );
  return result.insertId;
};

// Update trip
export const updateTrip = async (
  id,
  route_id,
  vehicle_id,
  driver_id,
  departure_time,
  arrival_time,
  price,
  status,
) => {
  await pool.query(
    `UPDATE trips 
     SET route_id = ?, vehicle_id = ?, driver_id = ?, departure_time = ?, arrival_time = ?, price = ?, status = ?
     WHERE trip_id = ?`,
    [
      route_id,
      vehicle_id,
      driver_id,
      departure_time,
      arrival_time,
      price,
      status,
      id,
    ],
  );
};

// Delete trip
export const deleteTrip = async (id) => {
  await pool.query("DELETE FROM trips WHERE trip_id = ?", [id]);
};
