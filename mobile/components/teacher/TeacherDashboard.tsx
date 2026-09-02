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

type TabName = 'home' | 'batches' | 'students' | 'profile';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] =
    useState<TabName>('home');

  /* =====================================================
     PROFILE DATA
  ===================================================== */

  const [profileName, setProfileName] =
    useState('Priya Sharma');

  const [profileEmail, setProfileEmail] =
    useState('priya.sharma@example.com');

  const [profilePhone, setProfilePhone] =
    useState('+91 98765 43210');


  /* =====================================================
     BOTTOM NAV HEIGHT
  ===================================================== */

  const bottomNavHeight =
    82 + insets.bottom;


  /* =====================================================
     TAB CHANGE
  ===================================================== */

  const handleTabChange = (tab: TabName) => {
    console.log('TAB CHANGED:', tab);

    setActiveTab(tab);
  };


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

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


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <View style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <TeacherHeader
        onMenuPress={() => {
          console.log('Menu pressed');
        }}

        onNotificationPress={() => {
          console.log('Notifications pressed');
        }}

        onProfilePress={() => {
          console.log('HEADER PROFILE PRESSED');

          setActiveTab('profile');
        }}
      />


      {/* =====================================================
          HOME
      ===================================================== */}

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


      {/* =====================================================
          PROFILE
      ===================================================== */}

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


      {/* =====================================================
          BATCHES
      ===================================================== */}

      {activeTab === 'batches' && (
        <View
          style={styles.placeholderContainer}
        >
          {/* Batches page coming soon */}
        </View>
      )}


      {/* =====================================================
          STUDENTS
      ===================================================== */}

      {activeTab === 'students' && (
        <View
          style={styles.placeholderContainer}
        >
          {/* Students page coming soon */}
        </View>
      )}


      {/* =====================================================
          FIXED BOTTOM NAVIGATION
      ===================================================== */}

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

          onTabChange={
            handleTabChange
          }

          onAddPress={() => {
            console.log('Add pressed');
          }}
        />

      </View>

    </View>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F7FA',
  },


  /* =======================================================
     HOME
  ======================================================= */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },


  /* =======================================================
     PROFILE
  ======================================================= */

  profileContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },


  /* =======================================================
     TEMPORARY TABS
  ======================================================= */

  placeholderContainer: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },


  /* =======================================================
     BOTTOM NAV
  ======================================================= */

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