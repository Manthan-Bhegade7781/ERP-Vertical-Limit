import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

// Change this import to the API helper path used in your project.
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type PTGStatus = "Scheduled" | "Completed" | "Pending";

type PTGRecord = {
  id: string;
  parent: string;
  student: string;
  teacher: string;
  meetingDate: string;
  meetingDateISO: string;
  time: string;
  purpose: string;
  remarks: string;
  status: PTGStatus;
};

const statusStyle: Record<PTGStatus, { bg: string; text: string }> = {
  Scheduled: { bg: "#E7F8F0", text: "#13A968" },
  Completed: { bg: "#EAF2FF", text: "#2675E8" },
  Pending: { bg: "#FFF3DB", text: "#B7791F" },
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getName = (value: any) => {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return (
    value?.userId?.fullName ||
    value?.fullName ||
    value?.name ||
    value?.guardianName ||
    "—"
  );
};

const mapMeeting = (item: any): PTGRecord => {
  const dateValue = item?.meetingDate || "";
  return {
    id: item?._id || item?.id || "",
    parent: item?.studentId?.guardianName || "—",
    student: getName(item?.studentId?.userId) !== "—"
      ? getName(item?.studentId?.userId)
      : getName(item?.studentId),
    teacher: getName(item?.teacherId),
    meetingDate: formatDate(dateValue),
    meetingDateISO: dateValue,
    time: formatTime(dateValue),
    purpose: item?.purpose || "—",
    remarks: item?.notes || "—",
    status: item?.status || "Scheduled",
  };
};

export default function PTGPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [data, setData] = useState<PTGRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | PTGStatus>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selected, setSelected] = useState<PTGRecord | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [meetingDate, setMeetingDate] = useState("");
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState<PTGStatus>("Scheduled");

  const apiRequest = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result?.message || "Request failed. Please try again.");
    }
    return result;
  }, []);

  const loadPage = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      // Fetch all pages so the list isn't limited to the first 100 meetings.
      const first = await apiRequest("/ptg?page=1&limit=100");
      const firstData = first?.data || {};
      const allMeetings = [...(firstData.meetings || [])];
      const totalPages = Number(firstData.pagination?.totalPages || 1);

      for (let page = 2; page <= totalPages; page += 1) {
        const next = await apiRequest(`/ptg?page=${page}&limit=100`);
        allMeetings.push(...(next?.data?.meetings || []));
      }

      setData(allMeetings.map(mapMeeting));
    } catch (error: any) {
      Alert.alert("Unable to load PTG", error?.message || "Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiRequest]);

  // Reload when this screen is opened or returned to.
  useFocusEffect(
    useCallback(() => {
      loadPage(true);
    }, [loadPage]),
  );

  const openAdd = () => router.push("/(admin)/add-ptg" as never);

  const openEdit = (item: PTGRecord) => {
    setSelected(item);
    setMeetingDate(toDateInput(item.meetingDateISO));
    setTime(toTimeInput(item.meetingDateISO));
    setPurpose(item.purpose === "—" ? "" : item.purpose);
    setRemarks(item.remarks === "—" ? "" : item.remarks);
    setStatus(item.status);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    if (!meetingDate.trim() || !time.trim() || !purpose.trim()) {
      Alert.alert("Required Fields", "Please enter the meeting date, time, and purpose.");
      return;
    }

    // API expects meetingDate as one ISO date-time value.
    const parsed = new Date(`${meetingDate}T${time}:00`);

    if (Number.isNaN(parsed.getTime())) {
      Alert.alert("Invalid Date or Time", "Please enter a valid date and time.");
      return;
    }

    try {
      setSaving(true);
      await apiRequest(`/ptg/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify({
          meetingDate: parsed.toISOString(),
          purpose: purpose.trim(),
          notes: remarks.trim(),
          status,
        }),
      });

      setEditVisible(false);
      await loadPage(false);
      Alert.alert("Updated", "PTG meeting updated successfully.");
    } catch (error: any) {
      Alert.alert("Update Failed", error?.message || "Unable to update PTG.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMeeting = (item: PTGRecord) => {
    Alert.alert("Delete PTG", "Are you sure you want to delete this meeting?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiRequest(`/ptg/${item.id}`, { method: "DELETE" });
            await loadPage(false);
            Alert.alert("Deleted", "PTG meeting deleted successfully.");
          } catch (error: any) {
            Alert.alert("Delete Failed", error?.message || "Unable to delete PTG.");
          }
        },
      },
    ]);
  };

  const filtered = data.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.id.toLowerCase().includes(q) ||
      item.parent.toLowerCase().includes(q) ||
      item.student.toLowerCase().includes(q) ||
      item.teacher.toLowerCase().includes(q) ||
      item.purpose.toLowerCase().includes(q);
    return matchesSearch && (filter === "All" || item.status === filter);
  });

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />

        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, minHeight: insets.top + 66 },
            isMobile && styles.headerMobile,
            isTablet && styles.headerTablet,
          ]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>PTG</Text>
          </View>
          <TouchableOpacity style={styles.plus} onPress={openAdd}>
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.pageTitle}>PTG</Text>
              <Text style={styles.subtitle}>
                Manage parent teacher group meetings for your assigned branch
              </Text>
            </View>
            <TouchableOpacity onPress={() => loadPage(false)} style={styles.refreshButton}>
              <MaterialCommunityIcons name="refresh" size={19} color="#7040D5" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={21} color="#8491A6" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search PTG meetings..."
                placeholderTextColor="#A0A9B8"
                style={styles.searchInput}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {(["All", "Scheduled", "Completed", "Pending"] as const).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.filterButton, filter === item && styles.filterActive]}
                onPress={() => setFilter(item)}
              >
                <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#7040D5" />
              <Text style={styles.loadingText}>Loading PTG meetings...</Text>
            </View>
          ) : (
            <>
              {refreshing && <Text style={styles.refreshingText}>Refreshing...</Text>}
              {filtered.map((item) => {
                const c = statusStyle[item.status] || statusStyle.Scheduled;
                return (
                  <View style={styles.card} key={item.id}>
                    <View style={styles.cardTop}>
                      <View style={styles.identity}>
                        <View style={styles.iconBox}>
                          <MaterialCommunityIcons
                            name="account-group-outline"
                            size={25}
                            color="#7040D5"
                          />
                        </View>
                        <View style={styles.titleBox}>
                          <Text style={styles.student}>{item.student}</Text>
                          <Text style={styles.id}>
                            {item.id.slice(-8)} • {item.meetingDate}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.badge, { backgroundColor: c.bg }]}>
                        <Text style={[styles.badgeText, { color: c.text }]}>{item.status}</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.grid}>
                      {[
                        ["Parent", item.parent],
                        ["Teacher", item.teacher],
                        ["Meeting Date", item.meetingDate],
                        ["Time", item.time],
                        ["Purpose", item.purpose],
                        ["Notes", item.remarks],
                      ].map(([label, value]) => (
                        <View style={styles.detail} key={label}>
                          <Text style={styles.label}>{label}</Text>
                          <Text style={styles.value}>{value}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
                        <MaterialCommunityIcons name="pencil-outline" size={17} color="#FFF" />
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => {
                          setSelected(item);
                          setViewVisible(true);
                        }}
                      >
                        <MaterialCommunityIcons name="eye-outline" size={18} color="#7040D5" />
                        <Text style={styles.viewText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMeeting(item)}>
                        <MaterialCommunityIcons name="delete-outline" size={18} color="#E84D61" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {filtered.length === 0 && (
                <View style={styles.empty}>
                  <MaterialCommunityIcons name="account-group-outline" size={38} color="#A1A9B7" />
                  <Text style={styles.emptyTitle}>No PTG meetings found</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <Modal visible={viewVisible} transparent animationType="fade" onRequestClose={() => setViewVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>PTG Meeting Details</Text>
                  <Text style={styles.modalSub}>{selected?.id}</Text>
                </View>
                <TouchableOpacity style={styles.close} onPress={() => setViewVisible(false)}>
                  <MaterialCommunityIcons name="close" size={20} color="#66768A" />
                </TouchableOpacity>
              </View>
              {selected && (
                <>
                  <Text style={styles.modalName}>{selected.student}</Text>
                  <Text style={styles.modalSub}>{selected.parent} • {selected.teacher}</Text>
                  <View style={styles.modalGrid}>
                    {[
                      ["Meeting Date", selected.meetingDate],
                      ["Time", selected.time],
                      ["Purpose", selected.purpose],
                      ["Notes", selected.remarks],
                      ["Status", selected.status],
                    ].map(([label, value]) => (
                      <View style={styles.modalDetail} key={label}>
                        <Text style={styles.label}>{label}</Text>
                        <Text style={styles.value}>{value}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.modalEdit}
                    onPress={() => {
                      setViewVisible(false);
                      openEdit(selected);
                    }}
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={18} color="#FFF" />
                    <Text style={styles.modalEditText}>Edit PTG</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.editModal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Edit PTG Meeting</Text>
                  <Text style={styles.modalSub}>Update meeting information</Text>
                </View>
                <TouchableOpacity style={styles.close} onPress={() => setEditVisible(false)}>
                  <MaterialCommunityIcons name="close" size={20} color="#66768A" />
                </TouchableOpacity>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled">
                {[
                  ["Meeting Date", meetingDate, setMeetingDate],
                  ["Time", time, setTime],
                  ["Purpose", purpose, setPurpose],
                  ["Notes", remarks, setRemarks],
                ].map(([label, value, setter]) => (
                  <View key={label as string}>
                    <Text style={styles.inputLabel}>{label as string}</Text>
                    <TextInput
                      value={value as string}
                      onChangeText={setter as (v: string) => void}
                      style={styles.input}
                      placeholder={`Enter ${(label as string).toLowerCase()}`}
                      placeholderTextColor="#A0A9B8"
                    />
                  </View>
                ))}

                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.options}>
                  {(["Scheduled", "Completed", "Pending"] as PTGStatus[]).map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.option, status === item && styles.optionActive]}
                      onPress={() => setStatus(item)}
                    >
                      <Text style={[styles.optionText, status === item && styles.optionTextActive]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancel} onPress={() => setEditVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.save} onPress={saveEdit} disabled={saving}>
                    {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save Changes</Text>}
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
  safe: { flex: 1, backgroundColor: "#F7F8FC" },
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  header: { width: "100%", backgroundColor: "#6D35D8", paddingHorizontal: 18, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  headerMobile: { paddingHorizontal: 14 },
  headerTablet: { paddingHorizontal: 20 },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  back: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitle: { flex: 1, fontFamily: "PoppinsSemiBold", fontSize: 20, color: "#FFF" },
  plus: { width: 40, height: 40, borderRadius: 11, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#172033" },
  subtitle: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#7C879A", marginTop: 2, marginBottom: 14 },
  refreshButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F0E8FF", alignItems: "center", justifyContent: "center" },
  searchCard: { backgroundColor: "#FFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E8EAF0", marginBottom: 16 },
  searchBox: { height: 46, borderWidth: 1, borderColor: "#E3E6ED", borderRadius: 11, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  searchInput: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#263047", marginLeft: 8 },
  filters: { paddingBottom: 10 },
  filterButton: { height: 38, paddingHorizontal: 13, borderRadius: 9, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E3E6ED", alignItems: "center", justifyContent: "center", marginRight: 7 },
  filterActive: { backgroundColor: "#7040D5", borderColor: "#7040D5" },
  filterText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#788397" },
  filterTextActive: { color: "#FFF" },
  card: { backgroundColor: "#FFF", borderRadius: 14, padding: 13, borderWidth: 1, borderColor: "#ECEEF4", marginBottom: 9, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  identity: { flex: 1, flexDirection: "row", alignItems: "center" },
  iconBox: { width: 44, height: 44, borderRadius: 11, backgroundColor: "#F0E8FF", alignItems: "center", justifyContent: "center", marginRight: 9 },
  titleBox: { flex: 1 },
  student: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: "#202A3D" },
  id: { fontFamily: "PoppinsRegular", fontSize: 9.5, color: "#8D98AA", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, marginLeft: 8 },
  badgeText: { fontFamily: "PoppinsSemiBold", fontSize: 9.5 },
  divider: { height: 1, backgroundColor: "#EEF0F4", marginTop: 11, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  detail: { width: "50%", marginBottom: 13 },
  label: { fontFamily: "PoppinsRegular", fontSize: 9, color: "#8290A5", marginBottom: 2 },
  value: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#263047" },
  actions: { flexDirection: "row", marginTop: 1, alignItems: "center" },
  editButton: { flex: 1, height: 36, borderRadius: 8, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center", marginRight: 5 },
  editText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#FFF", marginLeft: 6 },
  viewButton: { flex: 1, height: 36, borderRadius: 9, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 5 },
  viewText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#7040D5", marginLeft: 6 },
  deleteButton: { width: 38, height: 36, borderRadius: 9, borderWidth: 1, borderColor: "#FFE0E4", alignItems: "center", justifyContent: "center", marginLeft: 5 },
  empty: { backgroundColor: "#FFF", borderRadius: 17, paddingVertical: 32, paddingHorizontal: 20, alignItems: "center" },
  emptyTitle: { fontFamily: "PoppinsSemiBold", fontSize: 14, color: "#202A3D", marginTop: 10 },
  loading: { paddingVertical: 35, alignItems: "center" },
  loadingText: { marginTop: 10, fontFamily: "PoppinsRegular", color: "#7C879A", fontSize: 12 },
  refreshingText: { textAlign: "center", color: "#7040D5", marginBottom: 8, fontSize: 11 },
  overlay: { flex: 1, backgroundColor: "rgba(15,20,32,.48)", justifyContent: "center", padding: 20 },
  modal: { maxHeight: "80%", backgroundColor: "#FFF", borderRadius: 19, padding: 20 },
  editModal: { maxHeight: "90%", backgroundColor: "#FFF", borderRadius: 19, padding: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { fontFamily: "PoppinsSemiBold", fontSize: 16, color: "#202A3D" },
  modalSub: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#8B96A8", marginTop: 2 },
  close: { width: 34, height: 34, borderRadius: 9, backgroundColor: "#F5F6FA", alignItems: "center", justifyContent: "center" },
  modalName: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D" },
  modalGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  modalDetail: { width: "50%", paddingVertical: 7 },
  modalEdit: { height: 36, borderRadius: 9, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 11 },
  modalEditText: { fontFamily: "PoppinsSemiBold", fontSize: 11, color: "#FFF", marginLeft: 7 },
  inputLabel: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#58657A", marginBottom: 6, marginTop: 5 },
  input: { minHeight: 42, borderWidth: 1, borderColor: "#E1E4EB", borderRadius: 10, paddingHorizontal: 11, fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#263047", marginBottom: 8 },
  options: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  option: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 9, backgroundColor: "#F7F8FC", borderWidth: 1, borderColor: "#E5E7EE", marginRight: 7, marginBottom: 7 },
  optionActive: { backgroundColor: "#F0E8FF", borderColor: "#7040D5" },
  optionText: { fontFamily: "PoppinsSemiBold", fontSize: 9.5, color: "#788397" },
  optionTextActive: { color: "#7040D5" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 6 },
  cancel: { minHeight: 38, paddingHorizontal: 17, borderRadius: 9, borderWidth: 1, borderColor: "#DDDDE5", alignItems: "center", justifyContent: "center", marginRight: 9 },
  cancelText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#687388" },
  save: { minHeight: 38, paddingHorizontal: 17, borderRadius: 9, backgroundColor: "#7040D5", alignItems: "center", justifyContent: "center" },
  saveText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#FFF" },
});