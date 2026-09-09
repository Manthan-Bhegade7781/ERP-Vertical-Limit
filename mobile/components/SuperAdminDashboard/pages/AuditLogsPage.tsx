import React, { useMemo, useState } from 'react';
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
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AuditAction =
  | 'Login'
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'View'
  | 'Export';

type AuditStatus =
  | 'Success'
  | 'Failed';

type AuditLog = {
  id: number;
  logId: string;
  user: string;
  role: string;
  action: AuditAction;
  module: string;
  description: string;
  date: string;
  time: string;
  ipAddress: string;
  status: AuditStatus;
};

const initialLogs: AuditLog[] = [
  {
    id: 1,
    logId: 'VLCC-LOG-001',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Login',
    module: 'Authentication',
    description:
      'Super Admin successfully logged into the VLCC ERP Portal.',
    date: '05 Sep 2026',
    time: '09:05 AM',
    ipAddress: '192.168.1.101',
    status: 'Success',
  },
  {
    id: 2,
    logId: 'VLCC-LOG-002',
    user: 'Amit Kulkarni',
    role: 'Branch Manager',
    action: 'Create',
    module: 'Students',
    description:
      'Created a new student record for Pune Branch.',
    date: '05 Sep 2026',
    time: '09:18 AM',
    ipAddress: '192.168.1.112',
    status: 'Success',
  },
  {
    id: 3,
    logId: 'VLCC-LOG-003',
    user: 'Priya Mehta',
    role: 'Branch Manager',
    action: 'Update',
    module: 'Teachers',
    description:
      'Updated teacher personal information and branch assignment.',
    date: '05 Sep 2026',
    time: '09:32 AM',
    ipAddress: '192.168.1.115',
    status: 'Success',
  },
  {
    id: 4,
    logId: 'VLCC-LOG-004',
    user: 'Karan Malhotra',
    role: 'Accountant',
    action: 'Create',
    module: 'Fees Management',
    description:
      'Recorded a student fee installment payment.',
    date: '05 Sep 2026',
    time: '10:04 AM',
    ipAddress: '192.168.1.118',
    status: 'Success',
  },
  {
    id: 5,
    logId: 'VLCC-LOG-005',
    user: 'Rahul Patil',
    role: 'Administrator',
    action: 'Update',
    module: 'Examinations',
    description:
      'Updated the September examination schedule.',
    date: '05 Sep 2026',
    time: '10:27 AM',
    ipAddress: '192.168.1.120',
    status: 'Success',
  },
  {
    id: 6,
    logId: 'VLCC-LOG-006',
    user: 'Sneha Joshi',
    role: 'Administrator',
    action: 'Create',
    module: 'Announcements',
    description:
      'Created a new student event announcement.',
    date: '05 Sep 2026',
    time: '11:12 AM',
    ipAddress: '192.168.1.123',
    status: 'Success',
  },
  {
    id: 7,
    logId: 'VLCC-LOG-007',
    user: 'Rohit Desai',
    role: 'Teacher',
    action: 'View',
    module: 'Performance',
    description:
      'Viewed student performance details.',
    date: '05 Sep 2026',
    time: '11:45 AM',
    ipAddress: '192.168.1.126',
    status: 'Success',
  },
  {
    id: 8,
    logId: 'VLCC-LOG-008',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Export',
    module: 'Reports',
    description:
      'Exported the monthly student report.',
    date: '05 Sep 2026',
    time: '12:15 PM',
    ipAddress: '192.168.1.101',
    status: 'Success',
  },
  {
    id: 9,
    logId: 'VLCC-LOG-009',
    user: 'Pooja Verma',
    role: 'Staff',
    action: 'Delete',
    module: 'Assignments',
    description:
      'Deleted an outdated assignment record.',
    date: '04 Sep 2026',
    time: '03:20 PM',
    ipAddress: '192.168.1.130',
    status: 'Success',
  },
  {
    id: 10,
    logId: 'VLCC-LOG-010',
    user: 'Rahul Patil',
    role: 'Administrator',
    action: 'Login',
    module: 'Authentication',
    description:
      'Login attempt failed because of invalid credentials.',
    date: '04 Sep 2026',
    time: '05:42 PM',
    ipAddress: '192.168.1.120',
    status: 'Failed',
  },
  {
    id: 11,
    logId: 'VLCC-LOG-011',
    user: 'Amit Kulkarni',
    role: 'Branch Manager',
    action: 'View',
    module: 'Attendance',
    description:
      'Viewed attendance records for Pune Branch.',
    date: '04 Sep 2026',
    time: '06:05 PM',
    ipAddress: '192.168.1.112',
    status: 'Success',
  },
  {
    id: 12,
    logId: 'VLCC-LOG-012',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Update',
    module: 'Settings',
    description:
      'Updated notification and system preferences.',
    date: '03 Sep 2026',
    time: '04:25 PM',
    ipAddress: '192.168.1.101',
    status: 'Success',
  },
];

