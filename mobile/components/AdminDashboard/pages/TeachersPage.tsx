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

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';

import * as NavigationBar from 'expo-navigation-bar';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';



/* =========================================================

   TYPES

\========================================================= */



type TeacherStatus = 'Active' | 'Inactive';

type Teacher = {
  id: string;
  recordId: string;
  userId: string;
  name: string;
  email: string;
  mobileNumber: string;
  subject: string;
  department: string;
  branch: string;
  branchId: string;
  qualification: string;
  experience: string;
  address: string;
  status: TeacherStatus;
};

const getId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id || value.id || '');
};

const mapTeacher = (
  raw: any,
  branchNames: Record<string, string> = {},
): Teacher => {
  const user = raw?.userId && typeof raw.userId === 'object' ? raw.userId : {};
  const branchValue = user?.branchId;
  const branchId = getId(branchValue) || (typeof branchValue === 'string' ? branchValue : '');

  // Prefer the populated branch document. If the API returns only an ObjectId,
  // resolve it through the branch list fetched by loadTeachers().
  const branch =
    branchValue && typeof branchValue === 'object'
      ? String(
          branchValue.name ||
          branchValue.branchName ||
          branchValue.code ||
          branchNames[branchId] ||
          'Unknown Branch',
        )
      : branchNames[branchId] || (branchValue ? 'Branch name unavailable' : '—');

  const statusValue = String(raw?.status || user?.status || 'active').toLowerCase();

  return {
    id: String(raw?.employeeId || getId(raw)),
    recordId: getId(raw),
    userId: getId(user) || getId(raw?.userId),
    name: String(user?.fullName || 'Unknown Teacher'),
    email: String(user?.email || ''),
    mobileNumber: String(user?.mobileNumber || ''),
    subject: String(raw?.specialization || '—'),
    department: String(raw?.qualification || '—'),
    branch,
    branchId,
    qualification: String(raw?.qualification || ''),
    experience: String(raw?.experience || ''),
    address: String(raw?.address || ''),
    status: statusValue === 'inactive' || statusValue === 'rejected' ? 'Inactive' : 'Active',
  };
};

const getTeacherArray = (payload: any): any[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.teachers)) return payload.data.teachers;
  if (Array.isArray(payload?.teachers)) return payload.teachers;
  return [];
};

const getBranchArray = (payload: any): any[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.branches)) return payload.data.branches;
  if (Array.isArray(payload?.branches)) return payload.branches;
  return [];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TeachersPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

 const [teachers, setTeachers] = useState<Teacher[]>([]);
