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
 * Get seat occupancy per trip (from admin view)
 */
export const getSeatOccupancyPerTrip = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM seat_occupancy_view ORDER BY departure_time DESC`,
    );
    return rows;
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_VIEW_DONOT_EXIST") {
      const [rows] = await pool.query(
        `SELECT 
          t.trip_id,
          COUNT(CASE WHEN s.status='BOOKED' THEN 1 END) AS booked_seats,
          COUNT(*) AS total_seats,
          ROUND(COUNT(CASE WHEN s.status='BOOKED' THEN 1 END) / NULLIF(COUNT(*), 0) * 100, 2) AS occupancy_percentage
        FROM trips t
        JOIN seats s ON t.trip_id = s.trip_id
        GROUP BY t.trip_id`,
      );
      return rows;
    }
    throw err;
  }
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

/**
 * Get revenue summary by route (admin analytics view)
 */
export const getRevenueSummaryByRoute = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM revenue_summary_view ORDER BY ticket_revenue DESC`,
    );
    return rows;
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_VIEW_DONOT_EXIST") {
      const [rows] = await pool.query(
        `SELECT 
          r.route_id, r.origin, r.destination,
          CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
          COUNT(DISTINCT tk.ticket_id) AS tickets_sold,
          COALESCE(SUM(p.amount), 0) AS ticket_revenue
        FROM routes r
        LEFT JOIN trips t ON r.route_id = t.route_id
        LEFT JOIN tickets tk ON t.trip_id = tk.trip_id
        LEFT JOIN payments p ON tk.ticket_id = p.ticket_id AND p.payment_status = 'SUCCESS'
        GROUP BY r.route_id, r.origin, r.destination
        ORDER BY ticket_revenue DESC`,
      );
      return rows;
    }
    throw err;
  }
};
