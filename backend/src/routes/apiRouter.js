import { Router } from "express";
import healthRouter from "./health.routes.js";
import authRouter from "./auth.routes.js";
import studentProfileRouter from "./student/studentProfile.route.js";

import { protect } from "../middlewares/authMiddleware.js";
const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/profile", protect, studentProfileRouter);

export default router;
