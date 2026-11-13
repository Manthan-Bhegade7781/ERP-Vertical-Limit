
const mongoose = require("mongoose");
const Examination = require("../models/examination.model");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const BatchSubject = require("../models/BatchSubject");
const Student = require("../models/Student");
const ExaminationResult = require("../models/examinationResult.model");

const parseExaminationDate = (value) => {
  if (!value) return null;

  // Supports DD/MM/YYYY from the current frontend form.
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

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
    return { valid: false, message: "Valid batchId and subjectId are required." };
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
    return { valid: false, message: "Batch not found or archived." };
  }

  if (!subject || subject.status !== "active") {
    return { valid: false, message: "Active subject not found." };
  }

  if (!assignment) {
    return {
      valid: false,
      message: "This subject is not actively assigned to the selected batch.",
    };
  }

  if (batch.standard !== subject.standard) {
    return {
      valid: false,
      message: "Batch and subject standards do not match.",
    };
  }

  return { valid: true, batch, subject };
};

// POST /api/examinations
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
        message: "Invalid examination date. Use DD/MM/YYYY or a valid date.",
      });
    }

    const parsedDuration = Number(durationMinutes ?? duration);

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number of minutes.",
      });
    }

    if (!validateTime(startTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time. Use a format such as 09:00 AM.",
      });
    }

    if (!validateMarks(totalMarks, passingMarks)) {
      return res.status(400).json({
        success: false,
        message: "Marks must be valid, and passing marks cannot exceed total marks.",
      });
    }

    const relation = await validateBatchSubject(batchId, subjectId);
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

    const populatedExamination = await Examination.findById(examination._id)
      .populate("batchId", "name code standard academicYear")
      .populate("subjectId", "name code standard type");

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

// GET /api/examinations
const getExaminations = async (req, res) => {
  try {
    const { batchId, subjectId, standard, status, search } = req.query;
    const filter = {};

    // If requester is a student, scope to the student's assigned batch
    if (req.user?.roles?.includes("student")) {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || !student.batchId) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
      filter.batchId = student.batchId;
    } else if (batchId) {
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
      if (!["scheduled", "completed", "cancelled", "results_published"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid examination status.",
        });
      }
      filter.status = status;
    }

    if (search?.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { examinationName: { $regex: escapedSearch, $options: "i" } },
        { examinationCode: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    let examinations = await Examination.find(filter)
      .populate("batchId", "name code standard academicYear branchId")
      .populate("subjectId", "name code standard type")
      .sort({ examinationDate: 1, startTime: 1 })
      .lean();

    if (standard) {
      examinations = examinations.filter(
        (exam) => exam.batchId?.standard === standard
      );
    }

    // Attach teacher name from active BatchSubject relation
    const batchIds = examinations.map((e) => e.batchId?._id || e.batchId).filter(Boolean);
    const subjectIds = examinations.map((e) => e.subjectId?._id || e.subjectId).filter(Boolean);
    if (batchIds.length > 0 && subjectIds.length > 0) {
      const batchSubjects = await BatchSubject.find({
        batchId: { $in: batchIds },
        subjectId: { $in: subjectIds },
        status: "active",
      }).populate("teacherId", "fullName email mobileNumber");

      const teacherMap = new Map();
      for (const bs of batchSubjects) {
        const bKey = (bs.batchId?._id || bs.batchId)?.toString();
        const sKey = (bs.subjectId?._id || bs.subjectId)?.toString();
        if (bs.teacherId?.fullName) {
          teacherMap.set(`${bKey}_${sKey}`, bs.teacherId.fullName);
        }
      }

      examinations = examinations.map((exam) => {
        const bId = (exam.batchId?._id || exam.batchId)?.toString();
        const sId = (exam.subjectId?._id || exam.subjectId)?.toString();
        const teacherName = teacherMap.get(`${bId}_${sId}`) || "Assigned Teacher";
        return {
          ...exam,
          teacher: teacherName,
        };
      });
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

// GET /api/examinations/:id
const getExaminationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination ID.",
      });
    }

    const examination = await Examination.findById(req.params.id)
      .populate("batchId", "name code standard academicYear branchId")
      .populate("subjectId", "name code standard type");

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

