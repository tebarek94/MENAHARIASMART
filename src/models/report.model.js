import { pool } from "../config/db.js";

// Get all reports
export const getAllReports = async () => {
  const [rows] = await pool.query(
    `SELECT r.*, u.full_name AS generated_by_name
     FROM reports r
     LEFT JOIN users u ON r.generated_by = u.user_id`,
  );
  return rows;
};

// Get report by ID (with generator name)
export const getReportById = async (id) => {
  const [rows] = await pool.query(
    `SELECT r.*, u.full_name AS generated_by_name
     FROM reports r
     LEFT JOIN users u ON r.generated_by = u.user_id
     WHERE r.report_id = ?`,
    [id],
  );
  return rows;
};

// Create a new report (metadata only; report data is returned in response)
export const createReport = async (report_type, generated_by) => {
  const [result] = await pool.query(
    `INSERT INTO reports (report_type, generated_by, generated_at)
     VALUES (?, ?, NOW())`,
    [report_type, generated_by],
  );
  return result.insertId;
};

// Delete a report
export const deleteReport = async (id) => {
  await pool.query("DELETE FROM reports WHERE report_id = ?", [id]);
};
