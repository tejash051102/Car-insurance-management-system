import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  updateVehicle
} from "../controllers/vehicleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getVehicles).post(protect, createVehicle);
router.route("/:id").get(protect, getVehicleById).put(protect, updateVehicle).delete(protect, deleteVehicle);

export default router;
