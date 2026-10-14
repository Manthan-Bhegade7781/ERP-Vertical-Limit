
const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const BatchSubject = require("../models/BatchSubject");

// Ensure the authenticated user can access the requested batch/subject.
const authorizeAttendanceScope = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Super Admin can access all branches.
    if (user.roles.includes("super_admin")) {
      return next();
    }

    // Student access will be restricted to their own records
    // through dedicated student-specific routes/controllers.
    if (user.roles.includes("student")) {
      return res.status(403).json({
        success: false,
        message: "Students cannot access this attendance operation.",
      });
    }

    const batchId =
      req.body.batchId ||
      req.query.batchId ||
      req.params.batchId;

    const subjectId =
      req.body.subjectId ||
      req.query.subjectId ||
      req.params.subjectId;

    if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "A valid batchId is required.",
      });
    }

    const batch = await Batch.findOne({
      _id: batchId,
      isRemoved: { $ne: true },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found or removed.",
      });
    }

    // Admins are restricted to their assigned branch.
    if (user.roles.includes("admin")) {
      if (
        !user.branchId ||
        batch.branchId.toString() !== user.branchId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot access attendance outside your branch.",
        });
      }

      return next();
    }

    // Teachers can access only subjects assigned to their User ID.
    if (user.roles.includes("teacher")) {
      if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({
          success: false,
          message: "A valid subjectId is required for teachers.",
        });
      }

      const assignment = await BatchSubject.findOne({
        batchId,
        subjectId,
        teacherId: user._id,
        status: "active",
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to teach this subject in this batch.",
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this attendance operation.",
    });
  } catch (error) {
    console.error("Attendance authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify attendance permissions.",
    });
  }
};

module.exports = {
  authorizeAttendanceScope,
};
