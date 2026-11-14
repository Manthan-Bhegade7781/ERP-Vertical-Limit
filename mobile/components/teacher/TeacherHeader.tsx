import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationRecord,
} from "@/services/notifications";

export type TeacherHeaderProps = {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onViewAllNotifications?: () => void;
  onAnnouncementPress?: () => void;
  onPTGPress?: () => void;
  onAssignmentsPress?: () => void;
  onExaminationsPress?: () => void;
  onMessagesPress?: () => void;
  onAttendancePress?: () => void;
  unreadCount?: number;
  teacherName?: string;
  teacherDetails?: string;
};

const formatNotificationTime = (dateValue?: string): string => {
  if (!dateValue) return "Recently";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const getNotificationIcon = (
  type?: string,
  title?: string
): keyof typeof Ionicons.glyphMap => {
  const t = (type || "").toLowerCase();
  const titleLower = (title || "").toLowerCase();
  if (t === "announcement" || titleLower.includes("announcement"))
    return "megaphone-outline";
  if (t === "assignment" || titleLower.includes("assignment"))
    return "document-text-outline";
  if (
    t === "test" ||
    t === "exam" ||
    titleLower.includes("test") ||
    titleLower.includes("exam")
  )
    return "clipboard-outline";
  if (t === "attendance" || titleLower.includes("attendance"))
    return "checkmark-circle-outline";
  if (t === "ptg" || titleLower.includes("ptg") || titleLower.includes("meeting"))
    return "people-circle-outline";
  if (t === "message" || titleLower.includes("message"))
    return "mail-outline";
  if (t === "lecture" || titleLower.includes("lecture") || titleLower.includes("notes"))
    return "book-outline";
  return "notifications-outline";
};

export default function TeacherHeader({
  onMenuPress,
  onProfilePress,
  onNotificationPress,
  onViewAllNotifications,
  onAnnouncementPress,
  onPTGPress,
  onAssignmentsPress,
  onExaminationsPress,
  onMessagesPress,
  onAttendancePress,
  unreadCount = 0,
  teacherName,
  teacherDetails,
}: TeacherHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [greeting, setGreeting] = useState("Good Morning");
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
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
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
      console.error("Failed to load header notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Fetch unread count once on mount
  useEffect(() => {
    void loadRecentNotifications();
  }, [loadRecentNotifications]);

  const handleOpenNotificationModal = () => {
    setNotificationModalVisible(true);
    void loadRecentNotifications();
    onNotificationPress?.();
  };

  const handleMarkAllRead = async () => {
    if (localUnreadCount === 0) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setLocalUnreadCount(0);
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Mark all read error:", err);
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
        console.error("Mark read error:", err);
      }
    }

    setNotificationModalVisible(false);

    const titleLower = item.title.toLowerCase();
    const msgLower = item.message.toLowerCase();
    const typeLower = item.type.toLowerCase();

    if (
      (typeLower === "announcement" || titleLower.includes("announcement")) &&
      onAnnouncementPress
    ) {
      onAnnouncementPress();
    } else if (
      (typeLower === "ptg" || titleLower.includes("ptg") || msgLower.includes("ptg")) &&
      onPTGPress
    ) {
      onPTGPress();
    } else if (
      (typeLower === "assignment" || titleLower.includes("assignment")) &&
      onAssignmentsPress
    ) {
      onAssignmentsPress();
    } else if (
      (typeLower === "exam" ||
        typeLower === "test" ||
        titleLower.includes("exam") ||
        titleLower.includes("test")) &&
      onExaminationsPress
    ) {
      onExaminationsPress();
    } else if (
      (typeLower === "message" || titleLower.includes("message")) &&
      onMessagesPress
    ) {
      onMessagesPress();
    } else if (
      (typeLower === "attendance" || titleLower.includes("attendance")) &&
      onAttendancePress
    ) {
      onAttendancePress();
    } else if (onViewAllNotifications) {
      onViewAllNotifications();
    }
  };

  const handleViewAllNotifications = () => {
    setNotificationModalVisible(false);
    if (onViewAllNotifications) {
      onViewAllNotifications();
    }
  };

  const displayName = user?.fullName || teacherName || "Teacher";
  const displayDetails =
    user?.teacher?.specialization
      ? `${user.teacher.specialization} • Teacher`
      : user?.teacher?.employeeId
      ? `ID: ${user.teacher.employeeId} • Teacher`
      : teacherDetails || "Teacher • Vertical Limit";

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TC";

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
        <StatusBar style="light" backgroundColor="#5122C8" />

        <View style={styles.headerRow}>
          {/* MENU BUTTON */}
          <Pressable
            onPress={onMenuPress}
            style={styles.menuButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
          >
            <Ionicons name="menu" size={26} color="#FFFFFF" />
          </Pressable>

          {/* TEACHER INFORMATION */}
          <View style={styles.teacherContainer}>
            <Text style={styles.greeting}>{greeting}, 👋</Text>
            <Text style={styles.teacherName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.teacherDetails} numberOfLines={1}>
              {displayDetails}
            </Text>
          </View>

          {/* NOTIFICATION BELL BUTTON */}
          <Pressable
            onPress={handleOpenNotificationModal}
            style={styles.notificationButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={25} color="#FFFFFF" />

            {localUnreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {localUnreadCount > 99 ? "99+" : localUnreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* PROFILE CIRCLE */}
          <Pressable
            style={styles.profileCircle}
            onPress={onProfilePress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            {initials ? (
              <Text style={styles.avatarInitialsText}>{initials}</Text>
            ) : (
              <Ionicons name="person" size={22} color="#5122C8" />
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
                    localUnreadCount === 1 ? "" : "s"
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
                  <ActivityIndicator size="small" color="#5122C8" />
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
                        <Ionicons name={iconName} size={18} color="#5122C8" />
                      </View>

                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemMessage} numberOfLines={2}>
                          {item.message}
                        </Text>
                        <Text style={styles.itemTime}>
                          {formatNotificationTime(item.createdAt)}
                        </Text>
                      </View>

                      {!item.isRead && <View style={styles.itemUnreadDot} />}
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
              <Ionicons name="arrow-forward" size={16} color="#5122C8" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#5122C8",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  teacherContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    marginRight: 8,
  },
  greeting: {
    fontFamily: "PoppinsRegular",
    fontSize: 13,
    color: "#E9DDFF",
    lineHeight: 16,
  },
  teacherName: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 24,
    includeFontPadding: false,
  },
  teacherDetails: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#DCCBFF",
    lineHeight: 14,
    marginTop: 1,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    position: "relative",
    flexShrink: 0,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF4D67",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: "#5122C8",
  },
  badgeText: {
    fontFamily: "PoppinsBold",
    fontSize: 8,
    lineHeight: 10,
    color: "#FFFFFF",
    textAlign: "center",
  },
  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarInitialsText: {
    fontFamily: "PoppinsBold",
    fontSize: 15,
    color: "#5122C8",
  },

  /* =========================
     NOTIFICATION MODAL
  ========================= */
  notificationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 16,
  },
  notificationPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    maxHeight: 460,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  panelTitle: {
    fontSize: 16,
    fontFamily: "PoppinsBold",
    color: "#111528",
  },
  panelSubtitle: {
    fontSize: 11,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    marginTop: 2,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  panelActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 6,
  },
  markAllButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  markAllText: {
    fontSize: 11,
    fontFamily: "PoppinsSemiBold",
    color: "#5122C8",
  },
  notificationListScroll: {
    maxHeight: 300,
  },
  notificationCenterMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  notificationEmptyText: {
    fontSize: 13,
    fontFamily: "PoppinsRegular",
    color: "#94A3B8",
    marginTop: 6,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 6,
  },
  notificationItemRead: {
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
    color: "#1E293B",
  },
  itemMessage: {
    fontSize: 11,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    marginTop: 1,
  },
  itemTime: {
    fontSize: 9,
    fontFamily: "PoppinsRegular",
    color: "#94A3B8",
    marginTop: 2,
  },
  itemUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5122C8",
    marginLeft: 6,
  },
  viewAllFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 6,
  },
  viewAllFooterText: {
    fontSize: 13,
    fontFamily: "PoppinsSemiBold",
    color: "#5122C8",
  },
});
