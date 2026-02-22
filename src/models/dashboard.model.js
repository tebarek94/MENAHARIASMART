import { pool } from "../config/db.js";

/**
 * Get active trips count
 */
export const getActiveTrips = async () => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS active_trips FROM trips WHERE status = 'ONGOING'",
  );
  return rows[0];
};

/**
 * Get tickets sold today
 */
export const getTicketsSoldToday = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS tickets_sold_today
     FROM tickets
     WHERE DATE(issued_at) = CURDATE()
       AND payment_status = 'PAID'`,
  );
  return rows[0];
};

/**
 * Get seat occupancy per trip
 */
export const getSeatOccupancyPerTrip = async () => {
  const [rows] = await pool.query(
    `SELECT 
      t.trip_id,
      COUNT(CASE WHEN s.status='BOOKED' THEN 1 END) AS booked_seats,
      COUNT(*) AS total_seats,
      ROUND(
        COUNT(CASE WHEN s.status='BOOKED' THEN 1 END) 
        / COUNT(*) * 100, 2
      ) AS occupancy_percentage
    FROM trips t
    JOIN seats s ON t.trip_id = s.trip_id
    GROUP BY t.trip_id`,
  );
  return rows;
};

/**
 * Get top revenue route
 */
export const getTopRevenueRoute = async () => {
  const [rows] = await pool.query(
    `SELECT 
      r.origin,
      r.destination,
      SUM(p.amount) AS total_revenue
    FROM payments p
    JOIN tickets tk ON p.ticket_id = tk.ticket_id
    JOIN trips t ON tk.trip_id = t.trip_id
    JOIN routes r ON t.route_id = r.route_id
    WHERE p.payment_status = 'SUCCESS'
    GROUP BY r.route_id
    ORDER BY total_revenue DESC
    LIMIT 1`,
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Get daily revenue report (uses stored procedure)
 */
export const getDailyRevenueReport = async (date) => {
  const [rows] = await pool.query("CALL daily_revenue_report(?)", [date]);
  return rows[0][0]; // Returns { report_date, ticket_revenue, cargo_revenue, total_revenue }
};
