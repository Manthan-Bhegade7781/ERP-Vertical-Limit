
const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

// Validate MongoDB ObjectIds.
const isValidObjectId = (id) => {
  if (id === undefined || id === null || id === "") {
    return false;
  }

  return mongoose.Types.ObjectId.isValid(id.toString());
};

// Extract roles from common authentication payload formats.
// Supports roles: ["super_admin"], role: "super_admin",
// role: "Super Admin", role: "superAdmin", etc.
const getUserRoles = (user) => {
  if (!user) return [];

  const rawRoles =
    user.roles ??
    user.role ??
    user.roleName ??
    user.userRole ??
    [];

  const roles = Array.isArray(rawRoles)
    ? rawRoles
    : [rawRoles];

  const aliases = {
    superadmin: "super_admin",
    superadministrator: "super_admin",
    super_administrator: "super_admin",
    administrator: "admin",
  };

  return [
    ...new Set(
      roles
        .map((item) => {
          // Support populated role objects.
          const value =
            typeof item === "object" && item !== null
              ? item.name ??
                item.value ??
                item.role ??
                item.slug ??
                ""
              : item;

          return String(value)
            .trim()
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
        })
        .filter(Boolean)
        .map((role) => aliases[role] || role)
    ),
  ];
};

// Determine whether the authenticated user is a Super Admin.
const isSuperAdmin = (user) =>
  getUserRoles(user).includes("super_admin");

// Determine whether the user can manage announcements.
const canManageAnnouncements = (user) =>
  getUserRoles(user).some((role) =>
    ["super_admin", "admin"].includes(role)
  );

// Resolve the authenticated user's branch.
const getUserBranchId = (user) => {
  const branch =
    user?.branchId ??
    user?.branch ??
    user?.assignedBranch ??
    null;

  if (branch && typeof branch === "object") {
    return branch._id ?? branch.id ?? branch;
  }

  return branch;
};

// Super Admin can access every branch.
// Other users must have a valid assigned branch.
const getBranchFilter = (user) => {
  if (isSuperAdmin(user)) {
    return {};
  }

  const branchId = getUserBranchId(user);

  if (!branchId || !isValidObjectId(branchId)) {
    return null;
  }

  return { branchId };
};

const ALLOWED_STATUSES = [
  "Draft",
  "Published",
  "Scheduled",
  "Expired",
];

const isValidDate = (value) =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  !Number.isNaN(Date.parse(value));

// Validate the current user's ID.
const getUserId = (user) => user?._id ?? user?.id ?? null;

// --------------------------------------------------
// GET ANNOUNCEMENTS
// GET /api/announcements
// --------------------------------------------------

const getAnnouncements = async (req, res) => {
  try {
    const user = req.user;
    const roles = getUserRoles(user);

    const branchFilter = getBranchFilter(user);

    if (!branchFilter) {
      return res.status(403).json({
        success: false,
        message: "Your account is not assigned to a valid branch.",
      });
    }

    const filter = { ...branchFilter };

    if (!canManageAnnouncements(user)) {
      const isStudent = roles.includes("student");
      const isTeacher = roles.includes("teacher");

      if (!isStudent && !isTeacher) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view announcements.",
        });
      }

      // Students and teachers see published, non-expired announcements.
      filter.status = "Published";
      filter.expiresAt = { $gt: new Date() };

      const audiences = [];

      if (isStudent) {
        audiences.push(
          "All Users",
          "All Students",
          "Students",
          "Students & Teachers"
        );
      }

      if (isTeacher) {
        audiences.push(
          "All Users",
          "Teachers",
          "Students & Teachers",
          "Academic Staff",
          "Staff"
        );
      }

      filter.audience = { $in: [...new Set(audiences)] };

      // Include announcements for the user's branch and
      // announcements intended for all branches.
      const branchId = getUserBranchId(user);

      filter.$or = [
        { branchId },
        { branchId: null },
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "fullName email")
      .populate("branchId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements.",
    });
  }
};

