import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UserRole =
  | 'Admin'
  | 'Teacher';

type UserStatus = 'Active' | 'Inactive';

type UserRecord = {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  mobile: string;
  branch: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  joinedDate: string;
};

const initialUsers: UserRecord[] = [
  {
    id: 1,
    name: 'Vikram Shah',
    employeeId: 'VLCC-EMP-001',
    email: 'vikram.shah@vlcc.com',
    mobile: '+91 98765 60001',
    branch: 'All Branches',
    role: 'Admin',
    status: 'Active',
    lastLogin: '05 Sep 2026, 09:42 AM',
    joinedDate: '12 Jan 2023',
  },
  {
    id: 2,
    name: 'Amit Kulkarni',
    employeeId: 'VLCC-EMP-002',
    email: 'amit.kulkarni@vlcc.com',
    mobile: '+91 98765 60002',
    branch: 'Pune Branch',
    role: 'Admin',
    status: 'Active',
    lastLogin: '05 Sep 2026, 08:55 AM',
    joinedDate: '18 Mar 2023',
  },
  {
    id: 3,
    name: 'Priya Mehta',
    employeeId: 'VLCC-EMP-003',
    email: 'priya.mehta@vlcc.com',
    mobile: '+91 98765 60003',
    branch: 'Mumbai Branch',
    role: 'Admin',
    status: 'Active',
    lastLogin: '05 Sep 2026, 09:15 AM',
    joinedDate: '22 Apr 2023',
  },
  {
    id: 4,
    name: 'Rahul Patil',
    employeeId: 'VLCC-EMP-004',
    email: 'rahul.patil@vlcc.com',
    mobile: '+91 98765 60004',
    branch: 'Nashik Branch',
    role: 'Teacher',
    status: 'Active',
    lastLogin: '04 Sep 2026, 06:32 PM',
    joinedDate: '09 Jun 2023',
  },
  {
    id: 5,
    name: 'Sneha Joshi',
    employeeId: 'VLCC-EMP-005',
    email: 'sneha.joshi@vlcc.com',
    mobile: '+91 98765 60005',
    branch: 'Nagpur Branch',
    role: 'Teacher',
    status: 'Active',
    lastLogin: '05 Sep 2026, 08:20 AM',
    joinedDate: '14 Jul 2023',
  },
  {
    id: 6,
    name: 'Rohit Desai',
    employeeId: 'VLCC-EMP-006',
    email: 'rohit.desai@vlcc.com',
    mobile: '+91 98765 60006',
    branch: 'Pune Branch',
    role: 'Teacher',
    status: 'Active',
    lastLogin: '04 Sep 2026, 05:45 PM',
    joinedDate: '03 Aug 2023',
  },
  {
    id: 7,
    name: 'Neha Joshi',
    employeeId: 'VLCC-EMP-007',
    email: 'neha.joshi@vlcc.com',
    mobile: '+91 98765 60007',
    branch: 'Nashik Branch',
    role: 'Teacher',
    status: 'Active',
    lastLogin: '05 Sep 2026, 07:55 AM',
    joinedDate: '21 Sep 2023',
  },
  {
    id: 8,
    name: 'Karan Malhotra',
    employeeId: 'VLCC-EMP-008',
    email: 'karan.malhotra@vlcc.com',
    mobile: '+91 98765 60008',
    branch: 'Pune Branch',
    role: 'Admin',
    status: 'Active',
    lastLogin: '04 Sep 2026, 04:12 PM',
    joinedDate: '11 Oct 2023',
  },
];

const roleColors: Record<
  UserRole,
  { bg: string; text: string; icon: string }
> = {
  'Admin': {
    bg: '#F1EAFF',
    text: '#7040D5',
    icon: 'shield-crown-outline',
  },

  Teacher: {
    bg: '#FFF1E2',
    text: '#E88713',
    icon: 'school-outline',
  },
};

const rolePermissions: Record<UserRole, string[]> = {
  'Admin': [
    'Manage branch students',
    'Manage branch teachers',
    'Manage batches',
    'Manage subjects',
    'Manage attendance',
    'Manage examinations',
    'Manage branch fees',
    'View branch reports',
  ],

  Teacher: [
    'View assigned students',
    'Manage attendance',
    'Manage assignments',
    'Manage examinations',
    'View student performance',
  ],
};

