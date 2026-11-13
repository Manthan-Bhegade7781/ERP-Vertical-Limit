const AcademicCalendar = require("../models/academicCalendar.model");

// Helper: check whether the current user is a Super Admin
const isSuperAdmin = (user) => {
  return user?.roles?.includes("super_admin");
};

// Helper: get the user's branch ID as a string
const getBranchId = (user) => {
  if (!user?.branchId) {
    return null;
  }

  return user.branchId._id
    ? user.branchId._id.toString()
    : user.branchId.toString();
};

// Helper: validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper: determine whether an event belongs to the user's scope
const canAccessEvent = (event, user) => {
  if (isSuperAdmin(user)) {
    return true;
  }

  const userBranchId = getBranchId(user);

  // An Admin must have a branch assigned.
  if (!userBranchId) {
    return false;
  }

  // Admins can access events for their branch and global events.
  return (
    !event.branchId ||
    event.branchId.toString() === userBranchId
  );
};

// GET /api/academic-calendar
// Get calendar events with optional filters
const getAcademicCalendarEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      branchId,
      month,
      year,
    } = req.query;

    const filter = {
      isActive: true,
      deletedAt: null,
    };

    // Branch access rules
    if (isSuperAdmin(req.user)) {
      if (branchId !== undefined) {
        if (branchId === "all") {
          // Show events from every branch and global events.
        } else if (branchId === "global") {
          filter.branchId = null;
        } else {
          if (!isValidObjectId(branchId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid branch ID",
            });
          }

          filter.branchId = branchId;
        }
      }
    } else {
      let userBranchId = getBranchId(req.user);

      if (!userBranchId && req.user.roles?.includes("student")) {
        try {
          const Student = require("../models/Student");
          const student = await Student.findOne({ userId: req.user._id }).populate("batchId");
          if (student?.batchId?.branchId) {
            userBranchId = student.batchId.branchId.toString();
          }
        } catch (lookupErr) {
          // Graceful fallback
        }
      }

      if (userBranchId) {
        // Users can see their own branch events and global events.
        filter.$or = [
          { branchId: userBranchId },
          { branchId: null },
        ];
      } else {
        // Fallback to global events
        filter.branchId = null;
      }
    }

    // Filter by category
    if (category && category !== "all") {
      filter.category = category;
    }

    // Search by title or description
    if (search && search.trim()) {
      const searchFilter = {
        $or: [
          {
            title: {
              $regex: search.trim(),
              $options: "i",
            },
          },
          {
            description: {
              $regex: search.trim(),
              $options: "i",
            },
          },
        ],
      };

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          searchFilter,
        ];

        delete filter.$or;
      } else {
        Object.assign(filter, searchFilter);
      }
    }

    // Filter by month and year
    if (month !== undefined || year !== undefined) {
      const currentYear = new Date().getFullYear();

      const selectedYear =
        year !== undefined ? Number(year) : currentYear;

      const selectedMonth =
        month !== undefined ? Number(month) : null;

      if (
        !Number.isInteger(selectedYear) ||
        selectedYear < 2000 ||
        selectedYear > 2100
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      if (
        selectedMonth !== null &&
        (!Number.isInteger(selectedMonth) ||
          selectedMonth < 1 ||
          selectedMonth > 12)
      ) {
        return res.status(400).json({
          success: false,
          message: "Month must be between 1 and 12",
        });
      }

      const startDate =
        selectedMonth === null
          ? new Date(selectedYear, 0, 1)
          : new Date(selectedYear, selectedMonth - 1, 1);

      const endDate =
        selectedMonth === null
          ? new Date(selectedYear + 1, 0, 1)
          : new Date(selectedYear, selectedMonth, 1);

      filter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const events = await AcademicCalendar.find(filter)
      .populate("branchId", "name")
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email")
      .sort({ date: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error(
      "Get Academic Calendar Events Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch academic calendar events",
    });
  }
};

// POST /api/academic-calendar
// Create a calendar event
const createAcademicCalendarEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      category,
      branchId,
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event title is required",
      });
    }

    if (!date || Number.isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "A valid event date is required",
      });
    }

    const allowedCategories = [
      "Academic",
      "Examination",
      "Holiday",
      "Meeting",
      "Event",
      "Other",
    ];

    const selectedCategory = category || "Academic";

    if (!allowedCategories.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event category",
      });
    }

    let selectedBranchId = null;

    if (isSuperAdmin(req.user)) {
      // Super Admin can create a global event or select a branch.
      if (
        branchId &&
        branchId !== "all" &&
        branchId !== "global"
      ) {
        if (!isValidObjectId(branchId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid branch ID",
          });
        }

        selectedBranchId = branchId;
      }
    } else {
      // Admin can create events only for their own branch.
      selectedBranchId = getBranchId(req.user);

      if (!selectedBranchId) {
        return res.status(403).json({
          success: false,
          message: "No branch is assigned to your account",
        });
      }
    }

    const event = await AcademicCalendar.create({
      title: title.trim(),
      description: description || "",
      date: new Date(date),
      category: selectedCategory,
      branchId: selectedBranchId,
      createdBy: req.user._id,
    });

    const populatedEvent = await AcademicCalendar.findById(
      event._id
    )
      .populate("branchId", "name")
      .populate("createdBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Academic calendar event created successfully",
      data: populatedEvent,
    });
  } catch (error) {
    console.error(
      "Create Academic Calendar Event Error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create academic calendar event",
    });
  }
};

