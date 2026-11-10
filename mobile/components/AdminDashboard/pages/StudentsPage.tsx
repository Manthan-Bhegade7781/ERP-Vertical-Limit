import React, { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
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
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

/* =========================================================
   TYPES
========================================================= */

type StudentStatus = 'Active' | 'Inactive';

type Student = {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  standard: string;
  batch: string;
  batchId: string;
  branch: string;
  contact: string;
  guardianName: string;
  guardianMobile: string;
  address: string;
  status: StudentStatus;
};

type BatchSubjectItem = {
  id: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  status: 'active' | 'inactive';
};

type StudentSubjectEnrollment = {
  id: string;
  batchSubjectId: string;
  status: 'active' | 'inactive';
};

type ManageSubjectRow = BatchSubjectItem & {
  enrollmentId: string;
  enrollmentStatus: 'active' | 'inactive' | 'not_enrolled';
};

const getObjectId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id || value.id || '');
};

const mapStudentFromApi = (item: any): Student => {
  const user = item?.userId && typeof item.userId === 'object' ? item.userId : {};
  const batch = item?.batchId && typeof item.batchId === 'object' ? item.batchId : {};
  const branch =
    batch?.branchId && typeof batch.branchId === 'object'
      ? batch.branchId
      : user?.branchId && typeof user.branchId === 'object'
        ? user.branchId
        : {};
  return {
    id: String(item?._id || item?.id || ''),
    studentCode: String(item?.studentId || item?.studentCode || ''),
    name: String(user?.fullName || item?.fullName || item?.name || ''),
    email: String(user?.email || item?.email || ''),
    standard: String(batch?.standard || item?.standard || '—'),
    batch: String(batch?.name || batch?.code || item?.batchName || '—'),
    batchId: getObjectId(item?.batchId),
    branch: String(branch?.name || branch?.code || item?.branchName || '—'),
    contact: String(user?.mobileNumber || item?.mobileNumber || item?.contact || ''),
    guardianName: String(item?.guardianName || ''),
    guardianMobile: String(item?.guardianMobile || ''),
    address: String(item?.address || ''),
    status: String(item?.status || user?.status || 'active').toLowerCase() === 'active' ? 'Active' : 'Inactive',
  };
};

/* =========================================================
   PAGE
========================================================= */

