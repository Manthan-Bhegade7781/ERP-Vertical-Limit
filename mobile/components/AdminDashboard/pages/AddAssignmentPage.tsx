import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type SelectOption = { label: string; value: string; standard?: string };
type ApiRecord = Record<string, any>;
type Props = {
  /** Optional callback to run after successful creation, e.g. refresh the assignments list. */
  onCreated?: () => void;
};

const ASSIGNMENT_TYPES: SelectOption[] = [
  { label: "Homework", value: "homework" },
  { label: "Practice Set", value: "practice_set" },
  { label: "Worksheet", value: "worksheet" },
  { label: "Project", value: "project" },
  { label: "Revision Assignment", value: "revision" },
];

const firstString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
};

function unwrapList(payload: any): ApiRecord[] {
  // The ERP list APIs commonly return { success: true, data: { batches: [...] } }
  // or { success: true, data: { subjects: [...] } }. Support those shapes as well
  // as plain arrays and the other response wrappers used by existing screens.
  if (Array.isArray(payload)) return payload;
  const keys = ["batches", "subjects", "results", "items", "data"];
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    if (Array.isArray(payload?.data?.data?.[key])) return payload.data.data[key];
  }
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function getId(item: ApiRecord): string {
  return firstString(item?._id, item?.id, item?.batchId, item?.subjectId);
}

function getStandard(item: ApiRecord): string {
  const standard = item?.standardId ?? item?.standard;
  if (typeof standard === "string") return standard;
  if (standard && typeof standard === "object") {
    return firstString(standard.name, standard.title, standard.standardName, standard.label, standard.className);
  }
  return firstString(item?.standardName, item?.className, item?.grade, item?.class);
}

function getBatchLabel(item: ApiRecord): string {
  const standard = getStandard(item);
  const name = firstString(item?.batchName, item?.name, item?.title, item?.batchCode);
  const timing = firstString(item?.timing, item?.shift, item?.schedule);
  const parts = [standard, name, timing].filter(Boolean);
  return parts.length ? [...new Set(parts)].join(" · ") : "Unnamed batch";
}

function getSubjectLabel(item: ApiRecord): string {
  return firstString(item?.subjectName, item?.name, item?.title, item?.subjectCode) || "Unnamed subject";
}

function parseDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null;
  return date;
}

