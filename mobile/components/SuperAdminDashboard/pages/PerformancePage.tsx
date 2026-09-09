import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type PerformanceStatus =
  | 'Excellent'
  | 'Good'
  | 'Average'
  | 'Needs Improvement';

type PerformanceRecord = {
  id: number;
  studentName: string;
  studentId: string;
  course: string;
  batch: string;
  branch: string;
  attendance: number;
  assignments: number;
  theory: number;
  practical: number;
  examination: number;
  overall: number;
  status: PerformanceStatus;
  remarks: string;
};

const initialPerformance: PerformanceRecord[] = [
  {
    id: 1,
    studentName: 'Aarav Sharma',
    studentId: 'VLCC-STU-001',
    course: 'Professional Makeup',
    batch: 'PM-2026-Morning',
    branch: 'Pune Branch',
    attendance: 96,
    assignments: 92,
    theory: 88,
    practical: 94,
    examination: 91,
    overall: 93.0,
    status: 'Excellent',
    remarks:
      'Excellent practical skills and consistent academic performance.',
  },
  {
    id: 2,
    studentName: 'Ananya Patil',
    studentId: 'VLCC-STU-002',
    course: 'Beauty Therapy',
    batch: 'BT-2026-Evening',
    branch: 'Mumbai Branch',
    attendance: 94,
    assignments: 88,
    theory: 84,
    practical: 90,
    examination: 87,
    overall: 89.0,
    status: 'Excellent',
    remarks:
      'Strong performance with good practical understanding.',
  },
  {
    id: 3,
    studentName: 'Riya Kulkarni',
    studentId: 'VLCC-STU-003',
    course: 'Hair Dressing',
    batch: 'HD-2026-Morning',
    branch: 'Pune Branch',
    attendance: 78,
    assignments: 69,
    theory: 72,
    practical: 76,
    examination: 74,
    overall: 73.8,
    status: 'Average',
    remarks:
      'Needs more consistency in attendance and assignments.',
  },
  {
    id: 4,
    studentName: 'Neha Joshi',
    studentId: 'VLCC-STU-004',
    course: 'Skin Care Specialist',
    batch: 'SC-2026-Nashik',
    branch: 'Nashik Branch',
    attendance: 91,
    assignments: 84,
    theory: 82,
    practical: 86,
    examination: 84,
    overall: 85.4,
    status: 'Good',
    remarks:
      'Good overall progress with scope for improvement in theory.',
  },
  {
    id: 5,
    studentName: 'Kavya Mehta',
    studentId: 'VLCC-STU-005',
    course: 'Nail Art Professional',
    batch: 'NA-2026-Nagpur',
    branch: 'Nagpur Branch',
    attendance: 97,
    assignments: 95,
    theory: 91,
    practical: 96,
    examination: 94,
    overall: 94.6,
    status: 'Excellent',
    remarks:
      'Outstanding creativity and practical performance.',
  },
  {
    id: 6,
    studentName: 'Sneha Deshmukh',
    studentId: 'VLCC-STU-006',
    course: 'Advanced Beauty Therapy',
    batch: 'ABT-2026-Mumbai',
    branch: 'Mumbai Branch',
    attendance: 89,
    assignments: 81,
    theory: 79,
    practical: 85,
    examination: 82,
    overall: 83.2,
    status: 'Good',
    remarks:
      'Good performance with improvement required in theory.',
  },
  {
    id: 7,
    studentName: 'Ishita Shah',
    studentId: 'VLCC-STU-007',
    course: 'Professional Makeup',
    batch: 'PM-2026-Morning',
    branch: 'Pune Branch',
    attendance: 86,
    assignments: 78,
    theory: 76,
    practical: 82,
    examination: 79,
    overall: 80.2,
    status: 'Good',
    remarks:
      'Steady performance. More assignment practice is recommended.',
  },
  {
    id: 8,
    studentName: 'Pooja Verma',
    studentId: 'VLCC-STU-008',
    course: 'Beauty Therapy',
    batch: 'BT-2026-Evening',
    branch: 'Mumbai Branch',
    attendance: 71,
    assignments: 64,
    theory: 66,
    practical: 68,
    examination: 67,
    overall: 66.8,
    status: 'Needs Improvement',
    remarks:
      'Requires improvement in attendance, assignments and examination preparation.',
  },
];

