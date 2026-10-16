import React, { useMemo, useState } from "react";

import {

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

import { useRouter } from "expo-router";

type ReportStatus = "Ready" | "Generated" | "Processing";

type Report = {

  id: string;

  title: string;

  category: string;

  branch: string;

  dateRange: string;

  generatedOn: string;

  records: string;

  format: string;

  reportType: string;

  status: ReportStatus;

};

const initialReports: Report[] = [

  {

    id: "RPT001",

    title: "Student Attendance Report",

    category: "Attendance",

    branch: "Pune",

    dateRange: "01 Sep – 20 Sep 2026",

    generatedOn: "20 Sep 2026",

    records: "1,248",

    format: "PDF",

    reportType: "Attendance",

    status: "Ready",

  },

  {

    id: "RPT002",

    title: "Student Performance Report",

    category: "Performance",

    branch: "Mumbai",

    dateRange: "01 Sep – 20 Sep 2026",

    generatedOn: "20 Sep 2026",

    records: "864",

    format: "Excel",

    reportType: "Performance",

    status: "Generated",

  },

  {

    id: "RPT003",

    title: "Fee Collection Report",

    category: "Fees",

    branch: "Pune",

    dateRange: "01 Sep – 20 Sep 2026",

    generatedOn: "19 Sep 2026",

    records: "532",

    format: "PDF",

    reportType: "Fees",

    status: "Ready",

  },

  {

    id: "RPT004",

    title: "Examination Results Report",

    category: "Examination",

    branch: "Nashik",

    dateRange: "01 Sep – 20 Sep 2026",

    generatedOn: "18 Sep 2026",

    records: "728",

    format: "Excel",

    reportType: "Examination",

    status: "Generated",

  },

  {

    id: "RPT005",

    title: "Student Enrollment Report",

    category: "Students",

    branch: "Mumbai",

    dateRange: "01 Sep – 20 Sep 2026",

    generatedOn: "18 Sep 2026",

    records: "412",

    format: "PDF",

    reportType: "Enrollment",

    status: "Processing",

  },

  {

    id: "RPT006",

    title: "Batch Summary Report",

    category: "Batches",

    branch: "Pune",

    dateRange: "01 Sep – 20 Sep 2026",

    generatedOn: "17 Sep 2026",

    records: "96",

    format: "PDF",

    reportType: "Batch Summary",

    status: "Ready",

  },

];

const statusStyle: Record<ReportStatus, { bg: string; text: string }> = {

  Ready: { bg: "#E8F8F0", text: "#13B96D" },

  Generated: { bg: "#EAF2FF", text: "#2675E8" },

  Processing: { bg: "#FFF0DF", text: "#F28A17" },

};

export default function ReportsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [reports, setReports] = useState(initialReports);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<

    "All" | ReportStatus

  >("All");

  const [branchFilter, setBranchFilter] = useState<

    "All" | "Pune" | "Mumbai" | "Nashik"

  >("All");

  const [selected, setSelected] = useState<Report | null>(null);

  const [viewVisible, setViewVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);

  const [editTitle, setEditTitle] = useState("");

  const [editCategory, setEditCategory] = useState("");

  const [editBranch, setEditBranch] = useState("");

  const [editDateRange, setEditDateRange] = useState("");

  const [editGeneratedOn, setEditGeneratedOn] = useState("");

  const [editRecords, setEditRecords] = useState("");

  const [editFormat, setEditFormat] = useState("");

  const [editReportType, setEditReportType] = useState("");

  const [editStatus, setEditStatus] = useState<ReportStatus>("Ready");

  const openAddReport = () => {

    router.push("/(admin)/add-report" as never);

  };

  const openEdit = (report: Report) => {

    setSelected(report);

    setEditTitle(report.title);

    setEditCategory(report.category);

    setEditBranch(report.branch);

    setEditDateRange(report.dateRange);

    setEditGeneratedOn(report.generatedOn);

    setEditRecords(report.records);

    setEditFormat(report.format);

    setEditReportType(report.reportType);

    setEditStatus(report.status);

    setEditVisible(true);

  };

  const saveEdit = () => {

    if (

      !selected ||

      !editTitle.trim() ||

      !editCategory.trim() ||

      !editBranch.trim() ||

      !editDateRange.trim() ||

      !editGeneratedOn.trim() ||

      !editRecords.trim() ||

      !editFormat.trim() ||

      !editReportType.trim()

    ) {

      Alert.alert("Required Fields", "Please fill all required report details.");

      return;

    }

    const updated: Report = {

      ...selected,

      title: editTitle.trim(),

      category: editCategory.trim(),

      branch: editBranch.trim(),

      dateRange: editDateRange.trim(),

      generatedOn: editGeneratedOn.trim(),

      records: editRecords.trim(),

      format: editFormat.trim(),

      reportType: editReportType.trim(),

      status: editStatus,

    };

    setReports((current) =>

      current.map((item) => (item.id === updated.id ? updated : item))

    );

    setSelected(updated);

    setEditVisible(false);

  };

  const filteredReports = useMemo(() => {

    const query = search.trim().toLowerCase();

    return reports.filter((item) => {

      const matchesSearch =

        !query ||

        item.id.toLowerCase().includes(query) ||

        item.title.toLowerCase().includes(query) ||

        item.category.toLowerCase().includes(query) ||

        item.branch.toLowerCase().includes(query) ||

        item.reportType.toLowerCase().includes(query);

      const matchesStatus =

        statusFilter === "All" || item.status === statusFilter;

      const matchesBranch =

        branchFilter === "All" || item.branch === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;

    });

  }, [reports, search, statusFilter, branchFilter]);

  const total = reports.length;

  const ready = reports.filter((x) => x.status === "Ready").length;

  const generated = reports.filter((x) => x.status === "Generated").length;

  const processing = reports.filter((x) => x.status === "Processing").length;

  return (

    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>

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
            <TouchableOpacity
              style={[styles.backButton, isMobile && styles.backButtonMobile]}
              activeOpacity={0.8}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}
              numberOfLines={1}
            >
              Reports
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, isMobile && styles.addButtonMobile]}
            activeOpacity={0.85}
            onPress={openAddReport}
            accessibilityRole="button"
            accessibilityLabel="Add Report"
          >
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
          </TouchableOpacity>
        </View>

        <ScrollView

          showsVerticalScrollIndicator={false}

          contentContainerStyle={styles.content}

        >

          <View style={styles.statsRow}>

            <View style={styles.statCard}>

              <View style={[styles.statIcon, styles.purpleIcon]}>

                <MaterialCommunityIcons name="file-chart-outline" size={22} color="#7040D5" />

              </View>

              <Text style={styles.statNumber}>{total}</Text>

              <Text style={styles.statLabel}>Total Reports</Text>

            </View>

            <View style={styles.statCard}>

              <View style={[styles.statIcon, styles.greenIcon]}>

                <MaterialCommunityIcons name="check-circle-outline" size={22} color="#13B96D" />

              </View>

              <Text style={styles.statNumber}>{ready}</Text>

              <Text style={styles.statLabel}>Ready</Text>

            </View>

            <View style={styles.statCard}>

              <View style={[styles.statIcon, styles.blueIcon]}>

                <MaterialCommunityIcons name="file-check-outline" size={22} color="#2675E8" />

              </View>

              <Text style={styles.statNumber}>{generated}</Text>

              <Text style={styles.statLabel}>Generated</Text>

            </View>

            <View style={styles.statCard}>

              <View style={[styles.statIcon, styles.orangeIcon]}>

                <MaterialCommunityIcons name="progress-clock" size={22} color="#F28A17" />

              </View>

              <Text style={styles.statNumber}>{processing}</Text>

              <Text style={styles.statLabel}>Processing</Text>

            </View>

          </View>

          <View style={styles.searchCard}>

            <View style={styles.searchBox}>

              <MaterialCommunityIcons name="magnify" size={21} color="#8994A7" />

              <TextInput

                value={search}

                onChangeText={setSearch}

                placeholder="Search reports..."

                placeholderTextColor="#A0A9B8"

                style={styles.searchInput}

              />

            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>

              {(["All", "Ready", "Generated", "Processing"] as const).map((item) => (

                <TouchableOpacity

                  key={item}

                  style={[styles.filterButton, statusFilter === item && styles.filterButtonActive]}

                  onPress={() => setStatusFilter(item)}

                  activeOpacity={0.8}

                >

                  <Text style={[styles.filterText, statusFilter === item && styles.filterTextActive]}>

                    {item}

                  </Text>

                </TouchableOpacity>

              ))}

            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.branchRow}>

              {(["All", "Pune", "Mumbai", "Nashik"] as const).map((item) => (

                <TouchableOpacity

                  key={item}

                  style={[styles.branchButton, branchFilter === item && styles.branchButtonActive]}

                  onPress={() => setBranchFilter(item)}

                  activeOpacity={0.8}

                >

                  <MaterialCommunityIcons

                    name="map-marker-outline"

                    size={16}

                    color={branchFilter === item ? "#FFFFFF" : "#7040D5"}

                  />

                  <Text style={[styles.branchText, branchFilter === item && styles.branchTextActive]}>

                    {item}

                  </Text>

                </TouchableOpacity>

              ))}

            </ScrollView>

          </View>

          <View style={styles.listHeader}>

            <View>

              <Text style={styles.listTitle}>Generated Reports</Text>

              <Text style={styles.listSubtitle}>Reports available for administration</Text>

            </View>

            <Text style={styles.recordCount}>{filteredReports.length} records</Text>

          </View>

          {filteredReports.map((item) => {

            const colors = statusStyle[item.status];

            return (

              <View key={item.id} style={styles.reportCard}>

                <View style={styles.reportTop}>

                  <View style={styles.reportIdentity}>

                    <View style={styles.reportIcon}>

                      <Text style={styles.pdfText}>

                        {item.format === "PDF" ? "PDF" : "X"}

                      </Text>

                    </View>

                    <View style={styles.titleBlock}>

                      <Text style={styles.reportTitle}>{item.title}</Text>

                      <Text style={styles.reportId}>

                        {item.id} • {item.category}

                      </Text>

                    </View>

                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>

                    <Text style={[styles.statusText, { color: colors.text }]}>

                      {item.status}

                    </Text>

                  </View>

                </View>

                <View style={styles.divider} />

                <View style={styles.detailsGrid}>

                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Branch</Text>

                    <Text style={styles.detailValue}>{item.branch}</Text>

                  </View>

                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Date Range</Text>

                    <Text style={styles.detailValue}>{item.dateRange}</Text>

                  </View>

                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Generated On</Text>

                    <Text style={styles.detailValue}>{item.generatedOn}</Text>

                  </View>

                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Records</Text>

                    <Text style={styles.detailValue}>{item.records}</Text>

                  </View>

                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Format</Text>

                    <Text style={styles.detailValue}>{item.format}</Text>

                  </View>

                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Report Type</Text>

                    <Text style={styles.detailValue}>{item.reportType}</Text>

                  </View>

                </View>

                <View style={styles.cardActions}>

                  <TouchableOpacity

                    style={styles.editButton}

                    activeOpacity={0.8}

                    onPress={() => openEdit(item)}

                  >

                    <MaterialCommunityIcons name="pencil-outline" size={17} color="#FFFFFF" />

                    <Text style={styles.editButtonText}>Edit</Text>

                  </TouchableOpacity>

                  <TouchableOpacity

                    style={styles.viewButton}

                    activeOpacity={0.8}

                    onPress={() => {

                      setSelected(item);

                      setViewVisible(true);

                    }}

                  >

                    <MaterialCommunityIcons name="eye-outline" size={18} color="#7040D5" />

                    <Text style={styles.viewButtonText}>View</Text>

                  </TouchableOpacity>

                </View>

              </View>

            );

          })}

          {filteredReports.length === 0 && (

            <View style={styles.emptyState}>

              <MaterialCommunityIcons name="file-chart-outline" size={38} color="#A3AABD" />

              <Text style={styles.emptyTitle}>No reports found</Text>

              <Text style={styles.emptyText}>Try another search or filter.</Text>

            </View>

          )}

        </ScrollView>

        <Modal visible={viewVisible} transparent animationType="fade" onRequestClose={() => setViewVisible(false)}>

          <View style={styles.modalOverlay}>

            <View style={styles.modalCard}>

              <View style={styles.modalHeader}>

                <View>

                  <Text style={styles.modalTitle}>Report Details</Text>

                  <Text style={styles.modalSubtitle}>{selected?.id}</Text>

                </View>

                <TouchableOpacity style={styles.closeButton} onPress={() => setViewVisible(false)}>

                  <MaterialCommunityIcons name="close" size={20} color="#66768A" />

                </TouchableOpacity>

              </View>

              {selected && (

                <>

                  <Text style={styles.modalReportTitle}>{selected.title}</Text>

                  <Text style={styles.modalDescription}>

                    {selected.reportType} report for {selected.branch}.

                  </Text>

                  <View style={styles.modalGrid}>

                    {[

                      ["Branch", selected.branch],

                      ["Date Range", selected.dateRange],

                      ["Generated On", selected.generatedOn],

                      ["Records", selected.records],

                      ["Format", selected.format],

                      ["Status", selected.status],

                    ].map(([label, value]) => (

                      <View key={label} style={styles.modalDetail}>

                        <Text style={styles.detailLabel}>{label}</Text>

                        <Text style={styles.detailValue}>{value}</Text>

                      </View>

                    ))}

                  </View>

                  <TouchableOpacity

                    style={styles.modalEditButton}

                    onPress={() => {

                      setViewVisible(false);

                      openEdit(selected);

                    }}

                  >

                    <MaterialCommunityIcons name="pencil-outline" size={18} color="#FFFFFF" />

                    <Text style={styles.modalEditText}>Edit Report</Text>

                  </TouchableOpacity>

                </>

              )}

            </View>

          </View>

        </Modal>

        <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>

          <View style={styles.modalOverlay}>

            <View style={styles.editModalCard}>

              <View style={styles.modalHeader}>

                <View>

                  <Text style={styles.modalTitle}>Edit Report</Text>

                  <Text style={styles.modalSubtitle}>Update report information</Text>

                </View>

                <TouchableOpacity style={styles.closeButton} onPress={() => setEditVisible(false)}>

                  <MaterialCommunityIcons name="close" size={20} color="#66768A" />

                </TouchableOpacity>

              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {[

                  ["Title", editTitle, setEditTitle],

                  ["Category", editCategory, setEditCategory],

                  ["Branch", editBranch, setEditBranch],

                  ["Date Range", editDateRange, setEditDateRange],

                  ["Generated On", editGeneratedOn, setEditGeneratedOn],

                  ["Records", editRecords, setEditRecords],

                  ["Format", editFormat, setEditFormat],

                  ["Report Type", editReportType, setEditReportType],

                ].map(([label, value, setter]) => (

                  <View key={label as string}>

                    <Text style={styles.inputLabel}>{label as string}</Text>

                    <TextInput

                      value={value as string}

                      onChangeText={setter as (value: string) => void}

                      style={styles.input}

                      placeholder={`Enter ${(label as string).toLowerCase()}`}

                      placeholderTextColor="#A0A9B8"

                    />

                  </View>

                ))}

                <Text style={styles.inputLabel}>Status</Text>

                <View style={styles.optionsRow}>

                  {(["Ready", "Generated", "Processing"] as ReportStatus[]).map((item) => (

                    <TouchableOpacity

                      key={item}

                      onPress={() => setEditStatus(item)}

                      style={[styles.option, editStatus === item && styles.optionActive]}

                    >

                      <Text style={[styles.optionText, editStatus === item && styles.optionTextActive]}>

                        {item}

                      </Text>

                    </TouchableOpacity>

                  ))}

                </View>

                <View style={styles.modalActions}>

                  <TouchableOpacity style={styles.cancelButton} onPress={() => setEditVisible(false)}>

                    <Text style={styles.cancelText}>Cancel</Text>

                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>

                    <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />

                    <Text style={styles.saveText}>Save Changes</Text>

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

  safeArea: { flex: 1, backgroundColor: "#F7F8FC" },

  container: { flex: 1, backgroundColor: "#F7F8FC" },

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
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
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
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },

  statsRow: { flexDirection: "row", marginBottom: 14 },

  statCard: {

    flex: 1, minHeight: 88, backgroundColor: "#FFFFFF",

    borderRadius: 13, padding: 10, borderWidth: 1,

    borderColor: "#ECEEF4", marginHorizontal: 3,

  },

  statIcon: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center", marginBottom: 6 },

  purpleIcon: { backgroundColor: "#F0E8FF" },

  greenIcon: { backgroundColor: "#E7F8F0" },

  blueIcon: { backgroundColor: "#EAF2FF" },

  orangeIcon: { backgroundColor: "#FFF0DF" },

  statNumber: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D" },

  statLabel: { fontFamily: "PoppinsRegular", fontSize: 9, color: "#7C879A", marginTop: 1 },

  searchCard: {

    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12,

    borderWidth: 1, borderColor: "#E8EAF0", marginBottom: 16,

  },

  searchBox: {

    minHeight: 46, borderWidth: 1, borderColor: "#E3E6ED",

    borderRadius: 11, paddingHorizontal: 12,

    flexDirection: "row", alignItems: "center",

  },

  searchInput: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 11, color: "#263047", marginLeft: 9 },

  filterRow: { paddingTop: 9, paddingRight: 3 },

  filterButton: {

    minHeight: 37, paddingHorizontal: 13, borderRadius: 9,

    backgroundColor: "#F8F9FC", borderWidth: 1, borderColor: "#E6E8EF",

    alignItems: "center", justifyContent: "center", marginRight: 7,

  },

  filterButtonActive: { backgroundColor: "#7040D5", borderColor: "#7040D5" },

  filterText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#788397" },

  filterTextActive: { color: "#FFFFFF" },

  branchRow: { paddingTop: 8, paddingRight: 3 },

  branchButton: {

    minHeight: 36, paddingHorizontal: 12, borderRadius: 9,

    backgroundColor: "#F8F9FC", borderWidth: 1, borderColor: "#E6E8EF",

    flexDirection: "row", alignItems: "center", justifyContent: "center", marginRight: 7,

  },

  branchButtonActive: { backgroundColor: "#7040D5", borderColor: "#7040D5" },

  branchText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#7040D5", marginLeft: 5 },

  branchTextActive: { color: "#FFFFFF" },

  listHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 },

  listTitle: { fontFamily: "PoppinsSemiBold", fontSize: 18, color: "#202A3D" },

  listSubtitle: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#7C879A", marginTop: 1 },

  recordCount: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#7C879A", marginBottom: 2 },

  reportCard: {

    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 13,

    borderWidth: 1, borderColor: "#ECEEF4", marginBottom: 9, elevation: 2,

  },

  reportTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  reportIdentity: { flex: 1, flexDirection: "row", alignItems: "center" },

  reportIcon: {

    width: 44, height: 44, borderRadius: 11, backgroundColor: "#F0E8FF",

    alignItems: "center", justifyContent: "center", marginRight: 9,

  },

  pdfText: { fontFamily: "PoppinsBold", fontSize: 12, color: "#7040D5" },

  titleBlock: { flex: 1 },

  reportTitle: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: "#202A3D" },

  reportId: { fontFamily: "PoppinsRegular", fontSize: 9.5, color: "#9AA2B1", marginTop: 2 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, marginLeft: 8 },

  statusText: { fontFamily: "PoppinsSemiBold", fontSize: 9.5 },

  divider: { height: 1, backgroundColor: "#EEF0F4", marginTop: 11, marginBottom: 10 },

  detailsGrid: { flexDirection: "row", flexWrap: "wrap" },

  detailItem: { width: "50%", marginBottom: 9 },

  detailLabel: { fontFamily: "PoppinsRegular", fontSize: 9, color: "#8290A5", marginBottom: 2 },

  detailValue: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#263047" },

  cardActions: { flexDirection: "row", marginTop: 2 },

  editButton: {

    flex: 1, height: 34, borderRadius: 8, backgroundColor: "#7040D5",

    flexDirection: "row", alignItems: "center", justifyContent: "center", marginRight: 5,

  },

  editButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#FFFFFF", marginLeft: 6 },

  viewButton: {

    flex: 1, height: 34, borderRadius: 8, backgroundColor: "#FFFFFF",

    borderWidth: 1, borderColor: "#7040D5",

    flexDirection: "row", alignItems: "center", justifyContent: "center", marginLeft: 5,

  },

  viewButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#7040D5", marginLeft: 6 },

  emptyState: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 32, alignItems: "center" },

  emptyTitle: { fontFamily: "PoppinsSemiBold", fontSize: 14, color: "#202A3D", marginTop: 10 },

  emptyText: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#8A94A6", marginTop: 3 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15,20,32,0.48)", justifyContent: "center", padding: 20 },

  modalCard: { maxHeight: "82%", backgroundColor: "#FFFFFF", borderRadius: 19, padding: 20 },

  editModalCard: { maxHeight: "90%", backgroundColor: "#FFFFFF", borderRadius: 19, padding: 20 },

  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },

  modalTitle: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D" },

  modalSubtitle: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#8B96A8", marginTop: 2 },

  closeButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F5F6FA", alignItems: "center", justifyContent: "center" },

  modalReportTitle: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D", marginBottom: 7 },

  modalDescription: { fontFamily: "PoppinsRegular", fontSize: 11, lineHeight: 18, color: "#687388", marginBottom: 15 },

  modalGrid: { flexDirection: "row", flexWrap: "wrap" },

  modalDetail: { width: "50%", paddingVertical: 9 },

  modalEditButton: { height: 45, borderRadius: 11, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 15 },

  modalEditText: { fontFamily: "PoppinsSemiBold", fontSize: 11, color: "#FFFFFF", marginLeft: 7 },

  inputLabel: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#58657A", marginBottom: 6, marginTop: 5 },

  input: { minHeight: 45, borderWidth: 1, borderColor: "#E1E4EB", borderRadius: 10, paddingHorizontal: 12, fontFamily: "PoppinsRegular", fontSize: 11, color: "#263047", marginBottom: 10 },

  optionsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 11 },

  option: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: "#F7F8FC", borderWidth: 1, borderColor: "#E5E7EE", marginRight: 8, marginBottom: 8 },

  optionActive: { backgroundColor: "#F0E8FF", borderColor: "#7040D5" },

  optionText: { fontFamily: "PoppinsSemiBold", fontSize: 9.5, color: "#788397" },

  optionTextActive: { color: "#7040D5" },

  modalActions: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 8, paddingBottom: 5 },

  cancelButton: { minHeight: 45, paddingHorizontal: 20, borderRadius: 11, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDDFE7", alignItems: "center", justifyContent: "center", marginRight: 9 },

  cancelText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#687388" },

  saveButton: { minHeight: 45, paddingHorizontal: 19, borderRadius: 11, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center" },

  saveText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#FFFFFF", marginLeft: 7 },

});
