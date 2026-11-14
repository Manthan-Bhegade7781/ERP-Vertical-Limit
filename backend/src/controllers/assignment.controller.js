const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Assignment = require("../models/assignment.model");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const BatchSubject = require("../models/BatchSubject");
const Student = require("../models/Student");

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "assignments"
);

// ============================================================
// ROLE HELPERS
// ============================================================

const hasRole = (user, role) =>
  Array.isArray(user?.roles) && user.roles.includes(role);

const isSuperAdmin = (user) => hasRole(user, "super_admin");
const isAdmin = (user) => hasRole(user, "admin");
const isTeacher = (user) => hasRole(user, "teacher");
const isStudent = (user) => hasRole(user, "student");

// ============================================================
// COMMON HELPERS
// ============================================================

const parseDate = (value) => {
  if (!value) return null;

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

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ============================================================
// VALIDATE BATCH AND SUBJECT
// ============================================================

const getBatchSubject = async (batchId, subjectId) => {
  if (
    !mongoose.isValidObjectId(batchId) ||
    !mongoose.isValidObjectId(subjectId)
  ) {
    return {
      valid: false,
      message: "Valid batchId and subjectId are required.",
    };
  }

  const [batch, subject, batchSubject] = await Promise.all([
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

  if (!batchSubject) {
    return {
      valid: false,
      message:
        "The subject is not actively assigned to this batch.",
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
// BRANCH ACCESS
// ============================================================

const canAccessBranch = (user, branchId) => {
  if (isSuperAdmin(user)) return true;

  return Boolean(
    user?.branchId &&
      branchId &&
      String(user.branchId?._id || user.branchId) ===
        String(branchId?._id || branchId)
  );
};

// ============================================================
// ASSIGNMENT ACCESS CONTROL
// ============================================================

const canManageAssignment = async (user, assignment) => {
  if (isSuperAdmin(user)) return true;

  const branchId =
    assignment.branchId?._id || assignment.branchId;

  if (isAdmin(user)) {
    return canAccessBranch(user, branchId);
  }

  if (isTeacher(user)) {
    const batchId =
      assignment.batchId?._id || assignment.batchId;

    const subjectId =
      assignment.subjectId?._id || assignment.subjectId;

    const assigned = await BatchSubject.findOne({
      batchId,
      subjectId,
      teacherId: user._id,
      status: "active",
    });

    return Boolean(assigned);
  }

  if (isStudent(user)) {
    const student = await Student.findOne({ userId: user._id });
    if (!student || !student.batchId) return false;
    const batchId = assignment.batchId?._id || assignment.batchId;
    return student.batchId.toString() === batchId.toString();
  }

  return false;
};

// ============================================================
// POPULATE ASSIGNMENT
// ============================================================

const populateAssignment = (query) =>
  query
    .populate(
      "batchId",
      "name code standard academicYear branchId"
    )
    .populate(
      "subjectId",
      "name code standard type"
    )
    .populate(
      "branchId",
      "name code"
    )
    .populate(
      "createdBy",
      "fullName email"
    )
    .populate(
      "updatedBy",
      "fullName email"
    );

// ============================================================
// ATTACHMENT HELPERS
// ============================================================

const getAttachmentMetadata = (file) => {
  if (!file) return undefined;

  return {
    fileName: path.basename(
      file.originalname || "assignment.pdf"
    ),

    filePath: path.posix.join(
      "assignments",
      file.filename
    ),

    mimeType: "application/pdf",
    fileSize: file.size,
  };
};

const resolveStoredAttachment = (storedPath) => {
  if (!storedPath || typeof storedPath !== "string") {
    return null;
  }

  const filename = path.basename(storedPath);

  if (
    !filename ||
    filename === "." ||
    filename === ".."
  ) {
    return null;
  }

  const resolved = path.resolve(
    UPLOAD_DIR,
    filename
  );

  if (path.dirname(resolved) !== UPLOAD_DIR) {
    return null;
  }

  return resolved;
};

const removeAttachmentFile = async (storedPath) => {
  const filePath = resolveStoredAttachment(storedPath);

  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "Failed to remove assignment attachment:",
        error
      );
    }
  }
};

const removeUploadedFile = async (file) => {
  if (!file?.path) return;

  try {
    await fs.promises.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "Failed to remove rejected upload:",
        error
      );
    }
  }
};

// ============================================================
// VALIDATE ASSIGNMENT TYPE
// ============================================================

const validateAssignmentType = (type) =>
  [
    "homework",
    "practice_set",
    "worksheet",
    "project",
    "revision",
  ].includes(type);

// ============================================================
// CREATE ASSIGNMENT
// POST /api/assignments
// ============================================================

const createAssignment = async (req, res) => {
  let createdAssignment;

  try {
    const {
      assignmentTitle,
      assignmentCode,
      batchId,
      subjectId,
      assignmentType = "homework",
      assignedDate,
      submissionDate,
      totalMarks,
      description,
      instructions,
    } = req.body;

    if (
      typeof assignmentTitle !== "string" ||
      !assignmentTitle.trim() ||
      typeof assignmentCode !== "string" ||
      !assignmentCode.trim() ||
      !batchId ||
      !subjectId ||
      !assignedDate ||
      !submissionDate ||
      totalMarks === undefined
    ) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Please provide all required assignment fields.",
      });
    }

    if (!validateAssignmentType(assignmentType)) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Invalid assignment type.",
      });
    }

    const parsedAssignedDate = parseDate(assignedDate);
    const parsedSubmissionDate = parseDate(submissionDate);
    const marks = Number(totalMarks);

    if (
      !parsedAssignedDate ||
      !parsedSubmissionDate
    ) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Invalid date. Use DD/MM/YYYY or a valid date.",
      });
    }

    if (parsedSubmissionDate < parsedAssignedDate) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Submission date cannot be before the assigned date.",
      });
    }

    if (!Number.isFinite(marks) || marks < 1) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Total marks must be a positive number.",
      });
    }

    const relation = await getBatchSubject(
      batchId,
      subjectId
    );

    if (!relation.valid) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: relation.message,
      });
    }

    if (
      !canAccessBranch(
        req.user,
        relation.batch.branchId
      )
    ) {
      await removeUploadedFile(req.file);

      return res.status(403).json({
        success: false,
        message:
          "You cannot create assignments for this branch.",
      });
    }

    if (isTeacher(req.user)) {
      const assigned = await BatchSubject.findOne({
        batchId,
        subjectId,
        teacherId: req.user._id,
        status: "active",
      });

      if (!assigned) {
        await removeUploadedFile(req.file);

        return res.status(403).json({
          success: false,
          message:
            "You can only create assignments for your assigned subjects.",
        });
      }
    } else if (
      !isAdmin(req.user) &&
      !isSuperAdmin(req.user)
    ) {
      await removeUploadedFile(req.file);

      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create assignments.",
      });
    }

    const normalizedCode = assignmentCode
      .trim()
      .toUpperCase();

    const existing = await Assignment.findOne({
      assignmentCode: normalizedCode,
    });

    if (existing) {
      await removeUploadedFile(req.file);

      return res.status(409).json({
        success: false,
        message: "Assignment code already exists.",
      });
    }

    createdAssignment = await Assignment.create({
      assignmentTitle: assignmentTitle.trim(),
      assignmentCode: normalizedCode,
      batchId,
      subjectId,
      assignmentType,
      assignedDate: parsedAssignedDate,
      submissionDate: parsedSubmissionDate,
      totalMarks: marks,

      description:
        typeof description === "string"
          ? description.trim()
          : "",

      instructions:
        typeof instructions === "string"
          ? instructions.trim()
          : "",

      attachment: getAttachmentMetadata(req.file),

      branchId: relation.batch.branchId,
      createdBy: req.user._id,
    });

    const data = await populateAssignment(
      Assignment.findById(createdAssignment._id)
    );

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      data,
    });
  } catch (error) {
    if (req.file && !createdAssignment) {
      await removeUploadedFile(req.file);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Assignment code already exists.",
      });
    }

    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment.",
    });
  }
};

