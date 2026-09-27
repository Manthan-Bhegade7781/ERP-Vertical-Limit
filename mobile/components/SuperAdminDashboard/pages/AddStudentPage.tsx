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
  useWindowDimensions,
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

function MultiSelectField({
  label,
  values,
  placeholder,
  icon,
  options,
  onToggle,
}: {
  label: string;
  values: string[];
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  options: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} <Text style={styles.required}>*</Text>
      </Text>

      <TouchableOpacity
        style={styles.selectInput}
        activeOpacity={0.8}
        onPress={() => setOpen((current) => !current)}
      >
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />

        <View style={styles.multiSelectValue}>
          {values.length === 0 ? (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          ) : (
            <Text style={styles.selectText} numberOfLines={1}>
              {values.join(", ")}
            </Text>
          )}
        </View>

        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#8A93A5"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.map((option) => {
            const selected = values.includes(option);

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  selected && styles.dropdownItemActive,
                ]}
                activeOpacity={0.8}
                onPress={() => onToggle(option)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    selected && styles.dropdownTextActive,
                  ]}
                >
                  {option}
                </Text>

                <MaterialCommunityIcons
                  name={selected ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={19}
                  color={selected ? "#7040D5" : "#8A93A5"}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function AddStudentPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [standard, setStandard] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [address, setAddress] = useState("");

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setMobile("");
    setStandard("");
    setSelectedSubjects([]);
    setBatch("");
    setBranch("");
    setParentName("");
    setParentMobile("");
    setAddress("");
  };

  const handleSave = () => {
    if (
      !fullName.trim() ||
      !mobile.trim() ||
      !standard ||
      selectedSubjects.length === 0 ||
      !batch ||
      !branch
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required student details."
      );
      return;
    }

    Alert.alert(
      "Student Added",
      `${fullName.trim()} has been added successfully.`,
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
          <Text style={styles.headerTitle}>Add Student</Text>
        </View>

        <TouchableOpacity
          style={styles.headerEditButton}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              "Edit",
              "You are currently editing the student information form."
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
          {/* PAGE TITLE */}
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>Student Information</Text>
            <Text style={styles.pageSubtitle}>
              Enter student details, academic information and parent information.
            </Text>
          </View>

          {/* PERSONAL INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconPurple}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Personal Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Basic student details
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
                  placeholder="Enter full name"
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
                    placeholder="Enter email"
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
                    placeholder="Enter mobile"
                    placeholderTextColor="#9AA2B1"
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* ACADEMIC INFORMATION */}
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
                  Standard, subject and batch details
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Standard"
                  value={standard}
                  placeholder="Select standard"
                  icon="school-outline"
                  options={[
                    "8th Standard",
                    "9th Standard",
                    "10th Standard",
                    "11th Standard",
                    "12th Standard",
                  ]}
                  onSelect={setStandard}
                />
              </View>

              <View style={styles.column}>
                <MultiSelectField
                  label="Subject"
                  values={selectedSubjects}
                  placeholder="Select subject"
                  icon="book-open-outline"
                  options={[
                    "Physics",
                    "Mathematics",
                    "Chemistry",
                    "Biology",
                  ]}
                  onToggle={(value) =>
                    setSelectedSubjects((current) =>
                      current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value]
                    )
                  }
                />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <SelectField
                  label="Batch"
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

              <View style={styles.column}>
                <SelectField
                  label="Branch"
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
            </View>
          </View>

          {/* PARENT INFORMATION */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconGreen}>
                <MaterialCommunityIcons
                  name="account-supervisor-outline"
                  size={20}
                  color="#35B878"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Parent Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Parent contact details
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Parent Name</Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="account-supervisor-outline"
                    size={19}
                    color="#35B878"
                  />
                  <TextInput
                    value={parentName}
                    onChangeText={setParentName}
                    placeholder="Enter name"
                    placeholderTextColor="#9AA2B1"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.fieldLabel}>
                  Parent Mobile Number
                </Text>

                <View style={styles.textInputWrapper}>
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={19}
                    color="#35B878"
                  />
                  <TextInput
                    value={parentMobile}
                    onChangeText={setParentMobile}
                    placeholder="Enter mobile"
                    placeholderTextColor="#9AA2B1"
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.textInput}
                  />
                </View>
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
              Student records are used across Classes 8 to 12, Foundation,
              JEE, NEET and MHT-CET academic modules.
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
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={handleSave}
            >
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.saveButtonText}>Add Student</Text>
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

  fieldContainer: {
    marginTop: 13,
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

  multiSelectValue: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
    marginLeft: 7,
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
