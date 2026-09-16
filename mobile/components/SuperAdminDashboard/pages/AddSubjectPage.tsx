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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
  required?: boolean;
};

const SelectField = ({
  label,
  value,
  placeholder,
  options,
  onSelect,
  required = false,
}: SelectFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}{" "}
        {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.selectInput,
          open && styles.selectInputOpen,
        ]}
        onPress={() => setOpen((current) => !current)}
      >
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholderText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value || placeholder}
        </Text>

        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#7A8292"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                value === option && styles.dropdownOptionSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === option &&
                    styles.dropdownOptionTextSelected,
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
};

export default function AddSubjectPage() {
  const insets = useSafeAreaInsets();

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [standard, setStandard] = useState("");
  const [subjectType, setSubjectType] = useState("");
  const [teacher, setTeacher] = useState("");
  const [batch, setBatch] = useState("");
  const [description, setDescription] = useState("");

  const standardOptions = [
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
  ];

  const subjectTypeOptions = [
    "Core",
    "Foundation",
    "Entrance",
  ];

  const teacherOptions = [
    "Anita Desai - Physics",
    "Neha Kapoor - Chemistry",
    "Pooja Sharma - Biology",
    "Ravi Patil - Mathematics",
    "Meena Joshi - English & Aptitude",
    "Karan Shah - Physics & JEE",
  ];

  const batchOptions = [
    "12th JEE - Morning",
    "12th NEET - Morning",
    "11th MHT-CET - Evening",
    "10th Foundation - Afternoon",
    "9th Foundation - Evening",
    "8th Foundation - Evening",
  ];

  const handleAddSubject = () => {
    if (
      !subjectName.trim() ||
      !subjectCode.trim() ||
      !standard ||
      !subjectType ||
      !teacher ||
      !batch
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required subject details marked with *."
      );
      return;
    }

    Alert.alert(
      "Subject Added",
      `${subjectName} has been added successfully.`
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
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
          onPress={handleCancel}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Add Subject</Text>
        </View>

        <TouchableOpacity
          style={styles.editHeaderButton}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              "Edit Subject",
              "Subject editing will be available here."
            )
          }
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={16}
            color="#7040D5"
          />

          <Text style={styles.editHeaderButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeading}>
          <Text style={styles.pageTitle}>Subject Information</Text>

          <Text style={styles.pageSubtitle}>
            Add academic subject details and assign it to the appropriate
            teacher and batch.
          </Text>
        </View>

        {/* BASIC INFORMATION */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: "#F0EAFE" },
              ]}
            >
              <MaterialCommunityIcons
                name="book-open-variant"
                size={20}
                color="#7040D5"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Basic Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Enter the main subject details
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Subject Name <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={subjectName}
              onChangeText={setSubjectName}
              placeholder="e.g. Physics"
              placeholderTextColor="#A0A7B4"
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Subject Code <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={subjectCode}
              onChangeText={setSubjectCode}
              placeholder="e.g. PHY-12"
              placeholderTextColor="#A0A7B4"
              autoCapitalize="characters"
              style={styles.textInput}
            />
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <SelectField
                label="Standard"
                value={standard}
                placeholder="Select standard"
                options={standardOptions}
                onSelect={setStandard}
                required
              />
            </View>

            <View style={styles.column}>
              <SelectField
                label="Subject Type"
                value={subjectType}
                placeholder="Select type"
                options={subjectTypeOptions}
                onSelect={setSubjectType}
                required
              />
            </View>
          </View>
        </View>

        {/* ACADEMIC ASSIGNMENT */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: "#EAF2FF" },
              ]}
            >
              <MaterialCommunityIcons
                name="account-school-outline"
                size={20}
                color="#4285F4"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Academic Assignment
              </Text>

              <Text style={styles.sectionSubtitle}>
                Assign teacher and batch for this subject
              </Text>
            </View>
          </View>

          <SelectField
            label="Assigned Teacher"
            value={teacher}
            placeholder="Select teacher"
            options={teacherOptions}
            onSelect={setTeacher}
            required
          />

          <SelectField
            label="Assigned Batch"
            value={batch}
            placeholder="Select batch"
            options={batchOptions}
            onSelect={setBatch}
            required
          />
        </View>

        {/* DESCRIPTION */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: "#EAF8F0" },
              ]}
            >
              <MaterialCommunityIcons
                name="text-box-outline"
                size={20}
                color="#22A06B"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Description
              </Text>

              <Text style={styles.sectionSubtitle}>
                Add optional information about this subject
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Subject Description
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter subject description..."
              placeholderTextColor="#A0A7B4"
              multiline
              textAlignVertical="top"
              style={styles.descriptionInput}
            />
          </View>
        </View>

        {/* INFORMATION NOTICE */}
        <View style={styles.infoNotice}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#7040D5"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Subject Assignment
            </Text>

            <Text style={styles.infoText}>
              The selected teacher and batch will be associated with
              this subject after it is added.
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={handleAddSubject}
          >
            <MaterialCommunityIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              Add Subject
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  header: {
    backgroundColor: "#7040D5",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 8,
  },

  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#FFFFFF",
  },

  editHeaderButton: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  editHeaderButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#7040D5",
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 15,
    paddingTop: 17,
    paddingBottom: 30,
  },

  pageHeading: {
    marginBottom: 14,
  },

  pageTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#202533",
  },

  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    lineHeight: 16,
    color: "#7A8292",
    marginTop: 3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF0F5",
    borderRadius: 15,
    padding: 15,
    marginBottom: 13,

    shadowColor: "#1E1B4B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#252A38",
  },

  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#8A93A5",
    marginTop: 2,
  },

  fieldContainer: {
    marginBottom: 13,
  },

  fieldLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#4C5362",
    marginBottom: 6,
  },

  required: {
    color: "#E5484D",
  },

  textInput: {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    includeFontPadding: false,
    color: "#252A38",
  },

  descriptionInput: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 11,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    includeFontPadding: false,
    color: "#252A38",
  },

  twoColumnRow: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },

  column: {
    flex: 1,
    minWidth: 0,
    maxWidth: "50%",
  },

  selectInput: {
    width: "100%",
    minWidth: 0,
    minHeight: 52,
    borderWidth: 1,
    overflow: "hidden",
    borderColor: "#E3E6ED",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectInputOpen: {
    borderColor: "#7040D5",
  },

  selectText: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#252A38",
    marginRight: 8,
  },

  placeholderText: {
    color: "#A0A7B4",
  },

  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  dropdownOption: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F5",
  },

  dropdownOptionSelected: {
    backgroundColor: "#F5F0FF",
  },

  dropdownOptionText: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#4B5362",
  },

  dropdownOptionTextSelected: {
    fontFamily: "PoppinsMedium",
    color: "#7040D5",
  },

  infoNotice: {
    flexDirection: "row",
    backgroundColor: "#F3EEFF",
    borderWidth: 1,
    borderColor: "#E5D9FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 9,
  },

  infoTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#5B31B2",
    marginBottom: 2,
  },

  infoText: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 14,
    color: "#6D6480",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },

  cancelButton: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCDFE7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#626A79",
  },

  addButton: {
    flex: 1.25,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,

    shadowColor: "#7040D5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  addButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#FFFFFF",
  },
});