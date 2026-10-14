import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PURPLE = "#7040D5";

const STATUS_OPTIONS = ["Active", "Inactive"];

export default function AddAcademicYearPage() {
  const insets = useSafeAreaInsets();

  const [academicYear, setAcademicYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Active");

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    if (!academicYear.trim()) {
      Alert.alert("Required Field", "Please enter the academic year.");
      return;
    }

    if (!startDate.trim()) {
      Alert.alert("Required Field", "Please enter the start date.");
      return;
    }

    if (!endDate.trim()) {
      Alert.alert("Required Field", "Please enter the end date.");
      return;
    }

    Alert.alert(
      "Academic Year Added",
      `${academicYear.trim()} academic year has been added successfully.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <View style={styles.headerInner}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Add Academic Year
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + 30,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Page Header */}
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Academic Year Details</Text>

              <Text style={styles.pageSubtitle}>
                Create an academic year with its start date, end date and
                current status.
              </Text>
            </View>

            {/* Academic Year Details */}
            <View style={styles.card}>
              <SectionHeader
                icon="calendar-range-outline"
                title="Academic Year Details"
              />

              <Field
                label="Academic Year"
                required
                value={academicYear}
                onChangeText={setAcademicYear}
                placeholder="e.g. 2026-27"
              />

              <View style={styles.row}>
                <DateField
                  label="Start Date"
                  value={startDate}
                  onChangeText={setStartDate}
                />

                <DateField
                  label="End Date"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>

            {/* Status */}
            <View style={styles.card}>
              <SectionHeader
                icon="toggle-switch-outline"
                title="Academic Status"
              />

              <Text style={styles.label}>Status</Text>

              <ChoiceRow
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
              />
            </View>

            {/* Information */}
            <View style={styles.noteCard}>
              <View style={styles.noteIcon}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={PURPLE}
                />
              </View>

              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>Academic year setup</Text>

                <Text style={styles.noteText}>
                  Academic year defines the main academic period used across
                  batches, subjects, attendance, examinations and reports.
                </Text>
              </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleBack}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={handleSave}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  Save Academic Year
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Header                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon,
  title,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={PURPLE}
        />
      </View>

      <Text style={styles.sectionTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Text Field                                                                 */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  required,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label} numberOfLines={2}>
        {label}

        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A8B7"
        style={styles.input}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Date Field                                                                 */
/* -------------------------------------------------------------------------- */

function DateField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.halfField}>
      <Text style={styles.label} numberOfLines={2}>
        {label}

        <Text style={styles.required}> *</Text>
      </Text>

      <View style={styles.inputWithIcon}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#A0A8B7"
          style={styles.dateInput}
          keyboardType="numbers-and-punctuation"
        />

        <MaterialCommunityIcons
          name="calendar-outline"
          size={18}
          color="#8A94A6"
        />
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Choice Row                                                                 */
/* -------------------------------------------------------------------------- */

function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.choiceRow}>
      {options.map((option) => {
        const selected = value === option;

        return (
          <Pressable
            key={option}
            style={[
              styles.choiceButton,
              selected && styles.choiceButtonSelected,
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.choiceButtonText,
                selected && styles.choiceButtonTextSelected,
              ]}
              numberOfLines={1}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  /* Header */

  header: {
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },

  headerInner: {
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerTitleArea: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    flexShrink: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#FFFFFF",
  },

  /* Scroll */

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
  },

  content: {
    width: "100%",
    maxWidth: 900,
    paddingHorizontal: 16,
    paddingTop: 22,
  },

  /* Page Header */

  pageHeader: {
    width: "100%",
    marginBottom: 18,
  },

  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 22,
    lineHeight: 30,
    color: "#172033",
    flexShrink: 1,
  },

  pageSubtitle: {
    marginTop: 4,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 17,
    color: "#858D9F",
    flexShrink: 1,
  },

  /* Card */

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 15,
    marginBottom: 14,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  /* Section */

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    minWidth: 0,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    flexShrink: 0,
  },

  sectionTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    lineHeight: 21,
    color: "#172033",
  },

  /* Fields */

  field: {
    flex: 1,
    minWidth: 0,
    marginBottom: 14,
  },

  halfField: {
    flex: 1,
    minWidth: 0,
    marginBottom: 14,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },

  label: {
    marginBottom: 6,
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    lineHeight: 15,
    color: "#555E70",
    flexShrink: 1,
  },

  required: {
    color: "#E95386",
  },

  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 10,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303544",
  },

  inputWithIcon: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 10,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  dateInput: {
    flex: 1,
    minWidth: 0,
    height: 50,
    paddingVertical: 0,
    paddingHorizontal: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#303544",
  },

  /* Status */

  choiceRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  choiceButton: {
    flex: 1,
    minWidth: 90,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    backgroundColor: "#FBFCFE",
    alignItems: "center",
    justifyContent: "center",
  },

  choiceButtonSelected: {
    borderColor: "#CDB8F5",
    backgroundColor: "#F1EAFF",
  },

  choiceButtonText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#707B8F",
  },

  choiceButtonTextSelected: {
    color: PURPLE,
  },

  /* Information */

  noteCard: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#F3EEFD",
    borderWidth: 1,
    borderColor: "#E7DDFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  noteIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#E7DDFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    flexShrink: 0,
  },

  noteContent: {
    flex: 1,
    minWidth: 0,
  },

  noteTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#4B347D",
  },

  noteText: {
    marginTop: 3,
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    lineHeight: 14,
    color: "#6E6680",
  },

  /* Bottom Actions */

  bottomActions: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE1E9",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#6D7789",
  },

  saveButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 10,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  saveButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#FFFFFF",
  },
});