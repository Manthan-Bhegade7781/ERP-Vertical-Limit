import React, { useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import MarkAttendance from './QuickActions/MarkAttendance';

type TabName =
  | 'home'
  | 'batches'
  | 'students'
  | 'profile'
  | 'attendance';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] =
    useState<TabName>('home');

  /* ============================================================
     PROFILE DATA
     ============================================================ */

  const [profileName, setProfileName] =
    useState('Priya Sharma');

  const [profileEmail, setProfileEmail] =
    useState(
      'priya.sharma@example.com',
    );

  const [profilePhone, setProfilePhone] =
    useState('+91 98765 43210');

  /* ============================================================
     BOTTOM NAV ANIMATION
     ============================================================ */

  const bottomNavTranslateY =
    useRef(
      new Animated.Value(0),
    ).current;

  const lastScrollY =
    useRef(0);

  const navHidden =
    useRef(false);

  const bottomNavHeight =
    82 + insets.bottom;

  /* ============================================================
     BOTTOM NAV SHOW / HIDE
     ============================================================ */

  const animateBottomNav = (
    hide: boolean,
  ) => {
    if (navHidden.current === hide) {
      return;
    }

    navHidden.current = hide;

    Animated.timing(
      bottomNavTranslateY,
      {
        toValue: hide
          ? bottomNavHeight
          : 0,

        duration: 180,

        useNativeDriver: true,
      },
    ).start();
  };

  /* ============================================================
     HANDLE SCROLL
     ============================================================ */

  const handleContentScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const currentScrollY =
      event.nativeEvent.contentOffset.y;

    /*
     * Always show the navigation
     * when the user reaches the top.
     */
    if (currentScrollY <= 5) {
      lastScrollY.current = 0;

      animateBottomNav(false);

      return;
    }

    const difference =
      currentScrollY -
      lastScrollY.current;

    /*
     * Ignore tiny movements.
     */
    if (Math.abs(difference) < 4) {
      return;
    }

    /*
     * Scrolling down the page:
     * hide bottom navigation.
     */
    if (difference > 0) {
      animateBottomNav(true);
    }

    /*
     * Scrolling up:
     * show bottom navigation.
     */
    else {
      animateBottomNav(false);
    }

    lastScrollY.current =
      currentScrollY;
  };

  /* ============================================================
     HANDLE TAB CHANGE
     ============================================================ */

  const handleTabChange = (
    tab: TabName,
  ) => {
    /*
     * Every time the teacher changes
     * page, bring the bottom navigation
     * back.
     */
    lastScrollY.current = 0;

    animateBottomNav(false);

    setActiveTab(tab);
  };

  /* ============================================================
     SAVE PROFILE
     ============================================================ */

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

  /* ============================================================
     UI
     ============================================================ */

  return (
    <View style={styles.container}>

      {/* ======================================================
          HEADER
         ====================================================== */}

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
          handleTabChange(
            'profile',
          );
        }}
      />

      {/* ======================================================
          HOME
         ====================================================== */}

      {activeTab === 'home' && (
        <ScrollView
          style={styles.scrollView}
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

            /*
             * MARK ATTENDANCE
             *
             * This now opens
             * MarkAttendance.tsx
             */
            onAttendancePress={() => {
              handleTabChange(
                'attendance',
              );
            }}

            onLectureLogPress={() => {
              console.log(
                'Add Lecture Log pressed',
              );
            }}

            onBatchesPress={() => {
              handleTabChange(
                'batches',
              );
            }}

            onReportsPress={() => {
              console.log(
                'View Reports pressed',
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

      {/* ======================================================
          PROFILE
         ====================================================== */}

      {activeTab === 'profile' && (
        <View
          style={
            styles.profileContainer
          }
        >
          <ProfilePage
            name={profileName}
            email={profileEmail}
            phone={profilePhone}
            onSaveProfile={
              handleSaveProfile
            }
            onContentScroll={
              handleContentScroll
            }
          />
        </View>
      )}

      {/* ======================================================
          MARK ATTENDANCE
         ====================================================== */}

      {activeTab === 'attendance' && (
        <View
          style={
            styles.attendanceContainer
          }
        >
          <MarkAttendance
            onContentScroll={
              handleContentScroll
            }
          />
        </View>
      )}

      {/* ======================================================
          BATCHES
         ====================================================== */}

      {activeTab === 'batches' && (
        <View
          style={
            styles.placeholderContainer
          }
        />
      )}

      {/* ======================================================
          STUDENTS
         ====================================================== */}

      {activeTab === 'students' && (
        <View
          style={
            styles.placeholderContainer
          }
        />
      )}

      {/* ======================================================
          BOTTOM NAVIGATION
         ====================================================== */}

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
          /*
           * Attendance is a secondary page,
           * so we keep Home visually selected
           * for now.
           */
          activeTab={
            activeTab ===
            'attendance'
              ? 'home'
              : activeTab
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

/* ==============================================================
   STYLES
   ============================================================== */

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

  profileContainer: {
    flex: 1,
    backgroundColor:
      '#F6F6F9',
  },

  attendanceContainer: {
    flex: 1,
    backgroundColor:
      '#F6F6F9',
  },

  placeholderContainer: {
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

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: -2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 6,
  },
});