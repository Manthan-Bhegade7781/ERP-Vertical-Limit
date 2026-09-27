import React, { useEffect, useMemo, useState } from 'react';

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus = 'Present' | 'Absent';

type AttendanceRecord = {
  id: string;
  studentName: string;
  studentId: string;
  date: string;
  branch: string;
  stdSub: string;
  status: AttendanceStatus;
};

type StudentAttendance = {
  studentId: string;
  studentName: string;
  standardBatch: string;
  branch: string;
  totalClasses: number;
  present: number;
  absent: number;
};

/* =========================================================
   DATA
   Based on the Super Admin Attendance specification:
   Date, Branch, Class/Batch, Total Students, Present,
   Absent, Attendance Percentage and Attendance Records.
========================================================= */

const studentAttendance: StudentAttendance[] = [
  {
    studentId: 'STU001',
    studentName: 'Rahul Sharma',
    standardBatch: '12th / JEE 12th',
    branch: 'Pune',
    totalClasses: 30,
    present: 28,
    absent: 2,
  },
  {
    studentId: 'STU002',
    studentName: 'Priya Patil',
    standardBatch: '11th / NEET 11th',
    branch: 'Pune',
    totalClasses: 30,
    present: 29,
    absent: 1,
  },
  {
    studentId: 'STU003',
    studentName: 'Amit Kumar',
    standardBatch: '12th / MHT-CET 12th',
    branch: 'Mumbai',
    totalClasses: 30,
    present: 25,
    absent: 5,
  },
  {
    studentId: 'STU004',
    studentName: 'Sneha Joshi',
    standardBatch: '11th / JEE 11th',
    branch: 'Pune',
    totalClasses: 30,
    present: 27,
    absent: 3,
  },
  {
    studentId: 'STU005',
    studentName: 'Arjun Deshmukh',
    standardBatch: '10th / Foundation 10th',
    branch: 'Pune',
    totalClasses: 30,
    present: 26,
    absent: 4,
  },
  {
    studentId: 'STU006',
    studentName: 'Neha Kulkarni',
    standardBatch: '12th / NEET 12th',
    branch: 'Mumbai',
    totalClasses: 30,
    present: 29,
    absent: 1,
  },
];

