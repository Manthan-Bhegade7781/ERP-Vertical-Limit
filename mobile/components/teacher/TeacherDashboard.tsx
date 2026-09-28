import React, {
  useRef,
  useState,
} from 'react';

import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TeacherHeader from './TeacherHeader';

import TeacherBottomNav from './TeacherBottomNav';

import OverviewSection from './Overview/OverviewSection';

import ScheduleSection from './Schedule/ScheduleSection';

import QuickActionsSection from './QuickActions/QuickActionsSection';

import AnnouncementsSection from './Announcements/AnnouncementsSection';

import ProfilePage from './Profile/ProfilePage';

import ChangePasswordPage from './Profile/ChangePasswordPage';

import NotificationSettingsPage from './Profile/NotificationSettingsPage';

import HelpSupportPage from './Profile/HelpSupportPage';

import MarkAttendance from './QuickActions/MarkAttendance';

import AddLectureLog from './QuickActions/AddLectureLog';

import BatchesPage from './Batches/BatchesPage';

import StudentsPage from './Students/StudentsPage';

import ReportsPage from './Reports/ReportsPage';

type TabName =
  | 'home'
  | 'batches'
  | 'students'
  | 'profile'
  | 'attendance'
  | 'lectureLog'
  | 'reports'
  | 'changePassword'
  | 'notificationSettings'
  | 'helpSupport';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] =
    useState<TabName>('home');

  /* =====================================
     PROFILE DATA
  ===================================== */

  const [profileName, setProfileName] =
    useState('Priya Sharma');

  const [profileEmail, setProfileEmail] =
    useState(
      'priya.sharma@example.com',
    );

  const [profilePhone, setProfilePhone] =
    useState(
      '+91 98765 43210',
    );

  /* =====================================
     SELECTED STUDENT FOR REPORT
  ===================================== */

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState<string | undefined>(
    undefined,
  );

  const [
    selectedStudentName,
    setSelectedStudentName,
  ] = useState<string | undefined>(
    undefined,
  );

  /* =====================================
     BOTTOM NAV ANIMATION
  ===================================== */

  const bottomNavTranslateY =
    useRef(
      new Animated.Value(0),
    ).current;

  const lastScrollY =
    useRef(0);

  const isBottomNavHidden =
    useRef(false);

  const bottomNavHeight =
    82 + insets.bottom;

  /* =====================================
     LINKEDIN STYLE SCROLL
  ===================================== */

  const handleContentScroll = (
    event: any,
  ) => {
    const currentScrollY =
      event.nativeEvent.contentOffset.y;

    const difference =
      currentScrollY -
      lastScrollY.current;

    if (currentScrollY <= 5) {
      if (
        isBottomNavHidden.current
      ) {
        isBottomNavHidden.current =
          false;

        Animated.timing(
          bottomNavTranslateY,
          {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          },
        ).start();
      }

      lastScrollY.current =
        currentScrollY;

      return;
    }

    if (
      Math.abs(difference) < 4
    ) {
      return;
    }

    /* Scroll DOWN -> hide */

    if (difference > 0) {
      if (
        !isBottomNavHidden.current
      ) {
        isBottomNavHidden.current =
          true;

        Animated.timing(
          bottomNavTranslateY,
          {
            toValue:
              bottomNavHeight,
            duration: 220,
            useNativeDriver: true,
          },
        ).start();
      }
    }

    /* Scroll UP -> show */

    else {
      if (
        isBottomNavHidden.current
      ) {
        isBottomNavHidden.current =
          false;

        Animated.timing(
          bottomNavTranslateY,
          {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          },
        ).start();
      }
    }

    lastScrollY.current =
      currentScrollY;
  };

  /* =====================================
     RESET NAVBAR
  ===================================== */

  const resetBottomNav = () => {
    lastScrollY.current = 0;

    isBottomNavHidden.current =
      false;

    bottomNavTranslateY.setValue(0);
  };

  /* =====================================
     CHANGE TAB
  ===================================== */

  const handleTabChange = (
    tab: TabName,
  ) => {
    resetBottomNav();

    setActiveTab(tab);
  };

  /* =====================================
     OPEN STUDENT REPORT
  ===================================== */

  const handleStudentReportPress = (
    studentId: string,
    studentName: string,
  ) => {
    setSelectedStudentId(
      studentId,
    );

    setSelectedStudentName(
      studentName,
    );

    resetBottomNav();

    setActiveTab('reports');
  };

  /* =====================================
     SAVE PROFILE
  ===================================== */

  const handleSaveProfile = (
    name: string,
    email: string,
    phone: string,
  ) => {
    setProfileName(name);

    setProfileEmail(email);

    setProfilePhone(phone);

    console.log(
      'PROFILE SAVED:',
      {
        name,
        email,
        phone,
      },
    );
  };

  return (
    <View
      style={styles.container}
    >
      {/* =================================
          HEADER
      ================================= */}

      <TeacherHeader
        onMenuPress={() => {
          console.log(
            'Menu pressed',
          );
        }}
        onNotificationPress={() => {
          console.log(
            'Notifications pressed',
          );
        }}
        onProfilePress={() => {
          resetBottomNav();

          setActiveTab(
            'profile',
          );
        }}
      />

      {/* =================================
          HOME
      ================================= */}

      {activeTab === 'home' && (
        <ScrollView
          style={
            styles.scrollView
          }
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                bottomNavHeight + 20,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
          scrollEventThrottle={16}
          onScroll={
            handleContentScroll
          }
        >
          <OverviewSection />

          <ScheduleSection
            onViewAllPress={() => {
              console.log(
                'View All Schedule pressed',
              );
            }}
          />

          <QuickActionsSection
            onAttendancePress={() => {
              handleTabChange(
                'attendance',
              );
            }}
            onLectureLogPress={() => {
              handleTabChange(
                'lectureLog',
              );
            }}
            onBatchesPress={() => {
              handleTabChange(
                'batches',
              );
            }}
            onReportsPress={() => {
              setSelectedStudentId(
                undefined,
              );

              setSelectedStudentName(
                undefined,
              );

              handleTabChange(
                'reports',
              );
            }}
          />

          <AnnouncementsSection
            onViewAllPress={() => {
              console.log(
                'View All Announcements pressed',
              );
            }}
          />
        </ScrollView>
      )}

      {/* =================================
          PROFILE
      ================================= */}

      {activeTab === 'profile' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <ProfilePage
            name={
              profileName
            }
            email={
              profileEmail
            }
            phone={
              profilePhone
            }
            onSaveProfile={
              handleSaveProfile
            }
            onContentScroll={
              handleContentScroll
            }
            onChangePasswordPress={() => {
              resetBottomNav();

              setActiveTab(
                'changePassword',
              );
            }}
            onNotificationSettingsPress={() => {
              resetBottomNav();

              setActiveTab(
                'notificationSettings',
              );
            }}
            onHelpPress={() => {
              resetBottomNav();

              setActiveTab(
                'helpSupport',
              );
            }}
          />
        </View>
      )}

      {/* =================================
          CHANGE PASSWORD
      ================================= */}

      {activeTab === 'changePassword' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <ChangePasswordPage
            onContentScroll={
              handleContentScroll
            }
            onBack={() => {
              resetBottomNav();

              setActiveTab(
                'profile',
              );
            }}
          />
        </View>
      )}

      {/* =================================
          NOTIFICATION SETTINGS
      ================================= */}

      {activeTab ===
        'notificationSettings' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <NotificationSettingsPage
            onContentScroll={
              handleContentScroll
            }
            onBack={() => {
              resetBottomNav();

              setActiveTab(
                'profile',
              );
            }}
          />
        </View>
      )}

      {/* =================================
          HELP & SUPPORT
      ================================= */}

      {activeTab === 'helpSupport' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <HelpSupportPage
            onContentScroll={
              handleContentScroll
            }
            onBack={() => {
              resetBottomNav();

              setActiveTab(
                'profile',
              );
            }}
          />
        </View>
      )}

      {/* =================================
          BATCHES
      ================================= */}

      {activeTab === 'batches' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <BatchesPage
            onContentScroll={
              handleContentScroll
            }
          />
        </View>
      )}

      {/* =================================
          STUDENTS
      ================================= */}

      {activeTab === 'students' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <StudentsPage
            onContentScroll={
              handleContentScroll
            }
            onStudentReportPress={
              handleStudentReportPress
            }
          />
        </View>
      )}

      {/* =================================
          ATTENDANCE
      ================================= */}

      {activeTab === 'attendance' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <MarkAttendance
            onContentScroll={
              handleContentScroll
            }
          />
        </View>
      )}

      {/* =================================
          LECTURE LOG
      ================================= */}

      {activeTab === 'lectureLog' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <AddLectureLog
            onContentScroll={
              handleContentScroll
            }
          />
        </View>
      )}

      {/* =================================
          REPORTS
      ================================= */}

      {activeTab === 'reports' && (
        <View
          style={
            styles.pageContainer
          }
        >
          <ReportsPage
            studentId={
              selectedStudentId
            }
            studentName={
              selectedStudentName
            }
            onContentScroll={
              handleContentScroll
            }
          />
        </View>
      )}

      {/* =================================
          BOTTOM NAVIGATION
      ================================= */}

      <Animated.View
        style={[
          styles.bottomNavWrapper,
          {
            paddingBottom:
              insets.bottom,
            transform: [
              {
                translateY:
                  bottomNavTranslateY,
              },
            ],
          },
        ]}
      >
        <TeacherBottomNav
          activeTab={
            activeTab === 'batches'
              ? 'batches'
              : activeTab === 'students'
                ? 'students'
                : activeTab === 'profile' ||
                  activeTab ===
                    'changePassword' ||
                  activeTab ===
                    'notificationSettings' ||
                  activeTab ===
                    'helpSupport'
                  ? 'profile'
                  : 'home'
          }
          onTabChange={
            handleTabChange
          }
          onAddPress={() => {
            console.log(
              'Add pressed',
            );
          }}
        />
      </Animated.View>
    </View>
  );
}

/* =====================================
   STYLES
===================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#F7F7FA',
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
    backgroundColor:
      '#F6F6F9',
  },

  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      '#FFFFFF',
    zIndex: 999,
    elevation: 30,
    borderTopWidth: 1,
    borderTopColor:
      '#E6E6EA',
    shadowColor:
      '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
});