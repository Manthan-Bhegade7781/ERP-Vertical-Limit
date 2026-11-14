const mongoose = require("mongoose");

const TeacherAttendance = require("../models/TeacherAttendance");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const BatchSubject = require("../models/BatchSubject");

const VALID_STATUSES = ["Present", "Absent", "Late", "Leave"];

// =====================================================
// COMMON HELPERS
// =====================================================

const hasRole = (user, role) => {
  return Array.isArray(user?.roles) && user.roles.includes(role);
};

const getUserId = (user) => {
  return user?._id || user?.id;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Normalize attendance date to midnight UTC.
const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
  );
};

// Populate attendance records consistently.
const populateTeacherAttendance = (query) => {
  return query
    .populate("teacherId", "fullName email mobileNumber")
    .populate("batchId", "name code standard branchId")
    .populate("subjectId", "name code standard")
    .populate("markedBy", "fullName email");
};

// =====================================================
// CHECK TEACHER ASSIGNMENT AND ACCESS
// =====================================================

const canManageTeacherPair = async ({
  user,
  teacherId,
  batchId,
  subjectId,
}) => {
  if (!user || !teacherId || !batchId || !subjectId) {
    return false;
  }

  // Teachers can only mark their own attendance.
  if (hasRole(user, "teacher")) {
    if (String(getUserId(user)) !== String(teacherId)) {
      return false;
    }
  } else if (
    !hasRole(user, "admin") &&
    !hasRole(user, "super_admin")
  ) {
    return false;
  }

  const [batch, subject, assignment] = await Promise.all([
    Batch.findOne({
      _id: batchId,
      isRemoved: { $ne: true },
    }).select("branchId"),

    Subject.findOne({
      _id: subjectId,
      status: "active",
    }).select("_id"),

    BatchSubject.findOne({
      batchId,
      subjectId,
      teacherId,
      status: "active",
    }).select("_id"),
  ]);

  if (!batch || !subject || !assignment) {
    return false;
  }

  // Admins can access only their own branch.
  if (hasRole(user, "admin")) {
    if (
      !user.branchId ||
      String(batch.branchId) !== String(user.branchId)
    ) {
      return false;
    }
  }

  return true;
};

// Check access to an existing attendance record.
const canAccessTeacherAttendanceRecord = async (
  record,
  user
) => {
  if (!record || !user) {
    return false;
  }

  // Super Admin has global access.
  if (hasRole(user, "super_admin")) {
    return true;
  }

  // Teacher can access their own active assignments.
  if (hasRole(user, "teacher")) {
    if (
      String(record.teacherId) !== String(getUserId(user))
    ) {
      return false;
    }

    return Boolean(
      await BatchSubject.exists({
        batchId: record.batchId,
        subjectId: record.subjectId,
        teacherId: getUserId(user),
        status: "active",
      })
    );
  }

  // Admin can access records from their branch.
  if (hasRole(user, "admin")) {
    if (!user.branchId) {
      return false;
    }

    const batch = await Batch.findById(
      record.batchId
    ).select("branchId");

    return Boolean(
      batch &&
      String(batch.branchId) === String(user.branchId)
    );
  }

  return false;
};

// =====================================================
// MARK TEACHER ATTENDANCE
// POST /api/teacher-attendance
// =====================================================

const markTeacherAttendance = async (req, res) => {
  try {
    const {
      batchId,
      subjectId,
      date,
      status,
      checkIn,
      remarks,
    } = req.body;

    const authenticatedUserId = getUserId(req.user);

    // Teacher ID is automatically taken from logged-in user.
    // Admin and Super Admin may provide teacherId.
    const teacherId = hasRole(req.user, "teacher")
      ? authenticatedUserId
      : req.body.teacherId;

    if (
      !authenticatedUserId ||
      !teacherId ||
      !batchId ||
      !subjectId ||
      !date ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "teacherId (for admin), batchId, subjectId, date and status are required.",
      });
    }

    // Validate IDs.
    if (
      ![
        teacherId,
        batchId,
        subjectId,
      ].every(isValidObjectId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid teacherId, batchId or subjectId.",
      });
    }

    // Validate status.
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Present, Absent, Late or Leave.",
      });
    }

    // Validate date.
    const attendanceDate = normalizeDate(date);

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid attendance date.",
      });
    }

    // Verify teacher assignment and permissions.
    const allowed = await canManageTeacherPair({
      user: req.user,
      teacherId,
      batchId,
      subjectId,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized for this teacher, batch and subject assignment.",
      });
    }

    // Create teacher attendance.
    const attendance = await TeacherAttendance.create({
      teacherId,
      batchId,
      subjectId,
      date: attendanceDate,
      status,
      checkIn: checkIn || "",
      remarks: remarks || "",
      markedBy: authenticatedUserId,
    });

    const populatedRecord = await populateTeacherAttendance(
      TeacherAttendance.findById(attendance._id)
    );

    return res.status(201).json({
      success: true,
      message: "Teacher attendance marked successfully.",
      data: populatedRecord,
    });
  } catch (error) {
    // Duplicate attendance protection.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Teacher attendance has already been marked for this batch, subject and date.",
      });
    }

    console.error(
      "Mark teacher attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to mark teacher attendance.",
    });
  }
};

