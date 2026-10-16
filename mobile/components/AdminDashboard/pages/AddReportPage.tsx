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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Status = "Ready" | "Generated" | "Processing";

function SelectField({
  label,
  value,
  placeholder,
  icon,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  options: string[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label} <Text style={styles.required}>*</Text></Text>
      <TouchableOpacity
        style={styles.select}
        activeOpacity={0.8}
        onPress={() => setOpen((v) => !v)}
      >
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={20} color="#8994A7" />
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
              <Text style={[styles.optionText, value === option && styles.optionTextActive]}>
                {option}
              </Text>
              {value === option && <MaterialCommunityIcons name="check" size={18} color="#7040D5" />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AddReportPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [reportId, setReportId] = useState("");
  const [category, setCategory] = useState("");
  const [branch, setBranch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [generatedOn, setGeneratedOn] = useState("");
  const [records, setRecords] = useState("");
  const [format, setFormat] = useState("");
  const [reportType, setReportType] = useState("");
  const [status, setStatus] = useState("");

  const saveReport = () => {
    if (!title.trim() || !reportId.trim() || !category || !branch || !dateRange.trim() ||
        !generatedOn.trim() || !records.trim() || !format || !reportType || !status) {
      Alert.alert("Required Fields", "Please fill all required report details.");
      return;
    }

    Alert.alert("Report Added", `${title.trim()} has been added successfully.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { paddingTop: insets.top + 8, minHeight: insets.top + 66 }]}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Add Report</Text>
          </View>

         
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>Report Management</Text>
          <Text style={styles.pageSubtitle}>Create and manage administration reports.</Text>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons name="file-chart-outline" size={21} color="#7040D5" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Report Information</Text>
                <Text style={styles.sectionSubtitle}>Basic report details</Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={[styles.column, styles.columnLeft]}>
                <Text style={styles.fieldLabel}>Report Title <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="format-title" size={19} color="#7040D5" />
                  <TextInput value={title} onChangeText={setTitle} placeholder="Enter report title" placeholderTextColor="#9AA2B1" style={styles.input} />
                </View>
              </View>
              <View style={[styles.column, styles.columnRight]}>
                <Text style={styles.fieldLabel}>Report ID <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="identifier" size={19} color="#7040D5" />
                  <TextInput value={reportId} onChangeText={setReportId} placeholder="e.g. RPT007" placeholderTextColor="#9AA2B1" autoCapitalize="characters" style={styles.input} />
                </View>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={[styles.column, styles.columnLeft]}>
                <SelectField label="Category" value={category} placeholder="Select category" icon="folder-outline" options={["Attendance", "Performance", "Fees", "Examination", "Students", "Batches"]} onSelect={setCategory} />
              </View>
              <View style={[styles.column, styles.columnRight]}>
                <SelectField label="Branch" value={branch} placeholder="Select branch" icon="map-marker-outline" options={["Pune", "Mumbai", "Nashik"]} onSelect={setBranch} />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons name="chart-box-outline" size={21} color="#2675E8" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Report Settings</Text>
                <Text style={styles.sectionSubtitle}>Configure report generation information</Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={[styles.column, styles.columnLeft]}>
                <Text style={styles.fieldLabel}>Date Range <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="calendar-range-outline" size={19} color="#7040D5" />
                  <TextInput value={dateRange} onChangeText={setDateRange} placeholder="e.g. 01 Sep – 20 Sep 2026" placeholderTextColor="#9AA2B1" style={styles.input} />
                </View>
              </View>
              <View style={[styles.column, styles.columnRight]}>
                <Text style={styles.fieldLabel}>Generated On <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="calendar-outline" size={19} color="#7040D5" />
                  <TextInput value={generatedOn} onChangeText={setGeneratedOn} placeholder="e.g. 20 Sep 2026" placeholderTextColor="#9AA2B1" style={styles.input} />
                </View>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={[styles.column, styles.columnLeft]}>
                <Text style={styles.fieldLabel}>Records <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="database-outline" size={19} color="#7040D5" />
                  <TextInput value={records} onChangeText={setRecords} placeholder="e.g. 1,248" placeholderTextColor="#9AA2B1" keyboardType="numeric" style={styles.input} />
                </View>
              </View>
              <View style={[styles.column, styles.columnRight]}>
                <SelectField label="Format" value={format} placeholder="Select format" icon="file-outline" options={["PDF", "Excel", "CSV"]} onSelect={setFormat} />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={[styles.column, styles.columnLeft]}>
                <SelectField label="Report Type" value={reportType} placeholder="Select report type" icon="file-chart-outline" options={["Attendance", "Performance", "Fees", "Examination", "Enrollment", "Batch Summary"]} onSelect={setReportType} />
              </View>
              <View style={[styles.column, styles.columnRight]}>
                <SelectField label="Status" value={status} placeholder="Select status" icon="check-circle-outline" options={["Ready", "Generated", "Processing"]} onSelect={setStatus} />
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#7040D5" />
            <Text style={styles.infoText}>
              Report records can be edited later from the Reports screen using the Edit button.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={saveReport}>
              <MaterialCommunityIcons name="content-save-outline" size={19} color="#FFFFFF" />
              <Text style={styles.saveText}>Save Report</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8FC" },
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  header: { backgroundColor: "#7040D5", paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitleContainer: { flex: 1, paddingHorizontal: 12 },
  headerTitle: { fontFamily: "PoppinsSemiBold", fontSize: 19, color: "#FFFFFF" },
  headerEditButton: { minWidth: 68, height: 36, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  headerEditText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#7040D5", marginLeft: 5 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },
  pageTitle: { fontFamily: "PoppinsBold", fontSize: 19, color: "#172033" },
  pageSubtitle: { fontFamily: "PoppinsRegular", fontSize: 10, color: "#7C879A", marginTop: 2, marginBottom: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 13, marginBottom: 10, borderWidth: 1, borderColor: "#ECEEF4" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#F0E8FF", alignItems: "center", justifyContent: "center", marginRight: 12 },
  blueIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#E8F1FF", alignItems: "center", justifyContent: "center", marginRight: 12 },
  sectionTitle: { fontFamily: "PoppinsSemiBold", fontSize: 14, color: "#202A3D" },
  sectionSubtitle: { fontFamily: "PoppinsRegular", fontSize: 9, color: "#8994A7", marginTop: 1 },
  twoColumn: { flexDirection: "row", marginBottom: 10 },
  column: { flex: 1 },
  columnLeft: { marginRight: 5 },
  columnRight: { marginLeft: 5 },
  fieldContainer: { flex: 1, marginBottom: 9 },
  fieldLabel: { fontFamily: "PoppinsMedium", fontSize: 10, color: "#58657A", marginBottom: 5 },
  required: { color: "#E84D61" },
  inputWrapper: { minHeight: 44, borderWidth: 1, borderColor: "#E2E5ED", borderRadius: 10, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", marginBottom: 9 },
  input: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 11, color: "#263047", marginLeft: 8, paddingVertical: 7 },
  select: { minHeight: 44, borderWidth: 1, borderColor: "#E2E5ED", borderRadius: 10, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF" },
  selectText: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 11, color: "#263047", marginLeft: 8 },
  placeholder: { color: "#9AA2B1" },
  dropdown: { marginTop: 4, borderWidth: 1, borderColor: "#E2E5ED", borderRadius: 10, backgroundColor: "#FFFFFF", overflow: "hidden", elevation: 5, zIndex: 20 },
  option: { minHeight: 38, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#F0F1F5" },
  optionActive: { backgroundColor: "#F4EEFF" },
  optionText: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#4E5A6F" },
  optionTextActive: { fontFamily: "PoppinsSemiBold", color: "#7040D5" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#F2EDFF", borderRadius: 11, padding: 11, marginBottom: 12 },
  infoText: { flex: 1, fontFamily: "PoppinsRegular", fontSize: 10, color: "#675D7A", lineHeight: 15, marginLeft: 8 },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelButton: { minHeight: 40, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDDDE5", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cancelText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#687388" },
  saveButton: { minHeight: 40, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#7040D5", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  saveText: { fontFamily: "PoppinsSemiBold", fontSize: 10.5, color: "#FFFFFF", marginLeft: 8 },
});
