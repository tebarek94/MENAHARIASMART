import { pool } from "../config/db.js";

const PAYMENT_DETAIL_QUERY = `
  SELECT p.payment_id, p.ticket_id, p.amount, p.payment_status, p.payment_method, p.created_at,
    u.full_name AS passenger_name, u.phone AS passenger_phone, u.email AS passenger_email,
    tk.seat_number, tk.ticket_status, tk.payment_status AS ticket_payment_status, tk.issued_at,
    t.trip_id, t.departure_time, t.arrival_time, t.price AS trip_price, t.status AS trip_status,
    r.origin, r.destination,
    CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
    v.plate_number AS vehicle_plate
  FROM payments p
  LEFT JOIN tickets tk ON p.ticket_id = tk.ticket_id
  LEFT JOIN users u ON tk.passenger_id = u.user_id
  LEFT JOIN trips t ON tk.trip_id = t.trip_id
  LEFT JOIN routes r ON t.route_id = r.route_id
  LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
`;

/**
 * Get all payments with ticket and passenger details (admin view for relation table)
 */
export const getAllPayments = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM payment_detail_view ORDER BY payment_id DESC`,
    );
    return rows;
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_VIEW_DONOT_EXIST") {
      const [rows] = await pool.query(
        `${PAYMENT_DETAIL_QUERY} ORDER BY p.payment_id DESC`,
      );
      return rows;
    }
    throw err;
  }
};

export const getPaymentById = async (id) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM payment_detail_view WHERE payment_id = ?`,
      [id],
    );
    return rows;
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_VIEW_DONOT_EXIST") {
      const [rows] = await pool.query(
        `${PAYMENT_DETAIL_QUERY} WHERE p.payment_id = ?`,
        [id],
      );
      return rows;
    }
    throw err;
  }
};
