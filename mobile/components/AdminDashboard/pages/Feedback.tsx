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

type FeedbackStatus = "New" | "Reviewed";
type Feedback = {
  id: string;
  subject: string;
  student: string;
  category: string;
  date: string;
  rating: number;
  comments: string;
  status: FeedbackStatus;
};

const initialData: Feedback[] = [
  {
    id: "FDB001",
    subject: "Physics",
    student: "Aarav Patil",
    category: "Teaching",
    date: "18 Sep 2026",
    rating: 5,
    comments: "Clear explanation and useful examples.",
    status: "Reviewed",
  },
  {
    id: "FDB002",
    subject: "Mathematics",
    student: "Ananya Joshi",
    category: "Teaching",
    date: "19 Sep 2026",
    rating: 4,
    comments: "Good explanation with helpful practice questions.",
    status: "New",
  },
  {
    id: "FDB003",
    subject: "Chemistry",
    student: "Rohan Deshmukh",
    category: "Teaching",
    date: "20 Sep 2026",
    rating: 5,
    comments: "Very interactive and easy to understand.",
    status: "Reviewed",
  },
  {
    id: "FDB004",
    subject: "Biology",
    student: "Sneha Kulkarni",
    category: "Course Content",
    date: "21 Sep 2026",
    rating: 4,
    comments: "Study material was useful and well organised.",
    status: "New",
  },
];

const statusStyle: Record<FeedbackStatus, { bg: string; text: string }> = {
  Reviewed: { bg: "#E7F8F0", text: "#13A968" },
  New: { bg: "#E7F8F0", text: "#13A968" },
};

export default function FeedbackPage() {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | FeedbackStatus>("All");
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [subject, setSubject] = useState("");
  const [student, setStudent] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [rating, setRating] = useState("5");
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("New");

  const openAdd = () => router.push("/(admin)/add-feedback" as never);

  const openEdit = (item: Feedback) => {
    setSelected(item);
    setSubject(item.subject);
    setStudent(item.student);
    setCategory(item.category);
    setDate(item.date);
    setRating(String(item.rating));
    setComments(item.comments);
    setStatus(item.status);
    setEditVisible(true);
  };

  const saveEdit = () => {
    const numericRating = Number(rating);
    if (
      !selected ||
      !subject.trim() ||
      !student.trim() ||
      !category.trim() ||
      !date.trim() ||
      !comments.trim() ||
      ![1, 2, 3, 4, 5].includes(numericRating)
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all feedback details and select a rating from 1 to 5.",
      );
      return;
    }
    const updated = {
      ...selected,
      subject: subject.trim(),
      student: student.trim(),
      category: category.trim(),
      date: date.trim(),
      rating: numericRating,
      comments: comments.trim(),
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
          x.subject.toLowerCase().includes(q) ||
          x.student.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q) ||
          x.comments.toLowerCase().includes(q)) &&
        (filter === "All" || x.status === filter),
    );
  }, [data, search, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color="#FFF"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Feedback</Text>
          </View>
          <TouchableOpacity
            style={styles.plus}
            onPress={openAdd}
            activeOpacity={0.85}
          >
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.pageTitle}>Feedback</Text>
          <Text style={styles.subtitle}>
            View and manage student feedback for your assigned branch
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
                placeholder="Search feedback..."
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
            {(["All", "New", "Reviewed"] as const).map((item) => (
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
            ))}
          </ScrollView>

          {filtered.map((item) => {
            const c = statusStyle[item.status];
            return (
              <View style={styles.card} key={item.id}>
                <View style={styles.cardTop}>
                  <View style={styles.identity}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons
                        name="message-star-outline"
                        size={25}
                        color="#7040D5"
                      />
                    </View>
                    <View style={styles.titleBox}>
                      <Text style={styles.title}>{item.subject}</Text>
                      <Text style={styles.id}>
                        {item.id} • {item.student}
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
                    <Text style={styles.label}>Student</Text>
                    <Text style={styles.value}>{item.student}</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.label}>Subject</Text>
                    <Text style={styles.value}>{item.subject}</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.label}>Category</Text>
                    <Text style={styles.value}>{item.category}</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{item.date}</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.label}>Rating</Text>
                    <Text style={styles.value}>{item.rating} / 5</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.label}>Comments</Text>
                    <Text style={styles.value}>{item.comments}</Text>
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
                name="message-star-outline"
                size={38}
                color="#A1A9B7"
              />
              <Text style={styles.emptyTitle}>No feedback found</Text>
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
                  <Text style={styles.modalTitle}>Feedback Details</Text>
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
                  <Text style={styles.modalName}>{selected.subject}</Text>
                  <Text style={styles.modalSub}>
                    {selected.student} • {selected.category}
                  </Text>
                  <View style={styles.modalGrid}>
                    {[
                      ["Date", selected.date],
                      ["Rating", `${selected.rating} / 5`],
                      ["Comments", selected.comments],
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
                    <Text style={styles.modalEditText}>Edit Feedback</Text>
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
                  <Text style={styles.modalTitle}>Edit Feedback</Text>
                  <Text style={styles.modalSub}>
                    Update feedback information
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
                  ["Subject", subject, setSubject],
                  ["Student", student, setStudent],
                  ["Category", category, setCategory],
                  ["Date", date, setDate],
                  ["Comments", comments, setComments],
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

                <Text style={styles.inputLabel}>Rating</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[
                        styles.ratingButton,
                        Number(rating) === n && styles.ratingActive,
                      ]}
                      onPress={() => setRating(String(n))}
                    >
                      <MaterialCommunityIcons
                        name={Number(rating) >= n ? "star" : "star-outline"}
                        size={18}
                        color={Number(rating) >= n ? "#7040D5" : "#9BA5B5"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.options}>
                  {(["New", "Reviewed"] as FeedbackStatus[]).map((s) => (
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
    minHeight: 60,
    backgroundColor: "#7040D5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  back: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  headerTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#FFF" },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    fontSize: 25,
    color: "#7040D5",
    fontFamily: "PoppinsRegular",
    lineHeight: 32,
    marginTop: -2,
  },
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
    padding: 14,
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
  ratingRow: { flexDirection: "row", marginBottom: 12 },
  ratingButton: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E5E7EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  ratingActive: { backgroundColor: "#F0E8FF", borderColor: "#7040D5" },
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
    borderRadius: 10,
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
