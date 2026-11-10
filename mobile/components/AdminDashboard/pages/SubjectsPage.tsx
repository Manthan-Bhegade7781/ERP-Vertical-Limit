import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type SubjectStatus = "Active" | "Inactive";
type Subject = {
  id: string;
  name: string;
  code: string;
  standard: string;
  type: "Core" | "Foundation" | "Entrance" | string;
  description: string;
  duration: string;
  status: SubjectStatus;
};
type SubjectApi = {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  standard: string;
  type: string;
  description?: string;
  duration?: string;
  status?: string;
};
const standards = ["8th", "9th", "10th", "11th", "12th"];
const types = ["Core", "Foundation", "Entrance"];
const filters = ["All", ...standards];

function normalizeSubject(item: SubjectApi): Subject {
  return {
    id: String(item._id ?? item.id ?? ""),
    name: item.name ?? "",
    code: item.code ?? "",
    standard: item.standard ?? "",
    type: item.type ?? "",
    description: item.description ?? "",
    duration: item.duration ?? "",
    status: String(item.status ?? "active").toLowerCase() === "inactive" ? "Inactive" : "Active",
  };
}
function getMessage(payload: any, fallback: string) {
  return payload?.message || payload?.error || fallback;
}

export default function SubjectsPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editStandard, setEditStandard] = useState("8th");
  const [editType, setEditType] = useState("Core");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editStatus, setEditStatus] = useState<SubjectStatus>("Active");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const token = await getToken();
    if (!token) throw new Error("Your session has expired. Please log in again.");
    const response = await fetch(`${API_BASE_URL}/subjects${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(getMessage(payload, "Request failed. Please try again."));
    }
    return payload;
  }, []);

  const loadSubjects = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setLoadError("");
    try {
      const payload = await request("");
      const items = payload?.data?.subjects ?? payload?.subjects ?? payload?.data ?? [];
      if (!Array.isArray(items)) throw new Error("Unexpected subjects response from server.");
      setSubjects(items.map(normalizeSubject));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load subjects.";
      setLoadError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [request]);

  useEffect(() => { void loadSubjects(true); }, [loadSubjects]);

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subjects.filter((subject) => {
      const matchesSearch = !query ||
        subject.id.toLowerCase().includes(query) ||
        subject.name.toLowerCase().includes(query) ||
        subject.code.toLowerCase().includes(query) ||
        subject.standard.toLowerCase().includes(query) ||
        subject.type.toLowerCase().includes(query) ||
        subject.description.toLowerCase().includes(query) ||
        subject.duration.toLowerCase().includes(query);
      return matchesSearch && (filter === "All" || subject.standard === filter);
    });
  }, [subjects, search, filter]);

  const handleAddSubject = () => router.push("/(admin)/add-subject" as never);

  const handleView = (subject: Subject) => {
    setSelectedSubject(subject);
    setViewVisible(true);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setEditName(subject.name);
    setEditCode(subject.code);
    setEditStandard(subject.standard);
    setEditType(subject.type);
    setEditDescription(subject.description);
    setEditDuration(subject.duration);
    setEditStatus(subject.status);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!selectedSubject) return;
    if (!editName.trim() || !editCode.trim() || !editStandard || !editType) {
      Alert.alert("Missing Information", "Please fill in subject name, code, standard and type.");
      return;
    }
    setSaving(true);
    try {
      const payload = await request(`/${selectedSubject.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName.trim(),
          code: editCode.trim().toUpperCase(),
          standard: editStandard,
          type: editType,
          description: editDescription.trim(),
          duration: editDuration.trim(),
          status: editStatus.toLowerCase(),
        }),
      });
      const returned = payload?.data?.subject ?? payload?.subject;
      const updated = returned ? normalizeSubject(returned) : {
        ...selectedSubject,
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        standard: editStandard,
        type: editType,
        description: editDescription.trim(),
        duration: editDuration.trim(),
        status: editStatus,
      };
      setSubjects(current => current.map(item => item.id === selectedSubject.id ? updated : item));
      setSelectedSubject(updated);
      setEditVisible(false);
      Alert.alert("Success", "Subject updated successfully.");
    } catch (error) {
      Alert.alert("Update Failed", error instanceof Error ? error.message : "Unable to update subject.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = (subject: Subject) => {
    const nextStatus: SubjectStatus = subject.status === "Active" ? "Inactive" : "Active";
    Alert.alert(
      `${nextStatus === "Active" ? "Activate" : "Deactivate"} Subject`,
      `Are you sure you want to ${nextStatus === "Active" ? "activate" : "deactivate"} ${subject.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: nextStatus === "Active" ? "Activate" : "Deactivate",
          onPress: async () => {
            setChangingStatusId(subject.id);
            try {
              await request(`/${subject.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: nextStatus.toLowerCase() }),
              });
              setSubjects(current => current.map(item => item.id === subject.id ? { ...item, status: nextStatus } : item));
              if (selectedSubject?.id === subject.id) setSelectedSubject({ ...subject, status: nextStatus });
              Alert.alert("Success", `${subject.name} is now ${nextStatus.toLowerCase()}.`);
            } catch (error) {
              Alert.alert("Status Update Failed", error instanceof Error ? error.message : "Unable to change subject status.");
            } finally {
              setChangingStatusId(null);
            }
          },
        },
      ],
    );
  };

  const renderDetail = (label: string, value: string) => (
    <View style={styles.modalDetailBox} key={label}>
      <Text style={styles.modalLabel}>{label}</Text>
      <Text style={styles.modalValue}>{value || "—"}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />
      <View style={styles.container}>
        <View style={[
          styles.header,
          { paddingTop: insets.top + 8, minHeight: insets.top + 66 },
          isMobile && styles.headerMobile,
          isTablet && styles.headerTablet,
        ]}>
          <TouchableOpacity style={[styles.backButton, isMobile && styles.backButtonMobile]} activeOpacity={0.8} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]} numberOfLines={1}>Subjects</Text>
          <TouchableOpacity style={[styles.addButton, isMobile && styles.addButtonMobile]} activeOpacity={0.85} onPress={handleAddSubject}>
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.pageHeading}>
            <Text style={styles.pageTitle}>Subject Management</Text>
            <Text style={styles.pageSubtitle}>Manage subjects and their class details.</Text>
          </View>
          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={20} color="#8792A4" />
              <TextInput value={search} onChangeText={setSearch} placeholder="Search subjects..." placeholderTextColor="#A0AABB" style={styles.searchInput} autoCapitalize="none" autoCorrect={false} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {filters.map(item => {
                const active = filter === item;
                return <TouchableOpacity key={item} activeOpacity={0.8} onPress={() => setFilter(item)} style={[styles.filterButton, active && styles.filterButtonActive]}>
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
                </TouchableOpacity>;
              })}
            </ScrollView>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <Text style={styles.sectionCount}>{filteredSubjects.length} Subjects</Text>
          </View>

          {loading ? <View style={styles.emptyCard}><ActivityIndicator size="large" color="#7040D5" /><Text style={styles.emptyText}>Loading subjects...</Text></View> :
            loadError ? <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#D94376" />
              <Text style={styles.emptyText}>{loadError}</Text>
              <TouchableOpacity style={styles.actionButton} onPress={() => void loadSubjects(false)}><Text style={styles.actionText}>Try Again</Text></TouchableOpacity>
            </View> :
            <View style={styles.subjectList}>
              {filteredSubjects.map(subject => <View key={subject.id} style={styles.subjectCard}>
                <View style={styles.subjectTop}>
                  <View style={styles.subjectIdentity}>
                    <View style={styles.subjectIcon}><MaterialCommunityIcons name="book-open-variant" size={22} color="#7040D5" /></View>
                    <View style={styles.subjectNameBlock}>
                      <Text style={styles.subjectName}>{subject.name}</Text>
                      <Text style={styles.subjectCode}>{subject.code} • {subject.type}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, subject.status === "Active" ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={[styles.statusText, subject.status === "Active" ? styles.activeText : styles.inactiveText]}>{subject.status}</Text>
                  </View>
                </View>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}><Text style={styles.detailLabel}>STANDARD</Text><Text style={styles.detailValue}>{subject.standard}</Text></View>
                  <View style={styles.detailItem}><Text style={styles.detailLabel}>DURATION</Text><Text style={styles.detailValue}>{subject.duration || "—"}</Text></View>
                  <View style={styles.detailItem}><Text style={styles.detailLabel}>TYPE</Text><Text style={styles.detailValue}>{subject.type}</Text></View>
                  <View style={styles.detailItem}><Text style={styles.detailLabel}>DESCRIPTION</Text><Text style={styles.detailValue} numberOfLines={2}>{subject.description || "—"}</Text></View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => handleView(subject)}>
                    <MaterialCommunityIcons name="eye-outline" size={15} color="#7040D5" /><Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => handleEdit(subject)}>
                    <MaterialCommunityIcons name="pencil-outline" size={15} color="#7040D5" /><Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} disabled={changingStatusId === subject.id} onPress={() => toggleStatus(subject)}>
                    {changingStatusId === subject.id ? <ActivityIndicator size="small" color="#7040D5" /> : <MaterialCommunityIcons name={subject.status === "Active" ? "pause-circle-outline" : "check-circle-outline"} size={15} color="#7040D5" />}
                    <Text style={styles.actionText}>{subject.status === "Active" ? "Deactivate" : "Activate"}</Text>
                  </TouchableOpacity>
                </View>
              </View>)}
              {filteredSubjects.length === 0 && <View style={styles.emptyCard}><MaterialCommunityIcons name="book-search-outline" size={32} color="#A2ADBF" /><Text style={styles.emptyText}>No subjects found</Text></View>}
            </View>
          }
          {!loading && !loadError && <TouchableOpacity style={[styles.actionButton, { alignSelf: "center", marginTop: 14 }]} onPress={() => void loadSubjects(false)} disabled={refreshing}>
            {refreshing ? <ActivityIndicator size="small" color="#7040D5" /> : <MaterialCommunityIcons name="refresh" size={15} color="#7040D5" />}
            <Text style={styles.actionText}>Refresh</Text>
          </TouchableOpacity>}
        </ScrollView>
      </View>

      <Modal visible={viewVisible} transparent animationType="fade" onRequestClose={() => setViewVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View><Text style={styles.modalTitle}>Subject Details</Text><Text style={styles.modalSubtitle}>Complete subject information</Text></View>
            <TouchableOpacity style={styles.modalClose} activeOpacity={0.8} onPress={() => setViewVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity>
          </View>
          {selectedSubject && <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalProfile}>
              <View style={styles.modalAvatar}><MaterialCommunityIcons name="book-open-variant" size={28} color="#7040D5" /></View>
              <View><Text style={styles.modalSubjectName}>{selectedSubject.name}</Text><Text style={styles.modalSubjectCode}>{selectedSubject.code}</Text></View>
            </View>
            <View style={styles.modalGrid}>
              {renderDetail("Standard", selectedSubject.standard)}
              {renderDetail("Type", selectedSubject.type)}
              {renderDetail("Duration", selectedSubject.duration)}
              {renderDetail("Status", selectedSubject.status)}
              {renderDetail("Description", selectedSubject.description)}
            </View>
          </ScrollView>}
        </View></View>
      </Modal>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View><Text style={styles.modalTitle}>Edit Subject</Text><Text style={styles.modalSubtitle}>Update subject information</Text></View>
            <TouchableOpacity style={styles.modalClose} activeOpacity={0.8} onPress={() => setEditVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
            <Text style={styles.inputLabel}>Subject Name *</Text>
            <TextInput value={editName} onChangeText={setEditName} style={styles.modalInput} placeholder="Subject name" placeholderTextColor="#A0AABB" />
            <Text style={styles.inputLabel}>Subject Code *</Text>
            <TextInput value={editCode} onChangeText={setEditCode} style={styles.modalInput} placeholder="Subject code" placeholderTextColor="#A0AABB" autoCapitalize="characters" />
            <Text style={styles.inputLabel}>Standard *</Text>
            <View style={styles.statusPickerRow}>{standards.map(value => <TouchableOpacity key={value} style={[styles.statusPicker, editStandard === value && styles.statusPickerActive]} onPress={() => setEditStandard(value)}><Text style={[styles.statusPickerText, editStandard === value && styles.statusPickerTextActive]}>{value}</Text></TouchableOpacity>)}</View>
            <Text style={styles.inputLabel}>Subject Type *</Text>
            <View style={styles.statusPickerRow}>{types.map(value => <TouchableOpacity key={value} style={[styles.statusPicker, editType === value && styles.statusPickerActive]} onPress={() => setEditType(value)}><Text style={[styles.statusPickerText, editType === value && styles.statusPickerTextActive]}>{value}</Text></TouchableOpacity>)}</View>
            <Text style={styles.inputLabel}>Duration</Text>
            <TextInput value={editDuration} onChangeText={setEditDuration} style={styles.modalInput} placeholder="e.g. 3 months" placeholderTextColor="#A0AABB" />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput value={editDescription} onChangeText={setEditDescription} style={[styles.modalInput, { height: 90, textAlignVertical: "top", paddingTop: 10 }]} placeholder="Subject description" placeholderTextColor="#A0AABB" multiline />
            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.statusPickerRow}>{(["Active", "Inactive"] as const).map(status => <TouchableOpacity key={status} onPress={() => setEditStatus(status)} style={[styles.statusPicker, editStatus === status && styles.statusPickerActive]}><Text style={[styles.statusPickerText, editStatus === status && styles.statusPickerTextActive]}>{status}</Text></TouchableOpacity>)}</View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} activeOpacity={0.8} onPress={() => setEditVisible(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveButton, saving && { opacity: 0.65 }]} activeOpacity={0.85} disabled={saving} onPress={() => void saveEdit()}>
                {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="check" size={17} color="#FFFFFF" />}
                <Text style={styles.modalSaveText}>{saving ? "Saving..." : "Save Changes"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8FC" , marginBottom: 30},
  container: { flex: 1, backgroundColor: "#F7F8FC" },
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
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  addButtonMobile: {
    width: 40,
    height: 40,
    borderRadius: 11,
  },
  scrollView: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },
  pageHeading: { marginBottom: 14 },
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
    borderRadius: 16,
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
  filterRow: { gap: 7, paddingTop: 9 },
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
  filterTextActive: { color: "#FFFFFF" },
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
  subjectList: { gap: 9 },
  subjectCard: {
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
  subjectTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F5",
  },
  subjectIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subjectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  subjectNameBlock: { flex: 1 },
  subjectName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202B3E",
  },
  subjectCode: {
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
  activeBadge: { backgroundColor: "#E7F8EF" },
  inactiveBadge: { backgroundColor: "#FFE9F0" },
  statusText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
  },
  activeText: { color: "#299B65" },
  inactiveText: { color: "#D94376" },
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
  modalScroll: { padding: 16, paddingBottom: 20 },
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
  modalSubjectName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202B3E",
  },
  modalSubjectCode: {
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
  statusPickerTextActive: { color: "#7040D5" },
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
});
