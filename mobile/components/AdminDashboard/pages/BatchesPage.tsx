import React, { useMemo, useState } from "react";
import {
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
type BatchStatus = "Active" | "Inactive";
type Batch = {
  id: string;
  name: string;
  code: string;
  year: string;
  standard: string;
  course: string;
  faculty: string;
  branch: string;
  students: number;
  startDate: string;
  endDate: string;
  status: BatchStatus;
};
const initialBatches: Batch[] = [
  {
    id: "BAT001",
    name: "Foundation 8th",
    code: "BAT001",
    year: "2026-27",
    standard: "8th",
    course: "Foundation",
    faculty: "Prof. Kiran Pawar",
    branch: "Pune",
    students: 32,
    startDate: "01 Jun 2026",
    endDate: "31 Mar 2027",
    status: "Active",
  },
  {
    id: "BAT002",
    name: "Foundation 9th",
    code: "BAT002",
    year: "2026-27",
    standard: "9th",
    course: "Foundation",
    faculty: "Dr. Amit Kulkarni",
    branch: "Pune",
    students: 28,
    startDate: "01 Jun 2026",
    endDate: "31 Mar 2027",
    status: "Active",
  },
  {
    id: "BAT003",
    name: "Foundation 10th",
    code: "BAT003",
    year: "2026-27",
    standard: "10th",
    course: "Foundation",
    faculty: "Sneha Patil",
    branch: "Mumbai",
    students: 35,
    startDate: "01 Jun 2026",
    endDate: "31 Mar 2027",
    status: "Active",
  },
  {
    id: "BAT004",
    name: "11th MHT-CET",
    code: "BAT004",
    year: "2026-27",
    standard: "11th",
    course: "MHT-CET",
    faculty: "Rahul Deshmukh",
    branch: "Pune",
    students: 42,
    startDate: "15 Jun 2026",
    endDate: "31 Mar 2027",
    status: "Active",
  },
  {
    id: "BAT005",
    name: "12th JEE",
    code: "BAT005",
    year: "2026-27",
    standard: "12th",
    course: "JEE",
    faculty: "Dr. Amit Kulkarni",
    branch: "Pune",
    students: 38,
    startDate: "01 Jun 2026",
    endDate: "31 Mar 2027",
    status: "Active",
  },
  {
    id: "BAT006",
    name: "12th NEET",
    code: "BAT006",
    year: "2026-27",
    standard: "12th",
    course: "NEET",
    faculty: "Priya Joshi",
    branch: "Pune",
    students: 40,
    startDate: "01 Jun 2026",
    endDate: "31 Mar 2027",
    status: "Active",
  },
  {
    id: "BAT007",
    name: "MHT-CET 12th",
    code: "BAT007",
    year: "2026-27",
    standard: "12th",
    course: "MHT-CET",
    faculty: "Rahul Deshmukh",
    branch: "Nashik",
    students: 31,
    startDate: "15 Jun 2026",
    endDate: "31 Mar 2027",
    status: "Active",
  },
  {
    id: "BAT008",
    name: "JEE Foundation",
    code: "BAT008",
    year: "2026-27",
    standard: "11th",
    course: "Foundation",
    faculty: "Prof. Kiran Pawar",
    branch: "Mumbai",
    students: 26,
    startDate: "15 Jun 2026",
    endDate: "31 Mar 2027",
    status: "Active",
  },
];
const filters = [
  "All",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "JEE",
  "NEET",
  "MHT-CET",
  "Foundation",
];
export default function BatchesPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editFaculty, setEditFaculty] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editStatus, setEditStatus] = useState<BatchStatus>("Active");
  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return batches.filter((batch) => {
      const matchesSearch =
        !query ||
        batch.id.toLowerCase().includes(query) ||
        batch.name.toLowerCase().includes(query) ||
        batch.code.toLowerCase().includes(query) ||
        batch.standard.toLowerCase().includes(query) ||
        batch.course.toLowerCase().includes(query) ||
        batch.faculty.toLowerCase().includes(query) ||
        batch.branch.toLowerCase().includes(query);
      const matchesFilter =
        filter === "All" ||
        batch.standard === filter ||
        batch.course === filter;
      return matchesSearch && matchesFilter;
    });
  }, [batches, search, filter]);
  const handleAddBatch = () => {
    router.push("/(admin)/add-batch" as never);
  };
  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setViewVisible(true);
  };
  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setEditName(batch.name);
    setEditFaculty(batch.faculty);
    setEditBranch(batch.branch);
    setEditStatus(batch.status);
    setEditVisible(true);
  };
  const saveEdit = () => {
    if (!selectedBatch) return;
    const updatedBatch: Batch = {
      ...selectedBatch,
      name: editName.trim() || selectedBatch.name,
      faculty: editFaculty.trim() || selectedBatch.faculty,
      branch: editBranch.trim() || selectedBatch.branch,
      status: editStatus,
    };
    setBatches((current) =>
      current.map((item) =>
        item.id === updatedBatch.id ? updatedBatch : item,
      ),
    );
    setSelectedBatch(updatedBatch);
    setEditVisible(false);
  };
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["left", "right"]}
    >
      <StatusBar
        style="light"
        backgroundColor="#6D35D8"
        translucent={false}
      />
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 8,
              minHeight: insets.top + 66,
            },
            isMobile && styles.headerMobile,
            isTablet && styles.headerTablet,
          ]}
        >
          <TouchableOpacity
            style={[styles.backButton, isMobile && styles.backButtonMobile]}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}
            numberOfLines={1}
          >
            Batches
          </Text>
          <TouchableOpacity
            style={[styles.addButton, isMobile && styles.addButtonMobile]}
            activeOpacity={0.85}
            onPress={handleAddBatch}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color="#7040D5"
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageHeading}>
            <Text style={styles.pageTitle}>Batch Management</Text>
            <Text style={styles.pageSubtitle}>
              Manage batches, academic years, courses, faculty and branches.
            </Text>
          </View>
          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#8792A4"
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search batches..."
                placeholderTextColor="#A0AABB"
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {filters.map((item) => {
                const active = filter === item;
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.8}
                    onPress={() => setFilter(item)}
                    style={[
                      styles.filterButton,
                      active && styles.filterButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active && styles.filterTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Batches</Text>
            <Text style={styles.sectionCount}>
              {filteredBatches.length} Batches
            </Text>
          </View>
          <View style={styles.batchList}>
            {filteredBatches.map((batch) => (
              <View key={batch.id} style={styles.batchCard}>
                <View style={styles.batchTop}>
                  <View style={styles.batchIdentity}>
                    <View style={styles.batchIcon}>
                      <MaterialCommunityIcons
                        name="account-group-outline"
                        size={22}
                        color="#7040D5"
                      />
                    </View>
                    <View style={styles.batchNameBlock}>
                      <Text style={styles.batchName}>{batch.name}</Text>
                      <Text style={styles.batchCode}>
                        {batch.code} • {batch.year}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      batch.status === "Active"
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        batch.status === "Active"
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {batch.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>STD / SUB</Text>
                    <Text style={styles.detailValue}>
                      {batch.standard} / {batch.course}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>STUDENTS</Text>
                    <Text style={styles.detailValue}>
                      {batch.students}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>FACULTY</Text>
                    <Text style={styles.detailValue}>
                      {batch.faculty}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>BRANCH</Text>
                    <Text style={styles.detailValue}>
                      {batch.branch}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>START DATE</Text>
                    <Text style={styles.detailValue}>
                      {batch.startDate}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>END DATE</Text>
                    <Text style={styles.detailValue}>
                      {batch.endDate}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.8}
                    onPress={() => handleView(batch)}
                  >
                    <MaterialCommunityIcons
                      name="eye-outline"
                      size={15}
                      color="#7040D5"
                    />
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.8}
                    onPress={() => handleEdit(batch)}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={15}
                      color="#7040D5"
                    />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {filteredBatches.length === 0 && (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={32}
                  color="#A2ADBF"
                />
                <Text style={styles.emptyText}>No batches found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      {/* VIEW BATCH */}
      <Modal
        visible={viewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Batch Details</Text>
                <Text style={styles.modalSubtitle}>
                  Complete batch information
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalClose}
                activeOpacity={0.8}
                onPress={() => setViewVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#66768A"
                />
              </TouchableOpacity>
            </View>
            {selectedBatch && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                <View style={styles.modalProfile}>
                  <View style={styles.modalAvatar}>
                    <MaterialCommunityIcons
                      name="account-group-outline"
                      size={28}
                      color="#7040D5"
                    />
                  </View>
                  <View>
                    <Text style={styles.modalBatchName}>
                      {selectedBatch.name}
                    </Text>
                    <Text style={styles.modalBatchCode}>
                      {selectedBatch.code} • {selectedBatch.year}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalGrid}>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Standard</Text>
                    <Text style={styles.modalValue}>
                      {selectedBatch.standard}
                    </Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Course</Text>
                    <Text style={styles.modalValue}>
                      {selectedBatch.course}
                    </Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Faculty</Text>
                    <Text style={styles.modalValue}>
                      {selectedBatch.faculty}
                    </Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Branch</Text>
                    <Text style={styles.modalValue}>
                      {selectedBatch.branch}
                    </Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Students</Text>
                    <Text style={styles.modalValue}>
                      {selectedBatch.students}
                    </Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <Text style={styles.modalValue}>
                      {selectedBatch.status}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      {/* EDIT BATCH */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Batch</Text>
                <Text style={styles.modalSubtitle}>
                  Update batch information
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalClose}
                activeOpacity={0.8}
                onPress={() => setEditVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#66768A"
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.inputLabel}>Batch Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.modalInput}
                placeholder="Batch name"
                placeholderTextColor="#A0AABB"
              />
              <Text style={styles.inputLabel}>Faculty</Text>
              <TextInput
                value={editFaculty}
                onChangeText={setEditFaculty}
                style={styles.modalInput}
                placeholder="Faculty"
                placeholderTextColor="#A0AABB"
              />
              <Text style={styles.inputLabel}>Branch</Text>
              <TextInput
                value={editBranch}
                onChangeText={setEditBranch}
                style={styles.modalInput}
                placeholder="Branch"
                placeholderTextColor="#A0AABB"
              />
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusPickerRow}>
                {(["Active", "Inactive"] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    activeOpacity={0.8}
                    onPress={() => setEditStatus(status)}
                    style={[
                      styles.statusPicker,
                      editStatus === status &&
                        styles.statusPickerActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPickerText,
                        editStatus === status &&
                          styles.statusPickerTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  activeOpacity={0.8}
                  onPress={() => setEditVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  activeOpacity={0.85}
                  onPress={saveEdit}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={17}
                    color="#FFFFFF"
                  />
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
});