// --------------------------------------------------
// CREATE ANNOUNCEMENT
// POST /api/announcements
// --------------------------------------------------

const createAnnouncement = async (req, res) => {
  try {
    const user = req.user;
    const roles = getUserRoles(user);
    const userId = getUserId(user);

    // Temporary diagnostic to identify role mismatches.
    console.log("Announcement permission check:", {
      roles,
      canManage: canManageAnnouncements(user),
      hasUserId: Boolean(userId),
    });

    if (!canManageAnnouncements(user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create announcements.",
        receivedRoles: roles.length ? roles : ["missing"],
      });
    }

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is missing or invalid.",
      });
    }

    const {
      title,
      description,
      category,
      priority,
      audience,
      branchId,
      status,
      publishedAt,
      scheduledAt,
      expiresAt,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    if (!isValidDate(expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "A valid expiry date is required.",
      });
    }

    const finalStatus = status || "Draft";

    if (!ALLOWED_STATUSES.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement status.",
      });
    }

    if (
      finalStatus === "Scheduled" &&
      !isValidDate(scheduledAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid scheduled date is required.",
      });
    }

    if (
      publishedAt !== undefined &&
      publishedAt !== null &&
      publishedAt !== "" &&
      !isValidDate(publishedAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid publication date.",
      });
    }

    const branchFilter = getBranchFilter(user);

    if (!branchFilter) {
      return res.status(403).json({
        success: false,
        message: "Your account is not assigned to a valid branch.",
      });
    }

    let announcementBranchId = branchId || null;

    if (!isSuperAdmin(user)) {
      // An Admin cannot create announcements for another branch.
      announcementBranchId = getUserBranchId(user);
    } else if (
      announcementBranchId &&
      !isValidObjectId(announcementBranchId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID.",
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      audience,
      branchId: announcementBranchId,
      status: finalStatus,
      createdBy: userId,
      publishedAt:
        finalStatus === "Published"
          ? publishedAt || new Date()
          : null,
      scheduledAt:
        finalStatus === "Scheduled"
          ? scheduledAt
          : null,
      expiresAt,
    });

    const populatedAnnouncement = await Announcement.findById(
      announcement._id
    )
      .populate("createdBy", "fullName email")
      .populate("branchId", "name");

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      data: populatedAnnouncement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create announcement.",
    });
  }
};

// --------------------------------------------------
// UPDATE ANNOUNCEMENT
// PUT /api/announcements/:id
// --------------------------------------------------

const updateAnnouncement = async (req, res) => {
  try {
    const user = req.user;

    if (!canManageAnnouncements(user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update announcements.",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID.",
      });
    }

    const branchFilter = getBranchFilter(user);

    if (!branchFilter) {
      return res.status(403).json({
        success: false,
        message: "Your account is not assigned to a valid branch.",
      });
    }

    const announcement = await Announcement.findOne({
      _id: id,
      ...branchFilter,
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or access denied.",
      });
    }

    const editableFields = [
      "title",
      "description",
      "category",
      "priority",
      "audience",
      "status",
      "publishedAt",
      "scheduledAt",
      "expiresAt",
    ];

    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        announcement[field] = req.body[field];
      }
    }

    // Only Super Admin can change the announcement's branch.
    if (
      isSuperAdmin(user) &&
      req.body.branchId !== undefined
    ) {
      if (
        req.body.branchId &&
        !isValidObjectId(req.body.branchId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid branch ID.",
        });
      }

      announcement.branchId = req.body.branchId || null;
    }

    if (!ALLOWED_STATUSES.includes(announcement.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement status.",
      });
    }

    if (!isValidDate(announcement.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "A valid expiry date is required.",
      });
    }

    if (
      announcement.status === "Scheduled" &&
      !isValidDate(announcement.scheduledAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid scheduled date is required.",
      });
    }

    if (announcement.status === "Published") {
      if (!announcement.publishedAt) {
        announcement.publishedAt = new Date();
      }
    } else {
      announcement.publishedAt = null;
    }

    if (announcement.status !== "Scheduled") {
      announcement.scheduledAt = null;
    }

    await announcement.save();

    const updatedAnnouncement = await Announcement.findById(
      announcement._id
    )
      .populate("createdBy", "fullName email")
      .populate("branchId", "name");

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully.",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update announcement.",
    });
  }
};

