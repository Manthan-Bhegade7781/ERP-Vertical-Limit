const mongoose = require("mongoose");
const crypto = require("crypto");

const User = require("../models/User");
const Branch = require("../models/Branch");
const Teacher = require("../models/Teacher");
const Batch = require("../models/Batch");
const Student = require("../models/Student");

const createNotification = require("../utils/createNotification");
const { sendPasswordResetEmail } = require("../utils/sendEmail");

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

      const branchAdmins = await User.find({
        roles: "admin",
        branchId: branch._id,
        status: "active",
      }).select("_id");

      const notificationMessage =
        `${user.fullName} has submitted a new ${role} registration ` +
        `for the ${branch.name} branch. Approval is required.`;

      const allAdmins = [...superAdmins, ...branchAdmins];
      const uniqueAdminIds = Array.from(
        new Set(allAdmins.map((a) => a._id.toString()))
      );

      await Promise.all(
        uniqueAdminIds.map((adminId) =>
          createNotification({
            recipient: adminId,
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

    let studentDetails = {};
    if (user.roles && user.roles.includes("student")) {
      try {
        const student = await Student.findOne({ userId: user._id }).populate(
          "batchId",
          "name standard"
        );
        if (student) {
          studentDetails = {
            studentId: student.studentId,
            standard: student.batchId?.standard || "",
            batchName: student.batchId?.name || "",
          };
        }
      } catch (err) {
        console.error("Fetch student login extra details error:", err);
      }
    }

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
          ...studentDetails,
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
    let studentDetails = {};
    if (req.user.roles && req.user.roles.includes("student")) {
      try {
        const student = await Student.findOne({ userId: req.user._id }).populate(
          "batchId",
          "name standard"
        );
        if (student) {
          studentDetails = {
            studentId: student.studentId,
            standard: student.batchId?.standard || "",
            batchName: student.batchId?.name || "",
          };
        }
      } catch (err) {
        console.error("Fetch student getMe extra details error:", err);
      }
    }

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
          ...studentDetails,
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
    let studentDetails = {};
    if (updatedUser.roles && updatedUser.roles.includes("student")) {
      try {
        const student = await Student.findOne({ userId: updatedUser._id }).populate(
          "batchId",
          "name standard"
        );
        if (student) {
          studentDetails = {
            studentId: student.studentId,
            standard: student.batchId?.standard || "",
            batchName: student.batchId?.name || "",
          };
        }
      } catch (err) {
        console.error("Fetch student updateMe extra details error:", err);
      }
    }

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
          ...studentDetails,
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
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one letter and one number",
      });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// =====================================================
// FORGOT PASSWORD (OTP GENERATION)
// POST /api/auth/forgot-password
// =====================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Registered email address is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expiresAt;
    await user.save();

    if (process.env.NODE_ENV === "development") {
      console.log(`[AUTH] Password reset code generated for: ${normalizedEmail}`);
    }

    try {
      await createNotification({
        recipient: user._id,
        title: "Password Reset OTP Requested",
        message: `A password reset verification code has been dispatched to your email. It will expire in 10 minutes.`,
        type: "general",
        icon: "shield-key-outline",
      });
    } catch (notifErr) {
      // Non-blocking
    }
    // Send the OTP to the user's email address
      const emailResult = await sendPasswordResetEmail({
        to: normalizedEmail,
        fullName: user.fullName,
        otp,
      });

      if (!emailResult.success) {
        // Clear OTP because the email was not sent
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;
        await user.save();

        console.error("[FORGOT PASSWORD] Email delivery failed:", emailResult.error || "SMTP not configured");

        return res.status(500).json({
          success: false,
          message: "Unable to send password reset email. Please try again later.",
        });
      }


    return res.status(200).json({
      success: true,
      message: "A 6-digit verification code has been sent to your registered email address.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
};

// =====================================================
// VERIFY RESET OTP
// POST /api/auth/verify-otp
// =====================================================

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP was requested or it has already been used",
      });
    }

    if (new Date() > user.resetPasswordOtpExpires) {
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpires = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    if (user.resetPasswordOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check and try again",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// =====================================================
// RESET PASSWORD (WITH VERIFIED OTP)
// POST /api/auth/reset-password
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "No active password reset request found. Please request a new OTP",
      });
    }

    if (new Date() > user.resetPasswordOtpExpires) {
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpires = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    if (user.resetPasswordOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least one letter and one number",
      });
    }

    user.passwordHash = await hashPassword(newPassword);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    console.log(`[PASSWORD RESET SUCCESS] For user: ${normalizedEmail}`);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
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
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
