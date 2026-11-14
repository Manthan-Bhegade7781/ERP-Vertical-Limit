import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AttendanceApiRecord,
  TeacherAttendanceApiRecord,
  AttendanceBatch,
  AttendanceStudent,
  AttendanceStatus,
  BatchSubjectAssignment,
  createAttendanceRecord,
  createTeacherAttendanceRecord,
  fetchAttendanceBatches,
  fetchAttendanceRecords,
  fetchAttendanceStudents,
  fetchTeacherAttendanceRecord,
  fetchBatchSubjectAssignments,
  getReferenceId,
  getReferenceName,
  updateAttendanceRecord,
  updateTeacherAttendanceRecord,
} from '@/services/attendance';

type SubjectOption = {
  id: string;
  name: string;
  code?: string;
};

type MarkAttendanceProps = {
  onBack: () => void;
  onContentScroll?: (event: any) => void;
};

const statusOptions: AttendanceStatus[] = [
  'Present',
  'Absent',
  'Late',
  'Leave',
];

const getTodayDate = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseAttendanceDate = (value: string): string | null => {
  const trimmed = value.trim();

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    const parsed = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day)),
    );

    return parsed.toISOString().slice(0, 10) === trimmed
      ? trimmed
      : null;
  }

  const labelMatch =
    /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/.exec(trimmed);

  if (!labelMatch) return null;

  const [, dayText, monthText, yearText] = labelMatch;

  const months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ];

  const monthIndex = months.indexOf(
    monthText.slice(0, 3).toLowerCase(),
  );

  if (monthIndex < 0) return null;

  const year = Number(yearText);
  const day = Number(dayText);

  const parsed = new Date(Date.UTC(year, monthIndex, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== monthIndex ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return `${yearText}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getCurrentCheckIn = (): string => {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
};

const getStudentName = (student: AttendanceStudent): string => {
  return (
    getReferenceName(student.userId, student.studentId) ||
    student.studentId ||
    'Unnamed student'
  );
};

export default function MarkAttendancePage({
  onBack,
  onContentScroll,
}: MarkAttendanceProps) {
  const [date, setDate] = useState(getTodayDate());

  const [batches, setBatches] = useState<AttendanceBatch[]>([]);
  const [allStudents, setAllStudents] = useState<AttendanceStudent[]>([]);
  const [assignments, setAssignments] = useState<BatchSubjectAssignment[]>([]);

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [statuses, setStatuses] = useState<
    Record<string, AttendanceStatus>
  >({});

  const [existingAttendance, setExistingAttendance] = useState<
    Record<string, AttendanceApiRecord>
  >({});
  const [existingTeacherAttendance, setExistingTeacherAttendance] =
    useState<TeacherAttendanceApiRecord | null>(null);
  const [teacherStatus, setTeacherStatus] = useState<AttendanceStatus>('Present');
  const [teacherAttendanceError, setTeacherAttendanceError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [existingError, setExistingError] = useState('');

  const handleBack = () => {
    onBack();
  };

  // Load batches and students from the backend.
  const loadInitialData = useCallback(async () => {
    setLoadingInitial(true);
    setPageError('');

    try {
      const [batchData, studentData] = await Promise.all([
        fetchAttendanceBatches(),
        fetchAttendanceStudents(),
      ]);

      const activeBatches = batchData.filter(
        (item) => !item.isRemoved,
      );

      const activeStudents = studentData.filter(
        (student) =>
          (student.status || '').toLowerCase() === 'active',
      );

      setBatches(activeBatches);
      setAllStudents(activeStudents);

      setSelectedBatchId((current) => {
        if (
          current &&
          activeBatches.some((item) => item._id === current)
        ) {
          return current;
        }

        return activeBatches[0]?._id || '';
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

  // Load subjects assigned to the selected batch.
  useEffect(() => {
    if (!selectedBatchId) {
      setAssignments([]);
      setSelectedSubjectId('');
      setLoadingSubjects(false);
      return;
    }

    let active = true;

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setSubjectError('');
      setAssignments([]);
      setSelectedSubjectId('');

      try {
        const result =
          await fetchBatchSubjectAssignments(selectedBatchId);

        if (!active) return;

        const activeAssignments = result.filter((assignment) => {
          const subjectId = getReferenceId(assignment.subjectId);

          const subject =
            assignment.subjectId &&
            typeof assignment.subjectId === 'object'
              ? assignment.subjectId
              : null;

          return (
            assignment.status !== 'inactive' &&
            Boolean(subjectId) &&
            subject?.status !== 'inactive'
          );
        });

        setAssignments(activeAssignments);

        const firstAssignment = activeAssignments[0];

        setSelectedSubjectId(
          firstAssignment
            ? getReferenceId(firstAssignment.subjectId)
            : '',
        );

        if (activeAssignments.length === 0) {
          setSubjectError(
            'No active subjects are assigned to this batch.',
          );
        }
      } catch (error) {
        if (active) {
          setSubjectError(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoadingSubjects(false);
        }
      }
    };

    void loadSubjects();

    return () => {
      active = false;
    };
  }, [selectedBatchId, refreshKey]);

  // Generate subject options from backend assignments.
  const subjectOptions = useMemo<SubjectOption[]>(() => {
    const seen = new Set<string>();
    const result: SubjectOption[] = [];

    assignments.forEach((assignment) => {
      const subject = assignment.subjectId;

      if (!subject || typeof subject !== 'object') return;

      const id = getReferenceId(subject);

      if (!id || !subject.name || seen.has(id)) return;

      seen.add(id);

      result.push({
        id,
        name: subject.name,
        ...(subject.code ? { code: subject.code } : {}),
      });
    });

    return result;
  }, [assignments]);

  // Show only students belonging to the selected batch.
  const classStudents = useMemo(
    () =>
      allStudents.filter(
        (student) =>
          getReferenceId(student.batchId) === selectedBatchId,
      ),
    [allStudents, selectedBatchId],
  );

  // Load existing attendance for batch, subject and date.
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

    const loadExistingAttendance = async () => {
      setLoadingExisting(true);
      setTeacherAttendanceError('');
      setExistingTeacherAttendance(null);

      const [studentResult, teacherResult] = await Promise.allSettled([
        fetchAttendanceRecords({
          batchId: selectedBatchId,
          subjectId: selectedSubjectId,
          date: apiDate,
        }),
        fetchTeacherAttendanceRecord({
          batchId: selectedBatchId,
          subjectId: selectedSubjectId,
          date: apiDate,
        }),
      ]);

      if (!active) return;

      if (studentResult.status === 'fulfilled') {
        const recordMap: Record<string, AttendanceApiRecord> = {};
        const statusMap: Record<string, AttendanceStatus> = {};

        studentResult.value.forEach((record) => {
          const studentId = getReferenceId(record.studentId);
          if (studentId) {
            recordMap[studentId] = record;
            statusMap[studentId] = record.status;
          }
        });
        setExistingAttendance(recordMap);
        setStatuses(statusMap);
        setExistingError('');
      } else {
        setExistingError(getErrorMessage(studentResult.reason));
      }

      if (teacherResult.status === 'fulfilled') {
        setExistingTeacherAttendance(teacherResult.value);
        setTeacherStatus(teacherResult.value?.status || 'Present');
      } else {
        setTeacherAttendanceError(getErrorMessage(teacherResult.reason));
      }

      setLoadingExisting(false);
    };

    void loadExistingAttendance();

    return () => {
      active = false;
    };
  }, [selectedBatchId, selectedSubjectId, date, refreshKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshKey((value) => value + 1);
    setRefreshing(false);
  };

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

  const updateStatus = (
    studentId: string,
    status: AttendanceStatus,
  ) => {
    setStatuses((current) => ({
      ...current,
      [studentId]: status,
    }));
  };

  // Save attendance using POST/PUT API calls.
  const saveAttendance = async () => {
    const apiDate = parseAttendanceDate(date);

    if (!apiDate) {
      Alert.alert(
        'Invalid Date',
        'Enter the date as YYYY-MM-DD or 05 Sep 2026.',
      );
      return;
    }

    if (!selectedBatchId || !selectedSubjectId) {
      Alert.alert(
        'Required Fields',
        'Please select a batch and an assigned subject.',
      );
      return;
    }

    if (loadingExisting) {
      Alert.alert(
        'Please Wait',
        'Existing attendance is still loading.',
      );
      return;
    }

    if (existingError) {
      Alert.alert(
        'Unable to Verify Attendance',
        'Existing attendance could not be loaded. Please retry before saving.',
      );
      return;
    }

    setSaving(true);

    const savedByStudent: Record<string, AttendanceApiRecord> = {};
    const failures: string[] = [];
    let teacherSaved = false;

    try {
      const teacherCheckIn =
        teacherStatus === 'Present' || teacherStatus === 'Late'
          ? existingTeacherAttendance?.status === teacherStatus && existingTeacherAttendance.checkIn
            ? existingTeacherAttendance.checkIn
            : getCurrentCheckIn()
          : '';

      try {
        const savedTeacherRecord = existingTeacherAttendance
          ? await updateTeacherAttendanceRecord(existingTeacherAttendance._id, {
              status: teacherStatus,
              checkIn: teacherCheckIn,
            })
          : await createTeacherAttendanceRecord({
              batchId: selectedBatchId,
              subjectId: selectedSubjectId,
              date: apiDate,
              status: teacherStatus,
              checkIn: teacherCheckIn,
            });
        setExistingTeacherAttendance(savedTeacherRecord);
        teacherSaved = true;
      } catch (error) {
        failures.push(`Teacher attendance: ${getErrorMessage(error)}`);
      }

      for (const student of classStudents) {
        const studentId = student._id;
        const existing = existingAttendance[studentId];
        const status = statuses[studentId] || 'Present';

        const checkIn =
          status === 'Present' || status === 'Late'
            ? existing?.status === status && existing.checkIn
              ? existing.checkIn
              : getCurrentCheckIn()
            : '';

        const payload = {
          studentId,
          batchId: selectedBatchId,
          subjectId: selectedSubjectId,
          date: apiDate,
          status,
          checkIn,
        };

        try {
          const saved = existing
            ? await updateAttendanceRecord(existing._id, {
                status,
                checkIn,
              })
            : await createAttendanceRecord(payload);

          savedByStudent[studentId] = saved;
        } catch (error) {
          failures.push(
            `${getStudentName(student)}: ${getErrorMessage(error)}`,
          );
        }
      }

      setExistingAttendance((current) => ({
        ...current,
        ...savedByStudent,
      }));

      const successCount = Object.keys(savedByStudent).length;
      const savedSummary = `${teacherSaved ? 'Teacher attendance saved. ' : ''}${successCount} student record(s) saved or updated.`;

      if (failures.length > 0) {
        Alert.alert(
          'Attendance Partially Saved',
          `${savedSummary} ${failures.length} failed.\n\n${failures.slice(0, 3).join('\n')}`,
        );
        return;
      }

      Alert.alert(
        'Attendance Saved',
        `Teacher attendance and attendance for ${successCount} student(s) have been saved.`,
        [{ text: 'OK', onPress: handleBack }],
      );
    } finally {
      setSaving(false);
    }
  };

  return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor="#7040D5"
            colors={['#7040D5']}
          />
        }
      >
        {/* White rounded header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#6428D7"
            />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={27}
              color="#6428D7"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.pageTitle} numberOfLines={1}>
              Mark Attendance
            </Text>
            <Text style={styles.pageSubtitle}>
              Record your attendance and student attendance
            </Text>
          </View>
        </View>

        {pageError ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{pageError}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void loadInitialData()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Attendance details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Attendance Details</Text>

          <Text style={styles.label}>
            Date <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={18}
              color="#7040D5"
            />

            <TextInput
              value={date}
              onChangeText={changeDate}
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A2AABB"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>
            Batch <Text style={styles.required}>*</Text>
          </Text>

          {loadingInitial ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color="#7040D5" />
              <Text style={styles.helper}>Loading batches…</Text>
            </View>
          ) : batches.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.options}
            >
              {batches.map((item) => (
                <Option
                  key={item._id}
                  label={item.name}
                  selected={selectedBatchId === item._id}
                  onPress={() => changeBatch(item._id)}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.errorText}>
              No active batches were returned by the API.
            </Text>
          )}

          <Text style={styles.label}>
            Subject <Text style={styles.required}>*</Text>
          </Text>

          {loadingSubjects ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color="#7040D5" />
              <Text style={styles.helper}>
                Loading assigned subjects…
              </Text>
            </View>
          ) : subjectOptions.length > 0 ? (
            <View style={styles.wrap}>
              {subjectOptions.map((item) => (
                <Option
                  key={item.id}
                  label={item.name}
                  selected={selectedSubjectId === item.id}
                  onPress={() => setSelectedSubjectId(item.id)}
                />
              ))}
            </View>
          ) : null}

          {subjectError ? (
            <Text style={styles.errorText}>{subjectError}</Text>
          ) : null}
        </View>

        {/* Teacher attendance - one record per batch, subject and date */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>My Attendance</Text>
          <Text style={styles.helper}>
            Mark your own attendance for this batch and subject.
          </Text>

          {teacherAttendanceError ? (
            <Text style={styles.errorText}>
              Could not load your saved attendance: {teacherAttendanceError}
            </Text>
          ) : null}

          <View style={styles.statusWrap}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={`teacher-${status}`}
                disabled={saving || loadingExisting}
                style={[
                  styles.statusButton,
                  teacherStatus === status && styles.statusActive,
                ]}
                onPress={() => setTeacherStatus(status)}
                activeOpacity={0.8}
              >
                {teacherStatus === status ? (
                  <MaterialCommunityIcons name="check" size={13} color="#7040D5" />
                ) : null}
                <Text
                  style={[
                    styles.statusText,
                    teacherStatus === status && styles.statusTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {existingTeacherAttendance ? (
            <Text style={styles.helper}>
              Existing teacher attendance will be updated for this date.
            </Text>
          ) : null}
        </View>

        {/* Student attendance */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student Attendance</Text>

          <Text style={styles.helper}>
            Tap a status for each student.
          </Text>

          {loadingExisting ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color="#7040D5" />
              <Text style={styles.helper}>
                Loading saved attendance…
              </Text>
            </View>
          ) : null}

          {existingError ? (
            <Text style={styles.errorText}>
              Could not check existing attendance: {existingError}
            </Text>
          ) : null}

          {loadingInitial ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color="#7040D5" />
              <Text style={styles.helper}>Loading students…</Text>
            </View>
          ) : !selectedBatchId ? (
            <Text style={styles.emptyText}>
              Select a batch to see students.
            </Text>
          ) : classStudents.length === 0 ? (
            <Text style={styles.emptyText}>
              No active students belong to this batch.
            </Text>
          ) : (
            classStudents.map((student) => {
              const studentId = student._id;
              const selectedStatus =
                statuses[studentId] || 'Present';

              return (
                <View key={studentId} style={styles.studentCard}>
                  <View style={styles.studentHeader}>
                    <View style={styles.avatar}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={17}
                        color="#7040D5"
                      />
                    </View>

                    <Text
                      style={styles.studentName}
                      numberOfLines={1}
                    >
                      {getStudentName(student)}
                    </Text>
                  </View>

                  <View style={styles.statusWrap}>
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        disabled={saving}
                        style={[
                          styles.statusButton,
                          selectedStatus === status &&
                            styles.statusActive,
                        ]}
                        onPress={() =>
                          updateStatus(studentId, status)
                        }
                        activeOpacity={0.8}
                      >
                        {selectedStatus === status && (
                          <MaterialCommunityIcons
                            name="check"
                            size={13}
                            color="#7040D5"
                          />
                        )}

                        <Text
                          style={[
                            styles.statusText,
                            selectedStatus === status &&
                              styles.statusTextActive,
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (
                saving ||
                loadingInitial ||
                loadingSubjects ||
                loadingExisting
              ) && styles.saveButtonDisabled,
            ]}
            onPress={() => void saveAttendance()}
            activeOpacity={0.85}
            disabled={
              saving ||
              loadingInitial ||
              loadingSubjects ||
              loadingExisting
            }
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={18}
                color="#FFFFFF"
              />
            )}

            <Text style={styles.saveText}>
              {saving ? 'Saving…' : 'Save Attendance'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  );
}

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        selected && styles.optionActive,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {selected && (
        <MaterialCommunityIcons
          name="check-circle"
          size={14}
          color="#7040D5"
        />
      )}

      <Text
        style={[
          styles.optionText,
          selected && styles.optionTextActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 0,
    paddingBottom: 30,
  },

  pageHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEAF2',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    color: '#7B8496',
    marginTop: 3,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E8ED',
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#172033',
  },

  helper: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8A93A4',
    marginTop: 3,
    marginBottom: 4,
  },

  label: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#59657A',
    marginTop: 13,
    marginBottom: 5,
  },

  required: {
    color: '#D84B63',
  },

  inputWrapper: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    marginLeft: 8,
    paddingVertical: 0,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
  },

  options: {
    gap: 7,
    paddingBottom: 2,
  },

  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  option: {
    minHeight: 40,
    maxWidth: '100%',
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  optionActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  optionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#687386',
  },

  optionTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  studentCard: {
    borderWidth: 1,
    borderColor: '#E7E9EF',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },

  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginBottom: 8,
  },

  avatar: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  studentName: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#172033',
  },

  statusWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },

  statusButton: {
    minHeight: 32,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E3EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  statusActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#687386',
  },

  statusTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E3EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#687386',
  },

  saveButton: {
    flex: 1.4,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },

  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },

  errorText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    color: '#D84B63',
    marginTop: 7,
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#8992A3',
    textAlign: 'center',
    paddingVertical: 20,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#7040D5',
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 10,
  },

  retryText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});