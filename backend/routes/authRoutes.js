import express from "express";
import {
  getProfile,
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  resendVerification,
  verifyEmail
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);

export default router;
