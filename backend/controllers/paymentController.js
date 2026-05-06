import asyncHandler from "express-async-handler";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";

const generatePaymentNumber = () => `PAY-${Date.now().toString().slice(-8)}`;

export const getPayments = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const payments = await Payment.find(filter)
    .populate("customer")
    .populate("policy")
    .sort({ paymentDate: -1 });

  res.json(payments);
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("customer").populate("policy");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  res.json(payment);
});

export const createPayment = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.body.policy);

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const payment = await Payment.create({
    ...req.body,
    customer: req.body.customer || policy.customer,
    paymentNumber: req.body.paymentNumber || generatePaymentNumber()
  });

  const populatedPayment = await payment.populate(["customer", "policy"]);
  res.status(201).json(populatedPayment);
});

export const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate("customer")
    .populate("policy");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  res.json(payment);
});

export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  res.json({ message: "Payment deleted successfully" });
});
