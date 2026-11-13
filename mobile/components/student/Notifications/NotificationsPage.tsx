import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationRecord,
} from '../../../services/notifications';

export type NotificationType =
  | 'assignment'
  | 'test'
  | 'attendance'
  | 'lecture'
  | 'fees'
  | 'announcement'
  | 'message'
  | 'meeting'
  | 'general';

export type StudentNotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  link?: string;
  rawDate: string;
};

type NotificationsPageProps = {
  onContentScroll?: (event: any) => void;
  onNavigate?: (page: string) => void;
  onUnreadCountChange?: (count: number) => void;
};

const formatNotificationTime = (dateValue?: string): string => {
  if (!dateValue) return 'Recently';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const resolveNotificationType = (rawType?: string, title?: string): NotificationType => {
  const t = (rawType || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  if (t === 'fee' || t === 'fees' || titleLower.includes('fee')) return 'fees';
  if (t === 'attendance' || titleLower.includes('attendance')) return 'attendance';
  if (t === 'assignment' || titleLower.includes('assignment')) return 'assignment';
  if (
    t === 'test' ||
    t === 'exam' ||
    titleLower.includes('test') ||
    titleLower.includes('exam')
  )
    return 'test';
  if (t === 'lecture' || titleLower.includes('lecture') || titleLower.includes('notes'))
    return 'lecture';
  if (t === 'announcement' || titleLower.includes('announcement'))
    return 'announcement';
  if (t === 'message' || titleLower.includes('message')) return 'message';
  if (titleLower.includes('ptg') || titleLower.includes('meeting')) return 'meeting';
  return 'general';
};

const getNotificationIcon = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'assignment':
      return 'document-text-outline';
    case 'test':
      return 'clipboard-outline';
    case 'attendance':
      return 'checkmark-circle-outline';
    case 'lecture':
      return 'book-outline';
    case 'fees':
      return 'wallet-outline';
    case 'announcement':
      return 'megaphone-outline';
    case 'message':
      return 'mail-outline';
    case 'meeting':
      return 'calendar-outline';
    default:
      return 'notifications-outline';
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'assignment':
      return { icon: '#7C4DFF', background: '#F0E9FF' };
    case 'test':
      return { icon: '#3976E8', background: '#EAF2FF' };
    case 'attendance':
      return { icon: '#20A66A', background: '#E8F8F0' };
    case 'lecture':
      return { icon: '#D58B20', background: '#FFF5E4' };
    case 'fees':
      return { icon: '#E45757', background: '#FFECEC' };
    case 'announcement':
      return { icon: '#8C4FC8', background: '#F4EAFE' };
    case 'message':
      return { icon: '#2563EB', background: '#EFF6FF' };
    case 'meeting':
      return { icon: '#0284C7', background: '#E0F2FE' };
    default:
      return { icon: '#6630D7', background: '#F0E9FF' };
  }
};

