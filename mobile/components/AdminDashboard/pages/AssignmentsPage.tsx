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



type AssignmentStatus = "Assigned" | "Pending" | "Submitted" | "Overdue";



type Assignment = {

  id: string;

  title: string;

  subject: string;

  chapter: string;

  standard: string;

  dueDate: string;

  attachment: string;

  status: AssignmentStatus;

  batch: string;

  branch: string;

};



const initialAssignments: Assignment[] = [

  {

    id: "ASM001",

    title: "Newton Laws Practice",

    subject: "Physics",

    chapter: "Laws of Motion",

    standard: "JEE 12th",

    dueDate: "23 Sep 2026",

    attachment: "Newton_Laws.pdf",

    status: "Assigned",

    batch: "JEE 12th",

    branch: "Pune Branch",

  },

  {

    id: "ASM002",

    title: "Organic Chemistry Questions",

    subject: "Chemistry",

    chapter: "Organic Chemistry",

    standard: "NEET 12th",

    dueDate: "25 Sep 2026",

    attachment: "Organic_Chemistry.pdf",

    status: "Pending",

    batch: "NEET 12th",

    branch: "Mumbai Branch",

  },

  {

    id: "ASM003",

    title: "Integration Worksheet",

    subject: "Mathematics",

    chapter: "Integration",

    standard: "JEE 12th",

    dueDate: "26 Sep 2026",

    attachment: "Integration.pdf",

    status: "Submitted",

    batch: "JEE 12th",

    branch: "Pune Branch",

  },

  {

    id: "ASM004",

    title: "Genetics Assignment",

    subject: "Biology",

    chapter: "Genetics",

    standard: "NEET 12th",

    dueDate: "21 Sep 2026",

    attachment: "Genetics.pdf",

    status: "Overdue",

    batch: "NEET 12th",

    branch: "Nashik Branch",

  },

  {

    id: "ASM005",

    title: "Electrostatics Problems",

    subject: "Physics",

    chapter: "Electrostatics",

    standard: "JEE 12th",

    dueDate: "28 Sep 2026",

    attachment: "Electrostatics.pdf",

    status: "Assigned",

    batch: "JEE 12th",

    branch: "Pune Branch",

  },

  {

    id: "ASM006",

    title: "Chemical Bonding Worksheet",

    subject: "Chemistry",

    chapter: "Chemical Bonding",

    standard: "NEET 12th",

    dueDate: "30 Sep 2026",

    attachment: "Chemical_Bonding.pdf",

    status: "Pending",

    batch: "NEET 12th",

    branch: "Main Branch",

  },

];



const filters = ["All", "Assigned", "Pending", "Submitted", "Overdue"];



