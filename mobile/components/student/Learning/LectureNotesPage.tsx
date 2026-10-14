import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LectureNotesPageProps = {
  onContentScroll?: (event: any) => void;
};

type LectureNote = {
  id: string;
  subject: string;
  topic: string;
  description: string;
  teacher: string;
  batch: string;
  date: string;
  time: string;
  materialType: 'PDF' | 'Notes' | 'Video' | 'None';
};

const LECTURE_NOTES: LectureNote[] = [
  {
    id: 'lecture-001',
    subject: 'Physics',
    topic: "Newton's Laws of Motion",
    description:
      'Discussed Newton’s three laws of motion with examples and numerical problems.',
    teacher: 'Priya Sharma',
    batch: '10th Standard A',
    date: '16 Sep 2026',
    time: '10:00 AM',
    materialType: 'PDF',
  },
  {
    id: 'lecture-002',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    description:
      'Covered quadratic equations, roots, discriminant and methods for solving equations.',
    teacher: 'Rahul Sir',
    batch: '10th Standard A',
    date: '15 Sep 2026',
    time: '02:00 PM',
    materialType: 'Notes',
  },
  {
    id: 'lecture-003',
    subject: 'Chemistry',
    topic: 'Chemical Reactions',
    description:
      'Introduction to chemical reactions, balancing equations and different types of reactions.',
    teacher: 'Anjali Ma’am',
    batch: '10th Standard A',
    date: '14 Sep 2026',
    time: '12:00 PM',
    materialType: 'PDF',
  },
  {
    id: 'lecture-004',
    subject: 'Physics',
    topic: 'Motion Graphs',
    description:
      'Explained distance-time and velocity-time graphs with practical examples.',
    teacher: 'Priya Sharma',
    batch: '10th Standard A',
    date: '13 Sep 2026',
    time: '10:00 AM',
    materialType: 'Video',
  },
  {
    id: 'lecture-005',
    subject: 'Mathematics',
    topic: 'Polynomials',
    description:
      'Explained polynomial identities and factorisation techniques.',
    teacher: 'Rahul Sir',
    batch: '10th Standard A',
    date: '12 Sep 2026',
    time: '02:00 PM',
    materialType: 'Notes',
  },
];

const SUBJECTS = [
  'All',
  'Physics',
  'Mathematics',
  'Chemistry',
];

