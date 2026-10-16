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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
        style={styles.selectWrapper}
        activeOpacity={0.8}
        onPress={() => setOpen((current) => !current)}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color="#7040D5"
        />
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#8994A7"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownItem,
                value === option && styles.dropdownItemActive,
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
                  value === option && styles.dropdownTextActive,
                ]}
              >
                {option}
              </Text>

              {value === option && (
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

function DateTimeField({
  label,
  value,
  placeholder,
  icon,
  onChange,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onChange: (value: string) => void;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.textInputWrapper}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color="#7040D5"
        />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9AA2B1"
          keyboardType={keyboardType}
          style={styles.textInput}
        />
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
  const [subject, setSubject] = useState("");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [status, setStatus] = useState("Scheduled");

  const resetForm = () => {
    setExamName("");
    setExamId("");
    setSubject("");
    setBatch("");
    setBranch("");
    setDate("");
    setTime("");
    setDuration("");
    setTotalMarks("");
    setStatus("Scheduled");
  };

  const handleSave = () => {
    if (
      !examName.trim() ||
      !examId.trim() ||
      !subject ||
      !batch ||
      !branch ||
      !date.trim() ||
      !time.trim() ||
      !duration.trim() ||
      !totalMarks.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required examination details.",
      );
      return;
    }

    Alert.alert(
      "Examination Added",
      `${examName.trim()} has been added successfully.`,
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
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
            <Text style={styles.headerTitle}>Add Examination</Text>
          </View>

          {/* EDIT BUTTON - SAME AS PREVIOUS ADD PAGES */}
         
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            isTablet && styles.contentTablet,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>Examination Management</Text>
          <Text style={styles.pageSubtitle}>
            Create and schedule examinations for students.
          </Text>

          {/* EXAMINATION INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconPurple}>
                <MaterialCommunityIcons
                  name="file-document-edit-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Examination Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Basic examination details
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Examination Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={examName}
                    onChangeText={setExamName}
                    placeholder="Enter examination name"
                    placeholderTextColor="#9AA2B1"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Examination ID <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="identifier"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={examId}
                    onChangeText={setExamId}
                    placeholder="e.g. EXM007"
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
                  label="Subject"
                  required
                  value={subject}
                  placeholder="Select subject"
                  icon="book-open-outline"
                  options={[
                    "Physics",
                    "Mathematics",
                    "Chemistry",
                    "Biology",
                    "English",
                  ]}
                  onSelect={setSubject}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Batch"
                  required
                  value={batch}
                  placeholder="Select batch"
                  icon="google-circles-communities"
                  options={[
                    "8th Foundation - Evening",
                    "9th Foundation - Evening",
                    "10th Foundation - Afternoon",
                    "11th MHT-CET - Evening",
                    "12th JEE - Morning",
                    "12th NEET - Morning",
                  ]}
                  onSelect={setBatch}
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
                    "Pune Branch",
                    "Mumbai Branch",
                    "Nashik Branch",
                    "Nagpur Branch",
                    "Main Branch",
                  ]}
                  onSelect={setBranch}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Status"
                  value={status}
                  placeholder="Select status"
                  icon="progress-clock"
                  options={["Scheduled", "Ongoing", "Completed", "Cancelled"]}
                  onSelect={setStatus}
                />
              </View>
            </View>
          </View>

          {/* SCHEDULE */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBlue}>
                <MaterialCommunityIcons
                  name="calendar-clock-outline"
                  size={20}
                  color="#2675E8"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Examination Schedule
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Date, time and duration
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <DateTimeField
                  label="Date *"
                  value={date}
                  onChange={setDate}
                  placeholder="e.g. 22 Sep 2026"
                  icon="calendar-outline"
                />
              </View>

              <View style={styles.column}>
                <DateTimeField
                  label="Time *"
                  value={time}
                  onChange={setTime}
                  placeholder="e.g. 10:00 AM"
                  icon="clock-outline"
                />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <DateTimeField
                  label="Duration *"
                  value={duration}
                  onChange={setDuration}
                  placeholder="e.g. 2 Hours"
                  icon="timer-outline"
                />
              </View>

              <View style={styles.column}>
                <DateTimeField
                  label="Total Marks *"
                  value={totalMarks}
                  onChange={setTotalMarks}
                  placeholder="e.g. 100"
                  icon="numeric"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.infoNotice}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />
            <Text style={styles.infoText}>
              Schedule the examination according to the selected batch and
              branch. You can edit examination details later.
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={handleSave}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={19}
                color="#FFFFFF"
              />
              <Text style={styles.saveButtonText}>
                Save Examination
              </Text>
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
    fontSize: 10.5,
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
});
