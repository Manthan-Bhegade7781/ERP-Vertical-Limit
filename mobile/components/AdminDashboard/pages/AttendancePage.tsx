import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';
type ApiStudent = {
  _id: string;
  userId?: { _id?: string; fullName?: string; email?: string; mobileNumber?: string } | string;
  studentId?: string;
  admissionNumber?: string;
  fullName?: string;
  name?: string;
  batchId?: string | { _id: string; name?: string; code?: string; standard?: string; branchId?: unknown };
};
type ApiBatch = { _id: string; name?: string; code?: string; standard?: string; branchId?: unknown };
type ApiSubject = { _id: string; name?: string; code?: string; standard?: string };
type ApiAttendance = {
  _id: string;
  studentId: ApiStudent | string;
  batchId: ApiBatch | string;
  subjectId: ApiSubject | string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  remarks?: string;
};
type AttendanceRecord = {
  id: string;
  studentMongoId: string;
  studentName: string;
  studentId: string;
  date: string;
  branch: string;
  stdSub: string;
  status: AttendanceStatus;
  checkIn: string;
  remarks: string;
};
type StudentAttendance = {
  studentMongoId: string;
  studentId: string;
  studentName: string;
  standardBatch: string;
  branch: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
};
type AttendanceSummary = {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
};

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Leave'];

const getObjectId = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && '_id' in value) return String((value as { _id: unknown })._id);
  return '';
};
const getDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};
const getStudentName = (student: ApiStudent | string) => {
  if (!student || typeof student === 'string') return 'Unknown student';
  const user = student.userId && typeof student.userId === 'object' ? student.userId : undefined;
  return user?.fullName || student.fullName || student.name || 'Unnamed student';
};
const getStudentDisplayId = (student: ApiStudent | string) => {
  if (!student || typeof student === 'string') return student || '—';
  return student.studentId || student.admissionNumber || student._id.slice(-6).toUpperCase();
};
const getBatchName = (batch: ApiBatch | string) => {
  if (!batch || typeof batch === 'string') return 'Batch';
  return [batch.standard, batch.name || batch.code].filter(Boolean).join(' / ') || 'Batch';
};
const getSubjectName = (subject: ApiSubject | string) => {
  if (!subject || typeof subject === 'string') return 'Subject';
  return subject.name || subject.code || 'Subject';
};
const mapAttendance = (item: ApiAttendance): AttendanceRecord => {
  const student = item.studentId;
  const batch = item.batchId;
  const subject = item.subjectId;
  const studentMongoId = getObjectId(student);
  const batchName = getBatchName(batch);
  const subjectName = getSubjectName(subject);
  let branch = 'My branch';
  if (batch && typeof batch === 'object' && batch.branchId) {
    const branchValue = batch.branchId as { name?: string; branchName?: string; _id?: string } | string;
    if (typeof branchValue === 'object') branch = branchValue.name || branchValue.branchName || 'My branch';
  }
  return {
    id: item._id,
    studentMongoId,
    studentName: getStudentName(student),
    studentId: getStudentDisplayId(student),
    date: getDateLabel(item.date),
    branch,
    stdSub: `${batchName} / ${subjectName}`,
    status: item.status,
    checkIn: item.checkIn || '',
    remarks: item.remarks || '',
  };
};

