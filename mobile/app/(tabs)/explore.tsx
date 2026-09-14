import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/*
 * ============================================================
 * STUDENTS
 * ============================================================
 */
import StudentsPage from '@/components/SuperAdminDashboard/pages/StudentsPage';
import AddStudentPage from '@/components/SuperAdminDashboard/pages/AddStudentPage';

/*
 * ============================================================
 * TEACHERS
 * ============================================================
 */
import TeachersPage from '@/components/SuperAdminDashboard/pages/TeachersPage';
import AddTeacherPage from '@/components/SuperAdminDashboard/pages/AddTeacherPage';

/*
 * ============================================================
 * SUBJECTS
 * ============================================================
 */
import CoursesPage from '@/components/SuperAdminDashboard/pages/CoursesPage';
import AddSubjectPage from '@/components/SuperAdminDashboard/pages/AddSubjectPage';

/*
 * ============================================================
 * BRANCHES
 * ============================================================
 */
import BranchesPage from '@/components/SuperAdminDashboard/pages/BranchesPage';
import AddBranchPage from '@/components/SuperAdminDashboard/pages/AddBranchPage';

/*
 * ============================================================
 * BATCHES
 * ============================================================
 */
import BatchesPage from '@/components/SuperAdminDashboard/pages/BatchesPage';
import AddBatchPage from '@/components/SuperAdminDashboard/pages/AddBatchPage';

/*
 * ============================================================
 * ATTENDANCE
 * ============================================================
 */
import AttendancePage from '@/components/SuperAdminDashboard/pages/AttendancePage';
import MarkAttendancePage from '@/components/SuperAdminDashboard/pages/MarkAttendancePage';

/*
 * ============================================================
 * EXAMINATIONS
 * ============================================================
 */
import ExaminationsPage from '@/components/SuperAdminDashboard/pages/ExaminationsPage';
import AddExaminationPage from '@/components/SuperAdminDashboard/pages/AddExaminationPage';

/*
 * ============================================================
 * ASSIGNMENTS
 * ============================================================
 */
import AssignmentsPage from '@/components/SuperAdminDashboard/pages/AssignmentsPage';
import AddAssignmentsPage from '@/components/SuperAdminDashboard/pages/AddAssignmentsPage';

/*
 * ============================================================
 * FEES
 * ============================================================
 */
import FeesManagementPage from '@/components/SuperAdminDashboard/pages/FeesManagementPage';
import CollectFeePage from '@/components/SuperAdminDashboard/pages/CollectFeePage';

/*
 * ============================================================
 * PERFORMANCE
 * ============================================================
 */
import PerformancePage from '@/components/SuperAdminDashboard/pages/PerformancePage';
import AddPerformancePage from '@/components/SuperAdminDashboard/pages/AddPerformancePage';

/*
 * ============================================================
 * USERS & ROLES
 * ============================================================
 */
import UsersRolesPage from '@/components/SuperAdminDashboard/pages/UsersRolesPage';
import AddUserPage from '@/components/SuperAdminDashboard/pages/AddUserPage';

/*
 * ============================================================
 * ANNOUNCEMENTS
 * ============================================================
 */
import AnnouncementsPage from '@/components/SuperAdminDashboard/pages/AnnouncementsPage';

/*
 * ============================================================
 * MESSAGES
 * ============================================================
 */
import MessagesPage from '@/components/SuperAdminDashboard/pages/MessagesPage';

/*
 * ============================================================
 * REPORTS
 * ============================================================
 */
import ReportsPage from '@/components/SuperAdminDashboard/pages/ReportsPage';

/*
 * ============================================================
 * SETTINGS
 * ============================================================
 */
import SettingsPage from '@/components/SuperAdminDashboard/pages/SettingsPage';

/*
 * ============================================================
 * AUDIT LOGS
 * ============================================================
 */
import AuditLogsPage from '@/components/SuperAdminDashboard/pages/AuditLogsPage';

/*
 * ============================================================
 * PROFILE
 * ============================================================
 */
import ProfilePage from '@/components/SuperAdminDashboard/pages/ProfilePage';

/*
 * ============================================================
 * TIMETABLE
 * ============================================================
 */
import TimetablePage from '@/components/SuperAdminDashboard/pages/TimetablePage';
import AddClassPage from '@/components/SuperAdminDashboard/pages/AddClassPage';

/*
 * ============================================================
 * STAFF ON LEAVE
 * ============================================================
 */
import StaffOnLeavePage from '@/components/SuperAdminDashboard/pages/StaffOnLeavePage';
import AddLeavePage from '@/components/SuperAdminDashboard/pages/AddLeavePage';

/*
 * ============================================================
 * ACADEMICS
 * ============================================================
 */
