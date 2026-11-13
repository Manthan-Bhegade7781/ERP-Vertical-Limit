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
  onAnnouncementsPress?: () => void;
  onCalendarPress?: () => void;
  onFeedbackPress?: () => void;
  onPTGPress?: () => void;
  onMessagesPress?: () => void;
  onHelpPress?: () => void;
};

export default function QuickAccessSection({
  onClassesPress,
  onAttendancePress,
  onLectureNotesPress,
  onTestsPress,
  onAnnouncementsPress,
  onCalendarPress,
  onFeedbackPress,
  onPTGPress,
  onMessagesPress,
  onHelpPress,
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

        <QuickAccessCard
          icon="megaphone-outline"
          label="Announcements"
          color="#8B5CF6"
          background="#F4F0FF"
          onPress={onAnnouncementsPress}
        />

        <QuickAccessCard
          icon="calendar-outline"
          label="Academic Calendar"
          color="#E11D48"
          background="#FFE4E6"
          onPress={onCalendarPress}
        />

        <QuickAccessCard
          icon="chatbubbles-outline"
          label="Feedback"
          color="#0284C7"
          background="#E0F2FE"
          onPress={onFeedbackPress}
        />

        <QuickAccessCard
          icon="people-circle-outline"
          label="PTG Meetings"
          color="#6630D7"
          background="#EEE7FF"
          onPress={onPTGPress}
        />

        <QuickAccessCard
          icon="mail-outline"
          label="Messages"
          color="#0EA5E9"
          background="#E0F2FE"
          onPress={onMessagesPress}
        />

        <QuickAccessCard
          icon="help-circle-outline"
          label="Help & Support"
          color="#059669"
          background="#D1FAE5"
          onPress={onHelpPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 9,
    paddingLeft: 16,
    paddingTop: 14,
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
    gap: 5,
  },
});