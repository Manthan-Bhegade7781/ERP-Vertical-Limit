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

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  marks: string;
  remarks: string;
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

export default function AddPerformancePage() {
  const [examination, setExamination] = useState("");
  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [batch, setBatch] = useState("");
  const [resultDate, setResultDate] = useState("");

  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      name: "Aarav Sharma",
      rollNumber: "JEE-001",
      marks: "",
      remarks: "",
    },
    {
      id: "2",
      name: "Ananya Patil",
      rollNumber: "NEET-002",
      marks: "",
      remarks: "",
    },
    {
      id: "3",
      name: "Rohan Kulkarni",
      rollNumber: "CET-003",
      marks: "",
      remarks: "",
    },
    {
      id: "4",
      name: "Ishita Joshi",
      rollNumber: "FND-004",
      marks: "",
      remarks: "",
    },
    {
      id: "5",
      name: "Vedant Deshmukh",
      rollNumber: "FND-005",
      marks: "",
      remarks: "",
    },
    {
      id: "6",
      name: "Sakshi Mehta",
      rollNumber: "FND-006",
      marks: "",
      remarks: "",
    },
  ]);


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

  const updateStudent = (
    id: string,
    field: "marks" | "remarks",
    value: string
  ) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === id
          ? {
              ...student,
              [field]: value,
            }
          : student
      )
    );
  };

  const calculateStats = () => {
    const enteredMarks = students
      .map((student) => Number(student.marks))
      .filter((mark) => Number.isFinite(mark) && mark >= 0);

    if (enteredMarks.length === 0) {
      return {
        entered: 0,
        average: 0,
        highest: 0,
      };
    }

    const total = enteredMarks.reduce(
      (sum, mark) => sum + mark,
      0
    );

    return {
      entered: enteredMarks.length,
      average: Math.round(total / enteredMarks.length),
      highest: Math.max(...enteredMarks),
    };
  };

  const handlePublishResult = () => {
    if (
      !examination ||
      !standard ||
      !subject ||
      !batch ||
      !resultDate.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required result details marked with *."
      );
      return;
    }

    const enteredStudents = students.filter(
      (student) => student.marks.trim() !== ""
    );

    if (enteredStudents.length === 0) {
      Alert.alert(
        "Marks Required",
        "Please enter marks for at least one student."
      );
      return;
    }

    const invalidMarks = enteredStudents.some((student) => {
      const marks = Number(student.marks);
      return !Number.isFinite(marks) || marks < 0 || marks > 100;
    });

    if (invalidMarks) {
      Alert.alert(
        "Invalid Marks",
        "Student marks must be between 0 and 100."
      );
      return;
    }

    Alert.alert(
      "Result Published",
      `Performance results have been published for ${enteredStudents.length} student(s).`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const stats = calculateStats();

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

          <Text style={styles.headerTitle}>
            Add Performance
          </Text>
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
              name="chart-line"
              size={22}
              color="#7040D5"
            />
          </View>

          <View style={styles.pageTitleContent}>
            <Text style={styles.pageTitle}>
              Student Performance
            </Text>

            <Text style={styles.pageSubtitle}>
              Enter and publish examination results
            </Text>
          </View>
        </View>

        {/* RESULT INFORMATION */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconPurple}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={19}
                color="#7040D5"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Result Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Select the examination and academic details
              </Text>
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>
              Examination
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={examination}
              onChangeText={setExamination}
              placeholder="Enter examination name"
              placeholderTextColor="#A1A5B3"
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
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>
                  Result Date
                  <Text style={styles.required}> *</Text>
                </Text>

                <View style={styles.inputWithIcon}>
                  <TextInput
                    value={resultDate}
                    onChangeText={setResultDate}
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
          </View>
        </View>

        {/* PERFORMANCE SUMMARY */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBlue}>
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={19}
                color="#4386E8"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Performance Summary
              </Text>

              <Text style={styles.sectionSubtitle}>
                Overview of entered student results
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons
                  name="account-check-outline"
                  size={19}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.statValue}>
                {stats.entered}
              </Text>

              <Text style={styles.statLabel}>
                Results Entered
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBlue}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={19}
                  color="#4386E8"
                />
              </View>

              <Text style={styles.statValue}>
                {stats.average}
              </Text>

              <Text style={styles.statLabel}>
                Average Marks
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconGreen}>
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={19}
                  color="#2EAA78"
                />
              </View>

              <Text style={styles.statValue}>
                {stats.highest}
              </Text>

              <Text style={styles.statLabel}>
                Highest Marks
              </Text>
            </View>
          </View>
        </View>

        {/* STUDENT RESULTS */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconGreen}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={19}
                color="#2EAA78"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Student Results
              </Text>

              <Text style={styles.sectionSubtitle}>
                Enter marks and performance remarks
              </Text>
            </View>
          </View>

          {students.map((student, index) => (
            <View
              key={student.id}
              style={[
                styles.studentCard,
                index === students.length - 1 &&
                  styles.studentCardLast,
              ]}
            >
              <View style={styles.studentHeader}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentAvatarText}>
                    {student.name.charAt(0)}
                  </Text>
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.name}
                  </Text>

                  <Text style={styles.rollNumber}>
                    Roll No. {student.rollNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.studentFields}>
                <View style={styles.marksField}>
                  <Text style={styles.smallLabel}>
                    Marks
                  </Text>

                  <TextInput
                    value={student.marks}
                    onChangeText={(value) =>
                      updateStudent(
                        student.id,
                        "marks",
                        value
                      )
                    }
                    placeholder="0 - 100"
                    placeholderTextColor="#A1A5B3"
                    keyboardType="numeric"
                    style={styles.smallInput}
                  />
                </View>

                <View style={styles.remarksField}>
                  <Text style={styles.smallLabel}>
                    Remarks
                  </Text>

                  <TextInput
                    value={student.remarks}
                    onChangeText={(value) =>
                      updateStudent(
                        student.id,
                        "remarks",
                        value
                      )
                    }
                    placeholder="Optional remarks"
                    placeholderTextColor="#A1A5B3"
                    style={styles.smallInput}
                  />
                </View>
              </View>
            </View>
          ))}
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
              Before publishing results
            </Text>

            <Text style={styles.infoText}>
              Verify the examination, subject, batch and student
              marks before publishing. Published results will be
              available in the student performance records.
            </Text>
          </View>
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
            onPress={handlePublishResult}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              Publish Result
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
    fontSize: 20,
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
    fontSize: 20,
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

  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#292B39",
  },

  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#9295A2",
    marginTop: 1,
  },

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
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    fontFamily: "PoppinsRegular",
    fontSize: 10,
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
    fontSize: 10,
    color: "#303240",
    paddingHorizontal: 0,
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
    minHeight: 52,
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

  statsRow: {
    flexDirection: "row",
    gap: 8,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FAFAFD",
    borderWidth: 1,
    borderColor: "#EEF0F5",
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 7,
    alignItems: "center",
  },

  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  statIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#EAF2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  statIconGreen: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#E9F8F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  statValue: {
    fontFamily: "PoppinsBold",
    fontSize: 17,
    color: "#292B39",
  },

  statLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 8,
    color: "#858998",
    textAlign: "center",
    marginTop: 1,
  },

  studentCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },

  studentCardLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEE8FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  studentAvatarText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#7040D5",
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#303240",
  },

  rollNumber: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#8B8E9B",
    marginTop: 1,
  },

  studentFields: {
    flexDirection: "row",
    gap: 10,
  },

  marksField: {
    width: 105,
  },

  remarksField: {
    flex: 1,
  },

  smallLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#686B79",
    marginBottom: 4,
  },

  smallInput: {
    height: 39,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 9,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303240",
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