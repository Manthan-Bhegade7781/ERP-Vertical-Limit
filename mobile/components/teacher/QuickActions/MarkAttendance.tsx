import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type MarkAttendanceProps = {
  onContentScroll?: (event: any) => void;
};

type Student = {
  id: string;
  name: string;
  initials: string;
};

type AttendanceStatus = Record<string, boolean>;

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

const TIME_SLOTS = [
  '09:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
  '12:00 PM – 01:00 PM',
  '02:00 PM – 03:00 PM',
  '03:00 PM – 04:00 PM',
];

const STUDENTS_BY_BATCH: Record<string, Student[]> = {
  '8th Standard': [
    {
      id: 'STU-0801',
      name: 'Aarav Mehta',
      initials: 'AM',
    },
    {
      id: 'STU-0802',
      name: 'Avni Shah',
      initials: 'AS',
    },
    {
      id: 'STU-0803',
      name: 'Harsh Kumar',
      initials: 'HK',
    },
    {
      id: 'STU-0804',
      name: 'Kiara Patel',
      initials: 'KP',
    },
    {
      id: 'STU-0805',
      name: 'Reyansh Singh',
      initials: 'RS',
    },
    {
      id: 'STU-0806',
      name: 'Tara Joshi',
      initials: 'TJ',
    },
  ],

  '9th Standard': [
    {
      id: 'STU-0901',
      name: 'Aditi Sharma',
      initials: 'AS',
    },
    {
      id: 'STU-0902',
      name: 'Arjun Verma',
      initials: 'AV',
    },
    {
      id: 'STU-0903',
      name: 'Diya Kapoor',
      initials: 'DK',
    },
    {
      id: 'STU-0904',
      name: 'Kabir Singh',
      initials: 'KS',
    },
    {
      id: 'STU-0905',
      name: 'Meera Shah',
      initials: 'MS',
    },
    {
      id: 'STU-0906',
      name: 'Rohan Patel',
      initials: 'RP',
    },
  ],

  '10th Standard': [
    {
      id: 'STU-1001',
      name: 'Ananya Rao',
      initials: 'AR',
    },
    {
      id: 'STU-1002',
      name: 'Dev Malhotra',
      initials: 'DM',
    },
    {
      id: 'STU-1003',
      name: 'Ishita Jain',
      initials: 'IJ',
    },
    {
      id: 'STU-1004',
      name: 'Karan Shah',
      initials: 'KS',
    },
    {
      id: 'STU-1005',
      name: 'Nisha Patel',
      initials: 'NP',
    },
    {
      id: 'STU-1006',
      name: 'Vivaan Gupta',
      initials: 'VG',
    },
  ],

  '11th Standard': [
    {
      id: 'STU-1101',
      name: 'Aditya Sharma',
      initials: 'AS',
    },
    {
      id: 'STU-1102',
      name: 'Ira Mehta',
      initials: 'IM',
    },
    {
      id: 'STU-1103',
      name: 'Manav Joshi',
      initials: 'MJ',
    },
    {
      id: 'STU-1104',
      name: 'Riya Kapoor',
      initials: 'RK',
    },
    {
      id: 'STU-1105',
      name: 'Sahil Verma',
      initials: 'SV',
    },
    {
      id: 'STU-1106',
      name: 'Tanvi Shah',
      initials: 'TS',
    },
  ],
};

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

