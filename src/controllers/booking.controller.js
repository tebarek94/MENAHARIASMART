import { fullBookingTransaction } from "../models/booking.model.js";

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
