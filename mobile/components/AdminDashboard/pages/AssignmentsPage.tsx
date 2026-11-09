import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_BASE_URL } from "@/config/api";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { getToken } from "@/services/auth";

type ApiRecord = Record<string, any>;
type Status = "Active" | "Upcoming" | "Due Today" | "Completed";
type Assignment = {
  id: string;
  title: string;
  code: string;
  subject: string;
  batch: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  instructions: string;
  type: string;
  status: Status;
  attachmentName: string;
  hasAttachment: boolean;
  raw: ApiRecord;
};

const PURPLE = "#7040D5";
const TYPES: Record<string, string> = {
  homework: "Homework",
  practice_set: "Practice Set",
  worksheet: "Worksheet",
  project: "Project",
  revision: "Revision",
};

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function unwrapList(payload: any): ApiRecord[] {
  if (Array.isArray(payload)) return payload;
  for (const key of ["assignments", "results", "items", "data"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    if (Array.isArray(payload?.data?.data?.[key])) return payload.data.data[key];
  }
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function objectName(value: any, fallback = "—"): string {
  if (typeof value === "string") return value || fallback;
  if (value && typeof value === "object") {
    return firstString(value.name, value.title, value.batchName, value.subjectName, value.code, value._id) || fallback;
  }
  return fallback;
}

function formatDate(value: any): string {
  if (!value) return "—";
  const raw = String(value);
  // Preserve date-only values to avoid timezone shifts.
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getStatus(item: ApiRecord): Status {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const assigned = item.assignedDate ? new Date(item.assignedDate) : null;
  const due = item.submissionDate ? new Date(item.submissionDate) : null;
  if (due && !Number.isNaN(due.getTime())) {
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    if (dueDay.getTime() < today.getTime()) return "Completed";
    if (dueDay.getTime() === today.getTime()) return "Due Today";
  }
  if (assigned && !Number.isNaN(assigned.getTime())) {
    const assignedDay = new Date(assigned.getFullYear(), assigned.getMonth(), assigned.getDate());
    if (assignedDay.getTime() > today.getTime()) return "Upcoming";
  }
  return "Active";
}

function mapAssignment(item: ApiRecord): Assignment {
  const attachment = item.attachment ?? item.pdf ?? item.file ?? null;
  const attachmentName = firstString(
    item.attachmentName,
    item.attachmentOriginalName,
    item.originalName,
    attachment?.originalName,
    attachment?.filename,
    attachment?.name,
    item.pdfName
  );
  return {
    id: firstString(item._id, item.id, item.assignmentId),
    title: firstString(item.assignmentTitle, item.title, "Untitled Assignment"),
    code: firstString(item.assignmentCode, item.code, "—"),
    subject: objectName(item.subjectId ?? item.subject, "Subject not specified"),
    batch: objectName(item.batchId ?? item.batch, "Batch not specified"),
    assignedDate: formatDate(item.assignedDate),
    dueDate: formatDate(item.submissionDate ?? item.dueDate),
    maxMarks: Number(item.totalMarks ?? item.maxMarks ?? 0) || 0,
    description: firstString(item.description, "No description provided."),
    instructions: firstString(item.instructions),
    type: firstString(item.assignmentType, item.type, "homework"),
    status: getStatus(item),
    attachmentName: attachmentName || (item.attachmentUrl ? "Attached PDF" : ""),
    hasAttachment: Boolean(attachment || item.attachmentUrl || item.attachmentPath || item.pdfUri || item.fileUrl),
    raw: item,
  };
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new Error(firstString(payload?.message, payload?.error, `Request failed (${response.status})`));
  }
  return payload;
}

const statusStyle: Record<Status, { bg: string; text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  Active: { bg: "#E7F8EF", text: "#259B64", icon: "check-circle-outline" },
  Upcoming: { bg: "#F1EAFF", text: PURPLE, icon: "calendar-clock" },
  "Due Today": { bg: "#FFF1E2", text: "#D97706", icon: "clock-alert-outline" },
  Completed: { bg: "#EAF2FF", text: "#2675E8", icon: "check-all" },
};

export default function AdminAssignmentsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editAssignedDate, setEditAssignedDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editMarks, setEditMarks] = useState("");

  const loadAssignments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setLoadError("");
    try {
      const payload = await apiRequest("/assignments");
      const rows = unwrapList(payload).map(mapAssignment).filter((item) => item.id);
      setAssignments(rows);
    } catch (error: any) {
      setLoadError(error?.message || "Unable to load assignments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadAssignments(); }, [loadAssignments]);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assignments.filter((item) => {
      const matchesQuery = !query || [item.title, item.code, item.subject, item.batch, item.description, TYPES[item.type] || item.type]
        .some((value) => value.toLowerCase().includes(query));
      return matchesQuery && (filter === "All" || item.status === filter);
    });
  }, [assignments, search, filter]);

  const activeCount = assignments.filter((item) => item.status === "Active").length;
  const upcomingCount = assignments.filter((item) => item.status === "Upcoming").length;
  const dueTodayCount = assignments.filter((item) => item.status === "Due Today").length;

  const openEdit = (item: Assignment) => {
    setSelected(item);
    setEditTitle(item.title);
    setEditDescription(item.description === "No description provided." ? "" : item.description);
    setEditInstructions(item.instructions);
    setEditAssignedDate(item.raw.assignedDate ? String(item.raw.assignedDate).slice(0, 10) : "");
    setEditDueDate(item.raw.submissionDate ? String(item.raw.submissionDate).slice(0, 10) : item.raw.dueDate ? String(item.raw.dueDate).slice(0, 10) : "");
    setEditMarks(String(item.maxMarks || ""));
    setActionVisible(false);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    if (!editTitle.trim()) return Alert.alert("Validation", "Assignment title is required.");
    const marks = Number(editMarks);
    if (!editMarks.trim() || !Number.isFinite(marks) || marks < 0) return Alert.alert("Validation", "Enter valid total marks.");
    setSaving(true);
    try {
      const body = {
        assignmentTitle: editTitle.trim(),
        description: editDescription.trim(),
        instructions: editInstructions.trim(),
        assignedDate: editAssignedDate,
        submissionDate: editDueDate,
        totalMarks: marks,
      };
      await apiRequest(`/assignments/${encodeURIComponent(selected.id)}`, { method: "PUT", body: JSON.stringify(body) });
      setEditVisible(false);
      await loadAssignments(true);
      Alert.alert("Updated", "Assignment details updated successfully.");
    } catch (error: any) {
      Alert.alert("Update failed", error?.message || "Unable to update this assignment.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAssignment = (item: Assignment) => {
    setActionVisible(false);
    Alert.alert("Delete Assignment", `Are you sure you want to delete “${item.title}”?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await apiRequest(`/assignments/${encodeURIComponent(item.id)}`, { method: "DELETE" });
          setAssignments((current) => current.filter((row) => row.id !== item.id));
          Alert.alert("Deleted", "Assignment deleted successfully.");
        } catch (error: any) {
          Alert.alert("Delete failed", error?.message || "Unable to delete this assignment. Check your Admin permissions.");
        }
      } },
    ]);
  };

  const openAttachment = async (item: Assignment) => {
    try {
      const url = `${API_BASE_URL}/assignments/${encodeURIComponent(item.id)}/attachment`;
      const token = await getToken();
      const filename = (item.attachmentName || `${item.code || "assignment"}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");
      const destination = `${FileSystem.cacheDirectory || ""}${filename.endsWith(".pdf") ? filename : `${filename}.pdf`}`;
      const result = await FileSystem.downloadAsync(url, destination, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (result.status < 200 || result.status >= 300) {
        throw new Error(`PDF download failed (${result.status}).`);
      }
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", dialogTitle: item.title, UTI: "com.adobe.pdf" });
      } else {
        Alert.alert("PDF downloaded", `Saved temporarily to: ${result.uri}`);
      }
    } catch (error: any) {
      Alert.alert("PDF unavailable", error?.message || "Unable to download the attachment. Check the attachment route and permissions.");
    }
  };

  const summaryCard = (label: string, value: number, icon: keyof typeof MaterialCommunityIcons.glyphMap, tint: string, bg: string) => (
    <View key={label} style={[styles.summaryCard, { width: isDesktop ? "23.5%" : "48%" }]}>
      <View style={[styles.summaryIcon, { backgroundColor: bg }]}><MaterialCommunityIcons name={icon} size={21} color={tint} /></View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  const renderAssignment = (item: Assignment) => {
    const badge = statusStyle[item.status];
    return (
      <View key={item.id} style={[styles.assignmentCard, { width: isDesktop ? "48.8%" : "100%" }]}>
        <View style={styles.cardTop}>
          <View style={styles.assignmentIcon}><MaterialCommunityIcons name="clipboard-text-outline" size={24} color={PURPLE} /></View>
          <TouchableOpacity style={styles.moreButton} onPress={() => { setSelected(item); setActionVisible(true); }}>
            <MaterialCommunityIcons name="dots-vertical" size={21} color="#748096" />
          </TouchableOpacity>
        </View>
        <Text style={styles.assignmentTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.assignmentCode}>{item.code}</Text>
        {item.hasAttachment && <View style={styles.attachmentRow}>
          <MaterialCommunityIcons name="file-pdf-box" size={20} color="#D84343" />
          <Text style={styles.attachmentName} numberOfLines={1}>{item.attachmentName || "Attached PDF"}</Text>
          <TouchableOpacity onPress={() => void openAttachment(item)}><MaterialCommunityIcons name="download-outline" size={20} color={PURPLE} /></TouchableOpacity>
        </View>}
        <View style={styles.infoRow}><MaterialCommunityIcons name="book-open-outline" size={15} color="#748096" /><Text style={styles.infoText}>{item.subject}</Text></View>
        <View style={styles.infoRow}><MaterialCommunityIcons name="account-group-outline" size={15} color="#748096" /><Text style={styles.infoText}>{item.batch}</Text></View>
        <View style={styles.infoRow}><MaterialCommunityIcons name="shape-outline" size={15} color="#748096" /><Text style={styles.infoText}>{TYPES[item.type] || item.type}</Text></View>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}><MaterialCommunityIcons name="calendar-arrow-right" size={15} color={PURPLE} /><Text style={styles.dateText}>{item.assignedDate}</Text></View>
          <View style={styles.dateItem}><MaterialCommunityIcons name="calendar-alert" size={15} color="#E95386" /><Text style={styles.dateText}>{item.dueDate}</Text></View>
        </View>
        <View style={styles.cardBottom}>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}><MaterialCommunityIcons name={badge.icon} size={13} color={badge.text} /><Text style={[styles.statusText, { color: badge.text }]}>{item.status}</Text></View>
          <Text style={styles.marksText}>{item.maxMarks} Marks</Text>
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={() => { setSelected(item); setViewVisible(true); }}>
          <MaterialCommunityIcons name="eye-outline" size={17} color={PURPLE} /><Text style={styles.viewButtonText}>View Assignment</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" /></TouchableOpacity>
        <View style={{ flex: 1 }}><Text style={styles.headerTitle}>Assignments</Text></View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push({ pathname: "/(admin)/add-assignment", params: { feature: "Add Assignment" } } as any)}>
          <MaterialCommunityIcons name="plus" size={17} color={PURPLE} /><Text style={styles.addButtonText}>Add Assignment</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadAssignments(true)} tintColor={PURPLE} />} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
        <Text style={styles.managementTitle}>Assignment Management</Text>
        <Text style={styles.managementSubtitle}>Create, organize and manage assignments and homework.</Text>
        <View style={styles.summaryGrid}>
          {summaryCard("Total Assignments", assignments.length, "clipboard-text-multiple-outline", PURPLE, "#F1EAFF")}
          {summaryCard("Active", activeCount, "clipboard-check-outline", "#259B64", "#E7F8EF")}
          {summaryCard("Upcoming", upcomingCount, "calendar-clock", "#2675E8", "#EAF2FF")}
          {summaryCard("Due Today", dueTodayCount, "clock-alert-outline", "#D97706", "#FFF1E2")}
        </View>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#9AA3B2" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search assignment, subject or batch..." placeholderTextColor="#A0A8B5" style={styles.searchInput} />
          {!!search && <TouchableOpacity onPress={() => setSearch("")}><MaterialCommunityIcons name="close-circle" size={18} color="#9AA3B2" /></TouchableOpacity>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(["All", "Active", "Upcoming", "Due Today", "Completed"] as const).map((value) => {
            const active = filter === value;
            return <TouchableOpacity key={value} onPress={() => setFilter(value)} style={[styles.filterButton, active && styles.filterButtonActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{value}</Text></TouchableOpacity>;
          })}
        </ScrollView>

        {loading ? <View style={styles.centerState}><ActivityIndicator size="large" color={PURPLE} /><Text style={styles.stateText}>Loading assignments...</Text></View> : loadError ? <View style={styles.centerState}>
          <MaterialCommunityIcons name="alert-circle-outline" size={42} color="#E95386" /><Text style={styles.emptyTitle}>Unable to load assignments</Text><Text style={styles.stateText}>{loadError}</Text><TouchableOpacity style={styles.retryButton} onPress={() => void loadAssignments()}><Text style={styles.retryText}>Try Again</Text></TouchableOpacity>
        </View> : filteredAssignments.length === 0 ? <View style={styles.centerState}>
          <MaterialCommunityIcons name="clipboard-search-outline" size={48} color="#B1B8C5" /><Text style={styles.emptyTitle}>No assignments found</Text><Text style={styles.stateText}>{assignments.length === 0 ? "Assignments created for your branch will appear here." : "Try changing your search or filter."}</Text>
        </View> : <View style={styles.assignmentGrid}>{filteredAssignments.map(renderAssignment)}</View>}
      </ScrollView>

      <Modal visible={actionVisible} transparent animationType="fade" onRequestClose={() => setActionVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setActionVisible(false)}><Pressable style={styles.actionModal} onPress={(event) => event.stopPropagation()}>
          <View style={styles.modalHandle} /><Text style={styles.modalTitle}>Assignment Actions</Text><Text style={styles.modalSubtitle} numberOfLines={2}>{selected?.title}</Text>
          <TouchableOpacity style={styles.actionItem} onPress={() => { setActionVisible(false); setViewVisible(true); }}><View style={styles.actionIcon}><MaterialCommunityIcons name="eye-outline" size={20} color={PURPLE} /></View><Text style={styles.actionText}>View Assignment</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#A0A8B5" /></TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => selected && openEdit(selected)}><View style={styles.actionIcon}><MaterialCommunityIcons name="pencil-outline" size={20} color="#2675E8" /></View><Text style={styles.actionText}>Edit Assignment</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#A0A8B5" /></TouchableOpacity>
          {selected?.hasAttachment && <TouchableOpacity style={styles.actionItem} onPress={() => { setActionVisible(false); if (selected) void openAttachment(selected); }}><View style={styles.actionIcon}><MaterialCommunityIcons name="file-pdf-box" size={20} color={PURPLE} /></View><Text style={styles.actionText}>Open Attachment PDF</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#A0A8B5" /></TouchableOpacity>}
          <TouchableOpacity style={styles.actionItem} onPress={() => selected && deleteAssignment(selected)}><View style={[styles.actionIcon, { backgroundColor: "#FFE9F0" }]}><MaterialCommunityIcons name="delete-outline" size={20} color="#E95386" /></View><Text style={[styles.actionText, { color: "#E95386" }]}>Delete Assignment</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#A0A8B5" /></TouchableOpacity>
        </Pressable></Pressable>
      </Modal>

      <Modal visible={viewVisible} transparent animationType="slide" onRequestClose={() => setViewVisible(false)}>
        <View style={styles.modalOverlay}><View style={[styles.largeModal, { width: isDesktop ? 650 : "94%", maxHeight: "88%" }]}>
          <View style={styles.modalHeader}><View style={{ flex: 1 }}><Text style={styles.modalTitle}>Assignment Details</Text><Text style={styles.modalSubtitle}>{selected?.code}</Text></View><TouchableOpacity onPress={() => setViewVisible(false)}><MaterialCommunityIcons name="close" size={24} color="#748096" /></TouchableOpacity></View>
          {selected && <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailHeader}><View style={styles.assignmentIcon}><MaterialCommunityIcons name="clipboard-text-outline" size={24} color={PURPLE} /></View><View style={{ flex: 1 }}><Text style={styles.detailTitle}>{selected.title}</Text><Text style={styles.assignmentCode}>{selected.code}</Text></View></View>
            <View style={styles.detailGrid}>
              {[ ["Subject", selected.subject], ["Batch", selected.batch], ["Type", TYPES[selected.type] || selected.type], ["Maximum Marks", String(selected.maxMarks)], ["Assigned Date", selected.assignedDate], ["Submission Date", selected.dueDate] ].map(([label, value]) => <View key={label} style={styles.detailBox}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>)}
            </View>
            <Text style={styles.sectionTitle}>Description</Text><View style={styles.descriptionBox}><Text style={styles.descriptionText}>{selected.description}</Text></View>
            {!!selected.instructions && <><Text style={styles.sectionTitle}>Instructions</Text><View style={styles.descriptionBox}><Text style={styles.descriptionText}>{selected.instructions}</Text></View></>}
            {selected.hasAttachment && <TouchableOpacity style={styles.primaryButton} onPress={() => void openAttachment(selected)}><MaterialCommunityIcons name="file-pdf-box" size={20} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Open Attachment PDF</Text></TouchableOpacity>}
            <TouchableOpacity style={styles.secondaryButton} onPress={() => openEdit(selected)}><MaterialCommunityIcons name="pencil-outline" size={18} color={PURPLE} /><Text style={styles.secondaryButtonText}>Edit Assignment</Text></TouchableOpacity>
          </ScrollView>}
        </View></View>
      </Modal>

      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}><View style={[styles.largeModal, { width: isDesktop ? 600 : "94%", maxHeight: "90%" }]}>
          <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Edit Assignment</Text><Text style={styles.modalSubtitle}>Update assignment information</Text></View><TouchableOpacity onPress={() => setEditVisible(false)}><MaterialCommunityIcons name="close" size={24} color="#748096" /></TouchableOpacity></View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Assignment Title *</Text><TextInput value={editTitle} onChangeText={setEditTitle} style={styles.input} placeholder="Assignment title" placeholderTextColor="#A0A8B5" />
            <Text style={styles.inputLabel}>Description</Text><TextInput value={editDescription} onChangeText={setEditDescription} multiline textAlignVertical="top" style={[styles.input, styles.multilineInput]} placeholder="Description" placeholderTextColor="#A0A8B5" />
            <Text style={styles.inputLabel}>Instructions</Text><TextInput value={editInstructions} onChangeText={setEditInstructions} multiline textAlignVertical="top" style={[styles.input, styles.multilineInput]} placeholder="Instructions" placeholderTextColor="#A0A8B5" />
            <Text style={styles.inputLabel}>Assigned Date (YYYY-MM-DD)</Text><TextInput value={editAssignedDate} onChangeText={setEditAssignedDate} style={styles.input} placeholder="2026-10-28" placeholderTextColor="#A0A8B5" />
            <Text style={styles.inputLabel}>Submission Date (YYYY-MM-DD)</Text><TextInput value={editDueDate} onChangeText={setEditDueDate} style={styles.input} placeholder="2026-11-04" placeholderTextColor="#A0A8B5" />
            <Text style={styles.inputLabel}>Total Marks</Text><TextInput value={editMarks} onChangeText={setEditMarks} keyboardType="numeric" style={styles.input} placeholder="100" placeholderTextColor="#A0A8B5" />
            <TouchableOpacity style={[styles.primaryButton, saving && { opacity: 0.65 }]} disabled={saving} onPress={() => void saveEdit()}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Save Changes</Text>}</TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  header: { minHeight: 72, backgroundColor: PURPLE, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  backButton: { width: 36, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center", marginRight: 8 },
  headerTitle: { fontFamily: "PoppinsBold", fontSize: 20, color: "#FFFFFF" },
  addButton: { minHeight: 36, borderRadius: 9, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 10, marginLeft: 8 },
  addButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: PURPLE, marginLeft: 4 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  managementTitle: { fontFamily: "PoppinsBold", fontSize: 20, color: "#172033" },
  managementSubtitle: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#748096", marginTop: 3, marginBottom: 17 },
  summaryGrid: { width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  summaryCard: { minHeight: 105, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#EEF0F5", padding: 13, marginBottom: 2, elevation: 2 },
  summaryIcon: { width: 39, height: 39, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  summaryValue: { fontFamily: "PoppinsBold", fontSize: 19, color: "#172033", marginTop: 7 },
  summaryLabel: { fontFamily: "PoppinsMedium", fontSize: 8.5, color: "#748096", marginTop: 1 },
  searchBox: { minHeight: 45, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E7EAF0", borderRadius: 11, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", marginTop: 18 },
  searchInput: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 10, color: "#172033", marginLeft: 8, paddingVertical: 8 },
  filters: { paddingVertical: 14, gap: 8 },
  filterButton: { paddingHorizontal: 14, minHeight: 34, borderRadius: 9, borderWidth: 1, borderColor: "#E3E6ED", backgroundColor: "#FFFFFF", justifyContent: "center" },
  filterButtonActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  filterText: { fontFamily: "PoppinsMedium", fontSize: 9, color: "#748096" },
  filterTextActive: { color: "#FFFFFF" },
  assignmentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 13, justifyContent: "space-between" },
  assignmentCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EEF0F5", padding: 15, marginBottom: 2, elevation: 2 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  assignmentIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: "#F1EAFF", alignItems: "center", justifyContent: "center" },
  moreButton: { width: 34, height: 34, borderRadius: 9, backgroundColor: "#F7F8FC", alignItems: "center", justifyContent: "center" },
  assignmentTitle: { fontFamily: "PoppinsSemiBold", fontSize: 13, lineHeight: 19, color: "#172033", marginTop: 12 },
  assignmentCode: { fontFamily: "PoppinsMedium", fontSize: 8.5, color: PURPLE, marginTop: 3 },
  attachmentRow: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F9F6FE", borderWidth: 1, borderColor: "#E8E0F7", borderRadius: 9, paddingHorizontal: 9, marginTop: 10 },
  attachmentName: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 9, color: "#626675" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  infoText: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 9, color: "#748096", marginLeft: 7 },
  dateRow: { marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F0F1F5", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  dateItem: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  dateText: { fontFamily: "PoppinsMedium", fontSize: 8, color: "#566176", marginLeft: 5 },
  cardBottom: { marginTop: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusBadge: { minHeight: 27, paddingHorizontal: 9, borderRadius: 8, flexDirection: "row", alignItems: "center" },
  statusText: { fontFamily: "PoppinsSemiBold", fontSize: 8, marginLeft: 4 },
  marksText: { fontFamily: "PoppinsMedium", fontSize: 8.5, color: "#748096" },
  viewButton: { height: 36, borderRadius: 9, backgroundColor: "#F1EAFF", marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  viewButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 9, color: PURPLE, marginLeft: 5 },
  centerState: { minHeight: 230, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EEF0F5", alignItems: "center", justifyContent: "center", padding: 24, marginTop: 4 },
  stateText: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#748096", marginTop: 8, textAlign: "center" },
  emptyTitle: { fontFamily: "PoppinsSemiBold", fontSize: 14, color: "#172033", marginTop: 10, textAlign: "center" },
  retryButton: { marginTop: 14, backgroundColor: PURPLE, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 9 },
  retryText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#FFFFFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(20,24,35,0.45)", alignItems: "center", justifyContent: "center", padding: 12 },
  actionModal: { width: "94%", maxWidth: 500, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 18 },
  modalHandle: { width: 35, height: 4, borderRadius: 4, backgroundColor: "#D9DDE5", alignSelf: "center", marginBottom: 14 },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  modalTitle: { fontFamily: "PoppinsBold", fontSize: 17, color: "#172033" },
  modalSubtitle: { fontFamily: "PoppinsRegular", fontSize: 9, color: "#748096", marginTop: 3 },
  actionItem: { minHeight: 54, borderBottomWidth: 1, borderBottomColor: "#F0F1F5", flexDirection: "row", alignItems: "center" },
  actionIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#F1EAFF", alignItems: "center", justifyContent: "center" },
  actionText: { flex: 1, fontFamily: "PoppinsMedium", fontSize: 10, color: "#172033", marginLeft: 11 },
  largeModal: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 19 },
  detailHeader: { backgroundColor: "#F7F4FF", borderRadius: 13, padding: 13, flexDirection: "row", alignItems: "center", gap: 11 },
  detailTitle: { fontFamily: "PoppinsBold", fontSize: 15, color: "#172033" },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 15 },
  detailBox: { width: "48%", minHeight: 66, backgroundColor: "#F7F8FC", borderRadius: 11, padding: 11 },
  detailLabel: { fontFamily: "PoppinsMedium", fontSize: 8, color: "#748096" },
  detailValue: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#172033", marginTop: 5 },
  sectionTitle: { fontFamily: "PoppinsSemiBold", fontSize: 12, color: "#172033", marginTop: 17, marginBottom: 8 },
  descriptionBox: { backgroundColor: "#F7F8FC", borderRadius: 11, padding: 13 },
  descriptionText: { fontFamily: "PoppinsRegular", fontSize: 9.5, lineHeight: 16, color: "#566176" },
  primaryButton: { minHeight: 44, borderRadius: 10, backgroundColor: PURPLE, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, marginTop: 16, paddingHorizontal: 12 },
  primaryButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#FFFFFF" },
  secondaryButton: { minHeight: 42, borderRadius: 10, backgroundColor: "#F1EAFF", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, marginTop: 9, marginBottom: 4 },
  secondaryButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: PURPLE },
  inputLabel: { fontFamily: "PoppinsMedium", fontSize: 9.5, color: "#566176", marginBottom: 5, marginTop: 10 },
  input: { minHeight: 43, borderWidth: 1, borderColor: "#E3E6ED", borderRadius: 10, paddingHorizontal: 11, fontFamily: "PoppinsRegular", fontSize: 10, color: "#172033" },
  multilineInput: { minHeight: 80, paddingTop: 10 },
});
