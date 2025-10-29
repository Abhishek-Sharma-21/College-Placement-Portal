import { Router } from "express";
// 1. Import all the controllers you need
import { register, login, logout } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

export default router;
