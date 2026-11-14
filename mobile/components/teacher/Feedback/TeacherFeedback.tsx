
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type FeedbackCategory =
  | "Teaching"
  | "Course"
  | "Facilities"
  | "App"
  | "Other";

type FeedbackStatus = "New" | "Reviewed";

interface FeedbackStudent {
  _id?: string;
  fullName?: string;
  email?: string;
}

interface FeedbackItem {
  _id: string;
  studentId: FeedbackStudent | string;
  branchId?: {
    _id?: string;
    branchName?: string;
    name?: string;
  } | null;
  subject: string;
  category: FeedbackCategory;
  rating: number;
  comments: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

const PURPLE = "#7040D5";

const CATEGORIES: FeedbackCategory[] = [
  "Teaching",
  "Course",
  "Facilities",
  "App",
  "Other",
];

const FILTERS = ["All", "New", "Reviewed"] as const;

const getStudentName = (student: FeedbackStudent | string) => {
  if (typeof student === "string") return "Student";
  return student?.fullName || "Student";
};

const getStudentEmail = (student: FeedbackStudent | string) => {
  if (typeof student === "string") return "";
  return student?.email || "";
};

const formatDate = (date: string) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TeacherFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof FILTERS)[number]>("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackItem | null>(null);

  const fetchFeedback = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = await getToken();

      if (!token) {
        setFeedback([]);
        setError("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 403) {
        setFeedback([]);
        setError(
          "Your account does not have permission to view feedback. Please contact your administrator."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to fetch feedback.");
      }

      setFeedback(Array.isArray(result.data) ? result.data : []);
    } catch (err: any) {
      setFeedback([]);
      setError(err?.message || "Something went wrong while loading feedback.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const studentName = getStudentName(item.studentId);
      const studentEmail = getStudentEmail(item.studentId);

      const searchText = [
        item.subject,
        item.category,
        item.comments,
        studentName,
        studentEmail,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        selectedFilter === "All" || item.status === selectedFilter;

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [feedback, search, selectedFilter, selectedCategory]);

  const totalFeedback = feedback.length;

  const newFeedback = feedback.filter(
    (item) => item.status === "New"
  ).length;

  const reviewedFeedback = feedback.filter(
    (item) => item.status === "Reviewed"
  ).length;

  const averageRating =
    totalFeedback > 0
      ? (
          feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          totalFeedback
        ).toFixed(1)
      : "0.0";

  const renderStars = (rating: number, size = 16) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color="#F5A623"
          />
        ))}
      </View>
    );
  };

  const renderFeedbackCard = ({ item }: { item: FeedbackItem }) => {
    const studentName = getStudentName(item.studentId);

    return (
      <Pressable
        style={styles.feedbackCard}
        onPress={() => setSelectedFeedback(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.studentAvatar}>
            <Text style={styles.avatarText}>
              {studentName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.feedbackDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.status === "New"
                ? styles.newBadge
                : styles.reviewedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "New"
                  ? styles.newText
                  : styles.reviewedText,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.subjectRow}>
          <Text style={styles.subject}>{item.subject}</Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        {renderStars(item.rating)}

        <Text style={styles.comment} numberOfLines={3}>
          {item.comments}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.viewDetails}>View details</Text>
          <Ionicons name="chevron-forward" size={17} color={PURPLE} />
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="chatbox-ellipses-outline"
          size={35}
          color={PURPLE}
        />
      </View>

      <Text style={styles.emptyTitle}>No feedback found</Text>
      <Text style={styles.emptyDescription}>
        There is no feedback matching your current search or filters.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Feedback</Text>
          <Text style={styles.subheading}>
            Student feedback and suggestions
          </Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={() => fetchFeedback(true)}
          disabled={loading || refreshing}
        >
          <Ionicons name="refresh-outline" size={21} color={PURPLE} />
        </Pressable>
      </View>

      {error ? (
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={28}
              color="#D97706"
            />
          </View>

          <Text style={styles.permissionTitle}>
            Feedback access unavailable
          </Text>

          <Text style={styles.permissionDescription}>{error}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => fetchFeedback()}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchFeedback(true)}
                tintColor={PURPLE}
              />
            }
          >
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={20}
                    color={PURPLE}
                  />
                </View>
                <Text style={styles.statValue}>{totalFeedback}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, styles.orangeIcon]}>
                  <Ionicons
                    name="mail-unread-outline"
                    size={20}
                    color="#E58A22"
                  />
                </View>
                <Text style={styles.statValue}>{newFeedback}</Text>
                <Text style={styles.statLabel}>New</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, styles.greenIcon]}>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color="#159B69"
                  />
                </View>
                <Text style={styles.statValue}>{reviewedFeedback}</Text>
                <Text style={styles.statLabel}>Reviewed</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, styles.yellowIcon]}>
                  <Ionicons name="star-outline" size={20} color="#E5A000" />
                </View>
                <Text style={styles.statValue}>{averageRating}</Text>
                <Text style={styles.statLabel}>Avg. Rating</Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#92909A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search student, subject or comment..."
                placeholderTextColor="#A5A3AD"
                value={search}
                onChangeText={setSearch}
              />

              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={19} color="#92909A" />
                </Pressable>
              )}
            </View>

            <Text style={styles.sectionTitle}>Feedback status</Text>

            <View style={styles.filterRow}>
              {FILTERS.map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.activeFilter,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter && styles.activeFilterText,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Category</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFilters}
            >
              {["All", ...CATEGORIES].map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryFilter,
                    selectedCategory === category &&
                      styles.activeCategoryFilter,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryFilterText,
                      selectedCategory === category &&
                        styles.activeCategoryFilterText,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Student feedback</Text>
              <Text style={styles.resultCount}>
                {filteredFeedback.length} results
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PURPLE} />
                <Text style={styles.loadingText}>Loading feedback...</Text>
              </View>
            ) : filteredFeedback.length > 0 ? (
              <FlatList
                data={filteredFeedback}
                renderItem={renderFeedbackCard}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            ) : (
              renderEmptyState()
            )}
          </ScrollView>
        </>
      )}

      <Modal
        visible={!!selectedFeedback}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFeedback(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Feedback Details</Text>
                <Text style={styles.modalSubtitle}>
                  Student feedback information
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedFeedback(null)}
              >
                <Ionicons name="close" size={22} color="#55515F" />
              </Pressable>
            </View>

            {selectedFeedback && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalStudent}>
                  <View style={styles.studentAvatarLarge}>
                    <Text style={styles.avatarTextLarge}>
                      {getStudentName(selectedFeedback.studentId)
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.modalStudentName}>
                      {getStudentName(selectedFeedback.studentId)}
                    </Text>
                    <Text style={styles.modalStudentEmail}>
                      {getStudentEmail(selectedFeedback.studentId)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDivider} />

                <DetailRow
                  label="Subject"
                  value={selectedFeedback.subject}
                />

                <DetailRow
                  label="Category"
                  value={selectedFeedback.category}
                />

                <DetailRow
                  label="Submitted on"
                  value={formatDate(selectedFeedback.createdAt)}
                />

                <DetailRow
                  label="Status"
                  value={selectedFeedback.status}
                />

                <DetailRow
                  label="Branch"
                  value={
                    selectedFeedback.branchId?.branchName ||
                    selectedFeedback.branchId?.name ||
                    "Not available"
                  }
                />

                <View style={styles.ratingSection}>
                  <Text style={styles.detailLabel}>Student rating</Text>
                  {renderStars(selectedFeedback.rating, 22)}
                  <Text style={styles.ratingNumber}>
                    {selectedFeedback.rating} / 5
                  </Text>
                </View>

                <View style={styles.commentsSection}>
                  <Text style={styles.detailLabel}>Comments</Text>
                  <Text style={styles.fullComment}>
                    {selectedFeedback.comments}
                  </Text>
                </View>

                <View style={styles.readOnlyNotice}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#8060C5"
                  />
                  <Text style={styles.readOnlyText}>
                    Feedback is displayed in read-only mode.
                  </Text>
                </View>
              </ScrollView>
            )}

            <Pressable
              style={styles.closeModalButton}
              onPress={() => setSelectedFeedback(null)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#211B2D",
  },
  subheading: {
    marginTop: 5,
    fontSize: 13,
    color: "#85818F",
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 35,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0EDF5",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  orangeIcon: {
    backgroundColor: "#FFF3E5",
  },
  greenIcon: {
    backgroundColor: "#E6F7F0",
  },
  yellowIcon: {
    backgroundColor: "#FFF7DF",
  },
  statValue: {
    fontSize: 23,
    fontWeight: "700",
    color: "#292333",
  },
  statLabel: {
    fontSize: 12,
    color: "#898493",
    marginTop: 3,
  },
  searchContainer: {
    height: 48,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE9F1",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 13,
    color: "#292333",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#292333",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginRight: 9,
    borderWidth: 1,
    borderColor: "#ECE9F1",
  },
  activeFilter: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  filterText: {
    color: "#777280",
    fontSize: 12,
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  categoryFilters: {
    paddingBottom: 20,
  },
  categoryFilter: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE9F1",
    marginRight: 8,
  },
  activeCategoryFilter: {
    backgroundColor: "#F0EAFE",
    borderColor: PURPLE,
  },
  categoryFilterText: {
    fontSize: 12,
    color: "#777280",
    fontWeight: "500",
  },
  activeCategoryFilterText: {
    color: PURPLE,
    fontWeight: "700",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  resultCount: {
    fontSize: 12,
    color: "#898493",
  },
  feedbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#F0EDF5",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: PURPLE,
    fontSize: 17,
    fontWeight: "700",
  },
  studentInfo: {
    flex: 1,
    marginLeft: 11,
  },
  studentName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#292333",
  },
  feedbackDate: {
    fontSize: 11,
    color: "#96919F",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  newBadge: {
    backgroundColor: "#FFF2DF",
  },
  reviewedBadge: {
    backgroundColor: "#E6F7F0",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  newText: {
    color: "#D88922",
  },
  reviewedText: {
    color: "#159B69",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F0EDF4",
    marginVertical: 14,
  },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  subject: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#292333",
  },
  categoryBadge: {
    backgroundColor: "#F3EEFF",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 10,
    color: PURPLE,
    fontWeight: "600",
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  comment: {
    color: "#777280",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },
  cardFooter: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1EEF5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  viewDetails: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: "700",
    marginRight: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 45,
    paddingHorizontal: 25,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#292333",
  },
  emptyDescription: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    color: "#898493",
    marginTop: 7,
  },
  loadingContainer: {
    paddingVertical: 45,
    alignItems: "center",
  },
  loadingText: {
    color: "#898493",
    fontSize: 12,
    marginTop: 12,
  },
  permissionCard: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0EDF5",
  },
  permissionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#292333",
    textAlign: "center",
  },
  permissionDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: "#85818F",
    textAlign: "center",
    marginTop: 9,
  },
  retryButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20, 15, 30, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 21,
    paddingBottom: 30,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#292333",
  },
  modalSubtitle: {
    color: "#898493",
    fontSize: 12,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F4F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalStudent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  studentAvatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarTextLarge: {
    fontSize: 20,
    fontWeight: "700",
    color: PURPLE,
  },
  modalStudentName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#292333",
  },
  modalStudentEmail: {
    fontSize: 11,
    color: "#898493",
    marginTop: 4,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#EEEAF3",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F0F6",
  },
  detailLabel: {
    color: "#898493",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  detailValue: {
    color: "#292333",
    fontSize: 12,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  ratingSection: {
    paddingTop: 17,
  },
  ratingNumber: {
    fontSize: 12,
    color: "#777280",
    marginTop: 7,
  },
  commentsSection: {
    marginTop: 19,
  },
  fullComment: {
    fontSize: 13,
    color: "#55515F",
    lineHeight: 21,
    backgroundColor: "#F8F6FB",
    padding: 13,
    borderRadius: 12,
  },
  readOnlyNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F0FF",
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
  },
  readOnlyText: {
    color: "#8060C5",
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
  },
  closeModalButton: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  closeModalText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default TeacherFeedback;
