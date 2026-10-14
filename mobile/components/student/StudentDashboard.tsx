import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import StudentHeader from './StudentHeader';
import StudentBottomNav from './StudentBottomNav';

import StudentOverview from './Overview/StudentOverview';
import QuickAccessSection from './QuickAccess/QuickAccessSection';

import MyClassesPage from './Classes/MyClassesPage';
import TimetablePage from './Classes/TimetablePage';

import AttendancePage from './Attendance/AttendancePage';

import StudyMaterialsPage from './Learning/StudyMaterialsPage';
import LectureNotesPage from './Learning/LectureNotesPage';
import AssignmentsPage from './Learning/AssignmentsPage';

import UpcomingTestsPage from './Tests/UpcomingTestsPage';
import TakeTestPage from './Tests/TakeTestPage';
import ResultsPage from './Tests/ResultsPage';

import PerformancePage from './Performance/PerformancePage';

import FeeOverviewPage from './Fees/FeeOverviewPage';
import PaymentHistoryPage from './Fees/PaymentHistoryPage';
import PayFeesPage from './Fees/PayFeesPage';
import FeeReceipt from './Fees/FeeReceipt';

import StudentProfilePage from './Profile/StudentProfilePage';
import ChangePasswordPage from './Profile/ChangePasswordPage';

import HelpSupportPage from './Support/HelpSupportPage';

import NotificationsPage from './Notifications/NotificationsPage';

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
  | 'notifications';

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
  const [activeTab, setActiveTab] =
    useState<BottomTab>('home');

  const [currentPage, setCurrentPage] =
    useState<CurrentPage>('home');

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
        onNotificationPress={() =>
          openPage('notifications')
        }
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleContentScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.homeContent}
      >
        <StudentOverview
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
        />

        <QuickAccessSection
          onClassesPress={() =>
            openPage('myClasses', 'classes')
          }
          onAttendancePress={() =>
            openPage('attendance')
          }
          onTestsPress={() =>
            openPage('upcomingTests', 'tests')
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
          onContentScroll={
            handleContentScroll
          }
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
          onContentScroll={
            handleContentScroll
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
          onContentScroll={
            handleContentScroll
          }
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
          onContentScroll={
            handleContentScroll
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
          onContentScroll={
            handleContentScroll
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
          onContentScroll={
            handleContentScroll
          }
          onChangePasswordPress={() =>
            openPage(
              'changePassword',
              'profile',
            )
          }
          onHelpPress={() =>
            openPage(
              'helpSupport',
              'profile',
            )
          }
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