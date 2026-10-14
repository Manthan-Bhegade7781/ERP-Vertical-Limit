import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

// Main pages
import StudentsPage from "@/components/SuperAdminDashboard/pages/StudentsPage";
import TeachersPage from "@/components/SuperAdminDashboard/pages/TeachersPage";
import BranchesPage from "@/components/SuperAdminDashboard/pages/BranchesPage";
import BatchesPage from "@/components/SuperAdminDashboard/pages/BatchesPage";
import AttendancePage from "@/components/SuperAdminDashboard/pages/AttendancePage";
import ExaminationsPage from "@/components/SuperAdminDashboard/pages/ExaminationsPage";
import AssignmentsPage from "@/components/SuperAdminDashboard/pages/AssignmentsPage";
import FeesManagementPage from "@/components/SuperAdminDashboard/pages/FeesManagementPage";
import UsersRolesPage from "@/components/SuperAdminDashboard/pages/UsersRolesPage";
import AnnouncementsPage from "@/components/SuperAdminDashboard/pages/AnnouncementsPage";
import MessagesPage from "@/components/SuperAdminDashboard/pages/MessagesPage";
import ReportsPage from "@/components/SuperAdminDashboard/pages/ReportsPage";
import SettingsPage from "@/components/SuperAdminDashboard/pages/SettingsPage";
import ProfilePage from "@/components/SuperAdminDashboard/pages/ProfilePage";
import TimetablePage from "@/components/SuperAdminDashboard/pages/TimetablePage";
import StaffOnLeavePage from "@/components/SuperAdminDashboard/pages/StaffOnLeavePage";
import AcademicsPage from "@/components/SuperAdminDashboard/pages/AcademicsPage";
import AccountsPage from "@/components/SuperAdminDashboard/pages/AccountsPage";
import AcademicCalendarPage from "@/components/SuperAdminDashboard/pages/AcademicCalendarPage";
import PTGPage from "@/components/SuperAdminDashboard/pages/PTGPage";
import FeedbackPage from "@/components/SuperAdminDashboard/pages/Feedback";
import StudentComplaintPage from "@/components/SuperAdminDashboard/pages/StudentComplaintPage";

// Add / action pages
import CoursesPage from "@/components/SuperAdminDashboard/pages/CoursesPage";
import AddStudentPage from "@/components/SuperAdminDashboard/pages/AddStudentPage";
import AddTeacherPage from "@/components/SuperAdminDashboard/pages/AddTeacherPage";
import AddSubjectPage from "@/components/SuperAdminDashboard/pages/AddSubjectPage";
import AddBranchPage from "@/components/SuperAdminDashboard/pages/AddBranchPage";
import AddBatchPage from "@/components/SuperAdminDashboard/pages/AddBatchPage";
import MarkAttendancePage from "@/components/SuperAdminDashboard/pages/MarkAttendancePage";
import AddExaminationPage from "@/components/SuperAdminDashboard/pages/AddExaminationPage";
import AddAssignmentsPage from "@/components/SuperAdminDashboard/pages/AddAssignmentsPage";
import CollectFeePage from "@/components/SuperAdminDashboard/pages/CollectFeePage";
import AddClassPage from "@/components/SuperAdminDashboard/pages/AddClassPage";
import AddLeavePage from "@/components/SuperAdminDashboard/pages/AddLeavePage";
import AddUserPage from "@/components/SuperAdminDashboard/pages/AddUserPage";
import AddTransactionPage from "@/components/SuperAdminDashboard/pages/AddTransactionPage";
import AddAcademicCalender from "@/components/SuperAdminDashboard/pages/AddAcademicCalender";
import AddAcademicYearInfoPage from "@/components/SuperAdminDashboard/pages/AddAcademicYearInfoPage";
import PendingRegistrationsPage from "@/components/SuperAdminDashboard/pages/PendingRegistrationsPage";

