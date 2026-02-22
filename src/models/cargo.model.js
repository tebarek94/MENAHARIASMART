import { pool } from "../config/db.js";

// Base joined query (fallback when view doesn't exist)
const CARGO_DETAIL_QUERY = `
  SELECT
    c.cargo_id, c.owner_id, c.trip_id, c.description, c.weight, c.fee, c.status, c.created_at,
    u.full_name AS owner_name,
    t.departure_time, t.arrival_time, t.price AS trip_price,
    r.origin, r.destination,
    CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
    v.plate_number AS vehicle_plate,
    driver.full_name AS driver_name
  FROM cargo c
  LEFT JOIN users u ON c.owner_id = u.user_id
  LEFT JOIN trips t ON c.trip_id = t.trip_id
  LEFT JOIN routes r ON t.route_id = r.route_id
  LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
  LEFT JOIN users driver ON t.driver_id = driver.user_id
`;

// Get all cargo (from view or fallback to joined query)
export const getAllCargo = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM cargo_detail_view ORDER BY created_at DESC`,
    );
    return rows;
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      const [rows] = await pool.query(
        `${CARGO_DETAIL_QUERY} ORDER BY c.created_at DESC`,
      );
      return rows;
    }
    throw err;
  }
};

// Get cargo by ID (from view or fallback to joined query)
export const getCargoById = async (id) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM cargo_detail_view WHERE cargo_id = ?`,
      [id],
    );
    return rows;
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      const [rows] = await pool.query(
        `${CARGO_DETAIL_QUERY} WHERE c.cargo_id = ?`,
        [id],
      );
      return rows;
    }
    throw err;
  }
};

// Create cargo (manual fee)
export const createCargo = async (
  owner_id,
  trip_id,
  description,
  weight,
  fee,
  status = "REGISTERED",
) => {
  const [result] = await pool.query(
    `INSERT INTO cargo (owner_id, trip_id, description, weight, fee, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [owner_id, trip_id, description, weight, fee, status],
  );
  return result.insertId;
};

// Create cargo with auto-calculated fee (uses stored procedure)
export const createCargoWithAutoFee = async (
  owner_id,
  trip_id,
  description,
  weight,
) => {
  const [rows] = await pool.query("CALL calculate_cargo_fee(?, ?, ?, ?)", [
    owner_id,
    trip_id,
    weight,
    description,
  ]);
  const result = rows[0][0];
  if (result.message === "NO_RULE_FOUND") {
    throw new Error("No cargo fee rule found for the specified weight");
  }
  return {
    calculated_fee: Number(result.calculated_fee),
    message: "Cargo created with auto-calculated fee",
  };
};

// Update cargo
export const updateCargo = async (
  id,
  trip_id,
  description,
  weight,
  fee,
  status,
) => {
  await pool.query(
    `UPDATE cargo 
     SET trip_id = ?, description = ?, weight = ?, fee = ?, status = ? 
     WHERE cargo_id = ?`,
    [trip_id, description, weight, fee, status, id],
  );
};

// Delete cargo
export const deleteCargo = async (id) => {
  await pool.query("DELETE FROM cargo WHERE cargo_id = ?", [id]);
};

// Update cargo status
export const updateCargoStatus = async (id, status) => {
  await pool.query("UPDATE cargo SET status = ? WHERE cargo_id = ?", [
    status,
    id,
  ]);
};
