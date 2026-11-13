import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { getTimetable, TimetableEntry } from '@/services/timetable';

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

const getSubjectStyle = (name: string, index: number) => {
  const lower = name.toLowerCase();
  if (lower.includes('physic')) {
    return { icon: 'flask-outline' as const, color: '#6630D7', background: '#EEE7FF' };
  }
  if (lower.includes('math')) {
    return { icon: 'calculator-outline' as const, color: '#1670E8', background: '#E6F0FF' };
  }
  if (lower.includes('chem')) {
    return { icon: 'beaker-outline' as const, color: '#22A55A', background: '#E3F7EB' };
  }
  if (lower.includes('bio')) {
    return { icon: 'leaf-outline' as const, color: '#059669', background: '#D1FAE5' };
  }
  if (lower.includes('eng')) {
    return { icon: 'book-outline' as const, color: '#F28A17', background: '#FFF0DF' };
  }
  if (lower.includes('computer') || lower.includes('cs') || lower.includes('it')) {
    return { icon: 'laptop-outline' as const, color: '#7C3AED', background: '#EDE9FE' };
  }

  const defaultStyles = [
    { icon: 'flask-outline' as const, color: '#6630D7', background: '#EEE7FF' },
    { icon: 'calculator-outline' as const, color: '#1670E8', background: '#E6F0FF' },
    { icon: 'beaker-outline' as const, color: '#22A55A', background: '#E3F7EB' },
    { icon: 'book-outline' as const, color: '#F28A17', background: '#FFF0DF' },
    { icon: 'school-outline' as const, color: '#E95386', background: '#FDECF1' },
  ];
  return defaultStyles[index % defaultStyles.length];
};

const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  const minStr = String(isNaN(m) ? 0 : m).padStart(2, '0');
  return `${String(hour12).padStart(2, '0')}:${minStr} ${period}`;
};

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
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
  const [timetableEntries, setTimetableEntries] =
    useState<TimetableEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimetable = useCallback(async () => {
    try {
      const monday = getStartOfWeek(new Date());
      const saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 5);

      const res = await getTimetable({
        startDate: monday.toISOString().split('T')[0],
        endDate: saturday.toISOString().split('T')[0],
      });

      if (res.success && Array.isArray(res.data)) {
        setTimetableEntries(res.data);
      } else {
        setTimetableEntries([]);
      }
    } catch (err) {
      console.error('Failed to load student timetable:', err);
      setTimetableEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchTimetable();
  }, [fetchTimetable]);

  useFocusEffect(
    useCallback(() => {
      void fetchTimetable();
    }, [fetchTimetable]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTimetable();
  };

  const week = useMemo(() => {
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

      let classes: ClassItem[] = [];

      if (timetableEntries && timetableEntries.length > 0) {
        const dayEntries = timetableEntries.filter((e) => {
          if (!e.scheduledDate) return false;
          const entryDate = new Date(e.scheduledDate);
          return (
            entryDate.getFullYear() === date.getFullYear() &&
            entryDate.getMonth() === date.getMonth() &&
            entryDate.getDate() === date.getDate()
          );
        });

        dayEntries.sort((a, b) =>
          (a.startTime || '').localeCompare(b.startTime || ''),
        );

        classes = dayEntries.map((entry, idx) => {
          const subjectName =
            entry.batchSubjectId?.subjectId?.name || 'Class';
          const teacherName =
            entry.batchSubjectId?.teacherId?.fullName ||
            'Assigned Teacher';
          const style = getSubjectStyle(subjectName, idx);
          return {
            time: formatTime(entry.startTime),
            subject: subjectName,
            teacher: teacherName,
            room: entry.room || 'Room 101',
            icon: style.icon,
            color: style.color,
            background: style.background,
          };
        });
      } else {
        classes = [];
      }

      return {
        day: item.day,
        shortDay: item.shortDay,
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', {
          month: 'short',
        }),
        classes,
      };
    });
  }, [timetableEntries]);

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

  const selectedSchedule = week[selectedDay] || week[0];

  return (
    <View style={styles.container}>
      <TimetableHeader onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6630D7']}
            tintColor="#6630D7"
          />
        }
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

        {loading && timetableEntries === null ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6630D7" />
            <Text style={styles.loadingText}>Loading timetable...</Text>
          </View>
        ) : (
          <>
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
            {selectedSchedule.classes.length === 0 ? (
              <View style={styles.emptyStateCard}>
                <View style={styles.emptyStateIconBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={30}
                    color="#6630D7"
                  />
                </View>
                <Text style={styles.emptyStateTitle}>
                  No Classes Scheduled
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  There are no classes scheduled for {selectedSchedule.day}. Enjoy your day!
                </Text>
              </View>
            ) : (
              selectedSchedule.classes.map(
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
              )
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
          </>
        )}

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

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#858592',
    marginTop: 12,
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
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },

  headerTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
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
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* WEEK CARD */

  weekCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 16,
  },

  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  weekTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#171827',
  },

  weekBadge: {
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  weekBadgeText: {
    fontFamily: 'PoppinsBold',
    fontSize: 9,
    color: '#6630D7',
  },

  daySelectorContent: {
    paddingVertical: 2,
    gap: 7,
  },

  dayButton: {
    width: 58,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#F7F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayButtonSelected: {
    backgroundColor: '#6630D7',
  },

  dayName: {
    fontFamily: 'PoppinsBold',
    fontSize: 9.5,
    color: '#858592',
    marginBottom: 2,
  },

  dayNameSelected: {
    color: '#FFFFFF',
  },

  dayDate: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#171827',
  },

  dayDateSelected: {
    color: '#FFFFFF',
  },

  dayMonth: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#858592',
  },

  dayMonthSelected: {
    color: '#FFFFFF',
  },

  /* SCHEDULE HEADER */

  scheduleHeader: {
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  selectedDayTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#171827',
  },

  selectedDaySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#858592',
  },

  classCount: {
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  classCountText: {
    fontFamily: 'PoppinsBold',
    fontSize: 10,
    color: '#6630D7',
  },

  /* CLASS CARD */

  classCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeColumn: {
    alignItems: 'center',
    marginRight: 14,
    minWidth: 64,
  },

  timeText: {
    fontFamily: 'PoppinsBold',
    fontSize: 9.5,
    color: '#171827',
  },

  timelineLine: {
    width: 2,
    height: 38,
    backgroundColor: '#EEEEF3',
    marginTop: 6,
  },

  classDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  classInfo: {
    flex: 1,
  },

  subjectName: {
    fontFamily: 'PoppinsBold',
    fontSize: 13,
    color: '#171827',
  },

  teacherName: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#858592',
    marginTop: 1,
  },

  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  roomText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#888894',
    marginLeft: 3,
  },

  /* EMPTY STATE */

  emptyStateCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyStateIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyStateTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: '#171827',
    marginBottom: 4,
  },

  emptyStateSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#858592',
    textAlign: 'center',
    lineHeight: 15,
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
