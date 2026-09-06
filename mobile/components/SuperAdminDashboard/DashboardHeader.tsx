import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

type DashboardHeaderProps = {
  isDesktop?: boolean;
  onMenuPress?: () => void;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isDesktop = true,
  onMenuPress,
}) => {
  const [notificationVisible, setNotificationVisible] =
    useState(false);

  const [profileVisible, setProfileVisible] =
    useState(false);

  const notifications = [
    {
      id: 1,
      icon: 'account-plus-outline',
      title: 'New Student Registered',
      message: 'A new student has been registered.',
      time: '5 min ago',
    },
    {
      id: 2,
      icon: 'cash-clock',
      title: 'Pending Fee Reminder',
      message: 'There are pending fees to review.',
      time: '20 min ago',
    },
    {
      id: 3,
      icon: 'calendar-alert',
      title: 'Upcoming Event',
      message: 'Parent-Teacher meeting is scheduled.',
      time: '1 hour ago',
    },
  ];

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
      router.push({
        pathname: '/(tabs)/explore',
        params: {
          feature: 'Profile',
        },
      });
    }

    if (option === 'settings') {
      router.push({
        pathname: '/(tabs)/explore',
        params: {
          feature: 'Settings',
        },
      });
    }

    if (option === 'logout') {
      console.log('Logout clicked');
    }
  };

  /* ===================================================== */
  /* MOBILE HEADER                                         */
  /* ===================================================== */

  if (!isDesktop) {
    return (
      <>
        <LinearGradient
          colors={['#6D35D8', '#4522B8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mobileHeader}
        >
          <View style={styles.mobileTopRow}>
            {/* HAMBURGER */}
            <TouchableOpacity
              style={styles.mobileMenuButton}
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="menu"
                size={28}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* TITLE */}
            <View style={styles.mobileTitleContainer}>
              <Text style={styles.mobileTitle}>
                Dashboard
              </Text>
            </View>

            {/* ACTIONS */}
            <View style={styles.mobileActions}>
              {/* NOTIFICATION */}
              <TouchableOpacity
                style={styles.mobileNotification}
                onPress={openNotifications}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={23}
                  color="#FFFFFF"
                />

                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    8
                  </Text>
                </View>
              </TouchableOpacity>

              {/* PROFILE */}
              <TouchableOpacity
                style={styles.mobileProfileButton}
                onPress={openProfile}
                activeOpacity={0.7}
              >
                <View style={styles.mobileAvatar}>
                  <MaterialCommunityIcons
                    name="account"
                    size={23}
                    color="#6D35D8"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.mobileSubtitle}>
            Welcome back, Super Admin!
          </Text>
        </LinearGradient>

        {/* MOBILE MODALS */}
        <NotificationModal
          visible={notificationVisible}
          onClose={closeAll}
          isDesktop={false}
          notifications={notifications}
        />

        <ProfileModal
          visible={profileVisible}
          onClose={closeAll}
          isDesktop={false}
          onOption={handleProfileOption}
        />
      </>
    );
  }

  /* ===================================================== */
  /* DESKTOP HEADER                                        */
  /* ===================================================== */

  return (
    <>
      <LinearGradient
        colors={['#6D35D8', '#4522B8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.desktopHeader}
      >
        {/* LEFT SIDE */}
        <View style={styles.desktopLeft}>
          <TouchableOpacity
            style={styles.desktopMenuButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="menu"
              size={26}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View>
            <Text style={styles.desktopTitle}>
              Dashboard
            </Text>

            <Text style={styles.desktopSubtitle}>
              Welcome back, Super Admin!
            </Text>
          </View>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.desktopRight}>
          {/* SEARCH */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search anything..."
              placeholderTextColor="rgba(255,255,255,0.65)"
            />

            <MaterialCommunityIcons
              name="magnify"
              size={21}
              color="#FFFFFF"
            />
          </View>

          {/* NOTIFICATION */}
          <TouchableOpacity
            style={styles.desktopNotification}
            onPress={openNotifications}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color="#FFFFFF"
            />

            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                8
              </Text>
            </View>
          </TouchableOpacity>

          {/* PROFILE */}
          <TouchableOpacity
            style={styles.desktopProfile}
            onPress={openProfile}
            activeOpacity={0.7}
          >
            <View style={styles.desktopAvatar}>
              <MaterialCommunityIcons
                name="account"
                size={23}
                color="#7C879B"
              />
            </View>

            <Text style={styles.profileName}>
              Super Admin
            </Text>

            <MaterialCommunityIcons
              name="chevron-down"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* DESKTOP MODALS */}
      <NotificationModal
        visible={notificationVisible}
        onClose={closeAll}
        isDesktop={true}
        notifications={notifications}
      />

      <ProfileModal
        visible={profileVisible}
        onClose={closeAll}
        isDesktop={true}
        onOption={handleProfileOption}
      />
    </>
  );
};

/* ========================================================= */
/* NOTIFICATION MODAL                                        */
/* ========================================================= */

type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
  isDesktop: boolean;
  notifications: {
    id: number;
    icon: string;
    title: string;
    message: string;
    time: string;
  }[];
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  isDesktop,
  notifications,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.notificationPanel,
            isDesktop
              ? styles.desktopNotificationPanel
              : styles.mobileNotificationPanel,
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          {/* HEADER */}
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>
                Notifications
              </Text>

              <Text style={styles.panelSubtitle}>
                You have 8 unread notifications
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={21}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* NOTIFICATIONS */}
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationItem}
              activeOpacity={0.7}
            >
              <View style={styles.notificationIcon}>
                <MaterialCommunityIcons
                  name={notification.icon as any}
                  size={21}
                  color="#6D35D8"
                />
              </View>

              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>

                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>

                <Text style={styles.notificationTime}>
                  {notification.time}
                </Text>
              </View>

              <View style={styles.unreadDot} />
            </TouchableOpacity>
          ))}

          {/* VIEW ALL */}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onClose}
          >
            <Text style={styles.viewAllText}>
              View All Notifications
            </Text>

            <MaterialCommunityIcons
              name="arrow-right"
              size={17}
              color="#6D35D8"
            />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/* ========================================================= */
