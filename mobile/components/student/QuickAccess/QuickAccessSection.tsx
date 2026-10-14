import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import QuickAccessCard from './QuickAccessCard';

type QuickAccessSectionProps = {
  onClassesPress?: () => void;
  onAttendancePress?: () => void;
  onLectureNotesPress?: () => void;
  onTestsPress?: () => void;
};

export default function QuickAccessSection({
  onClassesPress,
  onAttendancePress,
  onLectureNotesPress,
  onTestsPress,
}: QuickAccessSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>
        Quick Access
      </Text>

      <View style={styles.grid}>
        <QuickAccessCard
          icon="people-outline"
          label="My Classes"
          color="#1670E8"
          background="#E6F0FF"
          onPress={onClassesPress}
        />

        <QuickAccessCard
          icon="checkmark-circle-outline"
          label="My Attendance"
          color="#6630D7"
          background="#EEE7FF"
          onPress={onAttendancePress}
        />

        <QuickAccessCard
          icon="book-outline"
          label="Lecture Notes"
          color="#22A55A"
          background="#E3F7EB"
          onPress={onLectureNotesPress}
        />

        <QuickAccessCard
          icon="clipboard-outline"
          label="My Tests & Results"
          color="#F28A17"
          background="#FFF0DF"
          onPress={onTestsPress}
        />
      </View>
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

  title: {
    color: '#111528',
    fontSize: 17,
    fontFamily: 'PoppinsBold',
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});