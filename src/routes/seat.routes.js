import express from "express";
import {
  lockSeatController,
  getSeatsByTripController,
  getAvailableSeatsController,
  getSeatController,
  updateSeatStatusController,
} from "../controllers/seat.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Lock seat (passenger or admin)
router.post("/lock", lockSeatController);

// Get seats by trip
router.get("/trip/:trip_id", getSeatsByTripController);

// Get available seats for trip
router.get("/trip/:trip_id/available", getAvailableSeatsController);

// Get specific seat
router.get("/trip/:trip_id/seat/:seat_number", getSeatController);

// Update seat status (admin only)
router.put(
  "/trip/:trip_id/seat/:seat_number/status",
  authorizeRoles(1),
  updateSeatStatusController,
);

export default router;
