const StudentSubject = require("../models/StudentSubject");
const Student = require("../models/Student");
const BatchSubject = require("../models/BatchSubject");
const Batch = require("../models/Batch");

// Enroll an active student in an active batch-subject assignment
const enrollStudentInSubject = async (req, res) => {
  try {
    const { studentId, batchSubjectId } = req.body;

    if (!studentId || !batchSubjectId) {
      return res.status(400).json({
        success: false,
        message: "Student and batch subject are required",
      });
    }

    // Check student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active students can enroll in subjects",
      });
    }

    // Check batch-subject assignment
    const batchSubject = await BatchSubject.findById(
      batchSubjectId
    );

    if (!batchSubject) {
      return res.status(404).json({
        success: false,
        message: "Batch subject assignment not found",
      });
    }

    if (batchSubject.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll in an inactive subject assignment",
      });
    }

    // Ensure the subject assignment belongs to the student's batch
    if (
      student.batchId.toString() !==
      batchSubject.batchId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject assignment does not belong to the student's batch",
      });
    }

    // Check batch availability
    const batch = await Batch.findById(student.batchId);

    if (!batch || batch.isRemoved === true) {
      return res.status(400).json({
        success: false,
        message: "Student's batch is unavailable",
      });
    }

    // Check for an existing enrollment
    const existingEnrollment = await StudentSubject.findOne({
      studentId,
      batchSubjectId,
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === "active") {
        return res.status(409).json({
          success: false,
          message: "Student is already enrolled in this subject",
        });
      }

      // Reactivate a previous enrollment
      existingEnrollment.status = "active";
      await existingEnrollment.save();

      return res.status(200).json({
        success: true,
        message: "Student subject enrollment reactivated successfully",
        data: {
          studentSubject: existingEnrollment,
        },
      });
    }

    const studentSubject = await StudentSubject.create({
      studentId,
      batchSubjectId,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Student enrolled in subject successfully",
      data: {
        studentSubject,
      },
    });
  } catch (error) {
    console.error("Enroll student in subject error:", error);

    // Handle duplicate-key errors, including concurrent requests
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in this subject",
      });
    }

    // Handle malformed MongoDB IDs
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student or batch subject ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to enroll student in subject",
    });
  }
};

// Get subjects enrolled by a student
const getStudentSubjects = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const studentSubjects = await StudentSubject.find({
      studentId,
    })
      .populate({
        path: "batchSubjectId",
        populate: [
          {
            path: "subjectId",
            select: "name code standard type",
          },
          {
            path: "teacherId",
            select: "fullName email",
          },
          {
            path: "batchId",
            select: "name code standard academicYear branchId isRemoved",
          },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        studentSubjects,
      },
    });
  } catch (error) {
    console.error("Get student subjects error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student subjects",
    });
  }
};

// Get students enrolled in a batch-subject assignment
const getStudentsByBatchSubject = async (req, res) => {
  try {
    const { batchSubjectId } = req.params;

    const batchSubject = await BatchSubject.findById(
      batchSubjectId
    );

    if (!batchSubject) {
      return res.status(404).json({
        success: false,
        message: "Batch subject assignment not found",
      });
    }

    const studentSubjects = await StudentSubject.find({
      batchSubjectId,
      status: "active",
    })
      .populate({
        path: "studentId",
        select: "studentId userId batchId guardianName status",
        populate: {
          path: "userId",
          select: "fullName email mobileNumber status",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        studentSubjects,
      },
    });
  } catch (error) {
    console.error("Get students by batch subject error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid batch subject ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled students",
    });
  }
};

// Activate or deactivate a student subject enrollment
const updateStudentSubjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const enrollment = await StudentSubject.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student subject enrollment not found",
      });
    }

    if (status === "active") {
      const student = await Student.findById(
        enrollment.studentId
      );

      const batchSubject = await BatchSubject.findById(
        enrollment.batchSubjectId
      );

      if (!student || student.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Only active students can have active enrollments",
        });
      }

      if (!batchSubject || batchSubject.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "The batch subject assignment is unavailable",
        });
      }

      if (
        student.batchId.toString() !==
        batchSubject.batchId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Subject assignment does not belong to the student's batch",
        });
      }

      const batch = await Batch.findById(student.batchId);

      if (!batch || batch.isRemoved === true) {
        return res.status(400).json({
          success: false,
          message: "Student's batch is unavailable",
        });
      }
    }

    enrollment.status = status;
    await enrollment.save();

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "Student subject enrollment activated successfully"
          : "Student subject enrollment deactivated successfully",
      data: {
        studentSubject: enrollment,
      },
    });
  } catch (error) {
    console.error("Update student subject status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update student subject enrollment",
    });
  }
};

module.exports = {
  enrollStudentInSubject,
  getStudentSubjects,
  getStudentsByBatchSubject,
  updateStudentSubjectStatus,
};
