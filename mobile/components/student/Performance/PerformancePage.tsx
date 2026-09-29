import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PerformancePageProps = {
  onContentScroll?: (event: any) => void;
};

type SubjectPerformance = {
  subject: string;
  percentage: number;
  attendance: number;
  tests: number;
  marks: string;
  color: string;
};

type TestPerformance = {
  id: string;
  test: string;
  subject: string;
  percentage: number;
  date: string;
};

const subjectPerformance: SubjectPerformance[] = [
  {
    subject: 'Physics',
    percentage: 85,
    attendance: 94,
    tests: 3,
    marks: '76 / 90',
    color: '#6630D7',
  },
  {
    subject: 'Mathematics',
    percentage: 82,
    attendance: 91,
    tests: 4,
    marks: '102 / 125',
    color: '#2563EB',
  },
  {
    subject: 'Chemistry',
    percentage: 84,
    attendance: 92,
    tests: 3,
    marks: '84 / 100',
    color: '#16A34A',
  },
];

const testPerformance: TestPerformance[] = [
  {
    id: 'performance-test-1',
    test: 'Physics Unit Test',
    subject: 'Physics',
    percentage: 90,
    date: '12 Sep 2026',
  },
  {
    id: 'performance-test-2',
    test: 'Mathematics Chapter Test',
    subject: 'Mathematics',
    percentage: 85,
    date: '08 Sep 2026',
  },
  {
    id: 'performance-test-3',
    test: 'Chemistry Test',
    subject: 'Chemistry',
    percentage: 84,
    date: '05 Sep 2026',
  },
  {
    id: 'performance-test-4',
    test: 'Motion Test',
    subject: 'Physics',
    percentage: 80,
    date: '28 Aug 2026',
  },
  {
    id: 'performance-test-5',
    test: 'Mathematics Practice Test',
    subject: 'Mathematics',
    percentage: 78,
    date: '24 Aug 2026',
  },
];

const attendanceData = [
  {
    subject: 'Physics',
    attendance: 94,
    performance: 85,
  },
  {
    subject: 'Mathematics',
    attendance: 91,
    performance: 82,
  },
  {
    subject: 'Chemistry',
    attendance: 92,
    performance: 84,
  },
];

const filters = ['Overall', 'Physics', 'Mathematics', 'Chemistry'];

