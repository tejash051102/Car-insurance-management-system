import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import generateToken from "../utils/generateToken.js";
import { getRequestMeta, logSecurityEvent } from "../utils/securityLogger.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;
const TWO_FACTOR_EXPIRY_MS = 10 * 60 * 1000;

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  token: generateToken(user._id)
});

const createVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  return {
    rawToken,
    hashedToken,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
};

const getClientUrl = () => {
  const [clientUrl] = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
  return clientUrl.trim().replace(/\/$/, "");
};

const sendVerificationEmail = async (user, rawToken) => {
  const verificationUrl = `${getClientUrl()}/verify-email/${rawToken}`;
  const result = await sendEmail({
    to: user.email,
    subject: "Verify your email address",
    text: `Hello ${user.name},\n\nPlease verify your email address for Insurance Management System:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create this account, you can ignore this email.`
  });

  return {
    verificationUrl,
    emailSkipped: Boolean(result?.skipped)
  };
};

const sendPasswordResetEmail = async (user, rawToken) => {
  const resetUrl = `${getClientUrl()}/reset-password/${rawToken}`;
  const result = await sendEmail({
    to: user.email,
    subject: "Reset your password",
    text: `Hello ${user.name},\n\nUse this link to reset your Insurance Management System password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request this, you can ignore this email.`
  });

  return {
    resetUrl,
    emailSkipped: Boolean(result?.skipped)
  };
};

const createOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  return {
    otp,
    hashedOtp,
    expires: new Date(Date.now() + TWO_FACTOR_EXPIRY_MS)
  };
};

const sendTwoFactorEmail = async (user, otp) => {
  const result = await sendEmail({
    to: user.email,
    subject: "Your login verification code",
    text: `Hello ${user.name},\n\nYour Insurance Management System login verification code is ${otp}.\n\nThis code expires in 10 minutes.\n\nIf you did not try to sign in, contact your administrator.`
  });

  return {
    emailSkipped: Boolean(result?.skipped)
  };
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const verification = createVerificationToken();
  const user = await User.create({
    name,
    email,
    password,
    role,
    emailVerificationToken: verification.hashedToken,
    emailVerificationExpires: verification.expires
  });
  const emailResult = await sendVerificationEmail(user, verification.rawToken);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    verificationRequired: true,
    message: "Account created. Please verify your email before signing in.",
    ...(emailResult.emailSkipped ? { verificationUrl: emailResult.verificationUrl } : {})
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +emailVerificationToken +twoFactorOtpHash +twoFactorOtpExpires");

  if (!user) {
    await logSecurityEvent({
      req,
      type: "login-failed",
      severity: "medium",
      email,
      message: `Failed login for unknown email ${email || "blank"}`
    });
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    await logSecurityEvent({
      req,
      type: "account-locked",
      severity: "high",
      email: user.email,
      user: user._id,
      message: `Blocked login attempt for locked account ${user.email}`,
      metadata: { lockUntil: user.lockUntil }
    });
    res.status(423);
    throw new Error("Account is locked due to suspicious login attempts. Try again later.");
  }

  const passwordMatches = await user.matchPassword(password);

  if (!passwordMatches) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      await logSecurityEvent({
        req,
        type: "account-locked",
        severity: "critical",
        email: user.email,
        user: user._id,
        message: `Account locked after ${user.failedLoginAttempts} failed login attempts`,
        metadata: { lockUntil: user.lockUntil }
      });
    } else {
      await logSecurityEvent({
        req,
        type: "login-failed",
        severity: user.failedLoginAttempts >= 3 ? "high" : "medium",
        email: user.email,
        user: user._id,
        message: `Failed login attempt ${user.failedLoginAttempts} for ${user.email}`,
        metadata: { failedLoginAttempts: user.failedLoginAttempts }
      });
    }

    await user.save({ validateBeforeSave: false });
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isEmailVerified && user.emailVerificationToken) {
    await logSecurityEvent({
      req,
      type: "login-failed",
      severity: "medium",
      email: user.email,
      user: user._id,
      message: `Unverified account attempted login: ${user.email}`
    });
    res.status(403);
    throw new Error("Please verify your email before signing in");
  }

  const { ipAddress, userAgent } = getRequestMeta(req);
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginIp = ipAddress;
  user.lastUserAgent = userAgent;
  const otp = createOtp();
  user.twoFactorOtpHash = otp.hashedOtp;
  user.twoFactorOtpExpires = otp.expires;
  await user.save({ validateBeforeSave: false });

  const otpResult = await sendTwoFactorEmail(user, otp.otp);

  if (otpResult.emailSkipped) {
    user.twoFactorOtpHash = undefined;
    user.twoFactorOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await logSecurityEvent({
      req,
      type: "two-factor-failed",
      severity: "high",
      email: user.email,
      user: user._id,
      message: `Two-factor OTP could not be delivered for ${user.email}`,
      metadata: { reason: "SMTP not configured" }
    });

    res.status(503);
    throw new Error("OTP email service is not configured. Please add SMTP settings to backend .env.");
  }

  await logSecurityEvent({
    req,
    type: "two-factor-sent",
    severity: "medium",
    email: user.email,
    user: user._id,
    message: `Two-factor login code sent for ${user.email}`,
    metadata: { expires: otp.expires }
  });

  res.json({
    twoFactorRequired: true,
    email: user.email,
    message: "Verification code sent to your email"
  });
});

