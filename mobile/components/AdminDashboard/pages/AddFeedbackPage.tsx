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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const statuses = ["New", "Reviewed"];

export default function AddFeedbackPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [subject, setSubject] = useState("");
  const [student, setStudent] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState("");
  const field = (
    label: string,
    value: string,
    setter: (v: string) => void,
    placeholder: string,
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label} <Text style={styles.req}>*</Text>
      </Text>
      <TextInput
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor="#9AA2B1"
        style={styles.input}
      />
    </View>
  );
  const save = () => {
    if (
      !subject ||
      !student ||
      !category ||
      !date ||
      !rating ||
      !comments ||
      !status
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required feedback details.",
      );
      return;
    }
    Alert.alert(
      "Feedback Added",
      `${subject} feedback has been added successfully.`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  };
  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, minHeight: insets.top + 66 },
          ]}
        >
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Add Feedback</Text>
          </View>
          
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>Feedback Management</Text>
          <Text style={styles.subtitle}>
            Create and manage student feedback.
          </Text>
          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="message-star-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Feedback Information</Text>
                <Text style={styles.sectionSub}>
                  Student and feedback details
                </Text>
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                {field("Subject", subject, setSubject, "Enter subject")}
              </View>
              <View style={styles.colR}>
                {field("Student", student, setStudent, "Enter student name")}
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                {field("Category", category, setCategory, "e.g. Teaching")}
              </View>
              <View style={styles.colR}>
                {field("Date", date, setDate, "e.g. 18 Sep 2026")}
              </View>
            </View>
            {field(
              "Comments",
              comments,
              setComments,
              "Enter feedback comments",
            )}
          </View>
          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Rating & Status</Text>
                <Text style={styles.sectionSub}>
                  Set rating and review status
                </Text>
              </View>
            </View>
            <Text style={styles.label}>
              Rating <Text style={styles.req}>*</Text>
            </Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.ratingButton,
                    rating === n && styles.ratingActive,
                  ]}
                  onPress={() => setRating(n)}
                >
                  <MaterialCommunityIcons
                    name={rating >= n ? "star" : "star-outline"}
                    size={21}
                    color={rating >= n ? "#7040D5" : "#9BA5B5"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>
              Status <Text style={styles.req}>*</Text>
            </Text>
            <View style={styles.options}>
              {statuses.map((x) => (
                <TouchableOpacity
                  key={x}
                  style={[styles.option, status === x && styles.optionActive]}
                  onPress={() => setStatus(x)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      status === x && styles.optionTextActive,
                    ]}
                  >
                    {x}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.info}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />
            <Text style={styles.infoText}>
              Feedback records can be edited later using the Edit button.
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancel}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.save} onPress={save}>
              <MaterialCommunityIcons
                name="content-save-outline"
                size={19}
                color="#FFF"
              />
              <Text style={styles.saveText}>Save Feedback</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FC" },
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  header: {
    backgroundColor: "#7040D5",
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBox: { flex: 1, paddingHorizontal: 12 },
  headerTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#FFF" },
  editHeader: {
    height: 36,
    minWidth: 68,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editHeaderText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#7040D5",
    marginLeft: 5,
  },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },
  pageTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#172033" },
  subtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7C879A",
    marginTop: 2,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  section: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  blueIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202A3D",
  },
  sectionSub: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#8994A7",
    marginTop: 2,
  },
  two: { flexDirection: "row" },
  colL: { flex: 1, marginRight: 5 },
  colR: { flex: 1, marginLeft: 5 },
  field: { marginBottom: 9 },
  label: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#58657A",
    marginBottom: 5,
  },
  req: { color: "#E84D61" },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginBottom: 1,
  },
  ratingRow: { flexDirection: "row", marginBottom: 10 },
  ratingButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E5E7EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  ratingActive: { backgroundColor: "#F0E8FF", borderColor: "#7040D5" },
  options: { flexDirection: "row", flexWrap: "wrap" },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E5E7EE",
    marginRight: 6,
    marginBottom: 6,
  },
  optionActive: { backgroundColor: "#F0E8FF", borderColor: "#7040D5" },
  optionText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
    color: "#788397",
  },
  optionTextActive: { color: "#7040D5" },
  info: {
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
  actions: { flexDirection: "row", justifyContent: "flex-end" },
  cancel: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDDDE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cancelText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#687388" },
  save: {
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
    color: "#FFF",
    marginLeft: 8,
  },
});
