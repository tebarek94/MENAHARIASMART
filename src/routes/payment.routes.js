import express from "express";
import {
  listPayments,
  getPayment,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticate);

// Admin-only: relation table (payments) read view
router.get("/", authorizeRoles(1), listPayments);
router.get("/:id", authorizeRoles(1), getPayment);

export default router;
