const User = require("../models/User");

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

const approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      status: "pending",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pending registration not found",
      });
    }

    user.status = "active";
    user.roles = [user.registrationRole];

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Registration approved successfully",
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        status: user.status,
        branchId: user.branchId,
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

const rejectRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      status: "pending",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pending registration not found",
      });
    }

    user.status = "rejected";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Registration rejected successfully",
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
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