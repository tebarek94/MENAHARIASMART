import {
  lockSeat,
  getSeatsByTrip,
  getSeatByTripAndNumber,
  getAvailableSeats,
  updateSeatStatus,
} from "../models/seat.model.js";

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
