import React, { useRef, useState } from 'react';

import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import StudentGrowth from './StudentGrowth';
import FeeCollection from './FeeCollection';
import RecentAnnouncements from './RecentAnnouncements';
import TopCourses from './TopCourses';
import BatchOverview from './BatchOverview';
import QuickActions from './QuickActions';
import DashboardFooter from './DashboardFooter';

import { openDashboardFeature } from '@/utils/dashboardNavigation';

export default function SuperAdminDashboard() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [sidebarVisible, setSidebarVisible] = useState(false);

  /*
   * Drawer width is 70% of the phone,
   * but never more than 500px.
   */
  const drawerWidth = Math.min(width * 0.7, 500);

  /*
   * 0 = closed
   * 1 = fully open
   */
  const drawerAnimation = useRef(
    new Animated.Value(0)
  ).current;

  /* =====================================================
     OPEN SIDEBAR
  ====================================================== */

  const openSidebar = () => {
    setSidebarVisible(true);

    drawerAnimation.stopAnimation();

    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  /* =====================================================
     CLOSE SIDEBAR
  ====================================================== */

  const closeSidebar = () => {
    drawerAnimation.stopAnimation();

    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSidebarVisible(false);
      }
    });
  };

  /* =====================================================
     DRAWER TRANSLATION
  ====================================================== */

  const drawerTranslateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  /* =====================================================
     OVERLAY OPACITY
  ====================================================== */

  const overlayOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      {isDesktop && (
        <Sidebar />
      )}

      {/* =====================================================
          MOBILE SIDEBAR
          LEFT → RIGHT ANIMATION
      ===================================================== */}

      {!isDesktop && (
        <Modal
          visible={sidebarVisible}
          transparent
          animationType="none"
          onRequestClose={closeSidebar}
        >
          <View style={styles.drawerContainer}>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Animated.View
              style={[
                styles.drawer,
                {
                  width: drawerWidth,
                  transform: [
                    {
                      translateX: drawerTranslateX,
                    },
                  ],
                },
              ]}
            >
              <Sidebar
                onItemPress={closeSidebar}
              />
            </Animated.View>

            {/* =================================================
                RIGHT OVERLAY
            ================================================= */}

            <Animated.View
              style={[
                styles.drawerOverlayContainer,
                {
                  opacity: overlayOpacity,
                },
              ]}
            >
              <Pressable
                style={styles.drawerOverlay}
                onPress={closeSidebar}
              />
            </Animated.View>

          </View>
        </Modal>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <View style={styles.mainContainer}>

        <DashboardHeader
          isDesktop={isDesktop}
          onMenuPress={openSidebar}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            !isDesktop && styles.mobileContent,
          ]}
          showsVerticalScrollIndicator={false}
        >

          {/* =================================================
              STATISTICS
          ================================================= */}

          <View style={styles.statsGrid}>

            {/* 1. TOTAL STUDENTS */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Total Students"
                value="2,568"
                change="12.5%"
                icon="account-group"
                type="purple"
                onPress={() =>
                  openDashboardFeature('Students')
                }
              />
            </View>

            {/* 2. TOTAL TEACHERS */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Total Teachers"
                value="156"
                change="8.3%"
                icon="account-tie"
                type="blue"
                onPress={() =>
                  openDashboardFeature('Teachers')
                }
              />
            </View>

            {/* 3. TOTAL COURSES */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Total Courses"
                value="68"
                change="5.7%"
                icon="book-open-variant"
                type="green"
                onPress={() =>
                  openDashboardFeature('Courses')
                }
              />
            </View>

            {/* 4. ACTIVE BRANCHES */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Active Branches"
                value="12"
                change="10.2%"
                icon="office-building"
                type="orange"
                onPress={() =>
                  openDashboardFeature('Branches')
                }
              />
            </View>

            {/* 5. PENDING FEES */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Pending Fees"
                value="₹ 18,25,000"
                change="8.5%"
                icon="cash-clock"
                type="pink"
                onPress={() =>
                  openDashboardFeature('Fee Collection')
                }
              />
            </View>

            {/* 6. TIMETABLE */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="My Timetable"
                value="24"
                change="6.4%"
                icon="calendar-clock"
                type="purple"
                onPress={() =>
                  openDashboardFeature('Timetable')
                }
              />
            </View>

            {/* 7. STAFF ON LEAVE */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Staff on Leave"
                value="8"
                change="3.2%"
                icon="account-off"
                type="blue"
                onPress={() =>
                  openDashboardFeature('Staff on Leave')
                }
              />
            </View>

            {/* 8. ACADEMICS */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Academics"
                value="18"
                change="7.8%"
                icon="school-outline"
                type="green"
                onPress={() =>
                  openDashboardFeature('Academics')
                }
              />
            </View>

            {/* 9. ACCOUNTS */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Accounts"
                value="₹ 32,50,000"
                change="11.4%"
                icon="calculator-variant"
                type="orange"
                onPress={() =>
                  openDashboardFeature('Accounts')
                }
              />
            </View>

            {/* 10. ACADEMIC CALENDAR */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Academic Calendar"
                value="24"
                change="6.2%"
                icon="calendar-month-outline"
                type="purple"
                onPress={() =>
                  openDashboardFeature('Academic Calendar')
                }
              />
            </View>

          </View>

          {/* =================================================
              MAIN ANALYTICS
          ================================================== */}

          <View
            style={[
              styles.analyticsRow,
              !isDesktop && styles.analyticsColumn,
            ]}
          >

            {/* STUDENT GROWTH */}

            <View
              style={[
                styles.growthWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <StudentGrowth />
            </View>

            {/* FEE COLLECTION */}

            <View
              style={[
                styles.feeWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <FeeCollection />
            </View>

            {/* RECENT ANNOUNCEMENTS */}

            <View
              style={[
                styles.announcementWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <RecentAnnouncements />
            </View>

          </View>

          {/* =================================================
              BOTTOM SECTION
          ================================================== */}

          <View
            style={[
              styles.bottomRow,
              !isDesktop && styles.bottomColumn,
            ]}
          >

            {/* TOP COURSES */}

            <View
              style={[
                styles.coursesWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <TopCourses />
            </View>

            {/* BATCH OVERVIEW */}

            <View
              style={[
                styles.batchWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <BatchOverview />
            </View>

            {/* QUICK ACTIONS */}

            <View
              style={[
                styles.actionsWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <QuickActions />
            </View>

          </View>

          {/* =================================================
              FOOTER
          ================================================== */}

          <DashboardFooter />

        </ScrollView>

      </View>

    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* =======================================================
     MAIN CONTAINER
  ======================================================= */

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    flexDirection: 'row',
  },

  mainContainer: {
    flex: 1,
    minWidth: 0,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 30,
  },

  mobileContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },

  /* =======================================================
     STATISTICS
  ======================================================= */

  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
  },

  statItem: {
    width: '48%',
    flexGrow: 0,
    flexShrink: 0,
  },

  statItemDesktop: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '18.8%',
    width: undefined,
  },

  /* =======================================================
     ANALYTICS
  ======================================================= */

  analyticsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },

  analyticsColumn: {
    flexDirection: 'column',
  },

  growthWrapper: {
    flex: 1.5,
  },

  feeWrapper: {
    flex: 1.1,
  },

  announcementWrapper: {
    flex: 1,
  },

  /* =======================================================
     BOTTOM
  ======================================================= */

  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },

  bottomColumn: {
    flexDirection: 'column',
  },

  coursesWrapper: {
    flex: 1,
  },

  batchWrapper: {
    flex: 1,
  },

  actionsWrapper: {
    flex: 1,
  },

  mobileWrapper: {
    width: '100%',
    flex: undefined,
  },

  /* =======================================================
     MOBILE DRAWER
  ======================================================= */

  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },

  drawer: {
    height: '100%',
    backgroundColor: '#FFFFFF',

    zIndex: 2,

    shadowColor: '#000000',

    shadowOffset: {
      width: 4,
      height: 0,
    },

    shadowOpacity: 0.20,
    shadowRadius: 8,

    elevation: 12,
  },

  drawerOverlayContainer: {
    flex: 1,
    height: '100%',
    zIndex: 1,
  },

  drawerOverlay: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(5, 15, 35, 0.55)',
  },
});