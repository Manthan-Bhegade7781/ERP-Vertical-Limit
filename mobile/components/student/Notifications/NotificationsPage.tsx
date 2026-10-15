import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NotificationType =
  | 'assignment'
  | 'test'
  | 'attendance'
  | 'lecture'
  | 'fees'
  | 'announcement';

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

type NotificationsPageProps = {
  onContentScroll?: (event: any) => void;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 'notification-1',
    type: 'assignment',
    title: 'New Assignment',
    message:
      'Newton’s Laws Assignment has been added. Due date is 18 Sep 2026.',
    time: '10 min ago',
    unread: true,
  },
  {
    id: 'notification-2',
    type: 'test',
    title: 'Upcoming Test',
    message:
      'Physics Unit Test is scheduled for 18 Sep 2026 at 10:00 AM.',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 'notification-3',
    type: 'lecture',
    title: 'Lecture Notes Updated',
    message:
      'New Physics lecture notes for Newton’s Laws are available.',
    time: '3 hours ago',
    unread: true,
  },
  {
    id: 'notification-4',
    type: 'attendance',
    title: 'Attendance Updated',
    message:
      'Your attendance has been updated for today’s Mathematics class.',
    time: 'Today',
    unread: false,
  },
  {
    id: 'notification-5',
    type: 'fees',
    title: 'Fee Reminder',
    message:
      'Your pending fee amount is ₹2,000. Please check the Fees section.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'notification-6',
    type: 'announcement',
    title: 'New Announcement',
    message:
      'The school has posted a new announcement for 10th Standard students.',
    time: 'Yesterday',
    unread: false,
  },
];

const getNotificationIcon = (
  type: NotificationType,
): keyof typeof Ionicons.glyphMap => {
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

    default:
      return 'notifications-outline';
  }
};

const getNotificationColor = (
  type: NotificationType,
) => {
  switch (type) {
    case 'assignment':
      return {
        icon: '#7C4DFF',
        background: '#F0E9FF',
      };

    case 'test':
      return {
        icon: '#3976E8',
        background: '#EAF2FF',
      };

    case 'attendance':
      return {
        icon: '#20A66A',
        background: '#E8F8F0',
      };

    case 'lecture':
      return {
        icon: '#D58B20',
        background: '#FFF5E4',
      };

    case 'fees':
      return {
        icon: '#E45757',
        background: '#FFECEC',
      };

    case 'announcement':
      return {
        icon: '#8C4FC8',
        background: '#F4EAFE',
      };

    default:
      return {
        icon: '#6630D7',
        background: '#F0E9FF',
      };
  }
};

export default function NotificationsPage({
  onContentScroll,
}: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(
    initialNotifications,
  );

  const [filter, setFilter] = useState<
    'all' | 'unread'
  >('all');

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        notification => notification.unread,
      ).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(
        notification => notification.unread,
      );
    }

    return notifications;
  }, [filter, notifications]);

  const markAsRead = (id: string) => {
    setNotifications(current =>
      current.map(notification =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications(current =>
      current.map(notification => ({
        ...notification,
        unread: false,
      })),
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={onContentScroll}
      scrollEventThrottle={16}
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
          <Text style={styles.summaryTitle}>
            Notifications
          </Text>

          <Text style={styles.summarySubtitle}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount > 1 ? 's' : ''
                }`
              : 'You are all caught up'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <Pressable
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>
              Mark all
            </Text>
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
              filter === 'all' &&
                styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            filter === 'unread' &&
              styles.activeFilterButton,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'unread' &&
                styles.activeFilterText,
            ]}
          >
            Unread
          </Text>

          {unreadCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Notifications */}
      <View style={styles.list}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={28}
                color="#6630D7"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No unread notifications
            </Text>

            <Text style={styles.emptySubtitle}>
              You’re all caught up for now.
            </Text>
          </View>
        ) : (
          filteredNotifications.map(notification => {
            const colors = getNotificationColor(
              notification.type,
            );

            return (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.unread &&
                    styles.unreadCard,
                ]}
                onPress={() =>
                  markAsRead(notification.id)
                }
              >
                <View
                  style={[
                    styles.notificationIcon,
                    {
                      backgroundColor:
                        colors.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={getNotificationIcon(
                      notification.type,
                    )}
                    size={21}
                    color={colors.icon}
                  />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text
                      style={styles.notificationTitle}
                      numberOfLines={1}
                    >
                      {notification.title}
                    </Text>

                    {notification.unread && (
                      <View style={styles.unreadDot} />
                    )}
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

      {/* Information */}
      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#6630D7"
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Stay updated
          </Text>

          <Text style={styles.infoText}>
            You’ll receive notifications about assignments,
            tests, attendance, lecture notes, fees and
            school announcements.
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
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#F0E9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryTextContainer: {
    flex: 1,
    marginLeft: 11,
  },

  summaryTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#211A2D',
  },

  summarySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A8197',
    marginTop: 2,
  },

  markAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  markAllText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#6630D7',
  },

  filterRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 12,
  },

  filterButton: {
    minWidth: 72,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 8,
  },

  activeFilterButton: {
    backgroundColor: '#6630D7',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#766C83',
  },

  activeFilterText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
  },

  filterBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4D67',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },

  filterBadgeText: {
    fontFamily: 'PoppinsBold',
    fontSize: 7,
    color: '#FFFFFF',
  },

  list: {
    gap: 9,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EDF5',
  },

  unreadCard: {
    borderColor: '#E7DDFB',
    backgroundColor: '#FCFAFF',
  },

  notificationIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#211A2D',
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
    fontSize: 9,
    lineHeight: 14,
    color: '#777080',
    marginTop: 3,
  },

  notificationTime: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#A29AAE',
    marginTop: 5,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#F0E9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#211A2D',
    marginTop: 12,
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A8197',
    marginTop: 3,
  },

  infoCard: {
    marginTop: 14,
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#F0E9FF',
    flexDirection: 'row',
  },

  infoIcon: {
    width: 30,
    alignItems: 'center',
  },

  infoContent: {
    flex: 1,
    marginLeft: 3,
  },

  infoTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#4E269F',
  },

  infoText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    lineHeight: 13,
    color: '#7059A0',
    marginTop: 3,
  },
});