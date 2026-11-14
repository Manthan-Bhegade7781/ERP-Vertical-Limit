
const express = require("express");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const branchRoutes = require("./routes/branch.routes");
const publicBranchRoutes = require("./routes/public-branch.routes");
const studentRoutes = require("./routes/student.routes");
const academicYearRoutes = require("./routes/academicYear.routes");
const subjectRoutes = require("./routes/subject.routes");
const batchSubjectRoutes = require("./routes/batchSubject.routes");
const batchRoutes = require("./routes/batch.routes");
const teacherRoutes = require("./routes/teacher.routes");
const studentSubjectRoutes = require("./routes/studentSubject.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const examinationRoutes = require("./routes/examination.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const feeRoutes = require("./routes/fee.routes");
const timetableRoutes = require("./routes/timetable.routes");
const leaveRoutes = require("./routes/leave.routes");
const announcementRoutes = require("./routes/announcement.routes");
const messageRoutes = require("./routes/message.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");
const academicCalendarRoutes = require("./routes/academicCalendar.routes");
const notificationRoutes = require("./routes/notification.routes");
const ptgRoutes = require("./routes/ptg.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const lectureLogRoutes = require("./routes/lectureLog.routes");
const teacherAttendanceRoutes = require("./routes/teacherAttendance.routes");

const app = express();

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (e.g. native mobile apps).
    // If CORS_ORIGIN is empty, allow all origins for development.
    if (
      !origin ||
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/branches", branchRoutes);
app.use("/api/branches", publicBranchRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/batch-subjects", batchSubjectRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/student-subjects", studentSubjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/lecture-logs", lectureLogRoutes);
app.use("/api/examinations", examinationRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/academic-calendar", academicCalendarRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/ptg", ptgRoutes);
app.use("/api/teacher-attendance", teacherAttendanceRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vertical Classes ERP API is running",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Central error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("API Error:", err.message);

  // Multer errors
  if (err.name === "MulterError") {
    const statusCode =
      err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    return res.status(statusCode).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Uploaded file exceeds the allowed size."
          : err.message,
    });
  }

  // Invalid JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error."
        : err.message || "Something went wrong.",
  });
});

module.exports = app;
