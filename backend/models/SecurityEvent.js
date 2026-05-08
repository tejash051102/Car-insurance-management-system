import mongoose from "mongoose";

const securityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "login-success",
        "login-failed",
        "account-locked",
        "two-factor-sent",
        "two-factor-success",
        "two-factor-failed",
        "password-reset-request",
        "password-reset-success",
        "email-verification-success",
        "unauthorized-access",
        "suspicious-file-upload"
      ]
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    ipAddress: String,
    userAgent: String,
    message: {
      type: String,
      required: true,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

const SecurityEvent = mongoose.model("SecurityEvent", securityEventSchema);

export default SecurityEvent;