export const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const hashedOtp = crypto.createHash("sha256").update(String(otp)).digest("hex");
  const user = await User.findOne({
    email,
    twoFactorOtpHash: hashedOtp,
    twoFactorOtpExpires: { $gt: new Date() }
  }).select("+twoFactorOtpHash +twoFactorOtpExpires");

  if (!user) {
    await logSecurityEvent({
      req,
      type: "two-factor-failed",
      severity: "high",
      email,
      message: `Invalid or expired two-factor code for ${email}`
    });
    res.status(401);
    throw new Error("Invalid or expired verification code");
  }

  const { ipAddress, userAgent } = getRequestMeta(req);
  user.twoFactorOtpHash = undefined;
  user.twoFactorOtpExpires = undefined;
  user.lastLoginAt = new Date();
  user.lastLoginIp = ipAddress;
  user.lastUserAgent = userAgent;
  await user.save({ validateBeforeSave: false });

  await logSecurityEvent({
    req,
    type: "two-factor-success",
    severity: "low",
    email: user.email,
    user: user._id,
    message: `Two-factor authentication completed for ${user.email}`
  });

  await logSecurityEvent({
    req,
    type: "login-success",
    severity: "low",
    email: user.email,
    user: user._id,
    message: `Successful login for ${user.email}`
  });

  res.json(userResponse(user));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() }
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    res.status(400);
    throw new Error("Verification link is invalid or expired");
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  await logSecurityEvent({
    req,
    type: "email-verification-success",
    severity: "low",
    email: user.email,
    user: user._id,
    message: `Email verified for ${user.email}`
  });

  res.json({
    ...userResponse(user),
    message: "Email verified successfully"
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    res.json({ message: "Email is already verified" });
    return;
  }

  const verification = createVerificationToken();
  user.emailVerificationToken = verification.hashedToken;
  user.emailVerificationExpires = verification.expires;
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendVerificationEmail(user, verification.rawToken);
  res.json({
    message: "Verification email sent",
    ...(emailResult.emailSkipped ? { verificationUrl: emailResult.verificationUrl } : {})
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    res.json({ message: "If this email exists, a reset link has been sent" });
    return;
  }

  const reset = createVerificationToken();
  user.passwordResetToken = reset.hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await logSecurityEvent({
    req,
    type: "password-reset-request",
    severity: "medium",
    email: user.email,
    user: user._id,
    message: `Password reset requested for ${user.email}`
  });

  const emailResult = await sendPasswordResetEmail(user, reset.rawToken);
  res.json({
    message: "If this email exists, a reset link has been sent",
    ...(emailResult.emailSkipped ? { resetUrl: emailResult.resetUrl } : {})
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  await logSecurityEvent({
    req,
    type: "password-reset-success",
    severity: "medium",
    email: user.email,
    user: user._id,
    message: `Password reset completed for ${user.email}`
  });

  res.json({
    ...userResponse(user),
    message: "Password reset successfully"
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});
