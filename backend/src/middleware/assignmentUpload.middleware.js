
const multer = require("multer");
const path = require("path");

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed."));
  }

  cb(null, true);
};

const uploadAssignmentPDF = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
}).single("attachment");

const validatePDFSignature = (req, res, next) => {
  if (!req.file) return next();

  const buffer = req.file.buffer;

  if (!buffer || buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    return next(new Error("The uploaded file is not a valid PDF."));
  }

  next();
};

module.exports = [uploadAssignmentPDF, validatePDFSignature];
