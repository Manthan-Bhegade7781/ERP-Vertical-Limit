const mongoose = require("mongoose");

const BatchSubject = require("../models/BatchSubject");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const User = require("../models/User");

const isAdminOnly = (user) =>
  Boolean(
    user?.roles?.includes("admin") &&
    !user?.roles?.includes("super_admin")
  );

const getUserId = (user) => user?._id || user?.id;

const sameId = (left, right) =>
  Boolean(
    left &&
    right &&
    String(left) === String(right)
  );

const validObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

// ============================================================
// GET BATCH FOR USER
// ============================================================

const getBatchForUser = async (batchId, user) => {
  if (!validObjectId(batchId)) {
    return { error: "invalid" };
  }

  const batch = await Batch.findOne({
    _id: batchId,
    isRemoved: { $ne: true },
  });

  if (!batch) {
    return { error: "not_found" };
  }

  if (
    isAdminOnly(user) &&
    (
      !user.branchId ||
      !sameId(batch.branchId, user.branchId)
    )
  ) {
    return { error: "forbidden" };
  }

  return { batch };
};

// ============================================================
// HANDLE BATCH ACCESS ERRORS
// ============================================================

const respondBatchAccessError = (res, error) => {
  if (error === "invalid") {
    return res.status(400).json({
      success: false,
      message: "Invalid batch ID",
    });
  }

  if (error === "not_found") {
    return res.status(404).json({
      success: false,
      message: "Batch not found",
    });
  }

  if (error === "forbidden") {
    return res.status(403).json({
      success: false,
      message: "You can only manage batches belonging to your branch",
    });
  }

  return null;
};

// ============================================================
// VALIDATE TEACHER FOR BATCH
// ============================================================

const getTeacherForBatch = async (
  teacherId,
  batch,
  user
) => {
  if (!validObjectId(teacherId)) {
    return { error: "invalid" };
  }

  const teacher = await User.findById(teacherId);

  if (
    !teacher ||
    !teacher.roles?.includes("teacher") ||
    teacher.status !== "active"
  ) {
    return { error: "invalid_teacher" };
  }

  // Admin assignments require a matching branch.
  if (isAdminOnly(user)) {
    if (
      !user.branchId ||
      !sameId(batch.branchId, user.branchId) ||
      !sameId(teacher.branchId, batch.branchId)
    ) {
      return { error: "forbidden_teacher" };
    }
  } else if (
    teacher.branchId &&
    batch.branchId &&
    !sameId(teacher.branchId, batch.branchId)
  ) {
    return { error: "forbidden_teacher" };
  }

  return { teacher };
};

// ============================================================
// ASSIGN SUBJECT TO BATCH
// Admin and Super Admin
// ============================================================

const assignSubjectToBatch = async (req, res) => {
  try {
    const {
      batchId,
      subjectId,
      teacherId,
    } = req.body;

    if (!batchId || !subjectId || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "Batch, subject and teacher are required",
      });
    }

    const batchResult = await getBatchForUser(
      batchId,
      req.user
    );

    if (batchResult.error) {
      return respondBatchAccessError(
        res,
        batchResult.error
      );
    }

    const { batch } = batchResult;

    if (!validObjectId(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    if (subject.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign an inactive subject",
      });
    }

    const teacherResult = await getTeacherForBatch(
      teacherId,
      batch,
      req.user
    );

    if (teacherResult.error === "invalid") {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    if (teacherResult.error === "invalid_teacher") {
      return res.status(400).json({
        success: false,
        message: "An active teacher account is required",
      });
    }

    if (teacherResult.error === "forbidden_teacher") {
      return res.status(403).json({
        success: false,
        message: "Teacher and batch must belong to the same branch",
      });
    }

    const existingAssignment = await BatchSubject.findOne({
      batchId,
      subjectId,
    });

    if (existingAssignment) {
      if (existingAssignment.status === "inactive") {
        existingAssignment.teacherId = teacherId;
        existingAssignment.status = "active";

        await existingAssignment.save();

        return res.status(200).json({
          success: true,
          message: "Subject assignment reactivated successfully",
          data: {
            batchSubject: existingAssignment,
          },
        });
      }

      return res.status(409).json({
        success: false,
        message: "Subject is already assigned to this batch",
      });
    }

    const batchSubject = await BatchSubject.create({
      batchId,
      subjectId,
      teacherId,
    });

    return res.status(201).json({
      success: true,
      message: "Subject assigned to batch successfully",
      data: {
        batchSubject,
      },
    });
  } catch (error) {
    console.error("Assign subject to batch error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Subject is already assigned to this batch",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to assign subject to batch",
    });
  }
};

