import { Router } from "express";
import { register, login, logout, refresh } from "../controllers/auth.controller.js";
import { validate } from "../validators/index.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);

router.post("/refresh", refresh); // Add refresh token endpoint

export default router;
