import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudentAttendanceRecordItem } from '../../../services/attendance';

type AttendanceDetailsProps = {
  records?: StudentAttendanceRecordItem[];
  onContentScroll?: (event: any) => void;
};

type AttendanceItem = {
  date: string;
  subject: string;
  teacher: string;
  time: string;
  status: 'Present' | 'Absent';
};

const ATTENDANCE_DATA: AttendanceItem[] = [
  {
    date: '16 Sep 2026',
    subject: 'Physics',
    teacher: 'Priya Sharma',
    time: '10:00 AM',
    status: 'Present',
  },
  {
    date: '15 Sep 2026',
    subject: 'Mathematics',
    teacher: 'Rahul Sir',
    time: '02:00 PM',
    status: 'Present',
  },
  {
    date: '15 Sep 2026',
    subject: 'Physics',
    teacher: 'Priya Sharma',
    time: '10:00 AM',
    status: 'Present',
  },
  {
    date: '14 Sep 2026',
    subject: 'Chemistry',
    teacher: 'Anjali Ma’am',
    time: '12:00 PM',
    status: 'Absent',
  },
  {
    date: '14 Sep 2026',
    subject: 'Mathematics',
    teacher: 'Rahul Sir',
    time: '02:00 PM',
    status: 'Present',
  },
  {
    date: '12 Sep 2026',
    subject: 'Physics',
    teacher: 'Priya Sharma',
    time: '10:00 AM',
    status: 'Present',
  },
  {
    date: '11 Sep 2026',
    subject: 'Chemistry',
    teacher: 'Anjali Ma’am',
    time: '12:00 PM',
    status: 'Present',
  },
  {
    date: '10 Sep 2026',
    subject: 'Mathematics',
    teacher: 'Rahul Sir',
    time: '02:00 PM',
    status: 'Absent',
  },
];

