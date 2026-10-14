
const User = require("../models/User");

// Get users the logged-in user is allowed to message
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

    // Only active users can receive messages.
    // Super Admin can message users across all branches.
    // Other users can message Super Admin or users in their branch.
    const query = {
      status: "active",
      _id: { $ne: currentUser._id },
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

    // Apply the existing messaging role permissions.
    const recipients = users.filter((recipient) => {
      const recipientRoles = recipient.roles || [];

      // Super Admin can contact every active user.
      if (isSuperAdmin) {
        return true;
      }

      // Everyone can contact Super Admin.
      if (recipientRoles.includes("super_admin")) {
        return true;
      }

      // Non-super-admin users must belong to the same branch.
      if (
        !currentUser.branchId ||
        String(recipient.branchId) !== String(currentUser.branchId)
      ) {
        return false;
      }

      // Admin can message any active user in their branch.
      if (currentRoles.includes("admin")) {
        return true;
      }

      // Teachers can message admins, teachers, and students.
      if (currentRoles.includes("teacher")) {
        return recipientRoles.some((role) =>
          ["admin", "teacher", "student"].includes(role)
        );
      }

      // Students can message admins and teachers only.
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

module.exports = {
  getMessageRecipients,
};
