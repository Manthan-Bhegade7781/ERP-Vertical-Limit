import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

type TimetableItem = {
  id: string;
  day: DayKey;
  startTime: string;
  endTime: string;
  subject: string;
  batch: string;
  room: string;
  teacher: string;
  type: 'lecture' | 'lab' | 'exam';
};

const days: { key: DayKey; label: string; date: string }[] = [
  { key: 'Mon', label: 'Mon', date: '07' },
  { key: 'Tue', label: 'Tue', date: '08' },
  { key: 'Wed', label: 'Wed', date: '09' },
  { key: 'Thu', label: 'Thu', date: '10' },
  { key: 'Fri', label: 'Fri', date: '11' },
  { key: 'Sat', label: 'Sat', date: '12' },
];

const timetableData: TimetableItem[] = [
  {
    id: '1',
    day: 'Mon',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subject: 'Mathematics',
    batch: 'Batch A',
    room: 'Room 204',
    teacher: 'Rahul Sharma',
    type: 'lecture',
  },
  {
    id: '2',
    day: 'Mon',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    subject: 'Physics',
    batch: 'Batch B',
    room: 'Room 105',
    teacher: 'Priya Singh',
    type: 'lecture',
  },
  {
    id: '3',
    day: 'Mon',
    startTime: '12:00 PM',
    endTime: '01:00 PM',
    subject: 'Computer Science',
    batch: 'Batch C',
    room: 'Computer Lab',
    teacher: 'Amit Kumar',
    type: 'lab',
  },
  {
    id: '4',
    day: 'Tue',
    startTime: '09:30 AM',
    endTime: '10:30 AM',
    subject: 'English',
    batch: 'Batch A',
    room: 'Room 201',
    teacher: 'Neha Joshi',
    type: 'lecture',
  },
  {
    id: '5',
    day: 'Tue',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    subject: 'Chemistry',
    batch: 'Batch B',
    room: 'Lab 1',
    teacher: 'Vikas Patil',
    type: 'lab',
  },
  {
    id: '6',
    day: 'Wed',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subject: 'Mathematics',
    batch: 'Batch C',
    room: 'Room 204',
    teacher: 'Rahul Sharma',
    type: 'lecture',
  },
  {
    id: '7',
    day: 'Wed',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    subject: 'Biology',
    batch: 'Batch A',
    room: 'Room 108',
    teacher: 'Sneha Kulkarni',
    type: 'lecture',
  },
  {
    id: '8',
    day: 'Thu',
    startTime: '09:15 AM',
    endTime: '10:15 AM',
    subject: 'Physics',
    batch: 'Batch C',
    room: 'Room 105',
    teacher: 'Priya Singh',
    type: 'lecture',
  },
  {
    id: '9',
    day: 'Thu',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    subject: 'Computer Science',
    batch: 'Batch B',
    room: 'Computer Lab',
    teacher: 'Amit Kumar',
    type: 'lab',
  },
  {
    id: '10',
    day: 'Fri',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subject: 'Chemistry',
    batch: 'Batch A',
    room: 'Lab 1',
    teacher: 'Vikas Patil',
    type: 'lab',
  },
  {
    id: '11',
    day: 'Fri',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    subject: 'English',
    batch: 'Batch C',
    room: 'Room 201',
    teacher: 'Neha Joshi',
    type: 'lecture',
  },
  {
    id: '12',
    day: 'Sat',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subject: 'Biology',
    batch: 'Batch B',
    room: 'Room 108',
    teacher: 'Sneha Kulkarni',
    type: 'lecture',
  },
];

const typeColors = {
  lecture: {
    background: '#F1EAFF',
    icon: '#7040D5',
  },
  lab: {
    background: '#EAF2FF',
    icon: '#2675E8',
  },
  exam: {
    background: '#FFE9F0',
    icon: '#E95386',
  },
};

const getTypeIcon = (
  type: TimetableItem['type']
): keyof typeof MaterialCommunityIcons.glyphMap => {
  if (type === 'lab') {
    return 'flask-outline';
  }

  if (type === 'exam') {
    return 'file-document-outline';
  }

  return 'book-open-outline';
};

