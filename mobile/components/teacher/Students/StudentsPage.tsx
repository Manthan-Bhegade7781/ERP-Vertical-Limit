import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  fetchTeacherAssignedStudents,
  getReferenceName,
  TeacherStudentApiRecord,
} from '../../../services/students';

/* =========================================================
   PROPS
========================================================= */

type StudentsPageProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
  onStudentReportPress?: (
    studentId: string,
    studentName: string,
  ) => void;
};

/* =========================================================
   FRONTEND STUDENT TYPE
========================================================= */

type Student = {
  id: string;
  name: string;
  batch: string;
  subject: string;
  initials: string;
  status: string;
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name: string): string => {
  if (!name) return 'ST';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const getBatchName = (
  student: TeacherStudentApiRecord,
): string => {
  if (
    student.batchId &&
    typeof student.batchId === 'object'
  ) {
    return (
      student.batchId.name ||
      student.batchId.standard ||
      'Unassigned Batch'
    );
  }

  return 'Unassigned Batch';
};

const getStudentName = (
  student: TeacherStudentApiRecord,
): string => {
  return getReferenceName(student.userId) || 'Unknown Student';
};

const mapStudent = (
  student: TeacherStudentApiRecord,
): Student => {
  const name = getStudentName(student);

  const subjects =
    student.teacherSubjects
      ?.map((subject) => subject.name)
      .filter(Boolean)
      .join(', ') || 'Not assigned';

  return {
    id: student.studentId || student._id,
    name,
    batch: getBatchName(student),
    subject: subjects,
    initials: getInitials(name),
    status: student.status || 'active',
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentsPage({
  onContentScroll,
  onBack,
  onStudentReportPress,
}: StudentsPageProps) {
  /* =============================
     STATE
  ============================= */

  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [searchText, setSearchText] = useState('');

  const [selectedBatch, setSelectedBatch] =
    useState('All Batches');

  const [batchModalVisible, setBatchModalVisible] =
    useState(false);

  /* =============================
     FETCH TEACHER STUDENTS
  ============================= */

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetchTeacherAssignedStudents();

      const mappedStudents = response.map(mapStudent);

      setStudents(mappedStudents);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load assigned students.';

      setError(message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError('');

      const response = await fetchTeacherAssignedStudents();
      const mappedStudents = response.map(mapStudent);

      setStudents(mappedStudents);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load assigned students.';

      setError(message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  /* =============================
     DYNAMIC BATCHES
  ============================= */

  const batches = useMemo(() => {
    const uniqueBatches = Array.from(
      new Set(
        students
          .map((student) => student.batch)
          .filter(
            (batch) =>
              batch && batch !== 'Unassigned Batch',
          ),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return ['All Batches', ...uniqueBatches];
  }, [students]);

  /* =============================
     FILTER STUDENTS
  ============================= */

  const filteredStudents = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return students.filter((student) => {
      const matchesBatch =
        selectedBatch === 'All Batches' ||
        student.batch === selectedBatch;

      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query);

      return matchesBatch && matchesSearch;
    });
  }, [students, searchText, selectedBatch]);

  /* =============================
     BATCH COUNT
  ============================= */

  const batchCount = useMemo(() => {
    return batches.length - 1;
  }, [batches]);

  /* =============================
     SELECT BATCH
  ============================= */

  const selectBatch = (batch: string) => {
    setSelectedBatch(batch);
    setBatchModalVisible(false);
  };

  /* =============================
     RETRY
  ============================= */

  const handleRetry = () => {
    loadStudents();
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#5420D8"
            colors={["#5420D8"]}
          />
        }
      >
        {/* ================================
            PAGE HEADER
        ================================= */}

        <View style={styles.headerCard}>
          <Pressable
            style={styles.backButton}
            onPress={onBack ?? (() => undefined)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous screen"
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color="#5420D8"
            />
          </Pressable>

          <View style={styles.headerIcon}>
            <Ionicons
              name="people-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Students
            </Text>

            <Text style={styles.subtitle}>
              Search and view student performance
            </Text>
          </View>

          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeNumber}>
              {loading ? '--' : students.length}
            </Text>

            <Text style={styles.totalBadgeLabel}>
              Students
            </Text>
          </View>
        </View>

        {/* ================================
            SEARCH
        ================================= */}

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#6428D7"
          />

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search name or Student ID"
            placeholderTextColor="#9A9DA8"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searchText.length > 0 && (
            <Pressable
              onPress={() => setSearchText('')}
              style={styles.clearSearch}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#999DA8"
              />
            </Pressable>
          )}
        </View>

        {/* ================================
            BATCH FILTER
        ================================= */}

        <View style={styles.filterSection}>
          <View style={styles.filterLabelRow}>
            <View>
              <Text style={styles.filterTitle}>
                Batch
              </Text>

              <Text style={styles.filterSubtitle}>
                Select a batch to find students
              </Text>
            </View>

            <View style={styles.batchCountBadge}>
              <Text style={styles.batchCountText}>
                {loading ? '--' : batchCount} Batches
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.batchSelector,
              pressed && styles.pressed,
            ]}
            onPress={() => setBatchModalVisible(true)}
            disabled={loading || students.length === 0}
          >
            <View style={styles.selectorLeft}>
              <View style={styles.selectorIcon}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#6428D7"
                />
              </View>

              <Text
                style={styles.selectorText}
                numberOfLines={1}
              >
                {selectedBatch}
              </Text>
            </View>

            <Ionicons
              name="chevron-down-outline"
              size={20}
              color="#666B78"
            />
          </Pressable>
        </View>

        {/* ================================
            RESULT HEADER
        ================================= */}

        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.resultTitle}>
              {selectedBatch === 'All Batches'
                ? 'All Students'
                : selectedBatch}
            </Text>

            <Text style={styles.resultSubtitle}>
              {loading
                ? 'Loading students...'
                : `${filteredStudents.length} ${
                    filteredStudents.length === 1
                      ? 'student'
                      : 'students'
                  } found`}
            </Text>
          </View>

          {searchText.length > 0 && !loading && (
            <View style={styles.searchResultBadge}>
              <Ionicons
                name="search-outline"
                size={14}
                color="#6428D7"
              />

              <Text style={styles.searchResultText}>
                Search active
              </Text>
            </View>
          )}
        </View>

        {/* ================================
            LOADING STATE
        ================================= */}

        {loading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator
              size="large"
              color="#6428D7"
            />

            <Text style={styles.stateTitle}>
              Loading students...
            </Text>

            <Text style={styles.stateSubtitle}>
              Fetching your assigned students
            </Text>
          </View>
        )}

        {/* ================================
            ERROR STATE
        ================================= */}

        {!loading && error.length > 0 && (
          <View style={styles.stateContainer}>
            <View style={styles.stateIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color="#D94A4A"
              />
            </View>

            <Text style={styles.stateTitle}>
              Unable to load students
            </Text>

            <Text style={styles.stateSubtitle}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Ionicons
                name="refresh-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        )}

        {/* ================================
            STUDENT LIST
        ================================= */}

        {!loading && !error && (
          <View style={styles.studentList}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onReportPress={() => {
                    onStudentReportPress?.(
                      student.id,
                      student.name,
                    );
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name={
                      students.length === 0
                        ? 'people-outline'
                        : 'search-outline'
                    }
                    size={32}
                    color="#6428D7"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  {students.length === 0
                    ? 'No students assigned yet'
                    : 'No students found'}
                </Text>

                <Text style={styles.emptySubtitle}>
                  {students.length === 0
                    ? 'Students will appear here when they are added to your assigned batches.'
                    : 'Try another name, Student ID, or select a different batch.'}
                </Text>

                {students.length > 0 && (
                  <Pressable
                    style={styles.clearFiltersButton}
                    onPress={() => {
                      setSearchText('');
                      setSelectedBatch('All Batches');
                    }}
                  >
                    <Text style={styles.clearFiltersText}>
                      Clear Filters
                    </Text>
                  </Pressable>
                )}

                {students.length === 0 && (
                  <Pressable
                    style={styles.clearFiltersButton}
                    onPress={handleRetry}
                  >
                    <Text style={styles.clearFiltersText}>
                      Refresh
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ================================
          BATCH MODAL
      ================================= */}

      <Modal
        visible={batchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setBatchModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() =>
              setBatchModalVisible(false)
            }
          />

          <View style={styles.batchModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  Select Batch
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose a batch to view students
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setBatchModalVisible(false)
                }
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#555B69"
                />
              </Pressable>
            </View>

            <View style={styles.batchOptions}>
              {batches.map((batch) => {
                const isSelected =
                  batch === selectedBatch;

                const studentCount =
                  batch === 'All Batches'
                    ? students.length
                    : students.filter(
                        (student) =>
                          student.batch === batch,
                      ).length;

                return (
                  <Pressable
                    key={batch}
                    style={({ pressed }) => [
                      styles.batchOption,
                      isSelected &&
                        styles.batchOptionSelected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => selectBatch(batch)}
                  >
                    <View style={styles.batchOptionLeft}>
                      <View
                        style={[
                          styles.batchOptionIcon,
                          isSelected &&
                            styles.batchOptionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name="people-outline"
                          size={19}
                          color={
                            isSelected
                              ? '#6428D7'
                              : '#777B88'
                          }
                        />
                      </View>

                      <View style={styles.batchOptionText}>
                        <Text
                          style={[
                            styles.batchOptionTitle,
                            isSelected &&
                              styles.batchOptionTitleSelected,
                          ]}
                        >
                          {batch}
                        </Text>

                        <Text style={styles.batchOptionCount}>
                          {studentCount}{' '}
                          {studentCount === 1
                            ? 'student'
                            : 'students'}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={styles.selectedCheck}>
                        <Ionicons
                          name="checkmark"
                          size={17}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   STUDENT CARD
========================================================= */

type StudentCardProps = {
  student: Student;
  onReportPress?: () => void;
};

function StudentCard({
  student,
  onReportPress,
}: StudentCardProps) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentAvatar}>
        <Text style={styles.studentInitials}>
          {student.initials}
        </Text>
      </View>

      <View style={styles.studentInfo}>
        <Text
          style={styles.studentName}
          numberOfLines={1}
        >
          {student.name}
        </Text>

        <Text style={styles.studentId}>
          Student ID: {student.id}
        </Text>

        <View style={styles.studentMeta}>
          <View style={styles.metaItem}>
            <Ionicons
              name="school-outline"
              size={14}
              color="#6D7280"
            />

            <Text
              style={styles.metaText}
              numberOfLines={1}
            >
              {student.batch}
            </Text>
          </View>

          <View style={styles.metaDot} />

          <View style={styles.metaItem}>
            <Ionicons
              name="book-outline"
              size={14}
              color="#6D7280"
            />

            <Text
              style={styles.metaText}
              numberOfLines={1}
            >
              {student.subject}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.reportButton,
          pressed && styles.pressed,
        ]}
        onPress={onReportPress}
      >
        <Ionicons
          name="bar-chart-outline"
          size={16}
          color="#6428D7"
        />

        <Text style={styles.reportButtonText}>
          Report
        </Text>
      </Pressable>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    flexShrink: 0,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 19,
  },

  subtitle: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  totalBadge: {
    backgroundColor: '#EEE7FF',
    borderRadius: 14,
    minWidth: 70,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginLeft: 10,
  },

  totalBadgeNumber: {
    color: '#6428D7',
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    lineHeight: 22,
  },

  totalBadgeLabel: {
    color: '#6428D7',
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    marginTop: 1,
  },

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1DFE7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 12.5,
    marginLeft: 9,
    paddingVertical: 0,
  },

  clearSearch: {
    marginLeft: 8,
  },

  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  filterTitle: {
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
  },

  filterSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  batchCountBadge: {
    backgroundColor: '#F1EBFF',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  batchCountText: {
    color: '#6428D7',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
  },

  batchSelector: {
    height: 52,
    borderRadius: 13,
    backgroundColor: '#F8F7FA',
    borderWidth: 1,
    borderColor: '#E2E0E7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
  },

  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  selectorIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  selectorText: {
    flex: 1,
    color: '#25283A',
    fontFamily: 'PoppinsMedium',
    fontSize: 12.5,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  resultTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  resultSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  searchResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEE7FF',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 8,
  },

  searchResultText: {
    color: '#6428D7',
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    marginLeft: 4,
  },

  studentList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },

  studentCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
  },

  studentAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  studentInitials: {
    color: '#6428D7',
    fontFamily: 'PoppinsBold',
    fontSize: 12.5,
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
  },

  studentName: {
    color: '#171A2B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13.5,
  },

  studentId: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    marginTop: 1,
  },

  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    flexShrink: 1,
  },

  metaText: {
    color: '#777B87',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    marginLeft: 3,
    flexShrink: 1,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#B5B7BE',
    marginHorizontal: 6,
  },

  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEE7FF',
    borderRadius: 10,
    paddingHorizontal: 9,
    height: 36,
    marginLeft: 7,
  },

  reportButtonText: {
    color: '#6428D7',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    marginLeft: 4,
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 45,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    textAlign: 'center',
  },

  emptySubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
  },

  clearFiltersButton: {
    backgroundColor: '#EEE7FF',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginTop: 14,
  },

  clearFiltersText: {
    color: '#6428D7',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
  },

  stateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  stateIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FCEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  stateTitle: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },

  stateSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 5,
  },

  retryButton: {
    backgroundColor: '#6428D7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    marginLeft: 6,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  batchModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    elevation: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 21,
  },

  modalSubtitle: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    marginTop: 2,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  batchOptions: {
    gap: 8,
  },

  batchOption: {
    minHeight: 58,
    borderRadius: 13,
    backgroundColor: '#F8F7FA',
    borderWidth: 1,
    borderColor: '#ECEAF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
  },

  batchOptionSelected: {
    backgroundColor: '#EEE7FF',
    borderColor: '#DCD0FF',
  },

  batchOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  batchOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEEEF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  batchOptionIconSelected: {
    backgroundColor: '#FFFFFF',
  },

  batchOptionText: {
    flex: 1,
    minWidth: 0,
  },

  batchOptionTitle: {
    color: '#353847',
    fontFamily: 'PoppinsMedium',
    fontSize: 12.5,
  },

  batchOptionTitleSelected: {
    color: '#6428D7',
    fontFamily: 'PoppinsSemiBold',
  },

  batchOptionCount: {
    color: '#8A8E99',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 1,
  },

  selectedCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6428D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  bottomSpace: {
    height: 25,
  },

  pressed: {
    opacity: 0.7,
  },
});