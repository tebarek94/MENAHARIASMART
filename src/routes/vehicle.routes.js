import express from "express";
import {
  listVehicles,
  getVehicle,
  createNewVehicle,
  updateExistingVehicle,
  removeVehicle,
} from "../controllers/vehicle.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticate);

// Admin-only: relation table (vehicles) CRUD
router.get("/", authorizeRoles(1), listVehicles);
router.get("/:id", authorizeRoles(1), getVehicle);
router.post("/", authorizeRoles(1), createNewVehicle);
router.put("/:id", authorizeRoles(1), updateExistingVehicle);
router.delete("/:id", authorizeRoles(1), removeVehicle);

export default router;
