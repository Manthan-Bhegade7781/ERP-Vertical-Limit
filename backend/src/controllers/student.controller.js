const mongoose = require("mongoose");

const Student = require("../models/Student");
const User = require("../models/User");
const Batch = require("../models/Batch");
const BatchSubject = require("../models/BatchSubject");

const { hashPassword } = require("../utils/password");
const { generateStudentId } = require("../utils/studentId");
const createNotification = require("../utils/createNotification");

// =====================================================
// COMMON HELPERS
// =====================================================

const isSuperAdmin = (user) =>
  Array.isArray(user.roles) && user.roles.includes("super_admin");

const getAdminBranchId = (user) => {
  if (isSuperAdmin(user)) return null;
  return user.branchId ? user.branchId.toString() : null;
};

const canAccessStudent = async (student, user) => {
  if (isSuperAdmin(user)) return true;

  const branchId = getAdminBranchId(user);
  if (!branchId || !student) return false;

  const batch = await Batch.findById(student.batchId).select("branchId");

  return Boolean(
    batch &&
      batch.branchId &&
      batch.branchId.toString() === branchId
  );
};

const canAccessBatch = async (batchId, user) => {
  if (isSuperAdmin(user)) return true;

  const branchId = getAdminBranchId(user);

  if (!branchId || !mongoose.isValidObjectId(batchId)) {
    return false;
  }

  const batch = await Batch.findById(batchId).select(
    "branchId isRemoved"
  );

  return Boolean(
    batch &&
      batch.isRemoved !== true &&
      batch.branchId &&
      batch.branchId.toString() === branchId
  );
};

// =====================================================
// CREATE STUDENT
// =====================================================

