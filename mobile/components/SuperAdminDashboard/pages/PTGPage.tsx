import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type PTGRecord = {
  id: string;
  student: string;
  studentId: string;
  parent: string;
  teacher: string;
  course: string;
  batch: string;
  meetingDate: string;
  purpose: string;
  status: 'Scheduled' | 'Completed' | 'Pending';
};

const ptgRecords: PTGRecord[] = [
  {
    id: '1',
    student: 'Aarav Sharma',
    studentId: 'STU-2026-001',
    parent: 'Rajesh Sharma',
    teacher: 'Dr. Priya Sharma',
    course: 'BCA',
    batch: 'BCA 2026',
    meetingDate: '10 Sep 2026',
    purpose: 'Academic Performance Review',
    status: 'Scheduled',
  },
  {
    id: '2',
    student: 'Ananya Patil',
    studentId: 'STU-2026-002',
    parent: 'Suresh Patil',
    teacher: 'Prof. Rahul Mehta',
    course: 'B.Com',
    batch: 'B.Com 2026',
    meetingDate: '08 Sep 2026',
    purpose: 'Attendance Discussion',
    status: 'Completed',
  },
  {
    id: '3',
    student: 'Rohan Kulkarni',
    studentId: 'STU-2026-003',
    parent: 'Vijay Kulkarni',
    teacher: 'Dr. Amit Kulkarni',
    course: 'BCA',
    batch: 'BCA 2025',
    meetingDate: '12 Sep 2026',
    purpose: 'Academic Guidance',
    status: 'Scheduled',
  },
  {
    id: '4',
    student: 'Sneha Joshi',
    studentId: 'STU-2026-004',
    parent: 'Mahesh Joshi',
    teacher: 'Prof. Neha Joshi',
    course: 'BBA',
    batch: 'BBA 2026',
    meetingDate: '14 Sep 2026',
    purpose: 'Career Guidance',
    status: 'Pending',
  },
  {
    id: '5',
    student: 'Aditya Deshmukh',
    studentId: 'STU-2026-005',
    parent: 'Prakash Deshmukh',
    teacher: 'Prof. Rohan Deshmukh',
    course: 'BCA',
    batch: 'BCA 2025',
    meetingDate: '05 Sep 2026',
    purpose: 'Progress Review',
    status: 'Completed',
  },
  {
    id: '6',
    student: 'Isha Rao',
    studentId: 'STU-2026-006',
    parent: 'Amit Rao',
    teacher: 'Prof. Anjali Rao',
    course: 'BBA',
    batch: 'BBA 2026',
    meetingDate: '18 Sep 2026',
    purpose: 'Parent Interaction',
    status: 'Scheduled',
  },
];

const filters = [
  'All',
  'Scheduled',
  'Completed',
  'Pending',
];