export default function AttendancePage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;
  const isDesktop = width >= 900;

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('Present');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [individualAttendanceVisible, setIndividualAttendanceVisible] = useState(false);
  const [selectedStudentAttendance, setSelectedStudentAttendance] = useState<StudentAttendance | null>(null);
  const [individualSummary, setIndividualSummary] = useState<AttendanceSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('transparent');
        await NavigationBar.setButtonStyleAsync('dark');
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      } catch (error) {
        console.log('Navigation bar configuration error:', error);
      }
    };
    configureNavigationBar();
  }, []);

  const fetchAttendance = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setErrorMessage('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session could not be found. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const payload = await response.json();
      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Unable to load attendance records.');
      }
      const list: ApiAttendance[] = Array.isArray(payload.data) ? payload.data : [];
      setRecords(list.map(mapAttendance));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load attendance records.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const filters = ['All', ...Array.from(new Set(records.map((r) => r.branch).filter((b) => b && b !== 'My branch'))), ...STATUS_OPTIONS];
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch = !query || [record.studentName, record.studentId, record.branch, record.stdSub, record.date, record.status].some((value) => value.toLowerCase().includes(query));
      const matchesFilter = selectedFilter === 'All' || record.branch === selectedFilter || record.status === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [records, search, selectedFilter]);

  const uniqueStudents = useMemo(() => {
    const map = new Map<string, StudentAttendance>();
    for (const record of records) {
      if (!record.studentMongoId) continue;
      const current = map.get(record.studentMongoId) || {
        studentMongoId: record.studentMongoId, studentId: record.studentId,
        studentName: record.studentName, standardBatch: record.stdSub,
        branch: record.branch, totalClasses: 0, present: 0, absent: 0, late: 0, leave: 0, percentage: 0,
      };
      current.totalClasses += 1;
      if (record.status === 'Present') current.present += 1;
      if (record.status === 'Absent') current.absent += 1;
      if (record.status === 'Late') current.late += 1;
      if (record.status === 'Leave') current.leave += 1;
      current.percentage = current.totalClasses ? Math.round(((current.present + current.late) / current.totalClasses) * 100) : 0;
      map.set(record.studentMongoId, current);
    }
    return Array.from(map.values());
  }, [records]);

  const totalStudents = uniqueStudents.length;
  const presentStudents = records.filter((r) => r.status === 'Present').length;
  const absentStudents = records.filter((r) => r.status === 'Absent').length;
  const attendancePercentage = records.length ? Math.round((records.filter((r) => r.status === 'Present' || r.status === 'Late').length / records.length) * 100) : 0;

  const handleView = (record: AttendanceRecord) => { setSelectedRecord(record); setViewVisible(true); };
  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setEditStatus(record.status);
    setEditCheckIn(record.checkIn);
    setEditRemarks(record.remarks);
    setEditVisible(true);
  };

  const saveAttendance = async () => {
    if (!selectedRecord) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session could not be found. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/attendance/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ status: editStatus, checkIn: editCheckIn, remarks: editRemarks }),
      });
      const payload = await response.json();
      if (!response.ok || payload.success === false) throw new Error(payload.message || 'Unable to update attendance.');
      setEditVisible(false);
      await fetchAttendance(false);
      Alert.alert('Success', payload.message || 'Attendance updated successfully.');
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Unable to update attendance.');
    } finally { setSaving(false); }
  };

  const handleIndividualAttendance = async (student: StudentAttendance) => {
    setSelectedStudentAttendance(student);
    setIndividualSummary(null);
    setIndividualAttendanceVisible(true);
    setSummaryLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session could not be found. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/attendance/student/${student.studentMongoId}/summary`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const payload = await response.json();
      if (!response.ok || payload.success === false) throw new Error(payload.message || 'Unable to load student summary.');
      setIndividualSummary(payload.data as AttendanceSummary);
    } catch (error) {
      Alert.alert('Summary unavailable', error instanceof Error ? error.message : 'Unable to load student summary.');
    } finally { setSummaryLoading(false); }
  };

  const studentHistory = selectedStudentAttendance ? records.filter((r) => r.studentMongoId === selectedStudentAttendance.studentMongoId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8, minHeight: insets.top + 66 }, isMobile && styles.headerMobile, isTablet && styles.headerTablet]}>
          <TouchableOpacity style={[styles.backButton, isMobile && styles.backButtonMobile]} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]} numberOfLines={1}>Attendance</Text>
          <TouchableOpacity style={[styles.addButton, isMobile && styles.addButtonMobile]} onPress={() => router.push('/(admin)/add-attendance' as never)} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Add Attendance">
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
          <View style={styles.headingBlock}>
            <Text style={styles.pageTitle}>Attendance Management</Text>
            <Text style={styles.pageSubtitle}>View attendance by date, branch and class or batch.</Text>
          </View>

          {errorMessage ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#D94848" />
              <Text style={styles.emptyTitle}>Could not load attendance</Text>
              <Text style={styles.emptySubtitle}>{errorMessage}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => fetchAttendance()}><Text style={styles.modalButtonText}>Try Again</Text></TouchableOpacity>
            </View>
          ) : null}

          <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.summaryRow, !isDesktop && styles.summaryRowMobile]} style={!isDesktop ? styles.summaryScroll : undefined}>
            <View style={styles.summaryCard}><View style={styles.summaryMain}><View style={[styles.summaryIcon, styles.summaryPurple]}><MaterialCommunityIcons name="account-group-outline" size={20} color="#7040D5" /></View><View style={styles.summaryTextBlock}><Text style={styles.summaryLabel}>Students in records</Text><Text style={styles.summaryValue}>{loading ? '—' : totalStudents}</Text></View></View></View>
            <View style={styles.summaryCard}><View style={[styles.summaryIcon, styles.summaryGreen]}><MaterialCommunityIcons name="account-check-outline" size={20} color="#35B878" /></View><View><Text style={styles.summaryLabel}>Present records</Text><Text style={styles.summaryValue}>{loading ? '—' : presentStudents}</Text></View></View>
            <View style={styles.summaryCard}><View style={[styles.summaryIcon, styles.summaryOrange]}><MaterialCommunityIcons name="account-remove-outline" size={20} color="#F7941D" /></View><View><Text style={styles.summaryLabel}>Absent records</Text><Text style={styles.summaryValue}>{loading ? '—' : absentStudents}</Text></View></View>
            <View style={styles.summaryCard}><View style={[styles.summaryIcon, styles.summaryBlue]}><MaterialCommunityIcons name="percent-outline" size={20} color="#2675E8" /></View><View><Text style={styles.summaryLabel}>Present + Late</Text><Text style={styles.summaryValue}>{loading ? '—' : `${attendancePercentage}%`}</Text></View></View>
          </ScrollView>

          <View style={styles.individualCard}>
            <View style={styles.individualHeader}>
              <View style={styles.individualIcon}><MaterialCommunityIcons name="account-details-outline" size={20} color="#7040D5" /></View>
              <View style={styles.individualHeaderText}><Text style={styles.individualTitle}>Check Individual Attendance</Text><Text style={styles.individualSubtitle}>Choose a student to see their attendance summary.</Text></View>
              {uniqueStudents.length > 0 && <TouchableOpacity style={styles.checkAllButton} onPress={() => handleIndividualAttendance(uniqueStudents[0])} activeOpacity={0.8}><Text style={styles.checkAllButtonText}>Check</Text></TouchableOpacity>}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studentAttendanceRow}>
              {uniqueStudents.map((student) => (
                <TouchableOpacity key={student.studentMongoId} style={styles.studentAttendanceChip} onPress={() => handleIndividualAttendance(student)} activeOpacity={0.8}>
                  <View style={styles.chipIcon}><MaterialCommunityIcons name="account-outline" size={17} color="#7040D5" /></View>
                  <View style={styles.chipText}><Text style={styles.chipName} numberOfLines={1}>{student.studentName}</Text><Text style={styles.chipMeta}>{student.percentage}% • {student.present + student.late}/{student.totalClasses}</Text></View>
                </TouchableOpacity>
              ))}
              {!loading && uniqueStudents.length === 0 && <Text style={styles.emptySubtitle}>No students with attendance records yet.</Text>}
            </ScrollView>
          </View>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}><MaterialCommunityIcons name="magnify" size={19} color="#8792A4" /><TextInput value={search} onChangeText={setSearch} placeholder="Search student, branch or batch..." placeholderTextColor="#A1A9B7" style={styles.searchInput} />{search.length > 0 && <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}><MaterialCommunityIcons name="close-circle-outline" size={18} color="#9AA4B2" /></TouchableOpacity>}</View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {filters.map((filter) => { const active = selectedFilter === filter; return <TouchableOpacity key={filter} style={[styles.filterButton, active && styles.filterButtonActive]} onPress={() => setSelectedFilter(filter)} activeOpacity={0.8}><Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text></TouchableOpacity>; })}
            </ScrollView>
          </View>

          <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Attendance Records</Text><Text style={styles.sectionSubtitle}>{filteredRecords.length} records found</Text></View><TouchableOpacity onPress={() => { setRefreshing(true); fetchAttendance(false); }} activeOpacity={0.8}><MaterialCommunityIcons name="refresh" size={24} color="#7040D5" /></TouchableOpacity></View>

          {loading ? <View style={styles.emptyCard}><ActivityIndicator size="large" color="#7040D5" /><Text style={styles.emptySubtitle}>Loading attendance records...</Text></View> : filteredRecords.map((record) => (
            <TouchableOpacity key={record.id} style={styles.recordCard} activeOpacity={0.9} onPress={() => handleView(record)}>
              <View style={styles.recordTopRow}><View style={styles.studentIcon}><MaterialCommunityIcons name="account-outline" size={22} color="#7040D5" /></View><View style={styles.studentInfo}><Text style={styles.studentName} numberOfLines={1}>{record.studentName}</Text><Text style={styles.studentId}>{record.studentId}</Text></View><View style={[styles.statusBadge, record.status === 'Present' || record.status === 'Late' ? styles.presentBadge : styles.absentBadge]}><Text style={[styles.statusText, record.status === 'Present' || record.status === 'Late' ? styles.presentText : styles.absentText]}>{record.status}</Text></View></View>
              <View style={styles.detailsGrid}><View style={styles.detailItem}><Text style={styles.detailLabel}>DATE</Text><Text style={styles.detailValue}>{record.date}</Text></View><View style={styles.detailItem}><Text style={styles.detailLabel}>BRANCH</Text><Text style={styles.detailValue} numberOfLines={1}>{record.branch}</Text></View><View style={styles.detailItem}><Text style={styles.detailLabel}>STD / SUB</Text><Text style={styles.detailValue} numberOfLines={1}>{record.stdSub}</Text></View><View style={styles.detailItem}><Text style={styles.detailLabel}>STATUS</Text><Text style={[styles.detailValue, record.status === 'Present' || record.status === 'Late' ? styles.presentValue : styles.absentValue]}>{record.status}</Text></View></View>
              <View style={styles.actionRow}><TouchableOpacity style={styles.editButton} onPress={() => handleEdit(record)} activeOpacity={0.8}><MaterialCommunityIcons name="pencil-outline" size={15} color="#7040D5" /><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity><TouchableOpacity style={styles.viewButton} onPress={() => handleView(record)} activeOpacity={0.8}><MaterialCommunityIcons name="eye-outline" size={15} color="#7040D5" /><Text style={styles.viewButtonText}>View</Text></TouchableOpacity></View>
            </TouchableOpacity>
          ))}
          {!loading && !errorMessage && filteredRecords.length === 0 && <View style={styles.emptyCard}><MaterialCommunityIcons name="calendar-remove-outline" size={34} color="#A5AFBE" /><Text style={styles.emptyTitle}>No attendance records found</Text><Text style={styles.emptySubtitle}>Try changing the search or filter.</Text></View>}
        </ScrollView>

        <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
          <View style={styles.modalOverlay}><View style={styles.modalCard}><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Edit Attendance</Text><Text style={styles.modalSubtitle}>Update status and attendance details</Text></View><TouchableOpacity style={styles.modalClose} onPress={() => setEditVisible(false)} activeOpacity={0.8}><MaterialCommunityIcons name="close" size={20} color="#6F7D90" /></TouchableOpacity></View>
            {selectedRecord && <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.editStudentHeader}><View style={styles.modalStudentIcon}><MaterialCommunityIcons name="account-outline" size={26} color="#7040D5" /></View><View style={styles.modalStudentInfo}><Text style={styles.modalStudentName}>{selectedRecord.studentName}</Text><Text style={styles.modalStudentId}>{selectedRecord.studentId}</Text></View></View>
              <View style={styles.editField}><Text style={styles.editLabel}>DATE</Text><TextInput value={selectedRecord.date} editable={false} style={[styles.editInput, { opacity: 0.7 }]} /></View>
              <View style={styles.editField}><Text style={styles.editLabel}>BRANCH</Text><TextInput value={selectedRecord.branch} editable={false} style={[styles.editInput, { opacity: 0.7 }]} /></View>
              <View style={styles.editField}><Text style={styles.editLabel}>STD / SUBJECT</Text><TextInput value={selectedRecord.stdSub} editable={false} style={[styles.editInput, { opacity: 0.7 }]} /></View>
              <Text style={styles.editLabel}>ATTENDANCE STATUS</Text><View style={styles.editStatusRow}>{STATUS_OPTIONS.map((status) => <TouchableOpacity key={status} style={[styles.editStatusButton, editStatus === status && (status === 'Present' || status === 'Late' ? styles.editStatusActive : styles.editAbsentActive)]} onPress={() => setEditStatus(status)} activeOpacity={0.8}><Text style={[styles.editStatusText, editStatus === status && (status === 'Present' || status === 'Late' ? styles.editStatusActiveText : styles.editAbsentActiveText)]}>{status}</Text></TouchableOpacity>)}</View>
              <View style={styles.editField}><Text style={styles.editLabel}>CHECK-IN (OPTIONAL)</Text><TextInput value={editCheckIn} onChangeText={setEditCheckIn} placeholder="e.g. 09:05 AM" placeholderTextColor="#A1A9B7" style={styles.editInput} /></View>
              <View style={styles.editField}><Text style={styles.editLabel}>REMARKS (OPTIONAL)</Text><TextInput value={editRemarks} onChangeText={setEditRemarks} placeholder="Add remarks" placeholderTextColor="#A1A9B7" style={[styles.editInput, { minHeight: 76, textAlignVertical: 'top' }]} multiline /></View>
              <TouchableOpacity style={[styles.modalButton, saving && { opacity: 0.65 }]} onPress={saveAttendance} disabled={saving} activeOpacity={0.8}><Text style={styles.modalButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text></TouchableOpacity>
            </ScrollView>}
          </View></View>
        </Modal>

        <Modal visible={individualAttendanceVisible} transparent animationType="fade" onRequestClose={() => setIndividualAttendanceVisible(false)}>
          <View style={styles.modalOverlay}><View style={styles.modalCard}><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Individual Attendance</Text><Text style={styles.modalSubtitle}>Attendance summary and history</Text></View><TouchableOpacity style={styles.modalClose} onPress={() => setIndividualAttendanceVisible(false)} activeOpacity={0.8}><MaterialCommunityIcons name="close" size={20} color="#6F7D90" /></TouchableOpacity></View>
            {selectedStudentAttendance && <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.modalStudent}><View style={styles.modalStudentIcon}><MaterialCommunityIcons name="account-outline" size={26} color="#7040D5" /></View><View style={styles.modalStudentInfo}><Text style={styles.modalStudentName}>{selectedStudentAttendance.studentName}</Text><Text style={styles.modalStudentId}>{selectedStudentAttendance.studentId}</Text></View></View>
              <View style={styles.individualModalCourse}><Text style={styles.modalLabel}>STANDARD / BATCH</Text><Text style={styles.modalValue}>{selectedStudentAttendance.standardBatch}</Text></View><View style={styles.individualModalCourse}><Text style={styles.modalLabel}>BRANCH</Text><Text style={styles.modalValue}>{selectedStudentAttendance.branch}</Text></View>
              {summaryLoading ? <ActivityIndicator size="large" color="#7040D5" /> : <View style={styles.attendanceStatsGrid}>
                <View style={styles.attendanceStatBox}><Text style={styles.attendanceStatLabel}>TOTAL CLASSES</Text><Text style={styles.attendanceStatValue}>{individualSummary?.totalDays ?? 0}</Text></View>
                <View style={[styles.attendanceStatBox, styles.attendancePresentBox]}><Text style={styles.attendanceStatLabel}>PRESENT</Text><Text style={[styles.attendanceStatValue, styles.presentValue]}>{individualSummary?.present ?? 0}</Text></View>
                <View style={[styles.attendanceStatBox, styles.attendanceAbsentBox]}><Text style={styles.attendanceStatLabel}>ABSENT</Text><Text style={[styles.attendanceStatValue, styles.absentValue]}>{individualSummary?.absent ?? 0}</Text></View>
                <View style={[styles.attendanceStatBox, styles.attendancePercentageBox]}><Text style={styles.attendanceStatLabel}>ATTENDANCE</Text><Text style={[styles.attendanceStatValue, styles.attendancePercentageText]}>{individualSummary?.percentage ?? 0}%</Text></View>
                <View style={styles.attendanceStatBox}><Text style={styles.attendanceStatLabel}>LATE</Text><Text style={styles.attendanceStatValue}>{individualSummary?.late ?? 0}</Text></View><View style={styles.attendanceStatBox}><Text style={styles.attendanceStatLabel}>LEAVE</Text><Text style={styles.attendanceStatValue}>{individualSummary?.leave ?? 0}</Text></View>
              </View>}
              <Text style={styles.historyTitle}>Attendance History</Text>
              {studentHistory.map((record) => <View key={record.id} style={styles.historyRow}><View><Text style={styles.historyDate}>{record.date}</Text><Text style={styles.historyLabel}>{record.stdSub}</Text></View><View style={[styles.historyStatus, record.status === 'Present' || record.status === 'Late' ? styles.presentBadge : styles.absentBadge]}><Text style={[styles.statusText, record.status === 'Present' || record.status === 'Late' ? styles.presentText : styles.absentText]}>{record.status}</Text></View></View>)}
              {studentHistory.length === 0 && <Text style={styles.emptySubtitle}>No attendance history found.</Text>}
              <TouchableOpacity style={styles.modalButton} onPress={() => setIndividualAttendanceVisible(false)} activeOpacity={0.8}><Text style={styles.modalButtonText}>Close</Text></TouchableOpacity>
            </ScrollView>}
          </View></View>
        </Modal>

        <Modal visible={viewVisible} transparent animationType="fade" onRequestClose={() => setViewVisible(false)}>
          <View style={styles.modalOverlay}><View style={styles.modalCard}><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Attendance Details</Text><Text style={styles.modalSubtitle}>Attendance record information</Text></View><TouchableOpacity style={styles.modalClose} onPress={() => setViewVisible(false)} activeOpacity={0.8}><MaterialCommunityIcons name="close" size={20} color="#6F7D90" /></TouchableOpacity></View>
            {selectedRecord && <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.modalStudent}><View style={styles.modalStudentIcon}><MaterialCommunityIcons name="account-outline" size={26} color="#7040D5" /></View><View><Text style={styles.modalStudentName}>{selectedRecord.studentName}</Text><Text style={styles.modalStudentId}>{selectedRecord.studentId}</Text></View></View>
              <View style={styles.modalDetailsGrid}><View style={styles.modalDetail}><Text style={styles.modalLabel}>DATE</Text><Text style={styles.modalValue}>{selectedRecord.date}</Text></View><View style={styles.modalDetail}><Text style={styles.modalLabel}>BRANCH</Text><Text style={styles.modalValue}>{selectedRecord.branch}</Text></View><View style={styles.modalDetail}><Text style={styles.modalLabel}>STD / SUB</Text><Text style={styles.modalValue}>{selectedRecord.stdSub}</Text></View><View style={styles.modalDetail}><Text style={styles.modalLabel}>STATUS</Text><Text style={[styles.modalValue, selectedRecord.status === 'Present' || selectedRecord.status === 'Late' ? styles.presentValue : styles.absentValue]}>{selectedRecord.status}</Text></View><View style={styles.modalDetail}><Text style={styles.modalLabel}>CHECK-IN</Text><Text style={styles.modalValue}>{selectedRecord.checkIn || '—'}</Text></View><View style={styles.modalDetail}><Text style={styles.modalLabel}>REMARKS</Text><Text style={styles.modalValue}>{selectedRecord.remarks || '—'}</Text></View></View>
              <TouchableOpacity style={styles.modalButton} onPress={() => setViewVisible(false)} activeOpacity={0.8}><Text style={styles.modalButtonText}>Close</Text></TouchableOpacity>
            </ScrollView>}
          </View></View>
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
    width: '100%',
    backgroundColor: '#6D35D8',
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerMobile: {
    height: 80,
    paddingHorizontal: 14,
  },

  headerTablet: {
    height: 64,
    paddingHorizontal: 20,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonMobile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 12,
  },

  headerTitle: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 26,
    color: '#FFFFFF',
    textAlign: 'left',
  },

  headerTitleMobile: {
    fontSize: 20,
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  addButtonMobile: {
    width: 40,
    height: 40,
    borderRadius: 11,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,

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
