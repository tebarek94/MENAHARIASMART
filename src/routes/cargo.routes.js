import express from "express";
import {
  listCargo,
  getCargo,
  createNewCargo,
  updateExistingCargo,
  removeCargo,
  changeCargoStatus,
} from "../controllers/cargo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Passenger or Admin can create cargo
router.post("/", createNewCargo);

// List all cargo (admin)
router.get("/", authorizeRoles(1), listCargo);

// Get cargo by ID (owner or admin)
router.get("/:id", getCargo);

// Update cargo (admin only)
router.put("/:id", authorizeRoles(1), updateExistingCargo);

// Delete cargo (admin only)
router.delete("/:id", authorizeRoles(1), removeCargo);

// Update cargo status (admin only)
router.patch("/:id/status", authorizeRoles(1), changeCargoStatus);

export default router;
