import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import AttendanceDetails from './AttendanceDetails';
import {
  getMyAttendance,
  StudentAttendanceData,
  StudentAttendanceSubject,
} from '../../../services/attendance';

type AttendancePageProps = {
  data?: StudentAttendanceData | null;
  loading?: boolean;
  onRefresh?: () => void;
  onContentScroll?: (event: any) => void;
};

type AttendanceView = 'overview' | 'details';

const SUBJECT_COLORS = [
  { color: '#6630D7', background: '#EEE7FF', icon: 'flask-outline' },
  { color: '#1670E8', background: '#E6F0FF', icon: 'calculator-outline' },
  { color: '#22A55A', background: '#E3F7EB', icon: 'beaker-outline' },
  { color: '#F28A17', background: '#FFF0DF', icon: 'book-outline' },
  { color: '#E95386', background: '#FDECF1', icon: 'school-outline' },
  { color: '#7040D5', background: '#F1EAFF', icon: 'atom' },
] as const;

export default function AttendancePage({
  data: initialData,
  loading: initialLoading,
  onRefresh: parentRefresh,
  onContentScroll,
}: AttendancePageProps) {
  const [currentView, setCurrentView] =
    useState<AttendanceView>('overview');

  const [attendanceData, setAttendanceData] =
    useState<StudentAttendanceData | null>(initialData ?? null);

  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await getMyAttendance();
      setAttendanceData(res);
    } catch (err) {
      console.error('Failed to load student attendance:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (initialData !== undefined) {
      setAttendanceData(initialData);
    } else {
      void fetchAttendance();
    }
  }, [initialData, fetchAttendance]);

  useFocusEffect(
    useCallback(() => {
      void fetchAttendance();
    }, [fetchAttendance]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    if (parentRefresh) {
      parentRefresh();
    }
    await fetchAttendance();
  };

  const overall = attendanceData?.overall ?? {
    percentage: 0,
    present: 0,
    absent: 0,
    total: 0,
    statusText: 'No attendance records',
  };

  const subjects = attendanceData?.subjects ?? [];
  const recentRecords = attendanceData?.recent ?? [];

  if (currentView === 'details') {
    return (
      <View style={styles.detailsContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            setCurrentView('overview')
          }
        >
          <Ionicons
            name="arrow-back"
            size={19}
            color="#6630D7"
          />

          <Text style={styles.backText}>
            Back to Attendance
          </Text>
        </Pressable>

        <View style={styles.detailsContent}>
          <AttendanceDetails
            records={attendanceData?.records}
            onContentScroll={onContentScroll}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6630D7']}
            tintColor="#6630D7"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              My Attendance
            </Text>

            <Text style={styles.subtitle}>
              Track your attendance and class history
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={25}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Overall Attendance */}
        <View style={styles.overallCard}>
          <View style={styles.overallLeft}>
            <Text style={styles.overallLabel}>
              OVERALL ATTENDANCE
            </Text>

            <Text style={styles.overallPercentage}>
              {overall.percentage}%
            </Text>

            <View style={styles.statusRow}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                {overall.statusText}
              </Text>
            </View>
          </View>

          <View style={styles.progressCircle}>
            <View style={styles.progressInner}>
              <Text style={styles.progressText}>
                {overall.percentage}
              </Text>

              <Text style={styles.progressPercent}>
                %
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {overall.present}
            </Text>

            <Text style={styles.summaryLabel}>
              Present
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {overall.absent}
            </Text>

            <Text style={styles.summaryLabel}>
              Absent
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {overall.total}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Classes
            </Text>
          </View>
        </View>

        {/* Subject Attendance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Subject-wise Attendance
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your attendance for each subject
              </Text>
            </View>
          </View>

          {subjects.length === 0 ? (
            <View style={{ paddingVertical: 18, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PoppinsRegular', fontSize: 12, color: '#9AA4B4' }}>
                No subject attendance records found
              </Text>
            </View>
          ) : (
            subjects.map(
              (item, index) => {
                const meta =
                  SUBJECT_COLORS[index % SUBJECT_COLORS.length];

                return (
                  <View
                    key={item.subjectId || item.subject}
                    style={[
                      styles.subjectRow,
                      index !==
                        subjects.length - 1 &&
                        styles.subjectBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.subjectIcon,
                        {
                          backgroundColor:
                            meta.background,
                        },
                      ]}
                    >
                      <Ionicons
                        name={meta.icon as any}
                        size={20}
                        color={meta.color}
                      />
                    </View>

                    <View style={styles.subjectContent}>
                      <View
                        style={styles.subjectTitleRow}
                      >
                        <Text style={styles.subjectName}>
                          {item.subject}
                        </Text>

                        <Text
                          style={[
                            styles.subjectPercentage,
                            {
                              color: meta.color,
                            },
                          ]}
                        >
                          {item.percentage}%
                        </Text>
                      </View>

                      <View
                        style={styles.progressBackground}
                      >
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                              backgroundColor:
                                meta.color,
                            },
                          ]}
                        />
                      </View>

                      <Text style={styles.subjectCount}>
                        {item.present} of {item.total}{' '}
                        classes attended
                      </Text>
                    </View>
                  </View>
                );
              },
            )
          )}
        </View>

        {/* Attendance Details CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.detailsButton,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            setCurrentView('details')
          }
        >
          <View style={styles.detailsButtonIcon}>
            <Ionicons
              name="list-outline"
              size={20}
              color="#6630D7"
            />
          </View>

          <View style={styles.detailsButtonContent}>
            <Text style={styles.detailsButtonTitle}>
              View Attendance Details
            </Text>

            <Text style={styles.detailsButtonSubtitle}>
              See attendance by date and subject
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#6630D7"
          />
        </Pressable>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Recent Attendance
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your latest class records
              </Text>
            </View>
          </View>

          {recentRecords.length === 0 ? (
            <View style={{ paddingVertical: 18, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PoppinsRegular', fontSize: 12, color: '#9AA4B4' }}>
                No recent class attendance records
              </Text>
            </View>
          ) : (
            recentRecords.map((item) => (
              <RecentAttendance
                key={item.id}
                subject={item.subject}
                date={item.date}
                time={item.time}
                present={item.status === 'Present'}
              />
            ))
          )}
        </View>

        {/* Reminder */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>
              Attendance Reminder
            </Text>

            <Text style={styles.reminderText}>
              Keep attending your classes regularly
              to maintain good attendance.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* ===================================== */
/* Recent Attendance */
/* ===================================== */

function RecentAttendance({
  subject,
  date,
  time,
  present,
}: {
  subject: string;
  date: string;
  time: string;
  present: boolean;
}) {
  return (
    <View style={styles.recentRow}>
      <View
        style={[
          styles.recentIcon,
          present
            ? styles.presentBackground
            : styles.absentBackground,
        ]}
      >
        <Ionicons
          name={present ? 'checkmark' : 'close'}
          size={17}
          color={
            present ? '#22A55A' : '#E4515D'
          }
        />
      </View>

      <View style={styles.recentContent}>
        <Text style={styles.recentSubject}>
          {subject}
        </Text>

        <Text style={styles.recentDetails}>
          {date} • {time}
        </Text>
      </View>

      <View
        style={[
          styles.recentBadge,
          present
            ? styles.presentBadge
            : styles.absentBadge,
        ]}
      >
        <Text
          style={[
            styles.recentBadgeText,
            present
              ? styles.presentText
              : styles.absentText,
          ]}
        >
          {present ? 'Present' : 'Absent'}
        </Text>
      </View>
    </View>
  );
}

/* ===================================== */
/* Styles */
/* ===================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 110,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: '#111528',
    fontSize: 23,
    fontFamily: 'PoppinsBold',
  },

  subtitle: {
    color: '#858592',
    fontSize: 9,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Overall */

  overallCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#6630D7',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  overallLeft: {
    flex: 1,
  },

  overallLabel: {
    color: '#DCD0FF',
    fontSize: 8.5,
    fontFamily: 'PoppinsBold',
    letterSpacing: 0.5,
  },

  overallPercentage: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'PoppinsBold',
    marginTop: 2,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7FE0A5',
    marginRight: 5,
  },

  statusText: {
    color: '#E4DFFF',
    fontSize: 9,
    fontFamily: 'PoppinsMedium',
  },

  progressCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 8,
    borderColor: '#A98EEB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  progressText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'PoppinsBold',
  },

  progressPercent: {
    color: '#E4DFFF',
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
  },

  /* Summary */

  summaryCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    color: '#171A2B',
    fontSize: 16,
    fontFamily: 'PoppinsBold',
  },

  summaryLabel: {
    color: '#858592',
    fontSize: 8.5,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EEEEF3',
  },

  /* Section */

  section: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },

  sectionHeader: {
    marginBottom: 8,
  },

  sectionTitle: {
    color: '#171A2B',
    fontSize: 15,
    fontFamily: 'PoppinsBold',
  },

  sectionSubtitle: {
    color: '#858592',
    fontSize: 8.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 1,
  },

  /* Subjects */

  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  subjectBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
  },

  subjectIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  subjectContent: {
    flex: 1,
  },

  subjectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  subjectName: {
    color: '#171A2B',
    fontSize: 11.5,
    fontFamily: 'PoppinsBold',
  },

  subjectPercentage: {
    fontSize: 10.5,
    fontFamily: 'PoppinsBold',
  },

  progressBackground: {
    height: 6,
    borderRadius: 5,
    backgroundColor: '#EEEEF3',
    overflow: 'hidden',
    marginTop: 6,
  },

  progressBar: {
    height: '100%',
    borderRadius: 5,
  },

  subjectCount: {
    color: '#9999A5',
    fontSize: 7.8,
    fontFamily: 'PoppinsRegular',
    marginTop: 4,
  },

  /* Details Button */

  detailsButton: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 13,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailsButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  detailsButtonContent: {
    flex: 1,
  },

  detailsButtonTitle: {
    color: '#171A2B',
    fontSize: 10.5,
    fontFamily: 'PoppinsBold',
  },

  detailsButtonSubtitle: {
    color: '#858592',
    fontSize: 8,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  /* Recent */

  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
  },

  recentIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  presentBackground: {
    backgroundColor: '#E3F7EB',
  },

  absentBackground: {
    backgroundColor: '#FFE9EA',
  },

  recentContent: {
    flex: 1,
  },

  recentSubject: {
    color: '#171A2B',
    fontSize: 10.5,
    fontFamily: 'PoppinsBold',
  },

  recentDetails: {
    color: '#858592',
    fontSize: 8,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  recentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },

  presentBadge: {
    backgroundColor: '#E3F7EB',
  },

  absentBadge: {
    backgroundColor: '#FFE9EA',
  },

  recentBadgeText: {
    fontSize: 7,
    fontFamily: 'PoppinsSemiBold',
  },

  presentText: {
    color: '#22A55A',
  },

  absentText: {
    color: '#E4515D',
  },

  /* Reminder */

  reminderCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 13,
    borderRadius: 17,
    backgroundColor: '#F8F5FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  reminderContent: {
    flex: 1,
  },

  reminderTitle: {
    color: '#171A2B',
    fontSize: 10.5,
    fontFamily: 'PoppinsBold',
  },

  reminderText: {
    color: '#777784',
    fontSize: 8.5,
    lineHeight: 13,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  /* Details View */

  detailsContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  detailsContent: {
    flex: 1,
  },

  backButton: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backText: {
    color: '#6630D7',
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
    marginLeft: 7,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  bottomSpace: {
    height: 25,
  },
});