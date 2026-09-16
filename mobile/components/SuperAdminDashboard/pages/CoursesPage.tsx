import React, { useMemo, useState } from 'react';

import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Subject = {
  id: string;
  name: string;
  subjectId: string;
  category: string;
  duration: string;
  branch: string;
  students: number;
  fee: string;
  status: 'Active' | 'Inactive';
};

const initialSubjects: Subject[] = [
  { id: '1', name: 'Physics', subjectId: 'VLCC-SUB-001', category: 'Core Science', duration: '12 Months', branch: 'Pune Branch', students: 684, fee: 'Included in Batch Fee', status: 'Active' },
  { id: '2', name: 'Chemistry', subjectId: 'VLCC-SUB-002', category: 'Core Science', duration: '12 Months', branch: 'Mumbai Branch', students: 592, fee: 'Included in Batch Fee', status: 'Active' },
  { id: '3', name: 'Mathematics', subjectId: 'VLCC-SUB-003', category: 'Core Science', duration: '12 Months', branch: 'Pune Branch', students: 812, fee: 'Included in Batch Fee', status: 'Active' },
  { id: '4', name: 'Biology', subjectId: 'VLCC-SUB-004', category: 'Core Science', duration: '12 Months', branch: 'Nashik Branch', students: 476, fee: 'Included in Batch Fee', status: 'Active' },
  { id: '5', name: 'English', subjectId: 'VLCC-SUB-005', category: 'Language', duration: '12 Months', branch: 'Nagpur Branch', students: 388, fee: 'Included in Batch Fee', status: 'Active' },
  { id: '6', name: 'Aptitude & Logical Reasoning', subjectId: 'VLCC-SUB-006', category: 'Competitive Preparation', duration: '12 Months', branch: 'Main Branch', students: 356, fee: 'Included in Batch Fee', status: 'Active' },
];

const branches = [
  'Pune Branch',
  'Mumbai Branch',
  'Nashik Branch',
  'Nagpur Branch',
  'Main Branch',
];

const categories = ['Core Science', 'Language', 'Competitive Preparation', 'Foundation', 'Board Preparation'];

