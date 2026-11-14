import React, { useEffect, useState } from "react";
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
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createTeacher, fetchTeacherBranches } from "@/services/teachers";
import type { TeacherBranch } from "@/services/teachers";
import { getCurrentUser } from "@/services/auth";

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  options: string[];
  onSelect: (value: string) => void;
};

function SelectField({
  label,
  value,
  placeholder,
  icon,
  options,
  onSelect,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity
        style={styles.selectInput}
        activeOpacity={0.8}
        onPress={() => setOpen((current) => !current)}
      >
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />

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

export default function AddTeacherPage() {
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [batch, setBatch] = useState("");
  const [address, setAddress] = useState("");

  const [assignedBranch, setAssignedBranch] = useState<TeacherBranch | null>(null);
  const [isLoadingBranch, setIsLoadingBranch] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadBranch = async () => {
      setIsLoadingBranch(true);
      try {
        const [storedUser, branchList] = await Promise.all([
          getCurrentUser(),
          fetchTeacherBranches().catch(() => [] as TeacherBranch[]),
        ]);
        if (!mounted) return;
        const userBranchId = typeof storedUser?.branchId === 'object' && storedUser?.branchId
          ? (storedUser.branchId as any)._id
          : storedUser?.branchId;
        const matched = branchList.find((b: TeacherBranch) => String(b._id) === String(userBranchId));
        if (matched) {
          setAssignedBranch(matched);
        } else if (userBranchId) {
          setAssignedBranch({ _id: String(userBranchId), name: 'My Branch', code: 'BR' });
        } else if (branchList.length > 0) {
          setAssignedBranch(branchList[0]);
        }
      } catch (err) {
        console.error('Error loading branch info:', err);
      } finally {
        if (mounted) setIsLoadingBranch(false);
      }
    };
    void loadBranch();
    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setSubject("");
    setQualification("");
    setExperience("");
    setBatch("");
    setAddress("");
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !password.trim() ||
      !qualification.trim() ||
      !experience.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required teacher details marked with *."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      Alert.alert("Invalid Mobile Number", "Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("Invalid Password", "Initial password must be at least 6 characters.");
      return;
    }

    if (!assignedBranch?._id) {
      Alert.alert("Branch Required", "No assigned branch found for your admin account.");
      return;
    }

    setIsSaving(true);
    try {
      const created = await createTeacher({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobileNumber: mobile.trim(),
        password,
        branchId: assignedBranch._id,
        specialization: subject.trim(),
        qualification: qualification.trim(),
        experience: experience.trim(),
        address: address.trim(),
      });

      Alert.alert(
        "Teacher Added",
        `${fullName.trim()} has been added successfully to ${assignedBranch.name}.\nEmployee ID: ${created.employeeId}`,
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
              Enter faculty details, subject expertise and academic assignment.
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
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Basic faculty details
                </Text>
              </View>
            </View>

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
                  placeholder="Enter teacher full name"
                  placeholderTextColor="#9AA2B1"
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Email Address</Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="teacher@email.com"
                    placeholderTextColor="#9AA2B1"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Mobile Number <Text style={styles.required}>*</Text>
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
                    placeholder="Enter mobile number"
                    placeholderTextColor="#9AA2B1"
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Initial Password <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min 6 characters"
                    placeholderTextColor="#9AA2B1"
                    secureTextEntry
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Branch <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.textInputWrapper, { backgroundColor: '#F0EFF9' }]}>
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={
                      isLoadingBranch
                        ? "Loading branch..."
                        : assignedBranch
                        ? `${assignedBranch.name}`
                        : "Branch unavailable"
                    }
                    editable={false}
                    style={[styles.textInput, { color: '#4B3F72', fontWeight: '500' }]}
                  />
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={17}
                    color="#7040D5"
                  />
                </View>
              </View>
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

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Primary Subject"
                  value={subject}
                  placeholder="Select subject"
                  icon="book-open-outline"
                  options={[
                    "Physics",
                    "Chemistry",
                    "Mathematics",
                    "Biology",
                    "English",
                    "Aptitude",
                  ]}
                  onSelect={setSubject}
                />
              </View>

              <View style={styles.column}>
                <SelectField
                  label="Qualification"
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

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Teaching Experience"
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

              <View style={styles.column}>
                <SelectField
                  label="Assigned Batch"
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
          </View>

          {/* ADDRESS */}
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
                <Text style={styles.sectionTitle}>Contact Information</Text>
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
                  placeholder="Enter teacher address"
                  placeholderTextColor="#9AA2B1"
                  multiline
                  textAlignVertical="top"
                  style={[styles.textInput, styles.textArea]}
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
              Faculty assignments support Classes 8 to 12, Foundation, JEE,
              NEET and MHT-CET academic modules.
            </Text>
          </View>

          {/* ACTIONS */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && { opacity: 0.65 }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="account-plus-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.saveButtonText}>Add Teacher</Text>
                </>
              )}
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
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 18,
    color: "#FFFFFF",
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

  container: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  pageTitleContainer: {
    marginBottom: 16,
  },

  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#172033",
  },

  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#748096",
    marginTop: 3,
    lineHeight: 15,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF0F5",
    borderRadius: 15,
    padding: 15,
    marginBottom: 13,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionIconPurple: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#E7F8EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#172033",
  },

  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#8A93A5",
    marginTop: 2,
  },

  fieldContainer: {
    marginBottom: 13,
  },

  fieldLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#344054",
    marginBottom: 5,
  },

  required: {
    color: "#E95386",
  },

  textInputWrapper: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  textInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#172033",
  },

  twoColumn: {
    flexDirection: "row",
    gap: 10,
  },

  column: {
    flex: 1,
  },

  selectInput: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  selectText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#344054",
  },

  placeholderText: {
    color: "#9AA2B1",
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
    minHeight: 42,
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
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#344054",
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
