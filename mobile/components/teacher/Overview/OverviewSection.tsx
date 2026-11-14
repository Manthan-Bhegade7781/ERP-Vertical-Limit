import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

type OverviewSectionProps = {
  onAttendancePress?: () => void;
  onBatchesPress?: () => void;
  onStudentsPress?: () => void;
  onLectureLogPress?: () => void;
};

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

export default function OverviewSection({
  onAttendancePress,
  onBatchesPress,
  onStudentsPress,
  onLectureLogPress,
}: OverviewSectionProps) {
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
        console.error('OVERVIEW TIMETABLE ERROR:', results[0].reason);
      }

      // ASSIGNED STUDENTS
      if (results[1].status === 'fulfilled') {
        const activeStudents = results[1].value.filter(
          (student) => student.status !== 'inactive'
        );
        setTotalStudents(activeStudents.length);
      } else {
        setTotalStudents(null);
        console.error('OVERVIEW STUDENTS ERROR:', results[1].reason);
      }

      // TODAY'S ATTENDANCE
      if (results[2].status === 'fulfilled') {
        const attendanceRecords = results[2].value;

        if (attendanceRecords.length === 0) {
          setAttendancePercentage(null);
        } else {
          const presentCount = attendanceRecords.filter(
            (record) =>
              record.status === 'Present' || record.status === 'Late'
          ).length;

          const percentage = Math.round(
            (presentCount / attendanceRecords.length) * 100
          );
          setAttendancePercentage(percentage);
        }
      } else {
        setAttendancePercentage(null);
        console.error('OVERVIEW ATTENDANCE ERROR:', results[2].reason);
      }

      if (results.every((result) => result.status === 'rejected')) {
        setError('Unable to load dashboard data. Please try again.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load overview.'
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
    <View style={styles.section}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            isSmallScreen && styles.smallTitle,
          ]}
          numberOfLines={1}
        >
          Today's Overview
        </Text>

        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={isSmallScreen ? 15 : 17}
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

      {/* 2X2 DASHBOARD GRID (MATCHES STUDENT OVERVIEW) */}
      {!loading && error === '' && (
        <View style={styles.grid}>
          {/* ATTENDANCE */}
          <OverviewCard
            icon="checkmark-circle-outline"
            iconColor="#6630D7"
            background="#EEE7FF"
            title="My Attendance"
            value={
              attendancePercentage !== null
                ? `${attendancePercentage}%`
                : '—'
            }
            subtitle={
              attendancePercentage !== null
                ? 'Marked Today'
                : 'No attendance data'
            }
            onPress={onAttendancePress}
          />

          {/* CLASSES */}
          <OverviewCard
            icon="calendar-outline"
            iconColor="#1670E8"
            background="#E6F0FF"
            title="Classes Today"
            value={String(totalClasses)}
            subtitle="Scheduled Classes"
            onPress={onBatchesPress}
          />

          {/* STUDENTS */}
          <OverviewCard
            icon="people-outline"
            iconColor="#22A55A"
            background="#E3F7EB"
            title="My Students"
            value={
              totalStudents !== null
                ? String(totalStudents)
                : '—'
            }
            subtitle="Active Students"
            onPress={onStudentsPress}
          />

          {/* LECTURES */}
          <OverviewCard
            icon="document-text-outline"
            iconColor="#F28A17"
            background="#FFF0DF"
            title="Lectures Today"
            value={String(totalLectures)}
            subtitle="Scheduled Lectures"
            onPress={onLectureLogPress}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  title: {
    flex: 1,
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    lineHeight: 26,
    includeFontPadding: false,
    marginRight: 8,
  },

  smallTitle: {
    fontSize: 16,
    lineHeight: 22,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    gap: 5,
  },

  date: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    lineHeight: 16,
    includeFontPadding: false,
  },

  smallDate: {
    fontSize: 11,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  messageContainer: {
    minHeight: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
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
