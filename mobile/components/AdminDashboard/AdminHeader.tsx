import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
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
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type NotificationItem = {
  id: string;
  icon: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
  type?: string;
};

const getNotificationIcon = (
  type?: string,
  icon?: string
): keyof typeof MaterialCommunityIcons.glyphMap => {
  if (icon && icon in MaterialCommunityIcons.glyphMap) {
    return icon as keyof typeof MaterialCommunityIcons.glyphMap;
  }
  switch (type) {
    case 'registration':
      return 'account-plus-outline';
    case 'approval':
      return 'check-circle-outline';
    case 'rejection':
      return 'close-circle-outline';
    case 'fee':
      return 'cash-clock';
    case 'attendance':
      return 'calendar-check-outline';
    case 'leave':
      return 'account-clock-outline';
    case 'message':
      return 'email-outline';
    default:
      return 'bell-outline';
  }
};

const getNotificationColor = (type?: string, icon?: string): string => {
  if (type === 'fee' || icon?.includes('cash')) return '#E95386';
  if (type === 'registration' || icon?.includes('account-plus')) return '#2675E8';
  if (type === 'approval' || icon?.includes('check')) return '#35B878';
  if (type === 'rejection' || icon?.includes('close')) return '#EF4444';
  if (type === 'attendance' || icon?.includes('calendar')) return '#F7941D';
  if (type === 'message' || icon?.includes('email')) return '#7040D5';
  return '#7040D5';
};

