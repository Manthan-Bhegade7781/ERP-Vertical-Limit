
const mongoose = require("mongoose");

const Leave = require("../models/Leave");
const User = require("../models/User");

// ============================================================
// HELPERS
// ============================================================

const isSuperAdmin = (user) =>
  user.roles.includes("super_admin");

const isTeacherOnly = (user) =>
  user.roles.includes("teacher") &&
  !user.roles.includes("super_admin") &&
  !user.roles.includes("admin");

// Validate branch assignment for branch Admins.
const validateAdminBranch = (req, res) => {
  if (
    !isSuperAdmin(req.user) &&
    !isTeacherOnly(req.user) &&
    !req.user.branchId
  ) {
    res.status(403).json({
      success: false,
      message: "Your account is not assigned to a branch",
    });

    return false;
  }

  return true;
};

// Parse a date without shifting YYYY-MM-DD calendar dates.
const parseDate = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (date.toISOString().slice(0, 10) !== value) {
      return null;
    }

    return date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

// Calculate inclusive leave days.
const calculateLeaveDays = (fromDate, toDate) => {
  const start = Date.UTC(
    fromDate.getUTCFullYear(),
    fromDate.getUTCMonth(),
    fromDate.getUTCDate()
  );

  const end = Date.UTC(
    toDate.getUTCFullYear(),
    toDate.getUTCMonth(),
    toDate.getUTCDate()
  );

  return Math.floor((end - start) / 86400000) + 1;
};

// Find active staff for Admin/Super Admin leave creation.
const findEligibleStaff = async (staffId, req, res) => {
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    res.status(400).json({
      success: false,
      message: "Invalid staff ID",
    });

    return null;
  }

  const query = {
    _id: staffId,
    status: "active",
    roles: { $in: ["teacher", "admin"] },
    branchId: { $ne: null },
  };

  if (!isSuperAdmin(req.user)) {
    query.branchId = req.user.branchId;
  }

  const staff = await User.findOne(query).select(
    "fullName email mobileNumber roles branchId status"
  );

  if (!staff) {
    res.status(404).json({
      success: false,
      message:
        "Active staff member not found in your permitted branch",
    });

    return null;
  }

  return staff;
};

// Find a leave request that the authenticated user is allowed to access.
const findLeaveWithinScope = async (id, req, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid leave request ID",
    });

    return null;
  }

  const query = { _id: id };

  if (isTeacherOnly(req.user)) {
    query.staffId = req.user._id;
  } else if (!isSuperAdmin(req.user)) {
    if (!req.user.branchId) {
      res.status(403).json({
        success: false,
        message: "Your account is not assigned to a branch",
      });

      return null;
    }

    query.branchId = req.user.branchId;
  }

  const leave = await Leave.findOne(query);

  if (!leave) {
    res.status(404).json({
      success: false,
      message: "Leave request not found",
    });

    return null;
  }

  return leave;
};

// ============================================================
// GET STAFF OPTIONS
// GET /api/leaves/staff-options
// Super Admin/Admin only
// ============================================================

const getLeaveStaffOptions = async (req, res) => {
  try {
    if (!validateAdminBranch(req, res)) {
      return;
    }

    const query = {
      status: "active",
      roles: { $in: ["teacher", "admin"] },
      branchId: { $ne: null },
    };

    if (!isSuperAdmin(req.user)) {
      query.branchId = req.user.branchId;
    }

    const staff = await User.find(query)
      .select("fullName email mobileNumber roles branchId")
      .populate("branchId", "name code")
      .sort({ fullName: 1 });

    return res.status(200).json({
      success: true,
      count: staff.length,
      data: { staff },
    });
  } catch (error) {
    console.error("Get leave staff options error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff options",
    });
  }
};

// ============================================================
// GET LEAVES
// GET /api/leaves
// Super Admin: all branches
// Admin: own branch
// Teacher: own requests
// ============================================================

