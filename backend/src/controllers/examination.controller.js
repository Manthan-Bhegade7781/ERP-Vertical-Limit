const mongoose = require("mongoose");

const Examination = require("../models/examination.model");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const BatchSubject = require("../models/BatchSubject");

// ============================================================
// COMMON HELPERS
// ============================================================

const parseExaminationDate = (value) => {
  if (!value) return null;

  // Supports DD/MM/YYYY from the current frontend form.
  if (
    typeof value === "string" &&
    /^\d{2}\/\d{2}\/\d{4}$/.test(value)
  ) {
    const [day, month, year] = value.split("/").map(Number);

    const date = new Date(
      Date.UTC(year, month - 1, day)
    );

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const validateMarks = (totalMarks, passingMarks) => {
  const total = Number(totalMarks);
  const passing = Number(passingMarks);

  if (
    !Number.isFinite(total) ||
    !Number.isFinite(passing) ||
    total <= 0 ||
    passing < 0 ||
    passing > total
  ) {
    return false;
  }

  return true;
};

const validateTime = (value) => {
  if (typeof value !== "string") return false;

  return /^(?:(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM)|(?:[01]\d|2[0-3]):[0-5]\d)$/i.test(
    value.trim()
  );
};

const validateBatchSubject = async (batchId, subjectId) => {
  if (
    !mongoose.isValidObjectId(batchId) ||
    !mongoose.isValidObjectId(subjectId)
  ) {
    return {
      valid: false,
      message: "Valid batchId and subjectId are required.",
    };
  }

  const [batch, subject, assignment] = await Promise.all([
    Batch.findById(batchId),

    Subject.findById(subjectId),

    BatchSubject.findOne({
      batchId,
      subjectId,
      status: "active",
    }),
  ]);

  if (!batch || batch.isRemoved) {
    return {
      valid: false,
      message: "Batch not found or archived.",
    };
  }

  if (!subject || subject.status !== "active") {
    return {
      valid: false,
      message: "Active subject not found.",
    };
  }

  if (!assignment) {
    return {
      valid: false,
      message:
        "This subject is not actively assigned to the selected batch.",
    };
  }

  if (batch.standard !== subject.standard) {
    return {
      valid: false,
      message: "Batch and subject standards do not match.",
    };
  }

  return {
    valid: true,
    batch,
    subject,
  };
};

// ============================================================
// CREATE EXAMINATION
// POST /api/examinations
// ============================================================

const createExamination = async (req, res) => {
  try {
    const {
      examinationName,
      examinationCode,
      batchId,
      subjectId,
      examinationDate,
      startTime,
      durationMinutes,
      duration,
      totalMarks,
      passingMarks,
      instructions,
    } = req.body;

    if (
      !examinationName?.trim() ||
      !examinationCode?.trim() ||
      !batchId ||
      !subjectId ||
      !examinationDate ||
      !startTime ||
      (durationMinutes === undefined && duration === undefined) ||
      totalMarks === undefined ||
      passingMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required examination fields.",
      });
    }

    const parsedDate = parseExaminationDate(examinationDate);

    if (!parsedDate) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid examination date. Use DD/MM/YYYY or a valid date.",
      });
    }

    const parsedDuration = Number(
      durationMinutes ?? duration
    );

    if (
      !Number.isFinite(parsedDuration) ||
      parsedDuration <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number of minutes.",
      });
    }

    if (!validateTime(startTime)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid start time. Use a format such as 09:00 AM.",
      });
    }

    if (!validateMarks(totalMarks, passingMarks)) {
      return res.status(400).json({
        success: false,
        message:
          "Marks must be valid, and passing marks cannot exceed total marks.",
      });
    }

    const relation = await validateBatchSubject(
      batchId,
      subjectId
    );

    if (!relation.valid) {
      return res.status(400).json({
        success: false,
        message: relation.message,
      });
    }

    const examination = await Examination.create({
      examinationName: examinationName.trim(),
      examinationCode: examinationCode.trim().toUpperCase(),
      batchId,
      subjectId,
      examinationDate: parsedDate,
      startTime: startTime.trim().toUpperCase(),
      durationMinutes: parsedDuration,
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      instructions: instructions?.trim() || "",
    });

    const populatedExamination = await Examination.findById(
      examination._id
    )
      .populate(
        "batchId",
        "name code standard academicYear"
      )
      .populate(
        "subjectId",
        "name code standard type"
      );

    return res.status(201).json({
      success: true,
      message: "Examination created successfully.",
      data: populatedExamination,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Examination code already exists.",
      });
    }

    console.error("Create examination error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create examination.",
    });
  }
};

