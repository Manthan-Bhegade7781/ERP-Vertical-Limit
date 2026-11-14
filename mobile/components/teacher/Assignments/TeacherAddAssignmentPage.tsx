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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type SelectOption = { label: string; value: string; standard?: string };
type ApiRecord = Record<string, any>;
type Props = {
  onBack: () => void;
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
    return firstString(
      standard.name,
      standard.title,
      standard.standardName,
      standard.label,
      standard.className
    );
  }
  return firstString(
    item?.standardName,
    item?.className,
    item?.grade,
    item?.class
  );
}

function getBatchLabel(item: ApiRecord): string {
  const standard = getStandard(item);
  const name = firstString(
    item?.batchName,
    item?.name,
    item?.title,
    item?.batchCode
  );
  const timing = firstString(item?.timing, item?.shift, item?.schedule);
  const parts = [standard, name, timing].filter(Boolean);
  return parts.length ? [...new Set(parts)].join(" · ") : "Unnamed batch";
}

function getSubjectLabel(item: ApiRecord): string {
  return (
    firstString(
      item?.subjectName,
      item?.name,
      item?.title,
      item?.subjectCode
    ) || "Unnamed subject"
  );
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
  ) {
    return null;
  }
  return date;
}

function toIsoDate(value: string): string {
  const date = parseDate(value)!;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

async function readResponse(response: Response): Promise<any> {
  const text = await response.text();
  let body: any = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text };
  }
  if (!response.ok) {
    const message =
      firstString(body?.message, body?.error, body?.errors?.[0]?.message) ||
      `Request failed (${response.status})`;
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

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
  required,
  disabled,
  loading,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((option) => option.value === value)?.label || "";

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading || options.length === 0}
        style={[
          styles.select,
          (disabled || loading) && styles.disabledField,
        ]}
        onPress={() => setOpen((previous) => !previous)}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.selectText,
            !selectedLabel && styles.placeholderText,
          ]}
        >
          {loading ? "Loading options…" : selectedLabel || placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#5420D8" />
        ) : (
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={18}
            color="#777C89"
          />
        )}
      </Pressable>

      {open && !disabled && !loading ? (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled
            style={styles.dropdownScroll}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    selected && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selected && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color="#5420D8" />
                  ) : null}
                </Pressable>
              );
            })}
            {!options.length ? (
              <Text style={styles.emptyOption}>No options available.</Text>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export default function TeacherAddAssignmentPage({ onBack, onCreated }: Props) {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentCode, setAssignmentCode] = useState("");
  const [batchId, setBatchId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [assignmentType, setAssignmentType] = useState("homework");
  const [assignedDate, setAssignedDate] = useState(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  });
  const [submissionDate, setSubmissionDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pdf, setPdf] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [batches, setBatches] = useState<ApiRecord[]>([]);
  const [subjects, setSubjects] = useState<ApiRecord[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }
    return { Authorization: `Bearer ${token}` };
  }, []);

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    setOptionsError("");
    try {
      const headers = await getAuthHeaders();

      // First try teacher's assigned batches endpoint
      let batchList: ApiRecord[] = [];
      try {
        const teacherBatchRes = await fetch(
          `${API_BASE_URL}/batches/teacher/my-batches`,
          { headers }
        );
        if (teacherBatchRes.ok) {
          const teacherBatchPayload = await readResponse(teacherBatchRes);
          batchList = unwrapList(teacherBatchPayload).filter((item) =>
            getId(item)
          );
        }
      } catch {
        // Fallback below
      }

      // If teacher endpoint didn't return batches, fall back to /batches
      if (!batchList.length) {
        const batchResponse = await fetch(`${API_BASE_URL}/batches`, {
          headers,
        });
        const batchPayload = await readResponse(batchResponse);
        batchList = unwrapList(batchPayload).filter((item) => getId(item));
      }

      // Load subjects
      const subjectResponse = await fetch(`${API_BASE_URL}/subjects`, {
        headers,
      });
      const subjectPayload = await readResponse(subjectResponse);
      const subjectList = unwrapList(subjectPayload).filter((item) =>
        getId(item)
      );

      setBatches(batchList);
      setSubjects(subjectList);

      if (!batchList.length) {
        setOptionsError("No batches assigned to your teacher account yet.");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load batches and subjects.";
      setOptionsError(message);
    } finally {
      setLoadingOptions(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const batchOptions = useMemo<SelectOption[]>(
    () =>
      batches.map((batch) => ({
        label: getBatchLabel(batch),
        value: getId(batch),
        standard: getStandard(batch),
      })),
    [batches]
  );

  const selectedBatch = batches.find((item) => getId(item) === batchId);
  const selectedStandard = selectedBatch ? getStandard(selectedBatch) : "";

  const subjectOptions = useMemo<SelectOption[]>(() => {
    if (
      selectedBatch &&
      Array.isArray(selectedBatch.subjects) &&
      selectedBatch.subjects.length > 0
    ) {
      return selectedBatch.subjects.map((sub: ApiRecord) => ({
        label: getSubjectLabel(sub),
        value: getId(sub),
      }));
    }
    const activeSubjects = subjects.filter((subject) => {
      const subjectStandard = getStandard(subject);
      return (
        !selectedStandard ||
        !subjectStandard ||
        subjectStandard.toLowerCase() === selectedStandard.toLowerCase()
      );
    });
    return activeSubjects.map((subject) => ({
      label: getSubjectLabel(subject),
      value: getId(subject),
    }));
  }, [selectedBatch, subjects, selectedStandard]);

  useEffect(() => {
    if (
      subjectId &&
      !subjectOptions.some((subject) => subject.value === subjectId)
    ) {
      setSubjectId("");
    }
  }, [subjectId, subjectOptions]);

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];
      if (
        !file.name.toLowerCase().endsWith(".pdf") ||
        (file.mimeType && file.mimeType !== "application/pdf")
      ) {
        Alert.alert("Invalid file", "Please select a PDF document.");
        return;
      }
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert(
          "File too large",
          "Please select a PDF smaller than 10 MB."
        );
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

    if (
      !assignmentTitle.trim() ||
      !assignmentCode.trim() ||
      !batchId ||
      !subjectId ||
      !assignmentType ||
      !assignedDate.trim() ||
      !submissionDate.trim() ||
      !totalMarks.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required assignment details marked with *."
      );
      return;
    }

    const assigned = parseDate(assignedDate);
    const due = parseDate(submissionDate);
    if (!assigned || !due) {
      Alert.alert("Invalid Date", "Enter both dates in DD/MM/YYYY format.");
      return;
    }
    if (due < assigned) {
      Alert.alert(
        "Invalid Due Date",
        "The due date cannot be earlier than the assigned date."
      );
      return;
    }
    const marks = Number(totalMarks);
    if (!Number.isFinite(marks) || marks <= 0) {
      Alert.alert(
        "Invalid Marks",
        "Total marks must be a number greater than zero."
      );
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

      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await readResponse(response);

      Alert.alert(
        "Assignment Created",
        result?.message || "Assignment has been published successfully.",
        [
          {
            text: "Done",
            onPress: () => {
              if (onCreated) {
                onCreated();
              } else {
                onBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create assignment.";
      Alert.alert("Could Not Add Assignment", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER CARD - MATCHES ALL TEACHER PAGES */}
      <View style={styles.headerCard}>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back to assignments"
        >
          <Ionicons name="arrow-back" size={26} color="#5420D8" />
        </Pressable>

        <View style={styles.headerIcon}>
          <Ionicons name="document-text-outline" size={25} color="#5420D8" />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Add Assignment</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Create and publish tasks for your classes
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {optionsError ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#B42332"
              />
              <View style={styles.errorContent}>
                <Text style={styles.errorText}>{optionsError}</Text>
                <Pressable onPress={() => void loadOptions()}>
                  <Text style={styles.retryText}>Retry loading</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* CARD 1: BASIC INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="clipboard-outline"
                  size={19}
                  color="#5420D8"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Assignment title, code, and class allocation
                </Text>
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>
                Assignment Title<Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                value={assignmentTitle}
                onChangeText={setAssignmentTitle}
                placeholder="e.g. Chapter 4 Practice Homework"
                placeholderTextColor="#A1A5B3"
                style={styles.input}
                maxLength={150}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>
                Assignment Code<Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                value={assignmentCode}
                onChangeText={setAssignmentCode}
                placeholder="e.g. MTH-HW-001"
                placeholderTextColor="#A1A5B3"
                autoCapitalize="characters"
                style={styles.input}
                maxLength={50}
              />
            </View>

            <SelectField
              label="Assigned Batch"
              value={batchId}
              placeholder="Select your assigned batch"
              options={batchOptions}
              onChange={(value) => {
                setBatchId(value);
                setSubjectId("");
              }}
              required
              loading={loadingOptions}
              disabled={saving}
            />

            {selectedStandard ? (
              <View style={styles.standardHint}>
                <Ionicons name="school-outline" size={14} color="#5420D8" />
                <Text style={styles.standardHintText}>
                  Standard: {selectedStandard}
                </Text>
              </View>
            ) : null}

            <SelectField
              label="Subject"
              value={subjectId}
              placeholder={batchId ? "Select subject" : "Select a batch first"}
              options={subjectOptions}
              onChange={setSubjectId}
              required
              loading={loadingOptions}
              disabled={!batchId || saving}
            />

            <SelectField
              label="Assignment Type"
              value={assignmentType}
              placeholder="Select assignment type"
              options={ASSIGNMENT_TYPES}
              onChange={setAssignmentType}
              required
              disabled={saving}
            />

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>
                Total Marks<Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                value={totalMarks}
                onChangeText={setTotalMarks}
                placeholder="e.g. 100"
                placeholderTextColor="#A1A5B3"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          {/* CARD 2: SCHEDULE */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#5420D8"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Assignment Schedule</Text>
                <Text style={styles.sectionSubtitle}>
                  Set when the assignment is assigned and due
                </Text>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.column}>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>
                    Assigned Date<Text style={styles.required}> *</Text>
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      value={assignedDate}
                      onChangeText={setAssignedDate}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A1A5B3"
                      style={styles.iconInput}
                      maxLength={10}
                    />
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#777C89"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.column}>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>
                    Due Date<Text style={styles.required}> *</Text>
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      value={submissionDate}
                      onChangeText={setSubmissionDate}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A1A5B3"
                      style={styles.iconInput}
                      maxLength={10}
                    />
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color="#777C89"
                    />
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.dateHint}>
              Use DD/MM/YYYY format, e.g. 20/11/2026.
            </Text>
          </View>

          {/* CARD 3: DETAILS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="reader-outline"
                  size={19}
                  color="#5420D8"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Details & Instructions</Text>
                <Text style={styles.sectionSubtitle}>
                  Provide topics covered and guidance for students
                </Text>
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description, topics covered or homework summary…"
                placeholderTextColor="#A1A5B3"
                multiline
                textAlignVertical="top"
                style={styles.textArea}
                maxLength={3000}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Instructions</Text>
              <TextInput
                value={instructions}
                onChangeText={setInstructions}
                placeholder="Enter submission mode, format, guidelines…"
                placeholderTextColor="#A1A5B3"
                multiline
                textAlignVertical="top"
                style={styles.textArea}
                maxLength={3000}
              />
            </View>
          </View>

          {/* CARD 4: ATTACHMENT */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="attach-outline"
                  size={20}
                  color="#5420D8"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Attachment PDF</Text>
                <Text style={styles.sectionSubtitle}>
                  Optional · PDF question paper or notes (max 10 MB)
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.pdfButton}
              onPress={handlePickPdf}
              disabled={saving}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color="#5420D8"
              />
              <Text style={styles.pdfButtonText} numberOfLines={1}>
                {pdf?.name ? "Change Selected PDF" : "Choose PDF Document"}
              </Text>
            </Pressable>

            {pdf ? (
              <View style={styles.selectedPdfRow}>
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={24}
                  color="#D84343"
                />
                <Text style={styles.selectedPdfName} numberOfLines={1}>
                  {pdf.name}
                </Text>
                <Pressable
                  onPress={() => setPdf(null)}
                  disabled={saving}
                  hitSlop={8}
                  accessibilityLabel="Remove PDF"
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="#8A8F9F"
                  />
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.cancelButton, saving && styles.disabledButton]}
              onPress={onBack}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.submitButton,
                (saving || loadingOptions) && styles.disabledButton,
              ]}
              onPress={handleCreate}
              disabled={saving || loadingOptions}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
              )}
              <Text style={styles.submitButtonText}>
                {saving ? "Creating…" : "Create Assignment"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F9",
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: "PoppinsBold",
    fontSize: 19,
    color: "#111528",
  },
  subtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#777C89",
    marginTop: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEEAF5",
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#111528",
  },
  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#777C89",
    marginTop: 1,
  },
  fieldWrapper: {
    marginBottom: 14,
  },
  label: {
    fontFamily: "PoppinsMedium",
    fontSize: 12,
    color: "#2D3142",
    marginBottom: 6,
  },
  required: {
    color: "#E04B5D",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E6E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8F9FC",
    fontFamily: "PoppinsRegular",
    fontSize: 13,
    color: "#1A1D2E",
  },
  inputWithIcon: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E6E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8F9FC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconInput: {
    flex: 1,
    height: 46,
    fontFamily: "PoppinsRegular",
    fontSize: 13,
    color: "#1A1D2E",
    paddingHorizontal: 0,
  },
  textArea: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#E6E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#F8F9FC",
    fontFamily: "PoppinsRegular",
    fontSize: 13,
    color: "#1A1D2E",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  select: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E6E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8F9FC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  selectText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 13,
    color: "#1A1D2E",
  },
  placeholderText: {
    color: "#A1A5B3",
  },
  disabledField: {
    opacity: 0.65,
    backgroundColor: "#F2F4F7",
  },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E6E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#5420D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownItem: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F4F3F8",
    gap: 8,
  },
  dropdownItemSelected: {
    backgroundColor: "#F6F1FE",
  },
  dropdownItemText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 12.5,
    color: "#343848",
  },
  dropdownItemTextSelected: {
    fontFamily: "PoppinsSemiBold",
    color: "#5420D8",
  },
  emptyOption: {
    padding: 14,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#9295A2",
    textAlign: "center",
  },
  standardHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -6,
    marginBottom: 14,
    backgroundColor: "#EEE7FF",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  standardHintText: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#5420D8",
  },
  dateHint: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#777C89",
    marginTop: 2,
  },
  pdfButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#D4C7F5",
    borderStyle: "dashed",
    backgroundColor: "#FAF8FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  pdfButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#5420D8",
  },
  selectedPdfRow: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7DFFA",
    backgroundColor: "#FAF8FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedPdfName: {
    flex: 1,
    fontFamily: "PoppinsMedium",
    fontSize: 12,
    color: "#2D3142",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontFamily: "PoppinsMedium",
    fontSize: 14,
    color: "#667085",
  },
  submitButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#5420D8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#5420D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: "#FDF2F2",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FAD1D1",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#B42332",
    lineHeight: 16,
  },
  retryText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#5420D8",
    marginTop: 3,
  },
  bottomSpacer: {
    height: 30,
  },
});
