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
  generateAssessmentPassedStudentsPDF,
  getAssessmentByJobId,
  duplicateAssessment,
  validateAssessment,
  previewAssessment,
} from "../controllers/assessment.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, isAdmin, createAssessment);
router.get("/", protect, isAdmin, getAllAssessments);
router.get("/my", protect, isAdmin, getMyAssessments);
router.get("/live", protect, getLiveAssessments);
router.get("/job/:jobId", protect, getAssessmentByJobId);
router.get("/:id/preview", protect, isAdmin, previewAssessment);
router.get("/:id/results", protect, isAdmin, getAssessmentResults);
router.get(
  "/:id/pdf/passed-students",
  protect,
  isAdmin,
  generateAssessmentPassedStudentsPDF,
);
router.get("/:id/take", protect, getAssessmentForTaking);
router.post("/:id/submit", protect, submitAssessment);
router.post("/:id/duplicate", protect, isAdmin, duplicateAssessment);
router.get("/:id/validate", protect, isAdmin, validateAssessment);
router.get("/:id", protect, getAssessmentById);
router.put("/:id", protect, isAdmin, updateAssessment);
router.delete("/:id", protect, isAdmin, deleteAssessment);

export default router;
