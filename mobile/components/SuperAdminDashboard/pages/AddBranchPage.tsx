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
                value === option &&
                  styles.dropdownOptionSelected,
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

export default function AddBranchPage() {
  const insets = useSafeAreaInsets();

  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Active");

  const stateOptions = [
    "Maharashtra",
    "Gujarat",
    "Karnataka",
    "Madhya Pradesh",
  ];

  const statusOptions = ["Active", "Inactive"];

  const handleAddBranch = () => {
    if (
      !branchName.trim() ||
      !branchCode.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state ||
      !contactNumber.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required branch details marked with *."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(contactNumber.trim())) {
      Alert.alert(
        "Invalid Contact Number",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (
      email.trim() &&
      !/^\S+@\S+\.\S+$/.test(email.trim())
    ) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    Alert.alert(
      "Branch Added",
      `${branchName} has been added successfully.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
          <Text style={styles.headerTitle}>Add Branch</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* PAGE HEADING */}
        <View style={styles.pageHeading}>
          <Text style={styles.pageTitle}>
            Branch Information
          </Text>

          <Text style={styles.pageSubtitle}>
            Add branch details for the educational center.
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
                name="office-building-outline"
                size={20}
                color="#7040D5"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Basic Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Enter the main branch details
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Branch Name{" "}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={branchName}
              onChangeText={setBranchName}
              placeholder="e.g. Pune Branch"
              placeholderTextColor="#A0A7B4"
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Branch Code{" "}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={branchCode}
              onChangeText={setBranchCode}
              placeholder="e.g. PUN-001"
              placeholderTextColor="#A0A7B4"
              autoCapitalize="characters"
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Address <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter complete branch address"
              placeholderTextColor="#A0A7B4"
              multiline
              textAlignVertical="top"
              style={styles.addressInput}
            />
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  City <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Pune"
                  placeholderTextColor="#A0A7B4"
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.column}>
              <SelectField
                label="State"
                value={state}
                placeholder="Select state"
                options={stateOptions}
                onSelect={setState}
                required
              />
            </View>
          </View>
        </View>

        {/* BRANCH ADMINISTRATION */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: "#EAF2FF" },
              ]}
            >
              <MaterialCommunityIcons
                name="account-tie-outline"
                size={20}
                color="#4285F4"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Branch Administration
              </Text>

              <Text style={styles.sectionSubtitle}>
                Enter branch contact information
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Contact Number{" "}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={contactNumber}
              onChangeText={(text) =>
                setContactNumber(
                  text.replace(/[^0-9]/g, "").slice(0, 10)
                )
              }
              placeholder="10-digit mobile number"
              placeholderTextColor="#A0A7B4"
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Email Address
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. pune@vlccerp.com"
              placeholderTextColor="#A0A7B4"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
            />
          </View>

          <SelectField
            label="Branch Status"
            value={status}
            placeholder="Select status"
            options={statusOptions}
            onSelect={setStatus}
            required
          />
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
              Branch Setup
            </Text>

            <Text style={styles.infoText}>
              Once the branch is added, students, teachers, batches
              and academic activities can be associated with this
              branch.
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
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
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={handleAddBranch}
          >
            <MaterialCommunityIcons
              name="plus"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              Add Branch
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
    fontSize: 11,
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
    paddingHorizontal: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#252A38",
  },

  addressInput: {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 11,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
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
    borderColor: "#E3E6ED",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
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
    fontSize: 11,
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
    fontSize: 11,
    color: "#FFFFFF",
  },
});