export default function StudentsPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [apiError, setApiError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [subjectsVisible, setSubjectsVisible] = useState(false);
  const [subjectRows, setSubjectRows] = useState<ManageSubjectRow[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectError, setSubjectError] = useState('');
  const [subjectActionId, setSubjectActionId] = useState<string | null>(null);

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
  const [editContact, setEditContact] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianMobile, setEditGuardianMobile] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] =
    useState<StudentStatus>('Active');

  const loadStudents = async () => {
    setLoadingStudents(true);
    setApiError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body?.success === false) {
        throw new Error(body?.message || body?.error || 'Unable to load students.');
      }
      const rows = Array.isArray(body?.data?.students) ? body.data.students
        : Array.isArray(body?.data) ? body.data
        : Array.isArray(body?.students) ? body.students
        : Array.isArray(body) ? body : [];
      setStudentsData(rows.map(mapStudentFromApi).filter((student: Student) => student.id));
    } catch (error: any) {
      setApiError(error?.message || 'Unable to load students.');
      setStudentsData([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

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
        student.studentCode.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
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
    setEditContact(student.contact);
    setEditEmail(student.email);
    setEditGuardianName(student.guardianName);
    setEditGuardianMobile(student.guardianMobile);
    setEditAddress(student.address);
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

  const saveEdit = async () => {
    if (!selectedStudent || savingEdit) return;
    if (!editName.trim()) return Alert.alert('Validation', 'Student name is required.');
    if (editContact.trim() && !/^\\d{10}$/.test(editContact.trim())) {
      return Alert.alert('Validation', 'Enter a valid 10-digit mobile number.');
    }
    if (editGuardianMobile.trim() && !/^\\d{10}$/.test(editGuardianMobile.trim())) {
      return Alert.alert('Validation', 'Enter a valid 10-digit guardian mobile number.');
    }
    setSavingEdit(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please log in again.');
      const response = await fetch(`${API_BASE_URL}/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          fullName: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          mobileNumber: editContact.trim(),
          batchId: selectedStudent.batchId || undefined,
          guardianName: editGuardianName.trim(),
          guardianMobile: editGuardianMobile.trim(),
          address: editAddress.trim(),
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body?.success === false) {
        throw new Error(body?.message || body?.error || 'Unable to update student.');
      }
      if (editStatus !== selectedStudent.status) {
        const statusResponse = await fetch(`${API_BASE_URL}/students/${selectedStudent.id}/status`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ status: editStatus.toLowerCase() }),
        });
        const statusBody = await statusResponse.json().catch(() => ({}));
        if (!statusResponse.ok || statusBody?.success === false) {
          throw new Error(statusBody?.message || statusBody?.error || 'Details saved, but status could not be updated.');
        }
      }
      setEditVisible(false);
      setSelectedStudent(null);
      await loadStudents();
      Alert.alert('Success', body?.message || 'Student updated successfully.');
    } catch (error: any) {
      Alert.alert('Update failed', error?.message || 'Unable to update student.');
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleStudentStatus = (student: Student) => {
    const nextStatus: StudentStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    const action = nextStatus === 'Active' ? 'activate' : 'deactivate';
    Alert.alert(`${nextStatus} Student`, `Are you sure you want to ${action} ${student.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: nextStatus === 'Active' ? 'Activate' : 'Deactivate',
        style: nextStatus === 'Inactive' ? 'destructive' : 'default',
        onPress: async () => {
          setUpdatingStatusId(student.id);
          try {
            const token = await getToken();
            if (!token) throw new Error('Your session has expired. Please log in again.');
            const response = await fetch(`${API_BASE_URL}/students/${student.id}/status`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ status: nextStatus.toLowerCase() }),
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok || body?.success === false) throw new Error(body?.message || body?.error || 'Unable to update student status.');
            await loadStudents();
            Alert.alert('Success', `${student.name} is now ${nextStatus.toLowerCase()}.`);
          } catch (error: any) {
            Alert.alert('Status update failed', error?.message || 'Unable to update student status.');
          } finally {
            setUpdatingStatusId(null);
          }
        },
      },
    ]);
  };

  const loadManageSubjects = async (student: Student) => {
    setLoadingSubjects(true);
    setSubjectError('');
    setSubjectRows([]);
    try {
      if (!student.batchId) {
        throw new Error('This student does not have a batch assigned. Assign a batch before managing subjects.');
      }
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please log in again.');
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      const [batchResponse, enrollmentResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/batch-subjects/batch/${student.batchId}`, { headers }),
        fetch(`${API_BASE_URL}/student-subjects/student/${student.id}`, { headers }),
      ]);
      const [batchBody, enrollmentBody] = await Promise.all([
        batchResponse.json().catch(() => ({})),
        enrollmentResponse.json().catch(() => ({})),
      ]);
      if (!batchResponse.ok || batchBody?.success === false) {
        throw new Error(batchBody?.message || 'Unable to load subjects assigned to this batch.');
      }
      if (!enrollmentResponse.ok || enrollmentBody?.success === false) {
        throw new Error(enrollmentBody?.message || "Unable to load this student's subject enrollments.");
      }

      const rawBatchSubjects = Array.isArray(batchBody?.data?.batchSubjects)
        ? batchBody.data.batchSubjects
        : Array.isArray(batchBody?.batchSubjects) ? batchBody.batchSubjects : [];
      const rawEnrollments = Array.isArray(enrollmentBody?.data?.studentSubjects)
        ? enrollmentBody.data.studentSubjects
        : Array.isArray(enrollmentBody?.studentSubjects) ? enrollmentBody.studentSubjects : [];

      const enrollmentByBatchSubject = new Map<string, StudentSubjectEnrollment>();
      rawEnrollments.forEach((enrollment: any) => {
        const batchSubject = enrollment?.batchSubjectId;
        const batchSubjectId = getObjectId(batchSubject);
        if (batchSubjectId) {
          enrollmentByBatchSubject.set(batchSubjectId, {
            id: String(enrollment?._id || enrollment?.id || ''),
            batchSubjectId,
            status: String(enrollment?.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
          });
        }
      });

      const rows: ManageSubjectRow[] = rawBatchSubjects.map((item: any) => {
        const id = String(item?._id || item?.id || '');
        const enrollment = enrollmentByBatchSubject.get(id);
        const subject = item?.subjectId && typeof item.subjectId === 'object' ? item.subjectId : {};
        const teacher = item?.teacherId && typeof item.teacherId === 'object' ? item.teacherId : {};
        return {
          id,
          subjectName: String(subject?.name || 'Unnamed subject'),
          subjectCode: String(subject?.code || ''),
          teacherName: String(teacher?.fullName || teacher?.name || 'Not assigned'),
          status: String(item?.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
          enrollmentId: enrollment?.id || '',
          enrollmentStatus: enrollment ? enrollment.status : 'not_enrolled',
        };
      }).filter((item: ManageSubjectRow) => item.id);
      setSubjectRows(rows);
    } catch (error: any) {
      setSubjectError(error?.message || 'Unable to load subjects.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const openManageSubjects = (student: Student) => {
    setSelectedStudent(student);
    setSubjectsVisible(true);
    void loadManageSubjects(student);
  };

  const closeManageSubjects = () => {
    if (subjectActionId) return;
    setSubjectsVisible(false);
    setSelectedStudent(null);
    setSubjectRows([]);
    setSubjectError('');
  };

  const updateSubjectEnrollment = async (row: ManageSubjectRow, action: 'enroll' | 'remove' | 'reactivate') => {
    if (!selectedStudent || subjectActionId) return;
    if (selectedStudent.status !== 'Active') {
      Alert.alert('Inactive student', 'Activate this student before managing subject enrollments.');
      return;
    }
    if (row.status !== 'active' && action !== 'remove') {
      Alert.alert('Subject unavailable', 'This subject assignment is inactive for the selected batch.');
      return;
    }
    const performAction = async () => {
      setSubjectActionId(row.id);
      try {
        const token = await getToken();
        if (!token) throw new Error('Your session has expired. Please log in again.');
        const isEnroll = action === 'enroll';
        const endpoint = isEnroll
          ? `${API_BASE_URL}/student-subjects`
          : `${API_BASE_URL}/student-subjects/${row.enrollmentId}/status`;
        const response = await fetch(endpoint, {
          method: isEnroll ? 'POST' : 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(isEnroll
            ? { studentId: selectedStudent.id, batchSubjectId: row.id }
            : { status: action === 'remove' ? 'inactive' : 'active' }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body?.success === false) {
          throw new Error(body?.message || body?.error || `Unable to ${action} this subject.`);
        }
        await loadManageSubjects(selectedStudent);
        Alert.alert('Success', action === 'enroll' ? 'Subject enrolled successfully.' : action === 'remove' ? 'Subject removed from the student.' : 'Subject enrollment reactivated.');
      } catch (error: any) {
        Alert.alert('Subject update failed', error?.message || `Unable to ${action} this subject.`);
      } finally {
        setSubjectActionId(null);
      }
    };

    if (action === 'remove') {
      Alert.alert('Remove subject', `Remove ${row.subjectName} from ${selectedStudent.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => { void performAction(); } },
      ]);
    } else {
      void performAction();
    }
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
            {loadingStudents ? (
              <View style={styles.emptyCard}>
                <ActivityIndicator size="large" color="#7040D5" />
                <Text style={styles.emptyText}>Loading students...</Text>
              </View>
            ) : apiError ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#D94376" />
                <Text style={styles.emptyText}>{apiError}</Text>
                <TouchableOpacity style={[styles.actionButton, { marginTop: 12 }]} onPress={loadStudents}>
                  <MaterialCommunityIcons name="refresh" size={15} color="#7040D5" />
                  <Text style={styles.actionText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!loadingStudents && !apiError && filteredStudents.map((student) => (

              <View
                key={student.studentCode || student.id}
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
                      {student.studentCode || student.id}
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

                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.8}
                    onPress={() => openManageSubjects(student)}
                  >
                    <MaterialCommunityIcons name="book-open-variant" size={15} color="#7040D5" />
                    <Text style={styles.actionText}>Subjects</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.8}
                    disabled={updatingStatusId === student.id}
                    onPress={() => toggleStudentStatus(student)}
                  >
                    {updatingStatusId === student.id ? (
                      <ActivityIndicator size="small" color="#7040D5" />
                    ) : (
                      <MaterialCommunityIcons name={student.status === 'Active' ? 'account-off-outline' : 'account-check-outline'} size={15} color="#7040D5" />
                    )}
                    <Text style={styles.actionText}>{student.status === 'Active' ? 'Deactivate' : 'Activate'}</Text>
                  </TouchableOpacity>

                </View>

              </View>

            ))}

            {/* =================================================
                EMPTY
            ================================================== */}

            {!loadingStudents && !apiError && filteredStudents.length === 0 && (

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
                      {selectedStudent.studentCode || selectedStudent.id}
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
                    <Text style={styles.modalLabel}>Contact</Text>
                    <Text style={styles.modalValue}>{selectedStudent.contact || '—'}</Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Batch</Text>
                    <Text style={styles.modalValue}>{selectedStudent.batch}</Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Email</Text>
                    <Text style={styles.modalValue}>{selectedStudent.email || '—'}</Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Guardian</Text>
                    <Text style={styles.modalValue}>{selectedStudent.guardianName || '—'}</Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Guardian Contact</Text>
                    <Text style={styles.modalValue}>{selectedStudent.guardianMobile || '—'}</Text>
                  </View>
                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalLabel}>Address</Text>
                    <Text style={styles.modalValue}>{selectedStudent.address || '—'}</Text>
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

              <Text style={styles.inputLabel}>Standard (read-only)</Text>
              <TextInput
                value={editStandard}
                editable={false}
                style={[styles.modalInput, { color: '#8792A4', backgroundColor: '#F3F4F8' }]}
                placeholder="Standard"
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

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput value={editEmail} onChangeText={setEditEmail} style={styles.modalInput}
                placeholder="Email address" placeholderTextColor="#A0AABB" keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.inputLabel}>Guardian Name</Text>
              <TextInput value={editGuardianName} onChangeText={setEditGuardianName} style={styles.modalInput}
                placeholder="Guardian name" placeholderTextColor="#A0AABB" />

              <Text style={styles.inputLabel}>Guardian Mobile</Text>
              <TextInput value={editGuardianMobile} onChangeText={setEditGuardianMobile} style={styles.modalInput}
                placeholder="10-digit guardian mobile" placeholderTextColor="#A0AABB" keyboardType="phone-pad" />

              <Text style={styles.inputLabel}>Address</Text>
              <TextInput value={editAddress} onChangeText={setEditAddress}
                style={[styles.modalInput, { minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Address" placeholderTextColor="#A0AABB" multiline />

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
                  activeOpacity={0.85}
                  onPress={saveEdit}
                  disabled={savingEdit}
                  style={[styles.modalSaveButton, savingEdit && { opacity: 0.65 }]}
                >
                  {savingEdit ? <ActivityIndicator size="small" color="#FFFFFF" /> :
                    <MaterialCommunityIcons name="check" size={17} color="#FFFFFF" />}
                  <Text style={styles.modalSaveText}>{savingEdit ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =================================================
          MANAGE SUBJECTS MODAL
      ================================================== */}
      <Modal
        visible={subjectsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeManageSubjects}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.modalTitle}>Manage Subjects</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedStudent ? `${selectedStudent.name} • ${selectedStudent.batch}` : 'Student subject enrollment'}
                </Text>
              </View>
              <TouchableOpacity style={styles.modalClose} activeOpacity={0.8} onPress={closeManageSubjects} disabled={!!subjectActionId}>
                <MaterialCommunityIcons name="close" size={20} color="#66768A" />
              </TouchableOpacity>
            </View>

            {loadingSubjects ? (
              <View style={styles.subjectLoading}>
                <ActivityIndicator size="large" color="#7040D5" />
                <Text style={styles.subjectMutedText}>Loading batch subjects...</Text>
              </View>
            ) : subjectError ? (
              <View style={styles.subjectEmpty}>
                <MaterialCommunityIcons name="alert-circle-outline" size={30} color="#D64545" />
                <Text style={styles.subjectErrorText}>{subjectError}</Text>
                <TouchableOpacity style={styles.subjectRetryButton} onPress={() => selectedStudent && void loadManageSubjects(selectedStudent)}>
                  <Text style={styles.subjectRetryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : subjectRows.length === 0 ? (
              <View style={styles.subjectEmpty}>
                <MaterialCommunityIcons name="book-open-page-variant-outline" size={30} color="#A2ADBF" />
                <Text style={styles.subjectEmptyTitle}>No subjects assigned</Text>
                <Text style={styles.subjectMutedText}>There are no subjects assigned to this student's batch yet.</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.subjectList}>
                {subjectRows.map((row) => {
                  const isBusy = subjectActionId === row.id;
                  const enrolled = row.enrollmentStatus === 'active';
                  const inactiveEnrollment = row.enrollmentStatus === 'inactive';
                  const unavailable = row.status !== 'active';
                  return (
                    <View key={row.id} style={styles.subjectCard}>
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectName}>{row.subjectName}</Text>
                        {!!row.subjectCode && <Text style={styles.subjectCode}>{row.subjectCode}</Text>}
                        <Text style={styles.subjectTeacher}>Teacher: {row.teacherName}</Text>
                        <View style={[styles.subjectStatusPill, enrolled ? styles.subjectStatusActive : inactiveEnrollment ? styles.subjectStatusInactive : styles.subjectStatusNeutral]}>
                          <Text style={[styles.subjectStatusText, enrolled ? styles.subjectStatusActiveText : inactiveEnrollment ? styles.subjectStatusInactiveText : styles.subjectStatusNeutralText]}>
                            {enrolled ? 'Enrolled' : inactiveEnrollment ? 'Previously enrolled' : 'Not enrolled'}{unavailable ? ' • Assignment inactive' : ''}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.subjectActionArea}>
                        {isBusy ? <ActivityIndicator size="small" color="#7040D5" /> : enrolled ? (
                          <TouchableOpacity style={styles.subjectRemoveButton} onPress={() => updateSubjectEnrollment(row, 'remove')} activeOpacity={0.8}>
                            <Text style={styles.subjectRemoveText}>Remove</Text>
                          </TouchableOpacity>
                        ) : inactiveEnrollment ? (
                          <TouchableOpacity disabled={unavailable || !!subjectActionId} style={[styles.subjectEnrollButton, (unavailable || !!subjectActionId) && styles.subjectButtonDisabled]} onPress={() => updateSubjectEnrollment(row, 'reactivate')} activeOpacity={0.8}>
                            <Text style={styles.subjectEnrollText}>Reactivate</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity disabled={unavailable || !!subjectActionId} style={[styles.subjectEnrollButton, (unavailable || !!subjectActionId) && styles.subjectButtonDisabled]} onPress={() => updateSubjectEnrollment(row, 'enroll')} activeOpacity={0.8}>
                            <Text style={styles.subjectEnrollText}>Enroll</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <View style={styles.subjectFooter}>
              <Text style={styles.subjectFooterText}>Subjects are loaded from the selected student's batch.</Text>
              <TouchableOpacity style={styles.modalCancelButton} activeOpacity={0.8} onPress={closeManageSubjects} disabled={!!subjectActionId}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
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
    flexWrap: 'wrap',

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
    paddingBottom: 40,
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

  subjectLoading: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  subjectList: {
    paddingTop: 14,
    paddingBottom: 8,
    gap: 10,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFAFF',
    borderWidth: 1,
    borderColor: '#EEE8FC',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#202B3E',
  },
  subjectCode: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#7040D5',
    marginTop: 2,
  },
  subjectTeacher: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#66768A',
    marginTop: 4,
  },
  subjectStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 7,
  },
  subjectStatusActive: { backgroundColor: '#E7F8EF' },
  subjectStatusInactive: { backgroundColor: '#FFF2E5' },
  subjectStatusNeutral: { backgroundColor: '#F0F1F5' },
  subjectStatusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
  },
  subjectStatusActiveText: { color: '#16834A' },
  subjectStatusInactiveText: { color: '#A95D12' },
  subjectStatusNeutralText: { color: '#667085' },
  subjectActionArea: {
    minWidth: 78,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  subjectEnrollButton: {
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7040D5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  subjectEnrollText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  subjectRemoveButton: {
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F7D5D5',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  subjectRemoveText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#C63737',
  },
  subjectButtonDisabled: { opacity: 0.45 },
  subjectEmpty: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  subjectEmptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#202B3E',
    textAlign: 'center',
  },
  subjectMutedText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#7B8498',
    textAlign: 'center',
  },
  subjectErrorText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#C63737',
    textAlign: 'center',
  },
  subjectRetryButton: {
    marginTop: 5,
    backgroundColor: '#7040D5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  subjectRetryText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  subjectFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    paddingTop: 12,
    marginTop: 8,
    gap: 10,
    alignItems: 'flex-end',
  },
  subjectFooterText: {
    alignSelf: 'flex-start',
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#7B8498',
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