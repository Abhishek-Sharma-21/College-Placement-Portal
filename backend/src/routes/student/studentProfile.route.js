import { Router } from "express";
import {
  completeStudentProfile,
  getStudentProfile,
} from "../../controllers/studentProfile.controller.js";
import upload from "../../config/Cloudinary.js";

const router = Router();

router.put("/profile", upload.single("profilePic"), completeStudentProfile);
router.get("/profile", getStudentProfile);
export default router;
