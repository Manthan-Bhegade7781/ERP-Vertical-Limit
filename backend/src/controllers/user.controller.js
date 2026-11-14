const mongoose = require("mongoose");

const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Branch = require("../models/Branch");

const { hashPassword } = require("../utils/password");
const { generateEmployeeId } = require("../utils/employeeId");

// =====================================================
// HELPER: SAFE USER RESPONSE
// =====================================================

const buildUserResponse = async (user) => {
  const userObject = user.toObject
    ? user.toObject()
    : user;

  const teacher = await Teacher.findOne({
    userId: user._id,
  })
    .select("employeeId specialization qualification experience address status")
    .lean();

  return {
    id: String(user._id),
    _id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    roles: user.roles,
    branchId: userObject.branchId || null,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(teacher && {
      employeeId: teacher.employeeId,
      teacher,
    }),
  };
};

// =====================================================
// GET ALL USERS
// GET /api/users
// =====================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      roles: { $in: ["admin", "teacher"] },
    })
      .select("-passwordHash")
      .populate("branchId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      users.map(async (user) => {
        const teacher = await Teacher.findOne({
          userId: user._id,
        })
          .select("employeeId specialization qualification experience address status")
          .lean();

        return {
          ...user,
          id: String(user._id),
          _id: String(user._id),
          employeeId: teacher?.employeeId || null,
          teacher: teacher || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// =====================================================
// CREATE USER
// POST /api/users
// =====================================================

const createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      mobileNumber,
      role,
      branchId,
      employeeId,
      qualification,
      experience,
      specialization,
      address,
    } = req.body;

    // Validate required fields
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

    if (!["admin", "teacher"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Only admin and teacher accounts can be created here",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Hash password using existing authentication utility
    const passwordHash = await hashPassword(password);

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobileNumber: mobileNumber?.trim() || "",
      passwordHash,
      roles: [role],
      branchId: branch._id,
      status: "active",
    });

    try {
      // Create separate teacher profile
      if (role === "teacher") {
        const generatedEmployeeId =
          employeeId?.trim() || await generateEmployeeId();

        await Teacher.create({
          userId: user._id,
          employeeId: generatedEmployeeId,
          specialization: specialization?.trim() || "",
          qualification: qualification?.trim() || "Not specified",
          experience:
            experience !== undefined && experience !== null
              ? String(experience).trim()
              : "0",
          address: address?.trim() || "",
          status: "active",
        });
      }
    } catch (profileError) {
      // Roll back User if Teacher profile creation fails
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    const populatedUser = await User.findById(user._id)
      .select("-passwordHash")
      .populate("branchId", "name code");

    const userResponse = await buildUserResponse(populatedUser);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or employee ID already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE USER DETAILS
// PUT /api/users/:id
// =====================================================

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      email,
      mobileNumber,
      branchId,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const duplicateEmail = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (duplicateEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const updateData = {
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobileNumber: mobileNumber?.trim() || "",
    };

    if (branchId !== undefined) {
      if (branchId === null || branchId === "") {
        return res.status(400).json({
          success: false,
          message: "A branch must be assigned",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findById(branchId);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      updateData.branchId = branch._id;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-passwordHash")
      .populate("branchId", "name code");

    const userResponse = await buildUserResponse(updatedUser);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// =====================================================
// UPDATE USER ROLE
// PATCH /api/users/:id/role
// =====================================================

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "teacher"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.roles.includes("super_admin") ||
      user.roles.includes("student")
    ) {
      return res.status(403).json({
        success: false,
        message: "This user's role cannot be changed here",
      });
    }

    if (role === "teacher") {
      let teacher = await Teacher.findOne({
        userId: user._id,
      });

      if (!teacher) {
        teacher = await Teacher.create({
          userId: user._id,
          employeeId: await generateEmployeeId(),
          qualification: "Not specified",
          experience: "0",
          status: user.status === "active" ? "active" : "inactive",
        });
      }
    }

    user.roles = [role];
    await user.save();

    const updatedUser = await User.findById(id)
      .select("-passwordHash")
      .populate("branchId", "name code");

    const userResponse = await buildUserResponse(updatedUser);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

// =====================================================
// UPDATE USER STATUS
// PATCH /api/users/:id/status
// =====================================================

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user status",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.roles.includes("super_admin")) {
      return res.status(403).json({
        success: false,
        message: "Super Admin status cannot be changed here",
      });
    }

    user.status = status;
    await user.save();

    // Keep teacher profile status synchronized
    await Teacher.findOneAndUpdate(
      { userId: user._id },
      {
        status: status === "active" ? "active" : "inactive",
      }
    );

    const updatedUser = await User.findById(id)
      .select("-passwordHash")
      .populate("branchId", "name code");

    const userResponse = await buildUserResponse(updatedUser);

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// =====================================================
// DELETE USER
// DELETE /api/users/:id
// =====================================================

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.roles.includes("super_admin") ||
      user.roles.includes("student")
    ) {
      return res.status(403).json({
        success: false,
        message: "This user cannot be deleted here",
      });
    }

    if (user.roles.includes("admin")) {
      await Branch.updateMany(
        { branchHeadId: user._id },
        { $set: { branchHeadId: null } }
      );
    }

    await Teacher.deleteOne({
      userId: user._id,
    });

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// =====================================================
// GET MESSAGE RECIPIENTS
// Existing functionality - preserved
// =====================================================

const getMessageRecipients = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const currentUserId = String(currentUser._id);
    const currentRoles = currentUser.roles || [];

    const isSuperAdmin = currentRoles.includes("super_admin");

    const query = {
      status: "active",
      _id: { $ne: currentUserId },
    };

    if (!isSuperAdmin) {
      const allowedUsers = [{ roles: "super_admin" }];

      if (currentUser.branchId) {
        allowedUsers.push({
          branchId: currentUser.branchId,
        });
      }

      query.$or = allowedUsers;
    }

    const users = await User.find(query)
      .select("_id fullName email roles branchId status")
      .sort({ fullName: 1 })
      .lean();

    const recipients = users.filter((recipient) => {
      const recipientRoles = recipient.roles || [];

      if (isSuperAdmin) return true;

      if (recipientRoles.includes("super_admin")) return true;

      if (
        !currentUser.branchId ||
        String(recipient.branchId) !== String(currentUser.branchId)
      ) {
        return false;
      }

      if (currentRoles.includes("admin")) return true;

      if (currentRoles.includes("teacher")) {
        return recipientRoles.some((role) =>
          ["admin", "teacher", "student"].includes(role)
        );
      }

      if (currentRoles.includes("student")) {
        return recipientRoles.some((role) =>
          ["admin", "teacher"].includes(role)
        );
      }

      return false;
    });

    return res.status(200).json({
      success: true,
      count: recipients.length,
      data: recipients.map((user) => ({
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        branchId: user.branchId
          ? String(user.branchId)
          : null,
      })),
    });
  } catch (error) {
    console.error("Get message recipients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch message recipients",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getMessageRecipients,
};