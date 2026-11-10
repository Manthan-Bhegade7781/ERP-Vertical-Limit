import React, { useCallback, useRef, useState } from 'react';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { useFocusEffect } from 'expo-router';

import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import StatCard from './StatCard';

import DashboardFooter from './DashboardFooter';

import { openDashboardFeature } from '@/utils/dashboardNavigation';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type StandardStat = {
  standard: string;
  label: string;
  count: number;
};

type BatchOverviewItem = {
  id?: string;
  name: string;
  standard?: string;
  track: string;
  students: number;
};

type SuperAdminStats = {
  totalStudents: number;
  totalTeachers: number;
  activeBatches: number;
  activeSubjects: number;
  students8to10: number;
  students11to12: number;
  jeeStudents: number;
  neetStudents: number;
  cetStudents: number;
  attendance: string;
  studentsByStandard: StandardStat[];
  batchOverview: BatchOverviewItem[];
};

const DEFAULT_STUDENTS_BY_STANDARD: StandardStat[] = [
  { standard: '8th', label: '8th Standard', count: 0 },
  { standard: '9th', label: '9th Standard', count: 0 },
  { standard: '10th', label: '10th Standard', count: 0 },
  { standard: '11th', label: '11th Standard', count: 0 },
  { standard: '12th', label: '12th Standard', count: 0 },
];

const DEFAULT_STATS: SuperAdminStats = {
  totalStudents: 0,
  totalTeachers: 0,
  activeBatches: 0,
  activeSubjects: 0,
  students8to10: 0,
  students11to12: 0,
  jeeStudents: 0,
  neetStudents: 0,
  cetStudents: 0,
  attendance: '0%',
  studentsByStandard: DEFAULT_STUDENTS_BY_STANDARD,
  batchOverview: [],
};

type SectionCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  children: React.ReactNode;
};