// PUT /api/examinations/:id
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
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.examinationName !== undefined) {
      if (!updates.examinationName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Examination name cannot be empty.",
        });
      }
      updates.examinationName = updates.examinationName.trim();
    }

    if (updates.examinationCode !== undefined) {
      if (!updates.examinationCode.trim()) {
        return res.status(400).json({
          success: false,
          message: "Examination code cannot be empty.",
        });
      }
      updates.examinationCode = updates.examinationCode.trim().toUpperCase();
    }

    const nextBatchId = updates.batchId ?? existing.batchId;
    const nextSubjectId = updates.subjectId ?? existing.subjectId;

    const relation = await validateBatchSubject(nextBatchId, nextSubjectId);
    if (!relation.valid) {
      return res.status(400).json({
        success: false,
        message: relation.message,
      });
    }

    if (updates.examinationDate !== undefined) {
      const parsedDate = parseExaminationDate(updates.examinationDate);
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
          message: "Invalid start time. Use a format such as 09:00 AM.",
        });
      }
      updates.startTime = updates.startTime.trim().toUpperCase();
    }

    if (updates.duration !== undefined && updates.durationMinutes === undefined) {
      updates.durationMinutes = updates.duration;
    }
    delete updates.duration;

    const nextDuration = updates.durationMinutes ?? existing.durationMinutes;
    if (!Number.isFinite(Number(nextDuration)) || Number(nextDuration) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number of minutes.",
      });
    }
    if (updates.durationMinutes !== undefined) {
      updates.durationMinutes = Number(updates.durationMinutes);
    }

    const nextTotal = updates.totalMarks ?? existing.totalMarks;
    const nextPassing = updates.passingMarks ?? existing.passingMarks;

    if (!validateMarks(nextTotal, nextPassing)) {
      return res.status(400).json({
        success: false,
        message: "Marks must be valid, and passing marks cannot exceed total marks.",
      });
    }

    if (updates.totalMarks !== undefined) updates.totalMarks = Number(updates.totalMarks);
    if (updates.passingMarks !== undefined) updates.passingMarks = Number(updates.passingMarks);
    if (updates.instructions !== undefined) {
      updates.instructions = updates.instructions.trim();
    }

    const examination = await Examination.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("batchId", "name code standard academicYear branchId")
      .populate("subjectId", "name code standard type");

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

// PATCH /api/examinations/:id/cancel
const cancelExamination = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination ID.",
      });
    }

    const examination = await Examination.findById(req.params.id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found.",
      });
    }

    if (examination.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled examinations can be cancelled.",
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

/**
 * PATCH /api/examinations/:id/reschedule
 * Reschedule a previously cancelled examination.
 */
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
        message: "Only cancelled examinations can be scheduled again.",
      });
    }

    // Confirm the batch and subject are still valid and assigned.
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
      .populate("batchId", "name code standard academicYear branchId")
      .populate("subjectId", "name code standard type");

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

// =====================================================
// STUDENT RESULTS & SUBMISSIONS
// =====================================================

// GET /api/examinations/my/results
const getStudentResults = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const results = await ExaminationResult.find({
      studentId: student._id,
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get student results error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student test results.",
    });
  }
};

// POST /api/examinations/my/submit
const submitTestResult = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found for logged in user.",
      });
    }

    const {
      examinationId,
      testName,
      subject,
      teacher,
      marksObtained,
      totalMarks,
      correctAnswers,
      totalQuestions,
      feedback,
    } = req.body;

    if (!testName || !subject || totalMarks === undefined || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required test submission details.",
      });
    }

    const parsedTotal = Number(totalMarks);
    const parsedObtained = Number(marksObtained);

    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total marks must be a positive number.",
      });
    }

    const percentage = Math.round((parsedObtained / parsedTotal) * 100);
    const status = percentage >= 40 ? "passed" : "failed";

    let calculatedFeedback = feedback;
    if (!calculatedFeedback) {
      if (percentage >= 90) {
        calculatedFeedback = "Outstanding performance! You have a great grasp of this topic.";
      } else if (percentage >= 75) {
        calculatedFeedback = "Good performance. Review the few questions you missed to achieve perfection.";
      } else if (percentage >= 60) {
        calculatedFeedback = "Fair attempt. Focus on revising fundamental concepts and practice regularly.";
      } else {
        calculatedFeedback = "Needs improvement. Please review lecture notes and seek help from your teacher.";
      }
    }

    const newResult = await ExaminationResult.create({
      examinationId: mongoose.isValidObjectId(examinationId) ? examinationId : undefined,
      studentId: student._id,
      userId: req.user._id,
      batchId: student.batchId,
      testName: testName.trim(),
      subject: subject.trim(),
      teacher: teacher?.trim() || "Subject Teacher",
      marksObtained: parsedObtained,
      totalMarks: parsedTotal,
      percentage,
      correctAnswers: Number(correctAnswers || 0),
      totalQuestions: Number(totalQuestions || 0),
      feedback: calculatedFeedback,
      status,
      date: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Test result recorded successfully.",
      data: newResult,
    });
  } catch (error) {
    console.error("Submit test result error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record test result.",
    });
  }
};

module.exports = {
  createExamination,
  getExaminations,
  getExaminationById,
  updateExamination,
  cancelExamination,
  rescheduleExamination,
  getStudentResults,
  submitTestResult,
};