import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validator/authValidator.js";

const router = express.Router()


router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", authMiddleware, logout);

export default router;