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



type ComplaintStatus = "Open" | "In Progress" | "Resolved";

type Complaint = {

  id: string;

  title: string;

  student: string;

  date: string;

  category: string;

  assignedPerson: string;

  priority: string;

  description: string;

  status: ComplaintStatus;

};



const initialData: Complaint[] = [

  {

    id: "CMP001",

    title: "Classroom Issue",

    student: "Aarav Patil",

    date: "18 Sep 2026",

    category: "Academic",

    assignedPerson: "Branch Admin",

    priority: "Medium",

    description: "Requested assistance regarding classroom seating.",

    status: "Open",

  },

  {

    id: "CMP002",

    title: "Attendance Correction",

    student: "Ananya Joshi",

    date: "19 Sep 2026",

    category: "Attendance",

    assignedPerson: "Branch Admin",

    priority: "High",

    description: "Requested correction of an attendance record.",

    status: "In Progress",

  },

  {

    id: "CMP003",

    title: "Fee Related Query",

    student: "Rohan Deshmukh",

    date: "20 Sep 2026",

    category: "Fees",

    assignedPerson: "Accounts Team",

    priority: "Medium",

    description: "Requested clarification regarding fee payment.",

    status: "Resolved",

  },

  {

    id: "CMP004",

    title: "Study Material Issue",

    student: "Sneha Kulkarni",

    date: "21 Sep 2026",

    category: "Academic",

    assignedPerson: "Branch Admin",

    priority: "Low",

    description: "Requested the latest study material.",

    status: "Open",

  },

];



const statusStyle: Record<ComplaintStatus, { bg: string; text: string }> = {

  Open: { bg: "#E7F8F0", text: "#13A968" },

  "In Progress": { bg: "#E7F8F0", text: "#13A968" },

  Resolved: { bg: "#EAF2FF", text: "#2675E8" },

};