// ============================================================
// GET ASSIGNMENTS
// GET /api/assignments
// ============================================================

const getAssignments = async (req, res) => {
  try {
    const {
      batchId,
      subjectId,
      search,
      assignmentType,
    } = req.query;

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

    if (assignmentType) {
      if (!validateAssignmentType(assignmentType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assignment type.",
        });
      }

      filter.assignmentType = assignmentType;
    }

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      const escaped = escapeRegex(search.trim());

      filter.$or = [
        {
          assignmentTitle: {
            $regex: escaped,
            $options: "i",
          },
        },
        {
          assignmentCode: {
            $regex: escaped,
            $options: "i",
          },
        },
        {
          description: {
            $regex: escaped,
            $options: "i",
          },
        },
      ];
    }

    // ADMIN: branch-specific assignments
    if (isAdmin(req.user) && !isSuperAdmin(req.user)) {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is not assigned to a branch.",
        });
      }

      filter.branchId = req.user.branchId;
    }

    // TEACHER: only assigned batch-subject combinations
    else if (
      isTeacher(req.user) &&
      !isSuperAdmin(req.user)
    ) {
      const assignedRelations = await BatchSubject.find({
        teacherId: req.user._id,
        status: "active",
      }).select("batchId subjectId");

      const relationConditions = assignedRelations.map(
        (item) => ({
          batchId: item.batchId,
          subjectId: item.subjectId,
        })
      );

      if (relationConditions.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      const otherConditions = { ...filter };

      delete otherConditions.$or;

      filter.$and = [
        {
          $or: relationConditions,
        },
        otherConditions,
        ...(filter.$or
          ? [{ $or: filter.$or }]
          : []),
      ];

      delete filter.batchId;
      delete filter.subjectId;
      delete filter.$or;
    } else if (isStudent(req.user) && !isSuperAdmin(req.user)) {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || !student.batchId) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
      filter.batchId = student.batchId;
    } else if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view assignments.",
      });
    }

    const assignments = await populateAssignment(
      Assignment.find(filter).sort({
        createdAt: -1,
      })
    );

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments.",
    });
  }
};

