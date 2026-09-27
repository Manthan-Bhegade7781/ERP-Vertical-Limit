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

export default function AddSubjectPage() {
  const insets = useSafeAreaInsets();

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [standard, setStandard] = useState("");
  const [subjectType, setSubjectType] = useState("");
  const [teacher, setTeacher] = useState("");
  const [branch, setBranch] = useState("");
  const [description, setDescription] = useState("");

  const handleAddSubject = () => {
    const name = subjectName.trim();
    const code = subjectCode.trim();

    if (!name || !code || !standard || !subjectType || !teacher || !branch) {
      Alert.alert(
        "Required Fields",
        "Please fill Subject Name, Subject Code, Standard, Type, Teacher and Branch.",
      );
      return;
    }

    Alert.alert("Subject Added", `${name} has been added successfully.`, [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.root}>
        <View style={styles.header}>
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

          <Text style={styles.headerTitle}>Add Subject</Text>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={17}
              color="#7040D5"
            />
            <Text style={styles.editButtonText}>Edit</Text>
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
            <Text style={styles.pageTitle}>Add New Subject</Text>
            <Text style={styles.pageSubtitle}>
              Create a subject and assign it to the required academic module.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="book-open-page-variant-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Subject Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Basic subject details
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Subject Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="book-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={subjectName}
                    onChangeText={setSubjectName}
                    placeholder="e.g. Physics"
                    placeholderTextColor="#9AA2B1"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Subject Code <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="identifier"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={subjectCode}
                    onChangeText={setSubjectCode}
                    placeholder="e.g. SUB801"
                    placeholderTextColor="#9AA2B1"
                    autoCapitalize="characters"
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBlue}>
                <MaterialCommunityIcons
                  name="school-outline"
                  size={20}
                  color="#2675E8"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Academic Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Standard and subject classification
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Standard"
                  required
                  value={standard}
                  placeholder="Select standard"
                  icon="school-outline"
                  options={[
                    "8th",
                    "9th",
                    "10th",
                    "11th",
                    "12th",
                    "MHT-CET",
                    "NEET",
                    "JEE",
                    "Foundation",
                  ]}
                  onSelect={setStandard}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Type"
                  required
                  value={subjectType}
                  placeholder="Select type"
                  icon="shape-outline"
                  options={[
                    "Entrance",
                    "Core",
                    "Science",
                  ]}
                  onSelect={setSubjectType}
                />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Teacher"
                  required
                  value={teacher}
                  placeholder="Select teacher"
                  icon="account-tie-outline"
                  options={[
                    "Dr. Amit Kulkarni",
                    "Sneha Patil",
                    "Rahul Deshmukh",
                    "Priya Joshi",
                    "Unassigned",
                  ]}
                  onSelect={setTeacher}
                />
              </View>

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
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconGreen}>
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={20}
                  color="#35B878"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Optional subject description
                </Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Description</Text>
            <View style={[styles.textInputWrapper, styles.textAreaWrapper]}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={19}
                color="#35B878"
                style={styles.textAreaIcon}
              />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Enter subject description"
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
              Subjects can be assigned to Classes 8 to 12, Foundation, JEE,
              NEET and MHT-CET academic modules.
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
              onPress={handleAddSubject}
            >
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.addButtonText}>Add Subject</Text>
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
    height: 64,
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
  headerTitle: {
    flex: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    lineHeight: 26,
    color: "#FFFFFF",
    marginLeft: 12,
  },
  headerSpacer: {
    width: 36,
  },
  editButton: {
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E9E1F8",
  },

  editButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#7040D5",
    marginLeft: 5,
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
