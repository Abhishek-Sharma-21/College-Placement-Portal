import { Router } from "express";
import { register, login, logout, refresh, getMe } from "../controllers/auth.controller.js";
import { validate } from "../validators/index.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);

router.post("/refresh", refresh);

router.get("/me", protect, getMe);

export default router;
