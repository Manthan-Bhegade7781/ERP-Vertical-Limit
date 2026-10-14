
const mongoose = require("mongoose");
const Timetable = require("../models/Timetable.model");
const Batch = require("../models/Batch");
const BatchSubject = require("../models/BatchSubject");

// Return the authenticated user's ID.
const getUserId = (user) => user?._id || user?.id;

// Support either a roles array or a single role.
const hasRole = (user, role) => {
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
      ? [user.role]
      : [];

  return roles.includes(role);
};

// Validate a 24-hour time string.
const isValidTime = (time) =>
  typeof time === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

// Convert a time to minutes for overlap checking.
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Check whether two time ranges overlap.
const timesOverlap = (start1, end1, start2, end2) =>
  timeToMinutes(start1) < timeToMinutes(end2) &&
  timeToMinutes(start2) < timeToMinutes(end1);

// Validate date and time input.
const validateSchedule = (scheduledDate, startTime, endTime) => {
  if (!scheduledDate || Number.isNaN(new Date(scheduledDate).getTime())) {
    return "A valid scheduled date is required";
  }

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return "Start time and end time must use HH:mm format";
  }

  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    return "End time must be later than start time";
  }

  return null;
};

// Return the start and end of the requested calendar date.
const getDayRange = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Populate timetable data for frontend display.
const timetablePopulate = [
  {
    path: "batchSubjectId",
    populate: [
      { path: "batchId", select: "name code standard branchId" },
      { path: "subjectId", select: "name code" },
      { path: "teacherId", select: "fullName email" },
    ],
  },
  { path: "branchId", select: "name code" },
  { path: "createdBy", select: "fullName email" },
];

// Check whether a user may access a particular branch.
const canAccessBranch = (user, branchId) => {
  if (hasRole(user, "super_admin")) {
    return true;
  }

  if (hasRole(user, "admin")) {
    return (
      user.branchId &&
      String(user.branchId) === String(branchId)
    );
  }

  return false;
};

// Find schedule conflicts for the selected date and time.
// The current entry is excluded when updating.
const findScheduleConflict = async ({
  branchId,
  batchSubject,
  scheduledDate,
  startTime,
  endTime,
  room,
  excludeId,
}) => {
  const range = getDayRange(scheduledDate);

  if (!range) {
    return "Invalid scheduled date";
  }

  const query = {
    scheduledDate: {
      $gte: range.start,
      $lte: range.end,
    },
    isRemoved: false,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingEntries = await Timetable.find(query)
    .populate("batchSubjectId", "batchId subjectId teacherId")
    .lean();

  for (const entry of existingEntries) {
    const existingAssignment = entry.batchSubjectId;

    if (!existingAssignment) {
      continue;
    }

    if (
      !timesOverlap(
        startTime,
        endTime,
        entry.startTime,
        entry.endTime
      )
    ) {
      continue;
    }

    const sameTeacher =
      String(existingAssignment.teacherId) ===
      String(batchSubject.teacherId);

    const sameBatch =
      String(existingAssignment.batchId) ===
      String(batchSubject.batchId);

    const sameRoom =
      room?.trim() &&
      entry.room?.trim() &&
      room.trim().toLowerCase() ===
        entry.room.trim().toLowerCase();

    if (sameTeacher) {
      return "This teacher already has a class during the selected time";
    }

    if (sameBatch) {
      return "This batch already has a class during the selected time";
    }

    if (
      sameRoom &&
      String(entry.branchId) === String(branchId)
    ) {
      return "This room is already booked during the selected time";
    }
  }

  return null;
};

// CREATE TIMETABLE ENTRY
const createTimetable = async (req, res) => {
  try {
    const {
      batchSubjectId,
      scheduledDate,
      startTime,
      endTime,
      room = "",
      type = "lecture",
    } = req.body;

    const validationError = validateSchedule(
      scheduledDate,
      startTime,
      endTime
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (!mongoose.isValidObjectId(batchSubjectId)) {
      return res.status(400).json({
        success: false,
        message: "A valid batchSubjectId is required",
      });
    }

    if (!["lecture", "lab", "exam"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be lecture, lab, or exam",
      });
    }

    const assignment = await BatchSubject.findById(batchSubjectId)
      .populate("batchId");

    if (!assignment || assignment.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active batch-subject assignment not found",
      });
    }

    const batch = assignment.batchId;

    if (!batch || batch.isRemoved) {
      return res.status(400).json({
        success: false,
        message: "The selected batch is unavailable",
      });
    }

    if (!canAccessBranch(req.user, batch.branchId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot create a timetable for this branch",
      });
    }

    const conflict = await findScheduleConflict({
      branchId: batch.branchId,
      batchSubject: assignment,
      scheduledDate,
      startTime,
      endTime,
      room,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: conflict,
      });
    }

    const timetable = await Timetable.create({
      batchSubjectId: assignment._id,
      branchId: batch.branchId,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      room: room.trim(),
      type,
      createdBy: getUserId(req.user),
    });

    const result = await Timetable.findById(timetable._id)
      .populate(timetablePopulate);

    return res.status(201).json({
      success: true,
      message: "Timetable entry created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create timetable error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create timetable entry",
    });
  }
};

