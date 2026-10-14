import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TestResult = {
  id: string;
  testName: string;
  subject: string;
  teacher: string;
  date: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  feedback: string;
  correctAnswers: number;
  totalQuestions: number;
};

type ResultsPageProps = {
  onContentScroll?: (event: any) => void;
};

const resultsData: TestResult[] = [
  {
    id: 'result-1',
    testName: 'Physics Unit Test',
    subject: 'Physics',
    teacher: 'Priya Sharma',
    date: '12 Sep 2026',
    marksObtained: 27,
    totalMarks: 30,
    percentage: 90,
    feedback:
      'Excellent understanding of Newton’s Laws. Keep practising numerical problems.',
    correctAnswers: 9,
    totalQuestions: 10,
  },
  {
    id: 'result-2',
    testName: 'Mathematics Chapter Test',
    subject: 'Mathematics',
    teacher: 'Rahul Sir',
    date: '08 Sep 2026',
    marksObtained: 34,
    totalMarks: 40,
    percentage: 85,
    feedback:
      'Good performance. Work a little more on quadratic equation problems.',
    correctAnswers: 17,
    totalQuestions: 20,
  },
  {
    id: 'result-3',
    testName: 'Chemistry Test',
    subject: 'Chemistry',
    teacher: 'Anjali Ma’am',
    date: '05 Sep 2026',
    marksObtained: 21,
    totalMarks: 25,
    percentage: 84,
    feedback:
      'Good work. Revise chemical equations and reaction types.',
    correctAnswers: 17,
    totalQuestions: 20,
  },
  {
    id: 'result-4',
    testName: 'Motion Test',
    subject: 'Physics',
    teacher: 'Priya Sharma',
    date: '28 Aug 2026',
    marksObtained: 24,
    totalMarks: 30,
    percentage: 80,
    feedback:
      'Good attempt. Focus on interpreting motion graphs accurately.',
    correctAnswers: 8,
    totalQuestions: 10,
  },
];

const subjects = ['All', 'Physics', 'Mathematics', 'Chemistry'];

