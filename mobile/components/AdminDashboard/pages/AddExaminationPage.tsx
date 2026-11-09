import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type SelectOption = { label: string; value: string };
type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  options: SelectOption[];
  onSelect: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
};
type Batch = { _id: string; name?: string; code?: string; standard?: string; academicYear?: string; branchId?: any; isArchived?: boolean; status?: string };
type Subject = { _id: string; name?: string; code?: string; standard?: string };
type BatchSubject = { subjectId?: string | Subject; subject?: string | Subject; _id?: string };

function getArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.batches)) return payload.data.batches;
  if (Array.isArray(payload?.data?.subjects)) return payload.data.subjects;
  if (Array.isArray(payload?.batches)) return payload.batches;
  if (Array.isArray(payload?.subjects)) return payload.subjects;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function SelectField({ label, value, placeholder, icon, options, onSelect, required = false, disabled = false }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
      <TouchableOpacity
        style={[styles.selectWrapper, disabled && { opacity: 0.55 }]}
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => setOpen((current) => !current)}
      >
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />
        <Text style={[styles.selectText, !selectedLabel && styles.placeholderText]} numberOfLines={1}>
          {selectedLabel || placeholder}
        </Text>
        <MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={20} color="#8994A7" />
      </TouchableOpacity>
      {open && !disabled && (
        <View style={styles.dropdown}>
          {options.length === 0 ? (
            <View style={styles.dropdownItem}><Text style={styles.dropdownText}>No options available</Text></View>
          ) : options.map((option) => (
            <TouchableOpacity key={option.value} style={[styles.dropdownItem, value === option.value && styles.dropdownItemActive]} activeOpacity={0.8}
              onPress={() => { onSelect(option.value); setOpen(false); }}>
              <Text style={[styles.dropdownText, value === option.value && styles.dropdownTextActive]}>{option.label}</Text>
              {value === option.value && <MaterialCommunityIcons name="check" size={18} color="#7040D5" />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function DateTimeField({ label, value, placeholder, icon, onChange, keyboardType = "default", required = false }: {
  label: string; value: string; placeholder: string; icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onChange: (value: string) => void; keyboardType?: "default" | "numeric"; required?: boolean;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
      <View style={styles.textInputWrapper}>
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />
        <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#9AA2B1"
          keyboardType={keyboardType} style={styles.textInput} />
      </View>
    </View>
  );
}

export default function AddExaminationPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const [examName, setExamName] = useState("");
  const [examId, setExamId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("120");
  const [totalMarks, setTotalMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [instructions, setInstructions] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<Subject[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const token = await getToken();
    if (!token) throw new Error("Your session has expired. Please log in again.");
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.message || `Request failed (${response.status}).`);
    }
    return payload;
  }, []);

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const payload = await request("/batches");
      const items = getArray(payload).filter((item: any) => item && item._id && item.isArchived !== true && item.status !== "inactive");
      setBatches(items);
    } catch (error: any) {
      Alert.alert("Unable to Load Batches", error?.message || "Please try again.");
      setBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  }, [request]);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const loadSubjectsForBatch = useCallback(
  async (selectedBatchId: string) => {
    setSubjectId("");
    setBatchSubjects([]);

    if (!selectedBatchId) return;

    setLoadingSubjects(true);

    try {
      const payload = await request(
        `/batch-subjects/batch/${selectedBatchId}`
      );

      console.log(
        "Batch-subject API response:",
        JSON.stringify(payload, null, 2)
      );

      const assignments: any[] =
        Array.isArray(payload?.data?.batchSubjects)
          ? payload.data.batchSubjects
          : Array.isArray(payload?.data?.assignments)
          ? payload.data.assignments
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.batchSubjects)
          ? payload.batchSubjects
          : Array.isArray(payload?.assignments)
          ? payload.assignments
          : Array.isArray(payload)
          ? payload
          : [];

      // Extract populated subjects and IDs from assignments.
      const populatedSubjects: Subject[] = [];
      const subjectIds = new Set<string>();

      for (const assignment of assignments) {
        if (
          assignment.status &&
          assignment.status !== "active"
        ) {
          continue;
        }

        const raw =
          assignment.subjectId ?? assignment.subject;

        if (raw && typeof raw === "object" && raw._id) {
          populatedSubjects.push(raw as Subject);
        } else if (typeof raw === "string") {
          subjectIds.add(raw);
        }
      }

      // If assignments contain only IDs, resolve them through /subjects.
      let resolvedSubjects = [...populatedSubjects];

      if (subjectIds.size > 0) {
        const subjectPayload = await request("/subjects");

        console.log(
          "Subjects API response:",
          JSON.stringify(subjectPayload, null, 2)
        );

        const allSubjects: Subject[] = getArray(subjectPayload);

        const subjectsById = new Map(
          allSubjects.map((subject) => [subject._id, subject])
        );

        for (const id of subjectIds) {
          const subject = subjectsById.get(id);
          if (subject) resolvedSubjects.push(subject);
        }
      }

      const uniqueSubjects = Array.from(
        new Map(
          resolvedSubjects
            .filter((subject) => subject?._id && subject.name)
            .map((subject) => [subject._id, subject])
        ).values()
      );

      setBatchSubjects(uniqueSubjects);

      if (uniqueSubjects.length === 0) {
        Alert.alert(
          "No Assigned Subjects",
          "No active assigned subjects were found for this batch."
        );
      }
    } catch (error: any) {
      console.error("Load batch subjects error:", error);

      Alert.alert(
        "Unable to Load Subjects",
        error?.message || "Could not load subjects for this batch."
      );

      setBatchSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  },
  [request]
);

  const batchOptions = useMemo<SelectOption[]>(() => batches.map((item) => ({
    label: [item.name || item.code || "Unnamed Batch", item.standard].filter(Boolean).join(" • "),
    value: item._id,
  })), [batches]);
  const subjectOptions = useMemo<SelectOption[]>(() => batchSubjects.map((item) => ({
    label: item.name || item.code || "Unnamed Subject",
    value: item._id,
  })), [batchSubjects]);

  const isValidDate = (value: string) => {
    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;
    const day = Number(match[1]); const month = Number(match[2]); const year = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
  };
  const isValidTime = (value: string) => /^(?:(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM)|(?:[01]\d|2[0-3]):[0-5]\d)$/i.test(value.trim());

  const handleSave = async () => {
    if (!examName.trim() || !examId.trim() || !batchId || !subjectId || !date.trim() || !time.trim() || !duration.trim() || !totalMarks.trim() || !passingMarks.trim()) {
      Alert.alert("Required Fields", "Please fill all required examination details.");
      return;
    }
    if (!isValidDate(date)) {
      Alert.alert("Invalid Date", "Enter the date in DD/MM/YYYY format, for example 22/09/2026.");
      return;
    }
    if (!isValidTime(time)) {
      Alert.alert("Invalid Time", "Enter a time such as 10:00 AM or 14:00.");
      return;
    }
    const durationNumber = Number(duration);
    const total = Number(totalMarks);
    const passing = Number(passingMarks);
    if (!Number.isInteger(durationNumber) || durationNumber <= 0) {
      Alert.alert("Invalid Duration", "Duration must be a positive number of minutes."); return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      Alert.alert("Invalid Total Marks", "Total marks must be greater than zero."); return;
    }
    if (!Number.isFinite(passing) || passing < 0 || passing > total) {
      Alert.alert("Invalid Passing Marks", "Passing marks must be between zero and total marks."); return;
    }

    const [day, month, year] = date.split("/");
    const apiDate = `${year}-${month}-${day}`;
    setSaving(true);
    try {
      await request("/examinations", {
        method: "POST",
        body: JSON.stringify({
          examinationName: examName.trim(),
          examinationCode: examId.trim().toUpperCase(),
          batchId,
          subjectId,
          examinationDate: apiDate,
          startTime: time.trim().toUpperCase(),
          durationMinutes: durationNumber,
          totalMarks: total,
          passingMarks: passing,
          instructions: instructions.trim(),
        }),
      });
      Alert.alert("Examination Added", `${examName.trim()} has been scheduled successfully.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Unable to Add Examination", error?.message || "Please check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { paddingTop: insets.top + 8, minHeight: insets.top + 66 }]}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}><Text style={styles.headerTitle}>Add Examination</Text></View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, isTablet && styles.contentTablet]} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Examination Management</Text>
          <Text style={styles.pageSubtitle}>Create and schedule examinations for your assigned branch.</Text>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconPurple}><MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#7040D5" /></View>
              <View style={styles.sectionHeaderText}><Text style={styles.sectionTitle}>Examination Information</Text><Text style={styles.sectionSubtitle}>Basic examination details</Text></View>
            </View>
            <View style={styles.twoColumn}>
              <View style={styles.column}><View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Examination Name <Text style={styles.required}>*</Text></Text>
                <View style={styles.textInputWrapper}><MaterialCommunityIcons name="file-document-outline" size={19} color="#7040D5" /><TextInput value={examName} onChangeText={setExamName} placeholder="Enter examination name" placeholderTextColor="#9AA2B1" style={styles.textInput} /></View>
              </View></View>
              <View style={styles.column}><View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Examination Code <Text style={styles.required}>*</Text></Text>
                <View style={styles.textInputWrapper}><MaterialCommunityIcons name="identifier" size={19} color="#7040D5" /><TextInput value={examId} onChangeText={setExamId} placeholder="e.g. EXM-001" placeholderTextColor="#9AA2B1" autoCapitalize="characters" style={styles.textInput} /></View>
              </View></View>
            </View>
            <View style={styles.twoColumn}>
              <View style={styles.column}><SelectField label="Assigned Batch" required value={batchId} placeholder={loadingBatches ? "Loading batches..." : "Select batch"} icon="google-circles-communities" options={batchOptions} disabled={loadingBatches} onSelect={(value) => { setBatchId(value); loadSubjectsForBatch(value); }} /></View>
              <View style={styles.column}><SelectField label="Subject" required value={subjectId} placeholder={loadingSubjects ? "Loading subjects..." : batchId ? "Select subject" : "Select batch first"} icon="book-open-outline" options={subjectOptions} disabled={!batchId || loadingSubjects} onSelect={setSubjectId} /></View>
            </View>
            {loadingBatches && <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}><ActivityIndicator size="small" color="#7040D5" /><Text style={[styles.loadingText, { marginLeft: 8, marginBottom: 0 }]}>Loading available batches...</Text></View>}
            {!loadingBatches && batches.length === 0 && <Text style={styles.loadingText}>No batches available for your account.</Text>}
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}><View style={styles.sectionIconBlue}><MaterialCommunityIcons name="calendar-clock-outline" size={20} color="#2675E8" /></View><View style={styles.sectionHeaderText}><Text style={styles.sectionTitle}>Examination Schedule</Text><Text style={styles.sectionSubtitle}>Date, time and duration</Text></View></View>
            <View style={styles.twoColumn}>
              <View style={styles.column}><DateTimeField label="Date" required value={date} onChange={setDate} placeholder="DD/MM/YYYY" icon="calendar-outline" /></View>
              <View style={styles.column}><DateTimeField label="Start Time" required value={time} onChange={setTime} placeholder="e.g. 10:00 AM" icon="clock-outline" /></View>
            </View>
            <View style={styles.twoColumn}>
              <View style={styles.column}><SelectField label="Duration" required value={duration} placeholder="Select duration" icon="timer-outline" options={[{ label: "30 Minutes", value: "30" }, { label: "45 Minutes", value: "45" }, { label: "60 Minutes", value: "60" }, { label: "90 Minutes", value: "90" }, { label: "120 Minutes", value: "120" }, { label: "180 Minutes", value: "180" }]} onSelect={setDuration} /></View>
              <View style={styles.column}><DateTimeField label="Total Marks" required value={totalMarks} onChange={setTotalMarks} placeholder="e.g. 100" icon="numeric" keyboardType="numeric" /></View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}><View style={styles.sectionIconPurple}><MaterialCommunityIcons name="chart-box-outline" size={20} color="#7040D5" /></View><View style={styles.sectionHeaderText}><Text style={styles.sectionTitle}>Marks & Instructions</Text><Text style={styles.sectionSubtitle}>Set passing criteria and optional instructions</Text></View></View>
            <View style={styles.twoColumn}>
              <View style={styles.column}><DateTimeField label="Passing Marks" required value={passingMarks} onChange={setPassingMarks} placeholder="e.g. 35" icon="check-circle-outline" keyboardType="numeric" /></View>
              <View style={styles.column}><View style={styles.fieldContainer}><Text style={styles.fieldLabel}>Instructions</Text><View style={styles.textInputWrapper}><MaterialCommunityIcons name="text-box-outline" size={19} color="#7040D5" /><TextInput value={instructions} onChangeText={setInstructions} placeholder="Optional instructions" placeholderTextColor="#9AA2B1" style={styles.textInput} /></View></View></View>
            </View>
            <View style={styles.infoNotice}><MaterialCommunityIcons name="information-outline" size={20} color="#7040D5" /><Text style={styles.infoText}>The examination will be created for the selected batch and its assigned subject. Branch access must be enforced by the backend.</Text></View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={() => router.back()} disabled={saving}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} activeOpacity={0.85} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="content-save-outline" size={19} color="#FFFFFF" />}
              <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Examination"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: "#7040D5",
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  headerEditButton: {
    minWidth: 74,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerEditText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#7040D5",
    marginLeft: 5,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  contentTablet: {
    paddingHorizontal: 30,
  },
  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 23,
    color: "#172033",
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#7C879A",
    marginTop: 3,
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionIconPurple: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F0E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionIconBlue: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
    color: "#202A3D",
  },
  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8994A7",
    marginTop: 2,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#58657A",
    marginBottom: 7,
  },
  required: {
    color: "#E84D61",
  },
  textInputWrapper: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11.5,
    color: "#263047",
    marginLeft: 9,
    paddingVertical: 9,
  },
  selectWrapper: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11.5,
    color: "#263047",
    marginLeft: 9,
  },
  placeholderText: {
    color: "#9AA2B1",
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 4,
    zIndex: 20,
  },
  dropdownItem: {
    minHeight: 42,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },
  dropdownItemActive: {
    backgroundColor: "#F4EEFF",
  },
  dropdownText: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#4E5A6F",
  },
  dropdownTextActive: {
    fontFamily: "PoppinsSemiBold",
    color: "#7040D5",
  },
  infoNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F2EDFF",
    borderRadius: 13,
    padding: 14,
    marginBottom: 18,
  },
  infoText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#675D7A",
    lineHeight: 17,
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 20,
  },
  cancelButton: {
    minHeight: 46,
    paddingHorizontal: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDE5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#687388",
  },
  saveButton: {
    minHeight: 46,
    paddingHorizontal: 22,
    borderRadius: 11,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  loadingText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7040D5",
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.65,
  },
});
