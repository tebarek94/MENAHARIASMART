import { pool } from "../config/db.js";

/**
 * Full booking transaction (uses stored procedure)
 * Creates ticket, payment, and updates seat status atomically
 * @param {string} trip_id - Trip UUID
 * @param {string} passenger_id - Passenger UUID
 * @param {number} seat_number - Seat number
 * @param {string} payment_method - Payment method (CASH, MOBILE_MONEY, CARD)
 * @returns {Promise<{message: string}>}
 */
export const fullBookingTransaction = async (
  trip_id,
  passenger_id,
  seat_number,
  payment_method,
) => {
  const [rows] = await pool.query("CALL full_booking_transaction(?, ?, ?, ?)", [
    trip_id,
    passenger_id,
    seat_number,
    payment_method,
  ]);
  return rows[0][0]; // Returns { message: 'BOOKING_SUCCESS' }
};
