const mongoose = require("mongoose");

const Attendance = require("../models/attendance.model");
const Student = require("../models/Student");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const BatchSubject = require("../models/BatchSubject");
const createNotification = require("../utils/createNotification");

const VALID_STATUSES = ["Present", "Absent", "Late", "Leave"];

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

// Normalize the date to midnight UTC.
const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
  );
};

// Populate attendance records consistently.
const populateAttendance = (query) =>
  query
    .populate({
      path: "studentId",
      populate: {
        path: "userId",
        select: "fullName email mobileNumber",
      },
    })
    .populate("batchId", "name code standard branchId")
    .populate("subjectId", "name code standard")
    .populate("markedBy", "fullName email");

// Check whether the authenticated user can access a record.
const canAccessAttendanceRecord = async (record, user) => {
  if (!record || !user) return false;

  // Super Admin can access all branches.
  if (user.roles.includes("super_admin")) {
    return true;
  }

  // Admin can access their own branch.
  if (user.roles.includes("admin")) {
    if (!user.branchId) return false;

    const batch = await Batch.findById(record.batchId).select("branchId");

    return Boolean(
      batch &&
        batch.branchId.toString() === user.branchId.toString()
    );
  }

  // Teacher can access their active subject assignments.
  if (user.roles.includes("teacher")) {
    return Boolean(
      await BatchSubject.exists({
        batchId: record.batchId,
        subjectId: record.subjectId,
        teacherId: user._id,
        status: "active",
      })
    );
  }

  return false;
};

// =====================================================
// MARK ATTENDANCE
// POST /api/attendance
// =====================================================

const markAttendance = async (req, res) => {
  try {
    const {
      studentId,
      batchId,
      subjectId,
      date,
      status,
      checkIn,
      remarks,
    } = req.body;

    if (!studentId || !batchId || !subjectId || !date || !status) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, batchId, subjectId, date and status are required.",
      });
    }

    if (
      !isValidObjectId(studentId) ||
      !isValidObjectId(batchId) ||
      !isValidObjectId(subjectId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId, batchId or subjectId.",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Present, Absent, Late or Leave.",
      });
    }

    const attendanceDate = normalizeDate(date);

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid attendance date.",
      });
    }

    const [student, batch, subject, assignment] = await Promise.all([
      Student.findById(studentId),
      Batch.findOne({
        _id: batchId,
        isRemoved: { $ne: true },
      }),
      Subject.findById(subjectId),
      BatchSubject.findOne({
        batchId,
        subjectId,
        status: "active",
      }),
    ]);

    if (!student || student.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active student not found.",
      });
    }

    if (student.batchId.toString() !== batchId) {
      return res.status(400).json({
        success: false,
        message: "The student does not belong to this batch.",
      });
    }

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Active batch not found.",
      });
    }

    if (!subject || subject.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active subject not found.",
      });
    }

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: "This subject is not assigned to the selected batch.",
      });
    }

    const markedBy = req.user?._id || req.user?.id;

    if (!markedBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    // Save attendance first.
    const attendance = await Attendance.create({
      studentId,
      batchId,
      subjectId,
      date: attendanceDate,
      status,
      checkIn: checkIn || "",
      remarks: remarks || "",
      markedBy,
    });

    // Notify only the student whose attendance was marked.
    if (student.userId) {
      await createNotification({
        recipient: student.userId,
        title: "Attendance Marked",
        message: `Your attendance for ${
          subject.name
        } on ${
          attendanceDate.toISOString().split("T")[0]
        } has been marked as ${status}.`,
        type: "attendance",
        icon: "calendar-check-outline",
      });
    }

    const populatedRecord = await populateAttendance(
      Attendance.findById(attendance._id)
    );

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully.",
      data: populatedRecord,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance has already been marked for this student, batch, subject and date.",
      });
    }

    console.error("Mark attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark attendance.",
    });
  }
};

// =====================================================
// GET ALL ATTENDANCE
// GET /api/attendance
// Optional filters: batchId, subjectId, studentId, status, date
// =====================================================

