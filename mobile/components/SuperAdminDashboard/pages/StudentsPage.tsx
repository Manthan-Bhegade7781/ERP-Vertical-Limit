import React, { useCallback, useMemo, useState } from 'react';

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

import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  enrollStudentInSubject,
  fetchBatchSubjectAssignments,
  fetchStudentBatches,
  fetchStudents,
  fetchStudentSubjectEnrollments,
  getReferenceId,
  getReferenceName,
  updateStudent,
  updateStudentStatus,
  updateStudentSubjectEnrollmentStatus,
} from '../../../services/students';
import type {
  StudentApiRecord,
  StudentBatch,
  StudentSubjectEnrollment,
} from '../../../services/students';

/* =========================================================
   TYPES
========================================================= */

type StudentStatus = 'Active' | 'Inactive';

type Student = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  batch: string;
  batchId: string;
  standard: string;
  branch: string;
  guardianName: string;
  guardianMobile: string;
  address: string;
  status: StudentStatus;
};

type MockBatchSubject = {
  id: string;
  name: string;
  teacher: string;
  enrollmentId?: string;
  enrollmentStatus?: EnrollmentStatus;
};

type EnrollmentStatus = 'active' | 'inactive';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const mapApiStudent = (record: StudentApiRecord): Student => {
  const user = record.userId && typeof record.userId === 'object' ? record.userId : undefined;
  const batch = record.batchId && typeof record.batchId === 'object' ? record.batchId : undefined;
  const branchReference = user?.branchId || batch?.branchId;
  const apiStatus = (record.status || user?.status || 'active').toLowerCase();

  return {
    id: record._id || record.id || '',
    studentId: record.studentId || '',
    name: user?.fullName || user?.name || 'Unnamed student',
    email: user?.email || '',
    phone: user?.mobileNumber || '',
    batch: batch?.name || '',
    batchId: getReferenceId(record.batchId),
    standard: batch?.standard || '',
    branch: getReferenceName(branchReference) || '',
    guardianName: record.guardianName || '',
    guardianMobile: record.guardianMobile || '',
    address: record.address || '',
    status: apiStatus === 'inactive' ? 'Inactive' : 'Active',
  };
};

/* Student and batch data are loaded from the backend. */

/* =========================================================
   PAGE
========================================================= */

