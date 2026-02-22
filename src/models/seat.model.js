import { pool } from "../config/db.js";

/**
 * Lock a seat for a trip (uses stored procedure)
 * @param {string} trip_id - Trip UUID
 * @param {number} seat_number - Seat number
 * @returns {Promise<{message: string}>}
 */
export const lockSeat = async (trip_id, seat_number) => {
  const [rows] = await pool.query("CALL lock_seat(?, ?)", [
    trip_id,
    seat_number,
  ]);
  return rows[0][0]; // Returns { message: 'SEAT_LOCKED' | 'SEAT_NOT_AVAILABLE' }
};

/**
 * Get all seats for a trip
 * @param {string} trip_id - Trip UUID
 * @returns {Promise<Array>}
 */
export const getSeatsByTrip = async (trip_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM seats WHERE trip_id = ? ORDER BY seat_number",
    [trip_id],
  );
  return rows;
};

/**
 * Get seat by trip and seat number
 * @param {string} trip_id - Trip UUID
 * @param {number} seat_number - Seat number
 * @returns {Promise<Array>}
 */
export const getSeatByTripAndNumber = async (trip_id, seat_number) => {
  const [rows] = await pool.query(
    "SELECT * FROM seats WHERE trip_id = ? AND seat_number = ?",
    [trip_id, seat_number],
  );
  return rows;
};

/**
 * Get available seats for a trip
 * @param {string} trip_id - Trip UUID
 * @returns {Promise<Array>}
 */
export const getAvailableSeats = async (trip_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM seats WHERE trip_id = ? AND status = 'AVAILABLE' ORDER BY seat_number",
    [trip_id],
  );
  return rows;
};

/**
 * Update seat status
 * @param {string} trip_id - Trip UUID
 * @param {number} seat_number - Seat number
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateSeatStatus = async (trip_id, seat_number, status) => {
  await pool.query(
    "UPDATE seats SET status = ?, locked_at = NULL WHERE trip_id = ? AND seat_number = ?",
    [status, trip_id, seat_number],
  );
};
