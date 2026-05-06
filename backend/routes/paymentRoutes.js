import express from "express";
import {
  createPayment,
  deletePayment,
  getPaymentById,
  getPayments,
  updatePayment
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPayments).post(protect, createPayment);
router.route("/:id").get(protect, getPaymentById).put(protect, updatePayment).delete(protect, deletePayment);

export default router;
