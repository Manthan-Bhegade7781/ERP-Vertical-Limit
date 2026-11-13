import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Schedule = {
  time: string;
  subject: string;
  batch: string;
  room: string;
  teacher: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  background: string;
  rawStartTime?: string;
  rawEndTime?: string;
};

type TodayScheduleProps = {
  schedules?: Schedule[];
  loading?: boolean;
  onViewTimetable?: () => void;
  onClassPress?: (schedule: Schedule) => void;
};

export default function TodaySchedule({
  schedules = [],
  loading = false,
  onViewTimetable,
  onClassPress,
}: TodayScheduleProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Today's Schedule
        </Text>

        <Pressable
          onPress={onViewTimetable}
          hitSlop={10}
          pressRetentionOffset={10}
          android_ripple={{
            color: '#EEE7FF',
          }}
        >
          <Text style={styles.viewText}>
            View Timetable
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#6630D7" />
          <Text style={styles.loadingText}>Loading today's schedule...</Text>
        </View>
      ) : schedules.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="calendar-outline" size={24} color="#6630D7" />
          </View>
          <Text style={styles.emptyTitle}>No Classes Scheduled Today</Text>
          <Text style={styles.emptySubtitle}>
            Check your weekly timetable to see upcoming classes.
          </Text>
        </View>
      ) : (
        schedules.map((schedule, index) => (
          <Pressable
            key={`${schedule.subject}-${schedule.time}-${index}`}
            style={({ pressed }) => [
              styles.scheduleItem,
              index !== schedules.length - 1 && styles.border,
              pressed && onClassPress && styles.pressed,
            ]}
            onPress={() => onClassPress?.(schedule)}
          >
            <Text style={styles.time}>
              {schedule.time}
            </Text>

            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: schedule.background,
                },
              ]}
            >
              <Ionicons
                name={schedule.icon}
                size={21}
                color={schedule.iconColor}
              />
            </View>

            <View style={styles.content}>
              <Text style={styles.subject}>
                {schedule.subject}
              </Text>

              <Text style={styles.batch}>
                {schedule.batch}
              </Text>

              <Text style={styles.meta}>
                {schedule.room} • {schedule.teacher}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#A2A2AE"
            />
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  title: {
    color: '#111528',
    fontSize: 17,
    fontFamily: 'PoppinsBold',
  },

  viewText: {
    color: '#6630D7',
    fontSize: 10.5,
    fontFamily: 'PoppinsSemiBold',
  },

  loadingBox: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#777784',
    marginTop: 8,
  },

  emptyCard: {
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#171A2B',
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#858592',
    textAlign: 'center',
    marginTop: 2,
  },

  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
  },

  time: {
    width: 66,
    color: '#777784',
    fontSize: 9.5,
    fontFamily: 'PoppinsSemiBold',
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  content: {
    flex: 1,
  },

  subject: {
    color: '#171A2B',
    fontSize: 13,
    fontFamily: 'PoppinsBold',
  },

  batch: {
    color: '#666675',
    fontSize: 10,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  meta: {
    color: '#9A9AA5',
    fontSize: 9.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 1,
  },

  pressed: {
    opacity: 0.7,
  },
});