// --------------------------------------------------
// UPDATE ANNOUNCEMENT STATUS
// PATCH /api/announcements/:id/status
// --------------------------------------------------

const updateAnnouncementStatus = async (req, res) => {
  try {
    const user = req.user;

    if (!canManageAnnouncements(user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can change announcement status.",
      });
    }

    const { id } = req.params;
    const { status, scheduledAt } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID.",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement status.",
      });
    }

    if (
      status === "Scheduled" &&
      !isValidDate(scheduledAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid scheduled date is required.",
      });
    }

    const branchFilter = getBranchFilter(user);

    if (!branchFilter) {
      return res.status(403).json({
        success: false,
        message: "Your account is not assigned to a valid branch.",
      });
    }

    const announcement = await Announcement.findOne({
      _id: id,
      ...branchFilter,
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or access denied.",
      });
    }

    announcement.status = status;
    announcement.publishedAt =
      status === "Published" ? new Date() : null;
    announcement.scheduledAt =
      status === "Scheduled" ? scheduledAt : null;

    await announcement.save();

    return res.status(200).json({
      success: true,
      message: `Announcement ${status.toLowerCase()} successfully.`,
      data: announcement,
    });
  } catch (error) {
    console.error("Update announcement status error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update announcement status.",
    });
  }
};

// --------------------------------------------------
// DUPLICATE ANNOUNCEMENT
// POST /api/announcements/:id/duplicate
// --------------------------------------------------

const duplicateAnnouncement = async (req, res) => {
  try {
    const user = req.user;
    const userId = getUserId(user);

    if (!canManageAnnouncements(user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can duplicate announcements.",
      });
    }

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is missing or invalid.",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID.",
      });
    }

    const branchFilter = getBranchFilter(user);

    if (!branchFilter) {
      return res.status(403).json({
        success: false,
        message: "Your account is not assigned to a valid branch.",
      });
    }

    const original = await Announcement.findOne({
      _id: id,
      ...branchFilter,
    });

    if (!original) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or access denied.",
      });
    }

    const duplicate = await Announcement.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      priority: original.priority,
      audience: original.audience,
      branchId: original.branchId,
      status: "Draft",
      createdBy: userId,
      publishedAt: null,
      scheduledAt: null,
      expiresAt: original.expiresAt,
    });

    const populatedDuplicate = await Announcement.findById(
      duplicate._id
    )
      .populate("createdBy", "fullName email")
      .populate("branchId", "name");

    return res.status(201).json({
      success: true,
      message: "Announcement duplicated as a draft.",
      data: populatedDuplicate,
    });
  } catch (error) {
    console.error("Duplicate announcement error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to duplicate announcement.",
    });
  }
};

// --------------------------------------------------
// DELETE ANNOUNCEMENT
// DELETE /api/announcements/:id
// --------------------------------------------------

const deleteAnnouncement = async (req, res) => {
  try {
    const user = req.user;

    if (!canManageAnnouncements(user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete announcements.",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID.",
      });
    }

    const branchFilter = getBranchFilter(user);

    if (!branchFilter) {
      return res.status(403).json({
        success: false,
        message: "Your account is not assigned to a valid branch.",
      });
    }

    const announcement = await Announcement.findOneAndDelete({
      _id: id,
      ...branchFilter,
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement.",
    });
  }
};

// --------------------------------------------------
// EXPORT CONTROLLERS
// --------------------------------------------------

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  duplicateAnnouncement,
  deleteAnnouncement,
};
