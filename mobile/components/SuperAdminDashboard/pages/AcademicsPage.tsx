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

type Subject = {
  id: string;
  code: string;
  name: string;
  course: string;
  batch: string;
  faculty: string;
  credits: number;
  type: 'Core' | 'Elective' | 'Practical';
  status: 'Active' | 'Inactive';
};

const subjects: Subject[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Computer Fundamentals',
    course: 'BCA',
    batch: 'BCA 2026',
    faculty: 'Dr. Priya Sharma',
    credits: 4,
    type: 'Core',
    status: 'Active',
  },
  {
    id: '2',
    code: 'CS102',
    name: 'Programming in C',
    course: 'BCA',
    batch: 'BCA 2026',
    faculty: 'Prof. Rahul Mehta',
    credits: 4,
    type: 'Core',
    status: 'Active',
  },
  {
    id: '3',
    code: 'CS103',
    name: 'Database Management System',
    course: 'BCA',
    batch: 'BCA 2025',
    faculty: 'Dr. Amit Kulkarni',
    credits: 4,
    type: 'Core',
    status: 'Active',
  },
  {
    id: '4',
    code: 'BC201',
    name: 'Business Economics',
    course: 'B.Com',
    batch: 'B.Com 2026',
    faculty: 'Prof. Neha Joshi',
    credits: 3,
    type: 'Core',
    status: 'Active',
  },
  {
    id: '5',
    code: 'BC202',
    name: 'Financial Accounting',
    course: 'B.Com',
    batch: 'B.Com 2026',
    faculty: 'Prof. Sneha Patil',
    credits: 4,
    type: 'Core',
    status: 'Active',
  },
  {
    id: '6',
    code: 'BA301',
    name: 'Digital Marketing',
    course: 'BBA',
    batch: 'BBA 2025',
    faculty: 'Prof. Karan Shah',
    credits: 3,
    type: 'Elective',
    status: 'Active',
  },
  {
    id: '7',
    code: 'CS204',
    name: 'Web Development Lab',
    course: 'BCA',
    batch: 'BCA 2025',
    faculty: 'Prof. Rohan Deshmukh',
    credits: 2,
    type: 'Practical',
    status: 'Active',
  },
  {
    id: '8',
    code: 'BA205',
    name: 'Business Communication',
    course: 'BBA',
    batch: 'BBA 2026',
    faculty: 'Prof. Anjali Rao',
    credits: 3,
    type: 'Core',
    status: 'Inactive',
  },
];

const filterOptions = ['All', 'Active', 'Inactive'];

const typeColors = {
  Core: {
    background: '#F1EAFF',
    text: '#7040D5',
  },
  Elective: {
    background: '#EAF2FF',
    text: '#2675E8',
  },
  Practical: {
    background: '#E7F8EF',
    text: '#35B878',
  },
};

export default function AcademicsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;
  const contentWidth = isDesktop ? Math.min(width - 250 - 40, 1500) : width - 32;

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesStatus =
        selectedFilter === 'All' || subject.status === selectedFilter;

      const matchesSearch =
        !query ||
        subject.name.toLowerCase().includes(query) ||
        subject.code.toLowerCase().includes(query) ||
        subject.course.toLowerCase().includes(query) ||
        subject.batch.toLowerCase().includes(query) ||
        subject.faculty.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [search, selectedFilter]);

  const openFeature = (feature: string) => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { feature },
    });
  };

  const handleBack = () => {
    router.replace('/(tabs)');
  };

  const handleAddSubject = () => {
    Alert.alert(
      'Add Subject',
      'Subject creation form will be connected here.'
    );
  };

  const handleView = (subject: Subject) => {
    Alert.alert(
      'Subject Details',
      `${subject.name}\n\nCode: ${subject.code}\nCourse: ${subject.course}\nBatch: ${subject.batch}\nFaculty: ${subject.faculty}\nCredits: ${subject.credits}\nType: ${subject.type}\nStatus: ${subject.status}`
    );
  };

  const handleEdit = (subject: Subject) => {
    Alert.alert(
      'Edit Subject',
      `Edit options for ${subject.name} will be available here.`
    );
  };

  return (
    <View style={styles.screen}>
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
            <Text style={styles.headerTitle}>Academics</Text>
            
          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleAddSubject}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="#7040D5"
            />
            <Text style={styles.headerActionText}>Add Subject</Text>
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
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Academic Management</Text>
              
            </View>


          </View>

          <View
            style={[
              styles.statsGrid,
              isDesktop && styles.statsGridDesktop,
            ]}
          >
            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AcademicStatCard
                icon="book-open-variant"
                title="Total Subjects"
                value="68"
                change="5.7%"
                type="purple"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AcademicStatCard
                icon="school-outline"
                title="Active Courses"
                value="18"
                change="7.8%"
                type="blue"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AcademicStatCard
                icon="account-tie"
                title="Faculty Assigned"
                value="142"
                change="8.3%"
                type="green"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AcademicStatCard
                icon="calendar-month-outline"
                title="Academic Sessions"
                value="4"
                change="6.2%"
                type="orange"
              />
            </View>
          </View>

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
                placeholder="Search subjects, courses, faculty..."
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
              {filterOptions.map((filter) => {
                const active = selectedFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      active && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>Subjects</Text>
              <Text style={styles.listSubtitle}>
                {filteredSubjects.length} subject
                {filteredSubjects.length === 1 ? '' : 's'} found
              </Text>
            </View>

            <View style={styles.sessionBadge}>
              <MaterialCommunityIcons
                name="calendar-check-outline"
                size={16}
                color="#7040D5"
              />
              <Text style={styles.sessionBadgeText}>2026 - 27</Text>
            </View>
          </View>

          {filteredSubjects.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="book-search-outline"
                  size={34}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.emptyTitle}>No subjects found</Text>
              <Text style={styles.emptySubtitle}>
                Try changing your search or filter.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.subjectGrid,
                isDesktop && styles.subjectGridDesktop,
              ]}
            >
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  isDesktop={isDesktop}
                  onView={() => handleView(subject)}
                  onEdit={() => handleEdit(subject)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

type AcademicStatCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  change: string;
  type: 'purple' | 'blue' | 'green' | 'orange';
};

function AcademicStatCard({
  icon,
  title,
  value,
  change,
  type,
}: AcademicStatCardProps) {
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
            { backgroundColor: color.background },
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
            { backgroundColor: color.background },
          ]}
        >
          <MaterialCommunityIcons
            name="trending-up"
            size={12}
            color={color.icon}
          />
          <Text style={[styles.changeText, { color: color.icon }]}>
            {change}
          </Text>
        </View>
      </View>

      <View>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

