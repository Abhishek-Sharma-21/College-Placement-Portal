import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionBank.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// All question bank routes are restricted to TPO role (isAdmin)
router.post("/", protect, isAdmin, createQuestion);
router.get("/", protect, isAdmin, getQuestions);
router.put("/:id", protect, isAdmin, updateQuestion);
router.delete("/:id", protect, isAdmin, deleteQuestion);

export default router;
