import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Claim from "../models/Claim.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";
import { createInvoicePdf } from "../utils/invoiceGenerator.js";
import { createPolicyPdf } from "../utils/pdfGenerator.js";

const generateCustomerToken = (id) =>
  jwt.sign({ id, type: "customer" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const customerResponse = (customer) => ({
  _id: customer._id,
  firstName: customer.firstName,
  lastName: customer.lastName,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
  status: customer.status,
  contactVerified: customer.contactVerified,
  token: generateCustomerToken(customer._id)
});

const generateClaimNumber = () => `CLM-${Date.now().toString().slice(-8)}`;

export const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const customer = await Customer.findOne({ email }).select("+password");

  if (!customer?.password) {
    res.status(401);
    throw new Error("Customer portal is not enabled for this email");
  }

  if (customer.status !== "active") {
    res.status(403);
    throw new Error("This customer account is inactive");
  }

  if (await customer.matchPassword(password)) {
    res.json(customerResponse(customer));
    return;
  }

  res.status(401);
  throw new Error("Invalid customer email or password");
});

export const getCustomerProfile = asyncHandler(async (req, res) => {
  res.json(req.customer);
});

export const getCustomerPolicies = asyncHandler(async (req, res) => {
  const policies = await Policy.find({ customer: req.customer._id })
    .populate("vehicle")
    .sort({ createdAt: -1 });

  res.json(policies);
});

export const getCustomerClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ customer: req.customer._id })
    .populate({
      path: "policy",
      populate: { path: "vehicle" }
    })
    .sort({ createdAt: -1 });

  res.json(claims);
});

export const createCustomerClaim = asyncHandler(async (req, res) => {
  const { policy, incidentDate, claimAmount, description } = req.body;
  const customerPolicy = await Policy.findOne({ _id: policy, customer: req.customer._id });

  if (!customerPolicy) {
    res.status(404);
    throw new Error("Policy not found for this customer");
  }

  const claim = await Claim.create({
    policy: customerPolicy._id,
    customer: req.customer._id,
    incidentDate,
    claimAmount: Number(claimAmount || 0),
    description,
    status: "submitted",
    claimNumber: generateClaimNumber()
  });

  const populatedClaim = await claim.populate("policy");
  res.status(201).json(populatedClaim);
});

export const getCustomerPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ customer: req.customer._id })
    .populate("policy")
    .sort({ paymentDate: -1 });

  res.json(payments);
});

export const downloadCustomerPolicyPdf = asyncHandler(async (req, res) => {
  const policy = await Policy.findOne({ _id: req.params.id, customer: req.customer._id })
    .populate("customer")
    .populate("vehicle");

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found for this customer");
  }

  const pdfBuffer = await createPolicyPdf(policy);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${policy.policyNumber}.pdf`);
  res.send(pdfBuffer);
});

export const downloadCustomerPaymentInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, customer: req.customer._id })
    .populate("customer")
    .populate("policy");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found for this customer");
  }

  const pdfBuffer = await createInvoicePdf(payment);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${payment.paymentNumber}-receipt.pdf`);
  res.send(pdfBuffer);
});