// =====================================================
// GET TEACHER ATTENDANCE RECORDS
// GET /api/teacher-attendance
//
// Optional filters:
// batchId, subjectId, date
// =====================================================

const getTeacherAttendanceRecords = async (req, res) => {
  try {
    const {
      batchId,
      subjectId,
      date,
    } = req.query;

    const user = req.user;
    const filter = {};

    // Validate optional IDs.
    for (const [field, value] of Object.entries({
      batchId,
      subjectId,
    })) {
      if (value) {
        if (!isValidObjectId(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`,
          });
        }

        filter[field] = value;
      }
    }

    // Teacher access.
    if (hasRole(user, "teacher")) {
      filter.teacherId = getUserId(user);

      const assignments = await BatchSubject.find({
        teacherId: getUserId(user),
        status: "active",
      }).select("batchId subjectId");

      const allowedPairs = assignments.filter(
        (assignment) => {
          const matchesBatch =
            !batchId ||
            String(assignment.batchId) === String(batchId);

          const matchesSubject =
            !subjectId ||
            String(assignment.subjectId) === String(subjectId);

          return matchesBatch && matchesSubject;
        }
      );

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
    }

    // Admin access.
    else if (hasRole(user, "admin")) {
      if (!user.branchId) {
        return res.status(403).json({
          success: false,
          message:
            "No branch is assigned to your account.",
        });
      }

      const branchBatches = await Batch.find({
        branchId: user.branchId,
        isRemoved: { $ne: true },
      }).distinct("_id");

      filter.batchId = {
        $in: branchBatches,
      };

      if (batchId) {
        filter.batchId.$eq =
          new mongoose.Types.ObjectId(batchId);
      }
    }

    // Super Admin access.
    else if (!hasRole(user, "super_admin")) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view teacher attendance.",
      });
    }

    // Date filter.
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

    const records = await populateTeacherAttendance(
      TeacherAttendance.find(filter).sort({
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
    console.error(
      "Get teacher attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher attendance.",
    });
  }
};

// =====================================================
// GET TEACHER ATTENDANCE BY ID
// GET /api/teacher-attendance/:id
// =====================================================

const getTeacherAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher attendance ID.",
      });
    }

    const record = await TeacherAttendance.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Teacher attendance record not found.",
      });
    }

    const allowed = await canAccessTeacherAttendanceRecord(
      record,
      req.user
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this record.",
      });
    }

    const populatedRecord = await populateTeacherAttendance(
      TeacherAttendance.findById(id)
    );

    return res.status(200).json({
      success: true,
      data: populatedRecord,
    });
  } catch (error) {
    console.error(
      "Get teacher attendance by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch teacher attendance record.",
    });
  }
};

// =====================================================
// UPDATE TEACHER ATTENDANCE
// PUT /api/teacher-attendance/:id
// =====================================================

const updateTeacherAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      checkIn,
      remarks,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher attendance ID.",
      });
    }

    if (
      status === undefined &&
      checkIn === undefined &&
      remarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one field to update.",
      });
    }

    if (
      status !== undefined &&
      !VALID_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    const record = await TeacherAttendance.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Teacher attendance record not found.",
      });
    }

    const allowed = await canAccessTeacherAttendanceRecord(
      record,
      req.user
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this record.",
      });
    }

    // Update only supplied fields.
    if (status !== undefined) {
      record.status = status;
    }

    if (checkIn !== undefined) {
      record.checkIn = checkIn;
    }

    if (remarks !== undefined) {
      record.remarks = remarks;
    }

    await record.save();

    const populatedRecord = await populateTeacherAttendance(
      TeacherAttendance.findById(record._id)
    );

    return res.status(200).json({
      success: true,
      message:
        "Teacher attendance updated successfully.",
      data: populatedRecord,
    });
  } catch (error) {
    console.error(
      "Update teacher attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update teacher attendance.",
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  markTeacherAttendance,
  getTeacherAttendanceRecords,
  getTeacherAttendanceById,
  updateTeacherAttendance,
};