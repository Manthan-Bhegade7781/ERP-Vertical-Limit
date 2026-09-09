import React, {
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

import { addLectureLog } from '../lectureLogStore';

type MarkAttendanceProps = {
  onContentScroll?: (
    event: any,
  ) => void;
};

type Student = {
  id: string;
  name: string;
  studentId: string;
};

type Batch = {
  id: string;
  name: string;
  students: Student[];
  subjects: string[];
};

const BATCHES: Batch[] = [
  {
    id: 'batch-8',
    name: '8th Standard',
    subjects: ['Physics', 'Mathematics'],
    students: [
      {
        id: 'student-801',
        name: 'Aarav Mehta',
        studentId: 'STU-0801',
      },
      {
        id: 'student-802',
        name: 'Avni Shah',
        studentId: 'STU-0802',
      },
      {
        id: 'student-803',
        name: 'Harsh Kumar',
        studentId: 'STU-0803',
      },
      {
        id: 'student-804',
        name: 'Kiara Patel',
        studentId: 'STU-0804',
      },
      {
        id: 'student-805',
        name: 'Reyansh Singh',
        studentId: 'STU-0805',
      },
      {
        id: 'student-806',
        name: 'Tara Joshi',
        studentId: 'STU-0806',
      },
    ],
  },

  {
    id: 'batch-9',
    name: '9th Standard',
    subjects: ['Physics', 'Mathematics'],
    students: [
      {
        id: 'student-901',
        name: 'Aarav Mehta',
        studentId: 'STU-0901',
      },
      {
        id: 'student-902',
        name: 'Ananya Shah',
        studentId: 'STU-0902',
      },
      {
        id: 'student-903',
        name: 'Dev Kumar',
        studentId: 'STU-0903',
      },
      {
        id: 'student-904',
        name: 'Ishita Patel',
        studentId: 'STU-0904',
      },
      {
        id: 'student-905',
        name: 'Rohan Singh',
        studentId: 'STU-0905',
      },
    ],
  },

  {
    id: 'batch-10',
    name: '10th Standard',
    subjects: ['Physics', 'Chemistry'],
    students: [
      {
        id: 'student-1001',
        name: 'Aditya Sharma',
        studentId: 'STU-1001',
      },
      {
        id: 'student-1002',
        name: 'Diya Kapoor',
        studentId: 'STU-1002',
      },
      {
        id: 'student-1003',
        name: 'Kabir Jain',
        studentId: 'STU-1003',
      },
      {
        id: 'student-1004',
        name: 'Meera Patel',
        studentId: 'STU-1004',
      },
      {
        id: 'student-1005',
        name: 'Vivaan Shah',
        studentId: 'STU-1005',
      },
    ],
  },

  {
    id: 'batch-11',
    name: '11th Standard',
    subjects: ['Physics'],
    students: [
      {
        id: 'student-1101',
        name: 'Arjun Verma',
        studentId: 'STU-1101',
      },
      {
        id: 'student-1102',
        name: 'Ira Sharma',
        studentId: 'STU-1102',
      },
      {
        id: 'student-1103',
        name: 'Karan Mehta',
        studentId: 'STU-1103',
      },
      {
        id: 'student-1104',
        name: 'Myra Shah',
        studentId: 'STU-1104',
      },
    ],
  },
];

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
];

