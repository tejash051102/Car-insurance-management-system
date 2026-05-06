import asyncHandler from "express-async-handler";
import Claim from "../models/Claim.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";
import Vehicle from "../models/Vehicle.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    customers,
    vehicles,
    policies,
    activePolicies,
    claims,
    pendingClaims,
    paidPayments,
    recentPolicies,
    recentClaims,
    policyStatus,
    claimStatus
  ] = await Promise.all([
    Customer.countDocuments(),
    Vehicle.countDocuments(),
    Policy.countDocuments(),
    Policy.countDocuments({ status: "active" }),
    Claim.countDocuments(),
    Claim.countDocuments({ status: { $in: ["submitted", "under-review"] } }),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Policy.find().populate("customer").populate("vehicle").sort({ createdAt: -1 }).limit(5),
    Claim.find().populate("customer").populate("policy").sort({ createdAt: -1 }).limit(5),
    Policy.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Claim.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
  ]);

  res.json({
    totals: {
      customers,
      vehicles,
      policies,
      activePolicies,
      claims,
      pendingClaims,
      revenue: paidPayments[0]?.total || 0
    },
    recentPolicies,
    recentClaims,
    policyStatus,
    claimStatus
  });
});