const getLeaves = async (req, res) => {
  try {
    if (!validateAdminBranch(req, res)) {
      return;
    }

    const { status, fromDate, toDate } = req.query;
    const query = {};

    if (isTeacherOnly(req.user)) {
      query.staffId = req.user._id;
    } else if (!isSuperAdmin(req.user)) {
      query.branchId = req.user.branchId;
    }

    if (status) {
      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave status filter",
        });
      }

      query.status = status;
    }

    if (fromDate || toDate) {
      const parsedFromDate = fromDate
        ? parseDate(fromDate)
        : null;

      const parsedToDate = toDate
        ? parseDate(toDate)
        : null;

      if (
        (fromDate && !parsedFromDate) ||
        (toDate && !parsedToDate)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date filter",
        });
      }

      if (
        parsedFromDate &&
        parsedToDate &&
        parsedFromDate > parsedToDate
      ) {
        return res.status(400).json({
          success: false,
          message: "fromDate cannot be after toDate",
        });
      }

      // Include requests whose leave period overlaps the date range.
      if (parsedToDate) {
        query.fromDate = { $lte: parsedToDate };
      }

      if (parsedFromDate) {
        query.toDate = { $gte: parsedFromDate };
      }
    }

    const leaves = await Leave.find(query)
      .populate(
        "staffId",
        "fullName email mobileNumber roles"
      )
      .populate("branchId", "name code")
      .populate("createdBy", "fullName email")
      .populate("decidedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      data: { leaves },
    });
  } catch (error) {
    console.error("Get leaves error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
    });
  }
};

// ============================================================
// CREATE LEAVE
// POST /api/leaves
// Admin/Super Admin: create for eligible staff
// Teacher: create for self
// ============================================================

const createLeave = async (req, res) => {
  try {
    if (!validateAdminBranch(req, res)) {
      return;
    }

    const {
      staffId,
      leaveType,
      fromDate,
      toDate,
      reason,
    } = req.body;

    if (
      (!isTeacherOnly(req.user) && !staffId) ||
      !leaveType ||
      !fromDate ||
      !toDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "All required leave fields must be provided",
      });
    }

    const allowedLeaveTypes = [
      "Casual Leave",
      "Sick Leave",
      "Earned Leave",
      "Emergency Leave",
      "Other",
    ];

    if (!allowedLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type",
      });
    }

    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Leave reason is required",
      });
    }

    const parsedFromDate = parseDate(fromDate);
    const parsedToDate = parseDate(toDate);

    if (!parsedFromDate || !parsedToDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave start date or end date",
      });
    }

    if (parsedFromDate > parsedToDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    let staff;

    if (isTeacherOnly(req.user)) {
      // Ignore any staffId submitted by a teacher.
      // The authenticated teacher is the only permitted applicant.
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: "Your account is not assigned to a branch",
        });
      }

      staff = await User.findOne({
        _id: req.user._id,
        status: "active",
        roles: "teacher",
        branchId: req.user.branchId,
      }).select("fullName roles branchId status");

      if (!staff) {
        return res.status(403).json({
          success: false,
          message: "Active teacher account not found",
        });
      }
    } else {
      staff = await findEligibleStaff(
        staffId,
        req,
        res
      );

      if (!staff) {
        return;
      }
    }

    const leave = await Leave.create({
      staffId: staff._id,
      branchId: staff.branchId,
      leaveType,
      fromDate: parsedFromDate,
      toDate: parsedToDate,
      days: calculateLeaveDays(
        parsedFromDate,
        parsedToDate
      ),
      reason: reason.trim(),
      status: "pending",
      createdBy: req.user._id,
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate(
        "staffId",
        "fullName email mobileNumber roles"
      )
      .populate("branchId", "name code")
      .populate("createdBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: { leave: populatedLeave },
    });
  } catch (error) {
    console.error("Create leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create leave request",
    });
  }
};

// ============================================================
// UPDATE LEAVE STATUS
// PATCH /api/leaves/:id/status
// Super Admin/Admin only
// ============================================================

