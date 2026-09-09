import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  addLectureLog,
  getLectureLogs,
  LectureLog,
  subscribeToLectureLogs,
} from '../lectureLogStore';

type AddLectureLogProps = {
  onContentScroll?: (
    event: any,
  ) => void;
};

const BATCHES = [
  '8th Standard',
  '9th Standard',
  '10th Standard',
  '11th Standard',
];

const SUBJECTS = [
  'Physics',
  'Mathematics',
  'Chemistry',
];

/*
 * TIME SLOTS
 *
 * These are controlled by the app.
 * The teacher selects one instead of typing.
 *
 * You can add/remove slots here later
 * without changing the rest of the screen.
 */
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

type SelectorType =
  | 'batch'
  | 'subject'
  | 'time'
  | 'date';

export default function AddLectureLog({
  onContentScroll,
}: AddLectureLogProps) {
  const today = new Date();

  const [batch, setBatch] =
    useState('8th Standard');

  const [subject, setSubject] =
    useState('Physics');

  const [description, setDescription] =
    useState('');

  const [selectedDate, setSelectedDate] =
    useState(formatDate(today));

  /*
   * Default time slot.
   */
  const [time, setTime] =
    useState('09:00 AM - 10:00 AM');

  const [logs, setLogs] =
    useState<LectureLog[]>(
      getLectureLogs(),
    );

  /*
   * Main selector modal.
   */
  const [
    selectorVisible,
    setSelectorVisible,
  ] = useState(false);

  const [selectorType, setSelectorType] =
    useState<SelectorType>('batch');

  /*
   * Calendar state.
   */
  const [calendarMonth, setCalendarMonth] =
    useState(today.getMonth());

  const [calendarYear, setCalendarYear] =
    useState(today.getFullYear());

  /*
   * History filters.
   */
  const [
    filterVisible,
    setFilterVisible,
  ] = useState(false);

  const [filterType, setFilterType] =
    useState<
      'batch' | 'subject' | 'date'
    >('date');

  const [filterBatch, setFilterBatch] =
    useState('All Batches');

  const [filterSubject, setFilterSubject] =
    useState('All Subjects');

  const [filterDate, setFilterDate] =
    useState('All Dates');

  /*
   * Keep history synchronized
   * with Mark Attendance.
   */
  useEffect(() => {
    const unsubscribe =
      subscribeToLectureLogs(
        (updatedLogs) => {
          setLogs(updatedLogs);
        },
      );

    return unsubscribe;
  }, []);

  /*
   * Apply history filters.
   */
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

  /*
   * Open Batch / Subject / Time / Date selector.
   */
  const openSelector = (
    type: SelectorType,
  ) => {
    setSelectorType(type);

    /*
     * When opening the date selector,
     * show the currently selected month.
     */
    if (type === 'date') {
      const date =
        parseDisplayDate(selectedDate);

      setCalendarMonth(
        date.getMonth(),
      );

      setCalendarYear(
        date.getFullYear(),
      );
    }

    setSelectorVisible(true);
  };

  const closeSelector = () => {
    setSelectorVisible(false);
  };

  /*
   * Save lecture log.
   */
  const saveLectureLog = () => {
    const cleanDescription =
      description.trim();

    if (!cleanDescription) {
      Alert.alert(
        'Lecture Description',
        'Please write a description before saving.',
      );

      return;
    }

    addLectureLog({
      id: `lecture-${Date.now()}`,
      date: selectedDate,
      batch,
      subject,
      time,
      description:
        cleanDescription,
      source: 'lecture-log',
    });

    setDescription('');

    Alert.alert(
      'Lecture Log Saved',
      'Your lecture description has been saved successfully.',
    );
  };

  /*
   * Select date from calendar.
   */
  const selectCalendarDate = (
    date: Date,
  ) => {
    setSelectedDate(
      formatDate(date),
    );

    setSelectorVisible(false);
  };

  /*
   * Dynamic month navigation.
   *
   * December 2026 -> January 2027
   * January 2027 -> December 2026
   */
  const changeMonth = (
    amount: number,
  ) => {
    const newDate =
      new Date(
        calendarYear,
        calendarMonth + amount,
        1,
      );

    setCalendarMonth(
      newDate.getMonth(),
    );

    setCalendarYear(
      newDate.getFullYear(),
    );
  };

  /*
   * Open history filter.
   */
  const openFilter = (
    type:
      | 'batch'
      | 'subject'
      | 'date',
  ) => {
    setFilterType(type);

    if (type === 'date') {
      if (
        filterDate !== 'All Dates'
      ) {
        const date =
          parseDisplayDate(
            filterDate,
          );

        setCalendarMonth(
          date.getMonth(),
        );

        setCalendarYear(
          date.getFullYear(),
        );
      } else {
        const now = new Date();

        setCalendarMonth(
          now.getMonth(),
        );

        setCalendarYear(
          now.getFullYear(),
        );
      }
    }

    setFilterVisible(true);
  };

  /*
   * Select history date.
   */
  const selectFilterDate = (
    date: Date,
  ) => {
    setFilterDate(
      formatDate(date),
    );

    setFilterVisible(false);
  };

  /*
   * Select history batch / subject.
   */
  const selectFilterValue = (
    value: string,
  ) => {
    if (
      filterType === 'batch'
    ) {
      setFilterBatch(value);
    }

    if (
      filterType === 'subject'
    ) {
      setFilterSubject(value);
    }

    setFilterVisible(false);
  };

  /*
   * Clear date history filter.
   */
  const clearDateFilter = () => {
    setFilterDate('All Dates');
    setFilterVisible(false);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        scrollEventThrottle={16}
        onScroll={onContentScroll}
      >
        {/* ========================================= */}
        {/* HEADER                                    */}
        {/* ========================================= */}

        <View style={styles.headerCard}>
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

        {/* ========================================= */}
        {/* ADD LECTURE LOG                           */}
        {/* ========================================= */}

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
            onPress={() =>
              openSelector('date')
            }
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

          <Text
            style={[
              styles.label,
              styles.spacedLabel,
            ]}
          >
            Batch
          </Text>

          <Pressable
            style={styles.selector}
            onPress={() =>
              openSelector('batch')
            }
          >
            <View style={styles.selectorIcon}>
              <Ionicons
                name="people-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <Text style={styles.selectorText}>
              {batch}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#777C89"
            />
          </Pressable>

          {/* SUBJECT */}

          <Text
            style={[
              styles.label,
              styles.spacedLabel,
            ]}
          >
            Subject
          </Text>

          <Pressable
            style={styles.selector}
            onPress={() =>
              openSelector('subject')
            }
          >
            <View style={styles.selectorIcon}>
              <Ionicons
                name="book-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <Text style={styles.selectorText}>
              {subject}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#777C89"
            />
          </Pressable>

          {/* ========================================= */}
          {/* TIME SLOT - DROPDOWN                     */}
          {/* ========================================= */}

          <Text
            style={[
              styles.label,
              styles.spacedLabel,
            ]}
          >
            Time Slot
          </Text>

          <Pressable
            style={styles.selector}
            onPress={() =>
              openSelector('time')
            }
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

          <Text
            style={[
              styles.label,
              styles.spacedLabel,
            ]}
          >
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
            style={
              styles.descriptionInput
            }
          />

          <Text style={styles.characterCount}>
            {description.length}/500
          </Text>

          {/* SAVE */}

          <Pressable
            style={[
              styles.saveButton,
              !description.trim() &&
                styles.saveButtonDisabled,
            ]}
            disabled={!description.trim()}
            onPress={saveLectureLog}
          >
            <Ionicons
              name="checkmark"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              Save Lecture Log
            </Text>
          </Pressable>
        </View>

        {/* ========================================= */}
        {/* LECTURE HISTORY                           */}
        {/* ========================================= */}

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

          {/* FILTER */}

          <Text style={styles.filterHeading}>
            Filter History
          </Text>

          {/* DATE FILTER */}

          <Pressable
            style={styles.filterButton}
            onPress={() =>
              openFilter('date')
            }
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

          {/* BATCH + SUBJECT FILTER */}

          <View style={styles.filterRow}>
            <Pressable
              style={styles.filterButton}
              onPress={() =>
                openFilter('batch')
              }
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
              onPress={() =>
                openFilter('subject')
              }
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

          {/* HISTORY */}

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
                Try changing your filters.
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

                    <Text
                      style={
                        styles.logDateText
                      }
                    >
                      {log.date}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.sourceBadge,
                      log.source ===
                        'attendance' &&
                        styles.attendanceBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sourceText,
                        log.source ===
                          'attendance' &&
                          styles.attendanceText,
                      ]}
                    >
                      {log.source ===
                      'attendance'
                        ? 'Attendance'
                        : 'Lecture Log'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.logBatch}>
                  {log.batch}
                </Text>

                <View style={styles.logMeta}>
                  <Text
                    style={styles.logSubject}
                  >
                    {log.subject}
                  </Text>

                  <Text style={styles.metaDot}>
                    •
                  </Text>

                  <Text style={styles.logTime}>
                    {log.time}
                  </Text>
                </View>

                <Text
                  style={
                    styles.logDescription
                  }
                >
                  {log.description}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ========================================= */}
      {/* ADD LECTURE LOG SELECTOR MODAL            */}
      {/* ========================================= */}

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
            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text
                  style={styles.modalTitle}
                >
                  {selectorType === 'batch'
                    ? 'Select Batch'
                    : selectorType ===
                        'subject'
                      ? 'Select Subject'
                      : selectorType ===
                          'time'
                        ? 'Select Time Slot'
                        : 'Select Date'}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {selectorType === 'date'
                    ? 'Choose any day, month and year'
                    : selectorType === 'time'
                      ? 'Choose the lecture time'
                      : 'Choose an option'}
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

            {/* ===================================== */}
            {/* DATE CALENDAR                          */}
            {/* ===================================== */}

            {selectorType === 'date' ? (
              <Calendar
                year={calendarYear}
                month={calendarMonth}
                selectedDate={selectedDate}
                onPreviousMonth={() =>
                  changeMonth(-1)
                }
                onNextMonth={() =>
                  changeMonth(1)
                }
                onSelectDate={
                  selectCalendarDate
                }
              />
            ) : (
              /* =================================== */
              /* BATCH / SUBJECT / TIME OPTIONS       */
              /* =================================== */

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                {(
                  selectorType === 'batch'
                    ? BATCHES
                    : selectorType ===
                        'subject'
                      ? SUBJECTS
                      : TIME_SLOTS
                ).map((item) => {
                  const selected =
                    item ===
                    (selectorType === 'batch'
                      ? batch
                      : selectorType ===
                          'subject'
                        ? subject
                        : time);

                  return (
                    <Pressable
                      key={`selector-${selectorType}-${item}`}
                      style={[
                        styles.modalOption,

                        selected &&
                          styles.modalOptionSelected,

                        selectorType ===
                          'time' &&
                          styles.timeModalOption,
                      ]}
                      onPress={() => {
                        if (
                          selectorType ===
                          'batch'
                        ) {
                          setBatch(item);
                        }

                        if (
                          selectorType ===
                          'subject'
                        ) {
                          setSubject(item);
                        }

                        if (
                          selectorType ===
                          'time'
                        ) {
                          setTime(item);
                        }

                        closeSelector();
                      }}
                    >
                      {selectorType ===
                        'time' && (
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
                      )}

                      <Text
                        style={[
                          styles.modalOptionText,

                          selected &&
                            styles.modalOptionTextSelected,

                          selectorType ===
                            'time' &&
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

      {/* ========================================= */}
      {/* HISTORY FILTER MODAL                      */}
      {/* ========================================= */}

      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setFilterVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() =>
              setFilterVisible(false)
            }
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
                <Text
                  style={styles.modalTitle}
                >
                  Filter by{' '}
                  {filterType === 'batch'
                    ? 'Batch'
                    : filterType === 'subject'
                      ? 'Subject'
                      : 'Date'}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {filterType === 'date'
                    ? 'Select any date from the calendar'
                    : 'Choose what you want to see'}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setFilterVisible(false)
                }
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
                  style={
                    styles.allDatesButton
                  }
                  onPress={
                    clearDateFilter
                  }
                >
                  <Text
                    style={[
                      styles.allDatesText,
                      filterDate ===
                        'All Dates' &&
                        styles.allDatesTextSelected,
                    ]}
                  >
                    All Dates
                  </Text>

                  {filterDate ===
                    'All Dates' && (
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
                    const newDate =
                      new Date(
                        calendarYear,
                        calendarMonth - 1,
                        1,
                      );

                    setCalendarMonth(
                      newDate.getMonth(),
                    );

                    setCalendarYear(
                      newDate.getFullYear(),
                    );
                  }}
                  onNextMonth={() => {
                    const newDate =
                      new Date(
                        calendarYear,
                        calendarMonth + 1,
                        1,
                      );

                    setCalendarMonth(
                      newDate.getMonth(),
                    );

                    setCalendarYear(
                      newDate.getFullYear(),
                    );
                  }}
                  onSelectDate={
                    selectFilterDate
                  }
                />
              </>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                {(
                  filterType === 'batch'
                    ? [
                        'All Batches',
                        ...BATCHES,
                      ]
                    : [
                        'All Subjects',
                        ...SUBJECTS,
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
                      onPress={() =>
                        selectFilterValue(
                          item,
                        )
                      }
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

/* ===================================================== */
/* CALENDAR COMPONENT                                    */
/* ===================================================== */

type CalendarProps = {
  year: number;
  month: number;
  selectedDate: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (
    date: Date,
  ) => void;
};

function Calendar({
  year,
  month,
  selectedDate,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: CalendarProps) {
  const calendarCells =
    createCalendarCells(
      year,
      month,
    );

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

        <View
          style={
            styles.monthYearContainer
          }
        >
          <Text
            style={
              styles.calendarMonth
            }
          >
            {MONTH_NAMES[month]}
          </Text>

          <Text
            style={
              styles.calendarYear
            }
          >
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
            <Text
              style={styles.weekDayText}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* CALENDAR DAYS */}

      <View style={styles.calendarGrid}>
        {calendarCells.map(
          (cell, index) => {
            /*
             * Use index for empty cells.
             *
             * This prevents duplicate
             * React keys.
             */
            if (cell === null) {
              return (
                <View
                  key={`empty-${year}-${month}-${index}`}
                  style={
                    styles.calendarCell
                  }
                />
              );
            }

            const dateKey =
              formatDate(cell);

            const selected =
              dateKey ===
              selectedDate;

            const today =
              isToday(cell);

            return (
              <Pressable
                key={`date-${year}-${month}-${cell.getDate()}`}
                style={[
                  styles.calendarCell,
                  selected &&
                    styles.selectedCalendarCell,
                  !selected &&
                    today &&
                    styles.todayCalendarCell,
                ]}
                onPress={() =>
                  onSelectDate(cell)
                }
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

                {today &&
                  !selected && (
                    <View
                      style={
                        styles.todayDot
                      }
                    />
                  )}
              </Pressable>
            );
          },
        )}
      </View>

      {/* SELECTED DATE */}

      <View
        style={
          styles.selectedDatePreview
        }
      >
        <View
          style={
            styles.selectedDateIcon
          }
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#5420D8"
          />
        </View>

        <View
          style={
            styles.selectedDateTextContainer
          }
        >
          <Text
            style={
              styles.selectedDateLabel
            }
          >
            Selected Date
          </Text>

          <Text
            style={
              styles.selectedDateValue
            }
          >
            {selectedDate !== 'All Dates'
              ? selectedDate
              : 'No date selected'}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ===================================================== */
/* CALENDAR HELPERS                                      */
/* ===================================================== */

function createCalendarCells(
  year: number,
  month: number,
): Array<Date | null> {
  const firstDay =
    new Date(
      year,
      month,
      1,
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0,
    ).getDate();

  const cells: Array<
    Date | null
  > = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
    cells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push(
      new Date(
        year,
        month,
        day,
      ),
    );
  }

  while (
    cells.length % 7 !==
    0
  ) {
    cells.push(null);
  }

  return cells;
}

function formatDate(
  date: Date,
): string {
  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function parseDisplayDate(
  value: string,
): Date {
  if (
    value === 'All Dates'
  ) {
    return new Date();
  }

  const parts =
    value.split(' ');

  const day =
    Number(parts[0]);

  const month =
    MONTH_NAMES.indexOf(
      parts[1],
    );

  const year =
    Number(parts[2]);

  return new Date(
    year,
    month,
    day,
  );
}

function isToday(
  date: Date,
): boolean {
  const today =
    new Date();

  return (
    date.getDate() ===
      today.getDate() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getFullYear() ===
      today.getFullYear()
  );
}

/* ===================================================== */
/* STYLES                                                */
/* ===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#F6F6F9',
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 110,
  },

  /* HEADER */

  headerCard: {
    backgroundColor:
      '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection:
      'row',
    alignItems:
      'center',
    marginBottom: 10,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      '#EEE7FF',
    alignItems:
      'center',
    justifyContent:
      'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: '#111528',
    fontFamily:
      'PoppinsBold',
    fontSize: 19,
  },

  headerSubtitle: {
    color: '#777C89',
    fontFamily:
      'PoppinsRegular',
    fontSize: 10.5,
  },

  /* CARD */

  card: {
    backgroundColor:
      '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  cardTitle: {
    color: '#111528',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 16,
  },

  cardSubtitle: {
    color: '#858996',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9.5,
    marginBottom: 12,
  },

  label: {
    color: '#343848',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 11,
    marginBottom: 5,
  },

  spacedLabel: {
    marginTop: 10,
  },

  /* SELECTOR */

  selector: {
    minHeight: 50,
    borderWidth: 1,
    borderColor:
      '#E3E1E8',
    borderRadius: 12,
    backgroundColor:
      '#F8F7FA',
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 10,
  },

  selectorIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor:
      '#EEE7FF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  selectorText: {
    flex: 1,
    color: '#171A2B',
    fontFamily:
      'PoppinsMedium',
    fontSize: 12,
    marginLeft: 9,
  },

  /* DESCRIPTION */

  descriptionInput: {
    minHeight: 125,
    borderWidth: 1,
    borderColor:
      '#E3E1E8',
    borderRadius: 12,
    backgroundColor:
      '#F8F7FA',
    color: '#171A2B',
    fontFamily:
      'PoppinsMedium',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  characterCount: {
    color: '#999DA8',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9,
    textAlign:
      'right',
    marginTop: 3,
  },

  /* SAVE */

  saveButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor:
      '#5420D8',
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
    gap: 6,
    marginTop: 12,
  },

  saveButtonDisabled: {
    backgroundColor:
      '#C8C8CE',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 13,
  },

  /* HISTORY */

  historyCard: {
    backgroundColor:
      '#FFFFFF',
    borderRadius: 18,
    padding: 14,
  },

  historyHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  historyTitle: {
    color: '#111528',
    fontFamily:
      'PoppinsBold',
    fontSize: 17,
  },

  historySubtitle: {
    color: '#858996',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9.5,
  },

  historyCount: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor:
      '#EEE7FF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  historyCountText: {
    color: '#5420D8',
    fontFamily:
      'PoppinsBold',
    fontSize: 13,
  },

  filterHeading: {
    color: '#343848',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 11,
    marginTop: 14,
    marginBottom: 6,
  },

  filterRow: {
    flexDirection:
      'row',
    gap: 7,
    marginTop: 7,
  },

  filterButton: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor:
      '#E3E1E8',
    borderRadius: 10,
    backgroundColor:
      '#F8F7FA',
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 9,
    gap: 5,
  },

  filterText: {
    flex: 1,
    color: '#555B69',
    fontFamily:
      'PoppinsMedium',
    fontSize: 9.5,
  },

  /* HISTORY ITEM */

  logItem: {
    borderTopWidth: 1,
    borderTopColor:
      '#EEEEF2',
    paddingVertical: 13,
    marginTop: 8,
  },

  logTop: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  logDate: {
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 5,
  },

  logDateText: {
    color: '#777C89',
    fontFamily:
      'PoppinsMedium',
    fontSize: 9.5,
  },

  sourceBadge: {
    backgroundColor:
      '#EEE7FF',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  attendanceBadge: {
    backgroundColor:
      '#E4F7EC',
  },

  sourceText: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 7.5,
  },

  attendanceText: {
    color: '#258357',
  },

  logBatch: {
    color: '#171A2B',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 13,
    marginTop: 7,
  },

  logMeta: {
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 5,
    marginTop: 2,
  },

  logSubject: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 9.5,
  },

  metaDot: {
    color: '#A0A3AD',
  },

  logTime: {
    color: '#858996',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9,
  },

  logDescription: {
    color: '#555B69',
    fontFamily:
      'PoppinsRegular',
    fontSize: 10.5,
    lineHeight: 17,
    marginTop: 7,
  },

  /* EMPTY */

  emptyState: {
    alignItems:
      'center',
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor:
      '#EEE7FF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  emptyTitle: {
    color: '#343848',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 12,
    marginTop: 8,
  },

  emptySubtitle: {
    color: '#9296A2',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9.5,
  },

  bottomSpace: {
    height: 100,
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    justifyContent:
      'center',
    paddingHorizontal: 22,
  },

  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(0,0,0,0.45)',
  },

  modalCard: {
    backgroundColor:
      '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    maxHeight: '70%',
    elevation: 20,
  },

  calendarModalCard: {
    maxHeight: '82%',
  },

  /*
   * Slightly taller modal for
   * the time-slot list.
   */
  timeModalCard: {
    maxHeight: '78%',
  },

  modalHeader: {
    flexDirection:
      'row',
    alignItems:
      'flex-start',
    justifyContent:
      'space-between',
    marginBottom: 10,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    color: '#111528',
    fontFamily:
      'PoppinsBold',
    fontSize: 18,
  },

  modalSubtitle: {
    color: '#858996',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 1,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor:
      '#F4F4F7',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  modalOption: {
    minHeight: 52,
    borderRadius: 11,
    paddingHorizontal: 11,
    marginBottom: 5,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  modalOptionSelected: {
    backgroundColor:
      '#F1EBFF',
  },

  modalOptionText: {
    flex: 1,
    color: '#343848',
    fontFamily:
      'PoppinsMedium',
    fontSize: 11.5,
  },

  modalOptionTextSelected: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
  },

  /* TIME OPTIONS */

  timeModalOption: {
    minHeight: 54,
  },

  timeOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor:
      '#F4F4F7',
    alignItems:
      'center',
    justifyContent:
      'center',
    marginRight: 10,
  },

  timeOptionIconSelected: {
    backgroundColor:
      '#EEE7FF',
  },

  timeOptionText: {
    fontSize: 12,
  },

  /* CALENDAR */

  calendar: {
    width: '100%',
  },

  calendarHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    marginBottom: 12,
  },

  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      '#F1EBFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  monthYearContainer: {
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  calendarMonth: {
    color: '#111528',
    fontFamily:
      'PoppinsBold',
    fontSize: 16,
  },

  calendarYear: {
    color: '#777C89',
    fontFamily:
      'PoppinsMedium',
    fontSize: 10,
    marginTop: -1,
  },

  weekRow: {
    flexDirection:
      'row',
    marginBottom: 4,
  },

  weekDay: {
    width: '14.2857%',
    height: 28,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  weekDayText: {
    color: '#9296A2',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 9,
  },

  calendarGrid: {
    flexDirection:
      'row',
    flexWrap:
      'wrap',
  },

  calendarCell: {
    width: '14.2857%',
    height: 42,
    alignItems:
      'center',
    justifyContent:
      'center',
    position:
      'relative',
  },

  calendarDateText: {
    width: 34,
    height: 34,
    borderRadius: 17,
    textAlign:
      'center',
    textAlignVertical:
      'center',
    color: '#343848',
    fontFamily:
      'PoppinsMedium',
    fontSize: 10.5,
    paddingTop: 8,
  },

  selectedCalendarCell: {
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  selectedCalendarDateText: {
    backgroundColor:
      '#5420D8',
    color: '#FFFFFF',
    fontFamily:
      'PoppinsBold',
  },

  todayCalendarCell: {
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  todayCalendarDateText: {
    color: '#5420D8',
    fontFamily:
      'PoppinsBold',
  },

  todayDot: {
    position:
      'absolute',
    bottom: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor:
      '#5420D8',
  },

  selectedDatePreview: {
    flexDirection:
      'row',
    alignItems:
      'center',
    backgroundColor:
      '#F1EBFF',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },

  selectedDateIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor:
      '#FFFFFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  selectedDateTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  selectedDateLabel: {
    color: '#777C89',
    fontFamily:
      'PoppinsRegular',
    fontSize: 8.5,
  },

  selectedDateValue: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 11,
    marginTop: 1,
  },

  allDatesButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor:
      '#F1EBFF',
    paddingHorizontal: 12,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    marginBottom: 10,
  },

  allDatesText: {
    color: '#555B69',
    fontFamily:
      'PoppinsMedium',
    fontSize: 11.5,
  },

  allDatesTextSelected: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
  },
});