export default function LectureNotesPage({
  onContentScroll,
}: LectureNotesPageProps) {
  const [selectedSubject, setSelectedSubject] =
    useState('All');

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    if (selectedSubject === 'All') {
      return LECTURE_NOTES;
    }

    return LECTURE_NOTES.filter(
      note => note.subject === selectedSubject,
    );
  }, [selectedSubject]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* ================================= */}
        {/* Header */}
        {/* ================================= */}

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              Lecture Notes
            </Text>

            <Text style={styles.subtitle}>
              Notes and lecture information from your teachers
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="school-outline"
              size={24}
              color="#6630D7"
            />
          </View>
        </View>

        {/* ================================= */}
        {/* Batch Card */}
        {/* ================================= */}

        <View style={styles.batchCard}>
          <View style={styles.batchIcon}>
            <Ionicons
              name="people-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.batchContent}>
            <Text style={styles.batchLabel}>
              YOUR BATCH
            </Text>

            <Text style={styles.batchName}>
              10th Standard A
            </Text>
          </View>

          <View style={styles.lectureCount}>
            <Text style={styles.lectureCountNumber}>
              {filteredNotes.length}
            </Text>

            <Text style={styles.lectureCountLabel}>
              Lectures
            </Text>
          </View>
        </View>

        {/* ================================= */}
        {/* Subject Filter */}
        {/* ================================= */}

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>
            Filter by Subject
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.filterContainer
            }
          >
            {SUBJECTS.map(subject => {
              const isSelected =
                selectedSubject === subject;

              return (
                <Pressable
                  key={subject}
                  style={[
                    styles.filterButton,
                    isSelected &&
                      styles.selectedFilter,
                  ]}
                  onPress={() =>
                    setSelectedSubject(subject)
                  }
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected &&
                        styles.selectedFilterText,
                    ]}
                  >
                    {subject}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ================================= */}
        {/* Lecture List */}
        {/* ================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Recent Lectures
              </Text>

              <Text style={styles.sectionSubtitle}>
                Lecture history shared with your batch
              </Text>
            </View>

            <View style={styles.resultBadge}>
              <Text style={styles.resultBadgeText}>
                {filteredNotes.length}
              </Text>
            </View>
          </View>

          {filteredNotes.map(
            (lecture, index) => {
              const isExpanded =
                expandedId === lecture.id;

              return (
                <Pressable
                  key={lecture.id}
                  style={[
                    styles.lectureCard,
                    index !==
                      filteredNotes.length - 1 &&
                      !isExpanded &&
                      styles.lectureBorder,
                  ]}
                  onPress={() =>
                    setExpandedId(
                      isExpanded
                        ? null
                        : lecture.id,
                    )
                  }
                >
                  {/* Icon */}
                  <View
                    style={[
                      styles.subjectIcon,
                      lecture.subject ===
                        'Physics' &&
                        styles.physicsIcon,
                      lecture.subject ===
                        'Mathematics' &&
                        styles.mathIcon,
                      lecture.subject ===
                        'Chemistry' &&
                        styles.chemistryIcon,
                    ]}
                  >
                    <Ionicons
                      name={
                        lecture.subject ===
                        'Physics'
                          ? 'flask-outline'
                          : lecture.subject ===
                              'Mathematics'
                            ? 'calculator-outline'
                            : 'beaker-outline'
                      }
                      size={21}
                      color={
                        lecture.subject ===
                        'Physics'
                          ? '#6630D7'
                          : lecture.subject ===
                              'Mathematics'
                            ? '#1670E8'
                            : '#22A55A'
                      }
                    />
                  </View>

                  {/* Main Content */}
                  <View style={styles.lectureContent}>
                    <Text
                      style={styles.subject}
                    >
                      {lecture.subject}
                    </Text>

                    <Text
                      style={styles.topic}
                      numberOfLines={
                        isExpanded ? undefined : 2
                      }
                    >
                      {lecture.topic}
                    </Text>

                    <View style={styles.metaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color="#9999A5"
                      />

                      <Text style={styles.metaText}>
                        {lecture.date}
                      </Text>

                      <View
                        style={styles.metaDot}
                      />

                      <Ionicons
                        name="time-outline"
                        size={12}
                        color="#9999A5"
                      />

                      <Text style={styles.metaText}>
                        {lecture.time}
                      </Text>
                    </View>

                    {isExpanded && (
                      <View
                        style={styles.expandedContent}
                      >
                        {/* Description */}
                        <Text
                          style={styles.descriptionLabel}
                        >
                          Lecture Description
                        </Text>

                        <Text
                          style={styles.description}
                        >
                          {lecture.description}
                        </Text>

                        {/* Teacher */}
                        <View
                          style={styles.infoRow}
                        >
                          <Ionicons
                            name="person-outline"
                            size={14}
                            color="#6630D7"
                          />

                          <View
                            style={styles.infoTextContainer}
                          >
                            <Text
                              style={
                                styles.infoLabel
                              }
                            >
                              Teacher
                            </Text>

                            <Text
                              style={
                                styles.infoValue
                              }
                            >
                              {lecture.teacher}
                            </Text>
                          </View>
                        </View>

                        {/* Batch */}
                        <View
                          style={styles.infoRow}
                        >
                          <Ionicons
                            name="people-outline"
                            size={14}
                            color="#6630D7"
                          />

                          <View
                            style={styles.infoTextContainer}
                          >
                            <Text
                              style={
                                styles.infoLabel
                              }
                            >
                              Batch
                            </Text>

                            <Text
                              style={
                                styles.infoValue
                              }
                            >
                              {lecture.batch}
                            </Text>
                          </View>
                        </View>

                        {/* Material */}
                        <View
                          style={styles.materialRow}
                        >
                          <View
                            style={
                              styles.materialIcon
                            }
                          >
                            <Ionicons
                              name={
                                lecture.materialType ===
                                'PDF'
                                  ? 'document-text-outline'
                                  : lecture.materialType ===
                                      'Video'
                                    ? 'play-circle-outline'
                                    : lecture.materialType ===
                                        'Notes'
                                      ? 'reader-outline'
                                      : 'close-circle-outline'
                              }
                              size={17}
                              color="#6630D7"
                            />
                          </View>

                          <View
                            style={
                              styles.materialContent
                            }
                          >
                            <Text
                              style={
                                styles.materialLabel
                              }
                            >
                              Learning Material
                            </Text>

                            <Text
                              style={
                                styles.materialValue
                              }
                            >
                              {lecture.materialType ===
                              'None'
                                ? 'No material attached'
                                : `${lecture.materialType} available`}
                            </Text>
                          </View>

                          {lecture.materialType !==
                            'None' && (
                            <Ionicons
                              name="chevron-forward"
                              size={17}
                              color="#6630D7"
                            />
                          )}
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Arrow */}
                  <Ionicons
                    name={
                      isExpanded
                        ? 'chevron-up'
                        : 'chevron-forward'
                    }
                    size={18}
                    color="#A0A0AA"
                  />
                </Pressable>
              );
            },
          )}

          {/* Empty */}
          {filteredNotes.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="school-outline"
                  size={29}
                  color="#6630D7"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No lectures found
              </Text>

              <Text style={styles.emptyText}>
                No lecture notes are available for this
                subject yet.
              </Text>
            </View>
          )}
        </View>

        {/* ================================= */}
        {/* Teacher Connection */}
        {/* ================================= */}

        <View style={styles.connectionCard}>
          <View style={styles.connectionIcon}>
            <Ionicons
              name="sync-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.connectionContent}>
            <Text style={styles.connectionTitle}>
              Teacher Lecture Updates
            </Text>

            <Text style={styles.connectionText}>
              Lecture descriptions and materials shared
              by your teachers will appear here for your
              batch.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* ===================================== */
