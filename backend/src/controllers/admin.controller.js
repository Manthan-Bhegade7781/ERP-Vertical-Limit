const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Branch = require("../models/Branch");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const BatchSubject = require("../models/BatchSubject");
const Attendance = require("../models/attendance.model");
const Examination = require("../models/examination.model");
const Assignment = require("../models/assignment.model");
const Leave = require("../models/Leave");
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

// =====================================================
// GET ADMIN DASHBOARD STATISTICS
// =====================================================

const getDashboardStats = async (req, res) => {
  try {
    const isSuperAdmin =
      (Array.isArray(req.user?.roles) &&
        req.user.roles.includes("super_admin")) ||
      req.user?.roles === "super_admin" ||
      req.user?.role === "super_admin";
    const branchId = !isSuperAdmin ? req.user?.branchId : null;

    if (!isSuperAdmin && !branchId) {
      return res.status(200).json({
        success: true,
        data: {
          totalStudents: 0,
          totalTeachers: 0,
          activeSubjects: 0,
          activeBatches: 0,
          students8to10: 0,
          students11to12: 0,
          jeeStudents: 0,
          neetStudents: 0,
          cetStudents: 0,
          attendance: "0%",
          upcomingExams: 0,
          assignments: 0,
          staffOnLeave: 0,
        },
      });
    }

    const batchQuery = { isRemoved: { $ne: true } };
    if (branchId) {
      batchQuery.branchId = branchId;
    }

    const batches = await Batch.find(batchQuery).select(
      "_id code name standard description startDate endDate"
    );
    const batchIds = batches.map((b) => b._id);

    // Run base statistical queries concurrently
    const [
      studentsCount,
      totalStudentUsers,
      teacherUserIds,
      allSubjectsCount,
      branchAssignedSubjects,
      attendanceRecords,
      upcomingExamsCount,
      assignmentsCount,
      staffOnLeaveCount,
      allActiveTeachers,
      allUserTeachers,
    ] = await Promise.all([
      // 1. Students in batches (if branch) or all students in Student collection
      branchId
        ? Student.countDocuments({ batchId: { $in: batchIds } })
        : Student.countDocuments(),

      // 2. Student user accounts
      branchId
        ? User.countDocuments({
            branchId,
            roles: "student",
            status: { $ne: "inactive" },
          })
        : User.countDocuments({
            roles: "student",
            status: { $ne: "inactive" },
          }),

      // 3. Teachers for branch in User collection
      branchId
        ? User.find({
            branchId,
            roles: "teacher",
            status: "active",
          }).distinct("_id")
        : Promise.resolve(null),

      // 4. Subjects count
      Subject.countDocuments({ status: { $ne: "inactive" } }),

      // 5. Batch subjects for branch
      branchId && batchIds.length > 0
        ? BatchSubject.find({
            batchId: { $in: batchIds },
            status: "active",
          }).distinct("subjectId")
        : Promise.resolve([]),

      // 6. Attendance records
      Attendance.find(
        branchId ? { batchId: { $in: batchIds } } : {}
      ).select("status"),

      // 7. Upcoming Examinations
      Examination.countDocuments({
        status: "scheduled",
        ...(branchId ? { batchId: { $in: batchIds } } : {}),
      }),

      // 8. Assignments
      Assignment.countDocuments(
        branchId ? { branchId } : {}
      ),

      // 9. Staff on Leave (approved)
      Leave.countDocuments({
        status: "approved",
        ...(branchId ? { branchId } : {}),
      }),

      // 10. Teacher profile documents (all)
      Teacher.countDocuments({ status: { $ne: "inactive" } }),

      // 11. User teachers (all)
      User.countDocuments({ roles: "teacher", status: { $ne: "inactive" } }),
    ]);

    // Calculate Teachers count
    let totalTeachers = 0;
    if (branchId) {
      if (teacherUserIds && teacherUserIds.length > 0) {
        const teacherProfileCount = await Teacher.countDocuments({
          userId: { $in: teacherUserIds },
          status: { $ne: "inactive" },
        });
        totalTeachers = Math.max(teacherProfileCount, teacherUserIds.length);
      }
    } else {
      totalTeachers = Math.max(allActiveTeachers || 0, allUserTeachers || 0);
    }

    // Calculate Active Batches (startDate <= now <= endDate)
    const now = new Date();
    let activeBatches = batches.filter((b) => {
      const s = b.startDate ? new Date(b.startDate) : null;
      const e = b.endDate ? new Date(b.endDate) : null;
      if (s && e) return s <= now && e >= now;
      if (s) return s <= now;
      if (e) return e >= now;
      return true;
    }).length;
    if (activeBatches === 0 && batches.length > 0) {
      activeBatches = batches.length;
    }

    // Calculate Active Subjects
    let activeSubjects =
      branchAssignedSubjects && branchAssignedSubjects.length > 0
        ? branchAssignedSubjects.length
        : allSubjectsCount;
    if (activeSubjects === 0) {
      activeSubjects = await Subject.countDocuments();
    }

    // Calculate Attendance Percentage
    let attendance = "0%";
    if (attendanceRecords && attendanceRecords.length > 0) {
      const presentOrLate = attendanceRecords.filter(
        (r) => r.status === "Present" || r.status === "Late"
      ).length;
      const rate = Math.round((presentOrLate / attendanceRecords.length) * 100);
      attendance = `${rate}%`;
    }

    // Categorize batches for Standard & Entrance Exam breakdown
    const batchesJeeSet = new Set(
      batches
        .filter(
          (b) =>
            /jee/i.test(b.name || "") ||
            /jee/i.test(b.description || "") ||
            /jee/i.test(b.code || "")
        )
        .map((b) => b._id.toString())
    );

    const batchesNeetSet = new Set(
      batches
        .filter(
          (b) =>
            /neet/i.test(b.name || "") ||
            /neet/i.test(b.description || "") ||
            /neet/i.test(b.code || "")
        )
        .map((b) => b._id.toString())
    );

    const batchesCetSet = new Set(
      batches
        .filter(
          (b) =>
            /cet|mht-cet/i.test(b.name || "") ||
            /cet|mht-cet/i.test(b.description || "") ||
            /cet|mht-cet/i.test(b.code || "")
        )
        .map((b) => b._id.toString())
    );

    // Also check BatchSubject entrance subjects
    if (batchIds.length > 0) {
      const entranceBatchSubjects = await BatchSubject.find({
        batchId: { $in: batchIds },
        status: "active",
      }).populate("subjectId", "name code type");

      for (const bs of entranceBatchSubjects) {
        const subName = `${bs.subjectId?.name || ""} ${bs.subjectId?.code || ""}`;
        const bIdStr = bs.batchId?.toString();
        if (!bIdStr) continue;
        if (/jee/i.test(subName)) batchesJeeSet.add(bIdStr);
        if (/neet/i.test(subName)) batchesNeetSet.add(bIdStr);
        if (/cet|mht-cet/i.test(subName)) batchesCetSet.add(bIdStr);
      }
    }

    // Count students per batch via single aggregate query
    const studentCountsByBatch =
      batchIds.length > 0
        ? await Student.aggregate([
            {
              $match: {
                batchId: { $in: batchIds },
                status: { $ne: "inactive" },
              },
            },
            { $group: { _id: "$batchId", count: { $sum: 1 } } },
          ])
        : [];

    const batchStudentCountMap = new Map();
    for (const item of studentCountsByBatch) {
      if (item._id) {
        batchStudentCountMap.set(item._id.toString(), item.count);
      }
    }

    // 1. Students By Standard Breakdown (8th, 9th, 10th, 11th, 12th)
    const standardsList = ["8th", "9th", "10th", "11th", "12th"];
    const studentsByStandard = standardsList.map((std) => {
      const stdBatches = batches.filter((b) => b.standard === std);
      const count = stdBatches.reduce(
        (sum, b) => sum + (batchStudentCountMap.get(b._id.toString()) || 0),
        0
      );
      return {
        standard: std,
        label: `${std} Standard`,
        count,
      };
    });

    const students8to10Count =
      (studentsByStandard.find((s) => s.standard === "8th")?.count || 0) +
      (studentsByStandard.find((s) => s.standard === "9th")?.count || 0) +
      (studentsByStandard.find((s) => s.standard === "10th")?.count || 0);

    const students11to12Count =
      (studentsByStandard.find((s) => s.standard === "11th")?.count || 0) +
      (studentsByStandard.find((s) => s.standard === "12th")?.count || 0);

    let jeeStudentsCount = 0;
    for (const bIdStr of batchesJeeSet) {
      jeeStudentsCount += batchStudentCountMap.get(bIdStr) || 0;
    }

    let neetStudentsCount = 0;
    for (const bIdStr of batchesNeetSet) {
      neetStudentsCount += batchStudentCountMap.get(bIdStr) || 0;
    }

    let cetStudentsCount = 0;
    for (const bIdStr of batchesCetSet) {
      cetStudentsCount += batchStudentCountMap.get(bIdStr) || 0;
    }

    // 2. Class & Batch Overview Breakdown
    const batchOverview = batches.map((b) => {
      const bIdStr = b._id.toString();
      let track = "Core";
      if (batchesJeeSet.has(bIdStr)) {
        track = "JEE";
      } else if (batchesNeetSet.has(bIdStr)) {
        track = "NEET";
      } else if (batchesCetSet.has(bIdStr)) {
        track = "MHT-CET";
      } else if (["8th", "9th", "10th"].includes(b.standard)) {
        track = "Foundation";
      }

      return {
        id: b._id,
        name: b.name,
        standard: b.standard || "",
        track,
        students: batchStudentCountMap.get(bIdStr) || 0,
      };
    });

    // Sort batches by student count (descending)
    batchOverview.sort((a, b) => b.students - a.students);

    const totalStudents = Math.max(studentsCount || 0, totalStudentUsers || 0);

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        activeSubjects,
        activeBatches,
        students8to10: students8to10Count || 0,
        students11to12: students11to12Count || 0,
        jeeStudents: jeeStudentsCount || 0,
        neetStudents: neetStudentsCount || 0,
        cetStudents: cetStudentsCount || 0,
        attendance,
        upcomingExams: upcomingExamsCount || 0,
        assignments: assignmentsCount || 0,
        staffOnLeave: staffOnLeaveCount || 0,
        studentsByStandard,
        batchOverview,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  promoteTeacherToAdmin,
  getDashboardStats,
};