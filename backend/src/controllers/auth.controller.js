const mongoose = require("mongoose");
const crypto = require("crypto");

const User = require("../models/User");
const Branch = require("../models/Branch");
const Teacher = require("../models/Teacher");
const Batch = require("../models/Batch");
const Student = require("../models/Student");

const createNotification = require("../utils/createNotification");

const {
  hashPassword,
  comparePassword,
} = require("../utils/password");

const { generateEmployeeId } = require("../utils/employeeId");
const { generateToken } = require("../utils/jwt");

// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      fullName,
      email,
      password,
      mobileNumber,
      role,
      branchId,

      // Teacher-specific fields
      specialization,
      qualification,
      experience,
      address,

      // Student-specific fields
      batchId,
      guardianName,
      guardianMobile,
    } = req.body;

    // 1. Validate common required fields
    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !password ||
      !role ||
      !branchId
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // 2. Validate registration role
    if (!["teacher", "student"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Only teacher or student registration is allowed",
      });
    }

    // 3. Validate teacher-specific fields
    if (role === "teacher") {
      if (
        !qualification?.trim() ||
        experience === undefined ||
        experience === null ||
        String(experience).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Qualification and experience are required for teacher registration",
        });
      }
    }

    // 4. Validate student-specific fields
    if (role === "student" && !batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch is required for student registration",
      });
    }

    // 5. Validate branch ID
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    // 6. Check branch exists and is active
    const branch = await Branch.findOne({
      _id: branchId,
      status: "active",
    });

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive branch",
      });
    }

    // 7. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 8. Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 9. Validate student batch
    if (role === "student") {
      if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid batch ID",
        });
      }

      const batch = await Batch.findOne({
        _id: batchId,
        branchId: branch._id,
        isRemoved: false,
      });

      if (!batch) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid batch or the selected batch does not belong to this branch",
        });
      }
    }

    // 10. Hash password
    const passwordHash = await hashPassword(password);

    // 11. Start transaction
    session.startTransaction();

    // 12. Create pending User
    const [user] = await User.create(
      [
        {
          fullName: fullName.trim(),
          email: normalizedEmail,
          mobileNumber: mobileNumber?.trim() || "",
          passwordHash,
          roles: [role],
          branchId: branch._id,
          status: "pending",
          registrationRole: role,
        },
      ],
      { session }
    );

    let teacher = null;
    let student = null;

    // 13. Create Teacher profile
    if (role === "teacher") {
      const employeeId = await generateEmployeeId();

      const [createdTeacher] = await Teacher.create(
        [
          {
            userId: user._id,
            employeeId,
            specialization: specialization?.trim() || "",
            qualification: qualification.trim(),
            experience: String(experience).trim(),
            address: address?.trim() || "",
            status: "inactive",
          },
        ],
        { session }
      );

      teacher = createdTeacher;
    }

    // 14. Create Student profile
    if (role === "student") {
      // Generate a unique student ID
      const studentId = `STU-${crypto
        .randomUUID()
        .replace(/-/g, "")
        .slice(0, 12)
        .toUpperCase()}`;

      const [createdStudent] = await Student.create(
        [
          {
            userId: user._id,
            studentId,
            batchId,
            guardianName: guardianName?.trim() || "",
            guardianMobile: guardianMobile?.trim() || "",
            address: address?.trim() || "",
            status: "inactive",
          },
        ],
        { session }
      );

      student = createdStudent;
    }

    // 15. Commit registration transaction
    await session.commitTransaction();

    // =================================================
    // 16. NOTIFY ACTIVE SUPER ADMINS ABOUT REGISTRATION
    // =================================================

    try {
      const superAdmins = await User.find({
        roles: "super_admin",
        status: "active",
      }).select("_id");

      const notificationMessage =
        `${user.fullName} has submitted a new ${role} registration ` +
        `for the ${branch.name} branch. Approval is required.`;

      await Promise.all(
        superAdmins.map((admin) =>
          createNotification({
            recipient: admin._id,
            title: `New ${role === "teacher" ? "Teacher" : "Student"} Registration`,
            message: notificationMessage,
            type: "registration",
            icon: "account-plus-outline",
          })
        )
      );
    } catch (notificationError) {
      // Do not fail registration if notification creation fails
      console.error(
        "New registration notification error:",
        notificationError
      );
    }

    // 17. Send registration response
    return res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully. Please wait for Super Admin approval.",
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.registrationRole,
        status: user.status,
        branchId: user.branchId,

        ...(teacher && {
          teacher: {
            teacherId: teacher._id,
            employeeId: teacher.employeeId,
            specialization: teacher.specialization,
            qualification: teacher.qualification,
            experience: teacher.experience,
            address: teacher.address,
            status: teacher.status,
          },
        }),

        ...(student && {
          student: {
            studentProfileId: student._id,
            studentId: student.studentId,
            batchId: student.batchId,
            guardianName: student.guardianName,
            guardianMobile: student.guardianMobile,
            address: student.address,
            status: student.status,
          },
        }),
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Registration error:", error);

    // Handle duplicate email or generated IDs
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A duplicate value already exists. Check the email, employee ID, or student ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Check account status
    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is waiting for Super Admin approval",
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your registration has been rejected",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // 4. Compare password
    const isPasswordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Generate JWT
    const token = generateToken(user);

    // 6. Return safe user information
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          roles: user.roles,
          branchId: user.branchId,
          status: user.status,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login",
    });
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
          mobileNumber: req.user.mobileNumber,
          roles: req.user.roles,
          branchId: req.user.branchId,
          status: req.user.status,
        },
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};

// =====================================================
// UPDATE CURRENT USER
// =====================================================

const updateMe = async (req, res) => {
  try {
    const { fullName, email, mobileNumber } = req.body;

    // 1. Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required",
      });
    }

    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedMobile = mobileNumber?.trim() || "";

    // 2. Validate full name
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must contain at least 2 characters",
      });
    }

    // 3. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 4. Check duplicate email
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 5. Update allowed profile fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName: trimmedName,
        email: normalizedEmail,
        mobileNumber: trimmedMobile,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 6. Return updated profile
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          mobileNumber: updatedUser.mobileNumber,
          roles: updatedUser.roles,
          branchId: updatedUser.branchId,
          status: updatedUser.status,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // MongoDB duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  register,
  login,
  getMe,
  updateMe,
};