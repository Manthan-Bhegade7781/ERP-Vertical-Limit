import React, { useState } from 'react';

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

/* =========================================================
   NAVIGATION
========================================================= */

function openAdminFeature(feature: string) {
  if (feature === 'Dashboard') {
    router.push('/(admin)');
    return;
  }

  router.push({
    pathname: '/(admin)/explore',
    params: {
      feature,
    },
  });
}

/* =========================================================
   ADMIN HEADER
========================================================= */

export default function AdminHeader({
  isDesktop,
  onMenuPress,
}: {
  isDesktop: boolean;
  onMenuPress: () => void;
}) {
  const insets = useSafeAreaInsets();

  const [notificationVisible, setNotificationVisible] =
    useState(false);

  const [profileVisible, setProfileVisible] =
    useState(false);

  const { logout } = useAuth();

  const handleLogout = async () => {
    closeAll();

    try {
      await logout();
      router.replace('/(auth)');
    } catch {
      Alert.alert('Logout failed', 'Please try again.');
    }
  };

  /* =======================================================
     NOTIFICATIONS
  ====================================================== */

  const openNotifications = () => {
    setProfileVisible(false);
    setNotificationVisible(true);
  };

  /* =======================================================
     PROFILE
  ====================================================== */

  const openProfile = () => {
    setNotificationVisible(false);
    setProfileVisible(true);
  };

  /* =======================================================
     CLOSE POPUPS
  ====================================================== */

  const closeAll = () => {
    setNotificationVisible(false);
    setProfileVisible(false);
  };

  /* =======================================================
     PROFILE OPTIONS
  ====================================================== */

  const handleProfileOption = (option: string) => {
    setProfileVisible(false);

    if (option === 'profile') {
      openAdminFeature('Profile');
      return;
    }

    if (option === 'settings') {
      openAdminFeature('Settings');
      return;
    }

   if (option === 'logout') {
      void handleLogout();
    }
  };

  return (
    <>
      {/* =================================================
          STATUS BAR
      ================================================== */}

      <StatusBar
        backgroundColor="#7040D5"
        barStyle="light-content"
      />

      {/* =================================================
          HEADER
      ================================================== */}

      <View
        style={[
          styles.header,
          !isDesktop && styles.headerMobile,
          !isDesktop && {
            paddingTop: insets.top,
            height: 82 + insets.top,
          },
        ]}
      >

        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <View style={styles.headerLeft}>

          {/* MOBILE MENU */}

          {!isDesktop && (
            <TouchableOpacity
              style={styles.mobileMenuButton}
              onPress={onMenuPress}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="menu"
                size={27}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}

          {/* TITLE */}

          <View style={styles.headerTitleContainer}>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              Dashboard
            </Text>

            <Text
              style={styles.headerSubtitle}
              numberOfLines={1}
            >
              Branch administration overview
            </Text>

          </View>

        </View>

        {/* =================================================
            RIGHT SIDE
        ================================================== */}

        <View style={styles.headerRight}>

          {/* NOTIFICATION */}

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={openNotifications}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={26}
              color="#FFFFFF"
            />

            <View
              style={styles.notificationDot}
            />
          </TouchableOpacity>

          {/* PROFILE */}

          <TouchableOpacity
            style={styles.headerProfileButton}
            onPress={openProfile}
            activeOpacity={0.8}
          >

            {/* AVATAR */}

            <View style={styles.headerAvatar}>
              <MaterialCommunityIcons
                name="account"
                size={22}
                color="#7040D5"
              />
            </View>

            {/* DESKTOP PROFILE TEXT */}

            {isDesktop && (
              <View
                style={styles.headerProfileText}
              >
                <Text
                  style={styles.headerProfileName}
                >
                  Admin
                </Text>

                <Text
                  style={styles.headerProfileRole}
                >
                  Administrator
                </Text>
              </View>
            )}

            {/* ARROW */}

            <MaterialCommunityIcons
              name="chevron-down"
              size={21}
              color="#FFFFFF"
            />

          </TouchableOpacity>

        </View>

        {/* =================================================
            POPUP OVERLAY
        ================================================== */}

        {(notificationVisible ||
          profileVisible) && (
          <Pressable
            style={styles.popupOverlay}
            onPress={closeAll}
          />
        )}

        {/* =================================================
            NOTIFICATION POPUP
        ================================================== */}

        {notificationVisible && (
          <View
            style={[
              styles.notificationPopup,
              !isDesktop && {
                top: 82 + insets.top,
              },
            ]}
          >

            {/* POPUP HEADER */}

            <View
              style={styles.popupHeader}
            >

              <Text
                style={styles.popupTitle}
              >
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

            {/* NOTIFICATION 1 */}

            <View
              style={styles.notificationItem}
            >

              <View
                style={styles.notificationIcon}
              >
                <MaterialCommunityIcons
                  name="cash-clock"
                  size={18}
                  color="#E95386"
                />
              </View>

              <View
                style={styles.notificationText}
              >

                <Text
                  style={styles.notificationTitle}
                >
                  Pending fee collection
                </Text>

                <Text
                  style={
                    styles.notificationDescription
                  }
                >
                  Fee follow-up is required for
                  24 students.
                </Text>

              </View>

            </View>

            {/* NOTIFICATION 2 */}

            <View
              style={styles.notificationItem}
            >

              <View
                style={styles.notificationIcon}
              >
                <MaterialCommunityIcons
                  name="calendar-alert"
                  size={18}
                  color="#2675E8"
                />
              </View>

              <View
                style={styles.notificationText}
              >

                <Text
                  style={styles.notificationTitle}
                >
                  Upcoming examination
                </Text>

                <Text
                  style={
                    styles.notificationDescription
                  }
                >
                  Examination schedule requires
                  review.
                </Text>

              </View>

            </View>

          </View>
        )}

        {/* =================================================
            PROFILE POPUP
        ================================================== */}

        {profileVisible && (
          <View
            style={[
              styles.profilePopup,
              !isDesktop && {
                top: 82 + insets.top,
              },
            ]}
          >

            {/* PROFILE HEADER */}

            <View
              style={styles.profilePopupHeader}
            >

              <View
                style={styles.popupAvatar}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={22}
                  color="#7040D5"
                />
              </View>

              <View>

                <Text
                  style={styles.popupProfileName}
                >
                  Admin
                </Text>

                <Text
                  style={styles.popupProfileRole}
                >
                  Branch Administrator
                </Text>

              </View>

            </View>

            {/* PROFILE */}

            <TouchableOpacity
              style={styles.popupOption}
              onPress={() =>
                handleProfileOption(
                  'profile',
                )
              }
              activeOpacity={0.7}
            >

              <MaterialCommunityIcons
                name="account-outline"
                size={20}
                color="#66768A"
              />

              <Text
                style={styles.popupOptionText}
              >
                Profile
              </Text>

            </TouchableOpacity>

            {/* SETTINGS */}

            <TouchableOpacity
              style={styles.popupOption}
              onPress={() =>
                handleProfileOption(
                  'settings',
                )
              }
              activeOpacity={0.7}
            >

              <MaterialCommunityIcons
                name="cog-outline"
                size={20}
                color="#66768A"
              />

              <Text
                style={styles.popupOptionText}
              >
                Settings
              </Text>

            </TouchableOpacity>

            {/* LOGOUT */}

            <TouchableOpacity
              style={styles.popupOption}
              onPress={() =>
                handleProfileOption(
                  'logout',
                )
              }
              activeOpacity={0.7}
            >

              <MaterialCommunityIcons
                name="logout"
                size={20}
                color="#E95386"
              />

              <Text
                style={[
                  styles.popupOptionText,
                  styles.logoutText,
                ]}
              >
                Logout
              </Text>

            </TouchableOpacity>

          </View>
        )}

      </View>
    </>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* =====================================================
     HEADER
  ====================================================== */

  header: {
    height: 76,

    backgroundColor: '#7040D5',

    paddingHorizontal: 20,

    marginTop: 10,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    zIndex: 20,

    borderBottomLeftRadius: 28,

    borderBottomRightRadius: 28,
  },

  /* =====================================================
     MOBILE HEADER
  ====================================================== */

  headerMobile: {
    height: 82,

    paddingHorizontal: 16,

    paddingVertical: 5,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  /* =====================================================
     LEFT
  ====================================================== */

  headerLeft: {
    flexDirection: 'row',

    alignItems: 'center',

    flex: 1,

    minWidth: 0,
  },

  headerTitleContainer: {
    flex: 1,

    minWidth: 0,

    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily: 'PoppinsBold',

    fontSize: 23,

    lineHeight: 27,

    color: '#FFFFFF',

    letterSpacing: -0.2,
  },

  headerSubtitle: {
    fontFamily: 'PoppinsRegular',

    fontSize: 10.5,

    lineHeight: 15,

    color: '#EDE7FF',

    marginTop: 1,
  },

  /* =====================================================
     MOBILE MENU
  ====================================================== */

  mobileMenuButton: {
    width: 48,

    height: 48,

    borderRadius: 14,

    backgroundColor:
      'rgba(255, 255, 255, 0.14)',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,
  },

  /* =====================================================
     RIGHT
  ====================================================== */

  headerRight: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'flex-end',

    marginLeft: 8,
  },

  /* =====================================================
     NOTIFICATION
  ====================================================== */

  headerIconButton: {
    width: 40,

    height: 40,

    borderRadius: 14,

    backgroundColor:
      'rgba(255, 255, 255, 0.14)',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 8,

    position: 'relative',
  },

  notificationDot: {
    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor: '#E95386',

    position: 'absolute',

    right: 8,

    top: 7,
  },

  /* =====================================================
     PROFILE
  ====================================================== */

  headerProfileButton: {
    height: 48,

    minWidth: 52,

    borderRadius: 14,

    backgroundColor:
      'rgba(255, 255, 255, 0.14)',

    paddingHorizontal: 6,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  headerAvatar: {
    width: 40,

    height: 40,

    borderRadius: 12,

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
     POPUP OVERLAY
  ====================================================== */

  popupOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'transparent',

    zIndex: 25,
  },

  /* =====================================================
     NOTIFICATION POPUP
  ====================================================== */

  notificationPopup: {
    position: 'absolute',

    right: 16,

    top: 64,

    width: 315,

    maxWidth: '90%',

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

    minWidth: 0,
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

  /* =====================================================
     PROFILE POPUP
  ====================================================== */

  profilePopup: {
    position: 'absolute',

    right: 16,

    top: 64,

    width: 220,

    maxWidth: '90%',

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

  logoutText: {
    color: '#E95386',
  },
});