export default function AuditLogsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const contentWidth = width - 32;
  const statGap = 10;

  const statCardWidth =
    (contentWidth - statGap * 2) / 3;

  const [logs, setLogs] =
    useState<AuditLog[]>(initialLogs);

  const [search, setSearch] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<'All' | AuditAction>('All');

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const [actionVisible, setActionVisible] =
    useState(false);

  const [detailVisible, setDetailVisible] =
    useState(false);

  const [dateFrom, setDateFrom] =
    useState('01 Sep 2026');

  const [dateTo, setDateTo] =
    useState('05 Sep 2026');

  const [dateFilterVisible, setDateFilterVisible] =
    useState(false);

  const totalActivities = logs.length;

  const todayActivities = logs.filter(
    (log) =>
      log.date === '05 Sep 2026'
  ).length;

  const loginActivities = logs.filter(
    (log) =>
      log.action === 'Login'
  ).length;

  const createActivities = logs.filter(
    (log) =>
      log.action === 'Create'
  ).length;

  const updateActivities = logs.filter(
    (log) =>
      log.action === 'Update'
  ).length;

  const deleteActivities = logs.filter(
    (log) =>
      log.action === 'Delete'
  ).length;

  const filteredLogs = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        log.logId
          .toLowerCase()
          .includes(query) ||
        log.user
          .toLowerCase()
          .includes(query) ||
        log.role
          .toLowerCase()
          .includes(query) ||
        log.action
          .toLowerCase()
          .includes(query) ||
        log.module
          .toLowerCase()
          .includes(query) ||
        log.description
          .toLowerCase()
          .includes(query) ||
        log.ipAddress
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === 'All' ||
        log.action === activeFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    logs,
    search,
    activeFilter,
  ]);

  const openActions = (
    log: AuditLog
  ) => {
    setSelectedLog(log);
    setActionVisible(true);
  };

  const viewDetails = (
    log: AuditLog
  ) => {
    setSelectedLog(log);
    setActionVisible(false);
    setDetailVisible(true);
  };

  const deleteLog = (
    log: AuditLog
  ) => {
    setActionVisible(false);

    Alert.alert(
      'Delete Audit Log',
      `Are you sure you want to delete ${log.logId}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLogs((current) =>
              current.filter(
                (item) =>
                  item.id !== log.id
              )
            );

            Alert.alert(
              'Deleted',
              'Audit log has been deleted successfully.'
            );
          },
        },
      ]
    );
  };

  const clearLogs = () => {
    Alert.alert(
      'Clear Audit Logs',
      'This will remove the displayed audit logs. Are you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Logs',
          style: 'destructive',
          onPress: () => {
            setLogs([]);
            Alert.alert(
              'Logs Cleared',
              'Audit logs have been cleared.'
            );
          },
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
            width:
              statCardWidth,
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

        <Text style={styles.summaryValue}>
          {value}
        </Text>
      </View>
    );
  };

  const renderLogCard = (
    log: AuditLog
  ) => {
    const actionColor =
      getActionColor(log.action);

    return (
      <TouchableOpacity
        key={log.id}
        style={styles.logCard}
        activeOpacity={0.9}
        onPress={() =>
          viewDetails(log)
        }
      >
        <View
          style={styles.logTopRow}
        >
          <View
            style={[
              styles.actionIcon,
              {
                backgroundColor:
                  `${actionColor}18`,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={getActionIcon(
                log.action
              )}
              size={21}
              color={actionColor}
            />
          </View>

          <View
            style={styles.logMain}
          >
            <View
              style={
                styles.logTitleRow
              }
            >
              <Text
                style={
                  styles.logUser
                }
                numberOfLines={1}
              >
                {log.user}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      log.status ===
                      'Success'
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
                        log.status ===
                        'Success'
                          ? '#22945F'
                          : '#D84B63',
                    },
                  ]}
                >
                  {log.status}
                </Text>
              </View>
            </View>

            <Text
              style={styles.logRole}
            >
              {log.role}
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.moreButton
            }
            onPress={(event) => {
              event.stopPropagation();
              openActions(log);
            }}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color="#59657A"
            />
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.actionRow
          }
        >
          <View
            style={[
              styles.actionBadge,
              {
                backgroundColor:
                  `${actionColor}15`,
              },
            ]}
          >
            <Text
              style={[
                styles.actionBadgeText,
                {
                  color:
                    actionColor,
                },
              ]}
            >
              {log.action}
            </Text>
          </View>

          <View
            style={
              styles.moduleBadge
            }
          >
            <Text
              style={
                styles.moduleBadgeText
              }
            >
              {log.module}
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.logDescription
          }
          numberOfLines={2}
        >
          {log.description}
        </Text>

        <View
          style={
            styles.logFooter
          }
        >
          <View
            style={
              styles.logMeta
            }
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color="#8A93A4"
            />

            <Text
              style={
                styles.logMetaText
              }
            >
              {log.date} • {log.time}
            </Text>
          </View>

          <View
            style={
              styles.logMeta
            }
          >
            <MaterialCommunityIcons
              name="ip-outline"
              size={14}
              color="#8A93A4"
            />

            <Text
              style={
                styles.logMetaText
              }
            >
              {log.ipAddress}
            </Text>
          </View>
        </View>

        <Text
          style={styles.logId}
        >
          {log.logId}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
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
          style={
            styles.backButton
          }
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
          style={
            styles.headerTitle
          }
        >
          Audit Logs
        </Text>

        <TouchableOpacity
          style={
            styles.clearButton
          }
          onPress={
            clearLogs
          }
        >
          <MaterialCommunityIcons
            name="delete-sweep-outline"
            size={15}
            color="#7040D5"
          />

          <Text
            style={
              styles.clearButtonText
            }
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom +
              30,
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
          Audit Log Management
        </Text>

        <Text
          style={
            styles.managementSubtitle
          }
        >
          Track user activities and system changes
        </Text>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryGrid
          }
        >
          {renderSummaryCard(
            'Total Activities',
            String(totalActivities),
            'history',
            'purple'
          )}

          {renderSummaryCard(
            'Today',
            String(todayActivities),
            'calendar-today',
            'blue'
          )}

          {renderSummaryCard(
            'Logins',
            String(loginActivities),
            'login',
            'green'
          )}

          {renderSummaryCard(
            'Create Actions',
            String(createActivities),
            'plus-circle-outline',
            'green'
          )}

          {renderSummaryCard(
            'Update Actions',
            String(updateActivities),
            'pencil-circle-outline',
            'orange'
          )}

          {renderSummaryCard(
            'Delete Actions',
            String(deleteActivities),
            'delete-circle-outline',
            'pink'
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
            onChangeText={
              setSearch
            }
            placeholder="Search user, action, module or log ID..."
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

        {/* DATE FILTER */}

        <TouchableOpacity
          style={
            styles.dateFilterButton
          }
          onPress={() =>
            setDateFilterVisible(
              true
            )
          }
        >
          <View
            style={
              styles.dateFilterIcon
            }
          >
            <MaterialCommunityIcons
              name="calendar-range-outline"
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
                styles.dateFilterLabel
              }
            >
              Date Range
            </Text>

            <Text
              style={
                styles.dateFilterValue
              }
            >
              {dateFrom} - {dateTo}
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#8A93A4"
          />
        </TouchableOpacity>

        {/* FILTER */}

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
            'Login',
            'Create',
            'Update',
            'Delete',
            'View',
            'Export',
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter ===
                  filter &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setActiveFilter(
                  filter as
                    | 'All'
                    | AuditAction
                )
              }
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
          style={
            styles.listHeader
          }
        >
          <Text
            style={
              styles.listTitle
            }
          >
            Activity Logs
          </Text>

          <Text
            style={
              styles.recordCount
            }
          >
            {filteredLogs.length}{' '}
            Records
          </Text>
        </View>

        {/* LOG LIST */}

        {filteredLogs.length ===
        0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <MaterialCommunityIcons
              name="history"
              size={45}
              color="#A7AFBD"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No audit logs found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try another search or activity filter.
            </Text>
          </View>
        ) : (
          filteredLogs.map(
            renderLogCard
          )
        )}
      </ScrollView>

      {/* =========================
          ACTION MODAL
      ========================== */}

      <Modal
        visible={actionVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setActionVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setActionVisible(
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
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Audit Log Actions
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedLog?.logId
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setActionVisible(
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
              text="View Details"
              onPress={() => {
                if (
                  selectedLog
                ) {
                  viewDetails(
                    selectedLog
                  );
                }
              }}
            />

            <ActionButton
              icon="account-outline"
              color="#2675E8"
              text="View User"
              onPress={() => {
                setActionVisible(
                  false
                );

                Alert.alert(
                  'User',
                  `${selectedLog?.user}\n${selectedLog?.role}`
                );
              }}
            />

            <ActionButton
              icon="view-dashboard-outline"
              color="#35B878"
              text="View Module"
              onPress={() => {
                setActionVisible(
                  false
                );

                Alert.alert(
                  'Module',
                  selectedLog?.module ||
                    'Unknown module'
                );
              }}
            />

            <ActionButton
              icon="delete-outline"
              color="#D84B63"
              text="Delete Log"
              onPress={() => {
                if (
                  selectedLog
                ) {
                  deleteLog(
                    selectedLog
                  );
                }
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          DETAIL MODAL
      ========================== */}

      <Modal
        visible={detailVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setDetailVisible(
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
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Audit Log Details
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedLog?.logId
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setDetailVisible(
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

            {selectedLog && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.detailHero
                  }
                >
                  <View
                    style={[
                      styles.detailActionIcon,
                      {
                        backgroundColor:
                          `${getActionColor(
                            selectedLog.action
                          )}18`,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={getActionIcon(
                        selectedLog.action
                      )}
                      size={29}
                      color={getActionColor(
                        selectedLog.action
                      )}
                    />
                  </View>

                  <Text
                    style={
                      styles.detailActionTitle
                    }
                  >
                    {selectedLog.action}
                  </Text>

                  <Text
                    style={
                      styles.detailActionSubtitle
                    }
                  >
                    {selectedLog.module}
                  </Text>

                  <View
                    style={[
                      styles.detailStatus,
                      {
                        backgroundColor:
                          selectedLog.status ===
                          'Success'
                            ? '#E7F8EF'
                            : '#FFE9F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.detailStatusText,
                        {
                          color:
                            selectedLog.status ===
                            'Success'
                              ? '#22945F'
                              : '#D84B63',
                        },
                      ]}
                    >
                      {selectedLog.status}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.detailGrid
                  }
                >
                  <DetailBox
                    label="Log ID"
                    value={
                      selectedLog.logId
                    }
                  />

                  <DetailBox
                    label="User"
                    value={
                      selectedLog.user
                    }
                  />

                  <DetailBox
                    label="Role"
                    value={
                      selectedLog.role
                    }
                  />

                  <DetailBox
                    label="Module"
                    value={
                      selectedLog.module
                    }
                  />

                  <DetailBox
                    label="Date"
                    value={
                      selectedLog.date
                    }
                  />

                  <DetailBox
                    label="Time"
                    value={
                      selectedLog.time
                    }
                  />

                  <DetailBox
                    label="IP Address"
                    value={
                      selectedLog.ipAddress
                    }
                  />

                  <DetailBox
                    label="Status"
                    value={
                      selectedLog.status
                    }
                  />
                </View>

                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  Activity Description
                </Text>

                <View
                  style={
                    styles.descriptionBox
                  }
                >
                  <Text
                    style={
                      styles.descriptionText
                    }
                  >
                    {
                      selectedLog.description
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  Activity Timestamp
                </Text>

                <View
                  style={
                    styles.timestampBox
                  }
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={19}
                    color="#7040D5"
                  />

                  <Text
                    style={
                      styles.timestampText
                    }
                  >
                    {selectedLog.date}{' '}
                    at{' '}
                    {
                      selectedLog.time
                    }
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================
          DATE RANGE MODAL
      ========================== */}

      <Modal
        visible={
          dateFilterVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setDateFilterVisible(
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
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Date Range
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select audit log period
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setDateFilterVisible(
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
                styles.inputLabel
              }
            >
              Date From
            </Text>

            <View
              style={
                styles.dateInput
              }
            >
              <MaterialCommunityIcons
                name="calendar-outline"
                size={18}
                color="#7040D5"
              />

              <TextInput
                value={dateFrom}
                onChangeText={
                  setDateFrom
                }
                style={
                  styles.dateTextInput
                }
                placeholder="DD MMM YYYY"
                placeholderTextColor="#A2AABB"
              />
            </View>

            <Text
              style={
                styles.inputLabel
              }
            >
              Date To
            </Text>

            <View
              style={
                styles.dateInput
              }
            >
              <MaterialCommunityIcons
                name="calendar-outline"
                size={18}
                color="#7040D5"
              />

              <TextInput
                value={dateTo}
                onChangeText={
                  setDateTo
                }
                style={
                  styles.dateTextInput
                }
                placeholder="DD MMM YYYY"
                placeholderTextColor="#A2AABB"
              />
            </View>

            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={() =>
                setDateFilterVisible(
                  false
                )
              }
            >
              <MaterialCommunityIcons
                name="check"
                size={18}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Apply Date Range
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================
   COMPONENTS
========================= */

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
          styles.actionIconBox,
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
        style={
          styles.actionText
        }
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.detailBox
      }
    >
      <Text
        style={
          styles.detailBoxLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.detailBoxValue
        }
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

/* =========================
   HELPERS
========================= */

function getActionIcon(
  action: AuditAction
): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (action) {
    case 'Login':
      return 'login';

    case 'Create':
      return 'plus-circle-outline';

    case 'Update':
      return 'pencil-circle-outline';

    case 'Delete':
      return 'delete-circle-outline';

    case 'View':
      return 'eye-outline';

    case 'Export':
      return 'file-export-outline';
  }
}

function getActionColor(
  action: AuditAction
) {
  switch (action) {
    case 'Login':
      return '#2675E8';

    case 'Create':
      return '#35B878';

    case 'Update':
      return '#F7941D';

    case 'Delete':
      return '#E95386';

    case 'View':
      return '#7040D5';

    case 'Export':
      return '#2675E8';
  }
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

  clearButton: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  clearButtonText: {
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
    marginBottom: 11,
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#172033',
    marginLeft: 8,
  },

  /* DATE FILTER */

  dateFilterButton: {
    minHeight: 57,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E9ECF2',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 11,
  },

  dateFilterIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateFilterLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 7.5,
  },

  dateFilterValue: {
    fontFamily: 'PoppinsMedium',
    color: '#313B4E',
    fontSize: 9.5,
    marginTop: 1,
  },

  /* FILTER */

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

  /* LOG CARD */

  logCard: {
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

  logTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logMain: {
    flex: 1,
    marginLeft: 10,
  },

  logTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  logUser: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 12,
  },

  logRole: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
    marginTop: 1,
  },

  moreButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },

  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  actionBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
  },

  moduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#F3F4F7',
  },

  moduleBadgeText: {
    fontFamily: 'PoppinsMedium',
    color: '#687386',
    fontSize: 7.5,
  },

  logDescription: {
    fontFamily: 'PoppinsRegular',
    color: '#7B8496',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 9,
  },

  logFooter: {
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  logMetaText: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 7.5,
  },

  logId: {
    fontFamily: 'PoppinsRegular',
    color: '#A1A9B8',
    fontSize: 7,
    marginTop: 7,
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
    fontSize: 9.5,
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

  actionIconBox: {
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

  /* DETAILS */

  detailHero: {
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },

  detailActionIcon: {
    width: 61,
    height: 61,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailActionTitle: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 17,
    marginTop: 10,
  },

  detailActionSubtitle: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9,
    marginTop: 1,
  },

  detailStatus: {
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  detailStatusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
  },

  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
  },

  detailBox: {
    width: '48%',
    minHeight: 66,
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    padding: 10,
  },

  detailBoxLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8,
  },

  detailBoxValue: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 9.5,
    marginTop: 4,
  },

  sectionLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 11,
    marginTop: 15,
    marginBottom: 6,
  },

  descriptionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 10,
    padding: 12,
  },

  descriptionText: {
    fontFamily: 'PoppinsRegular',
    color: '#687386',
    fontSize: 9.5,
    lineHeight: 16,
  },

  timestampBox: {
    backgroundColor: '#F1EAFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  timestampText: {
    fontFamily: 'PoppinsMedium',
    color: '#7040D5',
    fontSize: 9,
  },

  /* DATE */

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 9.5,
    marginBottom: 5,
    marginTop: 10,
  },

  dateInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateTextInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#172033',
  },

  primaryButton: {
    minHeight: 45,
    backgroundColor: '#7040D5',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 17,
    marginBottom: 5,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
  },
});