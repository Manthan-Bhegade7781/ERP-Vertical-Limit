const User = require("../models/User");

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
  try {
    const { id } = req.params;

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

    // Activate the account
    user.status = "active";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Registration approved successfully",
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
        },
      },
    });
  } catch (error) {
    console.error("Approve registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve registration",
    });
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

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    user.status = "rejected";
    user.rejectionReason = rejectionReason.trim();

    await user.save();

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

module.exports = {
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
};