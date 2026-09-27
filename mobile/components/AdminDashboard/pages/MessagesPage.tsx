import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type MessageStatus = "Unread" | "Read" | "Replied" | "Resolved";

type Message = {
  id: string;
  sender: string;
  role: string;
  subject: string;
  message: string;
  date: string;
  time: string;
  branch: string;
  status: MessageStatus;
};

const initialMessages: Message[] = [
  {
    id: "MSG001",
    sender: "Aarav Patil",
    role: "Student",
    subject: "Examination Schedule",
    message:
      "Could you please confirm the date and timing for the upcoming examination?",
    date: "20 Sep 2026",
    time: "10:15 AM",
    branch: "Pune",
    status: "Unread",
  },
  {
    id: "MSG002",
    sender: "Ananya Sharma",
    role: "Parent",
    subject: "Fee Payment Query",
    message:
      "I would like to confirm the fee payment details for this month.",
    date: "20 Sep 2026",
    time: "09:30 AM",
    branch: "Mumbai",
    status: "Unread",
  },
  {
    id: "MSG003",
    sender: "Rohan Deshmukh",
    role: "Student",
    subject: "Assignment Submission",
    message:
      "Please let me know if my assignment submission has been received.",
    date: "19 Sep 2026",
    time: "04:20 PM",
    branch: "Nashik",
    status: "Read",
  },
  {
    id: "MSG004",
    sender: "Sneha Kulkarni",
    role: "Teacher",
    subject: "Batch Schedule",
    message:
      "The updated batch schedule is available for review.",
    date: "19 Sep 2026",
    time: "02:10 PM",
    branch: "Pune",
    status: "Replied",
  },
  {
    id: "MSG005",
    sender: "Vedant Joshi",
    role: "Parent",
    subject: "Performance Discussion",
    message:
      "I would like to discuss the recent performance report.",
    date: "18 Sep 2026",
    time: "11:45 AM",
    branch: "Mumbai",
    status: "Read",
  },
  {
    id: "MSG006",
    sender: "Isha More",
    role: "Student",
    subject: "Course Enquiry",
    message:
      "Could you please share more information about the new course?",
    date: "17 Sep 2026",
    time: "01:25 PM",
    branch: "Pune",
    status: "Resolved",
  },
];

const statusStyle: Record<
  MessageStatus,
  { bg: string; text: string; border: string }
> = {
  Unread: {
    bg: "#FFF0F4",
    text: "#E84D75",
    border: "#F2467B",
  },
  Read: {
    bg: "#EAF2FF",
    text: "#2675E8",
    border: "#2675E8",
  },
  Replied: {
    bg: "#E8F8F0",
    text: "#13B96D",
    border: "#13B96D",
  },
  Resolved: {
    bg: "#EAF2FF",
    text: "#2675E8",
    border: "#2675E8",
  },
};

