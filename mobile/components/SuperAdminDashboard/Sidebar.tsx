import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { openDashboardFeature } from '@/utils/dashboardNavigation';

type SidebarProps = {
  activeItem?: string;
  onItemPress?: (item: string) => void;
};

type MenuItem = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

/* =========================================================
   MANAGEMENT
   ========================================================= */

const managementItems: MenuItem[] = [
  {
    label: 'Students',
    icon: 'account-group-outline',
  },
  {
    label: 'Teachers',
    icon: 'account-tie-outline',
  },
  {
    label: 'Subjects',
    icon: 'book-open-outline',
  },
  {
    label: 'Branches',
    icon: 'office-building-outline',
  },
  {
    label: 'Batches',
    icon: 'account-multiple-outline',
  },
  {
    label: 'Attendance',
    icon: 'calendar-check-outline',
  },
  {
    label: 'Examinations',
    icon: 'file-document-edit-outline',
  },
  {
    label: 'Assignments',
    icon: 'clipboard-text-outline',
  },
  {
    label: 'Fees Management',
    icon: 'cash-multiple',
  },
  {
    label: 'Performance',
    icon: 'chart-line',
  },
  {
    label: 'Academics',
    icon: 'school-outline',
  },
  {
    label: 'Timetable',
    icon: 'calendar-clock-outline',
  },
  {
    label: 'Staff on Leave',
    icon: 'account-off-outline',
  },
];

/* =========================================================
   ADMINISTRATION
   ========================================================= */

const administrationItems: MenuItem[] = [
  {
    label: 'Users & Roles',
    icon: 'account-cog-outline',
  },
  {
    label: 'Announcements',
    icon: 'bullhorn-outline',
  },
  {
    label: 'Messages',
    icon: 'message-text-outline',
  },
  {
    label: 'Reports',
    icon: 'file-chart-outline',
  },
  {
    label: 'Accounts',
    icon: 'calculator-variant-outline',
  },
  {
    label: 'Academic Calendar',
    icon: 'calendar-month-outline',
  },
  {
    label: 'Settings',
    icon: 'cog-outline',
  },
  {
    label: 'Audit Logs',
    icon: 'history',
  },
];

/* =========================================================
   SIDEBAR
   ========================================================= */

