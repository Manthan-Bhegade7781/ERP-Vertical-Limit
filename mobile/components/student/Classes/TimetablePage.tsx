import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TimetablePageProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

type ClassItem = {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
};

type DaySchedule = {
  day: string;
  shortDay: string;
  date: number;
  month: string;
  classes: ClassItem[];
};

const WEEK_SCHEDULE: ClassItem[][] = [
  [
    {
      time: '10:00 AM',
      subject: 'Physics',
      teacher: 'Priya Sharma',
      room: 'Room 101',
      icon: 'flask-outline',
      color: '#6630D7',
      background: '#EEE7FF',
    },
    {
      time: '11:30 AM',
      subject: 'Mathematics',
      teacher: 'Rahul Sir',
      room: 'Room 203',
      icon: 'calculator-outline',
      color: '#1670E8',
      background: '#E6F0FF',
    },
    {
      time: '02:00 PM',
      subject: 'Chemistry',
      teacher: 'Anjali Ma’am',
      room: 'Room 105',
      icon: 'beaker-outline',
      color: '#22A55A',
      background: '#E3F7EB',
    },
  ],
  [
    {
      time: '09:00 AM',
      subject: 'Mathematics',
      teacher: 'Rahul Sir',
      room: 'Room 203',
      icon: 'calculator-outline',
      color: '#1670E8',
      background: '#E6F0FF',
    },
    {
      time: '10:30 AM',
      subject: 'Physics',
      teacher: 'Priya Sharma',
      room: 'Room 101',
      icon: 'flask-outline',
      color: '#6630D7',
      background: '#EEE7FF',
    },
    {
      time: '01:30 PM',
      subject: 'Chemistry',
      teacher: 'Anjali Ma’am',
      room: 'Room 105',
      icon: 'beaker-outline',
      color: '#22A55A',
      background: '#E3F7EB',
    },
  ],
  [
    {
      time: '10:00 AM',
      subject: 'Chemistry',
      teacher: 'Anjali Ma’am',
      room: 'Room 105',
      icon: 'beaker-outline',
      color: '#22A55A',
      background: '#E3F7EB',
    },
    {
      time: '11:30 AM',
      subject: 'Physics',
      teacher: 'Priya Sharma',
      room: 'Room 101',
      icon: 'flask-outline',
      color: '#6630D7',
      background: '#EEE7FF',
    },
    {
      time: '03:00 PM',
      subject: 'Mathematics',
      teacher: 'Rahul Sir',
      room: 'Room 203',
      icon: 'calculator-outline',
      color: '#1670E8',
      background: '#E6F0FF',
    },
  ],
  [
    {
      time: '10:00 AM',
      subject: 'Physics',
      teacher: 'Priya Sharma',
      room: 'Room 101',
      icon: 'flask-outline',
      color: '#6630D7',
      background: '#EEE7FF',
    },
    {
      time: '12:00 PM',
      subject: 'Mathematics',
      teacher: 'Rahul Sir',
      room: 'Room 203',
      icon: 'calculator-outline',
      color: '#1670E8',
      background: '#E6F0FF',
    },
    {
      time: '02:30 PM',
      subject: 'Chemistry',
      teacher: 'Anjali Ma’am',
      room: 'Room 105',
      icon: 'beaker-outline',
      color: '#22A55A',
      background: '#E3F7EB',
    },
  ],
  [
    {
      time: '09:30 AM',
      subject: 'Mathematics',
      teacher: 'Rahul Sir',
      room: 'Room 203',
      icon: 'calculator-outline',
      color: '#1670E8',
      background: '#E6F0FF',
    },
    {
      time: '11:00 AM',
      subject: 'Physics',
      teacher: 'Priya Sharma',
      room: 'Room 101',
      icon: 'flask-outline',
      color: '#6630D7',
      background: '#EEE7FF',
    },
  ],
  [
    {
      time: '10:00 AM',
      subject: 'Chemistry',
      teacher: 'Anjali Ma’am',
      room: 'Room 105',
      icon: 'beaker-outline',
      color: '#22A55A',
      background: '#E3F7EB',
    },
    {
      time: '11:30 AM',
      subject: 'Mathematics',
      teacher: 'Rahul Sir',
      room: 'Room 203',
      icon: 'calculator-outline',
      color: '#1670E8',
      background: '#E6F0FF',
    },
  ],
];

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getWeekData(): DaySchedule[] {
  const monday = getStartOfWeek(new Date());

  const days = [
    { day: 'Monday', shortDay: 'MON' },
    { day: 'Tuesday', shortDay: 'TUE' },
    { day: 'Wednesday', shortDay: 'WED' },
    { day: 'Thursday', shortDay: 'THU' },
    { day: 'Friday', shortDay: 'FRI' },
    { day: 'Saturday', shortDay: 'SAT' },
  ];

  return days.map((item, index) => {
    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    return {
      day: item.day,
      shortDay: item.shortDay,
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', {
        month: 'short',
      }),
      classes: WEEK_SCHEDULE[index],
    };
  });
}

