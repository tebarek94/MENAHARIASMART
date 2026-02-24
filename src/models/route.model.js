import { pool } from "../config/db.js";

export const getAllRoutes = async () => {
  const [rows] = await pool.query(
    "SELECT route_id, origin, destination, distance_km FROM routes ORDER BY origin, destination",
  );
  return rows;
};

export const getRouteById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM routes WHERE route_id = ?", [
    id,
  ]);
  return rows;
};

export const createRoute = async (origin, destination, distance_km) => {
  const [result] = await pool.query(
    "INSERT INTO routes (origin, destination, distance_km) VALUES (?, ?, ?)",
    [origin, destination, distance_km],
  );
  return result.insertId;
};

export const updateRoute = async (id, origin, destination, distance_km) => {
  await pool.query(
    "UPDATE routes SET origin = ?, destination = ?, distance_km = ? WHERE route_id = ?",
    [origin, destination, distance_km, id],
  );
};

export const deleteRoute = async (id) => {
  await pool.query("DELETE FROM routes WHERE route_id = ?", [id]);
};
