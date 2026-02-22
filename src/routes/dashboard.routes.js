import express from "express";
import {
  getDashboardSummary,
  getActiveTripsController,
  getTicketsSoldTodayController,
  getSeatOccupancyController,
  getTopRevenueRouteController,
  getDailyRevenueController,
  getRevenueSummaryController,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get("/", authorizeRoles(1), getDashboardSummary);
router.get("/active-trips", authorizeRoles(1), getActiveTripsController);
router.get("/tickets-today", authorizeRoles(1), getTicketsSoldTodayController);
router.get("/seat-occupancy", authorizeRoles(1), getSeatOccupancyController);
router.get("/top-revenue-route", authorizeRoles(1), getTopRevenueRouteController);
router.get("/daily-revenue", authorizeRoles(1), getDailyRevenueController);
router.get("/revenue-by-route", authorizeRoles(1), getRevenueSummaryController);

export default router;
