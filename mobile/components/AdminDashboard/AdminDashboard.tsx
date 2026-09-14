import React, { useRef, useState } from 'react';

import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type ColorType =
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink';

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  type: ColorType;
  onPress?: () => void;
};

const colors = {
  purple: {
    background: '#F1EAFF',
    icon: '#7040D5',
  },
  blue: {
    background: '#EAF2FF',
    icon: '#2675E8',
  },
  green: {
    background: '#E7F8EF',
    icon: '#35B878',
  },
  orange: {
    background: '#FFF1E2',
    icon: '#F7941D',
  },
  pink: {
    background: '#FFE9F0',
    icon: '#E95386',
  },
};

const adminMenuItems = [
  {
    label: 'Dashboard',
    icon: 'view-dashboard-outline' as const,
  },
  {
    label: 'Students',
    icon: 'account-group-outline' as const,
  },
  {
    label: 'Teachers',
    icon: 'account-tie-outline' as const,
  },
  {
    label: 'Courses',
    icon: 'book-open-outline' as const,
  },
  {
    label: 'Batches',
    icon: 'account-multiple-outline' as const,
  },
  {
    label: 'Attendance',
    icon: 'calendar-check-outline' as const,
  },
  {
    label: 'Examinations',
    icon: 'file-document-edit-outline' as const,
  },
  {
    label: 'Assignments',
    icon: 'clipboard-text-outline' as const,
  },
  {
    label: 'Performance',
    icon: 'chart-line' as const,
  },
];

const communicationItems = [
  {
    label: 'Announcements',
    icon: 'bullhorn-outline' as const,
  },
  {
    label: 'Messages',
    icon: 'message-text-outline' as const,
  },
];

const administrationItems = [
  {
    label: 'Reports',
    icon: 'file-chart-outline' as const,
  },
  {
    label: 'Profile',
    icon: 'account-outline' as const,
  },
  {
    label: 'Settings',
    icon: 'cog-outline' as const,
  },
];

function openAdminFeature(feature: string) {
  if (feature === 'Dashboard') {
    return;
  }

  router.push({
    pathname: '/(tabs)/explore',
    params: {
      feature,
    },
  });
}

