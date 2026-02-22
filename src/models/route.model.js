import { pool } from "../config/db.js";

export const getAllRoutes = async () => {
  const [rows] = await pool.query(
    "SELECT route_id, origin, destination FROM routes ORDER BY origin, destination",
  );
  return rows;
};

export const getRouteById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM routes WHERE route_id = ?", [
    id,
  ]);
  return rows;
};

export const createRoute = async (origin, destination) => {
  const [result] = await pool.query(
    "INSERT INTO routes (origin, destination) VALUES (?, ?)",
    [origin, destination],
  );
  return result.insertId;
};

export const updateRoute = async (id, origin, destination) => {
  await pool.query(
    "UPDATE routes SET origin = ?, destination = ? WHERE route_id = ?",
    [origin, destination, id],
  );
};

export const deleteRoute = async (id) => {
  await pool.query("DELETE FROM routes WHERE route_id = ?", [id]);
};