export default function ExploreScreen() {
  const params = useLocalSearchParams<{
    feature?: string | string[];
  }>();

  const feature = Array.isArray(params.feature)
  ? params.feature[0]
  : params.feature;

  console.log("FEATURE RECEIVED:", feature);

  /* =====================================================
     STUDENTS
     ===================================================== */

  if (feature === "Students") {
    return <StudentsPage />;
  }

  if (feature === "Add Student") {
    return <AddStudentPage />;
  }

  /* =====================================================
     TEACHERS
     ===================================================== */

  if (feature === "Teachers") {
    return <TeachersPage />;
  }

  if (feature === "Add Teacher") {
    return <AddTeacherPage />;
  }

  /* =====================================================
     SUBJECTS
     ===================================================== */

  if (feature === "Subjects") {
    return <CoursesPage />;
  }

  if (feature === "Add Subject") {
    return <AddSubjectPage />;
  }


  /* =====================================================
     BRANCHES
     ===================================================== */

  if (feature === "Branches") {
    return <BranchesPage />;
  }

  if (feature === "Add Branch") {
    return <AddBranchPage />;
  }

  /* =====================================================
     BATCHES
     ===================================================== */

  if (feature === "Batches") {
    return <BatchesPage />;
  }

  if (feature === "Add Batch" || feature === "Create Batch") {
    return <AddBatchPage />;
  }

  /* =====================================================
     ATTENDANCE
     ===================================================== */

  if (feature === "Attendance") {
    return <AttendancePage />;
  }

  if (
    feature === "Mark Attendance" ||
    feature === "Edit Attendance"
  ) {
    return <MarkAttendancePage />;
  }

  /* =====================================================
     EXAMINATIONS
     ===================================================== */

  if (feature === "Examinations") {
    return <ExaminationsPage />;
  }

  if (
    feature === "Add Examination" ||
    feature === "Schedule Test" ||
    feature === "Create Examination" ||
    feature === "Quiz"
  ) {
    return <AddExaminationPage />;
  }

  /* =====================================================
     ASSIGNMENTS
     ===================================================== */

  if (feature === "Assignments") {
    return <AssignmentsPage />;
  }

  if (
    feature === "Add Assignment" ||
    feature === "Add Assignments" ||
    feature === "Create Assignment"
  ) {
    return <AddAssignmentsPage />;
  }

  /* =====================================================
     FEES
     ===================================================== */

  if (feature === "Fees Management") {
    return <FeesManagementPage />;
  }

  if (
    feature === "Collect Fee" ||
    feature === "Fee Collection"
  ) {
    return <CollectFeePage />;
  }


  /* =====================================================
     ACADEMICS
     ===================================================== */

  if (feature === "Academics") {
    return <AcademicsPage />;
  }

  if (
    feature === "Add Academic Info" ||
    feature === "Create Academic Info"
  ) {
    return <AddAcademicYearInfoPage />;
  }

  /* =====================================================
     TIMETABLE
     ===================================================== */

  if (feature === "Timetable") {
    return <TimetablePage />;
  }

  if (feature === "Add Class") {
    return <AddClassPage />;
  }

  /* =====================================================
     STAFF ON LEAVE
     ===================================================== */

  if (feature === "Staff on Leave") {
    return <StaffOnLeavePage />;
  }

  if (feature === "Add Leave") {
    return <AddLeavePage />;
  }

  /* =====================================================
     USERS & ROLES
     ===================================================== */

  if (feature === "Users & Roles") {
    return <UsersRolesPage />;
  }

  if (feature === "Add User") {
    return <AddUserPage />;
  }

  /* =====================================================
     ANNOUNCEMENTS
     ===================================================== */

  if (
    feature === "Announcements" ||
    feature === "Announcement"
  ) {
    return <AnnouncementsPage />;
  }

  /* =====================================================
     MESSAGES
     ===================================================== */

  if (
    feature === "Messages" ||
    feature === "WhatsApp"
  ) {
    return <MessagesPage />;
  }

  /* =====================================================
     REPORTS
     ===================================================== */

  if (
    feature === "Reports" ||
    feature === "Generate Report"
  ) {
    return <ReportsPage />;
  }

  /* =====================================================
     ACCOUNTS
     ===================================================== */

  if (feature === "Accounts") {
    return <AccountsPage />;
  }

  if (
    feature === "Add Transaction" ||
    feature === "Create Transaction"
  ) {
    return <AddTransactionPage />;
  }

  /* =====================================================
     ACADEMIC CALENDAR
     ===================================================== */

  if (feature === "Academic Calendar") {
    return <AcademicCalendarPage />;
  }

  if (
    feature === "Academic Event" ||
    feature === "Add Calendar Event" ||
    feature === "Event"
  ) {
    return <AddAcademicCalender />;
  }

  if (feature === "Pending Registrations") {
    return <PendingRegistrationsPage />;
  }

  /* =====================================================
     PTG
     ===================================================== */

  if (
    feature === "PTG" ||
    feature === "Parent Teacher Meeting"
  ) {
    return <PTGPage />;
  }

  /* =====================================================
     FEEDBACK
     ===================================================== */

  if (feature === "Feedback") {
    return <FeedbackPage />;
  }

  /* =====================================================
     STUDENT COMPLAINT
     ===================================================== */

  if (feature === "Student Complaint") {
    return <StudentComplaintPage />;
  }

  /* =====================================================
     SETTINGS
     ===================================================== */

  if (feature === "Settings") {
    return <SettingsPage />;
  }


  /* =====================================================
     PROFILE
     ===================================================== */

  if (feature === "Profile") {
    return <ProfilePage />;
  }

  /* =====================================================
     FALLBACK
     ===================================================== */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {feature || "Feature"}
      </Text>

      <Text style={styles.subtitle}>
        Feature page coming next.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  title: {
    fontFamily: "PoppinsBold",
    fontSize: 24,
    color: "#172033",
    textAlign: "center",
  },

  subtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#748096",
    marginTop: 5,
    textAlign: "center",
  },
});