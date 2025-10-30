import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, createJob);
router.get("/", protect, getAllJobs);
router.get("/:id", protect, getJobById);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

export default router;