export default function TimetablePage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [selectedDay, setSelectedDay] =
    useState<DayKey>('Mon');

  const [weekOffset, setWeekOffset] = useState(0);

  const selectedClasses = useMemo(() => {
    return timetableData.filter(
      (item) => item.day === selectedDay
    );
  }, [selectedDay]);

  const totalClasses = timetableData.length;

  const lectureCount = timetableData.filter(
    (item) => item.type === 'lecture'
  ).length;

  const labCount = timetableData.filter(
    (item) => item.type === 'lab'
  ).length;

  const handlePreviousWeek = () => {
    setWeekOffset((current) => current - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset((current) => current + 1);
  };

  const handleToday = () => {
    setWeekOffset(0);
    setSelectedDay('Mon');
  };

  const handleAddClass = () => {
    console.log('Add class clicked');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          My Timetable
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={handleAddClass}
        >
          <MaterialCommunityIcons
            name="plus"
            size={18}
            color="#7040D5"
          />
          <Text style={styles.addButtonText}>
            Add Class
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            MANAGEMENT TITLE
        ===================================================== */}

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <View
          style={[
            styles.summaryGrid,
            isDesktop && styles.summaryGridDesktop,
          ]}
        >
          <View
            style={[
              styles.summaryCardWrapper,
              isDesktop && styles.summaryCardWrapperDesktop,
            ]}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconPurple}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>
                  Total Classes
                </Text>

                <Text style={styles.summaryValue}>
                  {totalClasses}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.summaryCardWrapper,
              isDesktop && styles.summaryCardWrapperDesktop,
            ]}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconBlue}>
                <MaterialCommunityIcons
                  name="book-open-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>

              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>
                  Lectures
                </Text>

                <Text style={styles.summaryValue}>
                  {lectureCount}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.summaryCardWrapper,
              isDesktop && styles.summaryCardWrapperDesktop,
            ]}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconGreen}>
                <MaterialCommunityIcons
                  name="flask-outline"
                  size={21}
                  color="#35B878"
                />
              </View>

              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>
                  Practical / Lab
                </Text>

                <Text style={styles.summaryValue}>
                  {labCount}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.summaryCardWrapper,
              isDesktop && styles.summaryCardWrapperDesktop,
            ]}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconOrange}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={21}
                  color="#F7941D"
                />
              </View>

              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>
                  Working Days
                </Text>

                <Text style={styles.summaryValue}>
                  6
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            WEEK NAVIGATION
        ===================================================== */}

        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <View style={styles.weekTitleContainer}>
              <MaterialCommunityIcons
                name="calendar-week-outline"
                size={21}
                color="#7040D5"
              />

              <View style={styles.weekTitleText}>
                <Text style={styles.weekTitle}>
                  September 2026
                </Text>

                <Text style={styles.weekSubtitle}>
                  {weekOffset === 0
                    ? 'Current Week'
                    : weekOffset < 0
                      ? `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} earlier`
                      : `${weekOffset} week${weekOffset > 1 ? 's' : ''} later`}
                </Text>
              </View>
            </View>

            <View style={styles.weekActions}>
              <TouchableOpacity
                style={styles.todayButton}
                activeOpacity={0.8}
                onPress={handleToday}
              >
                <Text style={styles.todayButtonText}>
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.arrowButton}
                activeOpacity={0.8}
                onPress={handlePreviousWeek}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={21}
                  color="#66768A"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.arrowButton}
                activeOpacity={0.8}
                onPress={handleNextWeek}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={21}
                  color="#66768A"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* =====================================================
              DAYS
          ===================================================== */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContainer}
          >
            {days.map((day) => {
              const isSelected = selectedDay === day.key;

              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDay(day.key)}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      isSelected && styles.dayLabelActive,
                    ]}
                  >
                    {day.label}
                  </Text>

                  <Text
                    style={[
                      styles.dayDate,
                      isSelected && styles.dayDateActive,
                    ]}
                  >
                    {day.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* =====================================================
            SELECTED DAY
        ===================================================== */}

        <View style={styles.scheduleHeader}>
          <View>
            <Text style={styles.scheduleTitle}>
              {selectedDay === 'Mon'
                ? 'Monday'
                : selectedDay === 'Tue'
                  ? 'Tuesday'
                  : selectedDay === 'Wed'
                    ? 'Wednesday'
                    : selectedDay === 'Thu'
                      ? 'Thursday'
                      : selectedDay === 'Fri'
                        ? 'Friday'
                        : 'Saturday'}
            </Text>

            <Text style={styles.scheduleSubtitle}>
              {selectedClasses.length}{' '}
              {selectedClasses.length === 1
                ? 'class'
                : 'classes'}{' '}
              scheduled
            </Text>
          </View>

          <View style={styles.classCountBadge}>
            <Text style={styles.classCountText}>
              {selectedClasses.length}
            </Text>
          </View>
        </View>

        {/* =====================================================
            CLASS LIST
        ===================================================== */}

        {selectedClasses.length > 0 ? (
          <View style={styles.classList}>
            {selectedClasses.map((item, index) => {
              const typeColor = typeColors[item.type];

              return (
                <View
                  key={item.id}
                  style={styles.classCard}
                >
                  {/* TIME */}

                  <View style={styles.timeColumn}>
                    <Text style={styles.startTime}>
                      {item.startTime}
                    </Text>

                    <View style={styles.timeLine}>
                      <View style={styles.timeDot} />
                    </View>

                    <Text style={styles.endTime}>
                      {item.endTime}
                    </Text>
                  </View>

                  {/* CLASS */}

                  <View style={styles.classContent}>
                    <View style={styles.classTopRow}>
                      <View
                        style={[
                          styles.classIcon,
                          {
                            backgroundColor:
                              typeColor.background,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={getTypeIcon(item.type)}
                          size={21}
                          color={typeColor.icon}
                        />
                      </View>

                      <View style={styles.classMainInfo}>
                        <Text style={styles.subject}>
                          {item.subject}
                        </Text>

                        <View style={styles.batchRow}>
                          <MaterialCommunityIcons
                            name="account-group-outline"
                            size={14}
                            color="#8D98A8"
                          />

                          <Text style={styles.batchText}>
                            {item.batch}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.moreButton}
                        activeOpacity={0.8}
                        onPress={() =>
                          console.log(
                            `Class ${item.id} selected`
                          )
                        }
                      >
                        <MaterialCommunityIcons
                          name="dots-vertical"
                          size={20}
                          color="#9AA8B8"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.classDetails}>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                          name="map-marker-outline"
                          size={15}
                          color="#7040D5"
                        />

                        <Text style={styles.detailText}>
                          {item.room}
                        </Text>
                      </View>

                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                          name="account-outline"
                          size={15}
                          color="#2675E8"
                        />

                        <Text style={styles.detailText}>
                          {item.teacher}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor:
                            typeColor.background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          {
                            color: typeColor.icon,
                          },
                        ]}
                      >
                        {item.type === 'lab'
                          ? 'PRACTICAL / LAB'
                          : item.type === 'exam'
                            ? 'EXAMINATION'
                            : 'LECTURE'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="calendar-remove-outline"
                size={35}
                color="#7040D5"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Classes Scheduled
            </Text>

            <Text style={styles.emptySubtitle}>
              There are no classes scheduled for this day.
            </Text>
          </View>
        )}

        {/* =====================================================
            WEEKLY OVERVIEW
        ===================================================== */}

        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View>
              <Text style={styles.overviewTitle}>
                Weekly Overview
              </Text>

              <Text style={styles.overviewSubtitle}>
                Classes scheduled for this week
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chart-box-outline"
              size={23}
              color="#7040D5"
            />
          </View>

          {days.map((day) => {
            const count = timetableData.filter(
              (item) => item.day === day.key
            ).length;

            return (
              <TouchableOpacity
                key={day.key}
                style={styles.overviewRow}
                activeOpacity={0.8}
                onPress={() => setSelectedDay(day.key)}
              >
                <View style={styles.overviewDay}>
                  <Text style={styles.overviewDayName}>
                    {day.label}
                  </Text>

                  <Text style={styles.overviewDayDate}>
                    Sep {day.date}
                  </Text>
                </View>

                <View style={styles.overviewProgressContainer}>
                  <View style={styles.overviewProgressBackground}>
                    <View
                      style={[
                        styles.overviewProgress,
                        {
                          width: `${Math.min(
                            count * 25,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.overviewCount}>
                  {count}{' '}
                  {count === 1 ? 'class' : 'classes'}
                </Text>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={19}
                  color="#A1AAB7"
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* =====================================================
     CONTAINER
  ===================================================== */

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* =====================================================
     HEADER
  ===================================================== */

  /* =====================================================
     SCROLL
  ===================================================== */

  header: {
    minHeight: 66,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    marginLeft: 12,
  },

  addButton: {
    minHeight: 36,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  addButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 4,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  /* =====================================================
     MANAGEMENT TITLE
  ===================================================== */

  managementTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: '#172033',
    marginBottom: 16,
  },

  /* =====================================================
     SUMMARY
  ===================================================== */

  summaryGrid: {
    width: '100%',
  },

  summaryGridDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryCardWrapper: {
    width: '100%',
  },

  summaryCardWrapperDesktop: {
    width: '24%',
  },

  summaryCard: {
    minHeight: 82,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  summaryIconPurple: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryIconBlue: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryIconGreen: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryIconOrange: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFF1E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  summaryLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    lineHeight: 14,
    color: '#8994A4',
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    lineHeight: 24,
    color: '#202A3A',
    marginTop: 1,
  },

  /* =====================================================
     WEEK CARD
  ===================================================== */

  weekCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  weekTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  weekTitleText: {
    marginLeft: 10,
  },

  weekTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    lineHeight: 19,
    color: '#202A3A',
  },

  weekSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 14,
    color: '#929CAB',
    marginTop: 1,
  },

  weekActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },

  todayButton: {
    minHeight: 34,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  todayButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
  },

  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },

  /* =====================================================
     DAYS
  ===================================================== */

  daysContainer: {
    paddingTop: 16,
    paddingBottom: 2,
  },

  dayButton: {
    minWidth: 62,
    minHeight: 58,
    borderRadius: 11,
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#EEF1F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  dayButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  dayLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    lineHeight: 14,
    color: '#758195',
  },

  dayLabelActive: {
    color: '#FFFFFF',
  },

  dayDate: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    lineHeight: 21,
    color: '#283448',
    marginTop: 1,
  },

  dayDateActive: {
    color: '#FFFFFF',
  },

  /* =====================================================
     SCHEDULE HEADER
  ===================================================== */

  scheduleHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  scheduleTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    lineHeight: 21,
    color: '#202A3A',
  },

  scheduleSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 14,
    color: '#929CAB',
    marginTop: 1,
  },

  classCountBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  classCountText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
  },

  /* =====================================================
     CLASS LIST
  ===================================================== */

  classList: {
    width: '100%',
  },

  classCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    flexDirection: 'row',
    marginBottom: 11,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  timeColumn: {
    width: 76,
    alignItems: 'center',
    paddingTop: 3,
  },

  startTime: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#59677A',
    textAlign: 'center',
  },

  endTime: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#A0A9B6',
    textAlign: 'center',
  },

  timeLine: {
    width: 1,
    height: 18,
    backgroundColor: '#DCDFF0',
    marginVertical: 3,
    alignItems: 'center',
  },

  timeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7040D5',
    marginTop: 6,
  },

  classContent: {
    flex: 1,
    minWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F2F6',
    paddingLeft: 13,
  },

  classTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  classIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  classMainInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  subject: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
    lineHeight: 17,
    color: '#263247',
  },

  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  batchText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8B96A6',
    marginLeft: 4,
  },

  moreButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  classDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginBottom: 5,
  },

  detailText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#687589',
    marginLeft: 4,
  },

  typeBadge: {
    alignSelf: 'flex-start',
    minHeight: 22,
    borderRadius: 6,
    paddingHorizontal: 7,
    justifyContent: 'center',
    marginTop: 3,
  },

  typeBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 6.8,
    letterSpacing: 0.2,
  },

  /* =====================================================
     EMPTY
  ===================================================== */

  emptyCard: {
    width: '100%',
    minHeight: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#273246',
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#929CAB',
    textAlign: 'center',
    marginTop: 4,
  },

  /* =====================================================
     WEEKLY OVERVIEW
  ===================================================== */

  overviewCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  overviewTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#202A3A',
  },

  overviewSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#929CAB',
    marginTop: 1,
  },

  overviewRow: {
    minHeight: 56,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F6',
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewDay: {
    width: 65,
  },

  overviewDayName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#344054',
  },

  overviewDayDate: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#9AA4B2',
    marginTop: 1,
  },

  overviewProgressContainer: {
    flex: 1,
    marginHorizontal: 10,
  },

  overviewProgressBackground: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F0F2F6',
    overflow: 'hidden',
  },

  overviewProgress: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#7040D5',
  },

  overviewCount: {
    width: 55,
    fontFamily: 'PoppinsMedium',
    fontSize: 7.5,
    color: '#758195',
    textAlign: 'right',
    marginRight: 5,
  },
});