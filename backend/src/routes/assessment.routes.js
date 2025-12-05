import { Router } from "express";
import {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getMyAssessments,
} from "../controllers/assessment.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, createAssessment);
router.get("/", protect, getAllAssessments);
router.get("/my", protect, getMyAssessments);
router.get("/:id", protect, getAssessmentById);
router.put("/:id", protect, updateAssessment);
router.delete("/:id", protect, deleteAssessment);

export default router;
