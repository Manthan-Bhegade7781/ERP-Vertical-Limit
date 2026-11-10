import React, { useCallback, useRef, useState } from 'react';

import {
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useRouter } from 'expo-router';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import StatCard from './StatCard';

import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type DashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  activeSubjects: number;
  activeBatches: number;
  attendance: string;
  upcomingExams: number;
  assignments: number;
  staffOnLeave: number;
};

const DEFAULT_STATS: DashboardStats = {
  totalStudents: 0,
  totalTeachers: 0,
  activeSubjects: 0,
  activeBatches: 0,
  attendance: '0%',
  upcomingExams: 0,
  assignments: 0,
  staffOnLeave: 0,
};

/* =========================================================
   NAVIGATION
========================================================= */

function openAdminFeature(feature: string) {
  if (feature === 'Dashboard') {
    router.push('/(admin)' as never);
    return;
  }

  router.push({
    pathname: '/(admin)/explore',
    params: {
      feature,
    },
  } as never);
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  title,
  subtitle,
  children,
  icon,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <MaterialCommunityIcons
              name={icon}
              size={19}
              color="#7040D5"
            />
          </View>

          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>
              {title}
            </Text>

            {subtitle ? (
              <Text style={styles.sectionSubtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#A0A9B8"
        />
      </View>

      {children}
    </View>
  );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

function QuickActions() {
  const actions: {
    title: string;
    feature: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
  }[] = [
    {
      title: 'PTG',
      feature: 'PTG',
      icon: 'account-group-outline',
      color: '#7040D5',
    },
    {
      title: 'Examinations',
      feature: 'Examinations',
      icon: 'help-circle-outline',
      color: '#35B878',
    },
    {
      title: 'Feedback',
      feature: 'Feedback',
      icon: 'message-text-outline',
      color: '#7040D5',
    },
    {
      title: 'Messages',
      feature: 'Messages',
      icon: 'whatsapp',
      color: '#2675E8',
    },
    {
      title: 'Announcements',
      feature: 'Announcements',
      icon: 'bullhorn-outline',
      color: '#F7941D',
    },
    {
      title: 'Attendance',
      feature: 'Attendance',
      icon: 'calendar-check',
      color: '#35B878',
    },
  ];

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <MaterialCommunityIcons
              name="lightning-bolt-outline"
              size={19}
              color="#7040D5"
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              Quick Actions
            </Text>

            <Text style={styles.sectionSubtitle}>
              Frequently used actions
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() =>
              openAdminFeature(action.feature)
            }
          >
            <View
              style={[
                styles.quickActionIcon,
                {
                  backgroundColor:
                    action.color === '#7040D5'
                      ? '#F1EAFF'
                      : action.color === '#2675E8'
                        ? '#EAF2FF'
                        : action.color === '#35B878'
                          ? '#E7F8EF'
                          : action.color === '#F7941D'
                            ? '#FFF1E2'
                            : '#FFE9F0',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={20}
                color={action.color}
              />
            </View>

            <Text
              style={styles.quickActionText}
              numberOfLines={2}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function DashboardFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © 2026 VLCC ERP Portal
      </Text>

      <View style={styles.footerRight}>
        <Text style={styles.footerText}>
          Admin Dashboard
        </Text>

        <View style={styles.footerDot} />

        <Text style={styles.footerText}>
          Branch Administration
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   MAIN ADMIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const { width } = useWindowDimensions();

  const { logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const json = await response.json();
      if (json.success && json.data) {
        setStats({
          totalStudents: Number(json.data.totalStudents) || 0,
          totalTeachers: Number(json.data.totalTeachers) || 0,
          activeSubjects: Number(json.data.activeSubjects) || 0,
          activeBatches: Number(json.data.activeBatches) || 0,
          attendance:
            typeof json.data.attendance === 'string'
              ? json.data.attendance
              : `${json.data.attendance || 0}%`,
          upcomingExams: Number(json.data.upcomingExams) || 0,
          assignments: Number(json.data.assignments) || 0,
          staffOnLeave: Number(json.data.staffOnLeave) || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchStats();
    }, [fetchStats])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const handleLogout = async () => {
    try {
      if (router.canDismiss?.()) {
        router.dismissAll();
      }
      await logout();
      router.replace('/(auth)');
    } catch (error) {
      Alert.alert('Logout failed', 'Please try again.');
    }
  };

  const isDesktop = width >= 900;

  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  const drawerWidth = Math.min(
    width * 0.7,
    500,
  );

  const drawerAnimation = useRef(
    new Animated.Value(0),
  ).current;

  /* =======================================================
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

  /* =======================================================
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

  /* =======================================================
     DRAWER ANIMATION
  ====================================================== */

  const drawerTranslateX =
    drawerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-drawerWidth, 0],
    });

  const overlayOpacity =
    drawerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

  return (
    <View style={styles.container}>

      {/* ===================================================
          DESKTOP SIDEBAR
      ==================================================== */}

      {isDesktop && (
        <AdminSidebar
          collapsed={false}
        />
      )}

      {/* ===================================================
          MOBILE SIDEBAR
      ==================================================== */}

      {!isDesktop && (
        <Modal
          visible={sidebarVisible}
          transparent
          animationType="none"
          onRequestClose={closeSidebar}
        >
          <View style={styles.drawerContainer}>

            <Animated.View
              style={[
                styles.drawer,
                {
                  width: drawerWidth,
                  transform: [
                    {
                      translateX:
                        drawerTranslateX,
                    },
                  ],
                },
              ]}
            >
              <AdminSidebar
                collapsed={false}
                onClose={closeSidebar}
              />
            </Animated.View>

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

      {/* ===================================================
          MAIN CONTENT
      ==================================================== */}

      <View style={styles.mainContainer}>

        <AdminHeader
          isDesktop={isDesktop}
          onMenuPress={openSidebar}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            !isDesktop &&
              styles.mobileContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7040D5']}
              tintColor="#7040D5"
            />
          }
        >

          {/* =================================================
              STATISTICS
          ================================================== */}

          <View style={styles.statsGrid}>

            {/* STUDENTS */}

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Total Students"
                value={stats.totalStudents.toLocaleString()}
                change="8.5%"
                icon="account-group"
                type="purple"
                onPress={() =>
                  openAdminFeature(
                    'Students',
                  )
                }
              />
            </View>

            {/* TEACHERS */}

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Total Teachers"
                value={stats.totalTeachers.toLocaleString()}
                change="5.2%"
                icon="account-tie"
                type="blue"
                onPress={() =>
                  openAdminFeature(
                    'Teachers',
                  )
                }
              />
            </View>

            {/* SUBJECTS */}

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Active Subjects"
                value={stats.activeSubjects.toLocaleString()}
                change="6.7%"
                icon="book-open-variant"
                type="green"
                onPress={() =>
                  openAdminFeature(
                    'Subjects',
                  )
                }
              />
            </View>

            {/* BATCHES */}

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Active Batches"
                value={stats.activeBatches.toLocaleString()}
                change="4.8%"
                icon="account-multiple"
                type="orange"
                onPress={() =>
                  openAdminFeature(
                    'Batches',
                  )
                }
              />
            </View>

            {/* ATTENDANCE */}

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Attendance"
                value={stats.attendance}
                change="3.8%"
                icon="calendar-check"
                type="purple"
                onPress={() =>
                  openAdminFeature(
                    'Attendance',
                  )
                }
              />
            </View>

            {/* EXAMS */}

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Upcoming Exams"
                value={stats.upcomingExams.toLocaleString()}
                change="2.4%"
                icon="file-document-edit"
                type="blue"
                onPress={() =>
                  openAdminFeature(
                    'Examinations',
                  )
                }
              />
            </View>

            {/* ASSIGNMENTS */}

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Assignments"
                value={stats.assignments.toLocaleString()}
                change="5.6%"
                icon="clipboard-text"
                type="green"
                onPress={() =>
                  openAdminFeature(
                    'Assignments',
                  )
                }
              />
            </View>

            {/* STAFF */}

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Staff on Leave"
                value={stats.staffOnLeave.toLocaleString()}
                change="2.1%"
                icon="account-off"
                type="orange"
                onPress={() =>
                  openAdminFeature(
                    'Staff on Leave',
                  )
                }
              />
            </View>

          </View>

          {/* =================================================
              BOTTOM
          ================================================== */}

          <View
            style={[
              styles.bottomRow,
              !isDesktop &&
                styles.bottomColumn,
            ]}
          >

            {/* QUICK ACTIONS */}

            <View
              style={[
                styles.actionsWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
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

  /* =====================================================
     MAIN
  ====================================================== */

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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },

  mobileContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },

  /* =====================================================
     STATISTICS
  ====================================================== */

  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  statItem: {
    width: '48%',
    marginBottom: 12,
    flexGrow: 0,
    flexShrink: 0,
  },

  statItemDesktop: {
    width: '18.8%',
    marginBottom: 12,
    flexGrow: 0,
    flexShrink: 0,
  },

  /* =====================================================
     ANALYTICS
  ====================================================== */





  mobileWrapper: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
  },


  /* =====================================================
     SECTION CARD
  ====================================================== */

  sectionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    minHeight: 37,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  sectionIconBox: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionTitleContainer: {
    minWidth: 0,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
    lineHeight: 17,
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A95A6',
    marginTop: 1,
    lineHeight: 12,
  },

  /* =====================================================
     BOTTOM
  ====================================================== */

  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  bottomColumn: {
    flexDirection: 'column',
  },

  bottomWrapper: {
    width: '32%',
    flexGrow: 0,
    flexShrink: 0,
  },

  actionsWrapper: {
    width: '32%',
    flexGrow: 0,
    flexShrink: 0,
  },

  /* =====================================================
     QUICK ACTIONS
  ====================================================== */

  quickActionsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  quickAction: {
    width: '31.5%',
    minHeight: 74,
    marginBottom: 10,
    borderRadius: 11,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    paddingVertical: 8,
  },

  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  quickActionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.5,
    lineHeight: 11,
    color: '#596579',
    textAlign: 'center',
    paddingHorizontal: 2,
  },

  /* =====================================================
     FOOTER
  ====================================================== */

  footer: {
    width: '100%',
    minHeight: 50,
    marginTop: 20,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#E9ECF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#9AA4B4',
  },

  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#B5BDCA',
    marginHorizontal: 7,
  },

  /* =====================================================
     MOBILE DRAWER
  ====================================================== */

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
    backgroundColor:
      'rgba(5, 15, 35, 0.55)',
  },
});