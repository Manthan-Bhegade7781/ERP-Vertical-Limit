import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/auth";

type Student = {
  _id: string;
  guardianName?: string;
  studentId?: string;
  userId?: { fullName?: string; name?: string; mobileNumber?: string };
  batchId?: { name?: string; batchName?: string; code?: string; standard?: string };
};

type Teacher = {
  _id: string;
  employeeId?: string;
  userId?: { fullName?: string; name?: string; mobileNumber?: string };
};

const getName = (value?: { fullName?: string; name?: string }) =>
  value?.fullName || value?.name || "";

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = await getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Request failed. Please try again.");
  }

  return result;
}

export default function AddPTGPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedStudent = students.find((student) => student._id === studentId);
  const selectedTeacher = teachers.find((teacher) => teacher._id === teacherId);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query || selectedStudent) return [];

    return students
      .filter((student) => {
        const values = [
          getName(student.userId),
          student.studentId || "",
          student.guardianName || "",
          student.batchId?.name || "",
          student.batchId?.batchName || "",
          student.batchId?.code || "",
          student.batchId?.standard || "",
          student.userId?.mobileNumber || "",
        ];

        return values.some((value) => value.toLowerCase().includes(query));
      })
      .slice(0, 8);
  }, [students, studentSearch, selectedStudent]);

  const filteredTeachers = useMemo(() => {
    const query = teacherSearch.trim().toLowerCase();
    if (!query || selectedTeacher) return [];

    return teachers
      .filter((teacher) => {
        const values = [
          getName(teacher.userId),
          teacher.employeeId || "",
          teacher.userId?.mobileNumber || "",
        ];

        return values.some((value) => value.toLowerCase().includes(query));
      })
      .slice(0, 8);
  }, [teachers, teacherSearch, selectedTeacher]);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const [studentResult, teacherResult] = await Promise.all([
          apiRequest("/ptg/students"),
          apiRequest("/ptg/teachers"),
        ]);

        if (!mounted) return;

        setStudents(studentResult?.data || []);
        setTeachers(teacherResult?.data || []);
      } catch (error) {
        Alert.alert(
          "Unable to load participants",
          error instanceof Error ? error.message : "Please try again."
        );
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const makeMeetingDate = () => {
    const dateMatch = meetingDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const timeMatch = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

    if (!dateMatch || !timeMatch) return null;

    const [, year, month, day] = dateMatch;
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3]?.toUpperCase();

    if (minutes > 59 || hours > 23) return null;

    if (meridiem) {
      if (hours < 1 || hours > 12) return null;
      hours = (hours % 12) + (meridiem === "PM" ? 12 : 0);
    }

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hours,
      minutes
    );

    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return null;
    }

    return date.toISOString();
  };

  const save = async () => {
    Keyboard.dismiss();

    if (
      !studentId ||
      !teacherId ||
      !meetingDate.trim() ||
      !time.trim() ||
      !purpose.trim()
    ) {
      Alert.alert("Required fields", "Please complete all required fields.");
      return;
    }

    const isoMeetingDate = makeMeetingDate();

    if (!isoMeetingDate) {
      Alert.alert(
        "Invalid date or time",
        "Enter date as YYYY-MM-DD and time as HH:MM AM/PM or 24-hour HH:MM."
      );
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/ptg", {
        method: "POST",
        body: JSON.stringify({
          studentId,
          teacherId,
          meetingDate: isoMeetingDate,
          purpose: purpose.trim(),
          notes: notes.trim(),
        }),
      });

      Alert.alert("PTG added", "The meeting was created successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Unable to add PTG",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStudentResults = () => {
    if (!studentSearch.trim()) return null;

    if (filteredStudents.length === 0) {
      return <Text style={styles.emptyText}>No matching students found.</Text>;
    }

    return (
      <View style={styles.results}>
        {filteredStudents.map((student) => {
          const details = [
            student.studentId ? `ID: ${student.studentId}` : "",
            student.batchId?.name ||
              student.batchId?.batchName ||
              student.batchId?.standard ||
              "",
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <TouchableOpacity
              key={student._id}
              style={styles.resultOption}
              onPress={() => {
                setStudentId(student._id);
                setStudentSearch("");
                Keyboard.dismiss();
              }}
            >
              <Text style={styles.resultName}>
                {getName(student.userId) || "Student"}
              </Text>
              {!!details && <Text style={styles.resultDetails}>{details}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderTeacherResults = () => {
    if (!teacherSearch.trim()) return null;

    if (filteredTeachers.length === 0) {
      return <Text style={styles.emptyText}>No matching teachers found.</Text>;
    }

    return (
      <View style={styles.results}>
        {filteredTeachers.map((teacher) => {
          const details = [
            teacher.employeeId ? `ID: ${teacher.employeeId}` : "",
            teacher.userId?.mobileNumber || "",
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <TouchableOpacity
              key={teacher._id}
              style={styles.resultOption}
              onPress={() => {
                setTeacherId(teacher._id);
                setTeacherSearch("");
                Keyboard.dismiss();
              }}
            >
              <Text style={styles.resultName}>
                {getName(teacher.userId) || "Teacher"}
              </Text>
              {!!details && <Text style={styles.resultDetails}>{details}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const field = (
    label: string,
    value: string,
    setter: (value: string) => void,
    placeholder: string,
    required = true
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.req}>*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor="#9AA2B1"
        style={styles.input}
        returnKeyType="done"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
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
            <Text style={styles.headerTitle}>Add PTG</Text>
          </View>
        </View>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator
        >
          <Text style={styles.pageTitle}>PTG Management</Text>
          <Text style={styles.subtitle}>
            Create a parent-teacher group meeting.
          </Text>

          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Meeting Participants</Text>
                <Text style={styles.sectionSub}>Select a student and teacher</Text>
              </View>
            </View>

            {loadingOptions ? (
              <ActivityIndicator color="#7040D5" style={{ padding: 18 }} />
            ) : (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>
                    Student <Text style={styles.req}>*</Text>
                  </Text>

                  {selectedStudent ? (
                    <View style={styles.selectedOption}>
                      <View style={styles.selectedText}>
                        <Text style={styles.resultName}>
                          {getName(selectedStudent.userId) || "Student"}
                        </Text>
                        <Text style={styles.resultDetails}>
                          {[
                            selectedStudent.studentId
                              ? `ID: ${selectedStudent.studentId}`
                              : "",
                            selectedStudent.batchId?.name ||
                              selectedStudent.batchId?.batchName ||
                              selectedStudent.batchId?.standard ||
                              "",
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setStudentId("");
                          setStudentSearch("");
                        }}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={20}
                          color="#8994A7"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <View style={styles.searchInputWrap}>
                        <MaterialCommunityIcons
                          name="magnify"
                          size={18}
                          color="#8994A7"
                        />
                        <TextInput
                          value={studentSearch}
                          onChangeText={setStudentSearch}
                          placeholder="Search student name, ID or batch"
                          placeholderTextColor="#9AA2B1"
                          style={styles.searchInput}
                          returnKeyType="search"
                        />
                      </View>
                      {renderStudentResults()}
                    </>
                  )}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Teacher <Text style={styles.req}>*</Text>
                  </Text>

                  {selectedTeacher ? (
                    <View style={styles.selectedOption}>
                      <View style={styles.selectedText}>
                        <Text style={styles.resultName}>
                          {getName(selectedTeacher.userId) || "Teacher"}
                        </Text>
                        <Text style={styles.resultDetails}>
                          {selectedTeacher.employeeId
                            ? `ID: ${selectedTeacher.employeeId}`
                            : selectedTeacher.userId?.mobileNumber || ""}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setTeacherId("");
                          setTeacherSearch("");
                        }}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={20}
                          color="#8994A7"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <View style={styles.searchInputWrap}>
                        <MaterialCommunityIcons
                          name="magnify"
                          size={18}
                          color="#8994A7"
                        />
                        <TextInput
                          value={teacherSearch}
                          onChangeText={setTeacherSearch}
                          placeholder="Search teacher name or employee ID"
                          placeholderTextColor="#9AA2B1"
                          style={styles.searchInput}
                          returnKeyType="search"
                        />
                      </View>
                      {renderTeacherResults()}
                    </>
                  )}
                </View>
              </>
            )}

            {field("Purpose", purpose, setPurpose, "e.g. Academic progress")}
          </View>

          <View style={styles.card}>
            <View style={styles.section}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons
                  name="calendar-clock-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Meeting Details</Text>
                <Text style={styles.sectionSub}>
                  Schedule and discussion information
                </Text>
              </View>
            </View>

            {field("Meeting Date", meetingDate, setMeetingDate, "YYYY-MM-DD")}
            {field("Time", time, setTime, "e.g. 10:00 AM")}
            {field("Notes", notes, setNotes, "Optional meeting notes", false)}
            <Text style={styles.helper}>
              New meetings are created with Scheduled status.
            </Text>
          </View>

          <View style={styles.info}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />
            <Text style={styles.infoText}>
              The parent name is taken from the selected student’s record.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancel}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.save, saving && styles.saveDisabled]}
              onPress={save}
              disabled={saving || loadingOptions}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={19}
                    color="#FFF"
                  />
                  <Text style={styles.saveText}>Save PTG</Text>
                </>
              )}
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
  formScroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
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
  sectionTitle: { fontFamily: "PoppinsSemiBold", fontSize: 14, color: "#202A3D" },
  sectionSub: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#8994A7",
    marginTop: 2,
  },
  field: { marginBottom: 12 },
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
  },
  searchInputWrap: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
    marginLeft: 7,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    paddingVertical: 0,
  },
  results: {
    borderWidth: 1,
    borderColor: "#E5E7EE",
    borderRadius: 10,
    marginTop: 6,
    overflow: "hidden",
  },
  resultOption: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },
  resultName: { fontFamily: "PoppinsSemiBold", fontSize: 11, color: "#263047" },
  resultDetails: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#8994A7",
    marginTop: 2,
  },
  selectedOption: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#7040D5",
    backgroundColor: "#F8F5FF",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedText: { flex: 1 },
  emptyText: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#8994A7",
    paddingVertical: 8,
  },
  helper: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8994A7",
    marginTop: 2,
  },
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
  saveDisabled: { opacity: 0.65 },
  saveText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#FFF",
    marginLeft: 8,
  },
});