// ============================================================
// GET EXAMINATIONS
// GET /api/examinations
// ============================================================

const getExaminations = async (req, res) => {
  try {
    const {
      batchId,
      subjectId,
      standard,
      status,
      search,
    } = req.query;

    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : [];

    const isTeacher = userRoles.includes("teacher");
    const isAdmin = userRoles.includes("admin");
    const isSuperAdmin = userRoles.includes("super_admin");

    if (!isTeacher && !isAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view examinations.",
      });
    }

    // Requested filters.
    const filter = {};

    if (batchId) {
      if (!mongoose.isValidObjectId(batchId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid batchId.",
        });
      }

      filter.batchId = batchId;
    }

    if (subjectId) {
      if (!mongoose.isValidObjectId(subjectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subjectId.",
        });
      }

      filter.subjectId = subjectId;
    }

    if (status) {
      const allowedStatuses = [
        "scheduled",
        "completed",
        "cancelled",
        "results_published",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid examination status.",
        });
      }

      filter.status = status;
    }

    if (typeof search === "string" && search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        {
          examinationName: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          examinationCode: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    let finalFilter = filter;

    // --------------------------------------------------------
    // TEACHER-SPECIFIC ACCESS CONTROL
    // --------------------------------------------------------

    if (isTeacher && !isAdmin && !isSuperAdmin) {
      // BatchSubject.teacherId references the authenticated
      // User ID in the existing assignment implementation.
      const assignedRelations = await BatchSubject.find({
        teacherId: req.user._id,
        status: "active",
      }).select("batchId subjectId");

      const relationConditions = assignedRelations.map(
        (relation) => ({
          batchId: relation.batchId,
          subjectId: relation.subjectId,
        })
      );

      // Teacher has no active assignments.
      if (relationConditions.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      // IMPORTANT:
      // Combine teacher restrictions and requested filters
      // using $and. This prevents search $or filters from
      // overriding the teacher's access restriction.
      finalFilter = {
        $and: [
          {
            $or: relationConditions,
          },
          filter,
        ],
      };
    }

    let examinations = await Examination.find(finalFilter)
      .populate(
        "batchId",
        "name code standard academicYear branchId"
      )
      .populate(
        "subjectId",
        "name code standard type"
      )
      .sort({
        examinationDate: 1,
        startTime: 1,
      });

    // Preserve the existing standard filter.
    if (standard) {
      examinations = examinations.filter(
        (exam) => exam.batchId?.standard === standard
      );
    }

    return res.status(200).json({
      success: true,
      count: examinations.length,
      data: examinations,
    });
  } catch (error) {
    console.error("Get examinations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch examinations.",
    });
  }
};
// ============================================================
// GET EXAMINATION BY ID
// GET /api/examinations/:id
// ============================================================

const getExaminationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination ID.",
      });
    }

    const examination = await Examination.findById(req.params.id)
      .populate(
        "batchId",
        "name code standard academicYear branchId"
      )
      .populate(
        "subjectId",
        "name code standard type"
      );

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: examination,
    });
  } catch (error) {
    console.error("Get examination error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch examination.",
    });
  }
};

// ============================================================
// UPDATE EXAMINATION
// PUT /api/examinations/:id
// ============================================================

