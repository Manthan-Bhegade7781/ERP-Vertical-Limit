import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import {
  getMyClasses,
  StudentClassesData,
} from '../../../services/classes';

type Subject = {
  name: string;
  teacher: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
};

type Batch = {
  name: string;
  branch: string;
  studentsCount?: number;
  daysPerWeek?: number;
  subjects: Subject[];
};

type MyClassesPageProps = {
  data?: StudentClassesData | null;
  loading?: boolean;
  onRefresh?: () => void;
  onContentScroll?: (event: any) => void;
  onTimetablePress?: () => void;
};

const getSubjectStyle = (name: string, index: number) => {
  const lower = name.toLowerCase();
  if (lower.includes('physic')) {
    return { icon: 'flask-outline' as const, color: '#6630D7', background: '#EEE7FF' };
  }
  if (lower.includes('math')) {
    return { icon: 'calculator-outline' as const, color: '#1670E8', background: '#E6F0FF' };
  }
  if (lower.includes('chem')) {
    return { icon: 'beaker-outline' as const, color: '#22A55A', background: '#E3F7EB' };
  }
  if (lower.includes('bio')) {
    return { icon: 'leaf-outline' as const, color: '#059669', background: '#D1FAE5' };
  }
  if (lower.includes('eng')) {
    return { icon: 'book-outline' as const, color: '#F28A17', background: '#FFF0DF' };
  }
  if (lower.includes('computer') || lower.includes('cs') || lower.includes('it')) {
    return { icon: 'laptop-outline' as const, color: '#7C3AED', background: '#EDE9FE' };
  }

  const defaultStyles = [
    { icon: 'flask-outline' as const, color: '#6630D7', background: '#EEE7FF' },
    { icon: 'calculator-outline' as const, color: '#1670E8', background: '#E6F0FF' },
    { icon: 'beaker-outline' as const, color: '#22A55A', background: '#E3F7EB' },
    { icon: 'book-outline' as const, color: '#F28A17', background: '#FFF0DF' },
    { icon: 'school-outline' as const, color: '#E95386', background: '#FDECF1' },
  ];
  return defaultStyles[index % defaultStyles.length];
};

