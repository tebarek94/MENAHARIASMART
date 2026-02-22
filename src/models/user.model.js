import { pool } from "../config/db.js";

// Find user by phone
export const findUserByPhone = async (phone) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE phone = ?", [
    phone,
  ]);
  return rows;
};

// Find user by ID
export const findUserById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
    id,
  ]);
  return rows;
};

// Create new user
export const createUser = async (
  full_name,
  phone,
  email,
  password_hash,
  role_id,
  status,
) => {
  const [result] = await pool.query(
    "INSERT INTO users (full_name, phone, email, password_hash, role_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
    [full_name, phone, email, password_hash, role_id, status],
  );
  return result.insertId; // returns new user_id
};

// Update user status
export const updateUserStatus = async (id, status) => {
  await pool.query("UPDATE users SET status = ? WHERE user_id = ?", [
    status,
    id,
  ]);
};

// Update user role
export const updateUserRole = async (id, role_id) => {
  await pool.query("UPDATE users SET role_id = ? WHERE user_id = ?", [
    role_id,
    id,
  ]);
};

// Update user password
export const updateUserPassword = async (id, password_hash) => {
  await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
    password_hash,
    id,
  ]);
};

// Update profile
export const updateUserProfile = async (id, full_name, email) => {
  await pool.query(
    "UPDATE users SET full_name = ?, email = ? WHERE user_id = ?",
    [full_name, email, id],
  );
};

// Delete user
export const deleteUser = async (id) => {
  await pool.query("DELETE FROM users WHERE user_id = ?", [id]);
};
