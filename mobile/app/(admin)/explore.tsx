import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

/* =========================================================
   ADMIN PAGES
========================================================= */

import AnnouncementsPage from "../../components/AdminDashboard/pages/AnnouncementsPage";
import AssignmentsPage from "../../components/AdminDashboard/pages/AssignmentsPage";
import AttendancePage from "../../components/AdminDashboard/pages/AttendancePage";
import BatchesPage from "../../components/AdminDashboard/pages/BatchesPage";
import ExaminationsPage from "../../components/AdminDashboard/pages/ExaminationsPage";
import MessagesPage from "../../components/AdminDashboard/pages/MessagesPage";
import PerformancePage from "../../components/AdminDashboard/pages/PerformancePage";
import ProfilePage from "../../components/AdminDashboard/pages/ProfilePage";
import ChangePasswordPage from "../../components/AdminDashboard/pages/ChangePasswordPage";
import ReportsPage from "../../components/AdminDashboard/pages/ReportsPage";
import SettingsPage from "../../components/AdminDashboard/pages/SettingsPage";

import StudentsPage from "../../components/AdminDashboard/pages/StudentsPage";
import SubjectsPage from "../../components/AdminDashboard/pages/SubjectsPage";
import TeachersPage from "../../components/AdminDashboard/pages/TeachersPage";

/* =========================================================
   NEW ADMIN PAGES
========================================================= */

import TimetablePage from "../../components/AdminDashboard/pages/TimetablePage";
import StaffOnLeavePage from "../../components/AdminDashboard/pages/StaffOnLeavePage";
import PTGPage from "../../components/AdminDashboard/pages/PTGPage";
import StudentComplaintPage from "../../components/AdminDashboard/pages/StudentComplaintPage";
import Feedback from "../../components/AdminDashboard/pages/Feedback";

/* =========================================================
   ADMIN EXPLORE
========================================================= */

export default function AdminExplore() {
  const { feature } = useLocalSearchParams<{
    feature?: string;
  }>();

  /* =======================================================
     ADMIN FEATURES
  ====================================================== */

  switch (feature) {
    /* -------------------------------------------------------
       STUDENTS
    ------------------------------------------------------- */

    case "Students":
      return <StudentsPage />;

    /* -------------------------------------------------------
       TEACHERS
    ------------------------------------------------------- */

    case "Teachers":
      return <TeachersPage />;

    /* -------------------------------------------------------
       SUBJECTS
    ------------------------------------------------------- */

    case "Subjects":
      return <SubjectsPage />;

    /* -------------------------------------------------------
       BATCHES
    ------------------------------------------------------- */

    case "Batches":
      return <BatchesPage />;

    /* -------------------------------------------------------
       ATTENDANCE
    ------------------------------------------------------- */

    case "Attendance":
      return <AttendancePage />;

    /* -------------------------------------------------------
       EXAMINATIONS
    ------------------------------------------------------- */

    case "Examinations":
      return <ExaminationsPage />;

    /* -------------------------------------------------------
       ASSIGNMENTS
    ------------------------------------------------------- */

    case "Assignments":
      return <AssignmentsPage />;

    /* -------------------------------------------------------
       PERFORMANCE
    ------------------------------------------------------- */

    case "Performance":
      return <PerformancePage />;

    /* -------------------------------------------------------
       ANNOUNCEMENTS
    ------------------------------------------------------- */

    case "Announcements":
      return <AnnouncementsPage />;

    /* -------------------------------------------------------
       MESSAGES
    ------------------------------------------------------- */

    case "Messages":
      return <MessagesPage />;

    /* -------------------------------------------------------
       REPORTS
    ------------------------------------------------------- */

    case "Reports":
      return <ReportsPage />;

    /* -------------------------------------------------------
       TIMETABLE
    ------------------------------------------------------- */

    case "Timetable":
      return <TimetablePage />;

    /* -------------------------------------------------------
       STAFF ON LEAVE
    ------------------------------------------------------- */

    case "Staff on Leave":
      return <StaffOnLeavePage />;

    /* -------------------------------------------------------
       PTG
    ------------------------------------------------------- */

    case "PTG":
      return <PTGPage />;

    /* -------------------------------------------------------
       STUDENT COMPLAINT
    ------------------------------------------------------- */

    case "Student Complaint":
      return <StudentComplaintPage />;

    /* -------------------------------------------------------
       FEEDBACK
    ------------------------------------------------------- */

    case "Feedback":
      return <Feedback />;

    /* -------------------------------------------------------
       PROFILE
    ------------------------------------------------------- */

    case "Profile":
      return <ProfilePage />;

    /* -------------------------------------------------------
       CHANGE PASSWORD
    ------------------------------------------------------- */

    case "Change Password":
      return <ChangePasswordPage />;

    /* -------------------------------------------------------
       SETTINGS
    ------------------------------------------------------- */

    case "Settings":
      return <SettingsPage />;

    /* -------------------------------------------------------
       DEFAULT
    ------------------------------------------------------- */

    default:
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Admin Page</Text>

          <Text style={styles.message}>
            Page not found
          </Text>
        </View>
      );
  }
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#172033",
  },

  message: {
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#8A95A6",
    marginTop: 5,
  },
});