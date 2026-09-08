import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

type AttendanceStatus =
  | 'present'
  | 'absent';

type Student = {
  id: string;
  name: string;
  studentId: string;
};

type MarkAttendanceProps = {
  onContentScroll?: (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => void;
};

type DropdownType =
  | 'batch'
  | 'subject'
  | 'time'
  | null;

const BATCHES = [
  '8th Standard',
  '9th Standard',
  '10th Standard',
  '11th Science A',
  '11th Science B',
  '12th Science A',
  '12th Science B',
];

const SUBJECTS = [
  'Physics',
  'Chemistry',
  'Mathematics',
];

const TIME_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
];

const STUDENTS_BY_BATCH: Record<
  string,
  Student[]
> = {
  '8th Standard': [
    {
      id: '8-01',
      name: 'Aarav Sharma',
      studentId: 'STU-0801',
    },
    {
      id: '8-02',
      name: 'Ananya Patel',
      studentId: 'STU-0802',
    },
    {
      id: '8-03',
      name: 'Arjun Kumar',
      studentId: 'STU-0803',
    },
    {
      id: '8-04',
      name: 'Diya Shah',
      studentId: 'STU-0804',
    },
    {
      id: '8-05',
      name: 'Ishaan Singh',
      studentId: 'STU-0805',
    },
    {
      id: '8-06',
      name: 'Meera Joshi',
      studentId: 'STU-0806',
    },
  ],

  '9th Standard': [
    {
      id: '9-01',
      name: 'Aditya Sharma',
      studentId: 'STU-0901',
    },
    {
      id: '9-02',
      name: 'Aisha Patel',
      studentId: 'STU-0902',
    },
    {
      id: '9-03',
      name: 'Kabir Mehta',
      studentId: 'STU-0903',
    },
    {
      id: '9-04',
      name: 'Kavya Rao',
      studentId: 'STU-0904',
    },
    {
      id: '9-05',
      name: 'Manav Shah',
      studentId: 'STU-0905',
    },
    {
      id: '9-06',
      name: 'Nisha Kumar',
      studentId: 'STU-0906',
    },
  ],

  '10th Standard': [
    {
      id: '10-01',
      name: 'Aryan Sharma',
      studentId: 'STU-1001',
    },
    {
      id: '10-02',
      name: 'Bhavya Patel',
      studentId: 'STU-1002',
    },
    {
      id: '10-03',
      name: 'Dev Kumar',
      studentId: 'STU-1003',
    },
    {
      id: '10-04',
      name: 'Isha Shah',
      studentId: 'STU-1004',
    },
    {
      id: '10-05',
      name: 'Karan Mehta',
      studentId: 'STU-1005',
    },
    {
      id: '10-06',
      name: 'Neha Joshi',
      studentId: 'STU-1006',
    },
  ],

  '11th Science A': [
    {
      id: '11A-01',
      name: 'Akshay Sharma',
      studentId: 'STU-1101',
    },
    {
      id: '11A-02',
      name: 'Anika Patel',
      studentId: 'STU-1102',
    },
    {
      id: '11A-03',
      name: 'Dhruv Mehta',
      studentId: 'STU-1103',
    },
    {
      id: '11A-04',
      name: 'Ira Shah',
      studentId: 'STU-1104',
    },
    {
      id: '11A-05',
      name: 'Krish Kumar',
      studentId: 'STU-1105',
    },
    {
      id: '11A-06',
      name: 'Manya Joshi',
      studentId: 'STU-1106',
    },
  ],

  '11th Science B': [
    {
      id: '11B-01',
      name: 'Aarav Mehta',
      studentId: 'STU-1107',
    },
    {
      id: '11B-02',
      name: 'Avni Shah',
      studentId: 'STU-1108',
    },
    {
      id: '11B-03',
      name: 'Harsh Kumar',
      studentId: 'STU-1109',
    },
    {
      id: '11B-04',
      name: 'Kiara Patel',
      studentId: 'STU-1110',
    },
    {
      id: '11B-05',
      name: 'Reyansh Singh',
      studentId: 'STU-1111',
    },
    {
      id: '11B-06',
      name: 'Tara Joshi',
      studentId: 'STU-1112',
    },
  ],

  '12th Science A': [
    {
      id: '12A-01',
      name: 'Arnav Sharma',
      studentId: 'STU-1201',
    },
    {
      id: '12A-02',
      name: 'Diya Patel',
      studentId: 'STU-1202',
    },
    {
      id: '12A-03',
      name: 'Kunal Mehta',
      studentId: 'STU-1203',
    },
    {
      id: '12A-04',
      name: 'Myra Shah',
      studentId: 'STU-1204',
    },
    {
      id: '12A-05',
      name: 'Rudra Kumar',
      studentId: 'STU-1205',
    },
    {
      id: '12A-06',
      name: 'Sara Singh',
      studentId: 'STU-1206',
    },
  ],

  '12th Science B': [
    {
      id: '12B-01',
      name: 'Ayaan Sharma',
      studentId: 'STU-1207',
    },
    {
      id: '12B-02',
      name: 'Anaya Patel',
      studentId: 'STU-1208',
    },
    {
      id: '12B-03',
      name: 'Dev Mehta',
      studentId: 'STU-1209',
    },
    {
      id: '12B-04',
      name: 'Ishita Shah',
      studentId: 'STU-1210',
    },
    {
      id: '12B-05',
      name: 'Rehan Kumar',
      studentId: 'STU-1211',
    },
    {
      id: '12B-06',
      name: 'Saanvi Joshi',
      studentId: 'STU-1212',
    },
  ],
};

