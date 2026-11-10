import React, { useEffect, useState } from "react";
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
import { createTeacher, fetchTeacherBranches } from "../../../services/teachers";
import type { TeacherBranch } from "../../../services/teachers";

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
          ellipsizeMode="tail"
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

export default function AddTeacherPage() {
  const insets = useSafeAreaInsets();

  // PERSONAL INFORMATION
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [branch, setBranch] = useState("");

  // ACCOUNT INFORMATION
  const [password, setPassword] = useState("");

  // PROFESSIONAL INFORMATION
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");

  // CONTACT INFORMATION
  const [address, setAddress] = useState("");
  const [branchOptions, setBranchOptions] = useState<TeacherBranch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const result = await fetchTeacherBranches();
        if (mounted) {
          setBranchOptions(result.filter((item) => !item.status || item.status.toLowerCase() === "active"));
        }
      } catch (error) {
        if (mounted) {
          Alert.alert(
            "Unable to Load Branches",
            error instanceof Error ? error.message : "Please check your connection and try again.",
          );
        }
      } finally {
        if (mounted) setIsLoadingBranches(false);
      }
    };
    void loadBranches();
    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setMobile("");
    setBranch("");
    setPassword("");
    setSpecialization("");
    setQualification("");
    setExperience("");
    setAddress("");
  };

  const handleSave = async () => {
    if (isSaving) return;

    // Required fields
    if (
      !fullName.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !password.trim() ||
      !qualification.trim() ||
      !experience.trim() ||
      !branch
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required teacher details marked with *."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert(
        "Invalid Password",
        "Initial password must be at least 6 characters long."
      );
      return;
    }

    const selectedBranch = branchOptions.find((item) => item.name === branch);
    if (!selectedBranch?._id) {
      Alert.alert(
        "Branch Required",
        isLoadingBranches
          ? "Please wait while active branches are loading."
          : "Please select a valid active branch."
      );
      return;
    }

    setIsSaving(true);
    try {
      const created = await createTeacher({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobileNumber: mobile.trim(),
        password,
        branchId: selectedBranch._id,
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experience: experience.trim(),
        address: address.trim(),
      });

      Alert.alert(
        "Teacher Added",
        `${fullName.trim()} has been added successfully.\nEmployee ID: ${created.employeeId}`,
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
    } catch (error) {
      Alert.alert(
        "Unable to Add Teacher",
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      {/* HEADER */}
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
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Add Teacher</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* PAGE TITLE */}
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>Teacher Information</Text>

            <Text style={styles.pageSubtitle}>
              Create a teacher account and enter faculty information.
            </Text>
          </View>

          {/* PERSONAL INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconPurple}>
                <MaterialCommunityIcons
                  name="account-tie-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Personal Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Basic faculty details
                </Text>
              </View>
            </View>

            {/* FULL NAME */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.textInputWrapper}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={19}
                  color="#7040D5"
                />

                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter full name"
                  placeholderTextColor="#9AA2B1"
                  autoCapitalize="words"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* EMAIL + MOBILE */}
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Email Address{" "}
                  <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={19}
                    color="#7040D5"
                  />

                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    placeholderTextColor="#9AA2B1"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Mobile Number{" "}
                  <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={19}
                    color="#7040D5"
                  />

                  <TextInput
                    value={mobile}
                    onChangeText={setMobile}
                    placeholder="Enter mobile"
                    placeholderTextColor="#9AA2B1"
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>

            {/* BRANCH */}
            <SelectField
              label="Branch"
              required
              value={branch}
              placeholder="Select branch"
              icon="office-building-outline"
              options={branchOptions.map((item) => item.name)}
              onSelect={setBranch}
            />
          </View>

          {/* ACCOUNT INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconOrange}>
                <MaterialCommunityIcons
                  name="shield-account-outline"
                  size={20}
                  color="#E58A2B"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Account Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Login credentials for the teacher
                </Text>
              </View>
            </View>

            {/* INITIAL PASSWORD */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Initial Password{" "}
                <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.textInputWrapper}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={19}
                  color="#E58A2B"
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter initial password"
                  placeholderTextColor="#9AA2B1"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.textInput}
                />
              </View>

              <Text style={styles.helperText}>
                The password will be securely hashed before being stored.
              </Text>
            </View>
          </View>

          {/* PROFESSIONAL INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBlue}>
                <MaterialCommunityIcons
                  name="book-education-outline"
                  size={20}
                  color="#2675E8"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Professional Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Subject expertise and qualifications
                </Text>
              </View>
            </View>

            {/* SPECIALIZATION + QUALIFICATION */}
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Specialization"
                  value={specialization}
                  placeholder="Select specialization"
                  icon="book-open-outline"
                  options={[
                    "Physics",
                    "Chemistry",
                    "Mathematics",
                    "Biology",
                    "English",
                    "Aptitude",
                    "Science",
                    "Other",
                  ]}
                  onSelect={setSpecialization}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Qualification"
                  required
                  value={qualification}
                  placeholder="Select qualification"
                  icon="school-outline"
                  options={[
                    "B.Sc.",
                    "M.Sc.",
                    "B.Tech.",
                    "M.Tech.",
                    "B.E.",
                    "M.E.",
                    "M.Ed.",
                    "Other",
                  ]}
                  onSelect={setQualification}
                />
              </View>
            </View>

            {/* EXPERIENCE */}
            <SelectField
              label="Teaching Experience"
              required
              value={experience}
              placeholder="Select experience"
              icon="briefcase-outline"
              options={[
                "0 - 2 Years",
                "3 - 5 Years",
                "6 - 10 Years",
                "11 - 15 Years",
                "15+ Years",
              ]}
              onSelect={setExperience}
            />
          </View>

          {/* CONTACT INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconGreen}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={20}
                  color="#35B878"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Contact Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Faculty address details
                </Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Address</Text>

              <View
                style={[
                  styles.textInputWrapper,
                  styles.textAreaWrapper,
                ]}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={19}
                  color="#35B878"
                  style={styles.textAreaIcon}
                />

                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter address"
                  placeholderTextColor="#9AA2B1"
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.textInput,
                    styles.textArea,
                  ]}
                />
              </View>
            </View>
          </View>

          {/* INFORMATION NOTICE */}
          <View style={styles.infoNotice}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />

            <Text style={styles.infoText}>
              Employee ID is generated automatically by the system.
              Batch and subject assignments are managed separately in Batch Management.
            </Text>
          </View>

          {/* ACTIONS */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={() => { void handleSave(); }}
              disabled={isSaving || isLoadingBranches}
            >
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                {isSaving ? "Adding Teacher..." : "Add Teacher"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
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
    height: 44,
    minWidth: 112,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerEditText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#7040D5",
    marginLeft: 6,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 34,
  },

  pageTitleContainer: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    marginBottom: 14,
  },

  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#172033",
  },

  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#748096",
    marginTop: 3,
    lineHeight: 16,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 2,
  },

  sectionIconPurple: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  sectionIconBlue: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  sectionIconGreen: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#E7F8EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  sectionIconOrange: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF2E4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#172033",
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
    color: "#59657A",
    marginBottom: 7,
    includeFontPadding: false,
  },

  required: {
    color: "#E95386",
  },

  textInputWrapper: {
    width: "100%",
    minWidth: 0,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE1E9",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  textInput: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
    minHeight: 48,
    marginLeft: 7,
    paddingVertical: 0,
    paddingRight: 0,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#172033",
    includeFontPadding: false,
  },

  helperText: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#8A93A5",
    marginTop: 5,
    lineHeight: 13,
  },

  twoColumn: {
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE1E9",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  selectText: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
    marginLeft: 7,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#344054",
    includeFontPadding: false,
  },

  placeholderText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#9AA2B1",
    includeFontPadding: false,
  },

  dropdown: {
    marginTop: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    overflow: "hidden",
    elevation: 4,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  dropdownItem: {
    minHeight: 44,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F6",
  },

  dropdownItemActive: {
    backgroundColor: "#F8F5FF",
  },

  dropdownText: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#344054",
    includeFontPadding: false,
  },

  dropdownTextActive: {
    fontFamily: "PoppinsSemiBold",
    color: "#7040D5",
  },

  textAreaWrapper: {
    height: 88,
    alignItems: "flex-start",
    paddingTop: 11,
  },

  textAreaIcon: {
    marginTop: 2,
  },

  textArea: {
    minHeight: 65,
    textAlignVertical: "top",
    paddingTop: 0,
  },

  infoNotice: {
    backgroundColor: "#F8F5FF",
    borderWidth: 1,
    borderColor: "#E8DEFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  infoText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    lineHeight: 13,
    color: "#65558A",
    marginLeft: 8,
  },

  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#DDE1E8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#667085",
  },

  saveButton: {
    flex: 1.35,
    height: 46,
    borderRadius: 11,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#7040D5",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },

  saveButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 6,
  },
});