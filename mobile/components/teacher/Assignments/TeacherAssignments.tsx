import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";
import { AssignmentRecord, fetchAssignments } from "@/services/assignments";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

type StatusFilter = "all" | "active" | "upcoming" | "due_today" | "overdue";
type TypeFilter =
  | "all"
  | "homework"
  | "practice_set"
  | "worksheet"
  | "project"
  | "revision";

type DateState = {
  key: Exclude<StatusFilter, "all">;
  label: string;
  color: string;
  background: string;
};

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Due Today", value: "due_today" },
  { label: "Overdue", value: "overdue" },
];

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "All Types", value: "all" },
  { label: "Homework", value: "homework" },
  { label: "Practice", value: "practice_set" },
  { label: "Worksheet", value: "worksheet" },
  { label: "Project", value: "project" },
  { label: "Revision", value: "revision" },
];

const getReferenceName = (value: any): string => {
  if (!value) return "N/A";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.name || value.standard || value.code || value._id || "N/A";
  }
  return "N/A";
};

const getBranchName = (value: any): string => {
  if (!value) return "N/A";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.name || value.code || value._id || "N/A";
  }
  return "N/A";
};

const dateKey = (value?: string | Date | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayKey = (): string => dateKey(new Date()) || "";

const formatDate = (value?: string | Date | null): string => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAssignmentTypeLabel = (type?: string): string => {
  const labels: Record<string, string> = {
    homework: "Homework",
    practice_set: "Practice Set",
    worksheet: "Worksheet",
    project: "Project",
    revision: "Revision",
  };
  return type ? labels[type] || type : "Assignment";
};

/**
 * These states describe assignment dates only. They do not indicate whether
 * students have submitted or completed the work.
 */
const getDateState = (assignment: AssignmentRecord): DateState => {
  const today = todayKey();
  const assigned = dateKey(assignment.assignedDate);
  const due = dateKey(assignment.submissionDate);

  if (due && due < today) {
    return {
      key: "overdue",
      label: "Deadline passed",
      color: "#B42318",
      background: "#FEE4E2",
    };
  }

  if (due && due === today) {
    return {
      key: "due_today",
      label: "Due today",
      color: "#B54708",
      background: "#FEF0C7",
    };
  }

  if (assigned && assigned > today) {
    return {
      key: "upcoming",
      label: "Upcoming",
      color: "#175CD3",
      background: "#EFF8FF",
    };
  }

  return {
    key: "active",
    label: "Active",
    color: "#027A48",
    background: "#D1FADF",
  };
};

const MetricCard = ({
  label,
  value,
  icon,
  tint,
  iconColor,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  iconColor: string;
}) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIcon, { backgroundColor: tint }]}>
      <Ionicons name={icon} size={19} color={iconColor} />
    </View>
    <View style={styles.metricTextWrap}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  </View>
);

type TeacherAssignmentsProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

