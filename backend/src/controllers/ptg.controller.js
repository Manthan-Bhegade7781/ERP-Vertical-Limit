const mongoose = require("mongoose");

const PTG = require("../models/PTG");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Batch = require("../models/Batch");

const createNotification = require("../utils/createNotification");

// ============================================================
// POPULATE PTG MEETING DETAILS
// ============================================================

const populatePTG = (query) => {
  return query
    .populate({
      path: "studentId",
      select: "studentId guardianName guardianMobile status userId batchId",
      populate: [
        {
          path: "userId",
          select: "fullName email mobileNumber status roles",
        },
        {
          path: "batchId",
          select: "name code standard academicYear branchId",
        },
      ],
    })
    .populate({
      path: "teacherId",
      select: "employeeId specialization qualification status userId",
      populate: {
        path: "userId",
        select: "fullName email mobileNumber status roles",
      },
    })
    .populate("createdBy", "fullName email");
};

// ============================================================
// COMMON HELPERS
// ============================================================

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleError = (res, error, message = "Something went wrong.") => {
  console.error("PTG Controller Error:", error);

  return res.status(500).json({
    success: false,
    message,
  });
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ============================================================
// NOTIFICATION HELPER
// ============================================================

/**
 * Sends PTG notifications to:
 * 1. Active Super Admins
 * 2. The relevant teacher
 * 3. The student's linked user account
 *
 * Notification failures must never interrupt PTG operations.
 */
const sendPTGNotifications = async ({
  student,
  teacher,
  title,
  message,
  excludeUserId = null,
}) => {
  try {
    const recipients = new Map();

    // Add active Super Admin accounts.
    const superAdmins = await User.find({
      roles: "super_admin",
      status: "active",
    }).select("_id");

    for (const admin of superAdmins) {
      recipients.set(admin._id.toString(), admin._id);
    }

    // Add the teacher's user account.
    if (teacher && teacher.userId) {
      const teacherUserId = teacher.userId._id || teacher.userId;

      if (isValidId(teacherUserId)) {
        recipients.set(
          teacherUserId.toString(),
          teacherUserId
        );
      }
    }

    // Add the student's linked user account.
    if (student && student.userId) {
      const studentUserId = student.userId._id || student.userId;

      if (isValidId(studentUserId)) {
        recipients.set(
          studentUserId.toString(),
          studentUserId
        );
      }
    }

    // Do not send duplicate notifications to the authenticated actor.
    if (excludeUserId && isValidId(excludeUserId)) {
      recipients.delete(excludeUserId.toString());
    }

    if (recipients.size === 0) {
      return;
    }

    // Notification errors are isolated from the main PTG operation.
    const results = await Promise.allSettled(
      Array.from(recipients.values()).map((recipient) =>
        createNotification({
          recipient,
          title,
          message,
          type: "general",
          icon: "calendar-clock",
          link: "/ptg",
        })
      )
    );

    const failures = results.filter(
      (result) => result.status === "rejected"
    );

    if (failures.length > 0) {
      console.error(
        `${failures.length} PTG notification(s) could not be created.`
      );
    }
  } catch (error) {
    console.error("PTG notification error:", error.message);
  }
};

// ============================================================
// CREATE PTG MEETING
// POST /api/ptg
// ============================================================

const createPTG = async (req, res) => {
  try {
    const {
      studentId,
      teacherId,
      meetingDate,
      purpose,
      notes,
    } = req.body;

    if (!studentId || !teacherId || !meetingDate || !purpose) {
      return res.status(400).json({
        success: false,
        message:
          "Student, teacher, meeting date, and purpose are required.",
      });
    }

    if (!isValidId(studentId) || !isValidId(teacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student or teacher ID.",
      });
    }

    const parsedDate = new Date(meetingDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid meeting date.",
      });
    }

    if (
      typeof purpose !== "string" ||
      !purpose.trim() ||
      purpose.trim().length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Purpose must contain between 1 and 500 characters.",
      });
    }

    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({
        success: false,
        message: "Notes must be text.",
      });
    }

    if (notes && notes.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 2000 characters.",
      });
    }

    // Find and validate the student.
    const student = await Student.findById(studentId).populate({
      path: "userId",
      select: "fullName status roles",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    if (student.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot schedule a meeting for an inactive student.",
      });
    }

    if (
      !student.userId ||
      student.userId.status !== "active" ||
      !student.userId.roles.includes("student")
    ) {
      return res.status(400).json({
        success: false,
        message: "The student's user account is not active.",
      });
    }

    // Find and validate the teacher.
    const teacher = await Teacher.findById(teacherId).populate({
      path: "userId",
      select: "fullName status roles",
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    if (teacher.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot schedule a meeting with an inactive teacher.",
      });
    }

    if (
      !teacher.userId ||
      teacher.userId.status !== "active" ||
      !teacher.userId.roles.includes("teacher")
    ) {
      return res.status(400).json({
        success: false,
        message: "The teacher's user account is not active.",
      });
    }

    // Create the PTG meeting.
    const meeting = await PTG.create({
      studentId,
      teacherId,
      meetingDate: parsedDate,
      purpose: purpose.trim(),
      notes: notes ? notes.trim() : "",
      status: "Scheduled",
      createdBy: req.user._id,
    });

    const populatedMeeting = await populatePTG(
      PTG.findById(meeting._id)
    );

    // Send notifications without interrupting meeting creation.
    const studentName = student.userId.fullName;
    const teacherName = teacher.userId.fullName;

    await sendPTGNotifications({
      student,
      teacher,
      title: "PTG Meeting Scheduled",
      message: `A PTG meeting has been scheduled for student ${studentName} with teacher ${teacherName} on ${parsedDate.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      })}.`,
      excludeUserId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "PTG meeting scheduled successfully.",
      data: populatedMeeting,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return handleError(
      res,
      error,
      "Failed to schedule PTG meeting."
    );
  }
};

