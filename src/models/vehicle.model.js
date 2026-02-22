import { pool } from "../config/db.js";

export const getAllVehicles = async () => {
  const [rows] = await pool.query(
    "SELECT vehicle_id, plate_number FROM vehicles ORDER BY plate_number",
  );
  return rows;
};

export const getVehicleById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM vehicles WHERE vehicle_id = ?",
    [id],
  );
  return rows;
};

export const createVehicle = async (plate_number) => {
  const [result] = await pool.query(
    "INSERT INTO vehicles (plate_number) VALUES (?)",
    [plate_number],
  );
  return result.insertId;
};

export const updateVehicle = async (id, plate_number) => {
  await pool.query(
    "UPDATE vehicles SET plate_number = ? WHERE vehicle_id = ?",
    [plate_number, id],
  );
};

export const deleteVehicle = async (id) => {
  await pool.query("DELETE FROM vehicles WHERE vehicle_id = ?", [id]);
};
