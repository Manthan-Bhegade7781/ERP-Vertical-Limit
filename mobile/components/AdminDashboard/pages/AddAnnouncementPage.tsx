import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type AnnouncementStatus = "Published" | "Scheduled" | "Draft" | "Expired";
type AnnouncementPriority = "High" | "Medium" | "Low";

const categories = [
  "Academic",
  "Examination",
  "Results",
  "Attendance",
  "Fees",
  "PTG",
  "Events",
  "Holiday",
  "Notice",
  "General",
];

const priorities: AnnouncementPriority[] = ["High", "Medium", "Low"];

const audiences = [
  "All Users",
  "All Students",
  "Students",
  "Teachers",
  "Students & Teachers",
  "Academic Staff",
  "Staff",
];

const statuses: AnnouncementStatus[] = [
  "Draft",
  "Published",
  "Scheduled",
  "Expired",
];

const toIsoDate = (value: string): string | null => {
  if (!value || !value.trim()) return null;
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() < 100) {
    parsed.setFullYear(2000 + parsed.getFullYear());
  }
  return parsed.toISOString();
};

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
        onPress={() => setOpen((prev) => !prev)}
      >
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />
        <Text style={[styles.selectText, !value && styles.placeholder]}>
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
              style={[styles.option, value === option && styles.optionActive]}
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
                <MaterialCommunityIcons name="check" size={18} color="#7040D5" />
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
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [priority, setPriority] = useState<AnnouncementPriority>("Medium");
  const [audience, setAudience] = useState("All Students");
  const [status, setStatus] = useState<AnnouncementStatus>("Draft");
  const [expiryDate, setExpiryDate] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Academic");
    setPriority("Medium");
    setAudience("All Students");
    setStatus("Draft");
    setExpiryDate("");
    setScheduledDate("");
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !expiryDate.trim()) {
      Alert.alert(
        "Required Fields",
        "Please enter title, description, and a valid expiry date."
      );
      return;
    }

    const expiresAt = toIsoDate(expiryDate);
    if (!expiresAt) {
      Alert.alert(
        "Invalid Expiry Date",
        "Please enter a valid expiry date, e.g. 2026-12-31 or 31 Dec 2026."
      );
      return;
    }

    let scheduledAt: string | null = null;
    if (status === "Scheduled") {
      scheduledAt = toIsoDate(scheduledDate);
      if (!scheduledAt || new Date(scheduledAt).getTime() <= Date.now()) {
        Alert.alert(
          "Schedule Date Required",
          "For a scheduled announcement, please enter a valid future date/time."
        );
        return;
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      audience,
      status,
      expiresAt,
      publishedAt: status === "Published" ? new Date().toISOString() : null,
      scheduledAt: status === "Scheduled" ? scheduledAt : null,
    };

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to create announcement.");
      }

      Alert.alert(
        "Announcement Created",
        `${title.trim()} has been saved successfully.`,
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              router.back();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "Save Failed",
        err?.message || "Could not save announcement. Please try again."
      );
    } finally {
      setSaving(false);
    }
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
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Add Announcement</Text>
            <Text style={styles.headerSubtitle}>
              Create a new announcement for your branch
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            isTablet && { paddingHorizontal: 24 },
          ]}
        >
          <Text style={styles.pageTitle}>Announcement Management</Text>
          <Text style={styles.pageSubtitle}>
            Create and publish academic and branch announcements.
          </Text>

          {/* Section 1: Basic Information */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="bullhorn-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Announcement Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Primary announcement title and description
                </Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Announcement Title <Text style={styles.required}>*</Text>
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
                  placeholder="e.g. Mid-Term Examination Schedule"
                  placeholderTextColor="#9AA2B1"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Enter detailed announcement message or instructions..."
                placeholderTextColor="#9AA2B1"
                multiline
                style={[styles.textArea, { textAlignVertical: "top" }]}
              />
            </View>
          </View>

          {/* Section 2: Classification & Target Audience */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={21}
                  color="#2675E8"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Category & Audience</Text>
                <Text style={styles.sectionSubtitle}>
                  Choose classification, urgency, and recipients
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Category"
                  value={category}
                  placeholder="Select category"
                  icon="tag-outline"
                  required
                  options={categories}
                  onSelect={setCategory}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Priority"
                  value={priority}
                  placeholder="Select priority"
                  icon="flag-outline"
                  required
                  options={priorities}
                  onSelect={(v) => setPriority(v as AnnouncementPriority)}
                />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Target Audience"
                  value={audience}
                  placeholder="Select audience"
                  icon="account-group-outline"
                  required
                  options={audiences}
                  onSelect={setAudience}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Status"
                  value={status}
                  placeholder="Select status"
                  icon="check-circle-outline"
                  required
                  options={statuses}
                  onSelect={(v) => setStatus(v as AnnouncementStatus)}
                />
              </View>
            </View>
          </View>

          {/* Section 3: Scheduling & Validity */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.orangeIcon}>
                <MaterialCommunityIcons
                  name="calendar-clock-outline"
                  size={21}
                  color="#F28A17"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Validity & Schedule</Text>
                <Text style={styles.sectionSubtitle}>
                  Expiry date and optional schedule date
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Expiry Date <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="calendar-remove-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    placeholder="e.g. 2026-12-31"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>

              {status === "Scheduled" ? (
                <View style={styles.column}>
                  <Text style={styles.fieldLabel}>
                    Schedule Date & Time <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={19}
                      color="#2675E8"
                    />
                    <TextInput
                      value={scheduledDate}
                      onChangeText={setScheduledDate}
                      placeholder="e.g. 2026-11-15 09:00"
                      placeholderTextColor="#9AA2B1"
                      style={styles.input}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.column}>
                  <Text style={styles.fieldLabel}>Branch Scope</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: "#F7F8FC" }]}>
                    <MaterialCommunityIcons
                      name="office-building-outline"
                      size={19}
                      color="#8994A7"
                    />
                    <Text style={[styles.input, { color: "#58657A" }]}>
                      Assigned Branch (Automatic)
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Info Notice */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />
            <Text style={styles.infoText}>
              As an Administrator, this announcement is automatically assigned to
              your branch. Published announcements are immediately visible to the
              selected audience.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={19}
                    color="#FFFFFF"
                  />
                  <Text style={styles.saveText}>Save Announcement</Text>
                </>
              )}
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
    paddingBottom: 12,
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
    fontSize: 20,
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#E9E1FF",
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
  },
  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 19,
    color: "#172033",
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#7C879A",
    marginTop: 2,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
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
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orangeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFF1E2",
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
    marginBottom: 10,
  },
  column: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 12,
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
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
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
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 4,
    zIndex: 20,
  },
  option: {
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F8",
  },
  optionActive: {
    backgroundColor: "#F4EEFF",
  },
  optionText: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
  },
  optionTextActive: {
    fontFamily: "PoppinsMedium",
    color: "#7040D5",
  },
  infoBox: {
    backgroundColor: "#F7F3FF",
    borderWidth: 1,
    borderColor: "#E7DCFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    lineHeight: 15,
    color: "#67558F",
    marginLeft: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#DCE1EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#687386",
  },
  saveButton: {
    flex: 1.5,
    height: 46,
    borderRadius: 11,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
});
