import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Teacher = {
  id: string;
  employeeId: string;
  name: string;
  branch: string;
  specialization: string;
  qualification: string;
  experience: string;
  phone: string;
  email: string;
  address: string;
  status: "Active" | "Inactive";
};

const initialTeachers: Teacher[] = [
  {
    id: "1",
    employeeId: "TCH001",
    name: "Anita Desai",
    branch: "Pune Branch",
    specialization: "Physics",
    qualification: "M.Sc.",
    experience: "8 Years",
    phone: "+91 98765 50001",
    email: "anita.desai@example.com",
    address: "Pune, Maharashtra",
    status: "Active",
  },
  {
    id: "2",
    employeeId: "TCH002",
    name: "Neha Kapoor",
    branch: "Mumbai Branch",
    specialization: "Chemistry",
    qualification: "M.Sc.",
    experience: "7 Years",
    phone: "+91 98765 50002",
    email: "neha.kapoor@example.com",
    address: "Mumbai, Maharashtra",
    status: "Active",
  },
  {
    id: "3",
    employeeId: "TCH003",
    name: "Pooja Sharma",
    branch: "Nashik Branch",
    specialization: "Biology",
    qualification: "M.Sc.",
    experience: "6 Years",
    phone: "+91 98765 50003",
    email: "pooja.sharma@example.com",
    address: "Nashik, Maharashtra",
    status: "Active",
  },
  {
    id: "4",
    employeeId: "TCH004",
    name: "Ravi Patil",
    branch: "Nagpur Branch",
    specialization: "Mathematics",
    qualification: "M.Tech.",
    experience: "9 Years",
    phone: "+91 98765 50004",
    email: "ravi.patil@example.com",
    address: "Nagpur, Maharashtra",
    status: "Active",
  },
  {
    id: "5",
    employeeId: "TCH005",
    name: "Meena Joshi",
    branch: "Pune Branch",
    specialization: "English",
    qualification: "M.Ed.",
    experience: "5 Years",
    phone: "+91 98765 50005",
    email: "meena.joshi@example.com",
    address: "Pune, Maharashtra",
    status: "Active",
  },
  {
    id: "6",
    employeeId: "TCH006",
    name: "Karan Shah",
    branch: "Main Branch",
    specialization: "Physics",
    qualification: "B.Tech.",
    experience: "10 Years",
    phone: "+91 98765 50006",
    email: "karan.shah@example.com",
    address: "Mumbai, Maharashtra",
    status: "Inactive",
  },
];

const branches = [
  "Pune Branch",
  "Mumbai Branch",
  "Nashik Branch",
  "Nagpur Branch",
  "Main Branch",
];

const specializationOptions = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "Aptitude",
  "Science",
  "Other",
];