const updateExamination = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination ID.",
      });
    }

    const existing = await Examination.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Examination not found.",
      });
    }

    if (existing.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled examinations can be updated.",
      });
    }

    const allowedFields = [
      "examinationName",
      "examinationCode",
      "batchId",
      "subjectId",
      "examinationDate",
      "startTime",
      "durationMinutes",
      "duration",
      "totalMarks",
      "passingMarks",
      "instructions",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.examinationName !== undefined) {
      if (!updates.examinationName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Examination name cannot be empty.",
        });
      }

      updates.examinationName =
        updates.examinationName.trim();
    }

    if (updates.examinationCode !== undefined) {
      if (!updates.examinationCode.trim()) {
        return res.status(400).json({
          success: false,
          message: "Examination code cannot be empty.",
        });
      }

      updates.examinationCode =
        updates.examinationCode.trim().toUpperCase();
    }

    const nextBatchId =
      updates.batchId ?? existing.batchId;

    const nextSubjectId =
      updates.subjectId ?? existing.subjectId;

    const relation = await validateBatchSubject(
      nextBatchId,
      nextSubjectId
    );

    if (!relation.valid) {
      return res.status(400).json({
        success: false,
        message: relation.message,
      });
    }

    if (updates.examinationDate !== undefined) {
      const parsedDate = parseExaminationDate(
        updates.examinationDate
      );

      if (!parsedDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid examination date.",
        });
      }

      updates.examinationDate = parsedDate;
    }

    if (updates.startTime !== undefined) {
      if (!validateTime(updates.startTime)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid start time. Use a format such as 09:00 AM.",
        });
      }

      updates.startTime =
        updates.startTime.trim().toUpperCase();
    }

    if (
      updates.duration !== undefined &&
      updates.durationMinutes === undefined
    ) {
      updates.durationMinutes = updates.duration;
    }

    delete updates.duration;

    const nextDuration =
      updates.durationMinutes ?? existing.durationMinutes;

    if (
      !Number.isFinite(Number(nextDuration)) ||
      Number(nextDuration) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number of minutes.",
      });
    }

    if (updates.durationMinutes !== undefined) {
      updates.durationMinutes =
        Number(updates.durationMinutes);
    }

    const nextTotal =
      updates.totalMarks ?? existing.totalMarks;

    const nextPassing =
      updates.passingMarks ?? existing.passingMarks;

    if (!validateMarks(nextTotal, nextPassing)) {
      return res.status(400).json({
        success: false,
        message:
          "Marks must be valid, and passing marks cannot exceed total marks.",
      });
    }

    if (updates.totalMarks !== undefined) {
      updates.totalMarks = Number(updates.totalMarks);
    }

    if (updates.passingMarks !== undefined) {
      updates.passingMarks = Number(updates.passingMarks);
    }

    if (updates.instructions !== undefined) {
      updates.instructions = updates.instructions.trim();
    }

    const examination = await Examination.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "batchId",
        "name code standard academicYear branchId"
      )
      .populate(
        "subjectId",
        "name code standard type"
      );

    return res.status(200).json({
      success: true,
      message: "Examination updated successfully.",
      data: examination,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Examination code already exists.",
      });
    }

    console.error("Update examination error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update examination.",
    });
  }
};

// ============================================================
// CANCEL EXAMINATION
// PATCH /api/examinations/:id/cancel
// ============================================================

const cancelExamination = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination ID.",
      });
    }

    const examination = await Examination.findById(
      req.params.id
    );

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found.",
      });
    }

    if (examination.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message:
          "Only scheduled examinations can be cancelled.",
      });
    }

    examination.status = "cancelled";

    await examination.save();

    return res.status(200).json({
      success: true,
      message: "Examination cancelled successfully.",
      data: examination,
    });
  } catch (error) {
    console.error("Cancel examination error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel examination.",
    });
  }
};

// ============================================================
// RESCHEDULE EXAMINATION
// PATCH /api/examinations/:id/reschedule
// ============================================================

const rescheduleExamination = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination ID.",
      });
    }

    const examination = await Examination.findById(id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found.",
      });
    }

    if (examination.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Only cancelled examinations can be scheduled again.",
      });
    }

    const relation = await validateBatchSubject(
      examination.batchId,
      examination.subjectId
    );

    if (!relation.valid) {
      return res.status(400).json({
        success: false,
        message: relation.message,
      });
    }

    examination.status = "scheduled";

    await examination.save();

    const updatedExamination = await Examination.findById(id)
      .populate(
        "batchId",
        "name code standard academicYear branchId"
      )
      .populate(
        "subjectId",
        "name code standard type"
      );

    return res.status(200).json({
      success: true,
      message: "Examination scheduled again successfully.",
      data: updatedExamination,
    });
  } catch (error) {
    console.error("Reschedule examination error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to schedule examination again.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createExamination,
  getExaminations,
  getExaminationById,
  updateExamination,
  cancelExamination,
  rescheduleExamination,
};