// ============================================================
// GET ALL PTG MEETINGS
// GET /api/ptg
// ============================================================

const getPTGMeetings = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = 1,
      limit = 20,
    } = req.query;

    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage < 1 ||
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values.",
      });
    }

    const filter = {};

    if (status) {
      const allowedStatuses = [
        "Scheduled",
        "Completed",
        "Pending",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid PTG meeting status.",
        });
      }

      filter.status = status;
    }

    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");

      const [
        matchingStudents,
        matchingTeachers,
        matchingUsers,
        matchingBatches,
      ] = await Promise.all([
        Student.find({
          $or: [
            { studentId: regex },
            { guardianName: regex },
            { guardianMobile: regex },
          ],
        }).select("_id userId batchId"),

        Teacher.find({
          employeeId: regex,
        }).select("_id userId"),

        User.find({
          fullName: regex,
        }).select("_id"),

        Batch.find({
          $or: [
            { name: regex },
            { code: regex },
          ],
        }).select("_id"),
      ]);

      const matchingUserIds = matchingUsers.map(
        (user) => user._id
      );

      const [
        studentsByName,
        teachersByName,
        studentsByBatch,
      ] = await Promise.all([
        Student.find({
          userId: { $in: matchingUserIds },
        }).select("_id"),

        Teacher.find({
          userId: { $in: matchingUserIds },
        }).select("_id"),

        Student.find({
          batchId: {
            $in: matchingBatches.map((batch) => batch._id),
          },
        }).select("_id"),
      ]);

      const studentIds = [
        ...matchingStudents.map((student) => student._id),
        ...studentsByName.map((student) => student._id),
        ...studentsByBatch.map((student) => student._id),
      ];

      const teacherIds = [
        ...matchingTeachers.map((teacher) => teacher._id),
        ...teachersByName.map((teacher) => teacher._id),
      ];

      filter.$or = [
        { studentId: { $in: studentIds } },
        { teacherId: { $in: teacherIds } },
        { purpose: regex },
      ];
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [meetings, total] = await Promise.all([
      populatePTG(
        PTG.find(filter)
          .sort({ meetingDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(parsedLimit)
      ),

      PTG.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "PTG meetings retrieved successfully.",
      data: {
        meetings,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit),
        },
      },
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to retrieve PTG meetings."
    );
  }
};

// ============================================================
// GET PTG STATISTICS
// GET /api/ptg/stats
// ============================================================

