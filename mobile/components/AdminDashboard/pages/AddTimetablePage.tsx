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

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const statuses = ["Scheduled", "Completed", "Cancelled"];

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
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <TouchableOpacity
        style={styles.select}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name={icon} size={19} color="#7040D5" />
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={19}
          color="#8994A7"
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {options.map((x) => (
            <TouchableOpacity
              key={x}
              style={styles.option}
              onPress={() => {
                onSelect(x);
                setOpen(false);
              }}
            >
              <Text style={styles.optionText}>{x}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AddTimetablePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [faculty, setFaculty] = useState("");
  const [std, setStd] = useState("");
  const [room, setRoom] = useState("");
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState("");
  const save = () => {
    if (
      !subject ||
      !day ||
      !time ||
      !faculty ||
      !std ||
      !room ||
      !branch ||
      !status
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required timetable details.",
      );
      return;
    }
    Alert.alert("Timetable Added", `${subject} has been added successfully.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
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
            <Text style={styles.headerTitle}>Add Timetable</Text>
          </View>
          <TouchableOpacity
            style={styles.editHeader}
            onPress={() =>
              Alert.alert(
                "Edit",
                "You are currently editing the timetable form.",
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
          <Text style={styles.pageTitle}>Timetable Management</Text>
          <Text style={styles.subtitle}>
            Create and manage timetable schedules.
          </Text>
          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={21}
                  color="#7040D5"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Class Information</Text>
                <Text style={styles.sectionSub}>Basic timetable details</Text>
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                <Text style={styles.label}>
                  Subject <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="book-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Enter subject"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={styles.colR}>
                <SelectField
                  label="Day"
                  value={day}
                  placeholder="Select day"
                  icon="calendar-outline"
                  options={days}
                  onSelect={setDay}
                />
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                <Text style={styles.label}>
                  Time <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    placeholder="e.g. 09:00 AM – 10:00 AM"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={styles.colR}>
                <Text style={styles.label}>
                  Faculty <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={faculty}
                    onChangeText={setFaculty}
                    placeholder="Enter faculty name"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons
                  name="school-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Class & Location</Text>
                <Text style={styles.sectionSub}>
                  Assign standard, room and branch
                </Text>
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                <Text style={styles.label}>
                  STD <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="school-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={std}
                    onChangeText={setStd}
                    placeholder="e.g. JEE 12th"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={styles.colR}>
                <Text style={styles.label}>
                  Room <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="door-open"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={room}
                    onChangeText={setRoom}
                    placeholder="e.g. Room 101"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>
            <View style={styles.two}>
              <View style={styles.colL}>
                <Text style={styles.label}>
                  Branch <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={branch}
                    onChangeText={setBranch}
                    placeholder="e.g. Pune Branch"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={styles.colR}>
                <SelectField
                  label="Status"
                  value={status}
                  placeholder="Select status"
                  icon="check-circle-outline"
                  options={statuses}
                  onSelect={setStatus}
                />
              </View>
            </View>
          </View>
          <View style={styles.info}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />
            <Text style={styles.infoText}>
              Timetable records can be edited later using the Edit button.
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
              <Text style={styles.saveText}>Save Timetable</Text>
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
    width: 44,
    height: 44,
    borderRadius: 12,
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
    marginTop: 1,
  },
  two: { flexDirection: "row", marginBottom: 2 },
  colL: { flex: 1, marginRight: 5 },
  colR: { flex: 1, marginLeft: 5 },
  label: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#58657A",
    marginBottom: 5,
  },
  required: { color: "#E84D61" },
  fieldContainer: { flex: 1, marginBottom: 9 },
  inputWrap: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  input: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 8,
    paddingVertical: 7,
  },
  select: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  selectText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 8,
  },
  placeholder: { color: "#9AA2B1" },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    backgroundColor: "#FFF",
    elevation: 5,
    zIndex: 20,
    overflow: "hidden",
  },
  option: {
    minHeight: 38,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },
  optionText: { fontFamily: "PoppinsRegular", fontSize: 10.5, color: "#4E5A6F" },
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
    backgroundColor: "#FFF",
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
