import React, { useEffect, useMemo, useState } from 'react';

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView , useSafeAreaInsets} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

/* =========================================================
   TYPES
========================================================= */

type StudentStatus = 'Active' | 'Inactive';

type Student = {
  id: string;
  name: string;
  standard: string;
  batch: string;
  branch: string;
  contact: string;
  status: StudentStatus;
};

/* =========================================================
   DATA
========================================================= */

const initialStudents: Student[] = [
  {
    id: 'STU001',
    name: 'Rahul Sharma',
    standard: '12th',
    batch: 'A',
    branch: 'Pune',
    contact: '9876543210',
    status: 'Active',
  },
  {
    id: 'STU002',
    name: 'Priya Patil',
    standard: '11th',
    batch: 'B',
    branch: 'Pune',
    contact: '9876543211',
    status: 'Active',
  },
  {
    id: 'STU003',
    name: 'Amit Kumar',
    standard: '12th',
    batch: 'A',
    branch: 'Mumbai',
    contact: '9876543212',
    status: 'Inactive',
  },
  {
    id: 'STU004',
    name: 'Sneha Joshi',
    standard: '11th',
    batch: 'C',
    branch: 'Pune',
    contact: '9876543213',
    status: 'Active',
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function StudentsPage() {
  const { width } = useWindowDimensions();
  const insets= useSafeAreaInsets();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [studentsData, setStudentsData] = useState<Student[]>(initialStudents);

  const [search, setSearch] = useState('');

  const [filter, setFilter] = useState<
    'All' | 'Active' | 'Inactive'
  >('All');

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [editName, setEditName] = useState('');
  const [editStandard, setEditStandard] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editStatus, setEditStatus] =
    useState<StudentStatus>('Active');

  /* =======================================================
     ANDROID NAVIGATION BAR
  ====================================================== */

  useEffect(() => {
    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync(
          'transparent',
        );

        await NavigationBar.setButtonStyleAsync('dark');

        await NavigationBar.setPositionAsync('absolute');

        await NavigationBar.setBehaviorAsync(
          'overlay-swipe',
        );
      } catch (error) {
        console.log(
          'Navigation bar configuration error:',
          error,
        );
      }
    };

    configureNavigationBar();
  }, []);

  /* =======================================================
     FILTER
  ====================================================== */

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return studentsData.filter((student) => {
      const matchesSearch =
        !query ||
        student.id.toLowerCase().includes(query) ||
        student.name.toLowerCase().includes(query) ||
        student.standard.toLowerCase().includes(query) ||
        student.batch.toLowerCase().includes(query) ||
        student.branch.toLowerCase().includes(query) ||
        student.contact.includes(query);

      const matchesFilter =
        filter === 'All' ||
        student.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [studentsData, search, filter]);

  /* =======================================================
     ADD STUDENT
  ====================================================== */

  const openAddStudent = () => {
    router.push('/(admin)/add-student' as never);
  };

  /* =======================================================
     VIEW / EDIT
  ====================================================== */

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setViewVisible(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditName(student.name);
    setEditStandard(student.standard);
    setEditBranch(student.branch);
    setEditContact(student.contact);
    setEditStatus(student.status);
    setEditVisible(true);
  };

  const closeView = () => {
    setViewVisible(false);
    setSelectedStudent(null);
  };

  const closeEdit = () => {
    setEditVisible(false);
    setSelectedStudent(null);
  };

  const saveEdit = () => {
    if (!selectedStudent) return;

    const updatedStudent: Student = {
      ...selectedStudent,
      name: editName.trim() || selectedStudent.name,
      standard: editStandard.trim() || selectedStudent.standard,
      branch: editBranch.trim() || selectedStudent.branch,
      contact: editContact.trim() || selectedStudent.contact,
      status: editStatus,
    };

    setStudentsData((current) =>
      current.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student,
      ),
    );

    setSelectedStudent(updatedStudent);
    setEditVisible(false);
  };

  /* =======================================================
     RENDER
  ====================================================== */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right']}
    >
      <StatusBar
        style="light"
        backgroundColor="#6D35D8"
        translucent={false}
      />

      <View style={styles.container}>

        {/* =================================================
            HEADER
        ================================================== */}

        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top+8,
              minHeight: insets.top+66,
            },
            isMobile && styles.headerMobile,
            isTablet && styles.headerTablet,
          ]}
        >

          {/* BACK */}

          <TouchableOpacity
            style={[
              styles.backButton,
              isMobile && styles.backButtonMobile,
            ]}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* LEFT ALIGNED TITLE */}

          <Text
            style={[
              styles.headerTitle,
              isMobile && styles.headerTitleMobile,
            ]}
            numberOfLines={1}
          >
            Students
          </Text>

          {/* PLUS */}

          <TouchableOpacity
            style={[
              styles.addButton,
              isMobile && styles.addButtonMobile,
            ]}
            activeOpacity={0.85}
            onPress={openAddStudent}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color="#7040D5"
            />
          </TouchableOpacity>

        </View>

        {/* =================================================
            CONTENT
        ================================================== */}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            isMobile && styles.contentMobile,
          ]}
          showsVerticalScrollIndicator={false}
        >

          {/* =================================================
              PAGE TITLE
          ================================================== */}

          <View style={styles.pageHeading}>

            <Text
              style={[
                styles.pageTitle,
                isMobile && styles.pageTitleMobile,
              ]}
            >
              Student Management
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage students and enrollment information
            </Text>

          </View>

          {/* =================================================
              SEARCH + FILTER
          ================================================== */}

          <View
            style={[
              styles.searchCard,
              isMobile && styles.searchCardMobile,
            ]}
          >

            {/* SEARCH */}

            <View
              style={[
                styles.searchBox,
                isMobile && styles.searchBoxMobile,
              ]}
            >

              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#8792A4"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search students..."
                placeholderTextColor="#A0AABB"
                style={[
                  styles.searchInput,
                  isMobile && styles.searchInputMobile,
                ]}
                autoCapitalize="none"
                autoCorrect={false}
              />

            </View>

            {/* FILTERS */}

            <View
              style={[
                styles.filterRow,
                isMobile && styles.filterRowMobile,
              ]}
            >

              {(['All', 'Active', 'Inactive'] as const).map(
                (item) => {
                  const selected = filter === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.8}
                      onPress={() => setFilter(item)}
                      style={[
                        styles.filterButton,
                        isMobile &&
                          styles.filterButtonMobile,
                        selected &&
                          styles.filterButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          isMobile &&
                            styles.filterTextMobile,
                          selected &&
                            styles.filterTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}

            </View>

          </View>

          {/* =================================================
              STUDENTS SECTION
          ================================================== */}

          <View style={styles.studentsHeader}>

            <View>

              <Text
                style={[
                  styles.studentsTitle,
                  isMobile && styles.studentsTitleMobile,
                ]}
              >
                Students
              </Text>

              <Text
                style={[
                  styles.studentsCount,
                  isMobile && styles.studentsCountMobile,
                ]}
              >
                {filteredStudents.length} students
              </Text>

            </View>

          </View>

          {/* =================================================
              STUDENT LIST
          ================================================== */}

          <View style={styles.studentList}>

            {filteredStudents.map((student) => (

              <View
                key={student.id}
                style={[
                  styles.studentCard,
                  isMobile && styles.studentCardMobile,
                ]}
              >

                {/* =================================================
                    TOP
                ================================================== */}

                <View style={styles.studentTop}>

                  {/* ICON */}

                  <View
                    style={[
                      styles.studentIcon,
                      isMobile &&
                        styles.studentIconMobile,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={22}
                      color="#7040D5"
                    />
                  </View>

                  {/* NAME */}

                  <View style={styles.studentInfo}>

                    <Text
                      style={[
                        styles.studentName,
                        isMobile &&
                          styles.studentNameMobile,
                      ]}
                      numberOfLines={1}
                    >
                      {student.name}
                    </Text>

                    <Text
                      style={[
                        styles.studentId,
                        isMobile &&
                          styles.studentIdMobile,
                      ]}
                    >
                      {student.id}
                    </Text>

                  </View>

                  {/* STATUS */}

                  <View
                    style={[
                      styles.status,
                      student.status === 'Active'
                        ? styles.activeStatus
                        : styles.inactiveStatus,
                    ]}
                  >

                    <View
                      style={[
                        styles.statusDot,
                        student.status === 'Active'
                          ? styles.activeDot
                          : styles.inactiveDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        student.status === 'Active'
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {student.status}
                    </Text>

                  </View>

                </View>

                {/* =================================================
                    DETAILS
                    (right column nudged further right so the
                    gap between the two columns is medium and
                    even, instead of hugging the left column)
                ================================================== */}

                <View
                  style={[
                    styles.details,
                    isMobile && styles.detailsMobile,
                  ]}
                >

                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>
                      Standard
                    </Text>

                    <Text style={styles.detailValue}>
                      {student.standard}
                    </Text>
                  </View>

                  <View style={[styles.detail, styles.detailRight]}>
                    <Text style={styles.detailLabel}>
                      Status
                    </Text>

                    <Text
                      style={[
                        styles.detailValue,
                        student.status === 'Active'
                          ? styles.detailActiveValue
                          : styles.detailInactiveValue,
                      ]}
                    >
                      {student.status}
                    </Text>
                  </View>

                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>
                      Branch
                    </Text>

                    <Text style={styles.detailValue}>
                      {student.branch}
                    </Text>
                  </View>

                  <View style={[styles.detail, styles.detailRight]}>
                    <Text style={styles.detailLabel}>
                      Contact
                    </Text>

                    <Text style={styles.detailValue}>
                      {student.contact}
                    </Text>
                  </View>

                </View>

                {/* =================================================
                    ACTIONS
                ================================================== */}

                <View style={styles.actions}>

                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.8}
                    onPress={() =>
                      handleView(student)
                    }
                  >
                    <MaterialCommunityIcons
                      name="eye-outline"
                      size={15}
                      color="#7040D5"
                    />

                    <Text style={styles.actionText}>
                      View
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.8}
                    onPress={() =>
                      handleEdit(student)
                    }
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={15}
                      color="#7040D5"
                    />

                    <Text style={styles.actionText}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                </View>

              </View>

            ))}

            {/* =================================================
                EMPTY
            ================================================== */}

            {filteredStudents.length === 0 && (

              <View style={styles.emptyCard}>

                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={32}
                  color="#A2ADBF"
                />

                <Text style={styles.emptyText}>
                  No students found
                </Text>

              </View>

            )}

          </View>

        </ScrollView>

      </View>

      {/* =================================================
          VIEW STUDENT MODAL
      ================================================== */}

      <Modal
        visible={viewVisible}
        transparent
        animationType="fade"
        onRequestClose={closeView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Student Details
                </Text>
                <Text style={styles.modalSubtitle}>
                  Complete student information
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalClose}
                activeOpacity={0.8}
                onPress={closeView}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#66768A"
                />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                <View style={styles.modalProfile}>
                  <View style={styles.modalAvatar}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={30}
                      color="#7040D5"
                    />
                  </View>

                  <View style={styles.modalProfileText}>
                    <Text style={styles.modalStudentName}>
                      {selectedStudent.name}
                    </Text>
                    <Text style={styles.modalStudentId}>
                      {selectedStudent.id}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDetailsGrid}>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>
                      Standard
                    </Text>
                    <Text style={styles.modalValue}>
                      {selectedStudent.standard}
                    </Text>
                  </View>

                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>
                      Status
                    </Text>
                    <Text
                      style={[
                        styles.modalValue,
                        selectedStudent.status === 'Active'
                          ? styles.detailActiveValue
                          : styles.detailInactiveValue,
                      ]}
                    >
                      {selectedStudent.status}
                    </Text>
                  </View>

                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>
                      Branch
                    </Text>
                    <Text style={styles.modalValue}>
                      {selectedStudent.branch}
                    </Text>
                  </View>

                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>
                      Contact
                    </Text>
                    <Text style={styles.modalValue}>
                      {selectedStudent.contact}
                    </Text>
                  </View>
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =================================================
          EDIT STUDENT MODAL
      ================================================== */}

      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Edit Student
                </Text>
                <Text style={styles.modalSubtitle}>
                  Update student information
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalClose}
                activeOpacity={0.8}
                onPress={closeEdit}
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
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.inputLabel}>
                Student Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.modalInput}
                placeholder="Student name"
                placeholderTextColor="#A0AABB"
              />

              <Text style={styles.inputLabel}>
                Standard
              </Text>
              <TextInput
                value={editStandard}
                onChangeText={setEditStandard}
                style={styles.modalInput}
                placeholder="Standard"
                placeholderTextColor="#A0AABB"
              />

              <Text style={styles.inputLabel}>
                Branch
              </Text>
              <TextInput
                value={editBranch}
                onChangeText={setEditBranch}
                style={styles.modalInput}
                placeholder="Branch"
                placeholderTextColor="#A0AABB"
              />

              <Text style={styles.inputLabel}>
                Contact
              </Text>
              <TextInput
                value={editContact}
                onChangeText={setEditContact}
                style={styles.modalInput}
                placeholder="Contact"
                placeholderTextColor="#A0AABB"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>
                Status
              </Text>

              <View style={styles.statusPickerRow}>
                {(['Active', 'Inactive'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    activeOpacity={0.8}
                    onPress={() => setEditStatus(status)}
                    style={[
                      styles.statusPicker,
                      editStatus === status &&
                        styles.statusPickerActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPickerText,
                        editStatus === status &&
                          styles.statusPickerTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  activeOpacity={0.8}
                  onPress={closeEdit}
                >
                  <Text style={styles.modalCancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveButton}
                  activeOpacity={0.85}
                  onPress={saveEdit}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={17}
                    color="#FFFFFF"
                  />
                  <Text style={styles.modalSaveText}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* =======================================================
     SAFE AREA
  ====================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* =======================================================
     MAIN
  ====================================================== */

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  scroll: {
    flex: 1,
  },

  content: {
    width: '100%',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
  },

  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },

  /* =======================================================
     HEADER
  ====================================================== */

  header: {
    width: "100%",

    backgroundColor: '#6D35D8',

    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',

    alignItems: 'center',

  },

  headerMobile: {
    height:80,
    paddingHorizontal: 14,
  },

  headerTablet: {
    height: 64,
    paddingHorizontal: 20,
  },

  backButton: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor:
      'rgba(255,255,255,0.16)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  backButtonMobile: {
    width: 36,
    height: 36,

    borderRadius: 10,

    marginRight: 12,
  },

  headerTitle: {
    flex: 1,

    fontFamily: 'PoppinsSemiBold',

    fontSize: 20,

    lineHeight: 26,

    color: '#FFFFFF',

    textAlign: 'left',
  },

  headerTitleMobile: {
    fontSize: 20,
  },

  addButton: {
    width: 40,
    height: 40,

    borderRadius: 11,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 8,
  },

  addButtonMobile: {
    width: 40,
    height: 40,

    borderRadius: 11,
  },

  /* =======================================================
     PAGE HEADING
  ====================================================== */

  pageHeading: {
    marginBottom: 14,
  },

  pageTitle: {
    fontFamily: 'PoppinsSemiBold',

    fontSize: 20,

    lineHeight: 25,

    color: '#172033',
  },

  pageTitleMobile: {
    fontSize: 20,
    lineHeight: 25,
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    lineHeight: 15,

    color: '#7B8498',

    marginTop: 2,
  },

  /* =======================================================
     SEARCH CARD
  ====================================================== */

  searchCard: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    padding: 12,

    marginBottom: 18,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.05,

    shadowRadius: 4,

    elevation: 2,
  },

  searchCardMobile: {
    borderRadius: 14,

    padding: 12,

    marginBottom: 18,
  },

  searchBox: {
    height: 46,

    borderRadius: 11,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    backgroundColor: '#FCFDFE',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 11,
  },

  searchBoxMobile: {
    height: 46,

    borderRadius: 11,

    paddingHorizontal: 11,
  },

  searchInput: {
    flex: 1,

    fontFamily: 'PoppinsRegular',

    fontSize: 11,

    color: '#202B3E',

    marginLeft: 7,

    paddingVertical: 0,
  },

  searchInputMobile: {
    fontSize: 11,

    marginLeft: 7,
  },

  /* =======================================================
     FILTERS
  ====================================================== */

  filterRow: {
    flexDirection: 'row',

    gap: 7,

    marginTop: 10,
  },

  filterRowMobile: {
    gap: 7,
  },

  filterButton: {
    flex: 1,

    height: 36,

    borderRadius: 9,

    backgroundColor: '#F3F4F8',

    alignItems: 'center',

    justifyContent: 'center',
  },

  filterButtonMobile: {
    height: 36,

    borderRadius: 9,
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',

    fontSize: 10,

    color: '#66768A',
  },

  filterTextMobile: {
    fontSize: 10,
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* =======================================================
     STUDENTS HEADER
  ====================================================== */

  studentsHeader: {
    marginBottom: 9,
  },

  studentsTitle: {
    fontFamily: 'PoppinsSemiBold',

    fontSize: 16,

    lineHeight: 20,

    color: '#172033',
  },

  studentsTitleMobile: {
    fontSize: 16,
  },

  studentsCount: {
    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    color: '#7B8498',

    marginTop: 1,
  },

  studentsCountMobile: {
    fontSize: 10,
  },

  /* =======================================================
     LIST
  ====================================================== */

  studentList: {
    width: '100%',

    gap: 10,
  },

  /* =======================================================
     STUDENT CARD
  ====================================================== */

  studentCard: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    padding: 13,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.05,

    shadowRadius: 4,

    elevation: 2,
  },

  studentCardMobile: {
    borderRadius: 14,

    padding: 13,
  },

  /* =======================================================
     TOP
  ====================================================== */

  studentTop: {
    flexDirection: 'row',

    alignItems: 'center',

    minHeight: 42,
  },

  studentIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  studentIconMobile: {
    width: 42,
    height: 42,

    borderRadius: 12,

    marginRight: 9,
  },

  studentInfo: {
    flex: 1,

    minWidth: 0,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',

    fontSize: 13,

    lineHeight: 18,

    color: '#202B3E',
  },

  studentNameMobile: {
    fontSize: 13,
  },

  studentId: {
    fontFamily: 'PoppinsRegular',

    fontSize: 9,

    color: '#7B8498',

    marginTop: 1,
  },

  studentIdMobile: {
    fontSize: 9,
  },

  /* =======================================================
     STATUS
  ====================================================== */

  status: {
    minWidth: 64,

    height: 26,

    borderRadius: 7,

    paddingHorizontal: 6,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginLeft: 5,
  },

  activeStatus: {
    backgroundColor: '#E7F8EF',
  },

  inactiveStatus: {
    backgroundColor: '#FFE9F0',
  },

  statusDot: {
    width: 6,

    height: 6,

    borderRadius: 3,

    marginRight: 4,
  },

  activeDot: {
    backgroundColor: '#35B878',
  },

  inactiveDot: {
    backgroundColor: '#E95386',
  },

  statusText: {
    fontFamily: 'PoppinsMedium',

    fontSize: 9,
  },

  activeText: {
    color: '#299B65',
  },

  inactiveText: {
    color: '#D94376',
  },

  /* =======================================================
     DETAILS
     (kept the 2-column layout; the right column now gets
     a bigger left inset so it visibly sits further to the
     right, leaving a medium, even gap between the columns
     instead of the two sitting flush against each other)
  ====================================================== */

  details: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    marginTop: 11,

    paddingTop: 10,

    borderTopWidth: 1,

    borderTopColor: '#EEF0F5',
  },

  detailsMobile: {
    marginTop: 11,

    paddingTop: 10,
  },

  detail: {
    width: '50%',

    marginBottom: 8,

    paddingRight: 10,
  },

  detailRight: {
    paddingLeft: 18,
    paddingRight: 0,
  },

  detailLabel: {
    fontFamily: 'PoppinsMedium',

    fontSize: 9,

    color: '#66768A',

    marginBottom: 1,
  },

  detailValue: {
    fontFamily: 'PoppinsRegular',

    fontSize: 11,

    lineHeight: 16,

    color: '#202B3E',
  },

  detailActiveValue: {
    color: '#299B65',
    fontFamily: 'PoppinsSemiBold',
  },

  detailInactiveValue: {
    color: '#D94376',
    fontFamily: 'PoppinsSemiBold',
  },

  /* =======================================================
     ACTIONS
  ====================================================== */

  actions: {
    flexDirection: 'row',

    justifyContent: 'flex-end',

    gap: 6,

    marginTop: 1,

    paddingTop: 9,

    borderTopWidth: 1,

    borderTopColor: '#EEF0F5',
  },

  actionButton: {
    height: 30,

    borderRadius: 8,

    borderWidth: 1,

    borderColor: '#DCCCF8',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 9,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  actionText: {
    fontFamily: 'PoppinsSemiBold',

    fontSize: 9,

    color: '#7040D5',

    marginLeft: 4,
  },

  /* =======================================================
     EMPTY
  ====================================================== */

  emptyCard: {
    width: '100%',

    minHeight: 130,

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#EEF0F5',

    alignItems: 'center',

    justifyContent: 'center',
  },

  emptyText: {
    fontFamily: 'PoppinsMedium',

    fontSize: 11,

    color: '#7B8498',

    marginTop: 7,
  },

  /* =======================================================
     MODALS
  ====================================================== */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 15, 35, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },

  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  modalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#172033',
  },

  modalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#7B8498',
    marginTop: 2,
  },

  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F3F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalScroll: {
    paddingTop: 16,
    paddingBottom: 4,
  },

  modalProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalAvatar: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  modalProfileText: {
    flex: 1,
  },

  modalStudentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#202B3E',
  },

  modalStudentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#7B8498',
    marginTop: 2,
  },

  modalDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  modalDetailBox: {
    width: '48%',
    backgroundColor: '#F9FAFC',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 11,
  },

  modalLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#66768A',
    marginBottom: 3,
  },

  modalValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#202B3E',
  },

  modalStatusRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalStatus: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  modalStatusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
  },

  modalPrimaryButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalPrimaryButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 6,
  },

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#66768A',
    marginBottom: 5,
    marginTop: 9,
  },

  modalInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E8EF',
    backgroundColor: '#FCFDFE',
    paddingHorizontal: 11,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#202B3E',
  },

  statusPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },

  statusPicker: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E1E4EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  statusPickerActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  statusPickerText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#66768A',
  },

  statusPickerTextActive: {
    color: '#FFFFFF',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },

  modalCancelButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCCCF8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCancelText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
  },

  modalSaveButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalSaveText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 5,
  },
});