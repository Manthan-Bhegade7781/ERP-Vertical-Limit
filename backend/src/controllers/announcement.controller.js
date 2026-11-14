const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");
const User = require("../models/User");
const Student = require("../models/Student");
const createNotification = require("../utils/createNotification");

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

// Validate MongoDB ObjectId.
const isValidObjectId = (id) => {
  if (id === undefined || id === null || id === "") {
    return false;
  }

  return mongoose.Types.ObjectId.isValid(id.toString());
};

// Extract user roles.
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

// Check Super Admin.
const isSuperAdmin = (user) =>
  getUserRoles(user).includes("super_admin");

// Check announcement management permission.
const canManageAnnouncements = (user) =>
  getUserRoles(user).some((role) =>
    ["super_admin", "admin"].includes(role)
  );

// Get authenticated user's branch.
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

// Get branch filter.
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

// Allowed statuses.
const ALLOWED_STATUSES = [
  "Draft",
  "Published",
  "Scheduled",
  "Expired",
];

// Validate date.
const isValidDate = (value) =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  !Number.isNaN(Date.parse(value));

// Get authenticated user ID.
const getUserId = (user) =>
  user?._id ?? user?.id ?? null;

// --------------------------------------------------
// NORMALIZE TARGET TEACHERS
// --------------------------------------------------

// targetTeachers must contain User account IDs.
// Do not use Teacher profile IDs.

const normalizeTargetTeachers = async (value) => {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    const error = new Error(
      "targetTeachers must be an array of teacher User IDs."
    );

    error.statusCode = 400;
    throw error;
  }

  const ids = [
    ...new Set(
      value.map((id) => String(id).trim())
    ),
  ];

  if (ids.some((id) => !isValidObjectId(id))) {
    const error = new Error(
      "One or more selected teacher IDs are invalid."
    );

    error.statusCode = 400;
    throw error;
  }

  if (ids.length === 0) {
    return [];
  }

  // Verify selected IDs belong to teacher accounts.
  const teachers = await User.find({
    _id: {
      $in: ids,
    },
    roles: "teacher",
  }).select("_id");

  if (teachers.length !== ids.length) {
    const error = new Error(
      "One or more selected users are not valid teacher accounts."
    );

    error.statusCode = 400;
    throw error;
  }

  return ids;
};

// Notify target users when an announcement is published
const notifyAnnouncementRecipients = async (announcement) => {
  try {
    if (!announcement || announcement.status !== "Published") return;

    let targetRoles = ["student"];
    const audience = announcement.audience;

    if (audience === "All Users" || audience === "Students & Teachers") {
      targetRoles = ["student", "teacher"];
    } else if (
      audience === "Teachers" ||
      audience === "Academic Staff" ||
      audience === "Staff"
    ) {
      targetRoles = ["teacher"];
    } else if (
      audience === "All Students" ||
      audience === "Students"
    ) {
      targetRoles = ["student"];
    }

    const userQuery = {
      roles: { $in: targetRoles },
      status: "active",
    };

    if (announcement.branchId) {
      userQuery.$or = [
        { branchId: announcement.branchId },
        { branchId: null },
      ];
    }

    const recipients = await User.find(userQuery).select("_id");
    const notifications = recipients.map((r) =>
      createNotification({
        recipient: r._id,
        title: `Announcement: ${announcement.title}`,
        message: announcement.description
          ? announcement.description.slice(0, 160)
          : "A new announcement has been published.",
        type: "announcement",
        icon: "bullhorn-outline",
        link: "/announcements",
      })
    );

    await Promise.allSettled(notifications);
  } catch (error) {
    console.error("notifyAnnouncementRecipients error:", error.message);
  }
};

// --------------------------------------------------
// GET ANNOUNCEMENTS
// GET /api/announcements
// --------------------------------------------------