export default function CoursesPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isDesktop = width >= 900;

  const [subjects, setSubjects] =
    useState<Subject[]>(initialSubjects);

  const [search, setSearch] = useState('');

  const [selectedSubject, setSelectedSubject] =
    useState<subject | null>(null);

  const [showActions, setShowActions] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showBranchList, setShowBranchList] =
    useState(false);

  const [showCategoryList, setShowCategoryList] =
    useState(false);

  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editStudents, setEditStudents] = useState('');
  const [editFee, setEditFee] = useState('');

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return subjects;
    }

    return subjects.filter((subject) =>
      [
        subject.name,
        subject.subjectId,
        subject.category,
        subject.duration,
        subject.branch,
        String(subject.students),
        subject.fee,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search, subjects]);

  const activeSubjects = subjects.filter(
    (subject) => subject.status === 'Active'
  ).length;

  const inactiveSubjects = subjects.filter(
    (subject) => subject.status === 'Inactive'
  ).length;

  const openAddSubject = () => {
    router.push({
      pathname: '/(tabs)/explore',
      params: {
        feature: 'Add Subject',
      },
    });
  };

  const openSubjectActions = (subject: subject) => {
    setSelectedSubject(subject);
    setShowActions(true);
  };

  const viewSubject = () => {
    setShowActions(false);

    if (!selectedSubject) {
      return;
    }

    Alert.alert(
      selectedSubject.name,
      `subject ID: ${selectedSubject.subjectId}\n\nCategory: ${selectedSubject.category}\nDuration: ${selectedSubject.duration}\nBranch: ${selectedSubject.branch}\nStudents: ${selectedSubject.students}\nSubject Fee: ${selectedSubject.fee}`
    );
  };

  const openEditSubject = () => {
    if (!selectedSubject) {
      return;
    }

    setEditName(selectedSubject.name);
    setEditCategory(selectedSubject.category);
    setEditDuration(selectedSubject.duration);
    setEditBranch(selectedSubject.branch);
    setEditStudents(String(selectedSubject.students));
    setEditFee(selectedSubject.fee);

    setShowActions(false);
    setShowEditModal(true);
  };

  const saveSubjectChanges = () => {
    if (!selectedSubject) {
      return;
    }

    if (!editName.trim()) {
      Alert.alert(
        'Required',
        'Please enter the subject name.'
      );
      return;
    }

    if (!editCategory) {
      Alert.alert(
        'Required',
        'Please select a category.'
      );
      return;
    }

    if (!editDuration.trim()) {
      Alert.alert(
        'Required',
        'Please enter the subject duration.'
      );
      return;
    }

    if (!editBranch) {
      Alert.alert(
        'Required',
        'Please select a branch.'
      );
      return;
    }

    const studentCount =
      Number(editStudents.replace(/[^0-9]/g, '')) || 0;

    setSubjects((currentSubjects) =>
      currentSubjects.map((subject) =>
        subject.id === selectedSubject.id
          ? {
              ...subject,
              name: editName.trim(),
              category: editCategory,
              duration: editDuration.trim(),
              branch: editBranch,
              students: studentCount,
              fee: editFee.trim(),
            }
          : subject
      )
    );

    setSelectedSubject((current) =>
      current
        ? {
            ...current,
            name: editName.trim(),
            category: editCategory,
            duration: editDuration.trim(),
            branch: editBranch,
            students: studentCount,
            fee: editFee.trim(),
          }
        : null
    );

    setShowEditModal(false);

    Alert.alert(
      'Updated',
      'subject information has been updated successfully.'
    );
  };

  const deleteSubject = () => {
    if (!selectedSubject) {
      return;
    }

    const subjectId = selectedSubject.id;
    const subjectName = selectedSubject.name;

    setShowActions(false);

    Alert.alert(
      'Delete subject',
      `Are you sure you want to delete ${subjectName}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSubjects((currentSubjects) =>
              currentSubjects.filter(
                (subject) => subject.id !== subjectId
              )
            );

            setSelectedSubject(null);

            Alert.alert(
              'Deleted',
              `${subjectName} has been deleted successfully.`
            );
          },
        },
      ]
    );
  };

  const renderSubject = ({
    item,
  }: {
    item: subject;
  }) => {
    return (
      <TouchableOpacity
        style={styles.subjectCard}
        activeOpacity={0.85}
        onPress={() => openSubjectActions(item)}
      >
        <View style={styles.subjectIcon}>
          <MaterialCommunityIcons
            name="book-open-outline"
            size={23}
            color="#7040D5"
          />
        </View>

        <View style={styles.subjectInfo}>
          <Text
            style={styles.subjectName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.subjectId}>
            {item.subjectId}
          </Text>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="shape-outline"
              size={14}
              color="#8A98A9"
            />

            <Text
              style={styles.detailText}
              numberOfLines={1}
            >
              {item.category}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="office-building-outline"
              size={14}
              color="#8A98A9"
            />

            <Text
              style={styles.detailText}
              numberOfLines={1}
            >
              {item.branch}
            </Text>
          </View>
        </View>

        <View style={styles.subjectMeta}>
          <Text style={styles.durationText}>
            {item.duration}
          </Text>

          <Text style={styles.studentsText}>
            {item.students} students
          </Text>

          <View
            style={[
              styles.statusBadge,
              item.status === 'Active'
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                item.status === 'Active'
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                item.status === 'Active'
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
          onPress={() => openSubjectActions(item)}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={21}
            color="#7D8B9C"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            minHeight: insets.top + 66,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            subjects
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={openAddSubject}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="book-plus-outline"
            size={20}
            color="#7040D5"
          />

          {isDesktop && (
            <Text style={styles.headerAddText}>
              Add Subject
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* CONTENT */}

      <View style={styles.content}>

        {/* PAGE HEADING */}

        <View style={styles.headingRow}>
          <View style={styles.headingInfo}>
            <Text style={styles.pageTitle}>
              subject Management
            </Text>

            <Text style={styles.pageDescription}>
              Manage subjects, curriculum, branches,
              duration and student enrollment.
            </Text>
          </View>

        </View>

        {/* SUMMARY CARDS */}

        <View style={styles.summaryGrid}>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.purpleBg,
              ]}
            >
              <MaterialCommunityIcons
                name="book-open-outline"
                size={22}
                color="#7040D5"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Total subjects
              </Text>

              <Text style={styles.summaryValue}>
                68
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.greenBg,
              ]}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color="#35B878"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Active subjects
              </Text>

              <Text style={styles.summaryValue}>
                {activeSubjects}
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.blueBg,
              ]}
            >
              <MaterialCommunityIcons
                name="book-plus-outline"
                size={22}
                color="#2675E8"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                New subjects
              </Text>

              <Text style={styles.summaryValue}>
                5
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.orangeBg,
              ]}
            >
              <MaterialCommunityIcons
                name="book-off-outline"
                size={22}
                color="#F7941D"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Inactive
              </Text>

              <Text style={styles.summaryValue}>
                {inactiveSubjects}
              </Text>
            </View>
          </View>

        </View>

        {/* SEARCH */}

        <View style={styles.searchBox}>

          <MaterialCommunityIcons
            name="magnify"
            size={21}
            color="#8A98A9"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search subjects..."
            placeholderTextColor="#A3AFBE"
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
                color="#9AA8B8"
              />
            </TouchableOpacity>
          )}

        </View>

        {/* LIST HEADER */}

        <View style={styles.listHeader}>

          <View>
            <Text style={styles.listTitle}>
              All subjects
            </Text>

            <Text style={styles.listCount}>
              {filteredSubjects.length} subjects found
            </Text>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={17}
              color="#7040D5"
            />

            <Text style={styles.filterText}>
              Filter
            </Text>
          </TouchableOpacity>

        </View>

        {/* subject LIST */}

        <FlatList
          data={filteredSubjects}
          keyExtractor={(item) => item.id}
          renderItem={renderSubject}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>

              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="book-search-outline"
                  size={35}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No subjects found
              </Text>

              <Text style={styles.emptyText}>
                Try changing your search.
              </Text>

            </View>
          }
        />

      </View>

      {/* ACTION MODAL */}

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <View style={styles.modalOverlay}>

          <View style={styles.actionSheet}>

            <View style={styles.actionHeader}>

              <View style={styles.actionSubjectIcon}>
                <MaterialCommunityIcons
                  name="book-open-outline"
                  size={23}
                  color="#7040D5"
                />
              </View>

              <View style={styles.actionSubjectInfo}>

                <Text
                  style={styles.actionSubjectName}
                  numberOfLines={1}
                >
                  {selectedSubject?.name}
                </Text>

                <Text style={styles.actionSubjectId}>
                  {selectedSubject?.subjectId}
                </Text>

              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowActions(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={19}
                  color="#7A8798"
                />
              </TouchableOpacity>

            </View>

            <View style={styles.actionDivider} />

            {/* VIEW */}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={viewSubject}
              activeOpacity={0.75}
            >

              <View
                style={[
                  styles.actionIcon,
                  styles.blueBg,
                ]}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>

              <View style={styles.actionTextContainer}>

                <Text style={styles.actionTitle}>
                  View subject
                </Text>

                <Text style={styles.actionDescription}>
                  View complete subject information
                </Text>

              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0ADBC"
              />

            </TouchableOpacity>

            {/* EDIT */}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openEditSubject}
              activeOpacity={0.75}
            >

              <View
                style={[
                  styles.actionIcon,
                  styles.purpleBg,
                ]}
              >
                <MaterialCommunityIcons
                  name="book-edit-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View style={styles.actionTextContainer}>

                <Text style={styles.actionTitle}>
                  Edit subject
                </Text>

                <Text style={styles.actionDescription}>
                  Update subject information and details
                </Text>

              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0ADBC"
              />

            </TouchableOpacity>

            {/* DELETE */}

            <TouchableOpacity
              style={[
                styles.actionItem,
                styles.deleteAction,
              ]}
              onPress={deleteSubject}
              activeOpacity={0.75}
            >

              <View style={styles.deleteIcon}>

                <MaterialCommunityIcons
                  name="delete-outline"
                  size={21}
                  color="#E95368"
                />

              </View>

              <View style={styles.actionTextContainer}>

                <Text
                  style={[
                    styles.actionTitle,
                    styles.deleteTitle,
                  ]}
                >
                  Delete subject
                </Text>

                <Text style={styles.actionDescription}>
                  Permanently remove this subject
                </Text>

              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#E95368"
              />

            </TouchableOpacity>

          </View>

        </View>
      </Modal>

      {/* EDIT MODAL */}

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.editModalOverlay}>

          <View
            style={[
              styles.editModal,
              isDesktop && styles.editModalDesktop,
            ]}
          >

            {/* EDIT HEADER */}

            <View style={styles.editHeader}>

              <View>

                <Text style={styles.editTitle}>
                  Edit subject
                </Text>

                <Text style={styles.editSubtitle}>
                  subject Information
                </Text>

              </View>

              <TouchableOpacity
                style={styles.editCloseButton}
                onPress={() => setShowEditModal(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>

            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.editContent}
            >

              {/* subject NAME */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  subject Name
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="book-open-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.editInput}
                    placeholder="Enter subject name"
                    placeholderTextColor="#A3AFBE"
                  />

                </View>

              </View>

              {/* CATEGORY */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  Category
                </Text>

                <TouchableOpacity
                  style={styles.editInputBox}
                  onPress={() =>
                    setShowCategoryList(
                      !showCategoryList
                    )
                  }
                  activeOpacity={0.8}
                >

                  <MaterialCommunityIcons
                    name="shape-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <Text style={styles.editSelectText}>
                    {editCategory || 'Select category'}
                  </Text>

                  <MaterialCommunityIcons
                    name={
                      showCategoryList
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={19}
                    color="#8A98A9"
                  />

                </TouchableOpacity>

                {showCategoryList && (
                  <View style={styles.dropdown}>

                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setEditCategory(category);
                          setShowCategoryList(false);
                        }}
                        activeOpacity={0.7}
                      >

                        <Text style={styles.dropdownText}>
                          {category}
                        </Text>

                        {editCategory === category && (
                          <MaterialCommunityIcons
                            name="check"
                            size={18}
                            color="#7040D5"
                          />
                        )}

                      </TouchableOpacity>
                    ))}

                  </View>
                )}

              </View>

              {/* DURATION */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  Duration
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editDuration}
                    onChangeText={setEditDuration}
                    style={styles.editInput}
                    placeholder="Example: 6 Months"
                    placeholderTextColor="#A3AFBE"
                  />

                </View>

              </View>

              {/* BRANCH */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  Branch
                </Text>

                <TouchableOpacity
                  style={styles.editInputBox}
                  onPress={() =>
                    setShowBranchList(!showBranchList)
                  }
                  activeOpacity={0.8}
                >

                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <Text style={styles.editSelectText}>
                    {editBranch || 'Select branch'}
                  </Text>

                  <MaterialCommunityIcons
                    name={
                      showBranchList
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={19}
                    color="#8A98A9"
                  />

                </TouchableOpacity>

                {showBranchList && (
                  <View style={styles.dropdown}>

                    {branches.map((branch) => (
                      <TouchableOpacity
                        key={branch}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setEditBranch(branch);
                          setShowBranchList(false);
                        }}
                        activeOpacity={0.7}
                      >

                        <Text style={styles.dropdownText}>
                          {branch}
                        </Text>

                        {editBranch === branch && (
                          <MaterialCommunityIcons
                            name="check"
                            size={18}
                            color="#7040D5"
                          />
                        )}

                      </TouchableOpacity>
                    ))}

                  </View>
                )}

              </View>

              {/* STUDENTS */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  Enrolled Students
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editStudents}
                    onChangeText={setEditStudents}
                    style={styles.editInput}
                    placeholder="Number of students"
                    placeholderTextColor="#A3AFBE"
                    keyboardType="numeric"
                  />

                </View>

              </View>

              {/* FEE */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  subject Fee
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="cash"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editFee}
                    onChangeText={setEditFee}
                    style={styles.editInput}
                    placeholder="Example: ₹45,000"
                    placeholderTextColor="#A3AFBE"
                  />

                </View>

              </View>

            </ScrollView>

            {/* BUTTONS */}

            <View style={styles.editButtons}>

              <TouchableOpacity
                style={styles.editCancelButton}
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.8}
              >

                <Text style={styles.editCancelText}>
                  Cancel
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSaveButton}
                onPress={saveSubjectChanges}
                activeOpacity={0.8}
              >

                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.editSaveText}>
                  Save Changes
                </Text>

              </TouchableOpacity>

            </View>

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

  /* HEADER */

  header: {
    width: '100%',
    backgroundColor: '#7040D5',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.15)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 21,
    lineHeight: 27,

    color: '#FFFFFF',
  },

  headerAddButton: {
    minHeight: 42,

    borderRadius: 12,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 11,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,
  },

  headerAddText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,

    color: '#7040D5',
  },

  /* CONTENT */

  content: {
    flex: 1,

    paddingHorizontal: 18,
    paddingTop: 18,
  },

  headingRow: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 16,
  },

  headingInfo: {
    flex: 1,
    minWidth: 0,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    lineHeight: 28,

    color: '#172033',
  },

  pageDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    lineHeight: 17,

    color: '#748096',

    marginTop: 2,
  },

  /* SUMMARY */

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 10,

    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    minWidth: 145,

    minHeight: 78,

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,
    borderColor: '#EEF0F5',

    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  summaryIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  summaryInfo: {
    flex: 1,
    minWidth: 0,
  },

  purpleBg: {
    backgroundColor: '#F1EAFF',
  },

  greenBg: {
    backgroundColor: '#E7F8EF',
  },

  blueBg: {
    backgroundColor: '#EAF2FF',
  },

  orangeBg: {
    backgroundColor: '#FFF1E2',
  },

  summaryLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,

    color: '#748096',
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    lineHeight: 23,

    color: '#172033',

    marginTop: 1,
  },

  /* SEARCH */

  searchBox: {
    width: '100%',
    height: 49,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#E2E6EC',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 13,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 15,
  },

  searchInput: {
    flex: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,

    color: '#172033',

    marginLeft: 8,

    paddingVertical: 0,
  },

  /* LIST HEADER */

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 10,
  },

  listTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,

    color: '#172033',
  },

  listCount: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,

    color: '#8A98A9',

    marginTop: 1,
  },

  filterButton: {
    height: 34,

    borderRadius: 9,

    backgroundColor: '#F1EAFF',

    paddingHorizontal: 10,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,

    color: '#7040D5',
  },

  /* subject CARD */

  listContent: {
    paddingBottom: 30,
  },

  subjectCard: {
    width: '100%',
    minHeight: 103,

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,
    borderColor: '#EEF0F5',

    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 9,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  subjectIcon: {
    width: 47,
    height: 47,

    borderRadius: 15,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 11,
  },

  subjectInfo: {
    flex: 1,
    minWidth: 0,
  },

  subjectName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,

    color: '#172033',
  },

  subjectId: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,

    color: '#7040D5',

    marginTop: 1,
    marginBottom: 3,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 2,
  },

  detailText: {
    flexShrink: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,

    color: '#7A8798',

    marginLeft: 5,
  },

  subjectMeta: {
    alignItems: 'flex-end',

    marginHorizontal: 5,
  },

  durationText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,

    color: '#64748B',
  },

  studentsText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,

    color: '#8A98A9',

    marginTop: 2,
    marginBottom: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 7,
    paddingVertical: 5,

    borderRadius: 7,
  },

  activeBadge: {
    backgroundColor: '#E7F8EF',
  },

  inactiveBadge: {
    backgroundColor: '#FFF1E2',
  },

  statusDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 4,
  },

  activeDot: {
    backgroundColor: '#35B878',
  },

  inactiveDot: {
    backgroundColor: '#F7941D',
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
  },

  activeText: {
    color: '#35B878',
  },

  inactiveText: {
    color: '#F7941D',
  },

  moreButton: {
    width: 30,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* EMPTY */

  emptyState: {
    alignItems: 'center',

    paddingVertical: 50,
  },

  emptyIcon: {
    width: 72,
    height: 72,

    borderRadius: 21,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,

    color: '#172033',
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,

    color: '#8A98A9',

    marginTop: 3,
  },

  /* ACTION MODAL */

  modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(10,18,35,0.48)',

    justifyContent: 'flex-end',

    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'android' ? 12 : 25,
  },

  actionSheet: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 10,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 10,
  },

  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 5,
  },

  actionSubjectIcon: {
    width: 45,
    height: 45,

    borderRadius: 14,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  actionSubjectInfo: {
    flex: 1,
    minWidth: 0,
  },

  actionSubjectName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,

    color: '#172033',
  },

  actionSubjectId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,

    color: '#7040D5',

    marginTop: 1,
  },

  closeButton: {
    width: 34,
    height: 34,

    borderRadius: 10,

    backgroundColor: '#F3F5F8',

    alignItems: 'center',
    justifyContent: 'center',
  },

  actionDivider: {
    height: 1,

    backgroundColor: '#EEF0F5',

    marginVertical: 10,
  },

  actionItem: {
    minHeight: 68,

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 7,
  },

  actionIcon: {
    width: 43,
    height: 43,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  actionTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,

    color: '#172033',
  },

  actionDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,

    color: '#8A98A9',

    marginTop: 2,
  },

  deleteAction: {
    marginTop: 3,

    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',

    paddingTop: 10,
  },

  deleteIcon: {
    width: 43,
    height: 43,

    borderRadius: 12,

    backgroundColor: '#FFF0F1',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  deleteTitle: {
    color: '#E95368',
  },

  /* EDIT MODAL */

  editModalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(10,18,35,0.45)',

    justifyContent: 'flex-end',
  },

  editModal: {
    width: '100%',
    maxHeight: '92%',

    backgroundColor: '#F7F8FC',

    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    overflow: 'hidden',
  },

  editModalDesktop: {
    width: 560,

    alignSelf: 'center',

    borderRadius: 20,

    marginBottom: 20,

    maxHeight: '90%',
  },

  editHeader: {
    minHeight: 72,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  editTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,

    color: '#172033',
  },

  editSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,

    color: '#8A98A9',

    marginTop: 1,
  },

  editCloseButton: {
    width: 37,
    height: 37,

    borderRadius: 11,

    backgroundColor: '#F1F3F6',

    alignItems: 'center',
    justifyContent: 'center',
  },

  editContent: {
    padding: 18,
    paddingBottom: 20,
  },

  editField: {
    marginBottom: 14,
  },

  editLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,

    color: '#445266',

    marginBottom: 6,
  },

  editInputBox: {
    minHeight: 48,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#E2E6EC',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',
  },

  editInput: {
    flex: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,

    color: '#172033',

    marginLeft: 8,

    paddingVertical: 0,
  },

  editSelectText: {
    flex: 1,

    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,

    color: '#172033',

    marginLeft: 8,
  },

  dropdown: {
    marginTop: 5,

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#E2E6EC',

    overflow: 'hidden',

    elevation: 4,
  },

  dropdownItem: {
    minHeight: 43,

    paddingHorizontal: 13,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  dropdownText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,

    color: '#445266',
  },

  editButtons: {
    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',

    padding: 14,

    flexDirection: 'row',

    gap: 10,
  },

  editCancelButton: {
    flex: 1,

    height: 48,

    borderRadius: 12,

    backgroundColor: '#F1F3F6',

    alignItems: 'center',
    justifyContent: 'center',
  },

  editCancelText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,

    color: '#66768A',
  },

  editSaveButton: {
    flex: 1.5,

    height: 48,

    borderRadius: 12,

    backgroundColor: '#7040D5',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,
  },

  editSaveText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,

    color: '#FFFFFF',
  },
});