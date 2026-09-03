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
import ProfilePage from './Profile/ProfilePage';

type TabName =
  | 'home'
  | 'batches'
  | 'students'
  | 'profile';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] =
    useState<TabName>('home');

  /*
   * Profile data
   *
   * Temporary local state for the profile UI.
   * This can later be connected to the backend.
   */
  const [profileName, setProfileName] =
    useState('Priya Sharma');

  const [profileEmail, setProfileEmail] =
    useState('priya.sharma@example.com');

  const [profilePhone, setProfilePhone] =
    useState('+91 98765 43210');

  const bottomNavHeight =
    82 + insets.bottom;

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
  };

  const handleSaveProfile = (
    name: string,
    email: string,
    phone: string,
  ) => {
    setProfileName(name);
    setProfileEmail(email);
    setProfilePhone(phone);

    console.log('PROFILE SAVED:', {
      name,
      email,
      phone,
    });
  };

  return (
    <View style={styles.container}>
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

      {/* Home */}
      {activeTab === 'home' && (
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

      {/* Profile */}
      {activeTab === 'profile' && (
        <View style={styles.profileContainer}>
          <ProfilePage
            name={profileName}
            email={profileEmail}
            phone={profilePhone}
            onSaveProfile={
              handleSaveProfile
            }
          />
        </View>
      )}

      {/* Batches */}
      {activeTab === 'batches' && (
        <View
          style={styles.placeholderContainer}
        />
      )}

      {/* Students */}
      {activeTab === 'students' && (
        <View
          style={styles.placeholderContainer}
        />
      )}

      {/* Fixed Bottom Navigation */}
      <View
        style={[
          styles.bottomNavWrapper,
          {
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <TeacherBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAddPress={() => {
            console.log('Add pressed');
          }}
        />
      </View>
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

  profileContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  placeholderContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  bottomNavWrapper: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: '#FFFFFF',

    zIndex: 999,
    elevation: 30,

    borderTopWidth: 1,
    borderTopColor: '#E6E6EA',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: -2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 6,
  },
});