const getAttendanceRecords = async (req, res) => {
  try {
    const { batchId, subjectId, studentId, status, date } = req.query;

    const filter = {};
    const user = req.user;

    // Validate optional ID filters.
    for (const [field, value] of Object.entries({
      batchId,
      subjectId,
      studentId,
    })) {
      if (value) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`,
          });
        }

        filter[field] = value;
      }
    }

    // Validate attendance status.
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance status.",
        });
      }

      filter.status = status;
    }

    // Filter by a specific calendar date.
    if (date) {
      const startDate = normalizeDate(date);

      if (!startDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid date filter.",
        });
      }

      const endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + 1);

      filter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Super Admin can view all attendance.
    if (user.roles.includes("super_admin")) {
      // No additional restriction.
    } else if (user.roles.includes("student")) {
      // Students can view only their own attendance.
      const student = await Student.findOne({
        userId: user._id,
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found.",
        });
      }

      if (
        studentId &&
        student._id.toString() !== studentId
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own attendance.",
        });
      }

      filter.studentId = student._id;
    } else if (user.roles.includes("admin")) {
      // Admin can view attendance from their branch.
      if (!user.branchId) {
        return res.status(403).json({
          success: false,
          message: "No branch is assigned to your account.",
        });
      }

      const branchBatches = await Batch.find({
        branchId: user.branchId,
        isRemoved: { $ne: true },
      }).distinct("_id");

      filter.batchId = {
        $in: branchBatches,
        ...(batchId
          ? {
              $eq: new mongoose.Types.ObjectId(batchId),
            }
          : {}),
      };
    } else if (user.roles.includes("teacher")) {
      // Teachers can view attendance for their active assignments.
      const assignments = await BatchSubject.find({
        teacherId: user._id,
        status: "active",
      }).select("batchId subjectId");

      const allowedPairs = assignments.filter((assignment) => {
        const matchesBatch =
          !batchId || assignment.batchId.toString() === batchId;

        const matchesSubject =
          !subjectId || assignment.subjectId.toString() === subjectId;

        return matchesBatch && matchesSubject;
      });

      if (allowedPairs.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      filter.$or = allowedPairs.map((assignment) => ({
        batchId: assignment.batchId,
        subjectId: assignment.subjectId,
      }));
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view attendance.",
      });
    }

    const records = await populateAttendance(
      Attendance.find(filter).sort({
        date: -1,
        createdAt: -1,
      })
    );

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get attendance records error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records.",
    });
  }
};

// =====================================================
// GET ATTENDANCE BY ID
// GET /api/attendance/:id
// =====================================================

const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID.",
      });
    }

    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    const allowed = await canAccessAttendanceRecord(
      record,
      req.user
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this attendance record.",
      });
    }

    const populatedRecord = await populateAttendance(
      Attendance.findById(id)
    );

    return res.status(200).json({
      success: true,
      data: populatedRecord,
    });
  } catch (error) {
    console.error("Get attendance by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance record.",
    });
  }
};

// =====================================================
// UPDATE ATTENDANCE
// PUT /api/attendance/:id
// =====================================================

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkIn, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID.",
      });
    }

    if (
      status === undefined &&
      checkIn === undefined &&
      remarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    // Capture the original status before updating.
    const previousStatus = record.status;

    const allowed = await canAccessAttendanceRecord(
      record,
      req.user
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this attendance record.",
      });
    }

    // Update only explicitly supplied fields.
    if (status !== undefined) record.status = status;
    if (checkIn !== undefined) record.checkIn = checkIn;
    if (remarks !== undefined) record.remarks = remarks;

    await record.save();

    // Notify the student only when attendance status changes.
    if (
      status !== undefined &&
      previousStatus !== record.status
    ) {
      const student = await Student.findById(
        record.studentId
      ).select("userId");

      const subject = await Subject.findById(
        record.subjectId
      ).select("name");

      if (student?.userId) {
        await createNotification({
          recipient: student.userId,
          title: "Attendance Updated",
          message: `Your attendance status has been updated to ${
            record.status
          }${
            subject?.name ? ` for ${subject.name}` : ""
          }.`,
          type: "attendance",
          icon: "calendar-check-outline",
        });
      }
    }

    const populatedRecord = await populateAttendance(
      Attendance.findById(record._id)
    );

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      data: populatedRecord,
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update attendance.",
    });
  }
};

// =====================================================
// GET STUDENT ATTENDANCE SUMMARY
// GET /api/attendance/student/:studentId/summary
// =====================================================

const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { batchId, subjectId } = req.query;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId.",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Students may only view their own summary.
    if (user.roles.includes("student")) {
      if (user.roles.length !== 1) {
        return res.status(403).json({
          success: false,
          message:
            "This operation is not available for your role combination.",
        });
      }

      if (student.userId.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own attendance summary.",
        });
      }
    } else if (user.roles.includes("super_admin")) {
      // Super Admin can view all student summaries.
    } else if (user.roles.includes("admin")) {
      if (!user.branchId) {
        return res.status(403).json({
          success: false,
          message: "No branch is assigned to your account.",
        });
      }

      const studentBatch = await Batch.findOne({
        _id: student.batchId,
        branchId: user.branchId,
        isRemoved: { $ne: true },
      });

      if (!studentBatch) {
        return res.status(403).json({
          success: false,
          message: "You cannot view students outside your branch.",
        });
      }
    } else if (user.roles.includes("teacher")) {
      const assignments = await BatchSubject.find({
        teacherId: user._id,
        status: "active",
      }).select("batchId subjectId");

      const assignedSubjectIds = assignments
        .filter(
          (assignment) =>
            assignment.batchId.toString() ===
            student.batchId.toString()
        )
        .map((assignment) => assignment.subjectId.toString());

      if (assignedSubjectIds.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this student's batch.",
        });
      }

      if (
        subjectId &&
        !assignedSubjectIds.includes(subjectId)
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this subject.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this summary.",
      });
    }

    // Validate optional filters.
    for (const [field, value] of Object.entries({
      batchId,
      subjectId,
    })) {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}.`,
        });
      }
    }

    if (
      batchId &&
      batchId !== student.batchId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "The requested batch does not match the student's batch.",
      });
    }

    const filter = {
      studentId: student._id,
    };

    if (batchId) filter.batchId = batchId;
    if (subjectId) filter.subjectId = subjectId;

    const records = await Attendance.find(filter).select(
      "status date"
    );

    const summary = {
      totalDays: records.length,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    };

    for (const record of records) {
      if (record.status === "Present") summary.present++;
      if (record.status === "Absent") summary.absent++;
      if (record.status === "Late") summary.late++;
      if (record.status === "Leave") summary.leave++;
    }

    summary.percentage =
      summary.totalDays === 0
        ? 0
        : Number(
            (
              ((summary.present + summary.late) /
                summary.totalDays) *
              100
            ).toFixed(2)
          );

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Student attendance summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate attendance summary.",
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  markAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
  getStudentAttendanceSummary,
};