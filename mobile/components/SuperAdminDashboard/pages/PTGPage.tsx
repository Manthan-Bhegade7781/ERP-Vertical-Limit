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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type Status = 'Scheduled' | 'Completed' | 'Pending';
type ApiStudent = {
  _id: string;
  studentId?: string;
  guardianName?: string;
  guardianMobile?: string;
  userId?: { _id?: string; fullName?: string; email?: string; mobileNumber?: string } | null;
  batchId?: { _id?: string; name?: string; code?: string; standard?: string; academicYear?: string } | null;
};
type ApiTeacher = {
  _id: string;
  employeeId?: string;
  userId?: { _id?: string; fullName?: string; email?: string; mobileNumber?: string } | null;
};
type ApiMeeting = {
  _id: string;
  studentId: ApiStudent | string;
  teacherId: ApiTeacher | string;
  meetingDate: string;
  purpose: string;
  notes?: string;
  status: Status;
  createdAt?: string;
};
type PTGRecord = {
  id: string;
  student: string;
  studentId: string;
  parent: string;
  teacher: string;
  course: string;
  batch: string;
  meetingDate: string;
  rawMeetingDate: string;
  purpose: string;
  notes: string;
  status: Status;
  studentObjectId: string;
  teacherObjectId: string;
};
type Stats = { total: number; scheduled: number; completed: number; pending: number; upcoming: number };
type FormState = { studentId: string; teacherId: string; meetingDate: string; purpose: string; notes: string; status: Status };

const filters = ['All', 'Scheduled', 'Completed', 'Pending'] as const;
const emptyStats: Stats = { total: 0, scheduled: 0, completed: 0, pending: 0, upcoming: 0 };
const emptyForm: FormState = { studentId: '', teacherId: '', meetingDate: '', purpose: '', notes: '', status: 'Scheduled' };

