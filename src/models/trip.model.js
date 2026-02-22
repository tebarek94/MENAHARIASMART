import { pool } from "../config/db.js";

const TRIP_DETAIL_QUERY = `
  SELECT t.*, r.origin, r.destination,
    CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
    v.plate_number AS vehicle_plate,
    driver.full_name AS driver_name, driver.phone AS driver_phone
  FROM trips t
  LEFT JOIN routes r ON t.route_id = r.route_id
  LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
  LEFT JOIN users driver ON t.driver_id = driver.user_id
`;

// Get all trips (admin view with full context)
export const getAllTrips = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM trip_detail_view ORDER BY departure_time DESC`,
    );
    return rows;
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_VIEW_DONOT_EXIST") {
      const [rows] = await pool.query(
        `${TRIP_DETAIL_QUERY} ORDER BY t.departure_time DESC`,
      );
      return rows;
    }
    throw err;
  }
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
