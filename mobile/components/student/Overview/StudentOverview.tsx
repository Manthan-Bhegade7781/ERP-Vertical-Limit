import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import OverviewCard from './OverviewCard';
import NextClassCard from './NextClassCard';
import TodaySchedule from './TodaySchedule';

type StudentOverviewProps = {
  onAttendancePress?: () => void;
  onClassesPress?: () => void;
  onFeesPress?: () => void;
  onTestsPress?: () => void;
  onTimetablePress?: () => void;
};

export default function StudentOverview({
  onAttendancePress,
  onClassesPress,
  onFeesPress,
  onTestsPress,
  onTimetablePress,
}: StudentOverviewProps) {
  return (
    <View>
      <View style={styles.grid}>
        <OverviewCard
          icon="checkmark-circle-outline"
          iconColor="#6630D7"
          background="#EEE7FF"
          title="Attendance"
          value="92%"
          subtitle="Overall"
          onPress={onAttendancePress}
        />

        <OverviewCard
          icon="calendar-outline"
          iconColor="#1670E8"
          background="#E6F0FF"
          title="Next Class"
          value="Physics"
          subtitle="In 18 mins"
          onPress={onClassesPress}
        />

        <OverviewCard
          icon="document-text-outline"
          iconColor="#22A55A"
          background="#E3F7EB"
          title="Pending Work"
          value="1"
          subtitle="Assignment"
          onPress={onTestsPress}
        />

        <OverviewCard
          icon="wallet-outline"
          iconColor="#F28A17"
          background="#FFF0DF"
          title="Fees Due"
          value="₹2,000"
          subtitle="View details"
          onPress={onFeesPress}
        />
      </View>

      <NextClassCard
        subject="Physics"
        batch="10th Standard A"
        teacher="Priya Sharma"
        time="10:00 AM"
        room="Room 101"
        onPress={onClassesPress}
      />

      <TodaySchedule
        onViewTimetable={onTimetablePress}
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
  },
});