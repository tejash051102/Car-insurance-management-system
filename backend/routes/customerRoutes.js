import express from "express";
import {
  createCustomer,
  deleteCustomer,
  exportCustomers,
  getCustomerById,
  getCustomers,
  updateCustomer
} from "../controllers/customerController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getCustomers).post(protect, createCustomer);
router.get("/export/csv", protect, authorize("admin", "manager"), exportCustomers);
router
  .route("/:id")
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, authorize("admin", "manager"), deleteCustomer);

export default router;