type SubjectCardProps = {
  subject: Subject;
  isDesktop: boolean;
  onView: () => void;
  onEdit: () => void;
};

function SubjectCard({
  subject,
  isDesktop,
  onView,
  onEdit,
}: SubjectCardProps) {
  const typeColor = typeColors[subject.type];

  return (
    <View
      style={[
        styles.subjectCard,
        isDesktop && styles.subjectCardDesktop,
      ]}
    >
      <View style={styles.subjectTop}>
        <View style={styles.subjectIconBox}>
          <MaterialCommunityIcons
            name={
              subject.type === 'Practical'
                ? 'flask-outline'
                : 'book-open-page-variant-outline'
            }
            size={23}
            color="#7040D5"
          />
        </View>

        <View style={styles.subjectTopRight}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: typeColor.background },
            ]}
          >
            <Text style={[styles.typeBadgeText, { color: typeColor.text }]}>
              {subject.type}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              subject.status === 'Active'
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                subject.status === 'Active'
                  ? styles.statusDotActive
                  : styles.statusDotInactive,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                subject.status === 'Active'
                  ? styles.statusTextActive
                  : styles.statusTextInactive,
              ]}
            >
              {subject.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{subject.name}</Text>
        <Text style={styles.subjectCode}>{subject.code}</Text>
      </View>

      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="school-outline"
          size={17}
          color="#7B8799"
        />
        <View style={styles.detailTextArea}>
          <Text style={styles.detailLabel}>Course</Text>
          <Text style={styles.detailValue}>{subject.course}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="account-group-outline"
          size={17}
          color="#7B8799"
        />
        <View style={styles.detailTextArea}>
          <Text style={styles.detailLabel}>Batch</Text>
          <Text style={styles.detailValue}>{subject.batch}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <MaterialCommunityIcons
          name="account-tie-outline"
          size={17}
          color="#7B8799"
        />
        <View style={styles.detailTextArea}>
          <Text style={styles.detailLabel}>Faculty</Text>
          <Text style={styles.detailValue}>{subject.faculty}</Text>
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <View style={styles.creditBox}>
          <MaterialCommunityIcons
            name="certificate-outline"
            size={16}
            color="#7040D5"
          />
          <Text style={styles.creditText}>
            {subject.credits} Credits
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={onView}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="eye-outline"
            size={17}
            color="#7040D5"
          />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={17}
            color="#2675E8"
          />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
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
    fontSize: 11,
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
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sectionTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#172033',
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
    shadowOffset: { width: 0, height: 3 },
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
    shadowOffset: { width: 0, height: 2 },
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

  subjectGrid: {
    gap: 12,
  },

  subjectGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  subjectCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  subjectCardDesktop: {
    width: '32.4%',
  },

  subjectTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  subjectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subjectTopRight: {
    alignItems: 'flex-end',
    gap: 6,
  },

  typeBadge: {
    paddingHorizontal: 8,
    height: 25,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
  },

  statusBadge: {
    height: 23,
    paddingHorizontal: 7,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusActive: {
    backgroundColor: '#E7F8EF',
  },

  statusInactive: {
    backgroundColor: '#F3F4F6',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusDotActive: {
    backgroundColor: '#35B878',
  },

  statusDotInactive: {
    backgroundColor: '#98A1B2',
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
  },

  statusTextActive: {
    color: '#26955E',
  },

  statusTextInactive: {
    color: '#707B8F',
  },

  subjectInfo: {
    marginTop: 14,
    marginBottom: 13,
  },

  subjectName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#172033',
  },

  subjectCode: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#7040D5',
    marginTop: 2,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  detailTextArea: {
    marginLeft: 8,
    flex: 1,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#98A1B2',
  },

  detailValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#3B4658',
    marginTop: 1,
  },

  bottomInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    paddingTop: 11,
    marginTop: 2,
  },

  creditBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  creditText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 5,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },

  viewButton: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
    marginLeft: 5,
  },

  editButton: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#EAF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#2675E8',
    marginLeft: 5,
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