const updateLeaveStatus = async (req, res) => {
  try {
    if (!validateAdminBranch(req, res)) {
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const leave = await findLeaveWithinScope(
      id,
      req,
      res
    );

    if (!leave) {
      return;
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending leave requests can be approved or rejected",
      });
    }

    leave.status = status;
    leave.decidedBy = req.user._id;
    leave.decidedAt = new Date();

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate(
        "staffId",
        "fullName email mobileNumber roles"
      )
      .populate("branchId", "name code")
      .populate("createdBy", "fullName email")
      .populate("decidedBy", "fullName email");

    return res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: { leave: populatedLeave },
    });
  } catch (error) {
    console.error("Update leave status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update leave status",
    });
  }
};

// ============================================================
// UPDATE LEAVE
// PUT /api/leaves/:id
// Teacher: own pending request only
// Admin/Super Admin: pending request within permitted scope
// ============================================================

const updateLeave = async (req, res) => {
  try {
    if (!validateAdminBranch(req, res)) {
      return;
    }

    const { id } = req.params;

    const {
      staffId,
      leaveType,
      fromDate,
      toDate,
      reason,
    } = req.body;

    const leave = await findLeaveWithinScope(
      id,
      req,
      res
    );

    if (!leave) {
      return;
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave requests can be edited",
      });
    }

    if (
      (!isTeacherOnly(req.user) && !staffId) ||
      !leaveType ||
      !fromDate ||
      !toDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "All required leave fields must be provided",
      });
    }

    const allowedLeaveTypes = [
      "Casual Leave",
      "Sick Leave",
      "Earned Leave",
      "Emergency Leave",
      "Other",
    ];

    if (!allowedLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type",
      });
    }

    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Leave reason is required",
      });
    }

    const parsedFromDate = parseDate(fromDate);
    const parsedToDate = parseDate(toDate);

    if (!parsedFromDate || !parsedToDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave start date or end date",
      });
    }

    if (parsedFromDate > parsedToDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    let staff;

    if (isTeacherOnly(req.user)) {
      // Keep the request assigned to the authenticated teacher.
      staff = await User.findOne({
        _id: req.user._id,
        status: "active",
        roles: "teacher",
        branchId: req.user.branchId,
      }).select("fullName roles branchId status");

      if (!staff) {
        return res.status(403).json({
          success: false,
          message: "Active teacher account not found",
        });
      }
    } else {
      staff = await findEligibleStaff(
        staffId,
        req,
        res
      );

      if (!staff) {
        return;
      }
    }

    leave.staffId = staff._id;
    leave.branchId = staff.branchId;
    leave.leaveType = leaveType;
    leave.fromDate = parsedFromDate;
    leave.toDate = parsedToDate;
    leave.days = calculateLeaveDays(
      parsedFromDate,
      parsedToDate
    );
    leave.reason = reason.trim();

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate(
        "staffId",
        "fullName email mobileNumber roles"
      )
      .populate("branchId", "name code")
      .populate("createdBy", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Leave request updated successfully",
      data: { leave: populatedLeave },
    });
  } catch (error) {
    console.error("Update leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update leave request",
    });
  }
};

// ============================================================
// DELETE LEAVE
// DELETE /api/leaves/:id
// Teacher: own pending request only
// Admin/Super Admin: pending request within permitted scope
// ============================================================

const deleteLeave = async (req, res) => {
  try {
    if (!validateAdminBranch(req, res)) {
      return;
    }

    const { id } = req.params;

    const leave = await findLeaveWithinScope(
      id,
      req,
      res
    );

    if (!leave) {
      return;
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave requests can be deleted",
      });
    }

    await Leave.findByIdAndDelete(leave._id);

    return res.status(200).json({
      success: true,
      message: "Leave request deleted successfully",
      data: { leaveId: leave._id },
    });
  } catch (error) {
    console.error("Delete leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete leave request",
    });
  }
};

module.exports = {
  getLeaveStaffOptions,
  getLeaves,
  createLeave,
  updateLeaveStatus,
  updateLeave,
  deleteLeave,
};
