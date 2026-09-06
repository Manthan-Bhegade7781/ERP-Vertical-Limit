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

type Branch = {
  id: string;
  name: string;
  branchId: string;
  city: string;
  manager: string;
  phone: string;
  email: string;
  students: number;
  teachers: number;
  status: 'Active' | 'Inactive';
};

const initialBranches: Branch[] = [
  {
    id: '1',
    name: 'Pune Branch',
    branchId: 'VLCC-BR-001',
    city: 'Pune',
    manager: 'Amit Kulkarni',
    phone: '+91 98765 60001',
    email: 'pune@example.com',
    students: 684,
    teachers: 42,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Mumbai Branch',
    branchId: 'VLCC-BR-002',
    city: 'Mumbai',
    manager: 'Priya Mehta',
    phone: '+91 98765 60002',
    email: 'mumbai@example.com',
    students: 742,
    teachers: 48,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Nashik Branch',
    branchId: 'VLCC-BR-003',
    city: 'Nashik',
    manager: 'Rahul Patil',
    phone: '+91 98765 60003',
    email: 'nashik@example.com',
    students: 365,
    teachers: 24,
    status: 'Active',
  },
  {
    id: '4',
    name: 'Nagpur Branch',
    branchId: 'VLCC-BR-004',
    city: 'Nagpur',
    manager: 'Sneha Joshi',
    phone: '+91 98765 60004',
    email: 'nagpur@example.com',
    students: 291,
    teachers: 21,
    status: 'Active',
  },
  {
    id: '5',
    name: 'Main Branch',
    branchId: 'VLCC-BR-005',
    city: 'Pune',
    manager: 'Vikram Shah',
    phone: '+91 98765 60005',
    email: 'main@example.com',
    students: 486,
    teachers: 21,
    status: 'Inactive',
  },
];