const formatNotificationTime = (dateValue?: string): string => {
  if (!dateValue) return 'Recently';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { logout } = useAuth();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Unable to load notifications.');
      }

      const items = Array.isArray(result?.data?.notifications)
        ? result.data.notifications
        : [];

      setNotifications(
        items.map((item: any) => ({
          id: String(item._id || item.id),
          icon: item.icon || getNotificationIcon(item.type, item.icon),
          title: item.title || 'Notification',
          message: item.message || '',
          time: formatNotificationTime(item.createdAt),
          isRead: Boolean(item.isRead),
          link: item.link || '',
          type: item.type || 'general',
        }))
      );
      setUnreadCount(
        Number(
          result?.data?.unreadCount ??
            items.filter((item: any) => !item.isRead).length
        )
      );
    } catch (err) {
      console.error('Fetch admin notifications error:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to load notifications.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationAsRead = async (notificationId: string) => {
    const selected = notifications.find((item) => item.id === notificationId);
    if (!selected || selected.isRead) return;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item
      )
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Mark notification as read error:', err);
      void fetchNotifications();
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (unreadCount === 0) return;
    const previous = notifications;
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true }))
    );
    setUnreadCount(0);

    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
    } catch (err) {
      console.error('Mark all notifications error:', err);
      setNotifications(previous);
      void fetchNotifications();
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    await markNotificationAsRead(notification.id);
    closeAll();

    if (notification.link) {
      try {
        router.push(notification.link as any);
        return;
      } catch (err) {
        console.error('Notification navigation error:', err);
      }
    }

    const titleLower = notification.title.toLowerCase();
    if (
      notification.type === 'registration' ||
      titleLower.includes('registration')
    ) {
      openAdminFeature('Students');
    } else if (notification.type === 'fee' || titleLower.includes('fee')) {
      openAdminFeature('Reports');
    } else if (
      notification.type === 'attendance' ||
      titleLower.includes('attendance')
    ) {
      openAdminFeature('Attendance');
    } else if (
      titleLower.includes('message') ||
      notification.icon?.includes('email')
    ) {
      openAdminFeature('Messages');
    } else if (titleLower.includes('leave')) {
      openAdminFeature('Staff on Leave');
    }
  };

  const handleLogout = async () => {
    closeAll();

    try {
      if (router.canDismiss?.()) {
        router.dismissAll();
      }
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
    void fetchNotifications();
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

    if (option === 'logout') {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout from your admin account?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
              void handleLogout();
            },
          },
        ]
      );
      return;
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
            accessibilityLabel={`Notifications, ${unreadCount} unread`}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={26}
              color="#FFFFFF"
            />

            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
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

            <View style={styles.popupHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.popupTitle}>
                  Notifications
                </Text>
                <Text style={styles.popupSubtitle}>
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                    : 'All notifications caught up'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={markAllNotificationsAsRead}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    style={{ marginRight: 10 }}
                  >
                    <Text style={styles.markAllReadText}>
                      Mark all read
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={closeAll}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={19}
                    color="#7B8798"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* NOTIFICATION CONTENT */}

            {loading && notifications.length === 0 ? (
              <View style={styles.notificationStateContainer}>
                <ActivityIndicator size="small" color="#7040D5" />
                <Text style={styles.notificationStateText}>
                  Loading notifications...
                </Text>
              </View>
            ) : error && notifications.length === 0 ? (
              <View style={styles.notificationStateContainer}>
                <Text style={styles.notificationStateText}>
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={fetchNotifications}
                  style={styles.retryButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryButtonText}>
                    Try again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.notificationStateContainer}>
                <MaterialCommunityIcons
                  name="bell-check-outline"
                  size={28}
                  color="#A0A9B8"
                />
                <Text style={[styles.notificationStateText, { marginTop: 6 }]}>
                  You are all caught up.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: 340 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 4 }}
              >
                {notifications.map((notification) => {
                  const iconName = getNotificationIcon(
                    notification.type,
                    notification.icon
                  );
                  const iconColor = getNotificationColor(
                    notification.type,
                    notification.icon
                  );

                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        notification.isRead && styles.notificationItemRead,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => void handleNotificationPress(notification)}
                    >
                      <View
                        style={[
                          styles.notificationIcon,
                          {
                            backgroundColor:
                              iconColor === '#E95386'
                                ? '#FFE9F0'
                                : iconColor === '#2675E8'
                                ? '#EAF2FF'
                                : iconColor === '#35B878'
                                ? '#E7F8EF'
                                : iconColor === '#F7941D'
                                ? '#FFF1E2'
                                : '#F1EAFF',
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={iconName}
                          size={18}
                          color={iconColor}
                        />
                      </View>

                      <View style={styles.notificationText}>
                        <View style={styles.notificationTitleRow}>
                          <Text
                            style={[
                              styles.notificationTitle,
                              !notification.isRead &&
                                styles.notificationTitleUnread,
                            ]}
                            numberOfLines={1}
                          >
                            {notification.title}
                          </Text>

                          <Text style={styles.notificationTime}>
                            {notification.time}
                          </Text>
                        </View>

                        <Text
                          style={styles.notificationDescription}
                          numberOfLines={2}
                        >
                          {notification.message}
                        </Text>
                      </View>

                      {!notification.isRead && (
                        <View style={styles.notificationUnreadDot} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

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

  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsBold',
    fontSize: 8.5,
    lineHeight: 11,
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
    width: 325,
    maxWidth: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
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

  popupSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#7B8798',
    marginTop: 1,
  },

  markAllReadText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
  },

  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F4F5F8',
    alignItems: 'center',
  },

  notificationItemRead: {
    opacity: 0.6,
  },

  notificationIcon: {
    width: 34,
    height: 34,
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

  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  notificationTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#172033',
    flex: 1,
    marginRight: 4,
  },

  notificationTitleUnread: {
    color: '#172033',
    fontFamily: 'PoppinsBold',
  },

  notificationTime: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#9CA3AF',
  },

  notificationDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8792A4',
    marginTop: 2,
    lineHeight: 12,
  },

  notificationUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7040D5',
    marginLeft: 6,
  },

  notificationStateContainer: {
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationStateText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#8792A4',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F1EAFF',
    borderRadius: 8,
  },

  retryButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
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