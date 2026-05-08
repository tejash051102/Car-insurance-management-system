import SecurityEvent from "../models/SecurityEvent.js";

export const getRequestMeta = (req) => ({
  ipAddress: req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress,
  userAgent: req.headers["user-agent"] || "Unknown device"
});

export const logSecurityEvent = async ({ req, type, severity = "low", email, user, message, metadata }) => {
  try {
    const { ipAddress, userAgent } = getRequestMeta(req);
    await SecurityEvent.create({
      type,
      severity,
      email,
      user,
      ipAddress,
      userAgent,
      message,
      metadata
    });
  } catch (error) {
    console.error("Security event log failed:", error.message);
  }
};