export default function ResultsPage({
  onContentScroll,
}: ResultsPageProps) {
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [selectedResult, setSelectedResult] =
    useState<TestResult | null>(null);

  const filteredResults = useMemo(() => {
    if (subjectFilter === 'All') {
      return resultsData;
    }

    return resultsData.filter(
      (result) => result.subject === subjectFilter,
    );
  }, [subjectFilter]);

  const averagePercentage =
    resultsData.length > 0
      ? Math.round(
          resultsData.reduce(
            (sum, result) => sum + result.percentage,
            0,
          ) / resultsData.length,
        )
      : 0;

  const totalMarksObtained = resultsData.reduce(
    (sum, result) => sum + result.marksObtained,
    0,
  );

  const totalMarks = resultsData.reduce(
    (sum, result) => sum + result.totalMarks,
    0,
  );

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';

    return 'Needs Improvement';
  };

  const getPerformanceBackground = (percentage: number) => {
    if (percentage >= 90) return '#ECFDF3';
    if (percentage >= 75) return '#EEF4FF';
    if (percentage >= 60) return '#FFF7E6';

    return '#FEF2F2';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return '#16A34A';
    if (percentage >= 75) return '#2563EB';
    if (percentage >= 60) return '#D97706';

    return '#DC2626';
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
        return '#6630D7';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>My Results</Text>

            <Text style={styles.pageSubtitle}>
              Track your test performance
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="trophy-outline"
              size={24}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Overall Performance */}
        <View style={styles.overallCard}>
          <View style={styles.overallTop}>
            <View>
              <Text style={styles.overallLabel}>
                OVERALL PERFORMANCE
              </Text>

              <Text style={styles.overallPercentage}>
                {averagePercentage}%
              </Text>

              <Text style={styles.overallSubtext}>
                Average across {resultsData.length} tests
              </Text>
            </View>

            <View style={styles.circularPlaceholder}>
              <Text style={styles.circleValue}>
                {averagePercentage}%
              </Text>

              <Text style={styles.circleLabel}>
                Average
              </Text>
            </View>
          </View>

          <View style={styles.overallStats}>
            <View style={styles.overallStat}>
              <Text style={styles.statValue}>
                {totalMarksObtained}
              </Text>

              <Text style={styles.statLabel}>
                Marks Obtained
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.overallStat}>
              <Text style={styles.statValue}>
                {totalMarks}
              </Text>

              <Text style={styles.statLabel}>
                Total Marks
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.overallStat}>
              <Text style={styles.statValue}>
                {resultsData.length}
              </Text>

              <Text style={styles.statLabel}>
                Tests
              </Text>
            </View>
          </View>
        </View>

        {/* Subject Filter */}
        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>
            Filter by Subject
          </Text>

          <Text style={styles.resultCount}>
            {filteredResults.length} Results
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {subjects.map((subject) => {
            const active = subjectFilter === subject;

            return (
              <Pressable
                key={subject}
                onPress={() => setSubjectFilter(subject)}
                style={[
                  styles.filterChip,
                  active && styles.activeFilterChip,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.activeFilterText,
                  ]}
                >
                  {subject}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Results */}
        <Text style={styles.sectionTitle}>
          Test History
        </Text>

        {filteredResults.map((result) => (
          <Pressable
            key={result.id}
            style={styles.resultCard}
            onPress={() => setSelectedResult(result)}
          >
            <View style={styles.resultTopRow}>
              <View
                style={[
                  styles.subjectIcon,
                  {
                    backgroundColor:
                      result.subject === 'Physics'
                        ? '#EEE7FF'
                        : result.subject === 'Mathematics'
                        ? '#EAF4FF'
                        : '#EAFBF1',
                  },
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={21}
                  color={getSubjectColor(result.subject)}
                />
              </View>

              <View style={styles.resultMain}>
                <Text
                  style={styles.resultTitle}
                  numberOfLines={2}
                >
                  {result.testName}
                </Text>

                <Text style={styles.resultSubject}>
                  {result.subject} • {result.teacher}
                </Text>

                <View style={styles.dateRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color="#999"
                  />

                  <Text style={styles.dateText}>
                    {result.date}
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color="#999"
              />
            </View>

            <View style={styles.scoreSection}>
              <View>
                <Text style={styles.scoreLabel}>
                  Score
                </Text>

                <Text style={styles.scoreText}>
                  {result.marksObtained}{' '}
                  <Text style={styles.scoreTotal}>
                    / {result.totalMarks}
                  </Text>
                </Text>
              </View>

              <View style={styles.percentageContainer}>
                <Text
                  style={[
                    styles.percentageText,
                    {
                      color: getPerformanceColor(
                        result.percentage,
                      ),
                    },
                  ]}
                >
                  {result.percentage}%
                </Text>

                <View
                  style={[
                    styles.performanceBadge,
                    {
                      backgroundColor:
                        getPerformanceBackground(
                          result.percentage,
                        ),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.performanceText,
                      {
                        color: getPerformanceColor(
                          result.percentage,
                        ),
                      },
                    ]}
                  >
                    {getPerformanceLabel(
                      result.percentage,
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${result.percentage}%`,
                    backgroundColor: getSubjectColor(
                      result.subject,
                    ),
                  },
                ]}
              />
            </View>

            <View style={styles.viewDetailsRow}>
              <Text style={styles.viewDetailsText}>
                View Result Details
              </Text>

              <Ionicons
                name="chevron-forward"
                size={16}
                color="#6630D7"
              />
            </View>
          </Pressable>
        ))}

        {/* Performance Note */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceIcon}>
            <Ionicons
              name="analytics-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.performanceContent}>
            <Text style={styles.performanceTitle}>
              Keep improving
            </Text>

            <Text style={styles.performanceDescription}>
              Your test results can help you identify strong
              subjects and topics that need more practice.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Result Details Modal */}
      <Modal
        visible={selectedResult !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedResult(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Result Details
              </Text>

              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedResult(null)}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#555"
                />
              </Pressable>
            </View>

            {selectedResult && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                <View
                  style={[
                    styles.modalSubjectIcon,
                    {
                      backgroundColor:
                        selectedResult.subject === 'Physics'
                          ? '#EEE7FF'
                          : selectedResult.subject ===
                            'Mathematics'
                          ? '#EAF4FF'
                          : '#EAFBF1',
                    },
                  ]}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={28}
                    color={getSubjectColor(
                      selectedResult.subject,
                    )}
                  />
                </View>

                <Text style={styles.detailTitle}>
                  {selectedResult.testName}
                </Text>

                <Text style={styles.detailSubject}>
                  {selectedResult.subject}
                </Text>

                <Text style={styles.detailTeacher}>
                  {selectedResult.teacher}
                </Text>

                {/* Score */}
                <View style={styles.bigScoreCard}>
                  <Text style={styles.bigScoreLabel}>
                    YOUR SCORE
                  </Text>

                  <Text
                    style={[
                      styles.bigScore,
                      {
                        color: getPerformanceColor(
                          selectedResult.percentage,
                        ),
                      },
                    ]}
                  >
                    {selectedResult.marksObtained}
                    <Text style={styles.bigScoreTotal}>
                      {' '}
                      / {selectedResult.totalMarks}
                    </Text>
                  </Text>

                  <Text
                    style={[
                      styles.bigPercentage,
                      {
                        color: getPerformanceColor(
                          selectedResult.percentage,
                        ),
                      },
                    ]}
                  >
                    {selectedResult.percentage}%
                  </Text>

                  <View
                    style={[
                      styles.bigPerformanceBadge,
                      {
                        backgroundColor:
                          getPerformanceBackground(
                            selectedResult.percentage,
                          ),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bigPerformanceText,
                        {
                          color: getPerformanceColor(
                            selectedResult.percentage,
                          ),
                        },
                      ]}
                    >
                      {getPerformanceLabel(
                        selectedResult.percentage,
                      )}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailGrid}>
                  <View style={styles.detailGridItem}>
                    <View style={styles.detailGridIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#6630D7"
                      />
                    </View>

                    <Text style={styles.gridLabel}>
                      Test Date
                    </Text>

                    <Text style={styles.gridValue}>
                      {selectedResult.date}
                    </Text>
                  </View>

                  <View style={styles.detailGridItem}>
                    <View style={styles.detailGridIcon}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color="#16A34A"
                      />
                    </View>

                    <Text style={styles.gridLabel}>
                      Correct
                    </Text>

                    <Text style={styles.gridValue}>
                      {selectedResult.correctAnswers} /{' '}
                      {selectedResult.totalQuestions}
                    </Text>
                  </View>
                </View>

                {/* Teacher Feedback */}
                <View style={styles.feedbackCard}>
                  <View style={styles.feedbackHeader}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={20}
                      color="#6630D7"
                    />

                    <Text style={styles.feedbackTitle}>
                      Teacher Feedback
                    </Text>
                  </View>

                  <Text style={styles.feedbackText}>
                    {selectedResult.feedback}
                  </Text>
                </View>

                {/* Improvement */}
                <View style={styles.improvementCard}>
                  <View style={styles.improvementIcon}>
                    <Ionicons
                      name="bulb-outline"
                      size={19}
                      color="#D97706"
                    />
                  </View>

                  <View style={styles.improvementContent}>
                    <Text style={styles.improvementTitle}>
                      Suggested Focus
                    </Text>

                    <Text style={styles.improvementText}>
                      Review incorrect questions and revise
                      the related topics before your next
                      test.
                    </Text>
                  </View>
                </View>

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

  overallCard: {
    backgroundColor: '#6630D7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },

  overallTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  overallLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#DCCFFF',
    letterSpacing: 0.8,
  },

  overallPercentage: {
    fontFamily: 'PoppinsBold',
    fontSize: 31,
    color: '#fff',
    marginTop: 2,
  },

  overallSubtext: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#DDD2FF',
  },

  circularPlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  circleValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#fff',
  },

  circleLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#DDD2FF',
    marginTop: -1,
  },

  overallStats: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  overallStat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: '#fff',
  },

  statLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#DDD2FF',
    marginTop: 1,
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
    marginBottom: 9,
  },

  resultCount: {
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

  resultCard: {
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

  resultTopRow: {
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

  resultMain: {
    flex: 1,
    paddingRight: 7,
  },

  resultTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#292532',
    lineHeight: 19,
  },

  resultSubject: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#777',
    marginTop: 3,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  dateText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
    marginLeft: 4,
  },

  scoreSection: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  scoreLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  scoreText: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#292532',
    marginTop: 1,
  },

  scoreTotal: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#999',
  },

  percentageContainer: {
    alignItems: 'flex-end',
  },

  percentageText: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  performanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 3,
  },

  performanceText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
  },

  progressTrack: {
    height: 5,
    backgroundColor: '#F0EDF4',
    borderRadius: 5,
    marginTop: 13,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 5,
  },

  viewDetailsRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0EDF4',
    marginTop: 12,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  viewDetailsText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#6630D7',
  },

  performanceCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    marginTop: 3,
  },

  performanceIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  performanceContent: {
    flex: 1,
  },

  performanceTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#4B278F',
  },

  performanceDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#66558A',
    marginTop: 2,
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
    maxHeight: '91%',
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
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  detailTeacher: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#777',
    marginTop: 3,
    marginBottom: 14,
  },

  bigScoreCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 17,
    alignItems: 'center',
  },

  bigScoreLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#999',
    letterSpacing: 0.8,
  },

  bigScore: {
    fontFamily: 'PoppinsBold',
    fontSize: 32,
    marginTop: 3,
  },

  bigScoreTotal: {
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    color: '#999',
  },

  bigPercentage: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    marginTop: -2,
  },

  bigPerformanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    marginTop: 5,
  },

  bigPerformanceText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
  },

  detailGrid: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },

  detailGridItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
  },

  detailGridIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },

  gridLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  gridValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#444',
    marginTop: 2,
  },

  feedbackCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 15,
    padding: 13,
    marginTop: 12,
  },

  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  feedbackTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#4B278F',
    marginLeft: 7,
  },

  feedbackText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    color: '#66558A',
    marginTop: 7,
  },

  improvementCard: {
    backgroundColor: '#FFF7E6',
    borderRadius: 15,
    padding: 13,
    marginTop: 12,
    flexDirection: 'row',
  },

  improvementIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  improvementContent: {
    flex: 1,
  },

  improvementTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#92400E',
  },

  improvementText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#9A6B2E',
    marginTop: 2,
  },
});