import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  createLectureLog,
  fetchLectureLogs,
  fetchAttendanceLectureEntries,
  getLectureReferenceName,
  type LectureLogItem,
  type LectureLogApiRecord,
} from '../../../services/lectureLogs';

import {
  fetchTeacherAssignedBatches,
  fetchTeacherAssignedSubjects,
  type StudentBatch,
  type TeacherStudentSubject,
} from '../../../services/students';

/* =====================================================
   COMPONENT TYPES
===================================================== */

type AddLectureLogProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

type SelectorType =
  | 'batch'
  | 'subject'
  | 'time'
  | 'date';

type FilterType =
  | 'batch'
  | 'subject'
  | 'date';

/* =====================================================
   TIME SLOTS
===================================================== */

const TIME_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function AddLectureLog({
  onContentScroll,
  onBack,
}: AddLectureLogProps) {
  const today = new Date();

  /* ---------------------------------------------------
     BATCH AND SUBJECT DATA
  --------------------------------------------------- */

  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [subjects, setSubjects] = useState<TeacherStudentSubject[]>([]);

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const selectedBatch = useMemo(
    () => batches.find((item) => item._id === selectedBatchId),
    [batches, selectedBatchId],
  );

  const selectedSubject = useMemo(
    () => subjects.find((item) => item.id === selectedSubjectId),
    [subjects, selectedSubjectId],
  );

  /* ---------------------------------------------------
     FORM DATA
  --------------------------------------------------- */

  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatDate(today));

  const [time, setTime] = useState(
    '09:00 AM - 10:00 AM',
  );

  /* ---------------------------------------------------
     HISTORY DATA
  --------------------------------------------------- */

  const [logs, setLogs] = useState<LectureLogItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [loadError, setLoadError] = useState('');

  /* ---------------------------------------------------
     SELECTOR MODAL
  --------------------------------------------------- */

  const [selectorVisible, setSelectorVisible] = useState(false);

  const [selectorType, setSelectorType] =
    useState<SelectorType>('batch');

  /* ---------------------------------------------------
     CALENDAR
  --------------------------------------------------- */

  const [calendarMonth, setCalendarMonth] =
    useState(today.getMonth());

  const [calendarYear, setCalendarYear] =
    useState(today.getFullYear());

  /* ---------------------------------------------------
     HISTORY FILTERS
  --------------------------------------------------- */

  const [filterVisible, setFilterVisible] = useState(false);

  const [filterType, setFilterType] =
    useState<FilterType>('date');

  const [filterBatch, setFilterBatch] =
    useState('All Batches');

  const [filterSubject, setFilterSubject] =
    useState('All Subjects');

  const [filterDate, setFilterDate] =
    useState('All Dates');

  /* =====================================================
     LOAD TEACHER ASSIGNED BATCHES
  ===================================================== */

  const loadBatches = useCallback(async () => {
    try {
      const result = await fetchTeacherAssignedBatches();

      setBatches(result);

      if (result.length === 0) {
        setSelectedBatchId('');
        setSelectedSubjectId('');
        setSubjects([]);
        return;
      }

      setSelectedBatchId((current) => {
        const stillAvailable = result.some(
          (batch) => batch._id === current,
        );

        return stillAvailable
          ? current
          : result[0]._id;
      });
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Unable to load assigned batches.',
      );
    }
  }, []);

  /* =====================================================
     LOAD SUBJECTS FOR SELECTED BATCH
  ===================================================== */

  const loadSubjects = useCallback(
    async (batchId: string) => {
      if (!batchId) {
        setSubjects([]);
        setSelectedSubjectId('');
        return;
      }

      try {
        const result =
          await fetchTeacherAssignedSubjects(batchId);

        setSubjects(result);

        setSelectedSubjectId((current) => {
          const stillAvailable = result.some(
            (subject) => subject.id === current,
          );

          if (stillAvailable) {
            return current;
          }

          return result.length > 0
            ? result[0].id
            : '';
        });
      } catch (error) {
        setSubjects([]);
        setSelectedSubjectId('');

        throw new Error(
          error instanceof Error
            ? error.message
            : 'Unable to load assigned subjects.',
        );
      }
    },
    [],
  );

  /* =====================================================
     LOAD LECTURE HISTORY
  ===================================================== */

  const loadLectureHistory = useCallback(async () => {
    setLoadError('');

    const [manualResult, attendanceResult] =
      await Promise.allSettled([
        fetchLectureLogs(),
        fetchAttendanceLectureEntries(),
      ]);

    const combinedLogs: LectureLogItem[] = [];

    let errors: string[] = [];

    /* Manual lecture logs */

    if (manualResult.status === 'fulfilled') {
      const manualLogs: LectureLogApiRecord[] =
        manualResult.value;

      const formattedManualLogs: LectureLogItem[] =
        manualLogs.map((item) => ({
          id: item._id,
          date: normalizeDate(item.date),
          batch:
            getLectureReferenceName(item.batchId) ||
            'Batch',
          subject:
            getLectureReferenceName(item.subjectId) ||
            'Subject',
          time: item.time || '',
          description: item.description || '',
          source: 'lecture-log',
        }));

      combinedLogs.push(...formattedManualLogs);
    } else {
      errors.push(
        manualResult.reason instanceof Error
          ? manualResult.reason.message
          : 'Unable to load saved lecture logs.',
      );
    }

    /* Attendance-linked entries */

    if (attendanceResult.status === 'fulfilled') {
      combinedLogs.push(...attendanceResult.value);
    } else {
      errors.push(
        attendanceResult.reason instanceof Error
          ? attendanceResult.reason.message
          : 'Unable to load attendance history.',
      );
    }

    /* Sort newest first */

    combinedLogs.sort((a, b) => {
      return b.date.localeCompare(a.date);
    });

    setLogs(combinedLogs);

    if (errors.length > 0) {
      setLoadError(errors.join('\n'));
    }
  }, []);

  /* =====================================================
     INITIAL DATA LOADING
  ===================================================== */

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      await Promise.all([
        loadBatches(),
        loadLectureHistory(),
      ]);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load lecture log data.',
      );
    } finally {
      setLoading(false);
    }
  }, [loadBatches, loadLectureHistory]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /* =====================================================
     LOAD SUBJECTS WHEN BATCH CHANGES
  ===================================================== */

  useEffect(() => {
    if (!selectedBatchId) {
      setSubjects([]);
      setSelectedSubjectId('');
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const result =
          await fetchTeacherAssignedSubjects(selectedBatchId);

        if (!active) {
          return;
        }

        setSubjects(result);

        setSelectedSubjectId((current) => {
          const stillAvailable = result.some(
            (subject) => subject.id === current,
          );

          if (stillAvailable) {
            return current;
          }

          return result.length > 0
            ? result[0].id
            : '';
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setSubjects([]);
        setSelectedSubjectId('');

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Unable to load assigned subjects.',
        );
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [selectedBatchId]);

  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        loadLectureHistory(),
        loadBatches(),
      ]);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to refresh lecture log data.',
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =====================================================
     FILTERED HISTORY
  ===================================================== */

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesBatch =
        filterBatch === 'All Batches' ||
        log.batch === filterBatch;

      const matchesSubject =
        filterSubject === 'All Subjects' ||
        log.subject === filterSubject;

      const matchesDate =
        filterDate === 'All Dates' ||
        log.date === filterDate;

      return (
        matchesBatch &&
        matchesSubject &&
        matchesDate
      );
    });
  }, [
    logs,
    filterBatch,
    filterSubject,
    filterDate,
  ]);

  /* =====================================================
     OPEN SELECTOR
  ===================================================== */

  const openSelector = (type: SelectorType) => {
    setSelectorType(type);

    if (type === 'date') {
      const date = parseDisplayDate(selectedDate);

      setCalendarMonth(date.getMonth());
      setCalendarYear(date.getFullYear());
    }

    setSelectorVisible(true);
  };

  const closeSelector = () => {
    setSelectorVisible(false);
  };

  /* =====================================================
     SAVE LECTURE LOG
  ===================================================== */

  const saveLectureLog = async () => {
    const cleanDescription = description.trim();

    if (!selectedBatchId) {
      Alert.alert(
        'Select Batch',
        'Please select an assigned batch.',
      );
      return;
    }

    if (!selectedSubjectId) {
      Alert.alert(
        'Select Subject',
        'Please select an assigned subject.',
      );
      return;
    }

    if (!cleanDescription) {
      Alert.alert(
        'Lecture Description',
        'Please write a description before saving.',
      );
      return;
    }

    try {
      setSaving(true);

      await createLectureLog({
        date: dateToISO(selectedDate),
        batchId: selectedBatchId,
        subjectId: selectedSubjectId,
        time,
        description: cleanDescription,
      });

      setDescription('');

      await loadLectureHistory();

      Alert.alert(
        'Lecture Log Saved',
        'Your lecture description has been saved successfully.',
      );
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Unable to save lecture log.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     SELECT CALENDAR DATE
  ===================================================== */

  const selectCalendarDate = (date: Date) => {
    setSelectedDate(formatDate(date));
    setSelectorVisible(false);
  };

  /* =====================================================
     CHANGE CALENDAR MONTH
  ===================================================== */

  const changeMonth = (amount: number) => {
    const newDate = new Date(
      calendarYear,
      calendarMonth + amount,
      1,
    );

    setCalendarMonth(newDate.getMonth());
    setCalendarYear(newDate.getFullYear());
  };

  /* =====================================================
     HISTORY FILTER MODAL
  ===================================================== */

  const openFilter = (type: FilterType) => {
    setFilterType(type);

    if (type === 'date') {
      if (filterDate !== 'All Dates') {
        const date = parseDisplayDate(filterDate);

        setCalendarMonth(date.getMonth());
        setCalendarYear(date.getFullYear());
      } else {
        const now = new Date();

        setCalendarMonth(now.getMonth());
        setCalendarYear(now.getFullYear());
      }
    }

    setFilterVisible(true);
  };

  const selectFilterDate = (date: Date) => {
    setFilterDate(formatDate(date));
    setFilterVisible(false);
  };

  const selectFilterValue = (value: string) => {
    if (filterType === 'batch') {
      setFilterBatch(value);
    }

    if (filterType === 'subject') {
      setFilterSubject(value);
    }

    setFilterVisible(false);
  };

  const clearDateFilter = () => {
    setFilterDate('All Dates');
    setFilterVisible(false);
  };

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#5420D8"
        />

        <Text style={styles.loadingText}>
          Loading lecture log...
        </Text>
      </View>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onContentScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#5420D8"
          />
        }
      >
        {/* HEADER */}

        <View style={styles.headerCard}>
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
                size={23}
                color="#5420D8"
              />
            </Pressable>
          )}

          <View style={styles.headerIcon}>
            <Ionicons
              name="document-text-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Lecture Log
            </Text>

            <Text style={styles.headerSubtitle}>
              Record and review your lectures
            </Text>
          </View>
        </View>

        {/* API ERROR */}

        {!!loadError && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color="#C0392B"
            />

            <Text style={styles.errorText}>
              {loadError}
            </Text>

            <Pressable onPress={handleRefresh}>
              <Text style={styles.retryText}>
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {/* ADD LECTURE LOG */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Add Lecture Description
          </Text>

          <Text style={styles.cardSubtitle}>
            Record what you taught in this lecture
          </Text>

          {/* DATE */}

          <Text style={styles.label}>
            Date
          </Text>

          <Pressable
            style={styles.selector}
            onPress={() => openSelector('date')}
          >
            <View style={styles.selectorIcon}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <Text style={styles.selectorText}>
              {selectedDate}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#777C89"
            />
          </Pressable>

          {/* BATCH */}

          <Text style={[styles.label, styles.spacedLabel]}>
            Batch
          </Text>

          <Pressable
            style={styles.selector}
            onPress={() => openSelector('batch')}
          >
            <View style={styles.selectorIcon}>
              <Ionicons
                name="people-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <Text style={styles.selectorText}>
              {selectedBatch
                ? selectedBatch.name || selectedBatch.standard
                : 'Select Batch'}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#777C89"
            />
          </Pressable>

          {/* SUBJECT */}

          <Text style={[styles.label, styles.spacedLabel]}>
            Subject
          </Text>

          <Pressable
            style={[
              styles.selector,
              !selectedBatchId && styles.disabledSelector,
            ]}
            disabled={!selectedBatchId}
            onPress={() => openSelector('subject')}
          >
            <View style={styles.selectorIcon}>
              <Ionicons
                name="book-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <Text style={styles.selectorText}>
              {selectedSubject?.name || 'Select Subject'}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#777C89"
            />
          </Pressable>

          {/* TIME SLOT */}

          <Text style={[styles.label, styles.spacedLabel]}>
            Time Slot
          </Text>

          <Pressable
            style={styles.selector}
            onPress={() => openSelector('time')}
          >
            <View style={styles.selectorIcon}>
              <Ionicons
                name="time-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <Text style={styles.selectorText}>
              {time}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#777C89"
            />
          </Pressable>

          {/* DESCRIPTION */}

          <Text style={[styles.label, styles.spacedLabel]}>
            Lecture Description
          </Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            textAlignVertical="top"
            placeholder="Write a short description about the lecture..."
            placeholderTextColor="#999DA8"
            style={styles.descriptionInput}
          />

          <Text style={styles.characterCount}>
            {description.length}/500
          </Text>

          {/* SAVE */}

          <Pressable
            style={[
              styles.saveButton,
              (!description.trim() ||
                !selectedBatchId ||
                !selectedSubjectId ||
                saving) &&
                styles.saveButtonDisabled,
            ]}
            disabled={
              !description.trim() ||
              !selectedBatchId ||
              !selectedSubjectId ||
              saving
            }
            onPress={saveLectureLog}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="checkmark"
                size={20}
                color="#FFFFFF"
              />
            )}

            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Lecture Log'}
            </Text>
          </Pressable>
        </View>

        {/* LECTURE HISTORY */}

        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.historyTitle}>
                Lecture History
              </Text>

              <Text style={styles.historySubtitle}>
                Previous lecture descriptions
              </Text>
            </View>

            <View style={styles.historyCount}>
              <Text style={styles.historyCountText}>
                {filteredLogs.length}
              </Text>
            </View>
          </View>

          {/* FILTERS */}

          <Text style={styles.filterHeading}>
            Filter History
          </Text>

          <Pressable
            style={styles.filterButton}
            onPress={() => openFilter('date')}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#5420D8"
            />

            <Text
              style={styles.filterText}
              numberOfLines={1}
            >
              {filterDate}
            </Text>

            <Ionicons
              name="chevron-down"
              size={15}
              color="#777C89"
            />
          </Pressable>

          <View style={styles.filterRow}>
            <Pressable
              style={styles.filterButton}
              onPress={() => openFilter('batch')}
            >
              <Ionicons
                name="people-outline"
                size={15}
                color="#5420D8"
              />

              <Text
                style={styles.filterText}
                numberOfLines={1}
              >
                {filterBatch}
              </Text>

              <Ionicons
                name="chevron-down"
                size={14}
                color="#777C89"
              />
            </Pressable>

            <Pressable
              style={styles.filterButton}
              onPress={() => openFilter('subject')}
            >
              <Ionicons
                name="book-outline"
                size={15}
                color="#5420D8"
              />

              <Text
                style={styles.filterText}
                numberOfLines={1}
              >
                {filterSubject}
              </Text>

              <Ionicons
                name="chevron-down"
                size={14}
                color="#777C89"
              />
            </Pressable>
          </View>

          {/* HISTORY LIST */}

          {filteredLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="document-outline"
                  size={27}
                  color="#5420D8"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No lecture logs found
              </Text>

              <Text style={styles.emptySubtitle}>
                Try changing your filters or add a lecture log.
              </Text>
            </View>
          ) : (
            filteredLogs.map((log) => (
              <View
                key={`history-log-${log.id}`}
                style={styles.logItem}
              >
                <View style={styles.logTop}>
                  <View style={styles.logDate}>
                    <Ionicons
                      name="calendar-outline"
                      size={15}
                      color="#5420D8"
                    />

                    <Text style={styles.logDateText}>
                      {formatHistoryDate(log.date)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.sourceBadge,
                      log.source === 'attendance' &&
                        styles.attendanceBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sourceText,
                        log.source === 'attendance' &&
                          styles.attendanceText,
                      ]}
                    >
                      {log.source === 'attendance'
                        ? 'Attendance'
                        : 'Lecture Log'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.logBatch}>
                  {log.batch}
                </Text>

                <View style={styles.logMeta}>
                  <Text style={styles.logSubject}>
                    {log.subject}
                  </Text>

                  {!!log.time && (
                    <>
                      <Text style={styles.metaDot}>
                        •
                      </Text>

                      <Text style={styles.logTime}>
                        {log.time}
                      </Text>
                    </>
                  )}
                </View>

                <Text style={styles.logDescription}>
                  {log.description}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* =================================================
          ADD LECTURE LOG SELECTOR MODAL
      ================================================= */}

      <Modal
        visible={selectorVisible}
        transparent
        animationType="fade"
        onRequestClose={closeSelector}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={closeSelector}
          />

          <View
            style={[
              styles.modalCard,
              selectorType === 'date' &&
                styles.calendarModalCard,
              selectorType === 'time' &&
                styles.timeModalCard,
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  {selectorType === 'batch'
                    ? 'Select Batch'
                    : selectorType === 'subject'
                      ? 'Select Subject'
                      : selectorType === 'time'
                        ? 'Select Time Slot'
                        : 'Select Date'}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {selectorType === 'date'
                    ? 'Choose any day, month and year'
                    : selectorType === 'time'
                      ? 'Choose the lecture time'
                      : 'Choose an assigned option'}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeSelector}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#555B69"
                />
              </Pressable>
            </View>

            {/* CALENDAR */}

            {selectorType === 'date' ? (
              <Calendar
                year={calendarYear}
                month={calendarMonth}
                selectedDate={selectedDate}
                onPreviousMonth={() => changeMonth(-1)}
                onNextMonth={() => changeMonth(1)}
                onSelectDate={selectCalendarDate}
              />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
              >
                {selectorType === 'batch' &&
                  (batches.length === 0 ? (
                    <Text style={styles.modalEmptyText}>
                      No assigned batches available.
                    </Text>
                  ) : (
                    batches.map((item) => {
                      const label =
                        item.name || item.standard || 'Batch';

                      const selected =
                        item._id === selectedBatchId;

                      return (
                        <Pressable
                          key={item._id}
                          style={[
                            styles.modalOption,
                            selected &&
                              styles.modalOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedBatchId(item._id);
                            setSelectedSubjectId('');
                            setSubjects([]);
                            closeSelector();
                          }}
                        >
                          <Text
                            style={[
                              styles.modalOptionText,
                              selected &&
                                styles.modalOptionTextSelected,
                            ]}
                          >
                            {label}
                          </Text>

                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={21}
                              color="#5420D8"
                            />
                          )}
                        </Pressable>
                      );
                    })
                  ))}

                {selectorType === 'subject' &&
                  (subjects.length === 0 ? (
                    <Text style={styles.modalEmptyText}>
                      No assigned subjects available for this batch.
                    </Text>
                  ) : (
                    subjects.map((item) => {
                      const selected =
                        item.id === selectedSubjectId;

                      return (
                        <Pressable
                          key={item.id}
                          style={[
                            styles.modalOption,
                            selected &&
                              styles.modalOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedSubjectId(item.id);
                            closeSelector();
                          }}
                        >
                          <Text
                            style={[
                              styles.modalOptionText,
                              selected &&
                                styles.modalOptionTextSelected,
                            ]}
                          >
                            {item.name}
                          </Text>

                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={21}
                              color="#5420D8"
                            />
                          )}
                        </Pressable>
                      );
                    })
                  ))}

                {selectorType === 'time' &&
                  TIME_SLOTS.map((item) => {
                    const selected = item === time;

                    return (
                      <Pressable
                        key={item}
                        style={[
                          styles.modalOption,
                          selected &&
                            styles.modalOptionSelected,
                          styles.timeModalOption,
                        ]}
                        onPress={() => {
                          setTime(item);
                          closeSelector();
                        }}
                      >
                        <View
                          style={[
                            styles.timeOptionIcon,
                            selected &&
                              styles.timeOptionIconSelected,
                          ]}
                        >
                          <Ionicons
                            name="time-outline"
                            size={18}
                            color={
                              selected
                                ? '#5420D8'
                                : '#777C89'
                            }
                          />
                        </View>

                        <Text
                          style={[
                            styles.modalOptionText,
                            selected &&
                              styles.modalOptionTextSelected,
                            styles.timeOptionText,
                          ]}
                        >
                          {item}
                        </Text>

                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={21}
                            color="#5420D8"
                          />
                        )}
                      </Pressable>
                    );
                  })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =================================================
          HISTORY FILTER MODAL
      ================================================= */}

      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setFilterVisible(false)}
          />

          <View
            style={[
              styles.modalCard,
              filterType === 'date' &&
                styles.calendarModalCard,
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  Filter by{' '}
                  {filterType === 'batch'
                    ? 'Batch'
                    : filterType === 'subject'
                      ? 'Subject'
                      : 'Date'}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {filterType === 'date'
                    ? 'Select any date from the calendar'
                    : 'Choose what you want to see'}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setFilterVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#555B69"
                />
              </Pressable>
            </View>

            {/* DATE FILTER */}

            {filterType === 'date' ? (
              <>
                <Pressable
                  style={styles.allDatesButton}
                  onPress={clearDateFilter}
                >
                  <Text
                    style={[
                      styles.allDatesText,
                      filterDate === 'All Dates' &&
                        styles.allDatesTextSelected,
                    ]}
                  >
                    All Dates
                  </Text>

                  {filterDate === 'All Dates' && (
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color="#5420D8"
                    />
                  )}
                </Pressable>

                <Calendar
                  year={calendarYear}
                  month={calendarMonth}
                  selectedDate={filterDate}
                  onPreviousMonth={() => {
                    const newDate = new Date(
                      calendarYear,
                      calendarMonth - 1,
                      1,
                    );

                    setCalendarMonth(newDate.getMonth());
                    setCalendarYear(newDate.getFullYear());
                  }}
                  onNextMonth={() => {
                    const newDate = new Date(
                      calendarYear,
                      calendarMonth + 1,
                      1,
                    );

                    setCalendarMonth(newDate.getMonth());
                    setCalendarYear(newDate.getFullYear());
                  }}
                  onSelectDate={selectFilterDate}
                />
              </>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
              >
                {(filterType === 'batch'
                  ? [
                      'All Batches',
                      ...Array.from(
                        new Set(logs.map((log) => log.batch)),
                      ),
                    ]
                  : [
                      'All Subjects',
                      ...Array.from(
                        new Set(logs.map((log) => log.subject)),
                      ),
                    ]
                ).map((item) => {
                  const selected =
                    item ===
                    (filterType === 'batch'
                      ? filterBatch
                      : filterSubject);

                  return (
                    <Pressable
                      key={`filter-${filterType}-${item}`}
                      style={[
                        styles.modalOption,
                        selected &&
                          styles.modalOptionSelected,
                      ]}
                      onPress={() => {
                        if (item === 'All Batches') {
                          setFilterBatch('All Batches');
                          setFilterVisible(false);
                          return;
                        }

                        if (item === 'All Subjects') {
                          setFilterSubject('All Subjects');
                          setFilterVisible(false);
                          return;
                        }

                        selectFilterValue(item);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          selected &&
                            styles.modalOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color="#5420D8"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

/* =====================================================
   CALENDAR COMPONENT
===================================================== */

type CalendarProps = {
  year: number;
  month: number;
  selectedDate: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
};

function Calendar({
  year,
  month,
  selectedDate,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: CalendarProps) {
  const calendarCells = createCalendarCells(year, month);

  return (
    <View style={styles.calendar}>
      {/* MONTH NAVIGATION */}

      <View style={styles.calendarHeader}>
        <Pressable
          style={styles.monthArrow}
          onPress={onPreviousMonth}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color="#5420D8"
          />
        </Pressable>

        <View style={styles.monthYearContainer}>
          <Text style={styles.calendarMonth}>
            {MONTH_NAMES[month]}
          </Text>

          <Text style={styles.calendarYear}>
            {year}
          </Text>
        </View>

        <Pressable
          style={styles.monthArrow}
          onPress={onNextMonth}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#5420D8"
          />
        </Pressable>
      </View>

      {/* WEEKDAYS */}

      <View style={styles.weekRow}>
        {DAY_NAMES.map((day) => (
          <View
            key={`weekday-${day}`}
            style={styles.weekDay}
          >
            <Text style={styles.weekDayText}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* CALENDAR DAYS */}

      <View style={styles.calendarGrid}>
        {calendarCells.map((cell, index) => {
          if (cell === null) {
            return (
              <View
                key={`empty-${year}-${month}-${index}`}
                style={styles.calendarCell}
              />
            );
          }

          const dateKey = formatDate(cell);
          const selected = dateKey === selectedDate;
          const today = isToday(cell);

          return (
            <Pressable
              key={`date-${year}-${month}-${cell.getDate()}`}
              style={[
                styles.calendarCell,
                selected && styles.selectedCalendarCell,
                !selected &&
                  today &&
                  styles.todayCalendarCell,
              ]}
              onPress={() => onSelectDate(cell)}
            >
              <Text
                style={[
                  styles.calendarDateText,
                  selected &&
                    styles.selectedCalendarDateText,
                  !selected &&
                    today &&
                    styles.todayCalendarDateText,
                ]}
              >
                {cell.getDate()}
              </Text>

              {today && !selected && (
                <View style={styles.todayDot} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* SELECTED DATE */}

      <View style={styles.selectedDatePreview}>
        <View style={styles.selectedDateIcon}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#5420D8"
          />
        </View>

        <View style={styles.selectedDateTextContainer}>
          <Text style={styles.selectedDateLabel}>
            Selected Date
          </Text>

          <Text style={styles.selectedDateValue}>
            {selectedDate !== 'All Dates'
              ? selectedDate
              : 'No date selected'}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* =====================================================
   CALENDAR HELPERS
===================================================== */

function createCalendarCells(
  year: number,
  month: number,
): Array<Date | null> {
  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const cells: Array<Date | null> = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');

  const month = MONTH_NAMES[date.getMonth()].slice(0, 3);

  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function parseDisplayDate(value: string): Date {
  if (value === 'All Dates') {
    return new Date();
  }

  const parts = value.split(' ');

  const day = Number(parts[0]);

  const month = MONTH_NAMES.findIndex(
    (item) => item.slice(0, 3) === parts[1],
  );

  const year = Number(parts[2]);

  return new Date(year, month, day);
}

/*
 * Convert the selected local calendar date to YYYY-MM-DD.
 * Avoids shifting the selected day because of UTC timezone
 * conversion.
 */
function dateToISO(value: string): string {
  const date = parseDisplayDate(value);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normalizeDate(value: string): string {
  if (!value) {
    return '';
  }

  const datePart = value.slice(0, 10);

  const parts = datePart.split('-');

  if (parts.length !== 3) {
    return datePart;
  }

  const [year, month, day] = parts;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  return formatDate(date);
}

function formatHistoryDate(value: string): string {
  if (!value) {
    return '';
  }

  /*
   * Manual lecture logs are normalized to YYYY-MM-DD
   * in loadLectureHistory.
   * Attendance entries from the service may already
   * use YYYY-MM-DD.
   */
  const parts = value.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );

    return formatDate(date);
  }

  return value;
}

function isToday(date: Date): boolean {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 110,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#777C89',
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    marginTop: 10,
  },

  errorCard: {
    backgroundColor: '#FFF0EF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  errorText: {
    flex: 1,
    color: '#A93226',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
  },

  retryText: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 19,
  },

  headerSubtitle: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  cardTitle: {
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
  },

  cardSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginBottom: 12,
  },

  label: {
    color: '#343848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    marginBottom: 5,
  },

  spacedLabel: {
    marginTop: 10,
  },

  selector: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E3E1E8',
    borderRadius: 12,
    backgroundColor: '#F8F7FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  disabledSelector: {
    opacity: 0.55,
  },

  selectorIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectorText: {
    flex: 1,
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    marginLeft: 9,
  },

  descriptionInput: {
    minHeight: 125,
    borderWidth: 1,
    borderColor: '#E3E1E8',
    borderRadius: 12,
    backgroundColor: '#F8F7FA',
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  characterCount: {
    color: '#999DA8',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    textAlign: 'right',
    marginTop: 3,
  },

  saveButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor: '#5420D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },

  saveButtonDisabled: {
    backgroundColor: '#C8C8CE',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
  },

  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  historyTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  historySubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
  },

  historyCount: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyCountText: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
    fontSize: 13,
  },

  filterHeading: {
    color: '#343848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    marginTop: 14,
    marginBottom: 6,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 7,
  },

  filterButton: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#E3E1E8',
    borderRadius: 10,
    backgroundColor: '#F8F7FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    gap: 5,
  },

  filterText: {
    flex: 1,
    color: '#555B69',
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
  },

  logItem: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
    paddingVertical: 13,
    marginTop: 8,
  },

  logTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  logDateText: {
    color: '#777C89',
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
  },

  sourceBadge: {
    backgroundColor: '#EEE7FF',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  attendanceBadge: {
    backgroundColor: '#E4F7EC',
  },

  sourceText: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
  },

  attendanceText: {
    color: '#258357',
  },

  logBatch: {
    color: '#171A2B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    marginTop: 7,
  },

  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },

  logSubject: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
  },

  metaDot: {
    color: '#A0A3AD',
  },

  logTime: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
  },

  logDescription: {
    color: '#555B69',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    lineHeight: 17,
    marginTop: 7,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: '#343848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    marginTop: 8,
  },

  emptySubtitle: {
    color: '#9296A2',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    textAlign: 'center',
  },

  bottomSpace: {
    height: 100,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    maxHeight: '70%',
    elevation: 20,
  },

  calendarModalCard: {
    maxHeight: '82%',
  },

  timeModalCard: {
    maxHeight: '78%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 18,
  },

  modalSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 1,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#F4F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOption: {
    minHeight: 52,
    borderRadius: 11,
    paddingHorizontal: 11,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalOptionSelected: {
    backgroundColor: '#F1EBFF',
  },

  modalOptionText: {
    flex: 1,
    color: '#343848',
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
  },

  modalOptionTextSelected: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
  },

  modalEmptyText: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 25,
  },

  timeModalOption: {
    minHeight: 54,
  },

  timeOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  timeOptionIconSelected: {
    backgroundColor: '#EEE7FF',
  },

  timeOptionText: {
    fontSize: 12,
  },

  calendar: {
    width: '100%',
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthYearContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarMonth: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 16,
  },

  calendarYear: {
    color: '#777C89',
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    marginTop: -1,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  weekDay: {
    width: '14.2857%',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekDayText: {
    color: '#9296A2',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calendarCell: {
    width: '14.2857%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  calendarDateText: {
    width: 34,
    height: 34,
    borderRadius: 17,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#343848',
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,
    paddingTop: 8,
  },

  selectedCalendarCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCalendarDateText: {
    backgroundColor: '#5420D8',
    color: '#FFFFFF',
    fontFamily: 'PoppinsBold',
  },

  todayCalendarCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  todayCalendarDateText: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
  },

  todayDot: {
    position: 'absolute',
    bottom: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5420D8',
  },

  selectedDatePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EBFF',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },

  selectedDateIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDateTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  selectedDateLabel: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
  },

  selectedDateValue: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    marginTop: 1,
  },

  allDatesButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#F1EBFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  allDatesText: {
    color: '#555B69',
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
  },

  allDatesTextSelected: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
  },
});