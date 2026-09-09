import React, { useMemo, useState } from 'react';

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
} from 'react-native';

import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Student = {
  id: string;
  name: string;
  studentId: string;
  branch: string;
  course: string;
  batch: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
};

const initialStudents: Student[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    studentId: 'VLCC-PUN-001',
    branch: 'Pune Branch',
    course: 'Professional Makeup',
    batch: 'Morning Batch',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Priya Patil',
    studentId: 'VLCC-PUN-002',
    branch: 'Pune Branch',
    course: 'Beauty Therapy',
    batch: 'Evening Batch',
    phone: '+91 98765 43211',
    email: 'priya.patil@example.com',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Sneha Kulkarni',
    studentId: 'VLCC-MUM-003',
    branch: 'Mumbai Branch',
    course: 'Hair Dressing',
    batch: 'Morning Batch',
    phone: '+91 98765 43212',
    email: 'sneha.kulkarni@example.com',
    status: 'Active',
  },
  {
    id: '4',
    name: 'Amit Joshi',
    studentId: 'VLCC-NAS-004',
    branch: 'Nashik Branch',
    course: 'Skin Care',
    batch: 'Afternoon Batch',
    phone: '+91 98765 43213',
    email: 'amit.joshi@example.com',
    status: 'Inactive',
  },
  {
    id: '5',
    name: 'Neha Deshmukh',
    studentId: 'VLCC-NGP-005',
    branch: 'Nagpur Branch',
    course: 'Professional Makeup',
    batch: 'Evening Batch',
    phone: '+91 98765 43214',
    email: 'neha.deshmukh@example.com',
    status: 'Active',
  },
];

const branches = [
  'Pune Branch',
  'Mumbai Branch',
  'Nashik Branch',
  'Nagpur Branch',
  'Main Branch',
];