const createStudent = async (req, res) => {
  let session;

  try {
    const {
      fullName,
      email,
      mobileNumber,
      password,
      batchId,
      guardianName,
      guardianMobile,
      address,
    } = req.body;

    if (!fullName || !email || !password || !batchId) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password and batch are required",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (!(await canAccessBatch(batchId, req.user))) {
      return res.status(403).json({
        success: false,
        message:
          "You can only add students to batches in your assigned branch",
      });
    }

    if (batch.isRemoved === true) {
      return res.status(400).json({
        success: false,
        message: "Cannot add student to a removed batch",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const studentId = await generateStudentId();
    const passwordHash = await hashPassword(password);

    session = await mongoose.startSession();

    let user;
    let student;

    try {
      session.startTransaction();

      // Create User account
      [user] = await User.create(
        [
          {
            fullName: fullName.trim(),
            email: normalizedEmail,
            mobileNumber: mobileNumber?.trim() || "",
            passwordHash,
            roles: ["student"],
            branchId: batch.branchId,
            status: "active",
            registrationRole: null,
          },
        ],
        { session }
      );

      // Create Student profile
      [student] = await Student.create(
        [
          {
            userId: user._id,
            studentId,
            batchId,
            guardianName: guardianName?.trim() || "",
            guardianMobile: guardianMobile?.trim() || "",
            address: address?.trim() || "",
            status: "active",
          },
        ],
        { session }
      );

      await session.commitTransaction();
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      await session.endSession();
    }

    // Notify newly created student
    await createNotification({
      recipient: user._id,
      title: "Welcome to Vertical Limit",
      message: "Your student account has been created successfully.",
      type: "registration",
      icon: "account-check-outline",
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: {
        student: {
          id: student._id,
          studentId: student.studentId,
          batchId: student.batchId,
          guardianName: student.guardianName,
          guardianMobile: student.guardianMobile,
          address: student.address,
          status: student.status,
        },
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          roles: user.roles,
          branchId: user.branchId,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error("Create student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create student",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL STUDENTS
// ADMIN / SUPER ADMIN
// =====================================================

const getStudents = async (req, res) => {
  try {
    let studentFilter = {};

    if (!isSuperAdmin(req.user)) {
      const branchId = getAdminBranchId(req.user);

      if (!branchId) {
        return res.status(403).json({
          success: false,
          message: "Your account has no assigned branch",
        });
      }

      const batches = await Batch.find({
        branchId,
      }).select("_id");

      studentFilter = {
        batchId: {
          $in: batches.map((batch) => batch._id),
        },
      };
    }

    const students = await Student.find(studentFilter)
      .populate({
        path: "userId",
        select: "fullName email mobileNumber roles branchId status",
        populate: {
          path: "branchId",
          select: "name code",
        },
      })
      .populate({
        path: "batchId",
        select:
          "name code standard academicYear branchId startDate endDate",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// =====================================================
// GET TEACHER ASSIGNED STUDENTS
// TEACHER ONLY
// =====================================================

const getTeacherStudents = async (req, res) => {
  try {
    const teacherId = req.user?._id;

    // Verify teacher role
    if (
      !teacherId ||
      !Array.isArray(req.user.roles) ||
      !req.user.roles.includes("teacher")
    ) {
      return res.status(403).json({
        success: false,
        message: "Teacher access only",
      });
    }

    // Verify teacher account status
    if (req.user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your teacher account is not active",
      });
    }

    // Find active subject assignments for this teacher
    const assignments = await BatchSubject.find({
      teacherId,
      status: "active",
    })
      .populate({
        path: "batchId",
        match: {
          isRemoved: { $ne: true },
        },
        select: "name code standard academicYear branchId",
      })
      .populate({
        path: "subjectId",
        match: {
          status: "active",
        },
        select: "name code standard type",
      })
      .lean();

    const batchSubjects = new Map();

    assignments.forEach((assignment) => {
      if (!assignment.batchId || !assignment.subjectId) {
        return;
      }

      const batchId = assignment.batchId._id.toString();

      // Verify branch access when the teacher has a branch
      if (
        req.user.branchId &&
        assignment.batchId.branchId?.toString() !==
          req.user.branchId.toString()
      ) {
        return;
      }

      if (!batchSubjects.has(batchId)) {
        batchSubjects.set(batchId, []);
      }

      batchSubjects.get(batchId).push({
        id: assignment.subjectId._id.toString(),
        name: assignment.subjectId.name,
        code: assignment.subjectId.code,
        type: assignment.subjectId.type,
      });
    });

    const assignedBatchIds = Array.from(batchSubjects.keys());

    // No active batch assignments
    if (assignedBatchIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No students found in your assigned batches",
      });
    }

    // Fetch students from teacher's assigned batches
    const students = await Student.find({
      batchId: {
        $in: assignedBatchIds,
      },
    })
      .populate({
        path: "userId",
        select: "fullName email mobileNumber status",
      })
      .populate({
        path: "batchId",
        select: "name code standard academicYear branchId",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Attach the teacher's assigned subjects to each student
    const result = students.map((student) => {
      const batchId = student.batchId?._id?.toString();

      return {
        ...student,
        teacherSubjects: batchId
          ? batchSubjects.get(batchId) || []
          : [],
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Get teacher students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned students",
      error: error.message,
    });
  }
};

// =====================================================
// GET STUDENT BY ID
// =====================================================

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate({
        path: "userId",
        select: "fullName email mobileNumber roles branchId status",
        populate: {
          path: "branchId",
          select: "name code",
        },
      })
      .populate({
        path: "batchId",
        select:
          "name code standard academicYear branchId startDate endDate schedule capacity",
        populate: {
          path: "branchId",
          select: "name code",
        },
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!(await canAccessStudent(student, req.user))) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this student",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE STUDENT
// =====================================================

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      email,
      mobileNumber,
      batchId,
      guardianName,
      guardianMobile,
      address,
      status,
    } = req.body;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!(await canAccessStudent(student, req.user))) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this student",
      });
    }

    // Capture original values before updating
    const previousBatchId = student.batchId?.toString();
    const previousStatus = student.status;

    // Validate new batch if supplied
    if (batchId) {
      const batch = await Batch.findById(batchId);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      if (batch.isRemoved === true) {
        return res.status(400).json({
          success: false,
          message: "Cannot assign student to a removed batch",
        });
      }

      if (!(await canAccessBatch(batchId, req.user))) {
        return res.status(403).json({
          success: false,
          message: "You can only assign students to batches in your branch",
        });
      }

      student.batchId = batchId;
    }

    // Update Student profile
    if (guardianName !== undefined) {
      student.guardianName = guardianName.trim();
    }

    if (guardianMobile !== undefined) {
      student.guardianMobile = guardianMobile.trim();
    }

    if (address !== undefined) {
      student.address = address.trim();
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid student status",
        });
      }

      student.status = status;
    }

    // Update User account
    const user = await User.findById(student.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user account not found",
      });
    }

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (normalizedEmail !== user.email) {
        const existingUser = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "A user with this email already exists",
          });
        }

        user.email = normalizedEmail;
      }
    }

    if (mobileNumber !== undefined) {
      user.mobileNumber = mobileNumber.trim();
    }

    // Synchronize account status when changed
    if (status !== undefined) {
      user.status = status;
    }

    await user.save();
    await student.save();

    // Notify when the student's batch changes
    const newBatchId = student.batchId?.toString();

    if (previousBatchId !== newBatchId) {
      await createNotification({
        recipient: user._id,
        title: "Batch Updated",
        message: "Your batch assignment has been updated.",
        type: "general",
        icon: "account-group-outline",
      });
    }

    // Notify when the student's status changes
    if (previousStatus !== student.status) {
      const isActive = student.status === "active";

      await createNotification({
        recipient: user._id,
        title: isActive
          ? "Account Activated"
          : "Account Deactivated",
        message: isActive
          ? "Your student account has been activated."
          : "Your student account has been deactivated.",
        type: isActive ? "approval" : "general",
        icon: isActive
          ? "check-circle-outline"
          : "account-cancel-outline",
      });
    }

    const updatedStudent = await Student.findById(student._id)
      .populate({
        path: "userId",
        select: "fullName email mobileNumber roles branchId status",
      })
      .populate({
        path: "batchId",
        select: "name code standard academicYear branchId",
      });

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Update student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE STUDENT STATUS
// =====================================================

