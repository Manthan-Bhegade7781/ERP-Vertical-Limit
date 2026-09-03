const User = require("../models/User");
const Branch = require("../models/Branch");
const { hashPassword } = require("../utils/password");

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      mobileNumber,
      role,
      branchId,
    } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !password || !role || !branchId) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // 2. Only teacher/student can register
    if (!["teacher", "student"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Only teacher or student registration is allowed",
      });
    }

    // 3. Check branch
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

    // 4. Check existing email
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 5. Hash password
    const passwordHash = await hashPassword(password);

    // 6. Create pending user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      mobileNumber,
      passwordHash,
      roles: [role],
      branchId,
      status: "pending",
      registrationRole: role,
    });

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
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};

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
      email: email.toLowerCase(),
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
    const { comparePassword } = require("../utils/password");

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
    const { generateToken } = require("../utils/jwt");

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

    // 4. Check if another user already has this email
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

    // 5. Update only allowed profile fields
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

module.exports = {
  register,
  login,
  getMe,
  updateMe,
};