export default function PTGPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const contentWidth = isDesktop
    ? Math.min(width - 250 - 40, 1500)
    : width - 32;

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState('All');

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ptgRecords.filter((record) => {
      const matchesFilter =
        selectedFilter === 'All' ||
        record.status === selectedFilter;

      const matchesSearch =
        !query ||
        record.student.toLowerCase().includes(query) ||
        record.studentId.toLowerCase().includes(query) ||
        record.parent.toLowerCase().includes(query) ||
        record.teacher.toLowerCase().includes(query) ||
        record.course.toLowerCase().includes(query) ||
        record.batch.toLowerCase().includes(query) ||
        record.purpose.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [search, selectedFilter]);

  const handleBack = () => {
    router.replace('/(tabs)');
  };

  const handleAddPTG = () => {
    Alert.alert(
      'Schedule PTG',
      'PTG meeting scheduling form will be connected here.'
    );
  };

  const handleView = (record: PTGRecord) => {
    Alert.alert(
      'PTG Details',
      `${record.student}\n\n` +
        `Student ID: ${record.studentId}\n` +
        `Parent: ${record.parent}\n` +
        `Teacher: ${record.teacher}\n` +
        `Course: ${record.course}\n` +
        `Batch: ${record.batch}\n` +
        `Meeting Date: ${record.meetingDate}\n` +
        `Purpose: ${record.purpose}\n` +
        `Status: ${record.status}`
    );
  };

  const handleEdit = (record: PTGRecord) => {
    Alert.alert(
      'Edit PTG',
      `Edit options for ${record.student}'s PTG meeting will be available here.`
    );
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>
              PTG
            </Text>

          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleAddPTG}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="#7040D5"
            />

            <Text style={styles.headerActionText}>
              Schedule PTG
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              width: contentWidth,
            },
          ]}
        >
          {/* PAGE TITLE */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <Text style={styles.sectionTitle}>
                PTG Management
              </Text>

              <Text style={styles.sectionSubtitle}>
                Manage parent, student and teacher interactions
              </Text>
            </View>

          </View>

          {/* SUMMARY CARDS */}
          <View
            style={[
              styles.statsGrid,
              isDesktop && styles.statsGridDesktop,
            ]}
          >
            <View
              style={[
                styles.statCardWrapper,
                isDesktop &&
                  styles.statCardWrapperDesktop,
              ]}
            >
              <PTGStatCard
                icon="account-group-outline"
                title="Total Meetings"
                value="24"
                change="8.5%"
                type="purple"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop &&
                  styles.statCardWrapperDesktop,
              ]}
            >
              <PTGStatCard
                icon="calendar-clock"
                title="Scheduled"
                value="12"
                change="6.4%"
                type="blue"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop &&
                  styles.statCardWrapperDesktop,
              ]}
            >
              <PTGStatCard
                icon="check-circle-outline"
                title="Completed"
                value="8"
                change="7.2%"
                type="green"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop &&
                  styles.statCardWrapperDesktop,
              ]}
            >
              <PTGStatCard
                icon="clock-alert-outline"
                title="Pending"
                value="4"
                change="3.8%"
                type="orange"
              />
            </View>
          </View>

          {/* SEARCH + FILTER */}
          <View style={styles.filterCard}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#8A94A6"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search student, parent, teacher..."
                placeholderTextColor="#A0A8B7"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={19}
                    color="#A0A8B7"
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterRow}>
              {filters.map((filter) => {
                const active =
                  selectedFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      active &&
                        styles.filterButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedFilter(filter)
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active &&
                          styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* LIST HEADER */}
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                PTG Meetings
              </Text>

              <Text style={styles.listSubtitle}>
                {filteredRecords.length} meeting
                {filteredRecords.length === 1
                  ? ''
                  : 's'} found
              </Text>
            </View>

            <View style={styles.sessionBadge}>
              <MaterialCommunityIcons
                name="calendar-check-outline"
                size={16}
                color="#7040D5"
              />

              <Text style={styles.sessionBadgeText}>
                2026 - 27
              </Text>
            </View>
          </View>

          {/* RECORDS */}
          {filteredRecords.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={34}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No PTG meetings found
              </Text>

              <Text style={styles.emptySubtitle}>
                Try changing your search or filter.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.recordGrid,
                isDesktop &&
                  styles.recordGridDesktop,
              ]}
            >
              {filteredRecords.map((record) => (
                <PTGCard
                  key={record.id}
                  record={record}
                  isDesktop={isDesktop}
                  onView={() => handleView(record)}
                  onEdit={() => handleEdit(record)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

type PTGStatCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  change: string;
  type:
    | 'purple'
    | 'blue'
    | 'green'
    | 'orange';
};

function PTGStatCard({
  icon,
  title,
  value,
  change,
  type,
}: PTGStatCardProps) {
  const colors = {
    purple: {
      background: '#F1EAFF',
      icon: '#7040D5',
    },

    blue: {
      background: '#EAF2FF',
      icon: '#2675E8',
    },

    green: {
      background: '#E7F8EF',
      icon: '#35B878',
    },

    orange: {
      background: '#FFF1E2',
      icon: '#F7941D',
    },
  };

  const color = colors[type];

  return (
    <View style={styles.statCard}>
      <View style={styles.statTopRow}>
        <View
          style={[
            styles.statIconBox,
            {
              backgroundColor:
                color.background,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={color.icon}
          />
        </View>

        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor:
                color.background,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="trending-up"
            size={12}
            color={color.icon}
          />

          <Text
            style={[
              styles.changeText,
              {
                color: color.icon,
              },
            ]}
          >
            {change}
          </Text>
        </View>
      </View>

      <View>
        <Text style={styles.statTitle}>
          {title}
        </Text>

        <Text style={styles.statValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   PTG CARD
============================================================ */

type PTGCardProps = {
  record: PTGRecord;
  isDesktop: boolean;
  onView: () => void;
  onEdit: () => void;
};

function PTGCard({
  record,
  isDesktop,
  onView,
  onEdit,
}: PTGCardProps) {
  const statusConfig = {
    Scheduled: {
      background: '#EAF2FF',
      text: '#2675E8',
      dot: '#2675E8',
    },

    Completed: {
      background: '#E7F8EF',
      text: '#26955E',
      dot: '#35B878',
    },

    Pending: {
      background: '#FFF1E2',
      text: '#D87908',
      dot: '#F7941D',
    },
  };

  const status = statusConfig[record.status];

  return (
    <View
      style={[
        styles.recordCard,
        isDesktop &&
          styles.recordCardDesktop,
      ]}
    >
      {/* TOP */}
      <View style={styles.recordTop}>
        <View style={styles.studentIconBox}>
          <MaterialCommunityIcons
            name="account-school-outline"
            size={23}
            color="#7040D5"
          />
        </View>

        <View style={styles.studentTitleArea}>
          <Text
            style={styles.studentName}
            numberOfLines={1}
          >
            {record.student}
          </Text>

          <Text style={styles.studentId}>
            {record.studentId}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                status.background,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: status.dot,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: status.text,
              },
            ]}
          >
            {record.status}
          </Text>
        </View>
      </View>

      {/* PARENT */}
      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="account-outline"
          size={17}
          color="#7B8799"
        />

        <View style={styles.detailTextArea}>
          <Text style={styles.detailLabel}>
            Parent
          </Text>

          <Text style={styles.detailValue}>
            {record.parent}
          </Text>
        </View>
      </View>

      {/* TEACHER */}
      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="account-tie-outline"
          size={17}
          color="#7B8799"
        />

        <View style={styles.detailTextArea}>
          <Text style={styles.detailLabel}>
            Teacher
          </Text>

          <Text style={styles.detailValue}>
            {record.teacher}
          </Text>
        </View>
      </View>

      {/* COURSE */}
      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="school-outline"
          size={17}
          color="#7B8799"
        />

        <View style={styles.detailTextArea}>
          <Text style={styles.detailLabel}>
            Course / Batch
          </Text>

          <Text style={styles.detailValue}>
            {record.course} • {record.batch}
          </Text>
        </View>
      </View>

      {/* DATE */}
      <View style={styles.dateBox}>
        <View style={styles.dateIcon}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={18}
            color="#7040D5"
          />
        </View>

        <View style={styles.dateTextArea}>
          <Text style={styles.dateLabel}>
            Meeting Date
          </Text>

          <Text style={styles.dateValue}>
            {record.meetingDate}
          </Text>
        </View>
      </View>

      {/* PURPOSE */}
      <View style={styles.purposeBox}>
        <MaterialCommunityIcons
          name="text-box-outline"
          size={17}
          color="#7040D5"
        />

        <Text
          style={styles.purposeText}
          numberOfLines={2}
        >
          {record.purpose}
        </Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={onView}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="eye-outline"
            size={16}
            color="#7040D5"
          />

          <Text style={styles.viewButtonText}>
            View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={16}
            color="#2675E8"
          />

          <Text style={styles.editButtonText}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    backgroundColor: '#7040D5',
    paddingHorizontal: 16,
    paddingBottom: 15,
  },

  headerInner: {
    width: '100%',
    maxWidth: 1500,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 19,
    color: '#FFFFFF',
  },

  headerAction: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#7040D5',
    marginLeft: 5,
  },

  headerAction: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerActionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#7040D5',
    marginLeft: 5,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
  },

  content: {
    paddingTop: 22,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionTitleArea: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#172033',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7B8799',
    marginTop: 2,
  },

  desktopAddButton: {
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  desktopAddButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 5,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },

  statsGridDesktop: {
    flexWrap: 'nowrap',
  },

  statCardWrapper: {
    width: '48%',
  },

  statCardWrapperDesktop: {
    flex: 1,
    width: undefined,
  },

  statCard: {
    height: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  statTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  statIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeBadge: {
    minHeight: 26,
    borderRadius: 8,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  changeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    marginLeft: 3,
  },

  statTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,
    color: '#748096',
    marginBottom: 2,
  },

  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 23,
    color: '#172033',
  },

  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 22,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  searchContainer: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E3E7EF',
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFCFE',
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#172033',
    marginLeft: 8,
    paddingVertical: 0,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 11,
  },

  filterButton: {
    minWidth: 70,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#707B8F',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  listTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
  },

  listSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8993A4',
    marginTop: 1,
  },

  sessionBadge: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
    marginLeft: 5,
  },

  recordGrid: {
    gap: 12,
  },

  recordGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  recordCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  recordCardDesktop: {
    width: '32.4%',
  },

  recordTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  studentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentTitleArea: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },

  studentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A94A6',
    marginTop: 2,
  },

  statusBadge: {
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },

  detailTextArea: {
    flex: 1,
    marginLeft: 8,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#9AA3B2',
  },

  detailValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#3B4658',
    marginTop: 1,
  },

  dateBox: {
    marginTop: 12,
    padding: 9,
    borderRadius: 10,
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateTextArea: {
    marginLeft: 9,
  },

  dateLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#98A1B2',
  },

  dateValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#3B4658',
    marginTop: 1,
  },

  purposeBox: {
    marginTop: 11,
    padding: 9,
    borderRadius: 9,
    backgroundColor: '#F8F6FE',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  purposeText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#626D80',
    marginLeft: 7,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },

  viewButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
    marginLeft: 4,
  },

  editButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EAF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#2675E8',
    marginLeft: 4,
  },

  emptyCard: {
    minHeight: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#8A94A6',
    marginTop: 5,
  },
});