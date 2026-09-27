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

type AnnouncementStatus = "Published" | "Scheduled" | "Draft" | "Expired";
type AnnouncementType = "Examination" | "Academic" | "Holiday" | "Branch" | "General";

type Announcement = {
  id: string;
  title: string;
  description: string;
  date: string;
  branch: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
};

const initialAnnouncements: Announcement[] = [
  {
    id: "ANN001",
    title: "Mid Semester Examination",
    description: "Mid semester examination schedule has been announced.",
    date: "09 Sep 2026",
    branch: "Pune",
    type: "Examination",
    status: "Published",
  },
  {
    id: "ANN002",
    title: "Parent Teacher Meeting",
    description: "Parent teacher meeting will be conducted for all batches.",
    date: "12 Sep 2026",
    branch: "Pune",
    type: "Academic",
    status: "Published",
  },
  {
    id: "ANN003",
    title: "Ganesh Chaturthi Holiday",
    description: "The academy will remain closed on the announced holiday.",
    date: "14 Sep 2026",
    branch: "Pune",
    type: "Holiday",
    status: "Published",
  },
  {
    id: "ANN004",
    title: "New Batch Orientation",
    description: "Orientation details for the new batch have been scheduled.",
    date: "18 Sep 2026",
    branch: "Mumbai",
    type: "Branch",
    status: "Scheduled",
  },
  {
    id: "ANN005",
    title: "Science Workshop",
    description: "A special science workshop has been planned for students.",
    date: "20 Sep 2026",
    branch: "Pune",
    type: "Academic",
    status: "Draft",
  },
  {
    id: "ANN006",
    title: "Previous Test Result Notice",
    description: "The previous examination result notice is now archived.",
    date: "05 Sep 2026",
    branch: "Nashik",
    type: "Examination",
    status: "Expired",
  },
];

const statusStyle: Record<
  AnnouncementStatus,
  { bg: string; text: string }
> = {
  Published: { bg: "#E8F8F0", text: "#13B96D" },
  Scheduled: { bg: "#EAF2FF", text: "#2675E8" },
  Draft: { bg: "#FFF1E2", text: "#F28A17" },
  Expired: { bg: "#F0F1F4", text: "#7D8797" },
};

