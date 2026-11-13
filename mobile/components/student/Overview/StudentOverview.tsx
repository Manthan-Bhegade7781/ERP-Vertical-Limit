import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import OverviewCard from './OverviewCard';
import NextClassCard from './NextClassCard';
import TodaySchedule, { Schedule } from './TodaySchedule';
import { getTimetable, TimetableEntry } from '@/services/timetable';
import { getMyClasses, StudentClassesData } from '../../../services/classes';

type StudentOverviewProps = {
  attendancePercentage?: number | string;
  pendingFees?: number | string;
  pendingAssignmentsCount?: number;
  onAttendancePress?: () => void;
  onClassesPress?: () => void;
  onFeesPress?: () => void;
  onTestsPress?: () => void;
  onTimetablePress?: () => void;
  onAssignmentsPress?: () => void;
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

export default function StudentOverview({
  attendancePercentage,
  pendingFees,
  pendingAssignmentsCount,
  onAttendancePress,
  onClassesPress,
  onFeesPress,
  onTestsPress,
  onTimetablePress,
  onAssignmentsPress,
}: StudentOverviewProps) {
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);
  const [batchName, setBatchName] = useState<string>('');

  const fetchTodayData = useCallback(async () => {
    try {
      setLoadingSchedule(true);
      const today = new Date();
      const todayDateStr = today.toISOString().split('T')[0];

      // Fetch today's timetable and batch info in parallel
      const [timetableRes, classesRes] = await Promise.allSettled([
        getTimetable({ date: todayDateStr }),
        getMyClasses(),
      ]);

      let enrolledBatchName = '';
      if (classesRes.status === 'fulfilled' && classesRes.value.currentBatch) {
        enrolledBatchName = classesRes.value.currentBatch.name || '';
        setBatchName(enrolledBatchName);
      }

      if (
        timetableRes.status === 'fulfilled' &&
        timetableRes.value.success &&
        Array.isArray(timetableRes.value.data)
      ) {
        const rawEntries: TimetableEntry[] = timetableRes.value.data;

        // Filter and sort entries by startTime
        const sorted = [...rawEntries].sort((a, b) =>
          (a.startTime || '').localeCompare(b.startTime || '')
        );

        const mapped: Schedule[] = sorted.map((entry, idx) => {
          const subjectName = entry.batchSubjectId?.subjectId?.name || 'Class';
          const teacherName =
            entry.batchSubjectId?.teacherId?.fullName || 'Assigned Teacher';
          const bName =
            entry.batchSubjectId?.batchId?.name || enrolledBatchName || 'Batch';
          const style = getSubjectStyle(subjectName, idx);

          return {
            time: formatTime(entry.startTime),
            subject: subjectName,
            batch: bName,
            room: entry.room || 'Room 101',
            teacher: teacherName,
            icon: style.icon,
            iconColor: style.color,
            background: style.background,
            rawStartTime: entry.startTime,
            rawEndTime: entry.endTime,
          };
        });

        setTodaySchedules(mapped);
      } else {
        setTodaySchedules([]);
      }
    } catch (err) {
      console.error('Failed to load overview today data:', err);
      setTodaySchedules([]);
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  useEffect(() => {
    void fetchTodayData();
  }, [fetchTodayData]);

  useFocusEffect(
    useCallback(() => {
      void fetchTodayData();
    }, [fetchTodayData])
  );

  // Compute Next Class
  const nextClass = useMemo(() => {
    if (!todaySchedules || todaySchedules.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Find first class ending in the future, or first upcoming class
    const upcoming = todaySchedules.find((item) => {
      if (!item.rawEndTime) return true;
      const [h, m] = item.rawEndTime.split(':').map(Number);
      return h * 60 + (m || 0) > currentMinutes;
    });

    return upcoming || null;
  }, [todaySchedules]);

  // Compute Next Class minutes or label for the OverviewCard
  const nextClassSubtitle = useMemo(() => {
    if (loadingSchedule) return 'Checking...';
    if (!nextClass) return 'No more today';

    if (nextClass.rawStartTime) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [h, m] = nextClass.rawStartTime.split(':').map(Number);
      const classStartMinutes = h * 60 + (m || 0);
      const diff = classStartMinutes - currentMinutes;

      if (diff > 0 && diff < 60) {
        return `In ${diff} min${diff === 1 ? '' : 's'}`;
      }
      if (diff >= 60) {
        const hrs = Math.floor(diff / 60);
        return `In ${hrs} hr${hrs === 1 ? '' : 's'}`;
      }
      if (diff <= 0) {
        return 'In progress';
      }
    }

    return nextClass.time || 'Today';
  }, [nextClass, loadingSchedule]);

  const attendanceDisplay =
    attendancePercentage !== undefined ? `${attendancePercentage}%` : '0%';

  const feesDisplay =
    pendingFees !== undefined
      ? typeof pendingFees === 'number'
        ? `₹${pendingFees.toLocaleString('en-IN')}`
        : String(pendingFees)
      : '₹0';

  const feesSubtitle =
    pendingFees === 0 || pendingFees === '0' || pendingFees === '₹0'
      ? 'No Dues'
      : 'View details';

  return (
    <View>
      <View style={styles.grid}>
        <OverviewCard
          icon="checkmark-circle-outline"
          iconColor="#6630D7"
          background="#EEE7FF"
          title="Attendance"
          value={attendanceDisplay}
          subtitle="Overall"
          onPress={onAttendancePress}
        />

        <OverviewCard
          icon="calendar-outline"
          iconColor="#1670E8"
          background="#E6F0FF"
          title="Next Class"
          value={loadingSchedule ? 'Loading...' : nextClass ? nextClass.subject : 'None'}
          subtitle={nextClassSubtitle}
          onPress={onClassesPress || onTimetablePress}
        />

        <OverviewCard
          icon="document-text-outline"
          iconColor="#22A55A"
          background="#E3F7EB"
          title="Pending Work"
          value={
            pendingAssignmentsCount !== undefined
              ? String(pendingAssignmentsCount)
              : '0'
          }
          subtitle={
            pendingAssignmentsCount === 1 ? 'Assignment' : 'Assignments'
          }
          onPress={onAssignmentsPress || onTestsPress}
        />

        <OverviewCard
          icon="wallet-outline"
          iconColor="#F28A17"
          background="#FFF0DF"
          title="Fees Due"
          value={feesDisplay}
          subtitle={feesSubtitle}
          onPress={onFeesPress}
        />
      </View>

      <NextClassCard
        subject={nextClass?.subject}
        batch={nextClass?.batch || batchName}
        teacher={nextClass?.teacher}
        time={nextClass?.time}
        room={nextClass?.room}
        loading={loadingSchedule}
        onPress={onClassesPress || onTimetablePress}
      />

      <TodaySchedule
        schedules={todaySchedules}
        loading={loadingSchedule}
        onViewTimetable={onTimetablePress}
        onClassPress={() => (onClassesPress ? onClassesPress() : onTimetablePress?.())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 13,
  },
});