const attendanceRecords: AttendanceRecord[] = [
  {
    id: 'ATT001',
    studentName: 'Rahul Sharma',
    studentId: 'STU001',
    date: '20 Sep 2026',
    branch: 'Pune',
    stdSub: '12th / JEE 12th',
    status: 'Present',
  },
  {
    id: 'ATT002',
    studentName: 'Priya Patil',
    studentId: 'STU002',
    date: '20 Sep 2026',
    branch: 'Pune',
    stdSub: '11th / NEET 11th',
    status: 'Present',
  },
  {
    id: 'ATT003',
    studentName: 'Amit Kumar',
    studentId: 'STU003',
    date: '20 Sep 2026',
    branch: 'Mumbai',
    stdSub: '12th / MHT-CET 12th',
    status: 'Absent',
  },
  {
    id: 'ATT004',
    studentName: 'Sneha Joshi',
    studentId: 'STU004',
    date: '20 Sep 2026',
    branch: 'Pune',
    stdSub: '11th / JEE 11th',
    status: 'Present',
  },
  {
    id: 'ATT005',
    studentName: 'Arjun Deshmukh',
    studentId: 'STU005',
    date: '20 Sep 2026',
    branch: 'Pune',
    stdSub: '10th / Foundation 10th',
    status: 'Present',
  },
  {
    id: 'ATT006',
    studentName: 'Neha Kulkarni',
    studentId: 'STU006',
    date: '20 Sep 2026',
    branch: 'Mumbai',
    stdSub: '12th / NEET 12th',
    status: 'Present',
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function AttendancePage() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceRecord | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [individualAttendanceVisible, setIndividualAttendanceVisible] =
    useState(false);
  const [selectedStudentAttendance, setSelectedStudentAttendance] =
    useState<StudentAttendance | null>(null);

  /* =======================================================
     ANDROID NAVIGATION BAR
  ======================================================= */

  useEffect(() => {
    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('transparent');
        await NavigationBar.setButtonStyleAsync('dark');
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      } catch (error) {
        console.log(
          'Navigation bar configuration error:',
          error,
        );
      }
    };

    configureNavigationBar();
  }, []);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalStudents = 48;
  const presentStudents = 45;
  const absentStudents = 3;

  const attendancePercentage =
    Math.round((presentStudents / totalStudents) * 100);

  /* =======================================================
     FILTER
  ======================================================= */

  const filters = [
    'All',
    'Pune',
    'Mumbai',
    'Present',
    'Absent',
  ];

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attendanceRecords.filter((record) => {
      const matchesSearch =
        !query ||
        record.studentName.toLowerCase().includes(query) ||
        record.studentId.toLowerCase().includes(query) ||
        record.branch.toLowerCase().includes(query) ||
        record.stdSub.toLowerCase().includes(query) ||
        record.date.toLowerCase().includes(query);

      const matchesFilter =
        selectedFilter === 'All' ||
        record.branch === selectedFilter ||
        record.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter]);

  /* =======================================================
     VIEW
  ======================================================= */

  const handleView = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setViewVisible(true);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setEditVisible(true);
  };

  const handleIndividualAttendance = (
    student: StudentAttendance,
  ) => {
    setSelectedStudentAttendance(student);
    setIndividualAttendanceVisible(true);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right']}
    >
      <StatusBar
        style="light"
        backgroundColor="#6D35D8"
        translucent={false}
      />

      <View style={styles.container}>

        {/* =================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            Attendance
          </Text>

          <TouchableOpacity
            style={styles.addHeaderButton}
            onPress={() => router.push('/(admin)/add-attendance' as never)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add Attendance"
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color="#7040D5"
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            CONTENT
        ================================================== */}

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            isDesktop && styles.contentDesktop,
          ]}
        >

          {/* PAGE HEADING */}

          <View style={styles.headingBlock}>
            <Text style={styles.pageTitle}>
              Attendance Management
            </Text>

            <Text style={styles.pageSubtitle}>
              View attendance by date, branch and class or batch.
            </Text>
          </View>

          {/* =================================================
              SUMMARY CARDS
          ================================================== */}

          <ScrollView
            horizontal={!isDesktop}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.summaryRow,
              !isDesktop && styles.summaryRowMobile,
            ]}
            style={!isDesktop ? styles.summaryScroll : undefined}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryMain}>
                <View
                  style={[
                    styles.summaryIcon,
                    styles.summaryPurple,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={20}
                    color="#7040D5"
                  />
                </View>

                <View style={styles.summaryTextBlock}>
                  <Text
                    style={styles.summaryLabel}
                    numberOfLines={1}
                  >
                    Total Students
                  </Text>

                  <Text style={styles.summaryValue}>
                    {totalStudents}
                  </Text>
                </View>
              </View>

            </View>

            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIcon,
                  styles.summaryGreen,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-check-outline"
                  size={20}
                  color="#35B878"
                />
              </View>

              <View>
                <Text style={styles.summaryLabel}>
                  Present
                </Text>

                <Text style={styles.summaryValue}>
                  {presentStudents}
                </Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIcon,
                  styles.summaryOrange,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-remove-outline"
                  size={20}
                  color="#F7941D"
                />
              </View>

              <View>
                <Text style={styles.summaryLabel}>
                  Absent
                </Text>

                <Text style={styles.summaryValue}>
                  {absentStudents}
                </Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIcon,
                  styles.summaryBlue,
                ]}
              >
                <MaterialCommunityIcons
                  name="percent-outline"
                  size={20}
                  color="#2675E8"
                />
              </View>

              <View>
                <Text style={styles.summaryLabel}>
                  Attendance
                </Text>

                <Text style={styles.summaryValue}>
                  {attendancePercentage}%
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* =================================================
              INDIVIDUAL ATTENDANCE
          ================================================== */}

          <View style={styles.individualCard}>
            <View style={styles.individualHeader}>
              <View style={styles.individualIcon}>
                <MaterialCommunityIcons
                  name="account-details-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <View style={styles.individualHeaderText}>
                <Text style={styles.individualTitle}>
                  Check Individual Attendance
                </Text>

                <Text style={styles.individualSubtitle}>
                  Check attendance student-by-student.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkAllButton}
                onPress={() =>
                  handleIndividualAttendance(
                    studentAttendance[0],
                  )
                }
                activeOpacity={0.8}
              >
                <Text style={styles.checkAllButtonText}>
                  Check
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.studentAttendanceRow}
            >
              {studentAttendance.map((student) => {
                const percentage = Math.round(
                  (student.present / student.totalClasses) * 100,
                );

                return (
                  <TouchableOpacity
                    key={student.studentId}
                    style={styles.studentAttendanceChip}
                    onPress={() =>
                      handleIndividualAttendance(student)
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.chipIcon}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={17}
                        color="#7040D5"
                      />
                    </View>

                    <View style={styles.chipText}>
                      <Text
                        style={styles.chipName}
                        numberOfLines={1}
                      >
                        {student.studentName}
                      </Text>

                      <Text style={styles.chipMeta}>
                        {percentage}% • {student.present}/
                        {student.totalClasses}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* =================================================
              SEARCH / FILTER
          ================================================== */}

          <View style={styles.searchCard}>

            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={19}
                color="#8792A4"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search student, branch or batch..."
                placeholderTextColor="#A1A9B7"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={18}
                    color="#9AA4B2"
                  />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {filters.map((filter) => {
                const active =
                  selectedFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      active &&
                        styles.filterButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedFilter(filter)
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active &&
                          styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* =================================================
              ATTENDANCE OVERVIEW
          ================================================== */}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Attendance Records
              </Text>

              <Text style={styles.sectionSubtitle}>
                {filteredRecords.length} records found
              </Text>
            </View>
          </View>

          {/* =================================================
              RECORD CARDS
          ================================================== */}

          {filteredRecords.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordCard}
              activeOpacity={0.9}
              onPress={() => handleView(record)}
            >

              <View style={styles.recordTopRow}>

                <View style={styles.studentIcon}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={22}
                    color="#7040D5"
                  />
                </View>

                <View style={styles.studentInfo}>
                  <Text
                    style={styles.studentName}
                    numberOfLines={1}
                  >
                    {record.studentName}
                  </Text>

                  <Text style={styles.studentId}>
                    {record.studentId}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    record.status === 'Present'
                      ? styles.presentBadge
                      : styles.absentBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      record.status === 'Present'
                        ? styles.presentText
                        : styles.absentText,
                    ]}
                  >
                    {record.status}
                  </Text>
                </View>

              </View>

              <View style={styles.detailsGrid}>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    DATE
                  </Text>

                  <Text style={styles.detailValue}>
                    {record.date}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    BRANCH
                  </Text>

                  <Text
                    style={styles.detailValue}
                    numberOfLines={1}
                  >
                    {record.branch}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    STD / SUB
                  </Text>

                  <Text
                    style={styles.detailValue}
                    numberOfLines={1}
                  >
                    {record.stdSub}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    STATUS
                  </Text>

                  <Text
                    style={[
                      styles.detailValue,
                      record.status === 'Present'
                        ? styles.presentValue
                        : styles.absentValue,
                    ]}
                  >
                    {record.status}
                  </Text>
                </View>



              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(record)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={15}
                    color="#7040D5"
                  />

                  <Text style={styles.editButtonText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleView(record)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={15}
                    color="#7040D5"
                  />

                  <Text style={styles.viewButtonText}>
                    View
                  </Text>
                </TouchableOpacity>
              </View>

            </TouchableOpacity>
          ))}

          {filteredRecords.length === 0 && (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="calendar-remove-outline"
                size={34}
                color="#A5AFBE"
              />

              <Text style={styles.emptyTitle}>
                No attendance records found
              </Text>

              <Text style={styles.emptySubtitle}>
                Try changing the search or filter.
              </Text>
            </View>
          )}

        </ScrollView>

        {/* =================================================
            EDIT ATTENDANCE MODAL
        ================================================== */}

        <Modal
          visible={editVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Edit Attendance
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Update attendance record
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setEditVisible(false)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#6F7D90"
                  />
                </TouchableOpacity>
              </View>

              {selectedRecord && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalContent}
                >
                  <View style={styles.editStudentHeader}>
                    <View style={styles.modalStudentIcon}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={26}
                        color="#7040D5"
                      />
                    </View>

                    <View style={styles.modalStudentInfo}>
                      <Text style={styles.modalStudentName}>
                        {selectedRecord.studentName}
                      </Text>

                      <Text style={styles.modalStudentId}>
                        {selectedRecord.studentId}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>
                      DATE
                    </Text>
                    <TextInput
                      defaultValue={selectedRecord.date}
                      style={styles.editInput}
                    />
                  </View>

                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>
                      BRANCH
                    </Text>
                    <TextInput
                      defaultValue={selectedRecord.branch}
                      style={styles.editInput}
                    />
                  </View>

                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>
                      STD / SUB
                    </Text>
                    <TextInput
                      defaultValue={selectedRecord.stdSub}
                      style={styles.editInput}
                    />
                  </View>

                  <Text style={styles.editLabel}>
                    ATTENDANCE STATUS
                  </Text>

                  <View style={styles.editStatusRow}>
                    <TouchableOpacity
                      style={[
                        styles.editStatusButton,
                        selectedRecord.status === 'Present' &&
                          styles.editStatusActive,
                      ]}
                      onPress={() => {
                        if (selectedRecord) {
                          setSelectedRecord({
                            ...selectedRecord,
                            status: 'Present',
                          });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.editStatusText,
                          selectedRecord.status === 'Present' &&
                            styles.editStatusActiveText,
                        ]}
                      >
                        Present
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.editStatusButton,
                        selectedRecord.status === 'Absent' &&
                          styles.editAbsentActive,
                      ]}
                      onPress={() => {
                        if (selectedRecord) {
                          setSelectedRecord({
                            ...selectedRecord,
                            status: 'Absent',
                          });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.editStatusText,
                          selectedRecord.status === 'Absent' &&
                            styles.editAbsentActiveText,
                        ]}
                      >
                        Absent
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setEditVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalButtonText}>
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* =================================================
            INDIVIDUAL ATTENDANCE MODAL
        ================================================== */}

        <Modal
          visible={individualAttendanceVisible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setIndividualAttendanceVisible(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Individual Attendance
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Complete attendance summary
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() =>
                    setIndividualAttendanceVisible(false)
                  }
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#6F7D90"
                  />
                </TouchableOpacity>
              </View>

              {selectedStudentAttendance && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalContent}
                >
                  <View style={styles.modalStudent}>
                    <View style={styles.modalStudentIcon}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={26}
                        color="#7040D5"
                      />
                    </View>

                    <View style={styles.modalStudentInfo}>
                      <Text style={styles.modalStudentName}>
                        {selectedStudentAttendance.studentName}
                      </Text>

                      <Text style={styles.modalStudentId}>
                        {selectedStudentAttendance.studentId}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.individualModalCourse}>
                    <Text style={styles.modalLabel}>
                      STANDARD / BATCH
                    </Text>

                    <Text style={styles.modalValue}>
                      {selectedStudentAttendance.standardBatch}
                    </Text>
                  </View>

                  <View style={styles.individualModalCourse}>
                    <Text style={styles.modalLabel}>
                      BRANCH
                    </Text>

                    <Text style={styles.modalValue}>
                      {selectedStudentAttendance.branch}
                    </Text>
                  </View>

                  <View style={styles.attendanceStatsGrid}>
                    <View style={styles.attendanceStatBox}>
                      <Text style={styles.attendanceStatLabel}>
                        TOTAL CLASSES
                      </Text>

                      <Text style={styles.attendanceStatValue}>
                        {selectedStudentAttendance.totalClasses}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.attendanceStatBox,
                        styles.attendancePresentBox,
                      ]}
                    >
                      <Text style={styles.attendanceStatLabel}>
                        PRESENT
                      </Text>

                      <Text
                        style={[
                          styles.attendanceStatValue,
                          styles.presentValue,
                        ]}
                      >
                        {selectedStudentAttendance.present}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.attendanceStatBox,
                        styles.attendanceAbsentBox,
                      ]}
                    >
                      <Text style={styles.attendanceStatLabel}>
                        ABSENT
                      </Text>

                      <Text
                        style={[
                          styles.attendanceStatValue,
                          styles.absentValue,
                        ]}
                      >
                        {selectedStudentAttendance.absent}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.attendanceStatBox,
                        styles.attendancePercentageBox,
                      ]}
                    >
                      <Text style={styles.attendanceStatLabel}>
                        ATTENDANCE
                      </Text>

                      <Text
                        style={[
                          styles.attendanceStatValue,
                          styles.attendancePercentageText,
                        ]}
                      >
                        {Math.round(
                          (selectedStudentAttendance.present /
                            selectedStudentAttendance.totalClasses) *
                            100,
                        )}
                        %
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.historyTitle}>
                    Attendance History
                  </Text>

                  {[
                    ['20 Sep 2026', 'Present'],
                    ['19 Sep 2026', 'Present'],
                    ['18 Sep 2026', 'Absent'],
                    ['17 Sep 2026', 'Present'],
                    ['16 Sep 2026', 'Present'],
                  ].map(([date, status]) => (
                    <View
                      key={date}
                      style={styles.historyRow}
                    >
                      <View>
                        <Text style={styles.historyDate}>
                          {date}
                        </Text>

                        <Text style={styles.historyLabel}>
                          Attendance record
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.historyStatus,
                          status === 'Present'
                            ? styles.presentBadge
                            : styles.absentBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            status === 'Present'
                              ? styles.presentText
                              : styles.absentText,
                          ]}
                        >
                          {status}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() =>
                      setIndividualAttendanceVisible(false)
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalButtonText}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* =================================================
            VIEW MODAL
        ================================================== */}

        <Modal
          visible={viewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Attendance Details
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Attendance record information
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setViewVisible(false)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#6F7D90"
                  />
                </TouchableOpacity>
              </View>

              {selectedRecord && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={
                    styles.modalContent
                  }
                >
                  <View style={styles.modalStudent}>
                    <View style={styles.modalStudentIcon}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={26}
                        color="#7040D5"
                      />
                    </View>

                    <View>
                      <Text style={styles.modalStudentName}>
                        {selectedRecord.studentName}
                      </Text>

                      <Text style={styles.modalStudentId}>
                        {selectedRecord.studentId}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalDetailsGrid}>

                    <View style={styles.modalDetail}>
                      <Text style={styles.modalLabel}>
                        DATE
                      </Text>
                      <Text style={styles.modalValue}>
                        {selectedRecord.date}
                      </Text>
                    </View>

                    <View style={styles.modalDetail}>
                      <Text style={styles.modalLabel}>
                        BRANCH
                      </Text>
                      <Text style={styles.modalValue}>
                        {selectedRecord.branch}
                      </Text>
                    </View>

                    <View style={styles.modalDetail}>
                      <Text style={styles.modalLabel}>
                        STD / SUB
                      </Text>
                      <Text style={styles.modalValue}>
                        {selectedRecord.stdSub}
                      </Text>
                    </View>

                    <View style={styles.modalDetail}>
                      <Text style={styles.modalLabel}>
                        STATUS
                      </Text>
                      <Text
                        style={[
                          styles.modalValue,
                          selectedRecord.status ===
                            'Present'
                            ? styles.presentValue
                            : styles.absentValue,
                        ]}
                      >
                        {selectedRecord.status}
                      </Text>
                    </View>

                  </View>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setViewVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalButtonText}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}

            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },

  contentDesktop: {
    paddingHorizontal: 28,
  },

  /* HEADER */

  header: {
    height: 64,
    backgroundColor: '#6D35D8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 25,
    color: '#FFFFFF',
  },

  addHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },

  /* PAGE HEADING */

  headingBlock: {
    marginBottom: 14,
  },

  pageTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 25,
    color: '#172033',
  },

  pageSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 15,
    color: '#7B8498',
  },

  /* SUMMARY */

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    paddingRight: 2,
    marginBottom: 14,
  },

  summaryRowMobile: {
    flexDirection: 'row',
  },

  summaryScroll: {
    marginBottom: 0,
  },

  summaryCard: {
    width: 180,
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryPurple: {
    backgroundColor: '#F1EAFF',
  },

  summaryGreen: {
    backgroundColor: '#E7F8EF',
  },

  summaryOrange: {
    backgroundColor: '#FFF1E2',
  },

  summaryBlue: {
    backgroundColor: '#EAF2FF',
  },

  summaryLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 13,
    color: '#7B8498',
  },

  summaryValue: {
    marginTop: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 17,
    lineHeight: 21,
    color: '#172033',
  },

  /* EDIT ATTENDANCE */

  editButton: {
    height: 30,
    borderRadius: 8,
    paddingHorizontal: 11,
    marginRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F1EAFF',
  },

  editButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
  },

  editStudentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  modalStudentInfo: {
    flex: 1,
    minWidth: 0,
  },

  editField: {
    marginBottom: 12,
  },

  editLabel: {
    marginBottom: 5,
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#66768A',
  },

  editInput: {
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    paddingHorizontal: 11,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#202B3E',
    backgroundColor: '#FFFFFF',
  },

  editStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    marginBottom: 16,
  },

  editStatusButton: {
    height: 38,
    flex: 1,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editStatusActive: {
    backgroundColor: '#E7F8EF',
    borderColor: '#35B878',
  },

  editAbsentActive: {
    backgroundColor: '#FFF1E2',
    borderColor: '#F7941D',
  },

  editStatusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7B8498',
  },

  editStatusActiveText: {
    color: '#279965',
  },

  editAbsentActiveText: {
    color: '#D77A0A',
  },

  /* INDIVIDUAL ATTENDANCE */

  summaryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  summaryTextBlock: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
  },

  summaryAction: {
    height: 28,
    borderRadius: 8,
    paddingHorizontal: 7,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  summaryActionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#7040D5',
  },

  individualCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  individualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  individualIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  individualHeaderText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  individualTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#202B3E',
  },

  individualSubtitle: {
    marginTop: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#7B8498',
  },

  checkAllButton: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 11,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkAllButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#FFFFFF',
  },

  studentAttendanceRow: {
    gap: 8,
    paddingTop: 11,
    paddingBottom: 1,
  },

  studentAttendanceChip: {
    width: 170,
    minHeight: 54,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    backgroundColor: '#F7F8FC',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  chipIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
  },

  chipName: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#202B3E',
  },

  chipMeta: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#7B8498',
  },

  individualModalCourse: {
    marginBottom: 12,
  },

  attendanceStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 16,
  },

  attendanceStatBox: {
    width: '48%',
    minHeight: 68,
    borderRadius: 10,
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 10,
    justifyContent: 'center',
  },

  attendancePresentBox: {
    backgroundColor: '#E7F8EF',
  },

  attendanceAbsentBox: {
    backgroundColor: '#FFF1E2',
  },

  attendancePercentageBox: {
    backgroundColor: '#EAF2FF',
  },

  attendanceStatLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#7B8498',
  },

  attendanceStatValue: {
    marginTop: 3,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: '#172033',
  },

  attendancePercentageText: {
    color: '#2675E8',
  },

  historyTitle: {
    marginBottom: 8,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
  },

  historyRow: {
    minHeight: 50,
    paddingHorizontal: 10,
    marginBottom: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  historyDate: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#202B3E',
  },

  historyLabel: {
    marginTop: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8792A4',
  },

  historyStatus: {
    minWidth: 64,
    height: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SEARCH */

  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 12,
    marginBottom: 18,
  },

  searchBox: {
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#202B3E',
  },

  filterRow: {
    gap: 7,
    paddingTop: 10,
    paddingBottom: 1,
  },

  filterButton: {
    height: 36,
    borderRadius: 9,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#7B8498',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* SECTION */

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    lineHeight: 20,
    color: '#172033',
  },

  sectionSubtitle: {
    marginTop: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 15,
    color: '#7B8498',
  },

  /* RECORD CARD */

  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 13,
    marginBottom: 10,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    lineHeight: 17,
    color: '#202B3E',
  },

  studentId: {
    marginTop: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 13,
    color: '#8792A4',
  },

  statusBadge: {
    minWidth: 64,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },

  presentBadge: {
    backgroundColor: '#E7F8EF',
  },

  absentBadge: {
    backgroundColor: '#FFF1E2',
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
  },

  presentText: {
    color: '#279965',
  },

  absentText: {
    color: '#D77A0A',
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
  },

  detailItem: {
    width: '50%',
    paddingRight: 8,
    marginBottom: 9,
  },

  detailLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    lineHeight: 13,
    color: '#8A98A9',
  },

  detailValue: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    lineHeight: 16,
    color: '#202B3E',
  },

  presentValue: {
    color: '#279965',
    fontFamily: 'PoppinsMedium',
  },

  absentValue: {
    color: '#D77A0A',
    fontFamily: 'PoppinsMedium',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 1,
  },

  viewButton: {
    height: 30,
    borderRadius: 8,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F1EAFF',
  },

  viewButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
  },

  /* EMPTY */

  emptyCard: {
    minHeight: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  emptyTitle: {
    marginTop: 10,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#202B3E',
  },

  emptySubtitle: {
    marginTop: 3,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8792A4',
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23,32,51,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },

  modalHeader: {
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    lineHeight: 21,
    color: '#172033',
  },

  modalSubtitle: {
    marginTop: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#7B8498',
  },

  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContent: {
    padding: 18,
    paddingBottom: 20,
  },

  modalStudent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  modalStudentIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  modalStudentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#202B3E',
  },

  modalStudentId: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8792A4',
  },

  modalDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  modalDetail: {
    width: '50%',
    marginBottom: 14,
    paddingRight: 8,
  },

  modalLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#8A98A9',
  },

  modalValue: {
    marginTop: 3,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    lineHeight: 16,
    color: '#202B3E',
  },

  modalButton: {
    height: 38,
    borderRadius: 9,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  modalButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});
