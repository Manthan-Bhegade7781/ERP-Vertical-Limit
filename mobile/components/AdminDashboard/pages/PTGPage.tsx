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



type PTGStatus = "Scheduled" | "Completed" | "Cancelled";

type PTGRecord = {

  id: string;

  parent: string;

  student: string;

  teacher: string;

  meetingDate: string;

  time: string;

  purpose: string;

  remarks: string;

  status: PTGStatus;

};



const initialData: PTGRecord[] = [

  {

    id: "PTG001",

    parent: "Rajesh Patil",

    student: "Aarav Patil",

    teacher: "Rahul Sharma",

    meetingDate: "24 Sep 2026",

    time: "10:00 AM",

    purpose: "Academic Progress",

    remarks: "Discussed Physics performance",

    status: "Scheduled",

  },

  {

    id: "PTG002",

    parent: "Sunita Joshi",

    student: "Ananya Joshi",

    teacher: "Priya Patil",

    meetingDate: "25 Sep 2026",

    time: "11:00 AM",

    purpose: "Academic Progress",

    remarks: "Discussed Mathematics performance",

    status: "Completed",

  },

  {

    id: "PTG003",

    parent: "Vikram Deshmukh",

    student: "Rohan Deshmukh",

    teacher: "Amit Joshi",

    meetingDate: "26 Sep 2026",

    time: "02:00 PM",

    purpose: "Attendance",

    remarks: "Discussed attendance and regularity",

    status: "Scheduled",

  },

  {

    id: "PTG004",

    parent: "Meena Kulkarni",

    student: "Sneha Kulkarni",

    teacher: "Neha Deshmukh",

    meetingDate: "27 Sep 2026",

    time: "03:00 PM",

    purpose: "Performance Review",

    remarks: "Discussed overall performance",

    status: "Cancelled",

  },

];



const statusStyle: Record<PTGStatus, { bg: string; text: string }> = {

  Scheduled: { bg: "#E7F8F0", text: "#13A968" },

  Completed: { bg: "#EAF2FF", text: "#2675E8" },

  Cancelled: { bg: "#FFE9ED", text: "#E84D61" },

};