// ============================================================
// GET ASSIGNMENT BY ID
// GET /api/assignments/:id
// ============================================================

const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await populateAssignment(
      Assignment.findById(id)
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    if (
      !(await canManageAssignment(
        req.user,
        assignment
      ))
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this assignment.",
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment.",
    });
  }
};
// ============================================================
// UPDATE ASSIGNMENT
// PUT /api/assignments/:id
// ============================================================

const updateAssignment = async (req, res) => {
  let saved = false;

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      await removeUploadedFile(req.file);

      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    if (!(await canManageAssignment(req.user, assignment))) {
      await removeUploadedFile(req.file);

      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this assignment.",
      });
    }

    const allowedFields = [
      "assignmentTitle",
      "assignmentCode",
      "batchId",
      "subjectId",
      "assignmentType",
      "assignedDate",
      "submissionDate",
      "totalMarks",
      "description",
      "instructions",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.assignmentTitle !== undefined) {
      if (
        typeof updates.assignmentTitle !== "string" ||
        !updates.assignmentTitle.trim()
      ) {
        await removeUploadedFile(req.file);

        return res.status(400).json({
          success: false,
          message: "Assignment title cannot be empty.",
        });
      }

      updates.assignmentTitle =
        updates.assignmentTitle.trim();
    }

    if (updates.assignmentCode !== undefined) {
      if (
        typeof updates.assignmentCode !== "string" ||
        !updates.assignmentCode.trim()
      ) {
        await removeUploadedFile(req.file);

        return res.status(400).json({
          success: false,
          message: "Assignment code cannot be empty.",
        });
      }

      updates.assignmentCode =
        updates.assignmentCode.trim().toUpperCase();
    }

    if (updates.assignedDate !== undefined) {
      updates.assignedDate = parseDate(
        updates.assignedDate
      );

      if (!updates.assignedDate) {
        await removeUploadedFile(req.file);

        return res.status(400).json({
          success: false,
          message: "Invalid assigned date.",
        });
      }
    }

    if (updates.submissionDate !== undefined) {
      updates.submissionDate = parseDate(
        updates.submissionDate
      );

      if (!updates.submissionDate) {
        await removeUploadedFile(req.file);

        return res.status(400).json({
          success: false,
          message: "Invalid submission date.",
        });
      }
    }

    const nextAssignedDate =
      updates.assignedDate || assignment.assignedDate;

    const nextSubmissionDate =
      updates.submissionDate || assignment.submissionDate;

    if (nextSubmissionDate < nextAssignedDate) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Submission date cannot be before the assigned date.",
      });
    }

    if (updates.totalMarks !== undefined) {
      updates.totalMarks = Number(updates.totalMarks);

      if (
        !Number.isFinite(updates.totalMarks) ||
        updates.totalMarks < 1
      ) {
        await removeUploadedFile(req.file);

        return res.status(400).json({
          success: false,
          message: "Total marks must be a positive number.",
        });
      }
    }

    if (
      updates.assignmentType !== undefined &&
      !validateAssignmentType(updates.assignmentType)
    ) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Invalid assignment type.",
      });
    }

    const nextBatchId =
      updates.batchId || assignment.batchId;

    const nextSubjectId =
      updates.subjectId || assignment.subjectId;

    if (updates.batchId || updates.subjectId) {
      const relation = await getBatchSubject(
        nextBatchId,
        nextSubjectId
      );

      if (!relation.valid) {
        await removeUploadedFile(req.file);

        return res.status(400).json({
          success: false,
          message: relation.message,
        });
      }

      if (
        !canAccessBranch(
          req.user,
          relation.batch.branchId
        )
      ) {
        await removeUploadedFile(req.file);

        return res.status(403).json({
          success: false,
          message:
            "You cannot move this assignment to another branch.",
        });
      }

      if (isTeacher(req.user) && !isSuperAdmin(req.user)) {
        const assigned = await BatchSubject.findOne({
          batchId: nextBatchId,
          subjectId: nextSubjectId,
          teacherId: req.user._id,
          status: "active",
        });

        if (!assigned) {
          await removeUploadedFile(req.file);

          return res.status(403).json({
            success: false,
            message:
              "You can only assign work to your assigned subjects.",
          });
        }
      }

      updates.branchId = relation.batch.branchId;
    }

    if (updates.description !== undefined) {
      updates.description =
        typeof updates.description === "string"
          ? updates.description.trim()
          : "";
    }

    if (updates.instructions !== undefined) {
      updates.instructions =
        typeof updates.instructions === "string"
          ? updates.instructions.trim()
          : "";
    }

    if (
      updates.assignmentCode &&
      updates.assignmentCode !== assignment.assignmentCode
    ) {
      const duplicate = await Assignment.findOne({
        assignmentCode: updates.assignmentCode,
        _id: { $ne: assignment._id },
      });

      if (duplicate) {
        await removeUploadedFile(req.file);

        return res.status(409).json({
          success: false,
          message: "Assignment code already exists.",
        });
      }
    }

    const previousAttachmentPath =
      assignment.attachment?.filePath;

    if (req.file) {
      updates.attachment = getAttachmentMetadata(req.file);
    }

    Object.assign(assignment, updates);

    assignment.updatedBy = req.user._id;

    await assignment.save();
    saved = true;

    if (req.file && previousAttachmentPath) {
      await removeAttachmentFile(previousAttachmentPath);
    }

    const data = await populateAssignment(
      Assignment.findById(assignment._id)
    );

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
      data,
    });
  } catch (error) {
    if (req.file && !saved) {
      await removeUploadedFile(req.file);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Assignment code already exists.",
      });
    }

    console.error("Update assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update assignment.",
    });
  }
};

// ============================================================
// DELETE ASSIGNMENT
// DELETE /api/assignments/:id
// ============================================================

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    if (
      !isSuperAdmin(req.user) &&
      !(
        isAdmin(req.user) &&
        canAccessBranch(req.user, assignment.branchId)
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only an authorized admin can delete this assignment.",
      });
    }

    const attachmentPath =
      assignment.attachment?.filePath;

    await Assignment.findByIdAndDelete(id);

    await removeAttachmentFile(attachmentPath);

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete assignment.",
    });
  }
};

// ============================================================
// DOWNLOAD ASSIGNMENT ATTACHMENT
// GET /api/assignments/:id/attachment
// ============================================================

const downloadAssignmentAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // Check access before allowing attachment download.
    if (!(await canManageAssignment(req.user, assignment))) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this attachment.",
      });
    }

    const filePath = resolveStoredAttachment(
      assignment.attachment?.filePath
    );

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Attachment file not found.",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.download(
      filePath,
      path.basename(
        assignment.attachment.fileName || "assignment.pdf"
      )
    );
  } catch (error) {
    console.error(
      "Download assignment PDF error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to download attachment.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  downloadAssignmentAttachment,
};