const [branchNames, setBranchNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');



  const [filter, setFilter] = useState<

    'All' | 'Active' | 'Inactive'

  >('All');



  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [viewVisible, setViewVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);



  const [editName, setEditName] = useState('');

  const [editSubject, setEditSubject] = useState('');

  const [editDepartment, setEditDepartment] = useState('');

  const [editBranch, setEditBranch] = useState('');

  const [editStatus, setEditStatus] = useState<TeacherStatus>('Active');

  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.message || `Request failed (${response.status})`);
    }
    return payload;
  };

  const loadTeachers = async () => {
    setLoading(true);
    try {
      // Fetch branches as a fallback in case /teachers returns branchId as an ID
      // instead of a populated Branch document.
      let namesById: Record<string, string> = {};
      try {
        const branchesPayload = await apiRequest('/branches');
        namesById = Object.fromEntries(
          getBranchArray(branchesPayload)
            .filter((branch: any) => branch?._id || branch?.id)
            .map((branch: any) => [
              String(branch._id || branch.id),
              String(branch.name || branch.branchName || branch.code || 'Unknown Branch'),
            ]),
        );
      } catch {
        // The teachers endpoint may already return populated branch documents.
        // Keep loading teachers even if the branch-list endpoint is unavailable.
      }

      const payload = await apiRequest('/teachers');
      setTeachers(getTeacherArray(payload).map((teacher) => mapTeacher(teacher, namesById)));
    } catch (error: any) {
      Alert.alert('Unable to load teachers', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);




  /* =======================================================

     ANDROID NAVIGATION BAR



     Bottom system navigation area is transparent and

     overlays the page instead of becoming purple.

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



  const filteredTeachers = useMemo(() => {

    const query = search.trim().toLowerCase();



    return teachers.filter((teacher) => {

      const matchesSearch =

        !query ||

        teacher.id.toLowerCase().includes(query) ||

        teacher.name.toLowerCase().includes(query) ||

        teacher.subject.toLowerCase().includes(query) ||

        teacher.department.toLowerCase().includes(query) ||

        teacher.branch.toLowerCase().includes(query);



      const matchesFilter =

        filter === 'All' ||

        teacher.status === filter;



      return matchesSearch && matchesFilter;

    });

  }, [teachers, search, filter]);



  /* =======================================================

     ACTIONS

  ====================================================== */



  const handleRefresh = () => {
    void loadTeachers();
  };


  const handleView = (teacher: Teacher) => {

    setSelectedTeacher(teacher);

    setViewVisible(true);

  };



  const handleEdit = (teacher: Teacher) => {

    setSelectedTeacher(teacher);

    setEditName(teacher.name);

    setEditSubject(teacher.subject);

    setEditDepartment(teacher.experience);

    setEditBranch(teacher.branch);

    setEditStatus(teacher.status);

    setEditVisible(true);

  };



  const closeView = () => {

    setViewVisible(false);

    setSelectedTeacher(null);

  };



  const closeEdit = () => {

    setEditVisible(false);

    setSelectedTeacher(null);

  };



  const saveEdit = async () => {
    if (!selectedTeacher) return;
    if (!editName.trim() || !editDepartment.trim()) {
      Alert.alert('Required fields', 'Qualification and experience are required.');
      return;
    }
    setSaving(true);
    try {
      await apiRequest(`/teachers/${selectedTeacher.recordId}`, {
        method: 'PUT',
        body: JSON.stringify({
          qualification: editName.trim(),
          specialization: editSubject.trim(),
          experience: editDepartment.trim(),
          address: editBranch.trim(),
        }),
      });
      const current = selectedTeacher.status;
      if (editStatus !== current) {
        await apiRequest(`/teachers/${selectedTeacher.recordId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: editStatus.toLowerCase() }),
        });
      }
      setEditVisible(false);
      setSelectedTeacher(null);
      await loadTeachers();
      Alert.alert('Success', 'Teacher updated successfully.');
    } catch (error: any) {
      Alert.alert('Update failed', error?.message || 'Unable to update teacher.');
    } finally {
      setSaving(false);
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

      {/* =================================================

          STATUS BAR

      ================================================== */}



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
              paddingTop: insets.top + 8,
              minHeight: insets.top + 66,
            },
            isMobile && styles.headerMobile,
            isTablet && styles.headerTablet,
          ]}
        >



          {/* BACK BUTTON */}



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



          {/* HEADER TITLE */}



          <Text

            style={[
              styles.headerTitle,
              isMobile && styles.headerTitleMobile,
            ]}

            numberOfLines={1}

          >

            Teachers

          </Text>



          {/* REFRESH BUTTON */}
          <TouchableOpacity
            style={[styles.addButton, isMobile && styles.addButtonMobile]}
            activeOpacity={0.85}
            onPress={handleRefresh}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Refresh teachers"
          >
            <MaterialCommunityIcons
              name="refresh"
              size={23}
              color="#7040D5"
            />
          </TouchableOpacity>



        </View>



        {/* =================================================

            BODY

        ================================================== */}



        <ScrollView

          style={styles.scrollView}

          contentContainerStyle={styles.content}

          showsVerticalScrollIndicator={false}

        >



          {/* =================================================

              PAGE HEADING

          ================================================== */}



          <View style={styles.pageHeading}>



            <Text style={styles.pageTitle}>

              Teacher Management

            </Text>



            <Text style={styles.pageSubtitle}>

              Manage teachers, subjects and faculty information

            </Text>



          </View>



          {/* =================================================

              SEARCH + FILTER

          ================================================== */}



          <View style={styles.searchCard}>



            {/* SEARCH */}



            <View style={styles.searchBox}>



              <MaterialCommunityIcons

                name="magnify"

                size={20}

                color="#8792A4"

              />



              <TextInput

                value={search}

                onChangeText={setSearch}

                placeholder="Search teachers..."

                placeholderTextColor="#A0AABB"

                style={styles.searchInput}

                autoCapitalize="none"

                autoCorrect={false}

              />



            </View>



            {/* FILTER BUTTONS */}



            <View style={styles.filterRow}>



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

                        selected &&

                          styles.filterButtonActive,

                      ]}

                    >

                      <Text

                        style={[

                          styles.filterText,

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

              SECTION HEADER

          ================================================== */}



          <View style={styles.sectionHeader}>



            <Text style={styles.sectionTitle}>

              Teachers

            </Text>



            <Text style={styles.sectionSubtitle}>

              {filteredTeachers.length} teachers

            </Text>



          </View>



          {/* =================================================

              TEACHER LIST

          ================================================== */}



          <View style={styles.teacherList}>



            {loading ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#7040D5" />
                <Text style={{ marginTop: 10, color: '#667085' }}>Loading teachers...</Text>
              </View>
            ) : filteredTeachers.map((teacher) => (



              <View

                key={teacher.id}

                style={styles.teacherCard}

              >



                {/* =========================================

                    TEACHER TOP

                ========================================== */}



                <View style={styles.teacherTop}>



                  {/* AVATAR */}



                  <View style={styles.teacherAvatar}>



                    <MaterialCommunityIcons

                      name="account-tie-outline"

                      size={22}

                      color="#7040D5"

                    />



                  </View>



                  {/* NAME + ID */}



                  <View style={styles.teacherInfo}>



                    <Text

                      style={styles.teacherName}

                      numberOfLines={1}

                    >

                      {teacher.name}

                    </Text>



                    <Text style={styles.employeeId}>

                      {teacher.id}

                    </Text>



                  </View>



                  {/* STATUS */}



                  <View

                    style={[

                      styles.statusBadge,

                      teacher.status === 'Active'

                        ? styles.activeBadge

                        : styles.inactiveBadge,

                    ]}

                  >



                    <View

                      style={[

                        styles.statusDot,

                        teacher.status === 'Active'

                          ? styles.activeDot

                          : styles.inactiveDot,

                      ]}

                    />



                    <Text

                      style={[

                        styles.statusText,

                        teacher.status === 'Active'

                          ? styles.activeText

                          : styles.inactiveText,

                      ]}

                    >

                      {teacher.status}

                    </Text>



                  </View>



                </View>



                {/* =========================================

                    DETAILS

                    (2 columns, with a medium, even gap

                    between the left and right column)

                ========================================== */}



                <View style={styles.detailsGrid}>



                  <View style={styles.detailItem}>



                    <Text style={styles.detailLabel}>

                      Subject

                    </Text>



                    <Text style={styles.detailValue}>

                      {teacher.subject}

                    </Text>



                  </View>



                  <View style={styles.detailItem}>



                    <Text style={styles.detailLabel}>

                      Department

                    </Text>



                    <Text style={styles.detailValue}>

                      {teacher.department}

                    </Text>



                  </View>



                  <View style={styles.detailItem}>



                    <Text style={styles.detailLabel}>

                      Branch

                    </Text>



                    <Text style={styles.detailValue}>

                      {teacher.branch}

                    </Text>



                  </View>



                  <View style={styles.detailItem}>



                    <Text style={styles.detailLabel}>

                      Employee ID

                    </Text>



                    <Text style={styles.detailValue}>

                      {teacher.id}

                    </Text>



                  </View>



                </View>



                {/* =========================================

                    ACTIONS

                ========================================== */}



                <View style={styles.actionRow}>



                  <TouchableOpacity

                    style={styles.actionButton}

                    activeOpacity={0.8}

                    onPress={() => handleView(teacher)}

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


                </View>
              </View>



            ))}



            {/* ===========================================

                EMPTY STATE

            ============================================ */}



            {!loading && filteredTeachers.length === 0 && (



              <View style={styles.emptyCard}>



                <MaterialCommunityIcons

                  name="account-search-outline"

                  size={32}

                  color="#A2ADBF"

                />



                <Text style={styles.emptyText}>

                  No teachers found

                </Text>



              </View>



            )}



          </View>



        </ScrollView>



      </View>



      {/* VIEW TEACHER MODAL */}

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

                <Text style={styles.modalTitle}>Teacher Details</Text>

                <Text style={styles.modalSubtitle}>

                  Complete teacher information

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



            {selectedTeacher && (

              <ScrollView

                showsVerticalScrollIndicator={false}

                contentContainerStyle={styles.modalScroll}

              >

                <View style={styles.modalProfile}>

                  <View style={styles.modalAvatar}>

                    <MaterialCommunityIcons

                      name="account-tie-outline"

                      size={30}

                      color="#7040D5"

                    />

                  </View>



                  <View style={styles.modalProfileText}>

                    <Text style={styles.modalTeacherName}>

                      {selectedTeacher.name}

                    </Text>

                    <Text style={styles.modalTeacherId}>

                      {selectedTeacher.id}

                    </Text>

                  </View>

                </View>



                {/* same 2-column + medium-gap treatment

                    as the card above */}

                <View style={styles.modalDetailsGrid}>

                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Subject</Text>

                    <Text style={styles.modalValue}>

                      {selectedTeacher.subject}

                    </Text>

                  </View>



                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Department</Text>

                    <Text style={styles.modalValue}>

                      {selectedTeacher.department}

                    </Text>

                  </View>



                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Branch</Text>

                    <Text style={styles.modalValue}>

                      {selectedTeacher.branch}

                    </Text>

                  </View>



                  <View style={styles.modalDetailBox}>

                    <Text style={styles.modalLabel}>Employee ID</Text>

                    <Text style={styles.modalValue}>

                      {selectedTeacher.id}

                    </Text>

                  </View>

                </View>



                <View style={styles.modalStatusRow}>

                  <Text style={styles.modalLabel}>Status</Text>

                  <View

                    style={[

                      styles.modalStatus,

                      selectedTeacher.status === 'Active'

                        ? styles.activeBadge

                        : styles.inactiveBadge,

                    ]}

                  >

                    <Text

                      style={[

                        styles.modalStatusText,

                        selectedTeacher.status === 'Active'

                          ? styles.activeText

                          : styles.inactiveText,

                      ]}

                    >

                      {selectedTeacher.status}

                    </Text>

                  </View>

                </View>

              </ScrollView>

            )}

          </View>

        </View>

      </Modal>



      {/* EDIT TEACHER MODAL */}

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

                <Text style={styles.modalTitle}>Edit Teacher</Text>

                <Text style={styles.modalSubtitle}>

                  Update teacher information

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

              <Text style={styles.inputLabel}>Qualification *</Text>

              <TextInput

                value={editName}

                onChangeText={setEditName}

                style={styles.modalInput}

                placeholder="Qualification"

                placeholderTextColor="#A0AABB"

              />



              <Text style={styles.inputLabel}>Specialization / Subject</Text>

              <TextInput

                value={editSubject}

                onChangeText={setEditSubject}

                style={styles.modalInput}

                placeholder="Subject"

                placeholderTextColor="#A0AABB"

              />



              <Text style={styles.inputLabel}>Experience *</Text>

              <TextInput

                value={editDepartment}

                onChangeText={setEditDepartment}

                style={styles.modalInput}

                placeholder="e.g. 3 years"

                placeholderTextColor="#A0AABB"

              />



              <Text style={styles.inputLabel}>Address</Text>

              <TextInput

                value={editBranch}

                onChangeText={setEditBranch}

                style={styles.modalInput}

                placeholder="Address"

                placeholderTextColor="#A0AABB"

              />



              <Text style={styles.inputLabel}>Status</Text>

              <View style={styles.statusPickerRow}>

                {(['Active', 'Inactive'] as const).map((status) => (

                  <TouchableOpacity

                    key={status}

                    activeOpacity={0.8}

                    onPress={() => setEditStatus(status)}

                    style={[

                      styles.statusPicker,

                      editStatus === status && styles.statusPickerActive,

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

                  <Text style={styles.modalCancelText}>Cancel</Text>

                </TouchableOpacity>



                <TouchableOpacity

                  style={styles.modalSaveButton}

                  activeOpacity={0.85}

                  onPress={saveEdit}
                  disabled={saving}

                >

                  <MaterialCommunityIcons

                    name="check"

                    size={17}

                    color="#FFFFFF"

                  />

                  <Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>

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

\========================================================= */



const styles = StyleSheet.create({



  /* =======================================================

     SAFE AREA



     IMPORTANT:

     No purple background here.

     Bottom system navigation remains transparent.

  ====================================================== */



  safeArea: {

    flex: 1,

    backgroundColor: '#F7F8FC',

  },



  /* =======================================================

     MAIN CONTAINER

  ====================================================== */



  container: {

    flex: 1,

    backgroundColor: '#F7F8FC',

  },



  scrollView: {

    flex: 1,

  },



  content: {

    paddingHorizontal: 16,

    paddingTop: 14,

    paddingBottom: 50,

  },



  /* =======================================================

     HEADER

  ====================================================== */



  header: {
    width: '100%',
    backgroundColor: '#6D35D8',
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerMobile: {
    height: 80,
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
    backgroundColor: 'rgba(255,255,255,0.16)',
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



  searchInput: {

    flex: 1,



    fontFamily: 'PoppinsRegular',



    fontSize: 11,



    color: '#202B3E',



    marginLeft: 7,



    paddingVertical: 0,

  },



  /* =======================================================

     FILTER

  ====================================================== */



  filterRow: {

    flexDirection: 'row',



    gap: 7,



    marginTop: 10,

  },



  filterButton: {

    flex: 1,



    height: 36,



    borderRadius: 9,



    backgroundColor: '#F3F4F8',



    alignItems: 'center',

    justifyContent: 'center',

  },



  filterButtonActive: {

    backgroundColor: '#7040D5',

  },



  filterText: {

    fontFamily: 'PoppinsMedium',



    fontSize: 10,



    color: '#66768A',

  },



  filterTextActive: {

    color: '#FFFFFF',

  },



  /* =======================================================

     SECTION

  ====================================================== */



  sectionHeader: {

    marginBottom: 9,

  },



  sectionTitle: {

    fontFamily: 'PoppinsSemiBold',



    fontSize: 16,



    lineHeight: 20,



    color: '#172033',

  },



  sectionSubtitle: {

    fontFamily: 'PoppinsRegular',



    fontSize: 10,



    color: '#7B8498',



    marginTop: 1,

  },



  /* =======================================================

     LIST

  ====================================================== */



  teacherList: {

    gap: 10,

  },



  /* =======================================================

     TEACHER CARD

  ====================================================== */



  teacherCard: {

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



  /* =======================================================

     TEACHER TOP

  ====================================================== */



  teacherTop: {

    flexDirection: 'row',



    alignItems: 'center',



    minHeight: 42,

  },



  teacherAvatar: {

    width: 42,

    height: 42,



    borderRadius: 12,



    backgroundColor: '#F1EAFF',



    alignItems: 'center',

    justifyContent: 'center',



    marginRight: 9,

  },



  teacherInfo: {

    flex: 1,



    minWidth: 0,

  },



  teacherName: {

    fontFamily: 'PoppinsSemiBold',



    fontSize: 13,



    lineHeight: 18,



    color: '#202B3E',

  },



  employeeId: {

    fontFamily: 'PoppinsRegular',



    fontSize: 9,



    color: '#7B8498',



    marginTop: 1,

  },



  /* =======================================================

     STATUS

  ====================================================== */



  statusBadge: {

    minWidth: 64,



    height: 26,



    borderRadius: 7,



    paddingHorizontal: 6,



    flexDirection: 'row',



    alignItems: 'center',

    justifyContent: 'center',



    marginLeft: 5,

  },



  activeBadge: {

    backgroundColor: '#E7F8EF',

  },



  inactiveBadge: {

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

     (2-column layout, kept — but now uses a fixed,

     medium "columnGap" so the space between the left and

     right column is even on both sides instead of one

     big block of empty space stretching to the card edge)

  ====================================================== */



  detailsGrid: {

    flexDirection: 'row',



    flexWrap: 'wrap',



    marginTop: 11,



    paddingTop: 10,



    borderTopWidth: 1,



    borderTopColor: '#EEF0F5',



    columnGap: 20,

    marginBottom: 10,

    rowGap: 8,

  },



  detailItem: {

    flexBasis: '45%',



    flexGrow: 1,


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



  /* =======================================================

     ACTIONS

  ====================================================== */



  actionRow: {

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

  /* MODALS */

  modalOverlay: {

    flex: 1,

    backgroundColor: 'rgba(20, 24, 38, 0.45)',

    alignItems: 'center',

    justifyContent: 'center',

    padding: 16,

  },



  modalCard: {

    width: '100%',

    maxWidth: 520,

    maxHeight: '88%',

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    overflow: 'hidden',

  },



  modalHeader: {

    minHeight: 68,

    paddingHorizontal: 16,

    paddingVertical: 12,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

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

    fontSize: 10,

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

    padding: 16,

    paddingBottom: 20,

  },



  modalProfile: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 16,

  },



  modalAvatar: {

    width: 48,

    height: 48,

    borderRadius: 13,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 10,

  },



  modalProfileText: {

    flex: 1,

  },



  modalTeacherName: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 14,

    color: '#202B3E',

  },



  modalTeacherId: {

    fontFamily: 'PoppinsRegular',

    fontSize: 9,

    color: '#7B8498',

    marginTop: 2,

  },



  /* =======================================================

     MODAL DETAILS

     (same 2-column + medium columnGap treatment as

     the card above)

  ====================================================== */



  modalDetailsGrid: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    columnGap: 20,

    rowGap: 10,

  },



  modalDetailBox: {

    flexBasis: '45%',

    flexGrow: 1,

  },



  modalLabel: {

    fontFamily: 'PoppinsMedium',

    fontSize: 9,

    color: '#66768A',

    marginBottom: 3,

  },



  modalValue: {

    fontFamily: 'PoppinsRegular',

    fontSize: 11,

    lineHeight: 16,

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

    minWidth: 70,

    height: 28,

    borderRadius: 8,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 10,

  },



  modalStatusText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 9,

  },



  inputLabel: {

    fontFamily: 'PoppinsMedium',

    fontSize: 9,

    color: '#66768A',

    marginTop: 10,

    marginBottom: 5,

  },



  modalInput: {

    height: 44,

    borderWidth: 1,

    borderColor: '#E4E7EE',

    borderRadius: 10,

    paddingHorizontal: 11,

    fontFamily: 'PoppinsRegular',

    fontSize: 11,

    color: '#202B3E',

    backgroundColor: '#FCFDFE',

  },



  statusPickerRow: {

    flexDirection: 'row',

    gap: 8,

    marginTop: 2,

  },



  statusPicker: {

    flex: 1,

    height: 40,

    borderRadius: 9,

    borderWidth: 1,

    borderColor: '#E4E7EE',

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

  },



  statusPickerActive: {

    backgroundColor: '#F1EAFF',

    borderColor: '#7040D5',

  },



  statusPickerText: {

    fontFamily: 'PoppinsMedium',

    fontSize: 10,

    color: '#66768A',

  },



  statusPickerTextActive: {

    color: '#7040D5',

  },



  modalActions: {

    flexDirection: 'row',

    justifyContent: 'flex-end',

    gap: 8,

    marginTop: 20,

  },



  modalCancelButton: {

    height: 40,

    paddingHorizontal: 16,

    borderRadius: 9,

    borderWidth: 1,

    borderColor: '#D9DDE6',

    alignItems: 'center',

    justifyContent: 'center',

  },



  modalCancelText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 10,

    color: '#66768A',

  },



  modalSaveButton: {

    height: 40,

    paddingHorizontal: 15,

    borderRadius: 9,

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