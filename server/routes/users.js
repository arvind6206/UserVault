import express from "express";
import { 
  verifyToken, 
  verifyRole, 
  requireAdmin, 
  requireManagerOrAdmin,
  requireUser 
} from "../middleware/authMiddleware.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes (none for user management)

// Authenticated user routes
router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, updateProfile);

// Admin/Manager routes - require elevated privileges
router.get("/", verifyToken, requireManagerOrAdmin, getUsers);
router.get("/:id", verifyToken, getUserById);

// Admin only routes
router.post("/", verifyToken, requireAdmin, createUser);
router.put("/:id", verifyToken, requireAdmin, updateUser);
router.delete("/:id", verifyToken, requireAdmin, deleteUser);

export default router;