import React, { useEffect, useMemo, useState } from "react";
import { createExamination, fetchExamBatches, fetchExamSubjects, fetchBatchSubjectAssignments, type ExamBatch, type ExamSubject, type ExamBatchSubject } from "../../../services/examinations";
import {
  Alert,
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

/* =========================================================
   TYPES
========================================================= */

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
};

/* =========================================================
   SELECT FIELD
========================================================= */

const SelectField = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  required = false,
}: SelectFieldProps) => {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === value)?.label || "";

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <Pressable
        style={styles.select}
        onPress={() => setOpen((previous) => !previous)}
      >
        <Text
          style={[
            styles.selectText,
            !selectedLabel && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </Text>

        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#73778A"
        />
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
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

                {selected && (
                  <MaterialCommunityIcons
                    name="check"
                    size={18}
                    color="#7040D5"
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AddExaminationPage() {
  /* =======================================================
     FORM STATE
  ======================================================= */

  const [examinationName, setExaminationName] = useState("");
  const [examinationCode, setExaminationCode] = useState("");

  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [batch, setBatch] = useState("");

  const [examinationDate, setExaminationDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");

  const [totalMarks, setTotalMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");

  const [instructions, setInstructions] = useState("");
  const [batches, setBatches] = useState<ExamBatch[]>([]);
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const getId = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const ref = value as { _id?: string; id?: string };
      return ref._id || ref.id || '';
    }
    return '';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingOptions(true);
        const [batchRows, subjectRows] = await Promise.all([fetchExamBatches(), fetchExamSubjects()]);
        if (!mounted) return;
        setBatches(batchRows.filter((item) => !item.isRemoved && item.status !== 'inactive'));
        setSubjects(subjectRows.filter((item) => item.status !== 'inactive'));
      } catch (error) {
        if (mounted) Alert.alert('Unable to load options', error instanceof Error ? error.message : 'Could not load batches and subjects.');
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const loadAssignmentsForBatch = async (batchId: string) => {
    setSubject('');
    setAssignedSubjectIds([]);
    if (!batchId) return;
    try {
      const assignments: ExamBatchSubject[] = await fetchBatchSubjectAssignments(batchId);
      // Some backend records omit status or use different casing (e.g. "Active").
      // Keep assignments unless explicitly marked inactive/removed.
      const activeAssignments = assignments.filter((item) => {
        const status = String(item.status ?? '').trim().toLowerCase();
        return status !== 'inactive' && status !== 'removed' && status !== 'disabled';
      });
      setAssignedSubjectIds(
        Array.from(new Set(activeAssignments.map((item) => getId(item.subjectId)).filter(Boolean)))
      );
    } catch (error) {
      Alert.alert('Unable to load assigned subjects', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  /* =========================================================
     OPTIONS FROM BACKEND
  ========================================================= */

  const standardOptions: SelectOption[] = useMemo(() => {
    const standards = Array.from(new Set(batches.map((item) => item.standard).filter(Boolean)));
    return standards.map((value) => ({ label: value, value }));
  }, [batches]);

  const batchOptions: SelectOption[] = useMemo(() => batches
    .filter((item) => !standard || item.standard === standard)
    .map((item) => ({ label: item.name, value: item._id })), [batches, standard]);

  // Batch-subject assignment is the source of truth. Do not additionally
  // filter by subject.standard because backend data may store that field
  // differently or leave it empty even when the subject is assigned.
  const subjectOptions: SelectOption[] = useMemo(() => subjects
    .filter((item) => assignedSubjectIds.includes(getId(item._id)))
    .map((item) => ({ label: item.name, value: getId(item._id) }))
    .filter((item) => item.value && item.label), [subjects, assignedSubjectIds]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const isValidExaminationDate = (value: string) => {
    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!match) return false;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  };

  const isValidStartTime = (value: string) => {
    const time = value.trim();

    return /^(?:(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM)|(?:[01]\d|2[0-3]):[0-5]\d)$/i.test(
      time
    );
  };

  const handleAddExamination = async () => {
    // Check required fields
    if (
      !examinationName.trim() ||
      !examinationCode.trim() ||
      !standard ||
      !subject ||
      !batch ||
      !examinationDate.trim() ||
      !startTime.trim() ||
      !duration.trim() ||
      !totalMarks.trim() ||
      !passingMarks.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required examination details marked with *."
      );
      return;
    }

    // Validate examination date
    if (!isValidExaminationDate(examinationDate)) {
      Alert.alert(
        "Invalid Examination Date",
        "Enter a valid date in DD/MM/YYYY format, for example 20/10/2026."
      );
      return;
    }

    // Validate start time
    if (!isValidStartTime(startTime)) {
      Alert.alert(
        "Invalid Start Time",
        "Enter a valid time, such as 09:00 AM or 14:00."
      );
      return;
    }

    // Validate duration
    const parsedDuration = Number(duration);

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      Alert.alert(
        "Invalid Duration",
        "Please select a valid duration in minutes."
      );
      return;
    }

    // Validate total marks
    const total = Number(totalMarks);

    if (!Number.isFinite(total) || total <= 0) {
      Alert.alert(
        "Invalid Total Marks",
        "Please enter a valid total marks value greater than zero."
      );
      return;
    }

    // Validate passing marks
    const passing = Number(passingMarks);

    if (!Number.isFinite(passing) || passing < 0) {
      Alert.alert(
        "Invalid Passing Marks",
        "Please enter a valid passing marks value of zero or greater."
      );
      return;
    }

    // Passing marks cannot exceed total marks
    if (passing > total) {
      Alert.alert(
        "Invalid Marks",
        "Passing marks cannot be greater than total marks."
      );
      return;
    }

    if (loadingOptions) {
      Alert.alert("Please wait", "Batch and subject options are still loading.");
      return;
    }
    if (!batchOptions.some((item) => item.value === batch)) {
      Alert.alert("Invalid Batch", "Please select a valid batch.");
      return;
    }
    if (!subjectOptions.some((item) => item.value === subject)) {
      Alert.alert("Invalid Subject", "Choose a subject assigned to the selected batch.");
      return;
    }

    try {
      setSaving(true);
      await createExamination({
        examinationName: examinationName.trim(),
        examinationCode: examinationCode.trim().toUpperCase(),
        batchId: batch,
        subjectId: subject,
        examinationDate: examinationDate.trim(),
        startTime: startTime.trim().toUpperCase(),
        durationMinutes: parsedDuration,
        totalMarks: total,
        passingMarks: passing,
        instructions: instructions.trim(),
      });
      Alert.alert("Examination Created", "The examination has been saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Unable to Save Examination", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.headerTitle}>Add Examination</Text>
        </View>
      </View>

      {/* CONTENT */}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* PAGE TITLE */}

        <View style={styles.pageTitleRow}>
          <View style={styles.pageTitleIcon}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={22}
              color="#7040D5"
            />
          </View>

          <View style={styles.pageTitleContent}>
            <Text style={styles.pageTitle}>Examination Information</Text>

            <Text style={styles.pageSubtitle}>
              Create and schedule an examination for students
            </Text>
          </View>
        </View>

        {/* BASIC INFORMATION */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconPurple}>
              <MaterialCommunityIcons
                name="clipboard-edit-outline"
                size={19}
                color="#7040D5"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <Text style={styles.sectionSubtitle}>
                Enter examination details
              </Text>
            </View>
          </View>

          {/* Examination Name */}

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              Examination Name
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={examinationName}
              onChangeText={setExaminationName}
              placeholder="Enter examination name"
              placeholderTextColor="#A1A5B3"
              style={styles.input}
            />
          </View>

          {/* Examination Code */}

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              Examination Code
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={examinationCode}
              onChangeText={setExaminationCode}
              placeholder="e.g. JEE-MOCK-001"
              placeholderTextColor="#A1A5B3"
              autoCapitalize="characters"
              style={styles.input}
            />
          </View>

          {/* Standard */}

          <View style={styles.fieldWrapper}>
            <SelectField
              label="Standard"
              value={standard}
              placeholder="Select standard"
              options={standardOptions}
              onChange={(value) => { setStandard(value); setBatch(""); setSubject(""); setAssignedSubjectIds([]); }}
              required
            />
          </View>

          {/* Subject + Batch */}

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <SelectField
                label="Subject"
                value={subject}
                placeholder={
                  loadingOptions
                    ? "Loading subjects..."
                    : !batch
                      ? "Select batch first"
                      : subjectOptions.length === 0
                        ? "No subjects assigned"
                        : "Select subject"
                }
                options={subjectOptions}
                onChange={setSubject}
                required
              />
            </View>

            <View style={styles.column}>
              <SelectField
                label="Assigned Batch"
                value={batch}
                placeholder="Select batch"
                options={batchOptions}
                onChange={(value) => { setBatch(value); const selectedBatch = batches.find((item) => item._id === value); if (selectedBatch) setStandard(selectedBatch.standard); void loadAssignmentsForBatch(value); }}
                required
              />
            </View>
          </View>
        </View>

        {/* EXAMINATION SCHEDULE */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBlue}>
              <MaterialCommunityIcons
                name="calendar-clock-outline"
                size={19}
                color="#4386E8"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>Examination Schedule</Text>
              <Text style={styles.sectionSubtitle}>
                Set date, time and duration
              </Text>
            </View>
          </View>

          {/* Date */}

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              Examination Date
              <Text style={styles.required}> *</Text>
            </Text>

            <View style={styles.inputWithIcon}>
              <TextInput
                value={examinationDate}
                onChangeText={setExaminationDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#A1A5B3"
                style={styles.iconInput}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />

              <MaterialCommunityIcons
                name="calendar-outline"
                size={19}
                color="#7B8090"
              />
            </View>
          </View>

          {/* Start Time + Duration */}

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>
                  Start Time
                  <Text style={styles.required}> *</Text>
                </Text>

                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="e.g. 09:00 AM"
                  placeholderTextColor="#A1A5B3"
                  style={styles.input}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.column}>
              <SelectField
                label="Duration"
                value={duration}
                placeholder="Select duration"
                options={[
                  { label: "30 Minutes", value: "30" },
                  { label: "45 Minutes", value: "45" },
                  { label: "60 Minutes", value: "60" },
                  { label: "90 Minutes", value: "90" },
                  { label: "120 Minutes", value: "120" },
                  { label: "180 Minutes", value: "180" },
                ]}
                onChange={setDuration}
                required
              />
            </View>
          </View>
        </View>

        {/* MARKS & EVALUATION */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconGreen}>
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={19}
                color="#2EAA78"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>Marks & Evaluation</Text>
              <Text style={styles.sectionSubtitle}>
                Define examination scoring
              </Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            {/* Total Marks */}

            <View style={styles.column}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>
                  Total Marks
                  <Text style={styles.required}> *</Text>
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

            {/* Passing Marks */}

            <View style={styles.column}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>
                  Passing Marks
                  <Text style={styles.required}> *</Text>
                </Text>

                <TextInput
                  value={passingMarks}
                  onChangeText={setPassingMarks}
                  placeholder="e.g. 40"
                  placeholderTextColor="#A1A5B3"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          {/* Information */}

          <View style={styles.marksInfo}>
            <MaterialCommunityIcons
              name="information-outline"
              size={17}
              color="#7040D5"
            />

            <Text style={styles.marksInfoText}>
              Passing marks must be equal to or less than total marks.
            </Text>
          </View>
        </View>

        {/* INSTRUCTIONS */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconOrange}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={19}
                color="#E28A36"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Text style={styles.sectionSubtitle}>
                Add instructions for students
              </Text>
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Examination Instructions</Text>

            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Enter instructions for students..."
              placeholderTextColor="#A1A5B3"
              multiline
              textAlignVertical="top"
              style={styles.textArea}
            />
          </View>
        </View>

        {/* INFORMATION NOTICE */}

        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#7040D5"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Before adding examination</Text>

            <Text style={styles.infoText}>
              Make sure the selected subject and batch are correctly
              assigned. Students belonging to the selected batch will
              be associated with this examination.
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}

        <View style={styles.actions}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={styles.addButton}
            onPress={handleAddExamination}
          >
            <MaterialCommunityIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>{saving ? "Saving..." : "Add Examination"}</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#7040D5",
  },

  /* HEADER */

  header: {
    height: 64,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#FFFFFF",
    minWidth: 0,
  },

  editButton: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  editButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#7040D5",
  },

  /* CONTAINER */

  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  contentContainer: {
    paddingHorizontal: 15,
    paddingTop: 16,
    paddingBottom: 20,
  },

  /* PAGE TITLE */

  pageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  pageTitleIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#EEE8FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  pageTitleContent: {
    flex: 1,
  },

  pageTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#262838",
  },

  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#858998",
    marginTop: 1,
  },

  /* CARD */

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 15,
    marginBottom: 13,

    shadowColor: "#202124",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 2,
  },

  /* SECTION HEADER */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionIconPurple: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionIconBlue: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#EAF2FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionIconGreen: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#E9F8F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionIconOrange: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#FFF2E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#292B39",
  },

  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9295A2",
    marginTop: 1,
  },

  /* FORM FIELDS */

  fieldWrapper: {
    marginBottom: 12,
  },

  label: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#555866",
    marginBottom: 5,
  },

  required: {
    color: "#E04B5D",
  },

  input: {
    height: 52,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303240",
    minWidth: 0,
    maxWidth: "100%",
  },

  inputWithIcon: {
    height: 52,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  iconInput: {
    flex: 1,
    height: 50,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303240",
    paddingHorizontal: 0,
    minWidth: 0,
    maxWidth: "100%",
  },

  textArea: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303240",
    minWidth: 0,
    maxWidth: "100%",
  },

  /* TWO COLUMN */

  twoColumnRow: {
    flexDirection: "row",
    gap: 8,
  },

  column: {
    flex: 1,
    minWidth: 0,
    maxWidth: "50%",
  },

  /* SELECT */

  select: {
    height: 52,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
    maxWidth: "100%",
  },

  selectText: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303240",
    marginRight: 6,
  },

  placeholderText: {
    color: "#A1A5B3",
  },

  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E4E6ED",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 5,

    shadowColor: "#202124",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  dropdownItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },

  dropdownItemSelected: {
    backgroundColor: "#F5F1FD",
  },

  dropdownItemText: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#4A4D5A",
  },

  dropdownItemTextSelected: {
    fontFamily: "PoppinsMedium",
    color: "#7040D5",
  },

  /* MARKS INFORMATION */

  marksInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F2FD",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 1,
  },

  marksInfoText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#686B79",
    marginLeft: 7,
  },

  /* INFORMATION BOX */

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F3EEFD",
    borderWidth: 1,
    borderColor: "#E7DDFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  infoIcon: {
    width: 29,
    height: 29,
    borderRadius: 8,
    backgroundColor: "#E7DDFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#4B347D",
    marginBottom: 2,
  },

  infoText: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.8,
    lineHeight: 14,
    color: "#68627A",
  },

  /* ACTIONS */

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelButton: {
    height: 43,
    minWidth: 92,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCDDE5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#666978",
  },

  addButton: {
    height: 43,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  addButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#FFFFFF",
  },

  bottomSpace: {
    height: 20,
  },
});