import { Router } from "express";
import {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getMyAssessments,
  getLiveAssessments,
  getAssessmentForTaking,
  submitAssessment,
  getAssessmentResults,
} from "../controllers/assessment.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, createAssessment);
router.get("/", protect, getAllAssessments);
router.get("/my", protect, getMyAssessments);
router.get("/live", getLiveAssessments); // Public route for students - must be before /:id
router.get("/:id/results", protect, getAssessmentResults); // Get assessment results - must be before /:id
router.get("/:id/take", protect, getAssessmentForTaking); // Get assessment for taking - must be before /:id
router.post("/:id/submit", protect, submitAssessment); // Submit assessment - must be before /:id
router.get("/:id", protect, getAssessmentById);
router.put("/:id", protect, updateAssessment);
router.delete("/:id", protect, deleteAssessment);

export default router;
