import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import TeacherHeader from "./TeacherHeader";
import TeacherSidebar from "./TeacherSidebar";

import OverviewSection from "./Overview/OverviewSection";
import ScheduleSection from "./Schedule/ScheduleSection";
import QuickActionsSection from "./QuickActions/QuickActionsSection";
import AnnouncementsSection from "./Announcements/AnnouncementsSection";
import TeacherAcademicCalendar from "./AcademicCalendar/TeacherAcademicCalendar";
import ProfilePage from "./Profile/ProfilePage";

import { useAuth } from "@/context/AuthContext";
import { updateCurrentUser } from "@/services/auth";

import ChangePasswordPage from "./Profile/ChangePasswordPage";

import MarkAttendance from "./QuickActions/MarkAttendance";
import AddLectureLog from "./QuickActions/AddLectureLog";

import BatchesPage from "./Batches/BatchesPage";
import StudentsPage from "./Students/StudentsPage";
import ReportsPage from "./Reports/ReportsPage";

import TeacherMyLeave from "./MyLeave/TeacherMyLeave";

// Teacher pages
import TeacherPTGSchedule from "./PTG/TeacherPTGSchedule";
import TeacherExaminations from "./Examinations/TeacherExaminations";
import TeacherAssignments from "./Assignments/TeacherAssignments";
import TeacherAddAssignmentPage from "./Assignments/TeacherAddAssignmentPage";

// Communication pages
import TeacherMessages from "./Messages/TeacherMessages";
import TeacherFeedback from "./Feedback/TeacherFeedback";
import TeacherNotificationsPage from "./Notifications/TeacherNotificationsPage";

type TabName =
  | "home"
  | "batches"
  | "students"
  | "profile"
  | "attendance"
  | "lectureLog"
  | "reports"
  | "changePassword"
  | "ptg"
  | "examinations"
  | "assignments"
  | "addAssignment"
  | "academicCalendar"
  | "my-leave"
  | "messages"
  | "staffOnLeave"
  | "feedback"
  | "notifications";

