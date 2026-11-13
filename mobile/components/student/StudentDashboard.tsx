import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

import StudentHeader from './StudentHeader';
import StudentBottomNav from './StudentBottomNav';

import StudentOverview from './Overview/StudentOverview';
import QuickAccessSection from './QuickAccess/QuickAccessSection';

import MyClassesPage from './Classes/MyClassesPage';
import TimetablePage from './Classes/TimetablePage';

import AttendancePage from './Attendance/AttendancePage';
import { getMyAttendance, StudentAttendanceData } from '../../services/attendance';

import StudyMaterialsPage from './Learning/StudyMaterialsPage';
import LectureNotesPage from './Learning/LectureNotesPage';
import AssignmentsPage from './Learning/AssignmentsPage';
import { fetchAssignments } from '../../services/assignments';

import UpcomingTestsPage from './Tests/UpcomingTestsPage';
import TakeTestPage from './Tests/TakeTestPage';
import ResultsPage from './Tests/ResultsPage';

import PerformancePage from './Performance/PerformancePage';

import FeeOverviewPage from './Fees/FeeOverviewPage';
import PaymentHistoryPage from './Fees/PaymentHistoryPage';
import PayFeesPage from './Fees/PayFeesPage';
import FeeReceipt from './Fees/FeeReceipt';
import { getMyFees, StudentFeesSummary } from '../../services/fees';

import StudentProfilePage from './Profile/StudentProfilePage';
import ChangePasswordPage from './Profile/ChangePasswordPage';

import HelpSupportPage from './Support/HelpSupportPage';

import AnnouncementsPage from './Announcements/AnnouncementsPage';
import AcademicCalendarPage from './AcademicCalendar/AcademicCalendarPage';
import FeedbackPage from './Feedback/FeedbackPage';
import PTGPage from './PTG/PTGPage';
import StudentMessagesPage from './Messages/StudentMessagesPage';

import NotificationsPage from './Notifications/NotificationsPage';
import { fetchUnreadNotificationCount } from '../../services/notifications';

type BottomTab =
  | 'home'
  | 'classes'
  | 'tests'
  | 'fees'
  | 'profile';

type CurrentPage =
  | 'home'
  | 'myClasses'
  | 'timetable'
  | 'attendance'
  | 'studyMaterials'
  | 'lectureNotes'
  | 'assignments'
  | 'upcomingTests'
  | 'takeTest'
  | 'results'
  | 'performance'
  | 'feeOverview'
  | 'paymentHistory'
  | 'payFees'
  | 'feeReceipt'
  | 'profile'
  | 'changePassword'
  | 'helpSupport'
  | 'notifications'
  | 'announcements'
  | 'academicCalendar'
  | 'feedback'
  | 'ptg'
  | 'messages';

type PageBackButtonProps = {
  title: string;
  onBack: () => void;
};

