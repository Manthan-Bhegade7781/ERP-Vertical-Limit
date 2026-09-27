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

export default function AddStaffOnLeavePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const save = () => {
    if (
      !name ||
      !role ||
      !department ||
      !leaveType ||
      !fromDate ||
      !toDate ||
      !days ||
      !reason ||
      !status
    ) {
      Alert.alert("Required Fields", "Please fill all required leave details.");
      return;
    }
    Alert.alert(
      "Leave Added",
      `${name} leave record has been added successfully.`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  };
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
            <Text style={styles.headerTitle}>Add Staff Leave</Text>
          </View>
          <TouchableOpacity
            style={styles.editHeader}
            onPress={() =>
              Alert.alert(
                "Edit",
                "You are currently editing the staff leave form.",
              )
            }
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={19}
              color="#7040D5"
            />
            <Text style={styles.editHeaderText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>Staff Leave Management</Text>
          <Text style={styles.subtitle}>
            Create and manage staff leave records.
          </Text>
          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="account-clock-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Staff Information</Text>
                <Text style={styles.sectionSub}>Basic staff details</Text>
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                {field("Name", name, setName, "Enter staff name")}
              </View>
              <View style={styles.colR}>
                {field("Role", role, setRole, "Enter role")}
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                {field(
                  "Department",
                  department,
                  setDepartment,
                  "Enter department",
                )}
              </View>
              <View style={styles.colR}>
                {field(
                  "Leave Type",
                  leaveType,
                  setLeaveType,
                  "e.g. Casual Leave",
                )}
              </View>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons
                  name="calendar-range-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Leave Details</Text>
                <Text style={styles.sectionSub}>
                  Dates, duration and reason
                </Text>
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                {field("From Date", fromDate, setFromDate, "e.g. 20 Sep 2026")}
              </View>
              <View style={styles.colR}>
                {field("To Date", toDate, setToDate, "e.g. 21 Sep 2026")}
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                {field("Number of Days", days, setDays, "e.g. 2")}
              </View>
              <View style={styles.colR}>
                {field("Reason", reason, setReason, "Enter reason")}
              </View>
            </View>
            <Text style={styles.label}>
              Status <Text style={styles.req}>*</Text>
            </Text>
            <View style={styles.options}>
              {["Approved", "Pending", "Rejected"].map((x) => (
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
              Leave records can be edited later using the Edit button.
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
              <Text style={styles.saveText}>Save Leave</Text>
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
    paddingBottom: 8,
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
    paddingHorizontal: 10,
    borderRadius: 9,
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
  colL: { flex: 1, marginRight: 7 },
  colR: { flex: 1, marginLeft: 7 },
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
  options: { flexDirection: "row", flexWrap: "wrap", marginBottom: 2 },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E5E7EE",
    marginRight: 7,
    marginBottom: 7,
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
    marginLeft: 7,
  },
});