export default function TeacherDashboard() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabName>("home");

  const [sidebarVisible, setSidebarVisible] = useState(false);

  /* --------------------------------
     PROFILE DATA
  -------------------------------- */

  const profileName = user?.fullName ?? "";
  const profileEmail = user?.email ?? "";
  const profilePhone = user?.mobileNumber ?? "";

  /* --------------------------------
     SELECTED STUDENT FOR REPORT
  -------------------------------- */

  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >(undefined);

  const [selectedStudentName, setSelectedStudentName] = useState<
    string | undefined
  >(undefined);

  const handleContentScroll = (_event: any) => {
    // Kept for existing page components that accept a scroll callback.
  };

  /* --------------------------------
     TAB CHANGE
  -------------------------------- */

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
  };

  /* --------------------------------
     OPEN STUDENT REPORT
  -------------------------------- */

  const handleStudentReportPress = (
    studentId: string,
    studentName: string
  ) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setActiveTab("reports");
  };

  /* --------------------------------
     SAVE PROFILE
  -------------------------------- */

  const handleSaveProfile = async (
    name: string,
    email: string,
    phone: string
  ) => {
    try {
      const result = await updateCurrentUser(name, email, phone);

      if (!result.success || !result.data?.user) {
        console.error("PROFILE UPDATE FAILED:", result.message);
        return;
      }

      const updatedUser = result.data.user;

      // Update global authentication state.
      updateUser(updatedUser);

      console.log("PROFILE UPDATED:", updatedUser);
    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error);
    }
  };

  /* --------------------------------
     ATTENDANCE BACK NAVIGATION
  -------------------------------- */

  const handleAttendanceBack = () => {
    setActiveTab("home");
  };

  /* --------------------------------
     SIDEBAR NAVIGATION
  -------------------------------- */

  const handleSidebarItemPress = (item: string) => {
    const routes: Record<string, TabName> = {
      Dashboard: "home",
      Batches: "batches",
      Students: "students",
      Attendance: "attendance",
      "PTG Schedule": "ptg",
      Examinations: "examinations",
      Assignments: "assignments",
      "Academic Calendar": "academicCalendar",
      "My Leave": "my-leave",
      Messages: "messages",
      "Staff on Leave": "staffOnLeave",
      Feedback: "feedback",
      Profile: "profile",
    };

    const nextTab = routes[item];

    if (nextTab) {
      setActiveTab(nextTab);
    }

    setSidebarVisible(false);
  };

  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <View style={styles.container}>
      {/* =================================
          HEADER
      ================================= */}

      <TeacherHeader
        onMenuPress={() => setSidebarVisible(true)}
        onProfilePress={() => {
          setActiveTab("profile");
        }}
        onViewAllNotifications={() => {
          setActiveTab("notifications");
        }}
        onPTGPress={() => {
          setActiveTab("ptg");
        }}
        onAssignmentsPress={() => {
          setActiveTab("assignments");
        }}
        onExaminationsPress={() => {
          setActiveTab("examinations");
        }}
        onMessagesPress={() => {
          setActiveTab("messages");
        }}
        onAttendancePress={() => {
          setActiveTab("attendance");
        }}
      />

      {/* =================================
          TEACHER SIDEBAR DRAWER
      ================================= */}

      <Modal
        visible={sidebarVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <Pressable
            style={styles.drawerBackdrop}
            onPress={() => setSidebarVisible(false)}
          />

          <View style={styles.drawerPanel}>
            <TeacherSidebar
              activeItem={activeTab === "home" ? "Dashboard" : activeTab}
              teacherName={profileName || "Teacher"}
              onItemPress={handleSidebarItemPress}
            />
          </View>
        </View>
      </Modal>

      {/* =================================
          HOME
      ================================= */}

      {activeTab === "home" && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleContentScroll}
        >
          <OverviewSection
            onAttendancePress={() => handleTabChange("attendance")}
            onBatchesPress={() => handleTabChange("batches")}
            onStudentsPress={() => handleTabChange("students")}
            onLectureLogPress={() => handleTabChange("lectureLog")}
          />

          <ScheduleSection
            onViewAllPress={() => {
              console.log("View All Schedule pressed");
            }}
          />

          <QuickActionsSection
            onAttendancePress={() => {
              handleTabChange("attendance");
            }}
            onLectureLogPress={() => {
              handleTabChange("lectureLog");
            }}
            onBatchesPress={() => {
              handleTabChange("batches");
            }}
            onStudentsPress={() => {
              handleTabChange("students");
            }}
            onReportsPress={() => {
              setSelectedStudentId(undefined);
              setSelectedStudentName(undefined);
              handleTabChange("reports");
            }}
            onAssignmentsPress={() => {
              handleTabChange("assignments");
            }}
            onExaminationsPress={() => {
              handleTabChange("examinations");
            }}
            onPTGPress={() => {
              handleTabChange("ptg");
            }}
            onCalendarPress={() => {
              handleTabChange("academicCalendar");
            }}
            onMyLeavePress={() => {
              handleTabChange("my-leave");
            }}
            onMessagesPress={() => {
              handleTabChange("messages");
            }}
            onFeedbackPress={() => {
              handleTabChange("feedback");
            }}
          />

          <AnnouncementsSection
            onViewAllPress={() => {
              console.log("View All Announcements pressed");
            }}
          />
        </ScrollView>
      )}

      {/* =================================
          PROFILE
      ================================= */}

      {activeTab === "profile" && (
        <View style={styles.pageContainer}>
          <ProfilePage
            name={profileName}
            email={profileEmail}
            phone={profilePhone}
            onSaveProfile={handleSaveProfile}
            onContentScroll={handleContentScroll}
            onChangePasswordPress={() => {
              setActiveTab("changePassword");
            }}
          />
        </View>
      )}

      {/* =================================
          CHANGE PASSWORD
      ================================= */}

      {activeTab === "changePassword" && (
        <View style={styles.pageContainer}>
          <ChangePasswordPage
            onContentScroll={handleContentScroll}
            onBack={() => {
              setActiveTab("profile");
            }}
          />
        </View>
      )}

      {/* =================================
          NOTIFICATIONS
      ================================= */}

      {activeTab === "notifications" && (
        <View style={styles.pageContainer}>
          <TeacherNotificationsPage
            onContentScroll={handleContentScroll}
            onBack={() => setActiveTab("home")}
            onNavigate={(tab) => handleTabChange(tab as TabName)}
          />
        </View>
      )}

      {/* =================================
          BATCHES
      ================================= */}

      {activeTab === "batches" && (
        <View style={styles.pageContainer}>
          <BatchesPage
            onContentScroll={handleContentScroll}
            onBack={() => setActiveTab("home")}
          />
        </View>
      )}

      {/* =================================
          STUDENTS
      ================================= */}

      {activeTab === "students" && (
        <View style={styles.pageContainer}>
          <StudentsPage
            onContentScroll={handleContentScroll}
            onBack={() => setActiveTab("home")}
            onStudentReportPress={handleStudentReportPress}
          />
        </View>
      )}

      {/* =================================
          ATTENDANCE
      ================================= */}

      {activeTab === "attendance" && (
        <View style={styles.pageContainer}>
          <MarkAttendance
            onContentScroll={handleContentScroll}
            onBack={handleAttendanceBack}
          />
        </View>
      )}

      {/* =================================
          LECTURE LOG
      ================================= */}

      {activeTab === "lectureLog" && (
        <View style={styles.pageContainer}>
          <AddLectureLog
            onContentScroll={handleContentScroll}
            onBack={() => {
              setActiveTab("home");
            }}
          />
        </View>
      )}

      {/* =================================
          REPORTS
      ================================= */}

      {activeTab === "reports" && (
        <View style={styles.pageContainer}>
          <ReportsPage
            onContentScroll={handleContentScroll}
            onBack={() => {
              setActiveTab("home");
            }}
          />
        </View>
      )}

      {/* =================================
          PTG SCHEDULE
      ================================= */}

      {activeTab === "ptg" && (
        <View style={styles.pageContainer}>
          <TeacherPTGSchedule
            onBack={() => {
              setActiveTab("home");
            }}
          />
        </View>
      )}

      {/* =================================
          EXAMINATIONS
      ================================= */}

      {activeTab === "examinations" && (
        <View style={styles.pageContainer}>
          <TeacherExaminations
            onContentScroll={handleContentScroll}
            onBack={() => setActiveTab("home")}
          />
        </View>
      )}

      {/* =================================
          ASSIGNMENTS
      ================================= */}

      {activeTab === "assignments" && (
        <View style={styles.pageContainer}>
          <TeacherAssignments
            onContentScroll={handleContentScroll}
            onBack={() => setActiveTab("home")}
            onAddAssignment={() => setActiveTab("addAssignment")}
          />
        </View>
      )}

      {/* =================================
          ADD ASSIGNMENT
      ================================= */}

      {activeTab === "addAssignment" && (
        <View style={styles.pageContainer}>
          <TeacherAddAssignmentPage
            onBack={() => setActiveTab("assignments")}
            onCreated={() => {
              setActiveTab("assignments");
            }}
          />
        </View>
      )}

      {/* =================================
          ACADEMIC CALENDAR
      ================================= */}

      {activeTab === "academicCalendar" && (
        <View style={styles.pageContainer}>
          <TeacherAcademicCalendar
            onContentScroll={handleContentScroll}
            onBack={() => setActiveTab("home")}
          />
        </View>
      )}

      {/* =================================
          MY LEAVE
      ================================= */}

      {activeTab === "my-leave" && (
        <View style={styles.pageContainer}>
          <TeacherMyLeave
            onContentScroll={handleContentScroll}
            onBack={() => setActiveTab("home")}
          />
        </View>
      )}

      {/* =================================
          MESSAGES
      ================================= */}

      {activeTab === "messages" && (
        <View style={styles.pageContainer}>
          <TeacherMessages
            onContentScroll={handleContentScroll}
            onBack={() => setActiveTab("home")}
          />
        </View>
      )}

      {/* =================================
          FEEDBACK
      ================================= */}

      {activeTab === "feedback" && (
        <View style={styles.pageContainer}>
          <TeacherFeedback />
        </View>
      )}

      {/* =================================
          STAFF ON LEAVE PLACEHOLDER
      ================================= */}

      {activeTab === "staffOnLeave" && (
        <View style={styles.placeholderPage}>
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            size={42}
            color="#7040D5"
          />

          <Text style={styles.placeholderTitle}>Staff on Leave</Text>

          <Text style={styles.placeholderText}>
            This section is ready for its existing page component and data
            integration.
          </Text>
        </View>
      )}
    </View>
  );
}

/* =====================================
   STYLES
===================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },

  pageContainer: {
    flex: 1,
    backgroundColor: "#F6F6F9",
  },

  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(16,24,40,0.48)",
  },

  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  drawerPanel: {
    width: "78%",
    maxWidth: 360,
    height: "100%",
    backgroundColor: "#FFFFFF",
    elevation: 30,
  },

  placeholderPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F7F7FA",
  },

  placeholderTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#202A3A",
    marginTop: 14,
  },

  placeholderText: {
    fontFamily: "PoppinsRegular",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: "#7A8494",
    marginTop: 8,
  },

  /* NOTIFICATION MODAL */

});