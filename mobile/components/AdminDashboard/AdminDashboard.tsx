import React, { useRef, useState } from 'react';

import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import StatCard from './StatCard';

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
   STUDENT GROWTH
========================================================= */

function StudentGrowth() {
  const data = [
    38,
    45,
    42,
    55,
    51,
    64,
    61,
    73,
    68,
    82,
    78,
    91,
  ];

  const months = [
    'Oct',
    'Nov',
    'Dec',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
  ];

  return (
    <SectionCard
      title="Student Growth"
      subtitle="Monthly student enrollment"
      icon="account-group-outline"
    >
      <View style={styles.chartArea}>
        <View style={styles.chartYAxis}>
          <Text style={styles.chartAxisText}>100</Text>
          <Text style={styles.chartAxisText}>75</Text>
          <Text style={styles.chartAxisText}>50</Text>
          <Text style={styles.chartAxisText}>25</Text>
          <Text style={styles.chartAxisText}>0</Text>
        </View>

        <View style={styles.chartContent}>
          <View style={styles.chartBars}>
            {data.map((value, index) => (
              <View
                key={`${value}-${index}`}
                style={styles.chartBarColumn}
              >
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${value}%`,
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.chartMonths}>
            {months.map((month) => (
              <Text
                key={month}
                style={styles.chartMonth}
              >
                {month}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.chartFooter}>
        <View>
          <Text style={styles.chartMainValue}>
            1,248
          </Text>

          <Text style={styles.chartFooterText}>
            Current students
          </Text>
        </View>

        <View style={styles.growthBadge}>
          <MaterialCommunityIcons
            name="trending-up"
            size={14}
            color="#35B878"
          />

          <Text style={styles.growthBadgeText}>
            8.5%
          </Text>
        </View>
      </View>
    </SectionCard>
  );
}

/* =========================================================
   RECENT ANNOUNCEMENTS
========================================================= */

function RecentAnnouncements() {
  const announcements = [
    {
      title: 'Mid Semester Examination',
      date: '09 Sep 2026',
      icon: 'file-document-edit-outline' as const,
      type: 'blue',
    },
    {
      title: 'Parent Teacher Meeting',
      date: '07 Sep 2026',
      icon: 'account-group-outline' as const,
      type: 'purple',
    },
    {
      title: 'Fee Payment Reminder',
      date: '05 Sep 2026',
      icon: 'cash-clock' as const,
      type: 'pink',
    },
  ];

  return (
    <SectionCard
      title="Recent Announcements"
      subtitle="Latest branch updates"
      icon="bullhorn-outline"
    >
      {announcements.map((item) => (
        <View
          key={item.title}
          style={styles.announcementItem}
        >
          <View
            style={[
              styles.announcementIcon,
              {
                backgroundColor:
                  item.type === 'blue'
                    ? '#EAF2FF'
                    : item.type === 'pink'
                      ? '#FFE9F0'
                      : '#F1EAFF',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={18}
              color={
                item.type === 'blue'
                  ? '#2675E8'
                  : item.type === 'pink'
                    ? '#E95386'
                    : '#7040D5'
              }
            />
          </View>

          <View style={styles.announcementText}>
            <Text
              style={styles.announcementTitle}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <Text style={styles.announcementDate}>
              {item.date}
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color="#A3ACBA"
          />
        </View>
      ))}
    </SectionCard>
  );
}

/* =========================================================
   SUBJECT PERFORMANCE
========================================================= */

function SubjectPerformance() {
  const subjects = [
    {
      name: 'Physics',
      students: 248,
      percentage: 86,
      color: '#7040D5',
    },
    {
      name: 'Chemistry',
      students: 232,
      percentage: 82,
      color: '#2675E8',
    },
    {
      name: 'Mathematics',
      students: 275,
      percentage: 89,
      color: '#35B878',
    },
    {
      name: 'Biology',
      students: 198,
      percentage: 84,
      color: '#F7941D',
    },
  ];

  return (
    <SectionCard
      title="Subject Performance"
      subtitle="Academic performance by subject"
      icon="book-open-outline"
    >
      {subjects.map((subject) => (
        <View
          key={subject.name}
          style={styles.subjectRow}
        >
          <View style={styles.subjectInfo}>
            <View style={styles.subjectIcon}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={17}
                color="#7040D5"
              />
            </View>

            <View>
              <Text style={styles.subjectName}>
                {subject.name}
              </Text>

              <Text style={styles.subjectStudents}>
                {subject.students} students
              </Text>
            </View>
          </View>

          <View style={styles.subjectProgressContainer}>
            <View style={styles.subjectProgressTrack}>
              <View
                style={[
                  styles.subjectProgressFill,
                  {
                    width: `${subject.percentage}%`,
                    backgroundColor: subject.color,
                  },
                ]}
              />
            </View>

            <Text style={styles.subjectPercentage}>
              {subject.percentage}%
            </Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

/* =========================================================
   STD / SUB OVERVIEW
========================================================= */

function StdSubOverview() {
  const stdSub = [
    {
      name: 'Foundation 8th',
      students: 128,
      status: 'Active',
      type: 'purple',
    },
    {
      name: 'Foundation 9th',
      students: 142,
      status: 'Active',
      type: 'blue',
    },
    {
      name: 'Foundation 10th',
      students: 156,
      status: 'Active',
      type: 'green',
    },
    {
      name: 'JEE 11th',
      students: 184,
      status: 'Active',
      type: 'orange',
    },
  ];

  return (
    <SectionCard
      title="STD / SUB Overview"
      subtitle="Current academic groups"
      icon="google-classroom"
    >
      {stdSub.map((item) => (
        <View
          key={item.name}
          style={styles.stdSubRow}
        >
          <View
            style={[
              styles.stdSubIcon,
              {
                backgroundColor:
                  item.type === 'purple'
                    ? '#F1EAFF'
                    : item.type === 'blue'
                      ? '#EAF2FF'
                      : item.type === 'green'
                        ? '#E7F8EF'
                        : '#FFF1E2',
              },
            ]}
          >
            <MaterialCommunityIcons
              name="account-multiple-outline"
              size={17}
              color={
                item.type === 'purple'
                  ? '#7040D5'
                  : item.type === 'blue'
                    ? '#2675E8'
                    : item.type === 'green'
                      ? '#35B878'
                      : '#F7941D'
              }
            />
          </View>

          <View style={styles.stdSubTextContainer}>
            <Text style={styles.stdSubName}>
              {item.name}
            </Text>

            <Text style={styles.stdSubStudents}>
              {item.students} students
            </Text>
          </View>

          <View
            style={[
              styles.stdSubStatus,
              {
                backgroundColor:
                  item.status === 'Active'
                    ? '#E7F8EF'
                    : '#FFF1E2',
              },
            ]}
          >
            <Text
              style={[
                styles.stdSubStatusText,
                {
                  color:
                    item.status === 'Active'
                      ? '#35B878'
                      : '#F7941D',
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      ))}
    </SectionCard>
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
      title: 'Generate Report',
      feature: 'Reports',
      icon: 'file-chart-outline',
      color: '#7040D5',
    },
    {
      title: 'Quiz',
      feature: 'Examinations',
      icon: 'help-circle-outline',
      color: '#35B878',
    },
    {
      title: 'Feedback',
      feature: 'Performance',
      icon: 'message-text-outline',
      color: '#7040D5',
    },
    {
      title: 'WhatsApp',
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
                value="1,248"
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
                value="86"
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
                value="32"
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
                value="24"
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
                title="Today's Attendance"
                value="92%"
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
                value="6"
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
                value="18"
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
                value="5"
                change="2.1%"
                icon="account-off"
                type="orange"
              />
            </View>

          </View>

          {/* =================================================
              ANALYTICS
          ================================================== */}

          <View
            style={[
              styles.analyticsRow,
              !isDesktop &&
                styles.analyticsColumn,
            ]}
          >

            {/* STUDENT GROWTH */}

            <View
              style={[
                styles.growthWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <StudentGrowth />
            </View>

            {/* ANNOUNCEMENTS */}

            <View
              style={[
                styles.announcementWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <Pressable
                onPress={() =>
                  openAdminFeature(
                    'Announcements',
                  )
                }
                style={
                  styles.clickableSection
                }
              >
                <RecentAnnouncements />
              </Pressable>
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

            {/* SUBJECT PERFORMANCE */}

            <View
              style={[
                styles.bottomWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <SubjectPerformance />
            </View>

            {/* STD / SUB OVERVIEW */}

            <View
              style={[
                styles.bottomWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <StdSubOverview />
            </View>

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

  analyticsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  analyticsColumn: {
    flexDirection: 'column',
  },

  growthWrapper: {
    width: '58.5%',
    flexGrow: 0,
    flexShrink: 0,
  },

  announcementWrapper: {
    width: '40%',
    flexGrow: 0,
    flexShrink: 0,
  },

  mobileWrapper: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
  },

  clickableSection: {
    width: '100%',
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
     STUDENT GROWTH
  ====================================================== */

  chartArea: {
    height: 155,
    flexDirection: 'row',
  },

  chartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },

  chartAxisText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#9BA5B4',
  },

  chartContent: {
    flex: 1,
    minWidth: 0,
  },

  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
    paddingHorizontal: 3,
    gap: 5,
  },

  chartBarColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },

  chartBar: {
    width: '100%',
    minHeight: 8,
    backgroundColor: '#7040D5',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    opacity: 0.85,
  },

  chartMonths: {
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  chartMonth: {
    fontFamily: 'PoppinsRegular',
    fontSize: 6.5,
    color: '#9BA5B4',
  },

  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
  },

  chartMainValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
  },

  chartFooterText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A95A6',
  },

  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F8EF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  growthBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#35B878',
    marginLeft: 3,
  },

  /* =====================================================
     ANNOUNCEMENTS
  ====================================================== */

  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },

  announcementIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  announcementText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },

  announcementTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#172033',
  },

  announcementDate: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8A95A6',
    marginTop: 2,
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
     SUBJECT PERFORMANCE
  ====================================================== */

  subjectRow: {
    marginBottom: 13,
  },

  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  subjectName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#172033',
  },

  subjectStudents: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8A95A6',
    marginTop: 1,
  },

  subjectProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  subjectProgressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#F0F2F6',
    overflow: 'hidden',
  },

  subjectProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  subjectPercentage: {
    width: 34,
    textAlign: 'right',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#748096',
  },

  /* =====================================================
     STD / SUB OVERVIEW
  ====================================================== */

  stdSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },

  stdSubIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stdSubTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },

  stdSubName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#172033',
  },

  stdSubStudents: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8A95A6',
    marginTop: 1,
  },

  stdSubStatus: {
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  stdSubStatusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
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