// ============================================================
// GET BATCH SUBJECTS
// Teachers see ONLY their own active assignments.
// Admin and Super Admin retain existing access.
// ============================================================

const getBatchSubjects = async (req, res) => {
  try {
    const batchResult = await getBatchForUser(
      req.params.batchId,
      req.user
    );

    if (batchResult.error) {
      return respondBatchAccessError(
        res,
        batchResult.error
      );
    }

    const query = {
      batchId: batchResult.batch._id,
    };

    if (req.user?.roles?.includes("teacher")) {
      const teacherId = getUserId(req.user);

      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (req.user.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Your teacher account is not active",
        });
      }

      // A teacher can only see their own active assignments.
      query.teacherId = teacherId;
      query.status = "active";
    }

    const batchSubjects = await BatchSubject.find(query)
      .populate(
        "subjectId",
        "name code standard type description duration status"
      )
      .populate(
        "teacherId",
        "fullName email branchId roles status"
      )
      .sort({
        createdAt: -1,
      });

    // Hide inactive or deleted subjects from teacher responses.
    const visibleBatchSubjects = req.user?.roles?.includes("teacher")
      ? batchSubjects.filter(
          (item) =>
            item.subjectId &&
            item.subjectId.status === "active"
        )
      : batchSubjects;

    return res.status(200).json({
      success: true,
      count: visibleBatchSubjects.length,
      data: {
        batchSubjects: visibleBatchSubjects,
      },
    });
  } catch (error) {
    console.error("Get batch subjects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch batch subjects",
    });
  }
};

// ============================================================
// CHANGE TEACHER
// Admin and Super Admin
// ============================================================

const changeTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher is required",
      });
    }

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch subject assignment ID",
      });
    }

    const batchSubject = await BatchSubject.findById(id);

    if (!batchSubject) {
      return res.status(404).json({
        success: false,
        message: "Batch subject assignment not found",
      });
    }

    const batchResult = await getBatchForUser(
      batchSubject.batchId,
      req.user
    );

    if (batchResult.error) {
      return respondBatchAccessError(
        res,
        batchResult.error
      );
    }

    const teacherResult = await getTeacherForBatch(
      teacherId,
      batchResult.batch,
      req.user
    );

    if (teacherResult.error === "invalid") {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    if (teacherResult.error === "invalid_teacher") {
      return res.status(400).json({
        success: false,
        message: "An active teacher account is required",
      });
    }

    if (teacherResult.error === "forbidden_teacher") {
      return res.status(403).json({
        success: false,
        message: "Teacher and batch must belong to the same branch",
      });
    }

    batchSubject.teacherId = teacherId;
    batchSubject.status = "active";

    await batchSubject.save();

    return res.status(200).json({
      success: true,
      message: "Teacher changed successfully",
      data: {
        batchSubject,
      },
    });
  } catch (error) {
    console.error("Change teacher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change teacher",
    });
  }
};

// ============================================================
// UPDATE BATCH SUBJECT STATUS
// Admin and Super Admin
// ============================================================

const updateBatchSubjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch subject assignment ID",
      });
    }

    const batchSubject = await BatchSubject.findById(id);

    if (!batchSubject) {
      return res.status(404).json({
        success: false,
        message: "Batch subject assignment not found",
      });
    }

    const batchResult = await getBatchForUser(
      batchSubject.batchId,
      req.user
    );

    if (batchResult.error) {
      return respondBatchAccessError(
        res,
        batchResult.error
      );
    }

    batchSubject.status = status;

    await batchSubject.save();

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "Subject assignment activated successfully"
          : "Subject assignment deactivated successfully",
      data: {
        batchSubject,
      },
    });
  } catch (error) {
    console.error("Update batch subject status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update batch subject status",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  assignSubjectToBatch,
  getBatchSubjects,
  changeTeacher,
  updateBatchSubjectStatus,
};