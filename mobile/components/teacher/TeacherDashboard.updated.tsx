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
import NotificationSettingsPage from "./Profile/NotificationSettingsPage";
import HelpSupportPage from "./Profile/HelpSupportPage";

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

// Communication pages
import TeacherMessages from "./Messages/TeacherMessages";
import TeacherFeedback from "./Feedback/TeacherFeedback";

type TabName =
  | "home"
  | "batches"
  | "students"
  | "profile"
  | "attendance"
  | "lectureLog"
  | "reports"
  | "changePassword"
  | "notificationSettings"
  | "helpSupport"
  | "ptg"
  | "examinations"
  | "assignments"
  | "academicCalendar"
  | "my-leave"
  | "messages"
  | "staffOnLeave"
  | "feedback";

type NotificationView =
  | "menu"
  | "messages"
  | "ptg"
  | "examinations"
  | "assignments";

export default function TeacherDashboard() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabName>("home");

  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(false);

  const [notificationView, setNotificationView] =
    useState<NotificationView>("menu");

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
     OPEN NOTIFICATION PAGE
  -------------------------------- */

  const handleNotificationNavigation = (tab: TabName) => {
    setNotificationsVisible(false);
    setNotificationView("menu");
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
        onNotificationPress={() => {
          setNotificationView("menu");
          setNotificationsVisible(true);
        }}
        onProfilePress={() => {
          setActiveTab("profile");
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
          NOTIFICATION SHORTCUT MODAL
      ================================= */}

      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.notificationOverlay}>
          <View style={styles.notificationCard}>
            {/* Notification Header */}

            <View style={styles.notificationHeader}>
              <View>
                <Text style={styles.notificationTitle}>
                  {notificationView === "menu"
                    ? "Notifications"
                    : notificationView === "messages"
                      ? "Messages"
                      : notificationView === "ptg"
                        ? "PTG Schedule"
                        : notificationView === "examinations"
                          ? "Examinations"
                          : "Assignments"}
                </Text>

                <Text style={styles.notificationSubtitle}>
                  {notificationView === "menu"
                    ? "Quick access to your updates"
                    : notificationView === "messages"
                      ? "Teacher communication"
                      : notificationView === "ptg"
                        ? "Parent-Teacher-Guardian meetings"
                        : notificationView === "examinations"
                          ? "View examination schedules"
                          : "View your assigned work"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.notificationClose}
                onPress={() => setNotificationsVisible(false)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {/* Notification Menu */}

            {notificationView === "menu" ? (
              <View style={styles.notificationOptions}>
                {/* MESSAGES */}

                <TouchableOpacity
                  style={styles.notificationOption}
                  activeOpacity={0.8}
                  onPress={() => handleNotificationNavigation("messages")}
                >
                  <View
                    style={[
                      styles.notificationOptionIcon,
                      styles.messageIcon,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="message-text-outline"
                      size={23}
                      color="#7040D5"
                    />
                  </View>

                  <View style={styles.notificationOptionText}>
                    <Text style={styles.notificationOptionTitle}>
                      Messages
                    </Text>

                    <Text style={styles.notificationOptionDescription}>
                      View teacher messages and updates
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color="#98A2B3"
                  />
                </TouchableOpacity>

                {/* PTG SCHEDULE */}

                <TouchableOpacity
                  style={styles.notificationOption}
                  activeOpacity={0.8}
                  onPress={() => handleNotificationNavigation("ptg")}
                >
                  <View
                    style={[styles.notificationOptionIcon, styles.ptgIcon]}
                  >
                    <MaterialCommunityIcons
                      name="calendar-month-outline"
                      size={23}
                      color="#2675E8"
                    />
                  </View>

                  <View style={styles.notificationOptionText}>
                    <Text style={styles.notificationOptionTitle}>
                      PTG Schedule
                    </Text>

                    <Text style={styles.notificationOptionDescription}>
                      View Parent-Teacher-Guardian meetings
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color="#98A2B3"
                  />
                </TouchableOpacity>

                {/* EXAMINATIONS */}

                <TouchableOpacity
                  style={styles.notificationOption}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleNotificationNavigation("examinations")
                  }
                >
                  <View
                    style={[
                      styles.notificationOptionIcon,
                      styles.examinationIcon,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="clipboard-text-outline"
                      size={23}
                      color="#2675E8"
                    />
                  </View>

                  <View style={styles.notificationOptionText}>
                    <Text style={styles.notificationOptionTitle}>
                      Examinations
                    </Text>

                    <Text style={styles.notificationOptionDescription}>
                      View upcoming and completed examinations
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color="#98A2B3"
                  />
                </TouchableOpacity>

                {/* ASSIGNMENTS */}

                <TouchableOpacity
                  style={styles.notificationOption}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleNotificationNavigation("assignments")
                  }
                >
                  <View
                    style={[
                      styles.notificationOptionIcon,
                      styles.passwordIcon,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="book-open-page-variant-outline"
                      size={23}
                      color="#D97706"
                    />
                  </View>

                  <View style={styles.notificationOptionText}>
                    <Text style={styles.notificationOptionTitle}>
                      Assignments
                    </Text>

                    <Text style={styles.notificationOptionDescription}>
                      View assignments and download attachments
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color="#98A2B3"
                  />
                </TouchableOpacity>

                {/* CHANGE PASSWORD */}

                <TouchableOpacity
                  style={styles.notificationOption}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleNotificationNavigation("changePassword")
                  }
                >
                  <View
                    style={[
                      styles.notificationOptionIcon,
                      styles.passwordIcon,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="lock-reset"
                      size={23}
                      color="#D97706"
                    />
                  </View>

                  <View style={styles.notificationOptionText}>
                    <Text style={styles.notificationOptionTitle}>
                      Change Password
                    </Text>

                    <Text style={styles.notificationOptionDescription}>
                      Update your teacher account password
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color="#98A2B3"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              /* MESSAGE DETAIL */

              <View style={styles.notificationDetail}>
                <View style={styles.notificationDetailIcon}>
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={32}
                    color="#7040D5"
                  />
                </View>

                <Text style={styles.notificationDetailTitle}>
                  Messages
                </Text>

                <Text style={styles.notificationDetailText}>
                  Open the Messages module to view and manage your
                  conversations.
                </Text>

                <TouchableOpacity
                  style={styles.notificationBackButton}
                  onPress={() => {
                    handleNotificationNavigation("messages");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={17}
                    color="#7040D5"
                  />

                  <Text style={styles.notificationBackText}>
                    Open Messages
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
          <OverviewSection />

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
            onReportsPress={() => {
              setSelectedStudentId(undefined);
              setSelectedStudentName(undefined);
              handleTabChange("reports");
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
            onNotificationSettingsPress={() => {
              setActiveTab("notificationSettings");
            }}
            onHelpPress={() => {
              setActiveTab("helpSupport");
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
          NOTIFICATION SETTINGS
      ================================= */}

      {activeTab === "notificationSettings" && (
        <View style={styles.pageContainer}>
          <NotificationSettingsPage
            onContentScroll={handleContentScroll}
            onBack={() => {
              setActiveTab("profile");
            }}
          />
        </View>
      )}

      {/* =================================
          HELP & SUPPORT
      ================================= */}

      {activeTab === "helpSupport" && (
        <View style={styles.pageContainer}>
          <HelpSupportPage
            onContentScroll={handleContentScroll}
            onBack={() => {
              setActiveTab("profile");
            }}
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

  notificationOverlay: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
  },

  notificationCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 12,
  },

  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F5",
  },

  notificationTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#202A3A",
  },

  notificationSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#929CAB",
    marginTop: 3,
  },

  notificationClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  notificationOptions: {
    paddingTop: 8,
  },

  notificationOption: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F6",
    paddingVertical: 12,
  },

  notificationOptionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  messageIcon: {
    backgroundColor: "#F1EAFF",
  },

  ptgIcon: {
    backgroundColor: "#EAF2FF",
  },

  examinationIcon: {
    backgroundColor: "#EAF2FF",
  },

  passwordIcon: {
    backgroundColor: "#FFF3E3",
  },

  notificationOptionText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    marginRight: 8,
  },

  notificationOptionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#263247",
  },

  notificationOptionDescription: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    lineHeight: 15,
    color: "#8B96A6",
    marginTop: 3,
  },

  notificationDetail: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 10,
  },

  notificationDetailIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  notificationDetailTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#263247",
  },

  notificationDetailText: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 18,
    color: "#8B96A6",
    textAlign: "center",
    marginTop: 7,
    maxWidth: 290,
  },

  notificationBackButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#F1EAFF",
  },

  notificationBackText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#7040D5",
    marginLeft: 7,
  },
});