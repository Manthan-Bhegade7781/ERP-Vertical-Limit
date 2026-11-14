import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import {
  fetchExaminations,
  ExaminationApiRecord,
  RefRecord,
} from "@/services/examinations";

const PURPLE = "#7040D5";

type FilterType =
  | "All"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "results_published";

const filters: FilterType[] = [
  "All",
  "scheduled",
  "completed",
  "cancelled",
  "results_published",
];

function getReferenceName(value: RefRecord): string {
  if (!value) return "Not specified";

  if (typeof value === "string") return value;

  return value.name || value.code || "Not specified";
}

function getStatusColors(status: string) {
  switch (status?.toLowerCase()) {
    case "completed":
      return { bg: "#E7F8EF", text: "#279965" };

    case "cancelled":
      return { bg: "#FFE9ED", text: "#E95368" };

    case "results_published":
      return { bg: "#F0EAFE", text: "#7040D5" };

    default:
      return { bg: "#EAF2FF", text: "#2675E8" };
  }
}

function formatDate(value: string) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  return (value || "scheduled")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

type TeacherExaminationsProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

export default function TeacherExaminations({
  onContentScroll,
  onBack,
}: TeacherExaminationsProps = {}) {
  const [examinations, setExaminations] = useState<
    ExaminationApiRecord[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>("All");

  const [selectedExam, setSelectedExam] =
    useState<ExaminationApiRecord | null>(null);

  const [detailsVisible, setDetailsVisible] = useState(false);

  const loadExaminations = useCallback(async () => {
    try {
      setError("");

      const result = await fetchExaminations();

      setExaminations(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load examinations."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadExaminations();
  }, [loadExaminations]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadExaminations();
  };

  const filteredExaminations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return examinations.filter((exam) => {
      const subject = getReferenceName(exam.subjectId).toLowerCase();

      const batch = getReferenceName(exam.batchId).toLowerCase();

      const name = exam.examinationName.toLowerCase();

      const code = exam.examinationCode.toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        subject.includes(query) ||
        batch.includes(query);

      const matchesFilter =
        selectedFilter === "All" ||
        exam.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [examinations, search, selectedFilter]);

  const openDetails = (exam: ExaminationApiRecord) => {
    setSelectedExam(exam);
    setDetailsVisible(true);
  };

  const totalExams = examinations.length;

  const scheduledExams = examinations.filter(
    (exam) => exam.status === "scheduled"
  ).length;

  const completedExams = examinations.filter(
    (exam) => exam.status === "completed"
  ).length;

  const cancelledExams = examinations.filter(
    (exam) => exam.status === "cancelled"
  ).length;

  const publishedExams = examinations.filter(
    (exam) => exam.status === "results_published"
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#5420D8"
            colors={["#5420D8"]}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.headerCard}>
          <Pressable
            style={styles.backButton}
            onPress={onBack ?? (() => undefined)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous screen"
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color="#5420D8"
            />
          </Pressable>

          <View style={styles.headerIcon}>
            <Ionicons
              name="newspaper-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Examinations
            </Text>

            <Text style={styles.subtitle}>
              View scheduled examinations and status
            </Text>
          </View>
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryRow}>
          <SummaryCard title="Total Exams" value={totalExams} icon="file-document-multiple-outline" color="#7040D5" background="#F1EAFF" />
          <SummaryCard title="Scheduled" value={scheduledExams} icon="calendar-clock-outline" color="#D18A24" background="#FFF2DF" />
          <SummaryCard title="Completed" value={completedExams} icon="check-circle-outline" color="#279965" background="#E7F8EF" />
          <SummaryCard title="Cancelled" value={cancelledExams} icon="close-circle-outline" color="#D64A70" background="#FFE9F0" />
          <SummaryCard title="Results Published" value={publishedExams} icon="file-certificate-outline" color="#2675E8" background="#EAF2FF" />
        </View>

        {/* SEARCH */}

        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#98A2B3"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search examination, subject, batch or branch..."
            placeholderTextColor="#98A2B3"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={19}
                color="#98A2B3"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTERS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => {
            const active = selectedFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[
                  styles.filterButton,
                  active && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {filter === "All" ? "All" : formatStatus(filter)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* RECORDS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Examination Records
            </Text>

            <Text style={styles.sectionSubtitle}>
              {filteredExaminations.length} examinations found
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={PURPLE}
            style={styles.loader}
          />
        ) : error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Unable to load examinations"
            subtitle={error}
            onRetry={loadExaminations}
          />
        ) : filteredExaminations.length === 0 ? (
          <EmptyState
            icon="file-search-outline"
            title="No examinations found"
            subtitle="Assigned examinations will appear here."
          />
        ) : (
          filteredExaminations.map((exam) => {
            const colors = getStatusColors(exam.status);

            return (
              <TouchableOpacity
                key={exam._id}
                activeOpacity={0.9}
                onPress={() => openDetails(exam)}
                style={styles.examCard}
              >
                <View style={styles.examHeader}>
                  <View style={styles.examIcon}>
                    <MaterialCommunityIcons
                      name="file-document-edit-outline"
                      size={23}
                      color={PURPLE}
                    />
                  </View>

                  <View style={styles.examInfo}>
                    <Text style={styles.examName}>
                      {exam.examinationName}
                    </Text>

                    <Text style={styles.examCode}>
                      {exam.examinationCode}
                    </Text>
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
                      {formatStatus(exam.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsGrid}>
                  <Detail
                    label="SUBJECT"
                    value={getReferenceName(exam.subjectId)}
                  />

                  <Detail
                    label="BATCH"
                    value={getReferenceName(exam.batchId)}
                  />

                  <Detail
                    label="DATE"
                    value={formatDate(exam.examinationDate)}
                  />

                  <Detail
                    label="START TIME"
                    value={exam.startTime || "Not specified"}
                  />

                  <Detail
                    label="DURATION"
                    value={`${exam.durationMinutes} minutes`}
                  />

                  <Detail
                    label="TOTAL MARKS"
                    value={String(exam.totalMarks)}
                  />

                  <Detail
                    label="STUDENTS"
                    value={String(exam.studentCount ?? 0)}
                  />
                </View>

                <View style={styles.viewAction}>
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={17}
                    color={PURPLE}
                  />

                  <Text style={styles.viewActionText}>
                    View Examination Details
                  </Text>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={19}
                    color={PURPLE}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* DETAILS MODAL */}

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  Examination Details
                </Text>

                <Text style={styles.modalSubtitle}>
                  Complete examination information
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedExam && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                <View style={styles.modalExamIcon}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={28}
                    color={PURPLE}
                  />
                </View>

                <Text style={styles.modalExamName}>
                  {selectedExam.examinationName}
                </Text>

                <Text style={styles.modalExamCode}>
                  {selectedExam.examinationCode}
                </Text>

                <View style={styles.modalDivider} />

                <ModalDetail
                  label="Subject"
                  value={getReferenceName(selectedExam.subjectId)}
                />

                <ModalDetail
                  label="Batch"
                  value={getReferenceName(selectedExam.batchId)}
                />

                <ModalDetail
                  label="Examination Date"
                  value={formatDate(selectedExam.examinationDate)}
                />

                <ModalDetail
                  label="Start Time"
                  value={selectedExam.startTime}
                />

                <ModalDetail
                  label="Duration"
                  value={`${selectedExam.durationMinutes} minutes`}
                />

                <ModalDetail
                  label="Total Marks"
                  value={String(selectedExam.totalMarks)}
                />

                <ModalDetail
                  label="Passing Marks"
                  value={String(selectedExam.passingMarks)}
                />

                <ModalDetail
                  label="Students"
                  value={String(selectedExam.studentCount ?? 0)}
                />

                <ModalDetail
                  label="Status"
                  value={formatStatus(selectedExam.status)}
                />

                {!!selectedExam.instructions && (
                  <ModalDetail
                    label="Instructions"
                    value={selectedExam.instructions}
                  />
                )}

                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setDetailsVisible(false)}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* SUMMARY CARD */

function SummaryCard({
  title,
  value,
  icon,
  color,
  background,
}: {
  title: string;
  value: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          { backgroundColor: background },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text style={styles.summaryValue}>{value}</Text>

      <Text style={styles.summaryLabel}>{title}</Text>
    </View>
  );
}

/* DETAIL */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>

      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

/* MODAL DETAIL */

function ModalDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.modalDetail}>
      <Text style={styles.modalDetailLabel}>{label}</Text>

      <Text style={styles.modalDetailValue}>
        {value || "Not specified"}
      </Text>
    </View>
  );
}

/* EMPTY STATE */

function EmptyState({
  icon,
  title,
  subtitle,
  onRetry,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.emptyCard}>
      <MaterialCommunityIcons
        name={icon}
        size={38}
        color="#A5AFBE"
      />

      <Text style={styles.emptyTitle}>{title}</Text>

      <Text style={styles.emptySubtitle}>{subtitle}</Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 35,
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 19,
  },

  subtitle: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 19,
  },

  summaryCard: {
    width: "48.2%",
    minHeight: 132,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ECEEF3",
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  summaryLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#8792A4",
    marginTop: 3,
  },

  summaryValue: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 23,
    color: "#202A3A",
    marginTop: 1,
  },

  searchBox: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8EAF0",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  searchInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#202A3A",
  },

  filterRow: {
    gap: 8,
    paddingVertical: 16,
  },

  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF0",
  },

  filterButtonActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },

  filterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#667085",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  sectionHeader: {
    marginBottom: 13,
  },

  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
    color: "#202A3A",
  },

  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#98A2B3",
    marginTop: 3,
  },

  examCard: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 20,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#ECEEF3",
  },

  examHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  examIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  examInfo: {
    flex: 1,
    marginLeft: 10,
  },

  examName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#202A3A",
  },

  examCode: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#98A2B3",
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 5,
  },

  statusText: {
    fontFamily: "PoppinsMedium",
    fontSize: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF0F5",
    marginVertical: 14,
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  detailItem: {
    width: "50%",
    marginBottom: 13,
    paddingRight: 8,
  },

  detailLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 8,
    color: "#98A2B3",
  },

  detailValue: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#344054",
    marginTop: 3,
  },

  viewAction: {
    borderTopWidth: 0,
    backgroundColor: "#F1EAFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  viewActionText: {
    flex: 1,
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: PURPLE,
  },

  loader: {
    marginTop: 45,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    marginTop: 15,
  },

  emptyTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#344054",
    marginTop: 12,
    textAlign: "center",
  },

  emptySubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#98A2B3",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },

  retryButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 9,
    marginTop: 14,
  },

  retryText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsMedium",
    fontSize: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16,24,40,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modalCard: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 19,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 17,
  },

  modalTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 17,
    color: "#202A3A",
  },

  modalSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#98A2B3",
    marginTop: 3,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
  },

  modalContent: {
    paddingBottom: 10,
  },

  modalExamIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },

  modalExamName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
    color: "#202A3A",
    textAlign: "center",
  },

  modalExamCode: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#98A2B3",
    textAlign: "center",
    marginTop: 4,
  },

  modalDivider: {
    height: 1,
    backgroundColor: "#EEF0F5",
    marginVertical: 16,
  },

  modalDetail: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },

  modalDetailLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#98A2B3",
  },

  modalDetailValue: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#344054",
    marginTop: 4,
  },

  closeModalButton: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 18,
  },

  closeModalText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
});