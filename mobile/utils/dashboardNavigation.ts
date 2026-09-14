import { router } from "expo-router";

/* =========================================================
   DASHBOARD NAVIGATION

   All Super Admin navigation is centralized here.

   This keeps Sidebar, Dashboard cards, Quick Actions,
   Header profile/settings actions, etc. using the same
   navigation logic.
   ========================================================= */

export const openDashboardFeature = (feature: string) => {
  switch (feature) {
    /* =====================================================
       DASHBOARD
       ===================================================== */

    case "Dashboard":
      router.push("/(tabs)");
      break;

    /* =====================================================
       STUDENTS
       ===================================================== */

    case "Students":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Students" },
      });
      break;

    case "Add Student":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Student" },
      });
      break;

    /* =====================================================
       TEACHERS
       ===================================================== */

    case "Teachers":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Teachers" },
      });
      break;

    case "Add Teacher":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Teacher" },
      });
      break;

    /* =====================================================
       SUBJECTS

       Courses has been replaced by Subjects.
       ===================================================== */

    case "Subjects":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Subjects" },
      });
      break;

    case "Add Subject":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Subject" },
      });
      break;

    // Backward compatibility for older components.
    case "Courses":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Subjects" },
      });
      break;

    case "Add Course":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Subject" },
      });
      break;

    /* =====================================================
       BRANCHES
       ===================================================== */

    case "Branches":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Branches" },
      });
      break;

    case "Add Branch":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Branch" },
      });
      break;

    /* =====================================================
       BATCHES
       ===================================================== */

    case "Batches":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Batches" },
      });
      break;

    case "Create Batch":
    case "Add Batch":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Batch" },
      });
      break;

    /* =====================================================
       ATTENDANCE

       Attendance      -> AttendancePage
       Mark Attendance -> MarkAttendancePage

       There is NO Add Attendance navigation.
       ===================================================== */

    case "Attendance":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Attendance" },
      });
      break;

    case "Mark Attendance":
    case "Edit Attendance":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Mark Attendance" },
      });
      break;

    /* =====================================================
       EXAMINATIONS
       ===================================================== */

    case "Examinations":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Examinations" },
      });
      break;

    case "Schedule Test":
    case "Add Examination":
    case "Create Examination":
    case "Quiz":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Examination" },
      });
      break;

    /* =====================================================
       ASSIGNMENTS
       ===================================================== */

    case "Assignments":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Assignments" },
      });
      break;

    case "Add Assignment":
    case "Add Assignments":
    case "Create Assignment":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Assignment" },
      });
      break;

    /* =====================================================
       FEES
       ===================================================== */

    case "Fees Management":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Fees Management" },
      });
      break;

    case "Fee Collection":
    case "Collect Fee":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Collect Fee" },
      });
      break;

    /* =====================================================
       PERFORMANCE
       ===================================================== */

    case "Performance":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Performance" },
      });
      break;

    case "Publish Result":
    case "Add Performance":
    case "Create Performance":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Performance" },
      });
      break;

    /* =====================================================
       FEEDBACK
       ===================================================== */

    case "Feedback":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Feedback" },
      });
      break;

    /* =====================================================
       ACADEMICS
       ===================================================== */

    case "Academics":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Academics" },
      });
      break;

    case "Add Academic Info":
    case "Create Academic Info":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Academic Info" },
      });
      break;

    /* =====================================================
       TIMETABLE
       ===================================================== */

    case "Timetable":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Timetable" },
      });
      break;

    case "Add Class":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Class" },
      });
      break;

    /* =====================================================
       STAFF ON LEAVE
       ===================================================== */

    case "Staff on Leave":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Staff on Leave" },
      });
      break;

    case "Add Leave":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Leave" },
      });
      break;

    /* =====================================================
       USERS & ROLES
       ===================================================== */

    case "Users & Roles":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Users & Roles" },
      });
      break;

    case "Add User":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add User" },
      });
      break;

    /* =====================================================
       ANNOUNCEMENTS
       ===================================================== */

    case "Announcements":
    case "Announcement":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Announcements" },
      });
      break;

    /* =====================================================
       MESSAGES
       ===================================================== */

    case "Messages":
    case "WhatsApp":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Messages" },
      });
      break;

    /* =====================================================
       REPORTS
       ===================================================== */

    case "Reports":
    case "Generate Report":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Reports" },
      });
      break;

    /* =====================================================
       ACCOUNTS
       ===================================================== */

    case "Accounts":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Accounts" },
      });
      break;

    case "Add Transaction":
    case "Create Transaction":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Add Transaction" },
      });
      break;

    /* =====================================================
       ACADEMIC CALENDAR
       ===================================================== */

    case "Academic Calendar":
    case "Academic Event":
    case "Add Calendar Event":
    case "Event":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Academic Calendar" },
      });
      break;

    /* =====================================================
       PTG
       ===================================================== */

    case "PTG":
    case "Parent Teacher Meeting":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "PTG" },
      });
      break;

    /* =====================================================
       STUDENT COMPLAINT
       ===================================================== */

    case "Student Complaint":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Student Complaint" },
      });
      break;

    /* =====================================================
       SETTINGS
       ===================================================== */

    case "Settings":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Settings" },
      });
      break;

    /* =====================================================
       AUDIT LOGS
       ===================================================== */

    case "Audit Logs":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Audit Logs" },
      });
      break;

    /* =====================================================
       PROFILE
       ===================================================== */

    case "Profile":
      router.push({
        pathname: "/(tabs)/explore",
        params: { feature: "Profile" },
      });
      break;

    /* =====================================================
       DEFAULT
       ===================================================== */

    default:
      console.log(
        `No route configured for dashboard feature: ${feature}`
      );
      break;
  }
};
