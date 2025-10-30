import { Router } from "express";
import { getAllStudentProfiles } from "../../controllers/student.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, getAllStudentProfiles);

export default router;
