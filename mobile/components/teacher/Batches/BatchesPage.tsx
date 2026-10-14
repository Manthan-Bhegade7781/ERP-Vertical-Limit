import React, { useState } from 'react';

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

type BatchesPageProps = {
  onContentScroll?: (event: any) => void;
};

type Batch = {
  id: string;
  name: string;
  shortName: string;
  students: number;
  subjects: string[];
  room: string;
};

const BATCHES: Batch[] = [
  {
    id: 'batch-8',
    name: '8th Standard',
    shortName: '8th',
    students: 32,
    subjects: ['Physics', 'Mathematics'],
    room: 'Room 201',
  },
  {
    id: 'batch-9',
    name: '9th Standard',
    shortName: '9th',
    students: 28,
    subjects: ['Physics', 'Mathematics'],
    room: 'Room 202',
  },
  {
    id: 'batch-10',
    name: '10th Standard',
    shortName: '10th',
    students: 36,
    subjects: ['Physics', 'Chemistry'],
    room: 'Room 203',
  },
];

export default function BatchesPage({
  onContentScroll,
}: BatchesPageProps) {
  const [selectedBatchId, setSelectedBatchId] =
    useState('batch-8');

  const [selectedSubject, setSelectedSubject] =
    useState('Physics');

  const [modalVisible, setModalVisible] =
    useState(false);

  const [modalType, setModalType] =
    useState<'batch' | 'subject'>('batch');

  const selectedBatch =
    BATCHES.find(
      (batch) =>
        batch.id === selectedBatchId,
    ) || BATCHES[0];

  const totalStudents =
    BATCHES.reduce(
      (sum, batch) =>
        sum + batch.students,
      0,
    );

  const openBatchModal = () => {
    setModalType('batch');
    setModalVisible(true);
  };

  const openSubjectModal = () => {
    setModalType('subject');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const selectBatch = (
    batch: Batch,
  ) => {
    setSelectedBatchId(batch.id);

    setSelectedSubject(
      batch.subjects[0],
    );

    setModalVisible(false);
  };

  const selectSubject = (
    subject: string,
  ) => {
    setSelectedSubject(subject);
    setModalVisible(false);
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        scrollEventThrottle={16}
        onScroll={onContentScroll}
      >
        {/* HEADER */}

        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="layers-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              My Batches
            </Text>

            <Text style={styles.subtitle}>
              View your assigned classes and subjects
            </Text>
          </View>
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View
              style={[
                styles.summaryIcon,
                styles.purpleBackground,
              ]}
            >
              <Ionicons
                name="layers-outline"
                size={20}
                color="#5420D8"
              />
            </View>

            <View>
              <Text style={styles.summaryNumber}>
                {BATCHES.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Batches
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View
              style={[
                styles.summaryIcon,
                styles.blueBackground,
              ]}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color="#1670E8"
              />
            </View>

            <View>
              <Text style={styles.summaryNumber}>
                {totalStudents}
              </Text>

              <Text style={styles.summaryLabel}>
                Students
              </Text>
            </View>
          </View>
        </View>

        {/* FILTERS */}

        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <View>
              <Text style={styles.filterTitle}>
                Filter Batches
              </Text>

              <Text style={styles.filterSubtitle}>
                Select a batch and subject
              </Text>
            </View>

            <View style={styles.filterIcon}>
              <Ionicons
                name="options-outline"
                size={19}
                color="#5420D8"
              />
            </View>
          </View>

          {/* BATCH */}

          <Text style={styles.fieldLabel}>
            Batch
          </Text>

          <Pressable
            style={styles.dropdown}
            onPress={openBatchModal}
          >
            <View style={styles.dropdownIcon}>
              <Ionicons
                name="people-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <View style={styles.dropdownText}>
              <Text style={styles.dropdownValue}>
                {selectedBatch.name}
              </Text>

              <Text style={styles.dropdownHint}>
                {selectedBatch.students} students
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={19}
              color="#777C89"
            />
          </Pressable>

          {/* SUBJECT */}

          <Text
            style={[
              styles.fieldLabel,
              styles.subjectLabel,
            ]}
          >
            Subject
          </Text>

          <Pressable
            style={styles.dropdown}
            onPress={openSubjectModal}
          >
            <View style={styles.dropdownIcon}>
              <Ionicons
                name="book-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <View style={styles.dropdownText}>
              <Text style={styles.dropdownValue}>
                {selectedSubject}
              </Text>

              <Text style={styles.dropdownHint}>
                Subject taught by you
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={19}
              color="#777C89"
            />
          </Pressable>
        </View>

        {/* SELECTED BATCH */}

        <View style={styles.batchCard}>
          <View style={styles.batchHeader}>
            <View style={styles.batchIcon}>
              <Ionicons
                name="school-outline"
                size={25}
                color="#5420D8"
              />
            </View>

            <View style={styles.batchHeaderText}>
              <Text style={styles.batchName}>
                {selectedBatch.name}
              </Text>

              <Text style={styles.batchSubject}>
                Teaching{' '}
                <Text
                  style={
                    styles.batchSubjectHighlight
                  }
                >
                  {selectedSubject}
                </Text>
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                Active
              </Text>
            </View>
          </View>

          {/* STATS */}

          <View style={styles.stats}>
            <View style={styles.stat}>
              <View
                style={[
                  styles.statIcon,
                  styles.purpleBackground,
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={17}
                  color="#5420D8"
                />
              </View>

              <View>
                <Text style={styles.statValue}>
                  {selectedBatch.students}
                </Text>

                <Text style={styles.statLabel}>
                  Students
                </Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <View
                style={[
                  styles.statIcon,
                  styles.blueBackground,
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={17}
                  color="#1670E8"
                />
              </View>

              <View>
                <Text style={styles.statValue}>
                  {selectedBatch.subjects.length}
                </Text>

                <Text style={styles.statLabel}>
                  Subjects
                </Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <View
                style={[
                  styles.statIcon,
                  styles.greenBackground,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#2FA66A"
                />
              </View>

              <View>
                <Text
                  style={styles.roomValue}
                  numberOfLines={1}
                >
                  {selectedBatch.room}
                </Text>

                <Text style={styles.statLabel}>
                  Room
                </Text>
              </View>
            </View>
          </View>

          {/* TEACHER */}

          <View style={styles.teacherCard}>
            <View style={styles.teacherAvatar}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#5420D8"
              />
            </View>

            <View style={styles.teacherText}>
              <Text style={styles.teacherLabel}>
                Assigned Teacher
              </Text>

              <Text style={styles.teacherName}>
                Priya Sharma
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={21}
              color="#2FA66A"
            />
          </View>
        </View>

        {/* ALL BATCHES */}

        <View style={styles.allBatchesCard}>
          <View style={styles.allBatchesHeader}>
            <View>
              <Text style={styles.allBatchesTitle}>
                All My Batches
              </Text>

              <Text
                style={
                  styles.allBatchesSubtitle
                }
              >
                Quick overview of your classes
              </Text>
            </View>

            <Text style={styles.batchCount}>
              {BATCHES.length} batches
            </Text>
          </View>

          {BATCHES.map((batch) => {
            const isSelected =
              batch.id === selectedBatchId;

            return (
              <Pressable
                key={batch.id}
                style={[
                  styles.batchList,
                  isSelected &&
                    styles.batchListSelected,
                ]}
                onPress={() => {
                  setSelectedBatchId(
                    batch.id,
                  );

                  setSelectedSubject(
                    batch.subjects[0],
                  );
                }}
              >
                <View
                  style={[
                    styles.batchListIcon,
                    isSelected &&
                      styles.batchListIconSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.batchListIconText,
                      isSelected &&
                        styles.batchListIconTextSelected,
                    ]}
                  >
                    {batch.shortName}
                  </Text>
                </View>

                <View style={styles.batchListText}>
                  <Text
                    style={styles.batchListName}
                  >
                    {batch.name}
                  </Text>

                  <Text
                    style={
                      styles.batchListSubjects
                    }
                    numberOfLines={1}
                  >
                    {batch.subjects.join(
                      ' • ',
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.studentCountContainer
                  }
                >
                  <Text
                    style={styles.studentCount}
                  >
                    {batch.students}
                  </Text>

                  <Text
                    style={
                      styles.studentCountLabel
                    }
                  >
                    students
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* DROPDOWN MODAL */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={closeModal}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  {modalType === 'batch'
                    ? 'Select Batch'
                    : 'Select Subject'}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {modalType === 'batch'
                    ? 'Choose a class'
                    : 'Choose a subject'}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#555B69"
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              {modalType === 'batch' &&
                BATCHES.map((batch) => {
                  const selected =
                    batch.id ===
                    selectedBatchId;

                  return (
                    <Pressable
                      key={batch.id}
                      style={[
                        styles.modalOption,
                        selected &&
                          styles.modalOptionSelected,
                      ]}
                      onPress={() =>
                        selectBatch(batch)
                      }
                    >
                      <View
                        style={[
                          styles.modalOptionIcon,
                          selected &&
                            styles.modalOptionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name="people-outline"
                          size={19}
                          color={
                            selected
                              ? '#5420D8'
                              : '#777C89'
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.modalOptionText
                        }
                      >
                        <Text
                          style={[
                            styles.modalOptionTitle,
                            selected &&
                              styles.modalOptionTitleSelected,
                          ]}
                        >
                          {batch.name}
                        </Text>

                        <Text
                          style={
                            styles.modalOptionSubtitle
                          }
                        >
                          {batch.students}{' '}
                          students
                        </Text>
                      </View>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color="#5420D8"
                        />
                      )}
                    </Pressable>
                  );
                })}

              {modalType === 'subject' &&
                selectedBatch.subjects.map(
                  (subject) => {
                    const selected =
                      subject ===
                      selectedSubject;

                    return (
                      <Pressable
                        key={`${selectedBatch.id}-${subject}`}
                        style={[
                          styles.modalOption,
                          selected &&
                            styles.modalOptionSelected,
                        ]}
                        onPress={() =>
                          selectSubject(
                            subject,
                          )
                        }
                      >
                        <View
                          style={[
                            styles.modalOptionIcon,
                            selected &&
                              styles.modalOptionIconSelected,
                          ]}
                        >
                          <Ionicons
                            name="book-outline"
                            size={19}
                            color={
                              selected
                                ? '#5420D8'
                                : '#777C89'
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.modalOptionText
                          }
                        >
                          <Text
                            style={[
                              styles.modalOptionTitle,
                              selected &&
                                styles.modalOptionTitleSelected,
                            ]}
                          >
                            {subject}
                          </Text>

                          <Text
                            style={
                              styles.modalOptionSubtitle
                            }
                          >
                            Subject taught by you
                          </Text>
                        </View>

                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#5420D8"
                          />
                        )}
                      </Pressable>
                    );
                  },
                )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 110,
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

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
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

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E8E8ED',
  },

  summaryIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  purpleBackground: {
    backgroundColor: '#EEE7FF',
  },

  blueBackground: {
    backgroundColor: '#E7F0FF',
  },

  greenBackground: {
    backgroundColor: '#E4F7EC',
  },

  summaryNumber: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 16,
  },

  summaryLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
  },

  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  filterTitle: {
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
  },

  filterSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 1,
  },

  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldLabel: {
    color: '#343848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    marginBottom: 5,
  },

  subjectLabel: {
    marginTop: 10,
  },

  dropdown: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E1E8',
    backgroundColor: '#F8F7FA',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dropdownIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dropdownText: {
    flex: 1,
    marginLeft: 9,
  },

  dropdownValue: {
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
  },

  dropdownHint: {
    color: '#9296A2',
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    marginTop: 1,
  },

  batchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  batchIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  batchHeaderText: {
    flex: 1,
  },

  batchName: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 16,
  },

  batchSubject: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  batchSubjectHighlight: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8F0',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2FA66A',
    marginRight: 4,
  },

  activeText: {
    color: '#258357',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FA',
    borderRadius: 13,
    marginTop: 13,
    paddingVertical: 10,
  },

  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E1E7',
  },

  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  statValue: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 12,
  },

  roomValue: {
    color: '#171A2B',
    fontFamily: 'PoppinsBold',
    fontSize: 9.5,
    maxWidth: 55,
  },

  statLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
  },

  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EBFF',
    borderRadius: 12,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },

  teacherAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  teacherText: {
    flex: 1,
  },

  teacherLabel: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
  },

  teacherName: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
  },

  allBatchesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  allBatchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  allBatchesTitle: {
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
  },

  allBatchesSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
  },

  batchCount: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
  },

  batchList: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
  },

  batchListSelected: {
    backgroundColor: '#FAF8FF',
  },

  batchListIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F1F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  batchListIconSelected: {
    backgroundColor: '#EEE7FF',
  },

  batchListIconText: {
    color: '#777C89',
    fontFamily: 'PoppinsBold',
    fontSize: 10,
  },

  batchListIconTextSelected: {
    color: '#5420D8',
  },

  batchListText: {
    flex: 1,
    minWidth: 0,
  },

  batchListName: {
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
  },

  batchListSubjects: {
    color: '#9296A2',
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    marginTop: 1,
  },

  studentCountContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },

  studentCount: {
    color: '#5420D8',
    fontFamily: 'PoppinsBold',
    fontSize: 13,
  },

  studentCountLabel: {
    color: '#9296A2',
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
  },

  bottomSpace: {
    height: 110,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    maxHeight: '70%',
    elevation: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 18,
  },

  modalSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    marginTop: 1,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#F4F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOption: {
    minHeight: 59,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalOptionSelected: {
    backgroundColor: '#F1EBFF',
  },

  modalOptionIcon: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  modalOptionIconSelected: {
    backgroundColor: '#E6DDFF',
  },

  modalOptionText: {
    flex: 1,
  },

  modalOptionTitle: {
    color: '#343848',
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
  },

  modalOptionTitleSelected: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
  },

  modalOptionSubtitle: {
    color: '#9296A2',
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    marginTop: 1,
  },
});