function PageBackButton({
  title,
  onBack,
}: PageBackButtonProps) {
  return (
    <Pressable
      style={styles.pageHeader}
      onPress={onBack}
      hitSlop={8}
    >
      <View style={styles.pageBackButton}>
        <Ionicons
          name="arrow-back"
          size={19}
          color="#6630D7"
        />
      </View>

      <Text style={styles.pageHeaderTitle}>
        {title}
      </Text>
    </Pressable>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)');
    } catch (error) {
      Alert.alert('Logout failed', 'Please try again.');
    }
  };
  const [activeTab, setActiveTab] =
    useState<BottomTab>('home');

  const [currentPage, setCurrentPage] =
    useState<CurrentPage>('home');

  const [attendanceData, setAttendanceData] =
    useState<StudentAttendanceData | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoadingAttendance(true);
      const res = await getMyAttendance();
      setAttendanceData(res);
    } catch (error) {
      console.log('Error fetching student attendance:', error);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  const [feesSummary, setFeesSummary] = useState<StudentFeesSummary | null>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<any | null>(null);
  const [selectedExamTest, setSelectedExamTest] = useState<any | null>(null);

  const fetchFees = useCallback(async () => {
    try {
      const res = await getMyFees();
      setFeesSummary(res);
    } catch (err) {
      console.log('Error fetching student fees:', err);
    }
  }, []);

  useEffect(() => {
    void fetchFees();
  }, [fetchFees]);

  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState<number>(0);

  const fetchAssignmentsCount = useCallback(async () => {
    try {
      const records = await fetchAssignments();
      setPendingAssignmentsCount(records.length);
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchAssignmentsCount();
  }, [fetchAssignmentsCount]);

  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const count = await fetchUnreadNotificationCount();
      setUnreadNotificationCount(count);
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  const [homeRefreshing, setHomeRefreshing] = useState(false);

  const handleHomeRefresh = async () => {
    setHomeRefreshing(true);
    await Promise.allSettled([
      fetchAttendance(),
      fetchFees(),
      fetchAssignmentsCount(),
      fetchUnreadNotifications(),
    ]);
    setHomeRefreshing(false);
  };

  const bottomNavTranslateY = useRef(
    new Animated.Value(0),
  ).current;

  const lastScrollY = useRef(0);

  const openPage = (
    page: CurrentPage,
    tab?: BottomTab,
  ) => {
    setCurrentPage(page);

    if (tab) {
      setActiveTab(tab);
    }

    lastScrollY.current = 0;

    Animated.spring(bottomNavTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const handleTabChange = (tab: BottomTab) => {
    setActiveTab(tab);

    switch (tab) {
      case 'home':
        openPage('home', 'home');
        break;

      case 'classes':
        openPage('myClasses', 'classes');
        break;

      case 'tests':
        openPage('upcomingTests', 'tests');
        break;

      case 'fees':
        openPage('feeOverview', 'fees');
        break;

      case 'profile':
        openPage('profile', 'profile');
        break;
    }
  };

  /*
   * LinkedIn-style bottom navigation
   *
   * Scroll down = hide
   * Scroll up   = show
   */
  const handleContentScroll = (event: any) => {
    const currentY =
      event?.nativeEvent?.contentOffset?.y ?? 0;

    const difference =
      currentY - lastScrollY.current;

    if (currentY <= 5) {
      Animated.spring(bottomNavTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (difference > 3) {
      Animated.timing(bottomNavTranslateY, {
        toValue: 110,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else if (difference < -3) {
      Animated.spring(bottomNavTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }

    lastScrollY.current = currentY;
  };

  const renderBottomNav = () => {
    return (
      <Animated.View
        style={[
          styles.bottomNavWrapper,
          {
            transform: [
              {
                translateY:
                  bottomNavTranslateY,
              },
            ],
          },
        ]}
      >
        <StudentBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </Animated.View>
    );
  };

  /* =========================
     HOME
  ========================= */

  const renderHome = () => {
  return (
    <View style={styles.pageContainer}>
      <StudentHeader
        unreadCount={unreadNotificationCount}
        onNotificationPress={() =>
          openPage('notifications')
        }
        onViewAllNotifications={() =>
          openPage('notifications')
        }
        onAnnouncementPress={() =>
          openPage('announcements')
        }
        onPTGPress={() =>
          openPage('ptg')
        }
        onMessagesPress={() =>
          openPage('messages')
        }
        onProfilePress={() =>
          openPage('profile', 'profile')
        }
        onLogoutPress={handleLogout}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleContentScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.homeContent}
        refreshControl={
          <RefreshControl
            refreshing={homeRefreshing}
            onRefresh={handleHomeRefresh}
            colors={['#6630D7']}
            tintColor="#6630D7"
          />
        }
      >
        <StudentOverview
          attendancePercentage={attendanceData?.overall?.percentage}
          pendingFees={feesSummary?.pendingFees ?? 0}
          pendingAssignmentsCount={pendingAssignmentsCount}
          onAttendancePress={() =>
            openPage('attendance')
          }
          onClassesPress={() =>
            openPage('myClasses', 'classes')
          }
          onFeesPress={() =>
            openPage('feeOverview', 'fees')
          }
          onTestsPress={() =>
            openPage('upcomingTests', 'tests')
          }
          onTimetablePress={() =>
            openPage('timetable', 'classes')
          }
          onAssignmentsPress={() =>
            openPage('assignments')
          }
        />

        <QuickAccessSection
          onClassesPress={() =>
            openPage('myClasses', 'classes')
          }
          onAttendancePress={() =>
            openPage('attendance')
          }
          onLectureNotesPress={() =>
            openPage('lectureNotes')
          }
          onTestsPress={() =>
            openPage('upcomingTests', 'tests')
          }
          onAnnouncementsPress={() =>
            openPage('announcements')
          }
          onCalendarPress={() =>
            openPage('academicCalendar')
          }
          onFeedbackPress={() =>
            openPage('feedback')
          }
          onPTGPress={() =>
            openPage('ptg')
          }
          onMessagesPress={() =>
            openPage('messages')
          }
          onHelpPress={() =>
            openPage('helpSupport', 'profile')
          }
        />

        <View style={styles.bottomSpace} />
      </Animated.ScrollView>

      {renderBottomNav()}
    </View>
  );
};

  /* =========================
     CLASSES
  ========================= */

  const renderMyClasses = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="My Classes"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <MyClassesPage
          onContentScroll={
            handleContentScroll
          }
          onTimetablePress={() =>
            openPage('timetable', 'classes')
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  const renderTimetable = () => {
    return (
      <View style={styles.pageContainer}>
        <TimetablePage
          onContentScroll={
            handleContentScroll
          }
          onBack={() =>
            openPage(
              'myClasses',
              'classes',
            )
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     ATTENDANCE
  ========================= */

  const renderAttendance = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="My Attendance"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <AttendancePage
          data={attendanceData}
          loading={loadingAttendance}
          onRefresh={fetchAttendance}
          onContentScroll={
            handleContentScroll
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     LEARNING
  ========================= */

  const renderStudyMaterials = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Study Materials"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <StudyMaterialsPage
          onContentScroll={
            handleContentScroll
          }
          onNavigate={(page) => openPage(page)}
        />

        {renderBottomNav()}
      </View>
    );
  };

  const renderLectureNotes = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Lecture Notes"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <LectureNotesPage
          onContentScroll={
            handleContentScroll
          }
          onNavigate={(page) => openPage(page)}
        />

        {renderBottomNav()}
      </View>
    );
  };

  const renderAssignments = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Assignments"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <AssignmentsPage
          onContentScroll={
            handleContentScroll
          }
          onNavigate={(page) => openPage(page)}
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     TESTS
  ========================= */

  const renderUpcomingTests = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Upcoming Tests"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <UpcomingTestsPage
          onContentScroll={
            handleContentScroll
          }
          onTakeTest={(test) => {
            setSelectedExamTest(test);
            openPage('takeTest', 'tests');
          }}
          onViewResults={() => openPage('results', 'tests')}
        />

        {renderBottomNav()}
      </View>
    );
  };

  const renderTakeTest = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Take Test"
          onBack={() =>
            openPage(
              'upcomingTests',
              'tests',
            )
          }
        />

        <TakeTestPage
          test={selectedExamTest}
          onContentScroll={
            handleContentScroll
          }
          onBack={() => openPage('upcomingTests', 'tests')}
          onTestSubmitted={() => openPage('results', 'tests')}
        />

        {renderBottomNav()}
      </View>
    );
  };

  const renderResults = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Results"
          onBack={() =>
            openPage(
              'upcomingTests',
              'tests',
            )
          }
        />

        <ResultsPage
          onContentScroll={
            handleContentScroll
          }
          onViewUpcoming={() => openPage('upcomingTests', 'tests')}
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     PERFORMANCE
  ========================= */

  const renderPerformance = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Performance"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <PerformancePage
          onContentScroll={
            handleContentScroll
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     FEES
  ========================= */

  const renderFeeOverview = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Fees"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <FeeOverviewPage
          data={feesSummary}
          onRefresh={fetchFees}
          onContentScroll={
            handleContentScroll
          }
          onPaymentHistoryPress={() =>
            openPage('paymentHistory', 'fees')
          }
          onPayFeesPress={() =>
            openPage('payFees', 'fees')
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  const renderPaymentHistory = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Payment History"
          onBack={() =>
            openPage(
              'feeOverview',
              'fees',
            )
          }
        />

        <PaymentHistoryPage
          onRefresh={fetchFees}
          onContentScroll={
            handleContentScroll
          }
          onReceiptPress={(payment) => {
            setSelectedReceiptPayment(payment);
            openPage('feeReceipt', 'fees');
          }}
        />

        {renderBottomNav()}
      </View>
    );
  };

  const renderPayFees = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Pay Fees"
          onBack={() =>
            openPage(
              'feeOverview',
              'fees',
            )
          }
        />

        <PayFeesPage
          feeRecords={feesSummary?.records}
          onContentScroll={
            handleContentScroll
          }
          onPaymentSuccess={(payment) => {
            setSelectedReceiptPayment(payment);
            void fetchFees();
          }}
          onViewReceipt={(payment) => {
            setSelectedReceiptPayment(payment);
            openPage('feeReceipt', 'fees');
          }}
          onBack={() =>
            openPage(
              'feeOverview',
              'fees',
            )
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  const renderFeeReceipt = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Fee Receipt"
          onBack={() =>
            openPage(
              'feeOverview',
              'fees',
            )
          }
        />

        <FeeReceipt
          payment={selectedReceiptPayment}
          studentInfo={{
            name: user?.fullName,
            studentId: user?.studentId,
            standard: user?.standard,
            batchName: user?.batchName,
          }}
          onContentScroll={
            handleContentScroll
          }
          onBack={() =>
            openPage(
              'feeOverview',
              'fees',
            )
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     PROFILE
  ========================= */

  const renderProfile = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Profile"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <StudentProfilePage
          onContentScroll={handleContentScroll}
          onChangePasswordPress={() =>
            openPage('changePassword', 'profile')
          }
          onHelpPress={() =>
            openPage('helpSupport', 'profile')
          }
          onCalendarPress={() =>
            openPage('academicCalendar')
          }
          onFeedbackPress={() =>
            openPage('feedback')
          }
          onPTGPress={() =>
            openPage('ptg')
          }
          onMessagesPress={() =>
            openPage('messages')
          }
          onLogout={handleLogout}
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     CHANGE PASSWORD
  ========================= */

  const renderChangePassword = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Change Password"
          onBack={() =>
            openPage(
              'profile',
              'profile',
            )
          }
        />

        <ChangePasswordPage
          onContentScroll={
            handleContentScroll
          }
          onBack={() =>
            openPage(
              'profile',
              'profile',
            )
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     HELP & SUPPORT
  ========================= */

  const renderHelpSupport = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Help & Support"
          onBack={() =>
            openPage(
              'profile',
              'profile',
            )
          }
        />

        <HelpSupportPage
          onContentScroll={
            handleContentScroll
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     NOTIFICATIONS
  ========================= */

  const renderNotifications = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Notifications"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <NotificationsPage
          onContentScroll={
            handleContentScroll
          }
          onNavigate={(targetPage) => openPage(targetPage as any)}
          onUnreadCountChange={setUnreadNotificationCount}
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     ANNOUNCEMENTS
  ========================= */

  const renderAnnouncements = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Announcements"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <AnnouncementsPage
          onContentScroll={
            handleContentScroll
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     ACADEMIC CALENDAR
  ========================= */

  const renderAcademicCalendar = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Academic Calendar"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <AcademicCalendarPage
          onContentScroll={
            handleContentScroll
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     FEEDBACK
  ========================= */

  const renderFeedback = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Feedback"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <FeedbackPage
          onContentScroll={
            handleContentScroll
          }
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     PTG MEETINGS
  ========================= */

  const renderPTG = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="PTG Schedule"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <PTGPage
          onContentScroll={handleContentScroll}
          onNavigateToMessages={() => openPage('messages')}
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     STUDENT MESSAGES
  ========================= */

  const renderMessages = () => {
    return (
      <View style={styles.pageContainer}>
        <PageBackButton
          title="Messages"
          onBack={() =>
            openPage('home', 'home')
          }
        />

        <StudentMessagesPage
          onContentScroll={handleContentScroll}
          onNavigateToPTG={() => openPage('ptg')}
        />

        {renderBottomNav()}
      </View>
    );
  };

  /* =========================
     PAGE SWITCH
  ========================= */

  switch (currentPage) {
    case 'home':
      return renderHome();

    case 'myClasses':
      return renderMyClasses();

    case 'timetable':
      return renderTimetable();

    case 'attendance':
      return renderAttendance();

    case 'studyMaterials':
      return renderStudyMaterials();

    case 'lectureNotes':
      return renderLectureNotes();

    case 'assignments':
      return renderAssignments();

    case 'upcomingTests':
      return renderUpcomingTests();

    case 'takeTest':
      return renderTakeTest();

    case 'results':
      return renderResults();

    case 'performance':
      return renderPerformance();

    case 'feeOverview':
      return renderFeeOverview();

    case 'paymentHistory':
      return renderPaymentHistory();

    case 'payFees':
      return renderPayFees();

    case 'feeReceipt':
      return renderFeeReceipt();

    case 'profile':
      return renderProfile();

    case 'changePassword':
      return renderChangePassword();

    case 'helpSupport':
      return renderHelpSupport();

    case 'notifications':
      return renderNotifications();

    case 'announcements':
      return renderAnnouncements();

    case 'academicCalendar':
      return renderAcademicCalendar();

    case 'feedback':
      return renderFeedback();

    case 'ptg':
      return renderPTG();

    case 'messages':
      return renderMessages();

    default:
      return renderHome();
  }
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },

  homeContent: {
    paddingBottom: 20,
  },

  bottomSpace: {
    height: 100,
  },

  pageHeader: {
    height: 62,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDF5',
  },

  pageBackButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  pageHeaderTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#292532',
  },

  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
});  