const WEEK_DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function MarkAttendance({
  onContentScroll,
}: MarkAttendanceProps) {
  const today = new Date();

  const [selectedDate, setSelectedDate] =
    useState<Date>(today);

  const [calendarMonth, setCalendarMonth] =
    useState<number>(today.getMonth());

  const [calendarYear, setCalendarYear] =
    useState<number>(today.getFullYear());

  const [dateModalVisible, setDateModalVisible] =
    useState(false);

  const [batch, setBatch] =
    useState('8th Standard');

  const [subject, setSubject] =
    useState('Physics');

  const [timeSlot, setTimeSlot] =
    useState('09:00 AM – 10:00 AM');

  const [teacherPresent, setTeacherPresent] =
    useState(true);

  const [lectureDescription, setLectureDescription] =
    useState('');

  const [submitted, setSubmitted] =
    useState(false);

  const [batchModalVisible, setBatchModalVisible] =
    useState(false);

  const [subjectModalVisible, setSubjectModalVisible] =
    useState(false);

  const [timeModalVisible, setTimeModalVisible] =
    useState(false);

  const students =
    STUDENTS_BY_BATCH[batch] ?? [];

  const createInitialAttendance = (
    list: Student[],
  ): AttendanceStatus => {
    const result: AttendanceStatus = {};

    list.forEach((student) => {
      result[student.id] = true;
    });

    return result;
  };

  const [attendance, setAttendance] =
    useState<AttendanceStatus>(
      createInitialAttendance(
        STUDENTS_BY_BATCH['8th Standard'],
      ),
    );

  const presentCount = students.filter(
    (student) => attendance[student.id],
  ).length;

  const absentCount =
    students.length - presentCount;

  /*
   * CALENDAR
   *
   * Everything below is generated automatically.
   *
   * There is NO hard-coded list of dates or years.
   *
   * February, leap years, 30/31 day months,
   * previous/next years are all handled by Date.
   */

  const calendarCells = useMemo(() => {
    const firstDay = new Date(
      calendarYear,
      calendarMonth,
      1,
    ).getDay();

    const daysInMonth = new Date(
      calendarYear,
      calendarMonth + 1,
      0,
    ).getDate();

    const cells: Array<
      number | null
    > = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push(day);
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [calendarMonth, calendarYear]);

  const moveToPreviousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((year) => year - 1);
    } else {
      setCalendarMonth((month) => month - 1);
    }
  };

  const moveToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((year) => year + 1);
    } else {
      setCalendarMonth((month) => month + 1);
    }
  };

  const isSelectedDay = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === calendarMonth &&
      selectedDate.getFullYear() ===
        calendarYear
    );
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === calendarMonth &&
      today.getFullYear() === calendarYear
    );
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      calendarYear,
      calendarMonth,
      day,
    );

    setSelectedDate(newDate);
  };

  const openDatePicker = () => {
    setCalendarMonth(
      selectedDate.getMonth(),
    );

    setCalendarYear(
      selectedDate.getFullYear(),
    );

    setDateModalVisible(true);
  };

  const applyDate = () => {
    setDateModalVisible(false);
    setSubmitted(false);
  };

  /*
   * BATCH
   */

  const handleBatchChange = (
    selectedBatch: string,
  ) => {
    setBatch(selectedBatch);

    const newStudents =
      STUDENTS_BY_BATCH[selectedBatch] ?? [];

    setAttendance(
      createInitialAttendance(newStudents),
    );

    setSubmitted(false);
    setBatchModalVisible(false);
  };

  /*
   * SUBJECT
   */

  const handleSubjectChange = (
    selectedSubject: string,
  ) => {
    setSubject(selectedSubject);
    setSubmitted(false);
    setSubjectModalVisible(false);
  };

  /*
   * TIME SLOT
   */

  const handleTimeSlotChange = (
    selectedTime: string,
  ) => {
    setTimeSlot(selectedTime);
    setSubmitted(false);
    setTimeModalVisible(false);
  };

  /*
   * STUDENT ATTENDANCE
   */

  const toggleStudentAttendance = (
    studentId: string,
  ) => {
    setAttendance((current) => ({
      ...current,
      [studentId]: !current[studentId],
    }));

    setSubmitted(false);
  };

  const markAllPresent = () => {
    setAttendance(
      createInitialAttendance(students),
    );

    setSubmitted(false);
  };

  const markAllAbsent = () => {
    const result: AttendanceStatus = {};

    students.forEach((student) => {
      result[student.id] = false;
    });

    setAttendance(result);
    setSubmitted(false);
  };

  /*
   * SUBMIT
   */

  const handleSubmit = () => {
    setSubmitted(true);

    console.log('ATTENDANCE SUBMITTED:', {
      date: formatDate(selectedDate),
      batch,
      subject,
      timeSlot,
      teacherPresent,
      students: students.map((student) => ({
        studentId: student.id,
        name: student.name,
        present: attendance[student.id],
      })),
      presentCount,
      absentCount,
      lectureDescription,
    });
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* PAGE HEADER */}

        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>
              Mark Attendance
            </Text>

            <Text style={styles.pageSubtitle}>
              Record attendance for your lecture
            </Text>
          </View>

          <View style={styles.dateSmallIcon}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color="#5420D8"
            />
          </View>
        </View>

        {/* DATE */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Lecture Details
          </Text>

          <Text style={styles.fieldLabel}>
            Date
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.selectBox,
              pressed && styles.pressed,
            ]}
            onPress={openDatePicker}
          >
            <View style={styles.selectLeft}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#5420D8"
                />
              </View>

              <Text style={styles.selectText}>
                {formatDate(selectedDate)}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={20}
              color="#777C89"
            />
          </Pressable>

          {/* BATCH */}

          <Text style={styles.fieldLabel}>
            Batch
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.selectBox,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              setBatchModalVisible(true)
            }
          >
            <View style={styles.selectLeft}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="people-outline"
                  size={19}
                  color="#5420D8"
                />
              </View>

              <Text style={styles.selectText}>
                {batch}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={20}
              color="#777C89"
            />
          </Pressable>

          {/* SUBJECT */}

          <Text style={styles.fieldLabel}>
            Subject
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.selectBox,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              setSubjectModalVisible(true)
            }
          >
            <View style={styles.selectLeft}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="book-outline"
                  size={19}
                  color="#5420D8"
                />
              </View>

              <Text style={styles.selectText}>
                {subject}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={20}
              color="#777C89"
            />
          </Pressable>

          {/* TIME SLOT */}

          <Text style={styles.fieldLabel}>
            Time Slot
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.selectBox,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              setTimeModalVisible(true)
            }
          >
            <View style={styles.selectLeft}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="time-outline"
                  size={19}
                  color="#5420D8"
                />
              </View>

              <Text style={styles.selectText}>
                {timeSlot}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={20}
              color="#777C89"
            />
          </Pressable>
        </View>

        {/* TEACHER ATTENDANCE */}

        <View style={styles.card}>
          <View style={styles.teacherHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Your Attendance
              </Text>

              <Text style={styles.sectionSubtitle}>
                Mark your attendance for this lecture
              </Text>
            </View>

            <View style={styles.teacherIcon}>
              <Ionicons
                name="person-outline"
                size={22}
                color="#5420D8"
              />
            </View>
          </View>

          <View style={styles.teacherAttendanceRow}>
            <View style={styles.teacherInfo}>
              <View style={styles.teacherAvatar}>
                <Ionicons
                  name="person-outline"
                  size={25}
                  color="#5420D8"
                />
              </View>

              <View>
                <Text style={styles.teacherName}>
                  Priya Sharma
                </Text>

                <Text style={styles.teacherRole}>
                  Physics Teacher
                </Text>
              </View>
            </View>

            <View style={styles.teacherButtons}>
              <Pressable
                style={[
                  styles.teacherButton,
                  teacherPresent &&
                    styles.teacherPresent,
                ]}
                onPress={() =>
                  setTeacherPresent(true)
                }
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={
                    teacherPresent
                      ? '#FFFFFF'
                      : '#38A96B'
                  }
                />

                <Text
                  style={[
                    styles.teacherButtonText,
                    teacherPresent &&
                      styles.teacherButtonTextActive,
                  ]}
                >
                  Present
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.teacherButton,
                  !teacherPresent &&
                    styles.teacherAbsent,
                ]}
                onPress={() =>
                  setTeacherPresent(false)
                }
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={
                    !teacherPresent
                      ? '#FFFFFF'
                      : '#D34B4B'
                  }
                />

                <Text
                  style={[
                    styles.teacherButtonText,
                    !teacherPresent &&
                      styles.teacherButtonTextActive,
                  ]}
                >
                  Absent
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* STUDENT ATTENDANCE */}

        <View style={styles.card}>
          <View style={styles.studentHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Student Attendance
              </Text>

              <Text style={styles.sectionSubtitle}>
                {students.length} students in this batch
              </Text>
            </View>

            <View style={styles.studentCountBadge}>
              <Text style={styles.studentCountText}>
                {students.length}
              </Text>
            </View>
          </View>

          {/* BULK ACTIONS */}

          <View style={styles.bulkRow}>
            <Pressable
              style={({ pressed }) => [
                styles.bulkButton,
                styles.presentBulkButton,
                pressed && styles.pressed,
              ]}
              onPress={markAllPresent}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color="#38A96B"
              />

              <Text
                style={[
                  styles.bulkButtonText,
                  styles.presentBulkText,
                ]}
              >
                Mark All Present
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.bulkButton,
                styles.absentBulkButton,
                pressed && styles.pressed,
              ]}
              onPress={markAllAbsent}
            >
              <Ionicons
                name="close-circle-outline"
                size={19}
                color="#D34B4B"
              />

              <Text
                style={[
                  styles.bulkButtonText,
                  styles.absentBulkText,
                ]}
              >
                Mark All Absent
              </Text>
            </Pressable>
          </View>

          {/* STUDENTS */}

          <View style={styles.studentsList}>
            {students.map((student, index) => {
              const isPresent =
                !!attendance[student.id];

              return (
                <View
                  key={student.id}
                  style={[
                    styles.studentRow,
                    index === students.length - 1 &&
                      styles.lastStudentRow,
                  ]}
                >
                  <View style={styles.studentInfo}>
                    <View style={styles.studentAvatar}>
                      <Text
                        style={styles.studentInitials}
                      >
                        {student.initials ||
                          getInitials(student.name)}
                      </Text>
                    </View>

                    <View style={styles.studentText}>
                      <Text
                        style={styles.studentName}
                        numberOfLines={1}
                      >
                        {student.name}
                      </Text>

                      <Text
                        style={styles.studentId}
                      >
                        Student ID: {student.id}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    style={[
                      styles.attendanceButton,
                      isPresent
                        ? styles.presentButton
                        : styles.absentButton,
                    ]}
                    onPress={() =>
                      toggleStudentAttendance(
                        student.id,
                      )
                    }
                  >
                    <Ionicons
                      name={
                        isPresent
                          ? 'checkmark'
                          : 'close'
                      }
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.attendanceButtonText
                      }
                    >
                      {isPresent
                        ? 'Present'
                        : 'Absent'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* SUMMARY */}

          <View style={styles.summaryBox}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryDotPresent} />

              <Text style={styles.summaryLabel}>
                Present
              </Text>

              <Text style={styles.summaryPresentValue}>
                {presentCount}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={styles.summaryDotAbsent} />

              <Text style={styles.summaryLabel}>
                Absent
              </Text>

              <Text style={styles.summaryAbsentValue}>
                {absentCount}
              </Text>
            </View>
          </View>
        </View>

        {/* LECTURE DESCRIPTION */}

        <View style={styles.card}>
          <View style={styles.descriptionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Lecture Description
              </Text>

              <Text style={styles.sectionSubtitle}>
                Add a short note about today's lecture
              </Text>
            </View>

            <Ionicons
              name="document-text-outline"
              size={23}
              color="#5420D8"
            />
          </View>

          <TextInput
            value={lectureDescription}
            onChangeText={(text) => {
              if (text.length <= 500) {
                setLectureDescription(text);
                setSubmitted(false);
              }
            }}
            multiline
            maxLength={500}
            placeholder="Write a short description about the lecture..."
            placeholderTextColor="#A0A3AD"
            style={styles.descriptionInput}
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>
            {lectureDescription.length}/500
          </Text>
        </View>

        {/* SUBMIT */}

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.pressed,
          ]}
          onPress={handleSubmit}
        >
          <Ionicons
            name="checkmark"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.submitButtonText}>
            Submit Attendance
          </Text>
        </Pressable>

        {/* SUBMITTED RESULT */}

        {submitted && (
          <View style={styles.submittedCard}>
            <View style={styles.submittedIcon}>
              <Ionicons
                name="checkmark-circle"
                size={30}
                color="#38A96B"
              />
            </View>

            <View style={styles.submittedTextContainer}>
              <Text style={styles.submittedTitle}>
                Attendance Submitted
              </Text>

              <Text style={styles.submittedSubtitle}>
                {formatDate(selectedDate)} • {batch}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ========================= */}
      {/* DATE CALENDAR MODAL */}
      {/* ========================= */}

      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDateModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() =>
              setDateModalVisible(false)
            }
          />

          <View style={styles.calendarModal}>
            {/* HEADER */}

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Select Date
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose a date for this lecture
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setDateModalVisible(false)
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#555B69"
                />
              </Pressable>
            </View>

            {/* MONTH NAVIGATION */}

            <View style={styles.monthNavigation}>
              <Pressable
                style={({ pressed }) => [
                  styles.monthArrow,
                  pressed && styles.pressed,
                ]}
                onPress={moveToPreviousMonth}
              >
                <Ionicons
                  name="chevron-back"
                  size={21}
                  color="#5420D8"
                />
              </Pressable>

              <View style={styles.monthTitleContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#5420D8"
                />

                <Text style={styles.monthTitle}>
                  {MONTH_NAMES[calendarMonth]}{' '}
                  {calendarYear}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.monthArrow,
                  pressed && styles.pressed,
                ]}
                onPress={moveToNextMonth}
              >
                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color="#5420D8"
                />
              </Pressable>
            </View>

            {/* WEEK DAYS */}

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((day) => (
                <Text
                  key={day}
                  style={styles.weekDay}
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* CALENDAR GRID */}

            <View style={styles.calendarGrid}>
              {calendarCells.map(
                (day, index) => {
                  if (day === null) {
                    return (
                      <View
                        key={`empty-${calendarYear}-${calendarMonth}-${index}`}
                        style={styles.calendarCell}
                      />
                    );
                  }

                  const selected =
                    isSelectedDay(day);

                  const todayDay =
                    isToday(day);

                  return (
                    <Pressable
                      key={`date-${calendarYear}-${calendarMonth}-${day}`}
                      style={[
                        styles.calendarCell,
                        selected &&
                          styles.selectedCalendarCell,
                      ]}
                      onPress={() =>
                        handleDateSelect(day)
                      }
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          todayDay &&
                            !selected &&
                            styles.todayCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            selected &&
                              styles.selectedCalendarDayText,
                            todayDay &&
                              !selected &&
                              styles.todayText,
                          ]}
                        >
                          {day}
                        </Text>
                      </View>

                      {selected && (
                        <View
                          style={styles.selectedDot}
                        />
                      )}
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* SELECTED DATE */}

            <View style={styles.selectedDateBox}>
              <View style={styles.selectedDateIcon}>
                <Ionicons
                  name="calendar"
                  size={19}
                  color="#5420D8"
                />
              </View>

              <View>
                <Text
                  style={styles.selectedDateLabel}
                >
                  Selected Date
                </Text>

                <Text
                  style={styles.selectedDateText}
                >
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </View>

            {/* APPLY */}

            <Pressable
              style={({ pressed }) => [
                styles.applyButton,
                pressed && styles.pressed,
              ]}
              onPress={applyDate}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.applyButtonText}>
                Apply Date
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========================= */}
      {/* BATCH MODAL */}
      {/* ========================= */}

      <SelectionModal
        visible={batchModalVisible}
        title="Select Batch"
        subtitle="Choose the class for attendance"
        options={BATCHES}
        selectedValue={batch}
        icon="people-outline"
        onClose={() =>
          setBatchModalVisible(false)
        }
        onSelect={handleBatchChange}
      />

      {/* ========================= */}
      {/* SUBJECT MODAL */}
      {/* ========================= */}

      <SelectionModal
        visible={subjectModalVisible}
        title="Select Subject"
        subtitle="Choose the subject for this lecture"
        options={SUBJECTS}
        selectedValue={subject}
        icon="book-outline"
        onClose={() =>
          setSubjectModalVisible(false)
        }
        onSelect={handleSubjectChange}
      />

      {/* ========================= */}
      {/* TIME SLOT MODAL */}
      {/* ========================= */}

      <SelectionModal
        visible={timeModalVisible}
        title="Select Time Slot"
        subtitle="Choose the lecture time"
        options={TIME_SLOTS}
        selectedValue={timeSlot}
        icon="time-outline"
        onClose={() =>
          setTimeModalVisible(false)
        }
        onSelect={handleTimeSlotChange}
      />
    </>
  );
}

