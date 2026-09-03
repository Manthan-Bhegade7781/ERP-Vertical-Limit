import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TeacherHeader from './TeacherHeader';
import TeacherBottomNav from './TeacherBottomNav';
import TeacherProfile from './TeacherProfile';

import OverviewSection from './Overview/OverviewSection';
import ScheduleSection from './Schedule/ScheduleSection';
import QuickActionsSection from './QuickActions/QuickActionsSection';
import AnnouncementsSection from './Announcements/AnnouncementsSection';

type TabName = 'home' | 'batches' | 'students' | 'profile';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] =
    useState<TabName>('home');

  const bottomNavHeight =
    82 + insets.bottom;

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>

      {/* Fixed Header */}
      <TeacherHeader
        onMenuPress={() => {
          console.log('Menu pressed');
        }}
        onNotificationPress={() => {
          console.log('Notifications pressed');
        }}
        onProfilePress={() => {
          setActiveTab('profile');
        }}
      />

      {/* Main Content */}
      {activeTab === 'profile' ? (
        <TeacherProfile />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                bottomNavHeight + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <OverviewSection />

          <ScheduleSection
            onViewAllPress={() => {
              console.log(
                'View All Schedule pressed'
              );
            }}
          />

          <QuickActionsSection
            onAttendancePress={() => {
              console.log(
                'Mark Attendance pressed'
              );
            }}
            onLectureLogPress={() => {
              console.log(
                'Add Lecture Log pressed'
              );
            }}
            onBatchesPress={() => {
              setActiveTab('batches');
            }}
            onReportsPress={() => {
              console.log(
                'View Reports pressed'
              );
            }}
          />

          <AnnouncementsSection
            onViewAllPress={() => {
              console.log(
                'View All Announcements pressed'
              );
            }}
          />
        </ScrollView>
      )}

      {/* Fixed Bottom Navigation */}
      <TeacherBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
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