import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type CalendarEvent = {
  _id: string;
  title?: string;
  eventTitle?: string;
  name?: string;
  eventName?: string;
  date?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  eventType?: string;
  type?: string;
  description?: string;
  branchId?: any;
  branch?: any;
  status?: string;
};

const FILTERS = [
  "All",
  "Academic",
  "Examination",
  "Holiday",
  "Event",
  "Meeting",
  "Other",
];

const getTitle = (item: CalendarEvent) =>
  item.title ||
  item.eventTitle ||
  item.eventName ||
  item.name ||
  "Untitled event";

const getDate = (item: CalendarEvent) =>
  item.date || item.eventDate || item.startDate || "";

const getCategory = (item: CalendarEvent) =>
  item.category || item.eventType || item.type || "Event";

const getBranch = (item: CalendarEvent) => {
  const branch = item.branch || item.branchId;

  if (!branch) return "All Branches";

  if (typeof branch === "string") return branch;

  return branch.name || branch.branchName || "All Branches";
};

const formatDate = (value?: string) => {
  if (!value) return "Date not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Compare calendar dates instead of exact timestamps.
// This prevents today's events from incorrectly showing as Completed.
const getStatus = (item: CalendarEvent) => {
  if (item.status) return item.status;

  const eventDateValue = getDate(item);

  if (!eventDateValue) return "Scheduled";

  const eventDate = new Date(eventDateValue);

  if (Number.isNaN(eventDate.getTime())) return "Scheduled";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  // For multi-day events, use the end date when available.
  if (item.endDate) {
    const endDate = new Date(item.endDate);

    if (!Number.isNaN(endDate.getTime())) {
      endDate.setHours(0, 0, 0, 0);

      return endDate < today ? "Completed" : "Upcoming";
    }
  }

  return eventDay < today ? "Completed" : "Upcoming";
};

type TeacherAcademicCalendarProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

export default function TeacherAcademicCalendar({
  onContentScroll,
  onBack,
}: TeacherAcademicCalendarProps = {}) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null);

  // Fetch academic calendar events.
  const loadEvents = useCallback(async () => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${API_BASE_URL}/academic-calendar`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );

      let result: any;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          response.ok
            ? "The server returned an invalid response."
            : `Unable to load academic calendar (HTTP ${response.status}).`
        );
      }

      if (!response.ok || result?.success === false) {
        const fallbackMessage =
          response.status === 401
            ? "Your session may have expired. Please sign in again."
            : response.status === 403
            ? "Your account cannot access these calendar events. Please check your branch assignment or permissions."
            : "Unable to load academic calendar.";

        throw new Error(
          result?.message || fallbackMessage
        );
      }

      // Backend returns:
      // { success: true, count: number, data: [...] }
      const records = Array.isArray(result?.data)
        ? result.data
        : [];

      setEvents(records);
    } catch (error: any) {
      console.error("Academic calendar error:", error);

      Alert.alert(
        "Academic Calendar",
        error?.message ||
          "Unable to load calendar events."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Search and category filtering.
  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((item) => {
      const category = getCategory(item);

      const normalizedCategory =
        category.trim().toLowerCase();

      const matchesFilter =
        filter === "All" ||
        normalizedCategory === filter.trim().toLowerCase();

      const matchesSearch =
        !query ||
        getTitle(item).toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        (item.description || "")
          .toLowerCase()
          .includes(query) ||
        getBranch(item).toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [events, search, filter]);

  // Render individual event card.
  const renderEvent = ({
    item,
  }: {
    item: CalendarEvent;
  }) => {
    const category = getCategory(item);
    const status = getStatus(item);

    return (
      <Pressable
        style={styles.eventCard}
        onPress={() => setSelectedEvent(item)}
      >
        <View style={styles.eventHeader}>
          <View style={styles.eventIcon}>
            <MaterialCommunityIcons
              name={
                category.toLowerCase().includes("exam")
                  ? "file-document-edit-outline"
                  : category.toLowerCase().includes("holiday")
                  ? "beach"
                  : "calendar-star"
              }
              size={23}
              color="#7040D5"
            />
          </View>

          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>
              {getTitle(item)}
            </Text>

            <Text style={styles.eventCategory}>
              {category}
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color="#98A2B3"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={17}
            color="#7040D5"
          />

          <Text style={styles.detailText}>
            {formatDate(getDate(item))}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="office-building-outline"
            size={17}
            color="#64748B"
          />

          <Text style={styles.detailText}>
            {getBranch(item)}
          </Text>
        </View>

        <View style={styles.eventFooter}>
          <Text style={styles.statusBadge}>
            {status}
          </Text>

          <Text style={styles.viewText}>
            View details
          </Text>
        </View>
      </Pressable>
    );
  };

  // Loading screen.
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#7040D5"
        />

        <Text style={styles.loadingText}>
          Loading academic calendar...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item, index) =>
          item._id || String(index)
        }
        renderItem={renderEvent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadEvents();
            }}
            tintColor="#5420D8"
            colors={["#5420D8"]}
          />
        }
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View style={styles.headerCard}>
              <Pressable
                style={styles.backButton}
                onPress={onBack ?? (() => undefined)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back to previous screen"
              >
                <Ionicons
                  name="arrow-back"
                  size={26}
                  color="#5420D8"
                />
              </Pressable>

              <View style={styles.headerIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={25}
                  color="#5420D8"
                />
              </View>

              <View style={styles.headerText}>
                <Text style={styles.title}>
                  Academic Calendar
                </Text>

                <Text style={styles.subtitle}>
                  Important academic dates, holidays and events
                </Text>
              </View>
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={25}
                  color="#7040D5"
                />
              </View>

              <View>
                <Text style={styles.summaryLabel}>
                  Total Calendar Events
                </Text>

                <Text style={styles.summaryValue}>
                  {events.length}
                </Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#94A3B8"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search events..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />

              {!!search && (
                <Pressable onPress={() => setSearch("")}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={19}
                    color="#94A3B8"
                  />
                </Pressable>
              )}
            </View>

            {/* Category Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              {FILTERS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterButton,
                    filter === item && styles.activeFilter,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item &&
                        styles.activeFilterText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="calendar-search"
              size={42}
              color="#A0A8B7"
            />

            <Text style={styles.emptyTitle}>
              No calendar events found
            </Text>

            <Text style={styles.emptySubtitle}>
              Events published by Admin or Super Admin
              will appear here.
            </Text>
          </View>
        }
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Event Details
              </Text>

              <Pressable
                onPress={() => setSelectedEvent(null)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#64748B"
                />
              </Pressable>
            </View>

            <ScrollView>
              <Text style={styles.detailTitle}>
                {getTitle(selectedEvent)}
              </Text>

              <Text style={styles.modalLabel}>
                Category
              </Text>

              <Text style={styles.modalValue}>
                {getCategory(selectedEvent)}
              </Text>

              <Text style={styles.modalLabel}>
                Date
              </Text>

              <Text style={styles.modalValue}>
                {formatDate(getDate(selectedEvent))}
              </Text>

              {selectedEvent.endDate && (
                <>
                  <Text style={styles.modalLabel}>
                    End Date
                  </Text>

                  <Text style={styles.modalValue}>
                    {formatDate(selectedEvent.endDate)}
                  </Text>
                </>
              )}

              <Text style={styles.modalLabel}>
                Branch
              </Text>

              <Text style={styles.modalValue}>
                {getBranch(selectedEvent)}
              </Text>

              <Text style={styles.modalLabel}>
                Status
              </Text>

              <Text style={styles.modalValue}>
                {getStatus(selectedEvent)}
              </Text>

              <Text style={styles.modalLabel}>
                Description
              </Text>

              <Text style={styles.description}>
                {selectedEvent.description ||
                  "No description provided."}
              </Text>
            </ScrollView>

            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedEvent(null)}
            >
              <Text style={styles.closeButtonText}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F9",
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7FA",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 12,
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 19,
  },

  subtitle: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  summaryLabel: {
    color: "#8791A0",
    fontSize: 11,
  },

  summaryValue: {
    color: "#172033",
    fontSize: 21,
    fontWeight: "700",
    marginTop: 3,
  },

  searchBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#172033",
  },

  filterScroll: {
    flexGrow: 0,
    marginVertical: 14,
  },

  filterContent: {
    gap: 8,
  },

  filterButton: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },

  activeFilter: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },

  filterText: {
    fontSize: 11,
    color: "#667085",
  },

  activeFilterText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  listContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },

  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECEEF3",
    elevation: 2,
  },

  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  eventIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  eventInfo: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#263247",
  },

  eventCategory: {
    fontSize: 10,
    color: "#8B95A5",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F2F5",
    marginVertical: 13,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    gap: 8,
  },

  detailText: {
    fontSize: 11,
    color: "#64748B",
  },

  eventFooter: {
    marginTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBadge: {
    backgroundColor: "#F1EAFF",
    color: "#7040D5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 10,
  },

  viewText: {
    color: "#7040D5",
    fontSize: 11,
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    minHeight: 190,
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#263247",
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 11,
    color: "#8B95A5",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172033",
  },

  detailTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#263247",
    marginBottom: 14,
  },

  modalLabel: {
    fontSize: 10,
    color: "#98A2B3",
    marginTop: 12,
  },

  modalValue: {
    fontSize: 12,
    color: "#344054",
    marginTop: 4,
  },

  description: {
    fontSize: 12,
    lineHeight: 19,
    color: "#64748B",
    marginTop: 5,
  },

  closeButton: {
    backgroundColor: "#7040D5",
    borderRadius: 11,
    padding: 13,
    alignItems: "center",
    marginTop: 20,
  },

  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
});