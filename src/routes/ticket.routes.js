import express from "express";
import {
  createTicket,
  deleteTicket,
  getAllTickets,
  getTicketById,
  getTicketQRCode,
  updateTicket,
} from "../controllers/ticket.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List all tickets (admin only)
router.get("/", authorizeRoles(1), getAllTickets);

// Get QR code image (must be before /:id route)
router.get("/:id/qrcode", getTicketQRCode);

// Get ticket by ID
router.get("/:id", getTicketById);

// Create ticket (passenger or admin)
router.post("/", createTicket);

// Update ticket (admin only)
router.put("/:id", authorizeRoles(1), updateTicket);

// Delete ticket (admin only)
router.delete("/:id", authorizeRoles(1), deleteTicket);

export default router;
