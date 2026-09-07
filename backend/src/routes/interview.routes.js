import { Router } from "express";
import {
  scheduleInterview,
  getInterviews,
  updateInterview,
  cancelInterview,
} from "../controllers/interview.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Routes definitions wrapped with RBAC middlewares
router.post("/", protect, isAdmin, scheduleInterview);
router.get("/", protect, getInterviews);
router.put("/:id", protect, isAdmin, updateInterview);
router.delete("/:id", protect, isAdmin, cancelInterview);

export default router;
