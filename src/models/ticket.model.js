import { pool } from "../config/db.js";

const TICKET_DETAIL_QUERY = `
  SELECT ti.*, u.full_name AS passenger_name, u.phone AS passenger_phone, u.email AS passenger_email,
    t.departure_time, t.arrival_time, t.price AS trip_price, t.status AS trip_status,
    r.origin, r.destination,
    CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS route_description,
    v.plate_number AS vehicle_plate, driver.full_name AS driver_name
  FROM tickets ti
  LEFT JOIN users u ON ti.passenger_id = u.user_id
  LEFT JOIN trips t ON ti.trip_id = t.trip_id
  LEFT JOIN routes r ON t.route_id = r.route_id
  LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
  LEFT JOIN users driver ON t.driver_id = driver.user_id
`;

// Get all tickets (admin view with full context)
export const getAllTickets = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ticket_detail_view ORDER BY issued_at DESC`,
    );
    return rows;
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_VIEW_DONOT_EXIST") {
      const [rows] = await pool.query(
        `${TICKET_DETAIL_QUERY} ORDER BY ti.issued_at DESC`,
      );
      return rows;
    }
    throw err;
  }
};

// Get ticket by ID
export const getTicketById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM tickets WHERE ticket_id = ?", [
    id,
  ]);
  return rows;
};

// Get ticket by ID with passenger name and trip details (for QR code)
export const getTicketByIdWithDetails = async (id) => {
  const [rows] = await pool.query(
    `SELECT ti.*, 
      u.full_name AS passenger_name,
      tr.departure_time, tr.arrival_time, tr.price AS trip_price,
      r.origin, r.destination,
      CONCAT(COALESCE(r.origin, ''), ' to ', COALESCE(r.destination, '')) AS trip_description
     FROM tickets ti
     LEFT JOIN users u ON ti.passenger_id = u.user_id
     LEFT JOIN trips tr ON ti.trip_id = tr.trip_id
     LEFT JOIN routes r ON tr.route_id = r.route_id
     WHERE ti.ticket_id = ?`,
    [id],
  );
  return rows;
};

// Create ticket
export const createTicket = async (
  trip_id,
  passenger_id,
  seat_number,
  ticket_status = "RESERVED",
  payment_status = "PENDING",
  qr_code = null,
) => {
  const [result] = await pool.query(
    `INSERT INTO tickets (trip_id, passenger_id, seat_number, ticket_status, payment_status, qr_code, issued_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      trip_id,
      passenger_id,
      seat_number,
      ticket_status,
      payment_status,
      qr_code,
    ],
  );
  return result.insertId;
};

// Update ticket (only updates fields that are provided)
export const updateTicket = async (id, ticket_status, payment_status) => {
  const updates = [];
  const params = [];
  if (ticket_status !== undefined) {
    updates.push("ticket_status = ?");
    params.push(ticket_status);
  }
  if (payment_status !== undefined) {
    updates.push("payment_status = ?");
    params.push(payment_status);
  }
  if (updates.length === 0) return;
  params.push(id);
  await pool.query(
    `UPDATE tickets SET ${updates.join(", ")} WHERE ticket_id = ?`,
    params,
  );
};

// Update QR code
export const updateTicketQRCode = async (id, qr_code) => {
  await pool.query("UPDATE tickets SET qr_code = ? WHERE ticket_id = ?", [
    qr_code,
    id,
  ]);
};

// Delete ticket
export const deleteTicket = async (id) => {
  await pool.query("DELETE FROM tickets WHERE ticket_id = ?", [id]);
};
