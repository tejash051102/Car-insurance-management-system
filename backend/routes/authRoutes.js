import express from "express";
import {
  getProfile,
  loginUser,
  registerUser,
  resendVerification,
  verifyEmail
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/profile", protect, getProfile);

export default router;
