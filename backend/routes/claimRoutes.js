import express from "express";
import {
  createClaim,
  deleteClaim,
  getClaimById,
  getClaims,
  updateClaim
} from "../controllers/claimController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getClaims).post(protect, upload.single("document"), createClaim);
router
  .route("/:id")
  .get(protect, getClaimById)
  .put(protect, upload.single("document"), updateClaim)
  .delete(protect, deleteClaim);

export default router;