const getStatusColors = (
  status: PerformanceStatus
) => {
  switch (status) {
    case 'Excellent':
      return {
        bg: '#E7F8EF',
        text: '#22945F',
      };

    case 'Good':
      return {
        bg: '#EAF2FF',
        text: '#2675E8',
      };

    case 'Average':
      return {
        bg: '#FFF1E2',
        text: '#E88713',
      };

    case 'Needs Improvement':
      return {
        bg: '#FFE9F0',
        text: '#E95386',
      };
  }
};

export default function PerformancePage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  /*
   * 3 STAT CARDS PER ROW
   */
  const contentWidth = width - 32;
  const statGap = 10;

  const statCardWidth =
    (contentWidth - statGap * 2) / 3;

  const [performance, setPerformance] =
    useState<PerformanceRecord[]>(
      initialPerformance
    );

  const [search, setSearch] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<
      'All' | PerformanceStatus
    >('All');

  const [selectedStudent, setSelectedStudent] =
    useState<PerformanceRecord | null>(
      null
    );

  const [actionModalVisible, setActionModalVisible] =
    useState(false);

  const [viewModalVisible, setViewModalVisible] =
    useState(false);

  const [editModalVisible, setEditModalVisible] =
    useState(false);

  const [attendance, setAttendance] =
    useState('');

  const [assignments, setAssignments] =
    useState('');

  const [theory, setTheory] =
    useState('');

  const [practical, setPractical] =
    useState('');

  const [remarks, setRemarks] =
    useState('');

  const filteredPerformance =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return performance.filter(
        (student) => {
          const matchesSearch =
            !query ||
            student.studentName
              .toLowerCase()
              .includes(query) ||
            student.studentId
              .toLowerCase()
              .includes(query) ||
            student.course
              .toLowerCase()
              .includes(query) ||
            student.batch
              .toLowerCase()
              .includes(query) ||
            student.branch
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            activeFilter === 'All' ||
            student.status ===
              activeFilter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      performance,
      search,
      activeFilter,
    ]);

  const overallPerformance =
    performance.length > 0
      ? performance.reduce(
          (sum, student) =>
            sum + student.overall,
          0
        ) / performance.length
      : 0;

  const averageAttendance =
    performance.length > 0
      ? performance.reduce(
          (sum, student) =>
            sum + student.attendance,
          0
        ) / performance.length
      : 0;

  const averageAssignments =
    performance.length > 0
      ? performance.reduce(
          (sum, student) =>
            sum + student.assignments,
          0
        ) / performance.length
      : 0;

  const averageExamination =
    performance.length > 0
      ? performance.reduce(
          (sum, student) =>
            sum + student.examination,
          0
        ) / performance.length
      : 0;

  const topPerformers =
    performance.filter(
      (student) =>
        student.status === 'Excellent'
    ).length;

  const needsImprovement =
    performance.filter(
      (student) =>
        student.status ===
        'Needs Improvement'
    ).length;

  const openActions = (
    student: PerformanceRecord
  ) => {
    setSelectedStudent(student);
    setActionModalVisible(true);
  };

  const openEditModal = (
    student: PerformanceRecord
  ) => {
    setSelectedStudent(student);

    setAttendance(
      String(student.attendance)
    );

    setAssignments(
      String(student.assignments)
    );

    setTheory(
      String(student.theory)
    );

    setPractical(
      String(student.practical)
    );

    setRemarks(student.remarks);

    setActionModalVisible(false);
    setEditModalVisible(true);
  };

  const calculateOverall = (
    attendanceValue: number,
    assignmentsValue: number,
    theoryValue: number,
    practicalValue: number
  ) => {
    /*
     * Performance calculation:
     *
     * Attendance   = 20%
     * Assignments  = 20%
     * Theory       = 25%
     * Practical    = 35%
     */
    return Number(
      (
        attendanceValue * 0.2 +
        assignmentsValue * 0.2 +
        theoryValue * 0.25 +
        practicalValue * 0.35
      ).toFixed(1)
    );
  };

  const getPerformanceStatus = (
    overall: number
  ): PerformanceStatus => {
    if (overall >= 90) {
      return 'Excellent';
    }

    if (overall >= 80) {
      return 'Good';
    }

    if (overall >= 70) {
      return 'Average';
    }

    return 'Needs Improvement';
  };

  const savePerformance = () => {
    if (!selectedStudent) {
      return;
    }

    const attendanceValue =
      Number(attendance);

    const assignmentsValue =
      Number(assignments);

    const theoryValue =
      Number(theory);

    const practicalValue =
      Number(practical);

    const values = [
      attendanceValue,
      assignmentsValue,
      theoryValue,
      practicalValue,
    ];

    const hasInvalidValue =
      values.some(
        (value) =>
          Number.isNaN(value) ||
          value < 0 ||
          value > 100
      );

    if (hasInvalidValue) {
      Alert.alert(
        'Invalid Score',
        'Please enter scores between 0 and 100.'
      );
      return;
    }

    const newOverall =
      calculateOverall(
        attendanceValue,
        assignmentsValue,
        theoryValue,
        practicalValue
      );

    const newStatus =
      getPerformanceStatus(
        newOverall
      );

    const updatedStudent: PerformanceRecord =
      {
        ...selectedStudent,
        attendance:
          attendanceValue,
        assignments:
          assignmentsValue,
        theory: theoryValue,
        practical:
          practicalValue,
        examination:
          Number(
            (
              theoryValue * 0.5 +
              practicalValue *
                0.5
            ).toFixed(1)
          ),
        overall: newOverall,
        status: newStatus,
        remarks:
          remarks.trim() ||
          'Performance updated successfully.',
      };

    setPerformance(
      (current) =>
        current.map((student) =>
          student.id ===
          selectedStudent.id
            ? updatedStudent
            : student
        )
    );

    setSelectedStudent(
      updatedStudent
    );

    setEditModalVisible(false);

    Alert.alert(
      'Performance Updated',
      `Performance for ${selectedStudent.studentName} has been updated.`
    );
  };

  const downloadPerformancePDF = async (
    student: PerformanceRecord
  ) => {
    const statusColors =
      getStatusColors(
        student.status
      );

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #172033;
            }

            .header {
              background: #7040D5;
              color: white;
              padding: 24px;
              border-radius: 12px;
            }

            .title {
              font-size: 25px;
              font-weight: bold;
            }

            .subtitle {
              font-size: 13px;
              margin-top: 5px;
            }

            .student {
              margin-top: 22px;
              border: 1px solid #E5E7EF;
              border-radius: 12px;
              padding: 18px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #F0F1F5;
            }

            .label {
              color: #748096;
            }

            .value {
              font-weight: bold;
            }

            .overall {
              margin-top: 20px;
              background: #F1EAFF;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
            }

            .score {
              font-size: 38px;
              font-weight: bold;
              color: #7040D5;
            }

            .status {
              display: inline-block;
              margin-top: 8px;
              padding: 7px 14px;
              border-radius: 20px;
              background: ${statusColors.bg};
              color: ${statusColors.text};
              font-weight: bold;
            }

            .section {
              margin-top: 25px;
              font-size: 18px;
              font-weight: bold;
            }

            .remark {
              margin-top: 15px;
              background: #F8F9FC;
              border-radius: 10px;
              padding: 15px;
              color: #59657A;
            }

            .footer {
              margin-top: 35px;
              text-align: center;
              color: #8A93A4;
              font-size: 12px;
            }
          </style>
        </head>

        <body>

          <div class="header">
            <div class="title">
              VLCC ERP Portal
            </div>

            <div class="subtitle">
              Student Performance Report
            </div>
          </div>

          <div class="student">

            <div class="row">
              <span class="label">
                Student Name
              </span>

              <span class="value">
                ${student.studentName}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Student ID
              </span>

              <span class="value">
                ${student.studentId}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Course
              </span>

              <span class="value">
                ${student.course}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Batch
              </span>

              <span class="value">
                ${student.batch}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Branch
              </span>

              <span class="value">
                ${student.branch}
              </span>
            </div>

          </div>

          <div class="overall">
            <div>
              Overall Performance
            </div>

            <div class="score">
              ${student.overall}%
            </div>

            <div class="status">
              ${student.status}
            </div>
          </div>

          <div class="section">
            Performance Breakdown
          </div>

          <div class="student">

            <div class="row">
              <span class="label">
                Attendance
              </span>

              <span class="value">
                ${student.attendance}%
              </span>
            </div>

            <div class="row">
              <span class="label">
                Assignments
              </span>

              <span class="value">
                ${student.assignments}%
              </span>
            </div>

            <div class="row">
              <span class="label">
                Theory
              </span>

              <span class="value">
                ${student.theory}%
              </span>
            </div>

            <div class="row">
              <span class="label">
                Practical
              </span>

              <span class="value">
                ${student.practical}%
              </span>
            </div>

            <div class="row">
              <span class="label">
                Examination
              </span>

              <span class="value">
                ${student.examination}%
              </span>
            </div>

          </div>

          <div class="section">
            Performance Remarks
          </div>

          <div class="remark">
            ${student.remarks}
          </div>

          <div class="footer">
            This is a system-generated performance report
            from VLCC ERP Portal.
          </div>

        </body>
      </html>
    `;

    try {
      const result =
        await Print.printToFileAsync({
          html,
        });

      if (
        await Sharing.isAvailableAsync()
      ) {
        await Sharing.shareAsync(
          result.uri,
          {
            mimeType:
              'application/pdf',
            dialogTitle:
              'Performance Report',
          }
        );
      } else {
        Alert.alert(
          'PDF Generated',
          'The performance report has been generated.'
        );
      }
    } catch {
      Alert.alert(
        'PDF Error',
        'Unable to generate the performance report.'
      );
    }
  };

  const renderSummaryCard = (
    title: string,
    value: string,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    type:
      | 'purple'
      | 'blue'
      | 'green'
      | 'orange'
      | 'pink'
  ) => {
    const colors = {
      purple: {
        bg: '#F1EAFF',
        icon: '#7040D5',
      },
      blue: {
        bg: '#EAF2FF',
        icon: '#2675E8',
      },
      green: {
        bg: '#E7F8EF',
        icon: '#35B878',
      },
      orange: {
        bg: '#FFF1E2',
        icon: '#F7941D',
      },
      pink: {
        bg: '#FFE9F0',
        icon: '#E95386',
      },
    };

    return (
      <View
        style={[
          styles.summaryCard,
          {
            width:
              statCardWidth,
          },
        ]}
      >
        <View
          style={[
            styles.summaryIcon,
            {
              backgroundColor:
                colors[type].bg,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={
              isDesktop
                ? 21
                : 18
            }
            color={
              colors[type].icon
            }
          />
        </View>

        <Text
          style={
            styles.summaryTitle
          }
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text
          style={
            styles.summaryValue
          }
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {value}
        </Text>
      </View>
    );
  };

  const renderPerformanceCard = (
    student: PerformanceRecord
  ) => {
    const colors =
      getStatusColors(
        student.status
      );

    return (
      <View
        key={student.id}
        style={styles.performanceCard}
      >
        <View
          style={
            styles.cardTopRow
          }
        >
          <View
            style={
              styles.studentInfo
            }
          >
            <View
              style={styles.avatar}
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                {student.studentName
                  .split(' ')
                  .map(
                    (name) =>
                      name[0]
                  )
                  .join('')
                  .slice(0, 2)}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.studentName
                }
              >
                {
                  student.studentName
                }
              </Text>

              <Text
                style={
                  styles.studentId
                }
              >
                {
                  student.studentId
                }
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={
              styles.moreButton
            }
            onPress={() =>
              openActions(student)
            }
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color="#59657A"
            />
          </TouchableOpacity>
        </View>

        <View
          style={styles.courseBox}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.infoLabel
              }
            >
              Course
            </Text>

            <Text
              style={
                styles.infoValue
              }
              numberOfLines={1}
            >
              {student.course}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.infoLabel
              }
            >
              Batch
            </Text>

            <Text
              style={
                styles.infoValue
              }
              numberOfLines={1}
            >
              {student.batch}
            </Text>
          </View>
        </View>

        <View
          style={styles.scoreGrid}
        >
          <ScoreItem
            label="Attendance"
            value={
              student.attendance
            }
          />

          <ScoreItem
            label="Assignments"
            value={
              student.assignments
            }
          />

          <ScoreItem
            label="Theory"
            value={
              student.theory
            }
          />

          <ScoreItem
            label="Practical"
            value={
              student.practical
            }
          />
        </View>

        <View
          style={
            styles.overallBox
          }
        >
          <View>
            <Text
              style={
                styles.overallLabel
              }
            >
              Overall Performance
            </Text>

            <Text
              style={
                styles.overallValue
              }
            >
              {student.overall}%
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  colors.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {student.status}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.progressTrack
          }
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  student.overall,
                  100
                )}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingTop:
            insets.top,
        },
      ]}
    >
      {/* HEADER */}
      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          Performance
        </Text>

        <TouchableOpacity
          style={
            styles.addButton
          }
          onPress={() =>
            Alert.alert(
              'Performance',
              'Select a student from the performance records to update performance.'
            )
          }
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color="#7040D5"
          />

          <Text
            style={
              styles.addButtonText
            }
          >
            Add Performance
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom +
              30,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={
            styles.managementTitle
          }
        >
          Performance Management
        </Text>

        <Text
          style={
            styles.managementSubtitle
          }
        >
          Monitor student academic and practical performance
        </Text>

        {/* =========================
            STAT CARDS — 3 PER ROW
        ========================== */}

        <View
          style={
            styles.summaryGrid
          }
        >
          {renderSummaryCard(
            'Overall Performance',
            `${overallPerformance.toFixed(
              1
            )}%`,
            'chart-line',
            'purple'
          )}

          {renderSummaryCard(
            'Top Performers',
            String(
              topPerformers
            ),
            'trophy-outline',
            'green'
          )}

          {renderSummaryCard(
            'Needs Improvement',
            String(
              needsImprovement
            ),
            'alert-outline',
            'pink'
          )}

          {renderSummaryCard(
            'Average Attendance',
            `${averageAttendance.toFixed(
              1
            )}%`,
            'calendar-check-outline',
            'blue'
          )}

          {renderSummaryCard(
            'Average Assignment Score',
            `${averageAssignments.toFixed(
              1
            )}%`,
            'clipboard-check-outline',
            'orange'
          )}

          {renderSummaryCard(
            'Average Exam Score',
            `${averageExamination.toFixed(
              1
            )}%`,
            'school-outline',
            'purple'
          )}
        </View>

        {/* SEARCH */}

        <View
          style={styles.searchBox}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={21}
            color="#8B95A7"
          />

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Search student, ID, course, batch..."
            placeholderTextColor="#A2AABB"
            style={
              styles.searchInput
            }
          />

          {search.length >
            0 && (
            <TouchableOpacity
              onPress={() =>
                setSearch('')
              }
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={19}
                color="#A2AABB"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTERS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {[
            'All',
            'Excellent',
            'Good',
            'Average',
            'Needs Improvement',
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() =>
                setActiveFilter(
                  filter as
                    | 'All'
                    | PerformanceStatus
                )
              }
              style={[
                styles.filterButton,
                activeFilter ===
                  filter &&
                  styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter ===
                    filter &&
                    styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LIST HEADER */}

        <View
          style={
            styles.listHeader
          }
        >
          <Text
            style={
              styles.listTitle
            }
          >
            Student Performance
          </Text>

          <Text
            style={
              styles.recordCount
            }
          >
            {
              filteredPerformance.length
            }{' '}
            Records
          </Text>
        </View>

        {filteredPerformance.length ===
        0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={42}
              color="#A7AFBD"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No performance records found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          filteredPerformance.map(
            renderPerformanceCard
          )
        )}
      </ScrollView>

      {/* =========================
          ACTION MODAL
      ========================== */}

      <Modal
        visible={
          actionModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setActionModalVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setActionModalVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.actionModal
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Performance Actions
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedStudent?.studentName
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setActionModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            <ActionButton
              icon="eye-outline"
              color="#7040D5"
              text="View Performance"
              onPress={() => {
                setActionModalVisible(
                  false
                );
                setViewModalVisible(
                  true
                );
              }}
            />

            <ActionButton
              icon="pencil-outline"
              color="#2675E8"
              text="Edit Performance"
              onPress={() => {
                if (
                  selectedStudent
                ) {
                  openEditModal(
                    selectedStudent
                  );
                }
              }}
            />

            <ActionButton
              icon="calendar-check-outline"
              color="#35B878"
              text="View Attendance"
              onPress={() => {
                setActionModalVisible(
                  false
                );

                Alert.alert(
                  'Attendance',
                  `${selectedStudent?.studentName} has ${selectedStudent?.attendance}% attendance.`
                );
              }}
            />

            <ActionButton
              icon="clipboard-check-outline"
              color="#F7941D"
              text="View Assignments"
              onPress={() => {
                setActionModalVisible(
                  false
                );

                Alert.alert(
                  'Assignments',
                  `${selectedStudent?.studentName} has an assignment score of ${selectedStudent?.assignments}%.`
                );
              }}
            />

            <ActionButton
              icon="school-outline"
              color="#7040D5"
              text="View Examination Results"
              onPress={() => {
                setActionModalVisible(
                  false
                );

                Alert.alert(
                  'Examination Results',
                  `${selectedStudent?.studentName} has an examination score of ${selectedStudent?.examination}%.`
                );
              }}
            />

            <ActionButton
              icon="file-pdf-box"
              color="#E95386"
              text="Download Performance Report PDF"
              onPress={() => {
                setActionModalVisible(
                  false
                );

                if (
                  selectedStudent
                ) {
                  downloadPerformancePDF(
                    selectedStudent
                  );
                }
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          VIEW PERFORMANCE MODAL
      ========================== */}

      <Modal
        visible={
          viewModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setViewModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.largeModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Performance Details
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedStudent?.studentName
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setViewModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.detailStudentBox
                  }
                >
                  <View
                    style={
                      styles.largeAvatar
                    }
                  >
                    <Text
                      style={
                        styles.largeAvatarText
                      }
                    >
                      {selectedStudent.studentName
                        .split(' ')
                        .map(
                          (name) =>
                            name[0]
                        )
                        .join('')
                        .slice(0, 2)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.detailStudentName
                      }
                    >
                      {
                        selectedStudent.studentName
                      }
                    </Text>

                    <Text
                      style={
                        styles.detailStudentId
                      }
                    >
                      {
                        selectedStudent.studentId
                      }
                    </Text>

                    <Text
                      style={
                        styles.detailStudentCourse
                      }
                    >
                      {
                        selectedStudent.course
                      }
                    </Text>
                  </View>
                </View>

                {/* OVERALL */}

                <View
                  style={
                    styles.overallDetailCard
                  }
                >
                  <View
                    style={
                      styles.scoreCircle
                    }
                  >
                    <Text
                      style={
                        styles.scoreCircleValue
                      }
                    >
                      {
                        selectedStudent.overall
                      }%
                    </Text>

                    <Text
                      style={
                        styles.scoreCircleLabel
                      }
                    >
                      Overall
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.detailOverallTitle
                      }
                    >
                      Overall Performance
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColors(
                              selectedStudent.status
                            ).bg,
                          alignSelf:
                            'flex-start',
                          marginTop: 8,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              getStatusColors(
                                selectedStudent.status
                              ).text,
                          },
                        ]}
                      >
                        {
                          selectedStudent.status
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Performance Breakdown
                </Text>

                <PerformanceProgress
                  label="Attendance"
                  value={
                    selectedStudent.attendance
                  }
                />

                <PerformanceProgress
                  label="Assignments"
                  value={
                    selectedStudent.assignments
                  }
                />

                <PerformanceProgress
                  label="Theory"
                  value={
                    selectedStudent.theory
                  }
                />

                <PerformanceProgress
                  label="Practical"
                  value={
                    selectedStudent.practical
                  }
                />

                <PerformanceProgress
                  label="Examination"
                  value={
                    selectedStudent.examination
                  }
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Performance Remarks
                </Text>

                <View
                  style={
                    styles.remarksBox
                  }
                >
                  <MaterialCommunityIcons
                    name="comment-text-outline"
                    size={19}
                    color="#7040D5"
                  />

                  <Text
                    style={
                      styles.remarksText
                    }
                  >
                    {
                      selectedStudent.remarks
                    }
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={() =>
                    downloadPerformancePDF(
                      selectedStudent
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="file-pdf-box"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Download Performance Report
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================
          EDIT PERFORMANCE MODAL
      ========================== */}

      <Modal
        visible={
          editModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setEditModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.largeModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Edit Performance
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedStudent?.studentName
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setEditModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.editStudentBox
                  }
                >
                  <Text
                    style={
                      styles.editStudentName
                    }
                  >
                    {
                      selectedStudent.studentName
                    }
                  </Text>

                  <Text
                    style={
                      styles.editStudentId
                    }
                  >
                    {
                      selectedStudent.studentId
                    }
                  </Text>
                </View>

                <ScoreInput
                  label="Attendance (%)"
                  value={attendance}
                  onChangeText={
                    setAttendance
                  }
                />

                <ScoreInput
                  label="Assignments (%)"
                  value={assignments}
                  onChangeText={
                    setAssignments
                  }
                />

                <ScoreInput
                  label="Theory (%)"
                  value={theory}
                  onChangeText={
                    setTheory
                  }
                />

                <ScoreInput
                  label="Practical (%)"
                  value={practical}
                  onChangeText={
                    setPractical
                  }
                />

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Remarks
                </Text>

                <TextInput
                  value={remarks}
                  onChangeText={
                    setRemarks
                  }
                  placeholder="Enter performance remarks"
                  placeholderTextColor="#A2AABB"
                  multiline
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                />

                <View
                  style={
                    styles.calculationHint
                  }
                >
                  <MaterialCommunityIcons
                    name="calculator-variant-outline"
                    size={18}
                    color="#7040D5"
                  />

                  <Text
                    style={
                      styles.calculationHintText
                    }
                  >
                    Overall performance is calculated using
                    attendance, assignments, theory and
                    practical scores.
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={
                    savePerformance
                  }
                >
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Save Performance
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ScoreItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View
      style={styles.scoreItem}
    >
      <Text
        style={styles.scoreLabel}
        numberOfLines={1}
      >
        {label}
      </Text>

      <Text
        style={styles.scoreValue}
      >
        {value}%
      </Text>
    </View>
  );
}

function PerformanceProgress({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View
      style={
        styles.performanceProgress
      }
    >
      <View
        style={
          styles.performanceProgressHeader
        }
      >
        <Text
          style={
            styles.performanceProgressLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.performanceProgressValue
          }
        >
          {value}%
        </Text>
      </View>

      <View
        style={
          styles.progressTrack
        }
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(
                value,
                100
              )}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

function ScoreInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (
    value: string
  ) => void;
}) {
  return (
    <View>
      <Text
        style={styles.inputLabel}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        keyboardType="decimal-pad"
        placeholder="Enter score 0 - 100"
        placeholderTextColor="#A2AABB"
        style={styles.input}
      />
    </View>
  );
}

function ActionButton({
  icon,
  color,
  text,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor:
              `${color}18`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text
        style={styles.actionText}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    minHeight: 64,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 17,
  },

  addButton: {
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  addButtonText: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  managementTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#172033',
  },

  managementSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#7B8496',
    marginBottom: 16,
  },

  /* =========================
     3 STAT CARDS PER ROW
  ========================== */

  summaryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  summaryCard: {
    height: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 11,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryTitle: {
    fontFamily: 'PoppinsMedium',
    color: '#7B8496',
    fontSize: 8.8,
    lineHeight: 12,
    marginTop: 3,
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 13.5,
    marginTop: 1,
  },

  searchBox: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E9ECF2',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#172033',
    marginLeft: 8,
  },

  filterContainer: {
    gap: 8,
    paddingBottom: 15,
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#687386',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  listTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  recordCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#8A93A4',
  },

  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#7040D5',
    fontFamily: 'PoppinsBold',
    fontSize: 12,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 13,
  },

  studentId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9.5,
    marginTop: 1,
  },

  moreButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  courseBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    padding: 10,
    marginTop: 13,
  },

  infoLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
  },

  infoValue: {
    fontFamily: 'PoppinsMedium',
    color: '#313B4E',
    fontSize: 10,
    marginTop: 2,
  },

  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },

  scoreItem: {
    width: '23%',
    minHeight: 54,
    backgroundColor: '#F8F9FC',
    borderRadius: 9,
    padding: 8,
    justifyContent: 'space-between',
  },

  scoreLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 7.5,
  },

  scoreValue: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 11,
  },

  overallBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1EAFF',
    borderRadius: 11,
    padding: 11,
  },

  overallLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#7B8496',
    fontSize: 8.5,
  },

  overallValue: {
    fontFamily: 'PoppinsBold',
    color: '#7040D5',
    fontSize: 17,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#ECEEF4',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#7040D5',
    borderRadius: 20,
  },

  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#59657A',
    fontSize: 13,
    marginTop: 10,
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    color: '#9AA2B1',
    fontSize: 10,
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(20, 24, 35, 0.48)',
    justifyContent: 'flex-end',
  },

  actionModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 28,
  },

  largeModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '92%',
    padding: 18,
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },

  modalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8A93A4',
    marginTop: 2,
  },

  actionItem: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    gap: 11,
  },

  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#313B4E',
  },

  detailStudentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 13,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },

  largeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  largeAvatarText: {
    fontFamily: 'PoppinsBold',
    color: '#7040D5',
    fontSize: 15,
  },

  detailStudentName: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 14,
  },

  detailStudentId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 10,
  },

  detailStudentCourse: {
    fontFamily: 'PoppinsMedium',
    color: '#7040D5',
    fontSize: 9.5,
    marginTop: 2,
  },

  overallDetailCard: {
    backgroundColor: '#F1EAFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  scoreCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreCircleValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#7040D5',
  },

  scoreCircleLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#8A93A4',
  },

  detailOverallTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 13,
    marginTop: 17,
    marginBottom: 10,
  },

  performanceProgress: {
    marginBottom: 11,
  },

  performanceProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  performanceProgressLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 9.5,
  },

  performanceProgressValue: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
    fontSize: 9.5,
  },

  remarksBox: {
    backgroundColor: '#F8F9FC',
    borderRadius: 11,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },

  remarksText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    color: '#59657A',
    fontSize: 9.5,
    lineHeight: 15,
  },

  primaryButton: {
    minHeight: 45,
    backgroundColor: '#7040D5',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 15,
    marginBottom: 5,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
  },

  editStudentBox: {
    backgroundColor: '#F1EAFF',
    borderRadius: 11,
    padding: 12,
    marginBottom: 8,
  },

  editStudentName: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 12,
  },

  editStudentId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9,
    marginTop: 2,
  },

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 9.5,
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    height: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    paddingHorizontal: 11,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    backgroundColor: '#FFFFFF',
  },

  textArea: {
    height: 75,
    paddingTop: 10,
    textAlignVertical: 'top',
  },

  calculationHint: {
    backgroundColor: '#F1EAFF',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },

  calculationHintText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    color: '#7040D5',
    fontSize: 8.8,
    lineHeight: 14,
  },
});