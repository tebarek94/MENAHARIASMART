import express from "express";
import {
  listTrips,
  getTrip,
  createNewTrip,
  updateExistingTrip,
  removeTrip,
} from "../controllers/trip.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List all trips (any authenticated user)
router.get("/", listTrips);

// Get trip by ID
router.get("/:id", getTrip);

// Admin only: create, update, delete
router.post("/", authorizeRoles(1), createNewTrip);
router.put("/:id", authorizeRoles(1), updateExistingTrip);
router.delete("/:id", authorizeRoles(1), removeTrip);

export default router;
