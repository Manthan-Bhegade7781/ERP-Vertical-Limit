import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const PURPLE = "#7040D5";

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";
};

const initialAcademicYears: AcademicYear[] = [
  {
    id: "ay-2026-27",
    name: "2026-27",
    startDate: "01/06/2026",
    endDate: "31/03/2027",
    status: "Active",
  },
  {
    id: "ay-2025-26",
    name: "2025-26",
    startDate: "01/06/2025",
    endDate: "31/03/2026",
    status: "Inactive",
  },
];

const FILTER_OPTIONS = ["All", "Active", "Inactive"];

export default function AcademicsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const contentWidth = isDesktop
    ? Math.min(width - 250 - 40, 1500)
    : width - 32;

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(
    initialAcademicYears
  );

  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const [editingYear, setEditingYear] =
    useState<AcademicYear | null>(null);

  const [editYearName, setEditYearName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStatus, setEditStatus] = useState<
    "Active" | "Inactive"
  >("Active");

  const filteredAcademicYears = useMemo(() => {
    const query = search.trim().toLowerCase();

    return academicYears.filter((year) => {
      const matchesSearch =
        !query ||
        year.name.toLowerCase().includes(query) ||
        year.startDate.toLowerCase().includes(query) ||
        year.endDate.toLowerCase().includes(query);

      const matchesFilter =
        selectedFilter === "All" ||
        year.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [academicYears, search, selectedFilter]);

  const activeAcademicYear =
    academicYears.find((year) => year.status === "Active") || null;

  const inactiveCount = academicYears.filter(
    (year) => year.status === "Inactive"
  ).length;

  const handleBack = () => {
    router.replace("/(tabs)");
  };

  const handleAddAcademicYear = () => {
    router.push({
      pathname: "/(super_admin)/explore",
      params: {
        feature: "Add Academic Info",
      },
    });
  };

  const handleViewAcademicYear = (year: AcademicYear) => {
    Alert.alert(
      year.name,
      `Start Date: ${year.startDate}\nEnd Date: ${year.endDate}\nStatus: ${year.status}`
    );
  };

  const handleToggleStatus = (year: AcademicYear) => {
    const nextStatus =
      year.status === "Active" ? "Inactive" : "Active";

    if (nextStatus === "Active") {
      const anotherActiveYear = academicYears.find(
        (item) =>
          item.id !== year.id &&
          item.status === "Active"
      );

      if (anotherActiveYear) {
        Alert.alert(
          "Active Academic Year",
          `${anotherActiveYear.name} is already active. Only one academic year should be active at a time.`
        );
        return;
      }
    }

    setAcademicYears((current) =>
      current.map((item) =>
        item.id === year.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );
  };

  const handleEditAcademicYear = (year: AcademicYear) => {
    setEditingYear(year);
    setEditYearName(year.name);
    setEditStartDate(year.startDate);
    setEditEndDate(year.endDate);
    setEditStatus(year.status);
  };

  const handleSaveEditedAcademicYear = () => {
    if (!editingYear) return;

    if (!editYearName.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter the academic year."
      );
      return;
    }

    if (!editStartDate.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter the start date."
      );
      return;
    }

    if (!editEndDate.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter the end date."
      );
      return;
    }

    if (editStatus === "Active") {
      const anotherActiveYear = academicYears.find(
        (item) =>
          item.id !== editingYear.id &&
          item.status === "Active"
      );

      if (anotherActiveYear) {
        Alert.alert(
          "Active Academic Year",
          `${anotherActiveYear.name} is already active. Only one academic year should be active at a time.`
        );
        return;
      }
    }

    setAcademicYears((current) =>
      current.map((item) =>
        item.id === editingYear.id
          ? {
              ...item,
              name: editYearName.trim(),
              startDate: editStartDate.trim(),
              endDate: editEndDate.trim(),
              status: editStatus,
            }
          : item
      )
    );

    setEditingYear(null);

    Alert.alert(
      "Academic Year Updated",
      `${editYearName.trim()} has been updated successfully.`
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Academic Years
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleAddAcademicYear}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color={PURPLE}
            />

            <Text
              style={styles.headerActionText}
              numberOfLines={1}
            >
              Add Academic Year
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
        <View
          style={[
            styles.content,
            {
              width: contentWidth,
            },
          ]}
        >
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>
              Academic Year Management
            </Text>

            <Text style={styles.pageSubtitle}>
              Create and manage academic years for the institute.
            </Text>
          </View>

          {/* Statistics */}
          <View
            style={[
              styles.statsGrid,
              isDesktop && styles.statsGridDesktop,
            ]}
          >
            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <StatCard
                icon="calendar-range-outline"
                title="Total Academic Years"
                value={String(academicYears.length)}
                label="Years"
                iconBackground="#F1EAFF"
                iconColor={PURPLE}
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <StatCard
                icon="calendar-check-outline"
                title="Active Academic Year"
                value={activeAcademicYear?.name || "None"}
                label="Current"
                iconBackground="#EAF2FF"
                iconColor="#2675E8"
                compactValue
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <StatCard
                icon="calendar-remove-outline"
                title="Inactive Years"
                value={String(inactiveCount)}
                label="Inactive"
                iconBackground="#FFF1E2"
                iconColor="#F7941D"
              />
            </View>
          </View>

          {/* Search + Filters */}
          <View style={styles.filterCard}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#8A94A6"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search academic years..."
                placeholderTextColor="#A0A8B7"
                style={styles.searchInput}
                numberOfLines={1}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={19}
                    color="#A0A8B7"
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterRow}>
              {FILTER_OPTIONS.map((filter) => {
                const active = selectedFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      active && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* List Header */}
          <View style={styles.listHeader}>
            <View style={styles.listTitleArea}>
              <Text style={styles.listTitle}>
                Academic Years
              </Text>

              <Text style={styles.listSubtitle}>
                {filteredAcademicYears.length} academic year
                {filteredAcademicYears.length === 1 ? "" : "s"}
              </Text>
            </View>

            {activeAcademicYear && (
              <View style={styles.activeBadge}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={15}
                  color="#35B878"
                />

                <Text style={styles.activeBadgeText}>
                  {activeAcademicYear.name} Active
                </Text>
              </View>
            )}
          </View>

          {/* Academic Year List */}
          {filteredAcademicYears.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="calendar-search-outline"
                  size={34}
                  color={PURPLE}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No academic years found
              </Text>

              <Text style={styles.emptySubtitle}>
                Try changing your search or filter.
              </Text>
            </View>
          ) : (
            <View style={styles.yearList}>
              {filteredAcademicYears.map((year) => (
                <AcademicYearCard
                  key={year.id}
                  year={year}
                  onView={() => handleViewAcademicYear(year)}
                  onEdit={() => handleEditAcademicYear(year)}
                  onToggleStatus={() => handleToggleStatus(year)}
                />
              ))}
            </View>
          )}

          {/* Information */}
          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={PURPLE}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Academic year
              </Text>

              <Text style={styles.infoText}>
                Academic years define the main academic period
                used across batches, subjects, attendance,
                examinations and reports.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={editingYear !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingYear(null)}
      >
        <View style={styles.editOverlay}>
          <View style={styles.editModal}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <View style={styles.editTitleArea}>
                <View style={styles.editIconBox}>
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={21}
                    color={PURPLE}
                  />
                </View>

                <View style={styles.editTitleTextArea}>
                  <Text style={styles.editModalTitle}>
                    Edit Academic Year
                  </Text>

                  <Text style={styles.editModalSubtitle}>
                    Update academic year details
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editCloseButton}
                onPress={() => setEditingYear(null)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color="#707B8F"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editScroll}
              contentContainerStyle={styles.editScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Academic Year */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Academic Year
                  <Text style={styles.editRequired}> *</Text>
                </Text>

                <TextInput
                  value={editYearName}
                  onChangeText={setEditYearName}
                  placeholder="e.g. 2026-27"
                  placeholderTextColor="#A0A8B7"
                  style={styles.editInput}
                />
              </View>

              {/* Dates */}
              <View style={styles.editRow}>
                <View style={styles.editHalfField}>
                  <Text style={styles.editLabel}>
                    Start Date
                    <Text style={styles.editRequired}> *</Text>
                  </Text>

                  <View style={styles.editDateInput}>
                    <TextInput
                      value={editStartDate}
                      onChangeText={setEditStartDate}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A0A8B7"
                      style={styles.editDateTextInput}
                      keyboardType="numbers-and-punctuation"
                    />

                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={18}
                      color="#8A94A6"
                    />
                  </View>
                </View>

                <View style={styles.editHalfField}>
                  <Text style={styles.editLabel}>
                    End Date
                    <Text style={styles.editRequired}> *</Text>
                  </Text>

                  <View style={styles.editDateInput}>
                    <TextInput
                      value={editEndDate}
                      onChangeText={setEditEndDate}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A0A8B7"
                      style={styles.editDateTextInput}
                      keyboardType="numbers-and-punctuation"
                    />

                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={18}
                      color="#8A94A6"
                    />
                  </View>
                </View>
              </View>

              {/* Status */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Status
                </Text>

                <View style={styles.editStatusRow}>
                  {(["Active", "Inactive"] as const).map(
                    (status) => {
                      const selected =
                        editStatus === status;

                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.editStatusButton,
                            selected &&
                              styles.editStatusButtonSelected,
                          ]}
                          onPress={() =>
                            setEditStatus(status)
                          }
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons
                            name={
                              selected
                                ? "radiobox-marked"
                                : "radiobox-blank"
                            }
                            size={18}
                            color={
                              selected
                                ? PURPLE
                                : "#8A94A6"
                            }
                          />

                          <Text
                            style={[
                              styles.editStatusText,
                              selected &&
                                styles.editStatusTextSelected,
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>

              {/* Note */}
              <View style={styles.editNote}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={PURPLE}
                />

                <Text style={styles.editNoteText}>
                  Changes are currently saved locally. The API
                  update will be connected later.
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.editFooter}>
              <TouchableOpacity
                style={styles.editCancelButton}
                onPress={() => setEditingYear(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.editCancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSaveButton}
                onPress={handleSaveEditedAcademicYear}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.editSaveText}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics Card                                                            */
/* -------------------------------------------------------------------------- */

type StatCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  label: string;
  iconBackground: string;
  iconColor: string;
  compactValue?: boolean;
};

function StatCard({
  icon,
  title,
  value,
  label,
  iconBackground,
  iconColor,
  compactValue = false,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      {/* Top Row */}
      <View style={styles.statTopRow}>
        <View
          style={[
            styles.statIconBox,
            {
              backgroundColor: iconBackground,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={iconColor}
          />
        </View>

        {/* Label Badge */}
        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor: iconBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.changeText,
              {
                color: iconColor,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.statBottom}>
        <Text
          style={[
            styles.statValue,
            compactValue && styles.statValueCompact,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>

        <Text
          style={styles.statTitle}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Academic Year Card                                                         */
/* -------------------------------------------------------------------------- */

type AcademicYearCardProps = {
  year: AcademicYear;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
};

function AcademicYearCard({
  year,
  onView,
  onEdit,
  onToggleStatus,
}: AcademicYearCardProps) {
  const isActive = year.status === "Active";

  return (
    <View style={styles.yearCard}>
      {/* Top */}
      <View style={styles.yearTop}>
        <View
          style={[
            styles.yearIconBox,
            isActive
              ? styles.yearIconBoxActive
              : styles.yearIconBoxInactive,
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-range-outline"
            size={24}
            color={isActive ? PURPLE : "#8A94A6"}
          />
        </View>

        <View style={styles.yearTitleArea}>
          <Text
            style={styles.yearName}
            numberOfLines={1}
          >
            {year.name}
          </Text>

          <Text
            style={styles.yearSubtitle}
            numberOfLines={1}
          >
            Academic Year
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isActive
              ? styles.statusBadgeActive
              : styles.statusBadgeInactive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isActive
                ? styles.statusDotActive
                : styles.statusDotInactive,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              isActive
                ? styles.statusTextActive
                : styles.statusTextInactive,
            ]}
          >
            {year.status}
          </Text>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.dateSection}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>
            Start Date
          </Text>

          <View style={styles.dateValueRow}>
            <MaterialCommunityIcons
              name="calendar-arrow-right"
              size={16}
              color="#8A94A6"
            />

            <Text style={styles.dateValue}>
              {year.startDate}
            </Text>
          </View>
        </View>

        <View style={styles.dateDivider} />

        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>
            End Date
          </Text>

          <View style={styles.dateValueRow}>
            <MaterialCommunityIcons
              name="calendar-arrow-left"
              size={16}
              color="#8A94A6"
            />

            <Text style={styles.dateValue}>
              {year.endDate}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.yearActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={onView}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="eye-outline"
            size={17}
            color={PURPLE}
          />

          <Text style={styles.viewButtonText}>
            View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={17}
            color="#2675E8"
          />

          <Text style={styles.editButtonText}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusActionButton,
            isActive
              ? styles.deactivateButton
              : styles.activateButton,
          ]}
          onPress={onToggleStatus}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={
              isActive
                ? "calendar-remove-outline"
                : "calendar-check-outline"
            }
            size={17}
            color={isActive ? "#E95368" : "#35B878"}
          />

          <Text
            style={[
              styles.statusActionText,
              isActive
                ? styles.deactivateText
                : styles.activateText,
            ]}
          >
            {isActive ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  /* Edit Modal */

editOverlay: {
  flex: 1,
  backgroundColor: "rgba(18, 22, 35, 0.45)",
  justifyContent: "flex-end",
},

editModal: {
  width: "100%",
  maxHeight: "88%",
  backgroundColor: "#FFFFFF",
  borderTopLeftRadius: 22,
  borderTopRightRadius: 22,
  paddingTop: 18,
  paddingHorizontal: 16,
  paddingBottom: 10,
},

editModalHeader: {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  paddingBottom: 15,
  borderBottomWidth: 1,
  borderBottomColor: "#EEF0F5",
},

editTitleArea: {
  flex: 1,
  minWidth: 0,
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

editIconBox: {
  width: 42,
  height: 42,
  borderRadius: 11,
  backgroundColor: "#F1EAFF",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
},

editTitleTextArea: {
  flex: 1,
  minWidth: 0,
},

editModalTitle: {
  fontFamily: "PoppinsSemiBold",
  fontSize: 16,
  color: "#172033",
},

editModalSubtitle: {
  marginTop: 2,
  fontFamily: "PoppinsRegular",
  fontSize: 9,
  color: "#858D9F",
},

editCloseButton: {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: "#F4F5F8",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
},

editScroll: {
  width: "100%",
},

editScrollContent: {
  paddingTop: 18,
  paddingBottom: 10,
},

editField: {
  width: "100%",
  marginBottom: 16,
},

editHalfField: {
  flex: 1,
  minWidth: 0,
},

editRow: {
  width: "100%",
  flexDirection: "row",
  gap: 9,
  marginBottom: 16,
},

editLabel: {
  marginBottom: 6,
  fontFamily: "PoppinsMedium",
  fontSize: 10.5,
  color: "#555E70",
},

editRequired: {
  color: "#E95386",
},

editInput: {
  width: "100%",
  height: 50,
  borderWidth: 1,
  borderColor: "#E3E7EF",
  borderRadius: 10,
  backgroundColor: "#FBFCFE",
  paddingHorizontal: 12,
  fontFamily: "PoppinsRegular",
  fontSize: 10,
  color: "#303544",
},

editDateInput: {
  width: "100%",
  height: 50,
  borderWidth: 1,
  borderColor: "#E3E7EF",
  borderRadius: 10,
  backgroundColor: "#FBFCFE",
  paddingHorizontal: 10,
  flexDirection: "row",
  alignItems: "center",
},

editDateTextInput: {
  flex: 1,
  minWidth: 0,
  height: 48,
  paddingHorizontal: 1,
  fontFamily: "PoppinsRegular",
  fontSize: 10,
  color: "#303544",
},

editStatusRow: {
  width: "100%",
  flexDirection: "row",
  gap: 9,
},

editStatusButton: {
  flex: 1,
  height: 46,
  borderWidth: 1,
  borderColor: "#E3E7EF",
  borderRadius: 10,
  backgroundColor: "#FBFCFE",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
},

editStatusButtonSelected: {
  borderColor: "#CDB8F5",
  backgroundColor: "#F1EAFF",
},

editStatusText: {
  fontFamily: "PoppinsMedium",
  fontSize: 10,
  color: "#707B8F",
},

editStatusTextSelected: {
  color: PURPLE,
},

editNote: {
  width: "100%",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 8,
  backgroundColor: "#F3EEFD",
  borderWidth: 1,
  borderColor: "#E7DDFB",
  borderRadius: 11,
  padding: 11,
},

editNoteText: {
  flex: 1,
  fontFamily: "PoppinsRegular",
  fontSize: 9,
  lineHeight: 14,
  color: "#6E6680",
},

editFooter: {
  width: "100%",
  flexDirection: "row",
  gap: 9,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: "#EEF0F5",
},

editCancelButton: {
  flex: 1,
  height: 48,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#DDE1E9",
  backgroundColor: "#FFFFFF",
  alignItems: "center",
  justifyContent: "center",
},

editCancelText: {
  fontFamily: "PoppinsSemiBold",
  fontSize: 10.5,
  color: "#6D7789",
},

editSaveButton: {
  flex: 1.5,
  height: 48,
  borderRadius: 10,
  backgroundColor: PURPLE,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
},

editSaveText: {
  fontFamily: "PoppinsSemiBold",
  fontSize: 10.5,
  color: "#FFFFFF",
},

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
  },

  content: {
    maxWidth: 1500,
    paddingTop: 22,
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

  headerAction: {
    height: 40,
    minWidth: 72,
    maxWidth: 180,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flexShrink: 0,
  },

  headerActionText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: PURPLE,
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
  },

  pageSubtitle: {
    marginTop: 4,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 17,
    color: "#858D9F",
  },

  /* Statistics */

  statsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 18,
},

statsGridDesktop: {
  flexWrap: "nowrap",
},

statCardWrapper: {
  width: "48%",
},

statCardWrapperDesktop: {
  flex: 1,
  width: undefined,
},

statCard: {
  height: 145,
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#EEF0F5",
  padding: 16,
  justifyContent: "space-between",
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
},

statTopRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 5,
},

statIconBox: {
  width: 46,
  height: 46,
  borderRadius: 13,
  alignItems: "center",
  justifyContent: "center",
},

changeBadge: {
  minHeight: 26,
  maxWidth: "55%",
  borderRadius: 8,
  paddingHorizontal: 7,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

changeText: {
  fontFamily: "PoppinsSemiBold",
  fontSize: 9,
  marginLeft: 3,
},

statBottom: {
  minWidth: 0,
},

statTitle: {
  fontFamily: "PoppinsMedium",
  fontSize: 11,
  color: "#748096",
  marginBottom: 2,
},

statValue: {
  fontFamily: "PoppinsBold",
  fontSize: 23,
  color: "#172033",
},

statValueCompact: {
  fontSize: 17,
},

  /* Search / Filter */

  filterCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 12,
    marginBottom: 20,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  searchContainer: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 10,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 46,
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#303544",
  },

  filterRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  filterButton: {
    minWidth: 70,
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    backgroundColor: "#FBFCFE",
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    borderColor: "#CDB8F5",
    backgroundColor: "#F1EAFF",
  },

  filterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#707B8F",
  },

  filterTextActive: {
    color: PURPLE,
  },

  /* List Header */

  listHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },

  listTitleArea: {
    flex: 1,
    minWidth: 0,
  },

  listTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#172033",
  },

  listSubtitle: {
    marginTop: 2,
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#858D9F",
  },

  activeBadge: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E7F8EF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },

  activeBadgeText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#35B878",
  },

  /* Academic Year List */

  yearList: {
    width: "100%",
    gap: 12,
  },

  yearCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 13,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  yearTop: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  yearIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  yearIconBoxActive: {
    backgroundColor: "#F1EAFF",
  },

  yearIconBoxInactive: {
    backgroundColor: "#F1F3F6",
  },

  yearTitleArea: {
    flex: 1,
    minWidth: 0,
  },

  yearName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
    color: "#172033",
  },

  yearSubtitle: {
    marginTop: 2,
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#858D9F",
  },

  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },

  statusBadgeActive: {
    backgroundColor: "#E7F8EF",
  },

  statusBadgeInactive: {
    backgroundColor: "#F1F3F6",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusDotActive: {
    backgroundColor: "#35B878",
  },

  statusDotInactive: {
    backgroundColor: "#8A94A6",
  },

  statusText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
  },

  statusTextActive: {
    color: "#35B878",
  },

  statusTextInactive: {
    color: "#707B8F",
  },

  /* Dates */

  dateSection: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F1F5",
  },

  dateItem: {
    flex: 1,
    minWidth: 0,
  },

  dateLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#858D9F",
    marginBottom: 4,
  },

  dateValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  dateValue: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#303544",
  },

  dateDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E9EBF0",
    marginHorizontal: 14,
  },

  /* Actions */

  yearActions: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },

  viewButton: {
    minWidth: 80,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#DCCDF8",
    backgroundColor: "#F8F5FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  viewButtonText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9.5,
    color: PURPLE,
  },

  editButton: {
  minWidth: 80,
  height: 38,
  paddingHorizontal: 11,
  borderRadius: 9,
  borderWidth: 1,
  borderColor: "#CFE0FA",
  backgroundColor: "#F2F7FF",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
},

editButtonText: {
  fontFamily: "PoppinsMedium",
  fontSize: 9.5,
  color: "#2675E8",
},

  statusActionButton: {
    minWidth: 105,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  deactivateButton: {
    backgroundColor: "#FFF0F2",
    borderWidth: 1,
    borderColor: "#F7CDD5",
  },

  activateButton: {
    backgroundColor: "#EAF9F1",
    borderWidth: 1,
    borderColor: "#C9ECD9",
  },

  statusActionText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9.5,
  },

  deactivateText: {
    color: "#E95368",
  },

  activateText: {
    color: "#35B878",
  },

  /* Empty */

  emptyCard: {
    width: "100%",
    minHeight: 230,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#172033",
  },

  emptySubtitle: {
    marginTop: 4,
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#858D9F",
  },

  /* Information */

  infoBox: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#F3EEFD",
    borderWidth: 1,
    borderColor: "#E7DDFB",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },

  infoIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#E7DDFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    flexShrink: 0,
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#4B347D",
  },

  infoText: {
    marginTop: 3,
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    lineHeight: 14,
    color: "#6E6680",
  },
});