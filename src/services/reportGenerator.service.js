import { pool } from "../config/db.js";

/** Supported report types */
export const REPORT_TYPES = [
  "TRIPS_SUMMARY",
  "TICKETS_SUMMARY",
  "REVENUE",
  "USERS_SUMMARY",
  "CARGO_SUMMARY",
];

/**
 * Build date filter SQL and params for created_at/issued_at
 * @param {string} dateColumn - Column name (e.g. 'created_at', 'issued_at')
 * @param {string|null} dateFrom - YYYY-MM-DD
 * @param {string|null} dateTo - YYYY-MM-DD
 * @returns {{ clause: string, params: any[] }}
 */
function dateFilter(dateColumn, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return { clause: "", params: [] };
  const conditions = [];
  const params = [];
  if (dateFrom) {
    conditions.push(`${dateColumn} >= ?`);
    params.push(dateFrom + " 00:00:00");
  }
  if (dateTo) {
    conditions.push(`${dateColumn} <= ?`);
    params.push(dateTo + " 23:59:59");
  }
  return {
    clause: conditions.length ? "WHERE " + conditions.join(" AND ") : "",
    params,
  };
}

/**
 * Generate trips summary report
 */
async function generateTripsSummary(dateFrom, dateTo) {
  const { clause, params } = dateFilter("t.created_at", dateFrom, dateTo);
  const [rows] = await pool.query(
    `SELECT t.status, COUNT(*) AS count
     FROM trips t
     ${clause}
     GROUP BY t.status`,
    params,
  );
  const [totalRow] = await pool.query(
    `SELECT COUNT(*) AS total FROM trips t ${clause}`,
    params,
  );
  const [list] = await pool.query(
    `SELECT t.trip_id, t.status, t.departure_time, t.arrival_time, t.price,
      r.origin, r.destination, u.full_name AS driver_name
     FROM trips t
     LEFT JOIN routes r ON t.route_id = r.route_id
     LEFT JOIN users u ON t.driver_id = u.user_id
     ${clause}
     ORDER BY t.created_at DESC
     LIMIT 50`,
    params,
  );
  return {
    summary: rows,
    total: totalRow[0]?.total ?? 0,
    recent: list,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate tickets summary report
 */
async function generateTicketsSummary(dateFrom, dateTo) {
  const { clause, params } = dateFilter("ti.issued_at", dateFrom, dateTo);
  const [byStatus] = await pool.query(
    `SELECT ti.ticket_status, ti.payment_status, COUNT(*) AS count
     FROM tickets ti
     ${clause}
     GROUP BY ti.ticket_status, ti.payment_status`,
    params,
  );
  const [totalRow] = await pool.query(
    `SELECT COUNT(*) AS total FROM tickets ti ${clause}`,
    params,
  );
  const [revenueRow] = await pool.query(
    `SELECT COALESCE(SUM(tr.price), 0) AS total_revenue
     FROM tickets ti
     LEFT JOIN trips tr ON ti.trip_id = tr.trip_id
     ${clause} AND ti.payment_status = 'PAID'`,
    params,
  );
  const [list] = await pool.query(
    `SELECT ti.ticket_id, ti.seat_number, ti.ticket_status, ti.payment_status, ti.issued_at,
      u.full_name AS passenger_name, tr.price, tr.departure_time
     FROM tickets ti
     LEFT JOIN users u ON ti.passenger_id = u.user_id
     LEFT JOIN trips tr ON ti.trip_id = tr.trip_id
     ${clause}
     ORDER BY ti.issued_at DESC
     LIMIT 50`,
    params,
  );
  return {
    by_status: byStatus,
    total_tickets: totalRow[0]?.total ?? 0,
    total_revenue: Number(revenueRow[0]?.total_revenue ?? 0),
    recent: list,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate revenue report (tickets + cargo)
 */
async function generateRevenue(dateFrom, dateTo) {
  const { clause: tClause, params: tParams } = dateFilter("ti.issued_at", dateFrom, dateTo);
  const tWhere = tClause ? tClause + " AND ti.payment_status = 'PAID'" : "WHERE ti.payment_status = 'PAID'";
  const [ticketRevenue] = await pool.query(
    `SELECT COALESCE(SUM(tr.price), 0) AS amount, COUNT(*) AS count
     FROM tickets ti
     LEFT JOIN trips tr ON ti.trip_id = tr.trip_id
     ${tWhere}`,
    tParams,
  );
  const { clause: cClause, params: cParams } = dateFilter("c.created_at", dateFrom, dateTo);
  const cWhere = cClause ? cClause + " AND c.status IN ('DELIVERED', 'PAID', 'COMPLETED')" : "WHERE c.status IN ('DELIVERED', 'PAID', 'COMPLETED')";
  const [cargoRevenue] = await pool.query(
    `SELECT COALESCE(SUM(c.fee), 0) AS amount, COUNT(*) AS count
     FROM cargo c
     ${cWhere}`,
    cParams,
  );
  const tickets = ticketRevenue[0] || { amount: 0, count: 0 };
  const cargo = cargoRevenue[0] || { amount: 0, count: 0 };
  const totalAmount = Number(tickets.amount) + Number(cargo.amount);
  return {
    tickets: { amount: Number(tickets.amount), count: tickets.count },
    cargo: { amount: Number(cargo.amount), count: cargo.count },
    total_revenue: totalAmount,
    total_transactions: tickets.count + cargo.count,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate users summary report
 */
async function generateUsersSummary() {
  const [byRole] = await pool.query(
    `SELECT u.role_id, COUNT(*) AS count
     FROM users u
     GROUP BY u.role_id`,
  );
  const [byStatus] = await pool.query(
    `SELECT u.status, COUNT(*) AS count
     FROM users u
     GROUP BY u.status`,
  );
  const [totalRow] = await pool.query("SELECT COUNT(*) AS total FROM users");
  return {
    by_role: byRole,
    by_status: byStatus,
    total_users: totalRow[0]?.total ?? 0,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate cargo summary report
 */
async function generateCargoSummary(dateFrom, dateTo) {
  const { clause, params } = dateFilter("c.created_at", dateFrom, dateTo);
  const [byStatus] = await pool.query(
    `SELECT c.status, COUNT(*) AS count, COALESCE(SUM(c.fee), 0) AS total_fees
     FROM cargo c
     ${clause}
     GROUP BY c.status`,
    params,
  );
  const [totalRow] = await pool.query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(c.fee), 0) AS total_fees FROM cargo c ${clause}`,
    params,
  );
  const [list] = await pool.query(
    `SELECT c.cargo_id, c.description, c.weight, c.fee, c.status, c.created_at,
      u.full_name AS owner_name, t.departure_time
     FROM cargo c
     LEFT JOIN users u ON c.owner_id = u.user_id
     LEFT JOIN trips t ON c.trip_id = t.trip_id
     ${clause}
     ORDER BY c.created_at DESC
     LIMIT 50`,
    params,
  );
  return {
    by_status: byStatus,
    total_cargo: totalRow[0]?.total ?? 0,
    total_fees: Number(totalRow[0]?.total_fees ?? 0),
    recent: list,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate report data by type
 * @param {string} reportType - One of REPORT_TYPES
 * @param {{ date_from?: string, date_to?: string }} options - Optional date range (YYYY-MM-DD)
 * @returns {Promise<Object>} Generated report payload
 */
export async function generateReportData(reportType, options = {}) {
  const { date_from: dateFrom, date_to: dateTo } = options;
  switch (reportType) {
    case "TRIPS_SUMMARY":
      return generateTripsSummary(dateFrom, dateTo);
    case "TICKETS_SUMMARY":
      return generateTicketsSummary(dateFrom, dateTo);
    case "REVENUE":
      return generateRevenue(dateFrom, dateTo);
    case "USERS_SUMMARY":
      return generateUsersSummary();
    case "CARGO_SUMMARY":
      return generateCargoSummary(dateFrom, dateTo);
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
}