const TeacherAssignments = ({
  onContentScroll,
  onBack,
}: TeacherAssignmentsProps = {}) => {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      const response = await fetchAssignments();
      setAssignments(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error("Teacher assignments error:", error);
      Alert.alert(
        "Unable to load assignments",
        error?.message || "Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAssignments();
  }, [loadAssignments]);

  const metrics = useMemo(() => {
    const states = assignments.map(getDateState);
    return {
      total: assignments.length,
      active: states.filter((state) => state.key === "active").length,
      upcoming: states.filter((state) => state.key === "upcoming").length,
      dueToday: states.filter((state) => state.key === "due_today").length,
    };
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const batchName = getReferenceName(assignment.batchId);
      const subjectName = getReferenceName(assignment.subjectId);
      const branchName = getBranchName((assignment as any).branchId);
      const typeName = getAssignmentTypeLabel(assignment.assignmentType);

      const searchable = [
        assignment.assignmentTitle,
        assignment.assignmentCode,
        batchName,
        subjectName,
        branchName,
        typeName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        getDateState(assignment).key === statusFilter;
      const matchesType =
        typeFilter === "all" || assignment.assignmentType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assignments, search, statusFilter, typeFilter]);

  const downloadAttachment = async (assignment: AssignmentRecord) => {
    if (!assignment.attachment?.fileName) {
      Alert.alert("No attachment", "This assignment has no attachment.");
      return;
    }

    try {
      setDownloadingId(assignment._id);
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const safeFileName = assignment.attachment.fileName.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );
      const fileUri = `${FileSystem.cacheDirectory}${Date.now()}_${safeFileName}`;
      const downloadUrl = `${API_BASE_URL}/assignments/${assignment._id}/attachment`;

      const result = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (result.status < 200 || result.status >= 300) {
        throw new Error("Unable to download the attachment.");
      }

      if (Platform.OS === "web") {
        Alert.alert(
          "Download complete",
          "The attachment download has completed."
        );
        return;
      }

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        await Sharing.shareAsync(result.uri, {
          mimeType: assignment.attachment.mimeType || "application/pdf",
          dialogTitle: "Open or save assignment attachment",
        });
      } else {
        Alert.alert("Download complete", `File saved to: ${result.uri}`);
      }
    } catch (error: any) {
      console.error("Assignment attachment download error:", error);
      Alert.alert(
        "Download failed",
        error?.message || "Unable to download the attachment."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const renderAssignment = ({ item }: { item: AssignmentRecord }) => {
    const dateState = getDateState(item);
    const branchName = getBranchName((item as any).branchId);

    return (
      <Pressable
        style={styles.assignmentCard}
        onPress={() => setSelectedAssignment(item)}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.assignmentIcon}>
            <Ionicons name="document-text-outline" size={22} color="#7040D5" />
          </View>

          <View style={styles.assignmentTitleContainer}>
            <Text style={styles.assignmentTitle} numberOfLines={2}>
              {item.assignmentTitle || "Untitled Assignment"}
            </Text>
            <Text style={styles.assignmentCode}>
              {item.assignmentCode || "No assignment code"}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: dateState.background }]}>
            <Text style={[styles.statusText, { color: dateState.color }]}>
              {dateState.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <InfoLine icon="people-outline" label="Batch" value={getReferenceName(item.batchId)} />
          <InfoLine icon="book-outline" label="Subject" value={getReferenceName(item.subjectId)} />
          <InfoLine icon="business-outline" label="Branch" value={branchName} />
          <InfoLine icon="albums-outline" label="Type" value={getAssignmentTypeLabel(item.assignmentType)} />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateColumn}>
            <Text style={styles.smallLabel}>Assigned</Text>
            <Text style={styles.dateText}>{formatDate(item.assignedDate)}</Text>
          </View>
          <View style={styles.dateColumn}>
            <Text style={styles.smallLabel}>Due date</Text>
            <Text style={styles.dateText}>{formatDate(item.submissionDate)}</Text>
          </View>
          <View style={styles.marksPill}>
            <Ionicons name="ribbon-outline" size={14} color="#7040D5" />
            <Text style={styles.marksText}>{item.totalMarks ?? "—"} Marks</Text>
          </View>
        </View>

        {item.attachment?.fileName ? (
          <View style={styles.attachmentAvailable}>
            <Ionicons name="attach-outline" size={14} color="#7040D5" />
            <Text style={styles.attachmentAvailableText} numberOfLines={1}>
              PDF attachment available
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7040D5" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => item._id}
        renderItem={renderAssignment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
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
                  name="book-outline"
                  size={25}
                  color="#5420D8"
                />
              </View>

              <View style={styles.headerText}>
                <Text style={styles.title}>Assignments</Text>
                <Text style={styles.subtitle}>
                  View assignments for your assigned classes
                </Text>
              </View>

              <View style={styles.headerCount}>
                <Text style={styles.headerCountValue}>{metrics.total}</Text>
                <Text style={styles.headerCountLabel}>Total</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <MetricCard
                label="Total Assignments"
                value={metrics.total}
                icon="documents-outline"
                tint="#F0EAFE"
                iconColor="#7040D5"
              />
              <MetricCard
                label="Active"
                value={metrics.active}
                icon="play-circle-outline"
                tint="#E7F8EF"
                iconColor="#168653"
              />
              <MetricCard
                label="Upcoming"
                value={metrics.upcoming}
                icon="calendar-outline"
                tint="#EAF2FF"
                iconColor="#3478D4"
              />
              <MetricCard
                label="Due Today"
                value={metrics.dueToday}
                icon="time-outline"
                tint="#FFF3DF"
                iconColor="#D98A16"
              />
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={19} color="#98A2B3" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search title, subject, batch, branch..."
                placeholderTextColor="#98A2B3"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 ? (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={19} color="#98A2B3" />
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.filterHeading}>Assignment Status</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              {STATUS_FILTERS.map((filter) => {
                const selected = statusFilter === filter.value;
                return (
                  <Pressable
                    key={filter.value}
                    onPress={() => setStatusFilter(filter.value)}
                    style={[styles.filterButton, selected && styles.activeFilterButton]}
                  >
                    <Text style={[styles.filterText, selected && styles.activeFilterText]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.typeFilterHeader}>
              <Text style={styles.filterHeading}>Type</Text>
              <Text style={styles.resultCount}>
                {filteredAssignments.length} result{filteredAssignments.length === 1 ? "" : "s"}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeFilterScroll}
              contentContainerStyle={styles.filterContent}
            >
              {TYPE_FILTERS.map((filter) => {
                const selected = typeFilter === filter.value;
                return (
                  <Pressable
                    key={filter.value}
                    onPress={() => setTypeFilter(filter.value)}
                    style={[styles.typeFilterButton, selected && styles.typeFilterButtonActive]}
                  >
                    <Text style={[styles.typeFilterText, selected && styles.typeFilterTextActive]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="documents-outline" size={36} color="#A6A0B5" />
            </View>
            <Text style={styles.emptyTitle}>No assignments found</Text>
            <Text style={styles.emptyDescription}>
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? "Try changing your search or filters."
                : "Assignments for your assigned classes will appear here."}
            </Text>
            {(search || statusFilter !== "all" || typeFilter !== "all") ? (
              <Pressable
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                <Text style={styles.clearFiltersText}>Clear filters</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />

      <Modal
        visible={!!selectedAssignment}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAssignment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeading}>Assignment Details</Text>
                <Text style={styles.modalSubheading}>Assignment information</Text>
              </View>
              <Pressable
                onPress={() => setSelectedAssignment(null)}
                style={styles.closeButton}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color="#475467" />
              </Pressable>
            </View>

            {selectedAssignment ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                <Text style={styles.detailTitle}>
                  {selectedAssignment.assignmentTitle || "Untitled Assignment"}
                </Text>
                <Text style={styles.detailCode}>
                  {selectedAssignment.assignmentCode || "No assignment code"}
                </Text>

                <View style={styles.detailStatusRow}>
                  {(() => {
                    const state = getDateState(selectedAssignment);
                    return (
                      <View style={[styles.statusBadge, { backgroundColor: state.background }]}>
                        <Text style={[styles.statusText, { color: state.color }]}>
                          {state.label}
                        </Text>
                      </View>
                    );
                  })()}
                  <Text style={styles.detailType}>
                    {getAssignmentTypeLabel(selectedAssignment.assignmentType)}
                  </Text>
                </View>

                <View style={styles.detailGrid}>
                  <DetailItem label="Batch" value={getReferenceName(selectedAssignment.batchId)} />
                  <DetailItem label="Subject" value={getReferenceName(selectedAssignment.subjectId)} />
                  <DetailItem label="Branch" value={getBranchName((selectedAssignment as any).branchId)} />
                  <DetailItem label="Total Marks" value={`${selectedAssignment.totalMarks ?? "N/A"}`} />
                  <DetailItem label="Assigned Date" value={formatDate(selectedAssignment.assignedDate)} />
                  <DetailItem label="Due Date" value={formatDate(selectedAssignment.submissionDate)} />
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.detailDescription}>
                    {selectedAssignment.description?.trim() || "No description provided."}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Instructions</Text>
                  <Text style={styles.detailDescription}>
                    {selectedAssignment.instructions?.trim() || "No additional instructions provided."}
                  </Text>
                </View>

                {selectedAssignment.attachment?.fileName ? (
                  <View style={styles.attachmentBox}>
                    <View style={styles.attachmentIcon}>
                      <Ionicons name="document-attach-outline" size={22} color="#7040D5" />
                    </View>
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentName} numberOfLines={2}>
                        {selectedAssignment.attachment.fileName}
                      </Text>
                      <Text style={styles.attachmentSubtext}>Attachment available</Text>
                    </View>
                    <Pressable
                      style={[
                        styles.downloadButton,
                        downloadingId === selectedAssignment._id && styles.downloadButtonDisabled,
                      ]}
                      disabled={downloadingId === selectedAssignment._id}
                      onPress={() => downloadAttachment(selectedAssignment)}
                    >
                      {downloadingId === selectedAssignment._id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="download-outline" size={19} color="#FFFFFF" />
                      )}
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.noAttachmentBox}>
                    <Ionicons name="document-outline" size={18} color="#98A2B3" />
                    <Text style={styles.noAttachmentText}>No attachment provided</Text>
                  </View>
                )}
              </ScrollView>
            ) : null}

            <Pressable
              style={styles.closeModalButton}
              onPress={() => setSelectedAssignment(null)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InfoLine = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View style={styles.infoLine}>
    <Ionicons name={icon} size={15} color="#8B7AAE" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value || "N/A"}</Text>
  </View>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
  </View>
);

export default TeacherAssignments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F9",
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7FA",
  },
  loadingText: {
    marginTop: 11,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#667085",
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
  headerText: { flex: 1 },
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
  headerCount: {
    minWidth: 48,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerCountValue: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
    color: "#7040D5",
  },
  headerCountLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 8,
    color: "#7040D5",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 9,
    marginBottom: 15,
  },
  metricCard: {
    width: "48.5%",
    minHeight: 73,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#EEEAF5",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  metricTextWrap: { flex: 1 },
  metricValue: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 18,
    color: "#262333",
    lineHeight: 24,
  },
  metricLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#858391",
    marginTop: 1,
  },
  searchContainer: {
    height: 45,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E5F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#252331",
    paddingVertical: 0,
  },
  filterHeading: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#5E5A69",
  },
  filterScroll: {
    flexGrow: 0,
    marginTop: 7,
    marginBottom: 10,
  },
  filterContent: {
    gap: 7,
    paddingRight: 8,
  },
  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E5F0",
  },
  activeFilterButton: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },
  filterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#716D7A",
  },
  activeFilterText: { color: "#FFFFFF" },
  typeFilterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultCount: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9692A0",
  },
  typeFilterScroll: {
    flexGrow: 0,
    marginTop: 6,
    marginBottom: 11,
  },
  typeFilterButton: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F0EDF5",
  },
  typeFilterButtonActive: {
    backgroundColor: "#E8DFFF",
    borderWidth: 1,
    borderColor: "#CBB8F4",
  },
  typeFilterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#777181",
  },
  typeFilterTextActive: { color: "#6536C5" },
  listContent: {
    paddingBottom: 28,
    flexGrow: 1,
  },
  assignmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEEAF4",
    padding: 14,
    marginBottom: 11,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  assignmentIcon: {
    width: 41,
    height: 41,
    borderRadius: 12,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  assignmentTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  assignmentTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#292536",
  },
  assignmentCode: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9A96A4",
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    fontFamily: "PoppinsMedium",
    fontSize: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0EDF4",
    marginVertical: 12,
  },
  infoGrid: {
    gap: 9,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    width: 48,
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9692A0",
  },
  infoValue: {
    flex: 1,
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#514C5D",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1EEF5",
  },
  dateColumn: { flex: 1 },
  smallLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 8,
    color: "#A09BA9",
  },
  dateText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#514C5D",
    marginTop: 3,
  },
  marksPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3EEFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  marksText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#7040D5",
  },
  attachmentAvailable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  attachmentAvailableText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#7040D5",
  },
  emptyContainer: {
    flex: 1,
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: "#F0EDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  emptyTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#514C5D",
  },
  emptyDescription: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#9692A0",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },
  clearFiltersButton: {
    marginTop: 13,
    backgroundColor: "#F0EAFE",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#7040D5",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(25, 20, 35, 0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    paddingTop: 17,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDF4",
  },
  modalHeading: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#292536",
  },
  modalSubheading: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9692A0",
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F1F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    paddingTop: 16,
    paddingBottom: 18,
  },
  detailTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#292536",
  },
  detailCode: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#9692A0",
    marginTop: 4,
  },
  detailStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 13,
  },
  detailType: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#7040D5",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    backgroundColor: "#FAF9FC",
    borderRadius: 13,
    padding: 11,
  },
  detailItem: {
    width: "50%",
    paddingVertical: 9,
    paddingHorizontal: 5,
  },
  detailLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9692A0",
  },
  detailValue: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#514C5D",
    marginTop: 4,
  },
  detailSection: { marginTop: 18 },
  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#514C5D",
    marginBottom: 6,
  },
  detailDescription: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#777181",
    lineHeight: 19,
  },
  attachmentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF9FC",
    borderWidth: 1,
    borderColor: "#EAE5F1",
    borderRadius: 12,
    padding: 10,
    marginTop: 20,
  },
  attachmentIcon: {
    width: 39,
    height: 39,
    borderRadius: 10,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 9,
    marginRight: 8,
  },
  attachmentName: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#514C5D",
  },
  attachmentSubtext: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9692A0",
    marginTop: 3,
  },
  downloadButton: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButtonDisabled: { opacity: 0.6 },
  noAttachmentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F8F7FA",
    borderRadius: 10,
    padding: 11,
    marginTop: 18,
  },
  noAttachmentText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#9692A0",
  },
  closeModalButton: {
    height: 44,
    borderRadius: 11,
    backgroundColor: "#7040D5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  closeModalButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
});
