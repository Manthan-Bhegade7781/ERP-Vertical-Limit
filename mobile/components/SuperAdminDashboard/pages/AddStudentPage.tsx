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
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStudent, fetchStudentBatches } from "../../../services/students";
import type { StudentBatch } from "../../../services/students";

/* ================================================================
   SELECT FIELD
================================================================ */

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  options: string[];
  required?: boolean;
  onSelect: (value: string) => void;
};

function SelectField({
  label,
  value,
  placeholder,
  icon,
  options,
  required = false,
  onSelect,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[
          styles.selectInput,
          open && styles.selectInputActive,
        ]}
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

/* ================================================================
   INPUT FIELD
================================================================ */

type InputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  required?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  onChangeText: (value: string) => void;
};

function InputField({
  label,
  value,
  placeholder,
  icon,
  required = false,
  keyboardType = "default",
  secureTextEntry = false,
  onChangeText,
}: InputFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={styles.textInputWrapper}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color="#7040D5"
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA2B1"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={
            keyboardType === "email-address"
              ? "none"
              : "sentences"
          }
          style={styles.textInput}
        />
      </View>
    </View>
  );
}

/* ================================================================
   ADD STUDENT PAGE
================================================================ */

export default function AddStudentPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  /* ============================================================
     PERSONAL INFORMATION
  ============================================================ */

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  /* ============================================================
     ACCOUNT INFORMATION
  ============================================================ */

  const [password, setPassword] = useState("");

  /* ============================================================
     ACADEMIC INFORMATION
  ============================================================ */

  const [batch, setBatch] = useState("");

  /* ============================================================
     PARENT / GUARDIAN INFORMATION
  ============================================================ */

  const [guardianName, setGuardianName] = useState("");
  const [guardianMobile, setGuardianMobile] = useState("");
  const [address, setAddress] = useState("");
  const [availableBatches, setAvailableBatches] = useState<StudentBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ============================================================
     LOAD AVAILABLE BATCHES FROM BACKEND
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadBatches = async () => {
      setLoadingBatches(true);
      try {
        const result = await fetchStudentBatches();
        if (mounted) {
          setAvailableBatches(result.filter((item) => !item.isRemoved));
        }
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : "Unable to load batches. Please try again.";
        if (mounted) {
          Alert.alert("Unable to Load Batches", message);
        }
      } finally {
        if (mounted) setLoadingBatches(false);
      }
    };

    void loadBatches();
    return () => {
      mounted = false;
    };
  }, []);

  const batchOptions = availableBatches.map((item) => item.name);

  /* ============================================================
     RESET FORM
  ============================================================ */

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setBatch("");
    setGuardianName("");
    setGuardianMobile("");
    setAddress("");
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const handleSave = async () => {
    if (saving) return;
    if (!fullName.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter the student's full name."
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter the student's email address."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (!mobile.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter the student's mobile number."
      );
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      Alert.alert(
        "Invalid Mobile",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter an initial password."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!batch) {
      Alert.alert(
        "Required Field",
        "Please select a batch."
      );
      return;
    }

    if (
      guardianMobile.trim() &&
      !/^\d{10}$/.test(guardianMobile.trim())
    ) {
      Alert.alert(
        "Invalid Guardian Mobile",
        "Please enter a valid 10-digit guardian mobile number."
      );
      return;
    }

    const selectedBatch = availableBatches.find((item) => item.name === batch);
    if (!selectedBatch?._id) {
      Alert.alert(
        "Invalid Batch",
        loadingBatches
          ? "Please wait while available batches are loading."
          : "Please select an available batch."
      );
      return;
    }

    setSaving(true);
    try {
      const result = await createStudent({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobileNumber: mobile.trim(),
        password,
        batchId: selectedBatch._id,
        guardianName: guardianName.trim(),
        guardianMobile: guardianMobile.trim(),
        address: address.trim(),
      });

      Alert.alert(
        "Student Added",
        result.message || `${fullName.trim()} has been added successfully.`,
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
      const message = error instanceof Error
        ? error.message
        : "Unable to create student. Please try again.";
      Alert.alert("Unable to Add Student", message);
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View style={styles.safeArea}>
      {/* ========================================================
          HEADER
      ======================================================== */}

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
          <Text style={styles.headerTitle}>Add Student</Text>

          <Text style={styles.headerSubtitle}>
            Create a new student account
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            isTablet && { paddingHorizontal: 24 },
          ]}
        >
          {/* ====================================================
              PAGE TITLE
          ==================================================== */}

          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>
              Student Information
            </Text>

            <Text style={styles.pageSubtitle}>
              Enter student details, account information and
              parent contact.
            </Text>
          </View>

          {/* ====================================================
              PERSONAL INFORMATION
          ==================================================== */}

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconPurple}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Personal Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Basic student details
                </Text>
              </View>
            </View>

            {/* Full Name */}

            <InputField
              label="Full Name"
              value={fullName}
              placeholder="Enter full name"
              icon="account-outline"
              required
              onChangeText={setFullName}
            />

            {/* Email + Mobile */}

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <InputField
                  label="Email Address"
                  value={email}
                  placeholder="Enter email"
                  icon="email-outline"
                  required
                  keyboardType="email-address"
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.column}>
                <InputField
                  label="Mobile Number"
                  value={mobile}
                  placeholder="Enter mobile"
                  icon="phone-outline"
                  required
                  keyboardType="phone-pad"
                  onChangeText={setMobile}
                />
              </View>
            </View>
          </View>

          {/* ====================================================
              ACCOUNT INFORMATION
          ==================================================== */}

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconPurple}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Account Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Login credentials for the student
                </Text>
              </View>
            </View>

            <InputField
              label="Initial Password"
              value={password}
              placeholder="Enter initial password"
              icon="lock-outline"
              required
              secureTextEntry
              onChangeText={setPassword}
            />

            <View style={styles.passwordNotice}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color="#7040D5"
              />

              <Text style={styles.passwordNoticeText}>
                This password will be used for the students
                initial login.
              </Text>
            </View>
          </View>

          {/* ====================================================
              ACADEMIC INFORMATION
          ==================================================== */}

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
                <Text style={styles.sectionTitle}>
                  Academic Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Select the students batch
                </Text>
              </View>
            </View>

            <SelectField
              label="Batch"
              value={batch}
              placeholder={loadingBatches ? "Loading batches..." : "Select batch"}
              icon="google-circles-communities"
              options={batchOptions}
              required
              onSelect={setBatch}
            />

            <View style={styles.infoNoticeSmall}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color="#7040D5"
              />

              <Text style={styles.infoNoticeSmallText}>
                Standard and branch are automatically determined
                from the selected batch. Subjects will be assigned
                separately.
              </Text>
            </View>
          </View>

          {/* ====================================================
              PARENT / GUARDIAN INFORMATION
          ==================================================== */}

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconGreen}>
                <MaterialCommunityIcons
                  name="account-supervisor-outline"
                  size={20}
                  color="#35B878"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Parent / Guardian Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Parent or guardian contact details
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <InputField
                  label="Guardian Name"
                  value={guardianName}
                  placeholder="Enter name"
                  icon="account-supervisor-outline"
                  onChangeText={setGuardianName}
                />
              </View>

              <View style={styles.column}>
                <InputField
                  label="Guardian Mobile"
                  value={guardianMobile}
                  placeholder="Enter mobile"
                  icon="phone-outline"
                  keyboardType="phone-pad"
                  onChangeText={setGuardianMobile}
                />
              </View>
            </View>

            {/* Address */}

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Address
              </Text>

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

          {/* ====================================================
              INFORMATION NOTICE
          ==================================================== */}

          <View style={styles.infoNotice}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />

            <Text style={styles.infoText}>
              A unique Student ID will be generated automatically
              after the student is created. Standard and branch
              information comes from the selected batch.
            </Text>
          </View>

          {/* ====================================================
              ACTIONS
          ==================================================== */}

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
              disabled={saving || loadingBatches}
            >
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                {saving ? "Adding..." : "Add Student"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  /* ============================================================
     HEADER
  ============================================================ */

  header: {
    backgroundColor: "#7040D5",
    paddingHorizontal: 16,
    paddingBottom: 12,
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

  headerSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#E9E1FF",
    marginTop: 2,
  },

  /* ============================================================
     CONTAINER
  ============================================================ */

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 34,
  },

  /* ============================================================
     PAGE TITLE
  ============================================================ */

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

  /* ============================================================
     CARD
  ============================================================ */

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

  /* ============================================================
     SECTION HEADER
  ============================================================ */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF3",
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
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

  /* ============================================================
     FORM FIELDS
  ============================================================ */

  fieldContainer: {
    marginTop: 13,
    flex: 1,
    minWidth: 0,
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

  /* ============================================================
     SELECT
  ============================================================ */

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

  selectInputActive: {
    borderColor: "#7040D5",
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE1E9",
    overflow: "hidden",

    elevation: 5,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  dropdownItem: {
    minHeight: 46,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F6",
  },

  dropdownItemActive: {
    backgroundColor: "#F1EAFF",
  },

  dropdownText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#344054",
  },

  dropdownTextActive: {
    fontFamily: "PoppinsSemiBold",
    color: "#7040D5",
  },

  /* ============================================================
     PASSWORD NOTICE
  ============================================================ */

  passwordNotice: {
    marginTop: 10,
    padding: 11,
    borderRadius: 10,
    backgroundColor: "#F8F4FF",
    borderWidth: 1,
    borderColor: "#E9DFFF",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  passwordNoticeText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    lineHeight: 15,
    color: "#7040D5",
  },

  /* ============================================================
     SMALL INFORMATION NOTICE
  ============================================================ */

  infoNoticeSmall: {
    marginTop: 10,
    padding: 11,
    borderRadius: 10,
    backgroundColor: "#F8F4FF",
    borderWidth: 1,
    borderColor: "#E9DFFF",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  infoNoticeSmallText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    lineHeight: 15,
    color: "#7040D5",
  },

  /* ============================================================
     TEXT AREA
  ============================================================ */

  textAreaWrapper: {
    minHeight: 92,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  textAreaIcon: {
    marginTop: 2,
  },

  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
    paddingTop: 0,
  },

  /* ============================================================
     INFORMATION NOTICE
  ============================================================ */

  infoNotice: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    backgroundColor: "#F1EAFF",
    borderWidth: 1,
    borderColor: "#E8DEFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 9,
  },

  infoText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    lineHeight: 16,
    color: "#7040D5",
  },

  /* ============================================================
     ACTION BUTTONS
  ============================================================ */

  actionButtons: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE1E9",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#687386",
  },

  saveButton: {
    flex: 1.4,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,

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
    fontSize: 12,
    color: "#FFFFFF",
  },
});