export default function MyClassesPage({
  data: initialData,
  loading: initialLoading,
  onRefresh: parentRefresh,
  onContentScroll,
  onTimetablePress,
}: MyClassesPageProps) {
  const [classesData, setClassesData] =
    useState<StudentClassesData | null>(initialData ?? null);
  const [loading, setLoading] = useState(initialLoading ?? !initialData);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await getMyClasses();
      setClassesData(res);
    } catch (err) {
      console.error('Failed to load student classes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (initialData !== undefined) {
      setClassesData(initialData);
      setLoading(Boolean(initialLoading));
    } else {
      void fetchClasses();
    }
  }, [initialData, initialLoading, fetchClasses]);

  useFocusEffect(
    useCallback(() => {
      void fetchClasses();
    }, [fetchClasses]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    if (parentRefresh) {
      parentRefresh();
    }
    await fetchClasses();
  };

  const batchesList: Batch[] = useMemo(() => {
    if (classesData?.batches && classesData.batches.length > 0) {
      return classesData.batches.map((batchItem) => ({
        name: batchItem.name,
        branch: batchItem.branch || 'Vertical Limits • Main Branch',
        studentsCount: batchItem.studentsCount,
        daysPerWeek: batchItem.daysPerWeek,
        subjects: (batchItem.subjects || []).map((sub, idx) => {
          const style = getSubjectStyle(sub.name, idx);
          return {
            name: sub.name,
            teacher: sub.teacher || 'Unassigned',
            icon: style.icon,
            color: style.color,
            background: style.background,
          };
        }),
      }));
    }
    return [];
  }, [classesData]);

  const [selectedBatch, setSelectedBatch] = useState<string>('');

  useEffect(() => {
    if (batchesList.length > 0) {
      if (!selectedBatch || !batchesList.some((b) => b.name === selectedBatch)) {
        setSelectedBatch(batchesList[0].name);
      }
    } else {
      setSelectedBatch('');
    }
  }, [batchesList, selectedBatch]);

  const [showBatchSelector, setShowBatchSelector] = useState(false);

  const currentBatch = useMemo(
    () =>
      batchesList.find((batch) => batch.name === selectedBatch) ??
      batchesList[0] ??
      null,
    [batchesList, selectedBatch],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6630D7']}
            tintColor="#6630D7"
          />
        }
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>My Classes</Text>
            <Text style={styles.pageSubtitle}>
              Your batch and subjects
            </Text>
          </View>
        </View>

        {loading && !classesData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6630D7" />
            <Text style={styles.loadingText}>Loading your classes...</Text>
          </View>
        ) : batchesList.length === 0 || !currentBatch ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="school-outline" size={36} color="#6630D7" />
            </View>
            <Text style={styles.emptyTitle}>No Classes Assigned</Text>
            <Text style={styles.emptySubtitle}>
              You are not currently enrolled in any batch. Please contact your administrator.
            </Text>
            <Pressable style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Refresh</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Batch Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CURRENT BATCH</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.batchSelector,
                  pressed && styles.pressed,
                ]}
                onPress={() => setShowBatchSelector(!showBatchSelector)}
              >
                <View style={styles.batchLeft}>
                  <View style={styles.batchIcon}>
                    <Ionicons
                      name="people-outline"
                      size={21}
                      color="#6630D7"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.batchName}>{currentBatch.name}</Text>
                    <Text style={styles.branchName}>{currentBatch.branch}</Text>
                  </View>
                </View>

                {batchesList.length > 1 && (
                  <Ionicons
                    name={showBatchSelector ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#777784"
                  />
                )}
              </Pressable>

              {showBatchSelector && batchesList.length > 1 && (
                <View style={styles.dropdown}>
                  {batchesList.map((batch, index) => {
                    const isSelected = batch.name === selectedBatch;

                    return (
                      <Pressable
                        key={`batch-${batch.name}-${index}`}
                        style={[
                          styles.dropdownItem,
                          isSelected && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedBatch(batch.name);
                          setShowBatchSelector(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            isSelected && styles.dropdownTextSelected,
                          ]}
                        >
                          {batch.name}
                        </Text>

                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={19}
                            color="#6630D7"
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Batch Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color="#1670E8"
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {currentBatch.studentsCount ?? 0}
                </Text>

                <Text style={styles.summaryLabel}>Students</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Ionicons
                    name="book-outline"
                    size={20}
                    color="#6630D7"
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {currentBatch.subjects.length}
                </Text>

                <Text style={styles.summaryLabel}>Subjects</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#22A55A"
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {currentBatch.daysPerWeek ?? 0}
                </Text>

                <Text style={styles.summaryLabel}>Days / Week</Text>
              </View>
            </View>

            {/* Subjects */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>My Subjects</Text>
                  <Text style={styles.sectionSubtitle}>
                    Teachers assigned to your batch
                  </Text>
                </View>
              </View>

              {currentBatch.subjects.length === 0 ? (
                <View style={styles.emptySubjectsBox}>
                  <Text style={styles.emptySubjectsText}>
                    No subjects assigned to this batch yet.
                  </Text>
                </View>
              ) : (
                currentBatch.subjects.map((subject, index) => (
                  <View
                    key={`${currentBatch.name}-${subject.name}-${index}`}
                    style={[
                      styles.subjectCard,
                      index !== currentBatch.subjects.length - 1 &&
                        styles.subjectBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.subjectIcon,
                        {
                          backgroundColor: subject.background,
                        },
                      ]}
                    >
                      <Ionicons
                        name={subject.icon}
                        size={22}
                        color={subject.color}
                      />
                    </View>

                    <View style={styles.subjectContent}>
                      <Text style={styles.subjectName}>{subject.name}</Text>
                      <Text style={styles.teacherName}>{subject.teacher}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Timetable Card Navigation */}
            <Pressable
              style={({ pressed }) => [
                styles.timetableCard,
                pressed && styles.pressed,
              ]}
              onPress={onTimetablePress}
            >
              <View style={styles.timetableIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#6630D7"
                />
              </View>

              <View style={styles.timetableContent}>
                <Text style={styles.timetableTitle}>View Timetable</Text>
                <Text style={styles.timetableText}>
                  Check your weekly class schedule
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color="#6630D7"
              />
            </Pressable>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 100,
  },

  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pageTitle: {
    color: '#111528',
    fontSize: 24,
    fontFamily: 'PoppinsBold',
  },

  pageSubtitle: {
    color: '#777784',
    fontSize: 10.5,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#777784',
    marginTop: 12,
  },

  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9E9EF',
    marginTop: 10,
  },

  emptyIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#171A2B',
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#858592',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 14,
  },

  retryButton: {
    backgroundColor: '#6630D7',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },

  retryButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
  },

  sectionLabel: {
    color: '#858592',
    fontSize: 9,
    fontFamily: 'PoppinsBold',
    letterSpacing: 0.5,
    marginBottom: 9,
  },

  batchSelector: {
    minHeight: 66,
    borderWidth: 1,
    borderColor: '#E9E9EF',
    borderRadius: 15,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  batchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  batchIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  batchName: {
    color: '#171A2B',
    fontSize: 12.5,
    fontFamily: 'PoppinsBold',
  },

  branchName: {
    color: '#858592',
    fontSize: 9,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E9E9EF',
    borderRadius: 14,
    overflow: 'hidden',
  },

  dropdownItem: {
    minHeight: 48,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F4',
  },

  dropdownItemSelected: {
    backgroundColor: '#FAF8FF',
  },

  dropdownText: {
    color: '#555563',
    fontSize: 10.5,
    fontFamily: 'PoppinsMedium',
  },

  dropdownTextSelected: {
    color: '#6630D7',
    fontFamily: 'PoppinsSemiBold',
  },

  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    paddingVertical: 15,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F7F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },

  summaryValue: {
    color: '#171A2B',
    fontSize: 15,
    fontFamily: 'PoppinsBold',
  },

  summaryLabel: {
    color: '#858592',
    fontSize: 8.5,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#EEEEF3',
  },

  sectionHeader: {
    marginBottom: 8,
  },

  sectionTitle: {
    color: '#111528',
    fontSize: 17,
    fontFamily: 'PoppinsBold',
  },

  sectionSubtitle: {
    color: '#858592',
    fontSize: 9.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 1,
  },

  emptySubjectsBox: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptySubjectsText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#858592',
  },

  subjectCard: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  subjectBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
  },

  subjectIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  subjectContent: {
    flex: 1,
  },

  subjectName: {
    color: '#171A2B',
    fontSize: 12.5,
    fontFamily: 'PoppinsBold',
  },

  teacherName: {
    color: '#777784',
    fontSize: 9.5,
    fontFamily: 'PoppinsMedium',
    marginTop: 2,
  },

  timetableCard: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 13,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  timetableIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  timetableContent: {
    flex: 1,
  },

  timetableTitle: {
    color: '#090202',
    fontSize: 12.5,
    fontFamily: 'PoppinsBold',
  },

  timetableText: {
    color: '#858592',
    fontSize: 9.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  bottomSpacing: {
    height: 30,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