function SectionCard({ title, subtitle, icon, children }: SectionCardProps) {
  return (
    <View style={styles.educationCard}>
      <View style={styles.educationHeader}>
        <View style={styles.educationTitleRow}>
          <View style={styles.educationIconBox}>
            <MaterialCommunityIcons name={icon} size={20} color="#7040D5" />
          </View>
          <View style={styles.educationTitleContainer}>
            <Text style={styles.educationTitle}>{title}</Text>
            <Text style={styles.educationSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>
      {children}
    </View>
  );
}

function AcademicEnrollment({ data }: { data: StandardStat[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <SectionCard title="Students by Standard" subtitle="Current academic year enrollment" icon="school-outline">
      <View style={styles.metricList}>
        {data.map(({ label, count }) => {
          const widthPercent =
            maxCount > 0 && count > 0
              ? Math.min(100, Math.max(12, Math.round((count / maxCount) * 100)))
              : 8;

          return (
            <View key={label} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{label}</Text>
              <View style={styles.metricBarTrack}>
                <View style={[styles.metricBar, { width: `${widthPercent}%` }]} />
              </View>
              <Text style={styles.metricValue}>{count.toLocaleString()}</Text>
            </View>
          );
        })}
      </View>
    </SectionCard>
  );
}

type ExamPrepProps = {
  jee: number;
  neet: number;
  cet: number;
  foundation: number;
};

function ExamPreparation({ jee, neet, cet, foundation }: ExamPrepProps) {
  const data = [
    ['JEE', jee.toLocaleString(), 'atom'],
    ['NEET', neet.toLocaleString(), 'medical-bag'],
    ['MHT-CET', cet.toLocaleString(), 'school-outline'],
    ['Foundation', foundation.toLocaleString(), 'lightbulb-on-outline'],
  ] as const;

  return (
    <SectionCard title="Exam Preparation" subtitle="Students enrolled by preparation track" icon="trophy-outline">
      <View style={styles.examGrid}>
        {data.map(([name, count, icon]) => (
          <View key={name} style={styles.examItem}>
            <View style={styles.examIconBox}>
              <MaterialCommunityIcons name={icon} size={18} color="#7040D5" />
            </View>
            <Text style={styles.examName}>{name}</Text>
            <Text style={styles.examCount}>{count}</Text>
            <Text style={styles.examCaption}>students</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

function AcademicAnnouncements() {
  const items = [
    ['MHT-CET Mock Test Series – September', '12 Sep 2026', 'bullhorn-outline'],
    ['JEE Advanced Practice Test – Physics', '14 Sep 2026', 'atom'],
    ['NEET Biology Revision Session', '16 Sep 2026', 'medical-bag'],
    ['Parent–Teacher Meeting for 11th & 12th', '18 Sep 2026', 'account-group-outline'],
  ] as const;
  return (
    <SectionCard title="Academic Announcements" subtitle="Important updates for students and faculty" icon="bullhorn-outline">
      <View style={styles.announcementList}>
        {items.map(([title, date, icon]) => (
          <View key={title} style={styles.announcementItem}>
            <View style={styles.announcementIconBox}>
              <MaterialCommunityIcons name={icon} size={17} color="#7040D5" />
            </View>
            <View style={styles.announcementText}>
              <Text style={styles.announcementTitle} numberOfLines={2}>{title}</Text>
              <Text style={styles.announcementDate}>{date}</Text>
            </View>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

function TopSubjects() {
  const subjects = [
    ['Physics', '92%', 'atom'],
    ['Chemistry', '89%', 'flask-outline'],
    ['Mathematics', '88%', 'sigma'],
    ['Biology', '86%', 'leaf'],
  ] as const;
  return (
    <SectionCard title="Top Performing Subjects" subtitle="Average student performance" icon="book-open-variant">
      <View style={styles.subjectList}>
        {subjects.map(([subject, score, icon]) => (
          <View key={subject} style={styles.subjectRow}>
            <View style={styles.subjectIconBox}>
              <MaterialCommunityIcons name={icon} size={17} color="#7040D5" />
            </View>
            <View style={styles.subjectText}>
              <Text style={styles.subjectName}>{subject}</Text>
              <View style={styles.subjectTrack}><View style={[styles.subjectBar, { width: score }]} /></View>
            </View>
            <Text style={styles.subjectScore}>{score}</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

function ClassBatchOverview({ batches }: { batches: BatchOverviewItem[] }) {
  return (
    <SectionCard title="Class & Batch Overview" subtitle="Active classes across standards 8–12" icon="account-multiple-outline">
      <View style={styles.batchList}>
        {batches.length === 0 ? (
          <View style={{ paddingVertical: 14, alignItems: 'center' }}>
            <MaterialCommunityIcons name="account-multiple-outline" size={24} color="#C4CBD6" />
            <Text style={{ fontFamily: 'PoppinsRegular', fontSize: 11, color: '#9AA4B4', marginTop: 4 }}>
              No active batches available
            </Text>
          </View>
        ) : (
          batches.slice(0, 6).map((batch, index) => (
            <View key={batch.id || `${batch.name}-${index}`} style={styles.batchItem}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.batchName} numberOfLines={1}>{batch.name}</Text>
                <Text style={styles.batchTrack}>{batch.track} preparation</Text>
              </View>
              <View style={styles.batchCountBox}>
                <Text style={styles.batchCount}>{batch.students.toLocaleString()}</Text>
                <Text style={styles.batchCaption}>students</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </SectionCard>
  );
}

function AcademicQuickActions() {
  const actions = [
    ['Add Student', 'account-plus-outline', 'Add Student', '#7040D5'],
    ['Add Teacher', 'account-tie-outline', 'Add Teacher', '#2675E8'],
    ['Create Batch', 'account-multiple-plus-outline', 'Add Batch', '#35B878'],
    ['Add Subject', 'book-plus-outline', 'Add Subject', '#F7941D'],
    ['PTG', 'account-group-outline', 'PTG', '#E95386'],
    ['Schedule Test', 'file-document-edit-outline', 'Add Examination', '#7040D5'],
    ['Publish Result', 'clipboard-check-outline', 'Add Performance', '#2675E8'],
    ['Academic Event', 'calendar-plus-outline', 'Academic Event', '#35B878'],
    ['Announcement', 'bullhorn-outline', 'Announcement', '#F7941D'],
  ] as const;
  return (
    <SectionCard title="Academic Quick Actions" subtitle="Common Super Admin academic operations" icon="flash-outline">
      <View style={styles.quickGrid}>
        {actions.map(([title, icon, feature, color]) => (
          <Pressable key={title} style={styles.quickItem} onPress={() => openDashboardFeature(feature)} android_ripple={{ color: '#F1EAFF' }}>
            <View style={[styles.quickIconBox, { backgroundColor: color === '#7040D5' ? '#F1EAFF' : color === '#2675E8' ? '#EAF2FF' : color === '#35B878' ? '#E7F8EF' : '#FFF1E2' }]}>
              <MaterialCommunityIcons name={icon} size={18} color={color} />
            </View>
            <Text style={styles.quickText} numberOfLines={2}>{title}</Text>
          </Pressable>
        ))}
      </View>
    </SectionCard>
  );
}

export default function SuperAdminDashboard() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [stats, setStats] = useState<SuperAdminStats>(DEFAULT_STATS);
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
        const stdList: StandardStat[] =
          Array.isArray(json.data.studentsByStandard) &&
          json.data.studentsByStandard.length > 0
            ? json.data.studentsByStandard.map((s: any) => ({
                standard: String(s.standard || ''),
                label: String(s.label || `${s.standard} Standard`),
                count: Number(s.count) || 0,
              }))
            : DEFAULT_STUDENTS_BY_STANDARD;

        const bList: BatchOverviewItem[] = Array.isArray(json.data.batchOverview)
          ? json.data.batchOverview.map((b: any) => ({
              id: b.id ? String(b.id) : undefined,
              name: String(b.name || 'Unnamed Batch'),
              standard: String(b.standard || ''),
              track: String(b.track || 'Core'),
              students: Number(b.students) || 0,
            }))
          : [];

        setStats({
          totalStudents: Number(json.data.totalStudents) || 0,
          totalTeachers: Number(json.data.totalTeachers) || 0,
          activeBatches: Number(json.data.activeBatches) || 0,
          activeSubjects: Number(json.data.activeSubjects) || 0,
          students8to10: Number(json.data.students8to10) || 0,
          students11to12: Number(json.data.students11to12) || 0,
          jeeStudents: Number(json.data.jeeStudents) || 0,
          neetStudents: Number(json.data.neetStudents) || 0,
          cetStudents: Number(json.data.cetStudents) || 0,
          attendance:
            typeof json.data.attendance === 'string'
              ? json.data.attendance
              : `${json.data.attendance || 0}%`,
          studentsByStandard: stdList,
          batchOverview: bList,
        });
      }
    } catch (error) {
      console.error('Failed to fetch superadmin stats:', error);
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
                value={stats.totalStudents.toLocaleString()}
                change="12.5%"
                icon="account-group"
                type="purple"
                onPress={() =>
                  openDashboardFeature('Students')
                }
              />
            </View>

            {/* 2. TOTAL FACULTY */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Total Faculty"
                value={stats.totalTeachers.toLocaleString()}
                change="8.3%"
                icon="account-tie"
                type="blue"
                onPress={() =>
                  openDashboardFeature('Teachers')
                }
              />
            </View>

            {/* 3. ACTIVE BATCHES */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Active Batches"
                value={stats.activeBatches.toLocaleString()}
                change="7.4%"
                icon="account-multiple-outline"
                type="green"
                onPress={() =>
                  openDashboardFeature('Batches')
                }
              />
            </View>

            {/* 4. ACTIVE SUBJECTS */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Active Subjects"
                value={stats.activeSubjects.toLocaleString()}
                change="6.8%"
                icon="book-open-variant"
                type="orange"
                onPress={() =>
                  openDashboardFeature('Subjects')
                }
              />
            </View>

            {/* 5. 8TH–10TH STUDENTS */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="8th–10th Students"
                value={stats.students8to10.toLocaleString()}
                change="9.2%"
                icon="school-outline"
                type="pink"
                onPress={() =>
                  openDashboardFeature('Students')
                }
              />
            </View>

            {/* 6. 11TH–12TH STUDENTS */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="11th–12th Students"
                value={stats.students11to12.toLocaleString()}
                change="11.6%"
                icon="school-outline"
                type="purple"
                onPress={() =>
                  openDashboardFeature('Students')
                }
              />
            </View>

            {/* 7. JEE PREPARATION */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="JEE Preparation"
                value={stats.jeeStudents.toLocaleString()}
                change="8.7%"
                icon="atom"
                type="blue"
                onPress={() =>
                  openDashboardFeature('Students')
                }
              />
            </View>

            {/* 8. NEET PREPARATION */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="NEET Preparation"
                value={stats.neetStudents.toLocaleString()}
                change="7.9%"
                icon="medical-bag"
                type="green"
                onPress={() =>
                  openDashboardFeature('Students')
                }
              />
            </View>

            {/* 9. MHT-CET PREPARATION */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="MHT-CET Preparation"
                value={stats.cetStudents.toLocaleString()}
                change="10.4%"
                icon="school-outline"
                type="orange"
                onPress={() =>
                  openDashboardFeature('Students')
                }
              />
            </View>

            {/* 10. AVERAGE ATTENDANCE */}

            <View
              style={[
                styles.statItem,
                isDesktop && styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Avg. Attendance"
                value={stats.attendance}
                change="2.8%"
                icon="calendar-check"
                type="purple"
                onPress={() =>
                  openDashboardFeature('Attendance')
                }
              />
            </View>

          </View>

          {/* =================================================
              ACADEMIC ANALYTICS
          ================================================== */}

          <View
            style={[
              styles.analyticsRow,
              !isDesktop && styles.analyticsColumn,
            ]}
          >
            <View
              style={[
                styles.growthWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <AcademicEnrollment data={stats.studentsByStandard} />
            </View>
          </View>

          {/* =================================================
              EDUCATIONAL OVERVIEW
          ================================================== */}

          <View
            style={[
              styles.bottomRow,
              !isDesktop && styles.bottomColumn,
            ]}
          >

            <View
              style={[
                styles.batchWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <ClassBatchOverview batches={stats.batchOverview} />
            </View>

            <View
              style={[
                styles.actionsWrapper,
                !isDesktop && styles.mobileWrapper,
              ]}
            >
              <AcademicQuickActions />
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

  clickableSection: {
    width: '100%',
  },

  mobileWrapper: {
    width: '100%',
    flex: undefined,
  },

  /* =======================================================
     EDUCATIONAL DASHBOARD CARDS
  ======================================================= */

  educationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    minHeight: 270,
  },

  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  educationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  educationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  educationTitleContainer: { flex: 1, minWidth: 0 },

  educationTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  educationSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#9AA4B4',
    marginTop: 2,
  },

  metricList: { gap: 10 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricLabel: { fontFamily: 'PoppinsMedium', fontSize: 10, color: '#4F5B6E', width: 88 },
  metricBarTrack: { flex: 1, height: 7, borderRadius: 10, backgroundColor: '#F1F3F7', overflow: 'hidden' },
  metricBar: { height: '100%', borderRadius: 10, backgroundColor: '#7040D5' },
  metricValue: { fontFamily: 'PoppinsSemiBold', fontSize: 11, color: '#172033', width: 34, textAlign: 'right' },

  examGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  examItem: { width: '47%', minHeight: 92, borderRadius: 12, backgroundColor: '#F9FAFC', padding: 10 },
  examIconBox: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#F1EAFF', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  examName: { fontFamily: 'PoppinsSemiBold', fontSize: 10, color: '#172033' },
  examCount: { fontFamily: 'PoppinsBold', fontSize: 17, color: '#7040D5', marginTop: 1 },
  examCaption: { fontFamily: 'PoppinsRegular', fontSize: 8, color: '#9AA4B4' },

  announcementList: { gap: 9 },
  announcementItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  announcementIconBox: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#F1EAFF', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  announcementText: { flex: 1, minWidth: 0 },
  announcementTitle: { fontFamily: 'PoppinsMedium', fontSize: 10, color: '#172033' },
  announcementDate: { fontFamily: 'PoppinsRegular', fontSize: 8, color: '#9AA4B4', marginTop: 2 },

  subjectList: { gap: 10 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectIconBox: { width: 31, height: 31, borderRadius: 9, backgroundColor: '#F1EAFF', alignItems: 'center', justifyContent: 'center' },
  subjectText: { flex: 1 },
  subjectName: { fontFamily: 'PoppinsMedium', fontSize: 10, color: '#172033', marginBottom: 4 },
  subjectTrack: { height: 5, borderRadius: 10, backgroundColor: '#F1F3F7', overflow: 'hidden' },
  subjectBar: { height: '100%', borderRadius: 10, backgroundColor: '#7040D5' },
  subjectScore: { fontFamily: 'PoppinsBold', fontSize: 11, color: '#7040D5', width: 34, textAlign: 'right' },

  batchList: { gap: 8 },
  batchItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F1F3F7' },
  batchName: { fontFamily: 'PoppinsSemiBold', fontSize: 10, color: '#172033' },
  batchTrack: { fontFamily: 'PoppinsRegular', fontSize: 8, color: '#9AA4B4', marginTop: 2 },
  batchCountBox: { minWidth: 50, alignItems: 'flex-end' },
  batchCount: { fontFamily: 'PoppinsBold', fontSize: 15, color: '#2675E8' },
  batchCaption: { fontFamily: 'PoppinsRegular', fontSize: 7, color: '#9AA4B4' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quickItem: { width: '22%', minWidth: 62, alignItems: 'center', paddingVertical: 4 },
  quickIconBox: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  quickText: { fontFamily: 'PoppinsMedium', fontSize: 8, color: '#4F5B6E', textAlign: 'center' },

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