import { pool } from "../config/db.js";

/**
 * Get all payments with ticket and passenger details (admin view for relation table)
 */
export const getAllPayments = async () => {
  const [rows] = await pool.query(
    `SELECT 
      p.payment_id, p.ticket_id, p.amount, p.payment_status, p.payment_method,
      u.full_name AS passenger_name,
      t.departure_time, t.arrival_time,
      r.origin, r.destination,
      CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description
    FROM payments p
    LEFT JOIN tickets tk ON p.ticket_id = tk.ticket_id
    LEFT JOIN users u ON tk.passenger_id = u.user_id
    LEFT JOIN trips t ON tk.trip_id = t.trip_id
    LEFT JOIN routes r ON t.route_id = r.route_id
    ORDER BY p.payment_id DESC`,
  );
  return rows;
};

export const getPaymentById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      p.*,
      u.full_name AS passenger_name,
      tk.seat_number, tk.ticket_status,
      t.departure_time, t.arrival_time, t.price AS trip_price,
      r.origin, r.destination
    FROM payments p
    LEFT JOIN tickets tk ON p.ticket_id = tk.ticket_id
    LEFT JOIN users u ON tk.passenger_id = u.user_id
    LEFT JOIN trips t ON tk.trip_id = t.trip_id
    LEFT JOIN routes r ON t.route_id = r.route_id
    WHERE p.payment_id = ?`,
    [id],
  );
  return rows;
};