export default function NotificationsPage({
  onContentScroll,
  onNavigate,
  onUnreadCountChange,
}: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotificationsData = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchNotifications();
      const mapped: StudentNotificationItem[] = result.notifications.map(
        (item: NotificationRecord) => ({
          id: item.id,
          type: resolveNotificationType(item.type, item.title),
          title: item.title,
          message: item.message,
          time: formatNotificationTime(item.createdAt),
          unread: !item.isRead,
          link: item.link,
          rawDate: item.createdAt,
        })
      );
      setNotifications(mapped);
      onUnreadCountChange?.(result.unreadCount);
    } catch (err: any) {
      console.error('Fetch student notifications error:', err);
      setError(err?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    void loadNotificationsData();
  }, [loadNotificationsData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotificationsData();
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((notification) => notification.unread);
    }
    return notifications;
  }, [filter, notifications]);

  const handleMarkAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || !target.unread) return;

    // Optimistically update
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
    const newUnread = Math.max(0, unreadCount - 1);
    onUnreadCountChange?.(newUnread);

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error('Mark notification read error:', err);
      void loadNotificationsData();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    const previous = notifications;
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
    onUnreadCountChange?.(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error('Mark all read error:', err);
      setNotifications(previous);
      onUnreadCountChange?.(unreadCount);
    }
  };

  const handleNotificationPress = async (notification: StudentNotificationItem) => {
    await handleMarkAsRead(notification.id);

    // Route to the appropriate screen if actionable
    if (notification.type === 'fees') {
      onNavigate?.('feeOverview');
    } else if (notification.type === 'attendance') {
      onNavigate?.('attendance');
    } else if (notification.type === 'assignment') {
      onNavigate?.('assignments');
    } else if (notification.type === 'lecture') {
      onNavigate?.('lectureNotes');
    } else if (notification.type === 'test') {
      onNavigate?.('upcomingTests');
    } else if (notification.type === 'announcement') {
      onNavigate?.('announcements');
    } else {
      Alert.alert(notification.title, notification.message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={onContentScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#6630D7"
          colors={['#6630D7']}
        />
      }
    >
      {/* Header summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="notifications-outline"
            size={23}
            color="#6630D7"
          />
        </View>

        <View style={styles.summaryTextContainer}>
          <Text style={styles.summaryTitle}>Notifications</Text>
          <Text style={styles.summarySubtitle}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You are all caught up'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <Pressable
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all</Text>
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            filter === 'unread' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'unread' && styles.activeFilterText,
            ]}
          >
            Unread
          </Text>

          {unreadCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Notifications list */}
      <View style={styles.list}>
        {loading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6630D7" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : error && notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={32} color="#E45757" />
            <Text style={styles.emptyTitle}>Could not load notifications</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={28}
                color="#6630D7"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread'
                ? 'You’re all caught up for now.'
                : 'Your notifications will appear here.'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => {
            const colors = getNotificationColor(notification.type);

            return (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.unread && styles.unreadCard,
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Ionicons
                    name={getNotificationIcon(notification.type)}
                    size={21}
                    color={colors.icon}
                  />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        notification.unread && styles.unreadTitle,
                      ]}
                      numberOfLines={1}
                    >
                      {notification.title}
                    </Text>

                    {notification.unread && <View style={styles.unreadDot} />}
                  </View>

                  <Text
                    style={styles.notificationMessage}
                    numberOfLines={3}
                  >
                    {notification.message}
                  </Text>

                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#B2A9C5"
                />
              </Pressable>
            );
          })
        )}
      </View>

      {/* Information footer */}
      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#6630D7"
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Stay updated</Text>
          <Text style={styles.infoText}>
            You’ll receive real-time notifications about assignments, tests,
            attendance, lecture notes, fees, and institution announcements.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 105,
    marginTop: 2,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F0E9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  summaryTextContainer: {
    flex: 1,
  },

  summaryTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#1B143F',
  },

  summarySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#7D7694',
    marginTop: 1,
  },

  markAllButton: {
    backgroundColor: '#F0E9FF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },

  markAllText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#6630D7',
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
    gap: 8,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6F6',
  },

  activeFilterButton: {
    backgroundColor: '#6630D7',
    borderColor: '#6630D7',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#6E6685',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  filterBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },

  filterBadgeText: {
    fontFamily: 'PoppinsBold',
    fontSize: 8.5,
    color: '#6630D7',
  },

  list: {
    marginTop: 6,
  },

  loadingContainer: {
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7D7694',
    marginTop: 10,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1ECF8',
  },

  unreadCard: {
    borderColor: '#E2D5F8',
    backgroundColor: '#FBF9FF',
  },

  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  notificationContent: {
    flex: 1,
    marginRight: 8,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#2A244D',
    flex: 1,
  },

  unreadTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#1B143F',
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6630D7',
    marginLeft: 6,
  },

  notificationMessage: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#716B88',
    lineHeight: 14.5,
    marginTop: 2,
  },

  notificationTime: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#9F98B3',
    marginTop: 4,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F0E9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    color: '#1B143F',
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#89829F',
    marginTop: 3,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#6630D7',
  },

  retryButtonText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#FFFFFF',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ECE6F6',
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#F0E9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#1B143F',
  },

  infoText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#7D7694',
    lineHeight: 14.5,
    marginTop: 2,
  },
});
