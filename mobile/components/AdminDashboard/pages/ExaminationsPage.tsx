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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type ExamStatus = "Scheduled" | "Ongoing" | "Completed" | "Cancelled";

type Examination = {
  id: string;
  name: string;
  subject: string;
  batch: string;
  branch: string;
  date: string;
  time: string;
  duration: string;
  totalMarks: string;
  status: ExamStatus;
};

const initialExaminations: Examination[] = [
  {
    id: "EXM001",
    name: "Unit Test 1",
    subject: "Physics",
    batch: "JEE 12th",
    branch: "Pune Branch",
    date: "22 Sep 2026",
    time: "10:00 AM",
    duration: "2 Hours",
    totalMarks: "100",
    status: "Scheduled",
  },
  {
    id: "EXM002",
    name: "Mid Term Examination",
    subject: "Mathematics",
    batch: "JEE 12th",
    branch: "Pune Branch",
    date: "25 Sep 2026",
    time: "10:00 AM",
    duration: "3 Hours",
    totalMarks: "100",
    status: "Scheduled",
  },
  {
    id: "EXM003",
    name: "Chemistry Practice Test",
    subject: "Chemistry",
    batch: "NEET 12th",
    branch: "Mumbai Branch",
    date: "28 Sep 2026",
    time: "11:00 AM",
    duration: "2 Hours",
    totalMarks: "100",
    status: "Scheduled",
  },
  {
    id: "EXM004",
    name: "Weekly Test",
    subject: "Biology",
    batch: "NEET 12th",
    branch: "Pune Branch",
    date: "18 Sep 2026",
    time: "9:00 AM",
    duration: "2 Hours",
    totalMarks: "100",
    status: "Ongoing",
  },
  {
    id: "EXM005",
    name: "Chapter Test",
    subject: "Physics",
    batch: "11th MHT-CET",
    branch: "Nashik Branch",
    date: "12 Sep 2026",
    time: "10:00 AM",
    duration: "90 Minutes",
    totalMarks: "80",
    status: "Completed",
  },
  {
    id: "EXM006",
    name: "Revision Test",
    subject: "Mathematics",
    batch: "10th Foundation",
    branch: "Main Branch",
    date: "10 Sep 2026",
    time: "2:00 PM",
    duration: "90 Minutes",
    totalMarks: "80",
    status: "Completed",
  },
];

const statusColors: Record<
  ExamStatus,
  { bg: string; text: string }
> = {
  Scheduled: { bg: "#EAF2FF", text: "#2675E8" },
  Ongoing: { bg: "#FFF1E2", text: "#F28A17" },
  Completed: { bg: "#E7F8EF", text: "#27A968" },
  Cancelled: { bg: "#FFE9EC", text: "#E84D61" },
};

