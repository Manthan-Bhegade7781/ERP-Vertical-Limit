const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Branch = require("../models/Branch");
const createNotification = require("../utils/createNotification");

// Get all pending teacher/student registrations
const getPendingRegistrations = async (req, res) => {
  try {
    const users = await User.find({
      status: "pending",
      registrationRole: { $in: ["teacher", "student"] },
    })
      .select("-passwordHash")
      .populate("branchId", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get pending registrations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending registrations",
    });
  }
};

// Approve a teacher/student registration
const approveRegistration = async (req, res) => {
  const session = await User.startSession();

  try {
    const { id } = req.params;

    let approvedUser;

    await session.withTransaction(async () => {
      // Find the pending registration
      const user = await User.findOne({
        _id: id,
        status: "pending",
        registrationRole: { $in: ["teacher", "student"] },
      }).session(session);

      if (!user) {
        const error = new Error("Pending registration not found");
        error.statusCode = 404;
        throw error;
      }

      // Find and validate the corresponding profile
      if (user.registrationRole === "student") {
        const student = await Student.findOne({
          userId: user._id,
        }).session(session);

        if (!student) {
          const error = new Error(
            "Student profile not found. Registration cannot be approved."
          );
          error.statusCode = 404;
          throw error;
        }

        // Activate the student profile
        student.status = "active";
        await student.save({ session });
      } else if (user.registrationRole === "teacher") {
        const teacher = await Teacher.findOne({
          userId: user._id,
        }).session(session);

        if (!teacher) {
          const error = new Error(
            "Teacher profile not found. Registration cannot be approved."
          );
          error.statusCode = 404;
          throw error;
        }

        // Activate the teacher profile
        teacher.status = "active";
        await teacher.save({ session });
      }

      // Activate the user account
      user.status = "active";
      await user.save({ session });

      approvedUser = user;
    });

    // Create notification after the transaction succeeds
    try {
      await createNotification({
        recipient: approvedUser._id,
        title: "Account Approved",
        message:
          "Your Vertical Limit account has been approved. You can now log in.",
        type: "approval",
        icon: "check-circle-outline",
      });
    } catch (notificationError) {
      console.error(
        "Account approval notification error:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Registration approved successfully",
      data: {
        user: {
          id: approvedUser._id,
          fullName: approvedUser.fullName,
          email: approvedUser.email,
          mobileNumber: approvedUser.mobileNumber,
          roles: approvedUser.roles,
          branchId: approvedUser.branchId,
          status: approvedUser.status,
          registrationRole: approvedUser.registrationRole,
        },
      },
    });
  } catch (error) {
    console.error("Approve registration error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 404
          ? error.message
          : "Failed to approve registration",
    });
  } finally {
    await session.endSession();
  }
};

// Reject a teacher/student registration
const rejectRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const user = await User.findOne({
      _id: id,
      status: "pending",
      registrationRole: { $in: ["teacher", "student"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pending registration not found",
      });
    }

    if (
      !rejectionReason ||
      typeof rejectionReason !== "string" ||
      !rejectionReason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // Reject the registration
    user.status = "rejected";
    user.rejectionReason = rejectionReason.trim();

    await user.save();

    // Create notification for the rejected user
    try {
      await createNotification({
        recipient: user._id,
        title: "Registration Rejected",
        message: `Your registration was rejected. Reason: ${user.rejectionReason}`,
        type: "rejection",
        icon: "close-circle-outline",
      });
    } catch (notificationError) {
      // Rejection should succeed even if notification creation fails
      console.error(
        "Registration rejection notification error:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Registration rejected successfully",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          roles: user.roles,
          branchId: user.branchId,
          status: user.status,
          registrationRole: user.registrationRole,
          rejectionReason: user.rejectionReason,
        },
      },
    });
  } catch (error) {
    console.error("Reject registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject registration",
    });
  }
};

// Promote an active teacher to admin and make them
// the branch head of their existing branch
const promoteTeacherToAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({
      _id: id,
      roles: "teacher",
      status: "active",
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Active teacher not found",
      });
    }

    if (!teacher.branchId) {
      return res.status(400).json({
        success: false,
        message: "Teacher is not assigned to a branch",
      });
    }

    const branch = await Branch.findById(teacher.branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Teacher's branch not found",
      });
    }

    // Promote teacher to admin
    teacher.roles = ["admin"];

    await teacher.save();

    // Assign the promoted admin as branch head
    branch.branchHeadId = teacher._id;

    await branch.save();

    return res.status(200).json({
      success: true,
      message:
        "Teacher promoted to admin and assigned as branch head successfully",
      data: {
        user: {
          id: teacher._id,
          fullName: teacher.fullName,
          email: teacher.email,
          mobileNumber: teacher.mobileNumber,
          roles: teacher.roles,
          branchId: teacher.branchId,
          status: teacher.status,
        },
        branch: {
          id: branch._id,
          name: branch.name,
          code: branch.code,
          branchHeadId: branch.branchHeadId,
        },
      },
    });
  } catch (error) {
    console.error(
      "Promote teacher to admin and assign branch head error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to promote teacher and assign branch head",
    });
  }
};

module.exports = {
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  promoteTeacherToAdmin,
};