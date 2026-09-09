import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PURPLE = "#7040D5";

export default function StudentComplaintPage() {
  const insets = useSafeAreaInsets();

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState("");
  const [complaint, setComplaint] = useState("");

  const categories = [
    "Academic",
    "Faculty",
    "Infrastructure",
    "Fees",
    "Attendance",
    "Other",
  ];

  const submitComplaint = () => {
    if (!studentName.trim()) {
      Alert.alert(
        "Student Name Required",
        "Please enter the student name."
      );
      return;
    }

    if (!studentId.trim()) {
      Alert.alert(
        "Student ID Required",
        "Please enter the student ID."
      );
      return;
    }

    if (!category) {
      Alert.alert(
        "Category Required",
        "Please select a complaint category."
      );
      return;
    }

    if (!complaint.trim()) {
      Alert.alert(
        "Complaint Required",
        "Please describe the complaint."
      );
      return;
    }

    Alert.alert(
      "Complaint Submitted",
      "The student complaint has been submitted successfully.",
      [
        {
          text: "OK",
          onPress: () => {
            setStudentName("");
            setStudentId("");
            setCategory("");
            setComplaint("");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.headerContent}>
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

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            Student Complaint
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>
            Student Complaint
          </Text>

          <Text style={styles.pageSubtitle}>
            Submit and manage student complaints
          </Text>
        </View>

        {/* Complaint Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="comment-alert-outline"
                size={25}
                color={PURPLE}
              />
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Submit Complaint
              </Text>

              <Text style={styles.cardSubtitle}>
                Provide the details of the student complaint
              </Text>
            </View>
          </View>

          {/* Student Name */}
          <Text style={styles.label}>
            Student Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter student name"
            placeholderTextColor="#9A9A9A"
            value={studentName}
            onChangeText={setStudentName}
          />

          {/* Student ID */}
          <Text style={styles.label}>
            Student ID
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter student ID"
            placeholderTextColor="#9A9A9A"
            value={studentId}
            onChangeText={setStudentId}
          />

          {/* Category */}
          <Text style={styles.label}>
            Complaint Category
          </Text>

          <View style={styles.categoryContainer}>
            {categories.map((item) => {
              const selected = category === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryButton,
                    selected &&
                      styles.categoryButtonSelected,
                  ]}
                  onPress={() => setCategory(item)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Complaint */}
          <Text style={styles.label}>
            Complaint Description
          </Text>

          <TextInput
            style={styles.complaintInput}
            placeholder="Describe the complaint..."
            placeholderTextColor="#9A9A9A"
            value={complaint}
            onChangeText={setComplaint}
            multiline
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitComplaint}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="send-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.submitButtonText}>
              Submit Complaint
            </Text>
          </TouchableOpacity>
        </View>

        {/* Information */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={21}
            color={PURPLE}
          />

          <Text style={styles.infoText}>
            Please provide accurate information so the
            complaint can be reviewed and resolved properly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FB",
  },

  /*
   * Header now has a separate safe-area section.
   * This prevents the Android status bar from covering
   * the back button and title.
   */
  header: {
    backgroundColor: PURPLE,
  },

  headerContent: {
    height: 64,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
    color: "#FFFFFF",
    fontFamily: "PoppinsSemiBold",
    fontSize: 19,
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  titleSection: {
    marginBottom: 18,
  },

  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 23,
    color: "#222222",
  },

  pageSubtitle: {
    marginTop: 3,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#777777",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E9E6F2",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#242424",
  },

  cardSubtitle: {
    marginTop: 2,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#858585",
  },

  label: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#333333",
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#DDD9E8",
    borderRadius: 11,
    paddingHorizontal: 13,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#333333",
    backgroundColor: "#FCFCFE",
    marginBottom: 14,
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: "#DDD9E8",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 7,
    marginBottom: 7,
    backgroundColor: "#FFFFFF",
  },

  categoryButtonSelected: {
    backgroundColor: "#F0EAFE",
    borderColor: PURPLE,
  },

  categoryText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10.5,
    color: "#666666",
  },

  categoryTextSelected: {
    color: PURPLE,
    fontFamily: "PoppinsSemiBold",
  },

  complaintInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#DDD9E8",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#333333",
    backgroundColor: "#FCFCFE",
    marginBottom: 18,
  },

  submitButton: {
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  submitButtonText: {
    marginLeft: 7,
    color: "#FFFFFF",
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
  },

  infoCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: 13,
    backgroundColor: "#F0EAFE",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 18,
    color: "#5E4A8A",
  },
});