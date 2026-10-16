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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Status = "Published" | "Scheduled" | "Draft";
type Type = "Examination" | "Academic" | "Holiday" | "Branch" | "General";

function SelectField({
  label,
  value,
  placeholder,
  icon,
  options,
  onSelect,
  required = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  options: string[];
  onSelect: (value: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        style={styles.select}
        activeOpacity={0.8}
        onPress={() => setOpen((value) => !value)}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color="#7040D5"
        />
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholder,
          ]}
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
                styles.option,
                value === option && styles.optionActive,
              ]}
              onPress={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  value === option && styles.optionTextActive,
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

export default function AddAnnouncementPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [announcementId, setAnnouncementId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [branch, setBranch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const handleSave = () => {
    if (
      !title.trim() ||
      !announcementId.trim() ||
      !description.trim() ||
      !date.trim() ||
      !branch.trim() ||
      !type ||
      !status
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required announcement details."
      );
      return;
    }

    Alert.alert(
      "Announcement Added",
      `${title.trim()} has been added successfully.`,
      [{ text: "OK", onPress: () => router.back() }]
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
            <Text style={styles.headerTitle}>
              Add Announcement
            </Text>
          </View>

          {/* SAME EDIT BUTTON AS PREVIOUS ADD PAGES */}
          
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Text style={styles.pageTitle}>
            Announcement Management
          </Text>
          <Text style={styles.pageSubtitle}>
            Create and publish academic and branch announcements.
          </Text>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="bullhorn-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>
                  Announcement Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Basic announcement details
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Announcement Title{" "}
                  <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="format-title"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter announcement title"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Announcement ID{" "}
                  <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="identifier"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={announcementId}
                    onChangeText={setAnnouncementId}
                    placeholder="e.g. ANN007"
                    placeholderTextColor="#9AA2B1"
                    autoCapitalize="characters"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.fieldLabel}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter announcement description"
              placeholderTextColor="#9AA2B1"
              multiline
              style={[styles.textArea, { textAlignVertical: "top" }]}
            />

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Date <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="e.g. 20 Sep 2026"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Branch <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={branch}
                    onChangeText={setBranch}
                    placeholder="Enter branch"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={21}
                  color="#2675E8"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>
                  Announcement Settings
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Choose type and publication status
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Type"
                  value={type}
                  placeholder="Select type"
                  icon="file-document-outline"
                  required
                  options={[
                    "Examination",
                    "Academic",
                    "Holiday",
                    "Branch",
                    "General",
                  ]}
                  onSelect={setType}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Status"
                  value={status}
                  placeholder="Select status"
                  icon="check-circle-outline"
                  required
                  options={[
                    "Published",
                    "Scheduled",
                    "Draft",
                  ]}
                  onSelect={setStatus}
                />
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />
            <Text style={styles.infoText}>
              Published announcements will be visible to the
              selected branch users according to your application
              permissions.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
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
              <Text style={styles.saveText}>
                Save Announcement
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },
  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 19,
    color: "#172033",
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7C879A",
    marginTop: 2,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  blueIcon: {
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
    fontSize: 9,
    color: "#8994A7",
    marginTop: 1,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  column: {
    flex: 1,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 10,
  },
  fieldLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#58657A",
    marginBottom: 5,
  },
  required: {
    color: "#E84D61",
  },
  inputWrapper: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 8,
    paddingVertical: 7,
  },
  textArea: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingTop: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginBottom: 10,
  },
  select: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 8,
  },
  placeholder: {
    color: "#9AA2B1",
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 5,
    zIndex: 20,
  },
  option: {
    minHeight: 38,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },
  optionActive: {
    backgroundColor: "#F4EEFF",
  },
  optionText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#4E5A6F",
  },
  optionTextActive: {
    fontFamily: "PoppinsSemiBold",
    color: "#7040D5",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F2EDFF",
    borderRadius: 11,
    padding: 11,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#675D7A",
    lineHeight: 15,
    marginLeft: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 7,
  },
  cancelButton: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDE5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#687388",
  },
  saveButton: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
