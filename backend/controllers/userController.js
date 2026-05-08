import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("name email role isEmailVerified failedLoginAttempts lockUntil lastLoginAt lastLoginIp lastUserAgent createdAt")
    .sort({ createdAt: -1 });

  res.json(users);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.body.role) {
    user.role = req.body.role;
  }

  if (typeof req.body.isEmailVerified === "boolean") {
    user.isEmailVerified = req.body.isEmailVerified;
    user.emailVerifiedAt = req.body.isEmailVerified ? user.emailVerifiedAt || new Date() : undefined;
  }

  await user.save({ validateBeforeSave: false });

  await logActivity({
    req,
    action: "updated",
    entityType: "User",
    entityId: user._id,
    message: `Updated user ${user.email}`
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    failedLoginAttempts: user.failedLoginAttempts,
    lockUntil: user.lockUntil,
    lastLoginAt: user.lastLoginAt,
    lastLoginIp: user.lastLoginIp,
    lastUserAgent: user.lastUserAgent
  });
});

export const unlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save({ validateBeforeSave: false });

  await logActivity({
    req,
    action: "unlocked",
    entityType: "User",
    entityId: user._id,
    message: `Unlocked user ${user.email}`
  });

  res.json({ message: "User unlocked successfully" });
});
