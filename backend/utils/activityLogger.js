import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({ req, action, entityType, entityId, message }) => {
  try {
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      message,
      actor: req.user?._id,
      actorName: req.user?.name
    });
  } catch (error) {
    console.error("Activity log failed:", error.message);
  }
};
