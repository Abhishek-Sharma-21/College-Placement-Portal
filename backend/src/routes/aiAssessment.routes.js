import { Router } from "express";
import { generateAssessmentHandler } from "../controllers/aiAssessment.controller.js";
import { validate } from "../validators/index.js";
import { generateAssessmentSchema } from "../validators/aiAssessment.validator.js";

const router = Router();

// Only authenticated TPOs can call this generation API
router.post("/generate", validate(generateAssessmentSchema), generateAssessmentHandler);

export default router;
