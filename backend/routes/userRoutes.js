import express from "express";
import { getUsers, unlockUser, updateUser } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);
router.put("/:id", protect, authorize("admin"), updateUser);
router.patch("/:id/unlock", protect, authorize("admin"), unlockUser);

export default router;
