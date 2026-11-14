const mongoose = require("mongoose");

const LectureLog = require("../models/lectureLog.model");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const BatchSubject = require("../models/BatchSubject");

// Validate MongoDB ObjectId.
const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

// Normalize date to midnight UTC.
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

// Populate lecture log references.
const populateLectureLog = (query) =>
  query
    .populate("batchId", "name code standard")
    .populate("subjectId", "name code standard")
    .populate("teacherId", "fullName email");

// Check whether user can access a batch.
const canAccessBatch = async (user, batchId) => {
  if (!user || !batchId) {
    return false;
  }

  if (user.roles.includes("super_admin")) {
    return true;
  }

  const batch = await Batch.findOne({
    _id: batchId,
    isRemoved: { $ne: true },
  });

  if (!batch) {
    return false;
  }

  if (user.roles.includes("admin")) {
    return Boolean(
      user.branchId &&
      batch.branchId.toString() === user.branchId.toString()
    );
  }

  return false;
};

// Check whether a teacher is assigned to a batch and subject.
const isTeacherAssigned = async (
  teacherId,
  batchId,
  subjectId
) => {
  return Boolean(
    await BatchSubject.exists({
      teacherId,
      batchId,
      subjectId,
      status: "active",
    })
  );
};

// =====================================================
// CREATE LECTURE LOG
// POST /api/lecture-logs
// =====================================================

const createLectureLog = async (req, res) => {
  try {
    const {
      date,
      batchId,
      subjectId,
      time,
      description,
    } = req.body;

    if (
      !date ||
      !batchId ||
      !subjectId ||
      !time ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "date, batchId, subjectId, time and description are required.",
      });
    }

    if (
      !isValidObjectId(batchId) ||
      !isValidObjectId(subjectId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid batchId or subjectId.",
      });
    }

    const normalizedDate = normalizeDate(date);

    if (!normalizedDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date.",
      });
    }

    if (
      typeof time !== "string" ||
      !time.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Time and description cannot be empty.",
      });
    }

    if (description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 2000 characters.",
      });
    }

    const [batch, subject] = await Promise.all([
      Batch.findOne({
        _id: batchId,
        isRemoved: { $ne: true },
      }),

      Subject.findById(subjectId),
    ]);

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

    // Verify teacher assignment.
    if (req.user.roles.includes("teacher")) {
      const assigned = await isTeacherAssigned(
        req.user._id,
        batchId,
        subjectId
      );

      if (!assigned) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this subject in this batch.",
        });
      }
    } else {
      const allowed = await canAccessBatch(
        req.user,
        batchId
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot create a lecture log for this batch.",
        });
      }

      const assignmentExists = await BatchSubject.exists({
        batchId,
        subjectId,
        status: "active",
      });

      if (!assignmentExists) {
        return res.status(400).json({
          success: false,
          message:
            "This subject is not assigned to the selected batch.",
        });
      }
    }

    const lectureLog = await LectureLog.create({
      date: normalizedDate,
      batchId,
      subjectId,
      teacherId: req.user._id,
      time: time.trim(),
      description: description.trim(),
    });

    const populatedLog = await populateLectureLog(
      LectureLog.findById(lectureLog._id)
    );

    return res.status(201).json({
      success: true,
      message: "Lecture log created successfully.",
      data: populatedLog,
    });
  } catch (error) {
    console.error("Create lecture log error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create lecture log.",
    });
  }
};

// =====================================================
// GET LECTURE LOGS
// GET /api/lecture-logs
// Optional filters: batchId, subjectId, date
// =====================================================