// GET TIMETABLE ENTRIES
// Supports ?date=YYYY-MM-DD or ?startDate=...&endDate=...
const getTimetable = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let range;

    if (date) {
      range = getDayRange(date);
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate or endDate",
        });
      }

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "startDate must be before or equal to endDate",
        });
      }

      range = { start, end };
    }

    if ((date && !range) || (!date && Boolean(startDate) !== Boolean(endDate))) {
      return res.status(400).json({
        success: false,
        message: "Provide date or both startDate and endDate",
      });
    }

    const query = { isRemoved: false };

    if (range) {
      query.scheduledDate = {
        $gte: range.start,
        $lte: range.end,
      };
    }

    // Super Admin: all branches.
    // Admin: their own branch.
    if (hasRole(req.user, "admin") &&
        !hasRole(req.user, "super_admin")) {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: "Your account has no assigned branch",
        });
      }

      query.branchId = req.user.branchId;
    }

    // Teacher: only timetable entries for their assignments.
    if (hasRole(req.user, "teacher")) {
      const assignments = await BatchSubject.find({
        teacherId: getUserId(req.user),
        status: "active",
      }).select("_id");

      query.batchSubjectId = {
        $in: assignments.map((item) => item._id),
      };
    }

    // Student: filter by the student's enrolled batch.
    // This assumes the authenticated user has batchId.
    // Adjust this lookup if enrollment is stored in another model.
    if (hasRole(req.user, "student")) {
      const studentBatchId = req.user.batchId;

      if (!studentBatchId) {
        return res.status(403).json({
          success: false,
          message:
            "Student batch enrollment must be connected before timetable access",
        });
      }

      const assignments = await BatchSubject.find({
        batchId: studentBatchId,
        status: "active",
      }).select("_id");

      query.batchSubjectId = {
        $in: assignments.map((item) => item._id),
      };
    }

    const entries = await Timetable.find(query)
      .populate(timetablePopulate)
      .sort({ scheduledDate: 1, startTime: 1 });

    const summary = {
      totalClasses: entries.length,
      lectures: entries.filter((item) => item.type === "lecture").length,
      labs: entries.filter((item) => item.type === "lab").length,
      exams: entries.filter((item) => item.type === "exam").length,
    };

    return res.status(200).json({
      success: true,
      count: entries.length,
      summary,
      data: entries,
    });
  } catch (error) {
    console.error("Get timetable error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
    });
  }
};

// UPDATE TIMETABLE ENTRY
const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID",
      });
    }

    const existing = await Timetable.findOne({
      _id: id,
      isRemoved: false,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    if (!canAccessBranch(req.user, existing.branchId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this timetable entry",
      });
    }

    const scheduledDate =
      req.body.scheduledDate ?? existing.scheduledDate;
    const startTime = req.body.startTime ?? existing.startTime;
    const endTime = req.body.endTime ?? existing.endTime;
    const room = req.body.room ?? existing.room;
    const type = req.body.type ?? existing.type;
    const batchSubjectId =
      req.body.batchSubjectId ?? existing.batchSubjectId;

    const validationError = validateSchedule(
      scheduledDate,
      startTime,
      endTime
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (!["lecture", "lab", "exam"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable type",
      });
    }

    if (!mongoose.isValidObjectId(batchSubjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batchSubjectId",
      });
    }

    const assignment = await BatchSubject.findById(batchSubjectId)
      .populate("batchId");

    if (
      !assignment ||
      assignment.status !== "active" ||
      !assignment.batchId ||
      assignment.batchId.isRemoved
    ) {
      return res.status(400).json({
        success: false,
        message: "The selected batch-subject assignment is unavailable",
      });
    }

    const batch = assignment.batchId;

    if (!canAccessBranch(req.user, batch.branchId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot move this entry to that branch",
      });
    }

    const conflict = await findScheduleConflict({
      branchId: batch.branchId,
      batchSubject: assignment,
      scheduledDate,
      startTime,
      endTime,
      room,
      excludeId: existing._id,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: conflict,
      });
    }

    existing.batchSubjectId = assignment._id;
    existing.branchId = batch.branchId;
    existing.scheduledDate = new Date(scheduledDate);
    existing.startTime = startTime;
    existing.endTime = endTime;
    existing.room = room.trim();
    existing.type = type;

    await existing.save();

    const result = await Timetable.findById(existing._id)
      .populate(timetablePopulate);

    return res.status(200).json({
      success: true,
      message: "Timetable entry updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update timetable error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update timetable entry",
    });
  }
};

// SOFT-REMOVE TIMETABLE ENTRY
const removeTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID",
      });
    }

    const timetable = await Timetable.findOne({
      _id: id,
      isRemoved: false,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    if (!canAccessBranch(req.user, timetable.branchId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot remove this timetable entry",
      });
    }

    timetable.isRemoved = true;
    timetable.removedAt = new Date();

    await timetable.save();

    return res.status(200).json({
      success: true,
      message: "Timetable entry removed successfully",
    });
  } catch (error) {
    console.error("Remove timetable error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove timetable entry",
    });
  }
};

module.exports = {
  createTimetable,
  getTimetable,
  updateTimetable,
  removeTimetable,
};
