import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HORIZONTAL_PADDING = 10;
const CARD_GAP = 6;

const OVERVIEW_CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 8) / 4;

type IconName = keyof typeof Ionicons.glyphMap;

type TabName = 'home' | 'batches' | 'students' | 'profile';

type OverviewCardProps = {
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  title: string;
  value: string;
  subtitle: string;
  extra?: string;
  onPress?: () => void;
};

type ScheduleItemProps = {
  color: string;
  iconBackground: string;
  iconColor: string;
  time: string;
  className: string;
  room: string;
  onPress?: () => void;
};

type QuickActionProps = {
  icon: IconName;
  label: string;
  color: string;
  background: string;
  onPress?: () => void;
};

type BottomNavItemProps = {
  icon: IconName;
  label: string;
  active?: boolean;
  onPress?: () => void;
};

/* =========================================================
   OVERVIEW CARD
========================================================= */

function OverviewCard({
  icon,
  iconColor,
  iconBackground,
  title,
  value,
  subtitle,
  extra,
  onPress,
}: OverviewCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.OverviewCard,
        { width: OVERVIEW_CARD_WIDTH },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.overviewIconCircle,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons name={icon} size={30} color={iconColor} />
      </View>

      <Text
        style={styles.overviewTitle}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.overviewValue,
          value === 'Present' && styles.presentValue,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </Text>

      <Text
        style={styles.overviewSubtitle}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {subtitle}
      </Text>

      {extra ? (
        <Text
          style={styles.overviewExtra}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {extra}
        </Text>
      ) : null}
    </Pressable>
  );
}

/* =========================================================
   SCHEDULE ITEM
========================================================= */

function ScheduleItem({
  color,
  iconBackground,
  iconColor,
  time,
  className,
  room,
  onPress,
}: ScheduleItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.scheduleItem,
        { borderLeftColor: color },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.scheduleIconBox,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons name="book-outline" size={30} color={iconColor} />
      </View>

      <View style={styles.scheduleMiddle}>
        <Text style={styles.scheduleTime}>{time}</Text>

        <Text style={styles.scheduleClass} numberOfLines={1}>
          {className}
        </Text>

        <View style={styles.subjectRow}>
          <Text style={styles.subjectLabel}>Subject: </Text>
          <Text style={styles.subjectValue}>Physics</Text>
        </View>
      </View>

      <View style={styles.scheduleRight}>
        <View style={styles.lectureBadge}>
          <Text style={styles.lectureText}>Lecture</Text>
        </View>

        <View style={styles.roomRow}>
          <Ionicons
            name="location-outline"
            size={18}
            color="#596174"
          />
          <Text style={styles.roomText}>{room}</Text>
        </View>
      </View>
    </Pressable>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  label,
  color,
  background,
  onPress,
}: QuickActionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.quickActionIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons name={icon} size={34} color={color} />
      </View>

      <Text
        style={styles.quickActionLabel}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   BOTTOM NAV ITEM
========================================================= */

