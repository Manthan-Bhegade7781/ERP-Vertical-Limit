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
import * as DocumentPicker from "expo-document-picker";

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

function InputField({
  label,
  value,
  placeholder,
  icon,
  onChange,
  keyboardType = "default",
  required = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onChange: (value: string) => void;
  keyboardType?: "default" | "numeric";
  required?: boolean;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.textInputWrapper}>
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />
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

export default function AddAssignmentPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const [title, setTitle] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [standard, setStandard] = useState("");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState("");
  const [status, setStatus] = useState("Assigned");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setAssignmentId("");
    setSubject("");
    setChapter("");
    setStandard("");
    setBatch("");
    setBranch("");
    setDueDate("");
    setAttachment("");
    setStatus("Assigned");
    setDescription("");
  };

  const handleUploadPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.length) {
        setAttachment(result.assets[0].name);
      }
    } catch {
      Alert.alert("Upload Error", "Unable to select the PDF file.");
    }
  };

  const handleSave = () => {
    if (
      !title.trim() ||
      !assignmentId.trim() ||
      !subject ||
      !chapter.trim() ||
      !standard ||
      !batch ||
      !branch ||
      !dueDate.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required assignment details.",
      );
      return;
    }

    Alert.alert(
      "Assignment Added",
      `${title.trim()} has been added successfully.`,
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
            <Text style={styles.headerTitle}>Add Assignment</Text>
          </View>

          {/* EDIT BUTTON - SAME AS PREVIOUS ADD PAGES */}
          <TouchableOpacity
            style={styles.headerEditButton}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Edit",
                "You are currently editing the assignment information form.",
              )
            }
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color="#7040D5"
            />
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            isTablet && styles.contentTablet,
          ]}
        >
          <Text style={styles.pageTitle}>Assignment Management</Text>
          <Text style={styles.pageSubtitle}>
            Create and assign academic work to students.
          </Text>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconPurple}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Assignment Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Basic assignment details
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <InputField
                  label="Assignment Title"
                  required
                  value={title}
                  onChange={setTitle}
                  placeholder="e.g. Newton Laws Practice"
                  icon="clipboard-text-outline"
                />
              </View>
              <View style={styles.column}>
                <InputField
                  label="Assignment ID"
                  required
                  value={assignmentId}
                  onChange={setAssignmentId}
                  placeholder="e.g. ASM007"
                  icon="identifier"
                />
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
                <InputField
                  label="Chapter"
                  required
                  value={chapter}
                  onChange={setChapter}
                  placeholder="e.g. Laws of Motion"
                  icon="book-outline"
                />
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
                    "JEE 12th",
                    "NEET 12th",
                  ]}
                  onSelect={setStandard}
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
                    "JEE 12th",
                    "NEET 12th",
                    "11th MHT-CET",
                    "10th Foundation",
                    "9th Foundation",
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
                  options={["Assigned", "Pending", "Submitted", "Overdue"]}
                  onSelect={setStatus}
                />
              </View>
            </View>
          </View>

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
                <Text style={styles.sectionTitle}>Assignment Schedule</Text>
                <Text style={styles.sectionSubtitle}>
                  Due date and attachment
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <InputField
                  label="Due Date"
                  required
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="e.g. 23 Sep 2026"
                  icon="calendar-outline"
                />
              </View>
              <View style={styles.column}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Attachment / PDF</Text>

                  <View style={styles.attachmentRow}>
                    <View style={styles.attachmentInputWrapper}>
                      <MaterialCommunityIcons
                        name="file-pdf-box"
                        size={18}
                        color="#7040D5"
                      />
                      <TextInput
                        value={attachment}
                        onChangeText={setAttachment}
                        placeholder="Select PDF"
                        placeholderTextColor="#9AA2B1"
                        style={styles.attachmentInput}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.uploadPdfButton}
                      activeOpacity={0.85}
                      onPress={handleUploadPdf}
                    >
                      <MaterialCommunityIcons
                        name="upload-outline"
                        size={17}
                        color="#FFFFFF"
                      />
                      <Text style={styles.uploadPdfText}>Upload</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description</Text>
              <View style={styles.textAreaWrapper}>
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={19}
                  color="#7040D5"
                />
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter assignment instructions..."
                  placeholderTextColor="#9AA2B1"
                  style={styles.textArea}
                  multiline
                  textAlignVertical="top"
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
              Assign the work according to the selected subject, batch and
              branch. You can edit assignment details later.
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
              <Text style={styles.saveButtonText}>Save Assignment</Text>
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  contentTablet: {
    paddingHorizontal: 22,
  },
  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 19,
    color: "#172033",
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#7C879A",
    marginTop: 2,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionIconPurple: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#F0E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionIconBlue: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202A3D",
  },
  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#8994A7",
    marginTop: 1,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 9,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 10.5,
    color: "#58657A",
    marginBottom: 5,
  },
  required: {
    color: "#E84D61",
  },
  textInputWrapper: {
    minHeight: 44,
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
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    width: "100%",
  },

  attachmentInputWrapper: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  attachmentInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 7,
    paddingVertical: 7,
  },

  uploadPdfButton: {
    height: 44,
    minWidth: 82,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadPdfText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 5,
  },

  textAreaWrapper: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingTop: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11.5,
    color: "#263047",
    marginLeft: 9,
    minHeight: 64,
    paddingTop: 0,
  },
  selectWrapper: {
    minHeight: 44,
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
    minHeight: 38,
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
    borderRadius: 11,
    padding: 11,
    marginBottom: 13,
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
    gap: 8,
    marginBottom: 14,
  },
  cancelButton: {
    minHeight: 40,
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
    minHeight: 40,
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
