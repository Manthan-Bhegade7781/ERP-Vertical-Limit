import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import QuickAction from './QuickAction';

type QuickActionsSectionProps = {
  onAttendancePress?: () => void;
  onLectureLogPress?: () => void;
  onBatchesPress?: () => void;
  onReportsPress?: () => void;
};

export default function QuickActionsSection({
  onAttendancePress,
  onLectureLogPress,
  onBatchesPress,
  onReportsPress,
}: QuickActionsSectionProps) {
  return (
    <View style={styles.section}>

      <Text style={styles.title}>
        Quick Actions
      </Text>

      <View style={styles.row}>

        <QuickAction
          icon="person-add-outline"
          label={"Mark \nAttendance"}
          color="#6630D7"
          background="#EEE7FF"
          onPress={onAttendancePress}
        />

        <QuickAction
          icon="document-text-outline"
          label={"Add \nLecture Log"}
          color="#22A55A"
          background="#E3F7EB"
          onPress={onLectureLogPress}
        />

        <QuickAction
          icon="people-outline"
          label="Upload Marks"
          color="#1670E8"
          background="#E6F0FF"
          onPress={onBatchesPress}
        />

        <QuickAction
          icon="bar-chart-outline"
          label="View Reports"
          color="#F28A17"
          background="#FFF0DF"
          onPress={onReportsPress}
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
    marginBottom: 16,
  },

  title: {
    color: '#111528',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },

  row: {
    flexDirection: 'row',

    marginTop: 16,

    gap: 8,
  },
});