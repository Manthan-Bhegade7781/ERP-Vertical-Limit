import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';

type Batch = {
  id: string;
  name: string;
  standard: string;
  code?: string;
};

type Subject = {
  id: string;
  name: string;
  code?: string;
};

type Student = {
  id: string;
  studentCode: string;
  name: string;
  batchId: string;
  status: AttendanceStatus;
};

type BatchSubjectAssignment = {
  batchId: string;
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  status: string;
};

const statusOptions: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Leave'];

const getId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id || value.id || '');
};

const getArray = (payload: any, keys: string[] = []): any[] => {
  for (const key of keys) {
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const todayLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapBatch = (raw: any): Batch => ({
  id: getId(raw),
  name: String(raw?.name || raw?.batchName || raw?.code || 'Unnamed batch'),
  standard: String(raw?.standard || raw?.course?.name || ''),
  code: String(raw?.code || ''),
});

const mapStudent = (raw: any): Student => {
  const user = raw?.userId && typeof raw.userId === 'object' ? raw.userId : {};
  const batch = raw?.batchId && typeof raw.batchId === 'object' ? raw.batchId : {};
  return {
    id: getId(raw),
    studentCode: String(raw?.studentId || ''),
    name: String(user?.fullName || raw?.fullName || 'Unknown student'),
    batchId: getId(batch) || String(raw?.batchId || ''),
    status: 'Present',
  };
};

const mapAssignment = (raw: any): BatchSubjectAssignment => {
  const batch = raw?.batchId && typeof raw.batchId === 'object' ? raw.batchId : {};
  const subject = raw?.subjectId && typeof raw.subjectId === 'object' ? raw.subjectId : {};
  return {
    batchId: getId(batch) || String(raw?.batchId || ''),
    subjectId: getId(subject) || String(raw?.subjectId || ''),
    subjectName: String(subject?.name || raw?.subject?.name || raw?.subjectName || ''),
    subjectCode: String(subject?.code || raw?.subject?.code || ''),
    status: String(raw?.status || 'active').toLowerCase(),
  };
};

export default function AddAttendancePage() {
  const [date, setDate] = useState(todayLocal());
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<BatchSubjectAssignment[]>([]);
  const [batchId, setBatchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const apiRequest = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    if (!token) throw new Error('Your session has expired. Please log in again.');
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.message || `Request failed (${response.status})`);
    }
    return payload;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [batchPayload, studentPayload, subjectPayload] = await Promise.all([
        apiRequest('/batches'),
        apiRequest('/students'),
        apiRequest('/subjects'),
      ]);

      const batchRows = getArray(batchPayload, ['batches'])
        .map(mapBatch)
        .filter((item) => item.id);
      const studentRows = getArray(studentPayload, ['students', 'data'])
        // Only include students explicitly marked active by the backend.
        .filter((raw: any) => {
          const status = String(raw?.status ?? raw?.userId?.status ?? '').trim().toLowerCase();
          return status === 'active';
        })
        .map(mapStudent)
        .filter((item) => item.id && item.batchId && item.name);
      const subjectRows = getArray(subjectPayload, ['subjects'])
        .map((raw: any): Subject => ({
          id: getId(raw),
          name: String(raw?.name || ''),
          code: String(raw?.code || ''),
        }))
        .filter((item) => item.id && item.name);

      setBatches(batchRows);
      setStudents(studentRows);
      setSubjects(subjectRows);

      if (batchRows.length) {
        setBatchId((current) => batchRows.some((item) => item.id === current) ? current : batchRows[0].id);
      } else {
        setBatchId('');
      }

      // Load each batch's assigned subjects. These are the subjects that can
      // actually be marked for that batch, rather than an unrelated subject list.
      const assignmentPayloads = await Promise.all(
        batchRows.map(async (batch) => {
          try {
            const payload = await apiRequest(`/batch-subjects/batch/${batch.id}`);
            return getArray(payload, ['batchSubjects', 'assignments']).map(mapAssignment);
          } catch (error) {
            console.warn(`Could not load subjects for batch ${batch.id}`, error);
            return [] as BatchSubjectAssignment[];
          }
        }),
      );
      setAssignments(assignmentPayloads.flat());
    } catch (error: any) {
      const message = error?.message || 'Please check your connection and try again.';
      setLoadError(message);
      Alert.alert('Unable to Load Attendance Data', message);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedBatch = useMemo(
    () => batches.find((item) => item.id === batchId),
    [batches, batchId],
  );

  const availableSubjects = useMemo(() => {
    const linked = assignments
      .filter((item) => item.batchId === batchId && item.subjectId && item.status === 'active')
      .map((item) => ({ id: item.subjectId, name: item.subjectName, code: item.subjectCode || '' }))
      .filter((item) => item.name);
    // Only use subjects assigned to this batch. If the assignments endpoint
    // returns none, don't silently offer every master subject.
    return linked;
  }, [assignments, batchId]);

  const visibleStudents = useMemo(
    () => students.filter((student) => student.batchId === batchId),
    [students, batchId],
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return visibleStudents;
    return visibleStudents.filter((student) =>
      student.name.toLowerCase().includes(query) ||
      student.studentCode.toLowerCase().includes(query),
    );
  }, [visibleStudents, studentSearch]);

  useEffect(() => {
    if (!availableSubjects.some((item) => item.id === subjectId)) {
      setSubjectId(availableSubjects[0]?.id || '');
    }
  }, [availableSubjects, subjectId]);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId ? { ...student, status } : student,
      ),
    );
  };

  const saveAttendance = async () => {
    if (!date.trim() || !batchId || !subjectId) {
      Alert.alert('Required Fields', 'Please select a date, batch, and subject.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim()) || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
      Alert.alert('Invalid Date', 'Enter the date in YYYY-MM-DD format.');
      return;
    }
    if (!visibleStudents.length) {
      Alert.alert('No Students', 'There are no students assigned to this batch.');
      return;
    }

    Alert.alert(
      'Save Attendance',
      `Save attendance for ${visibleStudents.length} student(s) in ${selectedBatch?.name || 'this batch'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            setSaving(true);
            try {
              // The backend endpoint creates one attendance record per student.
              // Sequential requests avoid sending a burst of writes to the API.
              for (const student of visibleStudents) {
                await apiRequest('/attendance', {
                  method: 'POST',
                  body: JSON.stringify({
                    studentId: student.id,
                    batchId,
                    subjectId,
                    date: new Date(`${date}T00:00:00`).toISOString(),
                    status: student.status,
                  }),
                });
              }
              Alert.alert('Attendance Saved', 'Attendance has been marked successfully.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert(
                'Unable to Save Attendance',
                error?.message || 'Attendance could not be saved. Please try again. Some records may already have been saved.',
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Add Attendance</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Mark Attendance</Text>
        <Text style={styles.pageSubtitle}>Select the class details and mark attendance for each student.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Attendance Details</Text>
          <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="calendar-outline" size={18} color="#7040D5" />
            <TextInput
              value={date}
              onChangeText={setDate}
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A2AABB"
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <Text style={styles.label}>Batch <Text style={styles.required}>*</Text></Text>
          {loading ? (
            <ActivityIndicator color="#7040D5" style={styles.loader} />
          ) : batches.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
              {batches.map((item) => (
                <Option
                  key={item.id}
                  label={item.name}
                  selected={batchId === item.id}
                  onPress={() => setBatchId(item.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No batches are available for your account.</Text>
          )}

          {selectedBatch?.standard ? <Text style={styles.batchHint}>{selectedBatch.standard}{selectedBatch.code ? ` · ${selectedBatch.code}` : ''}</Text> : null}

          <Text style={styles.label}>Subject <Text style={styles.required}>*</Text></Text>
          {loading ? (
            <ActivityIndicator color="#7040D5" style={styles.loader} />
          ) : availableSubjects.length ? (
            <View style={styles.wrap}>
              {availableSubjects.map((item) => (
                <Option
                  key={item.id}
                  label={item.name}
                  selected={subjectId === item.id}
                  onPress={() => setSubjectId(item.id)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No active subjects are assigned to this batch.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student Attendance</Text>
          <Text style={styles.helper}>Only active students are shown. Search by student name or ID, then tap a status.</Text>
          <View style={[styles.inputWrapper, styles.searchWrapper]}>
            <MaterialCommunityIcons name="magnify" size={19} color="#8792A4" />
            <TextInput
              value={studentSearch}
              onChangeText={setStudentSearch}
              style={styles.searchInput}
              placeholder="Search student name or ID"
              placeholderTextColor="#A2AABB"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {!!studentSearch && (
              <TouchableOpacity onPress={() => setStudentSearch('')} accessibilityLabel="Clear student search">
                <MaterialCommunityIcons name="close-circle" size={18} color="#8792A4" />
              </TouchableOpacity>
            )}
          </View>
          {loading ? (
            <ActivityIndicator color="#7040D5" style={styles.loader} />
          ) : filteredStudents.length ? (
            filteredStudents.map((student) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account-outline" size={17} color="#7040D5" />
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                    {!!student.studentCode && <Text style={styles.studentCode}>{student.studentCode}</Text>}
                  </View>
                </View>
                <View style={styles.statusWrap}>
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.statusButton, student.status === status && styles.statusActive]}
                      onPress={() => updateStatus(student.id, status)}
                      activeOpacity={0.8}
                    >
                      {student.status === status && <MaterialCommunityIcons name="check" size={13} color="#7040D5" />}
                      <Text style={[styles.statusText, student.status === status && styles.statusTextActive]}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {visibleStudents.length
                ? 'No active students match your search.'
                : 'No active students are assigned to the selected batch.'}
            </Text>
          )}
        </View>

        {loadError ? (
          <TouchableOpacity style={styles.retryButton} onPress={loadData} activeOpacity={0.8}>
            <MaterialCommunityIcons name="refresh" size={16} color="#7040D5" />
            <Text style={styles.retryText}>Retry loading data</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} activeOpacity={0.8} disabled={saving}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, (saving || loading || !visibleStudents.length || !subjectId) && styles.saveButtonDisabled]}
            onPress={saveAttendance}
            activeOpacity={0.85}
            disabled={saving || loading || !visibleStudents.length || !subjectId}
          >
            {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />}
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Attendance'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.option, selected && styles.optionActive]} onPress={onPress} activeOpacity={0.8}>
      {selected && <MaterialCommunityIcons name="check-circle" size={14} color="#7040D5" />}
      <Text style={[styles.optionText, selected && styles.optionTextActive]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { minHeight: 64, backgroundColor: '#7040D5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, minWidth: 0, fontFamily: 'PoppinsSemiBold', fontSize: 20, color: '#FFFFFF' },
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 28, paddingBottom: 30 },
  pageTitle: { fontFamily: 'PoppinsBold', fontSize: 20, color: '#172033' },
  pageSubtitle: { fontFamily: 'PoppinsRegular', fontSize: 11, lineHeight: 18, color: '#7B8496', marginTop: 5, marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E7E8ED', padding: 16, marginBottom: 14 },
  sectionTitle: { fontFamily: 'PoppinsSemiBold', fontSize: 16, color: '#172033' },
  helper: { fontFamily: 'PoppinsRegular', fontSize: 10, color: '#8A93A4', marginTop: 3, marginBottom: 4 },
  label: { fontFamily: 'PoppinsMedium', fontSize: 11, color: '#59657A', marginTop: 13, marginBottom: 5 },
  required: { color: '#D84B63' },
  inputWrapper: { minHeight: 52, borderRadius: 10, borderWidth: 1, borderColor: '#E0E3EA', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11 },
  input: { flex: 1, minWidth: 0, minHeight: 50, marginLeft: 8, paddingVertical: 0, color: '#172033', fontFamily: 'PoppinsRegular', fontSize: 10 },
  searchWrapper: { marginTop: 12, marginBottom: 8, minHeight: 44 },
  searchInput: { flex: 1, minWidth: 0, minHeight: 42, marginLeft: 8, paddingVertical: 0, color: '#172033', fontFamily: 'PoppinsRegular', fontSize: 11 },
  options: { gap: 7, paddingBottom: 2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  option: { minHeight: 40, maxWidth: '100%', paddingHorizontal: 10, borderRadius: 9, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E5EC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  optionActive: { backgroundColor: '#F1EAFF', borderColor: '#7040D5' },
  optionText: { fontFamily: 'PoppinsMedium', fontSize: 10, color: '#687386' },
  optionTextActive: { fontFamily: 'PoppinsSemiBold', color: '#7040D5' },
  studentCard: { borderWidth: 1, borderColor: '#E7E9EF', borderRadius: 12, padding: 10, marginTop: 8 },
  studentHeader: { flexDirection: 'row', alignItems: 'center', minWidth: 0, marginBottom: 8 },
  avatar: { width: 31, height: 31, borderRadius: 10, backgroundColor: '#F1EAFF', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  studentInfo: { flex: 1, minWidth: 0 },
  studentName: { fontFamily: 'PoppinsMedium', fontSize: 10, color: '#172033' },
  studentCode: { fontFamily: 'PoppinsRegular', fontSize: 9, color: '#8A93A4', marginTop: 2 },
  statusWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  statusButton: { minHeight: 32, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E3EA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  statusActive: { backgroundColor: '#F1EAFF', borderColor: '#7040D5' },
  statusText: { fontFamily: 'PoppinsMedium', fontSize: 9, color: '#687386' },
  statusTextActive: { fontFamily: 'PoppinsSemiBold', color: '#7040D5' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  cancelButton: { flex: 1, minHeight: 48, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E3EA', alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: 'PoppinsSemiBold', fontSize: 10, color: '#687386' },
  saveButton: { flex: 1.4, minHeight: 48, borderRadius: 11, backgroundColor: '#7040D5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  saveButtonDisabled: { opacity: 0.6 },
  saveText: { fontFamily: 'PoppinsSemiBold', fontSize: 10, color: '#FFFFFF' },
  emptyText: { fontFamily: 'PoppinsRegular', fontSize: 11, color: '#8792A4', marginTop: 10, lineHeight: 18 },
  batchHint: { fontFamily: 'PoppinsRegular', fontSize: 10, color: '#8792A4', marginTop: 6 },
  loader: { marginVertical: 14 },
  retryButton: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, marginBottom: 8 },
  retryText: { fontFamily: 'PoppinsSemiBold', fontSize: 11, color: '#7040D5' },
});
