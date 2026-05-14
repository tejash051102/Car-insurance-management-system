import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import generateToken from "../utils/generateToken.js";

const TWO_FACTOR_EXPIRY_MS = 10 * 60 * 1000;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

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

const getClientRouteUrl = (path) => `${getClientUrl()}/#${path.startsWith("/") ? path : `/${path}`}`;

const assertStrongPassword = (password) => {
  if (!strongPasswordPattern.test(password || "")) {
    throw new Error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
  }
};

const sendVerificationEmail = async (user, rawToken) => {
  const verificationUrl = getClientRouteUrl(`/verify-email/${rawToken}`);
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
  const resetUrl = getClientRouteUrl(`/reset-password/${rawToken}`);
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
    text: `Hello ${user.name},\n\nYour Insurance Management System login verification code is ${otp}.\n\nThis code expires in 10 minutes.\n\nIf you did not try to sign in, please ignore this email.`
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

  assertStrongPassword(password);

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

  if (user && (await user.matchPassword(password))) {
    if (!user.isEmailVerified && user.emailVerificationToken) {
      res.status(403);
      throw new Error("Please verify your email before signing in");
    }

    const otp = createOtp();
    user.twoFactorOtpHash = otp.hashedOtp;
    user.twoFactorOtpExpires = otp.expires;
    await user.save({ validateBeforeSave: false });

    const emailResult = await sendTwoFactorEmail(user, otp.otp);

    if (emailResult.skipped && process.env.NODE_ENV === "development") {
      // In development, allow login with OTP shown in console
      res.json({
        twoFactorRequired: true,
        email: user.email,
        message: "Verification code sent to your Gmail (check server console in dev mode)",
        devModeOtp: otp.otp
      });
    } else if (emailResult.skipped) {
      // In production, require real email
      user.twoFactorOtpHash = undefined;
      user.twoFactorOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(503);
      throw new Error(
        "OTP email service is not configured.\n\n" +
        "Setup Instructions:\n" +
        "1. Go to backend/.env file\n" +
        "2. Update SMTP_USER with your Gmail address\n" +
        "3. Generate Google App Password at: https://myaccount.google.com/apppasswords\n" +
        "4. Update SMTP_PASS with your App Password\n" +
        "5. Restart the server"
      );
    } else {
      res.json({
        twoFactorRequired: true,
        email: user.email,
        message: "Verification code sent to your Gmail"
      });
    }
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
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
    res.status(401);
    throw new Error("Invalid or expired verification code");
  }

  user.twoFactorOtpHash = undefined;
  user.twoFactorOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

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

  const emailResult = await sendPasswordResetEmail(user, reset.rawToken);
  res.json({
    message: "If this email exists, a reset link has been sent",
    ...(emailResult.emailSkipped ? { resetUrl: emailResult.resetUrl } : {})
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error("Password is required");
  }

  assertStrongPassword(password);

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
  await user.save();

  res.json({
    ...userResponse(user),
    message: "Password reset successfully"
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});
