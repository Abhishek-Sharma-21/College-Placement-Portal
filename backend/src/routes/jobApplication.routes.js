import { Router } from "express";
import {
  applyForJob,
  getJobApplications,
  getAllApplications,
  getApplicationCount,
  updateApplicationStatus,
  getMyApplications,
} from "../controllers/jobApplication.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Student routes
router.post("/job/:jobId", protect, applyForJob);
router.get("/my", protect, getMyApplications);

// TPO routes
router.get("/job/:jobId", protect, getJobApplications);
router.get("/job/:jobId/count", protect, getApplicationCount);
router.get("/all", protect, getAllApplications);
router.put("/:applicationId", protect, updateApplicationStatus);

export default router;
