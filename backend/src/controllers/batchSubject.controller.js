const BatchSubject = require("../models/BatchSubject");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const User = require("../models/User");

// Assign a subject to a batch with a teacher
const assignSubjectToBatch = async (req, res) => {
  try {
    const { batchId, subjectId, teacherId } = req.body;

    if (!batchId || !subjectId || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "Batch, subject and teacher are required",
      });
    }

    // Check batch
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check subject
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check teacher
    const teacher = await User.findById(teacherId);

    if (!teacher || !teacher.roles.includes("teacher")) {
      return res.status(400).json({
        success: false,
        message: "Valid teacher not found",
      });
    }

    // Teacher and batch should belong to the same branch
    if (
      teacher.branchId &&
      batch.branchId &&
      teacher.branchId.toString() !== batch.branchId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Teacher and batch must belong to the same branch",
      });
    }

    // Check existing assignment
    const existingAssignment = await BatchSubject.findOne({
      batchId,
      subjectId,
    });

    if (existingAssignment) {
      // If assignment is inactive, reactivate it with the new teacher
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

      // Active assignment already exists
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

    return res.status(500).json({
      success: false,
      message: "Failed to assign subject to batch",
    });
  }
};

// Get all subject assignments for a batch
const getBatchSubjects = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const batchSubjects = await BatchSubject.find({
      batchId,
    })
      .populate("subjectId", "name code standard type")
      .populate("teacherId", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        batchSubjects,
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

// Change teacher for a batch subject assignment
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

    // Find assignment
    const batchSubject = await BatchSubject.findById(id);

    if (!batchSubject) {
      return res.status(404).json({
        success: false,
        message: "Batch subject assignment not found",
      });
    }

    // Find batch
    const batch = await Batch.findById(batchSubject.batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Find teacher
    const teacher = await User.findById(teacherId);

    if (!teacher || !teacher.roles.includes("teacher")) {
      return res.status(400).json({
        success: false,
        message: "Valid teacher not found",
      });
    }

    // Teacher and batch should belong to the same branch
    if (
      teacher.branchId &&
      batch.branchId &&
      teacher.branchId.toString() !== batch.branchId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Teacher and batch must belong to the same branch",
      });
    }

    // Update teacher
    batchSubject.teacherId = teacherId;

    // If assignment was inactive, changing teacher also reactivates it
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

// Update batch subject assignment status
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

    const batchSubject = await BatchSubject.findById(id);

    if (!batchSubject) {
      return res.status(404).json({
        success: false,
        message: "Batch subject assignment not found",
      });
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

module.exports = {
  assignSubjectToBatch,
  getBatchSubjects,
  changeTeacher,
  updateBatchSubjectStatus
};