export default function AssignmentPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;
  const isWide = width >= 900;



  const [assignments, setAssignments] =

    useState<Assignment[]>(initialAssignments);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const [selected, setSelected] = useState<Assignment | null>(null);

  const [viewVisible, setViewVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);



  const [editTitle, setEditTitle] = useState("");

  const [editChapter, setEditChapter] = useState("");

  const [editDueDate, setEditDueDate] = useState("");

  const [editAttachment, setEditAttachment] = useState("");

  const [editStatus, setEditStatus] =

    useState<AssignmentStatus>("Assigned");



  const openAddAssignment = () => {

    router.push("/(admin)/add-assignment" as never);

  };



  const handleView = (assignment: Assignment) => {

    setSelected(assignment);

    setViewVisible(true);

  };



  const handleEdit = (assignment: Assignment) => {

    setSelected(assignment);

    setEditTitle(assignment.title);

    setEditChapter(assignment.chapter);

    setEditDueDate(assignment.dueDate);

    setEditAttachment(assignment.attachment);

    setEditStatus(assignment.status);

    setEditVisible(true);

  };



  const saveEdit = () => {

    if (!selected) return;



    const updated: Assignment = {

      ...selected,

      title: editTitle.trim() || selected.title,

      chapter: editChapter.trim() || selected.chapter,

      dueDate: editDueDate.trim() || selected.dueDate,

      attachment: editAttachment.trim() || selected.attachment,

      status: editStatus,

    };



    setAssignments((current) =>

      current.map((item) => (item.id === updated.id ? updated : item)),

    );

    setSelected(updated);

    setEditVisible(false);

  };



  const filteredAssignments = useMemo(() => {

    const query = search.trim().toLowerCase();



    return assignments.filter((assignment) => {

      const matchesSearch =

        !query ||

        assignment.id.toLowerCase().includes(query) ||

        assignment.title.toLowerCase().includes(query) ||

        assignment.subject.toLowerCase().includes(query) ||

        assignment.chapter.toLowerCase().includes(query) ||

        assignment.standard.toLowerCase().includes(query) ||

        assignment.batch.toLowerCase().includes(query);



      const matchesFilter = filter === "All" || assignment.status === filter;



      return matchesSearch && matchesFilter;

    });

  }, [assignments, search, filter]);



  const statusStyle = (status: AssignmentStatus) => {

    switch (status) {

      case "Pending":

        return styles.statusPending;

      case "Submitted":

        return styles.statusSubmitted;

      case "Overdue":

        return styles.statusOverdue;

      default:

        return styles.statusAssigned;

    }

  };



  const statusTextStyle = (status: AssignmentStatus) => {

    switch (status) {

      case "Pending":

        return styles.statusPendingText;

      case "Submitted":

        return styles.statusSubmittedText;

      case "Overdue":

        return styles.statusOverdueText;

      default:

        return styles.statusAssignedText;

    }

  };



  return (
    <>
      <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, minHeight: insets.top + 66 },
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
            Assignments
          </Text>



          <TouchableOpacity

            style={[styles.addButton, isMobile && styles.addButtonMobile]}

            activeOpacity={0.85}

            onPress={openAddAssignment}

          >

            <Text style={styles.addPlus}>+</Text>

          </TouchableOpacity>

        </View>



        <ScrollView

          showsVerticalScrollIndicator={false}

          contentContainerStyle={styles.content}

        >

          <View style={styles.searchCard}>

            <View style={styles.searchWrapper}>

              <MaterialCommunityIcons

                name="magnify"

                size={22}

                color="#71819A"

              />

              <TextInput

                value={search}

                onChangeText={setSearch}

                placeholder="Search assignment, subject or batch..."

                placeholderTextColor="#9AA6B8"

                style={styles.searchInput}

              />

            </View>



            <ScrollView

              horizontal

              showsHorizontalScrollIndicator={false}

              contentContainerStyle={styles.filterRow}

            >

              {filters.map((item) => (

                <TouchableOpacity

                  key={item}

                  style={[

                    styles.filterButton,

                    filter === item && styles.filterButtonActive,

                  ]}

                  activeOpacity={0.8}

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

              ))}

            </ScrollView>

          </View>



          <View style={styles.listHeader}>

            <Text style={styles.listTitle}>Assignment List</Text>

            <Text style={styles.listSubtitle}>

              {filteredAssignments.length} assignments found

            </Text>

          </View>



          <View

            style={[

              styles.assignmentGrid,

              isWide && styles.assignmentGridWide,

            ]}

          >

            {filteredAssignments.map((assignment) => (

              <View

                key={assignment.id}

                style={[

                  styles.assignmentCard,

                  isWide && styles.assignmentCardWide,

                ]}

              >

                <View style={styles.cardTop}>

                  <View style={styles.assignmentIcon}>

                    <MaterialCommunityIcons

                      name="clipboard-text-outline"

                      size={25}

                      color="#7040D5"

                    />

                  </View>



                  <View style={styles.assignmentHeading}>

                    <Text style={styles.assignmentTitle} numberOfLines={1}>

                      {assignment.title}

                    </Text>

                    <Text style={styles.assignmentId}>{assignment.id}</Text>

                  </View>



                  <View style={[styles.statusBadge, statusStyle(assignment.status)]}>

                    <Text

                      style={[

                        styles.statusText,

                        statusTextStyle(assignment.status),

                      ]}

                    >

                      {assignment.status}

                    </Text>

                  </View>

                </View>



                <View style={styles.divider} />



                <View style={styles.detailsGrid}>

                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Subject</Text>

                    <Text style={styles.detailValue}>{assignment.subject}</Text>

                  </View>



                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Chapter</Text>

                    <Text style={styles.detailValue}>{assignment.chapter}</Text>

                  </View>



                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>STD</Text>

                    <Text style={styles.detailValue}>{assignment.standard}</Text>

                  </View>



                  <View style={styles.detailItem}>

                    <Text style={styles.detailLabel}>Due Date</Text>

                    <Text style={styles.detailValue}>{assignment.dueDate}</Text>

                  </View>



                  <View style={styles.detailItemFull}>

                    <Text style={styles.detailLabel}>Attachment / PDF</Text>

                    <Text style={styles.detailValue} numberOfLines={1}>

                      {assignment.attachment || "No attachment"}

                    </Text>

                  </View>

                </View>



                <View style={styles.cardActions}>

                  <TouchableOpacity

                    style={styles.editButton}

                    activeOpacity={0.8}

                    onPress={() => handleEdit(assignment)}

                  >

                    <MaterialCommunityIcons

                      name="pencil-outline"

                      size={17}

                      color="#7040D5"

                    />

                    <Text style={styles.editButtonText}>Edit</Text>

                  </TouchableOpacity>



                  <TouchableOpacity

                    style={styles.viewButton}

                    activeOpacity={0.85}

                    onPress={() => handleView(assignment)}

                  >

                    <MaterialCommunityIcons

                      name="eye-outline"

                      size={18}

                      color="#FFFFFF"

                    />

                    <Text style={styles.viewButtonText}>View</Text>

                  </TouchableOpacity>

                </View>

              </View>

            ))}

          </View>



          {filteredAssignments.length === 0 && (

            <View style={styles.emptyState}>

              <MaterialCommunityIcons

                name="clipboard-text-off-outline"

                size={44}

                color="#A5AEC0"

              />

              <Text style={styles.emptyTitle}>No assignments found</Text>

              <Text style={styles.emptyText}>

                Try changing the search or selected status.

              </Text>

            </View>

          )}

        </ScrollView>

      </View>



      {/* VIEW MODAL */}

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

                <Text style={styles.modalTitle}>Assignment Details</Text>

                <Text style={styles.modalSubtitle}>

                  Complete assignment information

                </Text>

              </View>

              <TouchableOpacity

                style={styles.modalClose}

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

              <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.modalProfile}>

                  <View style={styles.modalIcon}>

                    <MaterialCommunityIcons

                      name="clipboard-text-outline"

                      size={28}

                      color="#7040D5"

                    />

                  </View>

                  <View style={styles.modalProfileText}>

                    <Text style={styles.modalAssignmentTitle}>

                      {selected.title}

                    </Text>

                    <Text style={styles.modalId}>{selected.id}</Text>

                  </View>

                </View>



                <View style={styles.modalGrid}>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Subject</Text>

                    <Text style={styles.modalValue}>{selected.subject}</Text>

                  </View>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Chapter</Text>

                    <Text style={styles.modalValue}>{selected.chapter}</Text>

                  </View>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>STD</Text>

                    <Text style={styles.modalValue}>{selected.standard}</Text>

                  </View>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Due Date</Text>

                    <Text style={styles.modalValue}>{selected.dueDate}</Text>

                  </View>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Batch</Text>

                    <Text style={styles.modalValue}>{selected.batch}</Text>

                  </View>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Branch</Text>

                    <Text style={styles.modalValue}>{selected.branch}</Text>

                  </View>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Status</Text>

                    <Text style={styles.modalValue}>{selected.status}</Text>

                  </View>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Attachment</Text>

                    <Text style={styles.modalValue}>

                      {selected.attachment || "No attachment"}

                    </Text>

                  </View>

                </View>

              </ScrollView>

            )}

          </View>

        </View>

      </Modal>



      {/* EDIT MODAL */}

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

                <Text style={styles.modalTitle}>Edit Assignment</Text>

                <Text style={styles.modalSubtitle}>

                  Update assignment information

                </Text>

              </View>

              <TouchableOpacity

                style={styles.modalClose}

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

              <Text style={styles.modalFieldLabel}>Assignment Title</Text>

              <TextInput

                value={editTitle}

                onChangeText={setEditTitle}

                style={styles.modalInput}

                placeholder="Assignment title"

                placeholderTextColor="#9AA2B1"

              />



              <Text style={styles.modalFieldLabel}>Chapter</Text>

              <TextInput

                value={editChapter}

                onChangeText={setEditChapter}

                style={styles.modalInput}

                placeholder="Chapter"

                placeholderTextColor="#9AA2B1"

              />



              <Text style={styles.modalFieldLabel}>Due Date</Text>

              <TextInput

                value={editDueDate}

                onChangeText={setEditDueDate}

                style={styles.modalInput}

                placeholder="Due date"

                placeholderTextColor="#9AA2B1"

              />



              <Text style={styles.modalFieldLabel}>Attachment / PDF</Text>

              <TextInput

                value={editAttachment}

                onChangeText={setEditAttachment}

                style={styles.modalInput}

                placeholder="Attachment"

                placeholderTextColor="#9AA2B1"

              />



              <Text style={styles.modalFieldLabel}>Status</Text>

              <View style={styles.modalStatusRow}>

                {(["Assigned", "Pending", "Submitted", "Overdue"] as AssignmentStatus[]).map(

                  (status) => (

                    <TouchableOpacity

                      key={status}

                      style={[

                        styles.modalStatusButton,

                        editStatus === status && styles.modalStatusButtonActive,

                      ]}

                      onPress={() => setEditStatus(status)}

                    >

                      <Text

                        style={[

                          styles.modalStatusText,

                          editStatus === status &&

                            styles.modalStatusTextActive,

                        ]}

                      >

                        {status}

                      </Text>

                    </TouchableOpacity>

                  ),

                )}

              </View>



              <TouchableOpacity

                style={styles.saveEditButton}

                activeOpacity={0.85}

                onPress={saveEdit}

              >

                <MaterialCommunityIcons

                  name="content-save-outline"

                  size={18}

                  color="#FFFFFF"

                />

                <Text style={styles.saveEditText}>Save Changes</Text>

              </TouchableOpacity>

            </ScrollView>

          </View>

        </View>

      </Modal>

      </SafeAreaView>
    </>
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
  addPlus: {

    fontFamily: "PoppinsRegular",

    fontSize: 27,

    lineHeight: 30,

    color: "#7040D5",

    marginTop: -1,

  },

  content: {

    paddingHorizontal: 16,

    paddingTop: 14,

    paddingBottom: 22,

  },

  searchCard: {

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    padding: 12,

    borderWidth: 1,

    borderColor: "#ECEEF4",

    marginBottom: 16,

  },

  searchWrapper: {

    height: 46,

    borderWidth: 1,

    borderColor: "#E4E7EF",

    borderRadius: 12,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

  },

  searchInput: {

    flex: 1,

    marginLeft: 10,

    fontFamily: "PoppinsRegular",

    fontSize: 12,

    color: "#263047",

  },

  filterRow: {

    gap: 7,

    paddingTop: 9,

  },

  filterButton: {

    minWidth: 68,

    height: 38,

    paddingHorizontal: 13,

    borderRadius: 10,

    backgroundColor: "#F7F8FC",

    borderWidth: 1,

    borderColor: "#E8EAF1",

    alignItems: "center",

    justifyContent: "center",

  },

  filterButtonActive: {

    backgroundColor: "#7040D5",

    borderColor: "#7040D5",

  },

  filterText: {

    fontFamily: "PoppinsMedium",

    fontSize: 10.5,

    color: "#718099",

  },

  filterTextActive: { color: "#FFFFFF" },

  listHeader: { marginBottom: 11 },

  listTitle: {

    fontFamily: "PoppinsSemiBold",

    fontSize: 18,

    color: "#202A3D",

  },

  listSubtitle: {

    fontFamily: "PoppinsRegular",

    fontSize: 10,

    color: "#8994A7",

    marginTop: 2,

  },

  assignmentGrid: {

    width: "100%",

  },

  assignmentGridWide: {

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

  },

  assignmentCard: {

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    padding: 13,

    marginBottom: 9,

    borderWidth: 1,

    borderColor: "#ECEEF4",

  },

  assignmentCardWide: {

    width: "48.8%",

  },

  cardTop: {

    flexDirection: "row",

    alignItems: "center",

  },

  assignmentIcon: {

    width: 44,

    height: 44,

    borderRadius: 12,

    backgroundColor: "#F0E8FF",

    alignItems: "center",

    justifyContent: "center",

  },

  assignmentHeading: {

    flex: 1,

    marginLeft: 9,

    minWidth: 0,

  },

  assignmentTitle: {

    fontFamily: "PoppinsSemiBold",

    fontSize: 13,

    color: "#202A3D",

  },

  assignmentId: {

    fontFamily: "PoppinsRegular",

    fontSize: 10,

    color: "#8994A7",

    marginTop: 2,

  },

  statusBadge: {

    minWidth: 68,

    height: 28,

    paddingHorizontal: 9,

    borderRadius: 10,

    alignItems: "center",

    justifyContent: "center",

    marginLeft: 7,

  },

  statusText: {

    fontFamily: "PoppinsMedium",

    fontSize: 10,

  },

  statusAssigned: { backgroundColor: "#F0E8FF" },

  statusAssignedText: { color: "#7040D5" },

  statusPending: { backgroundColor: "#FFF1E2" },

  statusPendingText: { color: "#F28A12" },

  statusSubmitted: { backgroundColor: "#E8F8F0" },

  statusSubmittedText: { color: "#16A36B" },

  statusOverdue: { backgroundColor: "#FFE8EF" },

  statusOverdueText: { color: "#E83D69" },

  divider: {

    height: 1,

    backgroundColor: "#ECEEF4",

    marginVertical: 11,

  },

  detailsGrid: {

    flexDirection: "row",

    flexWrap: "wrap",

    columnGap: 18,

    rowGap: 9,

  },

  detailItem: {

    width: "46%",

    marginBottom: 0,

    minWidth: 120,

  },

  detailItemFull: {

    width: "100%",

    marginBottom: 0,

    marginTop: 2,

  },

  detailLabel: {

    fontFamily: "PoppinsRegular",

    fontSize: 9,

    color: "#8B98AC",

    marginBottom: 3,

  },

  detailValue: {

    fontFamily: "PoppinsMedium",

    fontSize: 11,

    color: "#263047",

  },

  cardActions: {

    flexDirection: "row",

    justifyContent: "flex-end",

    gap: 7,

    marginTop: 10,

    paddingTop: 9,

    borderTopWidth: 1,

    borderTopColor: "#EEF0F5",

  },

  editButton: {

    minWidth: 70,

    height: 34,

    paddingHorizontal: 11,

    borderRadius: 10,

    backgroundColor: "#F7F3FF",

    borderWidth: 1,

    borderColor: "#DCCBFF",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

  },

  editButtonText: {

    fontFamily: "PoppinsMedium",

    fontSize: 10.5,

    color: "#7040D5",

    marginLeft: 7,

  },

  viewButton: {

    minWidth: 74,

    height: 34,

    paddingHorizontal: 11,

    borderRadius: 10,

    backgroundColor: "#7040D5",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

  },

  viewButtonText: {

    fontFamily: "PoppinsMedium",

    fontSize: 10.5,

    color: "#FFFFFF",

    marginLeft: 7,

  },

  emptyState: {

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    padding: 28,

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#ECEEF4",

  },

  emptyTitle: {

    fontFamily: "PoppinsSemiBold",

    fontSize: 15,

    color: "#263047",

    marginTop: 10,

  },

  emptyText: {

    fontFamily: "PoppinsRegular",

    fontSize: 11,

    color: "#8994A7",

    marginTop: 4,

  },

  modalOverlay: {

    flex: 1,

    backgroundColor: "rgba(17,24,39,0.45)",

    alignItems: "center",

    justifyContent: "center",

    padding: 20,

  },

  modalCard: {

    width: "100%",

    maxWidth: 650,

    maxHeight: "88%",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 20,

  },

  modalHeader: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 18,

  },

  modalTitle: {

    fontFamily: "PoppinsSemiBold",

    fontSize: 17,

    color: "#202A3D",

  },

  modalSubtitle: {

    fontFamily: "PoppinsRegular",

    fontSize: 10,

    color: "#8994A7",

    marginTop: 2,

  },

  modalClose: {

    width: 36,

    height: 36,

    borderRadius: 10,

    backgroundColor: "#F4F5F8",

    alignItems: "center",

    justifyContent: "center",

  },

  modalProfile: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 18,

  },

  modalIcon: {

    width: 52,

    height: 52,

    borderRadius: 14,

    backgroundColor: "#F0E8FF",

    alignItems: "center",

    justifyContent: "center",

  },

  modalProfileText: {

    flex: 1,

    marginLeft: 12,

  },

  modalAssignmentTitle: {

    fontFamily: "PoppinsSemiBold",

    fontSize: 15,

    color: "#202A3D",

  },

  modalId: {

    fontFamily: "PoppinsRegular",

    fontSize: 10,

    color: "#8994A7",

    marginTop: 2,

  },

  modalGrid: {

    flexDirection: "row",

    flexWrap: "wrap",

    gap: 10,

  },

  modalDetailBox: {

    width: "48.5%",

    backgroundColor: "#F8F9FC",

    borderRadius: 11,

    padding: 12,

  },

  modalLabel: {

    fontFamily: "PoppinsRegular",

    fontSize: 9.5,

    color: "#8994A7",

  },

  modalValue: {

    fontFamily: "PoppinsMedium",

    fontSize: 11.5,

    color: "#263047",

    marginTop: 3,

  },

  modalFieldLabel: {

    fontFamily: "PoppinsMedium",

    fontSize: 10.5,

    color: "#58657A",

    marginBottom: 6,

    marginTop: 5,

  },

  modalInput: {

    minHeight: 46,

    borderWidth: 1,

    borderColor: "#E2E5ED",

    borderRadius: 11,

    paddingHorizontal: 12,

    fontFamily: "PoppinsRegular",

    fontSize: 11.5,

    color: "#263047",

    marginBottom: 10,

  },

  modalStatusRow: {

    flexDirection: "row",

    flexWrap: "wrap",

    gap: 7,

    marginBottom: 16,

  },

  modalStatusButton: {

    paddingHorizontal: 12,

    minHeight: 36,

    borderRadius: 9,

    backgroundColor: "#F7F8FC",

    borderWidth: 1,

    borderColor: "#E2E5ED",

    alignItems: "center",

    justifyContent: "center",

  },

  modalStatusButtonActive: {

    backgroundColor: "#7040D5",

    borderColor: "#7040D5",

  },

  modalStatusText: {

    fontFamily: "PoppinsMedium",

    fontSize: 9.5,

    color: "#718099",

  },

  modalStatusTextActive: { color: "#FFFFFF" },

  saveEditButton: {

    minHeight: 46,

    borderRadius: 11,

    backgroundColor: "#7040D5",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 5,

    marginBottom: 5,

  },

  saveEditText: {

    fontFamily: "PoppinsSemiBold",

    fontSize: 11,

    color: "#FFFFFF",

    marginLeft: 8,

  },

});
