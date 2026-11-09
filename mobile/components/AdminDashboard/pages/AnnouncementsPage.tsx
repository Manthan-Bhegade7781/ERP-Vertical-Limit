import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type AnnouncementStatus = "Published" | "Draft" | "Scheduled" | "Expired";
type AnnouncementPriority = "High" | "Medium" | "Low";

type AnnouncementRecord = {
  id: number;
  announcementId: string;
  apiId: string;
  branchMongoId: string | null;
  title: string;
  description: string;
  category: string;
  priority: AnnouncementPriority;
  audience: string;
  branch: string;
  status: AnnouncementStatus;
  createdBy: string;
  publishedDate: string;
  scheduledDate: string;
  expiryDate: string;
};

type AnnouncementApiRecord = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: AnnouncementPriority;
  audience: string;
  branchId?: string | { _id?: string; name?: string } | null;
  status: AnnouncementStatus;
  createdBy?: { fullName?: string; name?: string } | string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
};

const formatAnnouncementDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(value.includes("T") ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

const toIsoDate = (value: string): string | null => {
  if (!value || !value.trim()) return null;
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const mapAnnouncement = (
  item: AnnouncementApiRecord,
  index: number
): AnnouncementRecord => {
  const branchValue = item.branchId;
  const branchMongoId =
    typeof branchValue === "string"
      ? branchValue
      : branchValue && typeof branchValue === "object"
      ? branchValue._id ?? null
      : null;
  const branchName =
    branchValue && typeof branchValue === "object" && branchValue.name
      ? branchValue.name
      : item.branchId === null || branchValue === null
      ? "All Branches (Institute-wide)"
      : "Assigned Branch";
  const creator =
    typeof item.createdBy === "string"
      ? item.createdBy
      : item.createdBy?.fullName ?? item.createdBy?.name ?? "Branch Admin";

  return {
    id: index + 1,
    apiId: item._id,
    branchMongoId,
    announcementId: `ANN-${item._id.slice(-6).toUpperCase()}`,
    title: item.title,
    description: item.description,
    category: item.category || "General",
    priority: item.priority || "Medium",
    audience: item.audience || "All Students",
    branch: branchName,
    status: item.status || "Draft",
    createdBy: creator,
    publishedDate: formatAnnouncementDate(item.publishedAt),
    scheduledDate: formatAnnouncementDate(item.scheduledAt),
    expiryDate: formatAnnouncementDate(item.expiresAt),
  };
};

const priorityColors: Record<
  AnnouncementPriority,
  { bg: string; text: string }
> = {
  High: { bg: "#FFE9F0", text: "#E95386" },
  Medium: { bg: "#FFF1E2", text: "#E88713" },
  Low: { bg: "#EAF2FF", text: "#2675E8" },
};

const statusColors: Record<
  AnnouncementStatus,
  { bg: string; text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  Published: {
    bg: "#E7F8EF",
    text: "#22945F",
    icon: "check-circle-outline",
  },
  Draft: {
    bg: "#F0F1F5",
    text: "#687386",
    icon: "file-document-outline",
  },
  Scheduled: {
    bg: "#EAF2FF",
    text: "#2675E8",
    icon: "clock-outline",
  },
  Expired: {
    bg: "#FFE9F0",
    text: "#E95386",
    icon: "calendar-remove-outline",
  },
};

const categories = [
  "Academic",
  "Examination",
  "Results",
  "Attendance",
  "Fees",
  "PTG",
  "Events",
  "Holiday",
  "Notice",
  "General",
];

const audiences = [
  "All Users",
  "All Students",
  "Students",
  "Teachers",
  "Students & Teachers",
  "Academic Staff",
  "Staff",
];

const priorities: AnnouncementPriority[] = ["High", "Medium", "Low"];

const statuses: AnnouncementStatus[] = [
  "Draft",
  "Published",
  "Scheduled",
  "Expired",
];

export default function AnnouncementPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | AnnouncementStatus | "High Priority"
  >("All");

  const [selected, setSelected] = useState<AnnouncementRecord | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Academic");
  const [editPriority, setEditPriority] = useState<AnnouncementPriority>("Medium");
  const [editAudience, setEditAudience] = useState("All Students");
  const [editStatus, setEditStatus] = useState<AnnouncementStatus>("Draft");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editScheduledDate, setEditScheduledDate] = useState("");
  const [saving, setSaving] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchAnnouncements = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }
      const res = await fetch(`${API_BASE_URL}/announcements`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.success === false) {
        throw new Error(result.message || "Failed to load announcements.");
      }
      const rows: AnnouncementApiRecord[] = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.announcements)
        ? result.data.announcements
        : [];
      setAnnouncements(rows.map(mapAnnouncement));
    } catch (err: any) {
      setError(err?.message ?? "Unable to load announcements.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // If we already have items loaded, fetch silently in the background
      // so it updates smoothly without a full-screen loading spinner
      void fetchAnnouncements(announcements.length > 0);
    }, [fetchAnnouncements, announcements.length])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchAnnouncements(true);
  }, [fetchAnnouncements]);

  const requestAnnouncement = async (
    path: string,
    method: string,
    body?: Record<string, unknown>
  ) => {
    const token = await getToken();
    if (!token) throw new Error("Please log in again.");
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) {
      throw new Error(result.message || "The request could not be completed.");
    }
    return result;
  };

  // ─── Navigation ───────────────────────────────────────────────────────────
  const openAddAnnouncement = () => {
    router.push("/(admin)/add-announcement" as never);
  };

  // ─── Edit Modal ───────────────────────────────────────────────────────────
  const openEdit = (item: AnnouncementRecord) => {
    if (item.branchMongoId === null) {
      Alert.alert(
        "Institute-wide Announcement",
        "This announcement applies to all branches and was created by Super Admin. You can view or duplicate it to create a branch-specific copy, but it can only be edited by Super Admin.",
        [
          {
            text: "View Details",
            onPress: () => {
              setSelected(item);
              setViewVisible(true);
            },
          },
          {
            text: "Duplicate",
            onPress: () => duplicateAnnouncement(item),
          },
          { text: "Close", style: "cancel" },
        ]
      );
      return;
    }

    setSelected(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditPriority(item.priority);
    setEditAudience(item.audience);
    setEditStatus(item.status);
    setEditExpiryDate(item.expiryDate);
    setEditScheduledDate(item.scheduledDate);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!selected) return;

    if (!editTitle.trim() || !editDescription.trim() || !editExpiryDate.trim()) {
      Alert.alert(
        "Required Fields",
        "Please fill in title, description, and a valid expiry date."
      );
      return;
    }

    const expiresAt = toIsoDate(editExpiryDate);
    if (!expiresAt) {
      Alert.alert(
        "Invalid Expiry Date",
        "Please enter a valid expiry date, e.g. 2026-12-31 or 31 Dec 2026."
      );
      return;
    }

    let scheduledAt: string | null = null;
    if (editStatus === "Scheduled") {
      scheduledAt = toIsoDate(editScheduledDate);
      if (!scheduledAt || new Date(scheduledAt).getTime() <= Date.now()) {
        Alert.alert(
          "Schedule Date Required",
          "For a scheduled announcement, please enter a valid future date/time."
        );
        return;
      }
    }

    const payload: Record<string, unknown> = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      priority: editPriority,
      audience: editAudience,
      status: editStatus,
      expiresAt,
      publishedAt: editStatus === "Published" ? new Date().toISOString() : null,
      scheduledAt: editStatus === "Scheduled" ? scheduledAt : null,
    };

    setSaving(true);
    try {
      await requestAnnouncement(`/announcements/${selected.apiId}`, "PUT", payload);
      Alert.alert("Success", "Announcement updated successfully.");
      setEditVisible(false);
      await fetchAnnouncements();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const confirmDelete = (item: AnnouncementRecord) => {
    if (item.branchMongoId === null) {
      Alert.alert(
        "Cannot Delete",
        "This institute-wide announcement was created by Super Admin and cannot be deleted by a branch admin."
      );
      return;
    }

    Alert.alert(
      "Delete Announcement",
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAnnouncement(item.apiId),
        },
      ]
    );
  };

  const deleteAnnouncement = async (apiId: string) => {
    try {
      await requestAnnouncement(`/announcements/${apiId}`, "DELETE");
      Alert.alert("Deleted", "Announcement deleted successfully.");
      await fetchAnnouncements();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not delete announcement.");
    }
  };

  // ─── Duplicate ────────────────────────────────────────────────────────────
  const duplicateAnnouncement = async (item: AnnouncementRecord) => {
    try {
      await requestAnnouncement(`/announcements/${item.apiId}/duplicate`, "POST");
      Alert.alert("Duplicated", "Announcement duplicated as a draft in your branch.");
      await fetchAnnouncements();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not duplicate announcement.");
    }
  };

  // ─── Status Toggle ────────────────────────────────────────────────────────
  const toggleStatus = async (item: AnnouncementRecord) => {
    if (item.branchMongoId === null) {
      Alert.alert(
        "Cannot Modify Status",
        "This institute-wide announcement was created by Super Admin and can only be published or drafted by Super Admin."
      );
      return;
    }

    const nextStatus: AnnouncementStatus =
      item.status === "Published" ? "Draft" : "Published";
    try {
      await requestAnnouncement(`/announcements/${item.apiId}/status`, "PATCH", {
        status: nextStatus,
      });
      await fetchAnnouncements();
      Alert.alert(
        "Status Updated",
        `Announcement ${nextStatus === "Published" ? "published" : "moved to draft"}.`
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not update status.");
    }
  };

  // ─── Filtered Data & Stats ────────────────────────────────────────────────
  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements.filter((item) => {
      const matchesSearch =
        !query ||
        item.announcementId.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.audience.toLowerCase().includes(query) ||
        item.branch.toLowerCase().includes(query) ||
        item.createdBy.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" ||
        item.status === filter ||
        (filter === "High Priority" && item.priority === "High");

      return matchesSearch && matchesFilter;
    });
  }, [announcements, search, filter]);

  const total = announcements.length;
  const published = announcements.filter((x) => x.status === "Published").length;
  const scheduled = announcements.filter((x) => x.status === "Scheduled").length;
  const drafts = announcements.filter((x) => x.status === "Draft").length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />

        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, minHeight: insets.top + 66 },
            isMobile && styles.headerMobile,
            isTablet && styles.headerTablet,
          ]}
        >
          <TouchableOpacity
            style={[styles.backButton, isMobile && styles.backButtonMobile]}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text
            style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}
            numberOfLines={1}
          >
            Announcements
          </Text>

          <TouchableOpacity
            style={[styles.addButton, isMobile && styles.addButtonMobile]}
            activeOpacity={0.85}
            onPress={openAddAnnouncement}
            accessibilityRole="button"
            accessibilityLabel="Add Announcement"
          >
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#7040D5"]}
              tintColor="#7040D5"
            />
          }
        >
          <Text style={styles.pageTitle}>Announcements</Text>
          <Text style={styles.pageSubtitle}>
            Manage academic and branch announcements
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.purpleIcon]}>
                <MaterialCommunityIcons
                  name="bullhorn-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>
              <Text style={styles.statNumber}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.greenIcon]}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color="#13B96D"
                />
              </View>
              <Text style={styles.statNumber}>{published}</Text>
              <Text style={styles.statLabel}>Published</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.blueIcon]}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#2675E8"
                />
              </View>
              <Text style={styles.statNumber}>{scheduled}</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.orangeIcon]}>
                <MaterialCommunityIcons
                  name="file-outline"
                  size={20}
                  color="#F28A17"
                />
              </View>
              <Text style={styles.statNumber}>{drafts}</Text>
              <Text style={styles.statLabel}>Draft</Text>
            </View>
          </View>

          {/* Search & Filter Card */}
          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={21} color="#8994A7" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search announcements..."
                placeholderTextColor="#A0A9B8"
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {(
                [
                  "All",
                  "Published",
                  "Scheduled",
                  "Draft",
                  "Expired",
                  "High Priority",
                ] as const
              ).map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterButton,
                    filter === item && styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item && styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* List Header */}
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>All Announcements</Text>
              <Text style={styles.listSubtitle}>
                Latest academic and branch updates
              </Text>
            </View>
            <Text style={styles.recordCount}>
              {filteredAnnouncements.length} records
            </Text>
          </View>

          {/* Loading / Error states */}
          {loading && (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#7040D5" />
              <Text style={[styles.emptyTitle, { marginTop: 14 }]}>
                Loading announcements…
              </Text>
            </View>
          )}

          {!loading && error && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={38}
                color="#E84D61"
              />
              <Text style={styles.emptyTitle}>Failed to load</Text>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity
                onPress={() => void fetchAnnouncements()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cards List */}
          {!loading &&
            !error &&
            filteredAnnouncements.map((item) => {
              const statusCfg = statusColors[item.status] || statusColors.Draft;
              const priorityCfg =
                priorityColors[item.priority] || priorityColors.Medium;

              return (
                <View key={item.apiId} style={styles.announcementCard}>
                  <View style={styles.announcementTop}>
                    <View style={styles.announcementIdentity}>
                      <View style={styles.announcementIcon}>
                        <MaterialCommunityIcons
                          name={statusCfg.icon}
                          size={24}
                          color={
                            item.status === "Published" ? "#22945F" : "#7040D5"
                          }
                        />
                      </View>

                      <View style={styles.titleBlock}>
                        <Text style={styles.announcementTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.announcementId}>
                          {item.announcementId} • {item.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.badgesContainer}>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: priorityCfg.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            { color: priorityCfg.text },
                          ]}
                        >
                          {item.priority}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusCfg.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusCfg.text },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.description} numberOfLines={3}>
                    {item.description}
                  </Text>

                  <View style={styles.divider} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Audience</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {item.audience}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Branch</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {item.branch}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Expires On</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {item.expiryDate || "—"}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>
                        {item.status === "Scheduled"
                          ? "Scheduled For"
                          : "Published"}
                      </Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {item.status === "Scheduled"
                          ? item.scheduledDate || "—"
                          : item.publishedDate || "—"}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelected(item);
                        setViewVisible(true);
                      }}
                    >
                      <MaterialCommunityIcons
                        name="eye-outline"
                        size={17}
                        color="#7040D5"
                      />
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editButton}
                      activeOpacity={0.8}
                      onPress={() => openEdit(item)}
                    >
                      <MaterialCommunityIcons
                        name="pencil-outline"
                        size={17}
                        color="#FFFFFF"
                      />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.toggleButton}
                      activeOpacity={0.8}
                      onPress={() => toggleStatus(item)}
                    >
                      <MaterialCommunityIcons
                        name={
                          item.status === "Published"
                            ? "pause-circle-outline"
                            : "play-circle-outline"
                        }
                        size={17}
                        color="#2675E8"
                      />
                      <Text style={styles.toggleButtonText}>
                        {item.status === "Published" ? "Unpublish" : "Publish"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.duplicateButton}
                      activeOpacity={0.8}
                      onPress={() => duplicateAnnouncement(item)}
                    >
                      <MaterialCommunityIcons
                        name="content-copy"
                        size={16}
                        color="#F28A17"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.8}
                      onPress={() => confirmDelete(item)}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={16}
                        color="#E84D61"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

          {!loading && !error && filteredAnnouncements.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="bullhorn-outline"
                size={38}
                color="#A3AABD"
              />
              <Text style={styles.emptyTitle}>No announcements found</Text>
              <Text style={styles.emptyText}>
                Try another search or status filter.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* View Modal */}
        <Modal
          visible={viewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Announcement Details</Text>
                  <Text style={styles.modalSubtitle}>
                    {selected?.announcementId} • {selected?.category}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setViewVisible(false)}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#66768A" />
                </TouchableOpacity>
              </View>

              {selected && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalAnnouncementTitle}>
                    {selected.title}
                  </Text>

                  <View style={styles.modalBadgesRow}>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            priorityColors[selected.priority]?.bg || "#FFF1E2",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityBadgeText,
                          {
                            color:
                              priorityColors[selected.priority]?.text || "#E88713",
                          },
                        ]}
                      >
                        Priority: {selected.priority}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusColors[selected.status]?.bg || "#F0F1F5",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              statusColors[selected.status]?.text || "#687386",
                          },
                        ]}
                      >
                        Status: {selected.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalDescription}>
                    {selected.description}
                  </Text>

                  <View style={styles.modalGrid}>
                    <View style={styles.modalDetail}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>{selected.category}</Text>
                    </View>

                    <View style={styles.modalDetail}>
                      <Text style={styles.detailLabel}>Target Audience</Text>
                      <Text style={styles.detailValue}>{selected.audience}</Text>
                    </View>

                    <View style={styles.modalDetail}>
                      <Text style={styles.detailLabel}>Branch</Text>
                      <Text style={styles.detailValue}>{selected.branch}</Text>
                    </View>

                    <View style={styles.modalDetail}>
                      <Text style={styles.detailLabel}>Created By</Text>
                      <Text style={styles.detailValue}>{selected.createdBy}</Text>
                    </View>

                    <View style={styles.modalDetail}>
                      <Text style={styles.detailLabel}>Expires At</Text>
                      <Text style={styles.detailValue}>
                        {selected.expiryDate || "—"}
                      </Text>
                    </View>

                    <View style={styles.modalDetail}>
                      <Text style={styles.detailLabel}>
                        {selected.status === "Scheduled"
                          ? "Scheduled At"
                          : "Published At"}
                      </Text>
                      <Text style={styles.detailValue}>
                        {selected.status === "Scheduled"
                          ? selected.scheduledDate || "—"
                          : selected.publishedDate || "—"}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.modalEditButton}
                    onPress={() => {
                      setViewVisible(false);
                      openEdit(selected);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.modalEditText}>Edit Announcement</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal
          visible={editVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.editModalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Edit Announcement</Text>
                  <Text style={styles.modalSubtitle}>
                    Update announcement details and publication settings
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setEditVisible(false)}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#66768A" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  style={styles.input}
                  placeholder="Announcement title"
                  placeholderTextColor="#A0A9B8"
                />

                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  style={[styles.input, styles.textArea]}
                  placeholder="Announcement description"
                  placeholderTextColor="#A0A9B8"
                  multiline
                />

                <Text style={styles.inputLabel}>Category *</Text>
                <View style={styles.optionsRow}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setEditCategory(cat)}
                      style={[
                        styles.option,
                        editCategory === cat && styles.optionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editCategory === cat && styles.optionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Priority *</Text>
                <View style={styles.optionsRow}>
                  {priorities.map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setEditPriority(p)}
                      style={[
                        styles.option,
                        editPriority === p && styles.optionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editPriority === p && styles.optionTextActive,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Target Audience *</Text>
                <View style={styles.optionsRow}>
                  {audiences.map((aud) => (
                    <TouchableOpacity
                      key={aud}
                      onPress={() => setEditAudience(aud)}
                      style={[
                        styles.option,
                        editAudience === aud && styles.optionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editAudience === aud && styles.optionTextActive,
                        ]}
                      >
                        {aud}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Status *</Text>
                <View style={styles.optionsRow}>
                  {statuses.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setEditStatus(item)}
                      style={[
                        styles.option,
                        editStatus === item && styles.optionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editStatus === item && styles.optionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Expiry Date *</Text>
                <TextInput
                  value={editExpiryDate}
                  onChangeText={setEditExpiryDate}
                  style={styles.input}
                  placeholder="e.g. 2026-12-31"
                  placeholderTextColor="#A0A9B8"
                />

                {editStatus === "Scheduled" && (
                  <>
                    <Text style={styles.inputLabel}>Schedule Date & Time *</Text>
                    <TextInput
                      value={editScheduledDate}
                      onChangeText={setEditScheduledDate}
                      style={styles.input}
                      placeholder="e.g. 2026-11-15 09:00"
                      placeholderTextColor="#A0A9B8"
                    />
                  </>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditVisible(false)}
                    disabled={saving}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.7 }]}
                    onPress={saveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <MaterialCommunityIcons
                        name="content-save-outline"
                        size={18}
                        color="#FFFFFF"
                      />
                    )}
                    <Text style={styles.saveText}>
                      {saving ? "Saving…" : "Save Changes"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  header: {
    width: "100%",
    backgroundColor: "#6D35D8",
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerMobile: { height: 80, paddingHorizontal: 14 },
  headerTablet: { height: 64, paddingHorizontal: 20 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backButtonMobile: { width: 36, height: 36, borderRadius: 10, marginRight: 12 },
  headerTitle: {
    flex: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    lineHeight: 26,
    color: "#FFFFFF",
    textAlign: "left",
  },
  headerTitleMobile: { fontSize: 20 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  addButtonMobile: { width: 40, height: 40, borderRadius: 11 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 26,
  },
  pageTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 19,
    color: "#202A3D",
    marginTop: 0,
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#7C879A",
    marginTop: 2,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 88,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  purpleIcon: { backgroundColor: "#F0E8FF" },
  greenIcon: { backgroundColor: "#E7F8F0" },
  blueIcon: { backgroundColor: "#EAF2FF" },
  orangeIcon: { backgroundColor: "#FFF0DF" },
  statNumber: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#202A3D",
  },
  statLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#7C879A",
    marginTop: 1,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8EAF0",
    marginBottom: 16,
  },
  searchBox: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 9,
  },
  filterRow: {
    paddingTop: 9,
    gap: 7,
  },
  filterButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: "#F8F9FC",
    borderWidth: 1,
    borderColor: "#E6E8EF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },
  filterText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#788397",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 17,
    color: "#202A3D",
  },
  listSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7C879A",
    marginTop: 1,
  },
  recordCount: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7C879A",
    marginBottom: 2,
  },
  announcementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#ECEEF4",
    marginBottom: 10,
    elevation: 2,
  },
  announcementTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  announcementIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  announcementIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: "#F7F5FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 6,
  },
  announcementTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12.5,
    color: "#202A3D",
  },
  announcementId: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9AA2B1",
    marginTop: 2,
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9,
  },
  description: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    lineHeight: 15,
    color: "#687388",
    marginTop: 8,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF0F4",
    marginBottom: 10,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#8290A5",
    marginBottom: 1,
  },
  detailValue: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#263047",
  },
  cardActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
    alignItems: "center",
  },
  viewButton: {
    flex: 1,
    height: 33,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  viewButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
    color: "#7040D5",
  },
  editButton: {
    flex: 1,
    height: 33,
    borderRadius: 8,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  editButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
    color: "#FFFFFF",
  },
  toggleButton: {
    flex: 1.2,
    height: 33,
    borderRadius: 8,
    backgroundColor: "#EAF2FF",
    borderWidth: 1,
    borderColor: "#2675E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  toggleButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
    color: "#2675E8",
  },
  duplicateButton: {
    width: 33,
    height: 33,
    borderRadius: 8,
    backgroundColor: "#FFF4E8",
    borderWidth: 1,
    borderColor: "#F28A17",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 33,
    height: 33,
    borderRadius: 8,
    backgroundColor: "#FFF0F2",
    borderWidth: 1,
    borderColor: "#E84D61",
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#7040D5",
  },
  retryText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202A3D",
    marginTop: 10,
  },
  emptyText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8A94A6",
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,20,32,0.5)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },
  editModalCard: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#202A3D",
  },
  modalSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#8B96A8",
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalAnnouncementTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
    color: "#202A3D",
    marginBottom: 8,
  },
  modalBadgesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modalDescription: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    lineHeight: 17,
    color: "#687388",
    marginBottom: 14,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderColor: "#EEF0F4",
    paddingTop: 10,
  },
  modalDetail: {
    width: "50%",
    paddingVertical: 7,
  },
  modalEditButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    gap: 6,
  },
  modalEditText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
  inputLabel: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#58657A",
    marginBottom: 5,
    marginTop: 6,
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#E1E4EB",
    borderRadius: 9,
    paddingHorizontal: 11,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginBottom: 10,
  },
  textArea: {
    minHeight: 76,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 10,
  },
  option: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E5E7EE",
  },
  optionActive: {
    backgroundColor: "#F0E8FF",
    borderColor: "#7040D5",
  },
  optionText: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#788397",
  },
  optionTextActive: {
    fontFamily: "PoppinsSemiBold",
    color: "#7040D5",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    paddingTop: 10,
    paddingBottom: 6,
  },
  cancelButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDFE7",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#687388",
  },
  saveButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#FFFFFF",
  },
});