/* Styles */
/* ===================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 110,
  },

  /* Header */

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerContent: {
    flex: 1,
  },

  title: {
    color: '#111528',
    fontSize: 22,
    fontFamily: 'PoppinsBold',
  },

  subtitle: {
    color: '#858592',
    fontSize: 9,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  /* Batch */

  batchCard: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  batchIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  batchContent: {
    flex: 1,
  },

  batchLabel: {
    color: '#858592',
    fontSize: 7.8,
    fontFamily: 'PoppinsBold',
    letterSpacing: 0.4,
  },

  batchName: {
    color: '#171A2B',
    fontSize: 11.5,
    fontFamily: 'PoppinsBold',
    marginTop: 2,
  },

  lectureCount: {
    alignItems: 'center',
  },

  lectureCountNumber: {
    color: '#6630D7',
    fontSize: 17,
    fontFamily: 'PoppinsBold',
  },

  lectureCountLabel: {
    color: '#9999A5',
    fontSize: 7,
    fontFamily: 'PoppinsMedium',
  },

  /* Filter */

  filterSection: {
    marginTop: 14,
  },

  filterTitle: {
    color: '#555564',
    fontSize: 9.5,
    fontFamily: 'PoppinsBold',
    marginLeft: 16,
    marginBottom: 6,
  },

  filterContainer: {
    paddingHorizontal: 16,
    gap: 7,
  },

  filterButton: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },

  selectedFilter: {
    backgroundColor: '#6630D7',
  },

  filterText: {
    color: '#777784',
    fontSize: 8.5,
    fontFamily: 'PoppinsSemiBold',
  },

  selectedFilterText: {
    color: '#FFFFFF',
  },

  /* Section */

  section: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  sectionTitle: {
    color: '#171A2B',
    fontSize: 14.5,
    fontFamily: 'PoppinsBold',
  },

  sectionSubtitle: {
    color: '#858592',
    fontSize: 8.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 1,
  },

  resultBadge: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultBadgeText: {
    color: '#6630D7',
    fontSize: 9,
    fontFamily: 'PoppinsBold',
  },

  /* Lecture */

  lectureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },

  lectureBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
  },

  subjectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  physicsIcon: {
    backgroundColor: '#EEE7FF',
  },

  mathIcon: {
    backgroundColor: '#E6F0FF',
  },

  chemistryIcon: {
    backgroundColor: '#E3F7EB',
  },

  lectureContent: {
    flex: 1,
    paddingRight: 5,
  },

  subject: {
    color: '#858592',
    fontSize: 8,
    fontFamily: 'PoppinsMedium',
  },

  topic: {
    color: '#171A2B',
    fontSize: 11,
    lineHeight: 15,
    fontFamily: 'PoppinsBold',
    marginTop: 1,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  metaText: {
    color: '#9999A5',
    fontSize: 7.5,
    fontFamily: 'PoppinsRegular',
    marginLeft: 3,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#B5B5BE',
    marginHorizontal: 5,
  },

  /* Expanded */

  expandedContent: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF3',
  },

  descriptionLabel: {
    color: '#555564',
    fontSize: 8.5,
    fontFamily: 'PoppinsBold',
  },

  description: {
    color: '#777784',
    fontSize: 9,
    lineHeight: 14,
    fontFamily: 'PoppinsRegular',
    marginTop: 4,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },

  infoTextContainer: {
    marginLeft: 8,
  },

  infoLabel: {
    color: '#9999A5',
    fontSize: 7,
    fontFamily: 'PoppinsRegular',
  },

  infoValue: {
    color: '#333445',
    fontSize: 8.5,
    fontFamily: 'PoppinsSemiBold',
    marginTop: 1,
  },

  /* Material */

  materialRow: {
    marginTop: 7,
    padding: 9,
    borderRadius: 11,
    backgroundColor: '#F8F5FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  materialIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  materialContent: {
    flex: 1,
    marginLeft: 8,
  },

  materialLabel: {
    color: '#9999A5',
    fontSize: 7,
    fontFamily: 'PoppinsRegular',
  },

  materialValue: {
    color: '#333445',
    fontSize: 8.5,
    fontFamily: 'PoppinsSemiBold',
    marginTop: 1,
  },

  /* Empty */

  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: '#555564',
    fontSize: 11,
    fontFamily: 'PoppinsBold',
    marginTop: 8,
  },

  emptyText: {
    color: '#9999A5',
    fontSize: 8.5,
    textAlign: 'center',
    fontFamily: 'PoppinsRegular',
    marginTop: 3,
  },

  /* Connection */

  connectionCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 13,
    borderRadius: 17,
    backgroundColor: '#F8F5FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  connectionContent: {
    flex: 1,
  },

  connectionTitle: {
    color: '#171A2B',
    fontSize: 10.5,
    fontFamily: 'PoppinsBold',
  },

  connectionText: {
    color: '#777784',
    fontSize: 8.5,
    lineHeight: 13,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  bottomSpace: {
    height: 25,
  },
});