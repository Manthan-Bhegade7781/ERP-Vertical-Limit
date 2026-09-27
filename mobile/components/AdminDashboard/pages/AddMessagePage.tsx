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

type MessageStatus = "Unread" | "Read" | "Replied" | "Resolved";

function SelectField({
  label,
  value,
  placeholder,
  icon,
  options,
  onSelect,
  required = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: string;
  options: string[];
  onSelect: (value: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        style={styles.select}
        activeOpacity={0.8}
        onPress={() => setOpen((value) => !value)}
      >
        <MaterialCommunityIcons
          name={icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
          size={19}
          color="#7040D5"
        />
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholder,
          ]}
        >
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#8994A7"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                value === option && styles.optionActive,
              ]}
              onPress={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  value === option && styles.optionTextActive,
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
}

export default function AddMessagePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [sender, setSender] = useState("");
  const [messageId, setMessageId] = useState("");
  const [role, setRole] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState("");

  const saveMessage = () => {
    if (
      !sender.trim() ||
      !messageId.trim() ||
      !role ||
      !subject.trim() ||
      !message.trim() ||
      !date.trim() ||
      !time.trim() ||
      !branch ||
      !status
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required message details."
      );
      return;
    }

    Alert.alert(
      "Message Added",
      `${subject.trim()} has been added successfully.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
            <Text style={styles.headerTitle}>Add Message</Text>
          </View>

          {/* EDIT BUTTON IS INTENTIONALLY INCLUDED */}
          <TouchableOpacity
            style={styles.headerEditButton}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Edit",
                "You are currently editing the message information form."
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Text style={styles.pageTitle}>Message Management</Text>
          <Text style={styles.pageSubtitle}>
            Create and manage communication and enquiries.
          </Text>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Sender Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Basic sender and message identification
                </Text>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={[styles.column, styles.columnLeft]}>
                <Text style={styles.fieldLabel}>
                  Sender Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={sender}
                    onChangeText={setSender}
                    placeholder="Enter sender name"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={[styles.column, styles.columnRight]}>
                <Text style={styles.fieldLabel}>
                  Message ID <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="identifier"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={messageId}
                    onChangeText={setMessageId}
                    placeholder="e.g. MSG007"
                    placeholderTextColor="#9AA2B1"
                    autoCapitalize="characters"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={[styles.column, styles.columnLeft]}>
                <SelectField
                  label="Role"
                  value={role}
                  placeholder="Select role"
                  icon="account-group-outline"
                  required
                  options={[
                    "Student",
                    "Parent",
                    "Teacher",
                    "Staff",
                    "Admin",
                  ]}
                  onSelect={setRole}
                />
              </View>

              <View style={[styles.column, styles.columnRight]}>
                <SelectField
                  label="Branch"
                  value={branch}
                  placeholder="Select branch"
                  icon="map-marker-outline"
                  required
                  options={["Pune", "Mumbai", "Nashik"]}
                  onSelect={setBranch}
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.blueIcon}>
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Message Details
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Enter communication and status information
                </Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>
              Subject <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="format-title"
                size={19}
                color="#7040D5"
              />
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter message subject"
                placeholderTextColor="#9AA2B1"
                style={styles.input}
              />
            </View>

            <Text style={styles.fieldLabel}>
              Message <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Enter message"
              placeholderTextColor="#9AA2B1"
              multiline
              style={styles.textArea}
            />

            <View style={styles.twoColumn}>
              <View style={[styles.column, styles.columnLeft]}>
                <Text style={styles.fieldLabel}>
                  Date <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="e.g. 20 Sep 2026"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={[styles.column, styles.columnRight]}>
                <Text style={styles.fieldLabel}>
                  Time <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={19}
                    color="#7040D5"
                  />
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    placeholder="e.g. 10:15 AM"
                    placeholderTextColor="#9AA2B1"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <SelectField
              label="Status"
              value={status}
              placeholder="Select message status"
              icon="message-check-outline"
              required
              options={[
                "Unread",
                "Read",
                "Replied",
                "Resolved",
              ]}
              onSelect={setStatus}
            />
          </View>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#7040D5"
            />

            <Text style={styles.infoText}>
              Message records can be edited later from the Messages
              screen using the Edit button.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={saveMessage}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={19}
                color="#FFFFFF"
              />
              <Text style={styles.saveText}>Save Message</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  container: {
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  headerEditButton: {
    minWidth: 74,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerEditText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#7040D5",
    marginLeft: 5,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },
  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 19,
    color: "#172033",
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7C879A",
    marginTop: 2,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
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
  sectionSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#8994A7",
    marginTop: 1,
  },
  twoColumn: {
    flexDirection: "row",
    marginBottom: 10,
  },
  column: {
    flex: 1,
  },
  columnLeft: {
    marginRight: 5,
  },
  columnRight: {
    marginLeft: 5,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 10,
  },
  fieldLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#58657A",
    marginBottom: 5,
  },
  required: {
    color: "#E84D61",
  },
  inputWrapper: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 8,
    paddingVertical: 7,
  },
  textArea: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingTop: 10,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginBottom: 10,
    textAlignVertical: "top",
  },
  select: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 8,
  },
  placeholder: {
    color: "#9AA2B1",
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 5,
    zIndex: 20,
  },
  option: {
    minHeight: 38,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
  },
  optionActive: {
    backgroundColor: "#F4EEFF",
  },
  optionText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#4E5A6F",
  },
  optionTextActive: {
    fontFamily: "PoppinsSemiBold",
    color: "#7040D5",
  },
  infoBox: {
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
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDE5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#687388",
  },
  saveButton: {
    minHeight: 40,
    marginLeft: 7,
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
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
