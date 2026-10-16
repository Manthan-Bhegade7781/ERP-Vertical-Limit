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

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

type LeaveStatus = "Approved" | "Pending" | "Rejected";

type Leave = {
  id: string;

  name: string;

  role: string;

  department: string;

  leaveType: string;

  fromDate: string;

  toDate: string;

  days: string;

  reason: string;

  status: LeaveStatus;
};

const initialData: Leave[] = [
  {
    id: "LV001",

    name: "Rahul Sharma",

    role: "Physics Faculty",

    department: "Science",

    leaveType: "Casual Leave",

    fromDate: "20 Sep 2026",

    toDate: "21 Sep 2026",

    days: "2",

    reason: "Personal work",

    status: "Approved",
  },

  {
    id: "LV002",

    name: "Priya Patil",

    role: "Mathematics Faculty",

    department: "Mathematics",

    leaveType: "Medical Leave",

    fromDate: "22 Sep 2026",

    toDate: "23 Sep 2026",

    days: "2",

    reason: "Health appointment",

    status: "Pending",
  },

  {
    id: "LV003",

    name: "Amit Joshi",

    role: "Chemistry Faculty",

    department: "Science",

    leaveType: "Casual Leave",

    fromDate: "24 Sep 2026",

    toDate: "24 Sep 2026",

    days: "1",

    reason: "Personal work",

    status: "Approved",
  },

  {
    id: "LV004",

    name: "Sneha Kulkarni",

    role: "Biology Faculty",

    department: "Biology",

    leaveType: "Emergency Leave",

    fromDate: "25 Sep 2026",

    toDate: "26 Sep 2026",

    days: "2",

    reason: "Family emergency",

    status: "Rejected",
  },

  {
    id: "LV005",

    name: "Neha Deshmukh",

    role: "English Faculty",

    department: "English",

    leaveType: "Casual Leave",

    fromDate: "28 Sep 2026",

    toDate: "29 Sep 2026",

    days: "2",

    reason: "Personal work",

    status: "Pending",
  },
];

const statusStyle: Record<LeaveStatus, { bg: string; text: string }> = {
  Approved: { bg: "#E7F8F0", text: "#13A968" },

  Pending: { bg: "#FFF0DF", text: "#F28A17" },

  Rejected: { bg: "#FFE9ED", text: "#E84D61" },
};

