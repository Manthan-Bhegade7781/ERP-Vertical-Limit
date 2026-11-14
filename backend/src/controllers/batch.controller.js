const mongoose = require("mongoose");

const Batch = require("../models/Batch");
const Branch = require("../models/Branch");
const BatchSubject = require("../models/BatchSubject");
const Student = require("../models/Student");

// ============================================================
// COMMON HELPERS
// ============================================================

const getBatchStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now > end) return "completed";

  return "active";
};

const getUserId = (user) => user?._id || user?.id;

const isSuperAdmin = (user) =>
  user?.roles?.includes("super_admin");

const isAdminOnly = (user) =>
  user?.roles?.includes("admin") && !isSuperAdmin(user);

// ============================================================
// CREATE BATCH
// ============================================================

const createBatch = async (req, res) => {
  try {
    const {
      name,
      code,
      standard,
      academicYear,
      startDate,
      endDate,
      schedule,
      capacity,
      description,
    } = req.body;

    const superAdmin = isSuperAdmin(req.user);
    const admin = isAdminOnly(req.user);

    if (!superAdmin && !admin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create batches",
      });
    }

    const branchId = admin
      ? req.user?.branchId
      : req.body.branchId;

    if (
      !name?.trim() ||
      !code?.trim() ||
      !standard ||
      !academicYear?.trim() ||
      !branchId ||
      !startDate ||
      !endDate ||
      !schedule?.startTime?.trim() ||
      !schedule?.endTime?.trim() ||
      !Array.isArray(schedule?.days) ||
      schedule.days.length === 0 ||
      capacity === undefined ||
      capacity === null
    ) {
      return res.status(400).json({
        success: false,
        message: !branchId
          ? "Your account must be assigned to a branch, or a branch must be selected"
          : "All required batch fields must be provided",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (branch.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot create a batch for an inactive branch",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const existingBatch = await Batch.findOne({
      code: normalizedCode,
    });

    if (existingBatch) {
      return res.status(409).json({
        success: false,
        message: "Batch code already exists",
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive whole number",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date",
      });
    }

    if (parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    const batch = await Batch.create({
      name: name.trim(),
      code: normalizedCode,
      standard,
      academicYear: academicYear.trim(),
      branchId,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      schedule: {
        startTime: schedule.startTime.trim(),
        endTime: schedule.endTime.trim(),
        days: schedule.days,
      },
      capacity: Number(capacity),
      description: description?.trim() || "",
      isRemoved: false,
      removedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: {
        batch: {
          ...batch.toObject(),
          status: getBatchStatus(
            batch.startDate,
            batch.endDate
          ),
        },
      },
    });
  } catch (error) {
    console.error("Create batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create batch",
    });
  }
};

// ============================================================
// GET ALL BATCHES
// ============================================================

const getBatches = async (req, res) => {
  try {
    const query = {
      isRemoved: { $ne: true },
    };

    // Admin: only batches from their branch.
    if (isAdminOnly(req.user)) {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: "Your account is not assigned to a branch",
        });
      }

      query.branchId = req.user.branchId;
    }

    const batches = await Batch.find(query)
      .populate("branchId", "name code")
      .sort({
        startDate: 1,
        createdAt: -1,
      });

    const batchesWithStatus = batches.map((batch) => ({
      ...batch.toObject(),
      status: getBatchStatus(
        batch.startDate,
        batch.endDate
      ),
    }));

    return res.status(200).json({
      success: true,
      count: batchesWithStatus.length,
      data: {
        batches: batchesWithStatus,
      },
    });
  } catch (error) {
    console.error("Get batches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
    });
  }
};

// ============================================================
// GET TEACHER'S ASSIGNED BATCHES
// ============================================================

const getTeacherBatches = async (req, res) => {
  try {
    const teacherId = getUserId(req.user);

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.user?.roles?.includes("teacher")) {
      return res.status(403).json({
        success: false,
        message: "Only teachers can access this resource",
      });
    }

    if (req.user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your teacher account is not active",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    // Find only active assignments belonging to this teacher.
    const assignments = await BatchSubject.find({
      teacherId,
      status: "active",
    })
      .populate({
        path: "batchId",
        match: {
          isRemoved: { $ne: true },
        },
        select:
          "name code standard academicYear branchId startDate endDate schedule capacity description",
      })
      .populate({
        path: "subjectId",
        match: {
          status: "active",
        },
        select:
          "name code standard type description duration",
      })
      .sort({
        createdAt: -1,
      });

    const batchMap = new Map();

    // Group assigned subjects under their respective batches.
    assignments.forEach((assignment) => {
      const batch = assignment.batchId;
      const subject = assignment.subjectId;

      if (!batch || !subject) {
        return;
      }

      // Prevent access to batches belonging to another branch
      // when the teacher has an assigned branch.
      if (
        req.user.branchId &&
        String(batch.branchId) !== String(req.user.branchId)
      ) {
        return;
      }

      const batchId = batch._id.toString();

      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          ...batch.toObject(),
          subjects: [],
        });
      }

      const currentBatch = batchMap.get(batchId);

      currentBatch.subjects.push({
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        standard: subject.standard,
        type: subject.type,
        description: subject.description,
        duration: subject.duration,
      });
    });

    const batches = Array.from(batchMap.values());

    // Calculate actual active student counts.
    const batchIds = batches.map((batch) => batch._id);

    let studentCounts = [];

    if (batchIds.length > 0) {
      studentCounts = await Student.aggregate([
        {
          $match: {
            batchId: {
              $in: batchIds,
            },
            status: "active",
          },
        },
        {
          $group: {
            _id: "$batchId",
            studentCount: {
              $sum: 1,
            },
          },
        },
      ]);
    }

    const studentCountMap = new Map(
      studentCounts.map((item) => [
        item._id.toString(),
        item.studentCount,
      ])
    );

    const batchesWithDetails = batches.map((batch) => ({
      ...batch,
      studentCount:
        studentCountMap.get(batch._id.toString()) || 0,
      subjectCount: batch.subjects.length,
      status: getBatchStatus(
        batch.startDate,
        batch.endDate
      ),
    }));

    return res.status(200).json({
      success: true,
      message: "Teacher batches fetched successfully",
      count: batchesWithDetails.length,
      data: {
        batches: batchesWithDetails,
      },
    });
  } catch (error) {
    console.error("Get teacher batches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher batches",
    });
  }
};