/* PROFILE MODAL                                             */
/* ========================================================= */

type ProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  isDesktop: boolean;
  onOption: (option: string) => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  isDesktop,
  onOption,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.profilePanel,
            isDesktop
              ? styles.desktopProfilePanel
              : styles.mobileProfilePanel,
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          {/* PROFILE HEADER */}
          <View style={styles.profileHeader}>
            <View style={styles.largeAvatar}>
              <MaterialCommunityIcons
                name="account"
                size={34}
                color="#6D35D8"
              />
            </View>

            <View style={styles.profileHeaderText}>
              <Text style={styles.profileTitle}>
                Super Admin
              </Text>

              <Text style={styles.profileEmail}>
                admin@coachingerp.com
              </Text>
            </View>
          </View>

          <View style={styles.profileDivider} />

          {/* MY PROFILE */}
          <TouchableOpacity
            style={styles.profileOption}
            onPress={() => onOption('profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileOptionIcon}>
              <MaterialCommunityIcons
                name="account-outline"
                size={21}
                color="#6D35D8"
              />
            </View>

            <Text style={styles.profileOptionText}>
              My Profile
            </Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {/* SETTINGS */}
          <TouchableOpacity
            style={styles.profileOption}
            onPress={() => onOption('settings')}
            activeOpacity={0.7}
          >
            <View style={styles.profileOptionIcon}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={21}
                color="#6D35D8"
              />
            </View>

            <Text style={styles.profileOptionText}>
              Settings
            </Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {/* LOGOUT */}
          <TouchableOpacity
            style={styles.profileOption}
            onPress={() => onOption('logout')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileOptionIcon,
                styles.logoutIcon,
              ]}
            >
              <MaterialCommunityIcons
                name="logout"
                size={21}
                color="#EF4444"
              />
            </View>

            <Text
              style={[
                styles.profileOptionText,
                styles.logoutText,
              ]}
            >
              Logout
            </Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/* ========================================================= */
/* STYLES                                                     */
/* ========================================================= */

const styles = StyleSheet.create({
  /* ============================= */
  /* MOBILE HEADER */
  /* ============================= */

  mobileHeader: {
    width: '100%',
    backgroundColor: '#6D35D8',
    borderBottomWidth: 0,
    paddingTop: 30,
    paddingHorizontal: 18,
    paddingBottom: 15,
  },

  mobileTopRow: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },

  mobileMenuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  mobileTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  mobileTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 25,
    lineHeight: 32,
    color: '#FFFFFF',
  },

  mobileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  mobileNotification: {
    width: 40,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  mobileProfileButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginLeft: 47,
    marginTop: 2,
  },

  /* ============================= */
  /* NOTIFICATION BADGE */
  /* ============================= */

  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#5A2BC4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#FFFFFF',
  },

  /* ============================= */
  /* DESKTOP HEADER */
  /* ============================= */

  desktopHeader: {
    width: '100%',
    minHeight: 82,
    backgroundColor: '#6D35D8',
    borderBottomWidth: 0,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  desktopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  desktopMenuButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  desktopTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 23,
    color: '#FFFFFF',
  },

  desktopSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 1,
  },

  desktopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  /* ============================= */
  /* SEARCH */
  /* ============================= */

  searchContainer: {
    width: 225,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#FFFFFF',
    paddingVertical: 0,
  },

  /* ============================= */
  /* DESKTOP NOTIFICATION */
  /* ============================= */

  desktopNotification: {
    width: 40,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  /* ============================= */
  /* DESKTOP PROFILE */
  /* ============================= */

  desktopProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 1,
  },

  desktopAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  profileName: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
    color: '#FFFFFF',
    marginRight: 2,
  },

  /* ============================= */
  /* MODAL */
  /* ============================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },

  /* ============================= */
  /* NOTIFICATION PANEL */
  /* ============================= */

  notificationPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },

  desktopNotificationPanel: {
    width: 390,
    marginTop: 78,
    marginRight: 105,
  },

  mobileNotificationPanel: {
    width: '92%',
    marginTop: 82,
    marginRight: '4%',
  },

  panelHeader: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F4',
  },

  panelTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#172033',
  },

  panelSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#7B8498',
    marginTop: 2,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
  },

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
    color: '#202B3E',
  },

  notificationMessage: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#748096',
    marginTop: 2,
  },

  notificationTime: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#A0A8B7',
    marginTop: 4,
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6D35D8',
    marginTop: 6,
    marginLeft: 7,
  },

  viewAllButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  viewAllText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#6D35D8',
  },

  /* ============================= */
  /* PROFILE PANEL */
  /* ============================= */

  profilePanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },

  desktopProfilePanel: {
    width: 280,
    marginTop: 78,
    marginRight: 24,
  },

  mobileProfilePanel: {
    width: 280,
    marginTop: 82,
    marginRight: 15,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },

  largeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileHeaderText: {
    marginLeft: 12,
    flex: 1,
  },

  profileTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#172033',
  },

  profileEmail: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#7B8498',
    marginTop: 2,
  },

  profileDivider: {
    height: 1,
    backgroundColor: '#EEF0F4',
  },

  profileOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  profileOptionIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  profileOptionText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
    color: '#334155',
  },

  logoutIcon: {
    backgroundColor: '#FEF2F2',
  },

  logoutText: {
    color: '#EF4444',
  },
});

export default DashboardHeader;