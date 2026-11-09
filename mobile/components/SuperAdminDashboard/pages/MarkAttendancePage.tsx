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
import {
  AttendanceApiRecord,
  AttendanceBatch,
  AttendanceStudent,
  AttendanceStatus,
  BatchSubjectAssignment,
  createAttendanceRecord,
  fetchAttendanceBatches,
  fetchAttendanceRecords,
  fetchAttendanceStudents,
  fetchBatchSubjectAssignments,
  getReferenceId,
  getReferenceName,
  updateAttendanceRecord,
} from '@/services/attendance';

type SubjectOption = { id: string; name: string; code?: string };

const statusOptions: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Leave'];
const originalDefaultDate = '05 Sep 2026';

const parseAttendanceDate = (value: string): string | null => {
  const trimmed = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return parsed.toISOString().slice(0, 10) === trimmed ? trimmed : null;
  }

  const labelMatch = /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/.exec(trimmed);
  if (!labelMatch) return null;

  const [, dayText, monthText, yearText] = labelMatch;
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthIndex = months.indexOf(monthText.slice(0, 3).toLowerCase());
  if (monthIndex < 0) return null;

  const year = Number(yearText);
  const day = Number(dayText);
  const parsed = new Date(Date.UTC(year, monthIndex, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== monthIndex || parsed.getUTCDate() !== day) {
    return null;
  }

  return `${yearText}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getCurrentCheckIn = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const getStudentName = (student: AttendanceStudent) =>
  getReferenceName(student.userId, student.studentId) || 'Unnamed student';

export default function MarkAttendancePage() {
  const [date, setDate] = useState(originalDefaultDate);
  const [batches, setBatches] = useState<AttendanceBatch[]>([]);
  const [allStudents, setAllStudents] = useState<AttendanceStudent[]>([]);
  const [assignments, setAssignments] = useState<BatchSubjectAssignment[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [existingAttendance, setExistingAttendance] = useState<Record<string, AttendanceApiRecord>>({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [existingError, setExistingError] = useState('');

  const loadInitialData = useCallback(async () => {
    setLoadingInitial(true);
    setPageError('');
    try {
      const [batchData, studentData] = await Promise.all([
        fetchAttendanceBatches(),
        fetchAttendanceStudents(),
      ]);
      const activeBatches = batchData.filter((item) => !item.isRemoved);
      const activeStudents = studentData.filter((student) => (student.status || '').toLowerCase() === 'active');
      setBatches(activeBatches);
      setAllStudents(activeStudents);

      setSelectedBatchId((current) => {
        if (current && activeBatches.some((item) => item._id === current)) return current;
        const originalDefault = activeBatches.find((item) => item.name.toLowerCase().includes('12th science'));
        return originalDefault?._id || activeBatches[0]?._id || '';
      });
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!selectedBatchId) {
      setAssignments([]);
      setSelectedSubjectId('');
      setLoadingSubjects(false);
      return;
    }

    let active = true;
    setLoadingSubjects(true);
    setSubjectError('');
    setAssignments([]);
    setSelectedSubjectId('');

    fetchBatchSubjectAssignments(selectedBatchId)
      .then((result) => {
        if (!active) return;
        const activeAssignments = result.filter((assignment) => {
          const subjectId = getReferenceId(assignment.subjectId);
          const subject = assignment.subjectId;
          const subjectStatus = subject && typeof subject === 'object' ? subject.status : 'active';
          return assignment.status !== 'inactive' && Boolean(subjectId) && subjectStatus !== 'inactive';
        });
        setAssignments(activeAssignments);

        const preferred = activeAssignments.find((assignment) => {
          const subject = assignment.subjectId;
          return subject && typeof subject === 'object' && (subject.name || '').toLowerCase() === 'physics';
        });
        const first = preferred || activeAssignments[0];
        setSelectedSubjectId(first ? getReferenceId(first.subjectId) : '');
        if (activeAssignments.length === 0) {
          setSubjectError('No active subjects are assigned to this batch. Assign a subject before marking attendance.');
        }
      })
      .catch((error: unknown) => {
        if (active) setSubjectError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoadingSubjects(false);
      });

    return () => {
      active = false;
    };
  }, [selectedBatchId]);

  const subjectOptions = useMemo<SubjectOption[]>(() => {
    const seen = new Set<string>();
    const result: SubjectOption[] = [];
    assignments.forEach((assignment) => {
      const subject = assignment.subjectId;
      if (!subject || typeof subject !== 'object') return;
      const id = getReferenceId(subject);
      if (!id || !subject.name || seen.has(id)) return;
      seen.add(id);
      result.push({ id, name: subject.name, ...(subject.code ? { code: subject.code } : {}) });
    });
    return result;
  }, [assignments]);

  const selectedBatch = batches.find((item) => item._id === selectedBatchId);
  const classStudents = useMemo(
    () => allStudents.filter((student) => getReferenceId(student.batchId) === selectedBatchId),
    [allStudents, selectedBatchId]
  );

  useEffect(() => {
    let active = true;
    setExistingAttendance({});
    setStatuses({});
    setExistingError('');

    const apiDate = parseAttendanceDate(date);
    if (!selectedBatchId || !selectedSubjectId || !apiDate) {
      setLoadingExisting(false);
      return;
    }

    setLoadingExisting(true);
    fetchAttendanceRecords({ batchId: selectedBatchId, subjectId: selectedSubjectId, date: apiDate })
      .then((records) => {
        if (!active) return;
        const recordMap: Record<string, AttendanceApiRecord> = {};
        const statusMap: Record<string, AttendanceStatus> = {};
        records.forEach((record) => {
          const studentId = getReferenceId(record.studentId);
          if (studentId) {
            recordMap[studentId] = record;
            statusMap[studentId] = record.status;
          }
        });
        setExistingAttendance(recordMap);
        setStatuses(statusMap);
      })
      .catch((error: unknown) => {
        if (active) setExistingError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoadingExisting(false);
      });

    return () => {
      active = false;
    };
  }, [selectedBatchId, selectedSubjectId, date]);

  const changeBatch = (batchId: string) => {
    if (batchId === selectedBatchId) return;
    setSelectedBatchId(batchId);
    setSelectedSubjectId('');
    setExistingAttendance({});
    setStatuses({});
  };

  const changeDate = (value: string) => {
    setDate(value);
    setExistingAttendance({});
    setStatuses({});
  };

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setStatuses((current) => ({ ...current, [id]: status }));
  };

  const saveAttendance = async () => {
    const apiDate = parseAttendanceDate(date);
    if (!apiDate) {
      Alert.alert('Invalid Date', 'Enter the date as 05 Sep 2026 or YYYY-MM-DD.');
      return;
    }
    if (!selectedBatchId || !selectedSubjectId) {
      Alert.alert('Required Fields', 'Please select a batch and an assigned subject.');
      return;
    }
    if (classStudents.length === 0) {
      Alert.alert('No Students', 'There are no active students assigned to the selected batch.');
      return;
    }
    if (loadingExisting) {
      Alert.alert('Please Wait', 'Existing attendance is still loading. Try again in a moment.');
      return;
    }
    if (existingError) {
      Alert.alert('Unable to Verify Attendance', 'Existing attendance could not be loaded. Please retry by changing the date or batch, or reopen this page before saving to avoid duplicate records.');
      return;
    }

    setSaving(true);
    const savedByStudent: Record<string, AttendanceApiRecord> = {};
    const failures: string[] = [];

    for (const student of classStudents) {
      const studentId = student._id;
      const existing = existingAttendance[studentId];
      const status = statuses[studentId] || 'Present';
      const checkIn = status === 'Present' || status === 'Late'
        ? (existing?.status === status && existing.checkIn ? existing.checkIn : getCurrentCheckIn())
        : '';
      const payload = {
        studentId,
        batchId: selectedBatchId,
        subjectId: selectedSubjectId,
        date: apiDate,
        status,
        checkIn,
        remarks: existing?.remarks || '',
      };

      try {
        const saved = existing
          ? await updateAttendanceRecord(existing._id, {
              status: payload.status,
              checkIn: payload.checkIn,
              remarks: payload.remarks,
            })
          : await createAttendanceRecord(payload);
        savedByStudent[studentId] = saved;
      } catch (error) {
        failures.push(`${getStudentName(student)}: ${getErrorMessage(error)}`);
      }
    }

    setExistingAttendance((current) => ({ ...current, ...savedByStudent }));
    setSaving(false);

    const successCount = Object.keys(savedByStudent).length;
    if (failures.length) {
      Alert.alert(
        'Attendance Partially Saved',
        `${successCount} record(s) saved or updated. ${failures.length} failed.\n\n${failures.slice(0, 3).join('\n')}${failures.length > 3 ? `\n…and ${failures.length - 3} more.` : ''}`
      );
      return;
    }

    Alert.alert('Attendance Saved', `Attendance has been saved for ${successCount} student(s).`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Mark Attendance</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Mark Attendance</Text>
        <Text style={styles.pageSubtitle}>Select the class details and mark attendance for each student.</Text>

        {pageError ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{pageError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadInitialData()} activeOpacity={0.8}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Attendance Details</Text>
          <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="calendar-outline" size={18} color="#7040D5" />
            <TextInput
              value={date}
              onChangeText={changeDate}
              style={styles.input}
              placeholder="05 Sep 2026"
              placeholderTextColor="#A2AABB"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Batch <Text style={styles.required}>*</Text></Text>
          {loadingInitial ? (
            <View style={styles.inlineLoading}><ActivityIndicator size="small" color="#7040D5" /><Text style={styles.helper}>Loading batches…</Text></View>
          ) : batches.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
              {batches.map((item) => (
                <Option key={item._id} label={item.name} selected={selectedBatchId === item._id} onPress={() => changeBatch(item._id)} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.errorText}>No active batches were returned by the API.</Text>
          )}

          <Text style={styles.label}>Subject <Text style={styles.required}>*</Text></Text>
          {loadingSubjects ? (
            <View style={styles.inlineLoading}><ActivityIndicator size="small" color="#7040D5" /><Text style={styles.helper}>Loading assigned subjects…</Text></View>
          ) : subjectOptions.length ? (
            <View style={styles.wrap}>
              {subjectOptions.map((item) => (
                <Option key={item.id} label={item.name} selected={selectedSubjectId === item.id} onPress={() => setSelectedSubjectId(item.id)} />
              ))}
            </View>
          ) : null}
          {subjectError ? <Text style={styles.errorText}>{subjectError}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student Attendance</Text>
          <Text style={styles.helper}>Tap a status for each student.</Text>
          {loadingExisting ? (
            <View style={styles.inlineLoading}><ActivityIndicator size="small" color="#7040D5" /><Text style={styles.helper}>Loading saved attendance…</Text></View>
          ) : null}
          {existingError ? <Text style={styles.errorText}>Could not check existing attendance: {existingError}</Text> : null}
          {loadingInitial ? (
            <View style={styles.inlineLoading}><ActivityIndicator size="small" color="#7040D5" /><Text style={styles.helper}>Loading students…</Text></View>
          ) : !selectedBatchId ? (
            <Text style={styles.emptyText}>Select a batch to see students.</Text>
          ) : classStudents.length === 0 ? (
            <Text style={styles.emptyText}>No active students belong to this batch.</Text>
          ) : (
            classStudents.map((student) => {
              const studentId = student._id;
              const selectedStatus = statuses[studentId] || 'Present';
              return (
                <View key={studentId} style={styles.studentCard}>
                  <View style={styles.studentHeader}>
                    <View style={styles.avatar}><MaterialCommunityIcons name="account-outline" size={17} color="#7040D5" /></View>
                    <Text style={styles.studentName} numberOfLines={1}>{getStudentName(student)}</Text>
                  </View>
                  <View style={styles.statusWrap}>
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        disabled={saving}
                        style={[styles.statusButton, selectedStatus === status && styles.statusActive]}
                        onPress={() => updateStatus(studentId, status)}
                        activeOpacity={0.8}
                      >
                        {selectedStatus === status && <MaterialCommunityIcons name="check" size={13} color="#7040D5" />}
                        <Text style={[styles.statusText, selectedStatus === status && styles.statusTextActive]}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, (saving || loadingInitial || loadingSubjects || loadingExisting || classStudents.length === 0) && styles.saveButtonDisabled]}
            onPress={() => void saveAttendance()}
            activeOpacity={0.85}
            disabled={saving || loadingInitial || loadingSubjects || loadingExisting || classStudents.length === 0}
          >
            {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />}
            <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Attendance'}</Text>
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
  safeArea:{flex:1,backgroundColor:'#F7F8FC'},
  header:{minHeight:64,backgroundColor:'#7040D5',flexDirection:'row',alignItems:'center',paddingHorizontal:14,gap:10},
  backButton:{width:40,height:40,borderRadius:12,backgroundColor:'rgba(255,255,255,0.14)',alignItems:'center',justifyContent:'center'},
  headerTitle:{flex:1,minWidth:0,fontFamily:'PoppinsSemiBold',fontSize:20,color:'#FFFFFF'},
  container:{flex:1},
  content:{padding:16,paddingTop:28,paddingBottom:30},
  pageTitle:{fontFamily:'PoppinsBold',fontSize:20,color:'#172033'},
  pageSubtitle:{fontFamily:'PoppinsRegular',fontSize:11,lineHeight:18,color:'#7B8496',marginTop:5,marginBottom:16},
  card:{backgroundColor:'#FFFFFF',borderRadius:18,borderWidth:1,borderColor:'#E7E8ED',padding:16,marginBottom:14},
  sectionTitle:{fontFamily:'PoppinsSemiBold',fontSize:16,color:'#172033'},
  helper:{fontFamily:'PoppinsRegular',fontSize:10,color:'#8A93A4',marginTop:3,marginBottom:4},
  label:{fontFamily:'PoppinsMedium',fontSize:11,color:'#59657A',marginTop:13,marginBottom:5},
  required:{color:'#D84B63'},
  inputWrapper:{minHeight:52,borderRadius:10,borderWidth:1,borderColor:'#E0E3EA',backgroundColor:'#FFFFFF',flexDirection:'row',alignItems:'center',paddingHorizontal:11},
  input:{flex:1,minWidth:0,minHeight:50,marginLeft:8,paddingVertical:0,color:'#172033',fontFamily:'PoppinsRegular',fontSize:10},
  options:{gap:7,paddingBottom:2},
  wrap:{flexDirection:'row',flexWrap:'wrap',gap:7},
  option:{minHeight:40,maxWidth:'100%',paddingHorizontal:10,borderRadius:9,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E5EC',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:4},
  optionActive:{backgroundColor:'#F1EAFF',borderColor:'#7040D5'},
  optionText:{fontFamily:'PoppinsMedium',fontSize:10,color:'#687386'},
  optionTextActive:{fontFamily:'PoppinsSemiBold',color:'#7040D5'},
  studentCard:{borderWidth:1,borderColor:'#E7E9EF',borderRadius:12,padding:10,marginTop:8},
  studentHeader:{flexDirection:'row',alignItems:'center',minWidth:0,marginBottom:8},
  avatar:{width:31,height:31,borderRadius:10,backgroundColor:'#F1EAFF',alignItems:'center',justifyContent:'center',marginRight:8},
  studentName:{flex:1,minWidth:0,fontFamily:'PoppinsMedium',fontSize:10,color:'#172033'},
  statusWrap:{flexDirection:'row',flexWrap:'wrap',gap:5},
  statusButton:{minHeight:32,paddingHorizontal:8,borderRadius:8,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E0E3EA',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:3},
  statusActive:{backgroundColor:'#F1EAFF',borderColor:'#7040D5'},
  statusText:{fontFamily:'PoppinsMedium',fontSize:9,color:'#687386'},
  statusTextActive:{fontFamily:'PoppinsSemiBold',color:'#7040D5'},
  actions:{flexDirection:'row',gap:8,marginTop:2},
  cancelButton:{flex:1,minHeight:48,borderRadius:11,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E0E3EA',alignItems:'center',justifyContent:'center'},
  cancelText:{fontFamily:'PoppinsSemiBold',fontSize:10,color:'#687386'},
  saveButton:{flex:1.4,minHeight:48,borderRadius:11,backgroundColor:'#7040D5',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},
  saveButtonDisabled:{opacity:0.6},
  saveText:{fontFamily:'PoppinsSemiBold',fontSize:10,color:'#FFFFFF'},
  inlineLoading:{flexDirection:'row',alignItems:'center',gap:8,marginTop:5},
  errorText:{fontFamily:'PoppinsRegular',fontSize:10,lineHeight:16,color:'#D84B63',marginTop:7},
  emptyText:{fontFamily:'PoppinsRegular',fontSize:11,color:'#8992A3',textAlign:'center',paddingVertical:20},
  retryButton:{alignSelf:'flex-start',backgroundColor:'#7040D5',borderRadius:9,paddingHorizontal:15,paddingVertical:8,marginTop:10},
  retryText:{fontFamily:'PoppinsSemiBold',fontSize:10,color:'#FFFFFF'},
});
