import React, { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import {
  AttendanceApiRecord,
  AttendanceBatch,
  AttendanceStudent,
  AttendanceStatus as ApiAttendanceStatus,
  TeacherAttendanceApiRecord,
  fetchAttendanceBatches,
  fetchAttendanceRecords,
  fetchTeacherAttendanceRecords,
  getReferenceId,
  getReferenceName,
  updateAttendanceRecord,
  updateTeacherAttendanceRecord,
} from '@/services/attendance';

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';

type AttendanceRecord = {
  id: string;
  studentMongoId: string;
  dateKey: string;
  studentName: string;
  studentId: string;
  batch: string;
  branch: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  remarks: string;
};

type StudentAttendance = {
  studentName: string;
  studentId: string;
  batch: string;
  branch: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
  monthly: {
    month: string;
    percentage: number;
  }[];
};

const statusColors: Record<
  AttendanceStatus,
  {
    background: string;
    text: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  Present: {
    background: '#E7F8EF',
    text: '#27A968',
    icon: 'check-circle-outline',
  },
  Absent: {
    background: '#FFE9EC',
    text: '#E84D61',
    icon: 'close-circle-outline',
  },
  Late: {
    background: '#FFF1E2',
    text: '#F28A17',
    icon: 'clock-alert-outline',
  },
  Leave: {
    background: '#EAF2FF',
    text: '#2675E8',
    icon: 'calendar-remove-outline',
  },
};

const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLongNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const dateKeyFromValue = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

const formatDateLabel = (value: string) => {
  const key = dateKeyFromValue(value);
  if (!key) return value || '--';
  const [year, month, day] = key.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${monthShortNames[month - 1]} ${year}`;
};

const formatLongDateLabel = (key: string) => {
  if (!key) return '';
  const [year, month, day] = key.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${monthLongNames[month - 1]} ${year}`;
};

const formatCheckIn = (value?: string) => {
  if (!value) return '--';
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(value)) return value.toUpperCase();
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const hour24 = Number(match[1]);
  const minutes = match[2];
  if (hour24 > 23) return value;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${minutes} ${suffix}`;
};

const timeForApi = (value: string, status: AttendanceStatus) => {
  if (status !== 'Present' && status !== 'Late') return '';
  const clean = value.trim();
  if (!clean || clean === '--') return '';
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(clean);
  if (!match) return clean;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

const getApiErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const mapApiAttendanceRecord = (
  apiRecord: AttendanceApiRecord,
  batches: AttendanceBatch[]
): AttendanceRecord => {
  const student = apiRecord.studentId && typeof apiRecord.studentId === 'object'
    ? apiRecord.studentId as AttendanceStudent
    : undefined;
  const populatedBatch = apiRecord.batchId && typeof apiRecord.batchId === 'object'
    ? apiRecord.batchId as AttendanceBatch
    : undefined;
  const studentMongoId = getReferenceId(apiRecord.studentId);
  const batchId = getReferenceId(apiRecord.batchId);
  const batchFromList = batches.find((item) => item._id === batchId);
  const batch = populatedBatch || batchFromList;
  const branchReference = populatedBatch?.branchId && typeof populatedBatch.branchId === 'object'
    ? populatedBatch.branchId
    : batchFromList?.branchId || batch?.branchId;
  const branchName = branchReference && typeof branchReference === 'object'
    ? (branchReference.name || branchReference.code || '—')
    : '—';
  const studentName = student
    ? getReferenceName(student.userId, student.studentId)
    : '';
  const dateKey = dateKeyFromValue(apiRecord.date || '');

  return {
    id: apiRecord._id,
    studentMongoId,
    dateKey,
    studentName: studentName || student?.studentId || 'Unknown student',
    studentId: student?.studentId || studentMongoId || '—',
    batch: batch?.name || '—',
    branch: branchName,
    date: formatDateLabel(apiRecord.date || ''),
    status: apiRecord.status,
    checkIn: formatCheckIn(apiRecord.checkIn),
    remarks: apiRecord.remarks || '',
  };
};

type TeacherRecord = {
  id: string;
  teacherMongoId: string;
  dateKey: string;
  teacherName: string;
  teacherEmail: string;
  teacherMobile: string;
  batch: string;
  subject: string;
  branch: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  remarks: string;
};

const mapTeacherAttendanceRecord = (
  apiRecord: TeacherAttendanceApiRecord,
  batches: AttendanceBatch[]
): TeacherRecord => {
  const teacher =
    apiRecord.teacherId && typeof apiRecord.teacherId === 'object'
      ? (apiRecord.teacherId as any)
      : undefined;
  const populatedBatch =
    apiRecord.batchId && typeof apiRecord.batchId === 'object'
      ? (apiRecord.batchId as AttendanceBatch)
      : undefined;
  const teacherMongoId = getReferenceId(apiRecord.teacherId);
  const batchId = getReferenceId(apiRecord.batchId);
  const batchFromList = batches.find((item) => item._id === batchId);
  const batch = populatedBatch || batchFromList;
  const branchReference =
    populatedBatch?.branchId && typeof populatedBatch.branchId === 'object'
      ? populatedBatch.branchId
      : batchFromList?.branchId || batch?.branchId;
  const branchName =
    branchReference && typeof branchReference === 'object'
      ? (branchReference.name || branchReference.code || '—')
      : '—';
  const teacherName =
    teacher?.fullName || teacher?.name || 'Teacher';
  const subjectName =
    apiRecord.subjectId && typeof apiRecord.subjectId === 'object'
      ? (apiRecord.subjectId as any).name || (apiRecord.subjectId as any).code || 'Subject'
      : 'Subject';
  const dateKey = dateKeyFromValue(apiRecord.date || '');

  return {
    id: apiRecord._id,
    teacherMongoId,
    dateKey,
    teacherName,
    teacherEmail: teacher?.email || '',
    teacherMobile: teacher?.mobileNumber || '',
    batch: batch?.name || '—',
    subject: subjectName,
    branch: branchName,
    date: formatDateLabel(apiRecord.date || ''),
    status: apiRecord.status,
    checkIn: formatCheckIn(apiRecord.checkIn),
    remarks: apiRecord.remarks || '',
  };
};

export default function AttendancePage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isMobile = width < 600;

  const [attendanceMode, setAttendanceMode] =
    useState<'student' | 'teacher'>('student');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [teacherRecords, setTeacherRecords] = useState<TeacherRecord[]>([]);
  const [batches, setBatches] = useState<AttendanceBatch[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [search, setSearch] = useState('');

  const [selectedFilter, setSelectedFilter] = useState<
    'All' | AttendanceStatus
  >('All');

  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceRecord | null>(null);

  const [selectedStudent, setSelectedStudent] =
    useState<StudentAttendance | null>(null);

  const [showActions, setShowActions] = useState(false);
  const [showViewAttendance, setShowViewAttendance] =
    useState(false);
  const [showEditAttendance, setShowEditAttendance] =
    useState(false);
  const [showTotalAttendance, setShowTotalAttendance] =
    useState(false);

  const [editStatus, setEditStatus] =
    useState<AttendanceStatus>('Present');

  const [editCheckIn, setEditCheckIn] = useState('');
  const [editRemarks, setEditRemarks] = useState('');


  const loadAttendance = useCallback(async () => {
    setLoadingRecords(true);
    setRecordsError('');
    try {
      const [apiRecords, batchData, apiTeacherRecords] = await Promise.all([
        fetchAttendanceRecords(),
        fetchAttendanceBatches().catch(() => [] as AttendanceBatch[]),
        fetchTeacherAttendanceRecords().catch(() => [] as TeacherAttendanceApiRecord[]),
      ]);
      setBatches(batchData);
      setRecords(apiRecords.map((record) => mapApiAttendanceRecord(record, batchData)));
      setTeacherRecords(apiTeacherRecords.map((record) => mapTeacherAttendanceRecord(record, batchData)));
    } catch (error) {
      setRecordsError(getApiErrorMessage(error));
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAttendance();
      return undefined;
    }, [loadAttendance])
  );

  /*
   * Today's / Overall summary — calculated from active mode (student or teacher).
   */
  const todayKey = localDateKey();
  const todayLabel = formatLongDateLabel(todayKey);
  const activeRecords = attendanceMode === 'student' ? records : teacherRecords;
  const todaysRecords = activeRecords.filter((record) => record.dateKey === todayKey);

  // If today has records use them, otherwise show overall attendance across all sessions
  const hasToday = todaysRecords.length > 0;
  const summaryRecords = hasToday ? todaysRecords : activeRecords;

  const presentCount = summaryRecords.filter(
    (record) => record.status === 'Present'
  ).length;

  const absentCount = summaryRecords.filter(
    (record) => record.status === 'Absent'
  ).length;

  const lateCount = summaryRecords.filter(
    (record) => record.status === 'Late'
  ).length;

  const leaveCount = summaryRecords.filter(
    (record) => record.status === 'Leave'
  ).length;

  const attendancePercentage =
    summaryRecords.length > 0
      ? Math.round(((presentCount + lateCount) / summaryRecords.length) * 100)
      : 0;

  /*
   * Search + filter for students
   */
  const filteredRecords = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !searchText ||
        record.studentName.toLowerCase().includes(searchText) ||
        record.studentId.toLowerCase().includes(searchText) ||
        record.batch.toLowerCase().includes(searchText) ||
        record.branch.toLowerCase().includes(searchText);

      const matchesFilter =
        selectedFilter === 'All' ||
        record.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [records, search, selectedFilter]);

  /*
   * Search + filter for teachers
   */
  const filteredTeacherRecords = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return teacherRecords.filter((record) => {
      const matchesSearch =
        !searchText ||
        record.teacherName.toLowerCase().includes(searchText) ||
        record.teacherEmail.toLowerCase().includes(searchText) ||
        record.subject.toLowerCase().includes(searchText) ||
        record.batch.toLowerCase().includes(searchText) ||
        record.branch.toLowerCase().includes(searchText);

      const matchesFilter =
        selectedFilter === 'All' ||
        record.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [teacherRecords, search, selectedFilter]);

  /*
   * Calculate total and monthly attendance from actual backend records.
   */
  const getStudentAttendance = (
    record: AttendanceRecord
  ): StudentAttendance => {
    const historyRecords = records.filter((item) =>
      record.studentMongoId
        ? item.studentMongoId === record.studentMongoId
        : item.studentId === record.studentId
    );

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    };
    const months: Record<string, { month: string; present: number; late: number; total: number }> = {};

    historyRecords.forEach((item) => {
      if (item.status === 'Present') summary.present += 1;
      if (item.status === 'Absent') summary.absent += 1;
      if (item.status === 'Late') summary.late += 1;
      if (item.status === 'Leave') summary.leave += 1;

      const monthKey = item.dateKey.slice(0, 7);
      if (!monthKey) return;
      if (!months[monthKey]) {
        const [year, month] = monthKey.split('-').map(Number);
        months[monthKey] = {
          month: `${monthShortNames[month - 1]} ${year}`,
          present: 0,
          late: 0,
          total: 0,
        };
      }
      months[monthKey].total += 1;
      if (item.status === 'Present') months[monthKey].present += 1;
      if (item.status === 'Late') months[monthKey].late += 1;
    });

    const totalDays = summary.present + summary.absent + summary.late + summary.leave;
    const percentage = totalDays > 0
      ? ((summary.present + summary.late) / totalDays) * 100
      : 0;
    const monthly = Object.entries(months)
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, 3)
      .map(([, item]) => ({
        month: item.month,
        percentage: item.total > 0 ? ((item.present + item.late) / item.total) * 100 : 0,
      }));

    return {
      studentName: record.studentName,
      studentId: record.studentId,
      batch: record.batch,
      branch: record.branch,
      totalDays,
      present: summary.present,
      absent: summary.absent,
      late: summary.late,
      leave: summary.leave,
      percentage,
      monthly,
    };
  };

  /*
   * Calculate total and monthly attendance for teachers.
   */
  const getTeacherAttendance = (
    record: TeacherRecord | AttendanceRecord
  ): StudentAttendance => {
    const targetMongoId = 'teacherMongoId' in record ? record.teacherMongoId : record.studentMongoId;
    const targetName = 'teacherName' in record ? record.teacherName : record.studentName;
    const targetBatch = record.batch;
    const targetBranch = record.branch;
    const targetId = 'teacherEmail' in record ? (record.teacherEmail || record.teacherMobile || record.subject) : record.studentId;

    const historyRecords = teacherRecords.filter((item) =>
      targetMongoId
        ? item.teacherMongoId === targetMongoId
        : item.teacherName.toLowerCase() === targetName.toLowerCase()
    );

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    };
    const months: Record<string, { month: string; present: number; late: number; total: number }> = {};

    historyRecords.forEach((item) => {
      if (item.status === 'Present') summary.present += 1;
      if (item.status === 'Absent') summary.absent += 1;
      if (item.status === 'Late') summary.late += 1;
      if (item.status === 'Leave') summary.leave += 1;

      const monthKey = item.dateKey.slice(0, 7);
      if (!monthKey) return;
      if (!months[monthKey]) {
        const [year, month] = monthKey.split('-').map(Number);
        months[monthKey] = {
          month: `${monthShortNames[month - 1]} ${year}`,
          present: 0,
          late: 0,
          total: 0,
        };
      }
      months[monthKey].total += 1;
      if (item.status === 'Present') months[monthKey].present += 1;
      if (item.status === 'Late') months[monthKey].late += 1;
    });

    const totalDays = summary.present + summary.absent + summary.late + summary.leave;
    const percentage = totalDays > 0
      ? ((summary.present + summary.late) / totalDays) * 100
      : 0;
    const monthly = Object.entries(months)
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, 3)
      .map(([, item]) => ({
        month: item.month,
        percentage: item.total > 0 ? ((item.present + item.late) / item.total) * 100 : 0,
      }));

    return {
      studentName: targetName,
      studentId: targetId,
      batch: targetBatch,
      branch: targetBranch,
      totalDays,
      present: summary.present,
      absent: summary.absent,
      late: summary.late,
      leave: summary.leave,
      percentage,
      monthly,
    };
  };

  /*
   * Open total attendance for student or teacher.
   */
  const openTotalAttendance = (
    record: AttendanceRecord
  ) => {
    const attendance = attendanceMode === 'teacher'
      ? getTeacherAttendance(record)
      : getStudentAttendance(record);

    setSelectedStudent(attendance);
    setShowTotalAttendance(true);
  };

  const openTeacherTotalAttendance = (
    record: TeacherRecord
  ) => {
    const attendance = getTeacherAttendance(record);
    setSelectedStudent(attendance);
    setShowTotalAttendance(true);
  };

  /*
   * Three-dot menu.
   */
  const openActions = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowActions(true);
  };

  /*
   * Three-dot menu for Teacher.
   */
  const openTeacherActions = (record: TeacherRecord) => {
    setSelectedRecord({
      id: record.id,
      studentMongoId: record.teacherMongoId,
      dateKey: record.dateKey,
      studentName: record.teacherName,
      studentId: record.teacherEmail || record.teacherMobile || record.subject,
      batch: record.batch,
      branch: record.branch,
      date: record.date,
      status: record.status,
      checkIn: record.checkIn,
      remarks: record.remarks,
    });
    setShowActions(true);
  };

  /*
   * Edit attendance.
   */
  const openEdit = () => {
    if (!selectedRecord) {
      return;
    }

    setEditStatus(selectedRecord.status);
    setEditCheckIn(selectedRecord.checkIn);
    setEditRemarks(selectedRecord.remarks);

    setShowActions(false);
    setShowEditAttendance(true);
  };

  /*
   * Save edited attendance through the backend.
   */
  const saveEdit = async () => {
    if (!selectedRecord || savingEdit) return;

    setSavingEdit(true);
    try {
      if (attendanceMode === 'teacher') {
        const updated = await updateTeacherAttendanceRecord(selectedRecord.id, {
          status: editStatus as ApiAttendanceStatus,
          checkIn: timeForApi(editCheckIn, editStatus),
          remarks: editRemarks.trim(),
        });
        const updatedRecord = mapTeacherAttendanceRecord(updated, batches);
        setTeacherRecords((currentRecords) =>
          currentRecords.map((record) =>
            record.id === updatedRecord.id ? updatedRecord : record
          )
        );
      } else {
        const updated = await updateAttendanceRecord(selectedRecord.id, {
          status: editStatus as ApiAttendanceStatus,
          checkIn: timeForApi(editCheckIn, editStatus),
          remarks: editRemarks.trim(),
        });
        const updatedRecord = mapApiAttendanceRecord(updated, batches);
        setRecords((currentRecords) =>
          currentRecords.map((record) =>
            record.id === updatedRecord.id ? updatedRecord : record
          )
        );
      }
      setShowEditAttendance(false);
      setSelectedRecord(null);
      Alert.alert('Attendance Updated', 'The attendance record has been updated successfully.');
    } catch (error) {
      Alert.alert('Update Failed', getApiErrorMessage(error));
    } finally {
      setSavingEdit(false);
    }
  };

  /*
   * Clear attendance. The backend has no delete route, so clear marks the record Absent.
   */
  const clearAttendance = () => {
    if (!selectedRecord) return;
    const target = selectedRecord;
    setShowActions(false);

    Alert.alert(
      'Clear Attendance',
      `Clear today's attendance for ${target.studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              if (attendanceMode === 'teacher') {
                const updated = await updateTeacherAttendanceRecord(target.id, {
                  status: 'Absent',
                  checkIn: '',
                  remarks: 'Attendance cleared',
                });
                const updatedRecord = mapTeacherAttendanceRecord(updated, batches);
                setTeacherRecords((currentRecords) =>
                  currentRecords.map((record) =>
                    record.id === updatedRecord.id ? updatedRecord : record
                  )
                );
              } else {
                const updated = await updateAttendanceRecord(target.id, {
                  status: 'Absent',
                  checkIn: '',
                  remarks: 'Attendance cleared',
                });
                const updatedRecord = mapApiAttendanceRecord(updated, batches);
                setRecords((currentRecords) =>
                  currentRecords.map((record) =>
                    record.id === updatedRecord.id ? updatedRecord : record
                  )
                );
              }
              setSelectedRecord(null);
              Alert.alert('Attendance Cleared', 'The record has been updated.');
            } catch (error) {
              Alert.alert('Clear Failed', getApiErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  /*
   * Today's attendance view.
   */
  const showStudentView = () => {
    setShowActions(false);
    setShowViewAttendance(true);
  };

  /*
   * Mark attendance button.
   */
  const markAttendance = () => {
    router.push({
      pathname: '/(super_admin)/explore' as any,
      params: { feature: 'Mark Attendance' },
    });
  };

  /*
   * Summary card.
   */
  const renderSummaryCard = (
    title: string,
    value: number,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    background: string,
    iconColor: string
  ) => (
    <View
      style={[
        styles.summaryCard,
        isMobile && styles.summaryCardMobile,
      ]}
    >
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <Text style={styles.summaryValue}>{value}</Text>

      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
  );

  /*
   * Main attendance donut.
   */
  const renderAttendanceDonut = () => {
    const size = isMobile ? 125 : 140;
    const strokeWidth = isMobile ? 12 : 13;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const progress =
      circumference -
      (attendancePercentage / 100) * circumference;

    return (
      <View
        style={[
          styles.donutWrapper,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EEEAF8"
            strokeWidth={strokeWidth}
            fill="none"
          />

          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#7040D5"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={progress}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        <View style={styles.donutCenter}>
          <Text
            style={[
              styles.donutPercentage,
              isMobile && styles.donutPercentageMobile,
            ]}
          >
            {attendancePercentage}%
          </Text>

          <Text style={styles.donutLabel}>
            Attendance
          </Text>
        </View>
      </View>
    );
  };

  /*
   * Status badge.
   */
  const renderStatusBadge = (
    status: AttendanceStatus
  ) => {
    const colors = statusColors[status];

    return (
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={colors.icon}
          size={13}
          color={colors.text}
        />

        <Text
          style={[
            styles.statusText,
            {
              color: colors.text,
            },
          ]}
        >
          {status}
        </Text>
      </View>
    );
  };

  /*
   * Student attendance record.
   */
  const renderRecord = (record: AttendanceRecord) => (
    <View key={record.id} style={styles.recordCard}>
      <View style={styles.recordTopRow}>
        <View style={styles.studentIdentity}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>
              {record.studentName
                .split(' ')
                .map((name) => name.charAt(0))
                .join('')
                .slice(0, 2)}
            </Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {record.studentName}
            </Text>

            <Text style={styles.studentId}>
              {record.studentId}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => openActions(record)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={22}
            color="#68758A"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.recordDivider} />

      <View style={styles.recordDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={17}
            color="#7040D5"
          />

          <View>
            <Text style={styles.detailLabel}>
              Date
            </Text>

            <Text style={styles.detailValue}>
              {record.date}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={17}
            color="#2675E8"
          />

          <View>
            <Text style={styles.detailLabel}>
              Check-in
            </Text>

            <Text style={styles.detailValue}>
              {record.checkIn}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={17}
            color="#35B878"
          />

          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>
              Batch
            </Text>

            <Text
              style={styles.detailValue}
              numberOfLines={1}
            >
              {record.batch}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={17}
            color="#F7941D"
          />

          <View>
            <Text style={styles.detailLabel}>
              Branch
            </Text>

            <Text style={styles.detailValue}>
              {record.branch}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recordBottomRow}>
        {renderStatusBadge(record.status)}

        <TouchableOpacity
          style={styles.totalAttendanceButton}
          onPress={() => openTotalAttendance(record)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="chart-donut"
            size={15}
            color="#7040D5"
          />

          <Text style={styles.totalAttendanceButtonText}>
            Total Attendance
          </Text>

          <MaterialCommunityIcons
            name="chevron-right"
            size={17}
            color="#7040D5"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  /*
   * Teacher attendance record.
   */
  const renderTeacherRecord = (record: TeacherRecord) => (
    <View key={record.id} style={styles.recordCard}>
      <View style={styles.recordTopRow}>
        <View style={styles.studentIdentity}>
          <View style={[styles.studentAvatar, { backgroundColor: '#F0EAFE' }]}>
            <Text style={[styles.studentAvatarText, { color: '#7040D5' }]}>
              {record.teacherName
                .split(' ')
                .map((name) => name.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'TC'}
            </Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{record.teacherName}</Text>
            <Text style={styles.studentId}>
              {record.subject} • {record.batch}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => openTeacherActions(record)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={22}
            color="#68758A"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.recordDivider} />

      <View style={styles.recordDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={17}
            color="#7040D5"
          />
          <View>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{record.date}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={17}
            color="#7040D5"
          />
          <View>
            <Text style={styles.detailLabel}>Check-in</Text>
            <Text style={styles.detailValue}>{record.checkIn || '—'}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="domain"
            size={17}
            color="#7040D5"
          />
          <View>
            <Text style={styles.detailLabel}>Branch</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {record.branch}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="book-open-outline"
            size={17}
            color="#7040D5"
          />
          <View>
            <Text style={styles.detailLabel}>Subject</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {record.subject}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recordBottomRow}>
        {renderStatusBadge(record.status)}

        <TouchableOpacity
          style={styles.totalAttendanceButton}
          onPress={() => openTeacherTotalAttendance(record)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="chart-donut"
            size={15}
            color="#7040D5"
          />

          <Text style={styles.totalAttendanceButtonText}>
            Total Attendance
          </Text>

          <MaterialCommunityIcons
            name="chevron-right"
            size={17}
            color="#7040D5"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  /*
   * Total attendance modal.
   */
  const renderTotalAttendanceModal = () => {
    if (!selectedStudent) {
      return null;
    }

    const percentage = selectedStudent.percentage;

    const size = 110;
    const radius = 44;
    const strokeWidth = 11;
    const circumference = 2 * Math.PI * radius;

    const progress =
      circumference -
      (percentage / 100) * circumference;

    return (
      <Modal
        visible={showTotalAttendance}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowTotalAttendance(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.totalAttendanceModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Total Attendance
                </Text>

                <Text style={styles.modalSubtitle}>
                  Complete attendance summary
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setShowTotalAttendance(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#68758A"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.totalModalScroll
              }
            >
              <View style={styles.totalStudentHeader}>
                <View style={styles.largeStudentAvatar}>
                  <Text
                    style={styles.largeStudentAvatarText}
                  >
                    {selectedStudent.studentName
                      .split(' ')
                      .map((name) => name.charAt(0))
                      .join('')
                      .slice(0, 2)}
                  </Text>
                </View>

                <View style={styles.totalStudentInfo}>
                  <Text style={styles.totalStudentName}>
                    {selectedStudent.studentName}
                  </Text>

                  <Text style={styles.totalStudentId}>
                    {selectedStudent.studentId}
                  </Text>

                  <Text style={styles.totalStudentBatch}>
                    {selectedStudent.batch}
                  </Text>

                  <Text style={styles.totalStudentBranch}>
                    {selectedStudent.branch}
                  </Text>
                </View>
              </View>

              <View style={styles.totalPercentageCard}>
                <View
                  style={styles.smallDonutWrapper}
                >
                  <Svg width={size} height={size}>
                    <Circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="#EEEAF8"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />

                    <Circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="#7040D5"
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={progress}
                      rotation="-90"
                      origin={`${size / 2}, ${size / 2}`}
                    />
                  </Svg>

                  <View
                    style={styles.smallDonutCenter}
                  >
                    <Text
                      style={
                        styles.smallDonutPercentage
                      }
                    >
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.percentageInfo}>
                  <Text style={styles.percentageHeading}>
                    Overall Attendance
                  </Text>

                  <Text
                    style={styles.percentageDescription}
                  >
                    Present and late days are counted
                    as attended days.
                  </Text>

                  <View
                    style={styles.attendanceStatusLine}
                  >
                    <View
                      style={styles.statusDot}
                    />

                    <Text
                      style={styles.goodAttendanceText}
                    >
                      {percentage >= 75
                        ? 'Good Attendance'
                        : 'Needs Attention'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>
                Attendance Summary
              </Text>

              <View style={styles.attendanceGrid}>
                <View
                  style={[
                    styles.attendanceStat,
                    {
                      backgroundColor: '#E7F8EF',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={23}
                    color="#27A968"
                  />

                  <Text
                    style={styles.attendanceStatValue}
                  >
                    {selectedStudent.present}
                  </Text>

                  <Text
                    style={styles.attendanceStatLabel}
                  >
                    Present
                  </Text>
                </View>

                <View
                  style={[
                    styles.attendanceStat,
                    {
                      backgroundColor: '#FFE9EC',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={23}
                    color="#E84D61"
                  />

                  <Text
                    style={styles.attendanceStatValue}
                  >
                    {selectedStudent.absent}
                  </Text>

                  <Text
                    style={styles.attendanceStatLabel}
                  >
                    Absent
                  </Text>
                </View>

                <View
                  style={[
                    styles.attendanceStat,
                    {
                      backgroundColor: '#FFF1E2',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="clock-alert-outline"
                    size={23}
                    color="#F28A17"
                  />

                  <Text
                    style={styles.attendanceStatValue}
                  >
                    {selectedStudent.late}
                  </Text>

                  <Text
                    style={styles.attendanceStatLabel}
                  >
                    Late
                  </Text>
                </View>

                <View
                  style={[
                    styles.attendanceStat,
                    {
                      backgroundColor: '#EAF2FF',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-remove-outline"
                    size={23}
                    color="#2675E8"
                  />

                  <Text
                    style={styles.attendanceStatValue}
                  >
                    {selectedStudent.leave}
                  </Text>

                  <Text
                    style={styles.attendanceStatLabel}
                  >
                    Leave
                  </Text>
                </View>
              </View>

              <View style={styles.totalDaysCard}>
                <View>
                  <Text style={styles.totalDaysLabel}>
                    Total Working Days
                  </Text>

                  <Text
                    style={styles.totalDaysDescription}
                  >
                    Attendance records available
                  </Text>
                </View>

                <Text style={styles.totalDaysValue}>
                  {selectedStudent.totalDays}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                Monthly Attendance
              </Text>

              <View style={styles.monthlyCard}>
                {selectedStudent.monthly.map(
                  (item, index) => (
                    <View
                      key={item.month}
                      style={[
                        styles.monthRow,
                        index ===
                          selectedStudent.monthly.length -
                            1 && {
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      <View
                        style={
                          styles.monthNameContainer
                        }
                      >
                        <MaterialCommunityIcons
                          name="calendar-month-outline"
                          size={18}
                          color="#7040D5"
                        />

                        <Text
                          style={styles.monthName}
                        >
                          {item.month}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.monthProgressContainer
                        }
                      >
                        <View
                          style={
                            styles.monthProgressTrack
                          }
                        >
                          <View
                            style={[
                              styles.monthProgressFill,
                              {
                                width: `${Math.min(
                                  item.percentage,
                                  100
                                )}%`,
                              },
                            ]}
                          />
                        </View>

                        <Text
                          style={styles.monthPercentage}
                        >
                          {item.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  )
                )}
              </View>

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() =>
                  setShowTotalAttendance(false)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={styles.closeModalButtonText}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingTop: Math.max(insets.top, 0),
        },
      ]}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              Attendance
            </Text>
          </View>

          <TouchableOpacity
            style={styles.markButton}
            onPress={markAttendance}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={17}
              color="#7040D5"
            />

            <Text style={styles.markButtonText}>
              Mark Attendance
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* PAGE TITLE */}
          <Text style={styles.pageTitle}>
            Attendance Management
          </Text>

          <Text style={styles.pageSubtitle}>
            {attendanceMode === 'student'
              ? 'Monitor daily attendance and view complete student attendance history.'
              : 'Monitor daily attendance and view complete teacher attendance history.'}
          </Text>

          {/* ATTENDANCE MODE TOGGLE */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[
                styles.roleToggleButton,
                attendanceMode === 'student' && styles.roleToggleButtonActive,
              ]}
              onPress={() => setAttendanceMode('student')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="school-outline"
                size={18}
                color={attendanceMode === 'student' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.roleToggleText,
                  attendanceMode === 'student' && styles.roleToggleTextActive,
                ]}
                numberOfLines={1}
              >
                Students Attendance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleToggleButton,
                attendanceMode === 'teacher' && styles.roleToggleButtonActive,
              ]}
              onPress={() => setAttendanceMode('teacher')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="account-tie-outline"
                size={18}
                color={attendanceMode === 'teacher' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.roleToggleText,
                  attendanceMode === 'teacher' && styles.roleToggleTextActive,
                ]}
                numberOfLines={1}
              >
                Teachers Attendance
              </Text>
            </TouchableOpacity>
          </View>

          {/* OVERVIEW CARD */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewHeadingBlock}>
                <Text style={styles.overviewTitle}>
                  {hasToday
                    ? "Today's Attendance"
                    : attendanceMode === 'teacher'
                    ? "Teachers Overall Attendance"
                    : "Students Overall Attendance"}
                </Text>

                <Text style={styles.overviewDescription}>
                  {hasToday
                    ? `Attendance overview for ${todayLabel}`
                    : `Overall summary across all ${activeRecords.length} recorded sessions`}
                </Text>
              </View>

              <View style={styles.overviewPercentage}>
                <Text
                  style={styles.overviewPercentageValue}
                >
                  {attendancePercentage}%
                </Text>

                <Text
                  style={styles.overviewPercentageLabel}
                >
                  {hasToday ? "Today" : "Overall"}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.overviewContent,
                isMobile &&
                  styles.overviewContentMobile,
              ]}
            >
              {/* SUMMARY CARDS */}
              <View
                style={[
                  styles.summaryGrid,
                  isMobile &&
                    styles.summaryGridMobile,
                ]}
              >
                {renderSummaryCard(
                  'Present',
                  presentCount,
                  'check-circle-outline',
                  '#E7F8EF',
                  '#27A968'
                )}

                {renderSummaryCard(
                  'Absent',
                  absentCount,
                  'close-circle-outline',
                  '#FFE9EC',
                  '#E84D61'
                )}

                {renderSummaryCard(
                  'Late',
                  lateCount,
                  'clock-alert-outline',
                  '#FFF1E2',
                  '#F28A17'
                )}

                {renderSummaryCard(
                  'Leave',
                  leaveCount,
                  'calendar-remove-outline',
                  '#EAF2FF',
                  '#2675E8'
                )}
              </View>

              {/* DONUT */}
              <View
                style={[
                  styles.overviewRight,
                  isMobile &&
                    styles.overviewRightMobile,
                ]}
              >
                {renderAttendanceDonut()}
              </View>
            </View>
          </View>

          {/* SEARCH */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#8994A7"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={
                  attendanceMode === 'student'
                    ? 'Search student, batch or branch...'
                    : 'Search teacher, subject, batch or branch...'
                }
                placeholderTextColor="#A0A9B8"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color="#A0A9B8"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* FILTER */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {(
              [
                'All',
                'Present',
                'Absent',
                'Late',
                'Leave',
              ] as const
            ).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedFilter(filter)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* RECORD HEADER */}
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                {attendanceMode === 'student' ? 'Student Attendance Records' : 'Teacher Attendance Records'}
              </Text>

              <Text style={styles.listSubtitle}>
                {attendanceMode === 'student'
                  ? `${filteredRecords.length} record${filteredRecords.length !== 1 ? 's' : ''} found`
                  : `${filteredTeacherRecords.length} record${filteredTeacherRecords.length !== 1 ? 's' : ''} found`}
              </Text>
            </View>
          </View>

          {/* RECORDS */}
          {loadingRecords ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#7040D5" />
              <Text style={styles.emptyTitle}>Loading attendance records</Text>
              <Text style={styles.emptySubtitle}>Fetching attendance from the server.</Text>
            </View>
          ) : recordsError ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#E84D61" />
              </View>
              <Text style={styles.emptyTitle}>Unable to load attendance</Text>
              <Text style={styles.emptySubtitle}>{recordsError}</Text>
              <TouchableOpacity style={styles.retryLoadButton} onPress={() => void loadAttendance()} activeOpacity={0.8}>
                <Text style={styles.markButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : attendanceMode === 'student' ? (
            filteredRecords.length > 0 ? (
              <View style={styles.recordsList}>
                {filteredRecords.map(renderRecord)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MaterialCommunityIcons
                    name="calendar-search-outline"
                    size={32}
                    color="#7040D5"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No student attendance records found
                </Text>

                <Text style={styles.emptySubtitle}>
                  Try changing your search or attendance filter.
                </Text>
              </View>
            )
          ) : (
            filteredTeacherRecords.length > 0 ? (
              <View style={styles.recordsList}>
                {filteredTeacherRecords.map(renderTeacherRecord)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MaterialCommunityIcons
                    name="calendar-search-outline"
                    size={32}
                    color="#7040D5"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No teacher attendance records found
                </Text>

                <Text style={styles.emptySubtitle}>
                  Try changing your search or attendance filter.
                </Text>
              </View>
            )
          )}
        </ScrollView>

        {/* ACTION MODAL */}
        <Modal
          visible={showActions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowActions(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowActions(false)}
          >
            <Pressable
              style={styles.actionModal}
              onPress={(event) =>
                event.stopPropagation()
              }
            >
              <View style={styles.actionModalHeader}>
                <View>
                  <Text
                    style={styles.actionModalTitle}
                  >
                    Attendance Actions
                  </Text>

                  <Text
                    style={styles.actionModalStudent}
                  >
                    {selectedRecord?.studentName}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setShowActions(false)
                  }
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#68758A"
                  />
                </TouchableOpacity>
              </View>

              {/* VIEW */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={showStudentView}
              >
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor: '#F1EAFF',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={20}
                    color="#7040D5"
                  />
                </View>

                <View
                  style={styles.actionTextContainer}
                >
                  <Text style={styles.actionTitle}>
                    View Attendance
                  </Text>

                  <Text
                    style={styles.actionDescription}
                  >
                    View today&apos;s attendance details
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#9AA3B3"
                />
              </TouchableOpacity>

              {/* EDIT */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={openEdit}
              >
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor: '#EAF2FF',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={20}
                    color="#2675E8"
                  />
                </View>

                <View
                  style={styles.actionTextContainer}
                >
                  <Text style={styles.actionTitle}>
                    Edit Attendance
                  </Text>

                  <Text
                    style={styles.actionDescription}
                  >
                    Change status or remarks
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#9AA3B3"
                />
              </TouchableOpacity>

              {/* TOTAL ATTENDANCE */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  setShowActions(false);

                  if (selectedRecord) {
                    openTotalAttendance(
                      selectedRecord
                    );
                  }
                }}
              >
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor: '#E7F8EF',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="chart-donut"
                    size={20}
                    color="#27A968"
                  />
                </View>

                <View
                  style={styles.actionTextContainer}
                >
                  <Text style={styles.actionTitle}>
                    View Total Attendance
                  </Text>

                  <Text
                    style={styles.actionDescription}
                  >
                    View complete attendance history
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#9AA3B3"
                />
              </TouchableOpacity>

              {/* CLEAR */}
              <TouchableOpacity
                style={[
                  styles.actionItem,
                  styles.deleteAction,
                ]}
                onPress={clearAttendance}
              >
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor: '#FFE9EC',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-remove-outline"
                    size={20}
                    color="#E84D61"
                  />
                </View>

                <View
                  style={styles.actionTextContainer}
                >
                  <Text
                    style={[
                      styles.actionTitle,
                      {
                        color: '#E84D61',
                      },
                    ]}
                  >
                    Clear Attendance
                  </Text>

                  <Text
                    style={styles.actionDescription}
                  >
                    Clear today&apos;s attendance record
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#E84D61"
                />
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* VIEW TODAY'S ATTENDANCE MODAL */}
        <Modal
          visible={showViewAttendance}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowViewAttendance(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.viewModal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Attendance Details
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Today&apos;s attendance record
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setShowViewAttendance(false)
                  }
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#68758A"
                  />
                </TouchableOpacity>
              </View>

              {selectedRecord && (
                <View>
                  <View
                    style={styles.viewStudentHeader}
                  >
                    <View
                      style={styles.largeStudentAvatar}
                    >
                      <Text
                        style={
                          styles.largeStudentAvatarText
                        }
                      >
                        {selectedRecord.studentName
                          .split(' ')
                          .map((name) =>
                            name.charAt(0)
                          )
                          .join('')
                          .slice(0, 2)}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={styles.viewStudentName}
                      >
                        {selectedRecord.studentName}
                      </Text>

                      <Text
                        style={styles.viewStudentId}
                      >
                        {selectedRecord.studentId}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.viewDetailsCard}
                  >
                    <View
                      style={styles.viewDetailRow}
                    >
                      <Text
                        style={styles.viewDetailLabel}
                      >
                        Date
                      </Text>

                      <Text
                        style={styles.viewDetailValue}
                      >
                        {selectedRecord.date}
                      </Text>
                    </View>

                    <View
                      style={styles.viewDetailRow}
                    >
                      <Text
                        style={styles.viewDetailLabel}
                      >
                        Status
                      </Text>

                      {renderStatusBadge(
                        selectedRecord.status
                      )}
                    </View>

                    <View
                      style={styles.viewDetailRow}
                    >
                      <Text
                        style={styles.viewDetailLabel}
                      >
                        Check-in
                      </Text>

                      <Text
                        style={styles.viewDetailValue}
                      >
                        {selectedRecord.checkIn}
                      </Text>
                    </View>

                    <View
                      style={styles.viewDetailRow}
                    >
                      <Text
                        style={styles.viewDetailLabel}
                      >
                        Batch
                      </Text>

                      <Text
                        style={styles.viewDetailValue}
                      >
                        {selectedRecord.batch}
                      </Text>
                    </View>

                    <View
                      style={styles.viewDetailRow}
                    >
                      <Text
                        style={styles.viewDetailLabel}
                      >
                        Branch
                      </Text>

                      <Text
                        style={styles.viewDetailValue}
                      >
                        {selectedRecord.branch}
                      </Text>
                    </View>

                    <View
                      style={styles.viewDetailRow}
                    >
                      <Text
                        style={styles.viewDetailLabel}
                      >
                        Remarks
                      </Text>

                      <Text
                        style={styles.viewDetailValue}
                      >
                        {selectedRecord.remarks ||
                          'No remarks'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryModalButton}
                    onPress={() => {
                      setShowViewAttendance(false);

                      openTotalAttendance(
                        selectedRecord
                      );
                    }}
                  >
                    <MaterialCommunityIcons
                      name="chart-donut"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryModalButtonText
                      }
                    >
                      View Total Attendance
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* EDIT ATTENDANCE MODAL */}
        <Modal
          visible={showEditAttendance}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowEditAttendance(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.editModal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Edit Attendance
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Update attendance information
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setShowEditAttendance(false)
                  }
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#68758A"
                  />
                </TouchableOpacity>
              </View>

              {selectedRecord && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.inputLabel}>
                    Student
                  </Text>

                  <View style={styles.readOnlyField}>
                    <Text style={styles.readOnlyText}>
                      {selectedRecord.studentName}
                    </Text>
                  </View>

                  <Text style={styles.inputLabel}>
                    Attendance Status
                  </Text>

                  <View style={styles.statusSelector}>
                    {(
                      [
                        'Present',
                        'Absent',
                        'Late',
                        'Leave',
                      ] as AttendanceStatus[]
                    ).map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          editStatus === status &&
                            styles.statusOptionActive,
                        ]}
                        onPress={() =>
                          setEditStatus(status)
                        }
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            editStatus === status &&
                              styles.statusOptionTextActive,
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>
                    Check-in Time
                  </Text>

                  <TextInput
                    value={editCheckIn}
                    onChangeText={setEditCheckIn}
                    placeholder="e.g. 09:05 AM"
                    placeholderTextColor="#A0A9B8"
                    style={styles.formInput}
                  />

                  <Text style={styles.inputLabel}>
                    Remarks
                  </Text>

                  <TextInput
                    value={editRemarks}
                    onChangeText={setEditRemarks}
                    placeholder="Add remarks"
                    placeholderTextColor="#A0A9B8"
                    style={[
                      styles.formInput,
                      styles.textArea,
                    ]}
                    multiline
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    style={[styles.saveButton, savingEdit && { opacity: 0.6 }]}
                    onPress={() => void saveEdit()}
                    activeOpacity={0.8}
                    disabled={savingEdit}
                  >
                    <Text style={styles.saveButtonText}>
                      {savingEdit ? 'Saving…' : 'Save Changes'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* TOTAL ATTENDANCE */}
        {renderTotalAttendanceModal()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* HEADER */

  header: {
    minHeight: 68,
    backgroundColor: '#7040D5',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 19,
    color: '#FFFFFF',
  },

  markButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  markButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 4,
  },

  /* PAGE */

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 23,
    color: '#172033',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#7C879A',
    marginTop: 3,
    marginBottom: 18,
  },

  /* TODAY'S ATTENDANCE */

  overviewCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  overviewHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  overviewHeadingBlock: {
    flex: 1,
    paddingRight: 10,
  },

  overviewTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  overviewDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#8791A3',
    marginTop: 3,
  },

  overviewPercentage: {
    minWidth: 62,
    height: 48,
    borderRadius: 11,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  overviewPercentageValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#7040D5',
  },

  overviewPercentageLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.5,
    color: '#8A7AB3',
    marginTop: -1,
  },

  overviewContent: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewContentMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  /* SUMMARY */

  summaryGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  summaryGridMobile: {
    width: '100%',
    flex: 0,
    justifyContent: 'space-between',
  },

  summaryCard: {
    width: 105,
    height: 92,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'space-between',
  },

  summaryCardMobile: {
    width: '48%',
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
  },

  summaryTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#7B879A',
  },

  /* DONUT */

  overviewRight: {
    width: 155,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  overviewRightMobile: {
    width: '100%',
    marginLeft: 0,
    marginTop: 18,
  },

  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutPercentage: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#172033',
  },

  donutPercentageMobile: {
    fontSize: 20,
  },

  donutLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#7B879A',
    marginTop: -2,
  },

  /* SEARCH */

  searchFilterRow: {
    marginTop: 18,
  },

  searchContainer: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECF2',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#172033',
    paddingVertical: 0,
  },

  /* FILTER */

  filterRow: {
    gap: 8,
    paddingVertical: 13,
  },

  filterButton: {
    minWidth: 70,
    height: 35,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9F0',
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  filterButtonText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#68758A',
  },

  filterButtonTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
  },

  /* RECORDS */

  listHeader: {
    marginTop: 5,
    marginBottom: 12,
  },

  listTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  listSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8994A7',
    marginTop: 2,
  },

  recordsList: {
    gap: 12,
  },

  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  studentIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentAvatarText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#7040D5',
  },

  studentInfo: {
    marginLeft: 10,
    flex: 1,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },

  studentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A95A7',
    marginTop: 2,
  },

  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8FC',
  },

  recordDivider: {
    height: 1,
    backgroundColor: '#F0F1F5',
    marginVertical: 13,
  },

  recordDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
  },

  detailItem: {
    minWidth: 145,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  detailTextContainer: {
    flex: 1,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#929BAB',
  },

  detailValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#3A4558',
    marginTop: 1,
  },

  recordBottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    marginLeft: 4,
  },

  totalAttendanceButton: {
    minHeight: 32,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalAttendanceButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#7040D5',
    marginHorizontal: 4,
  },

  /* EMPTY */

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
    marginTop: 13,
  },

  retryLoadButton: {
    marginTop: 14,
    minHeight: 38,
    paddingHorizontal: 20,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#8994A7',
    marginTop: 4,
    textAlign: 'center',
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 35, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },

  actionModal: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
  },

  actionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  actionModalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  actionModalStudent: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8791A3',
    marginTop: 2,
  },

  actionItem: {
    minHeight: 64,
    borderRadius: 12,
    backgroundColor: '#FAFBFD',
    paddingHorizontal: 10,
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  deleteAction: {
    backgroundColor: '#FFF9FA',
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  actionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#172033',
  },

  actionDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A95A7',
    marginTop: 2,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* VIEW MODAL */

  viewModal: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  editModal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  modalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#172033',
  },

  modalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8994A7',
    marginTop: 2,
  },

  viewStudentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },

  largeStudentAvatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  largeStudentAvatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#7040D5',
  },

  viewStudentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
    marginLeft: 12,
  },

  viewStudentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A95A7',
    marginLeft: 12,
    marginTop: 2,
  },

  viewDetailsCard: {
    backgroundColor: '#F8F9FC',
    borderRadius: 13,
    padding: 13,
    marginTop: 14,
  },

  viewDetailRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },

  viewDetailLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#7B879A',
  },

  viewDetailValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#354054',
    maxWidth: '65%',
    textAlign: 'right',
  },

  primaryModalButton: {
    height: 43,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryModalButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 7,
  },

  /* EDIT */

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#566277',
    marginTop: 10,
    marginBottom: 5,
  },

  readOnlyField: {
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: '#F6F7FA',
    borderWidth: 1,
    borderColor: '#EAECF1',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },

  readOnlyText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#5D687B',
  },

  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  statusOption: {
    height: 35,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusOptionActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  statusOptionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#6D788B',
  },

  statusOptionTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  formInput: {
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E8EF',
    paddingHorizontal: 12,
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#172033',
  },

  textArea: {
    minHeight: 82,
    paddingTop: 11,
  },

  saveButton: {
    height: 44,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
    marginBottom: 8,
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },

  /* TOTAL ATTENDANCE MODAL */

  totalAttendanceModal: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },

  totalModalScroll: {
    paddingBottom: 5,
  },

  totalStudentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FD',
    borderRadius: 14,
    padding: 13,
  },

  totalStudentInfo: {
    flex: 1,
    marginLeft: 12,
  },

  totalStudentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
  },

  totalStudentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8994A7',
    marginTop: 2,
  },

  totalStudentBatch: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#596579',
    marginTop: 5,
  },

  totalStudentBranch: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8994A7',
    marginTop: 1,
  },

  totalPercentageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEAF8',
    borderRadius: 15,
    padding: 13,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  smallDonutWrapper: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallDonutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallDonutPercentage: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },

  percentageInfo: {
    flex: 1,
    marginLeft: 12,
  },

  percentageHeading: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#172033',
  },

  percentageDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8994A7',
    lineHeight: 13,
    marginTop: 5,
  },

  attendanceStatusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#27A968',
  },

  goodAttendanceText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#27A968',
    marginLeft: 5,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
    marginTop: 17,
    marginBottom: 8,
  },

  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  attendanceStat: {
    width: '48.5%',
    minHeight: 88,
    borderRadius: 12,
    padding: 11,
    justifyContent: 'space-between',
  },

  attendanceStatValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
    marginTop: 3,
  },

  attendanceStatLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#718095',
  },

  totalDaysCard: {
    minHeight: 63,
    borderRadius: 12,
    backgroundColor: '#F7F8FC',
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalDaysLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#172033',
  },

  totalDaysDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8994A7',
    marginTop: 2,
  },

  totalDaysValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 23,
    color: '#7040D5',
  },

  monthlyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    overflow: 'hidden',
  },

  monthRow: {
    minHeight: 58,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  monthNameContainer: {
    width: 95,
    flexDirection: 'row',
    alignItems: 'center',
  },

  monthName: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#4E5B70',
    marginLeft: 6,
  },

  monthProgressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  monthProgressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#EEEAF8',
    overflow: 'hidden',
  },

  monthProgressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#7040D5',
  },

  monthPercentage: {
    width: 43,
    textAlign: 'right',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#7040D5',
  },

  closeModalButton: {
    height: 43,
    borderRadius: 11,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  closeModalButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
  },

  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEEDF5',
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
    marginBottom: 16,
    width: '100%',
  },
  roleToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 11,
  },
  roleToggleButtonActive: {
    backgroundColor: '#7040D5',
    shadowColor: '#7040D5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleToggleText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#667085',
  },
  roleToggleTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
  },
  teacherRemarksText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#8994A7',
    marginLeft: 12,
  },
});