const getPTGStats = async (req, res) => {
  try {
    const [
      total,
      scheduled,
      completed,
      pending,
      upcoming,
    ] = await Promise.all([
      PTG.countDocuments(),

      PTG.countDocuments({
        status: "Scheduled",
      }),

      PTG.countDocuments({
        status: "Completed",
      }),

      PTG.countDocuments({
        status: "Pending",
      }),

      PTG.countDocuments({
        status: "Scheduled",
        meetingDate: {
          $gte: new Date(),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "PTG statistics retrieved successfully.",
      data: {
        total,
        scheduled,
        completed,
        pending,
        upcoming,
      },
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to retrieve PTG statistics."
    );
  }
};

// ============================================================
// GET PTG MEETING BY ID
// GET /api/ptg/:id
// ============================================================

const getPTGById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PTG meeting ID.",
      });
    }

    const meeting = await populatePTG(
      PTG.findById(id)
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "PTG meeting not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "PTG meeting retrieved successfully.",
      data: meeting,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to retrieve PTG meeting."
    );
  }
};

// ============================================================
// UPDATE PTG MEETING
// PUT /api/ptg/:id
// ============================================================

const updatePTG = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      studentId,
      teacherId,
      meetingDate,
      purpose,
      notes,
      status,
    } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PTG meeting ID.",
      });
    }

    const existingMeeting = await PTG.findById(id);

    if (!existingMeeting) {
      return res.status(404).json({
        success: false,
        message: "PTG meeting not found.",
      });
    }

    const previousMeeting = {
      studentId: existingMeeting.studentId,
      teacherId: existingMeeting.teacherId,
      meetingDate: existingMeeting.meetingDate,
      purpose: existingMeeting.purpose,
      notes: existingMeeting.notes,
      status: existingMeeting.status,
    };

    const updates = {};

    if (studentId !== undefined) {
      if (!isValidId(studentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid student ID.",
        });
      }

      const student = await Student.findById(studentId).populate({
        path: "userId",
        select: "status roles",
      });

      if (
        !student ||
        student.status !== "active" ||
        !student.userId ||
        student.userId.status !== "active" ||
        !student.userId.roles.includes("student")
      ) {
        return res.status(400).json({
          success: false,
          message: "Student not found or inactive.",
        });
      }

      updates.studentId = studentId;
    }

    if (teacherId !== undefined) {
      if (!isValidId(teacherId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid teacher ID.",
        });
      }

      const teacher = await Teacher.findById(teacherId).populate({
        path: "userId",
        select: "status roles",
      });

      if (
        !teacher ||
        teacher.status !== "active" ||
        !teacher.userId ||
        teacher.userId.status !== "active" ||
        !teacher.userId.roles.includes("teacher")
      ) {
        return res.status(400).json({
          success: false,
          message: "Teacher not found or inactive.",
        });
      }

      updates.teacherId = teacherId;
    }

    if (meetingDate !== undefined) {
      const parsedDate = new Date(meetingDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid meeting date.",
        });
      }

      updates.meetingDate = parsedDate;
    }

    if (purpose !== undefined) {
      if (
        typeof purpose !== "string" ||
        !purpose.trim() ||
        purpose.trim().length > 500
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Purpose must contain between 1 and 500 characters.",
        });
      }

      updates.purpose = purpose.trim();
    }

    if (notes !== undefined) {
      if (
        typeof notes !== "string" ||
        notes.length > 2000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Notes must be text and cannot exceed 2000 characters.",
        });
      }

      updates.notes = notes.trim();
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "Scheduled",
        "Completed",
        "Pending",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid PTG meeting status.",
        });
      }

      updates.status = status;
    }

    const updatedMeeting = await PTG.findByIdAndUpdate(
    id,
    updates,
    {
        returnDocument: "after",
        runValidators: true,
    }
    );

    const populatedMeeting = await populatePTG(
      PTG.findById(updatedMeeting._id)
    );

    // Send notifications only when something actually changed.
    const hasChanges = Object.keys(updates).some((key) => {
      const previousValue = previousMeeting[key];
      const updatedValue = updates[key];

      if (
        key === "studentId" ||
        key === "teacherId"
      ) {
        return previousValue.toString() !== updatedValue.toString();
      }

      if (key === "meetingDate") {
        return (
          new Date(previousValue).getTime() !==
          new Date(updatedValue).getTime()
        );
      }

      return previousValue !== updatedValue;
    });

    if (hasChanges) {
      const student = await Student.findById(
        updatedMeeting.studentId
      ).populate({
        path: "userId",
        select: "fullName status roles",
      });

      const teacher = await Teacher.findById(
        updatedMeeting.teacherId
      ).populate({
        path: "userId",
        select: "fullName status roles",
      });

      const studentName =
        student?.userId?.fullName || "the student";

      const teacherName =
        teacher?.userId?.fullName || "the teacher";

      const dateText = new Date(
        updatedMeeting.meetingDate
      ).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      });

      let notificationTitle = "PTG Meeting Updated";
      let notificationMessage =
        `The PTG meeting for ${studentName} with ${teacherName} ` +
        `has been updated. Meeting date: ${dateText}.`;

      if (
        updates.meetingDate !== undefined &&
        new Date(previousMeeting.meetingDate).getTime() !==
          new Date(updatedMeeting.meetingDate).getTime()
      ) {
        notificationTitle = "PTG Meeting Rescheduled";
        notificationMessage =
          `The PTG meeting for ${studentName} with ${teacherName} ` +
          `has been rescheduled to ${dateText}.`;
      } else if (
        updates.status === "Completed" &&
        previousMeeting.status !== "Completed"
      ) {
        notificationTitle = "PTG Meeting Completed";
        notificationMessage =
          `The PTG meeting for ${studentName} with ${teacherName} ` +
          "has been marked as completed.";
      } else if (
        updates.status === "Pending" &&
        previousMeeting.status !== "Pending"
      ) {
        notificationTitle = "PTG Meeting Status Updated";
        notificationMessage =
          `The PTG meeting for ${studentName} with ${teacherName} ` +
          "has been marked as pending.";
      }

      await sendPTGNotifications({
        student,
        teacher,
        title: notificationTitle,
        message: notificationMessage,
        excludeUserId: req.user._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "PTG meeting updated successfully.",
      data: populatedMeeting,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return handleError(
      res,
      error,
      "Failed to update PTG meeting."
    );
  }
};

