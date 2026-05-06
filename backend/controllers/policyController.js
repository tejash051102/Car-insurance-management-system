import asyncHandler from "express-async-handler";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import Payment from "../models/Payment.js";
import { createPolicyPdf } from "../utils/pdfGenerator.js";

const generatePolicyNumber = () => `POL-${Date.now().toString().slice(-8)}`;

export const getPolicies = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const policies = await Policy.find(filter)
    .populate("customer")
    .populate("vehicle")
    .sort({ createdAt: -1 });

  res.json(policies);
});

export const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id).populate("customer").populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.json(policy);
});

export const createPolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.create({
    ...req.body,
    policyNumber: req.body.policyNumber || generatePolicyNumber()
  });

  const populatedPolicy = await policy.populate(["customer", "vehicle"]);
  res.status(201).json(populatedPolicy);
});

export const updatePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate("customer")
    .populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.json(policy);
});

export const deletePolicy = asyncHandler(async (req, res) => {
  const [claimCount, paymentCount] = await Promise.all([
    Claim.countDocuments({ policy: req.params.id }),
    Payment.countDocuments({ policy: req.params.id })
  ]);

  if (claimCount || paymentCount) {
    res.status(400);
    throw new Error("Cannot delete a policy with linked claims or payments");
  }

  const policy = await Policy.findByIdAndDelete(req.params.id);

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.json({ message: "Policy deleted successfully" });
});

export const downloadPolicyPdf = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.params.id).populate("customer").populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const pdfBuffer = await createPolicyPdf(policy);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${policy.policyNumber}.pdf`);
  res.send(pdfBuffer);
});