export default function PTGPage() {

  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [data, setData] = useState(initialData);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<"All" | PTGStatus>("All");

  const [selected, setSelected] = useState<PTGRecord | null>(null);

  const [viewVisible, setViewVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);



  const [parent, setParent] = useState("");

  const [student, setStudent] = useState("");

  const [teacher, setTeacher] = useState("");

  const [meetingDate, setMeetingDate] = useState("");

  const [time, setTime] = useState("");

  const [purpose, setPurpose] = useState("");

  const [remarks, setRemarks] = useState("");

  const [status, setStatus] = useState<PTGStatus>("Scheduled");



  const openAdd = () => router.push("/(admin)/add-ptg" as never);



  const openEdit = (item: PTGRecord) => {

    setSelected(item);

    setParent(item.parent);

    setStudent(item.student);

    setTeacher(item.teacher);

    setMeetingDate(item.meetingDate);

    setTime(item.time);

    setPurpose(item.purpose);

    setRemarks(item.remarks);

    setStatus(item.status);

    setEditVisible(true);

  };



  const saveEdit = () => {

    if (

      !selected ||

      !parent.trim() ||

      !student.trim() ||

      !teacher.trim() ||

      !meetingDate.trim() ||

      !time.trim() ||

      !purpose.trim() ||

      !remarks.trim()

    ) {

      Alert.alert("Required Fields", "Please fill all PTG meeting details.");

      return;

    }

    const updated = {

      ...selected,

      parent: parent.trim(),

      student: student.trim(),

      teacher: teacher.trim(),

      meetingDate: meetingDate.trim(),

      time: time.trim(),

      purpose: purpose.trim(),

      remarks: remarks.trim(),

      status,

    };

    setData((current) =>

      current.map((x) => (x.id === updated.id ? updated : x)),

    );

    setSelected(updated);

    setEditVisible(false);

  };



  const filtered = useMemo(() => {

    const q = search.trim().toLowerCase();

    return data.filter(

      (x) =>

        (!q ||

          x.id.toLowerCase().includes(q) ||

          x.parent.toLowerCase().includes(q) ||

          x.student.toLowerCase().includes(q) ||

          x.teacher.toLowerCase().includes(q) ||

          x.purpose.toLowerCase().includes(q)) &&

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
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={[styles.back, isMobile && styles.backMobile]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}
              numberOfLines={1}
            >
              PTG
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.plus, isMobile && styles.plusMobile]}
            onPress={openAdd}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add PTG meeting"
          >
            <MaterialCommunityIcons name="plus" size={24} color="#7040D5" />
          </TouchableOpacity>
        </View>

        <ScrollView

          showsVerticalScrollIndicator={false}

          contentContainerStyle={styles.content}

        >

          <Text style={styles.pageTitle}>PTG</Text>

          <Text style={styles.subtitle}>

            Manage parent teacher group meetings for your assigned branch

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

                placeholder="Search PTG meetings..."

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

            {(["All", "Scheduled", "Completed", "Cancelled"] as const).map(

              (item) => (

                <TouchableOpacity

                  key={item}

                  style={[

                    styles.filterButton,

                    filter === item && styles.filterActive,

                  ]}

                  onPress={() => setFilter(item)}

                >

                  <Text

                    style={[

                      styles.filterText,

                      filter === item && styles.filterTextActive,

                    ]}

                  >

                    {item}

                  </Text>

                </TouchableOpacity>

              ),

            )}

          </ScrollView>



          {filtered.map((item) => {

            const c = statusStyle[item.status];

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

                        {item.id} • {item.meetingDate}

                      </Text>

                    </View>

                  </View>

                  <View style={[styles.badge, { backgroundColor: c.bg }]}>

                    <Text style={[styles.badgeText, { color: c.text }]}>

                      {item.status}

                    </Text>

                  </View>

                </View>



                <View style={styles.divider} />



                <View style={styles.grid}>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Parent</Text>

                    <Text style={styles.value}>{item.parent}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Teacher</Text>

                    <Text style={styles.value}>{item.teacher}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Meeting Date</Text>

                    <Text style={styles.value}>{item.meetingDate}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Time</Text>

                    <Text style={styles.value}>{item.time}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Purpose</Text>

                    <Text style={styles.value}>{item.purpose}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Remarks</Text>

                    <Text style={styles.value}>{item.remarks}</Text>

                  </View>

                  <View style={styles.detail}>

                    <Text style={styles.label}>Status</Text>

                    <Text style={styles.value}>{item.status}</Text>

                  </View>

                </View>



                <View style={styles.actions}>

                  <TouchableOpacity

                    style={styles.editButton}

                    onPress={() => openEdit(item)}

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

                      setSelected(item);

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

                name="account-group-outline"

                size={38}

                color="#A1A9B7"

              />

              <Text style={styles.emptyTitle}>No PTG meetings found</Text>

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

                  <Text style={styles.modalTitle}>PTG Meeting Details</Text>

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

                  <Text style={styles.modalName}>{selected.student}</Text>

                  <Text style={styles.modalSub}>

                    {selected.parent} • {selected.teacher}

                  </Text>

                  <View style={styles.modalGrid}>

                    {[

                      ["Meeting Date", selected.meetingDate],

                      ["Time", selected.time],

                      ["Purpose", selected.purpose],

                      ["Remarks", selected.remarks],

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

                    <MaterialCommunityIcons

                      name="pencil-outline"

                      size={18}

                      color="#FFF"

                    />

                    <Text style={styles.modalEditText}>Edit PTG</Text>

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

                  <Text style={styles.modalTitle}>Edit PTG Meeting</Text>

                  <Text style={styles.modalSub}>

                    Update meeting information

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

                  ["Parent", parent, setParent],

                  ["Student", student, setStudent],

                  ["Teacher", teacher, setTeacher],

                  ["Meeting Date", meetingDate, setMeetingDate],

                  ["Time", time, setTime],

                  ["Purpose", purpose, setPurpose],

                  ["Remarks", remarks, setRemarks],

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

                  {(["Scheduled", "Completed", "Cancelled"] as PTGStatus[]).map(

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
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },

  pageTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#172033" },

  subtitle: {

    fontFamily: "PoppinsRegular",

    fontSize: 10,

    color: "#7C879A",

    marginTop: 1,

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

  student: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: "#202A3D" },

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

  detail: { width: "50%", marginBottom: 13 },

  label: {

    fontFamily: "PoppinsRegular",

    fontSize: 9,

    color: "#8290A5",

    marginBottom: 2,

  },

  value: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#263047" },

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

    height: 40,

    borderRadius: 10,

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

    paddingVertical: 32,

    paddingHorizontal: 20,

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

    borderRadius: 19,

    padding: 20,

  },

  editModal: {

    maxHeight: "90%",

    backgroundColor: "#FFF",

    borderRadius: 19,

    padding: 20,

  },

  modalHeader: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 12,

  },

  modalTitle: { fontFamily: "PoppinsSemiBold", fontSize: 16, color: "#202A3D" },

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

    paddingHorizontal: 11,

    fontFamily: "PoppinsRegular",

    fontSize: 10.5,

    color: "#263047",

    marginBottom: 8,

  },

  options: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },

  option: {

    paddingHorizontal: 11,

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

    paddingHorizontal: 17,

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

    paddingHorizontal: 17,

    borderRadius: 9,

    backgroundColor: "#7040D5",

    alignItems: "center",

    justifyContent: "center",

  },

  saveText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#FFF" },

});
