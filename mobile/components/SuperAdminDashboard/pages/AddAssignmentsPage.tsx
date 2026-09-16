import React, { useState } from "react";
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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function AddAssignmentsPage() {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentCode, setAssignmentCode] = useState("");

  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [batch, setBatch] = useState("");
  const [assignmentType, setAssignmentType] = useState("");

  const [assignedDate, setAssignedDate] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");

  const [totalMarks, setTotalMarks] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pdfUri, setPdfUri] = useState("");
  const [pdfName, setPdfName] = useState("");

  const standardOptions: SelectOption[] = [
    { label: "8th", value: "8th" },
    { label: "9th", value: "9th" },
    { label: "10th", value: "10th" },
    { label: "11th", value: "11th" },
    { label: "12th", value: "12th" },
  ];

  const subjectOptions: SelectOption[] = [
    { label: "Physics", value: "Physics" },
    { label: "Mathematics", value: "Mathematics" },
    { label: "Chemistry", value: "Chemistry" },
    { label: "Biology", value: "Biology" },
  ];

  const batchOptions: SelectOption[] = [
    {
      label: "8th Foundation - Evening",
      value: "8th Foundation - Evening",
    },
    {
      label: "9th Foundation - Evening",
      value: "9th Foundation - Evening",
    },
    {
      label: "10th Foundation - Afternoon",
      value: "10th Foundation - Afternoon",
    },
    {
      label: "11th MHT-CET - Evening",
      value: "11th MHT-CET - Evening",
    },
    {
      label: "12th JEE - Morning",
      value: "12th JEE - Morning",
    },
    {
      label: "12th NEET - Morning",
      value: "12th NEET - Morning",
    },
  ];

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

  const handleAddAssignment = () => {
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

    const marks = Number(totalMarks);

    if (!Number.isFinite(marks) || marks <= 0) {
      Alert.alert(
        "Invalid Marks",
        "Please enter a valid total marks value."
      );
      return;
    }

    Alert.alert(
      "Assignment Added",
      `${assignmentTitle} has been added successfully.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
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

        <Pressable style={styles.editButton}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={16}
            color="#7040D5"
          />

          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
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
                onChange={setStandard}
                required
              />
            </View>

            <View style={styles.column}>
              <SelectField
                label="Subject"
                value={subject}
                placeholder="Select subject"
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
                placeholder="Select batch"
                options={batchOptions}
                onChange={setBatch}
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
                Set assignment and submission dates
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
                  Submission Date
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
        </View>

        {/* EVALUATION */}

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
              <Text style={styles.sectionTitle}>
                Evaluation
              </Text>

              <Text style={styles.sectionSubtitle}>
                Define assignment scoring
              </Text>
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
              placeholder="e.g. 50"
              placeholderTextColor="#A1A5B3"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.marksInfo}>
            <MaterialCommunityIcons
              name="information-outline"
              size={17}
              color="#7040D5"
            />

            <Text style={styles.marksInfoText}>
              Students will receive marks based on the submitted
              assignment and teacher evaluation.
            </Text>
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
            style={styles.addButton}
            onPress={handleAddAssignment}
          >
            <MaterialCommunityIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              Add Assignment
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
    gap: 6,
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