import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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

type LeaveStatus = "pending" | "approved" | "rejected";

type LeaveType =
  | "Casual Leave"
  | "Sick Leave"
  | "Earned Leave"
  | "Emergency Leave"
  | "Other";

type LeaveRecord = {
  _id: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  createdAt?: string;
  decidedAt?: string | null;
  decidedBy?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | null;
};

type LeaveForm = {
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
};

const LEAVE_TYPES: LeaveType[] = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Emergency Leave",
  "Other",
];

const INITIAL_FORM: LeaveForm = {
  leaveType: "Casual Leave",
  fromDate: "",
  toDate: "",
  reason: "",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const datePart = value.split("T")[0];
  const parts = datePart.split("-");

  if (parts.length !== 3) return value;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const getStatusColor = (status: LeaveStatus) => {
  switch (status) {
    case "approved":
      return {
        background: "#DCFCE7",
        text: "#15803D",
      };
    case "rejected":
      return {
        background: "#FEE2E2",
        text: "#DC2626",
      };
    default:
      return {
        background: "#FEF3C7",
        text: "#B45309",
      };
  }
};

type TeacherMyLeaveProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

const TeacherMyLeave = ({
  onContentScroll,
  onBack,
}: TeacherMyLeaveProps = {}) => {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);

  const [form, setForm] = useState<LeaveForm>(INITIAL_FORM);
  const [showLeaveTypes, setShowLeaveTypes] = useState(false);

  const [filter, setFilter] = useState<"all" | LeaveStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeaves = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return leaves.filter((leave) => {
      const matchesStatus = filter === "all" || leave.status === filter;
      const matchesSearch =
        !query ||
        leave.leaveType.toLowerCase().includes(query) ||
        leave.reason.toLowerCase().includes(query) ||
        leave.status.toLowerCase().includes(query) ||
        formatDate(leave.fromDate).toLowerCase().includes(query) ||
        formatDate(leave.toDate).toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [leaves, filter, searchQuery]);

  const summary = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter((item) => item.status === "pending").length,
      approved: leaves.filter((item) => item.status === "approved").length,
      rejected: leaves.filter((item) => item.status === "rejected").length,
    }),
    [leaves]
  );

  const apiRequest = async (
    path: string,
    method: string = "GET",
    body?: object
  ) => {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const responseText = await response.text();

    let result: any = {};

    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error("Invalid server response.");
    }

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || "Something went wrong. Please try again."
      );
    }

    return result;
  };

  const loadLeaves = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await apiRequest("/leaves");

      const records = result?.data?.leaves;

      setLeaves(Array.isArray(records) ? records : []);
    } catch (error: any) {
      Alert.alert(
        "Unable to load leaves",
        error?.message || "Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const openApplyModal = () => {
    setEditingLeaveId(null);
    setForm(INITIAL_FORM);
    setModalVisible(true);
  };

  const openEditModal = (leave: LeaveRecord) => {
    if (leave.status !== "pending") {
      Alert.alert(
        "Cannot edit",
        "Only pending leave requests can be edited."
      );
      return;
    }

    setEditingLeaveId(leave._id);

    setForm({
      leaveType: leave.leaveType,
      fromDate: leave.fromDate.split("T")[0],
      toDate: leave.toDate.split("T")[0],
      reason: leave.reason,
    });

    setModalVisible(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setModalVisible(false);
    setEditingLeaveId(null);
    setForm(INITIAL_FORM);
    setShowLeaveTypes(false);
  };

  const updateForm = (key: keyof LeaveForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.fromDate.trim() || !form.toDate.trim()) {
      Alert.alert("Required fields", "Please enter both leave dates.");
      return false;
    }

    if (!isValidDate(form.fromDate)) {
      Alert.alert(
        "Invalid start date",
        "Enter the start date in YYYY-MM-DD format."
      );
      return false;
    }

    if (!isValidDate(form.toDate)) {
      Alert.alert(
        "Invalid end date",
        "Enter the end date in YYYY-MM-DD format."
      );
      return false;
    }

    if (form.fromDate > form.toDate) {
      Alert.alert(
        "Invalid date range",
        "The start date cannot be after the end date."
      );
      return false;
    }

    if (!form.reason.trim()) {
      Alert.alert("Reason required", "Please enter the reason for leave.");
      return false;
    }

    return true;
  };

  const submitLeave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason.trim(),
      };

      if (editingLeaveId) {
        await apiRequest(
          `/leaves/${editingLeaveId}`,
          "PUT",
          payload
        );

        Alert.alert("Success", "Leave request updated successfully.");
      } else {
        await apiRequest("/leaves", "POST", payload);

        Alert.alert("Success", "Leave request submitted successfully.");
      }

      setModalVisible(false);
      setEditingLeaveId(null);
      setForm(INITIAL_FORM);

      await loadLeaves();
    } catch (error: any) {
      Alert.alert(
        "Request failed",
        error?.message || "Unable to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (leave: LeaveRecord) => {
    if (leave.status !== "pending") {
      Alert.alert(
        "Cannot delete",
        "Only pending leave requests can be deleted."
      );
      return;
    }

    Alert.alert(
      "Delete leave request",
      "Are you sure you want to delete this leave request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteLeave(leave._id),
        },
      ]
    );
  };

  const deleteLeave = async (id: string) => {
    try {
      await apiRequest(`/leaves/${id}`, "DELETE");

      setLeaves((previous) =>
        previous.filter((item) => item._id !== id)
      );

      Alert.alert("Deleted", "Leave request deleted successfully.");
    } catch (error: any) {
      Alert.alert(
        "Delete failed",
        error?.message || "Unable to delete leave request."
      );
    }
  };

  const renderSummaryCard = (
    title: string,
    value: number,
    background: string,
    color: string,
    icon: string
  ) => (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: background }]}>
        <Text style={[styles.summaryIconText, { color }]}>{icon}</Text>
      </View>
      <View style={styles.summaryTextWrap}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );

  const renderLeaveCard = (leave: LeaveRecord) => {
    const statusColors = getStatusColor(leave.status);
    return (
      <View key={leave._id} style={styles.leaveCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.personIcon}><Text style={styles.personIconText}>♟</Text></View>
          <View style={styles.leaveTypeContainer}>
            <Text style={styles.leaveType}>{leave.leaveType}</Text>
            <Text style={styles.appliedDate}>Applied on {formatDate(leave.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.background }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.leaveDetailsGrid}>
          <View style={styles.leaveDetail}>
            <Text style={styles.detailLabel}>Leave Type</Text>
            <Text style={styles.detailValue}>▤  {leave.leaveType}</Text>
          </View>
          <View style={styles.leaveDetail}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>▦  {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}</Text>
          </View>
          <View style={styles.leaveDetail}>
            <Text style={styles.detailLabel}>Days</Text>
            <Text style={styles.daysValue}>{leave.days}</Text>
          </View>
        </View>
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonText}>▤  {leave.reason}</Text>
        </View>
        {leave.status === "approved" && leave.decidedAt ? (
          <Text style={styles.decisionText}>Approved on {formatDate(leave.decidedAt)}</Text>
        ) : null}
        {leave.status === "rejected" && leave.decidedAt ? (
          <Text style={styles.decisionText}>Rejected on {formatDate(leave.decidedAt)}</Text>
        ) : null}
        {leave.status === "pending" && (
          <View style={styles.actionRow}>
            <Pressable style={styles.editButton} onPress={() => openEditModal(leave)}>
              <Text style={styles.editButtonText}>✎  Edit</Text>
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={() => confirmDelete(leave)}>
              <Text style={styles.deleteButtonText}>×  Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadLeaves(true)}
            tintColor="#5420D8"
            colors={["#5420D8"]}
          />
        }
      >
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
              name="calendar-clear-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>My Leave</Text>
            <Text style={styles.subtitle}>View and manage your personal leave requests</Text>
          </View>
        </View>

        <View style={styles.summaryList}>
          {renderSummaryCard("Total Leave Requests", summary.total, "#F1EAFE", "#7040D5", "♙")}
          {renderSummaryCard("Approved", summary.approved, "#E6F7EF", "#35A979", "✓")}
          {renderSummaryCard("Pending Requests", summary.pending, "#FFF2E1", "#E99A2B", "◷")}
          {renderSummaryCard("Rejected", summary.rejected, "#FCE8EF", "#D95B86", "⊗")}
        </View>

        <View style={styles.filterPanel}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search leave type or reason..."
              placeholderTextColor="#9AA3B2"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Text style={styles.clearSearch}>×</Text>
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
            {(["all", "approved", "pending", "rejected"] as const).map((item) => {
              const selected = filter === item;
              return (
                <Pressable
                  key={item}
                  style={[styles.filterButton, selected && styles.activeFilterButton]}
                  onPress={() => setFilter(item)}
                >
                  <Text style={[styles.filterText, selected && styles.activeFilterText]}>
                    {item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.recordsHeading}>
          <View>
            <Text style={styles.sectionTitle}>Leave Records</Text>
            <Text style={styles.recordsCount}>
              {filteredLeaves.length} {filteredLeaves.length === 1 ? "record" : "records"} found
            </Text>
          </View>
          <View style={styles.overviewPill}>
            <Text style={styles.overviewPillText}>▦  Leave Overview</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading leave requests...</Text>
          </View>
        ) : filteredLeaves.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No leave requests found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === "all"
                ? "You haven't submitted any leave requests yet."
                : `You don't have any ${filter} leave requests.`}
            </Text>

          </View>
        ) : (
          <View style={styles.leaveList}>
            {filteredLeaves.map(renderLeaveCard)}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActionContainer}>
        <Pressable style={styles.bottomApplyButton} onPress={openApplyModal}>
          <Text style={styles.bottomApplyPlus}>＋</Text>
          <Text style={styles.bottomApplyText}>Apply Leave</Text>
        </Pressable>
      </View>

      {/* Apply / Edit Leave Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingLeaveId ? "Edit Leave Request" : "Apply for Leave"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Enter your leave details below.
                </Text>
              </View>

              <Pressable
                onPress={closeModal}
                disabled={submitting}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Leave Type *</Text>

              <Pressable
                style={styles.selectInput}
                onPress={() => setShowLeaveTypes((previous) => !previous)}
              >
                <Text style={styles.selectInputText}>{form.leaveType}</Text>
                <Text style={styles.dropdownArrow}>
                  {showLeaveTypes ? "▲" : "▼"}
                </Text>
              </Pressable>

              {showLeaveTypes && (
                <View style={styles.dropdownList}>
                  {LEAVE_TYPES.map((type) => (
                    <Pressable
                      key={type}
                      style={styles.dropdownItem}
                      onPress={() => {
                        updateForm("leaveType", type);
                        setShowLeaveTypes(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          form.leaveType === type &&
                            styles.selectedDropdownText,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={styles.inputLabel}>From Date *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={form.fromDate}
                onChangeText={(value) => updateForm("fromDate", value)}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>To Date *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={form.toDate}
                onChangeText={(value) => updateForm("toDate", value)}
                autoCapitalize="none"
              />

              <Text style={styles.dateHint}>
                Use YYYY-MM-DD format. Both dates are included in the leave
                duration.
              </Text>

              <Text style={styles.inputLabel}>Reason for Leave *</Text>
              <TextInput
                style={[styles.textInput, styles.reasonInput]}
                placeholder="Enter your reason for leave..."
                placeholderTextColor="#9CA3AF"
                value={form.reason}
                onChangeText={(value) => updateForm("reason", value)}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />

              <Text style={styles.characterCount}>
                {form.reason.length}/1000
              </Text>

              <View style={styles.modalActionRow}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.submitButton,
                    submitting && styles.disabledButton,
                  ]}
                  onPress={submitLeave}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editingLeaveId ? "Update Request" : "Submit Request"}
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TeacherMyLeave;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  scrollContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24 },
  bottomActionContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#ECEEF3",
  },
  bottomApplyButton: {
    alignSelf: "center",
    minWidth: 158,
    minHeight: 43,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#7040D5",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  bottomApplyPlus: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 22,
  },
  bottomApplyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },
  pageHeader: { backgroundColor: "#7040D5", marginHorizontal: -14, paddingHorizontal: 16, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 17, borderBottomLeftRadius: 15, borderBottomRightRadius: 18 },
  pageHeaderText: { flex: 1 },
  pageHeaderTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "PoppinsSemiBold" },
  pageHeaderSubtitle: { color: "#E9DFFF", fontSize: 10, fontFamily: "PoppinsRegular", marginTop: 3 },
  applyButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E2F0",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  applyButtonPlus: { color: "#344054", fontSize: 17, lineHeight: 20 },
  applyButtonText: { color: "#344054", fontSize: 9, fontFamily: "PoppinsSemiBold" },
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
  summaryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 9,
    marginBottom: 15,
  },
  summaryCard: {
    width: "48.5%",
    minHeight: 76,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#ECEEF3",
    shadowColor: "#172033",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  summaryIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryIconText: { fontSize: 18, fontFamily: "PoppinsSemiBold" },
  summaryTextWrap: { flex: 1 },
  summaryTitle: { color: "#8A93A2", fontSize: 9, lineHeight: 13, fontFamily: "PoppinsMedium" },
  summaryValue: { color: "#172033", fontSize: 20, fontFamily: "PoppinsSemiBold", marginTop: 1 },
  filterPanel: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 11, marginBottom: 15, borderWidth: 1, borderColor: "#ECEEF3", shadowColor: "#172033", shadowOpacity: 0.07, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  searchBox: { minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: "#E1E5EC", backgroundColor: "#FAFBFD", paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  searchIcon: { color: "#98A2B3", fontSize: 27 },
  searchInput: { flex: 1, color: "#344054", fontSize: 10, fontFamily: "PoppinsRegular", paddingVertical: 8 },
  clearSearch: { color: "#8B93A1", fontSize: 22, paddingHorizontal: 4 },
  filterContainer: { gap: 8, paddingRight: 4 },
  filterButton: { borderWidth: 1, borderColor: "#E1E5EC", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#FFFFFF" },
  activeFilterButton: { backgroundColor: "#7040D5", borderColor: "#7040D5" },
  filterText: { fontSize: 11, fontFamily: "PoppinsMedium", color: "#707A8A" },
  activeFilterText: { color: "#FFFFFF" },
  recordsHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: "PoppinsSemiBold", color: "#172033" },
  recordsCount: { fontSize: 10, fontFamily: "PoppinsRegular", color: "#929AAA", marginTop: 2 },
  overviewPill: { backgroundColor: "#F0E9FF", borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 },
  overviewPillText: { color: "#7040D5", fontSize: 10, fontFamily: "PoppinsMedium" },
  leaveList: { gap: 0 },
  leaveCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 13, marginBottom: 11, borderWidth: 1, borderColor: "#ECEEF3", shadowColor: "#172033", shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 15 },
  personIcon: { width: 48, height: 48, borderRadius: 13, backgroundColor: "#F1EAFE", alignItems: "center", justifyContent: "center" },
  personIconText: { color: "#7040D5", fontSize: 27 },
  leaveTypeContainer: { flex: 1 },
  leaveType: { fontSize: 12, fontFamily: "PoppinsSemiBold", color: "#172033" },
  appliedDate: { fontSize: 10, fontFamily: "PoppinsRegular", color: "#8D96A5", marginTop: 3 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 5 },
  statusText: { fontSize: 9, fontFamily: "PoppinsSemiBold" },
  cardDivider: { height: 1, backgroundColor: "#ECEEF2", marginBottom: 15 },
  leaveDetailsGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 13 },
  leaveDetail: { width: "50%", paddingRight: 6 },
  detailLabel: { color: "#929AAA", fontSize: 10, fontFamily: "PoppinsRegular", marginBottom: 5 },
  detailValue: { color: "#536071", fontSize: 10, fontFamily: "PoppinsMedium" },
  daysValue: { color: "#172033", fontSize: 17, fontFamily: "PoppinsSemiBold" },
  reasonContainer: { backgroundColor: "#F8F9FC", borderRadius: 10, padding: 9, marginTop: 11 },
  reasonText: { color: "#687386", fontSize: 10, fontFamily: "PoppinsRegular", lineHeight: 17 },
  decisionText: { fontSize: 10, fontFamily: "PoppinsMedium", color: "#6B7280", marginTop: 12 },
  actionRow: { flexDirection: "row", gap: 9, marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#ECEEF2" },
  editButton: { backgroundColor: "#F0E9FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9 },
  editButtonText: { color: "#7040D5", fontSize: 11, fontFamily: "PoppinsSemiBold" },
  deleteButton: { backgroundColor: "#FCEAF0", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9 },
  deleteButtonText: { color: "#D85D86", fontSize: 11, fontFamily: "PoppinsSemiBold" },
  centerContainer: { paddingVertical: 55, alignItems: "center" },
  loadingText: { fontSize: 12, fontFamily: "PoppinsRegular", color: "#6B7280", marginTop: 12 },
  emptyContainer: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 30, alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: "#ECEEF3" },
  emptyIcon: { fontSize: 34, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontFamily: "PoppinsSemiBold", color: "#172033" },
  emptySubtitle: { fontSize: 11, fontFamily: "PoppinsRegular", color: "#929AAA", textAlign: "center", marginTop: 7, lineHeight: 18 },
  emptyApplyButton: { backgroundColor: "#7040D5", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, marginTop: 17 },
  emptyApplyButtonText: { color: "#FFFFFF", fontSize: 11, fontFamily: "PoppinsSemiBold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 30, maxHeight: "92%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontFamily: "PoppinsSemiBold", color: "#172033" },
  modalSubtitle: { fontSize: 11, fontFamily: "PoppinsRegular", color: "#8A93A2", marginTop: 3 },
  closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  closeButtonText: { color: "#667085", fontSize: 16 },
  inputLabel: { fontSize: 11, fontFamily: "PoppinsMedium", color: "#344054", marginBottom: 7, marginTop: 13 },
  selectInput: { minHeight: 46, borderWidth: 1, borderColor: "#E1E5EC", borderRadius: 10, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectInputText: { color: "#344054", fontSize: 12, fontFamily: "PoppinsRegular" },
  dropdownArrow: { color: "#7040D5", fontSize: 12 },
  dropdownList: { borderWidth: 1, borderColor: "#E1E5EC", borderRadius: 10, marginTop: 5, overflow: "hidden" },
  dropdownItem: { paddingHorizontal: 13, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F1F2F5" },
  dropdownItemText: { color: "#475467", fontSize: 11, fontFamily: "PoppinsRegular" },
  selectedDropdownText: { color: "#7040D5", fontFamily: "PoppinsSemiBold" },
  textInput: { minHeight: 46, borderWidth: 1, borderColor: "#E1E5EC", borderRadius: 10, paddingHorizontal: 13, color: "#344054", fontSize: 12, fontFamily: "PoppinsRegular" },
  dateHint: { fontSize: 10, color: "#929AAA", fontFamily: "PoppinsRegular", marginTop: 7, lineHeight: 16 },
  reasonInput: { minHeight: 100, paddingTop: 12 },
  characterCount: { textAlign: "right", color: "#98A2B3", fontSize: 9, marginTop: 4, fontFamily: "PoppinsRegular" },
  modalActionRow: { flexDirection: "row", gap: 10, marginTop: 22 },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: "#E1E5EC", borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  cancelButtonText: { color: "#667085", fontSize: 11, fontFamily: "PoppinsSemiBold" },
  submitButton: { flex: 1, backgroundColor: "#7040D5", borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  submitButtonText: { color: "#FFFFFF", fontSize: 11, fontFamily: "PoppinsSemiBold" },
  disabledButton: { opacity: 0.6 },
});