export default function ExaminationPage() {
  const router = useRouter();

  const [examinations, setExaminations] =
    useState<Examination[]>(initialExaminations);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | ExamStatus
  >("All");

  const [selectedExam, setSelectedExam] =
    useState<Examination | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editBatch, setEditBatch] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editMarks, setEditMarks] = useState("");
  const [editStatus, setEditStatus] =
    useState<ExamStatus>("Scheduled");

  const filteredExaminations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return examinations.filter((exam) => {
      const matchesSearch =
        !query ||
        exam.id.toLowerCase().includes(query) ||
        exam.name.toLowerCase().includes(query) ||
        exam.subject.toLowerCase().includes(query) ||
        exam.batch.toLowerCase().includes(query) ||
        exam.branch.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || exam.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [examinations, search, filter]);

  const openAddExamination = () => {
    router.push("/(admin)/add-examination" as never);
  };

  const handleView = (exam: Examination) => {
    setSelectedExam(exam);
    setViewVisible(true);
  };

  const handleEdit = (exam: Examination) => {
    setSelectedExam(exam);
    setEditName(exam.name);
    setEditSubject(exam.subject);
    setEditBatch(exam.batch);
    setEditBranch(exam.branch);
    setEditDate(exam.date);
    setEditTime(exam.time);
    setEditDuration(exam.duration);
    setEditMarks(exam.totalMarks);
    setEditStatus(exam.status);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!selectedExam) return;

    if (
      !editName.trim() ||
      !editSubject.trim() ||
      !editBatch.trim() ||
      !editBranch.trim() ||
      !editDate.trim() ||
      !editTime.trim() ||
      !editDuration.trim() ||
      !editMarks.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all examination details.",
      );
      return;
    }

    const updated: Examination = {
      ...selectedExam,
      name: editName.trim(),
      subject: editSubject.trim(),
      batch: editBatch.trim(),
      branch: editBranch.trim(),
      date: editDate.trim(),
      time: editTime.trim(),
      duration: editDuration.trim(),
      totalMarks: editMarks.trim(),
      status: editStatus,
    };

    setExaminations((current) =>
      current.map((item) =>
        item.id === updated.id ? updated : item,
      ),
    );

    setSelectedExam(updated);
    setEditVisible(false);
  };

  const renderExamCard = (exam: Examination) => {
    const colors = statusColors[exam.status];

    return (
      <View key={exam.id} style={styles.examCard}>
        <View style={styles.examTop}>
          <View style={styles.examIdentity}>
            <View style={styles.examIcon}>
              <MaterialCommunityIcons
                name="file-document-edit-outline"
                size={24}
                color="#7040D5"
              />
            </View>
            <View style={styles.examIdentityText}>
              <Text style={styles.examName}>{exam.name}</Text>
              <Text style={styles.examId}>{exam.id}</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.bg },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: colors.text },
              ]}
            >
              {exam.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>SUBJECT</Text>
            <Text style={styles.detailValue}>{exam.subject}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>BATCH</Text>
            <Text style={styles.detailValue}>{exam.batch}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text style={styles.detailValue}>{exam.date}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>TIME</Text>
            <Text style={styles.detailValue}>{exam.time}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>DURATION</Text>
            <Text style={styles.detailValue}>{exam.duration}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>TOTAL MARKS</Text>
            <Text style={styles.detailValue}>{exam.totalMarks}</Text>
          </View>
        </View>

        <View style={styles.examActions}>
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={() => handleEdit(exam)}
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
            activeOpacity={0.8}
            onPress={() => handleView(exam)}
          >
            <MaterialCommunityIcons
              name="eye-outline"
              size={18}
              color="#7040D5"
            />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["left", "right"]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              Examinations
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={openAddExamination}
          >
            <Text style={styles.addPlus}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.pageTitle}>
            Examination Management
          </Text>
          <Text style={styles.pageSubtitle}>
            Manage examinations, subjects, batches, schedules and
            results.
          </Text>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#8994A7"
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search examination, subject or batch..."
                placeholderTextColor="#A0A9B8"
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {(
                [
                  "All",
                  "Scheduled",
                  "Ongoing",
                  "Completed",
                  "Cancelled",
                ] as const
              ).map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterButton,
                    filter === item &&
                      styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item &&
                        styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>
              Examination Records
            </Text>
            <Text style={styles.recordsSubtitle}>
              {filteredExaminations.length} examinations found
            </Text>
          </View>

          {filteredExaminations.map(renderExamCard)}
        </ScrollView>

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
                  <Text style={styles.modalTitle}>
                    Examination Details
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedExam?.id}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setViewVisible(false)}
                  style={styles.modalClose}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={21}
                    color="#596579"
                  />
                </TouchableOpacity>
              </View>

              {selectedExam && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalExamName}>
                    {selectedExam.name}
                  </Text>

                  <View style={styles.modalDetailGrid}>
                    {[
                      ["Subject", selectedExam.subject],
                      ["Batch", selectedExam.batch],
                      ["Branch", selectedExam.branch],
                      ["Date", selectedExam.date],
                      ["Time", selectedExam.time],
                      ["Duration", selectedExam.duration],
                      ["Total Marks", selectedExam.totalMarks],
                      ["Status", selectedExam.status],
                    ].map(([label, value]) => (
                      <View
                        key={label}
                        style={styles.modalDetail}
                      >
                        <Text style={styles.modalDetailLabel}>
                          {label}
                        </Text>
                        <Text style={styles.modalDetailValue}>
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.modalEditButton}
                    activeOpacity={0.85}
                    onPress={() => {
                      setViewVisible(false);
                      if (selectedExam) {
                        handleEdit(selectedExam);
                      }
                    }}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.modalEditText}>
                      Edit Examination
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* EDIT MODAL */}
        <Modal
          visible={editVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.editModalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Edit Examination
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedExam?.id}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setEditVisible(false)}
                  style={styles.modalClose}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={21}
                    color="#596579"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {[
                  ["Examination Name", editName, setEditName],
                  ["Subject", editSubject, setEditSubject],
                  ["Batch", editBatch, setEditBatch],
                  ["Branch", editBranch, setEditBranch],
                  ["Date", editDate, setEditDate],
                  ["Time", editTime, setEditTime],
                  ["Duration", editDuration, setEditDuration],
                  ["Total Marks", editMarks, setEditMarks],
                ].map(([label, value, setter]) => (
                  <View key={label as string} style={styles.editField}>
                    <Text style={styles.editLabel}>
                      {label as string}
                    </Text>
                    <TextInput
                      value={value as string}
                      onChangeText={setter as (value: string) => void}
                      style={styles.editInput}
                      placeholder={`Enter ${String(label).toLowerCase()}`}
                      placeholderTextColor="#A0A9B8"
                    />
                  </View>
                ))}

                <Text style={styles.editLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {(
                    [
                      "Scheduled",
                      "Ongoing",
                      "Completed",
                      "Cancelled",
                    ] as ExamStatus[]
                  ).map((item) => (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.8}
                      onPress={() => setEditStatus(item)}
                      style={[
                        styles.statusOption,
                        editStatus === item &&
                          styles.statusOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          editStatus === item &&
                            styles.statusOptionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveEdit}
                  >
                    <MaterialCommunityIcons
                      name="content-save-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.saveText}>
                      Save Changes
                    </Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  header: {
    minHeight: 68,
    backgroundColor: "#7040D5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
  },
  addPlus: {
    fontFamily: "PoppinsRegular",
    fontSize: 30,
    lineHeight: 32,
    color: "#7040D5",
    marginTop: -2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },
  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 19,
    color: "#172033",
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#7C879A",
    marginTop: 2,
    marginBottom: 14,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
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
    borderRadius: 12,
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
  filterRow: {
    paddingTop: 9,
    gap: 7,
  },
  filterButton: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E7E9F0",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },
  filterText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#788397",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  recordsHeader: {
    marginBottom: 11,
  },
  recordsTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 17,
    color: "#202A3D",
  },
  recordsSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#7C879A",
  },
  examCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#ECEEF4",
    elevation: 2,
  },
  examTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  examIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  examIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  examIdentityText: {
    flex: 1,
  },
  examName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#202A3D",
  },
  examId: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#9AA2B1",
    marginTop: 2,
  },
  statusBadge: {
    minWidth: 68,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF0F4",
    marginVertical: 11,
  },
  detailGrid: {
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
  detailLabel: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9,
    color: "#8A97AA",
    marginBottom: 3,
  },
  detailValue: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#39445A",
  },
  examActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 7,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F5",
    marginTop: 10,
  },
  editButton: {
    minWidth: 70,
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#F0E8FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#7040D5",
    marginLeft: 6,
  },
  viewButton: {
    minWidth: 74,
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#F0E8FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#7040D5",
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,20,32,0.48)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    maxHeight: "82%",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 20,
  },
  editModalCard: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  modalTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 17,
    color: "#202A3D",
  },
  modalSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8B96A8",
    marginTop: 2,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalExamName: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#202A3D",
    marginBottom: 16,
  },
  modalDetailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  modalDetail: {
    width: "50%",
    paddingVertical: 9,
  },
  modalDetailLabel: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9,
    color: "#8A97AA",
  },
  modalDetailValue: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#39445A",
    marginTop: 3,
  },
  modalEditButton: {
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
    color: "#FFFFFF",
    marginLeft: 7,
  },
  editField: {
    marginBottom: 13,
  },
  editLabel: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#58657A",
    marginBottom: 6,
  },
  editInput: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: "#E1E4EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 17,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E5E7EE",
  },
  statusOptionActive: {
    backgroundColor: "#F0E8FF",
    borderColor: "#7040D5",
  },
  statusOptionText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
    color: "#788397",
  },
  statusOptionTextActive: {
    color: "#7040D5",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 9,
    paddingTop: 3,
    paddingBottom: 5,
  },
  cancelButton: {
    minHeight: 45,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDFE7",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#687388",
  },
  saveButton: {
    minHeight: 45,
    paddingHorizontal: 19,
    borderRadius: 11,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#FFFFFF",
    marginLeft: 7,
  },
});
