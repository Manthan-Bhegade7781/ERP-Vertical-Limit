import React, { useEffect, useMemo, useState } from 'react';
import { fetchExaminations, updateExamination, cancelExamination, type ExaminationApiRecord } from '../../../services/examinations';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type ExaminationStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'results_published';

type Examination = {
  id: string;
  name: string;
  code: string;
  subject: string;
  batch: string;
  branch: string;
  date: string;
  time: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  students: number;
  status: ExaminationStatus;
};

const initialExaminations: Examination[] = [];

const formatDate = (value: unknown): string => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return String(value || '');
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const refName = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const item = value as Record<string, unknown>;
    return String(item.name || item.fullName || item.code || '');
  }
  return '';
};

const mapApiExamination = (record: ExaminationApiRecord): Examination => ({
  id: record._id,
  name: record.examinationName,
  code: record.examinationCode,
  subject: refName(record.subjectId),
  batch: refName(record.batchId),
  branch: refName((record.batchId && typeof record.batchId === 'object') ? record.batchId.branchId : ''),
  date: formatDate(record.examinationDate),
  time: record.startTime,
  durationMinutes: Number(record.durationMinutes || 0),
  totalMarks: Number(record.totalMarks || 0),
  passingMarks: Number(record.passingMarks || 0),
  students: Number(record.studentCount || 0),
  status: record.status,
});

