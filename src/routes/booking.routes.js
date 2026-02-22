import express from "express";
import { createBooking } from "../controllers/booking.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create booking (full transaction)
router.post("/", createBooking);

export default router;
