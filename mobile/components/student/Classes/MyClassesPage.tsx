import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  subjects: Subject[];
};

type MyClassesPageProps = {
  onContentScroll?: (event: any) => void;
  onTimetablePress?: () => void;
};

const BATCHES: Batch[] = [
  {
    name: '10th Standard A',
    branch: 'Vertical Limits • Main Branch',
    subjects: [
      {
        name: 'Physics',
        teacher: 'Priya Sharma',
        icon: 'flask-outline',
        color: '#6630D7',
        background: '#EEE7FF',
      },
      {
        name: 'Mathematics',
        teacher: 'Rahul Sir',
        icon: 'calculator-outline',
        color: '#1670E8',
        background: '#E6F0FF',
      },
      {
        name: 'Chemistry',
        teacher: 'Anjali Ma’am',
        icon: 'beaker-outline',
        color: '#22A55A',
        background: '#E3F7EB',
      },
    ],
  },
  {
    name: '10th Standard B',
    branch: 'Vertical Limits • Main Branch',
    subjects: [
      {
        name: 'Physics',
        teacher: 'Priya Sharma',
        icon: 'flask-outline',
        color: '#6630D7',
        background: '#EEE7FF',
      },
      {
        name: 'Mathematics',
        teacher: 'Rahul Sir',
        icon: 'calculator-outline',
        color: '#1670E8',
        background: '#E6F0FF',
      },
    ],
  },
];

export default function MyClassesPage({
  onContentScroll,
  onTimetablePress,
}: MyClassesPageProps) {
  const [selectedBatch, setSelectedBatch] =
    useState(BATCHES[0].name);

  const [showBatchSelector, setShowBatchSelector] =
    useState(false);

  const currentBatch = useMemo(
    () =>
      BATCHES.find(
        batch => batch.name === selectedBatch,
      ) ?? BATCHES[0],
    [selectedBatch],
  );

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
        {/* Header */}
    
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>
            My Classes
          </Text>

          <Text style={styles.pageSubtitle}>
            Your batch and subjects
          </Text>
        </View>
      </View>

        {/* Batch Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            CURRENT BATCH
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.batchSelector,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              setShowBatchSelector(
                !showBatchSelector,
              )
            }
          >
            <View style={styles.batchLeft}>
              <View style={styles.batchIcon}>
                <Ionicons
                  name="people-outline"
                  size={21}
                  color="#6630D7"
                />
              </View>

              <View>
                <Text style={styles.batchName}>
                  {currentBatch.name}
                </Text>

                <Text style={styles.branchName}>
                  {currentBatch.branch}
                </Text>
              </View>
            </View>

            <Ionicons
              name={
                showBatchSelector
                  ? 'chevron-up'
                  : 'chevron-down'
              }
              size={20}
              color="#777784"
            />
          </Pressable>

          {showBatchSelector && (
            <View style={styles.dropdown}>
              {BATCHES.map((batch, index) => {
                const isSelected =
                  batch.name === selectedBatch;

                return (
                  <Pressable
                    key={`batch-${batch.name}-${index}`}
                    style={[
                      styles.dropdownItem,
                      isSelected &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedBatch(
                        batch.name,
                      );
                      setShowBatchSelector(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        isSelected &&
                          styles.dropdownTextSelected,
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
              32
            </Text>

            <Text style={styles.summaryLabel}>
              Students
            </Text>
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

            <Text style={styles.summaryLabel}>
              Subjects
            </Text>
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
              6
            </Text>

            <Text style={styles.summaryLabel}>
              Days / Week
            </Text>
          </View>
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                My Subjects
              </Text>

              <Text style={styles.sectionSubtitle}>
                Teachers assigned to your batch
              </Text>
            </View>
          </View>

          {currentBatch.subjects.map(
            (subject, index) => (
              <Pressable
                key={`${currentBatch.name}-${subject.name}-${index}`}
                style={({ pressed }) => [
                  styles.subjectCard,
                  index !==
                    currentBatch.subjects.length - 1 &&
                    styles.subjectBorder,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.subjectIcon,
                    {
                      backgroundColor:
                        subject.background,
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
                  <Text style={styles.subjectName}>
                    {subject.name}
                  </Text>

                  <Text style={styles.teacherName}>
                    {subject.teacher}
                  </Text>
                </View>
              </Pressable>
            ),
          )}
        </View>

        {/* Timetable */}
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
              size={23}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.timetableContent}>
            <Text style={styles.timetableTitle}>
              View Timetable
            </Text>

            <Text style={styles.timetableText}>
              Check your weekly class schedule
            </Text>
          </View>
        </Pressable>

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
    marginBottom: 14,
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: '#6630D7',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timetableIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  timetableContent: {
    flex: 1,
  },

  timetableTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontFamily: 'PoppinsBold',
  },

  timetableText: {
    color: '#E9DEFF',
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