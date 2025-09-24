import {
  clearOldNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead
} from "../controllers/notifications-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";

const router = express.Router();

// Get user notifications
router.get("/:userId", getNotifications);

// Get unread notification count
router.get("/unread/:userId", getUnreadCount);

// Mark specific notifications as read
router.post("/mark-read", extractAccId, markAsRead);

// Clear old notifications (admin only)
router.post("/clear-old", extractAccId, clearOldNotifications);

export default router;