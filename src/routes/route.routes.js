import express from "express";
import {
  listRoutes,
  getRoute,
  createNewRoute,
  updateExistingRoute,
  removeRoute,
} from "../controllers/route.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticate);

// Admin-only: relation table (routes) CRUD
router.get("/", authorizeRoles(1), listRoutes);
router.get("/:id", authorizeRoles(1), getRoute);
router.post("/", authorizeRoles(1), createNewRoute);
router.put("/:id", authorizeRoles(1), updateExistingRoute);
router.delete("/:id", authorizeRoles(1), removeRoute);

export default router;
