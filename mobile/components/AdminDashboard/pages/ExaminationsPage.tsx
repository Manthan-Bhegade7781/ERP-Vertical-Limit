import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type ExamStatus = "scheduled" | "completed" | "cancelled" | "results_published";
type FilterStatus = "All" | ExamStatus;
type Examination = {
  id: string; // MongoDB _id, used for API operations
  code: string;
  name: string;
  subject: string;
  subjectId: string;
  batch: string;
  batchId: string;
  branch: string;
  date: string; // display date
  apiDate: string; // YYYY-MM-DD for updates
  time: string;
  duration: string;
  durationMinutes: number;
  totalMarks: string;
  passingMarks: number;
  instructions: string;
  status: ExamStatus;
};

const statusColors: Record<ExamStatus, { bg: string; text: string }> = {
  scheduled: { bg: "#EAF2FF", text: "#2675E8" },
  completed: { bg: "#E7F8EF", text: "#27A968" },
  cancelled: { bg: "#FFE9EC", text: "#E84D61" },
  results_published: { bg: "#F0E8FF", text: "#7040D5" },
};

const statusLabel: Record<ExamStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  results_published: "Results Published",
};

const asObject = (value: any) => value && typeof value === "object" ? value : {};
const getArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.examinations)) return payload.examinations;
  return [];
};
const formatDate = (value: any) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? "—");
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
};
const toApiDate = (value: any) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};
const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
  return `${mins} Minutes`;
};
const normalizeStatus = (value: any): ExamStatus => {
  const status = String(value ?? "scheduled").toLowerCase();
  return (["scheduled", "completed", "cancelled", "results_published"].includes(status) ? status : "scheduled") as ExamStatus;
};
const mapExamination = (raw: any): Examination => {
  const batch = asObject(raw?.batchId);
  const subject = asObject(raw?.subjectId);
  const dateValue = raw?.examinationDate;
  const durationMinutes = Number(raw?.durationMinutes ?? raw?.duration ?? 0);
  return {
    id: String(raw?._id ?? raw?.id ?? raw?.examinationCode ?? ""),
    code: String(raw?.examinationCode ?? raw?._id ?? "—"),
    name: String(raw?.examinationName ?? "Untitled Examination"),
    subject: String(subject?.name ?? subject?.subjectName ?? "Subject unavailable"),
    subjectId: String(subject?._id ?? raw?.subjectId?._id ?? raw?.subjectId ?? ""),
    batch: String(batch?.name ?? batch?.code ?? "Batch unavailable"),
    batchId: String(batch?._id ?? raw?.batchId?._id ?? raw?.batchId ?? ""),
    branch: String(asObject(batch?.branchId)?.name ?? batch?.branchName ?? "Assigned branch"),
    date: formatDate(dateValue),
    apiDate: toApiDate(dateValue),
    time: String(raw?.startTime ?? "—"),
    duration: formatDuration(durationMinutes),
    durationMinutes,
    totalMarks: String(raw?.totalMarks ?? "—"),
    passingMarks: Number(raw?.passingMarks ?? 0),
    instructions: String(raw?.instructions ?? ""),
    status: normalizeStatus(raw?.status),
  };
};

