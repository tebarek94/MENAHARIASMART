import express from "express";
import { createBooking, getMyBookings } from "../controllers/booking.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create booking (full transaction)
router.post("/", createBooking);

// Get booking status for current user
router.get("/me", getMyBookings);

export default router;
