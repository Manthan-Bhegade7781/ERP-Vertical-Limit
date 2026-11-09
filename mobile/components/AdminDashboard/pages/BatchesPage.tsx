import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type BatchStatus = "Active" | "Upcoming" | "Completed";
type Batch = {
  id: string;
  name: string;
  code: string;
  year: string;
  standard: string;
  course: string;
  faculty: string;
  branch: string;
  branchId: string;
  students: number;
  capacity: number;
  startDate: string;
  endDate: string;
  status: BatchStatus;
  schedule: { startTime: string; endTime: string; days: string[] };
  description: string;
};
type Subject = { id: string; name: string; code: string; standard: string; type: string; status: string };
type Teacher = { id: string; name: string; email: string; branchId: string };
type BatchSubject = {
  id: string;
  batchId: string;
  subjectId: string;
  subject: string;
  subjectCode: string;
  teacherId: string;
  teacher: string;
  teacherEmail: string;
  status: "active" | "inactive";
};

const filters = ["All", "8th", "9th", "10th", "11th", "12th", "JEE", "NEET", "MHT-CET", "Foundation"];

const getId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || "");
};
const getArray = (payload: any, keys: string[]): any[] => {
  for (const key of keys) {
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
};
const getSubjectRows = (payload: any): any[] => {
  // Supports the controller response { success: true, data: { subjects: [...] } },
  // plus common wrappers used by API clients.
  const candidates = [
    payload?.data?.subjects,
    payload?.subjects,
    payload?.data?.data?.subjects,
    payload?.result?.subjects,
    payload?.data,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const inputDate = (value: any) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
};
const displayDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const batchStatus = (startDate: string, endDate: string): BatchStatus => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const start = new Date(startDate); start.setHours(0, 0, 0, 0);
  const end = new Date(endDate); end.setHours(23, 59, 59, 999);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Upcoming";
  if (now < start) return "Upcoming";
  if (now > end) return "Completed";
  return "Active";
};
const mapBatch = (raw: any): Batch => {
  const branch = raw?.branchId && typeof raw.branchId === "object" ? raw.branchId : {};
  const startDate = inputDate(raw?.startDate);
  const endDate = inputDate(raw?.endDate);
  return {
    id: getId(raw), name: String(raw?.name || ""), code: String(raw?.code || ""),
    year: String(raw?.academicYear || ""), standard: String(raw?.standard || ""),
    course: "", faculty: "", branch: String(branch?.name || branch?.code || "My Branch"),
    branchId: getId(raw?.branchId) || String(raw?.branchId || ""),
    students: Number(raw?.students ?? raw?.studentCount ?? 0), capacity: Number(raw?.capacity || 0),
    startDate, endDate, status: batchStatus(startDate, endDate),
    schedule: { startTime: String(raw?.schedule?.startTime || ""), endTime: String(raw?.schedule?.endTime || ""), days: Array.isArray(raw?.schedule?.days) ? raw.schedule.days : [] },
    description: String(raw?.description || ""),
  };
};
const normalizeStandard = (value: any): string => {
  const text = String(value ?? "").trim().toLowerCase();
  const match = text.match(/\b(8|9|10|11|12)\b|^(8|9|10|11|12)|(?<!\d)(8|9|10|11|12)(?!\d)/);
  const grade = match?.[1] || match?.[2] || match?.[3];
  return grade ? `${grade}th` : text.replace(/\s+standard$/, "").trim();
};
const mapSubject = (raw: any): Subject => ({ id: getId(raw), name: String(raw?.name || raw?.subjectName || ""), code: String(raw?.code || raw?.subjectCode || ""), standard: String(raw?.standard || ""), type: String(raw?.type || "Core"), status: String(raw?.status || "active").toLowerCase() });
const mapTeacher = (raw: any): Teacher => {
  const user = raw?.userId && typeof raw.userId === "object" ? raw.userId : null;
  const branchValue = raw?.branchId ?? user?.branchId ?? raw?.branch ?? user?.branch;
  return {
    // Some endpoints return User records; others return Teacher profiles with userId.
    id: getId(user) || getId(raw?.userId) || getId(raw),
    name: String(raw?.fullName || user?.fullName || raw?.name || "Teacher"),
    email: String(raw?.email || user?.email || ""),
    branchId: getId(branchValue) || (typeof branchValue === "string" ? branchValue : ""),
  };
};
const mapAssignment = (raw: any): BatchSubject => {
  const subject = raw?.subjectId && typeof raw.subjectId === "object" ? raw.subjectId : {};
  const teacher = raw?.teacherId && typeof raw.teacherId === "object" ? raw.teacherId : {};
  return { id: getId(raw), batchId: getId(raw?.batchId), subjectId: getId(raw?.subjectId), subject: String(subject?.name || "Subject"), subjectCode: String(subject?.code || ""), teacherId: getId(raw?.teacherId), teacher: String(teacher?.fullName || teacher?.name || "Teacher"), teacherEmail: String(teacher?.email || ""), status: raw?.status === "inactive" ? "inactive" : "active" };
};

export default function BatchesPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectLoadError, setSubjectLoadError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<BatchSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editDays, setEditDays] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [assignmentToChange, setAssignmentToChange] = useState<BatchSubject | null>(null);
  const [changeTeacherVisible, setChangeTeacherVisible] = useState(false);
  const [changeTeacherId, setChangeTeacherId] = useState("");

  const apiRequest = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) throw new Error(payload?.message || `Request failed (${response.status})`);
    return payload;
  }, []);

  const loadAssignments = useCallback(async (batchList: Batch[]) => {
    const result = await Promise.all(batchList.map(async (batch) => {
      try {
        const payload = await apiRequest(`/batch-subjects/batch/${batch.id}`);
        return getArray(payload, ["batchSubjects"]).map(mapAssignment);
      } catch (error) {
        console.warn("Could not load assignments for batch", batch.id, error);
        return [] as BatchSubject[];
      }
    }));
    const all = result.flat();
    setAssignments(all);
    return all;
  }, [apiRequest]);

  const loadPageData = useCallback(async () => {
    setLoading(true);
    try {
      const [batchPayload, subjectResult, teacherResult] = await Promise.all([
        apiRequest("/batches"),
        apiRequest("/subjects").then((payload) => ({ payload, error: "" })).catch((error: any) => ({ payload: null, error: error?.message || "Unable to load subjects" })),
        apiRequest("/teachers").then((payload) => ({ payload, error: "" })).catch((error: any) => ({ payload: null, error: error?.message || "Unable to load teachers" })),
      ]);
      const batchList = getArray(batchPayload, ["batches"]).map(mapBatch).filter((batch) => batch.id);
      setBatches(batchList);
      setSubjectLoadError(subjectResult.error);
      const subjectRows = getSubjectRows(subjectResult.payload);
      const mappedSubjects = subjectRows
        .map(mapSubject)
        .filter((item) => item.id && item.name);
      // Keep all valid subjects in state; active/standard filtering is done in the modal.
      setSubjects(mappedSubjects);
      if (subjectResult.error) console.warn("GET /api/subjects failed:", subjectResult.error);
      const teacherRows = getArray(teacherResult.payload, ["teachers", "users"]);
      setTeachers(teacherRows.map(mapTeacher).filter((item) => item.id && item.name));
      if (teacherResult.error) console.warn("GET /api/teachers failed:", teacherResult.error);
      await loadAssignments(batchList);
    } catch (error: any) {
      Alert.alert("Unable to load batches", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [apiRequest, loadAssignments]);

  useEffect(() => { loadPageData(); }, [loadPageData]);

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return batches.filter((batch) => {
      const related = assignments.filter((a) => a.batchId === batch.id);
      const course = related.map((a) => a.subject).join(" ").toLowerCase();
      const faculty = related.map((a) => a.teacher).join(" ").toLowerCase();
      const matchesSearch = !query || [batch.id, batch.name, batch.code, batch.standard, batch.year, batch.branch, course, faculty].some((v) => v.toLowerCase().includes(query));
      const matchesFilter = filter === "All" || batch.standard === filter || course.includes(filter.toLowerCase()) || (filter === "Foundation" && related.some((a) => subjects.find((s) => s.id === a.subjectId)?.type.toLowerCase() === "foundation"));
      return matchesSearch && matchesFilter;
    });
  }, [batches, assignments, search, filter, subjects]);

  const assignmentsFor = (batchId: string) => assignments.filter((item) => item.batchId === batchId);
  const selectedBranchId = selectedBatch?.branchId || "";
  const availableTeachers = teachers.filter((teacher) =>
    Boolean(selectedBranchId) && Boolean(teacher.branchId) && String(teacher.branchId) === String(selectedBranchId)
  );
  const availableSubjects = subjects.filter((subject) => {
    if (!selectedBatch) return false;
    const isActive = String(subject.status || "active").trim().toLowerCase() === "active";
    const subjectStandard = normalizeStandard(subject.standard);
    const batchStandard = normalizeStandard(selectedBatch.standard);
    const sameStandard = !subjectStandard || !batchStandard || subjectStandard === batchStandard;
    const notAlreadyActive = !assignmentsFor(selectedBatch.id).some((a) => a.subjectId === subject.id && a.status === "active");
    return isActive && sameStandard && notAlreadyActive;
  });
  const openEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setEditName(batch.name);
    setEditStartDate(batch.startDate);
    setEditEndDate(batch.endDate);
    setEditCapacity(String(batch.capacity || ""));
    setEditStartTime(batch.schedule.startTime);
    setEditEndTime(batch.schedule.endTime);
    setEditDays(batch.schedule.days.join(", "));
    setEditVisible(true);
  };
  const saveEdit = async () => {
    if (!selectedBatch) return;
    if (!editName.trim() || !editStartDate.trim() || !editEndDate.trim() || !editStartTime.trim() || !editEndTime.trim() || !editCapacity.trim() || !editDays.trim()) {
      Alert.alert("Required fields", "Please complete all batch fields.");
      return;
    }
    if (!selectedBatch.branchId) {
      Alert.alert("Cannot update batch", "This batch has no branch ID. Refresh and try again.");
      return;
    }
    const capacity = Number(editCapacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      Alert.alert("Invalid capacity", "Capacity must be a positive whole number.");
      return;
    }
    if (new Date(editStartDate) > new Date(editEndDate)) {
      Alert.alert("Invalid dates", "Start date cannot be after end date.");
      return;
    }
    setSaving(true);
    try {
      const payload = await apiRequest(`/batches/${selectedBatch.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName.trim(), code: selectedBatch.code, standard: selectedBatch.standard,
          academicYear: selectedBatch.year, branchId: selectedBatch.branchId,
          startDate: editStartDate, endDate: editEndDate,
          schedule: { startTime: editStartTime.trim(), endTime: editEndTime.trim(), days: editDays.split(",").map((day) => day.trim()).filter(Boolean) },
          capacity, description: selectedBatch.description,
        }),
      });
      const raw = payload?.data?.batch;
      const updated = raw ? mapBatch(raw) : { ...selectedBatch, name: editName.trim(), startDate: editStartDate, endDate: editEndDate, capacity, schedule: { startTime: editStartTime.trim(), endTime: editEndTime.trim(), days: editDays.split(",").map((d) => d.trim()).filter(Boolean) } };
      setBatches((current) => current.map((batch) => batch.id === updated.id ? { ...updated, students: selectedBatch.students, branch: selectedBatch.branch } : batch));
      setSelectedBatch(updated);
      setEditVisible(false);
      Alert.alert("Success", "Batch updated successfully.");
    } catch (error: any) {
      Alert.alert("Unable to update batch", error?.message || "Please try again.");
    } finally { setSaving(false); }
  };

  const openAssign = (batch: Batch) => {
    setSelectedBatch(batch);
    setSelectedSubjectId("");
    setSelectedTeacherId("");
    setAssignVisible(true);
  };
  const assignSubject = async () => {
    if (!selectedBatch || !selectedSubjectId || !selectedTeacherId) {
      Alert.alert("Select required fields", "Choose both a subject and a teacher.");
      return;
    }
    setSaving(true);
    try {
      const payload = await apiRequest("/batch-subjects", { method: "POST", body: JSON.stringify({ batchId: selectedBatch.id, subjectId: selectedSubjectId, teacherId: selectedTeacherId }) });
      const raw = payload?.data?.batchSubject;
      if (raw) {
        const mapped = mapAssignment(raw);
        setAssignments((current) => [...current.filter((a) => a.id !== mapped.id), mapped]);
      }
      setAssignVisible(false);
      await loadAssignments(batches);
      Alert.alert("Success", payload?.message || "Subject and teacher assigned.");
    } catch (error: any) {
      Alert.alert("Unable to assign subject", error?.message || "Please try again.");
    } finally { setSaving(false); }
  };
  const openChangeTeacher = (assignment: BatchSubject) => {
    setAssignmentToChange(assignment);
    setChangeTeacherId(assignment.teacherId);
    setChangeTeacherVisible(true);
  };
  const changeTeacher = async () => {
    if (!assignmentToChange || !changeTeacherId) {
      Alert.alert("Select teacher", "Please choose a teacher.");
      return;
    }
    setSaving(true);
    try {
      await apiRequest(`/batch-subjects/${assignmentToChange.id}`, { method: "PUT", body: JSON.stringify({ teacherId: changeTeacherId }) });
      await loadAssignments(batches);
      setChangeTeacherVisible(false);
      Alert.alert("Success", "Teacher changed successfully.");
    } catch (error: any) {
      Alert.alert("Unable to change teacher", error?.message || "Please try again.");
    } finally { setSaving(false); }
  };
  const toggleAssignment = async (assignment: BatchSubject) => {
    const nextStatus = assignment.status === "active" ? "inactive" : "active";
    try {
      await apiRequest(`/batch-subjects/${assignment.id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setAssignments((current) => current.map((item) => item.id === assignment.id ? { ...item, status: nextStatus } : item));
    } catch (error: any) {
      Alert.alert("Unable to update assignment", error?.message || "Please try again.");
    }
  };

  const renderAssignmentRows = (batch: Batch) => {
    const rows = assignmentsFor(batch.id);
    if (!rows.length) return <Text style={styles.noAssignmentText}>No subjects assigned yet.</Text>;
    return rows.map((item) => (
      <View key={item.id} style={styles.assignmentRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.assignmentName}>{item.subject} {item.subjectCode ? `(${item.subjectCode})` : ""}</Text>
          <Text style={styles.assignmentMeta}>{item.teacher} · {item.status}</Text>
        </View>
        <TouchableOpacity style={styles.smallAction} onPress={() => openChangeTeacher(item)}>
          <MaterialCommunityIcons name="account-switch-outline" size={16} color="#7040D5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallAction} onPress={() => toggleAssignment(item)}>
          <MaterialCommunityIcons name={item.status === "active" ? "pause-circle-outline" : "play-circle-outline"} size={16} color={item.status === "active" ? "#D94376" : "#299B65"} />
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8, minHeight: insets.top + 66 }, isMobile && styles.headerMobile, isTablet && styles.headerTablet]}>
          <TouchableOpacity style={[styles.backButton, isMobile && styles.backButtonMobile]} activeOpacity={0.8} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]} numberOfLines={1}>Batches</Text>
          <TouchableOpacity style={[styles.addButton, isMobile && styles.addButtonMobile]} activeOpacity={0.8} onPress={() => router.push("/(admin)/add-batch" as never)} accessibilityLabel="Add batch">
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
            {!isMobile && <Text style={styles.addButtonLabel}>Add Batch</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} activeOpacity={0.8} onPress={loadPageData} disabled={loading} accessibilityLabel="Refresh batches">
            <MaterialCommunityIcons name="refresh" size={21} color="#7040D5" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.pageHeading}>
            <Text style={styles.pageTitle}>Batch Management</Text>
            <Text style={styles.pageSubtitle}>View and manage batches, subjects and teachers in your branch.</Text>
          </View>
          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={20} color="#8792A4" />
              <TextInput value={search} onChangeText={setSearch} placeholder="Search batches..." placeholderTextColor="#A0AABB" style={styles.searchInput} autoCapitalize="none" autoCorrect={false} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {filters.map((item) => {
                const active = filter === item;
                return <TouchableOpacity key={item} activeOpacity={0.8} onPress={() => setFilter(item)} style={[styles.filterButton, active && styles.filterButtonActive]}>
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
                </TouchableOpacity>;
              })}
            </ScrollView>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Batches</Text>
            <Text style={styles.sectionCount}>{filteredBatches.length} Batches</Text>
          </View>
          {loading ? <View style={styles.loadingCard}><ActivityIndicator size="large" color="#7040D5" /><Text style={styles.emptyText}>Loading batches...</Text></View> : (
            <View style={styles.batchList}>
              {filteredBatches.map((batch) => (
                <View key={batch.id} style={styles.batchCard}>
                  <View style={styles.batchTop}>
                    <View style={styles.batchIdentity}>
                      <View style={styles.batchIcon}><MaterialCommunityIcons name="account-group-outline" size={22} color="#7040D5" /></View>
                      <View style={styles.batchNameBlock}>
                        <Text style={styles.batchName}>{batch.name}</Text>
                        <Text style={styles.batchCode}>{batch.code} • {batch.year}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, batch.status === "Active" ? styles.activeBadge : batch.status === "Completed" ? styles.completedBadge : styles.inactiveBadge]}>
                      <Text style={[styles.statusText, batch.status === "Active" ? styles.activeText : batch.status === "Completed" ? styles.completedText : styles.inactiveText]}>{batch.status}</Text>
                    </View>
                  </View>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>STANDARD</Text><Text style={styles.detailValue}>{batch.standard}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>SUBJECTS</Text><Text style={styles.detailValue}>{assignmentsFor(batch.id).filter((a) => a.status === "active").length}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>CAPACITY</Text><Text style={styles.detailValue}>{batch.students} / {batch.capacity || "—"}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>BRANCH</Text><Text style={styles.detailValue}>{batch.branch}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>START DATE</Text><Text style={styles.detailValue}>{displayDate(batch.startDate)}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>END DATE</Text><Text style={styles.detailValue}>{displayDate(batch.endDate)}</Text></View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => { setSelectedBatch(batch); setViewVisible(true); }}>
                      <MaterialCommunityIcons name="eye-outline" size={15} color="#7040D5" /><Text style={styles.actionText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => openEdit(batch)}>
                      <MaterialCommunityIcons name="pencil-outline" size={15} color="#7040D5" /><Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => openAssign(batch)}>
                      <MaterialCommunityIcons name="link-variant" size={15} color="#7040D5" /><Text style={styles.actionText}>Assign</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {filteredBatches.length === 0 && <View style={styles.emptyCard}><MaterialCommunityIcons name="account-group-outline" size={32} color="#A2ADBF" /><Text style={styles.emptyText}>No batches found</Text></View>}
            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={viewVisible} transparent animationType="fade" onRequestClose={() => setViewVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}>
          <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Batch Details</Text><Text style={styles.modalSubtitle}>Batch, subject and teacher information</Text></View><TouchableOpacity style={styles.modalClose} onPress={() => setViewVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity></View>
          {selectedBatch && <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalProfile}><View style={styles.modalAvatar}><MaterialCommunityIcons name="account-group-outline" size={28} color="#7040D5" /></View><View><Text style={styles.modalBatchName}>{selectedBatch.name}</Text><Text style={styles.modalBatchCode}>{selectedBatch.code} • {selectedBatch.year}</Text></View></View>
            <View style={styles.modalGrid}>
              {[["Standard", selectedBatch.standard], ["Branch", selectedBatch.branch], ["Capacity", `${selectedBatch.students} / ${selectedBatch.capacity || "—"}`], ["Status", selectedBatch.status], ["Start date", displayDate(selectedBatch.startDate)], ["End date", displayDate(selectedBatch.endDate)], ["Schedule", `${selectedBatch.schedule.startTime} - ${selectedBatch.schedule.endTime}`], ["Days", selectedBatch.schedule.days.join(", ") || "—"]].map(([label, value]) => <View key={label} style={styles.modalDetailBox}><Text style={styles.modalLabel}>{label}</Text><Text style={styles.modalValue}>{value}</Text></View>)}
            </View>
            <Text style={styles.detailSectionTitle}>Subjects & Teachers</Text>
            {renderAssignmentRows(selectedBatch)}
            <TouchableOpacity style={[styles.modalSaveButton, { alignSelf: "flex-start", marginTop: 14 }]} onPress={() => { setViewVisible(false); openAssign(selectedBatch); }}><MaterialCommunityIcons name="plus" size={17} color="#FFFFFF" /><Text style={styles.modalSaveText}>Assign Subject</Text></TouchableOpacity>
          </ScrollView>}
        </View></View>
      </Modal>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}>
          <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Edit Batch</Text><Text style={styles.modalSubtitle}>Update details for your branch</Text></View><TouchableOpacity style={styles.modalClose} onPress={() => setEditVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity></View>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.inputLabel}>Batch Name</Text><TextInput value={editName} onChangeText={setEditName} style={styles.modalInput} placeholder="Batch name" placeholderTextColor="#A0AABB" />
            <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text><TextInput value={editStartDate} onChangeText={setEditStartDate} style={styles.modalInput} placeholder="2026-06-01" placeholderTextColor="#A0AABB" autoCapitalize="none" />
            <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text><TextInput value={editEndDate} onChangeText={setEditEndDate} style={styles.modalInput} placeholder="2027-03-31" placeholderTextColor="#A0AABB" autoCapitalize="none" />
            <Text style={styles.inputLabel}>Capacity</Text><TextInput value={editCapacity} onChangeText={setEditCapacity} style={styles.modalInput} keyboardType="number-pad" placeholder="Capacity" placeholderTextColor="#A0AABB" />
            <Text style={styles.inputLabel}>Start Time</Text><TextInput value={editStartTime} onChangeText={setEditStartTime} style={styles.modalInput} placeholder="09:00 AM" placeholderTextColor="#A0AABB" />
            <Text style={styles.inputLabel}>End Time</Text><TextInput value={editEndTime} onChangeText={setEditEndTime} style={styles.modalInput} placeholder="12:00 PM" placeholderTextColor="#A0AABB" />
            <Text style={styles.inputLabel}>Class Days (comma separated)</Text><TextInput value={editDays} onChangeText={setEditDays} style={styles.modalInput} placeholder="Monday, Wednesday, Friday" placeholderTextColor="#A0AABB" />
            <View style={styles.modalActions}><TouchableOpacity style={styles.modalCancelButton} onPress={() => setEditVisible(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.modalSaveButton} onPress={saveEdit} disabled={saving}><MaterialCommunityIcons name="check" size={17} color="#FFFFFF" /><Text style={styles.modalSaveText}>{saving ? "Saving..." : "Save Changes"}</Text></TouchableOpacity></View>
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={assignVisible} transparent animationType="fade" onRequestClose={() => setAssignVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}>
          <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Assign Subject & Teacher</Text><Text style={styles.modalSubtitle}>{selectedBatch?.name || "Selected batch"}</Text></View><TouchableOpacity style={styles.modalClose} onPress={() => setAssignVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity></View>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.inputLabel}>Select Subject</Text>
            {subjectLoadError ? <Text style={styles.noAssignmentText}>Could not load subjects: {subjectLoadError}. Check that API_BASE_URL points to the backend /api base and that the token is valid.</Text> : availableSubjects.length ? availableSubjects.map((subject) => <TouchableOpacity key={subject.id} style={[styles.optionRow, selectedSubjectId === subject.id && styles.optionRowSelected]} onPress={() => setSelectedSubjectId(subject.id)}><View style={{ flex: 1 }}><Text style={styles.optionTitle}>{subject.name}</Text><Text style={styles.optionMeta}>{subject.code} · {subject.standard} · {subject.type}</Text></View>{selectedSubjectId === subject.id && <MaterialCommunityIcons name="check-circle" size={19} color="#7040D5" />}</TouchableOpacity>) : <Text style={styles.noAssignmentText}>{subjects.length === 0 ? "No subjects were received from GET /api/subjects. Check the Metro logs for the raw response and confirm API_BASE_URL and your Admin token." : `Loaded ${subjects.length} subjects, but none are active and match standard ${selectedBatch?.standard || "—"}, or all matching subjects are already assigned.`}</Text>}
            <Text style={styles.inputLabel}>Select Teacher</Text>
            {availableTeachers.length ? availableTeachers.map((teacher) => <TouchableOpacity key={teacher.id} style={[styles.optionRow, selectedTeacherId === teacher.id && styles.optionRowSelected]} onPress={() => setSelectedTeacherId(teacher.id)}><View style={{ flex: 1 }}><Text style={styles.optionTitle}>{teacher.name}</Text><Text style={styles.optionMeta}>{teacher.email || "Teacher"}</Text></View>{selectedTeacherId === teacher.id && <MaterialCommunityIcons name="check-circle" size={19} color="#7040D5" />}</TouchableOpacity>) : <Text style={styles.noAssignmentText}>{selectedBranchId ? "No teachers found for this branch. Check that /api/teachers returns each teacher's user ID and branchId." : "The selected batch has no branch ID, so teachers cannot be filtered safely."}</Text>}
            <View style={styles.modalActions}><TouchableOpacity style={styles.modalCancelButton} onPress={() => setAssignVisible(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.modalSaveButton} onPress={assignSubject} disabled={saving}><MaterialCommunityIcons name="link-variant" size={17} color="#FFFFFF" /><Text style={styles.modalSaveText}>{saving ? "Saving..." : "Assign"}</Text></TouchableOpacity></View>
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={changeTeacherVisible} transparent animationType="fade" onRequestClose={() => setChangeTeacherVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}>
          <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Change Teacher</Text><Text style={styles.modalSubtitle}>{assignmentToChange?.subject || "Subject"}</Text></View><TouchableOpacity style={styles.modalClose} onPress={() => setChangeTeacherVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity></View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            {availableTeachers.map((teacher) => <TouchableOpacity key={teacher.id} style={[styles.optionRow, changeTeacherId === teacher.id && styles.optionRowSelected]} onPress={() => setChangeTeacherId(teacher.id)}><View style={{ flex: 1 }}><Text style={styles.optionTitle}>{teacher.name}</Text><Text style={styles.optionMeta}>{teacher.email}</Text></View>{changeTeacherId === teacher.id && <MaterialCommunityIcons name="check-circle" size={19} color="#7040D5" />}</TouchableOpacity>)}
            <View style={styles.modalActions}><TouchableOpacity style={styles.modalCancelButton} onPress={() => setChangeTeacherVisible(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.modalSaveButton} onPress={changeTeacher} disabled={saving}><MaterialCommunityIcons name="check" size={17} color="#FFFFFF" /><Text style={styles.modalSaveText}>{saving ? "Saving..." : "Save Teacher"}</Text></TouchableOpacity></View>
          </ScrollView>
        </View></View>
      </Modal>
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
  headerMobile: {
    height: 80,
    paddingHorizontal: 14,
  },
  headerTablet: {
    height: 64,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backButtonMobile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    lineHeight: 26,
    color: "#FFFFFF",
    textAlign: "left",
  },
  headerTitleMobile: {
    fontSize: 20,
  },
  addButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 5,
  },
  addButtonLabel: {
    color: "#7040D5",
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
  },
  addButtonMobile: {
    width: 40,
    minWidth: 40,
    height: 40,
    borderRadius: 11,
    paddingHorizontal: 0,
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },
  pageHeading: {
    marginBottom: 14,
  },
  pageTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 19,
    color: "#172033",
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8A93A5",
    marginTop: 2,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9EBF1",
    padding: 12,
    marginBottom: 16,
  },
  searchBox: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#202B3E",
    marginLeft: 8,
  },
  filterRow: {
    gap: 7,
    paddingTop: 9,
  },
  filterButton: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: "#F4F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8EAF0",
  },
  filterButtonActive: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },
  filterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#7B8498",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 17,
    color: "#172033",
  },
  sectionCount: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8792A4",
  },
  batchList: {
    gap: 9,
  },
  batchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9EBF1",
    padding: 13,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  batchTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F5",
  },
  batchIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  batchIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  batchNameBlock: {
    flex: 1,
  },
  batchName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202B3E",
  },
  batchCode: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#7B8498",
    marginTop: 2,
  },
  statusBadge: {
    minWidth: 68,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  activeBadge: {
    backgroundColor: "#E7F8EF",
  },
  inactiveBadge: {
    backgroundColor: "#FFE9F0",
  },
  statusText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
  },
  activeText: {
    color: "#299B65",
  },
  inactiveText: {
    color: "#D94376",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 18,
    rowGap: 10,
    paddingTop: 11,
    paddingBottom: 11,
  },
  detailItem: {
    flexBasis: "45%",
    flexGrow: 1,
    minWidth: 120,
  },
  detailLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 8,
    color: "#8792A4",
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#202B3E",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    gap: 7,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F5",
  },
  actionButton: {
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#DCCCF8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9,
    color: "#7040D5",
    marginLeft: 5,
  },
  emptyCard: {
    minHeight: 140,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EBF1",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#7B8498",
    marginTop: 7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20,24,38,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F5",
  },
  modalTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#172033",
  },
  modalSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7B8498",
    marginTop: 2,
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#F3F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    padding: 16,
    paddingBottom: 20,
  },
  modalProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  modalBatchName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202B3E",
  },
  modalBatchCode: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#7B8498",
    marginTop: 2,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 20,
    rowGap: 12,
  },
  modalDetailBox: {
    flexBasis: "45%",
    flexGrow: 1,
  },
  modalLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#66768A",
    marginBottom: 3,
  },
  modalValue: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#202B3E",
  },
  inputLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#66768A",
    marginTop: 10,
    marginBottom: 5,
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E4E7EE",
    borderRadius: 10,
    paddingHorizontal: 11,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#202B3E",
    backgroundColor: "#FCFDFE",
  },
  statusPickerRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  statusPicker: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E4E7EE",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  statusPickerActive: {
    backgroundColor: "#F1EAFF",
    borderColor: "#7040D5",
  },
  statusPickerText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#66768A",
  },
  statusPickerTextActive: {
    color: "#7040D5",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 20,
  },
  modalCancelButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#D9DDE6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#66768A",
  },
  modalSaveButton: {
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 9,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 5,
  },

  refreshButton: { width: 40, height: 40, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  completedBadge: { backgroundColor: "#EAF2FF" },
  completedText: { color: "#2675E8" },
  loadingCard: { minHeight: 160, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", gap: 10 },
  assignmentRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEF0F5" },
  assignmentName: { fontFamily: "PoppinsSemiBold", fontSize: 11, color: "#202B3E" },
  assignmentMeta: { fontFamily: "PoppinsRegular", fontSize: 9, color: "#7B8498", marginTop: 2, textTransform: "capitalize" },
  smallAction: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: "#DCCCF8", alignItems: "center", justifyContent: "center" },
  noAssignmentText: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#8792A4", marginTop: 8, marginBottom: 8 },
  detailSectionTitle: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: "#172033", marginTop: 18, marginBottom: 4 },
  optionRow: { flexDirection: "row", alignItems: "center", padding: 11, borderWidth: 1, borderColor: "#E4E7EE", borderRadius: 10, marginTop: 7, backgroundColor: "#FFFFFF" },
  optionRowSelected: { borderColor: "#7040D5", backgroundColor: "#F5F0FF" },
  optionTitle: { fontFamily: "PoppinsMedium", fontSize: 11, color: "#202B3E" },
  optionMeta: { fontFamily: "PoppinsRegular", fontSize: 9, color: "#8792A4", marginTop: 2 },
});