// ============================================================
// GET SINGLE BATCH
// ============================================================

const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    const batch = await Batch.findOne({
      _id: id,
      isRemoved: { $ne: true },
    }).populate("branchId", "name code");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        batch: {
          ...batch.toObject(),
          status: getBatchStatus(
            batch.startDate,
            batch.endDate
          ),
        },
      },
    });
  } catch (error) {
    console.error("Get batch by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch batch",
    });
  }
};

// ============================================================
// UPDATE BATCH
// ============================================================

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    const {
      name,
      code,
      standard,
      academicYear,
      branchId,
      startDate,
      endDate,
      schedule,
      capacity,
      description,
    } = req.body;

    const batch = await Batch.findOne({
      _id: id,
      isRemoved: { $ne: true },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Admins can only edit batches in their branch.
    if (isAdminOnly(req.user)) {
      if (
        !req.user.branchId ||
        String(batch.branchId) !== String(req.user.branchId)
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only edit batches belonging to your branch",
        });
      }

      if (
        !branchId ||
        String(branchId) !== String(req.user.branchId)
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot move a batch to another branch",
        });
      }
    }

    if (
      !name ||
      !code ||
      !standard ||
      !academicYear ||
      !branchId ||
      !startDate ||
      !endDate ||
      !schedule?.startTime ||
      !schedule?.endTime ||
      !Array.isArray(schedule?.days) ||
      schedule.days.length === 0 ||
      capacity === undefined ||
      capacity === null
    ) {
      return res.status(400).json({
        success: false,
        message: "All required batch fields must be provided",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (branch.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign a batch to an inactive branch",
      });
    }

    const duplicateBatch = await Batch.findOne({
      code: code.toUpperCase().trim(),
      _id: { $ne: id },
    });

    if (duplicateBatch) {
      return res.status(409).json({
        success: false,
        message: "Batch code already exists",
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive whole number",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date",
      });
    }

    if (parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    batch.name = name.trim();
    batch.code = code.toUpperCase().trim();
    batch.standard = standard;
    batch.academicYear = academicYear.trim();
    batch.branchId = branchId;
    batch.startDate = parsedStartDate;
    batch.endDate = parsedEndDate;

    batch.schedule = {
      startTime: schedule.startTime.trim(),
      endTime: schedule.endTime.trim(),
      days: schedule.days,
    };

    batch.capacity = Number(capacity);
    batch.description = description?.trim() || "";

    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: {
        batch: {
          ...batch.toObject(),
          status: getBatchStatus(
            batch.startDate,
            batch.endDate
          ),
        },
      },
    });
  } catch (error) {
    console.error("Update batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update batch",
    });
  }
};

// ============================================================
// REMOVE BATCH
// ============================================================

const removeBatch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    const batch = await Batch.findOne({
      _id: id,
      isRemoved: { $ne: true },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    batch.isRemoved = true;
    batch.removedAt = new Date();

    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Batch removed successfully",
      data: {
        batchId: batch._id,
      },
    });
  } catch (error) {
    console.error("Remove batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove batch",
    });
  }
};

// ============================================================
// GET BATCHES FOR REGISTRATION — PUBLIC
// ============================================================

const getRegistrationBatches = async (req, res) => {
  try {
    const { branchId } = req.query;

    if (
      !branchId ||
      !mongoose.Types.ObjectId.isValid(branchId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid branch ID is required",
      });
    }

    const branch = await Branch.findOne({
      _id: branchId,
      status: "active",
    }).select("_id");

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found or inactive",
      });
    }

    const batches = await Batch.find({
      branchId: branch._id,
      isRemoved: { $ne: true },
    })
      .select(
        "name code standard academicYear branchId startDate endDate isRemoved"
      )
      .populate("branchId", "name code")
      .sort({
        startDate: 1,
      });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: {
        batches,
      },
    });
  } catch (error) {
    console.error("Get registration batches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registration batches",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  getRegistrationBatches,
  updateBatch,
  removeBatch,
  getTeacherBatches,
};