export default function AnnouncementPage() {
  const router = useRouter();

  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | AnnouncementStatus>("All");

  const [selected, setSelected] = useState<Announcement | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editType, setEditType] =
    useState<AnnouncementType>("Academic");
  const [editStatus, setEditStatus] =
    useState<AnnouncementStatus>("Published");

  const openAddAnnouncement = () => {
    router.push("/(admin)/add-announcement" as never);
  };

  const openEdit = (item: Announcement) => {
    setSelected(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditDate(item.date);
    setEditBranch(item.branch);
    setEditType(item.type);
    setEditStatus(item.status);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (
      !selected ||
      !editTitle.trim() ||
      !editDescription.trim() ||
      !editDate.trim() ||
      !editBranch.trim()
    ) {
      Alert.alert("Required Fields", "Please fill all required fields.");
      return;
    }

    const updated: Announcement = {
      ...selected,
      title: editTitle.trim(),
      description: editDescription.trim(),
      date: editDate.trim(),
      branch: editBranch.trim(),
      type: editType,
      status: editStatus,
    };

    setAnnouncements((current) =>
      current.map((item) =>
        item.id === updated.id ? updated : item
      )
    );

    setSelected(updated);
    setEditVisible(false);
  };

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.branch.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [announcements, search, filter]);

  const total = announcements.length;
  const published = announcements.filter(
    (x) => x.status === "Published"
  ).length;
  const scheduled = announcements.filter(
    (x) => x.status === "Scheduled"
  ).length;
  const drafts = announcements.filter(
    (x) => x.status === "Draft"
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

            <Text style={styles.headerTitle}>Announcements</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={openAddAnnouncement}
            accessibilityRole="button"
            accessibilityLabel="Add Announcement"
          >
            <Text style={styles.addPlus}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.pageTitle}>Announcements</Text>
          <Text style={styles.pageSubtitle}>
            Manage academic and branch announcements
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.purpleIcon]}>
                <MaterialCommunityIcons
                  name="bullhorn-outline"
                  size={22}
                  color="#7040D5"
                />
              </View>
              <Text style={styles.statNumber}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.greenIcon]}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={22}
                  color="#13B96D"
                />
              </View>
              <Text style={styles.statNumber}>{published}</Text>
              <Text style={styles.statLabel}>Published</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.blueIcon]}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={22}
                  color="#2675E8"
                />
              </View>
              <Text style={styles.statNumber}>{scheduled}</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.orangeIcon]}>
                <MaterialCommunityIcons
                  name="file-outline"
                  size={22}
                  color="#F28A17"
                />
              </View>
              <Text style={styles.statNumber}>{drafts}</Text>
              <Text style={styles.statLabel}>Draft</Text>
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
                placeholder="Search announcements..."
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
                  "Published",
                  "Scheduled",
                  "Draft",
                  "Expired",
                ] as const
              ).map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterButton,
                    filter === item && styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item && styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>All Announcements</Text>
              <Text style={styles.listSubtitle}>
                Latest academic and branch updates
              </Text>
            </View>

            <Text style={styles.recordCount}>
              {filteredAnnouncements.length} records
            </Text>
          </View>

          {filteredAnnouncements.map((item) => {
            const colors = statusStyle[item.status];

            return (
              <View key={item.id} style={styles.announcementCard}>
                <View style={styles.announcementTop}>
                  <View style={styles.announcementIdentity}>
                    <View style={styles.announcementIcon}>
                      <MaterialCommunityIcons
                        name="file-document-edit-outline"
                        size={24}
                        color={
                          item.status === "Published"
                            ? "#2675E8"
                            : "#7040D5"
                        }
                      />
                    </View>

                    <View style={styles.titleBlock}>
                      <Text style={styles.announcementTitle}>
                        {item.title}
                      </Text>
                      <Text style={styles.announcementId}>
                        {item.id}
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

                <Text style={styles.description}>
                  {item.description}
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
                    <Text style={styles.detailLabel}>Branch</Text>
                    <Text style={styles.detailValue}>
                      {item.branch}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>
                      {item.type}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={styles.detailValue}>
                      {item.status}
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
                    <Text style={styles.editButtonText}>Edit</Text>
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
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {filteredAnnouncements.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="bullhorn-outline"
                size={38}
                color="#A3AABD"
              />
              <Text style={styles.emptyTitle}>
                No announcements found
              </Text>
              <Text style={styles.emptyText}>
                Try another search or status filter.
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
                    Announcement Details
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
                  <Text style={styles.modalAnnouncementTitle}>
                    {selected.title}
                  </Text>
                  <Text style={styles.modalDescription}>
                    {selected.description}
                  </Text>

                  <View style={styles.modalGrid}>
                    {[
                      ["Date", selected.date],
                      ["Branch", selected.branch],
                      ["Type", selected.type],
                      ["Status", selected.status],
                    ].map(([label, value]) => (
                      <View key={label} style={styles.modalDetail}>
                        <Text style={styles.detailLabel}>{label}</Text>
                        <Text style={styles.detailValue}>{value}</Text>
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
                      Edit Announcement
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
                    Edit Announcement
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Update announcement information
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
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  style={styles.input}
                  placeholder="Announcement title"
                  placeholderTextColor="#A0A9B8"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  style={[styles.input, styles.textArea]}
                  placeholder="Announcement description"
                  placeholderTextColor="#A0A9B8"
                  multiline
                />

                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  value={editDate}
                  onChangeText={setEditDate}
                  style={styles.input}
                  placeholder="e.g. 09 Sep 2026"
                  placeholderTextColor="#A0A9B8"
                />

                <Text style={styles.inputLabel}>Branch</Text>
                <TextInput
                  value={editBranch}
                  onChangeText={setEditBranch}
                  style={styles.input}
                  placeholder="Branch"
                  placeholderTextColor="#A0A9B8"
                />

                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.optionsRow}>
                  {(
                    [
                      "Examination",
                      "Academic",
                      "Holiday",
                      "Branch",
                      "General",
                    ] as AnnouncementType[]
                  ).map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setEditType(item)}
                      style={[
                        styles.option,
                        editType === item && styles.optionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editType === item &&
                            styles.optionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.optionsRow}>
                  {(
                    [
                      "Published",
                      "Scheduled",
                      "Draft",
                      "Expired",
                    ] as AnnouncementStatus[]
                  ).map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setEditStatus(item)}
                      style={[
                        styles.option,
                        editStatus === item && styles.optionActive,
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
                    <Text style={styles.cancelText}>Cancel</Text>
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },
  pageTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 19,
    color: "#202A3D",
    marginTop: 0,
  },
  pageSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#7C879A",
    marginTop: 2,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 11,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  purpleIcon: {
    backgroundColor: "#F0E8FF",
  },
  greenIcon: {
    backgroundColor: "#E7F8F0",
  },
  blueIcon: {
    backgroundColor: "#EAF2FF",
  },
  orangeIcon: {
    backgroundColor: "#FFF0DF",
  },
  statNumber: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 17,
    color: "#202A3D",
  },
  statLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#7C879A",
    marginTop: 1,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8EAF0",
    marginBottom: 16,
  },
  searchBox: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E3E6ED",
    borderRadius: 11,
    paddingHorizontal: 12,
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
    paddingTop: 9,
    gap: 7,
  },
  filterButton: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 9,
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
  listHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 18,
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
  announcementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#ECEEF4",
    marginBottom: 9,
    elevation: 2,
  },
  announcementTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  announcementIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  announcementIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  titleBlock: {
    flex: 1,
  },
  announcementTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#202A3D",
  },
  announcementId: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#9AA2B1",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
  },
  description: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#687388",
    marginTop: 10,
    marginBottom: 11,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF0F4",
    marginBottom: 10,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    marginBottom: 9,
  },
  detailLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#8290A5",
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#263047",
  },
  cardActions: {
    flexDirection: "row",
    gap: 7,
    marginTop: 1,
  },
  editButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
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
    height: 34,
    borderRadius: 8,
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
    borderRadius: 14,
    paddingVertical: 32,
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
  modalAnnouncementTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 17,
    color: "#202A3D",
    marginBottom: 7,
  },
  modalDescription: {
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
    minHeight: 80,
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
