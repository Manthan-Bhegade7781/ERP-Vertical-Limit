import React, { useMemo, useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

type ReportsPageProps = {
  studentId?: string;
  studentName?: string;
  onContentScroll?: (event: any) => void;
};

type TestResult = {
  id: string;
  testName: string;
  date: string;
  marks: number;
  maxMarks: number;
};

type StudentReport = {
  id: string;
  name: string;
  batch: string;
  subject: string;
  initials: string;

  attendance: {
    present: number;
    absent: number;
  };

  tests: TestResult[];
};

const REPORT_DATA: StudentReport[] = [
  {
    id: 'STU-0801',
    name: 'Aarav Mehta',
    batch: '8th Standard',
    subject: 'Physics',
    initials: 'AM',

    attendance: {
      present: 22,
      absent: 2,
    },

    tests: [
      {
        id: 'TEST-0801-1',
        testName: 'Force & Motion',
        date: '05 Sep 2026',
        marks: 42,
        maxMarks: 50,
      },
      {
        id: 'TEST-0801-2',
        testName: 'Light & Reflection',
        date: '28 Aug 2026',
        marks: 45,
        maxMarks: 50,
      },
      {
        id: 'TEST-0801-3',
        testName: 'Matter & Energy',
        date: '14 Aug 2026',
        marks: 38,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-0802',
    name: 'Avni Shah',
    batch: '8th Standard',
    subject: 'Physics',
    initials: 'AS',

    attendance: {
      present: 23,
      absent: 1,
    },

    tests: [
      {
        id: 'TEST-0802-1',
        testName: 'Force & Motion',
        date: '05 Sep 2026',
        marks: 46,
        maxMarks: 50,
      },
      {
        id: 'TEST-0802-2',
        testName: 'Light & Reflection',
        date: '28 Aug 2026',
        marks: 43,
        maxMarks: 50,
      },
      {
        id: 'TEST-0802-3',
        testName: 'Matter & Energy',
        date: '14 Aug 2026',
        marks: 47,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-0803',
    name: 'Harsh Kumar',
    batch: '8th Standard',
    subject: 'Physics',
    initials: 'HK',

    attendance: {
      present: 20,
      absent: 4,
    },

    tests: [
      {
        id: 'TEST-0803-1',
        testName: 'Force & Motion',
        date: '05 Sep 2026',
        marks: 36,
        maxMarks: 50,
      },
      {
        id: 'TEST-0803-2',
        testName: 'Light & Reflection',
        date: '28 Aug 2026',
        marks: 39,
        maxMarks: 50,
      },
      {
        id: 'TEST-0803-3',
        testName: 'Matter & Energy',
        date: '14 Aug 2026',
        marks: 35,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-0901',
    name: 'Kiara Patel',
    batch: '9th Standard',
    subject: 'Physics',
    initials: 'KP',

    attendance: {
      present: 21,
      absent: 1,
    },

    tests: [
      {
        id: 'TEST-0901-1',
        testName: 'Motion',
        date: '05 Sep 2026',
        marks: 44,
        maxMarks: 50,
      },
      {
        id: 'TEST-0901-2',
        testName: 'Gravitation',
        date: '26 Aug 2026',
        marks: 41,
        maxMarks: 50,
      },
      {
        id: 'TEST-0901-3',
        testName: 'Work & Energy',
        date: '12 Aug 2026',
        marks: 46,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-0902',
    name: 'Reyansh Singh',
    batch: '9th Standard',
    subject: 'Physics',
    initials: 'RS',

    attendance: {
      present: 20,
      absent: 2,
    },

    tests: [
      {
        id: 'TEST-0902-1',
        testName: 'Motion',
        date: '05 Sep 2026',
        marks: 40,
        maxMarks: 50,
      },
      {
        id: 'TEST-0902-2',
        testName: 'Gravitation',
        date: '26 Aug 2026',
        marks: 37,
        maxMarks: 50,
      },
      {
        id: 'TEST-0902-3',
        testName: 'Work & Energy',
        date: '12 Aug 2026',
        marks: 43,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-0903',
    name: 'Tara Joshi',
    batch: '9th Standard',
    subject: 'Physics',
    initials: 'TJ',

    attendance: {
      present: 22,
      absent: 0,
    },

    tests: [
      {
        id: 'TEST-0903-1',
        testName: 'Motion',
        date: '05 Sep 2026',
        marks: 48,
        maxMarks: 50,
      },
      {
        id: 'TEST-0903-2',
        testName: 'Gravitation',
        date: '26 Aug 2026',
        marks: 46,
        maxMarks: 50,
      },
      {
        id: 'TEST-0903-3',
        testName: 'Work & Energy',
        date: '12 Aug 2026',
        marks: 47,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1001',
    name: 'Aditi Verma',
    batch: '10th Standard',
    subject: 'Physics',
    initials: 'AV',

    attendance: {
      present: 24,
      absent: 1,
    },

    tests: [
      {
        id: 'TEST-1001-1',
        testName: 'Electricity',
        date: '05 Sep 2026',
        marks: 45,
        maxMarks: 50,
      },
      {
        id: 'TEST-1001-2',
        testName: 'Magnetic Effects',
        date: '25 Aug 2026',
        marks: 47,
        maxMarks: 50,
      },
      {
        id: 'TEST-1001-3',
        testName: 'Light',
        date: '10 Aug 2026',
        marks: 44,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1002',
    name: 'Rohan Malhotra',
    batch: '10th Standard',
    subject: 'Physics',
    initials: 'RM',

    attendance: {
      present: 21,
      absent: 4,
    },

    tests: [
      {
        id: 'TEST-1002-1',
        testName: 'Electricity',
        date: '05 Sep 2026',
        marks: 39,
        maxMarks: 50,
      },
      {
        id: 'TEST-1002-2',
        testName: 'Magnetic Effects',
        date: '25 Aug 2026',
        marks: 42,
        maxMarks: 50,
      },
      {
        id: 'TEST-1002-3',
        testName: 'Light',
        date: '10 Aug 2026',
        marks: 40,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1003',
    name: 'Ishita Rao',
    batch: '10th Standard',
    subject: 'Physics',
    initials: 'IR',

    attendance: {
      present: 23,
      absent: 1,
    },

    tests: [
      {
        id: 'TEST-1003-1',
        testName: 'Electricity',
        date: '05 Sep 2026',
        marks: 48,
        maxMarks: 50,
      },
      {
        id: 'TEST-1003-2',
        testName: 'Magnetic Effects',
        date: '25 Aug 2026',
        marks: 45,
        maxMarks: 50,
      },
      {
        id: 'TEST-1003-3',
        testName: 'Light',
        date: '10 Aug 2026',
        marks: 46,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1101',
    name: 'Arjun Kapoor',
    batch: '11th Standard',
    subject: 'Physics',
    initials: 'AK',

    attendance: {
      present: 22,
      absent: 2,
    },

    tests: [
      {
        id: 'TEST-1101-1',
        testName: 'Kinematics',
        date: '04 Sep 2026',
        marks: 44,
        maxMarks: 50,
      },
      {
        id: 'TEST-1101-2',
        testName: 'Laws of Motion',
        date: '22 Aug 2026',
        marks: 41,
        maxMarks: 50,
      },
      {
        id: 'TEST-1101-3',
        testName: 'Work & Energy',
        date: '08 Aug 2026',
        marks: 46,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1102',
    name: 'Meera Nair',
    batch: '11th Standard',
    subject: 'Physics',
    initials: 'MN',

    attendance: {
      present: 24,
      absent: 0,
    },

    tests: [
      {
        id: 'TEST-1102-1',
        testName: 'Kinematics',
        date: '04 Sep 2026',
        marks: 47,
        maxMarks: 50,
      },
      {
        id: 'TEST-1102-2',
        testName: 'Laws of Motion',
        date: '22 Aug 2026',
        marks: 49,
        maxMarks: 50,
      },
      {
        id: 'TEST-1102-3',
        testName: 'Work & Energy',
        date: '08 Aug 2026',
        marks: 45,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1103',
    name: 'Vivaan Sharma',
    batch: '11th Standard',
    subject: 'Physics',
    initials: 'VS',

    attendance: {
      present: 19,
      absent: 5,
    },

    tests: [
      {
        id: 'TEST-1103-1',
        testName: 'Kinematics',
        date: '04 Sep 2026',
        marks: 36,
        maxMarks: 50,
      },
      {
        id: 'TEST-1103-2',
        testName: 'Laws of Motion',
        date: '22 Aug 2026',
        marks: 38,
        maxMarks: 50,
      },
      {
        id: 'TEST-1103-3',
        testName: 'Work & Energy',
        date: '08 Aug 2026',
        marks: 40,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1201',
    name: 'Aditya Joshi',
    batch: '12th Standard',
    subject: 'Physics',
    initials: 'AJ',

    attendance: {
      present: 23,
      absent: 1,
    },

    tests: [
      {
        id: 'TEST-1201-1',
        testName: 'Electrostatics',
        date: '03 Sep 2026',
        marks: 46,
        maxMarks: 50,
      },
      {
        id: 'TEST-1201-2',
        testName: 'Current Electricity',
        date: '20 Aug 2026',
        marks: 44,
        maxMarks: 50,
      },
      {
        id: 'TEST-1201-3',
        testName: 'Magnetism',
        date: '06 Aug 2026',
        marks: 48,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1202',
    name: 'Ananya Gupta',
    batch: '12th Standard',
    subject: 'Physics',
    initials: 'AG',

    attendance: {
      present: 24,
      absent: 0,
    },

    tests: [
      {
        id: 'TEST-1202-1',
        testName: 'Electrostatics',
        date: '03 Sep 2026',
        marks: 49,
        maxMarks: 50,
      },
      {
        id: 'TEST-1202-2',
        testName: 'Current Electricity',
        date: '20 Aug 2026',
        marks: 47,
        maxMarks: 50,
      },
      {
        id: 'TEST-1202-3',
        testName: 'Magnetism',
        date: '06 Aug 2026',
        marks: 46,
        maxMarks: 50,
      },
    ],
  },

  {
    id: 'STU-1203',
    name: 'Kabir Shah',
    batch: '12th Standard',
    subject: 'Physics',
    initials: 'KS',

    attendance: {
      present: 21,
      absent: 3,
    },

    tests: [
      {
        id: 'TEST-1203-1',
        testName: 'Electrostatics',
        date: '03 Sep 2026',
        marks: 41,
        maxMarks: 50,
      },
      {
        id: 'TEST-1203-2',
        testName: 'Current Electricity',
        date: '20 Aug 2026',
        marks: 39,
        maxMarks: 50,
      },
      {
        id: 'TEST-1203-3',
        testName: 'Magnetism',
        date: '06 Aug 2026',
        marks: 43,
        maxMarks: 50,
      },
    ],
  },
];

export default function ReportsPage({
  studentId,
  studentName,
  onContentScroll,
}: ReportsPageProps) {
  const [selectedTestId, setSelectedTestId] =
    useState<string | null>(null);

  const student = useMemo(() => {
    if (studentId) {
      return (
        REPORT_DATA.find(
          (item) => item.id === studentId,
        ) ?? null
      );
    }

    if (studentName) {
      return (
        REPORT_DATA.find(
          (item) => item.name === studentName,
        ) ?? null
      );
    }

    return REPORT_DATA[0];
  }, [studentId, studentName]);

  if (!student) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="person-outline"
            size={32}
            color="#6428D7"
          />
        </View>

        <Text style={styles.emptyTitle}>
          Student report unavailable
        </Text>

        <Text style={styles.emptySubtitle}>
          No report data is available for this
          student yet.
        </Text>
      </View>
    );
  }

  const totalClasses =
    student.attendance.present +
    student.attendance.absent;

  const attendancePercentage =
    totalClasses > 0
      ? Math.round(
          (student.attendance.present /
            totalClasses) *
            100,
        )
      : 0;

  const totalMarks = student.tests.reduce(
    (sum, test) => sum + test.marks,
    0,
  );

  const totalMaxMarks = student.tests.reduce(
    (sum, test) => sum + test.maxMarks,
    0,
  );

  const overallTestPercentage =
    totalMaxMarks > 0
      ? Math.round(
          (totalMarks /
            totalMaxMarks) *
            100,
        )
      : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* ================================
            HEADER
        ================================= */}

        <View style={styles.pageHeader}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="bar-chart-outline"
              size={27}
              color="#6428D7"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>
              Student Report
            </Text>

            <Text style={styles.pageSubtitle}>
              Attendance and academic performance
            </Text>
          </View>
        </View>

        {/* ================================
            STUDENT PROFILE
        ================================= */}

        <View style={styles.studentProfileCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentInitials}>
              {student.initials}
            </Text>
          </View>

          <View style={styles.studentProfileInfo}>
            <Text style={styles.studentName}>
              {student.name}
            </Text>

            <Text style={styles.studentId}>
              Student ID: {student.id}
            </Text>

            <View style={styles.profileMeta}>
              <View style={styles.profileMetaItem}>
                <Ionicons
                  name="school-outline"
                  size={14}
                  color="#6D7280"
                />

                <Text style={styles.profileMetaText}>
                  {student.batch}
                </Text>
              </View>

              <View style={styles.profileMetaDot} />

              <View style={styles.profileMetaItem}>
                <Ionicons
                  name="book-outline"
                  size={14}
                  color="#6D7280"
                />

                <Text style={styles.profileMetaText}>
                  {student.subject}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================================
            ATTENDANCE
        ================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Attendance
              </Text>

              <Text style={styles.sectionSubtitle}>
                Lecture attendance record
              </Text>
            </View>

            <View
              style={[
                styles.percentageBadge,
                attendancePercentage < 75 &&
                  styles.percentageBadgeWarning,
              ]}
            >
              <Text
                style={[
                  styles.percentageText,
                  attendancePercentage < 75 &&
                    styles.percentageTextWarning,
                ]}
              >
                {attendancePercentage}%
              </Text>
            </View>
          </View>

          <View style={styles.attendanceStats}>
            <View style={styles.attendanceStat}>
              <View
                style={[
                  styles.statIcon,
                  styles.presentIcon,
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#27A566"
                />
              </View>

              <View>
                <Text style={styles.statNumber}>
                  {student.attendance.present}
                </Text>

                <Text style={styles.statLabel}>
                  Present
                </Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.attendanceStat}>
              <View
                style={[
                  styles.statIcon,
                  styles.absentIcon,
                ]}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color="#D64545"
                />
              </View>

              <View>
                <Text style={styles.statNumber}>
                  {student.attendance.absent}
                </Text>

                <Text style={styles.statLabel}>
                  Absent
                </Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.attendanceStat}>
              <View
                style={[
                  styles.statIcon,
                  styles.totalIcon,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#6428D7"
                />
              </View>

              <View>
                <Text style={styles.statNumber}>
                  {totalClasses}
                </Text>

                <Text style={styles.statLabel}>
                  Classes
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${attendancePercentage}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* ================================
            TEST PERFORMANCE
        ================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Test Performance
              </Text>

              <Text style={styles.sectionSubtitle}>
                Marks secured in each test
              </Text>
            </View>

            <View style={styles.testCountBadge}>
              <Text style={styles.testCountText}>
                {student.tests.length} Tests
              </Text>
            </View>
          </View>

          <View style={styles.overallMarksCard}>
            <View style={styles.overallMarksIcon}>
              <Ionicons
                name="trophy-outline"
                size={24}
                color="#F28A17"
              />
            </View>

            <View style={styles.overallMarksInfo}>
              <Text style={styles.overallMarksLabel}>
                Overall Performance
              </Text>

              <Text style={styles.overallMarksValue}>
                {totalMarks} / {totalMaxMarks}
              </Text>
            </View>

            <View style={styles.overallPercentage}>
              <Text style={styles.overallPercentageText}>
                {overallTestPercentage}%
              </Text>
            </View>
          </View>

          <View style={styles.testList}>
            {student.tests.map((test) => {
              const testPercentage =
                test.maxMarks > 0
                  ? Math.round(
                      (test.marks /
                        test.maxMarks) *
                        100,
                    )
                  : 0;

              const isSelected =
                selectedTestId === test.id;

              return (
                <Pressable
                  key={test.id}
                  style={({ pressed }) => [
                    styles.testCard,
                    isSelected &&
                      styles.testCardSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() =>
                    setSelectedTestId(
                      isSelected
                        ? null
                        : test.id,
                    )
                  }
                >
                  <View style={styles.testIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#6428D7"
                    />
                  </View>

                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>
                      {test.testName}
                    </Text>

                    <View
                      style={styles.testDateRow}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color="#858996"
                      />

                      <Text
                        style={styles.testDate}
                      >
                        {test.date}
                      </Text>
                    </View>

                    {isSelected && (
                      <View
                        style={styles.testProgressArea}
                      >
                        <View
                          style={
                            styles.testProgressBackground
                          }
                        >
                          <View
                            style={[
                              styles.testProgressFill,
                              {
                                width: `${testPercentage}%`,
                              },
                            ]}
                          />
                        </View>

                        <Text
                          style={
                            styles.testPercentageSmall
                          }
                        >
                          {testPercentage}% secured
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.marksContainer}>
                    <Text style={styles.marksValue}>
                      {test.marks}
                    </Text>

                    <Text style={styles.marksMax}>
                      / {test.maxMarks}
                    </Text>

                    <Text
                      style={styles.marksPercentage}
                    >
                      {testPercentage}%
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ================================
            SUMMARY
        ================================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#6428D7"
            />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>
              Performance Summary
            </Text>

            <Text style={styles.summaryDescription}>
              {student.name} has attended{' '}
              {attendancePercentage}% of lectures
              and has secured{' '}
              {overallTestPercentage}% overall
              in the recorded tests.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* =====================================
   STYLES
===================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
  },

  pageHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  pageTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 21,
  },

  pageSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 2,
  },

  studentProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  studentAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  studentInitials: {
    color: '#6428D7',
    fontFamily: 'PoppinsBold',
    fontSize: 16,
  },

  studentProfileInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  studentId: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  profileMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileMetaText: {
    color: '#6D7280',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginLeft: 4,
  },

  profileMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#B5B7BE',
    marginHorizontal: 7,
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  sectionSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  percentageBadge: {
    backgroundColor: '#E3F7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  percentageBadgeWarning: {
    backgroundColor: '#FFF0DF',
  },

  percentageText: {
    color: '#27A566',
    fontFamily: 'PoppinsBold',
    fontSize: 13,
  },

  percentageTextWarning: {
    color: '#F28A17',
  },

  attendanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  attendanceStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  presentIcon: {
    backgroundColor: '#E3F7EB',
  },

  absentIcon: {
    backgroundColor: '#FDECEC',
  },

  totalIcon: {
    backgroundColor: '#EEE7FF',
  },

  statNumber: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 15,
  },

  statLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    marginTop: 0,
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E8E8ED',
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#EEEEF2',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 15,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#27A566',
    borderRadius: 4,
  },

  testCountBadge: {
    backgroundColor: '#EEE7FF',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  testCountText: {
    color: '#6428D7',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
  },

  overallMarksCard: {
    backgroundColor: '#F8F7FA',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  overallMarksIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF0DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  overallMarksInfo: {
    flex: 1,
  },

  overallMarksLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
  },

  overallMarksValue: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    marginTop: 1,
  },

  overallPercentage: {
    backgroundColor: '#E3F7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  overallPercentageText: {
    color: '#27A566',
    fontFamily: 'PoppinsBold',
    fontSize: 12,
  },

  testList: {
    gap: 8,
  },

  testCard: {
    minHeight: 70,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E8ED',
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  testCardSelected: {
    backgroundColor: '#FAF8FF',
    borderColor: '#DCD0FF',
  },

  testIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  testInfo: {
    flex: 1,
    minWidth: 0,
  },

  testName: {
    color: '#171A2B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
  },

  testDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  testDate: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginLeft: 4,
  },

  testProgressArea: {
    marginTop: 7,
  },

  testProgressBackground: {
    height: 5,
    backgroundColor: '#EDEDF1',
    borderRadius: 3,
    overflow: 'hidden',
  },

  testProgressFill: {
    height: '100%',
    backgroundColor: '#6428D7',
    borderRadius: 3,
  },

  testPercentageSmall: {
    color: '#6428D7',
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    marginTop: 3,
  },

  marksContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  marksValue: {
    color: '#6428D7',
    fontFamily: 'PoppinsBold',
    fontSize: 16,
  },

  marksMax: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
  },

  marksPercentage: {
    color: '#27A566',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    marginTop: 1,
  },

  summaryCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  summaryText: {
    flex: 1,
  },

  summaryTitle: {
    color: '#171A2B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
  },

  summaryDescription: {
    color: '#656A77',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 2,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  emptySubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
  },

  bottomSpace: {
    height: 25,
  },

  pressed: {
    opacity: 0.7,
  },
});