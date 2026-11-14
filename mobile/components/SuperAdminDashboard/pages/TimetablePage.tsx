import React, { useEffect, useMemo, useState } from 'react';

import {

  ActivityIndicator,

  Alert,
  Modal,
  TextInput,

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
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';



type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';



type TimetableItem = {
  id: string;
  day: DayKey;
  dateKey: string;
  startTime: string;
  endTime: string;
  subject: string;
  batch: string;
  room: string;
  teacher: string;
  type: 'lecture' | 'lab' | 'exam';
  batchSubjectId?: string;
};



function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const daysSinceMonday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function timeToMinutes(value: string): number {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]) % 12;
  const minute = Number(match[2]);
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour * 60 + minute;
}

function dayKeyFromDateKey(value: string): DayKey {
  const date = new Date(`${value}T12:00:00`);
  const keys: Array<DayKey | 'Sun'> = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const key = keys[date.getDay()];
  return key === 'Sun' || !key ? 'Mon' : key;
}

function formatTimeLabel(value?: string): string {
  if (!value) return '—';
  const normalized = value.trim().toUpperCase();
  if (/\b(AM|PM)\b/.test(normalized)) return normalized;

  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return value;

  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
}

type ApiRecord = {
  _id?: string;
  id?: string;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  type?: string;
  batchSubjectId?: any;
  subjectId?: any;
  batchId?: any;
  teacherId?: any;
};

function getReferenceName(value: any, fallback: string): string {
  if (value && typeof value === 'object') {
    return value.fullName || value.name || fallback;
  }
  return fallback;
}

