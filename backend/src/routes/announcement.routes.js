import { Router } from "express";
import { createAnnouncement, listAnnouncements, deleteAnnouncement } from "../controllers/announcement.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, listAnnouncements);
router.post("/", protect, isAdmin, createAnnouncement);
router.delete("/:id", protect, isAdmin, deleteAnnouncement);

export default router;
