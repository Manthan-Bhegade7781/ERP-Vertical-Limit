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

type Grade = "Excellent" | "Good" | "Average" | "Needs Improvement";
type PerformanceRecord = {
  id: string;
  name: string;
  subject: string;
  standard: string;
  exam: string;
  marks: string;
  percentage: string;
  grade: Grade;
};

const initial: PerformanceRecord[] = [
  {
    id: "STU001",
    name: "Aarav Sharma",
    subject: "Physics",
    standard: "JEE 12th",
    exam: "Unit Test 1",
    marks: "92 / 100",
    percentage: "92%",
    grade: "Excellent",
  },
  {
    id: "STU002",
    name: "Ananya Patil",
    subject: "Chemistry",
    standard: "NEET 12th",
    exam: "Unit Test 1",
    marks: "84 / 100",
    percentage: "84%",
    grade: "Good",
  },
  {
    id: "STU003",
    name: "Rohan Deshmukh",
    subject: "Mathematics",
    standard: "JEE 12th",
    exam: "Unit Test 1",
    marks: "78 / 100",
    percentage: "78%",
    grade: "Good",
  },
  {
    id: "STU004",
    name: "Sneha Kulkarni",
    subject: "Biology",
    standard: "NEET 12th",
    exam: "Unit Test 1",
    marks: "68 / 100",
    percentage: "68%",
    grade: "Average",
  },
  {
    id: "STU005",
    name: "Vedant Joshi",
    subject: "Physics",
    standard: "JEE 11th",
    exam: "Chapter Test",
    marks: "58 / 100",
    percentage: "58%",
    grade: "Needs Improvement",
  },
  {
    id: "STU006",
    name: "Isha More",
    subject: "Mathematics",
    standard: "MHT-CET 12th",
    exam: "Unit Test 1",
    marks: "91 / 100",
    percentage: "91%",
    grade: "Excellent",
  },
];

const gradeStyle: Record<Grade, { bg: string; text: string }> = {
  Excellent: { bg: "#F0E8FF", text: "#7040D5" },
  Good: { bg: "#EAF2FF", text: "#2675E8" },
  Average: { bg: "#FFF1E2", text: "#F28A17" },
  "Needs Improvement": { bg: "#FFE9EC", text: "#E84D61" },
};

