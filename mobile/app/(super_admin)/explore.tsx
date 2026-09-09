import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

import StudentsPage from "@/components/SuperAdminDashboard/pages/StudentsPage";
import TeachersPage from "@/components/SuperAdminDashboard/pages/TeachersPage";
import CoursesPage from "@/components/SuperAdminDashboard/pages/CoursesPage";
import BranchesPage from "@/components/SuperAdminDashboard/pages/BranchesPage";
import BatchesPage from "@/components/SuperAdminDashboard/pages/BatchesPage";
import AttendancePage from "@/components/SuperAdminDashboard/pages/AttendancePage";
import ExaminationsPage from "@/components/SuperAdminDashboard/pages/ExaminationsPage";
import AssignmentsPage from "@/components/SuperAdminDashboard/pages/AssignmentsPage";
import FeesManagementPage from "@/components/SuperAdminDashboard/pages/FeesManagementPage";
import PerformancePage from "@/components/SuperAdminDashboard/pages/PerformancePage";
import UsersRolesPage from "@/components/SuperAdminDashboard/pages/UsersRolesPage";
import AnnouncementsPage from "@/components/SuperAdminDashboard/pages/AnnouncementsPage";
import MessagesPage from "@/components/SuperAdminDashboard/pages/MessagesPage";
import ReportsPage from "@/components/SuperAdminDashboard/pages/ReportsPage";
import SettingsPage from "@/components/SuperAdminDashboard/pages/SettingsPage";
import AuditLogsPage from "@/components/SuperAdminDashboard/pages/AuditLogsPage";
import ProfilePage from "@/components/SuperAdminDashboard/pages/ProfilePage";
import TimetablePage from "@/components/SuperAdminDashboard/pages/TimetablePage";
import StaffOnLeavePage from "@/components/SuperAdminDashboard/pages/StaffOnLeavePage";
import AcademicsPage from "@/components/SuperAdminDashboard/pages/AcademicsPage";
import AccountsPage from "@/components/SuperAdminDashboard/pages/AccountsPage";
import AcademicCalendarPage from "@/components/SuperAdminDashboard/pages/AcademicCalendarPage";
import PTGPage from "@/components/SuperAdminDashboard/pages/PTGPage";
import FeedbackPage from "@/components/SuperAdminDashboard/pages/Feedback";
import StudentComplaintPage from "@/components/SuperAdminDashboard/pages/StudentComplaintPage";

export default function ExploreScreen() {
  const params = useLocalSearchParams<{
    feature?: string;
  }>();

  const feature = params.feature;

  if (feature === "Students") {
    return <StudentsPage />;
  }

  if (feature === "Teachers") {
    return <TeachersPage />;
  }

  if (feature === "Courses") {
    return <CoursesPage />;
  }

  if (feature === "Branches") {
    return <BranchesPage />;
  }

  if (feature === "Batches") {
    return <BatchesPage />;
  }

  if (feature === "Attendance") {
    return <AttendancePage />;
  }

  if (feature === "Examinations") {
    return <ExaminationsPage />;
  }

  if (feature === "Assignments") {
    return <AssignmentsPage />;
  }

  if (feature === "Fees Management") {
    return <FeesManagementPage />;
  }

  if (feature === "Performance") {
    return <PerformancePage />;
  }

  if (feature === "Users & Roles") {
    return <UsersRolesPage />;
  }

  if (feature === "Announcements") {
    return <AnnouncementsPage />;
  }

  if (feature === "Messages") {
    return <MessagesPage />;
  }

  if (feature === "Reports") {
    return <ReportsPage />;
  }

  if (feature === "Settings") {
    return <SettingsPage />;
  }

  if (feature === "Audit Logs") {
    return <AuditLogsPage />;
  }

  if (feature === "Profile") {
    return <ProfilePage />;
  }

  if (feature === "Timetable") {
    return <TimetablePage />;
  }

  if (feature === "Staff on Leave") {
    return <StaffOnLeavePage />;
  }

  if (feature === "Academics") {
    return <AcademicsPage />;
  }

  if (feature === "Accounts") {
    return <AccountsPage />;
  }

  if (feature === "Academic Calendar") {
    return <AcademicCalendarPage />;
  }

  if (feature === "PTG") {
    return <PTGPage />;
  }

  if (feature === "Feedback") {
    return <FeedbackPage />;
  }

  if (feature === "Student Complaint") {
    return <StudentComplaintPage />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{feature || "Feature"}</Text>

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