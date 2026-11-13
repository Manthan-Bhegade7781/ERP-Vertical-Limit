import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchStudentUpcomingTests,
  type StudentUpcomingTest,
} from '@/services/examinations';

type UpcomingTestsPageProps = {
  onContentScroll?: (event: any) => void;
  onTakeTest?: (test: StudentUpcomingTest) => void;
  onViewResults?: () => void;
};

export default function UpcomingTestsPage({
  onContentScroll,
  onTakeTest,
  onViewResults,
}: UpcomingTestsPageProps) {
  const [tests, setTests] = useState<StudentUpcomingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [selectedTest, setSelectedTest] = useState<StudentUpcomingTest | null>(null);

  const loadTests = useCallback(async () => {
    try {
      const data = await fetchStudentUpcomingTests();
      setTests(data);
    } catch (err) {
      console.log('Error fetching student upcoming tests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTests();
  }, [loadTests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadTests();
  }, [loadTests]);

  const subjects = useMemo(() => {
    const list = new Set<string>();
    tests.forEach((t) => {
      if (t.subject) list.add(t.subject);
    });
    return ['All', ...Array.from(list)];
  }, [tests]);

  const filteredTests = useMemo(() => {
    if (subjectFilter === 'All') {
      return tests;
    }

    return tests.filter(
      (test) => test.subject === subjectFilter,
    );
  }, [tests, subjectFilter]);

  const getSubjectBackground = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return '#EEE7FF';
      case 'Mathematics':
        return '#EAF4FF';
      case 'Chemistry':
        return '#EAFBF1';
      default:
        return '#F1EEF5';
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return '#6630D7';
      case 'Mathematics':
        return '#2563EB';
      case 'Chemistry':
        return '#16A34A';
      default:
        return '#666';
    }
  };

  const handleTakeTest = (test: StudentUpcomingTest) => {
    setSelectedTest(null);

    if (onTakeTest) {
      onTakeTest(test);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6630D7"
            colors={['#6630D7']}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>Upcoming Tests</Text>

            <Text style={styles.pageSubtitle}>
              Stay prepared for your upcoming exams
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="clipboard-outline"
              size={24}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Tab switcher: Upcoming Tests vs Results */}
        <View style={styles.tabSwitcher}>
          <View style={[styles.tabButton, styles.activeTabButton]}>
            <Ionicons name="calendar-outline" size={17} color="#6630D7" />
            <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>Upcoming Tests</Text>
          </View>

          <Pressable
            style={styles.tabButton}
            onPress={() => {
              if (onViewResults) {
                onViewResults();
              }
            }}
          >
            <Ionicons name="trophy-outline" size={17} color="#7E7292" />
            <Text style={styles.tabButtonText}>Past Results</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6630D7" />
            <Text style={styles.loadingText}>Loading upcoming tests...</Text>
          </View>
        ) : (
          <>

        {/* Next Test */}
        {filteredTests.length > 0 && (
          <View style={styles.nextTestCard}>
            <View style={styles.nextTestTop}>
              <View>
                <Text style={styles.nextTestLabel}>
                  NEXT TEST
                </Text>

                <Text style={styles.nextTestTitle}>
                  {filteredTests[0].title}
                </Text>

                <Text style={styles.nextTestSubject}>
                  {filteredTests[0].subject} •{' '}
                  {filteredTests[0].teacher}
                </Text>
              </View>

              <View style={styles.nextTestIcon}>
                <Ionicons
                  name="school-outline"
                  size={25}
                  color="#6630D7"
                />
              </View>
            </View>

            <View style={styles.nextTestDetails}>
              <View style={styles.nextDetail}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color="#6630D7"
                />

                <View>
                  <Text style={styles.detailSmallLabel}>
                    Date
                  </Text>

                  <Text style={styles.detailValue}>
                    {filteredTests[0].date}
                  </Text>
                </View>
              </View>

              <View style={styles.nextDetail}>
                <Ionicons
                  name="time-outline"
                  size={17}
                  color="#6630D7"
                />

                <View>
                  <Text style={styles.detailSmallLabel}>
                    Time
                  </Text>

                  <Text style={styles.detailValue}>
                    {filteredTests[0].time}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              style={styles.nextDetailsButton}
              onPress={() => setSelectedTest(filteredTests[0])}
            >
              <Text style={styles.nextDetailsButtonText}>
                View Test Details
              </Text>

              <Ionicons
                name="chevron-forward"
                size={17}
                color="#6630D7"
              />
            </Pressable>
          </View>
        )}

        {/* Subject Filter */}
        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>
            Filter by Subject
          </Text>

          <Text style={styles.testCount}>
            {filteredTests.length} Tests
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {subjects.map((subject) => {
            const isActive = subjectFilter === subject;

            return (
              <Pressable
                key={subject}
                onPress={() => setSubjectFilter(subject)}
                style={[
                  styles.filterChip,
                  isActive && styles.activeFilterChip,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.activeFilterText,
                  ]}
                >
                  {subject}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Test List */}
        <Text style={styles.sectionTitle}>
          All Upcoming Tests
        </Text>

        {filteredTests.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={28}
                color="#6630D7"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No tests found
            </Text>

            <Text style={styles.emptyText}>
              There are no upcoming tests for this subject.
            </Text>
          </View>
        ) : (
          filteredTests.map((test) => (
            <Pressable
              key={test.id}
              style={styles.testCard}
              onPress={() => setSelectedTest(test)}
            >
              <View style={styles.testTopRow}>
                <View
                  style={[
                    styles.subjectIcon,
                    {
                      backgroundColor: getSubjectBackground(
                        test.subject,
                      ),
                    },
                  ]}
                >
                  <Ionicons
                    name="book-outline"
                    size={21}
                    color={getSubjectColor(test.subject)}
                  />
                </View>

                <View style={styles.testMain}>
                  <Text
                    style={styles.testTitle}
                    numberOfLines={2}
                  >
                    {test.title}
                  </Text>

                  <Text style={styles.testSubject}>
                    {test.subject} • {test.teacher}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#999"
                />
              </View>

              <View style={styles.testInfoRow}>
                <View style={styles.testInfoItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#777"
                  />

                  <Text style={styles.testInfoText}>
                    {test.date}
                  </Text>
                </View>

                <View style={styles.testInfoItem}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#777"
                  />

                  <Text style={styles.testInfoText}>
                    {test.time}
                  </Text>
                </View>
              </View>

              <View style={styles.testBottomRow}>
                <View style={styles.testMeta}>
                  <Ionicons
                    name="hourglass-outline"
                    size={15}
                    color="#6630D7"
                  />

                  <Text style={styles.testMetaText}>
                    {test.duration}
                  </Text>
                </View>

                <View style={styles.testMeta}>
                  <Ionicons
                    name="trophy-outline"
                    size={15}
                    color="#6630D7"
                  />

                  <Text style={styles.testMetaText}>
                    {test.totalMarks} marks
                  </Text>
                </View>

                <View style={styles.testMeta}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color="#6630D7"
                  />

                  <Text style={styles.testMetaText}>
                    {test.room}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        )}

        {/* Preparation Card */}
        <View style={styles.preparationCard}>
          <View style={styles.preparationIcon}>
            <Ionicons
              name="bulb-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.preparationContent}>
            <Text style={styles.preparationTitle}>
              Prepare for your tests
            </Text>

            <Text style={styles.preparationText}>
              Review your lecture notes, study materials and
              previous results before each test.
            </Text>
          </View>
        </View>
        </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Test Details Modal */}
      <Modal
        visible={selectedTest !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Test Details
              </Text>

              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedTest(null)}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#555"
                />
              </Pressable>
            </View>

            {selectedTest && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                <View
                  style={[
                    styles.modalSubjectIcon,
                    {
                      backgroundColor: getSubjectBackground(
                        selectedTest.subject,
                      ),
                    },
                  ]}
                >
                  <Ionicons
                    name="clipboard-outline"
                    size={28}
                    color={getSubjectColor(
                      selectedTest.subject,
                    )}
                  />
                </View>

                <Text style={styles.detailTitle}>
                  {selectedTest.title}
                </Text>

                <Text style={styles.detailSubject}>
                  {selectedTest.subject}
                </Text>

                <Text style={styles.teacherText}>
                  Conducted by {selectedTest.teacher}
                </Text>

                {/* Date */}
                <View style={styles.detailBox}>
                  <View style={styles.detailBoxIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6630D7"
                    />
                  </View>

                  <View>
                    <Text style={styles.detailBoxLabel}>
                      Date
                    </Text>

                    <Text style={styles.detailBoxValue}>
                      {selectedTest.day},{' '}
                      {selectedTest.date}
                    </Text>
                  </View>
                </View>

                {/* Time */}
                <View style={styles.detailBox}>
                  <View style={styles.detailBoxIcon}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color="#6630D7"
                    />
                  </View>

                  <View>
                    <Text style={styles.detailBoxLabel}>
                      Time & Duration
                    </Text>

                    <Text style={styles.detailBoxValue}>
                      {selectedTest.time} •{' '}
                      {selectedTest.duration}
                    </Text>
                  </View>
                </View>

                {/* Marks */}
                <View style={styles.detailBox}>
                  <View style={styles.detailBoxIcon}>
                    <Ionicons
                      name="trophy-outline"
                      size={20}
                      color="#6630D7"
                    />
                  </View>

                  <View>
                    <Text style={styles.detailBoxLabel}>
                      Total Marks
                    </Text>

                    <Text style={styles.detailBoxValue}>
                      {selectedTest.totalMarks} Marks
                    </Text>
                  </View>
                </View>

                {/* Room */}
                <View style={styles.detailBox}>
                  <View style={styles.detailBoxIcon}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#6630D7"
                    />
                  </View>

                  <View>
                    <Text style={styles.detailBoxLabel}>
                      Location
                    </Text>

                    <Text style={styles.detailBoxValue}>
                      {selectedTest.room} •{' '}
                      {selectedTest.mode}
                    </Text>
                  </View>
                </View>

                {/* Syllabus */}
                <View style={styles.syllabusCard}>
                  <Text style={styles.syllabusTitle}>
                    Syllabus
                  </Text>

                  <Text style={styles.syllabusText}>
                    {selectedTest.syllabus}
                  </Text>
                </View>

                {/* Take Test */}
                <Pressable
                  style={styles.takeTestButton}
                  onPress={() =>
                    handleTakeTest(selectedTest)
                  }
                >
                  <Ionicons
                    name="play-circle-outline"
                    size={20}
                    color="#fff"
                  />

                  <Text style={styles.takeTestButtonText}>
                    Take Test
                  </Text>
                </Pressable>

                <View style={{ height: 25 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EBE5F7',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },

  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },

  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  tabButtonText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#7E7292',
  },

  activeTabButtonText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#8A82A0',
    marginTop: 10,
  },

  headerText: {
    flex: 1,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 23,
    color: '#24212D',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  nextTestCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 19,
    padding: 16,
    marginBottom: 18,
  },

  nextTestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  nextTestLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7B61B5',
    letterSpacing: 0.8,
  },

  nextTestTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#302343',
    marginTop: 4,
  },

  nextTestSubject: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#77688D',
    marginTop: 2,
  },

  nextTestIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  nextTestDetails: {
    flexDirection: 'row',
    marginTop: 17,
    gap: 12,
  },

  nextDetail: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailSmallLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
    marginLeft: 7,
  },

  detailValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#444',
    marginLeft: 7,
    marginTop: 1,
  },

  nextDetailsButton: {
    marginTop: 12,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  nextDetailsButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#6630D7',
    marginRight: 5,
  },

  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
    marginBottom: 9,
  },

  testCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#6630D7',
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 9,
  },

  filterContent: {
    gap: 8,
    paddingBottom: 16,
  },

  filterChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4DFEC',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },

  activeFilterChip: {
    backgroundColor: '#6630D7',
    borderColor: '#6630D7',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#666',
  },

  activeFilterText: {
    color: '#fff',
  },

  testCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  testTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  subjectIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  testMain: {
    flex: 1,
    paddingRight: 7,
  },

  testTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#292532',
    lineHeight: 19,
  },

  testSubject: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#777',
    marginTop: 3,
  },

  testInfoRow: {
    flexDirection: 'row',
    marginTop: 13,
    gap: 15,
  },

  testInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  testInfoText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#777',
    marginLeft: 5,
  },

  testBottomRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0EDF4',
    marginTop: 12,
    paddingTop: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  testMetaText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#777',
    marginLeft: 4,
  },

  preparationCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    marginTop: 3,
  },

  preparationIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  preparationContent: {
    flex: 1,
  },

  preparationTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#4B278F',
  },

  preparationText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#66558A',
    marginTop: 2,
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  detailsModal: {
    backgroundColor: '#F7F5FC',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#D8D4DF',
    alignSelf: 'center',
    marginTop: 9,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#292532',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F1EEF5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },

  modalSubjectIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },

  detailTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 19,
    color: '#292532',
    lineHeight: 26,
  },

  detailSubject: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#6630D7',
    marginTop: 3,
  },

  teacherText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#777',
    marginTop: 3,
    marginBottom: 14,
  },

  detailBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  detailBoxIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  detailBoxLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#999',
  },

  detailBoxValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#444',
    marginTop: 2,
  },

  syllabusCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 15,
    padding: 13,
    marginTop: 5,
  },

  syllabusTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#4B278F',
  },

  syllabusText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    color: '#66558A',
    marginTop: 5,
  },

  takeTestButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6630D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  takeTestButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#fff',
    marginLeft: 7,
  },
});