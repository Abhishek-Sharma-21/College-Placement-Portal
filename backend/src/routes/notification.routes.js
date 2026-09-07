import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Protect all notification routes
router.get("/", protect, getNotifications);
router.put("/mark-all-read", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

export default router;