export default function AttendanceDetails({
  records,
  onContentScroll,
}: AttendanceDetailsProps) {
  const [selectedSubject, setSelectedSubject] =
    useState('All');

  const dataSource: (AttendanceItem | StudentAttendanceRecordItem)[] =
    records !== undefined ? records : ATTENDANCE_DATA;

  const availableSubjects = useMemo(() => {
    const subs = Array.from(
      new Set(dataSource.map(item => item.subject).filter(Boolean)),
    );
    return ['All', ...subs];
  }, [dataSource]);

  const filteredData = useMemo(() => {
    if (selectedSubject === 'All') {
      return dataSource;
    }

    return dataSource.filter(
      item => item.subject === selectedSubject,
    );
  }, [dataSource, selectedSubject]);

  const presentCount = filteredData.filter(
    item => item.status === 'Present',
  ).length;

  const absentCount = filteredData.filter(
    item => item.status === 'Absent',
  ).length;

  const attendancePercentage =
    filteredData.length > 0
      ? Math.round(
          (presentCount / filteredData.length) *
            100,
        )
      : 0;

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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Attendance Details
            </Text>

            <Text style={styles.subtitle}>
              Detailed attendance by date and subject
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Selected Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>
                SELECTED PERIOD
              </Text>

              <Text style={styles.summaryTitle}>
                Attendance Records
              </Text>
            </View>

            <View style={styles.percentageBox}>
              <Text style={styles.percentage}>
                {attendancePercentage}%
              </Text>
            </View>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.stat}>
              <View
                style={[
                  styles.statDot,
                  {
                    backgroundColor: '#22A55A',
                  },
                ]}
              />

              <Text style={styles.statText}>
                {presentCount} Present
              </Text>
            </View>

            <View style={styles.stat}>
              <View
                style={[
                  styles.statDot,
                  {
                    backgroundColor: '#E4515D',
                  },
                ]}
              />

              <Text style={styles.statText}>
                {absentCount} Absent
              </Text>
            </View>

            <View style={styles.stat}>
              <View
                style={[
                  styles.statDot,
                  {
                    backgroundColor: '#6630D7',
                  },
                ]}
              />

              <Text style={styles.statText}>
                {filteredData.length} Total
              </Text>
            </View>
          </View>
        </View>

        {/* Subject Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Filter by Subject
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.filterContainer
            }
          >
            {availableSubjects.map(subject => {
              const selected =
                selectedSubject === subject;

              return (
                <Pressable
                  key={subject}
                  style={[
                    styles.filterButton,
                    selected &&
                      styles.selectedFilter,
                  ]}
                  onPress={() =>
                    setSelectedSubject(subject)
                  }
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected &&
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

        {/* Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Class Records
              </Text>

              <Text style={styles.sectionSubtitle}>
                Present and absent classes
              </Text>
            </View>

            <Text style={styles.recordCount}>
              {filteredData.length} records
            </Text>
          </View>

          {filteredData.map(
            (item, index) => {
              const isPresent =
                item.status === 'Present';

              return (
                <View
                  key={`${item.date}-${item.subject}-${item.time}-${index}`}
                  style={[
                    styles.record,
                    index !==
                      filteredData.length - 1 &&
                      styles.recordBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.statusIcon,
                      isPresent
                        ? styles.presentBackground
                        : styles.absentBackground,
                    ]}
                  >
                    <Ionicons
                      name={
                        isPresent
                          ? 'checkmark'
                          : 'close'
                      }
                      size={18}
                      color={
                        isPresent
                          ? '#22A55A'
                          : '#E4515D'
                      }
                    />
                  </View>

                  <View style={styles.recordContent}>
                    <Text style={styles.subject}>
                      {item.subject}
                    </Text>

                    <Text style={styles.teacher}>
                      {item.teacher}
                    </Text>

                    <View style={styles.metaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color="#9999A5"
                      />

                      <Text style={styles.metaText}>
                        {item.date}
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
                        {item.time}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isPresent
                        ? styles.presentBadge
                        : styles.absentBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isPresent
                          ? styles.presentText
                          : styles.absentText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              );
            },
          )}

          {filteredData.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={32}
                color="#B0A5D4"
              />

              <Text style={styles.emptyTitle}>
                No attendance records
              </Text>

              <Text style={styles.emptyText}>
                There are no records for this subject.
              </Text>
            </View>
          )}
        </View>

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
              Attendance Information
            </Text>

            <Text style={styles.infoText}>
              Attendance records are updated based on
              classes marked by your teachers.
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

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },

  /* Summary */

  summaryCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#6630D7',
  },

  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    color: '#DCD0FF',
    fontSize: 8,
    fontFamily: 'PoppinsBold',
    letterSpacing: 0.5,
  },

  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    marginTop: 2,
  },

  percentageBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 5,
    borderColor: '#A98EEB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  percentage: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'PoppinsBold',
  },

  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 15,
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statText: {
    color: '#E6DEFF',
    fontSize: 8.5,
    fontFamily: 'PoppinsMedium',
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
    marginBottom: 8,
  },

  sectionTitle: {
    color: '#171A2B',
    fontSize: 14,
    fontFamily: 'PoppinsBold',
  },

  sectionSubtitle: {
    color: '#858592',
    fontSize: 8.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 1,
  },

  recordCount: {
    color: '#6630D7',
    fontSize: 8,
    fontFamily: 'PoppinsSemiBold',
  },

  /* Filter */

  filterContainer: {
    gap: 7,
    paddingTop: 10,
  },

  filterButton: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#F3F3F6',
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

  /* Records */

  record: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  recordBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
  },

  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  presentBackground: {
    backgroundColor: '#E3F7EB',
  },

  absentBackground: {
    backgroundColor: '#FFE9EA',
  },

  recordContent: {
    flex: 1,
  },

  subject: {
    color: '#171A2B',
    fontSize: 10.5,
    fontFamily: 'PoppinsBold',
  },

  teacher: {
    color: '#777784',
    fontSize: 8,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
    backgroundColor: '#B7B7C0',
    marginHorizontal: 5,
  },

  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 5,
  },

  presentBadge: {
    backgroundColor: '#E3F7EB',
  },

  absentBadge: {
    backgroundColor: '#FFE9EA',
  },

  statusText: {
    fontSize: 7,
    fontFamily: 'PoppinsSemiBold',
  },

  presentText: {
    color: '#22A55A',
  },

  absentText: {
    color: '#E4515D',
  },

  /* Empty */

  emptyState: {
    alignItems: 'center',
    paddingVertical: 25,
  },

  emptyTitle: {
    color: '#555564',
    fontSize: 11,
    fontFamily: 'PoppinsBold',
    marginTop: 7,
  },

  emptyText: {
    color: '#9999A5',
    fontSize: 8.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  /* Info */

  infoCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 13,
    borderRadius: 17,
    backgroundColor: '#F8F5FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#171A2B',
    fontSize: 10.5,
    fontFamily: 'PoppinsBold',
  },

  infoText: {
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