function TimetableHeader({
  onBack,
}: {
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          height: insets.top + 72,
        },
      ]}
    >
      <StatusBar
        style="dark"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <View style={styles.headerRow}>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          hitSlop={8}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#6630D7"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Timetable
        </Text>
      </View>
    </View>
  );
}

export default function TimetablePage({
  onContentScroll,
  onBack,
}: TimetablePageProps) {
  const week = useMemo(() => getWeekData(), []);

  const today = new Date();

  const todayIndex =
    today.getDay() === 0
      ? 5
      : today.getDay() - 1;

  const [selectedDay, setSelectedDay] = useState(
    todayIndex >= 0 && todayIndex < 6
      ? todayIndex
      : 0,
  );

  const selectedSchedule = week[selectedDay];

  return (
    <View style={styles.container}>
      <TimetableHeader onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* PAGE INTRO */}

        <View style={styles.pageIntro}>
          <View style={styles.introText}>
            <Text style={styles.pageTitle}>
              This Week
            </Text>

            <Text style={styles.pageSubtitle}>
              Your complete class schedule
            </Text>
          </View>

          <View style={styles.calendarIcon}>
            <Ionicons
              name="calendar-outline"
              size={27}
              color="#6630D7"
            />
          </View>
        </View>

        {/* WEEK SELECTOR */}

        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>
              Weekly Schedule
            </Text>

            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>
                {week[0].date} {week[0].month} -{' '}
                {week[5].date} {week[5].month}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.daySelectorContent
            }
          >
            {week.map((day, index) => {
              const isSelected =
                selectedDay === index;

              return (
                <Pressable
                  key={`${day.day}-${day.date}`}
                  style={[
                    styles.dayButton,
                    isSelected &&
                      styles.dayButtonSelected,
                  ]}
                  onPress={() =>
                    setSelectedDay(index)
                  }
                >
                  <Text
                    style={[
                      styles.dayName,
                      isSelected &&
                        styles.dayNameSelected,
                    ]}
                  >
                    {day.shortDay}
                  </Text>

                  <Text
                    style={[
                      styles.dayDate,
                      isSelected &&
                        styles.dayDateSelected,
                    ]}
                  >
                    {day.date}
                  </Text>

                  <Text
                    style={[
                      styles.dayMonth,
                      isSelected &&
                        styles.dayMonthSelected,
                    ]}
                  >
                    {day.month}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* SELECTED DAY */}

        <View style={styles.scheduleHeader}>
          <View>
            <Text style={styles.selectedDayTitle}>
              {selectedSchedule.day}
            </Text>

            <Text style={styles.selectedDaySubtitle}>
              {selectedSchedule.date}{' '}
              {selectedSchedule.month}{' '}
              {new Date().getFullYear()}
            </Text>
          </View>

          <View style={styles.classCount}>
            <Text style={styles.classCountText}>
              {selectedSchedule.classes.length}{' '}
              Classes
            </Text>
          </View>
        </View>

        {/* CLASSES */}

        {selectedSchedule.classes.map(
          (classItem, index) => (
            <View
              key={`${selectedSchedule.day}-${classItem.subject}-${index}`}
              style={styles.classCard}
            >
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>
                  {classItem.time}
                </Text>

                {index !==
                  selectedSchedule.classes.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.classDetails}>
                <View
                  style={[
                    styles.subjectIcon,
                    {
                      backgroundColor:
                        classItem.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={classItem.icon}
                    size={24}
                    color={classItem.color}
                  />
                </View>

                <View style={styles.classInfo}>
                  <Text style={styles.subjectName}>
                    {classItem.subject}
                  </Text>

                  <Text style={styles.teacherName}>
                    {classItem.teacher}
                  </Text>

                  <View style={styles.roomRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#888894"
                    />

                    <Text style={styles.roomText}>
                      {classItem.room}
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#A3A3AD"
              />
            </View>
          ),
        )}

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="school-outline"
              size={24}
              color="#6630D7"
            />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>
              Your Weekly Schedule
            </Text>

            <Text style={styles.summaryText}>
              Classes are scheduled Monday to
              Saturday for your current batch.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 100,
  },

  /* HEADER */

  header: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
  },

  headerRow: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },

  headerTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#171827',
    includeFontPadding: false,
  },

  /* INTRO */

  pageIntro: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  introText: {
    flex: 1,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 28,
    color: '#111528',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#858592',
    marginTop: 2,
  },

  calendarIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },

  /* WEEK */

  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 18,
    paddingTop: 17,
    paddingBottom: 15,
  },

  weekHeader: {
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  weekTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#171827',
  },

  weekBadge: {
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  weekBadgeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#6630D7',
  },

  daySelectorContent: {
    paddingHorizontal: 12,
  },

  dayButton: {
    width: 58,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#F7F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },

  dayButtonSelected: {
    backgroundColor: '#6630D7',
  },

  dayName: {
    fontFamily: 'PoppinsBold',
    fontSize: 8,
    color: '#858592',
  },

  dayNameSelected: {
    color: '#FFFFFF',
  },

  dayDate: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#171827',
    marginTop: 2,
  },

  dayDateSelected: {
    color: '#FFFFFF',
  },

  dayMonth: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#858592',
  },

  dayMonthSelected: {
    color: '#E9DDFF',
  },

  /* SCHEDULE */

  scheduleHeader: {
    marginHorizontal: 32,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedDayTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 19,
    color: '#111528',
  },

  selectedDaySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#858592',
    marginTop: 1,
  },

  classCount: {
    backgroundColor: '#EEE7FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  classCountText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#6630D7',
  },

  /* CLASS CARD */

  classCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    minHeight: 92,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeColumn: {
    width: 72,
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    paddingTop: 5,
    position: 'relative',
  },

  timeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#777784',
  },

  timelineLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#E7E7ED',
    top: 27,
    bottom: -13,
    left: 30,
  },

  classDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  classInfo: {
    flex: 1,
    minWidth: 0,
  },

  subjectName: {
    fontFamily: 'PoppinsBold',
    fontSize: 13,
    color: '#171827',
  },

  teacherName: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#777784',
    marginTop: 2,
  },

  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  roomText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#888894',
    marginLeft: 3,
  },

  /* SUMMARY */

  summaryCard: {
    marginHorizontal: 16,
    marginTop: 7,
    backgroundColor: '#EEE7FF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 11.5,
    color: '#6630D7',
  },

  summaryText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#777784',
    marginTop: 2,
    lineHeight: 13,
  },

  bottomSpacing: {
    height: 30,
  },
});