export default function ExaminationPage() {

  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingError, setRefreshingError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editMarks, setEditMarks] = useState("");
  const [editPassingMarks, setEditPassingMarks] = useState("");
  const [editInstructions, setEditInstructions] = useState("");

  const apiRequest = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.message || `Request failed (${response.status})`);
    }
    return payload;
  }, []);

  const loadExaminations = useCallback(async () => {
    setLoading(true);
    setRefreshingError("");
    try {
      const payload = await apiRequest("/examinations");
      setExaminations(getArray(payload).map(mapExamination));
    } catch (error: any) {
      setRefreshingError(error?.message || "Could not load examinations.");
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Refresh the examination list whenever this screen becomes active again.
  // This handles returning from the Add Examination screen in Expo Router.
  useFocusEffect(
    useCallback(() => {
      void loadExaminations();
    }, [loadExaminations])
  );

  const filteredExaminations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return examinations.filter((exam) => {
      const matchesSearch = !query ||
        exam.code.toLowerCase().includes(query) ||
        exam.name.toLowerCase().includes(query) ||
        exam.subject.toLowerCase().includes(query) ||
        exam.batch.toLowerCase().includes(query) ||
        exam.branch.toLowerCase().includes(query);
      return matchesSearch && (filter === "All" || exam.status === filter);
    });
  }, [examinations, search, filter]);

  const openAddExamination = () => router.push("/(admin)/add-examination" as never);

  const handleView = (exam: Examination) => {
    setSelectedExam(exam);
    setViewVisible(true);
  };

  const handleEdit = (exam: Examination) => {
    if (exam.status !== "scheduled") {
      Alert.alert("Cannot Edit", "Only scheduled examinations can be edited.");
      return;
    }
    setSelectedExam(exam);
    setEditName(exam.name);
    setEditCode(exam.code);
    setEditDate(exam.apiDate);
    setEditTime(exam.time);
    setEditDuration(String(exam.durationMinutes || ""));
    setEditMarks(exam.totalMarks);
    setEditPassingMarks(String(exam.passingMarks));
    setEditInstructions(exam.instructions);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!selectedExam) return;
    const durationMinutes = Number(editDuration);
    const totalMarks = Number(editMarks);
    const passingMarks = Number(editPassingMarks);
    if (!editName.trim() || !editCode.trim() || !editDate.trim() || !editTime.trim() ||
        !Number.isFinite(durationMinutes) || durationMinutes < 1 ||
        !Number.isFinite(totalMarks) || totalMarks < 1 ||
        !Number.isFinite(passingMarks) || passingMarks < 0 || passingMarks > totalMarks) {
      Alert.alert("Check Details", "Enter a name, code, valid date/time, duration, and valid marks. Passing marks cannot exceed total marks.");
      return;
    }
    setSaving(true);
    try {
      await apiRequest(`/examinations/${selectedExam.id}`, {
        method: "PUT",
        body: JSON.stringify({
          examinationName: editName.trim(),
          examinationCode: editCode.trim().toUpperCase(),
          examinationDate: editDate.trim(),
          startTime: editTime.trim(),
          durationMinutes,
          totalMarks,
          passingMarks,
          instructions: editInstructions.trim(),
        }),
      });
      setEditVisible(false);
      await loadExaminations();
      Alert.alert("Success", "Examination updated successfully.");
    } catch (error: any) {
      Alert.alert("Update Failed", error?.message || "Could not update examination.");
    } finally {
      setSaving(false);
    }
  };

  const cancelExam = (exam: Examination) => {
    if (exam.status !== "scheduled") {
      Alert.alert("Cannot Cancel", "Only scheduled examinations can be cancelled.");
      return;
    }
    Alert.alert("Cancel Examination", `Are you sure you want to cancel ${exam.name}?`, [
      { text: "Keep Exam", style: "cancel" },
      { text: "Cancel Exam", style: "destructive", onPress: async () => {
        try {
          await apiRequest(`/examinations/${exam.id}/cancel`, { method: "PATCH" });
          await loadExaminations();
          Alert.alert("Success", "Examination cancelled.");
        } catch (error: any) {
          Alert.alert("Cancellation Failed", error?.message || "Could not cancel examination.");
        }
      } },
    ]);
  };

  const rescheduleExam = (exam: Examination) => {
    if (exam.status !== "cancelled") {
      Alert.alert("Cannot Reschedule", "Only cancelled examinations can be scheduled again.");
      return;
    }

    Alert.alert(
      "Schedule Examination Again",
      `Do you want to schedule "${exam.name}" again using its current date and time?`,
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Schedule Again",
          onPress: async () => {
            try {
              await apiRequest(`/examinations/${exam.id}/reschedule`, {
                method: "PATCH",
              });
              await loadExaminations();
              Alert.alert("Success", "Examination has been scheduled again.");
            } catch (error: any) {
              Alert.alert(
                "Rescheduling Failed",
                error?.message || "Could not schedule the examination again."
              );
            }
          },
        },
      ]
    );
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

              <Text style={styles.examId}>{exam.code}</Text>

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

              {statusLabel[exam.status]}
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
          {exam.status === "scheduled" && (
            <TouchableOpacity
              style={styles.cancelExamButton}
              activeOpacity={0.8}
              onPress={() => cancelExam(exam)}
            >
              <MaterialCommunityIcons name="close-circle-outline" size={17} color="#E84D61" />
              <Text style={styles.cancelExamButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {exam.status === "cancelled" && (
            <TouchableOpacity
              style={styles.rescheduleExamButton}
              activeOpacity={0.8}
              onPress={() => rescheduleExam(exam)}
            >
              <MaterialCommunityIcons name="calendar-refresh-outline" size={17} color="#267A4B" />
              <Text style={styles.rescheduleExamButtonText}>Schedule Again</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>

    );

  };

  return (

    <SafeAreaView

      style={styles.safeArea}

      edges={["left", "right"]}

    >
      <StatusBar
        style="light"
        backgroundColor="#6D35D8"
        translucent={false}
      />

      <View style={styles.container}>

        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 8,
              minHeight: insets.top + 66,
            },
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
            Examinations
          </Text>

          <TouchableOpacity
            style={[styles.addButton, isMobile && styles.addButtonMobile]}
            activeOpacity={0.85}
            onPress={openAddExamination}
            accessibilityRole="button"
            accessibilityLabel="Add Examination"
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color="#7040D5"
            />
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
                  "scheduled",
                  "completed",
                  "cancelled",
                  "results_published",
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

                    {item === "All" ? "All" : statusLabel[item]}
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

          {loading ? (
            <View style={styles.stateContainer}><ActivityIndicator size="large" color="#7040D5" /><Text style={styles.stateText}>Loading examinations...</Text></View>
          ) : refreshingError ? (
            <View style={styles.stateContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={30} color="#E84D61" />
              <Text style={styles.stateText}>{refreshingError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void loadExaminations()}><Text style={styles.retryButtonText}>Try Again</Text></TouchableOpacity>
            </View>
          ) : filteredExaminations.length ? filteredExaminations.map(renderExamCard) : (
            <View style={styles.stateContainer}><MaterialCommunityIcons name="file-search-outline" size={30} color="#8994A7" /><Text style={styles.stateText}>No examinations found.</Text></View>
          )}

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

                    {selectedExam?.code}

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

                    {selectedExam?.code}

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
                  ["Examination Code", editCode, setEditCode],
                  ["Date (YYYY-MM-DD)", editDate, setEditDate],
                  ["Start Time", editTime, setEditTime],
                  ["Duration (minutes)", editDuration, setEditDuration],
                  ["Total Marks", editMarks, setEditMarks],
                  ["Passing Marks", editPassingMarks, setEditPassingMarks],
                  ["Instructions", editInstructions, setEditInstructions],
                ].map(([label, value, setter]) => (

                  <View key={label as string} style={styles.editField}>

                    <Text style={styles.editLabel}>

                      {label as string}

                    </Text>

                    <TextInput

                      value={value as string}

                      onChangeText={setter as (value: string) => void}

                      style={styles.editInput}

                      placeholder={"Enter " + String(label).toLowerCase()}

                      placeholderTextColor="#A0A9B8"

                    />

                  </View>

                ))}

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
                    disabled={saving}
                  >

                    <MaterialCommunityIcons

                      name="content-save-outline"

                      size={18}

                      color="#FFFFFF"

                    />

                    <Text style={styles.saveText}>
                      {saving ? "Saving..." : "Save Changes"}
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

  cancelExamButton: {
    minWidth: 78,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#FFE9EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelExamButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#E84D61", marginLeft: 5 },
  rescheduleExamButton: {
    minWidth: 112,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#E7F8EF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rescheduleExamButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#267A4B",
    marginLeft: 5,
  },
  stateContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 34, paddingHorizontal: 18, gap: 10 },
  stateText: { fontFamily: "PoppinsRegular", fontSize: 12, color: "#7C879A", textAlign: "center" },
  retryButton: { backgroundColor: "#7040D5", borderRadius: 9, paddingHorizontal: 16, paddingVertical: 9, marginTop: 4 },
  retryButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 11, color: "#FFFFFF" },
  safeArea: {

    flex: 1,

    backgroundColor: "#F7F8FC",

  },

  container: {

    flex: 1,

    backgroundColor: "#F7F8FC",

  },

  header: {
    width: "100%",
    backgroundColor: "#6D35D8",
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerMobile: {
    height: 80,
    paddingHorizontal: 14,
  },
  headerTablet: {
    height: 64,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backButtonMobile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    lineHeight: 26,
    color: "#FFFFFF",
    textAlign: "left",
  },
  headerTitleMobile: {
    fontSize: 20,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  addButtonMobile: {
    width: 40,
    height: 40,
    borderRadius: 11,
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