export default function StudentsPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isDesktop = width >= 900;

  /* -------------------------------------------------------
     STUDENTS
  ------------------------------------------------------- */

  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<StudentBatch[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  const [batchSubjects, setBatchSubjects] = useState<MockBatchSubject[]>([]);

  /* -------------------------------------------------------
     SEARCH / FILTER
  ------------------------------------------------------- */

  const [search, setSearch] = useState('');

  const [filterStatus, setFilterStatus] =
    useState<'All' | StudentStatus>('All');

  const [showFilterModal, setShowFilterModal] =
    useState(false);

  /* -------------------------------------------------------
     SELECTED STUDENT
  ------------------------------------------------------- */

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [showActions, setShowActions] =
    useState(false);


  /* -------------------------------------------------------
     STUDENT SUBJECT ENROLLMENTS
  ------------------------------------------------------- */

  const [showSubjectsModal, setShowSubjectsModal] =
    useState(false);

  const [enrollmentStatuses, setEnrollmentStatuses] = useState<
    Record<string, EnrollmentStatus>
  >({});

  /* -------------------------------------------------------
     VIEW MODAL
  ------------------------------------------------------- */

  const [showViewModal, setShowViewModal] =
    useState(false);

  /* -------------------------------------------------------
     EDIT MODAL
  ------------------------------------------------------- */

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showBatchList, setShowBatchList] =
    useState(false);

  const [editName, setEditName] =
    useState('');

  const [editEmail, setEditEmail] =
    useState('');

  const [editPhone, setEditPhone] =
    useState('');

  const [editBatch, setEditBatch] =
    useState('');

  const [editGuardianName, setEditGuardianName] =
    useState('');

  const [editGuardianMobile, setEditGuardianMobile] =
    useState('');

  const [editAddress, setEditAddress] =
    useState('');

  /* -------------------------------------------------------
     LOAD STUDENTS AND BATCHES FROM BACKEND
  ------------------------------------------------------- */

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadData = async () => {
        setIsLoadingStudents(true);
        try {
          const [studentRows, batchRows] = await Promise.all([
            fetchStudents(),
            fetchStudentBatches(),
          ]);

          if (!mounted) return;

          setStudents(studentRows.map(mapApiStudent));
          setBatches(batchRows.filter((batch) => !batch.isRemoved));
        } catch (error) {
          if (mounted) {
            Alert.alert('Unable to Load Students', getErrorMessage(error));
          }
        } finally {
          if (mounted) setIsLoadingStudents(false);
        }
      };

      void loadData();
      return () => {
        mounted = false;
      };
    }, [])
  );

  /* =======================================================
     FILTERED STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        [
          student.name,
          student.studentId,
          student.email,
          student.phone,
          student.batch,
          student.standard,
          student.branch,
          student.guardianName,
          student.guardianMobile,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        filterStatus === 'All' ||
        student.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [search, students, filterStatus]);

  /* =======================================================
     SUMMARY COUNTS
  ======================================================= */

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === 'Active'
  ).length;

  const inactiveStudents = students.filter(
    (student) => student.status === 'Inactive'
  ).length;

  /* =======================================================
     ADD STUDENT
  ======================================================= */

  const openAddStudent = () => {
    // The route exists in app/(super_admin)/explore.tsx.
    // Some checked-in Expo Router type declarations are stale and omit
    // the (super_admin) route group, so cast only this valid route target.
    router.push({
      pathname: '/(super_admin)/explore',
      params: {
        feature: 'Add Student',
      },
    } as unknown as import('expo-router').Href);
  };

  /* =======================================================
     ACTIONS
  ======================================================= */

  const openStudentActions = (student: Student) => {
    setSelectedStudent(student);
    setShowActions(true);
  };

  /* =======================================================
     MANAGE STUDENT SUBJECTS
  ======================================================= */

  const openManageSubjects = async () => {
    if (!selectedStudent) return;
    if (!selectedStudent.batchId) {
      Alert.alert('Batch Missing', 'This student does not have a valid batch assigned.');
      return;
    }

    setShowActions(false);
    setShowSubjectsModal(true);
    setIsLoadingSubjects(true);
    setBatchSubjects([]);
    setEnrollmentStatuses({});

    try {
      const [assignments, enrollments] = await Promise.all([
        fetchBatchSubjectAssignments(selectedStudent.batchId),
        fetchStudentSubjectEnrollments(selectedStudent.id),
      ]);

      const activeAssignments = assignments.filter(
        (assignment) => assignment.status === 'active' && getReferenceId(assignment.subjectId)
      );

      const mappedSubjects: MockBatchSubject[] = activeAssignments.map((assignment) => {
        const enrollment = enrollments.find(
          (item) => getReferenceId(item.batchSubjectId) === assignment._id
        );
        const subjectRef = assignment.subjectId && typeof assignment.subjectId === 'object'
          ? assignment.subjectId
          : undefined;
        const teacherRef = assignment.teacherId && typeof assignment.teacherId === 'object'
          ? assignment.teacherId
          : undefined;

        return {
          id: assignment._id,
          name: subjectRef?.name || 'Unnamed subject',
          teacher: teacherRef?.fullName || 'Teacher not assigned',
          enrollmentId: enrollment?._id,
          enrollmentStatus: enrollment?.status,
        };
      });

      const statuses: Record<string, EnrollmentStatus> = {};
      mappedSubjects.forEach((subject) => {
        if (subject.enrollmentStatus) {
          statuses[`${selectedStudent.id}:${subject.id}`] = subject.enrollmentStatus;
        }
      });

      setBatchSubjects(mappedSubjects);
      setEnrollmentStatuses(statuses);
    } catch (error) {
      Alert.alert('Unable to Load Subjects', getErrorMessage(error));
      setBatchSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const persistSubjectEnrollment = async (
    subject: MockBatchSubject,
    targetStatus: EnrollmentStatus
  ) => {
    if (!selectedStudent) return;

    const enrollmentKey = `${selectedStudent.id}:${subject.id}`;
    setIsSavingSubject(true);

    try {
      let savedEnrollment: StudentSubjectEnrollment | null = null;

      if (subject.enrollmentId) {
        savedEnrollment = await updateStudentSubjectEnrollmentStatus(
          subject.enrollmentId,
          targetStatus
        );
      } else if (targetStatus === 'active') {
        savedEnrollment = await enrollStudentInSubject(
          selectedStudent.id,
          subject.id
        );
      } else {
        throw new Error('Enrollment record was not found. Refresh the subject list and try again.');
      }

      setBatchSubjects((current) => current.map((item) =>
        item.id === subject.id
          ? {
              ...item,
              enrollmentId: savedEnrollment?._id || item.enrollmentId,
              enrollmentStatus: targetStatus,
            }
          : item
      ));
      setEnrollmentStatuses((current) => ({ ...current, [enrollmentKey]: targetStatus }));

      Alert.alert(
        'Subject Enrollment Updated',
        `${subject.name} is now ${targetStatus === 'active' ? 'enrolled' : 'inactive'} for ${selectedStudent.name}.`
      );
    } catch (error) {
      Alert.alert('Unable to Update Enrollment', getErrorMessage(error));
    } finally {
      setIsSavingSubject(false);
    }
  };

  const toggleSubjectEnrollment = (subject: MockBatchSubject) => {
    if (!selectedStudent || isSavingSubject) return;

    const enrollmentKey = `${selectedStudent.id}:${subject.id}`;
    const currentStatus = enrollmentStatuses[enrollmentKey] || subject.enrollmentStatus;

    if (currentStatus === 'active') {
      Alert.alert(
        'Deactivate Enrollment',
        `Remove ${subject.name} from ${selectedStudent.name}'s enrolled subjects?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Deactivate',
            style: 'destructive',
            onPress: () => { void persistSubjectEnrollment(subject, 'inactive'); },
          },
        ]
      );
      return;
    }

    const isReactivation = currentStatus === 'inactive';
    Alert.alert(
      isReactivation ? 'Reactivate Subject' : 'Enroll in Subject',
      isReactivation
        ? `Reactivate ${subject.name} for ${selectedStudent.name}?`
        : `Enroll ${selectedStudent.name} in ${subject.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isReactivation ? 'Reactivate' : 'Enroll',
          onPress: () => { void persistSubjectEnrollment(subject, 'active'); },
        },
      ]
    );
  };

  /* =======================================================
     VIEW STUDENT
  ======================================================= */

  const viewStudent = () => {
    if (!selectedStudent) {
      return;
    }

    setShowActions(false);
    setShowViewModal(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEditStudent = () => {
    if (!selectedStudent) {
      return;
    }

    setEditName(selectedStudent.name);
    setEditEmail(selectedStudent.email);
    setEditPhone(selectedStudent.phone);
    setEditBatch(selectedStudent.batch);
    setEditGuardianName(selectedStudent.guardianName);
    setEditGuardianMobile(selectedStudent.guardianMobile);
    setEditAddress(selectedStudent.address);

    setShowActions(false);
    setShowEditModal(true);
  };

  /* =======================================================
     SAVE EDIT
  ======================================================= */

  const saveStudentChanges = async () => {
    if (!selectedStudent || isSavingStudent) return;

    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter the student name.');
      return;
    }
    if (!editEmail.trim()) {
      Alert.alert('Required', 'Please enter the email address.');
      return;
    }
    if (!editPhone.trim()) {
      Alert.alert('Required', 'Please enter the mobile number.');
      return;
    }
    if (!editBatch) {
      Alert.alert('Required', 'Please select a batch.');
      return;
    }
    if (editGuardianMobile.trim() && editGuardianMobile.trim().length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid guardian mobile number.');
      return;
    }

    const selectedBatch = batches.find((item) => item.name === editBatch);
    if (!selectedBatch?._id) {
      Alert.alert('Invalid Batch', 'Please select an available batch.');
      return;
    }

    setIsSavingStudent(true);
    try {
      const updatedRecord = await updateStudent(selectedStudent.id, {
        fullName: editName.trim(),
        email: editEmail.trim(),
        mobileNumber: editPhone.trim(),
        batchId: selectedBatch._id,
        guardianName: editGuardianName.trim(),
        guardianMobile: editGuardianMobile.trim(),
        address: editAddress.trim(),
      });

      let updatedStudent = mapApiStudent(updatedRecord);
      setStudents((current) => current.map((item) =>
        item.id === selectedStudent.id ? updatedStudent : item
      ));
      setSelectedStudent(updatedStudent);

      // Refresh populated branch and batch details after the update.
      try {
        const refreshedRows = await fetchStudents();
        const refreshedStudents = refreshedRows.map(mapApiStudent);
        setStudents(refreshedStudents);
        const refreshedStudent = refreshedStudents.find((item) => item.id === selectedStudent.id);
        if (refreshedStudent) {
          updatedStudent = refreshedStudent;
          setSelectedStudent(refreshedStudent);
        }
      } catch {
        // The update already succeeded; keep the response data if refresh fails.
      }

      setShowEditModal(false);
      setShowBatchList(false);
      Alert.alert('Updated', 'Student information has been updated successfully.');
    } catch (error) {
      Alert.alert('Unable to Update Student', getErrorMessage(error));
    } finally {
      setIsSavingStudent(false);
    }
  };

  /* =======================================================
     ACTIVATE / DEACTIVATE
  ======================================================= */

  const toggleStudentStatus = () => {
    if (!selectedStudent) return;

    const nextStatus: StudentStatus =
      selectedStudent.status === 'Active' ? 'Inactive' : 'Active';
    const backendStatus = nextStatus === 'Active' ? 'active' : 'inactive';
    const action = nextStatus === 'Active' ? 'activate' : 'deactivate';
    setShowActions(false);

    Alert.alert(
      `${nextStatus} Student`,
      `Are you sure you want to ${action} ${selectedStudent.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: nextStatus === 'Active' ? 'Activate' : 'Deactivate',
          onPress: () => {
            void (async () => {
              try {
                await updateStudentStatus(selectedStudent.id, backendStatus);
                setStudents((current) => current.map((student) =>
                  student.id === selectedStudent.id
                    ? { ...student, status: nextStatus }
                    : student
                ));
                setSelectedStudent((current) => current
                  ? { ...current, status: nextStatus }
                  : null
                );
                Alert.alert('Updated', `${selectedStudent.name} is now ${nextStatus.toLowerCase()}.`);
              } catch (error) {
                Alert.alert('Unable to Update Status', getErrorMessage(error));
              }
            })();
          },
        },
      ]
    );
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const openFilter = () => {
    setShowFilterModal(true);
  };

  const selectFilter = (
    status: 'All' | StudentStatus
  ) => {
    setFilterStatus(status);
    setShowFilterModal(false);
  };

  /* =======================================================
     RENDER STUDENT
  ======================================================= */

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
        {/* AVATAR */}

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* STUDENT INFO */}

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
              name="account-multiple-outline"
              size={14}
              color="#8A98A9"
            />

            <Text
              style={styles.detailText}
              numberOfLines={1}
            >
              {item.batch}
            </Text>
          </View>

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
              {item.branch} • {item.standard}
            </Text>
          </View>
        </View>

        {/* STATUS */}

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

        {/* MORE */}

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

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <View style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

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

      {/* =================================================
          CONTENT
      ================================================= */}

      <View style={styles.content}>

        {/* PAGE HEADING */}

        <View style={styles.headingRow}>
          <View style={styles.headingInfo}>
            <Text style={styles.pageTitle}>
              Student Management
            </Text>

            <Text style={styles.pageDescription}>
              Manage student profiles, batches,
              guardians and account status.
            </Text>
          </View>
        </View>

        {/* =================================================
            SUMMARY
        ================================================= */}

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
                {totalStudents}
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
                Active Students
              </Text>

              <Text style={styles.summaryValue}>
                {activeStudents}
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
                Inactive Students
              </Text>

              <Text style={styles.summaryValue}>
                {inactiveStudents}
              </Text>
            </View>
          </View>

        </View>

        {/* =================================================
            SEARCH
        ================================================= */}

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

        {/* =================================================
            LIST HEADER
        ================================================= */}

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
            onPress={openFilter}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={17}
              color="#7040D5"
            />

            <Text style={styles.filterText}>
              {filterStatus === 'All'
                ? 'Filter'
                : filterStatus}
            </Text>
          </TouchableOpacity>
        </View>

        {/* =================================================
            STUDENT LIST
        ================================================= */}

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
                {isLoadingStudents ? 'Loading students...' : 'No students found'}
              </Text>

              <Text style={styles.emptyText}>
                {isLoadingStudents
                  ? 'Fetching student records from the server.'
                  : 'Try changing your search or filter.'}
              </Text>
            </View>
          }
        />
      </View>

      {/* =================================================
          ACTION MODAL
      ================================================= */}

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionSheet}>

            {/* ACTION HEADER */}

            <View style={styles.actionHeader}>
              <View style={styles.actionStudentAvatar}>
                <Text style={styles.actionStudentAvatarText}>
                  {selectedStudent?.name
                    .charAt(0)
                    .toUpperCase()}
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
                onPress={() =>
                  setShowActions(false)
                }
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

            {/* EDIT */}

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
                  Edit Student
                </Text>

                <Text style={styles.actionDescription}>
                  Update personal and guardian information
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0ADBC"
              />
            </TouchableOpacity>

            {/* MANAGE SUBJECTS */}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openManageSubjects}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIcon, styles.purpleBg]}>
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Manage Subjects</Text>
                <Text style={styles.actionDescription}>
                  Enroll this student in batch subjects
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
              onPress={toggleStudentStatus}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.actionIcon,
                  selectedStudent?.status === 'Active'
                    ? styles.orangeBg
                    : styles.greenBg,
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    selectedStudent?.status === 'Active'
                      ? 'account-off-outline'
                      : 'account-check-outline'
                  }
                  size={21}
                  color={
                    selectedStudent?.status === 'Active'
                      ? '#F7941D'
                      : '#35B878'
                  }
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text
                  style={[
                    styles.actionTitle,
                    selectedStudent?.status === 'Active'
                      ? styles.deactivateTitle
                      : styles.activateTitle,
                  ]}
                >
                  {selectedStudent?.status === 'Active'
                    ? 'Deactivate Student'
                    : 'Activate Student'}
                </Text>

                <Text style={styles.actionDescription}>
                  {selectedStudent?.status === 'Active'
                    ? 'Temporarily disable this student account'
                    : 'Activate this student account'}
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

      {/* =================================================
           MANAGE STUDENT SUBJECTS MODAL
      ================================================= */}

      <Modal
        visible={showSubjectsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubjectsModal(false)}
      >
        <View style={styles.subjectsModalOverlay}>
          <View
            style={[
              styles.subjectsModal,
              isDesktop && styles.subjectsModalDesktop,
            ]}
          >
            <View style={styles.subjectsHeader}>
              <View style={styles.subjectsHeaderIcon}>
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={23}
                  color="#7040D5"
                />
              </View>
              <View style={styles.subjectsHeaderInfo}>
                <Text style={styles.subjectsTitle}>Manage Subjects</Text>
                <Text style={styles.subjectsSubtitle}>
                  {selectedStudent?.name || 'Student'} • {selectedStudent?.studentId || ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editCloseButton}
                onPress={() => setShowSubjectsModal(false)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.subjectsBatchInfo}>
              <MaterialCommunityIcons name="account-multiple-outline" size={19} color="#7040D5" />
              <View style={styles.subjectsBatchTextWrap}>
                <Text style={styles.subjectsBatchLabel}>Assigned batch</Text>
                <Text style={styles.subjectsBatchName}>
                  {selectedStudent?.batch || 'No batch assigned'}
                </Text>
                <Text style={styles.subjectsBatchMeta}>
                  {selectedStudent?.branch || ''} {selectedStudent?.standard ? `• ${selectedStudent.standard}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.subjectsListHeading}>
              <View>
                <Text style={styles.subjectsListTitle}>Available Batch Subjects</Text>
                <Text style={styles.subjectsListSubtitle}>
                  Enroll only in the subjects this student takes.
                </Text>
              </View>
              <View style={styles.subjectsCountBadge}>
                <Text style={styles.subjectsCountText}>
                  {batchSubjects.filter((subject) =>
                    enrollmentStatuses[`${selectedStudent?.id || ''}:${subject.id}`] === 'active'
                  ).length}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.subjectsScroll}
              contentContainerStyle={styles.subjectsListContent}
              showsVerticalScrollIndicator={false}
            >
              {isLoadingSubjects ? (
                <View style={styles.subjectsEmptyState}>
                  <Text style={styles.subjectsEmptyText}>Loading assigned subjects...</Text>
                </View>
              ) : batchSubjects.length > 0 ? (
                batchSubjects.map((subject) => {
                  const enrollmentKey = `${selectedStudent?.id || ''}:${subject.id}`;
                  const status = enrollmentStatuses[enrollmentKey];
                  const isEnrolled = status === 'active';
                  const isInactive = status === 'inactive';

                  return (
                    <View key={subject.id} style={styles.subjectCard}>
                      <View style={styles.subjectIcon}>
                        <MaterialCommunityIcons
                          name="book-education-outline"
                          size={22}
                          color="#7040D5"
                        />
                      </View>
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectName}>{subject.name}</Text>
                        <View style={styles.subjectTeacherRow}>
                          <MaterialCommunityIcons name="account-outline" size={13} color="#8A98A9" />
                          <Text style={styles.subjectTeacher}>{subject.teacher}</Text>
                        </View>
                        <View style={[
                          styles.subjectStatusBadge,
                          isEnrolled ? styles.subjectEnrolledBadge : isInactive ? styles.subjectInactiveBadge : styles.subjectNotEnrolledBadge,
                        ]}>
                          <View style={[
                            styles.subjectStatusDot,
                            isEnrolled ? styles.subjectEnrolledDot : isInactive ? styles.subjectInactiveDot : styles.subjectNotEnrolledDot,
                          ]} />
                          <Text style={[
                            styles.subjectStatusText,
                            isEnrolled ? styles.subjectEnrolledText : isInactive ? styles.subjectInactiveText : styles.subjectNotEnrolledText,
                          ]}>
                            {isEnrolled ? 'Enrolled' : isInactive ? 'Inactive' : 'Not enrolled'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.subjectActionButton,
                          isEnrolled ? styles.subjectDeactivateButton : styles.subjectEnrollButton,
                        ]}
                        onPress={() => toggleSubjectEnrollment(subject)}
                        activeOpacity={0.8}
                        disabled={isSavingSubject}
                      >
                        <MaterialCommunityIcons
                          name={isEnrolled ? 'minus' : isInactive ? 'refresh' : 'plus'}
                          size={16}
                          color={isEnrolled ? '#D97706' : '#FFFFFF'}
                        />
                        <Text style={[
                          styles.subjectActionText,
                          isEnrolled && styles.subjectDeactivateText,
                        ]}>
                          {isEnrolled ? 'Remove' : isInactive ? 'Reactivate' : 'Enroll'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <View style={styles.subjectsEmptyState}>
                  <MaterialCommunityIcons name="book-off-outline" size={34} color="#9AA8B8" />
                  <Text style={styles.subjectsEmptyTitle}>No subjects available</Text>
                  <Text style={styles.subjectsEmptyText}>
                    No active subject assignments were found for this students batch.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.subjectsFooter}>
              <Text style={styles.subjectsFooterNote}>
                Subject enrollment changes are saved to the server.
              </Text>
              <TouchableOpacity
                style={styles.subjectsDoneButton}
                onPress={() => setShowSubjectsModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.subjectsDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================
          VIEW STUDENT MODAL
      ================================================= */}

      <Modal
        visible={showViewModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowViewModal(false)
        }
      >
        <View style={styles.viewModalOverlay}>
          <View
            style={[
              styles.viewModal,
              isDesktop && styles.viewModalDesktop,
            ]}
          >

            {/* HEADER */}

            <View style={styles.viewHeader}>
              <View>
                <Text style={styles.viewTitle}>
                  Student Details
                </Text>

                <Text style={styles.viewSubtitle}>
                  Complete student information
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editCloseButton}
                onPress={() =>
                  setShowViewModal(false)
                }
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
              contentContainerStyle={styles.viewContent}
            >

              {/* PROFILE */}

              <View style={styles.profileCard}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {selectedStudent?.name
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {selectedStudent?.name}
                  </Text>

                  <Text style={styles.profileId}>
                    {selectedStudent?.studentId}
                  </Text>

                  <View
                    style={[
                      styles.profileStatus,
                      selectedStudent?.status ===
                      'Active'
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        selectedStudent?.status ===
                        'Active'
                          ? styles.activeDot
                          : styles.inactiveDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        selectedStudent?.status ===
                        'Active'
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {selectedStudent?.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* PERSONAL */}

              <Text style={styles.viewSectionTitle}>
                Personal Information
              </Text>

              <View style={styles.infoCard}>

                <InfoRow
                  icon="email-outline"
                  label="Email"
                  value={
                    selectedStudent?.email || '-'
                  }
                />

                <InfoRow
                  icon="phone-outline"
                  label="Mobile"
                  value={
                    selectedStudent?.phone || '-'
                  }
                />

              </View>

              {/* ACADEMIC */}

              <Text style={styles.viewSectionTitle}>
                Academic Information
              </Text>

              <View style={styles.infoCard}>

                <InfoRow
                  icon="account-multiple-outline"
                  label="Batch"
                  value={
                    selectedStudent?.batch || '-'
                  }
                />

                <InfoRow
                  icon="school-outline"
                  label="Standard"
                  value={
                    selectedStudent?.standard || '-'
                  }
                />

                <InfoRow
                  icon="office-building-outline"
                  label="Branch"
                  value={
                    selectedStudent?.branch || '-'
                  }
                />

              </View>

              {/* GUARDIAN */}

              <Text style={styles.viewSectionTitle}>
                Guardian Information
              </Text>

              <View style={styles.infoCard}>

                <InfoRow
                  icon="account-supervisor-outline"
                  label="Guardian Name"
                  value={
                    selectedStudent?.guardianName ||
                    '-'
                  }
                />

                <InfoRow
                  icon="phone-outline"
                  label="Guardian Mobile"
                  value={
                    selectedStudent?.guardianMobile ||
                    '-'
                  }
                />

                <InfoRow
                  icon="map-marker-outline"
                  label="Address"
                  value={
                    selectedStudent?.address || '-'
                  }
                />

              </View>

            </ScrollView>

            {/* CLOSE */}

            <View style={styles.viewButtons}>
              <TouchableOpacity
                style={styles.viewCloseButton}
                onPress={() =>
                  setShowViewModal(false)
                }
                activeOpacity={0.8}
              >
                <Text style={styles.viewCloseText}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* =================================================
          EDIT STUDENT MODAL
      ================================================= */}

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowEditModal(false)
        }
      >
        <View style={styles.editModalOverlay}>

          <View
            style={[
              styles.editModal,
              isDesktop &&
                styles.editModalDesktop,
            ]}
          >

            {/* HEADER */}

            <View style={styles.editHeader}>
              <View>
                <Text style={styles.editTitle}>
                  Edit Student
                </Text>

                <Text style={styles.editSubtitle}>
                  Update student information
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editCloseButton}
                onPress={() =>
                  setShowEditModal(false)
                }
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
              contentContainerStyle={
                styles.editContent
              }
            >

              {/* STUDENT ID */}

              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Student ID
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
                    color="#A0ADBC"
                  />

                  <Text
                    style={styles.readOnlyText}
                  >
                    {selectedStudent?.studentId ||
                      '-'}
                  </Text>

                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={16}
                    color="#A0ADBC"
                  />
                </View>
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
                  />
                </View>
              </View>

              {/* MOBILE */}

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

              {/* BATCH */}

              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Batch
                </Text>

                <TouchableOpacity
                  style={styles.editInputBox}
                  onPress={() =>
                    setShowBatchList(
                      !showBatchList
                    )
                  }
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="account-multiple-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <Text
                    style={[
                      styles.editSelectText,
                      !editBatch &&
                        styles.placeholderText,
                    ]}
                  >
                    {editBatch ||
                      'Select batch'}
                  </Text>

                  <MaterialCommunityIcons
                    name={
                      showBatchList
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={19}
                    color="#8A98A9"
                  />
                </TouchableOpacity>

                {showBatchList && (
                  <View
                    style={styles.batchDropdown}
                  >
                    {batches.map((batch) => (
                      <TouchableOpacity
                        key={batch.name}
                        style={styles.batchItem}
                        onPress={() => {
                          setEditBatch(
                            batch.name
                          );
                          setShowBatchList(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={
                            styles.batchItemInfo
                          }
                        >
                          <Text
                            style={
                              styles.batchText
                            }
                          >
                            {batch.name}
                          </Text>

                          <Text
                            style={
                              styles.batchMeta
                            }
                          >
                            {batch.standard} • {getReferenceName(batch.branchId) || 'Branch not set'}
                          </Text>
                        </View>

                        {editBatch ===
                          batch.name && (
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

              {/* GUARDIAN NAME */}

              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Guardian Name
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="account-supervisor-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editGuardianName}
                    onChangeText={
                      setEditGuardianName
                    }
                    style={styles.editInput}
                    placeholder="Enter guardian name"
                    placeholderTextColor="#A3AFBE"
                  />
                </View>
              </View>

              {/* GUARDIAN MOBILE */}

              <View style={styles.editField}>
                <Text style={styles.editLabel}>
                  Guardian Mobile
                </Text>

                <View style={styles.editInputBox}>
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editGuardianMobile}
                    onChangeText={
                      setEditGuardianMobile
                    }
                    style={styles.editInput}
                    placeholder="Enter guardian mobile"
                    placeholderTextColor="#A3AFBE"
                    keyboardType="phone-pad"
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
                    styles.addressInputBox,
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
                      styles.addressInput,
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
                onPress={() =>
                  setShowEditModal(false)
                }
                activeOpacity={0.8}
              >
                <Text style={styles.editCancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSaveButton}
                onPress={() => { void saveStudentChanges(); }}
                activeOpacity={0.8}
                disabled={isSavingStudent}
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

      {/* =================================================
          FILTER MODAL
      ================================================= */}

      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowFilterModal(false)
        }
      >
        <TouchableOpacity
          style={styles.filterOverlay}
          activeOpacity={1}
          onPress={() =>
            setShowFilterModal(false)
          }
        >
          <View
            style={styles.filterModal}
            onStartShouldSetResponder={() =>
              true
            }
          >

            <View style={styles.filterHeader}>
              <View>
                <Text style={styles.filterTitle}>
                  Filter Students
                </Text>

                <Text
                  style={styles.filterSubtitle}
                >
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

            {/* ALL */}

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() =>
                selectFilter('All')
              }
            >
              <View
                style={[
                  styles.filterOptionIcon,
                  styles.purpleBg,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.filterOptionText}>
                All Students
              </Text>

              {filterStatus === 'All' && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#7040D5"
                />
              )}
            </TouchableOpacity>

            {/* ACTIVE */}

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() =>
                selectFilter('Active')
              }
            >
              <View
                style={[
                  styles.filterOptionIcon,
                  styles.greenBg,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-check-outline"
                  size={20}
                  color="#35B878"
                />
              </View>

              <Text style={styles.filterOptionText}>
                Active Students
              </Text>

              {filterStatus === 'Active' && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#35B878"
                />
              )}
            </TouchableOpacity>

            {/* INACTIVE */}

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() =>
                selectFilter('Inactive')
              }
            >
              <View
                style={[
                  styles.filterOptionIcon,
                  styles.orangeBg,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-off-outline"
                  size={20}
                  color="#F7941D"
                />
              </View>

              <Text style={styles.filterOptionText}>
                Inactive Students
              </Text>

              {filterStatus === 'Inactive' && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#F7941D"
                />
              )}
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color="#7040D5"
        />
      </View>

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* =======================================================
     CONTAINER
  ======================================================= */

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* =======================================================
     HEADER
  ======================================================= */

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

    backgroundColor:
      'rgba(255,255,255,0.15)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

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

  /* =======================================================
     CONTENT
  ======================================================= */

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

  /* =======================================================
     SUMMARY
  ======================================================= */

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

  /* =======================================================
     SEARCH
  ======================================================= */

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

  /* =======================================================
     LIST HEADER
  ======================================================= */

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

  /* =======================================================
     STUDENT LIST
  ======================================================= */

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

  /* =======================================================
     EMPTY
  ======================================================= */

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

  /* =======================================================
     ACTION MODAL
  ======================================================= */

  modalOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(10,18,35,0.48)',

    justifyContent: 'flex-end',

    paddingHorizontal: 12,
    paddingBottom:
      Platform.OS === 'android'
        ? 12
        : 25,
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

  activateTitle: {
    color: '#35B878',
  },

  deactivateTitle: {
    color: '#F7941D',
  },

  /* =======================================================
     VIEW MODAL
  ======================================================= */

  viewModalOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(10,18,35,0.45)',

    justifyContent: 'flex-end',
  },

  viewModal: {
    width: '100%',
    maxHeight: '92%',

    backgroundColor: '#F7F8FC',

    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    overflow: 'hidden',
  },

  viewModalDesktop: {
    width: 560,

    alignSelf: 'center',

    borderRadius: 20,

    marginBottom: 20,

    maxHeight: '90%',
  },

  viewHeader: {
    minHeight: 72,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  viewTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,

    color: '#172033',
  },

  viewSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,

    color: '#8A98A9',

    marginTop: 1,
  },

  viewContent: {
    padding: 18,
    paddingBottom: 25,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 15,

    borderWidth: 1,
    borderColor: '#EEF0F5',

    padding: 14,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 18,
  },

  profileAvatar: {
    width: 58,
    height: 58,

    borderRadius: 17,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  profileAvatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,

    color: '#7040D5',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,

    color: '#172033',
  },

  profileId: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,

    color: '#7040D5',

    marginTop: 2,
    marginBottom: 6,
  },

  profileStatus: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 7,
  },

  viewSectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,

    color: '#445266',

    marginBottom: 8,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,
    borderColor: '#EEF0F5',

    paddingHorizontal: 13,

    marginBottom: 16,
  },

  infoRow: {
    minHeight: 61,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  infoIcon: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,

    color: '#8A98A9',

    marginBottom: 2,
  },

  infoValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,

    color: '#172033',
  },

  viewButtons: {
    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',

    padding: 14,
  },

  viewCloseButton: {
    height: 48,

    borderRadius: 12,

    backgroundColor: '#F1F3F6',

    alignItems: 'center',
    justifyContent: 'center',
  },

  viewCloseText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,

    color: '#66768A',
  },

  /* =======================================================
     EDIT MODAL
  ======================================================= */

  editModalOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(10,18,35,0.45)',

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

  readOnlyInput: {
    backgroundColor: '#F3F5F8',
  },

  readOnlyText: {
    flex: 1,

    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,

    color: '#7A8798',

    marginLeft: 8,
  },

  editSelectText: {
    flex: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,

    color: '#172033',

    marginLeft: 8,
  },

  placeholderText: {
    color: '#A3AFBE',
  },

  addressInputBox: {
    minHeight: 85,

    alignItems: 'flex-start',

    paddingTop: 13,
  },

  addressInput: {
    minHeight: 65,
  },

  batchDropdown: {
    marginTop: 5,

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#E2E6EC',

    overflow: 'hidden',

    elevation: 4,
  },

  batchItem: {
    minHeight: 55,

    paddingHorizontal: 13,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  batchItemInfo: {
    flex: 1,
  },

  batchText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,

    color: '#445266',
  },

  batchMeta: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,

    color: '#8A98A9',

    marginTop: 2,
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

  /* =======================================================
     MANAGE SUBJECTS MODAL
  ======================================================= */

  subjectsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,18,35,0.48)',
    justifyContent: 'flex-end',
  },
  subjectsModal: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#F7F8FC',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  subjectsModalDesktop: {
    width: 620,
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 20,
    maxHeight: '90%',
  },
  subjectsHeader: {
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  subjectsHeaderIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  subjectsHeaderInfo: { flex: 1, minWidth: 0 },
  subjectsTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#172033',
  },
  subjectsSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#8A98A9',
    marginTop: 2,
  },
  subjectsBatchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EAFF',
    marginHorizontal: 16,
    marginTop: 15,
    padding: 12,
    borderRadius: 13,
  },
  subjectsBatchTextWrap: { flex: 1, marginLeft: 10 },
  subjectsBatchLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#7A8798',
  },
  subjectsBatchName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
    color: '#38206F',
    marginTop: 1,
  },
  subjectsBatchMeta: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#7A8798',
    marginTop: 1,
  },
  subjectsListHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 10,
  },
  subjectsListTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },
  subjectsListSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A98A9',
    marginTop: 2,
  },
  subjectsCountBadge: {
    minWidth: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  subjectsCountText: {
    fontFamily: 'PoppinsBold',
    fontSize: 11,
    color: '#25965D',
  },
  subjectsScroll: { flexShrink: 1 },
  subjectsListContent: { paddingHorizontal: 16, paddingBottom: 12 },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 14,
    padding: 11,
    marginBottom: 9,
  },
  subjectIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subjectInfo: { flex: 1, minWidth: 0 },
  subjectName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
    color: '#172033',
  },
  subjectTeacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  subjectTeacher: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A98A9',
    marginLeft: 4,
  },
  subjectStatusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
  },
  subjectStatusDot: { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  subjectEnrolledBadge: { backgroundColor: '#E7F8EF' },
  subjectInactiveBadge: { backgroundColor: '#FFF1E2' },
  subjectNotEnrolledBadge: { backgroundColor: '#F1F3F6' },
  subjectEnrolledDot: { backgroundColor: '#35B878' },
  subjectInactiveDot: { backgroundColor: '#F7941D' },
  subjectNotEnrolledDot: { backgroundColor: '#9AA8B8' },
  subjectStatusText: { fontFamily: 'PoppinsMedium', fontSize: 7.5 },
  subjectEnrolledText: { color: '#25965D' },
  subjectInactiveText: { color: '#B96A0A' },
  subjectNotEnrolledText: { color: '#7A8798' },
  subjectActionButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    paddingHorizontal: 9,
    marginLeft: 8,
  },
  subjectEnrollButton: { backgroundColor: '#7040D5' },
  subjectDeactivateButton: { backgroundColor: '#FFF1E2' },
  subjectActionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#FFFFFF',
    marginLeft: 3,
  },
  subjectDeactivateText: { color: '#B96A0A' },
  subjectsEmptyState: { alignItems: 'center', paddingVertical: 35, paddingHorizontal: 20 },
  subjectsEmptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#445266',
    marginTop: 9,
  },
  subjectsEmptyText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A98A9',
    textAlign: 'center',
    marginTop: 4,
  },
  subjectsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subjectsFooterNote: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A98A9',
    marginRight: 8,
  },
  subjectsDoneButton: {
    minWidth: 82,
    height: 39,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  subjectsDoneText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },

  /* =======================================================
     FILTER MODAL
  ======================================================= */

  filterOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(10,18,35,0.45)',

    justifyContent: 'flex-end',

    paddingHorizontal: 12,
    paddingBottom:
      Platform.OS === 'android'
        ? 12
        : 25,
  },

  filterModal: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    paddingHorizontal: 15,
    paddingTop: 15,
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

  filterHeader: {
    minHeight: 55,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',

    marginBottom: 5,
  },

  filterTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,

    color: '#172033',
  },

  filterSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,

    color: '#8A98A9',

    marginTop: 2,
  },

  filterOption: {
    minHeight: 64,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  filterOptionIcon: {
    width: 40,
    height: 40,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 11,
  },

  filterOptionText: {
    flex: 1,

    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,

    color: '#172033',
  },

});