export default function MessagesPage() {
  const router = useRouter();

  const [messages, setMessages] =
    useState<Message[]>(initialMessages);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | MessageStatus>("All");
  const [branchFilter, setBranchFilter] =
    useState<"All" | "Pune" | "Mumbai" | "Nashik">("All");

  const [selected, setSelected] = useState<Message | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [editSender, setEditSender] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editStatus, setEditStatus] =
    useState<MessageStatus>("Read");

  const openAddMessage = () => {
    router.push("/(admin)/add-message" as never);
  };

  const openEdit = (message: Message) => {
    setSelected(message);
    setEditSender(message.sender);
    setEditRole(message.role);
    setEditSubject(message.subject);
    setEditMessage(message.message);
    setEditDate(message.date);
    setEditTime(message.time);
    setEditBranch(message.branch);
    setEditStatus(message.status);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (
      !selected ||
      !editSender.trim() ||
      !editRole.trim() ||
      !editSubject.trim() ||
      !editMessage.trim() ||
      !editDate.trim() ||
      !editTime.trim() ||
      !editBranch.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill all required message details."
      );
      return;
    }

    const updated: Message = {
      ...selected,
      sender: editSender.trim(),
      role: editRole.trim(),
      subject: editSubject.trim(),
      message: editMessage.trim(),
      date: editDate.trim(),
      time: editTime.trim(),
      branch: editBranch.trim(),
      status: editStatus,
    };

    setMessages((current) =>
      current.map((item) =>
        item.id === updated.id ? updated : item
      )
    );

    setSelected(updated);
    setEditVisible(false);
  };

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.sender.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.branch.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesBranch =
        branchFilter === "All" || item.branch === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [messages, search, statusFilter, branchFilter]);

  const total = messages.length;
  const unread = messages.filter(
    (item) => item.status === "Unread"
  ).length;
  const replied = messages.filter(
    (item) => item.status === "Replied"
  ).length;
  const resolved = messages.filter(
    (item) => item.status === "Resolved"
  ).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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

            <Text style={styles.headerTitle}>Messages</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={openAddMessage}
            accessibilityRole="button"
            accessibilityLabel="Add Message"
          >
            <Text style={styles.addPlus}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.purpleIcon]}>
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={22}
                  color="#7040D5"
                />
              </View>
              <Text style={styles.statNumber}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.pinkIcon]}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={22}
                  color="#E84D75"
                />
              </View>
              <Text style={styles.statNumber}>{unread}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.greenIcon]}>
                <MaterialCommunityIcons
                  name="reply-outline"
                  size={22}
                  color="#13B96D"
                />
              </View>
              <Text style={styles.statNumber}>{replied}</Text>
              <Text style={styles.statLabel}>Replied</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.blueIcon]}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={22}
                  color="#2675E8"
                />
              </View>
              <Text style={styles.statNumber}>{resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#8994A7"
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search messages..."
                placeholderTextColor="#A0A9B8"
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {(
                [
                  "All",
                  "Unread",
                  "Read",
                  "Replied",
                  "Resolved",
                ] as const
              ).map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  onPress={() => setStatusFilter(item)}
                  style={[
                    styles.filterButton,
                    statusFilter === item &&
                      styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      statusFilter === item &&
                        styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.branchRow}
            >
              {(["All", "Pune", "Mumbai", "Nashik"] as const).map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.8}
                    onPress={() => setBranchFilter(item)}
                    style={[
                      styles.branchButton,
                      branchFilter === item &&
                        styles.branchButtonActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={16}
                      color={
                        branchFilter === item
                          ? "#FFFFFF"
                          : "#7040D5"
                      }
                    />
                    <Text
                      style={[
                        styles.branchText,
                        branchFilter === item &&
                          styles.branchTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>All Messages</Text>
              <Text style={styles.listSubtitle}>
                Recent communication and enquiries
              </Text>
            </View>

            <Text style={styles.recordCount}>
              {filteredMessages.length} records
            </Text>
          </View>

          {filteredMessages.map((item) => {
            const colors = statusStyle[item.status];

            return (
              <View
                key={item.id}
                style={[
                  styles.messageCard,
                  { borderLeftColor: colors.border },
                ]}
              >
                <View style={styles.messageTop}>
                  <View style={styles.senderArea}>
                    <View style={styles.avatar}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={25}
                        color="#7040D5"
                      />
                    </View>

                    <View style={styles.senderInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.senderName}>
                          {item.sender}
                        </Text>

                        {item.status === "Unread" && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>

                      <Text style={styles.senderMeta}>
                        {item.id} • {item.role}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: colors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: colors.text },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subject}>
                  {item.subject}
                </Text>

                <Text style={styles.messageText}>
                  {item.message}
                </Text>

                <View style={styles.divider} />

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                      {item.date}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>
                      {item.time}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Branch</Text>
                    <Text style={styles.detailValue}>
                      {item.branch}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Role</Text>
                    <Text style={styles.detailValue}>
                      {item.role}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    activeOpacity={0.8}
                    onPress={() => openEdit(item)}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={17}
                      color="#FFFFFF"
                    />
                    <Text style={styles.editButtonText}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.viewButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelected(item);
                      setViewVisible(true);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="eye-outline"
                      size={18}
                      color="#7040D5"
                    />
                    <Text style={styles.viewButtonText}>
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {filteredMessages.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={38}
                color="#A3AABD"
              />
              <Text style={styles.emptyTitle}>
                No messages found
              </Text>
              <Text style={styles.emptyText}>
                Try another search or filter.
              </Text>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={viewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Message Details
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selected?.id}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setViewVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#66768A"
                  />
                </TouchableOpacity>
              </View>

              {selected && (
                <>
                  <Text style={styles.modalSender}>
                    {selected.sender}
                  </Text>

                  <Text style={styles.modalSubject}>
                    {selected.subject}
                  </Text>

                  <Text style={styles.modalMessage}>
                    {selected.message}
                  </Text>

                  <View style={styles.modalGrid}>
                    {[
                      ["Date", selected.date],
                      ["Time", selected.time],
                      ["Branch", selected.branch],
                      ["Role", selected.role],
                      ["Status", selected.status],
                    ].map(([label, value]) => (
                      <View
                        key={label}
                        style={styles.modalDetail}
                      >
                        <Text style={styles.detailLabel}>
                          {label}
                        </Text>
                        <Text style={styles.detailValue}>
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.modalEditButton}
                    onPress={() => {
                      setViewVisible(false);
                      openEdit(selected);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.modalEditText}>
                      Edit Message
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={editVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.editModalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Edit Message
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Update message information
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setEditVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#66768A"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {[
                  ["Sender", editSender, setEditSender],
                  ["Role", editRole, setEditRole],
                  ["Subject", editSubject, setEditSubject],
                  ["Date", editDate, setEditDate],
                  ["Time", editTime, setEditTime],
                  ["Branch", editBranch, setEditBranch],
                ].map(([label, value, setter]) => (
                  <View key={label as string}>
                    <Text style={styles.inputLabel}>
                      {label as string}
                    </Text>
                    <TextInput
                      value={value as string}
                      onChangeText={setter as (v: string) => void}
                      style={styles.input}
                      placeholder={`Enter ${(label as string).toLowerCase()}`}
                      placeholderTextColor="#A0A9B8"
                    />
                  </View>
                ))}

                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  value={editMessage}
                  onChangeText={setEditMessage}
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter message"
                  placeholderTextColor="#A0A9B8"
                  multiline
                />

                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.optionsRow}>
                  {(
                    [
                      "Unread",
                      "Read",
                      "Replied",
                      "Resolved",
                    ] as MessageStatus[]
                  ).map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setEditStatus(item)}
                      style={[
                        styles.option,
                        editStatus === item &&
                          styles.optionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editStatus === item &&
                            styles.optionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditVisible(false)}
                  >
                    <Text style={styles.cancelText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveEdit}
                  >
                    <MaterialCommunityIcons
                      name="content-save-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.saveText}>
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
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
    minHeight: 68,
    backgroundColor: "#7040D5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
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
    marginRight: 10,
  },
  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  addPlus: {
    fontFamily: "PoppinsRegular",
    fontSize: 30,
    lineHeight: 32,
    color: "#7040D5",
    marginTop: -2,
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 19,
  },
  statCard: {
    flex: 1,
    minHeight: 126,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  statIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  purpleIcon: {
    backgroundColor: "#F0E8FF",
  },
  pinkIcon: {
    backgroundColor: "#FFEAF1",
  },
  greenIcon: {
    backgroundColor: "#E7F8F0",
  },
  blueIcon: {
    backgroundColor: "#EAF2FF",
  },
  statNumber: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#202A3D",
  },
  statLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7C879A",
    marginTop: 1,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E8EAF0",
    marginBottom: 22,
  },
  searchBox: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginLeft: 9,
  },
  filterRow: {
    paddingTop: 13,
    gap: 9,
  },
  filterButton: {
    minHeight: 45,
    paddingHorizontal: 18,
    borderRadius: 11,
    backgroundColor: "#F8F9FC",
    borderWidth: 1,
    borderColor: "#E6E8EF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },
  filterText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#788397",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  branchRow: {
    paddingTop: 11,
    gap: 9,
  },
  branchButton: {
    minHeight: 43,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: "#F8F9FC",
    borderWidth: 1,
    borderColor: "#E6E8EF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  branchButtonActive: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },
  branchText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#7040D5",
    marginLeft: 5,
  },
  branchTextActive: {
    color: "#FFFFFF",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  listTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#202A3D",
  },
  listSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#7C879A",
    marginTop: 1,
  },
  recordCount: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7C879A",
    marginBottom: 2,
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECEEF4",
    borderLeftWidth: 3,
    marginBottom: 16,
    elevation: 2,
  },
  messageTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  senderArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 53,
    height: 53,
    borderRadius: 13,
    backgroundColor: "#F0E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  senderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  senderName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
    color: "#202A3D",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E84D75",
    marginLeft: 7,
  },
  senderMeta: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#9AA2B1",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    marginLeft: 10,
  },
  statusText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
  },
  subject: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#202A3D",
    marginTop: 15,
  },
  messageText: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#687388",
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF0F4",
    marginBottom: 14,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    marginBottom: 13,
  },
  detailLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#8290A5",
    marginBottom: 3,
  },
  detailValue: {
    fontFamily: "PoppinsRegular",
    fontSize: 11.5,
    color: "#263047",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  editButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 6,
  },
  viewButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#7040D5",
    marginLeft: 6,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202A3D",
    marginTop: 10,
  },
  emptyText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8A94A6",
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,20,32,0.48)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    maxHeight: "82%",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 20,
  },
  editModalCard: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 17,
    color: "#202A3D",
  },
  modalSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8B96A8",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSender: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 18,
    color: "#202A3D",
    marginBottom: 8,
  },
  modalSubject: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#202A3D",
    marginBottom: 6,
  },
  modalMessage: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 18,
    color: "#687388",
    marginBottom: 15,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  modalDetail: {
    width: "50%",
    paddingVertical: 9,
  },
  modalEditButton: {
    height: 45,
    borderRadius: 11,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  modalEditText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#FFFFFF",
    marginLeft: 7,
  },
  inputLabel: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#58657A",
    marginBottom: 6,
    marginTop: 5,
  },
  input: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: "#E1E4EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#263047",
    marginBottom: 10,
  },
  textArea: {
    minHeight: 85,
    paddingTop: 11,
    textAlignVertical: "top",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 11,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E5E7EE",
  },
  optionActive: {
    backgroundColor: "#F0E8FF",
    borderColor: "#7040D5",
  },
  optionText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
    color: "#788397",
  },
  optionTextActive: {
    color: "#7040D5",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 9,
    paddingTop: 8,
    paddingBottom: 5,
  },
  cancelButton: {
    minHeight: 45,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDFE7",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#687388",
  },
  saveButton: {
    minHeight: 45,
    paddingHorizontal: 19,
    borderRadius: 11,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#FFFFFF",
    marginLeft: 7,
  },
});