const getAnnouncements = async (req, res) => {
  try {
    const user = req.user;
    const roles = getUserRoles(user);

    let filter = {};

    let branchId = getUserBranchId(user);
    if (!branchId && roles.includes("student")) {
      const student = await Student.findOne({ userId: user._id }).populate("batchId");
      if (student?.batchId?.branchId) {
        branchId = student.batchId.branchId;
      }
    }

    if (!isSuperAdmin(user)) {
      if (branchId && isValidObjectId(branchId)) {
        // Include announcements for the user's branch and
        // institute-wide announcements (branchId: null).
        filter.$or = [
          { branchId },
          { branchId: null },
        ];
      } else {
        // Institute-wide announcements
        filter.branchId = null;
      }
    }

    // ----------------------------------------------
    // STUDENT AND TEACHER VISIBILITY
    // ----------------------------------------------

    if (!canManageAnnouncements(user)) {
      const isStudent = roles.includes("student");
      const isTeacher = roles.includes("teacher");

      if (!isStudent && !isTeacher) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view announcements.",
        });
      }

      // Students and teachers see published announcements for their audience.
      filter.status = "Published";

      const audiences = [];

      // Student audiences.
      if (isStudent) {
        audiences.push(
          "All Users",
          "All Students",
          "Students",
          "Students & Teachers"
        );
      }

      // Teacher audiences.
      // OPTION A:
      // Teachers must NOT receive All Students or Students announcements.
      if (isTeacher) {
        audiences.push(
          "All Users",
          "Teachers",
          "Students & Teachers",
          "Academic Staff",
          "Staff"
        );
      }

      const uniqueAudiences = [
        ...new Set(audiences),
      ];

      const visibilityRules = [];

      const userId = getUserId(user);

      // --------------------------------------------
      // TEACHER VISIBILITY
      // --------------------------------------------

      if (
        isTeacher &&
        userId &&
        isValidObjectId(userId)
      ) {
        // Rule 1:
        // General announcements without teacher targeting.
        // Audience must be compatible with teachers.

        visibilityRules.push({
          $and: [
            {
              $or: [
                {
                  targetTeachers: {
                    $size: 0,
                  },
                },
                {
                  targetTeachers: {
                    $exists: false,
                  },
                },
              ],
            },
            {
              audience: {
                $in: uniqueAudiences,
              },
            },
          ],
        });

        // Rule 2:
        // Individually targeted announcements.
        // Both teacher ID and audience must match.

        visibilityRules.push({
          $and: [
            {
              targetTeachers: userId,
            },
            {
              audience: {
                $in: uniqueAudiences,
              },
            },
          ],
        });
      } else {
        // ------------------------------------------
        // STUDENT VISIBILITY
        // ------------------------------------------

        visibilityRules.push({
          $and: [
            {
              $or: [
                {
                  targetTeachers: {
                    $size: 0,
                  },
                },
                {
                  targetTeachers: {
                    $exists: false,
                  },
                },
              ],
            },
            {
              audience: {
                $in: uniqueAudiences,
              },
            },
          ],
        });
      }

      // Preserve the existing branch $or condition.
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: visibilityRules,
        },
      ];
    }

    // ----------------------------------------------
    // FETCH ANNOUNCEMENTS
    // ----------------------------------------------

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "fullName email")
      .populate("branchId", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });

  } catch (error) {
    console.error(
      "Get announcements error:",
      error
    );

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

    if (!canManageAnnouncements(user)) {
      return res.status(403).json({
        success: false,
        message:
          "Only admins can create announcements.",
        receivedRoles: roles.length
          ? roles
          : ["missing"],
      });
    }

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user ID is missing or invalid.",
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
      targetTeachers,
    } = req.body;

    // Validate title and description.
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title and description are required.",
      });
    }

    // Validate expiry.
    if (!isValidDate(expiresAt)) {
      return res.status(400).json({
        success: false,
        message:
          "A valid expiry date is required.",
      });
    }

    const finalStatus = status || "Draft";

    if (!ALLOWED_STATUSES.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement status.",
      });
    }

    // Validate scheduled date.
    if (
      finalStatus === "Scheduled" &&
      !isValidDate(scheduledAt)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid scheduled date is required.",
      });
    }

    // Validate publication date.
    if (
      publishedAt !== undefined &&
      publishedAt !== null &&
      publishedAt !== "" &&
      !isValidDate(publishedAt)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid publication date.",
      });
    }

    const branchFilter = getBranchFilter(user);

    if (!branchFilter) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not assigned to a valid branch.",
      });
    }

    let announcementBranchId = branchId || null;

    if (!isSuperAdmin(user)) {
      // Admin cannot create announcements for another branch.
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

    // Validate selected teacher accounts.
    let normalizedTargetTeachers;

    try {
      normalizedTargetTeachers =
        await normalizeTargetTeachers(targetTeachers);
    } catch (validationError) {
      return res.status(
        validationError.statusCode || 400
      ).json({
        success: false,
        message: validationError.message,
      });
    }

    // Create announcement.
    const announcement = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      audience,
      targetTeachers: normalizedTargetTeachers,
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

    const populatedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate("createdBy", "fullName email")
        .populate("branchId", "name")
        .populate("targetTeachers", "fullName email");

    if (finalStatus === "Published") {
      notifyAnnouncementRecipients(populatedAnnouncement).catch((err) =>
        console.error("Announcement notification broadcast error:", err)
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Announcement created successfully.",
      data: populatedAnnouncement,
    });

  } catch (error) {
    console.error(
      "Create announcement error:",
      error
    );

    if (
      error.statusCode ||
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(
        error.statusCode || 400
      ).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create announcement.",
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
        message:
          "Only admins can update announcements.",
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
        message:
          "Your account is not assigned to a valid branch.",
      });
    }

    const announcement = await Announcement.findOne({
      _id: id,
      ...branchFilter,
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found or access denied.",
      });
    }

    // Update selected teachers.
    if (req.body.targetTeachers !== undefined) {
      try {
        announcement.targetTeachers =
          await normalizeTargetTeachers(
            req.body.targetTeachers
          );
      } catch (validationError) {
        return res.status(
          validationError.statusCode || 400
        ).json({
          success: false,
          message: validationError.message,
        });
      }
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

    // Only Super Admin can change the branch.
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

      announcement.branchId =
        req.body.branchId || null;
    }

    if (
      !ALLOWED_STATUSES.includes(
        announcement.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement status.",
      });
    }

    if (!isValidDate(announcement.expiresAt)) {
      return res.status(400).json({
        success: false,
        message:
          "A valid expiry date is required.",
      });
    }

    if (
      announcement.status === "Scheduled" &&
      !isValidDate(announcement.scheduledAt)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid scheduled date is required.",
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

    const updatedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate("createdBy", "fullName email")
        .populate("branchId", "name")
        .populate("targetTeachers", "fullName email");

    if (announcement.status === "Published") {
      notifyAnnouncementRecipients(updatedAnnouncement).catch((err) =>
        console.error("Announcement notification broadcast error:", err)
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement updated successfully.",
      data: updatedAnnouncement,
    });

  } catch (error) {
    console.error(
      "Update announcement error:",
      error
    );

    if (
      error.statusCode ||
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(
        error.statusCode || 400
      ).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update announcement.",
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
        message:
          "Only admins can change announcement status.",
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
        message:
          "Invalid announcement status.",
      });
    }

    if (
      status === "Scheduled" &&
      !isValidDate(scheduledAt)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid scheduled date is required.",
      });
    }

    const branchFilter = getBranchFilter(user);

    if (!branchFilter) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not assigned to a valid branch.",
      });
    }

    const announcement = await Announcement.findOne({
      _id: id,
      ...branchFilter,
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found or access denied.",
      });
    }

    announcement.status = status;

    announcement.publishedAt =
      status === "Published"
        ? new Date()
        : null;

    announcement.scheduledAt =
      status === "Scheduled"
        ? scheduledAt
        : null;

    await announcement.save();

    if (status === "Published") {
      notifyAnnouncementRecipients(announcement).catch((err) =>
        console.error("Announcement notification broadcast error:", err)
      );
    }

    return res.status(200).json({
      success: true,
      message:
        `Announcement ${status.toLowerCase()} successfully.`,
      data: announcement,
    });

  } catch (error) {
    console.error(
      "Update announcement status error:",
      error
    );

    if (
      error.statusCode ||
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(
        error.statusCode || 400
      ).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update announcement status.",
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
        message:
          "Only admins can duplicate announcements.",
      });
    }

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user ID is missing or invalid.",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID.",
      });
    }

    let dupQuery = {
      _id: id,
    };

    if (!isSuperAdmin(user)) {
      const branchId = getUserBranchId(user);

      if (!branchId || !isValidObjectId(branchId)) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is not assigned to a valid branch.",
        });
      }

      dupQuery.$or = [
        {
          branchId,
        },
        {
          branchId: null,
        },
      ];
    }

    const original = await Announcement.findOne(
      dupQuery
    );

    if (!original) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found or access denied.",
      });
    }

    const duplicate = await Announcement.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      priority: original.priority,
      audience: original.audience,

      // Preserve selected teachers in the draft copy.
      targetTeachers: original.targetTeachers || [],

      branchId: isSuperAdmin(user)
        ? original.branchId
        : getUserBranchId(user),

      status: "Draft",
      createdBy: userId,
      publishedAt: null,
      scheduledAt: null,
      expiresAt: original.expiresAt,
    });

    const populatedDuplicate =
      await Announcement.findById(duplicate._id)
        .populate("createdBy", "fullName email")
        .populate("branchId", "name")
        .populate("targetTeachers", "fullName email");

    return res.status(201).json({
      success: true,
      message:
        "Announcement duplicated as a draft.",
      data: populatedDuplicate,
    });

  } catch (error) {
    console.error(
      "Duplicate announcement error:",
      error
    );

    if (
      error.statusCode ||
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(
        error.statusCode || 400
      ).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to duplicate announcement.",
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
        message:
          "Only admins can delete announcements.",
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
        message:
          "Your account is not assigned to a valid branch.",
      });
    }

    const announcement =
      await Announcement.findOneAndDelete({
        _id: id,
        ...branchFilter,
      });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete announcement.",
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