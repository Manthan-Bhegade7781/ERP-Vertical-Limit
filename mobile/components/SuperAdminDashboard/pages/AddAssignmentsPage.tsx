import React, { useEffect, useMemo, useState } from "react";
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
import * as DocumentPicker from "expo-document-picker";
import {
  createAssignment,
  fetchAssignmentBatches,
  fetchAssignmentBatchSubjects,
  fetchAssignmentSubjects,
} from "@/services/assignments";

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
          numberOfLines={1}
          style={[
            styles.selectText,
            !selectedLabel && styles.placeholderText,
          ]}
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

export default function AddAssignmentsPage() {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentCode, setAssignmentCode] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [batches, setBatches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [batch, setBatch] = useState("");
  const [assignmentType, setAssignmentType] = useState("");

  const [assignedDate, setAssignedDate] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");

  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pdfUri, setPdfUri] = useState("");
  const [pdfName, setPdfName] = useState("");

  const getId = (value: any): string =>
    typeof value === "string" ? value : String(value?._id || value?.id || "");

  const standardOptions: SelectOption[] = useMemo(() => {
    const values = [...new Set(batches.map((item) => item.standard).filter(Boolean))];
    return values.map((value) => ({ label: String(value), value: String(value) }));
  }, [batches]);

  const batchOptions: SelectOption[] = useMemo(
    () => batches
      .filter((item) => !standard || String(item.standard || "") === standard)
      .map((item) => ({ label: String(item.name || item.code || "Unnamed batch"), value: getId(item) })),
    [batches, standard]
  );

  const subjectOptions: SelectOption[] = useMemo(
    () => subjects
      .filter((item) => assignedSubjectIds.includes(getId(item)))
      .map((item) => ({ label: String(item.name || item.code || "Unnamed subject"), value: getId(item) })),
    [subjects, assignedSubjectIds]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingOptions(true);
        setOptionsError("");
        const [batchRows, subjectRows] = await Promise.all([
          fetchAssignmentBatches(),
          fetchAssignmentSubjects(),
        ]);
        if (!active) return;
        setBatches(batchRows);
        setSubjects(subjectRows.filter((item: any) => !item.status || item.status === "active"));
      } catch (error) {
        if (active) setOptionsError(error instanceof Error ? error.message : "Could not load batches and subjects.");
      } finally {
        if (active) setLoadingOptions(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleBatchChange = async (batchId: string) => {
    setBatch(batchId);
    setSubject("");
    setAssignedSubjectIds([]);
    try {
      const rows = await fetchAssignmentBatchSubjects(batchId);
      const activeRows = rows.filter((row: any) => String(row.status || "active").toLowerCase() === "active");
      setAssignedSubjectIds(activeRows.map((row: any) => getId(row.subjectId)).filter(Boolean));
    } catch (error) {
      Alert.alert("Subjects unavailable", error instanceof Error ? error.message : "Could not load subjects assigned to this batch.");
    }
  };

  const assignmentTypeOptions: SelectOption[] = [
    {
      label: "Homework",
      value: "homework",
    },
    {
      label: "Practice Set",
      value: "practice_set",
    },
    {
      label: "Worksheet",
      value: "worksheet",
    },
    {
      label: "Project",
      value: "project",
    },
    {
      label: "Revision Assignment",
      value: "revision",
    },
  ];

  const handleAddAssignment = async () => {
    if (
      !assignmentTitle.trim() ||
      !assignmentCode.trim() ||
      !standard ||
      !subject ||
      !batch ||
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

    const parseDate = (value: string): Date | null => {
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
    };

    const assigned = parseDate(assignedDate);
    const due = parseDate(submissionDate);

    if (!assigned || !due) {
      Alert.alert(
        "Invalid Date",
        "Enter both dates in DD/MM/YYYY format."
      );
      return;
    }

    if (due < assigned) {
      Alert.alert(
        "Invalid Due Date",
        "The due date cannot be earlier than the assigned date."
      );
      return;
    }

    const selectedBatch = batches.find((item) => getId(item) === batch);
    const selectedSubject = subjects.find((item) => getId(item) === subject);
    if (!selectedBatch || !selectedSubject) {
      Alert.alert("Invalid selection", "Select a valid batch and a subject assigned to that batch.");
      return;
    }

    const marks = Number(totalMarks);
    if (!Number.isFinite(marks) || marks < 1) {
      Alert.alert("Invalid marks", "Total marks must be at least 1.");
      return;
    }

    try {
      setSaving(true);
      await createAssignment({
        assignmentTitle: assignmentTitle.trim(),
        assignmentCode: assignmentCode.trim().toUpperCase(),
        batchId: batch,
        subjectId: subject,
        assignmentType: assignmentType as "homework" | "practice_set" | "worksheet" | "project" | "revision",
        assignedDate: assignedDate.trim(),
        submissionDate: submissionDate.trim(),
        totalMarks: marks,
        description: description.trim(),
        instructions: instructions.trim(),
        ...(pdfUri ? { file: { uri: pdfUri, name: pdfName || 'Notes.pdf', type: 'application/pdf' } } : {}),
      });

      Alert.alert(
        "Success",
        "Assignment created successfully.",
        [{
          text: "OK",
          onPress: () => router.replace({
            pathname: "/(super_admin)/explore",
            params: { feature: "Assignments", refreshAssignments: "true" },
          } as never),
        }]
      );
    } catch (error) {
      Alert.alert("Could not create assignment", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePickNotesPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const file = result.assets[0];
      setPdfUri(file.uri);
      setPdfName(file.name || "Notes.pdf");
    } catch (error) {
      console.error("PDF selection error:", error);
      Alert.alert("PDF Error", "Unable to select the PDF file.");
    }
  };

  const removeNotesPdf = () => {
    setPdfUri("");
    setPdfName("");
  };

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

          <Text style={styles.headerTitle}>Add Assignment</Text>
        </View>

      </View>

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
            <Text style={styles.pageTitle}>
              Assignment Information
            </Text>

            <Text style={styles.pageSubtitle}>
              Create and assign academic work to students
            </Text>
          </View>
        </View>

        {optionsError ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{optionsError}</Text>
          </View>
        ) : null}

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
              <Text style={styles.sectionTitle}>
                Basic Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Enter assignment details
              </Text>
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              Assignment Title
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={assignmentTitle}
              onChangeText={setAssignmentTitle}
              placeholder="Enter assignment title"
              placeholderTextColor="#A1A5B3"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              Assignment Code
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={assignmentCode}
              onChangeText={setAssignmentCode}
              placeholder="e.g. PHY-ASSIGN-001"
              placeholderTextColor="#A1A5B3"
              autoCapitalize="characters"
              style={styles.input}
            />
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <SelectField
                label="Standard"
                value={standard}
                placeholder="Select standard"
                options={standardOptions}
                onChange={(value) => { setStandard(value); setBatch(""); setSubject(""); setAssignedSubjectIds([]); }}
                required
              />
            </View>

            <View style={styles.column}>
              <SelectField
                label="Subject"
                value={subject}
                placeholder={loadingOptions ? "Loading..." : !batch ? "Select batch first" : subjectOptions.length ? "Select subject" : "No assigned subjects"}
                options={subjectOptions}
                onChange={setSubject}
                required
              />
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <SelectField
                label="Assigned Batch"
                value={batch}
                placeholder={loadingOptions ? "Loading..." : "Select batch"}
                options={batchOptions}
                onChange={handleBatchChange}
                required
              />
            </View>

            <View style={styles.column}>
              <SelectField
                label="Assignment Type"
                value={assignmentType}
                placeholder="Select type"
                options={assignmentTypeOptions}
                onChange={setAssignmentType}
                required
              />
            </View>
          </View>
        </View>

        {/* ASSIGNMENT SCHEDULE */}

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
              <Text style={styles.sectionTitle}>
                Assignment Schedule
              </Text>

              <Text style={styles.sectionSubtitle}>
                Set when the assignment is given and when it is due
              </Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>
                  Assigned Date
                  <Text style={styles.required}> *</Text>
                </Text>

                <View style={styles.inputWithIcon}>
                  <TextInput
                    value={assignedDate}
                    onChangeText={setAssignedDate}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#A1A5B3"
                    style={styles.iconInput}
                  />

                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={19}
                    color="#7B8090"
                  />
                </View>
              </View>
            </View>

            <View style={styles.column}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>
                  Due Date
                  <Text style={styles.required}> *</Text>
                </Text>

                <View style={styles.inputWithIcon}>
                  <TextInput
                    value={submissionDate}
                    onChangeText={setSubmissionDate}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#A1A5B3"
                    style={styles.iconInput}
                  />

                  <MaterialCommunityIcons
                    name="calendar-check-outline"
                    size={19}
                    color="#7B8090"
                  />
                </View>
              </View>
            </View>
          </View>

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

        {/* DESCRIPTION */}

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
              <Text style={styles.sectionTitle}>
                Assignment Details
              </Text>

              <Text style={styles.sectionSubtitle}>
                Add description and instructions
              </Text>
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              Description
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter assignment description..."
              placeholderTextColor="#A1A5B3"
              multiline
              textAlignVertical="top"
              style={styles.textArea}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              Instructions
            </Text>

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

        {/* INFORMATION */}

        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#7040D5"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Before adding assignment
            </Text>

            <Text style={styles.infoText}>
              Make sure the selected subject, standard and batch
              are correct. The assignment will be available to
              students belonging to the selected batch.
            </Text>
          </View>
        </View>

        {/* NOTES PDF */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconPurple}>
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={19}
                color="#7040D5"
              />
            </View>

            <View style={styles.sectionHeaderContent}>
              <Text style={styles.sectionTitle}>Notes PDF</Text>
              <Text style={styles.sectionSubtitle}>Select a PDF from your local folder</Text>
            </View>
          </View>

          <Pressable
            style={styles.pdfButton}
            onPress={handlePickNotesPdf}
          
          >
            <MaterialCommunityIcons
              name="folder-open-outline"
              size={19}
              color="#7040D5"
            />
            <Text style={styles.pdfButtonText} numberOfLines={1}>
              {pdfName || "Select PDF"}
            </Text>
          </Pressable>

          {pdfName.trim() ? (
            <View style={styles.selectedPdfRow}>
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={20}
                color="#D84343"
              />
              <Text style={styles.selectedPdfName} numberOfLines={1}>
                {pdfName}
              </Text>
              <Pressable onPress={removeNotesPdf}>
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={19}
                  color="#8A8F9F"
                />
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* ACTIONS */}

        <View style={styles.actions}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </Pressable>

          <Pressable
            style={[styles.addButton, saving && { opacity: 0.6 }]}
            onPress={handleAddAssignment}
            disabled={saving}
          >
            <MaterialCommunityIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              {saving ? "Saving..." : "Add Assignment"}
            </Text>
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
    fontSize: 17,
    color: "#FFFFFF",
  },


  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  contentContainer: {
    paddingHorizontal: 15,
    paddingTop: 16,
    paddingBottom: 20,
  },

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
    fontSize: 16,
    color: "#262838",
  },

  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#858998",
    marginTop: 1,
  },

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
    fontSize: 12.5,
    color: "#292B39",
  },

  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#9295A2",
    marginTop: 1,
  },

  fieldWrapper: {
    marginBottom: 12,
  },

  label: {
    fontFamily: "PoppinsMedium",
    fontSize: 9.5,
    color: "#555866",
    marginBottom: 5,
  },

  required: {
    color: "#E04B5D",
  },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#303240",
  },

  inputWithIcon: {
    height: 44,
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
    height: 42,
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#303240",
    paddingHorizontal: 0,
  },

  textArea: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#303240",
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
  },

  column: {
    flex: 1,
    minWidth: 0,
  },

  select: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    flex: 1,
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
    minHeight: 42,
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
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#4A4D5A",
  },

  dropdownItemTextSelected: {
    fontFamily: "PoppinsMedium",
    color: "#7040D5",
  },


  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F3EEFD",
    borderWidth: 1,
    borderColor: "#E7DDFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  sectionHeaderContent: {
  flex: 1,
  minWidth: 0,
  justifyContent: "center",
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

  pdfButton: {
    height: 43,
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCCFF7",
    backgroundColor: "#F7F3FD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 5,
    marginBottom: 10,
  },

  pdfButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#7040D5",
    flex: 1,
    minWidth: 0,
    textAlign: "center",
  },

  selectedPdfRow: {
    width: "100%",
    minHeight: 46,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6DDF7",
    backgroundColor: "#FBF9FE",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  selectedPdfName: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#343746",
  },

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
    fontSize: 10.5,
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
    fontSize: 10.5,
    color: "#FFFFFF",
  },

  bottomSpace: {
    height: 20,
  },
});