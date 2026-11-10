import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type FeedbackStatus = "New" | "Reviewed";

type Feedback = {
  _id: string;
  subject: string;
  student: string;
  branch: string;
  category: string;
  date: string;
  rating: number;
  comments: string;
  status: FeedbackStatus;
};

type FeedbackApiItem = {
  _id: string;
  subject: string;
  category: string;
  rating: number;
  comments: string;
  status: FeedbackStatus;
  createdAt: string;
  studentId?: {
    fullName?: string;
    email?: string;
  } | null;
  branchId?: {
    branchName?: string;
    name?: string;
  } | string | null;
};

type FeedbackResponse = {
  success: boolean;
  message?: string;
  data?: FeedbackApiItem[];
};

const statusStyle: Record<FeedbackStatus, { bg: string; text: string }> = {
  Reviewed: { bg: "#E7F8F0", text: "#13A968" },
  New: { bg: "#FFF4E5", text: "#D98512" },
};

export default function SuperAdminFeedbackPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [data, setData] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | FeedbackStatus>("All");
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadFeedback = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert("Session expired", "Please log in again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: FeedbackResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load feedback.");
      }

      const feedbackRows: Feedback[] = (result.data ?? []).map((item) => ({
        _id: item._id,
        subject: item.subject,
        student:
          item.studentId?.fullName ||
          item.studentId?.email ||
          "Student",
        branch:
          typeof item.branchId === "object" && item.branchId
            ? item.branchId.branchName || item.branchId.name || "—"
            : "—",
        category: item.category,
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "—",
        rating: item.rating,
        comments: item.comments,
        status: item.status,
      }));

      setData(feedbackRows);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not load feedback."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const markReviewed = async (item: Feedback) => {
    if (item.status === "Reviewed") return;

    try {
      setActionLoading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert("Session expired", "Please log in again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/feedback/${item._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "Reviewed" }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not update feedback status.");
      }

      await loadFeedback();

      setSelected((current) =>
        current?._id === item._id
          ? { ...current, status: "Reviewed" }
          : current
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Could not update feedback status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteFeedback = (item: Feedback) => {
    Alert.alert(
      "Delete feedback",
      "Are you sure you want to delete this feedback?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);

              const token = await getToken();

              if (!token) {
                Alert.alert("Session expired", "Please log in again.");
                return;
              }

              const response = await fetch(
                `${API_BASE_URL}/feedback/${item._id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const result = await response.json();

              if (!response.ok || !result.success) {
                throw new Error(result.message || "Could not delete feedback.");
              }

              setData((current) =>
                current.filter((feedback) => feedback._id !== item._id)
              );
              setViewVisible(false);
              setSelected(null);
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Could not delete feedback."
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.filter(
      (item) =>
        (!query ||
          item._id.toLowerCase().includes(query) ||
          item.subject.toLowerCase().includes(query) ||
          item.student.toLowerCase().includes(query) ||
          item.branch.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.comments.toLowerCase().includes(query)) &&
        (filter === "All" || item.status === filter)
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
          <TouchableOpacity
            style={[styles.back, isMobile && styles.backMobile]}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>

          <Text
            style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}
            numberOfLines={1}
          >
            Feedback
          </Text>

          <TouchableOpacity
            style={[styles.plus, isMobile && styles.plusMobile]}
            onPress={loadFeedback}
            activeOpacity={0.85}
            disabled={loading}
          >
            <MaterialCommunityIcons name="refresh" size={22} color="#7040D5" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.pageTitle}>Feedback</Text>
          <Text style={styles.subtitle}>
            View and manage student feedback across all branches
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

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#7040D5" />
              <Text style={styles.loadingText}>Loading feedback...</Text>
            </View>
          ) : (
            <>
              {filtered.map((item) => {
                const badge = statusStyle[item.status];

                return (
                  <View style={styles.card} key={item._id}>
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
                          <Text style={styles.id} numberOfLines={1}>
                            {item.student}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[styles.badge, { backgroundColor: badge.bg }]}
                      >
                        <Text style={[styles.badgeText, { color: badge.text }]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.grid}>
                      <Detail label="Student" value={item.student} />
                      <Detail label="Branch" value={item.branch} />
                      <Detail label="Subject" value={item.subject} />
                      <Detail label="Category" value={item.category} />
                      <Detail label="Date" value={item.date} />
                      <Detail label="Rating" value={`${item.rating} / 5`} />
                      <Detail label="Comments" value={item.comments} />
                      <Detail label="Status" value={item.status} />
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[
                          styles.editButton,
                          item.status === "Reviewed" && styles.disabledButton,
                        ]}
                        onPress={() => markReviewed(item)}
                        disabled={item.status === "Reviewed" || actionLoading}
                      >
                        <MaterialCommunityIcons
                          name="check-circle-outline"
                          size={17}
                          color="#FFF"
                        />
                        <Text style={styles.editText}>
                          {item.status === "Reviewed"
                            ? "Reviewed"
                            : "Mark Reviewed"}
                        </Text>
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
            </>
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
                  <Text style={styles.modalSub}>{selected?._id}</Text>
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
                      ["Student", selected.student],
                      ["Branch", selected.branch],
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

                  <View style={styles.modalActions}>
                    {selected.status === "New" && (
                      <TouchableOpacity
                        style={styles.modalReviewed}
                        onPress={() => markReviewed(selected)}
                        disabled={actionLoading}
                      >
                        <MaterialCommunityIcons
                          name="check-circle-outline"
                          size={18}
                          color="#FFF"
                        />
                        <Text style={styles.modalEditText}>Mark Reviewed</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.modalDelete}
                      onPress={() => deleteFeedback(selected)}
                      disabled={actionLoading}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={18}
                        color="#FFF"
                      />
                      <Text style={styles.modalEditText}>Delete Feedback</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FC" },
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  header: { width: "100%", backgroundColor: "#6D35D8", paddingHorizontal: 18, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  headerMobile: { height: 80, paddingHorizontal: 14 },
  headerTablet: { height: 64, paddingHorizontal: 20 },
  back: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  backMobile: { width: 36, height: 36, borderRadius: 10, marginRight: 12 },
  headerTitle: { flex: 1, fontFamily: "PoppinsSemiBold", fontSize: 20, lineHeight: 26, color: "#FFFFFF", textAlign: "left" },
  headerTitleMobile: { fontSize: 20 },
  plus: { width: 40, height: 40, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  plusMobile: { width: 40, height: 40, borderRadius: 11 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },
  pageTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#172033" },
  subtitle: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#7C879A", marginTop: 2, marginBottom: 14 },
  searchCard: { backgroundColor: "#FFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E8EAF0", marginBottom: 16 },
  searchBox: { height: 46, borderWidth: 1, borderColor: "#E3E6ED", borderRadius: 11, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  searchInput: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 11, color: "#263047", marginLeft: 9 },
  filters: { paddingBottom: 10 },
  filterButton: { height: 38, paddingHorizontal: 13, borderRadius: 9, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E3E6ED", alignItems: "center", justifyContent: "center", marginRight: 7 },
  filterActive: { backgroundColor: "#7040D5", borderColor: "#7040D5" },
  filterText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#788397" },
  filterTextActive: { color: "#FFF" },
  card: { backgroundColor: "#FFF", borderRadius: 14, padding: 13, borderWidth: 1, borderColor: "#ECEEF4", marginBottom: 12, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  identity: { flex: 1, flexDirection: "row", alignItems: "center" },
  iconBox: { width: 44, height: 44, borderRadius: 11, backgroundColor: "#F0E8FF", alignItems: "center", justifyContent: "center", marginRight: 9 },
  titleBox: { flex: 1 },
  title: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: "#202A3D" },
  id: { fontFamily: "PoppinsRegular", fontSize: 9.5, color: "#8D98AA", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, marginLeft: 8 },
  badgeText: { fontFamily: "PoppinsSemiBold", fontSize: 9.5 },
  divider: { height: 1, backgroundColor: "#EEF0F4", marginTop: 11, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  detail: { width: "50%", marginBottom: 9 },
  label: { fontFamily: "PoppinsRegular", fontSize: 9.5, color: "#8290A5", marginBottom: 3 },
  value: { fontFamily: "PoppinsRegular", fontSize: 11.5, color: "#263047" },
  actions: { flexDirection: "row", marginTop: 1 },
  editButton: { flex: 1, height: 34, borderRadius: 8, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center", marginRight: 5 },
  disabledButton: { opacity: 0.6 },
  editText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#FFF", marginLeft: 6 },
  viewButton: { flex: 1, height: 34, borderRadius: 8, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center", marginLeft: 5 },
  viewText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#7040D5", marginLeft: 6 },
  empty: { backgroundColor: "#FFF", borderRadius: 14, padding: 32, alignItems: "center" },
  emptyTitle: { fontFamily: "PoppinsSemiBold", fontSize: 14, color: "#202A3D", marginTop: 10 },
  loading: { padding: 32, alignItems: "center" },
  loadingText: { marginTop: 10, color: "#7C879A", fontFamily: "PoppinsRegular", fontSize: 12 },
  overlay: { flex: 1, backgroundColor: "rgba(15,20,32,.48)", justifyContent: "center", padding: 14 },
  modal: { maxHeight: "80%", backgroundColor: "#FFF", borderRadius: 14, padding: 14 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D" },
  modalSub: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#8B96A8", marginTop: 2 },
  close: { width: 34, height: 34, borderRadius: 9, backgroundColor: "#F5F6FA", alignItems: "center", justifyContent: "center" },
  modalName: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#202A3D" },
  modalGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  modalDetail: { width: "50%", paddingVertical: 7 },
  modalActions: { gap: 8, marginTop: 11 },
  modalReviewed: { height: 36, borderRadius: 9, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  modalDelete: { height: 36, borderRadius: 9, backgroundColor: "#D94B4B", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  modalEditText: { fontFamily: "PoppinsSemiBold", fontSize: 11, color: "#FFF", marginLeft: 7 },
});