function mapApiTimetableItem(record: ApiRecord): TimetableItem & { dateKey: string } {
  const assignment =
    record.batchSubjectId && typeof record.batchSubjectId === 'object'
      ? record.batchSubjectId
      : record;

  const scheduledDate = typeof record.scheduledDate === 'string'
    ? record.scheduledDate
    : '';

  // Use the date portion returned by the API to avoid timezone shifting.
  const normalizedDate = scheduledDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || '';

  const rawType = String(record.type || 'lecture').toLowerCase();
  const type: TimetableItem['type'] =
    rawType === 'lab' || rawType === 'exam' ? rawType : 'lecture';

  return {
    id: String(record._id || record.id || ''),
    dateKey: normalizedDate,
    day: normalizedDate ? dayKeyFromDateKey(normalizedDate) : 'Mon',
    startTime: formatTimeLabel(record.startTime),
    endTime: formatTimeLabel(record.endTime),
    subject: getReferenceName(assignment?.subjectId ?? record.subjectId, 'Subject'),
    batch: getReferenceName(assignment?.batchId ?? record.batchId, 'Batch'),
    room: record.room || 'Room not assigned',
    teacher: getReferenceName(assignment?.teacherId ?? record.teacherId, 'Teacher not assigned'),
    type,
    batchSubjectId: typeof record.batchSubjectId === 'string'
      ? record.batchSubjectId
      : record.batchSubjectId?._id || record.batchSubjectId?.id || undefined,
  };
}

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

  const [selectedDay, setSelectedDay] = useState<DayKey>(() => {
    const todayIndex = new Date().getDay();
    const map: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return todayIndex === 0 ? 'Mon' : map[todayIndex - 1] || 'Mon';
  });
  const [weekOffset, setWeekOffset] = useState(0);
  const [timetableItems, setTimetableItems] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [menuItem, setMenuItem] = useState<TimetableItem | null>(null);
  const [viewItem, setViewItem] = useState<TimetableItem | null>(null);
  const [editItem, setEditItem] = useState<TimetableItem | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editType, setEditType] = useState<TimetableItem['type']>('lecture');
  const [savingEdit, setSavingEdit] = useState(false);

  const weekStart = useMemo(() => {
    const start = startOfWeek(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return start;
  }, [weekOffset]);

  const days = useMemo(() => {
    const keys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return keys.map((key, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        key,
        label: key,
        date: dateKey(date),
        dateLabel: String(date.getDate()).padStart(2, '0'),
      };
    });
  }, [weekStart]);

  const selectedDate = days.find((day) => day.key === selectedDay)?.date || dateKey(weekStart);
  const weekStartKey = days[0]?.date || dateKey(weekStart);
  const weekEndKey = days[days.length - 1]?.date || weekStartKey;

  useEffect(() => {
    let isMounted = true;

    const loadTimetable = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Please log in again to view the timetable.');
        }

        const url = `${API_BASE_URL}/timetable?startDate=${weekStartKey}&endDate=${weekEndKey}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const responseText = await response.text();
        let result: any;
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error(`The timetable API returned invalid JSON (HTTP ${response.status}).`);
        }

        if (!response.ok || result.success === false) {
          throw new Error(result.message || `Unable to load timetable (HTTP ${response.status}).`);
        }

        const rawRecords = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.timetable)
            ? result.data.timetable
            : Array.isArray(result.data?.classes)
              ? result.data.classes
              : Array.isArray(result.timetable)
                ? result.timetable
                : Array.isArray(result.classes)
                  ? result.classes
                  : [];

        const mapped = rawRecords
          .map((record: ApiRecord) => mapApiTimetableItem(record))
          .filter(
            (item: TimetableItem) =>
              item.id &&
              item.dateKey &&
              item.dateKey >= weekStartKey &&
              item.dateKey <= weekEndKey
          );

        if (isMounted) {
          setTimetableItems(mapped);

          // If the currently selected weekday has no classes, automatically
          // open the first weekday that actually contains a returned class.
          // This avoids showing an empty day while the weekly API has records.
          const selectedDayHasClasses = mapped.some(
            (item: TimetableItem) => item.dateKey === selectedDate
          );
          if (!selectedDayHasClasses && mapped.length > 0) {
            setSelectedDay(mapped[0].day);
          }
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Please try again.';
          setLoadError(message);
          setTimetableItems([]);
          Alert.alert('Unable to Load Timetable', message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTimetable();
    return () => {
      isMounted = false;
    };
  }, [weekStartKey, weekEndKey, selectedDate]);

  const selectedClasses = useMemo(
    () => timetableItems
      .filter((item) => item.dateKey === selectedDate)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
    [timetableItems, selectedDate]
  );

  const totalClasses = timetableItems.length;
  const lectureCount = timetableItems.filter((item) => item.type === 'lecture').length;
  const examCount = timetableItems.filter((item) => item.type === 'exam').length;
  const workingDays = new Set(timetableItems.map((item) => item.dateKey)).size;

  const handlePreviousWeek = () => setWeekOffset((current) => current - 1);
  const handleNextWeek = () => setWeekOffset((current) => current + 1);

  const handleToday = () => {
    setWeekOffset(0);
    const todayIndex = new Date().getDay();
    const map: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    setSelectedDay(todayIndex === 0 ? 'Mon' : map[todayIndex - 1] || 'Mon');
  };

  const handleAddClass = () => {
    router.push({
      pathname: '/(super_admin)/explore',
      params: { feature: 'Add Class' },
    });
  };

  const deleteClass = async (item: TimetableItem) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Please log in again before deleting a class.');

      const response = await fetch(`${API_BASE_URL}/timetable/${item.id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let result: any = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`The server returned invalid JSON (HTTP ${response.status}).`);
      }

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Unable to delete class (HTTP ${response.status}).`);
      }

      setTimetableItems((current) => current.filter((classItem) => classItem.id !== item.id));
      Alert.alert('Class Deleted', 'The class was removed from the timetable.');
    } catch (error) {
      Alert.alert(
        'Unable to Delete Class',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const openEditClass = (item: TimetableItem) => {
    setEditItem(item);
    setEditDate(item.dateKey);
    setEditStartTime(item.startTime);
    setEditEndTime(item.endTime);
    setEditRoom(item.room === 'Room not assigned' ? '' : item.room);
    setEditType(item.type);
  };

  const saveEditedClass = async () => {
    if (!editItem) return;
    const date = editDate.trim();
    const to24Hour = (value: string) => {
      const trimmed = value.trim().toUpperCase();
      const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
      if (match) {
        let hour = Number(match[1]);
        const minute = Number(match[2]);
        if (hour < 1 || hour > 12 || minute > 59) return null;
        hour = hour % 12 + (match[3] === 'PM' ? 12 : 0);
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
      const twentyFour = trimmed.match(/^(\d{2}):(\d{2})$/);
      if (!twentyFour) return null;
      const hour = Number(twentyFour[1]);
      const minute = Number(twentyFour[2]);
      return hour <= 23 && minute <= 59 ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` : null;
    };
    const startTime = to24Hour(editStartTime);
    const endTime = to24Hour(editEndTime);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Invalid Date', 'Enter the date in YYYY-MM-DD format.');
      return;
    }
    if (!startTime || !endTime || startTime >= endTime) {
      Alert.alert('Invalid Time', 'Enter valid times and ensure the end time is after the start time.');
      return;
    }
    if (!editItem.batchSubjectId) {
      Alert.alert('Cannot Edit Class', 'The linked batch and subject assignment was not returned by the API.');
      return;
    }
    setSavingEdit(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Please log in again before editing a class.');
      const response = await fetch(`${API_BASE_URL}/timetable/${editItem.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchSubjectId: editItem.batchSubjectId,
          scheduledDate: date,
          startTime,
          endTime,
          room: editRoom.trim(),
          type: editType,
        }),
      });
      const responseText = await response.text();
      let result: any = {};
      try { result = responseText ? JSON.parse(responseText) : {}; }
      catch { throw new Error(`The server returned invalid JSON (HTTP ${response.status}).`); }
      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Unable to update class (HTTP ${response.status}).`);
      }
      setEditItem(null);
      Alert.alert('Class Updated', 'The timetable entry was updated.');
      // Refresh the currently displayed week so date changes are reflected correctly.
      if (date >= weekStartKey && date <= weekEndKey) {
        setTimetableItems((current) => current.map((entry) => entry.id === editItem.id
          ? { ...entry, dateKey: date, day: dayKeyFromDateKey(date), startTime: formatTimeLabel(startTime), endTime: formatTimeLabel(endTime), room: editRoom.trim() || 'Room not assigned', type: editType }
          : entry));
      } else {
        setTimetableItems((current) => current.filter((entry) => entry.id !== editItem.id));
      }
    } catch (error) {
      Alert.alert('Unable to Update Class', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleClassMenu = (item: TimetableItem) => {
    setMenuItem(item);
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

                  Exams

                </Text>



                <Text style={styles.summaryValue}>

                  {examCount}

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

                  {workingDays}

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

                  {formatMonthYear(weekStart)}

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

                    {day.dateLabel}

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



        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#7040D5" />
            <Text style={styles.emptyTitle}>Loading Timetable</Text>
            <Text style={styles.emptySubtitle}>Fetching classes for this week...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="alert-circle-outline" size={35} color="#7040D5" />
            </View>
            <Text style={styles.emptyTitle}>Unable to Load Timetable</Text>
            <Text style={styles.emptySubtitle}>{loadError}</Text>
          </View>
        ) : selectedClasses.length > 0 ? (

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

                        onPress={() => handleClassMenu(item)}

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

            const count = timetableItems.filter((item) => item.dateKey === day.date).length;



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

                    {new Date(`${day.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })}

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

      <Modal visible={!!menuItem} transparent animationType="fade" onRequestClose={() => setMenuItem(null)}>
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setMenuItem(null)}>
          <View style={styles.menuModalCard}>
            <Text style={styles.modalTitle}>Class Options</Text>
            <Text style={styles.modalSubtext} numberOfLines={2}>{menuItem?.subject} · {menuItem?.batch}</Text>
            <TouchableOpacity style={styles.menuOption} onPress={() => { const item = menuItem; setMenuItem(null); if (item) setViewItem(item); }}>
              <View style={styles.menuOptionIcon}><MaterialCommunityIcons name="eye-outline" size={19} color="#7040D5" /></View>
              <Text style={styles.menuOptionText}>View Details</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#98A2B3" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuOption} onPress={() => { const item = menuItem; setMenuItem(null); if (item) openEditClass(item); }}>
              <View style={styles.menuOptionIcon}><MaterialCommunityIcons name="pencil-outline" size={19} color="#2675E8" /></View>
              <Text style={styles.menuOptionText}>Edit Class</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#98A2B3" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuOption} onPress={() => {
              const item = menuItem;
              setMenuItem(null);
              if (item) Alert.alert('Delete Class?', `Remove ${item.subject} from the timetable?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => { void deleteClass(item); } },
              ]);
            }}>
              <View style={[styles.menuOptionIcon, styles.menuDeleteIcon]}><MaterialCommunityIcons name="trash-can-outline" size={19} color="#D92D20" /></View>
              <Text style={[styles.menuOptionText, styles.menuDeleteText]}>Delete Class</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#98A2B3" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCancelButton} onPress={() => setMenuItem(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!viewItem} transparent animationType="fade" onRequestClose={() => setViewItem(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Class Details</Text>
              <TouchableOpacity onPress={() => setViewItem(null)} style={styles.modalClose}>
                <MaterialCommunityIcons name="close" size={22} color="#667085" />
              </TouchableOpacity>
            </View>
            {viewItem && <>
              <Text style={styles.modalSubject}>{viewItem.subject}</Text>
              <Text style={styles.modalSubtext}>{viewItem.batch}</Text>
              {[
                ['Date', viewItem.dateKey],
                ['Time', `${viewItem.startTime} – ${viewItem.endTime}`],
                ['Teacher', viewItem.teacher],
                ['Room', viewItem.room],
                ['Class type', viewItem.type.toUpperCase()],
              ].map(([label, value]) => (
                <View key={label} style={styles.viewDetailRow}>
                  <Text style={styles.viewDetailLabel}>{label}</Text>
                  <Text style={styles.viewDetailValue}>{value}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={() => { const item = viewItem; setViewItem(null); openEditClass(item); }}>
                <MaterialCommunityIcons name="pencil-outline" size={17} color="#FFFFFF" />
                <Text style={styles.modalPrimaryText}>Edit Class</Text>
              </TouchableOpacity>
            </>}
          </View>
        </View>
      </Modal>

      <Modal visible={!!editItem} transparent animationType="slide" onRequestClose={() => setEditItem(null)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.editModalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Class</Text>
                <TouchableOpacity onPress={() => setEditItem(null)} style={styles.modalClose}>
                  <MaterialCommunityIcons name="close" size={22} color="#667085" />
                </TouchableOpacity>
              </View>
              {editItem && <>
                <Text style={styles.modalSubtext}>{editItem.subject} · {editItem.batch}</Text>
                <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                <TextInput value={editDate} onChangeText={setEditDate} placeholder="2026-10-12" style={styles.editInput} autoCapitalize="none" />
                <View style={styles.editInputRow}>
                  <View style={styles.editInputHalf}>
                    <Text style={styles.inputLabel}>Start time</Text>
                    <TextInput value={editStartTime} onChangeText={setEditStartTime} placeholder="09:00 AM" style={styles.editInput} />
                  </View>
                  <View style={styles.editInputHalf}>
                    <Text style={styles.inputLabel}>End time</Text>
                    <TextInput value={editEndTime} onChangeText={setEditEndTime} placeholder="10:00 AM" style={styles.editInput} />
                  </View>
                </View>
                <Text style={styles.inputLabel}>Room</Text>
                <TextInput value={editRoom} onChangeText={setEditRoom} placeholder="Room 101" style={styles.editInput} />
                <Text style={styles.inputLabel}>Class type</Text>
                <View style={styles.typeSelector}>
                  {(['lecture', 'lab', 'exam'] as const).map((type) => (
                    <TouchableOpacity key={type} style={[styles.typeOption, editType === type && styles.typeOptionActive]} onPress={() => setEditType(type)}>
                      <Text style={[styles.typeOptionText, editType === type && styles.typeOptionTextActive]}>{type === 'lab' ? 'Lab' : type === 'exam' ? 'Exam' : 'Lecture'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.modalPrimaryButton, savingEdit && styles.disabledButton]} disabled={savingEdit} onPress={() => void saveEditedClass()}>
                  {savingEdit ? <ActivityIndicator color="#FFFFFF" /> : <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />}
                  <Text style={styles.modalPrimaryText}>{savingEdit ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setEditItem(null)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>}
            </View>
          </ScrollView>
        </View>
      </Modal>

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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },



  summaryGridDesktop: {

    flexDirection: 'row',

    justifyContent: 'space-between',

  },



  summaryCardWrapper: {
    width: '48.5%',
  },



  summaryCardWrapperDesktop: {

    width: '24%',

  },



  summaryCard: {

    minHeight: 88,

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    padding: 11,

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

    fontSize: 10,

    lineHeight: 15,

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

    fontSize: 15,

    lineHeight: 19,

    color: '#202A3A',

  },



  weekSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    lineHeight: 15,

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

    fontSize: 10,

    lineHeight: 15,

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

    width: 72,

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
    flexShrink: 1,
    fontFamily: 'PoppinsSemiBold',

    fontSize: 11.5,

    lineHeight: 17,

    color: '#263247',

  },



  batchRow: {
    flexDirection: 'row',
    minWidth: 0,

    alignItems: 'center',

    marginTop: 2,

  },



  batchText: {
    flex: 1,
    flexShrink: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 15,
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
    flexShrink: 1,

    alignItems: 'center',

    marginRight: 18,

    marginBottom: 5,

  },



  detailText: {
    flexShrink: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 15,
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

    fontSize: 8,

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
    width: 66,

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


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.48)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },
  editModalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: '#202A3A',
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubject: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    lineHeight: 23,
    color: '#263247',
  },
  modalSubtext: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    lineHeight: 18,
    color: '#7A8699',
    marginBottom: 12,
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
    gap: 12,
  },
  viewDetailLabel: {
    width: 88,
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#7A8699',
  },
  viewDetailValue: {
    flex: 1,
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    lineHeight: 18,
    color: '#263247',
  },
  modalPrimaryButton: {
    minHeight: 46,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  modalPrimaryText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  modalCancelButton: {
    minHeight: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  modalCancelText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#667085',
  },
  inputLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#475467',
    marginTop: 10,
    marginBottom: 5,
  },
  editInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#E2E6EE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#263247',
    backgroundColor: '#FFFFFF',
  },
  editInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editInputHalf: {
    flex: 1,
    minWidth: 0,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  typeOption: {
    flex: 1,
    minHeight: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E2E6EE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeOptionActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },
  typeOptionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#667085',
  },
  typeOptionTextActive: {
    color: '#7040D5',
  },
  disabledButton: {
    opacity: 0.65,
  },

  menuModalCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  menuOption: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
    gap: 11,
  },
  menuOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDeleteIcon: {
    backgroundColor: '#FEF3F2',
  },
  menuOptionText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#344054',
  },
  menuDeleteText: {
    color: '#D92D20',
  },
  menuCancelButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#F7F8FC',
    borderRadius: 10,
  },

});