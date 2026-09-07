import { Router } from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Only TPOs can view audit logs
router.get("/", protect, isAdmin, getAuditLogs);

export default router;