export default function MarkAttendance({
  onContentScroll,
}: MarkAttendanceProps) {
  const [selectedBatchId, setSelectedBatchId] =
    useState('batch-8');

  const [selectedSubject, setSelectedSubject] =
    useState('Physics');

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate());

  const [selectedTime, setSelectedTime] =
    useState(
      '09:00 AM - 10:00 AM',
    );

  const [teacherPresent, setTeacherPresent] =
    useState(true);

  const [attendance, setAttendance] =
    useState<Record<string, boolean>>(
      {},
    );

  const [lectureDescription, setLectureDescription] =
    useState('');

  const [selectorVisible, setSelectorVisible] =
    useState(false);

  const [selectorType, setSelectorType] =
    useState<
      'batch' |
      'subject' |
      'date' |
      'time'
    >('batch');

  const selectedBatch =
    BATCHES.find(
      (batch) =>
        batch.id === selectedBatchId,
    ) || BATCHES[0];

  const students =
    selectedBatch.students;

  const presentCount =
    students.filter(
      (student) =>
        attendance[student.id] ===
        true,
    ).length;

  const absentCount =
    students.length -
    presentCount;

  const openSelector = (
    type:
      | 'batch'
      | 'subject'
      | 'date'
      | 'time',
  ) => {
    setSelectorType(type);
    setSelectorVisible(true);
  };

  const closeSelector = () => {
    setSelectorVisible(false);
  };

  const selectBatch = (
    batch: Batch,
  ) => {
    setSelectedBatchId(
      batch.id,
    );

    setSelectedSubject(
      batch.subjects[0],
    );

    setAttendance({});

    closeSelector();
  };

  const toggleStudent = (
    studentId: string,
  ) => {
    setAttendance(
      (current) => ({
        ...current,
        [studentId]:
          !current[studentId],
      }),
    );
  };

  const markAllPresent = () => {
    const next: Record<
      string,
      boolean
    > = {};

    students.forEach(
      (student) => {
        next[student.id] =
          true;
      },
    );

    setAttendance(next);
  };

  const markAllAbsent = () => {
    setAttendance({});
  };

  const submitAttendance = () => {
    if (!teacherPresent) {
      Alert.alert(
        'Teacher Attendance',
        'Please mark your own attendance before submitting.',
      );

      return;
    }

    if (
      students.length === 0
    ) {
      Alert.alert(
        'No Students',
        'There are no students in this batch.',
      );

      return;
    }

    /*
     * Save lecture description
     * into the shared lecture-log
     * source.
     *
     * This is what connects
     * Mark Attendance with
     * Add Lecture Log.
     */

    const cleanDescription =
      lectureDescription.trim();

    if (cleanDescription) {
      addLectureLog({
        id: `attendance-${Date.now()}`,
        date: selectedDate,
        batch: selectedBatch.name,
        subject: selectedSubject,
        time: selectedTime,
        description:
          cleanDescription,
        source: 'attendance',
      });
    }

    Alert.alert(
      'Attendance Submitted',
      `${presentCount} students present and ${absentCount} students absent.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setLectureDescription('');
          },
        },
      ],
    );
  };

  const selectorItems =
    selectorType === 'batch'
      ? BATCHES.map(
          (batch) =>
            batch.name,
        )
      : selectorType === 'subject'
        ? selectedBatch.subjects
        : selectorType === 'time'
          ? TIME_SLOTS
          : getDateOptions();

  const selectedSelectorValue =
    selectorType === 'batch'
      ? selectedBatch.name
      : selectorType === 'subject'
        ? selectedSubject
        : selectorType === 'time'
          ? selectedTime
          : selectedDate;

  const selectValue = (
    value: string,
  ) => {
    if (
      selectorType === 'batch'
    ) {
      const batch =
        BATCHES.find(
          (item) =>
            item.name === value,
        );

      if (batch) {
        selectBatch(batch);
      }

      return;
    }

    if (
      selectorType === 'subject'
    ) {
      setSelectedSubject(
        value,
      );
    }

    if (
      selectorType === 'time'
    ) {
      setSelectedTime(
        value,
      );
    }

    if (
      selectorType === 'date'
    ) {
      setSelectedDate(
        value,
      );
    }

    closeSelector();
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
        {/* HEADER */}

        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="person-add-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Mark Attendance
            </Text>

            <Text style={styles.headerSubtitle}>
              Record attendance for your lecture
            </Text>
          </View>
        </View>

        {/* TEACHER ATTENDANCE */}

        <View style={styles.teacherCard}>
          <View style={styles.teacherTop}>
            <View style={styles.teacherIcon}>
              <Ionicons
                name="person-outline"
                size={21}
                color="#5420D8"
              />
            </View>

            <View style={styles.teacherText}>
              <Text style={styles.teacherTitle}>
                Your Attendance
              </Text>

              <Text style={styles.teacherSubtitle}>
                Mark your attendance for this lecture
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
                    : '#2FA66A'
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
                    : '#D64545'
                }
              />

              <Text
                style={[
                  styles.teacherButtonText,
                  !teacherPresent &&
                    styles.teacherButtonTextAbsent,
                ]}
              >
                Absent
              </Text>
            </Pressable>
          </View>
        </View>

        {/* LECTURE DETAILS */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Lecture Details
          </Text>

          <Text style={styles.cardSubtitle}>
            Select the class and lecture information
          </Text>

          {/* BATCH */}

          <Text style={styles.label}>
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
              {selectedBatch.name}
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
              {selectedSubject}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#777C89"
            />
          </Pressable>

          {/* DATE */}

          <Text
            style={[
              styles.label,
              styles.spacedLabel,
            ]}
          >
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

          {/* TIME */}

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
              {selectedTime}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#777C89"
            />
          </Pressable>
        </View>

        {/* STUDENTS */}

        <View style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View>
              <Text style={styles.studentTitle}>
                Student Attendance
              </Text>

              <Text style={styles.studentSubtitle}>
                {students.length} students in this batch
              </Text>
            </View>

            <View style={styles.studentCountBadge}>
              <Text
                style={
                  styles.studentCountText
                }
              >
                {students.length}
              </Text>
            </View>
          </View>

          {/* ALL BUTTONS */}

          <View style={styles.allButtons}>
            <Pressable
              style={styles.presentAllButton}
              onPress={markAllPresent}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#2FA66A"
              />

              <Text style={styles.presentAllText}>
                Mark All Present
              </Text>
            </Pressable>

            <Pressable
              style={styles.absentAllButton}
              onPress={markAllAbsent}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color="#D64545"
              />

              <Text style={styles.absentAllText}>
                Mark All Absent
              </Text>
            </Pressable>
          </View>

          {/* STUDENT LIST */}

          {students.map(
            (student) => {
              const isPresent =
                attendance[
                  student.id
                ] === true;

              const initials =
                student.name
                  .split(' ')
                  .map(
                    (part) =>
                      part[0],
                  )
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

              return (
                <View
                  key={student.id}
                  style={styles.studentRow}
                >
                  <View style={styles.avatar}>
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {initials}
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
                      Student ID: {student.studentId}
                    </Text>
                  </View>

                  <Pressable
                    style={[
                      styles.attendanceButton,
                      isPresent
                        ? styles.presentButton
                        : styles.absentButton,
                    ]}
                    onPress={() =>
                      toggleStudent(
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
            },
          )}

          {/* COUNTS */}

          <View style={styles.countsCard}>
            <View style={styles.countItem}>
              <View
                style={styles.presentDot}
              />

              <Text style={styles.countLabel}>
                Present
              </Text>

              <Text
                style={[
                  styles.countNumber,
                  styles.presentNumber,
                ]}
              >
                {presentCount}
              </Text>
            </View>

            <View style={styles.countDivider} />

            <View style={styles.countItem}>
              <View
                style={styles.absentDot}
              />

              <Text style={styles.countLabel}>
                Absent
              </Text>

              <Text
                style={[
                  styles.countNumber,
                  styles.absentNumber,
                ]}
              >
                {absentCount}
              </Text>
            </View>
          </View>
        </View>

        {/* LECTURE LOG */}

        <View style={styles.card}>
          <View style={styles.logHeader}>
            <View style={styles.logIcon}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#5420D8"
              />
            </View>

            <View style={styles.logHeaderText}>
              <Text style={styles.cardTitle}>
                Lecture Log
              </Text>

              <Text style={styles.cardSubtitle}>
                Optional description of this lecture
              </Text>
            </View>
          </View>

          <TextInput
            value={lectureDescription}
            onChangeText={
              setLectureDescription
            }
            multiline
            maxLength={500}
            textAlignVertical="top"
            placeholder="Write a short description about what you taught..."
            placeholderTextColor="#999DA8"
            style={styles.descriptionInput}
          />

          <Text style={styles.characterCount}>
            {lectureDescription.length}/500
          </Text>

          <View style={styles.connectionInfo}>
            <Ionicons
              name="link-outline"
              size={15}
              color="#5420D8"
            />

            <Text
              style={styles.connectionText}
            >
              This description will also appear in Lecture History.
            </Text>
          </View>
        </View>

        {/* SUBMIT */}

        <Pressable
          style={styles.submitButton}
          onPress={submitAttendance}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.submitText}>
            Submit Attendance
          </Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* SELECTOR MODAL */}

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

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectorType === 'batch'
                    ? 'Select Batch'
                    : selectorType === 'subject'
                      ? 'Select Subject'
                      : selectorType === 'date'
                        ? 'Select Date'
                        : 'Select Time Slot'}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose an option
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

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {selectorItems.map(
                (item) => {
                  const selected =
                    item ===
                    selectedSelectorValue;

                  return (
                    <Pressable
                      key={`${selectorType}-${item}`}
                      style={[
                        styles.modalOption,
                        selected &&
                          styles.modalOptionSelected,
                      ]}
                      onPress={() =>
                        selectValue(item)
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
                },
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function getTodayDate(): string {
  return new Date().toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function getDateOptions(): string[] {
  const dates: string[] = [];

  const today = new Date();

  for (
    let i = 0;
    i < 60;
    i++
  ) {
    const date =
      new Date(today);

    date.setDate(
      today.getDate() - i,
    );

    dates.push(
      date.toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      ),
    );
  }

  return dates;
}

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

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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

  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  teacherTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  teacherIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  teacherText: {
    flex: 1,
  },

  teacherTitle: {
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
  },

  teacherSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
  },

  teacherButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  teacherButton: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#DDE5E0',
    backgroundColor: '#F5FAF7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  teacherPresent: {
    backgroundColor: '#2FA66A',
    borderColor: '#2FA66A',
  },

  teacherAbsent: {
    backgroundColor: '#D64545',
    borderColor: '#D64545',
  },

  teacherButtonText: {
    color: '#2FA66A',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
  },

  teacherButtonTextActive: {
    color: '#FFFFFF',
  },

  teacherButtonTextAbsent: {
    color: '#FFFFFF',
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
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
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

  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  studentTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  studentSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 2,
  },

  studentCountBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentCountText: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
    fontSize: 14,
  },

  allButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
    marginBottom: 7,
  },

  presentAllButton: {
    flex: 1,
    height: 43,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CDEBDD',
    backgroundColor: '#EFFAF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  presentAllText: {
    color: '#2A875B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
  },

  absentAllButton: {
    flex: 1,
    height: 43,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#F0D2D2',
    backgroundColor: '#FFF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  absentAllText: {
    color: '#B94848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
  },

  studentRow: {
    minHeight: 69,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  avatarText: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
  },

  studentId: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    marginTop: 1,
  },

  attendanceButton: {
    width: 105,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  presentButton: {
    backgroundColor: '#2FA66A',
  },

  absentButton: {
    backgroundColor: '#D64545',
  },

  attendanceButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
  },

  countsCard: {
    backgroundColor: '#F8F7FA',
    borderRadius: 13,
    minHeight: 59,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  countItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  countDivider: {
    width: 1,
    height: 31,
    backgroundColor: '#E2E1E7',
  },

  presentDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2FA66A',
  },

  absentDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D64545',
  },

  countLabel: {
    color: '#777C89',
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
  },

  countNumber: {
    fontFamily: 'PoppinsBold',
    fontSize: 12,
  },

  presentNumber: {
    color: '#2FA66A',
  },

  absentNumber: {
    color: '#D64545',
  },

  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  logHeaderText: {
    flex: 1,
  },

  descriptionInput: {
    minHeight: 115,
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

  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EBFF',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginTop: 9,
  },

  connectionText: {
    flex: 1,
    color: '#65558E',
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    marginLeft: 6,
  },

  submitButton: {
    height: 51,
    borderRadius: 13,
    backgroundColor: '#5420D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 10,
  },

  submitText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
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

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    color: '#343848',
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
  },

  modalOptionTextSelected: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
  },
});