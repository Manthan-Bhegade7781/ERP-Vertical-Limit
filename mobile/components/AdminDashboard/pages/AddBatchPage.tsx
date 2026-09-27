import React, { useState } from "react";
import {
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  options: string[];
  onSelect: (value: string) => void;
  required?: boolean;
};

function SelectField({
  label,
  value,
  placeholder,
  icon,
  options,
  onSelect,
  required = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        style={styles.selectInput}
        activeOpacity={0.8}
        onPress={() => setOpen((current) => !current)}
      >
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />
        <Text
          style={[styles.selectText, !value && styles.placeholderText]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#8A93A5"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownItem,
                option === value && styles.dropdownItemActive,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  option === value && styles.dropdownTextActive,
                ]}
              >
                {option}
              </Text>

              {option === value && (
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color="#7040D5"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AddBatchPage() {
  const insets = useSafeAreaInsets();

  const [batchName, setBatchName] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [standard, setStandard] = useState("");
  const [course, setCourse] = useState("");
  const [faculty, setFaculty] = useState("");
  const [branch, setBranch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [timing, setTiming] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setBatchName("");
    setBatchCode("");
    setAcademicYear("");
    setStandard("");
    setCourse("");
    setFaculty("");
    setBranch("");
    setStartDate("");
    setEndDate("");
    setCapacity("");
    setTiming("");
    setDescription("");
  };

  const handleAddBatch = () => {
    if (
      !batchName.trim() ||
      !batchCode.trim() ||
      !academicYear ||
      !standard ||
      !course ||
      !faculty ||
      !branch ||
      !startDate.trim() ||
      !endDate.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required batch details marked with *.",
      );
      return;
    }

    Alert.alert(
      "Batch Added",
      `${batchName.trim()} has been added successfully.`,
      [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            router.back();
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.root}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 8,
              minHeight: insets.top + 66,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Add Batch</Text>
          </View>

          {/* Same small Edit button used on Add Teacher/Add Subject */}
          <TouchableOpacity
            style={styles.headerEditButton}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Edit",
                "You are currently editing the batch information form.",
              )
            }
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={17}
              color="#7040D5"
            />
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 30 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageHeading}>
            <Text style={styles.pageTitle}>Add New Batch</Text>
            <Text style={styles.pageSubtitle}>
              Create a batch, assign faculty and manage academic schedules.
            </Text>
          </View>

          {/* BASIC INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Batch Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Basic batch and academic year details
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Batch Name <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={batchName}
                    onChangeText={setBatchName}
                    placeholder="e.g. Foundation 8th"
                    placeholderTextColor="#9AA2B1"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Batch Code <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="identifier"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={batchCode}
                    onChangeText={setBatchCode}
                    placeholder="e.g. BAT001"
                    placeholderTextColor="#9AA2B1"
                    autoCapitalize="characters"
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Academic Year"
                  required
                  value={academicYear}
                  placeholder="Select academic year"
                  icon="calendar-outline"
                  options={["2026-27", "2027-28", "2028-29"]}
                  onSelect={setAcademicYear}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Standard"
                  required
                  value={standard}
                  placeholder="Select standard"
                  icon="school-outline"
                  options={["8th", "9th", "10th", "11th", "12th"]}
                  onSelect={setStandard}
                />
              </View>
            </View>
          </View>

          {/* COURSE INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBlue}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  size={20}
                  color="#2675E8"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Subject Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Subject, faculty and branch assignment
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Subjects"
                  required
                  value={course}
                  placeholder="Select subject"
                  icon="book-open-outline"
                  options={[
                    "Physics",
                    "Maths",
                    "Chemistry",
                    "Biology",
                    "MHT-CET",
                    "NEET",
                    "JEE",
                    "Foundation",
                  ]}
                  onSelect={setCourse}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Faculty"
                  required
                  value={faculty}
                  placeholder="Select faculty"
                  icon="account-tie-outline"
                  options={[
                    "Prof. Kiran Pawar",
                    "Dr. Amit Kulkarni",
                    "Sneha Patil",
                    "Rahul Deshmukh",
                    "Priya Joshi",
                  ]}
                  onSelect={setFaculty}
                />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Branch"
                  required
                  value={branch}
                  placeholder="Select branch"
                  icon="office-building-outline"
                  options={[
                    "Pune",
                    "Mumbai",
                    "Nashik",
                    "Nagpur",
                    "Main Branch",
                  ]}
                  onSelect={setBranch}
                />
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Student Capacity</Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="account-multiple-outline"
                    size={19}
                    color="#2675E8"
                  />
                  <TextInput
                    value={capacity}
                    onChangeText={setCapacity}
                    placeholder="e.g. 40"
                    placeholderTextColor="#9AA2B1"
                    keyboardType="number-pad"
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* SCHEDULE */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconGreen}>
                <MaterialCommunityIcons
                  name="calendar-clock-outline"
                  size={20}
                  color="#35B878"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Batch Schedule</Text>
                <Text style={styles.sectionSubtitle}>
                  Start, end date and class timing
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Start Date <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="calendar-start"
                    size={19}
                    color="#35B878"
                  />
                  <TextInput
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="DD MMM YYYY"
                    placeholderTextColor="#9AA2B1"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  End Date <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="calendar-end"
                    size={19}
                    color="#35B878"
                  />
                  <TextInput
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="DD MMM YYYY"
                    placeholderTextColor="#9AA2B1"
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Class Timing</Text>

            <View style={styles.textInputWrapper}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={19}
                color="#35B878"
              />
              <TextInput
                value={timing}
                onChangeText={setTiming}
                placeholder="e.g. 05:00 PM - 07:00 PM"
                placeholderTextColor="#9AA2B1"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconOrange}>
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={20}
                  color="#E69A32"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Optional batch description
                </Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Description</Text>

            <View style={[styles.textInputWrapper, styles.textAreaWrapper]}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={19}
                color="#E69A32"
                style={styles.textAreaIcon}
              />

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Enter batch description"
                placeholderTextColor="#9AA2B1"
                multiline
                textAlignVertical="top"
                style={[styles.textInput, styles.textArea]}
              />
            </View>
          </View>

          <View style={styles.infoNotice}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />
            <Text style={styles.infoText}>
              Batches can be created for Classes 8 to 12, Foundation, JEE,
              NEET and MHT-CET academic programs.
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.85}
              onPress={handleAddBatch}
            >
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.addButtonText}>Add Batch</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  header: {
    backgroundColor: "#6D35D8",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    lineHeight: 25,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  headerEditButton: {
    height: 38,
    minWidth: 92,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerEditText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#7040D5",
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  pageHeading: {
    marginBottom: 14,
  },
  pageTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    lineHeight: 25,
    color: "#172033",
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    lineHeight: 15,
    color: "#7B8498",
    marginTop: 2,
  },
  card: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionHeaderText: {
    marginLeft: 10,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#E8F8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIconOrange: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#FFF4E4",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#172033",
  },
  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#7B8498",
    marginTop: 1,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
    zIndex: 50,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  fieldContainer: {
    flex: 1,
    zIndex: 100,
  },
  fieldLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#66768A",
    marginBottom: 5,
  },
  required: {
    color: "#E95386",
  },
  textInputWrapper: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#E4E7EE",
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: "#FCFDFE",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },
  textInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#202B3E",
    marginLeft: 8,
    paddingVertical: 0,
  },
  textAreaWrapper: {
    alignItems: "flex-start",
    minHeight: 105,
    paddingTop: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    minHeight: 82,
    paddingTop: 0,
  },
  selectInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#E4E7EE",
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: "#FCFDFE",
    flexDirection: "row",
    alignItems: "center",
  },
  selectText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#202B3E",
    marginLeft: 8,
  },
  placeholderText: {
    color: "#9AA2B1",
  },
  dropdown: {
    position: "relative",
    marginTop: 6,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EE",
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 100,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
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
  dropdownItemActive: {
    backgroundColor: "#F5F0FF",
  },
  dropdownText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#4B566B",
  },
  dropdownTextActive: {
    fontFamily: "PoppinsSemiBold",
    color: "#7040D5",
  },
  infoNotice: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    backgroundColor: "#F1EAFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  infoText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    lineHeight: 14,
    color: "#5F4A8D",
    marginLeft: 8,
  },
  actionButtons: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 9,
  },
  cancelButton: {
    height: 42,
    minWidth: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9DDE6",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  cancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#66768A",
  },
  addButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  addButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 5,
  },
});