function StatCard({
  title,
  value,
  change,
  icon,
  type,
  onPress,
}: StatCardProps) {
  const color = colors[type];

  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.statTopRow}>
        <View
          style={[
            styles.statIconBox,
            {
              backgroundColor: color.background,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={color.icon}
          />
        </View>

        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor: color.background,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="trending-up"
            size={12}
            color={color.icon}
          />

          <Text
            style={[
              styles.changeText,
              {
                color: color.icon,
              },
            ]}
          >
            {change}
          </Text>
        </View>
      </View>

      <View>
        <Text style={styles.statTitle}>{title}</Text>

        <Text
          style={styles.statValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {value}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  icon,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <MaterialCommunityIcons
              name={icon}
              size={19}
              color="#7040D5"
            />
          </View>

          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {subtitle ? (
              <Text style={styles.sectionSubtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#A0A9B8"
        />
      </View>

      {children}
    </View>
  );
}

function AdminSidebar({
  activeItem,
  onItemPress,
}: {
  activeItem?: string;
  onItemPress?: (item: string) => void;
}) {
  const { width } = useWindowDimensions();

  const isMobile = width < 900;

  const handlePress = (item: string) => {
    onItemPress?.(item);

    if (item !== 'Dashboard') {
      openAdminFeature(item);
    }
  };

  const renderItem = (
    item: {
      label: string;
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
    },
  ) => {
    const isActive = activeItem === item.label;

    return (
      <TouchableOpacity
        key={item.label}
        style={styles.menuItem}
        onPress={() => handlePress(item.label)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={isMobile ? 23 : 20}
          color={isActive ? '#7040D5' : '#66768A'}
        />

        <Text
          style={[
            styles.menuText,
            isMobile
              ? styles.menuTextMobile
              : styles.menuTextDesktop,
            isActive && styles.menuTextActive,
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sidebar}>
      {/* BRAND */}

      <View style={styles.brandContainer}>
        <View style={styles.brandIcon}>
          <MaterialCommunityIcons
            name="school-outline"
            size={25}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.brandTextContainer}>
          <Text style={styles.brandTitle}>
            VLCC ERP
          </Text>

          <Text style={styles.brandSubtitle}>
            Portal
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.sidebarScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* DASHBOARD */}

        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>
            MAIN
          </Text>

          {renderItem(adminMenuItems[0])}
        </View>

        {/* MANAGEMENT */}

        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>
            MANAGEMENT
          </Text>

          {adminMenuItems
            .slice(1)
            .map(renderItem)}
        </View>

        {/* COMMUNICATION */}

        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>
            COMMUNICATION
          </Text>

          {communicationItems.map(renderItem)}
        </View>

        {/* ADMINISTRATION */}

        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>
            ADMINISTRATION
          </Text>

          {administrationItems.map(renderItem)}
        </View>
      </ScrollView>

      {/* PROFILE */}

      <TouchableOpacity
        style={styles.profileCard}
        activeOpacity={0.8}
        onPress={() => handlePress('Profile')}
      >
        <View style={styles.profileAvatar}>
          <MaterialCommunityIcons
            name="account"
            size={22}
            color="#7040D5"
          />
        </View>

        <View style={styles.profileTextContainer}>
          <Text
            style={styles.profileName}
            numberOfLines={1}
          >
            Admin
          </Text>

          <Text
            style={styles.profileRole}
            numberOfLines={1}
          >
            Branch Administrator
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color="#9AA4B4"
        />
      </TouchableOpacity>
    </View>
  );
}

function AdminHeader({
  isDesktop,
  onMenuPress,
}: {
  isDesktop: boolean;
  onMenuPress: () => void;
}) {
  const [notificationVisible, setNotificationVisible] =
    useState(false);

  const [profileVisible, setProfileVisible] =
    useState(false);

  const openNotifications = () => {
    setProfileVisible(false);
    setNotificationVisible(true);
  };

  const openProfile = () => {
    setNotificationVisible(false);
    setProfileVisible(true);
  };

  const closeAll = () => {
    setNotificationVisible(false);
    setProfileVisible(false);
  };

  const handleProfileOption = (option: string) => {
    setProfileVisible(false);

    if (option === 'profile') {
      openAdminFeature('Profile');
    }

    if (option === 'settings') {
      openAdminFeature('Settings');
    }

    if (option === 'logout') {
      Alert.alert(
        'Logout',
        'Logout functionality will be connected here.',
      );
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {!isDesktop && (
          <TouchableOpacity
            style={styles.mobileMenuButton}
            onPress={onMenuPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="menu"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}

        <View>
          <Text style={styles.headerTitle}>
            Dashboard
          </Text>

          <Text style={styles.headerSubtitle}>
            Branch administration overview
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={openNotifications}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={22}
            color="#FFFFFF"
          />

          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerProfileButton}
          onPress={openProfile}
          activeOpacity={0.8}
        >
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons
              name="account"
              size={19}
              color="#7040D5"
            />
          </View>

          {isDesktop && (
            <View style={styles.headerProfileText}>
              <Text style={styles.headerProfileName}>
                Admin
              </Text>

              <Text style={styles.headerProfileRole}>
                Administrator
              </Text>
            </View>
          )}

          <MaterialCommunityIcons
            name="chevron-down"
            size={17}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {(notificationVisible || profileVisible) && (
        <Pressable
          style={styles.popupOverlay}
          onPress={closeAll}
        />
      )}

      {notificationVisible && (
        <View style={styles.notificationPopup}>
          <View style={styles.popupHeader}>
            <Text style={styles.popupTitle}>
              Notifications
            </Text>

            <TouchableOpacity
              onPress={closeAll}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close"
                size={19}
                color="#7B8798"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon}>
              <MaterialCommunityIcons
                name="cash-clock"
                size={18}
                color="#E95386"
              />
            </View>

            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>
                Pending fee collection
              </Text>

              <Text style={styles.notificationDescription}>
                Fee follow-up is required for 24 students.
              </Text>
            </View>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon}>
              <MaterialCommunityIcons
                name="calendar-alert"
                size={18}
                color="#2675E8"
              />
            </View>

            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>
                Upcoming examination
              </Text>

              <Text style={styles.notificationDescription}>
                Examination schedule requires review.
              </Text>
            </View>
          </View>
        </View>
      )}

      {profileVisible && (
        <View style={styles.profilePopup}>
          <View style={styles.profilePopupHeader}>
            <View style={styles.popupAvatar}>
              <MaterialCommunityIcons
                name="account"
                size={22}
                color="#7040D5"
              />
            </View>

            <View>
              <Text style={styles.popupProfileName}>
                Admin
              </Text>

              <Text style={styles.popupProfileRole}>
                Branch Administrator
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.popupOption}
            onPress={() =>
              handleProfileOption('profile')
            }
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color="#66768A"
            />

            <Text style={styles.popupOptionText}>
              Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.popupOption}
            onPress={() =>
              handleProfileOption('settings')
            }
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={20}
              color="#66768A"
            />

            <Text style={styles.popupOptionText}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.popupOption}
            onPress={() =>
              handleProfileOption('logout')
            }
          >
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color="#E95386"
            />

            <Text
              style={[
                styles.popupOptionText,
                {
                  color: '#E95386',
                },
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function StudentGrowth() {
  const data = [
    38,
    45,
    42,
    55,
    51,
    64,
    61,
    73,
    68,
    82,
    78,
    91,
  ];

  const months = [
    'Oct',
    'Nov',
    'Dec',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
  ];

  return (
    <SectionCard
      title="Student Growth"
      subtitle="Monthly student enrollment"
      icon="account-group-outline"
    >
      <View style={styles.chartArea}>
        <View style={styles.chartYAxis}>
          <Text style={styles.chartAxisText}>100</Text>
          <Text style={styles.chartAxisText}>75</Text>
          <Text style={styles.chartAxisText}>50</Text>
          <Text style={styles.chartAxisText}>25</Text>
          <Text style={styles.chartAxisText}>0</Text>
        </View>

        <View style={styles.chartContent}>
          <View style={styles.chartBars}>
            {data.map((value, index) => (
              <View
                key={`${value}-${index}`}
                style={styles.chartBarColumn}
              >
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${value}%`,
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.chartMonths}>
            {months.map((month) => (
              <Text
                key={month}
                style={styles.chartMonth}
              >
                {month}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.chartFooter}>
        <View>
          <Text style={styles.chartMainValue}>
            1,248
          </Text>

          <Text style={styles.chartFooterText}>
            Current students
          </Text>
        </View>

        <View style={styles.growthBadge}>
          <MaterialCommunityIcons
            name="trending-up"
            size={14}
            color="#35B878"
          />

          <Text style={styles.growthBadgeText}>
            8.5%
          </Text>
        </View>
      </View>
    </SectionCard>
  );
}

function RecentAnnouncements() {
  const announcements = [
    {
      title: 'Mid Semester Examination',
      date: '09 Sep 2026',
      icon: 'file-document-edit-outline' as const,
      type: 'blue',
    },
    {
      title: 'Parent Teacher Meeting',
      date: '07 Sep 2026',
      icon: 'account-group-outline' as const,
      type: 'purple',
    },
    {
      title: 'Fee Payment Reminder',
      date: '05 Sep 2026',
      icon: 'cash-clock' as const,
      type: 'pink',
    },
  ];

  return (
    <SectionCard
      title="Recent Announcements"
      subtitle="Latest branch updates"
      icon="bullhorn-outline"
    >
      {announcements.map((item) => (
        <View
          key={item.title}
          style={styles.announcementItem}
        >
          <View
            style={[
              styles.announcementIcon,
              {
                backgroundColor:
                  item.type === 'blue'
                    ? '#EAF2FF'
                    : item.type === 'pink'
                      ? '#FFE9F0'
                      : '#F1EAFF',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={18}
              color={
                item.type === 'blue'
                  ? '#2675E8'
                  : item.type === 'pink'
                    ? '#E95386'
                    : '#7040D5'
              }
            />
          </View>

          <View style={styles.announcementText}>
            <Text
              style={styles.announcementTitle}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <Text style={styles.announcementDate}>
              {item.date}
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color="#A3ACBA"
          />
        </View>
      ))}
    </SectionCard>
  );
}

function TopCourses() {
  const courses = [
    {
      name: 'BCA',
      students: 286,
      percentage: 88,
      color: '#7040D5',
    },
    {
      name: 'BBA',
      students: 242,
      percentage: 75,
      color: '#2675E8',
    },
    {
      name: 'MCA',
      students: 198,
      percentage: 62,
      color: '#35B878',
    },
    {
      name: 'MBA',
      students: 156,
      percentage: 49,
      color: '#F7941D',
    },
  ];

  return (
    <SectionCard
      title="Top Courses"
      subtitle="Student distribution"
      icon="book-open-outline"
    >
      {courses.map((course) => (
        <View
          key={course.name}
          style={styles.courseRow}
        >
          <View style={styles.courseInfo}>
            <View style={styles.courseIcon}>
              <MaterialCommunityIcons
                name="school-outline"
                size={17}
                color="#7040D5"
              />
            </View>

            <View>
              <Text style={styles.courseName}>
                {course.name}
              </Text>

              <Text style={styles.courseStudents}>
                {course.students} students
              </Text>
            </View>
          </View>

          <View style={styles.courseProgressContainer}>
            <View style={styles.courseProgressTrack}>
              <View
                style={[
                  styles.courseProgressFill,
                  {
                    width: `${course.percentage}%`,
                    backgroundColor: course.color,
                  },
                ]}
              />
            </View>

            <Text style={styles.coursePercentage}>
              {course.percentage}%
            </Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

function BatchOverview() {
  const batches = [
    {
      name: 'BCA 2025',
      students: 128,
      status: 'Active',
      type: 'purple',
    },
    {
      name: 'BBA 2026',
      students: 112,
      status: 'Active',
      type: 'blue',
    },
    {
      name: 'MCA 2025',
      students: 94,
      status: 'Active',
      type: 'green',
    },
    {
      name: 'MBA 2026',
      students: 76,
      status: 'Upcoming',
      type: 'orange',
    },
  ];

  return (
    <SectionCard
      title="Batch Overview"
      subtitle="Current branch batches"
      icon="account-multiple-outline"
    >
      {batches.map((batch) => (
        <View
          key={batch.name}
          style={styles.batchRow}
        >
          <View
            style={[
              styles.batchIcon,
              {
                backgroundColor:
                  batch.type === 'purple'
                    ? '#F1EAFF'
                    : batch.type === 'blue'
                      ? '#EAF2FF'
                      : batch.type === 'green'
                        ? '#E7F8EF'
                        : '#FFF1E2',
              },
            ]}
          >
            <MaterialCommunityIcons
              name="account-multiple-outline"
              size={17}
              color={
                batch.type === 'purple'
                  ? '#7040D5'
                  : batch.type === 'blue'
                    ? '#2675E8'
                    : batch.type === 'green'
                      ? '#35B878'
                      : '#F7941D'
              }
            />
          </View>

          <View style={styles.batchTextContainer}>
            <Text style={styles.batchName}>
              {batch.name}
            </Text>

            <Text style={styles.batchStudents}>
              {batch.students} students
            </Text>
          </View>

          <View
            style={[
              styles.batchStatus,
              {
                backgroundColor:
                  batch.status === 'Active'
                    ? '#E7F8EF'
                    : '#FFF1E2',
              },
            ]}
          >
            <Text
              style={[
                styles.batchStatusText,
                {
                  color:
                    batch.status === 'Active'
                      ? '#35B878'
                      : '#F7941D',
                },
              ]}
            >
              {batch.status}
            </Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

function QuickActions() {
  const actions: {
    title: string;
    feature: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
  }[] = [
  {
    title: 'Add Student',
    feature: 'Students',
    icon: 'account-plus',
    color: '#7040D5',
  },
  {
    title: 'Add Teacher',
    feature: 'Teachers',
    icon: 'account-tie',
    color: '#2675E8',
  },
  {
    title: 'Add Course',
    feature: 'Courses',
    icon: 'book-open-variant',
    color: '#35B878',
  },
  {
    title: 'Create Batch',
    feature: 'Batches',
    icon: 'account-multiple-plus',
    color: '#F7941D',
  },
  {
    title: 'Generate Report',
    feature: 'Reports',
    icon: 'file-chart-outline',
    color: '#7040D5',
  },
  {
    title: 'Student Complaint',
    feature: 'Students',
    icon: 'alert-circle-outline',
    color: '#2675E8',
  },
  {
    title: 'Quiz',
    feature: 'Examinations',
    icon: 'help-circle-outline',
    color: '#35B878',
  },
  {
    title: 'Event',
    feature: 'Academic Calendar',
    icon: 'calendar-plus',
    color: '#F7941D',
  },
  {
    title: 'PTG',
    feature: 'PTG',
    icon: 'account-group-outline',
    color: '#E95386',
  },
  {
    title: 'Feedback',
    feature: 'Performance',
    icon: 'message-text-outline',
    color: '#7040D5',
  },
  {
    title: 'WhatsApp',
    feature: 'Messages',
    icon: 'whatsapp',
    color: '#2675E8',
  },
  ];

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <MaterialCommunityIcons
              name="lightning-bolt-outline"
              size={19}
              color="#7040D5"
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              Quick Actions
            </Text>

            <Text style={styles.sectionSubtitle}>
              Frequently used actions
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() =>
              openAdminFeature(action.feature)
            }
          >
            <View
              style={[
                styles.quickActionIcon,
                {
                  backgroundColor:
                    action.color === '#7040D5'
                      ? '#F1EAFF'
                      : action.color === '#2675E8'
                        ? '#EAF2FF'
                        : action.color === '#35B878'
                          ? '#E7F8EF'
                          : action.color === '#F7941D'
                            ? '#FFF1E2'
                            : '#FFE9F0',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={20}
                color={action.color}
              />
            </View>

            <Text
              style={styles.quickActionText}
              numberOfLines={2}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function DashboardFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © 2026 VLCC ERP Portal
      </Text>

      <View style={styles.footerRight}>
        <Text style={styles.footerText}>
          Admin Dashboard
        </Text>

        <View style={styles.footerDot} />

        <Text style={styles.footerText}>
          Branch Administration
        </Text>
      </View>
    </View>
  );
}

export default function AdminDashboard() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  const drawerWidth = Math.min(
    width * 0.7,
    500,
  );

  const drawerAnimation = useRef(
    new Animated.Value(0),
  ).current;

  const openSidebar = () => {
    setSidebarVisible(true);

    drawerAnimation.stopAnimation();

    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    drawerAnimation.stopAnimation();

    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSidebarVisible(false);
      }
    });
  };

  const drawerTranslateX =
    drawerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-drawerWidth, 0],
    });

  const overlayOpacity =
    drawerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

  return (
    <View style={styles.container}>
      {/* DESKTOP SIDEBAR */}

      {isDesktop && (
        <AdminSidebar
          activeItem="Dashboard"
        />
      )}

      {/* MOBILE LEFT DRAWER */}

      {!isDesktop && (
        <Modal
          visible={sidebarVisible}
          transparent
          animationType="none"
          onRequestClose={closeSidebar}
        >
          <View style={styles.drawerContainer}>
            <Animated.View
              style={[
                styles.drawer,
                {
                  width: drawerWidth,
                  transform: [
                    {
                      translateX:
                        drawerTranslateX,
                    },
                  ],
                },
              ]}
            >
              <AdminSidebar
                activeItem="Dashboard"
                onItemPress={closeSidebar}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.drawerOverlayContainer,
                {
                  opacity: overlayOpacity,
                },
              ]}
            >
              <Pressable
                style={styles.drawerOverlay}
                onPress={closeSidebar}
              />
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* MAIN CONTENT */}

      <View style={styles.mainContainer}>
        <AdminHeader
          isDesktop={isDesktop}
          onMenuPress={openSidebar}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            !isDesktop &&
              styles.mobileContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* STATISTICS */}

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Total Students"
                value="1,248"
                change="8.5%"
                icon="account-group"
                type="purple"
                onPress={() =>
                  openAdminFeature(
                    'Students',
                  )
                }
              />
            </View>

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Total Teachers"
                value="86"
                change="5.2%"
                icon="account-tie"
                type="blue"
                onPress={() =>
                  openAdminFeature(
                    'Teachers',
                  )
                }
              />
            </View>

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Active Courses"
                value="32"
                change="6.7%"
                icon="book-open-variant"
                type="green"
                onPress={() =>
                  openAdminFeature(
                    'Courses',
                  )
                }
              />
            </View>

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Active Batches"
                value="24"
                change="4.8%"
                icon="account-multiple"
                type="orange"
                onPress={() =>
                  openAdminFeature(
                    'Batches',
                  )
                }
              />
            </View>

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Today's Attendance"
                value="92%"
                change="3.8%"
                icon="calendar-check"
                type="purple"
                onPress={() =>
                  openAdminFeature(
                    'Attendance',
                  )
                }
              />
            </View>

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Upcoming Exams"
                value="6"
                change="2.4%"
                icon="file-document-edit"
                type="blue"
                onPress={() =>
                  openAdminFeature(
                    'Examinations',
                  )
                }
              />
            </View>

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Assignments"
                value="18"
                change="5.6%"
                icon="clipboard-text"
                type="green"
                onPress={() =>
                  openAdminFeature(
                    'Assignments',
                  )
                }
              />
            </View>

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Staff on Leave"
                value="5"
                change="2.1%"
                icon="account-off"
                type="orange"
                onPress={() =>
                  openAdminFeature(
                    'Staff on Leave',
                  )
                }
              />
            </View>

            <View
              style={[
                styles.statItem,
                isDesktop &&
                  styles.statItemDesktop,
              ]}
            >
              <StatCard
                title="Performance"
                value="87%"
                change="6.2%"
                icon="chart-line"
                type="purple"
                onPress={() =>
                  openAdminFeature(
                    'Performance',
                  )
                }
              />
            </View>
          </View>

          {/* MAIN ANALYTICS */}

          <View
            style={[
              styles.analyticsRow,
              !isDesktop &&
                styles.analyticsColumn,
            ]}
          >
            <View
              style={[
                styles.growthWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <StudentGrowth />
            </View>

            <View
              style={[
                styles.announcementWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <Pressable
                onPress={() =>
                  openAdminFeature(
                    'Announcements',
                  )
                }
                style={styles.clickableSection}
              >
                <RecentAnnouncements />
              </Pressable>
            </View>
          </View>

          {/* BOTTOM SECTION */}

          <View
            style={[
              styles.bottomRow,
              !isDesktop &&
                styles.bottomColumn,
            ]}
          >
            <View
              style={[
                styles.bottomWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <TopCourses />
            </View>

            <View
              style={[
                styles.bottomWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <BatchOverview />
            </View>

            <View
              style={[
                styles.actionsWrapper,
                !isDesktop &&
                  styles.mobileWrapper,
              ]}
            >
              <QuickActions />
            </View>
          </View>

          <DashboardFooter />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* =====================================================
     MAIN
  ====================================================== */

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    flexDirection: 'row',
  },

  mainContainer: {
    flex: 1,
    minWidth: 0,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 30,
  },

  mobileContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },

  /* =====================================================
     SIDEBAR
  ====================================================== */

  sidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EEF0F5',
    paddingTop: 18,
    paddingHorizontal: 14,
  },

  sidebarScroll: {
    flex: 1,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 20,
  },

  brandIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandTextContainer: {
    marginLeft: 10,
  },

  brandTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#7040D5',
  },

  brandSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8792A4',
    marginTop: -2,
  },

  menuSection: {
    marginBottom: 17,
  },

  sectionLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#A2ACBB',
    letterSpacing: 0.6,
    marginLeft: 8,
    marginBottom: 7,
  },

  menuItem: {
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },

  menuText: {
    fontFamily: 'PoppinsMedium',
    color: '#66768A',
    marginLeft: 10,
  },

  menuTextDesktop: {
    fontSize: 10.5,
  },

  menuTextMobile: {
    fontSize: 12,
  },

  menuTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  profileCard: {
    minHeight: 65,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileAvatar: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  profileName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#172033',
  },

  profileRole: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8792A4',
    marginTop: 1,
  },

  /* =====================================================
     HEADER
  ====================================================== */

  header: {
    height: 76,
    backgroundColor: '#7040D5',
    borderBottomWidth: 0,
    borderBottomColor: '#7040D5',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  headerTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#EDE7FF',
    marginTop: 1,
  },

  mobileMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    position: 'relative',
  },

  notificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E95386',
    position: 'absolute',
    right: 9,
    top: 8,
  },

  headerProfileButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerProfileText: {
    marginHorizontal: 8,
  },

  headerProfileName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#FFFFFF',
  },

  headerProfileRole: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#EDE7FF',
  },

  /* =====================================================
     POPUPS
  ====================================================== */

  popupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 25,
  },

  notificationPopup: {
    position: 'absolute',
    right: 70,
    top: 64,
    width: 315,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 12,
    zIndex: 30,
  },

  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },

  popupTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },

  notificationItem: {
    flexDirection: 'row',
    paddingTop: 12,
  },

  notificationIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationText: {
    flex: 1,
    marginLeft: 9,
  },

  notificationTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#172033',
  },

  notificationDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8792A4',
    marginTop: 2,
    lineHeight: 12,
  },

  profilePopup: {
    position: 'absolute',
    right: 20,
    top: 64,
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 12,
    zIndex: 30,
  },

  profilePopupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
    marginBottom: 5,
  },

  popupAvatar: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  popupProfileName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#172033',
  },

  popupProfileRole: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#8792A4',
  },

  popupOption: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 9,
  },

  popupOptionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#66768A',
    marginLeft: 9,
  },

  /* =====================================================
     STATISTICS
  ====================================================== */

  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
  },

  statItem: {
    width: '48%',
    flexGrow: 0,
    flexShrink: 0,
  },

  statItemDesktop: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '18.8%',
    width: undefined,
  },

  statCard: {
    width: '100%',
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  statTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeBadge: {
    minHeight: 27,
    borderRadius: 8,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  changeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    marginLeft: 3,
  },

  statTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,
    color: '#748096',
    marginBottom: 3,
  },

  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#172033',
  },

  /* =====================================================
     ANALYTICS
  ====================================================== */

  analyticsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },

  analyticsColumn: {
    flexDirection: 'column',
  },

  growthWrapper: {
    flex: 1.5,
  },

  feeWrapper: {
    flex: 1.1,
  },

  announcementWrapper: {
    flex: 1,
  },

  mobileWrapper: {
    width: '100%',
    flex: undefined,
  },

  clickableSection: {
    width: '100%',
  },

  /* =====================================================
     SECTION CARD
  ====================================================== */

  sectionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  sectionIconBox: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionTitleContainer: {
    minWidth: 0,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A95A6',
    marginTop: 1,
  },

  /* =====================================================
     STUDENT GROWTH
  ====================================================== */

  chartArea: {
    height: 155,
    flexDirection: 'row',
  },

  chartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },

  chartAxisText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#9BA5B4',
  },

  chartContent: {
    flex: 1,
    minWidth: 0,
  },

  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
    paddingHorizontal: 3,
    gap: 5,
  },

  chartBarColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },

  chartBar: {
    width: '100%',
    minHeight: 8,
    backgroundColor: '#7040D5',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    opacity: 0.85,
  },

  chartMonths: {
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  chartMonth: {
    fontFamily: 'PoppinsRegular',
    fontSize: 6.5,
    color: '#9BA5B4',
  },

  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
  },

  chartMainValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
  },

  chartFooterText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A95A6',
  },

  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F8EF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  growthBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#35B878',
    marginLeft: 3,
  },

  /* =====================================================
     FEE COLLECTION
  ====================================================== */

  feeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  feeAmount: {
    fontFamily: 'PoppinsBold',
    fontSize: 19,
    color: '#172033',
  },

  feeLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A95A6',
    marginTop: 2,
  },

  feePercentage: {
    alignItems: 'center',
  },

  feePercentageText: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#7040D5',
  },

  feePercentageLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8A95A6',
  },

  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 5,
    backgroundColor: '#F0F2F6',
    marginTop: 17,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#7040D5',
  },

  feeRows: {
    marginTop: 13,
  },

  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  feeDotPurple: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7040D5',
    marginRight: 7,
  },

  feeDotPink: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E95386',
    marginRight: 7,
  },

  feeRowLabel: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#748096',
  },

  feeRowValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#172033',
  },

  /* =====================================================
     ANNOUNCEMENTS
  ====================================================== */

  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },

  announcementIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  announcementText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },

  announcementTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#172033',
  },

  announcementDate: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8A95A6',
    marginTop: 2,
  },

  /* =====================================================
     BOTTOM
  ====================================================== */

  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },

  bottomColumn: {
    flexDirection: 'column',
  },

  bottomWrapper: {
    flex: 1,
  },

  actionsWrapper: {
    flex: 1,
  },

  /* =====================================================
     TOP COURSES
  ====================================================== */

  courseRow: {
    marginBottom: 13,
  },

  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  courseIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  courseName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#172033',
  },

  courseStudents: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8A95A6',
    marginTop: 1,
  },

  courseProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  courseProgressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#F0F2F6',
    overflow: 'hidden',
  },

  courseProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  coursePercentage: {
    width: 34,
    textAlign: 'right',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#748096',
  },

  /* =====================================================
     BATCH OVERVIEW
  ====================================================== */

  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },

  batchIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  batchTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },

  batchName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#172033',
  },

  batchStudents: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8A95A6',
    marginTop: 1,
  },

  batchStatus: {
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  batchStatusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
  },

  /* =====================================================
     QUICK ACTIONS
  ====================================================== */

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  quickAction: {
    width: '30%',
    minHeight: 70,
    borderRadius: 11,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    paddingVertical: 7,
  },

  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  quickActionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.5,
    color: '#596579',
    textAlign: 'center',
  },

  /* =====================================================
     FOOTER
  ====================================================== */

  footer: {
    width: '100%',
    minHeight: 50,
    marginTop: 20,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#E9ECF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#9AA4B4',
  },

  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#B5BDCA',
    marginHorizontal: 7,
  },

  /* =====================================================
     MOBILE DRAWER
  ====================================================== */

  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },

  drawer: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 12,
  },

  drawerOverlayContainer: {
    flex: 1,
    height: '100%',
    zIndex: 1,
  },

  drawerOverlay: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(5, 15, 35, 0.55)',
  },
});