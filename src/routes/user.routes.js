import express from "express";
import {
  login,
  register,
  getUserById,
  updateProfile,
  updatePassword,
  updateRole,
  updateStatus,
  removeUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/register", register);

// Authenticated user routes
router.get("/:id", authenticate, getUserById);
router.put("/profile/:id", authenticate, updateProfile);
router.put("/password/:id", authenticate, updatePassword);

// Admin-only routes (role_id = 1)
router.put("/role/:id", authenticate, authorizeRoles(1), updateRole);
router.put("/status/:id", authenticate, authorizeRoles(1), updateStatus);
router.delete("/:id", authenticate, authorizeRoles(1), removeUser);

export default router;
