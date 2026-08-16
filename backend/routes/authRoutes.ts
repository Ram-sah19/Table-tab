import { Router } from "express";
import { login, register, verify, getMe } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify", verify);
router.get("/me", requireAuth, getMe);

export default router;