// PUT /api/academic-calendar/:id
// Update a calendar event
const updateAcademicCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await AcademicCalendar.findOne({
      _id: id,
      isActive: true,
      deletedAt: null,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Academic calendar event not found",
      });
    }

    if (!canAccessEvent(event, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this calendar event",
      });
    }

    const {
      title,
      description,
      date,
      category,
      branchId,
    } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Event title cannot be empty",
        });
      }

      event.title = title.trim();
    }

    if (description !== undefined) {
      event.description = description;
    }

    if (date !== undefined) {
      if (!date || Number.isNaN(Date.parse(date))) {
        return res.status(400).json({
          success: false,
          message: "A valid event date is required",
        });
      }

      event.date = new Date(date);
    }

    if (category !== undefined) {
      const allowedCategories = [
        "Academic",
        "Examination",
        "Holiday",
        "Meeting",
        "Event",
        "Other",
      ];

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event category",
        });
      }

      event.category = category;
    }

    // Only Super Admin can change an event's branch.
    if (branchId !== undefined) {
      if (!isSuperAdmin(req.user)) {
        return res.status(403).json({
          success: false,
          message: "Only Super Admin can change the event branch",
        });
      }

      if (
        branchId === null ||
        branchId === "" ||
        branchId === "global"
      ) {
        event.branchId = null;
      } else {
        if (!isValidObjectId(branchId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid branch ID",
          });
        }

        event.branchId = branchId;
      }
    }

    event.updatedBy = req.user._id;

    await event.save();

    const updatedEvent = await AcademicCalendar.findById(
      event._id
    )
      .populate("branchId", "name")
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Academic calendar event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error(
      "Update Academic Calendar Event Error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update academic calendar event",
    });
  }
};

// DELETE /api/academic-calendar/:id
// Soft-delete a calendar event
const deleteAcademicCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await AcademicCalendar.findOne({
      _id: id,
      isActive: true,
      deletedAt: null,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Academic calendar event not found",
      });
    }

    if (!canAccessEvent(event, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this calendar event",
      });
    }

    event.isActive = false;
    event.deletedAt = new Date();
    event.deletedBy = req.user._id;
    event.updatedBy = req.user._id;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Academic calendar event deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Academic Calendar Event Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete academic calendar event",
    });
  }
};

module.exports = {
  getAcademicCalendarEvents,
  createAcademicCalendarEvent,
  updateAcademicCalendarEvent,
  deleteAcademicCalendarEvent,
};