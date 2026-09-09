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
import { useAuth } from '@/context/AuthContext';
import { updateCurrentUser } from '@/services/auth';

import MarkAttendance from './QuickActions/MarkAttendance';
import AddLectureLog from './QuickActions/AddLectureLog';

import BatchesPage from './Batches/BatchesPage';

type TabName =
  | 'home'
  | 'batches'
  | 'students'
  | 'profile'
  | 'attendance'
  | 'lectureLog';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] =
    useState<TabName>('home');

  /*
   * Profile data
   * Comes from the authenticated user.
   */
  const profileName = user?.fullName ?? '';
  const profileEmail = user?.email ?? '';
  const profilePhone = user?.mobileNumber ?? '';

  /* --------------------------------
     BOTTOM NAV ANIMATION
  -------------------------------- */

  const bottomNavTranslateY =
    useRef(new Animated.Value(0)).current;

  const lastScrollY =
    useRef(0);

  const isBottomNavHidden =
    useRef(false);

  const bottomNavHeight =
    82 + insets.bottom;

  /* --------------------------------
     SCROLL HANDLER
  -------------------------------- */

  const handleContentScroll = (
    event: any,
  ) => {
    const currentScrollY =
      event.nativeEvent.contentOffset.y;

    const difference =
      currentScrollY -
      lastScrollY.current;

    /*
     * Always show navbar when the user
     * reaches the top of the page.
     */
    if (currentScrollY <= 5) {
      if (isBottomNavHidden.current) {
        isBottomNavHidden.current = false;

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

    /*
     * Ignore tiny movements.
     */
    if (Math.abs(difference) < 4) {
      return;
    }

    /*
     * Scroll DOWN -> hide bottom navigation.
     */
    if (difference > 0) {
      if (!isBottomNavHidden.current) {
        isBottomNavHidden.current = true;

        Animated.timing(
          bottomNavTranslateY,
          {
            toValue: bottomNavHeight,
            duration: 220,
            useNativeDriver: true,
          },
        ).start();
      }
    }

    /*
     * Scroll UP -> show bottom navigation.
     */
    else {
      if (isBottomNavHidden.current) {
        isBottomNavHidden.current = false;

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

  /* --------------------------------
     RESET BOTTOM NAV
  -------------------------------- */

  const resetBottomNav = () => {
    lastScrollY.current = 0;

    isBottomNavHidden.current = false;

    bottomNavTranslateY.setValue(0);
  };

  /* --------------------------------
     TAB CHANGE
  -------------------------------- */

  const handleTabChange = (
    tab: TabName,
  ) => {
    resetBottomNav();

    setActiveTab(tab);
  };

  /* --------------------------------
     SAVE PROFILE
  -------------------------------- */

  const handleSaveProfile = async (
    name: string,
    email: string,
    phone: string,
  ) => {
    try {
      const result = await updateCurrentUser(
        name,
        email,
        phone,
      );

      if (
        !result.success ||
        !result.data?.user
      ) {
        console.error(
          'PROFILE UPDATE FAILED:',
          result.message,
        );
        return;
      }

      const updatedUser =
        result.data.user;

      /*
       * Update global authentication state
       * so the new profile information is
       * immediately reflected throughout
       * the app.
       */
      updateUser(updatedUser);

      console.log(
        'PROFILE UPDATED:',
        updatedUser,
      );
    } catch (error) {
      console.error(
        'PROFILE UPDATE ERROR:',
        error,
      );
    }
  };

  return (
    <View style={styles.container}>

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
          setActiveTab('profile');
        }}
      />

      {/* =================================
          HOME PAGE
      ================================= */}

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

      {/* =================================
          PROFILE PAGE
      ================================= */}

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

      {/* =================================
          BATCHES PAGE
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
          ATTENDANCE PAGE
      ================================= */}

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

      {/* =================================
          ADD LECTURE LOG PAGE
      ================================= */}

      {activeTab === 'lectureLog' && (
        <View
          style={
            styles.lectureLogContainer
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
          STUDENTS PAGE
      ================================= */}

      {activeTab === 'students' && (
        <View
          style={
            styles.placeholderContainer
          }
        >
          {/* Students page coming soon */}
        </View>
      )}

      {/* =================================
          BOTTOM NAVIGATION

          Attendance and lectureLog are
          subpages, so map them to home
          for TeacherBottomNav.
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
                : activeTab === 'profile'
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
    backgroundColor: '#F7F7FA',
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
    backgroundColor: '#F6F6F9',
  },

  attendanceContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  lectureLogContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  pageContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  placeholderContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 999,
    elevation: 30,
    borderTopWidth: 1,
    borderTopColor: '#E6E6EA',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
});