export default function StudentsPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isDesktop = width >= 900;

  const [students, setStudents] =
    useState<Student[]>(initialStudents);

  const [search, setSearch] = useState('');

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [showActions, setShowActions] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showBranchList, setShowBranchList] =
    useState(false);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editBatch, setEditBatch] = useState('');

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) =>
      [
        student.name,
        student.studentId,
        student.branch,
        student.course,
        student.batch,
        student.phone,
        student.email,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search, students]);

  const activeStudents = students.filter(
    (student) => student.status === 'Active'
  ).length;

  const inactiveStudents = students.filter(
    (student) => student.status === 'Inactive'
  ).length;

  const openAddStudent = () => {
    router.push({
      pathname: '/(tabs)/explore',
      params: {
        feature: 'Add Student',
      },
    });
  };

  const openStudentActions = (student: Student) => {
    setSelectedStudent(student);
    setShowActions(true);
  };

  const openEditStudent = () => {
    if (!selectedStudent) {
      return;
    }

    setEditName(selectedStudent.name);
    setEditEmail(selectedStudent.email);
    setEditPhone(selectedStudent.phone);
    setEditBranch(selectedStudent.branch);
    setEditCourse(selectedStudent.course);
    setEditBatch(selectedStudent.batch);

    setShowActions(false);
    setShowEditModal(true);
  };

  const saveStudentChanges = () => {
    if (!selectedStudent) {
      return;
    }

    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter the student name.');
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert('Required', 'Please enter the email address.');
      return;
    }

    if (!editPhone.trim()) {
      Alert.alert('Required', 'Please enter the phone number.');
      return;
    }

    if (!editBranch) {
      Alert.alert('Required', 'Please select a branch.');
      return;
    }

    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              name: editName.trim(),
              email: editEmail.trim(),
              phone: editPhone.trim(),
              branch: editBranch,
              course: editCourse.trim(),
              batch: editBatch.trim(),
            }
          : student
      )
    );

    setSelectedStudent((current) =>
      current
        ? {
            ...current,
            name: editName.trim(),
            email: editEmail.trim(),
            phone: editPhone.trim(),
            branch: editBranch,
            course: editCourse.trim(),
            batch: editBatch.trim(),
          }
        : null
    );

    setShowEditModal(false);

    Alert.alert(
      'Updated',
      'Student information has been updated successfully.'
    );
  };

  const deleteStudent = () => {
    if (!selectedStudent) {
      return;
    }

    const studentId = selectedStudent.id;
    const studentName = selectedStudent.name;

    setShowActions(false);

    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${studentName}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setStudents((currentStudents) =>
              currentStudents.filter(
                (student) => student.id !== studentId
              )
            );

            setSelectedStudent(null);

            Alert.alert(
              'Deleted',
              `${studentName} has been deleted successfully.`
            );
          },
        },
      ]
    );
  };

  const viewStudent = () => {
    setShowActions(false);

    if (!selectedStudent) {
      return;
    }

    Alert.alert(
      selectedStudent.name,
      `Student ID: ${selectedStudent.studentId}\n\nEmail: ${selectedStudent.email}\nPhone: ${selectedStudent.phone}\nBranch: ${selectedStudent.branch}\nCourse: ${selectedStudent.course}\nBatch: ${selectedStudent.batch}`
    );
  };

  const renderStudent = ({
    item,
  }: {
    item: Student;
  }) => {
    return (
      <TouchableOpacity
        style={styles.studentCard}
        activeOpacity={0.85}
        onPress={() => openStudentActions(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0)}
          </Text>
        </View>

        <View style={styles.studentInfo}>
          <Text
            style={styles.studentName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.studentId}>
            {item.studentId}
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
              {item.course}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.status === 'Active'
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              item.status === 'Active'
                ? styles.activeDot
                : styles.inactiveDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              item.status === 'Active'
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {item.status}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
          onPress={() => openStudentActions(item)}
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
            Students
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={openAddStudent}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={20}
            color="#7040D5"
          />

          {isDesktop && (
            <Text style={styles.headerAddText}>
              Add Student
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
              Student Management
            </Text>

            <Text style={styles.pageDescription}>
              Manage student profiles, personal information,
              courses, batches and branches.
            </Text>
          </View>

        </View>

        {/* SUMMARY */}

        <View style={styles.summaryGrid}>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.purpleBg,
              ]}
            >
              <MaterialCommunityIcons
                name="account-group-outline"
                size={22}
                color="#7040D5"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Total Students
              </Text>

              <Text style={styles.summaryValue}>
                2,568
              </Text>
            </View>
          </View>

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
                Active Students
              </Text>

              <Text style={styles.summaryValue}>
                {activeStudents}
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.blueBg,
              ]}
            >
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={22}
                color="#2675E8"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                New Students
              </Text>

              <Text style={styles.summaryValue}>
                147
              </Text>
            </View>
          </View>

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
                {inactiveStudents}
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
            placeholder="Search students..."
            placeholderTextColor="#A3AFBE"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
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

        {/* ALL STUDENTS */}

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>
              All Students
            </Text>

            <Text style={styles.listCount}>
              {filteredStudents.length} students found
            </Text>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={17}
              color="#7040D5"
            />

            <Text style={styles.filterText}>
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
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
                No students found
              </Text>

              <Text style={styles.emptyText}>
                Try changing your search.
              </Text>
            </View>
          }
        />
      </View>

      {/* ACTION MODAL */}

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionSheet}>

            <View style={styles.actionHeader}>
              <View style={styles.actionStudentAvatar}>
                <Text style={styles.actionStudentAvatarText}>
                  {selectedStudent?.name.charAt(0)}
                </Text>
              </View>

              <View style={styles.actionStudentInfo}>
                <Text
                  style={styles.actionStudentName}
                  numberOfLines={1}
                >
                  {selectedStudent?.name}
                </Text>

                <Text style={styles.actionStudentId}>
                  {selectedStudent?.studentId}
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

            <TouchableOpacity
              style={styles.actionItem}
              onPress={viewStudent}
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
                  View Student
                </Text>

                <Text style={styles.actionDescription}>
                  View complete student information
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0ADBC"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openEditStudent}
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
                  Edit Personal Information
                </Text>

                <Text style={styles.actionDescription}>
                  Update name, email, phone and details
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0ADBC"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionItem,
                styles.deleteAction,
              ]}
              onPress={deleteStudent}
              activeOpacity={0.75}
            >
              <View style={styles.deleteIcon}>
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={21}
                  color="#E95368"
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text
                  style={[
                    styles.actionTitle,
                    styles.deleteTitle,
                  ]}
                >
                  Delete Student
                </Text>

                <Text style={styles.actionDescription}>
                  Permanently remove this student
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#E95368"
              />
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}

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

            <View style={styles.editHeader}>
              <View>
                <Text style={styles.editTitle}>
                  Edit Student
                </Text>

                <Text style={styles.editSubtitle}>
                  Personal Information
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
                  />
                </View>
              </View>

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
                  />
                </View>
              </View>

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
                    {editBranch || 'Select branch'}
                  </Text>

                  <MaterialCommunityIcons
                    name={
                      showBranchList
                        ? 'chevron-up'
                        : 'chevron-down'
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

              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Course
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="book-open-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editCourse}
                    onChangeText={setEditCourse}
                    style={styles.editInput}
                    placeholder="Enter course"
                    placeholderTextColor="#A3AFBE"
                  />
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Batch
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="account-multiple-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editBatch}
                    onChangeText={setEditBatch}
                    style={styles.editInput}
                    placeholder="Enter batch"
                    placeholderTextColor="#A3AFBE"
                  />
                </View>
              </View>

            </ScrollView>

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
                onPress={saveStudentChanges}
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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* HEADER */

  header: {
    width: '100%',
    backgroundColor: '#7040D5',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.15)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  /*
   * IMPORTANT:
   * Only "Students" stays in the purple header.
   * "Student Management" is shown below.
   */

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 21,
    lineHeight: 27,
    color: '#FFFFFF',
  },

  headerAddButton: {
    minHeight: 42,

    borderRadius: 12,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 11,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,
  },

  headerAddText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#7040D5',
  },

  /* CONTENT */

  content: {
    flex: 1,

    paddingHorizontal: 18,
    paddingTop: 18,
  },

  headingRow: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 16,
  },

  headingInfo: {
    flex: 1,
    minWidth: 0,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    lineHeight: 28,

    color: '#172033',
  },

  pageDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    lineHeight: 17,

    color: '#748096',

    marginTop: 2,
  },

  /* SUMMARY */

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 10,

    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    minWidth: 145,

    minHeight: 78,

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,
    borderColor: '#EEF0F5',

    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000000',
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

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  summaryInfo: {
    flex: 1,
    minWidth: 0,
  },

  purpleBg: {
    backgroundColor: '#F1EAFF',
  },

  greenBg: {
    backgroundColor: '#E7F8EF',
  },

  blueBg: {
    backgroundColor: '#EAF2FF',
  },

  orangeBg: {
    backgroundColor: '#FFF1E2',
  },

  summaryLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,

    color: '#748096',
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    lineHeight: 23,

    color: '#172033',

    marginTop: 1,
  },

  /* SEARCH */

  searchBox: {
    width: '100%',
    height: 49,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#E2E6EC',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 13,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 15,
  },

  searchInput: {
    flex: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,

    color: '#172033',

    marginLeft: 8,

    paddingVertical: 0,
  },

  /* LIST HEADER */

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 10,
  },

  listTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,

    color: '#172033',
  },

  listCount: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,

    color: '#8A98A9',

    marginTop: 1,
  },

  filterButton: {
    height: 34,

    borderRadius: 9,

    backgroundColor: '#F1EAFF',

    paddingHorizontal: 10,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,

    color: '#7040D5',
  },

  /* STUDENT LIST */

  listContent: {
    paddingBottom: 30,
  },

  studentCard: {
    width: '100%',
    minHeight: 100,

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,
    borderColor: '#EEF0F5',

    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 9,

    shadowColor: '#000000',
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

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 11,
  },

  avatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,

    color: '#7040D5',
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,

    color: '#172033',
  },

  studentId: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,

    color: '#7040D5',

    marginTop: 1,
    marginBottom: 3,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 2,
  },

  detailText: {
    flexShrink: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,

    color: '#7A8798',

    marginLeft: 5,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 7,
    paddingVertical: 5,

    borderRadius: 7,

    marginHorizontal: 5,
  },

  activeBadge: {
    backgroundColor: '#E7F8EF',
  },

  inactiveBadge: {
    backgroundColor: '#FFF1E2',
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
    backgroundColor: '#F7941D',
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
  },

  activeText: {
    color: '#35B878',
  },

  inactiveText: {
    color: '#F7941D',
  },

  moreButton: {
    width: 30,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* EMPTY */

  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },

  emptyIcon: {
    width: 72,
    height: 72,

    borderRadius: 21,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,

    color: '#172033',
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,

    color: '#8A98A9',

    marginTop: 3,
  },

  /* ACTION MODAL */

  modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(10,18,35,0.48)',

    justifyContent: 'flex-end',

    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'android' ? 12 : 25,
  },

  actionSheet: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 10,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 10,
  },

  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 5,
  },

  actionStudentAvatar: {
    width: 45,
    height: 45,

    borderRadius: 14,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  actionStudentAvatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,

    color: '#7040D5',
  },

  actionStudentInfo: {
    flex: 1,
    minWidth: 0,
  },

  actionStudentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,

    color: '#172033',
  },

  actionStudentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,

    color: '#7040D5',

    marginTop: 1,
  },

  closeButton: {
    width: 34,
    height: 34,

    borderRadius: 10,

    backgroundColor: '#F3F5F8',

    alignItems: 'center',
    justifyContent: 'center',
  },

  actionDivider: {
    height: 1,

    backgroundColor: '#EEF0F5',

    marginVertical: 10,
  },

  actionItem: {
    minHeight: 68,

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 7,
  },

  actionIcon: {
    width: 43,
    height: 43,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  actionTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,

    color: '#172033',
  },

  actionDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,

    color: '#8A98A9',

    marginTop: 2,
  },

  deleteAction: {
    marginTop: 3,

    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',

    paddingTop: 10,
  },

  deleteIcon: {
    width: 43,
    height: 43,

    borderRadius: 12,

    backgroundColor: '#FFF0F1',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  deleteTitle: {
    color: '#E95368',
  },

  /* EDIT MODAL */

  editModalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(10,18,35,0.45)',

    justifyContent: 'flex-end',
  },

  editModal: {
    width: '100%',
    maxHeight: '92%',

    backgroundColor: '#F7F8FC',

    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    overflow: 'hidden',
  },

  editModalDesktop: {
    width: 560,

    alignSelf: 'center',

    borderRadius: 20,

    marginBottom: 20,

    maxHeight: '90%',
  },

  editHeader: {
    minHeight: 72,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  editTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,

    color: '#172033',
  },

  editSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,

    color: '#8A98A9',

    marginTop: 1,
  },

  editCloseButton: {
    width: 37,
    height: 37,

    borderRadius: 11,

    backgroundColor: '#F1F3F6',

    alignItems: 'center',
    justifyContent: 'center',
  },

  editContent: {
    padding: 18,
    paddingBottom: 20,
  },

  editField: {
    marginBottom: 14,
  },

  editLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,

    color: '#445266',

    marginBottom: 6,
  },

  editInputBox: {
    minHeight: 48,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#E2E6EC',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',
  },

  editInput: {
    flex: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,

    color: '#172033',

    marginLeft: 8,

    paddingVertical: 0,
  },

  editSelectText: {
    flex: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,

    color: '#172033',

    marginLeft: 8,
  },

  branchDropdown: {
    marginTop: 5,

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#E2E6EC',

    overflow: 'hidden',

    elevation: 4,
  },

  branchItem: {
    minHeight: 43,

    paddingHorizontal: 13,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  branchText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,

    color: '#445266',
  },

  editButtons: {
    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',

    padding: 14,

    flexDirection: 'row',

    gap: 10,
  },

  editCancelButton: {
    flex: 1,

    height: 48,

    borderRadius: 12,

    backgroundColor: '#F1F3F6',

    alignItems: 'center',
    justifyContent: 'center',
  },

  editCancelText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,

    color: '#66768A',
  },

  editSaveButton: {
    flex: 1.5,

    height: 48,

    borderRadius: 12,

    backgroundColor: '#7040D5',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,
  },

  editSaveText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,

    color: '#FFFFFF',
  },
});