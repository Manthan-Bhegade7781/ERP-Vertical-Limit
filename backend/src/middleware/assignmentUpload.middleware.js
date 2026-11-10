
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const uploadDir = path.resolve(
  process.cwd(),
  "uploads",
  "assignments"
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    extension !== ".pdf" ||
    file.mimetype !== "application/pdf"
  ) {
    return cb(new Error("Only PDF files are allowed."));
  }

  cb(null, true);
};

const uploadAssignmentPDF = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
}).single("attachment");

// Validate the PDF signature after Multer saves the file.
const validatePDFSignature = (req, res, next) => {
  if (!req.file) return next();

  const fd = fs.openSync(req.file.path, "r");
  const buffer = Buffer.alloc(5);

  try {
    const bytesRead = fs.readSync(fd, buffer, 0, 5, 0);

    if (
      bytesRead !== 5 ||
      buffer.toString("ascii") !== "%PDF-"
    ) {
      fs.unlink(req.file.path, (error) => {
        if (error && error.code !== "ENOENT") {
          console.error("Failed to remove invalid PDF:", error);
        }

        return next(new Error("The uploaded file is not a valid PDF."));
      });

      return;
    }

    return next();
  } catch (error) {
    return next(error);
  } finally {
    fs.closeSync(fd);
  }
};

module.exports = [
  uploadAssignmentPDF,
  validatePDFSignature,
];
