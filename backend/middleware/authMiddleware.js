import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logSecurityEvent } from "../utils/securityLogger.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    await logSecurityEvent({
      req,
      type: "unauthorized-access",
      severity: "medium",
      message: `Missing token for ${req.method} ${req.originalUrl}`
    });
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    await logSecurityEvent({
      req,
      type: "unauthorized-access",
      severity: "high",
      message: `Invalid token for ${req.method} ${req.originalUrl}`
    });
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export const authorize = (...roles) => async (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    await logSecurityEvent({
      req,
      type: "unauthorized-access",
      severity: "high",
      email: req.user.email,
      user: req.user._id,
      message: `Role violation by ${req.user.email} on ${req.method} ${req.originalUrl}`,
      metadata: { requiredRoles: roles, actualRole: req.user.role }
    });
    res.status(403);
    throw new Error("You do not have permission to perform this action");
  }

  next();
};
