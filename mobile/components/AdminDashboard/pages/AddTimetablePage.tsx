import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";
import { getBatchSubjects, type BatchSubject } from "@/services/batchSubject";
import { createTimetable } from "@/services/timetable";

type BranchRef = string | { _id: string; name: string; code?: string };
type Batch = {
  _id: string;
  name: string;
  code?: string;
  status?: "active" | "inactive";
  branchId: BranchRef | null;
};
type BranchOption = { _id: string; name: string; code?: string };
type GetBatchesResponse = {
  success: boolean;
  message?: string;
  data?: { batches?: Batch[] };
};

const classTypes = [
  { label: "Lecture", value: "lecture" as const },
  { label: "Exam", value: "exam" as const },
];

function formatDateForApi(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) return trimmed;
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(
    parsed.getDate()
  ).padStart(2, "0")}`;
}

function formatTimeForApi(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    if (hour < 1 || hour > 12 || minute > 59) return null;
    hour = (hour % 12) + (twelveHour[3] === "PM" ? 12 : 0);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const twentyFourHour = trimmed.match(/^(\d{2}):(\d{2})$/);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);
    if (hour > 23 || minute > 59) return null;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  return null;
}

function getBranchName(branchId: BranchRef | null | undefined) {
  return branchId && typeof branchId !== "string" ? branchId.name : "";
}

function getBranchId(branchId: BranchRef | null | undefined) {
  return branchId && typeof branchId === "object" ? branchId._id : "";
}

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {children} {required ? <Text style={styles.required}>*</Text> : null}
    </Text>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  required,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  required?: boolean;
  keyboardType?: "default" | "numeric";
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <View style={[styles.inputWrap, !editable && styles.readOnlyInput]}>
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA2B1"
          style={styles.input}
          keyboardType={keyboardType || "default"}
          editable={editable}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

function OptionChips<T extends string>({
  options,
  selected,
  onSelect,
  disabled = false,
}: {
  options: { label: string; value: T }[];
  selected: T | "";
  onSelect: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.optionWrap}>
      {options.map((item) => {
        const active = selected === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            disabled={disabled}
            style={[styles.optionButton, active && styles.optionButtonActive, disabled && styles.disabledOption]}
            onPress={() => onSelect(item.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, active && styles.optionTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AddTimetablePage() {
  const insets = useSafeAreaInsets();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [classType, setClassType] = useState<"lecture" | "exam">("lecture");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [batchSubjectId, setBatchSubjectId] = useState("");

  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);

  const branches = useMemo(() => {
    const unique = new Map<string, BranchOption>();
    batches.forEach((batch) => {
      if (batch.branchId && typeof batch.branchId === "object") {
        unique.set(batch.branchId._id, {
          _id: batch.branchId._id,
          name: batch.branchId.name,
          code: batch.branchId.code,
        });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [batches]);

  const branchBatches = useMemo(
    () =>
      batches.filter(
        (batch) =>
          getBranchId(batch.branchId) === selectedBranchId &&
          batch.status !== "inactive"
      ),
    [batches, selectedBranchId]
  );

  const selectedAssignment = useMemo(
    () => batchSubjects.find((item) => item._id === batchSubjectId),
    [batchSubjects, batchSubjectId]
  );

  useEffect(() => {
    let mounted = true;

    const loadBatches = async () => {
      setLoadingBatches(true);
      try {
        const token = await getToken();
        if (!token) throw new Error("Please log in again to load batches.");

        const response = await fetch(`${API_BASE_URL}/batches`, {
          method: "GET",
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const result: GetBatchesResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || `Unable to load batches (HTTP ${response.status}).`);
        }

        if (mounted) {
          setBatches((result.data?.batches || []).filter((batch) => batch.status !== "inactive"));
        }
      } catch (error) {
        if (mounted) {
          Alert.alert(
            "Unable to Load Batches",
            error instanceof Error ? error.message : "Please try again."
          );
        }
      } finally {
        if (mounted) setLoadingBatches(false);
      }
    };

    loadBatches();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSubjects = async () => {
      setBatchSubjects([]);
      setBatchSubjectId("");
      if (!batchId) {
        setLoadingSubjects(false);
        return;
      }

      setLoadingSubjects(true);
      try {
        // Match the Super Admin Add Class page: the service may return either
        // a direct array or a wrapped backend payload.
        const response: unknown = await getBatchSubjects(batchId);
        let assignments: BatchSubject[] = [];

        if (Array.isArray(response)) {
          assignments = response as BatchSubject[];
        } else if (response && typeof response === "object") {
          const payload = response as {
            success?: boolean;
            message?: string;
            data?: { batchSubjects?: BatchSubject[] };
            batchSubjects?: BatchSubject[];
          };

          if (payload.success === false) {
            throw new Error(payload.message || "Unable to load subjects for this batch.");
          }

          assignments = payload.data?.batchSubjects ?? payload.batchSubjects ?? [];
        }

        if (!Array.isArray(assignments)) {
          throw new Error("The subjects API returned an unexpected response format.");
        }

        // Only selectable active assignments with a populated subject are useful.
        const activeAssignments = assignments.filter(
          (item) =>
            item?.status === "active" &&
            !!item.subjectId &&
            typeof item.subjectId === "object"
        );

        if (mounted) setBatchSubjects(activeAssignments);
      } catch (error) {
        if (mounted) {
          Alert.alert(
            "Unable to Load Subjects",
            error instanceof Error ? error.message : "Please try again."
          );
        }
      } finally {
        if (mounted) setLoadingSubjects(false);
      }
    };

    loadSubjects();
    return () => {
      mounted = false;
    };
  }, [batchId]);

  const save = async () => {
    if (saving) return;
    if (!date.trim() || !startTime.trim() || !endTime.trim() || !selectedBranchId || !batchId || !batchSubjectId) {
      Alert.alert("Required Fields", "Please complete the date, times, branch, batch and subject fields.");
      return;
    }

    const scheduledDate = formatDateForApi(date);
    const formattedStartTime = formatTimeForApi(startTime);
    const formattedEndTime = formatTimeForApi(endTime);

    if (!scheduledDate) {
      Alert.alert("Invalid Date", "Enter a valid date in YYYY-MM-DD format, for example 2026-10-28.");
      return;
    }
    if (!formattedStartTime || !formattedEndTime) {
      Alert.alert("Invalid Time", "Use a time such as 09:00 AM or 14:30.");
      return;
    }
    if (formattedStartTime >= formattedEndTime) {
      Alert.alert("Invalid Time Range", "End time must be later than start time.");
      return;
    }

    setSaving(true);
    try {
      const result = await createTimetable({
        batchSubjectId,
        scheduledDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        room: room.trim() || undefined,
        type: classType,
      });

      if (!result.success) {
        throw new Error(result.message || "Unable to add this timetable entry.");
      }

      Alert.alert("Timetable Added", "The class has been added successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Unable to Add Timetable",
        error instanceof Error ? error.message : "Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8, minHeight: insets.top + 66 }]}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Add Timetable</Text>
          </View>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="calendar-clock" size={21} color="#7040D5" />
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Timetable Management</Text>
          <Text style={styles.subtitle}>Create a schedule using your branch's active batches and subject assignments.</Text>

          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons name="calendar-clock" size={21} color="#7040D5" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Class Information</Text>
                <Text style={styles.sectionSub}>Set the date and class duration</Text>
              </View>
            </View>

            <InputField label="Scheduled Date" required value={date} onChangeText={setDate} placeholder="YYYY-MM-DD (e.g. 2026-10-28)" icon="calendar-outline" />
            <View style={styles.two}>
              <View style={styles.column}>
                <InputField label="Start Time" required value={startTime} onChangeText={setStartTime} placeholder="09:00 AM" icon="clock-outline" />
              </View>
              <View style={styles.column}>
                <InputField label="End Time" required value={endTime} onChangeText={setEndTime} placeholder="10:00 AM" icon="clock-outline" />
              </View>
            </View>
            <InputField label="Room (optional)" value={room} onChangeText={setRoom} placeholder="e.g. Room 101" icon="door-open" />
          </View>

          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons name="school-outline" size={21} color="#2675E8" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Branch & Assignment</Text>
                <Text style={styles.sectionSub}>Choose an existing batch-subject assignment</Text>
              </View>
            </View>

            <FieldLabel required>Branch</FieldLabel>
            {loadingBatches ? (
              <View style={styles.loadingRow}><ActivityIndicator color="#7040D5" /><Text style={styles.helper}>Loading branches and batches...</Text></View>
            ) : branches.length === 0 ? (
              <Text style={styles.helper}>No branch information was returned with the active batches. Check that GET /batches populates branchId.</Text>
            ) : (
              <View style={styles.optionWrap}>
                {branches.map((branch) => {
                  const active = selectedBranchId === branch._id;
                  return (
                    <TouchableOpacity
                      key={branch._id}
                      style={[styles.optionButton, active && styles.optionButtonActive]}
                      onPress={() => {
                        setSelectedBranchId(branch._id);
                        setBatchId("");
                        setBatchSubjects([]);
                        setBatchSubjectId("");
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>{branch.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.spacer} />
            <FieldLabel required>Batch</FieldLabel>
            {!selectedBranchId ? (
              <Text style={styles.helper}>Select a branch first to view its active batches.</Text>
            ) : loadingBatches ? (
              <Text style={styles.helper}>Loading batches...</Text>
            ) : branchBatches.length === 0 ? (
              <Text style={styles.helper}>No active batches were found for this branch.</Text>
            ) : (
              <View style={styles.optionWrap}>
                {branchBatches.map((batch) => {
                  const active = batchId === batch._id;
                  return (
                    <TouchableOpacity
                      key={batch._id}
                      style={[styles.optionButton, active && styles.optionButtonActive]}
                      onPress={() => {
                        setBatchId(batch._id);
                        setBatchSubjects([]);
                        setBatchSubjectId("");
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>{batch.name}{batch.code ? ` (${batch.code})` : ""}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.spacer} />
            <FieldLabel required>Subject</FieldLabel>
            {!batchId ? (
              <Text style={styles.helper}>Select a batch first to load its assigned subjects.</Text>
            ) : loadingSubjects ? (
              <View style={styles.loadingRow}><ActivityIndicator color="#7040D5" /><Text style={styles.helper}>Loading assigned subjects...</Text></View>
            ) : batchSubjects.length === 0 ? (
              <Text style={styles.helper}>No active subjects are assigned to this batch.</Text>
            ) : (
              <View style={styles.optionWrap}>
                {batchSubjects.map((assignment) => {
                  const active = batchSubjectId === assignment._id;
                  return (
                    <TouchableOpacity
                      key={assignment._id}
                      style={[styles.optionButton, active && styles.optionButtonActive]}
                      onPress={() => setBatchSubjectId(assignment._id)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name={active ? "check-circle" : "circle-outline"} size={16} color={active ? "#7040D5" : "#7B8496"} />
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {assignment.subjectId?.name || "Unnamed subject"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {selectedAssignment ? (
              <View style={styles.assignmentDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="book-outline" size={17} color="#7040D5" />
                  <Text style={styles.detailText}>Subject code: {selectedAssignment.subjectId?.code || "N/A"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="account-outline" size={17} color="#7040D5" />
                  <Text style={styles.detailText}>Teacher: {selectedAssignment.teacherId?.fullName || "Not assigned"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="school-outline" size={17} color="#7040D5" />
                  <Text style={styles.detailText}>
                    Batch:{" "}
                    {branchBatches.find(
                      (item) => item._id === selectedAssignment.batchId
                    )?.name || "Selected batch"}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.spacer} />
            <FieldLabel required>Class Type</FieldLabel>
            <OptionChips
              options={classTypes}
              selected={classType}
              onSelect={setClassType}
            />
            <Text style={styles.helper}>Only Lecture and Exam are enabled because these are the values currently supported by the Timetable model.</Text>
          </View>

          <View style={styles.info}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#7040D5" />
            <Text style={styles.infoText}>The selected subject must already be assigned to the chosen batch. The backend will validate branch access and detect overlapping schedules.</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={() => router.back()} disabled={saving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.save, saving && styles.saveDisabled]} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#FFF" /> : <MaterialCommunityIcons name="content-save-outline" size={19} color="#FFF" />}
              <Text style={styles.saveText}>{saving ? "Saving..." : "Save Timetable"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FC" },
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  header: { backgroundColor: "#7040D5", paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", alignItems: "center" },
  back: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,.15)", alignItems: "center", justifyContent: "center" },
  headerTitleBox: { flex: 1, paddingHorizontal: 12 },
  headerTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#FFF" },
  headerIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },
  pageTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#172033" },
  subtitle: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#7C879A", marginTop: 3, marginBottom: 14, lineHeight: 16 },
  card: { backgroundColor: "#FFF", borderRadius: 14, padding: 13, marginBottom: 10, borderWidth: 1, borderColor: "#ECEEF4" },
  section: { flexDirection: "row", alignItems: "center", marginBottom: 13 },
  sectionIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#F0E8FF", alignItems: "center", justifyContent: "center", marginRight: 9 },
  blueIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#E8F1FF", alignItems: "center", justifyContent: "center", marginRight: 9 },
  sectionTitle: { fontFamily: "PoppinsSemiBold", fontSize: 14, color: "#202A3D" },
  sectionSub: { fontFamily: "PoppinsRegular", fontSize: 9.5, color: "#8994A7", marginTop: 1 },
  two: { flexDirection: "row", gap: 10 },
  column: { flex: 1 },
  field: { marginBottom: 9, flex: 1 },
  label: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#58657A", marginBottom: 5 },
  required: { color: "#E84D61" },
  inputWrap: { minHeight: 44, borderWidth: 1, borderColor: "#E2E5ED", borderRadius: 10, paddingHorizontal: 11, flexDirection: "row", alignItems: "center" },
  readOnlyInput: { backgroundColor: "#F8F8FB" },
  input: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 11, color: "#263047", marginLeft: 8, paddingVertical: 8 },
  optionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 3 },
  optionButton: { minHeight: 37, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: "#E2E5ED", backgroundColor: "#FFF", flexDirection: "row", alignItems: "center", gap: 6 },
  optionButtonActive: { backgroundColor: "#F1EAFF", borderColor: "#7040D5" },
  disabledOption: { opacity: 0.5 },
  optionText: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#58657A" },
  optionTextActive: { fontFamily: "PoppinsSemiBold", color: "#7040D5" },
  helper: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#8994A7", lineHeight: 15, marginTop: 3, flexShrink: 1 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  spacer: { height: 13 },
  assignmentDetails: { marginTop: 10, padding: 11, borderRadius: 10, backgroundColor: "#F8F5FF", gap: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#4E5A6F", flexShrink: 1 },
  info: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#F2EDFF", borderRadius: 11, padding: 11, marginBottom: 12, gap: 8 },
  infoText: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 10, color: "#675D7A", lineHeight: 15 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 2 },
  cancel: { minHeight: 42, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDDDE5", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cancelText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#687388" },
  save: { minHeight: 42, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  saveDisabled: { opacity: 0.7 },
  saveText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#FFF" },
});