export default function StaffOnLeavePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [data, setData] = useState(initialData);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<"All" | LeaveStatus>("All");

  const [selected, setSelected] = useState<Leave | null>(null);

  const [viewVisible, setViewVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);

  const [name, setName] = useState("");

  const [role, setRole] = useState("");

  const [department, setDepartment] = useState("");

  const [leaveType, setLeaveType] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [days, setDays] = useState("");

  const [reason, setReason] = useState("");

  const [status, setStatus] = useState<LeaveStatus>("Pending");

  const openAdd = () => router.push("/(admin)/add-staff-on-leave" as never);

  const openEdit = (x: Leave) => {
    setSelected(x);

    setName(x.name);

    setRole(x.role);

    setDepartment(x.department);

    setLeaveType(x.leaveType);

    setFromDate(x.fromDate);

    setToDate(x.toDate);

    setDays(x.days);

    setReason(x.reason);

    setStatus(x.status);

    setEditVisible(true);
  };

  const saveEdit = () => {
    if (
      !selected ||
      !name.trim() ||
      !role.trim() ||
      !department.trim() ||
      !leaveType.trim() ||
      !fromDate.trim() ||
      !toDate.trim() ||
      !days.trim() ||
      !reason.trim()
    ) {
      Alert.alert("Required Fields", "Please fill all staff leave details.");

      return;
    }

    const updated = {
      ...selected,

      name: name.trim(),

      role: role.trim(),

      department: department.trim(),

      leaveType: leaveType.trim(),

      fromDate: fromDate.trim(),

      toDate: toDate.trim(),

      days: days.trim(),

      reason: reason.trim(),

      status,
    };

    setData((a) => a.map((x) => (x.id === updated.id ? updated : x)));

    setSelected(updated);

    setEditVisible(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return data.filter(
      (x) =>
        (!q ||
          x.id.toLowerCase().includes(q) ||
          x.name.toLowerCase().includes(q) ||
          x.role.toLowerCase().includes(q) ||
          x.department.toLowerCase().includes(q)) &&
        (filter === "All" || x.status === filter),
    );
  }, [data, search, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.container}>
        <StatusBar
          style="light"
          backgroundColor="#6D35D8"
          translucent={false}
        />
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
              style={[styles.back, isMobile && styles.backMobile]}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color="#FFF"
              />
            </TouchableOpacity>

            <Text
              style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}
              numberOfLines={1}
            >
              Staff on Leave
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.plus, isMobile && styles.plusMobile]}
            onPress={openAdd}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.pageTitle}>Staff on Leave</Text>

          <Text style={styles.subtitle}>
            View staff on leave records for your assigned branch
          </Text>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#8491A6"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search staff leave..."
                placeholderTextColor="#A0A9B8"
                style={styles.searchInput}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {(["All", "Approved", "Pending", "Rejected"] as const).map((x) => (
              <TouchableOpacity
                key={x}
                style={[
                  styles.filterButton,

                  filter === x && styles.filterActive,
                ]}
                onPress={() => setFilter(x)}
              >
                <Text
                  style={[
                    styles.filterText,

                    filter === x && styles.filterTextActive,
                  ]}
                >
                  {x}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filtered.map((x) => {
            const c = statusStyle[x.status];

            return (
              <View style={styles.card} key={x.id}>
                <View style={styles.cardTop}>
                  <View style={styles.identity}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons
                        name="account-clock-outline"
                        size={25}
                        color="#7040D5"
                      />
                    </View>

                    <View style={styles.titleBox}>
                      <Text style={styles.name}>{x.name}</Text>

                      <Text style={styles.id}>
                        {x.id} • {x.role}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.badge, { backgroundColor: c.bg }]}>
                    <Text style={[styles.badgeText, { color: c.text }]}>
                      {x.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.grid}>
                  <View style={styles.detail}>
                    <Text style={styles.label}>Role</Text>

                    <Text style={styles.value}>{x.role}</Text>
                  </View>

                  <View style={styles.detail}>
                    <Text style={styles.label}>Department</Text>

                    <Text style={styles.value}>{x.department}</Text>
                  </View>

                  <View style={styles.detail}>
                    <Text style={styles.label}>Leave Type</Text>

                    <Text style={styles.value}>{x.leaveType}</Text>
                  </View>

                  <View style={styles.detail}>
                    <Text style={styles.label}>From Date</Text>

                    <Text style={styles.value}>{x.fromDate}</Text>
                  </View>

                  <View style={styles.detail}>
                    <Text style={styles.label}>To Date</Text>

                    <Text style={styles.value}>{x.toDate}</Text>
                  </View>

                  <View style={styles.detail}>
                    <Text style={styles.label}>Number of Days</Text>

                    <Text style={styles.value}>{x.days}</Text>
                  </View>

                  <View style={styles.detail}>
                    <Text style={styles.label}>Reason</Text>

                    <Text style={styles.value}>{x.reason}</Text>
                  </View>

                  <View style={styles.detail}>
                    <Text style={styles.label}>Status</Text>

                    <Text style={styles.value}>{x.status}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEdit(x)}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={17}
                      color="#FFF"
                    />

                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      setSelected(x);

                      setViewVisible(true);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="eye-outline"
                      size={18}
                      color="#7040D5"
                    />

                    <Text style={styles.viewText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="account-off-outline"
                size={38}
                color="#A1A9B7"
              />

              <Text style={styles.emptyTitle}>
                No staff leave records found
              </Text>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={viewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Leave Details</Text>

                  <Text style={styles.modalSub}>{selected?.id}</Text>
                </View>

                <TouchableOpacity
                  style={styles.close}
                  onPress={() => setViewVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#66768A"
                  />
                </TouchableOpacity>
              </View>

              {selected && (
                <>
                  <Text style={styles.modalName}>{selected.name}</Text>

                  <Text style={styles.modalSub}>
                    {selected.role} • {selected.department}
                  </Text>

                  <View style={styles.modalGrid}>
                    {[
                      ["Leave Type", selected.leaveType],

                      ["From Date", selected.fromDate],

                      ["To Date", selected.toDate],

                      ["Number of Days", selected.days],

                      ["Reason", selected.reason],

                      ["Status", selected.status],
                    ].map(([l, v]) => (
                      <View style={styles.modalDetail} key={l}>
                        <Text style={styles.label}>{l}</Text>

                        <Text style={styles.value}>{v}</Text>
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
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color="#FFF"
                    />

                    <Text style={styles.modalEditText}>Edit Leave</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={editVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.editModal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Edit Staff Leave</Text>

                  <Text style={styles.modalSub}>Update leave information</Text>
                </View>

                <TouchableOpacity
                  style={styles.close}
                  onPress={() => setEditVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#66768A"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {[
                  ["Name", name, setName],

                  ["Role", role, setRole],

                  ["Department", department, setDepartment],

                  ["Leave Type", leaveType, setLeaveType],

                  ["From Date", fromDate, setFromDate],

                  ["To Date", toDate, setToDate],

                  ["Number of Days", days, setDays],

                  ["Reason", reason, setReason],
                ].map(([l, v, s]) => (
                  <View key={l as string}>
                    <Text style={styles.inputLabel}>{l as string}</Text>

                    <TextInput
                      value={v as string}
                      onChangeText={s as (v: string) => void}
                      style={styles.input}
                      placeholder={`Enter ${(l as string).toLowerCase()}`}
                      placeholderTextColor="#A0A9B8"
                    />
                  </View>
                ))}

                <Text style={styles.inputLabel}>Status</Text>

                <View style={styles.options}>
                  {(["Approved", "Pending", "Rejected"] as LeaveStatus[]).map(
                    (s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.option,

                          status === s && styles.optionActive,
                        ]}
                        onPress={() => setStatus(s)}
                      >
                        <Text
                          style={[
                            styles.optionText,

                            status === s && styles.optionTextActive,
                          ]}
                        >
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancel}
                    onPress={() => setEditVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.save} onPress={saveEdit}>
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
  safe: { flex: 1, backgroundColor: "#F7F8FC" },

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
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  back: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backMobile: { width: 36, height: 36, borderRadius: 10, marginRight: 12 },
  headerTitle: {
    flex: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    lineHeight: 26,
    color: "#FFFFFF",
  },
  headerTitleMobile: { fontSize: 20 },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  plusMobile: { width: 40, height: 40, borderRadius: 11 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },

  pageTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#172033" },

  subtitle: {
    fontFamily: "PoppinsRegular",

    fontSize: 10,

    color: "#7C879A",

    marginTop: 2,

    marginBottom: 14,
  },

  searchCard: {
    backgroundColor: "#FFF",

    borderRadius: 14,

    padding: 12,

    borderWidth: 1,

    borderColor: "#E8EAF0",

    marginBottom: 16,
  },

  searchBox: {
    height: 46,

    borderWidth: 1,

    borderColor: "#E3E6ED",

    borderRadius: 11,

    paddingHorizontal: 12,

    flexDirection: "row",

    alignItems: "center",
  },

  searchInput: {
    flex: 1,

    fontFamily: "PoppinsRegular",

    fontSize: 11,

    color: "#263047",

    marginLeft: 9,
  },

  filters: { paddingBottom: 10 },

  filterButton: {
    height: 38,

    paddingHorizontal: 13,

    borderRadius: 9,

    backgroundColor: "#FFF",

    borderWidth: 1,

    borderColor: "#E3E6ED",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 7,
  },

  filterActive: { backgroundColor: "#7040D5", borderColor: "#7040D5" },

  filterText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#788397" },

  filterTextActive: { color: "#FFF" },

  card: {
    backgroundColor: "#FFF",

    borderRadius: 14,

    padding: 13,

    borderWidth: 1,

    borderColor: "#ECEEF4",

    marginBottom: 9,

    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  identity: { flex: 1, flexDirection: "row", alignItems: "center" },

  iconBox: {
    width: 44,

    height: 44,

    borderRadius: 11,

    backgroundColor: "#F0E8FF",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 9,
  },

  titleBox: { flex: 1 },

  name: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: "#202A3D" },

  id: {
    fontFamily: "PoppinsRegular",

    fontSize: 9.5,

    color: "#8D98AA",

    marginTop: 2,
  },

  badge: {
    paddingHorizontal: 10,

    paddingVertical: 7,

    borderRadius: 8,

    marginLeft: 8,
  },

  badgeText: { fontFamily: "PoppinsSemiBold", fontSize: 9.5 },

  divider: {
    height: 1,

    backgroundColor: "#EEF0F4",

    marginTop: 11,

    marginBottom: 10,
  },

  grid: { flexDirection: "row", flexWrap: "wrap" },

  detail: { width: "50%", marginBottom: 9 },

  label: {
    fontFamily: "PoppinsRegular",

    fontSize: 9.5,

    color: "#8290A5",

    marginBottom: 3,
  },

  value: { fontFamily: "PoppinsRegular", fontSize: 11.5, color: "#263047" },

  actions: { flexDirection: "row", marginTop: 1 },

  editButton: {
    flex: 1,

    height: 34,

    borderRadius: 8,

    backgroundColor: "#7040D5",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 5,
  },

  editText: {
    fontFamily: "PoppinsSemiBold",

    fontSize: 10,

    color: "#FFF",

    marginLeft: 6,
  },

  viewButton: {
    flex: 1,

    height: 34,

    borderRadius: 8,

    backgroundColor: "#FFF",

    borderWidth: 1,

    borderColor: "#7040D5",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginLeft: 5,
  },

  viewText: {
    fontFamily: "PoppinsSemiBold",

    fontSize: 10,

    color: "#7040D5",

    marginLeft: 6,
  },

  empty: {
    backgroundColor: "#FFF",

    borderRadius: 14,

    padding: 32,

    alignItems: "center",
  },

  emptyTitle: {
    fontFamily: "PoppinsSemiBold",

    fontSize: 14,

    color: "#202A3D",

    marginTop: 10,
  },

  overlay: {
    flex: 1,

    backgroundColor: "rgba(15,20,32,.48)",

    justifyContent: "center",

    padding: 20,
  },

  modal: {
    maxHeight: "80%",

    backgroundColor: "#FFF",

    borderRadius: 14,

    padding: 14,
  },

  editModal: {
    maxHeight: "90%",

    backgroundColor: "#FFF",

    borderRadius: 14,

    padding: 14,
  },

  modalHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 12,
  },

  modalTitle: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D" },

  modalSub: {
    fontFamily: "PoppinsRegular",

    fontSize: 10,

    color: "#8B96A8",

    marginTop: 2,
  },

  close: {
    width: 34,

    height: 34,

    borderRadius: 9,

    backgroundColor: "#F5F6FA",

    alignItems: "center",

    justifyContent: "center",
  },

  modalName: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D" },

  modalGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },

  modalDetail: { width: "50%", paddingVertical: 7 },

  modalEdit: {
    height: 36,

    borderRadius: 9,

    backgroundColor: "#7040D5",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 11,
  },

  modalEditText: {
    fontFamily: "PoppinsSemiBold",

    fontSize: 11,

    color: "#FFF",

    marginLeft: 7,
  },

  inputLabel: {
    fontFamily: "PoppinsSemiBold",

    fontSize: 10,

    color: "#58657A",

    marginBottom: 6,

    marginTop: 5,
  },

  input: {
    minHeight: 42,

    borderWidth: 1,

    borderColor: "#E1E4EB",

    borderRadius: 10,

    paddingHorizontal: 12,

    fontFamily: "PoppinsRegular",

    fontSize: 11,

    color: "#263047",

    marginBottom: 10,
  },

  options: { flexDirection: "row", flexWrap: "wrap", marginBottom: 9 },

  option: {
    paddingHorizontal: 10,

    paddingVertical: 7,

    borderRadius: 9,

    backgroundColor: "#F7F8FC",

    borderWidth: 1,

    borderColor: "#E5E7EE",

    marginRight: 7,

    marginBottom: 7,
  },

  optionActive: { backgroundColor: "#F0E8FF", borderColor: "#7040D5" },

  optionText: {
    fontFamily: "PoppinsSemiBold",

    fontSize: 9.5,

    color: "#788397",
  },

  optionTextActive: { color: "#7040D5" },

  modalActions: {
    flexDirection: "row",

    justifyContent: "flex-end",

    paddingTop: 6,
  },

  cancel: {
    minHeight: 38,

    paddingHorizontal: 16,

    borderRadius: 9,

    borderWidth: 1,

    borderColor: "#DDDDE5",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 9,
  },

  cancelText: {
    fontFamily: "PoppinsSemiBold",

    fontSize: 10.5,

    color: "#687388",
  },

  save: {
    minHeight: 38,

    paddingHorizontal: 16,

    borderRadius: 9,

    backgroundColor: "#7040D5",

    alignItems: "center",

    justifyContent: "center",
  },

  saveText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#FFF" },
});