const getLectureLogs = async (req, res) => {
  try {
    const {
      batchId,
      subjectId,
      date,
    } = req.query;

    const filter = {};
    const user = req.user;

    // Validate optional IDs.
    if (batchId) {
      if (!isValidObjectId(batchId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid batchId.",
        });
      }

      filter.batchId = batchId;
    }

    if (subjectId) {
      if (!isValidObjectId(subjectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subjectId.",
        });
      }

      filter.subjectId = subjectId;
    }

    // Filter by date.
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

    // Super Admin can view all logs.
    if (user.roles.includes("super_admin")) {
      // No additional restriction.
    }

    // Admin can view logs from their branch.
    else if (user.roles.includes("admin")) {
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
    }

    // Teacher can view only their own lecture logs.
    else if (user.roles.includes("teacher")) {
      filter.teacherId = user._id;

      const assignments = await BatchSubject.find({
        teacherId: user._id,
        status: "active",
      }).select("batchId subjectId");

      const allowedPairs = assignments.filter((assignment) => {
        const matchesBatch =
          !batchId ||
          assignment.batchId.toString() === batchId;

        const matchesSubject =
          !subjectId ||
          assignment.subjectId.toString() === subjectId;

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
        message: "You are not authorized to view lecture logs.",
      });
    }

    const records = await populateLectureLog(
      LectureLog.find(filter).sort({
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
    console.error("Get lecture logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lecture logs.",
    });
  }
};

// =====================================================
// GET LECTURE LOG BY ID
// GET /api/lecture-logs/:id
// =====================================================

const getLectureLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture log ID.",
      });
    }

    const log = await LectureLog.findById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Lecture log not found.",
      });
    }

    const user = req.user;
    let allowed = false;

    if (user.roles.includes("super_admin")) {
      allowed = true;
    } else if (user.roles.includes("teacher")) {
      allowed =
        log.teacherId.toString() === user._id.toString() &&
        await isTeacherAssigned(
          user._id,
          log.batchId,
          log.subjectId
        );
    } else if (user.roles.includes("admin")) {
      allowed = await canAccessBatch(
        user,
        log.batchId
      );
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this lecture log.",
      });
    }

    const populatedLog = await populateLectureLog(
      LectureLog.findById(id)
    );

    return res.status(200).json({
      success: true,
      data: populatedLog,
    });
  } catch (error) {
    console.error("Get lecture log by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lecture log.",
    });
  }
};

// =====================================================
// UPDATE LECTURE LOG
// PUT /api/lecture-logs/:id
// =====================================================

const updateLectureLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lecture log ID.",
      });
    }

    const log = await LectureLog.findById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Lecture log not found.",
      });
    }

    const user = req.user;
    let allowed = false;

    if (user.roles.includes("super_admin")) {
      allowed = true;
    } else if (user.roles.includes("teacher")) {
      allowed =
        log.teacherId.toString() === user._id.toString() &&
        await isTeacherAssigned(
          user._id,
          log.batchId,
          log.subjectId
        );
    } else if (user.roles.includes("admin")) {
      allowed = await canAccessBatch(
        user,
        log.batchId
      );
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this lecture log.",
      });
    }

    const updates = {};

    if (req.body.date !== undefined) {
      const normalizedDate = normalizeDate(req.body.date);

      if (!normalizedDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid date.",
        });
      }

      updates.date = normalizedDate;
    }

    if (req.body.time !== undefined) {
      if (
        typeof req.body.time !== "string" ||
        !req.body.time.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Time cannot be empty.",
        });
      }

      updates.time = req.body.time.trim();
    }

    if (req.body.description !== undefined) {
      if (
        typeof req.body.description !== "string" ||
        !req.body.description.trim() ||
        req.body.description.trim().length > 2000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Description must contain 1 to 2000 characters.",
        });
      }

      updates.description = req.body.description.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    Object.assign(log, updates);

    await log.save();

    const populatedLog = await populateLectureLog(
      LectureLog.findById(log._id)
    );

    return res.status(200).json({
      success: true,
      message: "Lecture log updated successfully.",
      data: populatedLog,
    });
  } catch (error) {
    console.error("Update lecture log error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update lecture log.",
    });
  }
};

module.exports = {
  createLectureLog,
  getLectureLogs,
  getLectureLogById,
  updateLectureLog,
};