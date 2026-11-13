import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationRecord,
} from '@/services/notifications';

type StudentHeaderProps = {
  onNotificationPress?: () => void;
  onViewAllNotifications?: () => void;
  onAnnouncementPress?: () => void;
  onPTGPress?: () => void;
  onMessagesPress?: () => void;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onLogoutPress?: () => void;
  unreadCount?: number;
  studentName?: string;
  studentDetails?: string;
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
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const getNotificationIcon = (
  type?: string,
  title?: string
): keyof typeof Ionicons.glyphMap => {
  const t = (type || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  if (t === 'announcement' || titleLower.includes('announcement'))
    return 'megaphone-outline';
  if (t === 'assignment' || titleLower.includes('assignment'))
    return 'document-text-outline';
  if (
    t === 'test' ||
    t === 'exam' ||
    titleLower.includes('test') ||
    titleLower.includes('exam')
  )
    return 'clipboard-outline';
  if (t === 'attendance' || titleLower.includes('attendance'))
    return 'checkmark-circle-outline';
  if (t === 'fee' || t === 'fees' || titleLower.includes('fee'))
    return 'wallet-outline';
  if (
    t === 'lecture' ||
    titleLower.includes('lecture') ||
    titleLower.includes('notes')
  )
    return 'book-outline';
  return 'notifications-outline';
};

export default function StudentHeader({
  onNotificationPress,
  onViewAllNotifications,
  onAnnouncementPress,
  onPTGPress,
  onMessagesPress,
  onMenuPress,
  onProfilePress,
  onLogoutPress,
  unreadCount = 0,
  studentName,
  studentDetails,
}: StudentHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [greeting, setGreeting] = useState('Good Morning');
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

  useEffect(() => {
    setLocalUnreadCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
    };

    updateGreeting();

    const interval = setInterval(updateGreeting, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadRecentNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetchNotifications();
      setNotifications(res.notifications);
      setLocalUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('Failed to load header notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const handleOpenNotificationModal = () => {
    setNotificationModalVisible(true);
    void loadRecentNotifications();
  };

  const handleMarkAllRead = async () => {
    if (localUnreadCount === 0) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setLocalUnreadCount(0);
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleNotificationItemPress = async (item: NotificationRecord) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setLocalUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationAsRead(item.id);
      } catch (err) {
        console.error('Mark read error:', err);
      }
    }

    setNotificationModalVisible(false);

    const isAnnouncement =
      item.type === 'announcement' ||
      item.title.toLowerCase().includes('announcement');

    const isPTG =
      item.type === 'ptg' ||
      item.title.toLowerCase().includes('ptg') ||
      item.message.toLowerCase().includes('ptg');

    if (isAnnouncement && onAnnouncementPress) {
      onAnnouncementPress();
    } else if (isPTG && onPTGPress) {
      onPTGPress();
    } else if (onViewAllNotifications) {
      onViewAllNotifications();
    } else if (onNotificationPress) {
      onNotificationPress();
    }
  };

  const handleViewAllNotifications = () => {
    setNotificationModalVisible(false);
    if (onViewAllNotifications) {
      onViewAllNotifications();
    } else if (onNotificationPress) {
      onNotificationPress();
    }
  };

  const displayName = user?.fullName || studentName || 'Student';
  const displayDetails =
    user?.standard && user?.batchName
      ? `${user.standard} • ${user.batchName}`
      : user?.standard
      ? `${user.standard} • Student`
      : studentDetails || 'Student';

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';

  return (
    <>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <StatusBar
          style="light"
          backgroundColor="#6630D7"
        />

        <View style={styles.headerRow}>
          {/* STUDENT INFORMATION */}
          <View style={styles.studentContainer}>
            <Text style={styles.greeting}>
              {greeting}, 👋
            </Text>

            <Text style={styles.studentName} numberOfLines={1}>
              {displayName}
            </Text>

            <Text style={styles.studentDetails} numberOfLines={1}>
              {displayDetails}
            </Text>
          </View>

          {/* NOTIFICATION BELL BUTTON */}
          <Pressable
            onPress={handleOpenNotificationModal}
            style={styles.notificationButton}
            hitSlop={8}
          >
            <Ionicons
              name="notifications-outline"
              size={27}
              color="#FFFFFF"
            />

            {localUnreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {localUnreadCount > 99 ? '99+' : localUnreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* PROFILE CIRCLE */}
          <Pressable
            style={styles.profileCircle}
            onPress={() => setProfileModalVisible(true)}
            hitSlop={6}
          >
            {initials ? (
              <Text style={styles.avatarInitialsText}>{initials}</Text>
            ) : (
              <Ionicons
                name="person"
                size={25}
                color="#6630D7"
              />
            )}
          </Pressable>
        </View>
      </View>

      {/* NOTIFICATION POPUP MODAL */}
      <Modal
        visible={notificationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <Pressable
          style={styles.notificationOverlay}
          onPress={() => setNotificationModalVisible(false)}
        >
          <Pressable
            style={[
              styles.notificationPanel,
              { marginTop: insets.top + 60 },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* PANEL HEADER */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>Notifications</Text>
                <Text style={styles.panelSubtitle}>
                  {`You have ${localUnreadCount} unread notification${
                    localUnreadCount === 1 ? '' : 's'
                  }`}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setNotificationModalVisible(false)}
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* MARK ALL READ ROW */}
            <View style={styles.panelActionRow}>
              <TouchableOpacity
                onPress={handleMarkAllRead}
                disabled={localUnreadCount === 0}
                style={[
                  styles.markAllButton,
                  localUnreadCount === 0 && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            </View>

            {/* NOTIFICATIONS LIST */}
            <ScrollView
              style={styles.notificationListScroll}
              contentContainerStyle={{ paddingBottom: 6 }}
              showsVerticalScrollIndicator={false}
            >
              {loadingNotifications && notifications.length === 0 ? (
                <View style={styles.notificationCenterMessage}>
                  <ActivityIndicator size="small" color="#6630D7" />
                  <Text style={[styles.notificationEmptyText, { marginTop: 8 }]}>
                    Loading notifications...
                  </Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.notificationCenterMessage}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={32}
                    color="#94A3B8"
                  />
                  <Text style={styles.notificationEmptyText}>
                    You are all caught up.
                  </Text>
                </View>
              ) : (
                notifications.slice(0, 6).map((item) => {
                  const iconName = getNotificationIcon(item.type, item.title);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.notificationItem,
                        item.isRead && styles.notificationItemRead,
                      ]}
                      onPress={() => handleNotificationItemPress(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.itemIconBox}>
                        <Ionicons
                          name={iconName}
                          size={18}
                          color="#6630D7"
                        />
                      </View>

                      <View style={styles.itemContent}>
                        <Text
                          style={styles.itemTitle}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={styles.itemMessage}
                          numberOfLines={2}
                        >
                          {item.message}
                        </Text>
                        <Text style={styles.itemTime}>
                          {formatNotificationTime(item.createdAt)}
                        </Text>
                      </View>

                      {!item.isRead && (
                        <View style={styles.itemUnreadDot} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {/* VIEW ALL NOTIFICATIONS FOOTER */}
            <TouchableOpacity
              style={styles.viewAllFooter}
              onPress={handleViewAllNotifications}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllFooterText}>
                See All Notifications
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#6630D7"
              />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* PROFILE SLIDER MODAL */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProfileModalVisible(false)}
        >
          <Pressable
            style={[
              styles.sliderPanel,
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sliderHandle} />

            {/* Profile Info Header */}
            <View style={styles.sliderProfileRow}>
              <View style={styles.sliderAvatar}>
                <Text style={styles.sliderAvatarText}>{initials}</Text>
              </View>

              <View style={styles.sliderProfileInfo}>
                <Text style={styles.sliderProfileName} numberOfLines={1}>
                  {displayName}
                </Text>

                <Text style={styles.sliderProfileDetails} numberOfLines={1}>
                  {displayDetails}
                </Text>

                {!!user?.email && (
                  <Text style={styles.sliderProfileEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                )}
              </View>

              <Pressable
                style={styles.sliderCloseButton}
                onPress={() => setProfileModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color="#7E7292" />
              </Pressable>
            </View>

            <View style={styles.sliderDivider} />

            {/* Options */}
            <Pressable
              style={styles.sliderOption}
              onPress={() => {
                setProfileModalVisible(false);
                if (onProfilePress) {
                  onProfilePress();
                }
              }}
            >
              <View style={styles.sliderOptionIcon}>
                <Ionicons name="person-outline" size={20} color="#6630D7" />
              </View>

              <View style={styles.sliderOptionTextContainer}>
                <Text style={styles.sliderOptionTitle}>My Profile</Text>
                <Text style={styles.sliderOptionSubtitle}>
                  View & edit account details
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#999" />
            </Pressable>

            <Pressable
              style={styles.sliderOption}
              onPress={() => {
                setProfileModalVisible(false);
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout from your student account?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Logout',
                      style: 'destructive',
                      onPress: () => {
                        if (onLogoutPress) {
                          onLogoutPress();
                        } else {
                          void logout();
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <View
                style={[
                  styles.sliderOptionIcon,
                  styles.logoutOptionIcon,
                ]}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#EF4444"
                />
              </View>

              <View style={styles.sliderOptionTextContainer}>
                <Text
                  style={[
                    styles.sliderOptionTitle,
                    styles.logoutOptionTitle,
                  ]}
                >
                  Logout
                </Text>
                <Text style={styles.sliderOptionSubtitle}>
                  Sign out from this device
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#EF4444"
              />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: '#6630D7',
    marginTop: 17,
    paddingHorizontal: 17,
    paddingVertical: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* =========================
     STUDENT INFO
  ========================= */

  studentContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    marginLeft: 15,
    marginRight: 5,
  },

  greeting: {
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    color: '#E9DDFF',
    lineHeight: 17,
  },

  studentName: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#FFFFFF',
    lineHeight: 27,
    includeFontPadding: false,
  },

  studentDetails: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#DCCBFF',
    lineHeight: 14,
    marginTop: 1,
  },

  /* =========================
     NOTIFICATION BUTTON
  ========================= */

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
    position: 'relative',
    flexShrink: 0,
  },

  badge: {
    position: 'absolute',
    top: -3,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF4D67',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6630D7',
  },

  badgeText: {
    fontFamily: 'PoppinsBold',
    fontSize: 7,
    lineHeight: 9,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* =========================
     PROFILE
  ========================= */

  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  avatarInitialsText: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#6630D7',
  },

  /* =========================
     NOTIFICATION MODAL
  ========================= */

  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 16,
  },

  notificationPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    maxHeight: 460,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  panelTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#111528',
  },

  panelSubtitle: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    marginTop: 2,
  },

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  panelActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 6,
  },

  markAllButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },

  markAllText: {
    fontSize: 11,
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },

  notificationListScroll: {
    maxHeight: 270,
  },

  notificationCenterMessage: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationEmptyText: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#94A3B8',
  },

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },

  notificationItemRead: {
    opacity: 0.65,
  },

  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  itemContent: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: '#111528',
  },

  itemMessage: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },

  itemTime: {
    fontSize: 10,
    fontFamily: 'PoppinsRegular',
    color: '#A0A8B7',
    marginTop: 4,
  },

  itemUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6630D7',
    marginLeft: 6,
    marginTop: 6,
  },

  viewAllFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },

  viewAllFooterText: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },

  /* =========================
     SLIDER MODAL
  ========================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },

  sliderPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  sliderHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },

  sliderProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  sliderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  sliderAvatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#6630D7',
  },

  sliderProfileInfo: {
    flex: 1,
    minWidth: 0,
  },

  sliderProfileName: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#1E1B26',
  },

  sliderProfileDetails: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#6630D7',
    marginTop: 1,
  },

  sliderProfileEmail: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#8A82A0',
    marginTop: 1,
  },

  sliderCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F5FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  sliderDivider: {
    height: 1,
    backgroundColor: '#F1EEF8',
    marginBottom: 8,
  },

  sliderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },

  sliderOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoutOptionIcon: {
    backgroundColor: '#FEE2E2',
  },

  sliderOptionTextContainer: {
    flex: 1,
  },

  sliderOptionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#1E1B26',
  },

  logoutOptionTitle: {
    color: '#EF4444',
  },

  sliderOptionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#8A82A0',
    marginTop: 1,
  },
});
