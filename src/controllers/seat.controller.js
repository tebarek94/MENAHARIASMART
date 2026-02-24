import {
  lockSeat,
  createSeat,
  getSeatsByTrip,
  getSeatByTripAndNumber,
  getAvailableSeats,
  updateSeatStatus,
  getSeatBookingDetailsForTrip,
} from "../models/seat.model.js";
import { getTripById } from "../models/trip.model.js";

// ==================
// Lock seat
// ==================
export const lockSeatController = async (req, res) => {
  try {
    const { trip_id, seat_number } = req.body;
    if (!trip_id || seat_number === undefined) {
      return res.status(400).json({
        message: "trip_id and seat_number are required",
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

    const result = await lockSeat(trip_id, seat_number);
    if (result.message === "SEAT_NOT_AVAILABLE") {
      return res.status(409).json({
        message: "Seat is not available",
        seat_status: result.message,
      });
    }
    res.json({
      message: "Seat locked successfully",
      seat_status: result.message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Create seat (admin)
// ==================
export const createSeatController = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const { seat_number, status } = req.body;

    if (!trip_id || seat_number === undefined) {
      return res.status(400).json({
        message: "trip_id (in URL) and seat_number (in body) are required",
      });
    }

    // Ensure trip exists
    const trips = await getTripById(trip_id);
    if (trips.length === 0) {
      return res.status(400).json({
        message: "Invalid trip_id: trip does not exist",
      });
    }

    // Ensure seat does not already exist for that trip
    const existingSeat = await getSeatByTripAndNumber(trip_id, seat_number);
    if (existingSeat.length > 0) {
      return res.status(409).json({
        message: "Seat number already exists for this trip",
      });
    }

    const seatId = await createSeat(trip_id, seat_number, status || "AVAILABLE");
    res.status(201).json({
      message: "Seat created successfully",
      seat_id: seatId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get seats by trip
// ==================
export const getSeatsByTripController = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const seats = await getSeatsByTrip(trip_id);
    res.json({ seats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get available seats
// ==================
export const getAvailableSeatsController = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const seats = await getAvailableSeats(trip_id);
    res.json({ available_seats: seats, count: seats.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get seat by trip and number
// ==================
export const getSeatController = async (req, res) => {
  try {
    const { trip_id, seat_number } = req.params;
    const seats = await getSeatByTripAndNumber(trip_id, seat_number);
    if (seats.length === 0) {
      return res.status(404).json({ message: "Seat not found" });
    }
    res.json({ seat: seats[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Update seat status (admin)
// ==================
export const updateSeatStatusController = async (req, res) => {
  try {
    const { trip_id, seat_number } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }
    await updateSeatStatus(trip_id, seat_number, status);
    res.json({ message: "Seat status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Admin seat view: seats + booking info for a trip
// ==================
export const getSeatAdminViewController = async (req, res) => {
  try {
    const { trip_id } = req.params;
    if (!trip_id) {
      return res.status(400).json({ message: "trip_id is required" });
    }

    // Ensure trip exists
    const trips = await getTripById(trip_id);
    if (trips.length === 0) {
      return res.status(400).json({
        message: "Invalid trip_id: trip does not exist",
      });
    }

    const rawSeats = await getSeatBookingDetailsForTrip(trip_id);

    // Shape data: avoid many null fields, group booking info under "booking"
    const seats = rawSeats.map((row) => {
      const {
        trip_id,
        seat_number,
        seat_status,
        locked_at,
        ticket_id,
        ticket_status,
        payment_status,
        passenger_id,
        passenger_name,
        passenger_phone,
      } = row;

      const hasBooking = ticket_id !== null;

      return {
        trip_id,
        seat_number,
        seat_status,
        locked_at,
        booking: hasBooking
          ? {
              ticket_id,
              ticket_status,
              payment_status,
              passenger_id,
              passenger_name,
              passenger_phone,
            }
          : null,
      };
    });

    res.json({ seats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