function toIsoDate(value: string): string {
  const date = parseDate(value)!;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function readResponse(response: Response): Promise<any> {
  const text = await response.text();
  let body: any = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { message: text }; }
  if (!response.ok) {
    const message = firstString(body?.message, body?.error, body?.errors?.[0]?.message) || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

function SelectField({ label, value, placeholder, options, onChange, required, disabled, loading }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label || "";
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading || options.length === 0}
        style={[styles.select, (disabled || loading) && styles.disabledField]}
        onPress={() => setOpen((previous) => !previous)}
      >
        <Text numberOfLines={1} style={[styles.selectText, !selectedLabel && styles.placeholderText]}>
          {loading ? "Loading options…" : selectedLabel || placeholder}
        </Text>
        {loading ? <ActivityIndicator size="small" color="#7040D5" /> : <MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={20} color="#73778A" />}
      </Pressable>
      {open && !disabled && !loading ? (
        <View style={styles.dropdown}>
          <ScrollView nestedScrollEnabled style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <Pressable key={option.value} style={[styles.dropdownItem, selected && styles.dropdownItemSelected]} onPress={() => { onChange(option.value); setOpen(false); }}>
                  <Text style={[styles.dropdownItemText, selected && styles.dropdownItemTextSelected]}>{option.label}</Text>
                  {selected ? <MaterialCommunityIcons name="check" size={18} color="#7040D5" /> : null}
                </Pressable>
              );
            })}
            {!options.length ? <Text style={styles.emptyOption}>No options available.</Text> : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export default function AdminAddAssignmentPage({ onCreated }: Props) {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentCode, setAssignmentCode] = useState("");
  const [batchId, setBatchId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pdf, setPdf] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [batches, setBatches] = useState<ApiRecord[]>([]);
  const [subjects, setSubjects] = useState<ApiRecord[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error("Your session has expired. Please log in again.");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    setOptionsError("");
    try {
      const headers = await getAuthHeaders();
      const [batchResponse, subjectResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/batches`, { headers }),
        fetch(`${API_BASE_URL}/subjects`, { headers }),
      ]);
      const [batchPayload, subjectPayload] = await Promise.all([readResponse(batchResponse), readResponse(subjectResponse)]);
      const batchList = unwrapList(batchPayload).filter((item) => getId(item));
      const subjectList = unwrapList(subjectPayload).filter((item) => getId(item));
      setBatches(batchList);
      setSubjects(subjectList);
      if (!batchList.length || !subjectList.length) {
        const missing = [!batchList.length ? "batches" : "", !subjectList.length ? "subjects" : ""].filter(Boolean).join(" and ");
        setOptionsError(`The API response was successful, but no ${missing} could be read from it. Check the response shape in the backend list controller.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load batches and subjects.";
      setOptionsError(`${message} Check that your backend exposes the /batches and /subjects list endpoints.`);
    } finally {
      setLoadingOptions(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => { void loadOptions(); }, [loadOptions]);

  const batchOptions = useMemo<SelectOption[]>(() => batches.map((batch) => ({
    label: getBatchLabel(batch), value: getId(batch), standard: getStandard(batch),
  })), [batches]);

  const selectedBatch = batches.find((item) => getId(item) === batchId);
  const selectedStandard = selectedBatch ? getStandard(selectedBatch) : "";
  const subjectOptions = useMemo<SelectOption[]>(() => {
    const activeSubjects = subjects.filter((subject) => {
      const subjectStandard = getStandard(subject);
      return !selectedStandard || !subjectStandard || subjectStandard.toLowerCase() === selectedStandard.toLowerCase();
    });
    return activeSubjects.map((subject) => ({ label: getSubjectLabel(subject), value: getId(subject) }));
  }, [subjects, selectedStandard]);

  useEffect(() => {
    if (subjectId && !subjectOptions.some((subject) => subject.value === subjectId)) setSubjectId("");
  }, [subjectId, subjectOptions]);

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", multiple: false, copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];
      if (!file.name.toLowerCase().endsWith(".pdf") || (file.mimeType && file.mimeType !== "application/pdf")) {
        Alert.alert("Invalid file", "Please select a PDF document.");
        return;
      }
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert("File too large", "Please select a PDF smaller than 10 MB.");
        return;
      }
      setPdf(file);
    } catch (error) {
      console.error("Assignment PDF picker error:", error);
      Alert.alert("PDF Error", "Unable to select the PDF file.");
    }
  };

  const handleCreate = async () => {
    if (saving) return;
    if (!assignmentTitle.trim() || !assignmentCode.trim() || !batchId || !subjectId || !assignmentType || !assignedDate.trim() || !submissionDate.trim() || !totalMarks.trim()) {
      Alert.alert("Required Fields", "Please fill all required assignment details marked with *.");
      return;
    }
    const assigned = parseDate(assignedDate);
    const due = parseDate(submissionDate);
    if (!assigned || !due) {
      Alert.alert("Invalid Date", "Enter both dates in DD/MM/YYYY format.");
      return;
    }
    if (due < assigned) {
      Alert.alert("Invalid Due Date", "The due date cannot be earlier than the assigned date.");
      return;
    }
    const marks = Number(totalMarks);
    if (!Number.isFinite(marks) || marks <= 0) {
      Alert.alert("Invalid Marks", "Total marks must be a number greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("assignmentTitle", assignmentTitle.trim());
      formData.append("assignmentCode", assignmentCode.trim().toUpperCase());
      formData.append("batchId", batchId);
      formData.append("subjectId", subjectId);
      formData.append("assignmentType", assignmentType);
      formData.append("assignedDate", toIsoDate(assignedDate));
      formData.append("submissionDate", toIsoDate(submissionDate));
      formData.append("totalMarks", String(marks));
      formData.append("description", description.trim());
      formData.append("instructions", instructions.trim());
      if (pdf) {
        formData.append("attachment", {
          uri: pdf.uri,
          name: pdf.name || "assignment.pdf",
          type: pdf.mimeType || "application/pdf",
        } as any);
      }
      const response = await fetch(`${API_BASE_URL}/assignments`, { method: "POST", headers, body: formData });
      await readResponse(response);
      Alert.alert("Assignment Created", "The assignment was successfully added for the selected batch.", [
        { text: "OK", onPress: () => { onCreated?.(); router.back(); } },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create assignment.";
      Alert.alert("Could Not Add Assignment", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
            <MaterialCommunityIcons name="arrow-left" size={21} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Add Assignment</Text>
        </View>
      </View>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.pageTitleRow}>
            <View style={styles.pageTitleIcon}><MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#7040D5" /></View>
            <View style={styles.pageTitleContent}>
              <Text style={styles.pageTitle}>Assignment Information</Text>
              <Text style={styles.pageSubtitle}>Create and assign academic work to students in your branch</Text>
            </View>
          </View>

          {optionsError ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={19} color="#B42332" />
              <View style={styles.errorContent}><Text style={styles.errorText}>{optionsError}</Text><Pressable onPress={() => void loadOptions()}><Text style={styles.retryText}>Retry loading</Text></Pressable></View>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.sectionHeader}><View style={styles.sectionIconPurple}><MaterialCommunityIcons name="clipboard-edit-outline" size={19} color="#7040D5" /></View><View><Text style={styles.sectionTitle}>Basic Information</Text><Text style={styles.sectionSubtitle}>Enter assignment details and choose the target class</Text></View></View>
            <View style={styles.fieldWrapper}><Text style={styles.label}>Assignment Title<Text style={styles.required}> *</Text></Text><TextInput value={assignmentTitle} onChangeText={setAssignmentTitle} placeholder="Enter assignment title" placeholderTextColor="#A1A5B3" style={styles.input} maxLength={150} /></View>
            <View style={styles.fieldWrapper}><Text style={styles.label}>Assignment Code<Text style={styles.required}> *</Text></Text><TextInput value={assignmentCode} onChangeText={setAssignmentCode} placeholder="e.g. PHY-ASSIGN-001" placeholderTextColor="#A1A5B3" autoCapitalize="characters" style={styles.input} maxLength={50} /></View>
            <View style={styles.fieldWrapper}><SelectField label="Assigned Batch" value={batchId} placeholder="Select your branch batch" options={batchOptions} onChange={(value) => { setBatchId(value); setSubjectId(""); }} required loading={loadingOptions} disabled={saving} /></View>
            {selectedStandard ? <View style={styles.standardHint}><MaterialCommunityIcons name="school-outline" size={15} color="#7040D5" /><Text style={styles.standardHintText}>Standard: {selectedStandard}</Text></View> : null}
            <View style={styles.fieldWrapper}><SelectField label="Subject" value={subjectId} placeholder={batchId ? "Select subject" : "Select a batch first"} options={subjectOptions} onChange={setSubjectId} required loading={loadingOptions} disabled={!batchId || saving} /></View>
            <View style={styles.fieldWrapper}><SelectField label="Assignment Type" value={assignmentType} placeholder="Select assignment type" options={ASSIGNMENT_TYPES} onChange={setAssignmentType} required disabled={saving} /></View>
            <View style={styles.fieldWrapper}><Text style={styles.label}>Total Marks<Text style={styles.required}> *</Text></Text><TextInput value={totalMarks} onChangeText={setTotalMarks} placeholder="e.g. 100" placeholderTextColor="#A1A5B3" keyboardType="numeric" style={styles.input} /></View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}><View style={styles.sectionIconBlue}><MaterialCommunityIcons name="calendar-clock-outline" size={19} color="#4386E8" /></View><View><Text style={styles.sectionTitle}>Assignment Schedule</Text><Text style={styles.sectionSubtitle}>Set when the assignment is given and when it is due</Text></View></View>
            <View style={styles.twoColumnRow}>
              <View style={styles.column}><View style={styles.fieldWrapper}><Text style={styles.label}>Assigned Date<Text style={styles.required}> *</Text></Text><View style={styles.inputWithIcon}><TextInput value={assignedDate} onChangeText={setAssignedDate} placeholder="DD/MM/YYYY" placeholderTextColor="#A1A5B3" style={styles.iconInput} maxLength={10} /><MaterialCommunityIcons name="calendar-outline" size={19} color="#7B8090" /></View></View></View>
              <View style={styles.column}><View style={styles.fieldWrapper}><Text style={styles.label}>Due Date<Text style={styles.required}> *</Text></Text><View style={styles.inputWithIcon}><TextInput value={submissionDate} onChangeText={setSubmissionDate} placeholder="DD/MM/YYYY" placeholderTextColor="#A1A5B3" style={styles.iconInput} maxLength={10} /><MaterialCommunityIcons name="calendar-check-outline" size={19} color="#7B8090" /></View></View></View>
            </View>
            <Text style={styles.dateHint}>Use DD/MM/YYYY, for example 05/11/2026.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}><View style={styles.sectionIconOrange}><MaterialCommunityIcons name="text-box-outline" size={19} color="#E28A36" /></View><View><Text style={styles.sectionTitle}>Assignment Details</Text><Text style={styles.sectionSubtitle}>Add a description and instructions for students</Text></View></View>
            <View style={styles.fieldWrapper}><Text style={styles.label}>Description</Text><TextInput value={description} onChangeText={setDescription} placeholder="Enter assignment description…" placeholderTextColor="#A1A5B3" multiline textAlignVertical="top" style={styles.textArea} maxLength={3000} /></View>
            <View style={styles.fieldWrapper}><Text style={styles.label}>Instructions</Text><TextInput value={instructions} onChangeText={setInstructions} placeholder="Enter instructions for students…" placeholderTextColor="#A1A5B3" multiline textAlignVertical="top" style={styles.textArea} maxLength={3000} /></View>
          </View>

          <View style={styles.infoBox}><View style={styles.infoIcon}><MaterialCommunityIcons name="information-outline" size={18} color="#7040D5" /></View><View style={styles.infoContent}><Text style={styles.infoTitle}>Before adding assignment</Text><Text style={styles.infoText}>Confirm the selected batch, subject, due date, and total marks. The assignment is created under your admin branch and will be available to students in the selected batch.</Text></View></View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}><View style={styles.sectionIconPurple}><MaterialCommunityIcons name="file-pdf-box" size={19} color="#7040D5" /></View><View style={styles.sectionHeaderContent}><Text style={styles.sectionTitle}>Attachment PDF</Text><Text style={styles.sectionSubtitle}>Optional · PDF only · maximum 10 MB</Text></View></View>
            <Pressable style={styles.pdfButton} onPress={handlePickPdf} disabled={saving}><MaterialCommunityIcons name="folder-open-outline" size={19} color="#7040D5" /><Text style={styles.pdfButtonText} numberOfLines={1}>{pdf?.name || "Select PDF"}</Text></Pressable>
            {pdf ? <View style={styles.selectedPdfRow}><MaterialCommunityIcons name="file-pdf-box" size={20} color="#D84343" /><Text style={styles.selectedPdfName} numberOfLines={1}>{pdf.name}</Text><Pressable onPress={() => setPdf(null)} disabled={saving} accessibilityLabel="Remove PDF"><MaterialCommunityIcons name="close-circle-outline" size={19} color="#8A8F9F" /></Pressable></View> : null}
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.cancelButton, saving && styles.disabledButton]} onPress={() => router.back()} disabled={saving}><Text style={styles.cancelButtonText}>Cancel</Text></Pressable>
            <Pressable style={[styles.addButton, (saving || loadingOptions) && styles.disabledButton]} onPress={handleCreate} disabled={saving || loadingOptions}>
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="plus" size={19} color="#FFFFFF" />}
              <Text style={styles.addButtonText}>{saving ? "Adding…" : "Add Assignment"}</Text>
            </Pressable>
          </View>
          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#7040D5" },
  header: { height: 64, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backButton: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: 10 },
  headerTitle: { fontFamily: "PoppinsSemiBold", fontSize: 17, color: "#FFFFFF" },
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  contentContainer: { paddingHorizontal: 15, paddingTop: 16, paddingBottom: 20 },
  pageTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  pageTitleIcon: { width: 43, height: 43, borderRadius: 12, backgroundColor: "#EEE8FB", alignItems: "center", justifyContent: "center", marginRight: 11 },
  pageTitleContent: { flex: 1 },
  pageTitle: { fontFamily: "PoppinsSemiBold", fontSize: 16, color: "#262838" },
  pageSubtitle: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#858998", marginTop: 1 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 15, borderWidth: 1, borderColor: "#EEF0F5", padding: 15, marginBottom: 13, shadowColor: "#202124", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionIconPurple: { width: 37, height: 37, borderRadius: 10, backgroundColor: "#F0EAFE", alignItems: "center", justifyContent: "center", marginRight: 10 },
  sectionIconBlue: { width: 37, height: 37, borderRadius: 10, backgroundColor: "#EAF2FE", alignItems: "center", justifyContent: "center", marginRight: 10 },
  sectionIconOrange: { width: 37, height: 37, borderRadius: 10, backgroundColor: "#FFF2E5", alignItems: "center", justifyContent: "center", marginRight: 10 },
  sectionTitle: { fontFamily: "PoppinsSemiBold", fontSize: 12.5, color: "#292B39" },
  sectionSubtitle: { fontFamily: "PoppinsRegular", fontSize: 9, color: "#9295A2", marginTop: 1 },
  fieldWrapper: { marginBottom: 12 },
  label: { fontFamily: "PoppinsMedium", fontSize: 9.5, color: "#555866", marginBottom: 5 },
  required: { color: "#E04B5D" },
  input: { height: 44, borderWidth: 1, borderColor: "#E3E6ED", borderRadius: 10, paddingHorizontal: 12, backgroundColor: "#FFFFFF", fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#303240" },
  inputWithIcon: { height: 44, borderWidth: 1, borderColor: "#E3E6ED", borderRadius: 10, paddingLeft: 12, paddingRight: 12, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  iconInput: { flex: 1, height: 42, fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#303240", paddingHorizontal: 0 },
  textArea: { minHeight: 90, borderWidth: 1, borderColor: "#E3E6ED", borderRadius: 10, paddingHorizontal: 12, paddingTop: 11, paddingBottom: 10, backgroundColor: "#FFFFFF", fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#303240" },
  twoColumnRow: { flexDirection: "row", gap: 10 },
  column: { flex: 1, minWidth: 0 },
  select: { minHeight: 44, borderWidth: 1, borderColor: "#E3E6ED", borderRadius: 10, paddingHorizontal: 11, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  selectText: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 10, color: "#303240", marginRight: 6 },
  placeholderText: { color: "#A1A5B3" },
  disabledField: { opacity: 0.65, backgroundColor: "#F8F8FB" },
  dropdown: { marginTop: 4, borderWidth: 1, borderColor: "#E4E6ED", borderRadius: 10, backgroundColor: "#FFFFFF", overflow: "hidden", elevation: 5, shadowColor: "#202124", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5 },
  dropdownScroll: { maxHeight: 220 },
  dropdownItem: { minHeight: 42, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#F0F1F5", gap: 8 },
  dropdownItemSelected: { backgroundColor: "#F5F1FD" },
  dropdownItemText: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 10, color: "#4A4D5A" },
  dropdownItemTextSelected: { fontFamily: "PoppinsMedium", color: "#7040D5" },
  emptyOption: { padding: 12, fontFamily: "PoppinsRegular", fontSize: 10, color: "#9295A2" },
  standardHint: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: -4, marginBottom: 12 },
  standardHintText: { fontFamily: "PoppinsMedium", fontSize: 9.5, color: "#7040D5" },
  dateHint: { marginTop: -4, fontFamily: "PoppinsRegular", fontSize: 9, color: "#9295A2" },
  infoBox: { flexDirection: "row", backgroundColor: "#F3EEFD", borderWidth: 1, borderColor: "#E7DDFB", borderRadius: 12, padding: 12, marginBottom: 15 },
  sectionHeaderContent: { flex: 1, minWidth: 0, justifyContent: "center" },
  infoIcon: { width: 29, height: 29, borderRadius: 8, backgroundColor: "#E7DDFB", alignItems: "center", justifyContent: "center", marginRight: 9 },
  infoContent: { flex: 1 },
  infoTitle: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#4B347D", marginBottom: 2 },
  infoText: { fontFamily: "PoppinsRegular", fontSize: 8.8, lineHeight: 14, color: "#68627A" },
  pdfButton: { minHeight: 43, width: "100%", borderRadius: 10, borderWidth: 1, borderColor: "#DCCFF7", backgroundColor: "#F7F3FD", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 10, gap: 8 },
  pdfButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#7040D5", flex: 1, minWidth: 0, textAlign: "center" },
  selectedPdfRow: { width: "100%", minHeight: 46, marginTop: 10, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#E6DDF7", backgroundColor: "#FBF9FE", flexDirection: "row", alignItems: "center", gap: 8 },
  selectedPdfName: { flex: 1, minWidth: 0, maxWidth: "100%", fontFamily: "PoppinsMedium", fontSize: 10, color: "#343746" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelButton: { height: 43, minWidth: 92, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1, borderColor: "#DCDDE5", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  cancelButtonText: { fontFamily: "PoppinsMedium", fontSize: 10.5, color: "#666978" },
  addButton: { minHeight: 43, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  addButtonText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#FFFFFF" },
  disabledButton: { opacity: 0.65 },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 12, marginBottom: 13, borderRadius: 10, borderWidth: 1, borderColor: "#F2C6CB", backgroundColor: "#FFF3F4" },
  errorContent: { flex: 1 },
  errorText: { fontFamily: "PoppinsRegular", fontSize: 10, lineHeight: 15, color: "#8F2632" },
  retryText: { marginTop: 7, fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#7040D5" },
  bottomSpace: { height: 20 },
});