export default function BranchesPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isDesktop = width >= 900;

  const [branches, setBranches] =
    useState<Branch[]>(initialBranches);

  const [search, setSearch] = useState('');

  const [selectedBranch, setSelectedBranch] =
    useState<Branch | null>(null);

  const [showActions, setShowActions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editManager, setEditManager] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return branches;
    }

    return branches.filter((branch) =>
      [
        branch.name,
        branch.branchId,
        branch.city,
        branch.manager,
        branch.phone,
        branch.email,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [branches, search]);

  const activeBranches = branches.filter(
    (branch) => branch.status === 'Active'
  ).length;

  const inactiveBranches = branches.filter(
    (branch) => branch.status === 'Inactive'
  ).length;

  const openAddBranch = () => {
    router.push({
      pathname: '/(tabs)/explore',
      params: {
        feature: 'Add Branch',
      },
    });
  };

  const openBranchActions = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowActions(true);
  };

  const viewBranch = () => {
    setShowActions(false);

    if (!selectedBranch) {
      return;
    }

    Alert.alert(
      selectedBranch.name,
      `Branch ID: ${selectedBranch.branchId}\n\nCity: ${selectedBranch.city}\nManager: ${selectedBranch.manager}\nPhone: ${selectedBranch.phone}\nEmail: ${selectedBranch.email}\nStudents: ${selectedBranch.students}\nTeachers: ${selectedBranch.teachers}`
    );
  };

  const openEditBranch = () => {
    if (!selectedBranch) {
      return;
    }

    setEditName(selectedBranch.name);
    setEditCity(selectedBranch.city);
    setEditManager(selectedBranch.manager);
    setEditPhone(selectedBranch.phone);
    setEditEmail(selectedBranch.email);

    setShowActions(false);
    setShowEditModal(true);
  };

  const saveBranchChanges = () => {
    if (!selectedBranch) {
      return;
    }

    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter the branch name.');
      return;
    }

    if (!editCity.trim()) {
      Alert.alert('Required', 'Please enter the city.');
      return;
    }

    if (!editManager.trim()) {
      Alert.alert('Required', 'Please enter the branch manager.');
      return;
    }

    if (!editPhone.trim()) {
      Alert.alert('Required', 'Please enter the phone number.');
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert('Required', 'Please enter the email address.');
      return;
    }

    const updatedBranch = {
      ...selectedBranch,
      name: editName.trim(),
      city: editCity.trim(),
      manager: editManager.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
    };

    setBranches((currentBranches) =>
      currentBranches.map((branch) =>
        branch.id === selectedBranch.id
          ? updatedBranch
          : branch
      )
    );

    setSelectedBranch(updatedBranch);
    setShowEditModal(false);

    Alert.alert(
      'Updated',
      'Branch information has been updated successfully.'
    );
  };

  const deleteBranch = () => {
    if (!selectedBranch) {
      return;
    }

    const branchId = selectedBranch.id;
    const branchName = selectedBranch.name;

    setShowActions(false);

    Alert.alert(
      'Delete Branch',
      `Are you sure you want to delete ${branchName}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBranches((currentBranches) =>
              currentBranches.filter(
                (branch) => branch.id !== branchId
              )
            );

            setSelectedBranch(null);

            Alert.alert(
              'Deleted',
              `${branchName} has been deleted successfully.`
            );
          },
        },
      ]
    );
  };

  const renderBranch = ({
    item,
  }: {
    item: Branch;
  }) => {
    return (
      <TouchableOpacity
        style={styles.branchCard}
        activeOpacity={0.85}
        onPress={() => openBranchActions(item)}
      >
        <View style={styles.branchIcon}>
          <MaterialCommunityIcons
            name="office-building-outline"
            size={23}
            color="#7040D5"
          />
        </View>

        <View style={styles.branchInfo}>
          <Text
            style={styles.branchName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.branchId}>
            {item.branchId}
          </Text>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color="#8A98A9"
            />

            <Text
              style={styles.detailText}
              numberOfLines={1}
            >
              {item.city}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="account-outline"
              size={14}
              color="#8A98A9"
            />

            <Text
              style={styles.detailText}
              numberOfLines={1}
            >
              {item.manager}
            </Text>
          </View>
        </View>

        <View style={styles.branchMeta}>
          <Text style={styles.metaText}>
            {item.students} students
          </Text>

          <Text style={styles.metaText}>
            {item.teachers} teachers
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
          onPress={() => openBranchActions(item)}
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
          <Text style={styles.headerTitle}>
            Branches
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={openAddBranch}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="office-building-plus-outline"
            size={20}
            color="#7040D5"
          />

          {isDesktop && (
            <Text style={styles.headerAddText}>
              Add Branch
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
              Branch Management
            </Text>

            <Text style={styles.pageDescription}>
              Manage branches, branch managers, locations,
              students and teachers.
            </Text>
          </View>


        </View>

        {/* SUMMARY */}

        <View style={styles.summaryGrid}>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                styles.purpleBg,
              ]}
            >
              <MaterialCommunityIcons
                name="office-building-outline"
                size={22}
                color="#7040D5"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Total Branches
              </Text>

              <Text style={styles.summaryValue}>
                12
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
                Active Branches
              </Text>

              <Text style={styles.summaryValue}>
                {activeBranches}
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
                name="office-building-plus-outline"
                size={22}
                color="#2675E8"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                New Branches
              </Text>

              <Text style={styles.summaryValue}>
                2
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
                name="office-building-remove-outline"
                size={22}
                color="#F7941D"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                Inactive
              </Text>

              <Text style={styles.summaryValue}>
                {inactiveBranches}
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
            placeholder="Search branches..."
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
              All Branches
            </Text>

            <Text style={styles.listCount}>
              {filteredBranches.length} branches found
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

        {/* LIST */}

        <FlatList
          data={filteredBranches}
          keyExtractor={(item) => item.id}
          renderItem={renderBranch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>

              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="office-building-search-outline"
                  size={35}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No branches found
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

              <View style={styles.actionBranchIcon}>
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={23}
                  color="#7040D5"
                />
              </View>

              <View style={styles.actionBranchInfo}>

                <Text
                  style={styles.actionBranchName}
                  numberOfLines={1}
                >
                  {selectedBranch?.name}
                </Text>

                <Text style={styles.actionBranchId}>
                  {selectedBranch?.branchId}
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
              onPress={viewBranch}
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
                  View Branch
                </Text>

                <Text style={styles.actionDescription}>
                  View complete branch information
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
              onPress={openEditBranch}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.actionIcon,
                  styles.purpleBg,
                ]}
              >
                <MaterialCommunityIcons
                  name="office-building-edit-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>
                  Edit Branch
                </Text>

                <Text style={styles.actionDescription}>
                  Update branch and manager information
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
              onPress={deleteBranch}
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
                  Delete Branch
                </Text>

                <Text style={styles.actionDescription}>
                  Permanently remove this branch
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

            <View style={styles.editHeader}>

              <View>
                <Text style={styles.editTitle}>
                  Edit Branch
                </Text>

                <Text style={styles.editSubtitle}>
                  Branch Information
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

              {/* NAME */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  Branch Name
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.editInput}
                    placeholder="Enter branch name"
                    placeholderTextColor="#A3AFBE"
                  />

                </View>
              </View>

              {/* CITY */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  City
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editCity}
                    onChangeText={setEditCity}
                    style={styles.editInput}
                    placeholder="Enter city"
                    placeholderTextColor="#A3AFBE"
                  />

                </View>
              </View>

              {/* MANAGER */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  Branch Manager
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="account-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editManager}
                    onChangeText={setEditManager}
                    style={styles.editInput}
                    placeholder="Enter manager name"
                    placeholderTextColor="#A3AFBE"
                  />

                </View>
              </View>

              {/* PHONE */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  Mobile Number
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    style={styles.editInput}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#A3AFBE"
                    keyboardType="phone-pad"
                  />

                </View>
              </View>

              {/* EMAIL */}

              <View style={styles.editField}>

                <Text style={styles.editLabel}>
                  Email Address
                </Text>

                <View style={styles.editInputBox}>

                  <MaterialCommunityIcons
                    name="email-outline"
                    size={19}
                    color="#8A98A9"
                  />

                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    style={styles.editInput}
                    placeholder="Enter email"
                    placeholderTextColor="#A3AFBE"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                </View>
              </View>

            </ScrollView>

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
                onPress={saveBranchChanges}
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

  listContent: {
    paddingBottom: 30,
  },

  branchCard: {
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

  branchIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  branchInfo: {
    flex: 1,
    minWidth: 0,
  },

  branchName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    color: '#172033',
  },

  branchId: {
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

  branchMeta: {
    alignItems: 'flex-end',
    marginHorizontal: 5,
  },

  metaText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A98A9',
    marginBottom: 3,
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

  actionBranchIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  actionBranchInfo: {
    flex: 1,
    minWidth: 0,
  },

  actionBranchName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
  },

  actionBranchId: {
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

  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,18,35,0.45)',
    justifyContent: 'flex-end',
  },

  editModal: {
    width: '100%',
    maxHeight: '90%',
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