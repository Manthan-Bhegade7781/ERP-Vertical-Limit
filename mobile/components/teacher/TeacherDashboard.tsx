import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TeacherHeader from './TeacherHeader';
import TeacherBottomNav from './TeacherBottomNav';

import OverviewSection from './Overview/OverviewSection';
import ScheduleSection from './Schedule/ScheduleSection';
import QuickActionsSection from './QuickActions/QuickActionsSection';
import AnnouncementsSection from './Announcements/AnnouncementsSection';

type TabName = 'home' | 'batches' | 'students' | 'profile';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] =
    useState<TabName>('home');

  const bottomNavHeight = 74 + insets.bottom;

  return (
    <View style={styles.container}>

      {/* Header */}
      <TeacherHeader
        onMenuPress={() => {
          console.log('Menu pressed');
        }}
        onProfilePress={() => {
          setActiveTab('profile');
        }}
      />

      {/* Main scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: bottomNavHeight + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <OverviewSection />

        <ScheduleSection
          onViewAllPress={() => {
            console.log('View All Schedule pressed');
          }}
        />

        <QuickActionsSection
          onAttendancePress={() => {
            console.log('Mark Attendance pressed');
          }}
          onLectureLogPress={() => {
            console.log('Add Lecture Log pressed');
          }}
          onBatchesPress={() => {
            setActiveTab('batches');
          }}
          onReportsPress={() => {
            console.log('View Reports pressed');
          }}
        />

        <AnnouncementsSection
          onViewAllPress={() => {
            console.log('View All Announcements pressed');
          }}
        />
      </ScrollView>

      {/* Fixed bottom navigation */}
      <TeacherBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddPress={() => {
          console.log('Add pressed');
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FA',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
});