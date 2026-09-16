import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PURPLE = "#7040D5";

const STANDARD_OPTIONS = ["11", "12", "10", "9", "8"];
const STREAM_OPTIONS = ["Science", "Commerce", "Arts"];
const TERM_OPTIONS = ["Term 1", "Term 2", "Full Year"];
const STATUS_OPTIONS = ["Active", "Inactive"];

const SUBJECT_OPTIONS = [
  "Physics",
  "Mathematics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
];

const FACULTY_OPTIONS = [
  "Select Faculty",
  "Physics Faculty",
  "Mathematics Faculty",
  "Chemistry Faculty",
  "Biology Faculty",
  "English Faculty",
  "Computer Science Faculty",
];

const GRADING_OPTIONS = [
  "Percentage",
  "CGPA",
  "Grade",
  "Marks + Grade",
];

const EVALUATION_OPTIONS = [
  "Internal Assessment",
  "Unit Test",
  "Mid Term",
  "Final Examination",
  "Continuous Assessment",
];

export default function AddAcademicInfoPage() {
  const insets = useSafeAreaInsets();

  const [academicYear, setAcademicYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [term, setTerm] = useState("Full Year");

  const [standard, setStandard] = useState("");
  const [stream, setStream] = useState("");
  const [section, setSection] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [academicCoordinator, setAcademicCoordinator] = useState("");

  const [subjects, setSubjects] = useState<string[]>([]);
  const [facultyAllocation, setFacultyAllocation] = useState("");
  const [gradingSystem, setGradingSystem] = useState("");
  const [evaluationMethods, setEvaluationMethods] = useState<string[]>([]);

  const [attendanceRule, setAttendanceRule] = useState("");
  const [promotionRule, setPromotionRule] = useState("");
  const [passingPercentage, setPassingPercentage] = useState("");
  const [academicRules, setAcademicRules] = useState("");

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  const handleBack = () => router.back();

  const toggleSubject = (subject: string) => {
    setSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject]
    );
  };

  const toggleEvaluation = (method: string) => {
    setEvaluationMethods((current) =>
      current.includes(method)
        ? current.filter((item) => item !== method)
        : [...current, method]
    );
  };

  const handleSave = () => {
    if (!academicYear.trim()) {
      Alert.alert("Required Field", "Please enter the academic year.");
      return;
    }
    if (!startDate.trim()) {
      Alert.alert("Required Field", "Please enter the start date.");
      return;
    }
    if (!endDate.trim()) {
      Alert.alert("Required Field", "Please enter the end date.");
      return;
    }
    if (!standard) {
      Alert.alert("Required Field", "Please select a standard.");
      return;
    }
    if (!stream) {
      Alert.alert("Required Field", "Please select a stream.");
      return;
    }
    if (!curriculum.trim()) {
      Alert.alert("Required Field", "Please enter the curriculum.");
      return;
    }
    if (subjects.length === 0) {
      Alert.alert("Required Field", "Please select at least one subject.");
      return;
    }
    if (!facultyAllocation) {
      Alert.alert("Required Field", "Please select the faculty allocation.");
      return;
    }
    if (!gradingSystem) {
      Alert.alert("Required Field", "Please select the grading system.");
      return;
    }
    if (evaluationMethods.length === 0) {
      Alert.alert(
        "Required Field",
        "Please select at least one evaluation method."
      );
      return;
    }

    Alert.alert(
      "Academic Info Added",
      `${academicYear.trim()} academic information has been added successfully.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10 },
        ]}
      >
        <View style={styles.headerInner}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Add Academic Info
            </Text>
          </View>

          <Pressable
            style={styles.headerEditButton}
            onPress={() =>
              Alert.alert(
                "Edit Academic Info",
                "Academic information is ready to edit."
              )
            }
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={17}
              color={PURPLE}
            />
            <Text style={styles.headerEditText}>Edit</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 30 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Academic Information</Text>
              <Text style={styles.pageSubtitle}>
                Configure academic year, classes, curriculum, subjects,
                faculty, grading, evaluation and academic rules.
              </Text>
            </View>

            <View style={styles.card}>
              <SectionHeader
                icon="calendar-range-outline"
                title="Academic Year Details"
              />

              <Field
                label="Academic Year"
                required
                value={academicYear}
                onChangeText={setAcademicYear}
                placeholder="e.g. 2026 - 27"
              />

              <View style={styles.row}>
                <DateField
                  label="Start Date"
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <DateField
                  label="End Date"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>

              <Text style={styles.label}>Academic Term</Text>
              <ChoiceRow
                options={TERM_OPTIONS}
                value={term}
                onChange={setTerm}
              />
            </View>

            <View style={styles.card}>
              <SectionHeader
                icon="school-outline"
                title="Class & Academic Structure"
              />

              <View style={styles.row}>
                <SelectField
                  label="Standard"
                  required
                  value={standard}
                  placeholder="Select standard"
                  options={STANDARD_OPTIONS}
                  onChange={setStandard}
                />
                <SelectField
                  label="Stream"
                  required
                  value={stream}
                  placeholder="Select stream"
                  options={STREAM_OPTIONS}
                  onChange={setStream}
                />
              </View>

              <View style={styles.row}>
                <Field
                  label="Section"
                  value={section}
                  onChangeText={setSection}
                  placeholder="e.g. A"
                />
                <Field
                  label="Curriculum"
                  required
                  value={curriculum}
                  onChangeText={setCurriculum}
                  placeholder="e.g. CBSE"
                />
              </View>

              <Field
                label="Academic Coordinator"
                value={academicCoordinator}
                onChangeText={setAcademicCoordinator}
                placeholder="Enter coordinator name"
              />
            </View>

            <View style={styles.card}>
              <SectionHeader
                icon="book-open-variant"
                title="Subject & Curriculum Information"
              />

              <Text style={styles.label}>
                Subjects
                <Text style={styles.required}> *</Text>
              </Text>

              <View style={styles.twoColumnGrid}>
                {SUBJECT_OPTIONS.map((subject) => {
                  const selected = subjects.includes(subject);

                  return (
                    <Pressable
                      key={subject}
                      style={[
                        styles.subjectChip,
                        selected && styles.subjectChipSelected,
                      ]}
                      onPress={() => toggleSubject(subject)}
                    >
                      <MaterialCommunityIcons
                        name={
                          selected
                            ? "checkbox-marked"
                            : "checkbox-blank-outline"
                        }
                        size={16}
                        color={selected ? PURPLE : "#8A94A6"}
                      />
                      <Text
                        style={[
                          styles.subjectChipText,
                          selected && styles.subjectChipTextSelected,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {subject}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.spacer} />

              <Field
                label="Curriculum Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Enter curriculum details..."
                multiline
              />
            </View>

            <View style={styles.card}>
              <SectionHeader
                icon="account-tie-outline"
                title="Faculty Allocation"
              />

              <Text style={styles.helperText}>
                Assign faculty responsibility for the selected academic
                subjects.
              </Text>

              <SelectField
                label="Primary Faculty"
                required
                value={facultyAllocation}
                placeholder="Select faculty"
                options={FACULTY_OPTIONS.filter(
                  (item) => item !== "Select Faculty"
                )}
                onChange={setFacultyAllocation}
              />

              <View style={styles.row}>
                <Field
                  label="Faculty Count"
                  value=""
                  onChangeText={() => {}}
                  placeholder="e.g. 6"
                  keyboardType="numeric"
                />
                <Field
                  label="Faculty Coordinator"
                  value=""
                  onChangeText={() => {}}
                  placeholder="Enter name"
                />
              </View>
            </View>

            <View style={styles.card}>
              <SectionHeader
                icon="chart-box-outline"
                title="Grading & Evaluation"
              />

              <SelectField
                label="Grading System"
                required
                value={gradingSystem}
                placeholder="Select grading system"
                options={GRADING_OPTIONS}
                onChange={setGradingSystem}
              />

              <Text style={styles.label}>
                Evaluation Methods
                <Text style={styles.required}> *</Text>
              </Text>

              <View style={styles.twoColumnGrid}>
                {EVALUATION_OPTIONS.map((method) => {
                  const selected = evaluationMethods.includes(method);

                  return (
                    <Pressable
                      key={method}
                      style={[
                        styles.evaluationChip,
                        selected && styles.evaluationChipSelected,
                      ]}
                      onPress={() => toggleEvaluation(method)}
                    >
                      <MaterialCommunityIcons
                        name={
                          selected
                            ? "checkbox-marked"
                            : "checkbox-blank-outline"
                        }
                        size={16}
                        color={selected ? PURPLE : "#8A94A6"}
                      />
                      <Text
                        style={[
                          styles.evaluationText,
                          selected && styles.evaluationTextSelected,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {method}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.spacer} />

              <View style={styles.row}>
                <Field
                  label="Internal Assessment %"
                  value=""
                  onChangeText={() => {}}
                  placeholder="e.g. 40"
                  keyboardType="numeric"
                />
                <Field
                  label="Final Examination %"
                  value=""
                  onChangeText={() => {}}
                  placeholder="e.g. 60"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.card}>
              <SectionHeader
                icon="gavel"
                title="Academic Rules"
              />

              <View style={styles.row}>
                <Field
                  label="Attendance Requirement"
                  value={attendanceRule}
                  onChangeText={setAttendanceRule}
                  placeholder="e.g. 75%"
                />
                <Field
                  label="Passing Percentage"
                  value={passingPercentage}
                  onChangeText={setPassingPercentage}
                  placeholder="e.g. 40%"
                />
              </View>

              <Field
                label="Promotion Rule"
                value={promotionRule}
                onChangeText={setPromotionRule}
                placeholder="e.g. Pass all mandatory subjects"
              />

              <Field
                label="Academic Rules & Policies"
                value={academicRules}
                onChangeText={setAcademicRules}
                placeholder="Enter attendance, promotion, eligibility and other rules..."
                multiline
              />
            </View>

            <View style={styles.card}>
              <SectionHeader
                icon="tune-variant"
                title="Academic Status"
              />

              <Text style={styles.label}>Status</Text>
              <ChoiceRow
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
              />
            </View>

            <View style={styles.noteCard}>
              <View style={styles.noteIcon}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={PURPLE}
                />
              </View>

              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>Academic setup</Text>
                <Text style={styles.noteText}>
                  These academic settings can be used across curriculum,
                  subjects, batches, faculty allocation, examinations,
                  attendance, assignments, grading and academic reports.
                </Text>
              </View>
            </View>

            <View style={styles.bottomActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleBack}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={handleSave}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.saveButtonText}>
                  Save Academic Info
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={PURPLE}
        />
      </View>
      <Text style={styles.sectionTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

function Field({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label} numberOfLines={2}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A8B7"
        style={multiline ? styles.textArea : styles.input}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

function DateField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.halfField}>
      <Text style={styles.label} numberOfLines={2}>
        {label}
        <Text style={styles.required}> *</Text>
      </Text>

      <View style={styles.inputWithIcon}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#A0A8B7"
          style={styles.dateInput}
          keyboardType="numbers-and-punctuation"
        />
        <MaterialCommunityIcons
          name="calendar-outline"
          size={18}
          color="#8A94A6"
        />
      </View>
    </View>
  );
}

function SelectField({
  label,
  required,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  const selectValue = (option: string) => {
    onChange(option);
    setVisible(false);
  };

  return (
    <View style={styles.halfField}>
      <Text style={styles.label} numberOfLines={2}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <Pressable
        style={styles.selectButton}
        onPress={() => setVisible(true)}
      >
        <Text
          style={[
            styles.selectButtonText,
            !value && styles.selectPlaceholder,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value || placeholder}
        </Text>

        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color="#7C8799"
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {label}
              </Text>
              <Pressable onPress={() => setVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color="#707B8F"
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const selected = value === option;

                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.modalOption,
                      selected && styles.modalOptionSelected,
                    ]}
                    onPress={() => selectValue(option)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selected && styles.modalOptionTextSelected,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {option}
                    </Text>

                    {selected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={18}
                        color={PURPLE}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.choiceRow}>
      {options.map((option) => {
        const selected = value === option;

        return (
          <Pressable
            key={option}
            style={[
              styles.choiceButton,
              selected && styles.choiceButtonSelected,
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.choiceButtonText,
                selected && styles.choiceButtonTextSelected,
              ]}
              numberOfLines={1}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  header: {
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },

  headerInner: {
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerTitleArea: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    flexShrink: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#FFFFFF",
  },

  headerEditButton: {
    height: 40,
    minWidth: 72,
    maxWidth: 100,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flexShrink: 0,
  },

  headerEditText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: PURPLE,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
  },

  content: {
    width: "100%",
    maxWidth: 900,
    paddingHorizontal: 16,
    paddingTop: 22,
  },

  pageHeader: {
    width: "100%",
    marginBottom: 18,
  },

  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 22,
    lineHeight: 30,
    color: "#172033",
    flexShrink: 1,
  },

  pageSubtitle: {
    marginTop: 4,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 17,
    color: "#858D9F",
    flexShrink: 1,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 15,
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    minWidth: 0,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    flexShrink: 0,
  },

  sectionTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    lineHeight: 21,
    color: "#172033",
  },

  field: {
    flex: 1,
    minWidth: 0,
    marginBottom: 14,
  },

  halfField: {
    flex: 1,
    minWidth: 0,
    marginBottom: 14,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },

  label: {
    marginBottom: 6,
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    lineHeight: 15,
    color: "#555E70",
    flexShrink: 1,
  },

  required: {
    color: "#E95386",
  },

  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 10,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303544",
  },

  inputWithIcon: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 10,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  dateInput: {
    flex: 1,
    minWidth: 0,
    height: 50,
    paddingVertical: 0,
    paddingHorizontal: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303544",
  },

  textArea: {
    width: "100%",
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 10,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 12,
    paddingTop: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    lineHeight: 16,
    color: "#303544",
  },

  selectButton: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 10,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  },

  selectButtonText: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303544",
    marginRight: 5,
  },

  selectPlaceholder: {
    color: "#A0A8B7",
  },

  choiceRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  choiceButton: {
    flex: 1,
    minWidth: 90,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    backgroundColor: "#FBFCFE",
    alignItems: "center",
    justifyContent: "center",
  },

  choiceButtonSelected: {
    borderColor: "#CDB8F5",
    backgroundColor: "#F1EAFF",
  },

  choiceButtonText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#707B8F",
  },

  choiceButtonTextSelected: {
    color: PURPLE,
  },

  twoColumnGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  subjectChip: {
    flex: 1,
    flexBasis: "46%",
    minWidth: 0,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    backgroundColor: "#FBFCFE",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  subjectChipSelected: {
    borderColor: "#CDB8F5",
    backgroundColor: "#F1EAFF",
  },

  subjectChipText: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#707B8F",
  },

  subjectChipTextSelected: {
    color: PURPLE,
  },

  evaluationChip: {
    flex: 1,
    flexBasis: "46%",
    minWidth: 0,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    backgroundColor: "#FBFCFE",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  evaluationChipSelected: {
    borderColor: "#CDB8F5",
    backgroundColor: "#F1EAFF",
  },

  evaluationText: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsMedium",
    fontSize: 9.5,
    color: "#707B8F",
  },

  evaluationTextSelected: {
    color: PURPLE,
  },

  spacer: {
    height: 2,
  },

  noteCard: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#F3EEFD",
    borderWidth: 1,
    borderColor: "#E7DDFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  noteIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#E7DDFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    flexShrink: 0,
  },

  noteContent: {
    flex: 1,
    minWidth: 0,
  },

  noteTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#4B347D",
  },

  noteText: {
    marginTop: 3,
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    lineHeight: 14,
    color: "#6E6680",
  },

  bottomActions: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE1E9",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#6D7789",
  },

  saveButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 10,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  saveButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 22, 35, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "75%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 15,
  },

  modalHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },

  modalTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#172033",
  },

  modalList: {
    width: "100%",
  },

  modalOption: {
    minHeight: 46,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 10,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  modalOptionSelected: {
    borderColor: "#CDB8F5",
    backgroundColor: "#F1EAFF",
  },

  modalOptionText: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#707B8F",
  },

  modalOptionTextSelected: {
    color: PURPLE,
  },
});