function getName(value: any, fallback: string) {
  if (!value) return fallback;
  if (typeof value === 'string') return fallback;
  return value.userId?.fullName || fallback;
}
function getId(value: any) {
  return typeof value === 'string' ? value : value?._id || '';
}
function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '—';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
function toLocalInputDate(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function mapMeeting(meeting: ApiMeeting): PTGRecord {
  const student: any = meeting.studentId;
  const teacher: any = meeting.teacherId;
  const batch = student && typeof student === 'object' ? student.batchId : null;
  return {
    id: meeting._id,
    student: getName(student, 'Student'),
    studentId: student && typeof student === 'object' ? student.studentId || 'Student ID unavailable' : 'Student details unavailable',
    parent: student && typeof student === 'object' ? student.guardianName || 'Guardian not added' : 'Guardian details unavailable',
    teacher: getName(teacher, 'Teacher'),
    course: batch?.standard || '—',
    batch: batch?.name || batch?.code || 'Batch not assigned',
    meetingDate: formatDate(meeting.meetingDate),
    rawMeetingDate: meeting.meetingDate,
    purpose: meeting.purpose || '—',
    notes: meeting.notes || '',
    status: meeting.status,
    studentObjectId: getId(meeting.studentId),
    teacherObjectId: getId(meeting.teacherId),
  };
}

export default function PTGPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const contentWidth = isDesktop ? Math.min(width - 250 - 40, 1500) : width - 32;

  const [records, setRecords] = useState<PTGRecord[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [editingRecord, setEditingRecord] = useState<PTGRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<PTGRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const token = await getToken();
    if (!token) throw new Error('Your session has expired. Please sign in again.');
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.success === false) {
      throw new Error(body.message || `Request failed (${response.status}).`);
    }
    return body;
  }, []);

  const loadPage = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [meetingResponse, statsResponse, studentResponse, teacherResponse] = await Promise.all([
        request('/ptg?limit=100'),
        request('/ptg/stats'),
        request('/ptg/students'),
        request('/ptg/teachers'),
      ]);
      const meetingData = meetingResponse.data?.meetings ?? meetingResponse.data ?? [];
      setRecords(Array.isArray(meetingData) ? meetingData.map(mapMeeting) : []);
      setStats({ ...emptyStats, ...(statsResponse.data || {}) });
      setStudents(Array.isArray(studentResponse.data) ? studentResponse.data : []);
      setTeachers(Array.isArray(teacherResponse.data) ? teacherResponse.data : []);
    } catch (e: any) {
      setError(e?.message || 'Unable to load PTG data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [request]);

  useEffect(() => { loadPage(); }, [loadPage]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesFilter = selectedFilter === 'All' || record.status === selectedFilter;
      const matchesSearch = !query || [record.student, record.studentId, record.parent, record.teacher, record.course, record.batch, record.purpose].some((v) => v.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [records, search, selectedFilter]);

  const handleBack = () => router.replace('/(tabs)');

  const openCreate = () => {
    setEditingRecord(null);
    setForm({ ...emptyForm, meetingDate: toLocalInputDate() });
    setStudentSearch('');
    setTeacherSearch('');
    setFormVisible(true);
  };

  const openEdit = (record: PTGRecord) => {
    setEditingRecord(record);
    setForm({
      studentId: record.studentObjectId,
      teacherId: record.teacherObjectId,
      meetingDate: toLocalInputDate(new Date(record.rawMeetingDate)),
      purpose: record.purpose === '—' ? '' : record.purpose,
      notes: record.notes,
      status: record.status,
    });
    setStudentSearch(record.student || '');
    setTeacherSearch(record.teacher || '');
    setFormVisible(true);
  };

  const selectedStudent = students.find((s) => s._id === form.studentId);
  const selectedTeacher = teachers.find((t) => t._id === form.teacherId);

  // Match the searchable student selector used by CollectFeePage.
  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query || selectedStudent) return [];
    return students.filter((student) => {
      const values = [
        student.userId?.fullName || '',
        student.studentId || '',
        student.batchId?.name || '',
        student.batchId?.code || '',
      ];
      return values.some((value) => value.toLowerCase().includes(query));
    }).slice(0, 8);
  }, [students, studentSearch, selectedStudent]);

  const filteredTeachers = useMemo(() => {
    const query = teacherSearch.trim().toLowerCase();
    if (!query || selectedTeacher) return [];
    return teachers.filter((teacher) => {
      const values = [
        teacher.userId?.fullName || '',
        teacher.employeeId || '',
        teacher.userId?.email || '',
        teacher.userId?.mobileNumber || '',
      ];
      return values.some((value) => value.toLowerCase().includes(query));
    }).slice(0, 8);
  }, [teachers, teacherSearch, selectedTeacher]);

  const saveMeeting = async () => {
    if (!form.studentId || !form.teacherId || !form.meetingDate.trim() || !form.purpose.trim()) {
      Alert.alert('Missing information', 'Please select a student and teacher, and enter the meeting date and purpose.');
      return;
    }
    const date = new Date(form.meetingDate);
    if (Number.isNaN(date.getTime())) {
      Alert.alert('Invalid date', 'Enter a valid date and time, for example 2026-10-20T10:30.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        studentId: form.studentId,
        teacherId: form.teacherId,
        meetingDate: date.toISOString(),
        purpose: form.purpose.trim(),
        notes: form.notes.trim(),
      };
      let response;
      if (editingRecord) {
        payload.status = form.status;
        response = await request(`/ptg/${editingRecord.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        response = await request('/ptg', { method: 'POST', body: JSON.stringify(payload) });
      }
      setFormVisible(false);
      await loadPage(true);
      Alert.alert('Success', response.message || (editingRecord ? 'PTG meeting updated.' : 'PTG meeting scheduled.'));
    } catch (e: any) {
      Alert.alert('Unable to save', e?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteMeeting = (record: PTGRecord) => {
    Alert.alert('Delete PTG meeting?', `This will delete the meeting for ${record.student}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await request(`/ptg/${record.id}`, { method: 'DELETE' });
          await loadPage(true);
          Alert.alert('Deleted', 'PTG meeting deleted successfully.');
        } catch (e: any) {
          Alert.alert('Unable to delete', e?.message || 'Please try again.');
        }
      } },
    ]);
  };

  const setStatus = async (status: Status) => {
    if (!viewRecord) return;
    setSaving(true);
    try {
      await request(`/ptg/${viewRecord.id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      setViewVisible(false);
      await loadPage(true);
      Alert.alert('Success', `Meeting marked ${status.toLowerCase()}.`);
    } catch (e: any) {
      Alert.alert('Unable to update status', e?.message || 'Please try again.');
    } finally { setSaving(false); }
  };

  const studentLabel = (s: ApiStudent) => `${s.userId?.fullName || 'Unnamed student'} • ${s.studentId || 'No ID'}`;
  const teacherLabel = (t: ApiTeacher) => `${t.userId?.fullName || 'Unnamed teacher'} • ${t.employeeId || 'No ID'}`;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}><Text style={styles.headerTitle}>PTG</Text></View>
          <TouchableOpacity style={styles.headerAction} onPress={openCreate} activeOpacity={0.85}>
            <MaterialCommunityIcons name="plus" size={18} color="#7040D5" />
            <Text style={styles.headerActionText}>Schedule PTG</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <Text style={styles.sectionTitle}>PTG Management</Text>
              <Text style={styles.sectionSubtitle}>Manage parent, student and teacher interactions</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={() => loadPage(true)} disabled={refreshing}>
              {refreshing ? <ActivityIndicator size="small" color="#7040D5" /> : <MaterialCommunityIcons name="refresh" size={16} color="#7040D5" />}
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
            <View style={[styles.statCardWrapper, isDesktop && styles.statCardWrapperDesktop]}><PTGStatCard icon="account-group-outline" title="Total Meetings" value={String(stats.total)} type="purple" /></View>
            <View style={[styles.statCardWrapper, isDesktop && styles.statCardWrapperDesktop]}><PTGStatCard icon="calendar-clock" title="Scheduled" value={String(stats.scheduled)} type="blue" /></View>
            <View style={[styles.statCardWrapper, isDesktop && styles.statCardWrapperDesktop]}><PTGStatCard icon="check-circle-outline" title="Completed" value={String(stats.completed)} type="green" /></View>
            <View style={[styles.statCardWrapper, isDesktop && styles.statCardWrapperDesktop]}><PTGStatCard icon="clock-alert-outline" title="Pending" value={String(stats.pending)} type="orange" /></View>
          </View>

          {error ? <View style={styles.feedbackBox}><Text style={styles.feedbackText}>{error}</Text><TouchableOpacity style={[styles.primaryButton, { marginTop: 12, alignSelf: 'center' }]} onPress={() => loadPage()}><Text style={styles.primaryButtonText}>Try again</Text></TouchableOpacity></View> : null}

          <View style={styles.filterCard}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={21} color="#8A94A6" />
              <TextInput value={search} onChangeText={setSearch} placeholder="Search student, parent, teacher..." placeholderTextColor="#A0A8B7" style={styles.searchInput} />
              {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}><MaterialCommunityIcons name="close-circle" size={19} color="#A0A8B7" /></TouchableOpacity>}
            </View>
            <View style={styles.filterRow}>
              {filters.map((filter) => {
                const active = selectedFilter === filter;
                return <TouchableOpacity key={filter} style={[styles.filterButton, active && styles.filterButtonActive]} onPress={() => setSelectedFilter(filter)} activeOpacity={0.8}><Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text></TouchableOpacity>;
              })}
            </View>
          </View>

          <View style={styles.listHeader}>
            <View><Text style={styles.listTitle}>PTG Meetings</Text><Text style={styles.listSubtitle}>{filteredRecords.length} meeting{filteredRecords.length === 1 ? '' : 's'} found</Text></View>
            <View style={styles.sessionBadge}><MaterialCommunityIcons name="calendar-check-outline" size={16} color="#7040D5" /><Text style={styles.sessionBadgeText}>Live data</Text></View>
          </View>

          {loading ? <View style={styles.feedbackBox}><ActivityIndicator size="large" color="#7040D5" /><Text style={[styles.feedbackText, { marginTop: 10 }]}>Loading PTG meetings...</Text></View> : filteredRecords.length === 0 ? (
            <View style={styles.emptyCard}><View style={styles.emptyIcon}><MaterialCommunityIcons name="account-search-outline" size={34} color="#7040D5" /></View><Text style={styles.emptyTitle}>{records.length === 0 ? 'No PTG meetings yet' : 'No PTG meetings found'}</Text><Text style={styles.emptySubtitle}>{records.length === 0 ? 'Schedule your first meeting using the button above.' : 'Try changing your search or filter.'}</Text></View>
          ) : <View style={[styles.recordGrid, isDesktop && styles.recordGridDesktop]}>{filteredRecords.map((record) => <PTGCard key={record.id} record={record} isDesktop={isDesktop} onView={() => { setViewRecord(record); setViewVisible(true); }} onEdit={() => openEdit(record)} onDelete={() => deleteMeeting(record)} />)}</View>}
        </View>
      </ScrollView>

      {/* CREATE / EDIT MODAL */}
      <Modal visible={formVisible} transparent animationType="fade" onRequestClose={() => !saving && setFormVisible(false)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{editingRecord ? 'Edit PTG Meeting' : 'Schedule PTG Meeting'}</Text><TouchableOpacity style={styles.modalClose} onPress={() => !saving && setFormVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#667085" /></TouchableOpacity></View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.formLabel}>Student *</Text>
            <View style={styles.searchField}>
              <MaterialCommunityIcons name="account-search-outline" size={19} color="#7040D5" />
              <TextInput
                value={studentSearch}
                onChangeText={(value) => {
                  setStudentSearch(value);
                  setForm((current) => ({ ...current, studentId: '' }));
                }}
                placeholder="Search by student name or ID"
                placeholderTextColor="#A0A8B7"
                style={styles.searchFieldInput}
                autoCapitalize="none"
              />
              {!!studentSearch && <TouchableOpacity onPress={() => { setStudentSearch(''); setForm((current) => ({ ...current, studentId: '' })); }}><MaterialCommunityIcons name="close-circle" size={19} color="#8993A4" /></TouchableOpacity>}
            </View>
            {selectedStudent ? (
              <View style={styles.selectedPerson}>
                <MaterialCommunityIcons name="account-check" size={20} color="#22945F" />
                <View style={styles.selectedPersonDetails}>
                  <Text style={styles.selectedPersonName}>{selectedStudent.userId?.fullName || 'Unnamed student'}</Text>
                  <Text style={styles.choiceItemSubtext}>{selectedStudent.studentId || 'No student ID'}{selectedStudent.batchId?.name ? ` • ${selectedStudent.batchId.name}` : ''}</Text>
                  {selectedStudent.guardianName ? <Text style={styles.choiceItemSubtext}>Guardian: {selectedStudent.guardianName}{selectedStudent.guardianMobile ? ` • ${selectedStudent.guardianMobile}` : ''}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => { setForm((current) => ({ ...current, studentId: '' })); setStudentSearch(''); }}><MaterialCommunityIcons name="close-circle" size={21} color="#7B8496" /></TouchableOpacity>
              </View>
            ) : studentSearch.trim().length > 0 ? (
              <View style={styles.searchResultsBox}>
                {filteredStudents.length === 0 ? <Text style={styles.emptySearchText}>No matching active students found.</Text> : filteredStudents.map((student) => (
                  <TouchableOpacity key={student._id} style={styles.searchResultItem} onPress={() => { setForm((current) => ({ ...current, studentId: student._id })); setStudentSearch(student.userId?.fullName || ''); }} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="account-circle-outline" size={23} color="#7040D5" />
                    <View style={styles.selectedPersonDetails}><Text style={styles.searchResultName}>{student.userId?.fullName || 'Unnamed student'}</Text><Text style={styles.choiceItemSubtext}>{student.studentId || 'No student ID'}{student.batchId?.name ? ` • ${student.batchId.name}` : ''}</Text></View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : <Text style={styles.searchHelperText}>{students.length} active student(s) available. Start typing to search.</Text>}

            <Text style={styles.formLabel}>Teacher *</Text>
            <View style={styles.searchField}>
              <MaterialCommunityIcons name="account-search-outline" size={19} color="#7040D5" />
              <TextInput
                value={teacherSearch}
                onChangeText={(value) => {
                  setTeacherSearch(value);
                  setForm((current) => ({ ...current, teacherId: '' }));
                }}
                placeholder="Search by teacher name or employee ID"
                placeholderTextColor="#A0A8B7"
                style={styles.searchFieldInput}
                autoCapitalize="none"
              />
              {!!teacherSearch && <TouchableOpacity onPress={() => { setTeacherSearch(''); setForm((current) => ({ ...current, teacherId: '' })); }}><MaterialCommunityIcons name="close-circle" size={19} color="#8993A4" /></TouchableOpacity>}
            </View>
            {selectedTeacher ? (
              <View style={styles.selectedPerson}>
                <MaterialCommunityIcons name="account-check" size={20} color="#22945F" />
                <View style={styles.selectedPersonDetails}><Text style={styles.selectedPersonName}>{selectedTeacher.userId?.fullName || 'Unnamed teacher'}</Text><Text style={styles.choiceItemSubtext}>{selectedTeacher.employeeId || 'No employee ID'}{selectedTeacher.userId?.email ? ` • ${selectedTeacher.userId.email}` : ''}</Text></View>
                <TouchableOpacity onPress={() => { setForm((current) => ({ ...current, teacherId: '' })); setTeacherSearch(''); }}><MaterialCommunityIcons name="close-circle" size={21} color="#7B8496" /></TouchableOpacity>
              </View>
            ) : teacherSearch.trim().length > 0 ? (
              <View style={styles.searchResultsBox}>
                {filteredTeachers.length === 0 ? <Text style={styles.emptySearchText}>No matching active teachers found.</Text> : filteredTeachers.map((teacher) => (
                  <TouchableOpacity key={teacher._id} style={styles.searchResultItem} onPress={() => { setForm((current) => ({ ...current, teacherId: teacher._id })); setTeacherSearch(teacher.userId?.fullName || ''); }} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="account-circle-outline" size={23} color="#7040D5" />
                    <View style={styles.selectedPersonDetails}><Text style={styles.searchResultName}>{teacher.userId?.fullName || 'Unnamed teacher'}</Text><Text style={styles.choiceItemSubtext}>{teacher.employeeId || 'No employee ID'}{teacher.userId?.email ? ` • ${teacher.userId.email}` : ''}</Text></View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : <Text style={styles.searchHelperText}>{teachers.length} active teacher(s) available. Start typing to search.</Text>}
            <Text style={styles.formLabel}>Meeting date and time * (local time)</Text>
            <TextInput value={form.meetingDate} onChangeText={(v) => setForm((f) => ({ ...f, meetingDate: v }))} placeholder="YYYY-MM-DDTHH:mm" placeholderTextColor="#A0A8B7" style={styles.formInput} autoCapitalize="none" />
            <Text style={styles.formLabel}>Purpose *</Text>
            <TextInput value={form.purpose} onChangeText={(v) => setForm((f) => ({ ...f, purpose: v }))} placeholder="e.g. Academic progress discussion" placeholderTextColor="#A0A8B7" style={styles.formInput} maxLength={500} />
            <Text style={styles.formLabel}>Notes</Text>
            <TextInput value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Additional meeting notes (optional)" placeholderTextColor="#A0A8B7" style={[styles.formInput, styles.formTextArea]} multiline maxLength={2000} />
            {editingRecord ? <><Text style={styles.formLabel}>Status</Text><View style={styles.filterRow}>{(['Scheduled', 'Completed', 'Pending'] as Status[]).map((s) => <TouchableOpacity key={s} style={[styles.filterButton, form.status === s && styles.filterButtonActive]} onPress={() => setForm((f) => ({ ...f, status: s }))}><Text style={[styles.filterText, form.status === s && styles.filterTextActive]}>{s}</Text></TouchableOpacity>)}</View></> : null}
            <View style={styles.formActions}><TouchableOpacity style={styles.secondaryButton} onPress={() => setFormVisible(false)} disabled={saving}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.primaryButton} onPress={saveMeeting} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="content-save-outline" size={16} color="#FFFFFF" />}<Text style={styles.primaryButtonText}>{saving ? 'Saving...' : editingRecord ? 'Save changes' : 'Schedule meeting'}</Text></TouchableOpacity></View>
          </ScrollView>
        </View></View>
      </Modal>

      {/* VIEW DETAILS */}
      <Modal visible={viewVisible} transparent animationType="fade" onRequestClose={() => setViewVisible(false)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>PTG Meeting Details</Text><TouchableOpacity style={styles.modalClose} onPress={() => setViewVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#667085" /></TouchableOpacity></View>
          {viewRecord ? <ScrollView>
            <DetailLine label="Student" value={viewRecord.student} /><DetailLine label="Student ID" value={viewRecord.studentId} /><DetailLine label="Guardian" value={viewRecord.parent} /><DetailLine label="Teacher" value={viewRecord.teacher} /><DetailLine label="Batch / Standard" value={`${viewRecord.batch} • ${viewRecord.course}`} /><DetailLine label="Meeting date" value={viewRecord.meetingDate} /><DetailLine label="Purpose" value={viewRecord.purpose} /><DetailLine label="Notes" value={viewRecord.notes || 'No notes added'} /><DetailLine label="Status" value={viewRecord.status} />
            <View style={styles.formActions}><TouchableOpacity style={styles.secondaryButton} onPress={() => { setViewVisible(false); openEdit(viewRecord); }}><Text style={styles.secondaryButtonText}>Edit meeting</Text></TouchableOpacity>{viewRecord.status !== 'Completed' && <TouchableOpacity style={styles.primaryButton} onPress={() => setStatus('Completed')} disabled={saving}>{saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="check-circle-outline" size={16} color="#FFFFFF" />}<Text style={styles.primaryButtonText}>Mark completed</Text></TouchableOpacity>}</View>
          </ScrollView> : null}
        </View></View>
      </Modal>
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailModalLine}><Text style={styles.detailModalLabel}>{label}</Text><Text style={styles.detailModalValue}>{value}</Text></View>;
}

type PTGStatCardProps = { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; value: string; type: 'purple' | 'blue' | 'green' | 'orange' };
function PTGStatCard({ icon, title, value, type }: PTGStatCardProps) {
  const colors = {
    purple: { background: '#F1EAFF', icon: '#7040D5' },
    blue: { background: '#EAF2FF', icon: '#2675E8' },
    green: { background: '#E7F8EF', icon: '#35B878' },
    orange: { background: '#FFF1E2', icon: '#F7941D' },
  };
  const color = colors[type];
  return <View style={styles.statCard}><View style={styles.statTopRow}><View style={[styles.statIconBox, { backgroundColor: color.background }]}><MaterialCommunityIcons name={icon} size={24} color={color.icon} /></View></View><View><Text style={styles.statTitle}>{title}</Text><Text style={styles.statValue}>{value}</Text></View></View>;
}

type PTGCardProps = { record: PTGRecord; isDesktop: boolean; onView: () => void; onEdit: () => void; onDelete: () => void };
function PTGCard({ record, isDesktop, onView, onEdit, onDelete }: PTGCardProps) {
  const statusConfig = {
    Scheduled: { background: '#EAF2FF', text: '#2675E8', dot: '#2675E8' },
    Completed: { background: '#E7F8EF', text: '#26955E', dot: '#35B878' },
    Pending: { background: '#FFF1E2', text: '#D87908', dot: '#F7941D' },
  };
  const status = statusConfig[record.status];
  return <View style={[styles.recordCard, isDesktop && styles.recordCardDesktop]}>
    <View style={styles.recordTop}><View style={styles.studentIconBox}><MaterialCommunityIcons name="account-school-outline" size={23} color="#7040D5" /></View><View style={styles.studentTitleArea}><Text style={styles.studentName} numberOfLines={1}>{record.student}</Text><Text style={styles.studentId}>{record.studentId}</Text></View><View style={[styles.statusBadge, { backgroundColor: status.background }]}><View style={[styles.statusDot, { backgroundColor: status.dot }]} /><Text style={[styles.statusText, { color: status.text }]}>{record.status}</Text></View></View>
    <View style={styles.detailRow}><MaterialCommunityIcons name="account-outline" size={17} color="#7B8799" /><View style={styles.detailTextArea}><Text style={styles.detailLabel}>Parent / Guardian</Text><Text style={styles.detailValue}>{record.parent}</Text></View></View>
    <View style={styles.detailRow}><MaterialCommunityIcons name="account-tie-outline" size={17} color="#7B8799" /><View style={styles.detailTextArea}><Text style={styles.detailLabel}>Teacher</Text><Text style={styles.detailValue}>{record.teacher}</Text></View></View>
    <View style={styles.detailRow}><MaterialCommunityIcons name="school-outline" size={17} color="#7B8799" /><View style={styles.detailTextArea}><Text style={styles.detailLabel}>Course / Batch</Text><Text style={styles.detailValue}>{record.course} • {record.batch}</Text></View></View>
    <View style={styles.dateBox}><View style={styles.dateIcon}><MaterialCommunityIcons name="calendar-outline" size={18} color="#7040D5" /></View><View style={styles.dateTextArea}><Text style={styles.dateLabel}>Meeting Date</Text><Text style={styles.dateValue}>{record.meetingDate}</Text></View></View>
    <View style={styles.purposeBox}><MaterialCommunityIcons name="text-box-outline" size={17} color="#7040D5" /><Text style={styles.purposeText} numberOfLines={2}>{record.purpose}</Text></View>
    <View style={styles.actionRow}><TouchableOpacity style={styles.viewButton} onPress={onView} activeOpacity={0.8}><MaterialCommunityIcons name="eye-outline" size={16} color="#7040D5" /><Text style={styles.viewButtonText}>View</Text></TouchableOpacity><TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.8}><MaterialCommunityIcons name="pencil-outline" size={16} color="#2675E8" /><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity><TouchableOpacity style={styles.deleteButton} onPress={onDelete} activeOpacity={0.8}><MaterialCommunityIcons name="delete-outline" size={16} color="#D92D20" /><Text style={styles.deleteButtonText}>Delete</Text></TouchableOpacity></View>
  </View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    backgroundColor: '#7040D5',
    paddingHorizontal: 16,
    paddingBottom: 15,
  },

  headerInner: {
    width: '100%',
    maxWidth: 1500,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 19,
    color: '#FFFFFF',
  },

  headerAction: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#7040D5',
    marginLeft: 5,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
  },

  content: {
    paddingTop: 22,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionTitleArea: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#172033',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7B8799',
    marginTop: 2,
  },

  desktopAddButton: {
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  desktopAddButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 5,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },

  statsGridDesktop: {
    flexWrap: 'nowrap',
  },

  statCardWrapper: {
    width: '48%',
  },

  statCardWrapperDesktop: {
    flex: 1,
    width: undefined,
  },

  statCard: {
    height: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  statTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  statIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeBadge: {
    minHeight: 26,
    borderRadius: 8,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  changeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    marginLeft: 3,
  },

  statTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,
    color: '#748096',
    marginBottom: 2,
  },

  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 23,
    color: '#172033',
  },

  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 22,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  searchContainer: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E3E7EF',
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFCFE',
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#172033',
    marginLeft: 8,
    paddingVertical: 0,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 11,
  },

  filterButton: {
    minWidth: 70,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#707B8F',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  listTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
  },

  listSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8993A4',
    marginTop: 1,
  },

  sessionBadge: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
    marginLeft: 5,
  },

  recordGrid: {
    gap: 12,
  },

  recordGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  recordCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  recordCardDesktop: {
    width: '32.4%',
  },

  recordTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  studentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentTitleArea: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },

  studentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A94A6',
    marginTop: 2,
  },

  statusBadge: {
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },

  detailTextArea: {
    flex: 1,
    marginLeft: 8,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#9AA3B2',
  },

  detailValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#3B4658',
    marginTop: 1,
  },

  dateBox: {
    marginTop: 12,
    padding: 9,
    borderRadius: 10,
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateTextArea: {
    marginLeft: 9,
  },

  dateLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#98A1B2',
  },

  dateValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#3B4658',
    marginTop: 1,
  },

  purposeBox: {
    marginTop: 11,
    padding: 9,
    borderRadius: 9,
    backgroundColor: '#F8F6FE',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  purposeText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#626D80',
    marginLeft: 7,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },

  viewButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
    marginLeft: 4,
  },

  editButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EAF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#2675E8',
    marginLeft: 4,
  },

  emptyCard: {
    minHeight: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#8A94A6',
    marginTop: 5,
  },

  statusActionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, height: 36, borderRadius: 9, backgroundColor: '#F1EAFF' },
  refreshButtonText: { color: '#7040D5', fontFamily: 'PoppinsSemiBold', fontSize: 10 },
  feedbackBox: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#EEF0F5' },
  feedbackText: { color: '#7B8799', fontFamily: 'PoppinsRegular', fontSize: 12, textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(18, 24, 38, 0.55)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, maxHeight: '90%', width: '100%', maxWidth: 620, alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: '#172033', fontFamily: 'PoppinsBold', fontSize: 18, flex: 1 },
  modalClose: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F4F5F9', alignItems: 'center', justifyContent: 'center' },
  formLabel: { color: '#4B5568', fontFamily: 'PoppinsSemiBold', fontSize: 11, marginTop: 11, marginBottom: 6 },
  formInput: { borderWidth: 1, borderColor: '#E3E7EF', backgroundColor: '#FBFCFE', borderRadius: 10, minHeight: 43, paddingHorizontal: 12, paddingVertical: 10, color: '#172033', fontFamily: 'PoppinsRegular', fontSize: 12 },
  formTextArea: { minHeight: 78, textAlignVertical: 'top' },
  searchField: { minHeight: 46, borderWidth: 1, borderColor: '#E3E7EF', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchFieldInput: { flex: 1, minWidth: 0, minHeight: 44, paddingVertical: 0, color: '#172033', fontFamily: 'PoppinsRegular', fontSize: 11 },
  selectedPerson: { marginTop: 8, padding: 11, borderRadius: 10, backgroundColor: '#E7F8EF', flexDirection: 'row', alignItems: 'center', gap: 9 },
  selectedPersonDetails: { flex: 1, minWidth: 0 },
  selectedPersonName: { color: '#172033', fontFamily: 'PoppinsSemiBold', fontSize: 11 },
  searchResultsBox: { marginTop: 6, borderWidth: 1, borderColor: '#E3E6EF', borderRadius: 10, overflow: 'hidden' },
  searchResultItem: { minHeight: 50, paddingVertical: 10, paddingHorizontal: 11, borderBottomWidth: 1, borderBottomColor: '#F0F1F5', flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchResultName: { color: '#172033', fontFamily: 'PoppinsMedium', fontSize: 11 },
  emptySearchText: { padding: 12, color: '#7B8799', fontFamily: 'PoppinsRegular', fontSize: 11 },
  searchHelperText: { marginTop: 6, color: '#7B8799', fontFamily: 'PoppinsRegular', fontSize: 10, lineHeight: 15 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 18 },
  secondaryButton: { minHeight: 42, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#F1F3F8', alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: '#667085', fontFamily: 'PoppinsSemiBold', fontSize: 11 },
  primaryButton: { minHeight: 42, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#7040D5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'PoppinsSemiBold', fontSize: 11 },
  choiceList: { maxHeight: 320 },
  choiceItem: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  choiceItemText: { color: '#172033', fontFamily: 'PoppinsMedium', fontSize: 12 },
  choiceItemSubtext: { color: '#8993A4', fontFamily: 'PoppinsRegular', fontSize: 10, marginTop: 3 },
  detailModalLine: { marginTop: 10 },
  detailModalLabel: { color: '#8993A4', fontFamily: 'PoppinsMedium', fontSize: 10 },
  detailModalValue: { color: '#172033', fontFamily: 'PoppinsRegular', fontSize: 12, marginTop: 2 },
  deleteButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 9, paddingHorizontal: 10, backgroundColor: '#FFF0F0' },
  deleteButtonText: { color: '#D92D20', fontFamily: 'PoppinsSemiBold', fontSize: 10 },

});