export default function TeachersPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isDesktop = width >= 900;

  const [teachers, setTeachers] =
    useState<Teacher[]>(initialTeachers);

  const [search, setSearch] = useState("");

  const [selectedTeacher, setSelectedTeacher] =
    useState<Teacher | null>(null);

  const [showActions, setShowActions] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showBranchList, setShowBranchList] = useState(false);

  const [showSpecializationList, setShowSpecializationList] =
    useState(false);

  // EDIT FIELDS
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editSpecialization, setEditSpecialization] =
    useState("");
  const [editQualification, setEditQualification] =
    useState("");
  const [editExperience, setEditExperience] =
    useState("");
  const [editAddress, setEditAddress] = useState("");

  // FILTER
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] =
    useState<"All" | "Active" | "Inactive">("All");

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesSearch =
        !query ||
        [
          teacher.name,
          teacher.employeeId,
          teacher.branch,
          teacher.specialization,
          teacher.qualification,
          teacher.experience,
          teacher.phone,
          teacher.email,
          teacher.address,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        filterStatus === "All" ||
        teacher.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [search, teachers, filterStatus]);

  const activeTeachers = teachers.filter(
    (teacher) => teacher.status === "Active"
  ).length;

  const inactiveTeachers = teachers.filter(
    (teacher) => teacher.status === "Inactive"
  ).length;

  const openAddTeacher = () => {
    router.push({
      pathname: "/(super_admin)/explore",
      params: {
        feature: "Add Teacher",
      },
    });
  };

  const openTeacherActions = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowActions(true);
  };

  const viewTeacher = () => {
    setShowActions(false);

    if (!selectedTeacher) {
      return;
    }

    Alert.alert(
      selectedTeacher.name,
      `Employee ID: ${selectedTeacher.employeeId}

Email: ${selectedTeacher.email}

Phone: ${selectedTeacher.phone}

Branch: ${selectedTeacher.branch}

Specialization: ${selectedTeacher.specialization || "Not specified"}

Qualification: ${selectedTeacher.qualification}

Experience: ${selectedTeacher.experience}

Address: ${selectedTeacher.address || "Not specified"}

Status: ${selectedTeacher.status}`
    );
  };

  const openEditTeacher = () => {
    if (!selectedTeacher) {
      return;
    }

    setEditName(selectedTeacher.name);
    setEditEmail(selectedTeacher.email);
    setEditPhone(selectedTeacher.phone);
    setEditBranch(selectedTeacher.branch);
    setEditSpecialization(selectedTeacher.specialization);
    setEditQualification(selectedTeacher.qualification);
    setEditExperience(selectedTeacher.experience);
    setEditAddress(selectedTeacher.address);

    setShowActions(false);
    setShowEditModal(true);
  };

  const saveTeacherChanges = () => {
    if (!selectedTeacher) {
      return;
    }

    if (!editName.trim()) {
      Alert.alert(
        "Required",
        "Please enter the teacher name."
      );
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert(
        "Required",
        "Please enter the email address."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (!editPhone.trim()) {
      Alert.alert(
        "Required",
        "Please enter the phone number."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(
      editPhone.replace(/\D/g, "").slice(-10)
    )) {
      Alert.alert(
        "Invalid Mobile",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!editBranch) {
      Alert.alert(
        "Required",
        "Please select a branch."
      );
      return;
    }

    if (!editQualification.trim()) {
      Alert.alert(
        "Required",
        "Please enter the qualification."
      );
      return;
    }

    if (!editExperience.trim()) {
      Alert.alert(
        "Required",
        "Please enter the teaching experience."
      );
      return;
    }

    setTeachers((currentTeachers) =>
      currentTeachers.map((teacher) =>
        teacher.id === selectedTeacher.id
          ? {
              ...teacher,
              name: editName.trim(),
              email: editEmail.trim(),
              phone: editPhone.trim(),
              branch: editBranch,
              specialization:
                editSpecialization.trim(),
              qualification:
                editQualification.trim(),
              experience:
                editExperience.trim(),
              address: editAddress.trim(),
            }
          : teacher
      )
    );

    setSelectedTeacher((current) =>
      current
        ? {
            ...current,
            name: editName.trim(),
            email: editEmail.trim(),
            phone: editPhone.trim(),
            branch: editBranch,
            specialization:
              editSpecialization.trim(),
            qualification:
              editQualification.trim(),
            experience:
              editExperience.trim(),
            address: editAddress.trim(),
          }
        : null
    );

    setShowEditModal(false);

    Alert.alert(
      "Updated",
      "Teacher information has been updated successfully."
    );
  };

  const toggleTeacherStatus = () => {
    if (!selectedTeacher) {
      return;
    }

    const newStatus =
      selectedTeacher.status === "Active"
        ? "Inactive"
        : "Active";

    const teacherName = selectedTeacher.name;

    setTeachers((currentTeachers) =>
      currentTeachers.map((teacher) =>
        teacher.id === selectedTeacher.id
          ? {
              ...teacher,
              status: newStatus,
            }
          : teacher
      )
    );

    setSelectedTeacher((current) =>
      current
        ? {
            ...current,
            status: newStatus,
          }
        : null
    );

    setShowActions(false);

    Alert.alert(
      "Status Updated",
      `${teacherName} is now ${newStatus.toLowerCase()}.`
    );
  };

  const renderTeacher = ({
    item,
  }: {
    item: Teacher;
  }) => {
    return (
      <TouchableOpacity
        style={styles.teacherCard}
        activeOpacity={0.85}
        onPress={() => openTeacherActions(item)}
      >
        {/* AVATAR */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* INFORMATION */}
        <View style={styles.teacherInfo}>
          <Text
            style={styles.teacherName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.teacherId}>
            {item.employeeId}
          </Text>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="office-building-outline"
              size={14}
              color="#8A98A9"
            />

            <Text
              style={styles.detailText}
              numberOfLines={1}
            >
              {item.branch}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="book-open-outline"
              size={14}
              color="#8A98A9"
            />

            <Text
              style={styles.detailText}
              numberOfLines={1}
            >
              {item.specialization ||
                "No specialization"}
            </Text>
          </View>
        </View>

        {/* STATUS */}
        <View
          style={[
            styles.statusBadge,
            item.status === "Active"
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              item.status === "Active"
                ? styles.activeDot
                : styles.inactiveDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              item.status === "Active"
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {item.status}
          </Text>
        </View>

        {/* ACTION */}
        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
          onPress={() => openTeacherActions(item)}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={21}
            color="#7D8B9C"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
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
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            Teachers
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={openAddTeacher}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={20}
            color="#7040D5"
          />

          {isDesktop && (
            <Text style={styles.headerAddText}>
              Add Teacher
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {/* PAGE HEADING */}
        <View style={styles.headingRow}>
          <View style={styles.headingInfo}>
            <Text style={styles.pageTitle}>
              Teacher Management
            </Text>

            <Text style={styles.pageDescription}>
              Manage teacher profiles, branches,
              qualifications and professional information.
            </Text>
          </View>
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryGrid}>
          {/* TOTAL */}
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.purpleBg,
              ]}
            >
              <MaterialCommunityIcons
                name="account-tie-outline"
                size={22}
                color="#7040D5"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Total Teachers
              </Text>

              <Text style={styles.summaryValue}>
                {teachers.length}
              </Text>
            </View>
          </View>

          {/* ACTIVE */}
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.greenBg,
              ]}
            >
              <MaterialCommunityIcons
                name="account-check-outline"
                size={22}
                color="#35B878"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Active Teachers
              </Text>

              <Text style={styles.summaryValue}>
                {activeTeachers}
              </Text>
            </View>
          </View>

          {/* INACTIVE */}
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.orangeBg,
              ]}
            >
              <MaterialCommunityIcons
                name="account-off-outline"
                size={22}
                color="#F7941D"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Inactive
              </Text>

              <Text style={styles.summaryValue}>
                {inactiveTeachers}
              </Text>
            </View>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={21}
            color="#8A98A9"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search teachers..."
            placeholderTextColor="#A3AFBE"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={19}
                color="#9AA8B8"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* LIST HEADER */}
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>
              All Teachers
            </Text>

            <Text style={styles.listCount}>
              {filteredTeachers.length} teachers found
            </Text>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={17}
              color="#7040D5"
            />

            <Text style={styles.filterText}>
              {filterStatus === "All"
                ? "Filter"
                : filterStatus}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TEACHER LIST */}
        <FlatList
          data={filteredTeachers}
          keyExtractor={(item) => item.id}
          renderItem={renderTeacher}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={35}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No teachers found
              </Text>

              <Text style={styles.emptyText}>
                Try changing your search or filter.
              </Text>
            </View>
          }
        />
      </View>

      {/* =====================================================
          TEACHER ACTION MODAL
      ===================================================== */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionSheet}>
            <View style={styles.actionHeader}>
              <View style={styles.actionTeacherAvatar}>
                <Text style={styles.actionTeacherAvatarText}>
                  {selectedTeacher?.name
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.actionTeacherInfo}>
                <Text
                  style={styles.actionTeacherName}
                  numberOfLines={1}
                >
                  {selectedTeacher?.name}
                </Text>

                <Text style={styles.actionTeacherId}>
                  {selectedTeacher?.employeeId}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowActions(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={19}
                  color="#7A8798"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.actionDivider} />

            {/* VIEW */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={viewTeacher}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.actionIcon,
                  styles.blueBg,
                ]}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>
                  View Teacher
                </Text>

                <Text style={styles.actionDescription}>
                  View complete teacher information
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0ADBC"
              />
            </TouchableOpacity>

            {/* EDIT */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={openEditTeacher}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.actionIcon,
                  styles.purpleBg,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-edit-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>
                  Edit Teacher
                </Text>

                <Text style={styles.actionDescription}>
                  Update teacher profile information
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0ADBC"
              />
            </TouchableOpacity>

            {/* STATUS */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={toggleTeacherStatus}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.actionIcon,
                  styles.orangeBg,
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    selectedTeacher?.status === "Active"
                      ? "account-off-outline"
                      : "account-check-outline"
                  }
                  size={21}
                  color="#F7941D"
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>
                  {selectedTeacher?.status === "Active"
                    ? "Deactivate Teacher"
                    : "Activate Teacher"}
                </Text>

                <Text style={styles.actionDescription}>
                  Change the teacher account status
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0ADBC"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          EDIT TEACHER MODAL
      ===================================================== */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.editModalOverlay}>
          <View
            style={[
              styles.editModal,
              isDesktop && styles.editModalDesktop,
            ]}
          >
            {/* HEADER */}
            <View style={styles.editHeader}>
              <View>
                <Text style={styles.editTitle}>
                  Edit Teacher
                </Text>

                <Text style={styles.editSubtitle}>
                  Update teacher information
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editCloseButton}
                onPress={() => setShowEditModal(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.editContent}
            >
              {/* EMPLOYEE ID - READ ONLY */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Employee ID
                </Text>

                <View
                  style={[
                    styles.editInputBox,
                    styles.readOnlyInput,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="card-account-details-outline"
                    size={19}
                    color="#A0A9B7"
                  />

                  <Text style={styles.readOnlyText}>
                    {selectedTeacher?.employeeId}
                  </Text>

                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={16}
                    color="#A0A9B7"
                  />
                </View>

                <Text style={styles.readOnlyHelper}>
                  Employee ID is generated automatically and
                  cannot be changed.
                </Text>
              </View>

              {/* NAME */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Full Name
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.editInput}
                    placeholder="Enter full name"
                    placeholderTextColor="#A3AFBE"
                  />
                </View>
              </View>

              {/* EMAIL */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Email Address
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    style={styles.editInput}
                    placeholder="Enter email"
                    placeholderTextColor="#A3AFBE"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* PHONE */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Mobile Number
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    style={styles.editInput}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#A3AFBE"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* BRANCH */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Branch
                </Text>

                <TouchableOpacity
                  style={styles.editInputBox}
                  onPress={() =>
                    setShowBranchList(!showBranchList)
                  }
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <Text style={styles.editSelectText}>
                    {editBranch || "Select branch"}
                  </Text>

                  <MaterialCommunityIcons
                    name={
                      showBranchList
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={19}
                    color="#8A98A9"
                  />
                </TouchableOpacity>

                {showBranchList && (
                  <View style={styles.branchDropdown}>
                    {branches.map((branch) => (
                      <TouchableOpacity
                        key={branch}
                        style={styles.branchItem}
                        onPress={() => {
                          setEditBranch(branch);
                          setShowBranchList(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.branchText}>
                          {branch}
                        </Text>

                        {editBranch === branch && (
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

              {/* SPECIALIZATION */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Specialization
                </Text>

                <TouchableOpacity
                  style={styles.editInputBox}
                  onPress={() =>
                    setShowSpecializationList(
                      !showSpecializationList
                    )
                  }
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="book-open-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <Text style={styles.editSelectText}>
                    {editSpecialization ||
                      "Select specialization"}
                  </Text>

                  <MaterialCommunityIcons
                    name={
                      showSpecializationList
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={19}
                    color="#8A98A9"
                  />
                </TouchableOpacity>

                {showSpecializationList && (
                  <View style={styles.branchDropdown}>
                    {specializationOptions.map(
                      (specialization) => (
                        <TouchableOpacity
                          key={specialization}
                          style={styles.branchItem}
                          onPress={() => {
                            setEditSpecialization(
                              specialization
                            );
                            setShowSpecializationList(
                              false
                            );
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.branchText}>
                            {specialization}
                          </Text>

                          {editSpecialization ===
                            specialization && (
                            <MaterialCommunityIcons
                              name="check"
                              size={18}
                              color="#7040D5"
                            />
                          )}
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}
              </View>

              {/* QUALIFICATION */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Qualification
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="school-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editQualification}
                    onChangeText={setEditQualification}
                    style={styles.editInput}
                    placeholder="Enter qualification"
                    placeholderTextColor="#A3AFBE"
                  />
                </View>
              </View>

              {/* EXPERIENCE */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Teaching Experience
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editExperience}
                    onChangeText={setEditExperience}
                    style={styles.editInput}
                    placeholder="Enter experience"
                    placeholderTextColor="#A3AFBE"
                  />
                </View>
              </View>

              {/* ADDRESS */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Address
                </Text>

                <View
                  style={[
                    styles.editInputBox,
                    styles.editTextAreaBox,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editAddress}
                    onChangeText={setEditAddress}
                    style={[
                      styles.editInput,
                      styles.editTextArea,
                    ]}
                    placeholder="Enter address"
                    placeholderTextColor="#A3AFBE"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </ScrollView>

            {/* BUTTONS */}
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.editCancelButton}
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.editCancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSaveButton}
                onPress={saveTeacherChanges}
                activeOpacity={0.8}
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

      {/* =====================================================
          FILTER MODAL
      ===================================================== */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowFilterModal(false)
        }
      >
        <View style={styles.filterOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <View>
                <Text style={styles.filterTitle}>
                  Filter Teachers
                </Text>

                <Text style={styles.filterSubtitle}>
                  Filter by account status
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editCloseButton}
                onPress={() =>
                  setShowFilterModal(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {(
              ["All", "Active", "Inactive"] as const
            ).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  filterStatus === status &&
                    styles.filterOptionActive,
                ]}
                onPress={() => {
                  setFilterStatus(status);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterStatus === status &&
                      styles.filterOptionTextActive,
                  ]}
                >
                  {status}
                </Text>

                {filterStatus === status && (
                  <MaterialCommunityIcons
                    name="check"
                    size={19}
                    color="#7040D5"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  /* HEADER */

  header: {
    width: "100%",
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 21,
    lineHeight: 27,
    color: "#FFFFFF",
  },

  headerAddButton: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  headerAddText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#7040D5",
  },

  /* CONTENT */

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  headingRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  headingInfo: {
    flex: 1,
    minWidth: 0,
  },

  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 21,
    lineHeight: 28,
    color: "#172033",
  },

  pageDescription: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    lineHeight: 17,
    color: "#748096",
    marginTop: 2,
  },

  /* SUMMARY */

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    minWidth: 145,
    minHeight: 78,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  summaryInfo: {
    flex: 1,
    minWidth: 0,
  },

  purpleBg: {
    backgroundColor: "#F1EAFF",
  },

  greenBg: {
    backgroundColor: "#E7F8EF",
  },

  blueBg: {
    backgroundColor: "#EAF2FF",
  },

  orangeBg: {
    backgroundColor: "#FFF1E2",
  },

  summaryLabel: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#748096",
  },

  summaryValue: {
    fontFamily: "PoppinsBold",
    fontSize: 17,
    lineHeight: 23,
    color: "#172033",
    marginTop: 1,
  },

  /* SEARCH */

  searchBox: {
    width: "100%",
    height: 49,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E6EC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11.5,
    color: "#172033",
    marginLeft: 8,
    paddingVertical: 0,
  },

  /* LIST HEADER */

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  listTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#172033",
  },

  listCount: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#8A98A9",
    marginTop: 1,
  },

  filterButton: {
    height: 34,
    borderRadius: 9,
    backgroundColor: "#F1EAFF",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  filterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 9.5,
    color: "#7040D5",
  },

  /* TEACHER LIST */

  listContent: {
    paddingBottom: 30,
  },

  teacherCard: {
    width: "100%",
    minHeight: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF0F5",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  avatar: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  avatarText: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    color: "#2675E8",
  },

  teacherInfo: {
    flex: 1,
    minWidth: 0,
  },

  teacherName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12.5,
    color: "#172033",
  },

  teacherId: {
    fontFamily: "PoppinsMedium",
    fontSize: 9,
    color: "#7040D5",
    marginTop: 1,
    marginBottom: 3,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  detailText: {
    flexShrink: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#7A8798",
    marginLeft: 5,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    marginHorizontal: 5,
  },

  activeBadge: {
    backgroundColor: "#E7F8EF",
  },

  inactiveBadge: {
    backgroundColor: "#FFF1E2",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  activeDot: {
    backgroundColor: "#35B878",
  },

  inactiveDot: {
    backgroundColor: "#F7941D",
  },

  statusText: {
    fontFamily: "PoppinsMedium",
    fontSize: 8,
  },

  activeText: {
    color: "#35B878",
  },

  inactiveText: {
    color: "#F7941D",
  },

  moreButton: {
    width: 30,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  /* EMPTY */

  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 21,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#172033",
  },

  emptyText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#8A98A9",
    marginTop: 3,
  },

  /* ACTION MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,18,35,0.48)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "android" ? 12 : 25,
  },

  actionSheet: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
  },

  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },

  actionTeacherAvatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  actionTeacherAvatarText: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    color: "#2675E8",
  },

  actionTeacherInfo: {
    flex: 1,
    minWidth: 0,
  },

  actionTeacherName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#172033",
  },

  actionTeacherId: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#7040D5",
    marginTop: 1,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F5F8",
    alignItems: "center",
    justifyContent: "center",
  },

  actionDivider: {
    height: 1,
    backgroundColor: "#EEF0F5",
    marginVertical: 10,
  },

  actionItem: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  actionTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11.5,
    color: "#172033",
  },

  actionDescription: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#8A98A9",
    marginTop: 2,
  },

  /* EDIT MODAL */

  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,18,35,0.45)",
    justifyContent: "flex-end",
  },

  editModal: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: "#F7F8FC",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
  },

  editModalDesktop: {
    width: 560,
    alignSelf: "center",
    borderRadius: 20,
    marginBottom: 20,
    maxHeight: "90%",
  },

  editHeader: {
    minHeight: 72,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F5",
  },

  editTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 17,
    color: "#172033",
  },

  editSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 9.5,
    color: "#8A98A9",
    marginTop: 1,
  },

  editCloseButton: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
  },

  editContent: {
    padding: 18,
    paddingBottom: 20,
  },

  editField: {
    marginBottom: 14,
  },

  editLabel: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 9.5,
    color: "#445266",
    marginBottom: 6,
  },

  editInputBox: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E6EC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  editInput: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11.5,
    color: "#172033",
    marginLeft: 8,
    paddingVertical: 0,
  },

  editSelectText: {
    flex: 1,
    fontFamily: "PoppinsRegular",
    fontSize: 11.5,
    color: "#172033",
    marginLeft: 8,
  },

  readOnlyInput: {
    backgroundColor: "#F1F3F6",
    borderColor: "#E0E4EA",
  },

  readOnlyText: {
    flex: 1,
    fontFamily: "PoppinsMedium",
    fontSize: 11.5,
    color: "#667085",
    marginLeft: 8,
  },

  readOnlyHelper: {
    fontFamily: "PoppinsRegular",
    fontSize: 8.5,
    color: "#8A98A9",
    marginTop: 5,
    lineHeight: 13,
  },

  editTextAreaBox: {
    minHeight: 85,
    alignItems: "flex-start",
    paddingTop: 12,
  },

  editTextArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },

  branchDropdown: {
    marginTop: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E6EC",
    overflow: "hidden",
    elevation: 4,
  },

  branchItem: {
    minHeight: 43,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },

  branchText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10.5,
    color: "#445266",
  },

  editButtons: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF0F5",
    padding: 14,
    flexDirection: "row",
    gap: 10,
  },

  editCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
  },

  editCancelText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 10.5,
    color: "#66768A",
  },

  editSaveButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#7040D5",
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

  /* FILTER MODAL */

  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,18,35,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  filterModal: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  filterTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    color: "#172033",
  },

  filterSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 9,
    color: "#8A98A9",
    marginTop: 2,
  },

  filterOption: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },

  filterOptionActive: {
    backgroundColor: "#F8F5FF",
  },

  filterOptionText: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#445266",
  },

  filterOptionTextActive: {
    fontFamily: "PoppinsSemiBold",
    color: "#7040D5",
  },
});