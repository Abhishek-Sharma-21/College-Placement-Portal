import { Router } from "express";
import { createAnnouncement, listAnnouncements, deleteAnnouncement } from "../controllers/announcement.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, listAnnouncements);
router.post("/", protect, createAnnouncement);
router.delete("/:id", protect, deleteAnnouncement);

export default router;
