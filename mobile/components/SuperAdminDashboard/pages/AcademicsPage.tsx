import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
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

type AcademicModule = {
  id: string;
  title: string;
  description: string;
  count: string;
  countLabel: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBackground: string;
  iconColor: string;
};

const academicModules: AcademicModule[] = [
  {
    id: "academic-years",
    title: "Academic Years",
    description: "Create and manage academic years",
    count: "2",
    countLabel: "Years",
    icon: "calendar-range-outline",
    iconBackground: "#F1EAFF",
    iconColor: "#7040D5",
  },
  {
    id: "standards",
    title: "Standards / Classes",
    description: "Manage standards and academic classes",
    count: "5",
    countLabel: "Standards",
    icon: "school-outline",
    iconBackground: "#EAF2FF",
    iconColor: "#2675E8",
  },
  {
    id: "curriculum",
    title: "Curriculum",
    description: "Configure curriculum by standard",
    count: "6",
    countLabel: "Curriculums",
    icon: "book-open-page-variant-outline",
    iconBackground: "#E7F8EF",
    iconColor: "#35B878",
  },
  {
    id: "terms",
    title: "Academic Terms",
    description: "Manage terms and academic periods",
    count: "2",
    countLabel: "Active Terms",
    icon: "calendar-clock-outline",
    iconBackground: "#FFF1E2",
    iconColor: "#F7941D",
  },
  {
    id: "subject-allocation",
    title: "Subject Allocation",
    description: "Assign subjects to standards and batches",
    count: "18",
    countLabel: "Allocations",
    icon: "book-account-outline",
    iconBackground: "#F1EAFF",
    iconColor: "#7040D5",
  },
  {
    id: "faculty-allocation",
    title: "Faculty Allocation",
    description: "Assign faculty to subjects and classes",
    count: "24",
    countLabel: "Assignments",
    icon: "account-tie-outline",
    iconBackground: "#EAF2FF",
    iconColor: "#2675E8",
  },
  {
    id: "grading",
    title: "Grading & Evaluation",
    description: "Configure grades and evaluation rules",
    count: "4",
    countLabel: "Grade Levels",
    icon: "chart-box-outline",
    iconBackground: "#FFF1E2",
    iconColor: "#F7941D",
  },
  {
    id: "academic-rules",
    title: "Academic Rules",
    description: "Manage promotion and passing criteria",
    count: "8",
    countLabel: "Rules",
    icon: "clipboard-check-outline",
    iconBackground: "#FFE9F0",
    iconColor: "#E95386",
  },
];

const filterOptions = ["All", "Active", "Configuration"];

export default function AcademicsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;
  const contentWidth = isDesktop
    ? Math.min(width - 250 - 40, 1500)
    : width - 32;

  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return academicModules.filter((module) => {
      const matchesSearch =
        !query ||
        module.title.toLowerCase().includes(query) ||
        module.description.toLowerCase().includes(query);

      const matchesFilter =
        selectedFilter === "All" ||
        (selectedFilter === "Active" &&
          !["academic-rules", "grading"].includes(module.id)) ||
        (selectedFilter === "Configuration" &&
          ["curriculum", "grading", "academic-rules"].includes(module.id));

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter]);

  const handleBack = () => {
    router.replace("/(tabs)");
  };

  const handleAddAcademicInfo = () => {
    router.push({
      pathname: "/(tabs)/explore",
      params: { feature: "Add Academic Info" },
    });
  };

  const handleManage = (module: AcademicModule) => {
    Alert.alert(
      module.title,
      `${module.description}.\n\nThis module is ready to be connected to its dedicated page.`
    );
  };

  return (
    <View style={styles.screen}>
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
              Academics
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleAddAcademicInfo}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="#7040D5"
            />
            <Text style={styles.headerActionText} numberOfLines={1}>
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
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <Text style={styles.sectionTitle} numberOfLines={1}>
                Academic Management
              </Text>
              <Text style={styles.sectionSubtitle} numberOfLines={2}>
                Manage academic structure, curriculum and evaluation
              </Text>
            </View>
          </View>

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
              <AcademicStatCard
                icon="calendar-range-outline"
                title="Academic Years"
                value="2"
                change="Active"
                type="purple"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AcademicStatCard
                icon="calendar-check-outline"
                title="Active Year"
                value="2026 – 27"
                change="Current"
                type="blue"
                compactValue
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AcademicStatCard
                icon="school-outline"
                title="Standards"
                value="5"
                change="Active"
                type="green"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AcademicStatCard
                icon="calendar-clock-outline"
                title="Active Terms"
                value="2"
                change="Current"
                type="orange"
              />
            </View>
          </View>

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
                placeholder="Search academic modules..."
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
              {filterOptions.map((filter) => {
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

          <View style={styles.listHeader}>
            <View style={styles.listTitleArea}>
              <Text style={styles.listTitle}>Academic Setup</Text>
              <Text style={styles.listSubtitle}>
                {filteredModules.length} module
                {filteredModules.length === 1 ? "" : "s"} available
              </Text>
            </View>

            <View style={styles.sessionBadge}>
              <MaterialCommunityIcons
                name="calendar-check-outline"
                size={16}
                color="#7040D5"
              />
              <Text style={styles.sessionBadgeText}>2026 – 27</Text>
            </View>
          </View>

          {filteredModules.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="magnify-close"
                  size={34}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.emptyTitle}>No modules found</Text>
              <Text style={styles.emptySubtitle}>
                Try changing your search or filter.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.moduleGrid,
                isDesktop && styles.moduleGridDesktop,
              ]}
            >
              {filteredModules.map((module) => (
                <AcademicModuleCard
                  key={module.id}
                  module={module}
                  isDesktop={isDesktop}
                  onManage={() => handleManage(module)}
                />
              ))}
            </View>
          )}

          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color="#7040D5"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Academic structure</Text>
              <Text style={styles.infoText}>
                Subjects are managed separately in the Subjects module.
                Academics is used for academic years, standards, curriculum,
                terms, allocations, grading and academic rules.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

type AcademicStatCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  change: string;
  type: "purple" | "blue" | "green" | "orange";
  compactValue?: boolean;
};

function AcademicStatCard({
  icon,
  title,
  value,
  change,
  type,
  compactValue = false,
}: AcademicStatCardProps) {
  const colors = {
    purple: {
      background: "#F1EAFF",
      icon: "#7040D5",
    },
    blue: {
      background: "#EAF2FF",
      icon: "#2675E8",
    },
    green: {
      background: "#E7F8EF",
      icon: "#35B878",
    },
    orange: {
      background: "#FFF1E2",
      icon: "#F7941D",
    },
  };

  const color = colors[type];

  return (
    <View style={styles.statCard}>
      <View style={styles.statTopRow}>
        <View
          style={[
            styles.statIconBox,
            { backgroundColor: color.background },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={color.icon}
          />
        </View>

        <View
          style={[
            styles.changeBadge,
            { backgroundColor: color.background },
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={12}
            color={color.icon}
          />
          <Text style={[styles.changeText, { color: color.icon }]}>
            {change}
          </Text>
        </View>
      </View>

      <View style={styles.statBottom}>
        <Text style={styles.statTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[
            styles.statValue,
            compactValue && styles.statValueCompact,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

type AcademicModuleCardProps = {
  module: AcademicModule;
  isDesktop: boolean;
  onManage: () => void;
};

function AcademicModuleCard({
  module,
  isDesktop,
  onManage,
}: AcademicModuleCardProps) {
  return (
    <View
      style={[
        styles.moduleCard,
        isDesktop && styles.moduleCardDesktop,
      ]}
    >
      <View style={styles.moduleTop}>
        <View
          style={[
            styles.moduleIconBox,
            { backgroundColor: module.iconBackground },
          ]}
        >
          <MaterialCommunityIcons
            name={module.icon}
            size={23}
            color={module.iconColor}
          />
        </View>

        <View style={styles.moduleCountBadge}>
          <Text style={styles.moduleCountBadgeText}>
            {module.count}
          </Text>
        </View>
      </View>

      <View style={styles.moduleInfo}>
        <Text style={styles.moduleName} numberOfLines={1}>
          {module.title}
        </Text>

        <Text style={styles.moduleDescription} numberOfLines={2}>
          {module.description}
        </Text>
      </View>

      <View style={styles.moduleBottom}>
        <View>
          <Text style={styles.moduleCount}>{module.count}</Text>
          <Text style={styles.moduleCountLabel}>
            {module.countLabel}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={onManage}
          activeOpacity={0.8}
        >
          <Text style={styles.manageButtonText}>Manage</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={15}
            color="#7040D5"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  header: {
    backgroundColor: "#7040D5",
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
  },

  headerTitleArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 2,
    justifyContent: "center",
  },

  headerTitle: {
    flexShrink: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 20,
    color: "#FFFFFF",
  },

  headerAction: {
    minHeight: 40,
    maxWidth: "55%",
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  headerActionText: {
    flexShrink: 1,
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#7040D5",
    marginLeft: 5,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
  },

  content: {
    paddingTop: 22,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  sectionTitleArea: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 22,
    color: "#172033",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 17,
    color: "#858D9F",
  },

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

  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 14,
    marginBottom: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  searchContainer: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCFE",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#172033",
    marginLeft: 8,
    paddingVertical: 0,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 11,
  },

  filterButton: {
    minWidth: 70,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: "#7040D5",
  },

  filterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#707B8F",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    gap: 10,
  },

  listTitleArea: {
    flex: 1,
    minWidth: 0,
  },

  listTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    color: "#172033",
  },

  listSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8993A4",
    marginTop: 1,
  },

  sessionBadge: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: "#F1EAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  sessionBadgeText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#7040D5",
    marginLeft: 5,
  },

  moduleGrid: {
    gap: 12,
  },

  moduleGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  moduleCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  moduleCardDesktop: {
    width: "32.4%",
  },

  moduleTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  moduleIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  moduleCountBadge: {
    minWidth: 34,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
  },

  moduleCountBadgeText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#6D778A",
  },

  moduleInfo: {
    marginTop: 13,
    minWidth: 0,
  },

  moduleName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#172033",
  },

  moduleDescription: {
    marginTop: 4,
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    lineHeight: 14,
    color: "#8A94A6",
  },

  moduleBottom: {
    marginTop: 14,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F0F1F5",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },

  moduleCount: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    color: "#172033",
  },

  moduleCountLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#98A1B2",
    marginTop: 1,
  },

  manageButton: {
    height: 36,
    minWidth: 82,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: "#F1EAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  manageButtonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10,
    color: "#7040D5",
    marginRight: 4,
  },

  emptyCard: {
    minHeight: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 15,
    color: "#172033",
  },

  emptySubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#8A94A6",
    marginTop: 5,
  },

  infoBox: {
    marginTop: 14,
    flexDirection: "row",
    backgroundColor: "#F3EEFD",
    borderWidth: 1,
    borderColor: "#E7DDFB",
    borderRadius: 12,
    padding: 12,
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#E7DDFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
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
