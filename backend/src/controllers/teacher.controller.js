const mongoose = require("mongoose");

const Teacher = require("../models/Teacher");
const Branch = require("../models/Branch");
const User = require("../models/User");

const { hashPassword } = require("../utils/password");
const { generateEmployeeId } = require("../utils/employeeId");
const createNotification = require("../utils/createNotification");

// =====================================================
// HELPER: CREATE NOTIFICATION SAFELY
// =====================================================

const notifyTeacher = async ({
  recipient,
  title,
  message,
  type = "general",
  icon = "bell-outline",
}) => {
  if (!recipient) return;

  try {
    await createNotification({
      recipient,
      title,
      message,
      type,
      icon,
    });
  } catch (error) {
    // Notification failure should not undo a successful operation.
    console.error("Teacher notification error:", error.message);
  }
};

// =====================================================
// CREATE TEACHER
// =====================================================

const createTeacher = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      fullName,
      email,
      mobileNumber,
      password,
      branchId,
      specialization,
      qualification,
      experience,
      address,
    } = req.body;

    // 1. Validate required fields.
    if (
      !fullName ||
      !email ||
      !password ||
      !branchId ||
      !qualification ||
      experience === undefined ||
      experience === null ||
      experience === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof qualification !== "string" ||
      typeof experience !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data types.",
      });
    }

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !qualification.trim() ||
      !experience.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields cannot be empty.",
      });
    }

    // 2. Validate branch ID.
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID.",
      });
    }

    // 3. Check branch exists and is active.
    const branch = await Branch.findOne({
      _id: branchId,
      status: "active",
    });

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive branch.",
      });
    }

    // 4. Normalize email.
    const normalizedEmail = email.trim().toLowerCase();

    // 5. Check whether the email already exists.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 6. Generate employee ID.
    const employeeId = await generateEmployeeId();

    // 7. Hash password.
    const passwordHash = await hashPassword(password);

    // 8. Start transaction.
    session.startTransaction();

    // 9. Create User account.
    const [user] = await User.create(
      [
        {
          fullName: fullName.trim(),
          email: normalizedEmail,
          mobileNumber: mobileNumber?.trim() || "",
          passwordHash,
          roles: ["teacher"],
          branchId,
          status: "active",
          registrationRole: null,
        },
      ],
      { session }
    );

    // 10. Create Teacher profile.
    const [teacher] = await Teacher.create(
      [
        {
          userId: user._id,
          employeeId,
          specialization: specialization?.trim() || "",
          qualification: qualification.trim(),
          experience: experience.trim(),
          address: address?.trim() || "",
          status: "active",
        },
      ],
      { session }
    );

    // 11. Commit transaction.
    await session.commitTransaction();

    // 12. Notify the newly created teacher.
    await notifyTeacher({
      recipient: user._id,
      title: "Teacher Account Created",
      message:
        "Your teacher account has been created successfully. You can now log in to Vertical Limit.",
      type: "approval",
      icon: "account-check-outline",
    });

    // 13. Return safe response.
    return res.status(201).json({
      success: true,
      message: "Teacher created successfully.",
      data: {
        teacherId: teacher._id,
        employeeId: teacher.employeeId,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          roles: user.roles,
          branchId: user.branchId,
          status: user.status,
        },
        teacher: {
          specialization: teacher.specialization,
          qualification: teacher.qualification,
          experience: teacher.experience,
          address: teacher.address,
          status: teacher.status,
        },
      },
    });
  } catch (error) {
    // Roll back only if the transaction is still active.
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Create Teacher Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A user with the provided email or employee ID already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create teacher.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// GET ALL TEACHERS
// =====================================================

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate(
        "userId",
        "fullName email mobileNumber branchId roles status"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Get Teachers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teachers.",
      error: error.message,
    });
  }
};

// =====================================================
// GET TEACHER BY ID
// =====================================================

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID.",
      });
    }

    const teacher = await Teacher.findById(id).populate(
      "userId",
      "fullName email mobileNumber branchId roles status"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Get Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE TEACHER
// =====================================================

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      specialization,
      qualification,
      experience,
      address,
      status,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID.",
      });
    }

    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    // Validate required fields.
    if (
      typeof qualification !== "string" ||
      !qualification.trim() ||
      typeof experience !== "string" ||
      !experience.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Qualification and experience are required.",
      });
    }

    // Validate status if supplied.
    if (
      status !== undefined &&
      !["active", "inactive"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
      });
    }

    const previousStatus = teacher.status;

    // Update teacher profile fields.
    teacher.specialization = specialization?.trim() || "";
    teacher.qualification = qualification.trim();
    teacher.experience = experience.trim();
    teacher.address = address?.trim() || "";

    if (status !== undefined) {
      teacher.status = status;
    }

    // Keep the associated User status synchronized.
    const user = await User.findById(teacher.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Associated user account not found.",
      });
    }

    if (status !== undefined) {
      user.status = status;
    }

    await teacher.save();

    if (status !== undefined) {
      await user.save();
    }

    const updatedTeacher = await Teacher.findById(id).populate(
      "userId",
      "fullName email mobileNumber branchId roles status"
    );

    // Notify the teacher if their status changed.
    if (
      status !== undefined &&
      previousStatus !== status
    ) {
      const isActive = status === "active";

      await notifyTeacher({
        recipient: user._id,
        title: isActive
          ? "Teacher Account Activated"
          : "Teacher Account Deactivated",
        message: isActive
          ? "Your teacher account has been activated. You can access your Vertical Limit account."
          : "Your teacher account has been deactivated. Please contact your administrator if you need assistance.",
        type: isActive ? "approval" : "general",
        icon: isActive
          ? "account-check-outline"
          : "account-lock-outline",
      });
    } else {
      // Notify the teacher about a profile update.
      await notifyTeacher({
        recipient: user._id,
        title: "Teacher Profile Updated",
        message:
          "Your teacher profile information has been updated successfully.",
        type: "general",
        icon: "account-edit-outline",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully.",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Update Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update teacher.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE TEACHER STATUS
// =====================================================

const updateTeacherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID.",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
      });
    }

    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    const previousStatus = teacher.status;

    // Find the associated user account.
    const user = await User.findById(teacher.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Associated user account not found.",
      });
    }

    // Update both records.
    teacher.status = status;
    user.status = status;

    await Promise.all([
      teacher.save(),
      user.save(),
    ]);

    const updatedTeacher = await Teacher.findById(id).populate(
      "userId",
      "fullName email mobileNumber branchId roles status"
    );

    // Notify only if the status actually changed.
    if (previousStatus !== status) {
      const isActive = status === "active";

      await notifyTeacher({
        recipient: user._id,
        title: isActive
          ? "Teacher Account Activated"
          : "Teacher Account Deactivated",
        message: isActive
          ? "Your teacher account has been activated. You can access your Vertical Limit account."
          : "Your teacher account has been deactivated. Please contact your administrator if you need assistance.",
        type: isActive ? "approval" : "general",
        icon: isActive
          ? "account-check-outline"
          : "account-lock-outline",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Teacher ${
        status === "active" ? "activated" : "deactivated"
      } successfully.`,
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Update Teacher Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update teacher status.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  updateTeacherStatus,
};