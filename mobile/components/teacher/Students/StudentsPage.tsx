import React, { useMemo, useState } from 'react';

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

type StudentsPageProps = {
  onContentScroll?: (event: any) => void;
  onStudentReportPress?: (
    studentId: string,
    studentName: string,
  ) => void;
};

type Student = {
  id: string;
  name: string;
  batch: string;
  subject: string;
  initials: string;
};

const STUDENTS: Student[] = [
  {
    id: 'STU-0801',
    name: 'Aarav Mehta',
    batch: '8th Standard',
    subject: 'Physics',
    initials: 'AM',
  },
  {
    id: 'STU-0802',
    name: 'Avni Shah',
    batch: '8th Standard',
    subject: 'Physics',
    initials: 'AS',
  },
  {
    id: 'STU-0803',
    name: 'Harsh Kumar',
    batch: '8th Standard',
    subject: 'Physics',
    initials: 'HK',
  },
  {
    id: 'STU-0901',
    name: 'Kiara Patel',
    batch: '9th Standard',
    subject: 'Physics',
    initials: 'KP',
  },
  {
    id: 'STU-0902',
    name: 'Reyansh Singh',
    batch: '9th Standard',
    subject: 'Physics',
    initials: 'RS',
  },
  {
    id: 'STU-0903',
    name: 'Tara Joshi',
    batch: '9th Standard',
    subject: 'Physics',
    initials: 'TJ',
  },
  {
    id: 'STU-1001',
    name: 'Aditi Verma',
    batch: '10th Standard',
    subject: 'Physics',
    initials: 'AV',
  },
  {
    id: 'STU-1002',
    name: 'Rohan Malhotra',
    batch: '10th Standard',
    subject: 'Physics',
    initials: 'RM',
  },
  {
    id: 'STU-1003',
    name: 'Ishita Rao',
    batch: '10th Standard',
    subject: 'Physics',
    initials: 'IR',
  },
  {
    id: 'STU-1101',
    name: 'Arjun Kapoor',
    batch: '11th Standard',
    subject: 'Physics',
    initials: 'AK',
  },
  {
    id: 'STU-1102',
    name: 'Meera Nair',
    batch: '11th Standard',
    subject: 'Physics',
    initials: 'MN',
  },
  {
    id: 'STU-1103',
    name: 'Vivaan Sharma',
    batch: '11th Standard',
    subject: 'Physics',
    initials: 'VS',
  },
  {
    id: 'STU-1201',
    name: 'Aditya Joshi',
    batch: '12th Standard',
    subject: 'Physics',
    initials: 'AJ',
  },
  {
    id: 'STU-1202',
    name: 'Ananya Gupta',
    batch: '12th Standard',
    subject: 'Physics',
    initials: 'AG',
  },
  {
    id: 'STU-1203',
    name: 'Kabir Shah',
    batch: '12th Standard',
    subject: 'Physics',
    initials: 'KS',
  },
];

const BATCHES = [
  'All Batches',
  '8th Standard',
  '9th Standard',
  '10th Standard',
  '11th Standard',
  '12th Standard',
];

export default function StudentsPage({
  onContentScroll,
  onStudentReportPress,
}: StudentsPageProps) {
  const [searchText, setSearchText] = useState('');

  const [selectedBatch, setSelectedBatch] =
    useState('All Batches');

  const [batchModalVisible, setBatchModalVisible] =
    useState(false);

  const filteredStudents = useMemo(() => {
    const query = searchText
      .trim()
      .toLowerCase();

    return STUDENTS.filter((student) => {
      const matchesBatch =
        selectedBatch === 'All Batches' ||
        student.batch === selectedBatch;

      const matchesSearch =
        !query ||
        student.name
          .toLowerCase()
          .includes(query) ||
        student.id
          .toLowerCase()
          .includes(query);

      return matchesBatch && matchesSearch;
    });
  }, [searchText, selectedBatch]);

  const batchCount = useMemo(() => {
    return BATCHES.filter(
      (batch) => batch !== 'All Batches',
    ).filter((batch) =>
      STUDENTS.some(
        (student) => student.batch === batch,
      ),
    ).length;
  }, []);

  const selectBatch = (batch: string) => {
    setSelectedBatch(batch);
    setBatchModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* ================================
            PAGE HEADER
        ================================= */}

        <View style={styles.pageHeader}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>
              Students
            </Text>

            <Text style={styles.pageSubtitle}>
              Search and view student performance
            </Text>
          </View>

          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeNumber}>
              {STUDENTS.length}
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
                {batchCount} Batches
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.batchSelector,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              setBatchModalVisible(true)
            }
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
              {filteredStudents.length}{' '}
              {filteredStudents.length === 1
                ? 'student'
                : 'students'}{' '}
              found
            </Text>
          </View>

          {searchText.length > 0 && (
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
            STUDENT LIST
        ================================= */}

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
                  name="search-outline"
                  size={32}
                  color="#6428D7"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No students found
              </Text>

              <Text style={styles.emptySubtitle}>
                Try another name, Student ID,
                or select a different batch.
              </Text>

              <Pressable
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchText('');
                  setSelectedBatch(
                    'All Batches',
                  );
                }}
              >
                <Text style={styles.clearFiltersText}>
                  Clear Filters
                </Text>
              </Pressable>
            </View>
          )}
        </View>

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
              {BATCHES.map((batch) => {
                const isSelected =
                  batch === selectedBatch;

                const studentCount =
                  batch === 'All Batches'
                    ? STUDENTS.length
                    : STUDENTS.filter(
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
                    onPress={() =>
                      selectBatch(batch)
                    }
                  >
                    <View
                      style={
                        styles.batchOptionLeft
                      }
                    >
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

                      <View
                        style={
                          styles.batchOptionText
                        }
                      >
                        <Text
                          style={[
                            styles.batchOptionTitle,
                            isSelected &&
                              styles.batchOptionTitleSelected,
                          ]}
                        >
                          {batch}
                        </Text>

                        <Text
                          style={
                            styles.batchOptionCount
                          }
                        >
                          {studentCount}{' '}
                          {studentCount === 1
                            ? 'student'
                            : 'students'}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View
                        style={styles.selectedCheck}
                      >
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

/* =====================================
   STUDENT CARD
===================================== */

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

            <Text style={styles.metaText}>
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

            <Text style={styles.metaText}>
              {student.subject}
            </Text>
          </View>
        </View>
      </View>

      {/* REPORT BUTTON */}

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

/* =====================================
   STYLES
===================================== */

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

  pageHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  pageTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    lineHeight: 29,
  },

  pageSubtitle: {
    color: '#7B7F8B',
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    marginTop: 2,
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
  },

  metaText: {
    color: '#777B87',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    marginLeft: 3,
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