import { Router } from "express";
import { completeStudentProfile } from "../../controllers/studentProfile.controller.js";
import upload from "../../config/Cloudinary.js";

const router = Router();

router.put("/profile", upload.single("profilePic"), completeStudentProfile);

export default router;