/* ================================================= */
/* SELECTION MODAL */
/* ================================================= */

type SelectionModalProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  options: string[];
  selectedValue: string;
  icon: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
  onSelect: (value: string) => void;
};

function SelectionModal({
  visible,
  title,
  subtitle,
  options,
  selectedValue,
  icon,
  onClose,
  onSelect,
}: SelectionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
        />

        <View style={styles.selectionModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>
                {title}
              </Text>

              <Text style={styles.modalSubtitle}>
                {subtitle}
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={24}
                color="#555B69"
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.selectionList}
          >
            {options.map((option) => {
              const selected =
                option === selectedValue;

              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.selectionItem,
                    selected &&
                      styles.selectionItemSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() =>
                    onSelect(option)
                  }
                >
                  <View
                    style={[
                      styles.selectionIcon,
                      selected &&
                        styles.selectionIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={19}
                      color={
                        selected
                          ? '#5420D8'
                          : '#777C89'
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.selectionText,
                      selected &&
                        styles.selectionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>

                  {selected && (
                    <View
                      style={styles.selectionCheck}
                    >
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ================================================= */
/* STYLES */
/* ================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 120,
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  pageTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    lineHeight: 29,
  },

  pageSubtitle: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    marginTop: 1,
  },

  dateSmallIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    lineHeight: 23,
  },

  sectionSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    marginTop: 2,
  },

  fieldLabel: {
    color: '#343848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    marginTop: 13,
    marginBottom: 6,
  },

  selectBox: {
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E1DFE6',
    backgroundColor: '#F8F7FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
  },

  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  inputIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  selectText: {
    flex: 1,
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
  },

  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  teacherIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  teacherAttendanceRow: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
  },

  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  teacherAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  teacherName: {
    color: '#171A2B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
  },

  teacherRole: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    marginTop: 1,
  },

  teacherButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  teacherButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#D8D8DE',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  teacherPresent: {
    backgroundColor: '#38A96B',
    borderColor: '#38A96B',
  },

  teacherAbsent: {
    backgroundColor: '#D34B4B',
    borderColor: '#D34B4B',
  },

  teacherButtonText: {
    color: '#555B69',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
  },

  teacherButtonTextActive: {
    color: '#FFFFFF',
  },

  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  studentCountBadge: {
    minWidth: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentCountText: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  bulkRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
    marginBottom: 4,
  },

  bulkButton: {
    flex: 1,
    minHeight: 43,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  presentBulkButton: {
    backgroundColor: '#ECF9F1',
    borderColor: '#CDEBD9',
  },

  absentBulkButton: {
    backgroundColor: '#FDEEEE',
    borderColor: '#F0D0D0',
  },

  bulkButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
  },

  presentBulkText: {
    color: '#318A5A',
  },

  absentBulkText: {
    color: '#BA4B4B',
  },

  studentsList: {
    marginTop: 5,
  },

  studentRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
  },

  lastStudentRow: {
    borderBottomWidth: 0,
  },

  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  studentInitials: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
    fontSize: 14,
  },

  studentText: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    color: '#171A2B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13.5,
  },

  studentId: {
    color: '#9295A0',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 2,
  },

  attendanceButton: {
    width: 118,
    minHeight: 42,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  presentButton: {
    backgroundColor: '#38A96B',
  },

  absentButton: {
    backgroundColor: '#D34B4B',
  },

  attendanceButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
  },

  summaryBox: {
    minHeight: 64,
    borderRadius: 15,
    backgroundColor: '#F7F6FA',
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  summaryDotPresent: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#38A96B',
  },

  summaryDotAbsent: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D34B4B',
  },

  summaryLabel: {
    color: '#676B77',
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
  },

  summaryPresentValue: {
    color: '#38A96B',
    fontFamily: 'PoppinsBold',
    fontSize: 15,
  },

  summaryAbsentValue: {
    color: '#D34B4B',
    fontFamily: 'PoppinsBold',
    fontSize: 15,
  },

  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#DDDBE2',
  },

  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  descriptionInput: {
    minHeight: 125,
    borderWidth: 1,
    borderColor: '#E1DFE6',
    backgroundColor: '#F8F7FA',
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    color: '#171A2B',
    fontFamily: 'PoppinsRegular',
    fontSize: 12.5,
  },

  characterCount: {
    color: '#9295A0',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
  },

  submitButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#5420D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 12,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
  },

  submittedCard: {
    backgroundColor: '#ECF9F1',
    borderWidth: 1,
    borderColor: '#CDEBD9',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  submittedIcon: {
    marginRight: 10,
  },

  submittedTextContainer: {
    flex: 1,
  },

  submittedTitle: {
    color: '#287C50',
    fontFamily: 'PoppinsBold',
    fontSize: 13,
  },

  submittedSubtitle: {
    color: '#5F806D',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 2,
  },

  bottomSpace: {
    height: 20,
  },

  /* ========================= */
  /* MODAL */
  /* ========================= */

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },

  calendarModal: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 19,
    paddingBottom: 18,
    elevation: 20,
  },

  selectionModal: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 19,
    paddingBottom: 15,
    elevation: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    lineHeight: 27,
  },

  modalSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    marginTop: 2,
  },

  closeButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  /* ========================= */
  /* CALENDAR */
  /* ========================= */

  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  monthArrow: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  monthTitle: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
    fontSize: 15,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },

  weekDay: {
    width: '14.2857%',
    color: '#8A8E9A',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    textAlign: 'center',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calendarCell: {
    width: '14.2857%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCalendarCell: {
    backgroundColor: '#EEE7FF',
    borderRadius: 12,
  },

  dayCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  todayCircle: {
    borderWidth: 1.5,
    borderColor: '#5420D8',
  },

  calendarDayText: {
    color: '#303341',
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
  },

  selectedCalendarDayText: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
  },

  todayText: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
  },

  selectedDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5420D8',
  },

  selectedDateBox: {
    marginTop: 13,
    minHeight: 56,
    borderRadius: 13,
    backgroundColor: '#F0EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
  },

  selectedDateIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#E4D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  selectedDateLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
  },

  selectedDateText: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
    fontSize: 13,
    marginTop: 1,
  },

  applyButton: {
    height: 49,
    borderRadius: 13,
    backgroundColor: '#5420D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 10,
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13.5,
  },

  /* ========================= */
  /* SELECTION MODALS */
  /* ========================= */

  selectionList: {
    marginTop: 2,
  },

  selectionItem: {
    minHeight: 57,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 7,
  },

  selectionItemSelected: {
    backgroundColor: '#F0EAFF',
  },

  selectionIcon: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  selectionIconSelected: {
    backgroundColor: '#E4D8FF',
  },

  selectionText: {
    flex: 1,
    color: '#303341',
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
  },

  selectionTextSelected: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
  },

  selectionCheck: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#5420D8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    opacity: 0.7,
  },
});