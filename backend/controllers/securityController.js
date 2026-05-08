import asyncHandler from "express-async-handler";
import SecurityEvent from "../models/SecurityEvent.js";
import User from "../models/User.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";
import { createSecurityReportPdf } from "../utils/securityReportPdf.js";

const sinceDate = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const getSecuritySummary = asyncHandler(async (req, res) => {
  const since = sinceDate(Number(req.query.days) || 7);
  const now = new Date();

  const [
    totalEvents,
    failedLogins,
    successfulLogins,
    lockedAccounts,
    criticalEvents,
    recentEvents,
    topIps,
    dailyFailures
  ] = await Promise.all([
    SecurityEvent.countDocuments({ createdAt: { $gte: since } }),
    SecurityEvent.countDocuments({ type: "login-failed", createdAt: { $gte: since } }),
    SecurityEvent.countDocuments({ type: "login-success", createdAt: { $gte: since } }),
    User.countDocuments({ lockUntil: { $gt: now } }),
    SecurityEvent.countDocuments({ severity: { $in: ["high", "critical"] }, createdAt: { $gte: since } }),
    SecurityEvent.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(8).populate("user", "name email role"),
    SecurityEvent.aggregate([
      { $match: { createdAt: { $gte: since }, ipAddress: { $ne: null } } },
      { $group: { _id: "$ipAddress", count: { $sum: 1 }, failed: { $sum: { $cond: [{ $eq: ["$type", "login-failed"] }, 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    SecurityEvent.aggregate([
      { $match: { type: "login-failed", createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.json({
    totalEvents,
    failedLogins,
    successfulLogins,
    lockedAccounts,
    criticalEvents,
    recentEvents,
    topIps,
    dailyFailures
  });
});

export const getSecurityEvents = asyncHandler(async (req, res) => {
  const filter = {
    ...(req.query.type ? { type: req.query.type } : {}),
    ...(req.query.severity ? { severity: req.query.severity } : {}),
    ...(req.query.search
      ? {
          $or: [
            { email: { $regex: req.query.search, $options: "i" } },
            { ipAddress: { $regex: req.query.search, $options: "i" } },
            { userAgent: { $regex: req.query.search, $options: "i" } },
            { message: { $regex: req.query.search, $options: "i" } }
          ]
        }
      : {})
  };

  const { page, limit, skip } = getPagination(req.query);
  await sendPaginated(
    res,
    SecurityEvent.find(filter).populate("user", "name email role").sort({ createdAt: -1 }),
    SecurityEvent.countDocuments(filter),
    { page, limit, skip }
  );
});

export const downloadSecurityReport = asyncHandler(async (req, res) => {
  const since = sinceDate(Number(req.query.days) || 7);
  const now = new Date();

  const [events, topIps, totalEvents, failedLogins, successfulLogins, lockedAccounts, criticalEvents] =
    await Promise.all([
      SecurityEvent.find({ createdAt: { $gte: since } }).populate("user", "name email role").sort({ createdAt: -1 }).limit(30),
      SecurityEvent.aggregate([
        { $match: { createdAt: { $gte: since }, ipAddress: { $ne: null } } },
        { $group: { _id: "$ipAddress", count: { $sum: 1 }, failed: { $sum: { $cond: [{ $eq: ["$type", "login-failed"] }, 1, 0] } } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      SecurityEvent.countDocuments({ createdAt: { $gte: since } }),
      SecurityEvent.countDocuments({ type: "login-failed", createdAt: { $gte: since } }),
      SecurityEvent.countDocuments({ type: "login-success", createdAt: { $gte: since } }),
      User.countDocuments({ lockUntil: { $gt: now } }),
      SecurityEvent.countDocuments({ severity: { $in: ["high", "critical"] }, createdAt: { $gte: since } })
    ]);

  const pdfBuffer = await createSecurityReportPdf({
    summary: { totalEvents, failedLogins, successfulLogins, lockedAccounts, criticalEvents, topIps },
    events,
    generatedBy: req.user
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=security-report.pdf");
  res.send(pdfBuffer);
});
