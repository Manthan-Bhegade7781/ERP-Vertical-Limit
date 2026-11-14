import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type PTGMeeting = {
  _id: string;
  studentId?: {
    userId?: { fullName?: string };
    fullName?: string;
    studentId?: string;
  };
  teacherId?: {
    userId?: { fullName?: string };
    fullName?: string;
  };
  meetingDate: string;
  meetingTime?: string;
  time?: string;
  purpose?: string;
  remarks?: string;
  status: string;
};

type FilterType = "All" | "Scheduled" | "Completed" | "Pending";

const PURPLE = "#7040D5";

type TeacherPTGScheduleProps = {
  onBack?: () => void;
};

export default function TeacherPTGSchedule({ onBack }: TeacherPTGScheduleProps) {
  const [meetings, setMeetings] = useState<PTGMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const loadMeetings = useCallback(async () => {
    try {
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/ptg/teacher/meetings`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to load PTG meetings.");
      }

      const rows = Array.isArray(result.data)
        ? result.data
        : result.data?.meetings || [];

      setMeetings(rows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load PTG meetings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadMeetings();
  };

  const getStudentName = (meeting: PTGMeeting) =>
    meeting.studentId?.userId?.fullName ||
    meeting.studentId?.fullName ||
    "Student";

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const student = getStudentName(meeting).toLowerCase();
      const purpose = (meeting.purpose || "").toLowerCase();
      const query = search.toLowerCase();

      const matchesSearch =
        student.includes(query) || purpose.includes(query);

      const matchesFilter =
        filter === "All" ||
        meeting.status?.toLowerCase() === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [meetings, search, filter]);

  const formatDate = (value: string) => {
    if (!value) return "Date not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { bg: "#E7F8EF", text: "#279965" };
      case "cancelled":
        return { bg: "#FFE9ED", text: "#E95368" };
      case "pending":
        return { bg: "#FFF4E5", text: "#D97706" };
      default:
        return { bg: "#EAF2FF", text: "#2675E8" };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5420D8"
            colors={["#5420D8"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerCard}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack ?? (() => undefined)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous screen"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#5420D8"
            />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>PTG Schedule</Text>
            <Text style={styles.subtitle}>
              View your assigned parent-teacher meetings
            </Text>
          </View>

        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={25}
              color={PURPLE}
            />
          </View>

          <View>
            <Text style={styles.summaryLabel}>Assigned Meetings</Text>
            <Text style={styles.summaryValue}>{meetings.length}</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#98A2B3" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search student or purpose..."
            placeholderTextColor="#98A2B3"
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {(["All", "Scheduled", "Completed", "Pending"] as FilterType[]).map(
            (item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterButton,
                  filter === item && styles.filterActive,
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
            )
          )}
        </ScrollView>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={PURPLE}
            style={styles.loader}
          />
        ) : error ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={35}
              color="#E95368"
            />
            <Text style={styles.emptyTitle}>Unable to load meetings</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={loadMeetings}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredMeetings.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={38}
              color="#A5AFBE"
            />
            <Text style={styles.emptyTitle}>No meetings found</Text>
            <Text style={styles.emptySubtitle}>
              Your assigned PTG meetings will appear here.
            </Text>
          </View>
        ) : (
          filteredMeetings.map((meeting) => {
            const colors = statusColors(meeting.status);

            return (
              <View key={meeting._id} style={styles.meetingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.studentIcon}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={23}
                      color={PURPLE}
                    />
                  </View>

                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>
                      {getStudentName(meeting)}
                    </Text>
                    <Text style={styles.meetingId}>
                      {meeting._id.slice(-8).toUpperCase()}
                    </Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                      {meeting.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Detail
                  icon="calendar-outline"
                  label="Meeting Date"
                  value={formatDate(meeting.meetingDate)}
                />

                <Detail
                  icon="clock-outline"
                  label="Meeting Time"
                  value={meeting.meetingTime || meeting.time || "Not specified"}
                />

                <Detail
                  icon="clipboard-text-outline"
                  label="Purpose"
                  value={meeting.purpose || "Not specified"}
                />

                {!!meeting.remarks && (
                  <Detail
                    icon="note-text-outline"
                    label="Remarks"
                    value={meeting.remarks}
                  />
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <MaterialCommunityIcons name={icon} size={18} color="#8792A4" />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7FA" },
  content: { padding: 20, paddingBottom: 35 },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EEEAF8",
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
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
    fontSize: 19,
    color: "#111528",
  },
  subtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#777C89",
    marginTop: 1,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEEAF8",
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#8792A4",
  },
  summaryValue: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 23,
    color: "#202A3A",
  },
  searchBox: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8EAF0",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#202A3A",
  },
  filters: { gap: 8, paddingVertical: 16 },
  filterButton: {
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF0",
  },
  filterActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  filterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#667085",
  },
  filterTextActive: { color: "#FFFFFF" },
  meetingCard: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#ECEEF3",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  studentIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  studentInfo: { flex: 1, marginLeft: 11 },
  studentName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#202A3A",
  },
  meetingId: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#98A2B3",
    marginTop: 3,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15 },
  badgeText: { fontFamily: "PoppinsMedium", fontSize: 9 },
  divider: {
    height: 1,
    backgroundColor: "#EEF0F5",
    marginVertical: 14,
  },
  detailRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  detailContent: { flex: 1 },
  detailLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#98A2B3",
  },
  detailValue: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#344054",
    marginTop: 2,
  },
  loader: { marginTop: 50 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    marginTop: 15,
  },
  emptyTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#344054",
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#98A2B3",
    textAlign: "center",
    marginTop: 6,
  },
  retryButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 9,
    marginTop: 14,
  },
  retryText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsMedium",
    fontSize: 11,
  },
});