const statusMeta: Record<
  ExaminationStatus,
  {
    label: string;
    backgroundColor: string;
    color: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  scheduled: {
    label: 'Scheduled',
    backgroundColor: '#FFF1E2',
    color: '#D97706',
    icon: 'clock-outline',
  },
  completed: {
    label: 'Completed',
    backgroundColor: '#E7F8EF',
    color: '#25865B',
    icon: 'check-circle-outline',
  },
  cancelled: {
    label: 'Cancelled',
    backgroundColor: '#FFE9F0',
    color: '#D93665',
    icon: 'close-circle-outline',
  },
  results_published: {
    label: 'Results Published',
    backgroundColor: '#F1EAFF',
    color: '#7040D5',
    icon: 'file-certificate-outline',
  },
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hr ${remainingMinutes} min`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  return `${minutes} minutes`;
};

export default function ExaminationsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [examinations, setExaminations] = useState<Examination[]>(initialExaminations);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadExaminations = async () => {
    try {
      setLoading(true);
      const records = await fetchExaminations();
      setExaminations(records.map(mapApiExamination));
    } catch (error) {
      Alert.alert('Unable to load examinations', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadExaminations(); }, []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | ExaminationStatus>('All');
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editTotalMarks, setEditTotalMarks] = useState('');
  const [editPassingMarks, setEditPassingMarks] = useState('');

  const filteredExaminations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return examinations.filter((exam) => {
      const matchesSearch =
        !query ||
        exam.name.toLowerCase().includes(query) ||
        exam.code.toLowerCase().includes(query) ||
        exam.subject.toLowerCase().includes(query) ||
        exam.batch.toLowerCase().includes(query) ||
        exam.branch.toLowerCase().includes(query);

      const matchesFilter = filter === 'All' || exam.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [examinations, search, filter]);

  const totalExams = examinations.length;
  const scheduledCount = examinations.filter(
    (exam) => exam.status === 'scheduled',
  ).length;
  const completedCount = examinations.filter(
    (exam) => exam.status === 'completed',
  ).length;
  const cancelledCount = examinations.filter(
    (exam) => exam.status === 'cancelled',
  ).length;
  const publishedCount = examinations.filter(
    (exam) => exam.status === 'results_published',
  ).length;

  const openActions = (exam: Examination) => {
    setSelectedExam(exam);
    setShowActions(true);
  };

  const openView = (exam: Examination) => {
    setSelectedExam(exam);
    setShowActions(false);
    setShowViewModal(true);
  };

  const openEdit = (exam: Examination) => {
    setSelectedExam(exam);
    setEditName(exam.name);
    setEditDate(exam.date);
    setEditTime(exam.time);
    setEditDuration(String(exam.durationMinutes));
    setEditTotalMarks(String(exam.totalMarks));
    setEditPassingMarks(String(exam.passingMarks));
    setShowActions(false);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!selectedExam) return;
    const durationMinutes = Number(editDuration);
    const totalMarks = Number(editTotalMarks);
    const passingMarks = Number(editPassingMarks);
    if (!editName.trim() || !editDate.trim() || !editTime.trim() || !Number.isFinite(durationMinutes) || durationMinutes <= 0 || !Number.isFinite(totalMarks) || totalMarks <= 0 || !Number.isFinite(passingMarks) || passingMarks < 0 || passingMarks > totalMarks) {
      Alert.alert('Invalid details', 'Enter a name, date, time, valid duration, total marks and passing marks. Passing marks cannot exceed total marks.');
      return;
    }
    if (selectedExam.status !== 'scheduled') {
      Alert.alert('Cannot edit', 'Only scheduled examinations can be updated.');
      return;
    }
    try {
      setSaving(true);
      const dateParts = editDate.trim().match(/^(\d{2}) ([A-Za-z]{3}) (\d{4})$/);
      const monthMap: Record<string, string> = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06', Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
      const apiDate = dateParts ? `${dateParts[1]}/${monthMap[dateParts[2]] || '01'}/${dateParts[3]}` : editDate.trim();
      await updateExamination(selectedExam.id, { examinationName: editName.trim(), examinationDate: apiDate, startTime: editTime.trim(), durationMinutes, totalMarks, passingMarks });
      setShowEditModal(false);
      await loadExaminations();
      Alert.alert('Updated', 'Examination updated successfully.');
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Unable to update examination.');
    } finally { setSaving(false); }
  };

  const cancelExam = (exam: Examination) => {
    setShowActions(false);

    if (exam.status === 'cancelled') {
      Alert.alert('Already cancelled', 'This examination is already cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Examination',
      `Are you sure you want to cancel "${exam.name}"?`,
      [
        { text: 'Keep Examination', style: 'cancel' },
        {
          text: 'Cancel Examination',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelExamination(exam.id);
              await loadExaminations();
              Alert.alert('Cancelled', 'Examination cancelled successfully.');
            } catch (error) {
              Alert.alert('Cancellation failed', error instanceof Error ? error.message : 'Unable to cancel examination.');
            }
          },
        },
      ],
    );
  };

  const renderSummaryCard = (
    title: string,
    value: number,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    color: 'purple' | 'blue' | 'green' | 'orange' | 'pink',
  ) => {
    const palette = {
      purple: { bg: '#F1EAFF', fg: '#7040D5' },
      blue: { bg: '#EAF2FF', fg: '#2675E8' },
      green: { bg: '#E7F8EF', fg: '#25865B' },
      orange: { bg: '#FFF1E2', fg: '#D97706' },
      pink: { bg: '#FFE9F0', fg: '#D93665' },
    }[color];

    return (
      <View
        key={title}
        style={[
          styles.summaryCard,
          { width: isDesktop ? '18.8%' : '48%' },
        ]}
      >
        <View style={[styles.summaryIcon, { backgroundColor: palette.bg }]}>
          <MaterialCommunityIcons name={icon} size={21} color={palette.fg} />
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{title}</Text>
      </View>
    );
  };

  const renderExaminationCard = (exam: Examination) => {
    const status = statusMeta[exam.status];

    return (
      <View
        key={exam.id}
        style={[
          styles.examCard,
          { width: isDesktop ? '48.9%' : '100%' },
        ]}
      >
        <View style={styles.examTop}>
          <View style={styles.examIcon}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color="#7040D5"
            />
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Actions for ${exam.name}`}
            style={styles.moreButton}
            onPress={() => openActions(exam)}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={21}
              color="#748096"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.examName} numberOfLines={2}>
          {exam.name}
        </Text>
        <Text style={styles.examCode}>{exam.code}</Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="book-open-outline"
            size={15}
            color="#748096"
          />
          <Text style={styles.infoText}>{exam.subject}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={15}
            color="#748096"
          />
          <Text style={styles.infoText}>{exam.batch}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="office-building-outline"
            size={15}
            color="#748096"
          />
          <Text style={styles.infoText}>{exam.branch}</Text>
        </View>

        <View style={styles.examDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={16}
              color="#7040D5"
            />
            <Text style={styles.detailText}>{exam.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#7040D5"
            />
            <Text style={styles.detailText}>{exam.time}</Text>
          </View>
        </View>

        <View style={styles.examBottom}>
          <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
            <MaterialCommunityIcons name={status.icon} size={13} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text style={styles.studentCount}>{exam.students} Students</Text>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => openView(exam)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="eye-outline" size={17} color="#7040D5" />
          <Text style={styles.viewButtonText}>View Examination</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Examinations</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/(super_admin)/explore',
              params: { feature: 'Add Examination' },
            })
          }
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={17} color="#7040D5" />
          <Text style={styles.addButtonText} numberOfLines={1}>
            Add Examination
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 30 },
        ]}
      >
        <Text style={styles.managementTitle}>Examination Management</Text>
        <Text style={styles.managementSubtitle}>
          Manage scheduled examinations, completed assessments and examination status.
        </Text>

        <View style={styles.summaryGrid}>
          {renderSummaryCard('Total Exams', totalExams, 'file-document-multiple-outline', 'purple')}
          {renderSummaryCard('Scheduled', scheduledCount, 'calendar-clock', 'orange')}
          {renderSummaryCard('Completed', completedCount, 'check-circle-outline', 'green')}
          {renderSummaryCard('Cancelled', cancelledCount, 'close-circle-outline', 'pink')}
          {renderSummaryCard('Results Published', publishedCount, 'file-certificate-outline', 'blue')}
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9AA3B2" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search examination, subject, batch or branch..."
              placeholderTextColor="#A0A8B5"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#9AA3B2" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {(
            [
              'All',
              'scheduled',
              'completed',
              'cancelled',
              'results_published',
            ] as const
          ).map((item) => {
            const active = filter === item;
            const label =
              item === 'All' ? 'All' : statusMeta[item].label;

            return (
              <TouchableOpacity
                key={item}
                style={[styles.filterButton, active && styles.filterButtonActive]}
                onPress={() => setFilter(item)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <View style={{ padding: 24, alignItems: 'center' }}><Text style={styles.emptyTitle}>Loading examinations...</Text></View>
        ) : filteredExaminations.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-search-outline" size={48} color="#B1B8C5" />
            <Text style={styles.emptyTitle}>No examinations found</Text>
            <Text style={styles.emptySubtitle}>
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          <View style={styles.examGrid}>
            {filteredExaminations.map(renderExaminationCard)}
          </View>
        )}
      </ScrollView>

      {/* Examination actions */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowActions(false)}>
          <Pressable style={styles.actionModal} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Examination Actions</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>
              {selectedExam?.name}
            </Text>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => selectedExam && openView(selectedExam)}
            >
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name="eye-outline" size={20} color="#7040D5" />
              </View>
              <Text style={styles.actionText}>View Examination</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A8B5" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => selectedExam && openEdit(selectedExam)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EAF2FF' }]}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color="#2675E8" />
              </View>
              <Text style={styles.actionText}>Edit Examination</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A8B5" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, { borderBottomWidth: 0 }]}
              onPress={() => selectedExam && cancelExam(selectedExam)}
              disabled={selectedExam?.status === 'cancelled'}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFE9F0' }]}>
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#D93665" />
              </View>
              <Text style={[styles.actionText, { color: '#D93665' }]}>
                {selectedExam?.status === 'cancelled' ? 'Already Cancelled' : 'Cancel Examination'}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A8B5" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* View examination */}
      <Modal
        visible={showViewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.largeModal, { width: isDesktop ? 650 : '94%', maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Examination Details</Text>
                <Text style={styles.modalSubtitle}>{selectedExam?.code}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowViewModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#748096" />
              </TouchableOpacity>
            </View>

            {selectedExam && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.detailTitle}>{selectedExam.name}</Text>
                <View style={styles.detailGrid}>
                  {[
                    ['Subject', selectedExam.subject],
                    ['Batch', selectedExam.batch],
                    ['Branch', selectedExam.branch],
                    ['Date', selectedExam.date],
                    ['Start Time', selectedExam.time],
                    ['Duration', formatDuration(selectedExam.durationMinutes)],
                    ['Students', String(selectedExam.students)],
                    ['Total Marks', String(selectedExam.totalMarks)],
                    ['Passing Marks', String(selectedExam.passingMarks)],
                    ['Status', statusMeta[selectedExam.status].label],
                  ].map(([label, value]) => (
                    <View key={label} style={styles.detailBox}>
                      <Text style={styles.detailLabel}>{label}</Text>
                      <Text style={styles.detailValue}>{value}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.uiOnlyNote}>
                  This page currently uses mock data. Backend integration will be completed after all module reviews.
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit examination - local mock state only */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.largeModal, { width: isDesktop ? 600 : '94%', maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Edit Examination</Text>
                <Text style={styles.modalSubtitle}>
                  Update examination information
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#748096" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.inputLabel}>Examination Name</Text>
              <TextInput value={editName} onChangeText={setEditName} style={styles.input} />

              <View style={styles.twoInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    value={editDate}
                    onChangeText={setEditDate}
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#A0A8B5"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput
                    value={editTime}
                    onChangeText={setEditTime}
                    style={styles.input}
                    placeholder="09:00 AM"
                    placeholderTextColor="#A0A8B5"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                value={editDuration}
                onChangeText={setEditDuration}
                style={styles.input}
                keyboardType="number-pad"
              />

              <View style={styles.twoInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Total Marks</Text>
                  <TextInput
                    value={editTotalMarks}
                    onChangeText={setEditTotalMarks}
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Passing Marks</Text>
                  <TextInput
                    value={editPassingMarks}
                    onChangeText={setEditPassingMarks}
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <Text style={styles.uiOnlyNote}>
                Changes are local to this screen only. No API request is made.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    minHeight: 72,
    backgroundColor: '#7040D5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: 7,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  addButton: {
    minHeight: 36,
    width: 136,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingHorizontal: 9,
    marginLeft: 8,
  },
  addButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 4,
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  managementTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#172033',
  },
  managementSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    color: '#748096',
    marginTop: 3,
    marginBottom: 17,
  },
  summaryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  summaryCard: {
    minHeight: 105,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  summaryIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 19,
    color: '#172033',
    marginTop: 7,
  },
  summaryLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#748096',
    marginTop: 1,
  },
  searchContainer: {
    marginTop: 18,
  },
  searchBox: {
    minHeight: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#172033',
    marginLeft: 8,
    paddingVertical: 8,
  },
  filterContainer: {
    paddingVertical: 14,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    minHeight: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },
  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#748096',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
    justifyContent: 'space-between',
  },
  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  examTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    lineHeight: 19,
    color: '#172033',
    marginTop: 12,
  },
  examCode: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#7040D5',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#748096',
    marginLeft: 7,
  },
  examDetails: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#566176',
    marginLeft: 5,
  },
  examBottom: {
    marginTop: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    minHeight: 27,
    paddingHorizontal: 9,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    marginLeft: 4,
  },
  studentCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#748096',
  },
  viewButton: {
    height: 36,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#7040D5',
    marginLeft: 5,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },
  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#172033',
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#748096',
    marginTop: 3,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 35, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  actionModal: {
    width: '94%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  modalHandle: {
    width: 35,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D9DDE5',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },
  modalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#748096',
    marginTop: 2,
  },
  actionItem: {
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#172033',
    marginLeft: 11,
  },
  largeModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 19,
  },
  detailTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#172033',
    marginBottom: 14,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailBox: {
    width: '48%',
    minHeight: 70,
    backgroundColor: '#F7F8FC',
    borderRadius: 11,
    padding: 11,
  },
  detailLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#748096',
  },
  detailValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#172033',
    marginTop: 5,
  },
  uiOnlyNote: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 15,
    color: '#748096',
    marginTop: 14,
  },
  inputLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#566176',
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    borderRadius: 10,
    paddingHorizontal: 11,
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#172033',
  },
  twoInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});
