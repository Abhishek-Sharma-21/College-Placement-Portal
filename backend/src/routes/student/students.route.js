import { Router } from "express";
import { getAllStudentProfiles } from "../../controllers/student.controller.js";
import { protect, isAdmin } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, isAdmin, getAllStudentProfiles);

export default router;
