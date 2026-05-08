import express from "express";
import {
  downloadSecurityReport,
  getSecurityEvents,
  getSecuritySummary
} from "../controllers/securityController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, authorize("admin", "manager"), getSecuritySummary);
router.get("/events", protect, authorize("admin", "manager"), getSecurityEvents);
router.get("/report", protect, authorize("admin", "manager"), downloadSecurityReport);

export default router;
