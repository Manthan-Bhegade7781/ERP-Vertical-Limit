import React, { useRef } from 'react';
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

type TabName =
  | 'home'
  | 'batches'
  | 'students'
  | 'profile';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] =
    React.useState<TabName>('home');

  /* ================= PROFILE DATA ================= */

  const [profileName, setProfileName] =
    React.useState('Priya Sharma');

  const [profileEmail, setProfileEmail] =
    React.useState('priya.sharma@example.com');

  const [profilePhone, setProfilePhone] =
    React.useState('+91 98765 43210');

  /* ================= BOTTOM NAV ANIMATION ================= */

  const bottomNavTranslateY = useRef(
    new Animated.Value(0),
  ).current;

  const lastScrollY = useRef(0);

  const isNavHidden = useRef(false);

  /*
   * Height of the bottom navigation including
   * the device safe-area space.
   */
  const bottomNavHeight =
    82 + insets.bottom;

  /*
   * Animate bottom navigation.
   *
   * hidden = true:
   * bottom nav slides down.
   *
   * hidden = false:
   * bottom nav slides back up.
   */
  const animateBottomNav = (hide: boolean) => {
    if (isNavHidden.current === hide) {
      return;
    }

    isNavHidden.current = hide;

    Animated.timing(bottomNavTranslateY, {
      toValue: hide ? bottomNavHeight : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  /*
   * Detect scroll direction.
   *
   * Content moves UP:
   * offset increases
   * -> hide bottom nav
   *
   * Content moves DOWN:
   * offset decreases
   * -> show bottom nav
   */
  const handleContentScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const currentScrollY =
      event.nativeEvent.contentOffset.y;

    /*
     * Always show nav at the very top.
     */
    if (currentScrollY <= 5) {
      lastScrollY.current = 0;
      animateBottomNav(false);
      return;
    }

    const difference =
      currentScrollY - lastScrollY.current;

    /*
     * Small movements are ignored.
     * This prevents flickering/jitter.
     */
    if (Math.abs(difference) < 4) {
      return;
    }

    /*
     * User is scrolling upward through content.
     */
    if (difference > 0) {
      animateBottomNav(true);
    }

    /*
     * User is scrolling downward through content.
     */
    else {
      animateBottomNav(false);
    }

    lastScrollY.current = currentScrollY;
  };

  /* ================= TAB CHANGE ================= */

  const handleTabChange = (tab: TabName) => {
    console.log('TAB CHANGED:', tab);

    /*
     * Whenever the user changes page,
     * bring the bottom nav back.
     */
    lastScrollY.current = 0;
    animateBottomNav(false);

    setActiveTab(tab);
  };

  /* ================= SAVE PROFILE ================= */

  const handleSaveProfile = (
    name: string,
    email: string,
    phone: string,
  ) => {
    setProfileName(name);
    setProfileEmail(email);
    setProfilePhone(phone);

    console.log('PROFILE SAVED:', {
      name,
      email,
      phone,
    });
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}

      <TeacherHeader
        onMenuPress={() => {
          console.log('Menu pressed');
        }}
        onNotificationPress={() => {
          console.log('Notifications pressed');
        }}
        onProfilePress={() => {
          console.log('HEADER PROFILE PRESSED');

          lastScrollY.current = 0;
          animateBottomNav(false);

          setActiveTab('profile');
        }}
      />

      {/* ==================================================
          HOME
         ================================================== */}

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
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleContentScroll}
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
              console.log(
                'Mark Attendance pressed',
              );
            }}
            onLectureLogPress={() => {
              console.log(
                'Add Lecture Log pressed',
              );
            }}
            onBatchesPress={() => {
              handleTabChange('batches');
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

      {/* ==================================================
          PROFILE
         ================================================== */}

      {activeTab === 'profile' && (
        <View style={styles.profileContainer}>
          <ProfilePage
            name={profileName}
            email={profileEmail}
            phone={profilePhone}
            onSaveProfile={handleSaveProfile}
            onContentScroll={handleContentScroll}
          />
        </View>
      )}

      {/* ==================================================
          BATCHES
         ================================================== */}

      {activeTab === 'batches' && (
        <View style={styles.placeholderContainer}>
          {/* 
            Batches page coming soon.

            When the real Batches ScrollView is created,
            pass handleContentScroll to its onScroll.
          */}
        </View>
      )}

      {/* ==================================================
          STUDENTS
         ================================================== */}

      {activeTab === 'students' && (
        <View style={styles.placeholderContainer}>
          {/* 
            Students page coming soon.

            When the real Students ScrollView is created,
            pass handleContentScroll to its onScroll.
          */}
        </View>
      )}

      {/* ==================================================
          BOTTOM NAVIGATION
         ================================================== */}

      <Animated.View
        style={[
          styles.bottomNavWrapper,
          {
            paddingBottom: insets.bottom,

            /*
             * This is what creates the LinkedIn-style
             * hide/show animation.
             */
            transform: [
              {
                translateY: bottomNavTranslateY,
              },
            ],
          },
        ]}
      >
        <TeacherBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAddPress={() => {
            console.log('Add pressed');
          }}
        />
      </Animated.View>
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

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