const MONTHS = [
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

export default function MarkAttendance({
  onContentScroll,
}: MarkAttendanceProps) {
  const today = new Date();

  const [selectedDay, setSelectedDay] =
    useState(today.getDate());

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  const [selectedYear, setSelectedYear] =
    useState(today.getFullYear());

  const [calendarMonth, setCalendarMonth] =
    useState(today.getMonth());

  const [calendarYear, setCalendarYear] =
    useState(today.getFullYear());

  const [yearInput, setYearInput] =
    useState(
      String(today.getFullYear()),
    );

  const [selectedBatch, setSelectedBatch] =
    useState('11th Science B');

  const [selectedSubject, setSelectedSubject] =
    useState('Physics');

  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState(
      getDefaultTimeSlot(
        '11th Science B',
      ),
    );

  const [teacherAttendance, setTeacherAttendance] =
    useState<AttendanceStatus>(
      'present',
    );

  const [studentAttendance, setStudentAttendance] =
    useState<
      Record<
        string,
        AttendanceStatus
      >
    >({});

  const [lectureLog, setLectureLog] =
    useState('');

  const [dropdownVisible, setDropdownVisible] =
    useState(false);

  const [dropdownType, setDropdownType] =
    useState<DropdownType>(null);

  const [submitted, setSubmitted] =
    useState(false);

  const [submittedAt, setSubmittedAt] =
    useState('');

  const lastScrollY =
    useRef(0);

  const students = useMemo(
    () =>
      STUDENTS_BY_BATCH[
        selectedBatch
      ] || [],
    [selectedBatch],
  );

  const selectedDate =
    formatSelectedDate(
      selectedDay,
      selectedMonth,
      selectedYear,
    );

  useEffect(() => {
    const defaultAttendance: Record<
      string,
      AttendanceStatus
    > = {};

    students.forEach(
      (student) => {
        defaultAttendance[
          student.id
        ] = 'present';
      },
    );

    setStudentAttendance(
      defaultAttendance,
    );

    setSubmitted(false);
  }, [
    selectedBatch,
    students,
  ]);

  const presentCount =
    students.filter(
      (student) =>
        studentAttendance[
          student.id
        ] === 'present',
    ).length;

  const absentCount =
    students.filter(
      (student) =>
        studentAttendance[
          student.id
        ] === 'absent',
    ).length;

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    lastScrollY.current =
      event.nativeEvent.contentOffset.y;

    onContentScroll?.(event);
  };

  const openDropdown = (
    type:
      | 'batch'
      | 'subject'
      | 'time',
  ) => {
    setDropdownType(type);
    setDropdownVisible(true);
  };

  const openDateCalendar = () => {
    setCalendarMonth(
      selectedMonth,
    );

    setCalendarYear(
      selectedYear,
    );

    setYearInput(
      String(selectedYear),
    );

    setDropdownType(null);
    setDropdownVisible(true);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
    setDropdownType(null);
  };

  const handleBatchChange = (
    batch: string,
  ) => {
    setSelectedBatch(batch);

    setSelectedTimeSlot(
      getDefaultTimeSlot(batch),
    );

    setSubmitted(false);

    closeDropdown();
  };

  const handleSubjectChange = (
    subject: string,
  ) => {
    setSelectedSubject(subject);
    setSubmitted(false);
    closeDropdown();
  };

  const handleTimeChange = (
    time: string,
  ) => {
    setSelectedTimeSlot(time);
    setSubmitted(false);
    closeDropdown();
  };

  const handleDateChange = (
    day: number,
    month: number,
    year: number,
  ) => {
    setSelectedDay(day);
    setSelectedMonth(month);
    setSelectedYear(year);

    setCalendarMonth(month);
    setCalendarYear(year);

    setYearInput(
      String(year),
    );

    setSubmitted(false);

    closeDropdown();
  };

  const toggleStudentAttendance = (
    studentId: string,
  ) => {
    setStudentAttendance(
      (previous) => ({
        ...previous,
        [studentId]:
          previous[
            studentId
          ] === 'present'
            ? 'absent'
            : 'present',
      }),
    );

    setSubmitted(false);
  };

  const markAllPresent = () => {
    const updated: Record<
      string,
      AttendanceStatus
    > = {};

    students.forEach(
      (student) => {
        updated[
          student.id
        ] = 'present';
      },
    );

    setStudentAttendance(
      updated,
    );

    setSubmitted(false);
  };

  const markAllAbsent = () => {
    const updated: Record<
      string,
      AttendanceStatus
    > = {};

    students.forEach(
      (student) => {
        updated[
          student.id
        ] = 'absent';
      },
    );

    setStudentAttendance(
      updated,
    );

    setSubmitted(false);
  };

  const handleSubmit = () => {
    const now =
      new Date();

    const time =
      now.toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      );

    setSubmittedAt(time);
    setSubmitted(true);

    console.log(
      'ATTENDANCE SUBMITTED',
      {
        batch:
          selectedBatch,
        subject:
          selectedSubject,
        date:
          selectedDate,
        timeSlot:
          selectedTimeSlot,
        teacherAttendance,
        studentAttendance,
        lectureLog,
        presentCount,
        absentCount,
      },
    );
  };

  const startNewAttendance =
    () => {
      const updated: Record<
        string,
        AttendanceStatus
      > = {};

      students.forEach(
        (student) => {
          updated[
            student.id
          ] = 'present';
        },
      );

      setStudentAttendance(
        updated,
      );

      setTeacherAttendance(
        'present',
      );

      setLectureLog('');
      setSubmitted(false);
      setSubmittedAt('');
    };

  return (
    <>
      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        scrollEventThrottle={
          16
        }
        onScroll={
          handleScroll
        }
      >
        <View
          style={
            styles.pageHeader
          }
        >
          <View
            style={
              styles.pageHeaderIcon
            }
          >
            <Ionicons
              name="checkmark-done-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View
            style={
              styles.pageHeaderText
            }
          >
            <Text
              style={
                styles.pageTitle
              }
            >
              Mark Attendance
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              Record attendance for your lecture
            </Text>
          </View>
        </View>

        {submitted && (
          <View
            style={
              styles.successCard
            }
          >
            <View
              style={
                styles.successIcon
              }
            >
              <Ionicons
                name="checkmark"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View
              style={
                styles.successContent
              }
            >
              <Text
                style={
                  styles.successTitle
                }
              >
                Attendance Submitted
              </Text>

              <Text
                style={
                  styles.successSubtitle
                }
              >
                {selectedBatch}
                {' • '}
                {selectedSubject}
              </Text>

              <Text
                style={
                  styles.successTime
                }
              >
                Submitted at{' '}
                {submittedAt}
              </Text>
            </View>
          </View>
        )}

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Teacher Attendance
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Mark your attendance for this lecture
              </Text>
            </View>

            <View
              style={
                styles.teacherIcon
              }
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#5420D8"
              />
            </View>
          </View>

          <View
            style={
              styles.teacherAttendanceRow
            }
          >
            <View
              style={
                styles.teacherInfo
              }
            >
              <Text
                style={
                  styles.teacherName
                }
              >
                Priya Sharma
              </Text>

              <Text
                style={
                  styles.teacherRole
                }
              >
                Physics Teacher
              </Text>
            </View>

            <View
              style={
                styles.statusButtons
              }
            >
              <Pressable
                style={[
                  styles.statusButton,
                  teacherAttendance ===
                    'present' &&
                    styles.presentButtonActive,
                ]}
                onPress={() =>
                  setTeacherAttendance(
                    'present',
                  )
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={17}
                  color={
                    teacherAttendance ===
                    'present'
                      ? '#FFFFFF'
                      : '#2FA66A'
                  }
                />

                <Text
                  style={[
                    styles.statusButtonText,
                    teacherAttendance ===
                      'present' &&
                      styles.statusButtonTextActive,
                  ]}
                >
                  Present
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.statusButton,
                  teacherAttendance ===
                    'absent' &&
                    styles.absentButtonActive,
                ]}
                onPress={() =>
                  setTeacherAttendance(
                    'absent',
                  )
                }
              >
                <Ionicons
                  name="close-circle"
                  size={17}
                  color={
                    teacherAttendance ===
                    'absent'
                      ? '#FFFFFF'
                      : '#D64545'
                  }
                />

                <Text
                  style={[
                    styles.statusButtonText,
                    teacherAttendance ===
                      'absent' &&
                      styles.statusButtonTextActive,
                  ]}
                >
                  Absent
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Lecture Details
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Select the class and lecture details
          </Text>

          <DropdownField
            label="Batch"
            value={
              selectedBatch
            }
            icon="people-outline"
            onPress={() =>
              openDropdown(
                'batch',
              )
            }
          />

          <DropdownField
            label="Subject"
            value={
              selectedSubject
            }
            icon="book-outline"
            onPress={() =>
              openDropdown(
                'subject',
              )
            }
          />

          <View
            style={
              styles.fieldGroup
            }
          >
            <Text
              style={
                styles.fieldLabel
              }
            >
              Date
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.dropdownField,
                pressed &&
                  styles.dropdownFieldPressed,
              ]}
              onPress={
                openDateCalendar
              }
            >
              <Ionicons
                name="calendar-outline"
                size={19}
                color="#5420D8"
              />

              <Text
                style={
                  styles.dropdownValue
                }
              >
                {selectedDate}
              </Text>

              <Ionicons
                name="chevron-down"
                size={19}
                color="#777C89"
              />
            </Pressable>
          </View>

          <DropdownField
            label="Time Slot"
            value={
              selectedTimeSlot
            }
            icon="time-outline"
            onPress={() =>
              openDropdown(
                'time',
              )
            }
            helperText="Today's scheduled slot is selected automatically."
          />
        </View>

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={
                styles.studentHeaderText
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Student Attendance
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                {students.length}{' '}
                students in this batch
              </Text>
            </View>

            <View
              style={
                styles.studentCountBadge
              }
            >
              <Text
                style={
                  styles.studentCountText
                }
              >
                {students.length}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.quickMarkRow
            }
          >
            <Pressable
              style={
                styles.markAllPresent
              }
              onPress={
                markAllPresent
              }
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#2FA66A"
              />

              <Text
                style={
                  styles.markAllPresentText
                }
              >
                Mark All Present
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.markAllAbsent
              }
              onPress={
                markAllAbsent
              }
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color="#D64545"
              />

              <Text
                style={
                  styles.markAllAbsentText
                }
              >
                Mark All Absent
              </Text>
            </Pressable>
          </View>

          <View
            style={
              styles.studentList
            }
          >
            {students.map(
              (
                student,
                index,
              ) => {
                const status =
                  studentAttendance[
                    student.id
                  ] ||
                  'present';

                return (
                  <StudentAttendanceRow
                    key={
                      student.id
                    }
                    student={
                      student
                    }
                    status={
                      status
                    }
                    onToggle={() =>
                      toggleStudentAttendance(
                        student.id,
                      )
                    }
                    showDivider={
                      index !==
                      students.length -
                        1
                    }
                  />
                );
              },
            )}
          </View>

          <View
            style={
              styles.attendanceSummary
            }
          >
            <View
              style={
                styles.attendanceSummaryItem
              }
            >
              <View
                style={[
                  styles.summaryDot,
                  styles.presentDot,
                ]}
              />

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Present
              </Text>

              <Text
                style={[
                  styles.summaryNumber,
                  styles.presentNumber,
                ]}
              >
                {presentCount}
              </Text>
            </View>

            <View
              style={
                styles.summaryDivider
              }
            />

            <View
              style={
                styles.attendanceSummaryItem
              }
            >
              <View
                style={[
                  styles.summaryDot,
                  styles.absentDot,
                ]}
              />

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Absent
              </Text>

              <Text
                style={[
                  styles.summaryNumber,
                  styles.absentNumber,
                ]}
              >
                {absentCount}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={
                styles.studentHeaderText
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Lecture Log
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Add a short note about today's lecture
              </Text>
            </View>

            <View
              style={
                styles.logIcon
              }
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#5420D8"
              />
            </View>
          </View>

          <TextInput
            value={
              lectureLog
            }
            onChangeText={
              setLectureLog
            }
            placeholder="Example: Completed Newton's Laws and solved numerical problems."
            placeholderTextColor="#9B9FAA"
            style={
              styles.lectureInput
            }
            multiline
            textAlignVertical="top"
            maxLength={300}
          />

          <Text
            style={
              styles.characterCount
            }
          >
            {lectureLog.length}
            /300
          </Text>
        </View>

        {!submitted ? (
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed &&
                styles.submitButtonPressed,
            ]}
            onPress={
              handleSubmit
            }
          >
            <Ionicons
              name="checkmark-done"
              size={21}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.submitButtonText
              }
            >
              Submit Attendance
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.newAttendanceButton,
              pressed &&
                styles.submitButtonPressed,
            ]}
            onPress={
              startNewAttendance
            }
          >
            <Ionicons
              name="refresh-outline"
              size={21}
              color="#5420D8"
            />

            <Text
              style={
                styles.newAttendanceButtonText
              }
            >
              Start New Attendance
            </Text>
          </Pressable>
        )}

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>

      <Modal
        visible={
          dropdownVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeDropdown
        }
      >
        <View
          style={
            styles.dropdownOverlay
          }
        >
          <Pressable
            style={
              styles.dropdownBackground
            }
            onPress={
              closeDropdown
            }
          />

          <View
            style={[
              styles.dropdownModal,
              dropdownType === null &&
                styles.calendarModal,
            ]}
          >
            <View
              style={
                styles.dropdownHeader
              }
            >
              <View
                style={
                  styles.dropdownHeaderText
                }
              >
                <Text
                  style={
                    styles.dropdownTitle
                  }
                >
                  {dropdownType ===
                  null
                    ? 'Select Date'
                    : getDropdownTitle(
                        dropdownType,
                      )}
                </Text>

                {dropdownType ===
                  null && (
                  <Text
                    style={
                      styles.dropdownSubtitle
                    }
                  >
                    Choose a day from the calendar
                  </Text>
                )}
              </View>

              <Pressable
                style={
                  styles.dropdownClose
                }
                onPress={
                  closeDropdown
                }
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#555B69"
                />
              </Pressable>
            </View>

            {dropdownType ===
            null ? (
              <CalendarPicker
                selectedDay={
                  selectedDay
                }
                selectedMonth={
                  selectedMonth
                }
                selectedYear={
                  selectedYear
                }
                calendarMonth={
                  calendarMonth
                }
                calendarYear={
                  calendarYear
                }
                yearInput={
                  yearInput
                }
                setYearInput={
                  setYearInput
                }
                onMonthChange={(
                  month,
                  year,
                ) => {
                  setCalendarMonth(
                    month,
                  );

                  setCalendarYear(
                    year,
                  );

                  setYearInput(
                    String(year),
                  );
                }}
                onDateSelect={
                  handleDateChange
                }
                onClose={
                  closeDropdown
                }
              />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                style={
                  styles.dropdownList
                }
              >
                {getDropdownOptions(
                  dropdownType,
                ).map(
                  (option) => {
                    const selected =
                      isOptionSelected(
                        dropdownType,
                        option,
                        selectedBatch,
                        selectedSubject,
                        selectedTimeSlot,
                      );

                    return (
                      <Pressable
                        key={
                          option
                        }
                        style={[
                          styles.dropdownOption,
                          selected &&
                            styles.dropdownOptionSelected,
                        ]}
                        onPress={() => {
                          if (
                            dropdownType ===
                            'batch'
                          ) {
                            handleBatchChange(
                              option,
                            );
                          }

                          if (
                            dropdownType ===
                            'subject'
                          ) {
                            handleSubjectChange(
                              option,
                            );
                          }

                          if (
                            dropdownType ===
                            'time'
                          ) {
                            handleTimeChange(
                              option,
                            );
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            selected &&
                              styles.dropdownOptionTextSelected,
                          ]}
                        >
                          {
                            option
                          }
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
                  },
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ============================================================
   CALENDAR PICKER
   ============================================================ */

type CalendarPickerProps = {
  selectedDay: number;
  selectedMonth: number;
  selectedYear: number;

  calendarMonth: number;
  calendarYear: number;

  yearInput: string;

  setYearInput: (
    value: string,
  ) => void;

  onMonthChange: (
    month: number,
    year: number,
  ) => void;

  onDateSelect: (
    day: number,
    month: number,
    year: number,
  ) => void;

  onClose: () => void;
};

function CalendarPicker({
  selectedDay,
  selectedMonth,
  selectedYear,
  calendarMonth,
  calendarYear,
  yearInput,
  setYearInput,
  onMonthChange,
  onDateSelect,
  onClose,
}: CalendarPickerProps) {
  const firstDay =
    new Date(
      calendarYear,
      calendarMonth,
      1,
    ).getDay();

  const daysInMonth =
    getDaysInMonth(
      calendarMonth,
      calendarYear,
    );

  const previousMonth =
    calendarMonth ===
    0
      ? 11
      : calendarMonth - 1;

  const previousYear =
    calendarMonth ===
    0
      ? calendarYear - 1
      : calendarYear;

  const previousMonthDays =
    getDaysInMonth(
      previousMonth,
      previousYear,
    );

  const calendarCells:
    (
      | number
      | null
    )[] = [];

  for (
    let i = firstDay - 1;
    i >= 0;
    i--
  ) {
    calendarCells.push(
      previousMonthDays -
        i,
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(day);
  }

  while (
    calendarCells.length %
      7 !==
    0
  ) {
    calendarCells.push(
      null,
    );
  }

  const changeMonth = (
    direction: number,
  ) => {
    let nextMonth =
      calendarMonth +
      direction;

    let nextYear =
      calendarYear;

    if (
      nextMonth >
      11
    ) {
      nextMonth = 0;
      nextYear += 1;
    }

    if (
      nextMonth <
      0
    ) {
      nextMonth = 11;
      nextYear -= 1;
    }

    onMonthChange(
      nextMonth,
      nextYear,
    );
  };

  const goToToday = () => {
    const today =
      new Date();

    onDateSelect(
      today.getDate(),
      today.getMonth(),
      today.getFullYear(),
    );
  };

  const applyYear = () => {
    const cleanYear =
      yearInput.replace(
        /\D/g,
        '',
      );

    if (
      cleanYear.length !==
      4
    ) {
      return;
    }

    const newYear =
      Number(
        cleanYear,
      );

    if (
      newYear < 1 ||
      newYear > 9999
    ) {
      return;
    }

    let validDay =
      selectedDay;

    const maxDays =
      getDaysInMonth(
        selectedMonth,
        newYear,
      );

    if (
      validDay >
      maxDays
    ) {
      validDay =
        maxDays;
    }

    onDateSelect(
      validDay,
      selectedMonth,
      newYear,
    );
  };

  return (
    <View
      style={
        styles.calendarContainer
      }
    >
      <View
        style={
          styles.calendarTopRow
        }
      >
        <Pressable
          style={
            styles.calendarArrow
          }
          onPress={() =>
            changeMonth(
              -1,
            )
          }
        >
          <Ionicons
            name="chevron-back"
            size={21}
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
            {
              MONTHS[
                calendarMonth
              ]
            }
          </Text>

          <View
            style={
              styles.yearInputWrapper
            }
          >
            <TextInput
              value={
                yearInput
              }
              onChangeText={(
                text,
              ) => {
                setYearInput(
                  text
                    .replace(
                      /\D/g,
                      '',
                    )
                    .slice(
                      0,
                      4,
                    ),
                );
              }}
              onSubmitEditing={
                applyYear
              }
              keyboardType="number-pad"
              maxLength={
                4
              }
              style={
                styles.yearInput
              }
            />

            <Ionicons
              name="create-outline"
              size={14}
              color="#777C89"
            />
          </View>
        </View>

        <Pressable
          style={
            styles.calendarArrow
          }
          onPress={() =>
            changeMonth(
              1,
            )
          }
        >
          <Ionicons
            name="chevron-forward"
            size={21}
            color="#5420D8"
          />
        </Pressable>
      </View>

      <Text
        style={
          styles.yearHelper
        }
      >
        Use the arrows to move through any month and year, or enter a year directly.
      </Text>

      <View
        style={
          styles.weekHeader
        }
      >
        {[
          'SUN',
          'MON',
          'TUE',
          'WED',
          'THU',
          'FRI',
          'SAT',
        ].map(
          (day) => (
            <View
              key={`weekday-${day}`}
              style={
                styles.weekDay
              }
            >
              <Text
                style={
                  styles.weekDayText
                }
              >
                {day}
              </Text>
            </View>
          ),
        )}
      </View>

      <View
        style={
          styles.calendarGrid
        }
      >
        {calendarCells.map(
          (
            day,
            index,
          ) => {
            if (
              day ===
              null
            ) {
              return (
                <View
                  key={`calendar-empty-${index}`}
                  style={
                    styles.calendarDay
                  }
                />
              );
            }

            const isSelected =
              day ===
                selectedDay &&
              calendarMonth ===
                selectedMonth &&
              calendarYear ===
                selectedYear;

            const todayDate =
              new Date();

            const isToday =
              day ===
                todayDate.getDate() &&
              calendarMonth ===
                todayDate.getMonth() &&
              calendarYear ===
                todayDate.getFullYear();

            return (
              <Pressable
                key={`calendar-cell-${index}`}
                style={[
                  styles.calendarDay,
                  isSelected &&
                    styles.calendarDaySelected,
                  isToday &&
                    !isSelected &&
                    styles.calendarDayToday,
                ]}
                onPress={() =>
                  onDateSelect(
                    day,
                    calendarMonth,
                    calendarYear,
                  )
                }
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isSelected &&
                      styles.calendarDayTextSelected,
                    isToday &&
                      !isSelected &&
                      styles.calendarDayTextToday,
                  ]}
                >
                  {day}
                </Text>

                {isToday &&
                  !isSelected && (
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

      <View
        style={
          styles.selectedDateBox
        }
      >
        <View
          style={
            styles.selectedDateIcon
          }
        >
          <Ionicons
            name="calendar"
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
            {formatSelectedDate(
              selectedDay,
              selectedMonth,
              selectedYear,
            )}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.calendarActions
        }
      >
        <Pressable
          style={
            styles.todayButton
          }
          onPress={
            goToToday
          }
        >
          <Text
            style={
              styles.todayButtonText
            }
          >
            Today
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.applyDateButton
          }
          onPress={
            onClose
          }
        >
          <Ionicons
            name="checkmark"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.applyDateButtonText
            }
          >
            Apply Date
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ============================================================
   DROPDOWN FIELD
   ============================================================ */

type DropdownFieldProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  helperText?: string;
};

function DropdownField({
  label,
  value,
  icon,
  onPress,
  helperText,
}: DropdownFieldProps) {
  return (
    <View
      style={
        styles.fieldGroup
      }
    >
      <Text
        style={
          styles.fieldLabel
        }
      >
        {label}
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.dropdownField,
          pressed &&
            styles.dropdownFieldPressed,
        ]}
        onPress={
          onPress
        }
      >
        <Ionicons
          name={icon}
          size={19}
          color="#5420D8"
        />

        <Text
          style={
            styles.dropdownValue
          }
          numberOfLines={
            1
          }
        >
          {value}
        </Text>

        <Ionicons
          name="chevron-down"
          size={19}
          color="#777C89"
        />
      </Pressable>

      {helperText && (
        <Text
          style={
            styles.fieldHelper
          }
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

/* ============================================================
   STUDENT ROW
   ============================================================ */

type StudentAttendanceRowProps = {
  student: Student;
  status: AttendanceStatus;
  onToggle: () => void;
  showDivider: boolean;
};

function StudentAttendanceRow({
  student,
  status,
  onToggle,
  showDivider,
}: StudentAttendanceRowProps) {
  const isPresent =
    status === 'present';

  return (
    <Pressable
      style={[
        styles.studentRow,
        !showDivider &&
          styles.studentRowNoDivider,
      ]}
      onPress={
        onToggle
      }
    >
      <View
        style={
          styles.studentAvatar
        }
      >
        <Text
          style={
            styles.studentAvatarText
          }
        >
          {getInitials(
            student.name,
          )}
        </Text>
      </View>

      <View
        style={
          styles.studentInfo
        }
      >
        <Text
          style={
            styles.studentName
          }
        >
          {student.name}
        </Text>

        <Text
          style={
            styles.studentId
          }
        >
          Student ID:{' '}
          {student.studentId}
        </Text>
      </View>

      <View
        style={[
          styles.attendanceToggle,
          isPresent
            ? styles.presentToggle
            : styles.absentToggle,
        ]}
      >
        <Ionicons
          name={
            isPresent
              ? 'checkmark'
              : 'close'
          }
          size={16}
          color="#FFFFFF"
        />

        <Text
          style={
            styles.attendanceToggleText
          }
        >
          {isPresent
            ? 'Present'
            : 'Absent'}
        </Text>
      </View>
    </Pressable>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function getInitials(
  name: string,
): string {
  return name
    .split(' ')
    .map(
      (word) =>
        word[0],
    )
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getDaysInMonth(
  month: number,
  year: number,
): number {
  return new Date(
    year,
    month + 1,
    0,
  ).getDate();
}

function formatSelectedDate(
  day: number,
  month: number,
  year: number,
): string {
  const date =
    new Date(
      year,
      month,
      day,
    );

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function getDefaultTimeSlot(
  batch: string,
): string {
  if (
    batch ===
      '11th Science B' ||
    batch ===
      '11th Science A'
  ) {
    return '11:00 AM - 12:00 PM';
  }

  if (
    batch ===
      '12th Science B' ||
    batch ===
      '12th Science A'
  ) {
    return '02:00 PM - 03:00 PM';
  }

  if (
    batch ===
    '10th Standard'
  ) {
    return '10:00 AM - 11:00 AM';
  }

  if (
    batch ===
    '9th Standard'
  ) {
    return '09:00 AM - 10:00 AM';
  }

  return '08:00 AM - 09:00 AM';
}

function getDropdownTitle(
  type:
    | 'batch'
    | 'subject'
    | 'time',
): string {
  switch (type) {
    case 'batch':
      return 'Select Batch';

    case 'subject':
      return 'Select Subject';

    case 'time':
      return 'Select Time Slot';

    default:
      return 'Select';
  }
}

function getDropdownOptions(
  type:
    | 'batch'
    | 'subject'
    | 'time',
): string[] {
  switch (type) {
    case 'batch':
      return BATCHES;

    case 'subject':
      return SUBJECTS;

    case 'time':
      return TIME_SLOTS;

    default:
      return [];
  }
}

function isOptionSelected(
  type:
    | 'batch'
    | 'subject'
    | 'time',
  option: string,
  selectedBatch: string,
  selectedSubject: string,
  selectedTimeSlot: string,
): boolean {
  if (
    type === 'batch'
  ) {
    return (
      option ===
      selectedBatch
    );
  }

  if (
    type === 'subject'
  ) {
    return (
      option ===
      selectedSubject
    );
  }

  if (
    type === 'time'
  ) {
    return (
      option ===
      selectedTimeSlot
    );
  }

  return false;
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#F6F6F9',
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
  },

  pageHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    backgroundColor:
      '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 10,
  },

  pageHeaderIcon: {
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

  pageHeaderText: {
    flex: 1,
  },

  pageTitle: {
    color: '#111528',
    fontFamily:
      'PoppinsBold',
    fontSize: 19,
  },

  pageSubtitle: {
    color: '#777C89',
    fontFamily:
      'PoppinsRegular',
    fontSize: 11.5,
    marginTop: 1,
  },

  successCard: {
    flexDirection:
      'row',
    alignItems:
      'center',
    backgroundColor:
      '#EAF8F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      '#CDEEDB',
    padding: 13,
    marginBottom: 10,
  },

  successIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      '#2FA66A',
    alignItems:
      'center',
    justifyContent:
      'center',
    marginRight: 10,
  },

  successContent: {
    flex: 1,
  },

  successTitle: {
    color: '#1D7D4E',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 13,
  },

  successSubtitle: {
    color: '#367A59',
    fontFamily:
      'PoppinsMedium',
    fontSize: 10.5,
    marginTop: 1,
  },

  successTime: {
    color: '#6C8F7B',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 1,
  },

  section: {
    backgroundColor:
      '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 13,
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#111528',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 15,
  },

  sectionSubtitle: {
    color: '#858996',
    fontFamily:
      'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  teacherIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      '#F1EBFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  teacherAttendanceRow: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  teacherInfo: {
    flex: 1,
  },

  teacherName: {
    color: '#171A2B',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 13,
  },

  teacherRole: {
    color: '#858996',
    fontFamily:
      'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  statusButtons: {
    flexDirection:
      'row',
    gap: 7,
    marginLeft: 8,
  },

  statusButton: {
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      '#DDE0E6',
    backgroundColor:
      '#FAFAFB',
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 4,
  },

  presentButtonActive: {
    backgroundColor:
      '#2FA66A',
    borderColor:
      '#2FA66A',
  },

  absentButtonActive: {
    backgroundColor:
      '#D64545',
    borderColor:
      '#D64545',
  },

  statusButtonText: {
    color: '#555B69',
    fontFamily:
      'PoppinsMedium',
    fontSize: 10,
  },

  statusButtonTextActive: {
    color: '#FFFFFF',
    fontFamily:
      'PoppinsSemiBold',
  },

  fieldGroup: {
    marginBottom: 11,
  },

  fieldLabel: {
    color: '#343848',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 11.5,
    marginBottom: 5,
  },

  dropdownField: {
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor:
      '#E2E0E7',
    backgroundColor:
      '#F8F7FA',
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 12,
  },

  dropdownFieldPressed: {
    opacity: 0.7,
  },

  dropdownValue: {
    flex: 1,
    color: '#171A2B',
    fontFamily:
      'PoppinsMedium',
    fontSize: 12,
    marginLeft: 9,
  },

  fieldHelper: {
    color: '#9296A2',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 4,
  },

  studentHeaderText: {
    flex: 1,
  },

  studentCountBadge: {
    minWidth: 32,
    height: 30,
    borderRadius: 10,
    backgroundColor:
      '#EEE7FF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  studentCountText: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 11,
  },

  quickMarkRow: {
    flexDirection:
      'row',
    gap: 8,
    marginBottom: 8,
  },

  markAllPresent: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    backgroundColor:
      '#EAF8F0',
    borderWidth: 1,
    borderColor:
      '#CDEEDB',
    alignItems:
      'center',
    justifyContent:
      'center',
    flexDirection:
      'row',
    gap: 5,
  },

  markAllPresentText: {
    color: '#258357',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 9.5,
  },

  markAllAbsent: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    backgroundColor:
      '#FDECEC',
    borderWidth: 1,
    borderColor:
      '#F4D1D1',
    alignItems:
      'center',
    justifyContent:
      'center',
    flexDirection:
      'row',
    gap: 5,
  },

  markAllAbsentText: {
    color: '#C33D3D',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 9.5,
  },

  studentList: {
    borderTopWidth: 1,
    borderTopColor:
      '#EEEEF2',
  },

  studentRow: {
    minHeight: 59,
    flexDirection:
      'row',
    alignItems:
      'center',
    borderBottomWidth: 1,
    borderBottomColor:
      '#EEEEF2',
  },

  studentRowNoDivider: {
    borderBottomWidth: 0,
  },

  studentAvatar: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor:
      '#EEE7FF',
    alignItems:
      'center',
    justifyContent:
      'center',
    marginRight: 9,
  },

  studentAvatarText: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 10.5,
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    color: '#171A2B',
    fontFamily:
      'PoppinsMedium',
    fontSize: 12,
  },

  studentId: {
    color: '#9296A2',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 1,
  },

  attendanceToggle: {
    minWidth: 77,
    height: 32,
    borderRadius: 9,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
    gap: 4,
  },

  presentToggle: {
    backgroundColor:
      '#2FA66A',
  },

  absentToggle: {
    backgroundColor:
      '#D64545',
  },

  attendanceToggleText: {
    color: '#FFFFFF',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 9.5,
  },

  attendanceSummary: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    backgroundColor:
      '#F7F6FA',
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  attendanceSummaryItem: {
    flex: 1,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
    gap: 6,
  },

  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  presentDot: {
    backgroundColor:
      '#2FA66A',
  },

  absentDot: {
    backgroundColor:
      '#D64545',
  },

  summaryLabel: {
    color: '#666B78',
    fontFamily:
      'PoppinsMedium',
    fontSize: 10.5,
  },

  summaryNumber: {
    fontFamily:
      'PoppinsBold',
    fontSize: 15,
  },

  presentNumber: {
    color: '#2FA66A',
  },

  absentNumber: {
    color: '#D64545',
  },

  summaryDivider: {
    width: 1,
    height: 25,
    backgroundColor:
      '#E0DFE5',
  },

  logIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      '#F1EBFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  lectureInput: {
    minHeight: 85,
    borderWidth: 1,
    borderColor:
      '#E2E0E7',
    backgroundColor:
      '#F8F7FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 10,
    color: '#171A2B',
    fontFamily:
      'PoppinsRegular',
    fontSize: 11.5,
    lineHeight: 18,
  },

  characterCount: {
    color: '#A0A3AD',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9,
    textAlign:
      'right',
    marginTop: 3,
  },

  submitButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor:
      '#5420D8',
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
    gap: 7,
    marginTop: 2,
  },

  submitButtonPressed: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 13,
  },

  newAttendanceButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor:
      '#EEE7FF',
    borderWidth: 1,
    borderColor:
      '#D8CCFF',
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
    gap: 7,
    marginTop: 2,
  },

  newAttendanceButtonText: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 13,
  },

  bottomSpace: {
    height: 110,
  },

  dropdownOverlay: {
    flex: 1,
    justifyContent:
      'center',
    paddingHorizontal: 22,
  },

  dropdownBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(0, 0, 0, 0.45)',
  },

  dropdownModal: {
    maxHeight: '78%',
    backgroundColor:
      '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    elevation: 20,
  },

  calendarModal: {
    maxHeight: '82%',
  },

  dropdownHeader: {
    flexDirection:
      'row',
    alignItems:
      'flex-start',
    justifyContent:
      'space-between',
    marginBottom: 10,
  },

  dropdownHeaderText: {
    flex: 1,
  },

  dropdownTitle: {
    color: '#111528',
    fontFamily:
      'PoppinsBold',
    fontSize: 18,
  },

  dropdownSubtitle: {
    color: '#858996',
    fontFamily:
      'PoppinsRegular',
    fontSize: 10,
    marginTop: 1,
  },

  dropdownClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      '#F4F4F7',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  dropdownList: {
    maxHeight: 420,
  },

  dropdownOption: {
    minHeight: 49,
    borderRadius: 11,
    paddingHorizontal: 12,
    marginBottom: 5,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  dropdownOptionSelected: {
    backgroundColor:
      '#F1EBFF',
  },

  dropdownOptionText: {
    color: '#343848',
    fontFamily:
      'PoppinsMedium',
    fontSize: 12,
  },

  dropdownOptionTextSelected: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
  },

  calendarContainer: {
    paddingBottom: 3,
  },

  calendarTopRow: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    marginBottom: 5,
  },

  calendarArrow: {
    width: 38,
    height: 38,
    borderRadius: 11,
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
    fontSize: 17,
  },

  yearInputWrapper: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
    marginTop: 1,
  },

  yearInput: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 12,
    paddingVertical: 0,
    paddingHorizontal: 3,
    textAlign:
      'center',
    minWidth: 46,
    height: 25,
  },

  yearHelper: {
    color: '#9296A2',
    fontFamily:
      'PoppinsRegular',
    fontSize: 9,
    textAlign:
      'center',
    marginBottom: 10,
  },

  weekHeader: {
    flexDirection:
      'row',
    marginBottom: 4,
  },

  weekDay: {
    width: '14.2857%',
    alignItems:
      'center',
    justifyContent:
      'center',
    height: 30,
  },

  weekDayText: {
    color: '#9296A2',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 8.5,
  },

  calendarGrid: {
    flexDirection:
      'row',
    flexWrap:
      'wrap',
  },

  calendarDay: {
    width: '14.2857%',
    height: 42,
    alignItems:
      'center',
    justifyContent:
      'center',
    position:
      'relative',
  },

  calendarDaySelected: {
    width: '14.2857%',
  },

  calendarDayToday: {
    borderRadius: 21,
  },

  calendarDayText: {
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
    fontSize: 11.5,
    paddingTop: 7,
  },

  calendarDayTextSelected: {
    backgroundColor:
      '#5420D8',
    color: '#FFFFFF',
    fontFamily:
      'PoppinsSemiBold',
  },

  calendarDayTextToday: {
    color: '#5420D8',
    fontFamily:
      'PoppinsBold',
    borderWidth: 1,
    borderColor:
      '#5420D8',
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

  selectedDateBox: {
    height: 54,
    borderRadius: 12,
    backgroundColor:
      '#F1EBFF',
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 11,
    marginTop: 8,
    marginBottom: 10,
  },

  selectedDateIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor:
      '#FFFFFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  selectedDateTextContainer: {
    marginLeft: 8,
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
    fontSize: 12,
    marginTop: 1,
  },

  calendarActions: {
    flexDirection:
      'row',
    gap: 8,
  },

  todayButton: {
    width: 80,
    height: 45,
    borderRadius: 11,
    borderWidth: 1,
    borderColor:
      '#D8CCFF',
    backgroundColor:
      '#FFFFFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  todayButtonText: {
    color: '#5420D8',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 11.5,
  },

  applyDateButton: {
    flex: 1,
    height: 45,
    borderRadius: 11,
    backgroundColor:
      '#5420D8',
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
    gap: 6,
  },

  applyDateButtonText: {
    color: '#FFFFFF',
    fontFamily:
      'PoppinsSemiBold',
    fontSize: 12,
  },
});