export default function StudentComplaintPage() {

  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [data, setData] = useState(initialData);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<"All" | ComplaintStatus>("All");

  const [selected, setSelected] = useState<Complaint | null>(null);

  const [viewVisible, setViewVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);

  const [title, setTitle] = useState("");

  const [student, setStudent] = useState("");

  const [date, setDate] = useState("");

  const [category, setCategory] = useState("");

  const [assignedPerson, setAssignedPerson] = useState("");

  const [priority, setPriority] = useState("");

  const [description, setDescription] = useState("");

  const [status, setStatus] = useState<ComplaintStatus>("Open");



  const openAdd = () => router.push("/(admin)/add-student-complaint" as never);

  const openEdit = (x: Complaint) => {

    setSelected(x);

    setTitle(x.title);

    setStudent(x.student);

    setDate(x.date);

    setCategory(x.category);

    setAssignedPerson(x.assignedPerson);

    setPriority(x.priority);

    setDescription(x.description);

    setStatus(x.status);

    setEditVisible(true);

  };

  const saveEdit = () => {

    if (

      !selected ||

      !title.trim() ||

      !student.trim() ||

      !date.trim() ||

      !category.trim() ||

      !assignedPerson.trim() ||

      !priority.trim() ||

      !description.trim()

    ) {

      Alert.alert("Required Fields", "Please fill all complaint details.");

      return;

    }

    const updated = {

      ...selected,

      title: title.trim(),

      student: student.trim(),

      date: date.trim(),

      category: category.trim(),

      assignedPerson: assignedPerson.trim(),

      priority: priority.trim(),

      description: description.trim(),

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

          x.title.toLowerCase().includes(q) ||

          x.student.toLowerCase().includes(q) ||

          x.category.toLowerCase().includes(q)) &&

        (filter === "All" || x.status === filter),

    );

  }, [data, search, filter]);



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
          <TouchableOpacity
            style={[styles.back, isMobile && styles.backButtonMobile]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}
            numberOfLines={1}
          >
            Student Complaint
          </Text>
          <TouchableOpacity
            style={[styles.plus, isMobile && styles.plusMobile]}
            onPress={openAdd}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
          </TouchableOpacity>
        </View>
        <ScrollView

          showsVerticalScrollIndicator={false}

          contentContainerStyle={styles.content}

        >

          <Text style={styles.pageTitle}>Student Complaint</Text>

          <Text style={styles.subtitle}>

            Manage student complaints for your assigned branch

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

                placeholder="Search complaints..."

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

            {(["All", "Open", "In Progress", "Resolved"] as const).map((x) => (

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

                        name="alert-circle-outline"

                        size={26}

                        color="#FF4F87"

                      />

                    </View>

                    <View style={styles.titleBox}>

                      <Text style={styles.title}>{x.title}</Text>

                      <Text style={styles.id}>

                        {x.id} • {x.student}

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

                    <Text style={styles.label}>Student</Text>

                    <Text style={styles.value}>{x.student}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Category</Text>

                    <Text style={styles.value}>{x.category}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Date</Text>

                    <Text style={styles.value}>{x.date}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Assigned Person</Text>

                    <Text style={styles.value}>{x.assignedPerson}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Priority</Text>

                    <Text style={styles.value}>{x.priority}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Description</Text>

                    <Text style={styles.value}>{x.description}</Text>

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

                name="alert-circle-outline"

                size={38}

                color="#A1A9B7"

              />

              <Text style={styles.emptyTitle}>No complaints found</Text>

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

                  <Text style={styles.modalTitle}>Complaint Details</Text>

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

                  <Text style={styles.modalName}>{selected.title}</Text>

                  <Text style={styles.modalSub}>

                    {selected.student} • {selected.category}

                  </Text>

                  <View style={styles.modalGrid}>

                    {[

                      ["Date", selected.date],

                      ["Assigned Person", selected.assignedPerson],

                      ["Priority", selected.priority],

                      ["Description", selected.description],

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

                    <Text style={styles.modalEditText}>Edit Complaint</Text>

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

                  <Text style={styles.modalTitle}>Edit Student Complaint</Text>

                  <Text style={styles.modalSub}>

                    Update complaint information

                  </Text>

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

                  ["Title", title, setTitle],

                  ["Student", student, setStudent],

                  ["Date", date, setDate],

                  ["Category", category, setCategory],

                  ["Assigned Person", assignedPerson, setAssignedPerson],

                  ["Priority", priority, setPriority],

                  ["Description", description, setDescription],

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

                  {(

                    ["Open", "In Progress", "Resolved"] as ComplaintStatus[]

                  ).map((s) => (

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

                  ))}

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
  back: {
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
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },

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

    fontSize: 10.5,

    color: "#263047",

    marginLeft: 8,

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

    padding: 14,

    borderWidth: 1,

    borderColor: "#ECEEF4",

    marginBottom: 12,

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

  title: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: "#202A3D" },

  id: {

    fontFamily: "PoppinsRegular",

    fontSize: 9,

    color: "#8D98AA",

    marginTop: 2,

  },

  badge: {

    paddingHorizontal: 10,

    paddingVertical: 7,

    borderRadius: 8,

    marginLeft: 8,

  },

  badgeText: { fontFamily: "PoppinsSemiBold", fontSize: 9 },

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

    fontSize: 9,

    color: "#8290A5",

    marginBottom: 3,

  },

  value: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#263047" },

  actions: { flexDirection: "row", marginTop: 2 },

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

    borderRadius: 17,

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

  modalGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },

  modalDetail: { width: "50%", paddingVertical: 7 },

  modalEdit: {

    height: 45,

    borderRadius: 11,

    backgroundColor: "#7040D5",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 15,

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

  options: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },

  option: {

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 10,

    backgroundColor: "#F7F8FC",

    borderWidth: 1,

    borderColor: "#E5E7EE",

    marginRight: 8,

    marginBottom: 8,

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

    paddingTop: 8,

  },

  cancel: {

    minHeight: 42,

    paddingHorizontal: 18,

    borderRadius: 11,

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

    minHeight: 42,

    paddingHorizontal: 19,

    borderRadius: 11,

    backgroundColor: "#7040D5",

    alignItems: "center",

    justifyContent: "center",

  },

  saveText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#FFF" },

});
