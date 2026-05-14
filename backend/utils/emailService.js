const isPlaceholder = (value = "") => {
  const placeholders = [
    "yourgmail@gmail.com",
    "your_google_app_password",
    "your-email@gmail.com",
    "your-gmail@gmail.com",
    "your-app-password"
  ].map(v => v.toLowerCase());
  return placeholders.includes(value.trim().toLowerCase());
};

const hasSmtpConfig = () => {
  const configured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    !isPlaceholder(process.env.SMTP_USER) &&
    !isPlaceholder(process.env.SMTP_PASS);

  if (!configured) {
    console.warn(
      "[SMTP] Email service not fully configured. Development mode: emails will be logged to console.\n" +
      "To enable actual email sending, configure these in backend/.env:\n" +
      "  1. SMTP_USER: Your Gmail address\n" +
      "  2. SMTP_PASS: Your Gmail App Password (https://myaccount.google.com/apppasswords)\n"
    );
  }

  return configured;
};

export const sendEmail = async ({ to, subject, text }) => {
  if (!to) {
    return { skipped: true, reason: "Missing recipient" };
  }

  if (!hasSmtpConfig()) {
    console.log(`[email:dev] ${subject} -> ${to}`);
    console.log(text);
    return { skipped: true, reason: "SMTP not configured" };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    family: 4,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 8000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 8000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
};

export const buildPolicyExpiryMessage = (policy) => {
  const customerName = policy.customer?.fullName || "Customer";
  const endDate = new Date(policy.endDate).toLocaleDateString();

  return {
    to: policy.customer?.email,
    subject: `Policy expiry reminder: ${policy.policyNumber}`,
    text: `Hello ${customerName},\n\nYour policy ${policy.policyNumber} is scheduled to expire on ${endDate}. Please contact the insurance team to renew or review your policy.\n\nInsurance Management System`
  };
};
