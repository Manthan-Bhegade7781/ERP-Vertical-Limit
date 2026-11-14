import React from "react";
import { StyleSheet, Text, View } from "react-native";
import QuickAction from "./QuickAction";

type QuickActionsSectionProps = {
  onAttendancePress?: () => void;
  onLectureLogPress?: () => void;
  onBatchesPress?: () => void;
  onStudentsPress?: () => void;
  onReportsPress?: () => void;
  onAssignmentsPress?: () => void;
  onExaminationsPress?: () => void;
  onPTGPress?: () => void;
  onCalendarPress?: () => void;
  onMyLeavePress?: () => void;
  onMessagesPress?: () => void;
  onFeedbackPress?: () => void;
};

export default function QuickActionsSection({
  onAttendancePress,
  onLectureLogPress,
  onBatchesPress,
  onStudentsPress,
  onReportsPress,
  onAssignmentsPress,
  onExaminationsPress,
  onPTGPress,
  onCalendarPress,
  onMyLeavePress,
  onMessagesPress,
  onFeedbackPress,
}: QuickActionsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Quick Access</Text>

      <View style={styles.grid}>
        <QuickAction
          icon="checkmark-circle-outline"
          label="Mark Attendance"
          color="#6630D7"
          background="#EEE7FF"
          onPress={onAttendancePress}
        />

        <QuickAction
          icon="document-text-outline"
          label="Add Lecture Log"
          color="#22A55A"
          background="#E3F7EB"
          onPress={onLectureLogPress}
        />

        <QuickAction
          icon="people-outline"
          label="My Batches"
          color="#1670E8"
          background="#E6F0FF"
          onPress={onBatchesPress}
        />

        <QuickAction
          icon="person-outline"
          label="My Students"
          color="#F28A17"
          background="#FFF0DF"
          onPress={onStudentsPress}
        />

        <QuickAction
          icon="bar-chart-outline"
          label="View Reports"
          color="#8B5CF6"
          background="#F4F0FF"
          onPress={onReportsPress}
        />

        <QuickAction
          icon="clipboard-outline"
          label="Assignments"
          color="#D97706"
          background="#FEF3C7"
          onPress={onAssignmentsPress}
        />

        <QuickAction
          icon="create-outline"
          label="Examinations"
          color="#2563EB"
          background="#DBEAFE"
          onPress={onExaminationsPress}
        />

        <QuickAction
          icon="calendar-outline"
          label="PTG Schedule"
          color="#059669"
          background="#D1FAE5"
          onPress={onPTGPress}
        />

        <QuickAction
          icon="calendar-number-outline"
          label="Academic Calendar"
          color="#E11D48"
          background="#FFE4E6"
          onPress={onCalendarPress}
        />

        <QuickAction
          icon="time-outline"
          label="My Leave"
          color="#9333EA"
          background="#F3E8FF"
          onPress={onMyLeavePress}
        />

        <QuickAction
          icon="mail-outline"
          label="Messages"
          color="#0284C7"
          background="#E0F2FE"
          onPress={onMessagesPress}
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },

  title: {
    color: "#111528",
    fontSize: 17,
    fontFamily: "PoppinsBold",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