export default function PerformancePage({
  onContentScroll,
}: PerformancePageProps) {
  const [selectedFilter, setSelectedFilter] =
    useState('Overall');

  const overallPercentage = useMemo(() => {
    const total = subjectPerformance.reduce(
      (sum, item) => sum + item.percentage,
      0,
    );

    return Math.round(
      total / subjectPerformance.length,
    );
  }, []);

  const overallAttendance = useMemo(() => {
    const total = subjectPerformance.reduce(
      (sum, item) => sum + item.attendance,
      0,
    );

    return Math.round(
      total / subjectPerformance.length,
    );
  }, []);

  const selectedSubject =
    selectedFilter === 'Overall'
      ? null
      : subjectPerformance.find(
          (item) => item.subject === selectedFilter,
        );

  const displayedSubjects = selectedSubject
    ? [selectedSubject]
    : subjectPerformance;

  const displayedTests =
    selectedFilter === 'Overall'
      ? testPerformance
      : testPerformance.filter(
          (item) => item.subject === selectedFilter,
        );

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return '#16A34A';
    if (percentage >= 75) return '#2563EB';
    if (percentage >= 60) return '#D97706';

    return '#DC2626';
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';

    return 'Needs Focus';
  };

  const getSubjectBackground = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return '#EEE7FF';
      case 'Mathematics':
        return '#EAF4FF';
      case 'Chemistry':
        return '#EAFBF1';
      default:
        return '#F3F0F8';
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
            <Text style={styles.pageTitle}>
              Performance
            </Text>

            <Text style={styles.pageSubtitle}>
              Understand your academic progress
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="analytics-outline"
              size={24}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Overall Performance */}
        <View style={styles.overallCard}>
          <View style={styles.overallTopRow}>
            <View style={styles.overallLeft}>
              <Text style={styles.overallLabel}>
                OVERALL PERFORMANCE
              </Text>

              <Text style={styles.overallPercentage}>
                {selectedSubject
                  ? `${selectedSubject.percentage}%`
                  : `${overallPercentage}%`}
              </Text>

              <Text style={styles.overallDescription}>
                {selectedSubject
                  ? `${selectedSubject.subject} performance`
                  : 'Average across all subjects'}
              </Text>
            </View>

            <View style={styles.performanceCircle}>
              <Text style={styles.circlePercentage}>
                {selectedSubject
                  ? selectedSubject.percentage
                  : overallPercentage}
                %
              </Text>

              <Text style={styles.circleLabel}>
                Score
              </Text>
            </View>
          </View>

          <View style={styles.overallStats}>
            <View style={styles.overallStat}>
              <Ionicons
                name="school-outline"
                size={18}
                color="#fff"
              />

              <Text style={styles.overallStatValue}>
                {selectedSubject
                  ? selectedSubject.tests
                  : 10}
              </Text>

              <Text style={styles.overallStatLabel}>
                Tests
              </Text>
            </View>

            <View style={styles.overallDivider} />

            <View style={styles.overallStat}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#fff"
              />

              <Text style={styles.overallStatValue}>
                {selectedSubject
                  ? selectedSubject.attendance
                  : overallAttendance}
                %
              </Text>

              <Text style={styles.overallStatLabel}>
                Attendance
              </Text>
            </View>

            <View style={styles.overallDivider} />

            <View style={styles.overallStat}>
              <Ionicons
                name="trending-up-outline"
                size={18}
                color="#fff"
              />

              <Text style={styles.overallStatValue}>
                {selectedSubject
                  ? getPerformanceLabel(
                      selectedSubject.percentage,
                    )
                  : 'Good'}
              </Text>

              <Text style={styles.overallStatLabel}>
                Progress
              </Text>
            </View>
          </View>
        </View>

        {/* Filter */}
        <Text style={styles.sectionTitle}>
          Performance View
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => {
            const active = selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
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
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Subject Performance */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleNoMargin}>
            Subject Performance
          </Text>

          <Ionicons
            name="bar-chart-outline"
            size={19}
            color="#6630D7"
          />
        </View>

        {displayedSubjects.map((subject) => (
          <View
            key={subject.subject}
            style={styles.subjectCard}
          >
            <View style={styles.subjectTopRow}>
              <View
                style={[
                  styles.subjectIcon,
                  {
                    backgroundColor:
                      getSubjectBackground(
                        subject.subject,
                      ),
                  },
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={subject.color}
                />
              </View>

              <View style={styles.subjectMain}>
                <Text style={styles.subjectName}>
                  {subject.subject}
                </Text>

                <Text style={styles.subjectTests}>
                  {subject.tests} tests completed
                </Text>
              </View>

              <View style={styles.subjectScore}>
                <Text
                  style={[
                    styles.subjectPercentage,
                    {
                      color: getPerformanceColor(
                        subject.percentage,
                      ),
                    },
                  ]}
                >
                  {subject.percentage}%
                </Text>

                <Text style={styles.subjectScoreLabel}>
                  {getPerformanceLabel(
                    subject.percentage,
                  )}
                </Text>
              </View>
            </View>

            {/* Performance bar */}
            <View style={styles.barContainer}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${subject.percentage}%`,
                      backgroundColor: subject.color,
                    },
                  ]}
                />
              </View>

              <Text style={styles.barPercentage}>
                {subject.percentage}%
              </Text>
            </View>

            <View style={styles.subjectStats}>
              <View style={styles.subjectStat}>
                <Text style={styles.subjectStatLabel}>
                  Marks
                </Text>

                <Text style={styles.subjectStatValue}>
                  {subject.marks}
                </Text>
              </View>

              <View style={styles.subjectStat}>
                <Text style={styles.subjectStatLabel}>
                  Attendance
                </Text>

                <Text style={styles.subjectStatValue}>
                  {subject.attendance}%
                </Text>
              </View>

              <View style={styles.subjectStat}>
                <Text style={styles.subjectStatLabel}>
                  Tests
                </Text>

                <Text style={styles.subjectStatValue}>
                  {subject.tests}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Test Trend */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleNoMargin}>
            Test Performance Trend
          </Text>

          <Ionicons
            name="trending-up-outline"
            size={19}
            color="#6630D7"
          />
        </View>

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={styles.trendTitle}>
                Recent Test Scores
              </Text>

              <Text style={styles.trendSubtitle}>
                Your latest test performance
              </Text>
            </View>

            <View style={styles.trendAverage}>
              <Text style={styles.trendAverageValue}>
                {Math.round(
                  displayedTests.reduce(
                    (sum, item) =>
                      sum + item.percentage,
                    0,
                  ) / displayedTests.length,
                )}
                %
              </Text>

              <Text style={styles.trendAverageLabel}>
                Average
              </Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            {displayedTests.map((item, index) => (
              <View
                key={item.id}
                style={styles.chartItem}
              >
                <View style={styles.chartBarArea}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: `${Math.max(
                          item.percentage * 0.65,
                          25,
                        )}%`,
                        backgroundColor:
                          getPerformanceColor(
                            item.percentage,
                          ),
                      },
                    ]}
                  />
                </View>

                <Text style={styles.chartPercentage}>
                  {item.percentage}%
                </Text>

                <Text
                  style={styles.chartLabel}
                  numberOfLines={1}
                >
                  {item.subject}
                </Text>

                <Text style={styles.chartIndex}>
                  {index + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attendance Relationship */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleNoMargin}>
            Attendance & Performance
          </Text>

          <Ionicons
            name="calendar-outline"
            size={19}
            color="#6630D7"
          />
        </View>

        <View style={styles.attendanceCard}>
          <Text style={styles.attendanceDescription}>
            Compare your attendance with your academic
            performance by subject.
          </Text>

          {attendanceData.map((item) => (
            <View
              key={item.subject}
              style={styles.attendanceSubject}
            >
              <View style={styles.attendanceSubjectHeader}>
                <Text style={styles.attendanceSubjectName}>
                  {item.subject}
                </Text>

                <Text style={styles.attendanceSubjectValue}>
                  {item.attendance}% attendance
                </Text>
              </View>

              <View style={styles.attendanceBars}>
                <View style={styles.attendanceBarWrapper}>
                  <Text style={styles.attendanceBarLabel}>
                    Attendance
                  </Text>

                  <View style={styles.smallBarTrack}>
                    <View
                      style={[
                        styles.smallBarFill,
                        {
                          width: `${item.attendance}%`,
                          backgroundColor: '#6630D7',
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.attendanceBarWrapper}>
                  <Text style={styles.attendanceBarLabel}>
                    Performance
                  </Text>

                  <View style={styles.smallBarTrack}>
                    <View
                      style={[
                        styles.smallBarFill,
                        {
                          width: `${item.performance}%`,
                          backgroundColor: '#2563EB',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleNoMargin}>
            Performance Insights
          </Text>

          <Ionicons
            name="bulb-outline"
            size={19}
            color="#6630D7"
          />
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons
              name="trophy-outline"
              size={21}
              color="#16A34A"
            />
          </View>

          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>
              Strong Areas
            </Text>

            <Text style={styles.insightText}>
              Physics is currently your strongest subject with
              an 85% average performance.
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons
              name="bulb-outline"
              size={21}
              color="#D97706"
            />
          </View>

          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>
              Keep Practising
            </Text>

            <Text style={styles.insightText}>
              Continue revising Mathematics topics and
              practise more questions before upcoming tests.
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons
              name="calendar-outline"
              size={21}
              color="#2563EB"
            />
          </View>

          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>
              Attendance Matters
            </Text>

            <Text style={styles.insightText}>
              Maintaining regular attendance helps you stay
              updated with lessons and class activities.
            </Text>
          </View>
        </View>

        {/* Recent Results */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleNoMargin}>
            Recent Results
          </Text>

          <Text style={styles.recentCount}>
            {displayedTests.length}
          </Text>
        </View>

        {displayedTests.slice(0, 4).map((item) => (
          <View
            key={`recent-${item.id}`}
            style={styles.recentResultCard}
          >
            <View
              style={[
                styles.recentIcon,
                {
                  backgroundColor:
                    getSubjectBackground(
                      item.subject,
                    ),
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={19}
                color={getPerformanceColor(
                  item.percentage,
                )}
              />
            </View>

            <View style={styles.recentMain}>
              <Text
                style={styles.recentTitle}
                numberOfLines={1}
              >
                {item.test}
              </Text>

              <Text style={styles.recentSubtitle}>
                {item.subject} • {item.date}
              </Text>
            </View>

            <View style={styles.recentScore}>
              <Text
                style={[
                  styles.recentPercentage,
                  {
                    color: getPerformanceColor(
                      item.percentage,
                    ),
                  },
                ]}
              >
                {item.percentage}%
              </Text>

              <Text style={styles.recentLabel}>
                Score
              </Text>
            </View>
          </View>
        ))}

        {/* Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              About Performance
            </Text>

            <Text style={styles.infoText}>
              Performance data is based on your tests,
              results and attendance records. Your teacher
              feedback will also appear in the relevant result
              details.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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

  overallTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  overallLeft: {
    flex: 1,
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

  overallDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#DDD2FF',
  },

  performanceCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  circlePercentage: {
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

  overallStatValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },

  overallStatLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#DDD2FF',
    marginTop: 1,
    textAlign: 'center',
  },

  overallDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
    marginBottom: 9,
  },

  sectionTitleNoMargin: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
  },

  filterContent: {
    gap: 8,
    paddingBottom: 17,
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

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 3,
  },

  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  subjectTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  subjectMain: {
    flex: 1,
  },

  subjectName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#292532',
  },

  subjectTests: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#888',
    marginTop: 2,
  },

  subjectScore: {
    alignItems: 'flex-end',
  },

  subjectPercentage: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
  },

  subjectScoreLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#888',
    marginTop: 1,
  },

  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0EDF4',
    borderRadius: 6,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    borderRadius: 6,
  },

  barPercentage: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#777',
    marginLeft: 8,
    width: 27,
    textAlign: 'right',
  },

  subjectStats: {
    borderTopWidth: 1,
    borderTopColor: '#F0EDF4',
    marginTop: 12,
    paddingTop: 10,
    flexDirection: 'row',
  },

  subjectStat: {
    flex: 1,
    alignItems: 'center',
  },

  subjectStatLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  subjectStatValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#444',
    marginTop: 2,
  },

  trendCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
  },

  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  trendTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#292532',
  },

  trendSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },

  trendAverage: {
    alignItems: 'flex-end',
  },

  trendAverageValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#6630D7',
  },

  trendAverageLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  chartArea: {
    height: 170,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAF2',
  },

  chartItem: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  chartBarArea: {
    height: 115,
    width: 22,
    justifyContent: 'flex-end',
  },

  chartBar: {
    width: 22,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    minHeight: 25,
  },

  chartPercentage: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#555',
    marginTop: 5,
  },

  chartLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#888',
    marginTop: 2,
    maxWidth: 45,
  },

  chartIndex: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#BBB',
    marginBottom: 5,
    marginTop: 2,
  },

  attendanceCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
  },

  attendanceDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 15,
    color: '#777',
    marginBottom: 13,
  },

  attendanceSubject: {
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0EDF4',
  },

  attendanceSubjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  attendanceSubjectName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#444',
  },

  attendanceSubjectValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#777',
  },

  attendanceBars: {
    marginTop: 8,
    gap: 7,
  },

  attendanceBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  attendanceBarLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    width: 65,
  },

  smallBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#F0EDF4',
    overflow: 'hidden',
  },

  smallBarFill: {
    height: '100%',
    borderRadius: 5,
  },

  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    marginBottom: 9,
  },

  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F5F2FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#333',
  },

  insightText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#777',
    marginTop: 2,
  },

  recentCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#6630D7',
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  recentResultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  recentMain: {
    flex: 1,
  },

  recentTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#333',
  },

  recentSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
    marginTop: 2,
  },

  recentScore: {
    alignItems: 'flex-end',
  },

  recentPercentage: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
  },

  recentLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 1,
  },

  infoCard: {
    marginTop: 5,
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
  },

  infoIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#4B278F',
  },

  infoText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#66558A',
    marginTop: 3,
  },
});