import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Schedule = {
  time: string;
  subject: string;
  batch: string;
  room: string;
  teacher: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  background: string;
};

type TodayScheduleProps = {
  schedules?: Schedule[];
  onViewTimetable?: () => void;
};

const defaultSchedules: Schedule[] = [
  {
    time: '10:00 AM',
    subject: 'Physics',
    batch: '10th Standard A',
    room: 'Room 101',
    teacher: 'Priya Sharma',
    icon: 'flask-outline',
    iconColor: '#6630D7',
    background: '#EEE7FF',
  },
  {
    time: '02:00 PM',
    subject: 'Mathematics',
    batch: '10th Standard A',
    room: 'Room 102',
    teacher: 'Rahul Sir',
    icon: 'calculator-outline',
    iconColor: '#1670E8',
    background: '#E6F0FF',
  },
];

export default function TodaySchedule({
  schedules = defaultSchedules,
  onViewTimetable,
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

      {schedules.map((schedule, index) => (
        <View
          key={`${schedule.subject}-${schedule.time}-${index}`}
          style={[
            styles.scheduleItem,
            index !== schedules.length - 1 &&
              styles.border,
          ]}
        >
          <Text style={styles.time}>
            {schedule.time}
          </Text>

          <View
            style={[
              styles.iconBox,
              {
                backgroundColor:
                  schedule.background,
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
        </View>
      ))}
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
    marginBottom: 4,
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
    width: 62,
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
});