import AcademicsPage from '@/components/SuperAdminDashboard/pages/AcademicsPage';
import AddAcademicYearInfoPage from '@/components/SuperAdminDashboard/pages/AddAcademicYearInfoPage';

/*
 * ============================================================
 * ACCOUNTS
 * ============================================================
 */
import AccountsPage from '@/components/SuperAdminDashboard/pages/AccountsPage';
import AddTransactionPage from '@/components/SuperAdminDashboard/pages/AddTransactionPage';

/*
 * ============================================================
 * ACADEMIC CALENDAR
 * ============================================================
 */
import AcademicCalendarPage from '@/components/SuperAdminDashboard/pages/AcademicCalendarPage';

/*
 * ============================================================
 * PTG
 * ============================================================
 */
import PTGPage from '@/components/SuperAdminDashboard/pages/PTGPage';

/*
 * ============================================================
 * FEEDBACK
 * ============================================================
 */
import FeedbackPage from '@/components/SuperAdminDashboard/pages/Feedback';

/*
 * ============================================================
 * STUDENT COMPLAINT
 * ============================================================
 */
import StudentComplaintPage from '@/components/SuperAdminDashboard/pages/StudentComplaintPage';

export default function ExploreScreen() {
  const params = useLocalSearchParams<{
    feature?: string | string[];
  }>();

  const feature = Array.isArray(params.feature)
    ? params.feature[0]
    : params.feature;

  /*
   * ============================================================
   * STUDENTS
   * ============================================================
   */

  if (feature === 'Students') {
    return <StudentsPage />;
  }

  if (feature === 'Add Student') {
    return <AddStudentPage />;
  }

  /*
   * ============================================================
   * TEACHERS
   * ============================================================
   */

  if (feature === 'Teachers') {
    return <TeachersPage />;
  }

  if (feature === 'Add Teacher') {
    return <AddTeacherPage />;
  }

  /*
   * ============================================================
   * SUBJECTS
   * ============================================================
   */

  if (feature === 'Subjects') {
    return <CoursesPage />;
  }

  if (feature === 'Add Subject') {
    return <AddSubjectPage />;
  }

  /*
   * ============================================================
   * COURSES
   *
   * Backward compatibility for older navigation.
   * ============================================================
   */

  if (feature === 'Courses') {
    return <CoursesPage />;
  }

  if (feature === 'Add Course') {
    return <AddSubjectPage />;
  }

  /*
   * ============================================================
   * BRANCHES
   * ============================================================
   */

  if (feature === 'Branches') {
    return <BranchesPage />;
  }

  if (feature === 'Add Branch') {
    return <AddBranchPage />;
  }

  /*
   * ============================================================
   * BATCHES
   *
   * Batches      -> BatchesPage
   * Add Batch    -> AddBatchPage
   * Create Batch -> AddBatchPage
   * ============================================================
   */

  if (feature === 'Batches') {
    return <BatchesPage />;
  }

  if (
    feature === 'Add Batch' ||
    feature === 'Create Batch'
  ) {
    return <AddBatchPage />;
  }

  /*
   * ============================================================
   * ATTENDANCE
   *
   * Attendance       -> AttendancePage
   * Add Attendance   -> AddAttendancePage
   * Mark Attendance  -> AddAttendancePage
   * ============================================================
   */

  if (feature === 'Attendance') {
    return <AttendancePage />;
  }

  if (feature === 'Mark Attendance' || feature === 'Edit Attendance') {
    return <MarkAttendancePage />;
  }

  

  /*
   * ============================================================
   * EXAMINATIONS
   *
   * Examinations    -> ExaminationsPage
   * Add Examination -> AddExaminationPage
   * Schedule Test   -> AddExaminationPage
   * Quiz            -> AddExaminationPage
   * ============================================================
   */

  if (feature === 'Examinations') {
    return <ExaminationsPage />;
  }

  if (
    feature === 'Add Examination' ||
    feature === 'Add Examinations' ||
    feature === 'Create Examination' ||
    feature === 'Schedule Test' ||
    feature === 'Quiz'
  ) {
    return <AddExaminationPage />;
  }

  /*
   * ============================================================
   * ASSIGNMENTS
   *
   * Assignments          -> AssignmentsPage
   * Add Assignment      -> AddAssignmentsPage
   * Create Assignment   -> AddAssignmentsPage
   * ============================================================
   */

  if (feature === 'Assignments') {
    return <AssignmentsPage />;
  }

  if (
    feature === 'Add Assignment' ||
    feature === 'Add Assignments' ||
    feature === 'Create Assignment'
  ) {
    return <AddAssignmentsPage />;
  }

  /*
   * ============================================================
   * FEES
   * ============================================================
   */

  if (feature === 'Fees Management') {
    return <FeesManagementPage />;
  }

  if (
    feature === 'Fee Collection' ||
    feature === 'Collect Fee'
  ) {
    return <CollectFeePage />;
  }

  /*
   * ============================================================
   * PERFORMANCE
   *
   * Performance     -> PerformancePage
   * Add Performance -> AddPerformancePage
   * Publish Result  -> AddPerformancePage
   * ============================================================
   */

  if (feature === 'Performance') {
    return <PerformancePage />;
  }

  if (
    feature === 'Add Performance' ||
    feature === 'Create Performance' ||
    feature === 'Publish Result'
  ) {
    return <AddPerformancePage />;
  }

  /*
   * ============================================================
   * FEEDBACK
   *
   * Feedback has its own page.
   * ============================================================
   */

  if (feature === 'Feedback') {
    return <FeedbackPage />;
  }

  /*
   * ============================================================
   * USERS & ROLES
   * ============================================================
   */

  if (feature === 'Users & Roles') {
    return <UsersRolesPage />;
  }

  if (feature === 'Add User') {
    return <AddUserPage />;
  }

  /*
   * ============================================================
   * ANNOUNCEMENTS
   * ============================================================
   */

  if (
    feature === 'Announcements' ||
    feature === 'Announcement'
  ) {
    return <AnnouncementsPage />;
  }

  /*
   * ============================================================
   * MESSAGES
   * ============================================================
   */

  if (
    feature === 'Messages' ||
    feature === 'WhatsApp'
  ) {
    return <MessagesPage />;
  }

  /*
   * ============================================================
   * REPORTS
   * ============================================================
   */

  if (
    feature === 'Reports' ||
    feature === 'Generate Report'
  ) {
    return <ReportsPage />;
  }

  /*
   * ============================================================
   * SETTINGS
   * ============================================================
   */

  if (feature === 'Settings') {
    return <SettingsPage />;
  }

  /*
   * ============================================================
   * AUDIT LOGS
   * ============================================================
   */

  if (feature === 'Audit Logs') {
    return <AuditLogsPage />;
  }

  /*
   * ============================================================
   * PROFILE
   * ============================================================
   */

  if (feature === 'Profile') {
    return <ProfilePage />;
  }

  /*
   * ============================================================
   * TIMETABLE
   * ============================================================
   */

  if (feature === 'Timetable') {
    return <TimetablePage />;
  }

  if (feature === 'Add Class') {
    return <AddClassPage />;
  }

  /*
   * ============================================================
   * STAFF ON LEAVE
   * ============================================================
   */

  if (feature === 'Staff on Leave') {
    return <StaffOnLeavePage />;
  }

  if (feature === 'Add Leave') {
    return <AddLeavePage />;
  }

  /*
   * ============================================================
   * ACADEMICS
   * ============================================================
   */

  if (feature === 'Academics') {
    return <AcademicsPage />;
  }

  if (
    feature === 'Add Academic Info' ||
    feature === 'Add AcademicYear' ||
    feature === 'Create Academic Info'
  ) {
    return <AddAcademicYearInfoPage />;
  }

  /*
   * ============================================================
   * ACCOUNTS
   * ============================================================
   */

  if (feature === 'Accounts') {
    return <AccountsPage />;
  }

  if (feature === 'Add Transaction') {
    return <AddTransactionPage />;
  }

  /*
   * ============================================================
   * ACADEMIC CALENDAR
   * ============================================================
   */

  if (
    feature === 'Academic Calendar' ||
    feature === 'Academic Event' ||
    feature === 'Add Calendar Event' ||
    feature === 'Event'
  ) {
    return <AcademicCalendarPage />;
  }

  /*
   * ============================================================
   * PTG
   * ============================================================
   */

  if (
    feature === 'PTG' ||
    feature === 'Parent Teacher Meeting'
  ) {
    return <PTGPage />;
  }

  /*
   * ============================================================
   * STUDENT COMPLAINT
   * ============================================================
   */

  if (feature === 'Student Complaint') {
    return <StudentComplaintPage />;
  }

  /*
   * ============================================================
   * FALLBACK
   * ============================================================
   */

  return (
    <View style={styles.container}>
      <View style={styles.emptyCard}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            size={32}
            color="#7357D9"
          />
        </View>

        <Text style={styles.title}>
          {feature || 'Dashboard'}
        </Text>

        <Text style={styles.description}>
          Select an option from the dashboard to view
          its academic management page.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/(tabs)')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.buttonText}>
            Back to Dashboard
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FC',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEAF5',

    shadowColor: '#5D4AA8',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: '#EEEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#29243C',
    textAlign: 'center',
  },

  description: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    lineHeight: 19,
    color: '#858195',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 20,
  },

  button: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: '#7357D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  buttonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});