function BottomNavItem({
  icon,
  label,
  active = false,
  onPress,
}: BottomNavItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.bottomNavItem,
        active && styles.bottomNavActive,
        pressed && styles.bottomNavPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={27}
        color={active ? '#5420D8' : '#687080'}
      />

      <Text
        style={[
          styles.bottomNavLabel,
          active && styles.bottomNavActiveLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();

  /*
   * This controls which bottom-navigation item
   * currently has the active background.
   */
  const [activeTab, setActiveTab] = useState<TabName>('home');

  const bottomNavHeight = 74 + insets.bottom;

  /* =======================================================
     NAVIGATION HANDLERS
  ======================================================= */

  const handleHome = () => {
    setActiveTab('home');
  };

  const handleBatches = () => {
    setActiveTab('batches');
    console.log('Batches pressed');
  };

  const handleStudents = () => {
    setActiveTab('students');
    console.log('Students pressed');
  };

  const handleProfile = () => {
    setActiveTab('profile');
    console.log('Profile pressed');
  };

  const handleMenu = () => {
    router.push('/modal');
  };

  const handleAdd = () => {
    console.log('Add pressed');
  };

  const handleAttendance = () => {
    console.log('Mark Attendance pressed');
  };

  const handleLectureLog = () => {
    console.log('Add Lecture Log pressed');
  };

  const handleViewBatches = () => {
    console.log('View My Batches pressed');
  };

  const handleReports = () => {
    console.log('View Reports pressed');
  };

  const handleScheduleViewAll = () => {
    console.log('View All Schedule pressed');
  };

  const handleAnnouncementsViewAll = () => {
    console.log('View All Announcements pressed');
  };

  return (
    <View style={styles.root}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <View style={styles.headerTop}>
          {/* MENU */}

          <Pressable
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.headerButtonPressed,
            ]}
            onPress={handleMenu}
          >
            <Ionicons
              name="menu-outline"
              size={35}
              color="#FFFFFF"
            />
          </Pressable>

          {/* TEACHER INFO */}

          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Good Morning, 👋
            </Text>

            <Text style={styles.teacherName}>
              Priya Sharma
            </Text>

            <Text style={styles.teacherRole}>
              Physics Teacher
            </Text>
          </View>

          {/* HEADER RIGHT */}

          <View style={styles.headerRight}>
            <Pressable
              style={({ pressed }) => [
                styles.notificationButton,
                pressed && styles.headerButtonPressed,
              ]}
              onPress={() => {
                console.log('Notifications pressed');
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={31}
                color="#FFFFFF"
              />

              <View style={styles.notificationDot} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.avatar,
                pressed && styles.headerButtonPressed,
              ]}
              onPress={handleProfile}
            >
              <Ionicons
                name="person-outline"
                size={39}
                color="#171B2D"
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* =====================================================
          SCROLLABLE CONTENT
      ===================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: bottomNavHeight + 22,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* =================================================
            OVERVIEW
        ================================================= */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Today's Overview
            </Text>

            <Pressable
              style={({ pressed }) =>
                pressed && styles.smallButtonPressed
              }
              onPress={() => {
                console.log('Date pressed');
              }}
            >
              <View style={styles.dateContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color="#5420D8"
                />

                <Text style={styles.dateText}>
                  22 May 2025
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.overviewRow}>
            <OverviewCard
              icon="calendar-outline"
              iconColor="#6630D7"
              iconBackground="#EEE7FF"
              title="My Attendance"
              value="Present"
              subtitle="Checked in"
              extra="09:15 AM"
              onPress={handleAttendance}
            />

            <OverviewCard
              icon="people-outline"
              iconColor="#1670E8"
              iconBackground="#E6F0FF"
              title="Classes Today"
              value="3"
              subtitle="Total Classes"
              onPress={handleViewBatches}
            />

            <OverviewCard
              icon="people-outline"
              iconColor="#22A55A"
              iconBackground="#E3F7EB"
              title="Students"
              value="68"
              subtitle="Total Students"
              onPress={handleStudents}
            />

            <OverviewCard
              icon="calendar-outline"
              iconColor="#F28A17"
              iconBackground="#FFF0DF"
              title="Lectures Today"
              value="3"
              subtitle="Total Lectures"
              onPress={handleLectureLog}
            />
          </View>
        </View>

        {/* =================================================
            SCHEDULE
        ================================================= */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Today's Schedule
            </Text>

            <Pressable
              style={({ pressed }) =>
                pressed && styles.smallButtonPressed
              }
              onPress={handleScheduleViewAll}
            >
              <Text style={styles.viewAllText}>
                View All
              </Text>
            </Pressable>
          </View>

          <View style={styles.scheduleList}>
            <ScheduleItem
              color="#6630D7"
              iconBackground="#EEE7FF"
              iconColor="#6630D7"
              time="09:30 AM - 10:30 AM"
              className="12th Science A"
              room="Room 101"
              onPress={() => {
                console.log('12th Science A pressed');
              }}
            />

            <ScheduleItem
              color="#1670E8"
              iconBackground="#E6F0FF"
              iconColor="#1670E8"
              time="11:00 AM - 12:00 PM"
              className="11th Science B"
              room="Room 102"
              onPress={() => {
                console.log('11th Science B pressed');
              }}
            />

            <ScheduleItem
              color="#22A55A"
              iconBackground="#E3F7EB"
              iconColor="#22A55A"
              time="02:00 PM - 03:00 PM"
              className="12th Science B"
              room="Room 101"
              onPress={() => {
                console.log('12th Science B pressed');
              }}
            />
          </View>
        </View>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <View style={styles.quickActionsRow}>
            <QuickAction
              icon="person-add-outline"
              label="Mark Attendance"
              color="#6630D7"
              background="#EEE7FF"
              onPress={handleAttendance}
            />

            <QuickAction
              icon="document-text-outline"
              label="Add Lecture Log"
              color="#22A55A"
              background="#E3F7EB"
              onPress={handleLectureLog}
            />

            <QuickAction
              icon="people-outline"
              label="View My Batches"
              color="#1670E8"
              background="#E6F0FF"
              onPress={handleViewBatches}
            />

            <QuickAction
              icon="bar-chart-outline"
              label="View Reports"
              color="#F28A17"
              background="#FFF0DF"
              onPress={handleReports}
            />
          </View>
        </View>

        {/* =================================================
            ANNOUNCEMENTS
        ================================================= */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Announcements
            </Text>

            <Pressable
              style={({ pressed }) =>
                pressed && styles.smallButtonPressed
              }
              onPress={handleAnnouncementsViewAll}
            >
              <Text style={styles.viewAllText}>
                View All
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.announcementCard,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              console.log('Announcement pressed');
            }}
          >
            <View style={styles.announcementIcon}>
              <Ionicons
                name="megaphone-outline"
                size={30}
                color="#6630D7"
              />
            </View>

            <View style={styles.announcementContent}>
              <Text style={styles.announcementTitle}>
                Staff Meeting
              </Text>

              <Text
                style={styles.announcementDescription}
                numberOfLines={2}
              >
                Meeting scheduled on 24 May 2025 at 04:00 PM
              </Text>

              <Text style={styles.announcementMeta}>
                22 May 2025 • Admin
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color="#6630D7"
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* =====================================================
          FIXED BOTTOM NAVIGATION

          activeTab controls which grey/purple box is shown.
      ===================================================== */}

      <View
        style={[
          styles.bottomNav,
          {
            height: bottomNavHeight,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* HOME */}

        <BottomNavItem
          icon="home"
          label="Home"
          active={activeTab === 'home'}
          onPress={handleHome}
        />

        {/* BATCHES */}

        <BottomNavItem
          icon="people-outline"
          label="Batches"
          active={activeTab === 'batches'}
          onPress={handleBatches}
        />

        {/* ADD */}

        <Pressable
          style={({ pressed }) => [
            styles.addButtonContainer,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleAdd}
        >
          <View style={styles.addButton}>
            <Ionicons
              name="add"
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.addButtonLabel}>
            Add
          </Text>
        </Pressable>

        {/* STUDENTS */}

        <BottomNavItem
          icon="school-outline"
          label="Students"
          active={activeTab === 'students'}
          onPress={handleStudents}
        />

        {/* PROFILE */}

        <BottomNavItem
          icon="person-outline"
          label="Profile"
          active={activeTab === 'profile'}
          onPress={handleProfile}
        />
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7FA',
  },

  /* HEADER */

  header: {
    backgroundColor: '#5122C8',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 116,
  },

  menuButton: {
    width: 45,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    paddingLeft: 2,
  },

  greeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 2,
  },

  teacherName: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },

  teacherRole: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 1,
    fontWeight: '400',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 42,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',
    right: 5,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5F',
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  headerButtonPressed: {
    opacity: 0.7,
  },

  /* SCROLL */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 14,
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  /* SECTION */

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#111528',
    fontSize: 21,
    fontWeight: '700',
  },

  viewAllText: {
    color: '#5420D8',
    fontSize: 16,
    fontWeight: '700',
  },

  smallButtonPressed: {
    opacity: 0.55,
  },

  /* OVERVIEW */

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dateText: {
    color: '#5420D8',
    fontSize: 15,
    fontWeight: '600',
  },

  overviewRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },

  OverviewCard: {
    minHeight: 238,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 6,
    paddingBottom: 12,
  },

  overviewIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  overviewTitle: {
    color: '#171A2B',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    marginBottom: 7,
  },

  overviewValue: {
    color: '#111528',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    marginBottom: 7,
  },

  presentValue: {
    color: '#22A55A',
    fontSize: 20,
    lineHeight: 28,
  },

  overviewSubtitle: {
    color: '#454A5A',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    width: '100%',
  },

  overviewExtra: {
    color: '#171A2B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },

  /* SCHEDULE */

  scheduleList: {
    gap: 10,
  },

  scheduleItem: {
    minHeight: 108,
    borderWidth: 1,
    borderColor: '#E4E5EB',
    borderLeftWidth: 4,
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scheduleIconBox: {
    width: 62,
    height: 62,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  scheduleMiddle: {
    flex: 1,
    minWidth: 0,
  },

  scheduleTime: {
    color: '#5B6272',
    fontSize: 14,
    marginBottom: 3,
  },

  scheduleClass: {
    color: '#171A2B',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },

  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectLabel: {
    color: '#5B6272',
    fontSize: 14,
  },

  subjectValue: {
    color: '#5420D8',
    fontSize: 14,
    fontWeight: '600',
  },

  scheduleRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 72,
    marginLeft: 8,
  },

  lectureBadge: {
    backgroundColor: '#F0E9FF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
  },

  lectureText: {
    color: '#5420D8',
    fontSize: 14,
    fontWeight: '700',
  },

  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  roomText: {
    color: '#5B6272',
    fontSize: 13,
  },

  /* QUICK ACTIONS */

  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  quickAction: {
    width: '24%',
    alignItems: 'center',
  },

  quickActionIcon: {
    width: 72,
    height: 68,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  quickActionLabel: {
    color: '#171A2B',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 32,
  },

  /* ANNOUNCEMENTS */

  announcementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FF',
    borderRadius: 14,
    padding: 12,
  },

  announcementIcon: {
    width: 58,
    height: 58,
    borderRadius: 13,
    backgroundColor: '#EDE4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  announcementContent: {
    flex: 1,
    minWidth: 0,
  },

  announcementTitle: {
    color: '#171A2B',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },

  announcementDescription: {
    color: '#303545',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 2,
  },

  announcementMeta: {
    color: '#666C7A',
    fontSize: 12,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6E6EA',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 7,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },

  bottomNavItem: {
    width: '18%',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  /*
   * THIS IS THE ACTIVE GREY/PURPLE BOX.
   * It is now applied according to activeTab.
   */

  bottomNavActive: {
    backgroundColor: '#F0E7FF',
  },

  bottomNavPressed: {
    opacity: 0.65,
  },

  bottomNavLabel: {
    color: '#687080',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },

  bottomNavActiveLabel: {
    color: '#5420D8',
    fontWeight: '700',
  },

  /* ADD */

  addButtonContainer: {
    width: '20%',
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -27,
  },

  addButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#5420D8',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#5420D8',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  addButtonLabel: {
    color: '#687080',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },

  addButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  /* PRESS FEEDBACK */

  pressed: {
    opacity: 0.72,
  },
});