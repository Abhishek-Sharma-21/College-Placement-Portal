import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, isAdmin, createJob);
router.get("/", protect, getAllJobs);
router.get("/:id", protect, getJobById);
router.put("/:id", protect, isAdmin, updateJob);
router.delete("/:id", protect, isAdmin, deleteJob);

export default router;
