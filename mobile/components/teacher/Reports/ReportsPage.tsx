import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  fetchTeacherAssignedStudents,
  getReferenceId,
  getReferenceName,
} from '../../../services/students';

import type {
  TeacherStudentApiRecord,
} from '../../../services/students';

import {
  fetchStudentAttendanceSummary,
  fetchExaminations,
} from '../../../services/reports';

import type {
  StudentAttendanceSummary,
  Examination,
} from '../../../services/reports';

type ReportsPageProps = {
  studentId?: string;
  studentName?: string;
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

type ReportStudent = {
  id: string;
  studentCode: string;
  name: string;
  batchId: string;
  batchName: string;
  standard: string;
  subjects: string[];
};

const PURPLE = '#6428D7';

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';

const mapStudent = (
  record: TeacherStudentApiRecord,
): ReportStudent => {
  const user =
    record.userId && typeof record.userId === 'object'
      ? record.userId
      : undefined;

  const batch =
    record.batchId && typeof record.batchId === 'object'
      ? record.batchId
      : undefined;

  return {
    id: record._id,
    studentCode: record.studentId || '',
    name:
      user?.fullName ||
      user?.name ||
      'Unnamed student',
    batchId: getReferenceId(record.batchId),
    batchName: batch?.name || 'Batch not assigned',
    standard: batch?.standard || '',
    subjects: (record.teacherSubjects || []).map(
      (subject) => subject.name,
    ),
  };
};

export default function ReportsPage({
  studentId,
  studentName,
  onContentScroll,
  onBack,
}: ReportsPageProps) {
  const [students, setStudents] = useState<ReportStudent[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<ReportStudent | null>(null);

  const [attendance, setAttendance] =
    useState<StudentAttendanceSummary | null>(null);

  const [examinations, setExaminations] =
    useState<Examination[]>([]);

  const [search, setSearch] = useState('');

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const [studentError, setStudentError] = useState('');
  const [reportError, setReportError] = useState('');

  /*
   * Load only students assigned to the authenticated teacher.
   */
  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    setStudentError('');

    try {
      const response = await fetchTeacherAssignedStudents();

      const mappedStudents = response
        .map(mapStudent)
        .filter((student) => student.id);

      setStudents(mappedStudents);

      return mappedStudents;
    } catch (error) {
      setStudentError(getErrorMessage(error));
      return [];
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const result = await fetchTeacherAssignedStudents()
        .then((records) => records.map(mapStudent).filter((s) => s.id))
        .catch((error) => {
          if (mounted) {
            setStudentError(getErrorMessage(error));
          }
          return [];
        });

      if (!mounted) return;

      setStudents(result);
      setLoadingStudents(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Select the student passed from Students page.
   * Otherwise, show the teacher's student-selection list.
   */
  useEffect(() => {
    if (!studentId || students.length === 0) {
      if (!studentId) {
        setSelectedStudent(null);
      }
      return;
    }

    const matchedStudent = students.find(
      (student) => student.id === studentId,
    );

    if (matchedStudent) {
      setSelectedStudent(matchedStudent);
    } else {
      setSelectedStudent(null);
    }
  }, [studentId, students]);

  /*
   * Fetch real attendance and examination information.
   */
  useEffect(() => {
    if (!selectedStudent) {
      setAttendance(null);
      setExaminations([]);
      return;
    }

    let mounted = true;

    const loadReport = async () => {
      setLoadingReport(true);
      setReportError('');

      setAttendance(null);
      setExaminations([]);

      try {
        const [attendanceResult, examinationResult] =
          await Promise.all([
            fetchStudentAttendanceSummary(
              selectedStudent.id,
              selectedStudent.batchId || undefined,
            ),
            fetchExaminations(
              selectedStudent.batchId || undefined,
            ),
          ]);

        if (!mounted) return;

        setAttendance(attendanceResult);
        setExaminations(examinationResult);
      } catch (error) {
        if (mounted) {
          setReportError(getErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setLoadingReport(false);
        }
      }
    };

    loadReport();

    return () => {
      mounted = false;
    };
  }, [selectedStudent]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      [
        student.name,
        student.studentCode,
        student.batchName,
        student.standard,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [students, search]);

  const attendancePercentage =
    attendance?.percentage ?? 0;

  const openStudent = (student: ReportStudent) => {
    setSelectedStudent(student);
    setReportError('');
  };

  const backToStudents = () => {
    setSelectedStudent(null);
    setAttendance(null);
    setExaminations([]);
    setReportError('');
  };

  /*
   * STUDENT SELECTION SCREEN
   */
  if (!selectedStudent) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={onContentScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.pageHeader}>
            {onBack && (
              <Pressable
                style={styles.backButton}
                onPress={onBack}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back to Teacher Dashboard"
              >
                <Ionicons
                  name="arrow-back"
                  size={21}
                  color={PURPLE}
                />
              </Pressable>
            )}

            <View style={styles.headerIcon}>
              <Ionicons
                name="bar-chart-outline"
                size={27}
                color={PURPLE}
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.pageTitle}>
                Student Reports
              </Text>

              <Text style={styles.pageSubtitle}>
                Select a student to view their academic report
              </Text>
            </View>
          </View>

          <View style={styles.studentSummary}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="people-outline"
                size={23}
                color={PURPLE}
              />
            </View>

            <View>
              <Text style={styles.summaryValue}>
                {students.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Assigned Students
              </Text>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={19}
              color="#858996"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search student..."
              placeholderTextColor="#999999"
              style={styles.searchInput}
            />
          </View>

          <Text style={styles.sectionTitle}>
            Select Student
          </Text>

          <Text style={styles.sectionSubtitle}>
            Choose a student to view attendance and examination details.
          </Text>

          {loadingStudents ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={PURPLE}
              />

              <Text style={styles.loadingText}>
                Loading assigned students...
              </Text>
            </View>
          ) : studentError ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={38}
                color="#D64545"
              />

              <Text style={styles.emptyTitle}>
                Unable to load students
              </Text>

              <Text style={styles.emptySubtitle}>
                {studentError}
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={() => {
                  void loadStudents();
                }}
              >
                <Text style={styles.retryText}>
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : filteredStudents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={38}
                color="#A0A0A0"
              />

              <Text style={styles.emptyTitle}>
                No students found
              </Text>

              <Text style={styles.emptySubtitle}>
                No assigned students match your search.
              </Text>
            </View>
          ) : (
            <View style={styles.studentList}>
              {filteredStudents.map((student) => (
                <Pressable
                  key={student.id}
                  style={({ pressed }) => [
                    styles.studentCard,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => openStudent(student)}
                >
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentInitials}>
                      {student.name
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>
                      {student.name}
                    </Text>

                    <Text style={styles.studentId}>
                      {student.studentCode || 'Student ID unavailable'}
                    </Text>

                    <View style={styles.profileMeta}>
                      <Ionicons
                        name="school-outline"
                        size={13}
                        color="#858996"
                      />

                      <Text style={styles.profileMetaText}>
                        {student.batchName}
                      </Text>
                    </View>

                    {!!student.standard && (
                      <Text style={styles.studentStandard}>
                        {student.standard}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={21}
                    color={PURPLE}
                  />
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    );
  }

  /*
   * INDIVIDUAL STUDENT REPORT SCREEN
   */
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.pageHeader}>
          <Pressable
            style={styles.backButton}
            onPress={backToStudents}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={PURPLE}
            />
          </Pressable>

          <View style={styles.headerIcon}>
            <Ionicons
              name="bar-chart-outline"
              size={27}
              color={PURPLE}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>
              Student Report
            </Text>

            <Text style={styles.pageSubtitle}>
              Attendance and examination details
            </Text>
          </View>
        </View>

        <View style={styles.studentProfileCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentInitials}>
              {selectedStudent.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.studentProfileInfo}>
            <Text style={styles.studentName}>
              {selectedStudent.name}
            </Text>

            <Text style={styles.studentId}>
              Student ID: {selectedStudent.studentCode}
            </Text>

            <View style={styles.profileMeta}>
              <Ionicons
                name="school-outline"
                size={14}
                color="#6D7280"
              />

              <Text style={styles.profileMetaText}>
                {selectedStudent.batchName}
              </Text>
            </View>
          </View>
        </View>

        {loadingReport ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={PURPLE}
            />

            <Text style={styles.loadingText}>
              Loading student report...
            </Text>
          </View>
        ) : reportError ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={38}
              color="#D64545"
            />

            <Text style={styles.emptyTitle}>
              Unable to load report
            </Text>

            <Text style={styles.emptySubtitle}>
              {reportError}
            </Text>
          </View>
        ) : (
          <>
            {/* ATTENDANCE */}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Attendance
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Actual attendance from the backend
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
                    {attendancePercentage.toFixed(2)}%
                  </Text>
                </View>
              </View>

              {attendance ? (
                <>
                  <View style={styles.attendanceStats}>
                    <AttendanceStat
                      icon="checkmark"
                      label="Present"
                      value={attendance.present}
                      color="#27A566"
                      background="#E3F7EB"
                    />

                    <View style={styles.statDivider} />

                    <AttendanceStat
                      icon="close"
                      label="Absent"
                      value={attendance.absent}
                      color="#D64545"
                      background="#FDECEC"
                    />

                    <View style={styles.statDivider} />

                    <AttendanceStat
                      icon="calendar-outline"
                      label="Total"
                      value={attendance.totalDays}
                      color={PURPLE}
                      background="#EEE7FF"
                    />
                  </View>

                  <View style={styles.extraAttendanceStats}>
                    <Text style={styles.extraStat}>
                      Late: {attendance.late}
                    </Text>

                    <Text style={styles.extraStat}>
                      Leave: {attendance.leave}
                    </Text>
                  </View>

                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.max(0, attendancePercentage),
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </>
              ) : (
                <Text style={styles.noDataText}>
                  No attendance records are available for this student.
                </Text>
              )}
            </View>

            {/* EXAMINATIONS */}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Examinations
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Scheduled and completed examinations
                  </Text>
                </View>

                <View style={styles.testCountBadge}>
                  <Text style={styles.testCountText}>
                    {examinations.length} Exams
                  </Text>
                </View>
              </View>

              {examinations.length === 0 ? (
                <Text style={styles.noDataText}>
                  No examinations are available for this students batch.
                </Text>
              ) : (
                <View style={styles.testList}>
                  {examinations.map((exam) => {
                    const subject =
                      typeof exam.subjectId === 'object'
                        ? exam.subjectId?.name
                        : undefined;

                    return (
                      <View
                        key={exam._id}
                        style={styles.examCard}
                      >
                        <View style={styles.testIcon}>
                          <Ionicons
                            name="document-text-outline"
                            size={20}
                            color={PURPLE}
                          />
                        </View>

                        <View style={styles.testInfo}>
                          <Text style={styles.testName}>
                            {exam.examinationName}
                          </Text>

                          <Text style={styles.testDate}>
                            {subject || 'Subject not available'}
                          </Text>

                          <Text style={styles.testDate}>
                            {new Date(
                              exam.examinationDate,
                            ).toLocaleDateString()}
                          </Text>

                          <Text style={styles.testDate}>
                            {exam.durationMinutes} minutes
                          </Text>
                        </View>

                        <View style={styles.examMarks}>
                          <Text style={styles.examTotalMarks}>
                            {exam.totalMarks}
                          </Text>

                          <Text style={styles.examMarksLabel}>
                            Total marks
                          </Text>

                          <Text style={styles.examStatus}>
                            {exam.status}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.noticeBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={19}
                  color={PURPLE}
                />

                <Text style={styles.noticeText}>
                  Student marks and individual exam results are not
                  available from the current backend API. Only
                  examination details are displayed.
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

function AttendanceStat({
  icon,
  label,
  value,
  color,
  background,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.attendanceStat}>
      <View
        style={[
          styles.statIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={color}
        />
      </View>

      <View>
        <Text style={styles.statNumber}>
          {value}
        </Text>

        <Text style={styles.statLabel}>
          {label}
        </Text>
      </View>
    </View>
  );
}

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

  studentSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  summaryValue: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 19,
  },

  summaryLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
  },

  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 13,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#E9E8ED',
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    color: '#171A2B',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
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
    marginTop: 2,
    marginBottom: 10,
  },

  studentList: {
    gap: 9,
  },

  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E8ED',
  },

  studentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  studentInitials: {
    color: PURPLE,
    fontFamily: 'PoppinsBold',
    fontSize: 15,
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 14,
  },

  studentId: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    marginTop: 2,
  },

  studentStandard: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
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

  studentProfileInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentInitials: {
    color: PURPLE,
    fontFamily: 'PoppinsBold',
    fontSize: 16,
  },

  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  profileMetaText: {
    color: '#6D7280',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginLeft: 5,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
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

  statNumber: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 15,
  },

  statLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E8E8ED',
  },

  extraAttendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
  },

  extraStat: {
    color: '#6D7280',
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
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
    color: PURPLE,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
  },

  testList: {
    gap: 8,
  },

  examCard: {
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E8ED',
    borderRadius: 13,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 12,
  },

  testDate: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 3,
  },

  examMarks: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  examTotalMarks: {
    color: PURPLE,
    fontFamily: 'PoppinsBold',
    fontSize: 15,
  },

  examMarksLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
  },

  examStatus: {
    color: '#27A566',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    marginTop: 4,
    textTransform: 'capitalize',
  },

  noticeBox: {
    backgroundColor: '#F2EDFF',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 13,
  },

  noticeText: {
    flex: 1,
    color: '#656A77',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    lineHeight: 15,
    marginLeft: 7,
  },

  noDataText: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    paddingVertical: 12,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
  },

  loadingText: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    marginTop: 10,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 25,
  },

  emptyTitle: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    marginTop: 10,
  },

  emptySubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 16,
  },

  retryButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 14,
  },

  retryText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
  },

  pressed: {
    opacity: 0.7,
  },

  bottomSpace: {
    height: 25,
  },
});