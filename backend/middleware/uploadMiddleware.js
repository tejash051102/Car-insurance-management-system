import multer from "multer";
import path from "path";
import { logSecurityEvent } from "../utils/securityLogger.js";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const isValidExtension = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExtension && isValidMime) {
    cb(null, true);
  } else {
    logSecurityEvent({
      req,
      type: "suspicious-file-upload",
      severity: "high",
      email: req.user?.email,
      user: req.user?._id,
      message: `Suspicious file upload blocked: ${file.originalname}`,
      metadata: { mimetype: file.mimetype }
    });
    cb(new Error("Only JPG, PNG, and PDF files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