export default function UsersRolesPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const contentWidth = width - 32;
  const statGap = 10;

  const statCardWidth =
    (contentWidth - statGap * 2) / 3;

  const [users, setUsers] =
    useState<UserRecord[]>(initialUsers);

  const [search, setSearch] = useState('');

  const [activeFilter, setActiveFilter] =
    useState<
      'All' | UserStatus | UserRole
    >('All');

  const [selectedUser, setSelectedUser] =
    useState<UserRecord | null>(null);

  const [actionModalVisible, setActionModalVisible] =
    useState(false);

  const [viewModalVisible, setViewModalVisible] =
    useState(false);

  const [editModalVisible, setEditModalVisible] =
    useState(false);

  const [roleModalVisible, setRoleModalVisible] =
    useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [branch, setBranch] = useState('');

  const [selectedRole, setSelectedRole] =
      useState<UserRole>('Teacher');

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === 'Active'
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === 'Inactive'
  ).length;

  const admins = users.filter(
  (user) =>
      user.role === 'Admin'
  ).length;

  const teachers = users.filter(
    (user) =>
      user.role === 'Teacher'
  ).length;


  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name
          .toLowerCase()
          .includes(query) ||
        user.employeeId
          .toLowerCase()
          .includes(query) ||
        user.email
          .toLowerCase()
          .includes(query) ||
        user.branch
          .toLowerCase()
          .includes(query) ||
        user.role
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === 'All' ||
        user.status === activeFilter ||
        user.role === activeFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    users,
    search,
    activeFilter,
  ]);

  const openActions = (
    user: UserRecord
  ) => {
    setSelectedUser(user);
    setActionModalVisible(true);
  };

  const openEdit = (
    user: UserRecord
  ) => {
    setSelectedUser(user);

    setName(user.name);
    setEmail(user.email);
    setMobile(user.mobile);
    setBranch(user.branch);

    setActionModalVisible(false);
    setEditModalVisible(true);
  };

  const openRoleManager = (
    user: UserRecord
  ) => {
    setSelectedUser(user);
    setSelectedRole(user.role);

    setActionModalVisible(false);
    setRoleModalVisible(true);
  };

  const saveUser = () => {
    if (!selectedUser) {
      return;
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !branch.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please fill all user information.'
      );
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: name.trim(),
              email: email.trim(),
              mobile: mobile.trim(),
              branch: branch.trim(),
            }
          : user
      )
    );

    setEditModalVisible(false);

    Alert.alert(
      'User Updated',
      `${name.trim()} has been updated successfully.`
    );
  };

  const saveRole = () => {
    if (!selectedUser) {
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              role: selectedRole,
            }
          : user
      )
    );

    setSelectedUser({
      ...selectedUser,
      role: selectedRole,
    });

    setRoleModalVisible(false);

    Alert.alert(
      'Role Updated',
      `${selectedUser.name} is now assigned the ${selectedRole} role.`
    );
  };

  const toggleUserStatus = (
    user: UserRecord
  ) => {
    setActionModalVisible(false);

    const nextStatus =
      user.status === 'Active'
        ? 'Inactive'
        : 'Active';

    Alert.alert(
      `${nextStatus} User`,
      `Are you sure you want to mark ${user.name} as ${nextStatus.toLowerCase()}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            setUsers((current) =>
              current.map(
                (item) =>
                  item.id === user.id
                    ? {
                        ...item,
                        status: nextStatus,
                      }
                    : item
              )
            );
          },
        },
      ]
    );
  };

  const deleteUser = (
    user: UserRecord
  ) => {
    setActionModalVisible(false);

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUsers((current) =>
              current.filter(
                (item) =>
                  item.id !== user.id
              )
            );

            Alert.alert(
              'User Deleted',
              `${user.name} has been deleted.`
            );
          },
        },
      ]
    );
  };

  const resetPassword = (
    user: UserRecord
  ) => {
    setActionModalVisible(false);

    Alert.alert(
      'Reset Password',
      `A password reset instruction will be sent to ${user.email}.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Reset',
          onPress: () =>
            Alert.alert(
              'Reset Sent',
              'Password reset instruction has been sent.'
            ),
        },
      ]
    );
  };

  const renderSummaryCard = (
    title: string,
    value: string,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    type:
      | 'purple'
      | 'blue'
      | 'green'
      | 'orange'
      | 'pink'
  ) => {
    const colors = {
      purple: {
        bg: '#F1EAFF',
        icon: '#7040D5',
      },
      blue: {
        bg: '#EAF2FF',
        icon: '#2675E8',
      },
      green: {
        bg: '#E7F8EF',
        icon: '#35B878',
      },
      orange: {
        bg: '#FFF1E2',
        icon: '#F7941D',
      },
      pink: {
        bg: '#FFE9F0',
        icon: '#E95386',
      },
    };

    return (
      <View
        style={[
          styles.summaryCard,
          {
            width: statCardWidth,
          },
        ]}
      >
        <View
          style={[
            styles.summaryIcon,
            {
              backgroundColor:
                colors[type].bg,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={19}
            color={colors[type].icon}
          />
        </View>

        <Text
          style={styles.summaryTitle}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text
          style={styles.summaryValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {value}
        </Text>
      </View>
    );
  };

  const renderUserCard = (
    user: UserRecord
  ) => {
    const roleStyle =
      roleColors[user.role];

    return (
      <View
        key={user.id}
        style={styles.userCard}
      >
        <View
          style={styles.userTopRow}
        >
          <View
            style={styles.userInfo}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    roleStyle.bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  {
                    color:
                      roleStyle.text,
                  },
                ]}
              >
                {user.name
                  .split(' ')
                  .map(
                    (part) =>
                      part[0]
                  )
                  .join('')
                  .slice(0, 2)}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.userName
                }
                numberOfLines={1}
              >
                {user.name}
              </Text>

              <Text
                style={
                  styles.employeeId
                }
              >
                {user.employeeId}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={
              styles.moreButton
            }
            onPress={() =>
              openActions(user)
            }
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color="#59657A"
            />
          </TouchableOpacity>
        </View>

        <View
          style={styles.roleStatusRow}
        >
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  roleStyle.bg,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                roleStyle.icon as keyof typeof MaterialCommunityIcons.glyphMap
              }
              size={14}
              color={roleStyle.text}
            />

            <Text
              style={[
                styles.roleText,
                {
                  color:
                    roleStyle.text,
                },
              ]}
              numberOfLines={1}
            >
              {user.role}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  user.status ===
                  'Active'
                    ? '#E7F8EF'
                    : '#FFE9F0',
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    user.status ===
                    'Active'
                      ? '#35B878'
                      : '#E95386',
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    user.status ===
                    'Active'
                      ? '#22945F'
                      : '#E95386',
                },
              ]}
            >
              {user.status}
            </Text>
          </View>
        </View>

        <View
          style={styles.userDetails}
        >
          <InfoRow
            icon="email-outline"
            text={user.email}
          />

          <InfoRow
            icon="phone-outline"
            text={user.mobile}
          />

          <InfoRow
            icon="office-building-outline"
            text={user.branch}
          />

          <InfoRow
            icon="clock-outline"
            text={`Last login: ${user.lastLogin}`}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingTop:
            insets.top,
        },
      ]}
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Users & Roles
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={
            styles.managementTitle
          }
        >
          Users & Roles Management
        </Text>

        <Text
          style={
            styles.managementSubtitle
          }
        >
          Manage users, roles, access and account status
        </Text>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryGrid
          }
        >
          {renderSummaryCard(
          'Total Users',
          String(totalUsers),
          'account-group-outline',
          'purple'
          )}

          {renderSummaryCard(
            'Active Users',
            String(activeUsers),
            'account-check-outline',
            'green'
          )}

          {renderSummaryCard(
            'Inactive Users',
            String(inactiveUsers),
            'account-off-outline',
            'pink'
          )}

          {renderSummaryCard(
            'Admins',
            String(admins),
            'shield-account-outline',
            'blue'
          )}

          {renderSummaryCard(
            'Teachers',
            String(teachers),
            'school-outline',
            'orange'
          )}
        </View>

        {/* SEARCH */}

        <View
          style={styles.searchBox}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={21}
            color="#8B95A7"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search user, ID, email, branch..."
            placeholderTextColor="#A2AABB"
            style={
              styles.searchInput
            }
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearch('')
              }
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={19}
                color="#A2AABB"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTERS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {[
            'All',
            'Active',
            'Inactive',
            'Admin',
            'Teacher',
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() =>
                setActiveFilter(
                  filter as
                    | 'All'
                    | UserStatus
                    | UserRole
                )
              }
              style={[
                styles.filterButton,
                activeFilter ===
                  filter &&
                  styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter ===
                    filter &&
                    styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LIST HEADER */}

        <View
          style={styles.listHeader}
        >
          <Text
            style={styles.listTitle}
          >
            System Users
          </Text>

          <Text
            style={styles.recordCount}
          >
            {filteredUsers.length}{' '}
            Records
          </Text>
        </View>

        {filteredUsers.length ===
        0 ? (
          <View
            style={styles.emptyBox}
          >
            <MaterialCommunityIcons
              name="account-search-outline"
              size={44}
              color="#A7AFBD"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No users found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          filteredUsers.map(
            renderUserCard
          )
        )}
      </ScrollView>

      {/* ACTION MODAL */}

      <Modal
        visible={
          actionModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setActionModalVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setActionModalVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.actionModal
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  User Actions
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedUser?.name
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setActionModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            <ActionButton
              icon="eye-outline"
              color="#7040D5"
              text="View User"
              onPress={() => {
                setActionModalVisible(
                  false
                );
                setViewModalVisible(
                  true
                );
              }}
            />

            <ActionButton
              icon="pencil-outline"
              color="#2675E8"
              text="Edit User"
              onPress={() => {
                if (selectedUser) {
                  openEdit(
                    selectedUser
                  );
                }
              }}
            />

            <ActionButton
              icon="shield-account-outline"
              color="#35B878"
              text="Manage Role"
              onPress={() => {
                if (selectedUser) {
                  openRoleManager(
                    selectedUser
                  );
                }
              }}
            />

            <ActionButton
              icon="lock-reset"
              color="#F7941D"
              text="Reset Password"
              onPress={() => {
                if (selectedUser) {
                  resetPassword(
                    selectedUser
                  );
                }
              }}
            />

            <ActionButton
              icon={
                selectedUser?.status ===
                'Active'
                  ? 'account-off-outline'
                  : 'account-check-outline'
              }
              color="#E95386"
              text={
                selectedUser?.status ===
                'Active'
                  ? 'Deactivate User'
                  : 'Activate User'
              }
              onPress={() => {
                if (selectedUser) {
                  toggleUserStatus(
                    selectedUser
                  );
                }
              }}
            />

            <ActionButton
              icon="delete-outline"
              color="#D84B63"
              text="Delete User"
              onPress={() => {
                if (selectedUser) {
                  deleteUser(
                    selectedUser
                  );
                }
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* VIEW USER */}

      <Modal
        visible={
          viewModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setViewModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.largeModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  User Details
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Account information
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setViewModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.detailProfile
                  }
                >
                  <View
                    style={[
                      styles.largeAvatar,
                      {
                        backgroundColor:
                          roleColors[
                            selectedUser
                              .role
                          ].bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.largeAvatarText,
                        {
                          color:
                            roleColors[
                              selectedUser
                                .role
                            ].text,
                        },
                      ]}
                    >
                      {selectedUser.name
                        .split(' ')
                        .map(
                          (part) =>
                            part[0]
                        )
                        .join('')
                        .slice(0, 2)}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.detailName
                    }
                  >
                    {
                      selectedUser.name
                    }
                  </Text>

                  <Text
                    style={
                      styles.detailId
                    }
                  >
                    {
                      selectedUser.employeeId
                    }
                  </Text>

                  <View
                    style={
                      styles.detailBadgeRow
                    }
                  >
                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor:
                            roleColors[
                              selectedUser
                                .role
                            ].bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          {
                            color:
                              roleColors[
                                selectedUser
                                  .role
                              ].text,
                          },
                        ]}
                      >
                        {
                          selectedUser.role
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            selectedUser.status ===
                            'Active'
                              ? '#E7F8EF'
                              : '#FFE9F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              selectedUser.status ===
                              'Active'
                                ? '#22945F'
                                : '#E95386',
                          },
                        ]}
                      >
                        {
                          selectedUser.status
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Contact Information
                </Text>

                <DetailRow
                  icon="email-outline"
                  label="Email"
                  value={
                    selectedUser.email
                  }
                />

                <DetailRow
                  icon="phone-outline"
                  label="Mobile"
                  value={
                    selectedUser.mobile
                  }
                />

                <DetailRow
                  icon="office-building-outline"
                  label="Branch"
                  value={
                    selectedUser.branch
                  }
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Account Information
                </Text>

                <DetailRow
                  icon="shield-account-outline"
                  label="Role"
                  value={
                    selectedUser.role
                  }
                />

                <DetailRow
                  icon="calendar-outline"
                  label="Joined Date"
                  value={
                    selectedUser.joinedDate
                  }
                />

                <DetailRow
                  icon="clock-outline"
                  label="Last Login"
                  value={
                    selectedUser.lastLogin
                  }
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Role Permissions
                </Text>

                <View
                  style={
                    styles.permissionsBox
                  }
                >
                  {rolePermissions[
                    selectedUser.role
                  ].map(
                    (permission) => (
                      <View
                        key={
                          permission
                        }
                        style={
                          styles.permissionRow
                        }
                      >
                        <MaterialCommunityIcons
                          name="check-circle-outline"
                          size={17}
                          color="#35B878"
                        />

                        <Text
                          style={
                            styles.permissionText
                          }
                        >
                          {permission}
                        </Text>
                      </View>
                    )
                  )}
                </View>

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={() => {
                    setViewModalVisible(
                      false
                    );
                    openEdit(
                      selectedUser
                    );
                  }}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Edit User
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* EDIT USER */}

      <Modal
        visible={
          editModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setEditModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.largeModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Edit User
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Update user information
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setEditModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              <InputField
                label="Full Name"
                value={name}
                onChangeText={setName}
                icon="account-outline"
              />

              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                icon="email-outline"
                keyboardType="email-address"
              />

              <InputField
                label="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                icon="phone-outline"
                keyboardType="phone-pad"
              />

              <InputField
                label="Branch"
                value={branch}
                onChangeText={setBranch}
                icon="office-building-outline"
              />

              <View
                style={
                  styles.readOnlyBox
                }
              >
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={18}
                  color="#7040D5"
                />

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.readOnlyLabel
                    }
                  >
                    Employee ID
                  </Text>

                  <Text
                    style={
                      styles.readOnlyValue
                    }
                  >
                    {
                      selectedUser?.employeeId
                    }
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={
                  saveUser
                }
              >
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Save Changes
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MANAGE ROLE */}

      <Modal
        visible={
          roleModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setRoleModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.largeModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Manage Role
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedUser?.name
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setRoleModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            <Text
              style={
                styles.roleSelectTitle
              }
            >
              Select User Role
            </Text>

            {(
              Object.keys(
                roleColors
              ) as UserRole[]
            ).map((role) => {
              const color =
                roleColors[role];

              const isSelected =
                selectedRole ===
                role;

              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    isSelected &&
                      styles.roleOptionActive,
                  ]}
                  onPress={() =>
                    setSelectedRole(
                      role
                    )
                  }
                >
                  <View
                    style={[
                      styles.roleOptionIcon,
                      {
                        backgroundColor:
                          color.bg,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        color.icon as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={20}
                      color={
                        color.text
                      }
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.roleOptionTitle
                      }
                    >
                      {role}
                    </Text>

                    <Text
                      style={
                        styles.roleOptionSubtitle
                      }
                    >
                      {
                        rolePermissions[
                          role
                        ].length
                      }{' '}
                      permissions
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      isSelected &&
                        styles.radioActive,
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={
                          styles.radioDot
                        }
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            <View
              style={
                styles.rolePermissionPreview
              }
            >
              <Text
                style={
                  styles.permissionPreviewTitle
                }
              >
                Role Permissions
              </Text>

              {rolePermissions[
                selectedRole
              ]
                .slice(0, 5)
                .map(
                  (permission) => (
                    <View
                      key={
                        permission
                      }
                      style={
                        styles.permissionRow
                      }
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#35B878"
                      />

                      <Text
                        style={
                          styles.permissionText
                        }
                      >
                        {permission}
                      </Text>
                    </View>
                  )
                )}
            </View>

            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={
                saveRole
              }
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Update Role
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function InfoRow({
  icon,
  text,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
}) {
  return (
    <View
      style={styles.infoRow}
    >
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color="#8A93A4"
      />

      <Text
        style={styles.infoText}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.detailRow}
    >
      <View
        style={styles.detailIcon}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color="#7040D5"
        />
      </View>

      <View
        style={{
          flex: 1,
        }}
      >
        <Text
          style={
            styles.detailLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.detailValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  icon,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (
    value: string
  ) => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View
      style={styles.inputContainer}
    >
      <Text
        style={styles.inputLabel}
      >
        {label}
      </Text>

      <View
        style={styles.inputWrapper}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color="#8A93A4"
        />

        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          keyboardType={
            keyboardType ||
            'default'
          }
          style={
            styles.input
          }
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#A2AABB"
        />
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  color,
  text,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor:
              `${color}18`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text
        style={styles.actionText}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    minHeight: 64,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 17,
  },

  addButton: {
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  addButtonText: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  managementTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#172033',
  },

  managementSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#7B8496',
    marginBottom: 16,
  },

  /* SUMMARY */

  summaryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  summaryCard: {
    height: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 11,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryTitle: {
    fontFamily: 'PoppinsMedium',
    color: '#7B8496',
    fontSize: 8.8,
    lineHeight: 12,
    marginTop: 3,
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 13.5,
  },

  /* SEARCH */

  searchBox: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E9ECF2',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#172033',
    marginLeft: 8,
  },

  /* FILTERS */

  filterContainer: {
    gap: 8,
    paddingBottom: 15,
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#687386',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* LIST */

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  listTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  recordCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#8A93A4',
  },

  /* USER CARD */

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 12,
  },

  userName: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 13,
  },

  employeeId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9.5,
    marginTop: 1,
  },

  moreButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  roleBadge: {
    maxWidth: '65%',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  roleText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
  },

  userDetails: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    gap: 7,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  infoText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#687386',
  },

  /* EMPTY */

  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#59657A',
    fontSize: 13,
    marginTop: 10,
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    color: '#9AA2B1',
    fontSize: 10,
    marginTop: 3,
  },

  /* MODALS */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(20, 24, 35, 0.48)',
    justifyContent: 'flex-end',
  },

  actionModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 28,
  },

  largeModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '92%',
    padding: 18,
    paddingBottom: 28,
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
    fontSize: 10,
    color: '#8A93A4',
    marginTop: 2,
  },

  actionItem: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    gap: 11,
  },

  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#313B4E',
  },

  /* VIEW PROFILE */

  detailProfile: {
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    alignItems: 'center',
    padding: 17,
  },

  largeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  largeAvatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
  },

  detailName: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 16,
    marginTop: 8,
  },

  detailId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9.5,
    marginTop: 1,
  },

  detailBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 9,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 13,
    marginTop: 17,
    marginBottom: 9,
  },

  detailRow: {
    minHeight: 57,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    gap: 10,
    marginBottom: 7,
  },

  detailIcon: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
  },

  detailValue: {
    fontFamily: 'PoppinsMedium',
    color: '#313B4E',
    fontSize: 10.5,
    marginTop: 2,
  },

  permissionsBox: {
    backgroundColor: '#F8F9FC',
    borderRadius: 11,
    padding: 11,
  },

  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },

  permissionText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    color: '#59657A',
    fontSize: 9.5,
  },

  primaryButton: {
    minHeight: 45,
    backgroundColor: '#7040D5',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 15,
    marginBottom: 5,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
  },

  /* EDIT */

  inputContainer: {
    marginBottom: 10,
  },

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 9.5,
    marginBottom: 5,
  },

  inputWrapper: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  input: {
    flex: 1,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
  },

  readOnlyBox: {
    backgroundColor: '#F1EAFF',
    borderRadius: 10,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },

  readOnlyLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
  },

  readOnlyValue: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
    fontSize: 10.5,
    marginTop: 1,
  },

  /* ROLE */

  roleSelectTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 11,
    marginBottom: 9,
  },

  roleOption: {
    minHeight: 62,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECF2',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 8,
  },

  roleOptionActive: {
    borderColor: '#7040D5',
    backgroundColor: '#FAF8FF',
  },

  roleOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleOptionTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 10.5,
  },

  roleOptionSubtitle: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
    marginTop: 1,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C9CED8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioActive: {
    borderColor: '#7040D5',
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7040D5',
  },

  rolePermissionPreview: {
    backgroundColor: '#F8F9FC',
    borderRadius: 11,
    padding: 11,
    marginTop: 4,
  },

  permissionPreviewTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 10,
    marginBottom: 9,
  },
});