const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!(await canAccessStudent(student, req.user))) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to change this student's status",
      });
    }

    const previousStatus = student.status;

    const user = await User.findById(student.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user account not found",
      });
    }

    // Synchronize Student and User account statuses
    student.status = status;
    user.status = status;

    await student.save();
    await user.save();

    // Notify only when status changes
    if (previousStatus !== status) {
      const isActive = status === "active";

      await createNotification({
        recipient: user._id,
        title: isActive
          ? "Account Activated"
          : "Account Deactivated",
        message: isActive
          ? "Your student account has been activated."
          : "Your student account has been deactivated.",
        type: isActive ? "approval" : "general",
        icon: isActive
          ? "check-circle-outline"
          : "account-cancel-outline",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student ${
        status === "active" ? "activated" : "deactivated"
      } successfully`,
      data: {
        studentId: student.studentId,
        status: student.status,
      },
    });
  } catch (error) {
    console.error("Update student status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student status",
      error: error.message,
    });
  }
};

// =====================================================
// GET LOGGED-IN STUDENT CLASSES & BATCH INFO
// =====================================================

const getMyClasses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate({
        path: "batchId",
        populate: { path: "branchId", select: "name code address city" },
      });

    if (!student || !student.batchId) {
      return res.status(200).json({
        success: true,
        data: {
          batches: [],
          currentBatch: null,
        },
      });
    }

    const batch = student.batchId;

    // Get count of students in this batch
    const studentsCount = await Student.countDocuments({
      batchId: batch._id,
      status: "active",
    });

    // Get active subjects for this batch
    const BatchSubject = require("../models/BatchSubject");
    const batchSubjects = await BatchSubject.find({
      batchId: batch._id,
      status: "active",
    })
      .populate("subjectId", "name code standard type description")
      .populate("teacherId", "fullName email mobileNumber");

    const subjects = batchSubjects.map((bs) => ({
      _id: bs.subjectId?._id,
      batchSubjectId: bs._id,
      name: bs.subjectId?.name || "Subject",
      code: bs.subjectId?.code || "",
      teacher: bs.teacherId?.fullName || "Unassigned",
      teacherEmail: bs.teacherId?.email || "",
      teacherMobile: bs.teacherId?.mobileNumber || "",
      type: bs.subjectId?.type || "Core",
    }));

    const daysCount = Array.isArray(batch.schedule?.days)
      ? batch.schedule.days.length
      : 0;

    const formattedBatch = {
      _id: batch._id,
      name: batch.name,
      code: batch.code,
      standard: batch.standard,
      branch: batch.branchId?.name
        ? `Vertical Limits • ${batch.branchId.name}`
        : "Vertical Limits • Main Branch",
      branchName: batch.branchId?.name || "Main Branch",
      academicYear: batch.academicYear,
      studentsCount: studentsCount || 1,
      subjectsCount: subjects.length,
      daysPerWeek: daysCount || 6,
      schedule: batch.schedule || { startTime: "", endTime: "", days: [] },
      subjects,
    };

    return res.status(200).json({
      success: true,
      data: {
        batches: [formattedBatch],
        currentBatch: formattedBatch,
      },
    });
  } catch (error) {
    console.error("Get student classes error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student classes",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createStudent,
  getStudents,
  getTeacherStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
  getMyClasses,
};