export default function PerformancePage() {
  const router = useRouter();
  const [data, setData] = useState<PerformanceRecord[]>(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Grade>("All");
  const [selected, setSelected] = useState<PerformanceRecord | null>(null);
  const [view, setView] = useState(false);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(""),
    [subject, setSubject] = useState(""),
    [standard, setStandard] = useState(""),
    [exam, setExam] = useState(""),
    [marks, setMarks] = useState(""),
    [percentage, setPercentage] = useState(""),
    [grade, setGrade] = useState<Grade>("Good");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return data.filter(
      (x) =>
        (!q ||
          [x.id, x.name, x.subject, x.standard, x.exam].some((v) =>
            v.toLowerCase().includes(q),
          )) &&
        (filter === "All" || x.grade === filter),
    );
  }, [data, search, filter]);
  const openAdd = () => {
    router.push({
      pathname: "/(admin)/add-performance",
    } as never);
  };
  const openEdit = (x: PerformanceRecord) => {
    setSelected(x);
    setName(x.name);
    setSubject(x.subject);
    setStandard(x.standard);
    setExam(x.exam);
    setMarks(x.marks);
    setPercentage(x.percentage);
    setGrade(x.grade);
    setEdit(true);
  };
  const saveEdit = () => {
    if (!selected) return;
    if (
      !name.trim() ||
      !subject.trim() ||
      !standard.trim() ||
      !exam.trim() ||
      !marks.trim() ||
      !percentage.trim()
    ) {
      Alert.alert("Required Fields", "Please fill all performance details.");
      return;
    }
    const u = {
      ...selected,
      name: name.trim(),
      subject: subject.trim(),
      standard: standard.trim(),
      exam: exam.trim(),
      marks: marks.trim(),
      percentage: percentage.trim(),
      grade,
    };
    setData((d) => d.map((x) => (x.id === u.id ? u : x)));
    setSelected(u);
    setEdit(false);
  };

  const card = (x: PerformanceRecord) => {
    const c = gradeStyle[x.grade];
    return (
      <View key={x.id} style={s.card}>
        <View style={s.top}>
          <View style={s.identity}>
            <View style={s.avatar}>
              <MaterialCommunityIcons
                name="account-outline"
                size={25}
                color="#7040D5"
              />
            </View>
            <View>
              <Text style={s.name}>{x.name}</Text>
              <Text style={s.id}>{x.id}</Text>
            </View>
          </View>
          <View style={[s.badge, { backgroundColor: c.bg }]}>
            <Text style={[s.badgeText, { color: c.text }]}>{x.grade}</Text>
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.grid}>
          {[
            ["Subject", x.subject],
            ["STD", x.standard],
            ["Exam / Test", x.exam],
            ["Marks", x.marks],
            ["Percentage", x.percentage],
            [
              "Grade",
              x.grade === "Excellent"
                ? "A+"
                : x.grade === "Good"
                  ? "A"
                  : x.grade === "Average"
                    ? "B"
                    : "Needs Improvement",
            ],
          ].map(([l, v]) => (
            <View key={l} style={s.item}>
              <Text style={s.label}>{l}</Text>
              <Text style={s.value}>{v}</Text>
            </View>
          ))}
        </View>
        <View style={s.actions}>
          <TouchableOpacity style={s.editBtn} onPress={() => openEdit(x)}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={17}
              color="#7040D5"
            />
            <Text style={s.editTxt}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.viewBtn}
            onPress={() => {
              setSelected(x);
              setView(true);
            }}
          >
            <MaterialCommunityIcons name="eye-outline" size={18} color="#FFF" />
            <Text style={s.viewTxt}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={["left", "right"]}>
      <View style={s.container}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <TouchableOpacity style={s.back} onPress={() => router.back()}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color="#FFF"
              />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Performance</Text>
          </View>
          <TouchableOpacity
            style={s.add}
            activeOpacity={0.8}
            onPress={openAdd}
            accessibilityRole="button"
            accessibilityLabel="Add Performance"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.plus}>+</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.searchCard}>
            <View style={s.search}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#8994A7"
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search student, subject, exam..."
                placeholderTextColor="#A0A9B8"
                style={s.searchInput}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filters}
            >
              {(
                [
                  "All",
                  "Excellent",
                  "Good",
                  "Average",
                  "Needs Improvement",
                ] as const
              ).map((x) => (
                <TouchableOpacity
                  key={x}
                  onPress={() => setFilter(x)}
                  style={[s.filter, filter === x && s.filterActive]}
                >
                  <Text
                    style={[s.filterText, filter === x && s.filterTextActive]}
                  >
                    {x}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <Text style={s.recordsTitle}>Performance Records</Text>
          <Text style={s.recordsSub}>{filtered.length} records found</Text>
          <View style={s.cards}>
            {filtered.map(card)}
          </View>
        </ScrollView>

        <Modal
          visible={view}
          transparent
          animationType="fade"
          onRequestClose={() => setView(false)}
        >
          <View style={s.overlay}>
            <View style={s.modal}>
              <View style={s.modalHead}>
                <View>
                  <Text style={s.modalTitle}>Performance Details</Text>
                  <Text style={s.modalSub}>{selected?.id}</Text>
                </View>
                <TouchableOpacity
                  style={s.close}
                  onPress={() => setView(false)}
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
                  <Text style={s.modalName}>{selected.name}</Text>
                  <View style={s.modalGrid}>
                    {[
                      ["Subject", selected.subject],
                      ["STD", selected.standard],
                      ["Exam / Test", selected.exam],
                      ["Marks", selected.marks],
                      ["Percentage", selected.percentage],
                      ["Grade", selected.grade],
                    ].map(([l, v]) => (
                      <View key={l} style={s.modalItem}>
                        <Text style={s.label}>{l}</Text>
                        <Text style={s.value}>{v}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={s.modalEdit}
                    onPress={() => {
                      setView(false);
                      openEdit(selected);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color="#FFF"
                    />
                    <Text style={s.modalEditText}>Edit Performance</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={edit}
          transparent
          animationType="slide"
          onRequestClose={() => setEdit(false)}
        >
          <View style={s.overlay}>
            <View style={s.editModal}>
              <View style={s.modalHead}>
                <View>
                  <Text style={s.modalTitle}>Edit Performance</Text>
                  <Text style={s.modalSub}>Update performance information</Text>
                </View>
                <TouchableOpacity
                  style={s.close}
                  onPress={() => setEdit(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#66768A"
                  />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {[
                  ["Student Name", name, setName],
                  ["Subject", subject, setSubject],
                  ["STD", standard, setStandard],
                  ["Exam / Test", exam, setExam],
                  ["Marks", marks, setMarks],
                  ["Percentage", percentage, setPercentage],
                ].map(([l, v, set]) => (
                  <View key={l as string} style={s.field}>
                    <Text style={s.fieldLabel}>{l as string}</Text>
                    <TextInput
                      value={v as string}
                      onChangeText={set as any}
                      style={s.input}
                      placeholder={`Enter ${(l as string).toLowerCase()}`}
                      placeholderTextColor="#A0A9B8"
                    />
                  </View>
                ))}
                <Text style={s.fieldLabel}>Grade</Text>
                <View style={s.gradeOptions}>
                  {(
                    [
                      "Excellent",
                      "Good",
                      "Average",
                      "Needs Improvement",
                    ] as Grade[]
                  ).map((x) => (
                    <TouchableOpacity
                      key={x}
                      onPress={() => setGrade(x)}
                      style={[
                        s.gradeOption,
                        grade === x && s.gradeOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.gradeOptionText,
                          grade === x && s.gradeOptionTextActive,
                        ]}
                      >
                        {x}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.modalActions}>
                  <TouchableOpacity
                    style={s.cancel}
                    onPress={() => setEdit(false)}
                  >
                    <Text style={s.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.save} onPress={saveEdit}>
                    <MaterialCommunityIcons
                      name="content-save-outline"
                      size={18}
                      color="#FFF"
                    />
                    <Text style={s.saveText}>Save Changes</Text>
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FC" },
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  header: {
    minHeight: 68,
    backgroundColor: "#7040D5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  back: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: { fontFamily: "PoppinsSemiBold", fontSize: 22, color: "#FFF" },
  add: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  plus: {
    fontFamily: "PoppinsRegular",
    fontSize: 30,
    lineHeight: 32,
    color: "#7040D5",
  },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },
  searchCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8EAF0",
    marginBottom: 16,
  },
  search: {
    minHeight: 46,
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
  filters: { paddingTop: 9, gap: 7 },
  filter: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E8EF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterActive: { backgroundColor: "#7040D5", borderColor: "#7040D5" },
  filterText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#788397" },
  filterTextActive: { color: "#FFF" },
  recordsTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 19,
    color: "#202A3D",
  },
  recordsSub: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#7C879A",
    marginBottom: 10,
  },
  cards: {
    flexDirection: "column",
    gap: 9,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#ECEEF4",
    elevation: 2,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  identity: { flex: 1, flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  name: { fontFamily: "PoppinsSemiBold", fontSize: 14, color: "#202A3D" },
  id: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#9AA2B1",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    marginLeft: 8,
  },
  badgeText: { fontFamily: "PoppinsSemiBold", fontSize: 9.5 },
  divider: { height: 1, backgroundColor: "#EEF0F4", marginVertical: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  item: { width: "50%", marginBottom: 9 },
  label: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#8290A5",
    marginBottom: 3,
  },
  value: { fontFamily: "PoppinsRegular", fontSize: 11.5, color: "#2D374C" },
  actions: { flexDirection: "row", gap: 7, marginTop: 1 },
  editBtn: {
    flex: 1,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#FBF9FF",
    borderWidth: 1,
    borderColor: "#DCCBFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editTxt: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#7040D5",
    marginLeft: 6,
  },
  viewBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewTxt: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#FFF",
    marginLeft: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,20,32,0.48)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    maxHeight: "82%",
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
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  modalTitle: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D" },
  modalSub: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8B96A8",
    marginTop: 2,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalName: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#202A3D",
    marginBottom: 16,
  },
  modalGrid: { flexDirection: "row", flexWrap: "wrap" },
  modalItem: { width: "50%", paddingVertical: 9 },
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
  field: { marginBottom: 13 },
  fieldLabel: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#58657A",
    marginBottom: 6,
  },
  input: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: "#E1E4EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
  },
  gradeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  gradeOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E5E7EE",
  },
  gradeOptionActive: { backgroundColor: "#F0E8FF", borderColor: "#7040D5" },
  gradeOptionText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
    color: "#788397",
  },
  gradeOptionTextActive: { color: "#7040D5" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 9,
    paddingBottom: 5,
  },
  cancel: {
    minHeight: 45,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: "#FFF",
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
  save: {
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
    color: "#FFF",
    marginLeft: 7,
  },
});
