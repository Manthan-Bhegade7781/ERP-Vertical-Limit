import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import OverviewCard from './OverviewCard';

import {
  fetchTeacherTimetable,
  TeacherTimetable,
} from '@/services/timetable';

import {
  fetchTeacherAssignedStudents,
} from '@/services/students';

import {
  fetchAttendanceRecords,
} from '@/services/attendance';

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getFormattedDate = () => {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function OverviewSection() {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 380;

  const [timetable, setTimetable] =
    useState<TeacherTimetable | null>(null);

  const [totalStudents, setTotalStudents] = useState<number | null>(null);

  const [attendancePercentage, setAttendancePercentage] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');

    const today = getTodayDate();

    try {
      const results = await Promise.allSettled([
        fetchTeacherTimetable(today),
        fetchTeacherAssignedStudents(),
        fetchAttendanceRecords({ date: today }),
      ]);

      // TIMETABLE
      if (results[0].status === 'fulfilled') {
        setTimetable(results[0].value);
      } else {
        setTimetable(null);

        console.error(
          'OVERVIEW TIMETABLE ERROR:',
          results[0].reason,
        );
      }

      // ASSIGNED STUDENTS
      if (results[1].status === 'fulfilled') {
        const activeStudents = results[1].value.filter(
          (student) => student.status !== 'inactive',
        );

        setTotalStudents(activeStudents.length);
      } else {
        setTotalStudents(null);

        console.error(
          'OVERVIEW STUDENTS ERROR:',
          results[1].reason,
        );
      }

      // TODAY'S ATTENDANCE
      if (results[2].status === 'fulfilled') {
        const attendanceRecords = results[2].value;

        if (attendanceRecords.length === 0) {
          setAttendancePercentage(null);
        } else {
          const presentCount = attendanceRecords.filter(
            (record) =>
              record.status === 'Present' ||
              record.status === 'Late',
          ).length;

          const percentage = Math.round(
            (presentCount / attendanceRecords.length) * 100,
          );

          setAttendancePercentage(percentage);
        }
      } else {
        setAttendancePercentage(null);

        console.error(
          'OVERVIEW ATTENDANCE ERROR:',
          results[2].reason,
        );
      }

      if (
        results.every((result) => result.status === 'rejected')
      ) {
        setError('Unable to load dashboard data. Please try again.');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load overview.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const totalClasses = timetable?.summary?.totalClasses ?? 0;

  const totalLectures = timetable?.summary?.lectures ?? 0;

  const date = getFormattedDate();

  return (
    <View
      style={[
        styles.section,
        isSmallScreen && styles.smallSection,
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            isSmallScreen && styles.smallTitle,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Today's Overview
        </Text>

        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={isSmallScreen ? 18 : 20}
            color="#5420D8"
          />

          <Text
            style={[
              styles.date,
              isSmallScreen && styles.smallDate,
            ]}
            numberOfLines={1}
          >
            {date}
          </Text>
        </View>
      </View>

      {/* LOADING */}
      {loading && (
        <View style={styles.messageContainer}>
          <ActivityIndicator color="#5420D8" />

          <Text style={styles.message}>
            Loading today's overview...
          </Text>
        </View>
      )}

      {/* ERROR */}
      {!loading && error !== '' && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      {/* DASHBOARD CARDS */}
      {!loading && error === '' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {/* ATTENDANCE */}
          <OverviewCard
            icon="calendar-outline"
            iconColor="#6630D7"
            iconBackground="#EEE7FF"
            title={'My\nAttendance'}
            value={
              attendancePercentage !== null
                ? `${attendancePercentage}%`
                : '—'
            }
            subtitle={
              attendancePercentage !== null
                ? "Today's marked attendance"
                : 'No attendance data'
            }
          />

          {/* CLASSES */}
          <OverviewCard
            icon="people-outline"
            iconColor="#1670E8"
            iconBackground="#E6F0FF"
            title="Classes Today"
            value={String(totalClasses)}
            subtitle="Scheduled Classes"
          />

          {/* STUDENTS */}
          <OverviewCard
            icon="people-outline"
            iconColor="#22A55A"
            iconBackground="#E3F7EB"
            title="Students"
            value={
              totalStudents !== null
                ? String(totalStudents)
                : '—'
            }
            subtitle="Assigned Students"
          />

          {/* LECTURES */}
          <OverviewCard
            icon="calendar-outline"
            iconColor="#F28A17"
            iconBackground="#FFF0DF"
            title="Lectures Today"
            value={String(totalLectures)}
            subtitle="Scheduled Lectures"
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingTop: 17,
    paddingHorizontal: 12,
    paddingBottom: 14,
    marginBottom: 16,
  },

  smallSection: {
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 1,
  },

  title: {
    flex: 1,
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    lineHeight: 30,
    marginRight: 8,
    includeFontPadding: false,
  },

  smallTitle: {
    fontSize: 20,
    lineHeight: 25,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },

  date: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13.5,
    lineHeight: 19,
    marginLeft: 5,
    includeFontPadding: false,
  },

  smallDate: {
    fontSize: 11.5,
  },

  cardsContainer: {
    paddingRight: 4,
    gap: 8,
  },

  messageContainer: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  message: {
    fontFamily: 'PoppinsRegular',
    color: '#5B6272',
    fontSize: 13,
  },

  errorText: {
    fontFamily: 'PoppinsRegular',
    color: '#D93025',
    fontSize: 13,
    textAlign: 'center',
  },
});