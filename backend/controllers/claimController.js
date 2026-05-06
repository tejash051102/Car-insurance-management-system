import asyncHandler from "express-async-handler";
import Claim from "../models/Claim.js";
import Policy from "../models/Policy.js";

const generateClaimNumber = () => `CLM-${Date.now().toString().slice(-8)}`;

export const getClaims = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const claims = await Claim.find(filter)
    .populate("customer")
    .populate({
      path: "policy",
      populate: { path: "vehicle" }
    })
    .sort({ createdAt: -1 });

  res.json(claims);
});

export const getClaimById = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id).populate("customer").populate("policy");

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  res.json(claim);
});

export const createClaim = asyncHandler(async (req, res) => {
  const policy = await Policy.findById(req.body.policy);

  if (!policy) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const claim = await Claim.create({
    ...req.body,
    customer: req.body.customer || policy.customer,
    claimNumber: req.body.claimNumber || generateClaimNumber(),
    documentUrl: req.file ? `/uploads/${req.file.filename}` : req.body.documentUrl
  });

  const populatedClaim = await claim.populate(["customer", "policy"]);
  res.status(201).json(populatedClaim);
});

export const updateClaim = asyncHandler(async (req, res) => {
  const update = {
    ...req.body,
    ...(req.file ? { documentUrl: `/uploads/${req.file.filename}` } : {})
  };

  const claim = await Claim.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  })
    .populate("customer")
    .populate("policy");

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  res.json(claim);
});

export const deleteClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findByIdAndDelete(req.params.id);

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  res.json({ message: "Claim deleted successfully" });
});
