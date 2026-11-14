import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationRecord,
} from "@/services/notifications";

type TeacherNotificationsPageProps = {
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
  onContentScroll?: (event: any) => void;
};

const formatNotificationTime = (dateValue?: string): string => {
  if (!dateValue) return "Recently";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getNotificationMeta = (type?: string, title?: string) => {
  const t = (type || "").toLowerCase();
  const titleLower = (title || "").toLowerCase();

  if (t === "assignment" || titleLower.includes("assignment")) {
    return {
      icon: "document-text-outline" as keyof typeof Ionicons.glyphMap,
      color: "#D97706",
      bg: "#FEF3C7",
      target: "assignments",
    };
  }
  if (
    t === "test" ||
    t === "exam" ||
    titleLower.includes("test") ||
    titleLower.includes("exam")
  ) {
    return {
      icon: "clipboard-outline" as keyof typeof Ionicons.glyphMap,
      color: "#2563EB",
      bg: "#DBEAFE",
      target: "examinations",
    };
  }
  if (t === "attendance" || titleLower.includes("attendance")) {
    return {
      icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
      color: "#16A34A",
      bg: "#DCFCE7",
      target: "attendance",
    };
  }
  if (t === "ptg" || titleLower.includes("ptg") || titleLower.includes("meeting")) {
    return {
      icon: "people-circle-outline" as keyof typeof Ionicons.glyphMap,
      color: "#059669",
      bg: "#D1FAE5",
      target: "ptg",
    };
  }
  if (t === "message" || titleLower.includes("message")) {
    return {
      icon: "mail-outline" as keyof typeof Ionicons.glyphMap,
      color: "#0284C7",
      bg: "#E0F2FE",
      target: "messages",
    };
  }
  if (t === "announcement" || titleLower.includes("announcement")) {
    return {
      icon: "megaphone-outline" as keyof typeof Ionicons.glyphMap,
      color: "#8B5CF6",
      bg: "#F4F0FF",
      target: "home",
    };
  }
  return {
    icon: "notifications-outline" as keyof typeof Ionicons.glyphMap,
    color: "#5122C8",
    bg: "#EEE7FF",
    target: "home",
  };
};

export default function TeacherNotificationsPage({
  onBack,
  onNavigate,
  onContentScroll,
}: TeacherNotificationsPageProps) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error("Failed to load notifications page:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [filter, notifications]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      void loadData();
    }
  };

  const handleNotificationPress = async (item: NotificationRecord) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      try {
        await markNotificationAsRead(item.id);
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    const meta = getNotificationMeta(item.type, item.title);
    if (meta.target && onNavigate) {
      onNavigate(meta.target);
    }
  };

  const renderItem = ({ item }: { item: NotificationRecord }) => {
    const meta = getNotificationMeta(item.type, item.title);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.itemCard,
          item.isRead && styles.itemCardRead,
          pressed && styles.pressed,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.itemIconBox, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.itemMessage} numberOfLines={3}>
            {item.message}
          </Text>

          <View style={styles.itemFooterRow}>
            <Text style={styles.itemTime}>
              {formatNotificationTime(item.createdAt)}
            </Text>
            <View style={styles.actionHint}>
              <Text style={styles.actionHintText}>Open</Text>
              <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 8 },
        ]}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5122C8"
            colors={["#5122C8"]}
          />
        }
        ListHeaderComponent={
          <>
            {/* HEADER CARD */}
            <View style={styles.headerCard}>
              <Pressable
                style={styles.backButton}
                onPress={onBack}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={24} color="#5122C8" />
              </Pressable>

              <View style={styles.headerIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#5122C8"
                />
              </View>

              <View style={styles.headerText}>
                <Text style={styles.title}>All Notifications</Text>
                <Text style={styles.subtitle}>
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread update${
                        unreadCount === 1 ? "" : "s"
                      }`
                    : "You are all caught up"}
                </Text>
              </View>
            </View>

            {/* FILTER & MARK READ ROW */}
            <View style={styles.controlRow}>
              <View style={styles.filters}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filter === "all" && styles.filterChipActive,
                  ]}
                  onPress={() => setFilter("all")}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === "all" && styles.filterTextActive,
                    ]}
                  >
                    All ({notifications.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filter === "unread" && styles.filterChipActive,
                  ]}
                  onPress={() => setFilter("unread")}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === "unread" && styles.filterTextActive,
                    ]}
                  >
                    Unread ({unreadCount})
                  </Text>
                </TouchableOpacity>
              </View>

              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  style={styles.markAllButton}
                >
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#5122C8" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="notifications-off-outline"
                  size={36}
                  color="#94A3B8"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications found"}
              </Text>
              <Text style={styles.emptyDescription}>
                You will be notified here when updates arrive.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F9",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    color: "#111528",
  },
  subtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#777C89",
    marginTop: 1,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#5122C8",
    borderColor: "#5122C8",
  },
  filterText: {
    fontSize: 11,
    fontFamily: "PoppinsMedium",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 11,
    fontFamily: "PoppinsSemiBold",
    color: "#5122C8",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEEAF5",
  },
  itemCardRead: {
    backgroundColor: "#FAFAFD",
    borderColor: "#F0F0F5",
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  itemIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: "PoppinsSemiBold",
    color: "#1E293B",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5122C8",
    marginLeft: 6,
  },
  itemMessage: {
    fontSize: 11.5,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    lineHeight: 17,
    marginTop: 3,
  },
  itemFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  itemTime: {
    fontSize: 10,
    fontFamily: "PoppinsRegular",
    color: "#94A3B8",
  },
  actionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionHintText: {
    fontSize: 10,
    fontFamily: "PoppinsMedium",
    color: "#7040D5",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: "PoppinsSemiBold",
    color: "#334155",
  },
  emptyDescription: {
    fontSize: 11,
    fontFamily: "PoppinsRegular",
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    marginTop: 10,
  },
});
