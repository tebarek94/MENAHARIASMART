import express from "express";
import {
  listReports,
  getReport,
  getReportTypes,
  generateReport,
  createNewReport,
  removeReport,
} from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get("/", authorizeRoles(1), listReports);
router.get("/types", authorizeRoles(1), getReportTypes);
router.post("/generate", authorizeRoles(1), generateReport);
router.post("/", authorizeRoles(1), createNewReport);
router.get("/:id", authorizeRoles(1), getReport);
router.delete("/:id", authorizeRoles(1), removeReport);

export default router;