// ============================================================
// DELETE PTG MEETING
// DELETE /api/ptg/:id
// ============================================================

const deletePTG = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PTG meeting ID.",
      });
    }

    const meeting = await PTG.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "PTG meeting not found.",
      });
    }

    // Load related users before deleting the record.
    const student = await Student.findById(
      meeting.studentId
    ).populate({
      path: "userId",
      select: "fullName status roles",
    });

    const teacher = await Teacher.findById(
      meeting.teacherId
    ).populate({
      path: "userId",
      select: "fullName status roles",
    });

    await PTG.findByIdAndDelete(id);

    const studentName =
      student?.userId?.fullName || "the student";

    const teacherName =
      teacher?.userId?.fullName || "the teacher";

    await sendPTGNotifications({
      student,
      teacher,
      title: "PTG Meeting Cancelled",
      message:
        `The PTG meeting for ${studentName} with ${teacherName} ` +
        "has been cancelled.",
      excludeUserId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "PTG meeting deleted successfully.",
      data: {
        id: meeting._id,
      },
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to delete PTG meeting."
    );
  }
};

// ============================================================
// GET STUDENTS FOR PTG FORM
// GET /api/ptg/students
// ============================================================

const getPTGStudents = async (req, res) => {
  try {
    const students = await Student.find({
      status: "active",
    })
      .populate({
        path: "userId",
        select: "fullName email mobileNumber status roles",
      })
      .populate({
        path: "batchId",
        select: "name code standard academicYear branchId",
      })
      .sort({ createdAt: -1 })
      .lean();

    const activeStudents = students.filter(
      (student) =>
        student.userId &&
        student.userId.status === "active" &&
        student.userId.roles.includes("student")
    );

    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully.",
      data: activeStudents,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to retrieve students."
    );
  }
};

// ============================================================
// GET TEACHERS FOR PTG FORM
// GET /api/ptg/teachers
// ============================================================

const getPTGTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({
      status: "active",
    })
      .populate({
        path: "userId",
        select: "fullName email mobileNumber status roles",
      })
      .sort({ createdAt: -1 })
      .lean();

    const activeTeachers = teachers.filter(
      (teacher) =>
        teacher.userId &&
        teacher.userId.status === "active" &&
        teacher.userId.roles.includes("teacher")
    );

    return res.status(200).json({
      success: true,
      message: "Teachers retrieved successfully.",
      data: activeTeachers,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to retrieve teachers."
    );
  }
};

// ============================================================
// EXPORT CONTROLLER METHODS
// ============================================================

module.exports = {
  createPTG,
  getPTGMeetings,
  getPTGStats,
  getPTGById,
  updatePTG,
  deletePTG,
  getPTGStudents,
  getPTGTeachers,
};