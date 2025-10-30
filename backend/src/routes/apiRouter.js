import { Router } from "express";
import healthRouter from "./health.routes.js";
import authRouter from "./auth.routes.js";
import studentProfileRouter from "./student/studentProfile.route.js";
import jobRouter from "./job.routes.js";
import studentsRouter from "./student/students.route.js";
import announcementRouter from "./announcement.routes.js";

import { protect } from "../middlewares/authMiddleware.js";
const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/profile", protect, studentProfileRouter);
router.use("/jobs", jobRouter);
router.use("/students", studentsRouter);
router.use("/announcements", announcementRouter);

export default router;
