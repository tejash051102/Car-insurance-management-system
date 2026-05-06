import express from "express";
import {
  createPolicy,
  deletePolicy,
  downloadPolicyPdf,
  getPolicies,
  getPolicyById,
  updatePolicy
} from "../controllers/policyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPolicies).post(protect, createPolicy);
router.get("/:id/pdf", protect, downloadPolicyPdf);
router.route("/:id").get(protect, getPolicyById).put(protect, updatePolicy).delete(protect, deletePolicy);

export default router;