const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'Dashboard',
  onItemPress,
}) => {
  const { width } = useWindowDimensions();

  const isMobile = width < 900;

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleItemPress = (item: string) => {
    /*
     * First notify parent.
     * This is used by the mobile drawer to close itself.
     */
    onItemPress?.(item);

    /*
     * Navigation is centralized inside
     * dashboardNavigation.ts
     */
    openDashboardFeature(item);
  };

  /* =======================================================
     MENU ITEM
  ======================================================= */

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeItem === item.label;

    return (
      <TouchableOpacity
        key={item.label}
        style={[
          styles.menuItem,
          isMobile
            ? styles.menuItemMobile
            : styles.menuItemDesktop,
        ]}
        onPress={() => handleItemPress(item.label)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={isMobile ? 22 : 20}
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

  /* =======================================================
     UI
     ======================================================= */

  return (
    <View style={styles.sidebar}>

      {/* ===================================================
          BRAND
      =================================================== */}

      <View
        style={[
          styles.brandContainer,
          isMobile
            ? styles.brandContainerMobile
            : styles.brandContainerDesktop,
        ]}
      >
        <View
          style={[
            styles.brandIcon,
            isMobile
              ? styles.brandIconMobile
              : styles.brandIconDesktop,
          ]}
        >
          <MaterialCommunityIcons
            name="school-outline"
            size={isMobile ? 32 : 25}
            color="#7040D5"
          />
        </View>

        <View style={styles.brandTextContainer}>
          <Text
            style={[
              styles.brandTitle,
              isMobile
                ? styles.brandTitleMobile
                : styles.brandTitleDesktop,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            VLCC ERP
          </Text>

          <Text
            style={[
              styles.brandSubtitle,
              isMobile
                ? styles.brandSubtitleMobile
                : styles.brandSubtitleDesktop,
            ]}
            numberOfLines={1}
          >
            Portal
          </Text>
        </View>
      </View>

      {/* ===================================================
          MENU
      =================================================== */}

      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={[
          styles.menuContent,
          isMobile
            ? styles.menuContentMobile
            : styles.menuContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.menuItem,
            isMobile
              ? styles.menuItemMobile
              : styles.menuItemDesktop,
          ]}
          onPress={() => handleItemPress('Dashboard')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            size={isMobile ? 22 : 20}
            color={
              activeItem === 'Dashboard'
                ? '#7040D5'
                : '#66768A'
            }
          />

          <Text
            style={[
              styles.menuText,
              isMobile
                ? styles.menuTextMobile
                : styles.menuTextDesktop,
              activeItem === 'Dashboard' &&
                styles.menuTextActive,
            ]}
            numberOfLines={1}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        {/* =================================================
            MANAGEMENT
        ================================================= */}

        <Text
          style={[
            styles.sectionTitle,
            isMobile
              ? styles.sectionTitleMobile
              : styles.sectionTitleDesktop,
          ]}
        >
          MANAGEMENT
        </Text>

        {managementItems.map(renderMenuItem)}

        {/* =================================================
            ADMINISTRATION
        ================================================= */}

        <Text
          style={[
            styles.sectionTitle,
            isMobile
              ? styles.sectionTitleMobile
              : styles.sectionTitleDesktop,
          ]}
        >
          ADMINISTRATION
        </Text>

        {administrationItems.map(renderMenuItem)}

      </ScrollView>

      {/* ===================================================
          PROFILE
      =================================================== */}

      <View
        style={[
          styles.profileContainer,
          isMobile
            ? styles.profileContainerMobile
            : styles.profileContainerDesktop,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.profileCard,
            isMobile
              ? styles.profileCardMobile
              : styles.profileCardDesktop,
          ]}
          activeOpacity={0.8}
          onPress={() => handleItemPress('Profile')}
        >
          <View
            style={[
              styles.profileAvatar,
              isMobile
                ? styles.profileAvatarMobile
                : styles.profileAvatarDesktop,
            ]}
          >
            <MaterialCommunityIcons
              name="account"
              size={isMobile ? 25 : 23}
              color="#7040D5"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileName,
                isMobile
                  ? styles.profileNameMobile
                  : styles.profileNameDesktop,
              ]}
              numberOfLines={1}
            >
              Super Admin
            </Text>

            <Text
              style={[
                styles.profileRole,
                isMobile
                  ? styles.profileRoleMobile
                  : styles.profileRoleDesktop,
              ]}
              numberOfLines={1}
            >
              Administrator
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={isMobile ? 23 : 20}
            color="#9AA8B8"
          />
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({

  /* =======================================================
     SIDEBAR
  ======================================================= */

  sidebar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },

  /* =======================================================
     BRAND
  ======================================================= */

  brandContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandContainerMobile: {
    height: 145,
    paddingHorizontal: 30,
    paddingTop: 20,
  },

  brandContainerDesktop: {
    height: 82,
    paddingHorizontal: 18,
  },

  brandIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0ECFF',
    flexShrink: 0,
  },

  brandIconMobile: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginRight: 13,
  },

  brandIconDesktop: {
    width: 43,
    height: 43,
    borderRadius: 12,
    marginRight: 11,
  },

  brandTextContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },

  brandTitle: {
    color: '#7040D5',
  },

  brandTitleMobile: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    lineHeight: 27,
  },

  brandTitleDesktop: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    lineHeight: 21,
  },

  brandSubtitle: {
    color: '#7040D5',
  },

  brandSubtitleMobile: {
    fontFamily: 'PoppinsMedium',
    fontSize: 14,
    lineHeight: 19,
    marginTop: 0,
  },

  brandSubtitleDesktop: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 13,
  },

  /* =======================================================
     MENU
  ======================================================= */

  menuScroll: {
    flex: 1,
  },

  menuContent: {
    flexGrow: 1,
  },

  menuContentMobile: {
    paddingHorizontal: 30,
    paddingTop: 4,
    paddingBottom: 10,
  },

  menuContentDesktop: {
    paddingHorizontal: 11,
    paddingTop: 13,
    paddingBottom: 12,
  },

  /* =======================================================
     MENU ITEM
     
     IMPORTANT:
     No grey active background.
     Active state is only purple icon/text.
  ======================================================= */

  menuItem: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemMobile: {
    height: 47,
    paddingHorizontal: 5,
    marginBottom: 1,
  },

  menuItemDesktop: {
    height: 43,
    paddingHorizontal: 11,
    marginBottom: 3,
  },

  /* =======================================================
     MENU TEXT
  ======================================================= */

  menuText: {
    flex: 1,
    color: '#4D5B6D',
  },

  menuTextMobile: {
    fontFamily: 'PoppinsMedium',
    fontSize: 15,
    lineHeight: 21,
    marginLeft: 16,
  },

  menuTextDesktop: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 11,
  },

  menuTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  /* =======================================================
     SECTION TITLE
  ======================================================= */

  sectionTitle: {
    color: '#9AA8B8',
  },

  sectionTitleMobile: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.7,
    marginTop: 16,
    marginBottom: 6,
    paddingHorizontal: 5,
  },

  sectionTitleDesktop: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    lineHeight: 14,
    letterSpacing: 0.8,
    marginTop: 19,
    marginBottom: 7,
    paddingHorizontal: 10,
  },

  /* =======================================================
     PROFILE
  ======================================================= */

  profileContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E5E8ED',
    backgroundColor: '#FFFFFF',
  },

  profileContainerMobile: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
  },

  profileContainerDesktop: {
    paddingHorizontal: 11,
    paddingTop: 10,
    paddingBottom: 13,
  },

  profileCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileCardMobile: {
    minHeight: 72,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E1E4E9',
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  profileCardDesktop: {
    minHeight: 67,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },

  /* =======================================================
     PROFILE AVATAR
  ======================================================= */

  profileAvatar: {
    backgroundColor: '#F0ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileAvatarMobile: {
    width: 45,
    height: 45,
    borderRadius: 23,
    marginRight: 11,
  },

  profileAvatarDesktop: {
    width: 39,
    height: 39,
    borderRadius: 20,
    marginRight: 9,
  },

  /* =======================================================
     PROFILE TEXT
  ======================================================= */

  profileInfo: {
    flex: 1,
    minWidth: 0,
  },

  profileName: {
    color: '#202A3A',
  },

  profileNameMobile: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    lineHeight: 19,
  },

  profileNameDesktop: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    lineHeight: 15,
  },

  profileRole: {
    color: '#9AA8B8',
  },

  profileRoleMobile: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 1,
  },

  profileRoleDesktop: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 12,
    marginTop: 1,
  },
});

export default Sidebar;