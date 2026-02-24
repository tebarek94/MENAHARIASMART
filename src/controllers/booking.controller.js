import { fullBookingTransaction } from "../models/booking.model.js";
import {
  hasActiveTicketForTrip,
  getTicketsByPassenger,
} from "../models/ticket.model.js";
import { getTripById } from "../models/trip.model.js";
import { getSeatByTripAndNumber } from "../models/seat.model.js";

// ==================
// Full booking transaction
// ==================
export const createBooking = async (req, res) => {
  try {
    const { trip_id, passenger_id, seat_number, payment_method } = req.body;

    // Validate required fields
    if (!trip_id || !passenger_id || seat_number === undefined || !payment_method) {
      return res.status(400).json({
        message:
          "trip_id, passenger_id, seat_number, and payment_method are required",
      });
    }

    // Ensure trip exists
    const trips = await getTripById(trip_id);
    if (trips.length === 0) {
      return res.status(400).json({
        message: "Invalid trip_id: trip does not exist",
      });
    }

    // Ensure seat exists for that trip
    const seatRows = await getSeatByTripAndNumber(trip_id, seat_number);
    if (seatRows.length === 0) {
      return res.status(400).json({
        message: "Invalid seat_number for this trip",
      });
    }

    // Ensure one user can only book one seat per trip
    const alreadyHasTicket = await hasActiveTicketForTrip(trip_id, passenger_id);
    if (alreadyHasTicket) {
      return res.status(409).json({
        message: "Passenger already has a booking for this trip",
      });
    }

    // Validate payment method
    const validMethods = ["CASH", "MOBILE_MONEY", "CARD"];
    if (!validMethods.includes(payment_method.toUpperCase())) {
      return res.status(400).json({
        message: `Invalid payment_method. Allowed: ${validMethods.join(", ")}`,
      });
    }

    const result = await fullBookingTransaction(
      trip_id,
      passenger_id,
      seat_number,
      payment_method.toUpperCase(),
    );

    if (result.message === "BOOKING_SUCCESS") {
      res.status(201).json({
        message: "Booking completed successfully",
        booking_status: result.message,
      });
    } else {
      res.status(400).json({
        message: "Booking failed",
        booking_status: result.message,
      });
    }
  } catch (err) {
    console.error(err);
    // Check for SQL error about seat availability
    if (err.message && err.message.includes("Seat not available")) {
      return res.status(409).json({
        message: "Seat is not available",
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get booking status for current user
// ==================
export const getMyBookings = async (req, res) => {
  try {
    const passenger_id = req.user?.user_id;
    if (!passenger_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tickets = await getTicketsByPassenger(passenger_id);
    res.json({ tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
