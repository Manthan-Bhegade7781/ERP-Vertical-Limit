import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ScheduleItem from './ScheduleItem';

import {
  fetchTeacherTimetable,
  getTimetableReferenceName,
  TimetableEntry,
} from '@/services/timetable';

type ScheduleSectionProps = {
  onViewAllPress?: () => void;
};

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDate = (value: string) => {
  if (!value) return 'Date unavailable';

  const parsedDate = new Date(`${value}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable';

  return parsedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (time: string) => {
  if (!time) return '--';

  const [hours, minutes] = time.split(':').map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;

  return `${String(formattedHours).padStart(2, '0')}:${String(
    minutes,
  ).padStart(2, '0')} ${period}`;
};

const getScheduleStyle = (type: string) => {
  switch (type) {
    case 'exam':
      return {
        color: '#F28A17',
        iconBackground: '#FFF0DF',
        iconColor: '#F28A17',
      };

    case 'lab':
      return {
        color: '#22A55A',
        iconBackground: '#E3F7EB',
        iconColor: '#22A55A',
      };

    default:
      return {
        color: '#6630D7',
        iconBackground: '#EEE7FF',
        iconColor: '#6630D7',
      };
  }
};

const getBatchName = (entry: TimetableEntry) => {
  const batch = entry.batchSubjectId?.batchId;

  if (batch && typeof batch === 'object') {
    return batch.name || batch.standard || batch.code || 'Batch';
  }

  return 'Batch';
};

const getSubjectName = (entry: TimetableEntry) => {
  return getTimetableReferenceName(
    entry.batchSubjectId?.subjectId,
    'Subject',
  );
};

const getTeacherName = (entry: TimetableEntry) => {
  return getTimetableReferenceName(
    entry.batchSubjectId?.teacherId,
    'Teacher not assigned',
  );
};

export default function ScheduleSection({
  onViewAllPress,
}: ScheduleSectionProps) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(
    null,
  );

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await fetchTeacherTimetable(getTodayDate());

      const sortedEntries = [...result.entries].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );

      setEntries(sortedEntries);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load today's schedule.",
      );

      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const selectedStyle = selectedEntry
    ? getScheduleStyle(selectedEntry.type)
    : getScheduleStyle('lecture');

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Schedule</Text>

        <Pressable
          onPress={onViewAllPress}
          hitSlop={8}
          disabled={!onViewAllPress}
        >
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.messageContainer}>
          <ActivityIndicator color="#5420D8" />
          <Text style={styles.message}>Loading schedule...</Text>
        </View>
      )}

      {!loading && error !== '' && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadSchedule} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && entries.length === 0 && (
        <View style={styles.messageContainer}>
          <Ionicons name="calendar-outline" size={32} color="#A0A3B1" />
          <Text style={styles.message}>
            No classes scheduled for today.
          </Text>
        </View>
      )}

      {!loading && !error && entries.length > 0 && (
        <View style={styles.list}>
          {entries.map((entry) => {
            const scheduleStyle = getScheduleStyle(entry.type);

            return (
              <View key={entry._id} style={styles.scheduleCardWrapper}>
                <Pressable
                  onPress={() => setSelectedEntry(entry)}
                  android_ripple={{ color: '#F1EAFF' }}
                  style={styles.scheduleCardPressable}
                >
                  <View style={styles.scheduleItemContent}>
                    <View style={styles.scheduleItemDetails}>
                      <ScheduleItem
                        color={scheduleStyle.color}
                        iconBackground={scheduleStyle.iconBackground}
                        iconColor={scheduleStyle.iconColor}
                        time={`${formatTime(entry.startTime)} - ${formatTime(
                          entry.endTime,
                        )}`}
                        className={getBatchName(entry)}
                        subject={getSubjectName(entry)}
                        room={entry.room?.trim() || 'Room not assigned'}
                        type={entry.type}
                      />
                    </View>
                    <View style={styles.scheduleChevron}>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={22}
                        color="#98A2B3"
                      />
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {/* Read-only schedule details */}
      <Modal
        visible={!!selectedEntry}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedEntry(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeadingGroup}>
                <View
                  style={[
                    styles.modalIcon,
                    { backgroundColor: selectedStyle.iconBackground },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-clock-outline"
                    size={24}
                    color={selectedStyle.iconColor}
                  />
                </View>

                <View style={styles.modalHeadingText}>
                  <Text style={styles.modalEyebrow}>CLASS SCHEDULE</Text>
                  <Text style={styles.modalTitle}>Schedule Details</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedEntry(null)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedEntry && (
              <>
                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.subjectTitle}>
                    {getSubjectName(selectedEntry)}
                  </Text>

                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: selectedStyle.iconBackground },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: selectedStyle.iconColor },
                      ]}
                    >
                      {String(selectedEntry.type || 'lecture').toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelGroup}>
                      <MaterialCommunityIcons
                        name="calendar-month-outline"
                        size={18}
                        color="#7040D5"
                      />
                      <Text style={styles.detailLabel}>Date</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatDate(getTodayDate())}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelGroup}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={18}
                        color="#7040D5"
                      />
                      <Text style={styles.detailLabel}>Time</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatTime(selectedEntry.startTime)} -{' '}
                      {formatTime(selectedEntry.endTime)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelGroup}>
                      <MaterialCommunityIcons
                        name="account-group-outline"
                        size={18}
                        color="#7040D5"
                      />
                      <Text style={styles.detailLabel}>Batch</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {getBatchName(selectedEntry)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelGroup}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={18}
                        color="#7040D5"
                      />
                      <Text style={styles.detailLabel}>Teacher</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {getTeacherName(selectedEntry)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelGroup}>
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={18}
                        color="#7040D5"
                      />
                      <Text style={styles.detailLabel}>Room</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {selectedEntry.room?.trim() || 'Room not assigned'}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.readOnlyFooter}>
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={17}
                    color="#667085"
                  />
                  <Text style={styles.readOnlyText}>View only</Text>
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setSelectedEntry(null)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.doneButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  title: {
    color: '#111528',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },

  viewAll: {
    color: '#5420D8',
    fontSize: 15,
    fontFamily: 'PoppinsBold',
  },

  list: {
    gap: 14,
  },

  scheduleCardWrapper: {
    minHeight: 112,
    marginBottom: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },

  scheduleCardPressable: {
    minHeight: 112,
    flex: 1,
  },

  scheduleItemContent: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scheduleItemDetails: {
    flex: 1,
    minWidth: 0,
  },

  scheduleChevron: {
    width: 34,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    backgroundColor: '#F8F6FF',
    borderRadius: 10,
  },

  messageContainer: {
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },

  message: {
    color: '#5B6272',
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    textAlign: 'center',
  },

  errorText: {
    color: '#D93025',
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    textAlign: 'center',
  },

  retryButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1EAFF',
  },

  retryText: {
    color: '#5420D8',
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },

  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  modalHeadingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  modalIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalHeadingText: {
    flex: 1,
    marginLeft: 11,
  },

  modalEyebrow: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    letterSpacing: 1,
    color: '#8B79C9',
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#202A3A',
    marginTop: 2,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  modalScroll: {
    flexShrink: 1,
  },

  modalScrollContent: {
    paddingTop: 19,
    paddingBottom: 18,
  },

  subjectTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 19,
    lineHeight: 27,
    color: '#202A3A',
  },

  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 11,
  },

  typeBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF0F5',
    marginTop: 18,
    marginBottom: 8,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F6',
    gap: 12,
  },

  detailLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 95,
  },

  detailLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#7A8699',
    marginLeft: 7,
  },

  detailValue: {
    flex: 1,
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    lineHeight: 17,
    color: '#344054',
  },

  readOnlyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    paddingTop: 14,
  },

  readOnlyText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#667085',
    marginLeft: 6,
  },

  doneButton: {
    minWidth: 88,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: '#5420D8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  doneButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});
