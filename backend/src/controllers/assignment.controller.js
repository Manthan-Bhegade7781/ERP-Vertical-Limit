
const mongoose = require("mongoose");
const Assignment = require("../models/assignment.model");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const BatchSubject = require("../models/BatchSubject");

const hasRole = (user, role) =>
  Array.isArray(user?.roles) && user.roles.includes(role);

const isSuperAdmin = (user) => hasRole(user, "super_admin");

const isAdmin = (user) => hasRole(user, "admin");

const isTeacher = (user) => hasRole(user, "teacher");

const parseDate = (value) => {
  if (!value) return null;

  // Support DD/MM/YYYY from the existing frontend.
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
    return { valid: false, message: "Batch not found or archived." };
  }

  if (!subject || subject.status !== "active") {
    return { valid: false, message: "Active subject not found." };
  }

  if (!batchSubject) {
    return {
      valid: false,
      message: "The subject is not actively assigned to this batch.",
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

const canAccessBranch = (user, branchId) => {
  if (isSuperAdmin(user)) return true;

  return (
    user.branchId &&
    branchId &&
    String(user.branchId) === String(branchId)
  );
};


const canManageAssignment = async (user, assignment) => {
  if (isSuperAdmin(user)) return true;

  const branchId =
    assignment.branchId?._id || assignment.branchId;

  if (isAdmin(user)) {
    return canAccessBranch(user, branchId);
  }

  if (isTeacher(user)) {
    const batchId = assignment.batchId?._id || assignment.batchId;
    const subjectId = assignment.subjectId?._id || assignment.subjectId;

    const assigned = await BatchSubject.findOne({
      batchId,
      subjectId,
      teacherId: user._id,
      status: "active",
    });

    return Boolean(assigned);
  }

  return false;
};


const populateAssignment = (query) =>
  query
    .populate("batchId", "name code standard academicYear branchId")
    .populate("subjectId", "name code standard type")
    .populate("branchId", "name code")
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email");

// POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const {
      assignmentTitle,
      assignmentCode,
      batchId,
      subjectId,
      assignmentType,
      assignedDate,
      submissionDate,
      totalMarks,
      description,
      instructions,
    } = req.body;

    if (
      !assignmentTitle?.trim() ||
      !assignmentCode?.trim() ||
      !batchId ||
      !subjectId ||
      !assignedDate ||
      !submissionDate ||
      totalMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required assignment fields.",
      });
    }

    if (
      ![
        "homework",
        "practice_set",
        "worksheet",
        "project",
        "revision",
      ].includes(assignmentType || "homework")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment type.",
      });
    }

    const parsedAssignedDate = parseDate(assignedDate);
    const parsedSubmissionDate = parseDate(submissionDate);
    const marks = Number(totalMarks);

    if (!parsedAssignedDate || !parsedSubmissionDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date. Use DD/MM/YYYY or a valid date.",
      });
    }

    if (parsedSubmissionDate < parsedAssignedDate) {
      return res.status(400).json({
        success: false,
        message: "Submission date cannot be before the assigned date.",
      });
    }

    if (!Number.isFinite(marks) || marks < 1) {
      return res.status(400).json({
        success: false,
        message: "Total marks must be a positive number.",
      });
    }

    const relation = await getBatchSubject(batchId, subjectId);

    if (!relation.valid) {
      return res.status(400).json({
        success: false,
        message: relation.message,
      });
    }

    if (!canAccessBranch(req.user, relation.batch.branchId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot create assignments for this branch.",
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
        return res.status(403).json({
          success: false,
          message: "You can only create assignments for your assigned subjects.",
        });
      }
    } else if (!isAdmin(req.user) && !isSuperAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create assignments.",
      });
    }

    const normalizedCode = assignmentCode.trim().toUpperCase();

    const existing = await Assignment.findOne({
      assignmentCode: normalizedCode,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Assignment code already exists.",
      });
    }

    const attachment = req.file
      ? {
          fileName: req.file.originalname,
          filePath: req.file.path,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
        }
      : undefined;

    const assignment = await Assignment.create({
      assignmentTitle: assignmentTitle.trim(),
      assignmentCode: normalizedCode,
      batchId,
      subjectId,
      assignmentType: assignmentType || "homework",
      assignedDate: parsedAssignedDate,
      submissionDate: parsedSubmissionDate,
      totalMarks: marks,
      description: description?.trim() || "",
      instructions: instructions?.trim() || "",
      attachment,
      branchId: relation.batch.branchId,
      createdBy: req.user._id,
    });

    const data = await populateAssignment(
      Assignment.findById(assignment._id)
    );

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      data,
    });
  } catch (error) {
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

// GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    const { batchId, subjectId, search, assignmentType } = req.query;
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
      filter.assignmentType = assignmentType;
    }

    if (search?.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { assignmentTitle: { $regex: escaped, $options: "i" } },
        { assignmentCode: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    if (isAdmin(req.user)) {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: "Your account is not assigned to a branch.",
        });
      }
      filter.branchId = req.user.branchId;
    } else if (isTeacher(req.user) && !isSuperAdmin(req.user)) {
      const assignedRelations = await BatchSubject.find({
        teacherId: req.user._id,
        status: "active",
      }).select("batchId subjectId");

      const relationConditions = assignedRelations.map((item) => ({
        batchId: item.batchId,
        subjectId: item.subjectId,
      }));

      if (relationConditions.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      filter.$and = [
        { $or: relationConditions },
        ...(filter.$or ? [{ $or: filter.$or }] : []),
      ];

      delete filter.$or;
    } else if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view assignments.",
      });
    }

    const assignments = await populateAssignment(
      Assignment.find(filter).sort({ createdAt: -1 })
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

// GET /api/assignments/:id
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

    if (!(await canManageAssignment(req.user, assignment))) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this assignment.",
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

// PUT /api/assignments/:id
const updateAssignment = async (req, res) => {
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

    if (!(await canManageAssignment(req.user, assignment))) {
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
      if (!updates.assignmentTitle.trim()) {
        return res.status(400).json({
          success: false,
          message: "Assignment title cannot be empty.",
        });
      }
      updates.assignmentTitle = updates.assignmentTitle.trim();
    }

    if (updates.assignmentCode !== undefined) {
      if (!updates.assignmentCode.trim()) {
        return res.status(400).json({
          success: false,
          message: "Assignment code cannot be empty.",
        });
      }
      updates.assignmentCode = updates.assignmentCode.trim().toUpperCase();
    }

    if (updates.assignedDate !== undefined) {
      updates.assignedDate = parseDate(updates.assignedDate);
      if (!updates.assignedDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned date.",
        });
      }
    }

    if (updates.submissionDate !== undefined) {
      updates.submissionDate = parseDate(updates.submissionDate);
      if (!updates.submissionDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid submission date.",
        });
      }
    }

    const nextAssignedDate = updates.assignedDate || assignment.assignedDate;
    const nextSubmissionDate =
      updates.submissionDate || assignment.submissionDate;

    if (nextSubmissionDate < nextAssignedDate) {
      return res.status(400).json({
        success: false,
        message: "Submission date cannot be before the assigned date.",
      });
    }

    if (updates.totalMarks !== undefined) {
      updates.totalMarks = Number(updates.totalMarks);

      if (!Number.isFinite(updates.totalMarks) || updates.totalMarks < 1) {
        return res.status(400).json({
          success: false,
          message: "Total marks must be a positive number.",
        });
      }
    }

    if (updates.assignmentType !== undefined) {
      const allowedTypes = [
        "homework",
        "practice_set",
        "worksheet",
        "project",
        "revision",
      ];

      if (!allowedTypes.includes(updates.assignmentType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assignment type.",
        });
      }
    }

    const nextBatchId = updates.batchId || assignment.batchId;
    const nextSubjectId = updates.subjectId || assignment.subjectId;

    if (updates.batchId || updates.subjectId) {
      const relation = await getBatchSubject(nextBatchId, nextSubjectId);

      if (!relation.valid) {
        return res.status(400).json({
          success: false,
          message: relation.message,
        });
      }

      if (!canAccessBranch(req.user, relation.batch.branchId)) {
        return res.status(403).json({
          success: false,
          message: "You cannot move this assignment to another branch.",
        });
      }

      if (
        isTeacher(req.user) &&
        !isSuperAdmin(req.user)
      ) {
        const assigned = await BatchSubject.findOne({
          batchId: nextBatchId,
          subjectId: nextSubjectId,
          teacherId: req.user._id,
          status: "active",
        });

        if (!assigned) {
          return res.status(403).json({
            success: false,
            message: "You can only assign work to your assigned subjects.",
          });
        }
      }

      updates.branchId = relation.batch.branchId;
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description?.trim() || "";
    }

    if (req.body.instructions !== undefined) {
      updates.instructions = req.body.instructions?.trim() || "";
    }

    if (req.file) {
      updates.attachment = {
        fileName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      };
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
        return res.status(409).json({
          success: false,
          message: "Assignment code already exists.",
        });
      }
    }

    Object.assign(assignment, updates);
    assignment.updatedBy = req.user._id;

    await assignment.save();

    const data = await populateAssignment(
      Assignment.findById(assignment._id)
    );

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
      data,
    });
  } catch (error) {
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

// DELETE /api/assignments/:id
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

    // Teachers may create and edit their assigned work, but only admins
    // and super admins may delete assignments.
    if (
      !isSuperAdmin(req.user) &&
      !(
        isAdmin(req.user) &&
        canAccessBranch(req.user, assignment.branchId)
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Only an authorized admin can delete this assignment.",
      });
    }

    await Assignment.findByIdAndDelete(id);

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

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};
