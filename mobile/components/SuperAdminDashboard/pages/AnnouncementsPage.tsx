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

type AnnouncementStatus =
  | 'Published'
  | 'Draft'
  | 'Scheduled'
  | 'Expired';

type AnnouncementPriority =
  | 'High'
  | 'Medium'
  | 'Low';

type AnnouncementRecord = {
  id: number;
  announcementId: string;
  title: string;
  description: string;
  category: string;
  priority: AnnouncementPriority;
  audience: string;
  branch: string;
  status: AnnouncementStatus;
  createdBy: string;
  publishedDate: string;
  scheduledDate: string;
  expiryDate: string;
};

const initialAnnouncements: AnnouncementRecord[] = [
  {
    id: 1,
    announcementId: 'VLCC-ANN-001',
    title: 'Annual Beauty Workshop 2026',
    description:
      'All students are informed that the annual beauty workshop will be conducted at the Main Branch. Students are requested to register before the deadline.',
    category: 'Events',
    priority: 'High',
    audience: 'All Students',
    branch: 'All Branches',
    status: 'Published',
    createdBy: 'Vikram Shah',
    publishedDate: '02 Sep 2026',
    scheduledDate: '',
    expiryDate: '15 Sep 2026',
  },
  {
    id: 2,
    announcementId: 'VLCC-ANN-002',
    title: 'September Examination Schedule',
    description:
      'The examination schedule for September 2026 has been published. Students should check their batch timetable and examination details.',
    category: 'Examination',
    priority: 'High',
    audience: 'Students & Teachers',
    branch: 'All Branches',
    status: 'Published',
    createdBy: 'Rahul Patil',
    publishedDate: '01 Sep 2026',
    scheduledDate: '',
    expiryDate: '30 Sep 2026',
  },
  {
    id: 3,
    announcementId: 'VLCC-ANN-003',
    title: 'Fee Payment Reminder',
    description:
      'Students with pending fees are requested to complete their payment before the due date to avoid late payment charges.',
    category: 'Fees',
    priority: 'Medium',
    audience: 'Students',
    branch: 'All Branches',
    status: 'Published',
    createdBy: 'Karan Malhotra',
    publishedDate: '04 Sep 2026',
    scheduledDate: '',
    expiryDate: '12 Sep 2026',
  },
  {
    id: 4,
    announcementId: 'VLCC-ANN-004',
    title: 'Teacher Training Session',
    description:
      'A staff development and teacher training session will be conducted next week. All teaching staff are requested to attend.',
    category: 'Training',
    priority: 'Medium',
    audience: 'Teachers',
    branch: 'Pune Branch',
    status: 'Scheduled',
    createdBy: 'Amit Kulkarni',
    publishedDate: '',
    scheduledDate: '08 Sep 2026, 10:00 AM',
    expiryDate: '10 Sep 2026',
  },
  {
    id: 5,
    announcementId: 'VLCC-ANN-005',
    title: 'Updated Attendance Policy',
    description:
      'The attendance policy has been updated. Students are requested to maintain the required attendance percentage for examination eligibility.',
    category: 'Academic',
    priority: 'High',
    audience: 'All Students',
    branch: 'All Branches',
    status: 'Published',
    createdBy: 'Priya Mehta',
    publishedDate: '28 Aug 2026',
    scheduledDate: '',
    expiryDate: '30 Sep 2026',
  },
  {
    id: 6,
    announcementId: 'VLCC-ANN-006',
    title: 'Nail Art Competition',
    description:
      'Students interested in participating in the upcoming nail art competition can register with their respective branch coordinators.',
    category: 'Events',
    priority: 'Low',
    audience: 'Students',
    branch: 'Nagpur Branch',
    status: 'Draft',
    createdBy: 'Sneha Joshi',
    publishedDate: '',
    scheduledDate: '',
    expiryDate: '20 Sep 2026',
  },
  {
    id: 7,
    announcementId: 'VLCC-ANN-007',
    title: 'Branch Maintenance Notice',
    description:
      'The branch premises will undergo scheduled maintenance. Certain facilities may remain unavailable during the maintenance period.',
    category: 'Notice',
    priority: 'Medium',
    audience: 'Students & Staff',
    branch: 'Mumbai Branch',
    status: 'Scheduled',
    createdBy: 'Priya Mehta',
    publishedDate: '',
    scheduledDate: '09 Sep 2026, 08:00 AM',
    expiryDate: '11 Sep 2026',
  },
  {
    id: 8,
    announcementId: 'VLCC-ANN-008',
    title: 'Independence Day Holiday',
    description:
      'The institute will remain closed on the announced holiday. Regular classes will resume on the next working day.',
    category: 'Holiday',
    priority: 'Low',
    audience: 'All Users',
    branch: 'All Branches',
    status: 'Expired',
    createdBy: 'Vikram Shah',
    publishedDate: '10 Aug 2026',
    scheduledDate: '',
    expiryDate: '16 Aug 2026',
  },
];

const priorityColors: Record<
  AnnouncementPriority,
  {
    bg: string;
    text: string;
  }
> = {
  High: {
    bg: '#FFE9F0',
    text: '#E95386',
  },
  Medium: {
    bg: '#FFF1E2',
    text: '#E88713',
  },
  Low: {
    bg: '#EAF2FF',
    text: '#2675E8',
  },
};

const statusColors: Record<
  AnnouncementStatus,
  {
    bg: string;
    text: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  Published: {
    bg: '#E7F8EF',
    text: '#22945F',
    icon: 'check-circle-outline',
  },
  Draft: {
    bg: '#F0F1F5',
    text: '#687386',
    icon: 'file-document-outline',
  },
  Scheduled: {
    bg: '#EAF2FF',
    text: '#2675E8',
    icon: 'clock-outline',
  },
  Expired: {
    bg: '#FFE9F0',
    text: '#E95386',
    icon: 'calendar-remove-outline',
  },
};

const categories = [
  'Academic',
  'Examination',
  'Fees',
  'Events',
  'Training',
  'Notice',
  'Holiday',
  'General',
];

const audiences = [
  'All Users',
  'All Students',
  'Students',
  'Teachers',
  'Students & Teachers',
  'Students & Staff',
  'Staff',
];

const branches = [
  'All Branches',
  'Pune Branch',
  'Mumbai Branch',
  'Nashik Branch',
  'Nagpur Branch',
  'Main Branch',
];

export default function AnnouncementsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const contentWidth = width - 32;
  const statGap = 10;

  const statCardWidth =
    (contentWidth - statGap * 2) / 3;

  const [announcements, setAnnouncements] =
    useState<AnnouncementRecord[]>(
      initialAnnouncements
    );

  const [search, setSearch] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<
      'All' | AnnouncementStatus | 'High Priority'
    >('All');

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementRecord | null>(
      null
    );

  const [actionModalVisible, setActionModalVisible] =
    useState(false);

  const [viewModalVisible, setViewModalVisible] =
    useState(false);

  const [editModalVisible, setEditModalVisible] =
    useState(false);

  const [formTitle, setFormTitle] =
    useState('');

  const [formDescription, setFormDescription] =
    useState('');

  const [formCategory, setFormCategory] =
    useState('General');

  const [formPriority, setFormPriority] =
    useState<AnnouncementPriority>('Medium');

  const [formAudience, setFormAudience] =
    useState('All Users');

  const [formBranch, setFormBranch] =
    useState('All Branches');

  const [formStatus, setFormStatus] =
    useState<AnnouncementStatus>('Draft');

  const [formExpiryDate, setFormExpiryDate] =
    useState('');

  const totalAnnouncements =
    announcements.length;

  const published =
    announcements.filter(
      (item) =>
        item.status === 'Published'
    ).length;

  const drafts =
    announcements.filter(
      (item) =>
        item.status === 'Draft'
    ).length;

  const scheduled =
    announcements.filter(
      (item) =>
        item.status === 'Scheduled'
    ).length;

  const highPriority =
    announcements.filter(
      (item) =>
        item.priority === 'High'
    ).length;

  const expired =
    announcements.filter(
      (item) =>
        item.status === 'Expired'
    ).length;

  const filteredAnnouncements =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return announcements.filter(
        (announcement) => {
          const matchesSearch =
            !query ||
            announcement.title
              .toLowerCase()
              .includes(query) ||
            announcement.announcementId
              .toLowerCase()
              .includes(query) ||
            announcement.category
              .toLowerCase()
              .includes(query) ||
            announcement.audience
              .toLowerCase()
              .includes(query) ||
            announcement.branch
              .toLowerCase()
              .includes(query) ||
            announcement.createdBy
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            activeFilter === 'All' ||
            announcement.status ===
              activeFilter ||
            (activeFilter ===
              'High Priority' &&
              announcement.priority ===
                'High');

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      announcements,
      search,
      activeFilter,
    ]);

  const openActions = (
    announcement: AnnouncementRecord
  ) => {
    setSelectedAnnouncement(
      announcement
    );
    setActionModalVisible(true);
  };

  const openEdit = (
    announcement: AnnouncementRecord
  ) => {
    setSelectedAnnouncement(
      announcement
    );

    setFormTitle(
      announcement.title
    );

    setFormDescription(
      announcement.description
    );

    setFormCategory(
      announcement.category
    );

    setFormPriority(
      announcement.priority
    );

    setFormAudience(
      announcement.audience
    );

    setFormBranch(
      announcement.branch
    );

    setFormStatus(
      announcement.status
    );

    setFormExpiryDate(
      announcement.expiryDate
    );

    setActionModalVisible(false);
    setEditModalVisible(true);
  };

  const openCreate = () => {
    setSelectedAnnouncement(null);

    setFormTitle('');
    setFormDescription('');
    setFormCategory('General');
    setFormPriority('Medium');
    setFormAudience('All Users');
    setFormBranch('All Branches');
    setFormStatus('Draft');
    setFormExpiryDate('');

    setEditModalVisible(true);
  };

  const saveAnnouncement = () => {
    if (
      !formTitle.trim() ||
      !formDescription.trim() ||
      !formExpiryDate.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please enter the title, description and expiry date.'
      );
      return;
    }

    if (selectedAnnouncement) {
      setAnnouncements((current) =>
        current.map((item) =>
          item.id ===
          selectedAnnouncement.id
            ? {
                ...item,
                title:
                  formTitle.trim(),
                description:
                  formDescription.trim(),
                category:
                  formCategory,
                priority:
                  formPriority,
                audience:
                  formAudience,
                branch:
                  formBranch,
                status:
                  formStatus,
                expiryDate:
                  formExpiryDate.trim(),
              }
            : item
        )
      );

      setEditModalVisible(false);

      Alert.alert(
        'Announcement Updated',
        'The announcement has been updated successfully.'
      );

      return;
    }

    const newAnnouncement: AnnouncementRecord =
      {
        id:
          Math.max(
            0,
            ...announcements.map(
              (item) => item.id
            )
          ) + 1,
        announcementId: `VLCC-ANN-${String(
          announcements.length + 1
        ).padStart(3, '0')}`,
        title:
          formTitle.trim(),
        description:
          formDescription.trim(),
        category:
          formCategory,
        priority:
          formPriority,
        audience:
          formAudience,
        branch:
          formBranch,
        status:
          formStatus,
        createdBy:
          'Super Admin',
        publishedDate:
          formStatus ===
          'Published'
            ? '05 Sep 2026'
            : '',
        scheduledDate:
          formStatus ===
          'Scheduled'
            ? '08 Sep 2026, 10:00 AM'
            : '',
        expiryDate:
          formExpiryDate.trim(),
      };

    setAnnouncements(
      (current) => [
        newAnnouncement,
        ...current,
      ]
    );

    setEditModalVisible(false);

    Alert.alert(
      'Announcement Created',
      'The announcement has been created successfully.'
    );
  };

  const publishAnnouncement = (
    announcement: AnnouncementRecord
  ) => {
    setActionModalVisible(false);

    Alert.alert(
      'Publish Announcement',
      `Publish "${announcement.title}" now?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Publish',
          onPress: () => {
            setAnnouncements(
              (current) =>
                current.map(
                  (item) =>
                    item.id ===
                    announcement.id
                      ? {
                          ...item,
                          status:
                            'Published',
                          publishedDate:
                            '05 Sep 2026',
                          scheduledDate:
                            '',
                        }
                      : item
                )
            );

            Alert.alert(
              'Published',
              'Announcement has been published successfully.'
            );
          },
        },
      ]
    );
  };

  const scheduleAnnouncement = (
    announcement: AnnouncementRecord
  ) => {
    setActionModalVisible(false);

    setAnnouncements((current) =>
      current.map((item) =>
        item.id === announcement.id
          ? {
              ...item,
              status: 'Scheduled',
              scheduledDate:
                '08 Sep 2026, 10:00 AM',
            }
          : item
      )
    );

    Alert.alert(
      'Announcement Scheduled',
      'The announcement has been scheduled.'
    );
  };

  const duplicateAnnouncement = (
    announcement: AnnouncementRecord
  ) => {
    setActionModalVisible(false);

    const duplicated: AnnouncementRecord =
      {
        ...announcement,
        id:
          Math.max(
            0,
            ...announcements.map(
              (item) => item.id
            )
          ) + 1,
        announcementId: `VLCC-ANN-${String(
          announcements.length + 1
        ).padStart(3, '0')}`,
        title: `${announcement.title} - Copy`,
        status: 'Draft',
        publishedDate: '',
        scheduledDate: '',
        createdBy: 'Super Admin',
      };

    setAnnouncements(
      (current) => [
        duplicated,
        ...current,
      ]
    );

    Alert.alert(
      'Announcement Duplicated',
      'A new draft has been created from the announcement.'
    );
  };

  const deleteAnnouncement = (
    announcement: AnnouncementRecord
  ) => {
    setActionModalVisible(false);

    Alert.alert(
      'Delete Announcement',
      `Are you sure you want to delete "${announcement.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAnnouncements(
              (current) =>
                current.filter(
                  (item) =>
                    item.id !==
                    announcement.id
                )
            );

            Alert.alert(
              'Deleted',
              'Announcement has been deleted.'
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

  const renderAnnouncementCard = (
    announcement: AnnouncementRecord
  ) => {
    const priority =
      priorityColors[
        announcement.priority
      ];

    const status =
      statusColors[
        announcement.status
      ];

    return (
      <View
        key={announcement.id}
        style={styles.announcementCard}
      >
        <View
          style={styles.cardTopRow}
        >
          <View
            style={styles.titleArea}
          >
            <View
              style={
                styles.announcementIcon
              }
            >
              <MaterialCommunityIcons
                name="bullhorn-outline"
                size={20}
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
                  styles.announcementTitle
                }
                numberOfLines={2}
              >
                {
                  announcement.title
                }
              </Text>

              <Text
                style={
                  styles.announcementId
                }
              >
                {
                  announcement.announcementId
                }
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={
              styles.moreButton
            }
            onPress={() =>
              openActions(
                announcement
              )
            }
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color="#59657A"
            />
          </TouchableOpacity>
        </View>

        <Text
          style={
            styles.description
          }
          numberOfLines={3}
        >
          {
            announcement.description
          }
        </Text>

        <View
          style={
            styles.badgeRow
          }
        >
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor:
                  priority.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                {
                  color:
                    priority.text,
                },
              ]}
            >
              {
                announcement.priority
              }
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  status.bg,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={status.icon}
              size={13}
              color={status.text}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    status.text,
                },
              ]}
            >
              {
                announcement.status
              }
            </Text>
          </View>

          <View
            style={
              styles.categoryBadge
            }
          >
            <Text
              style={
                styles.categoryText
              }
            >
              {
                announcement.category
              }
            </Text>
          </View>
        </View>

        <View
          style={
            styles.detailsBox
          }
        >
          <InfoRow
            icon="account-group-outline"
            text={
              announcement.audience
            }
          />

          <InfoRow
            icon="office-building-outline"
            text={
              announcement.branch
            }
          />

          <InfoRow
            icon="account-outline"
            text={`Created by: ${announcement.createdBy}`}
          />

          <InfoRow
            icon={
              announcement.status ===
              'Scheduled'
                ? 'clock-outline'
                : 'calendar-outline'
            }
            text={
              announcement.status ===
              'Scheduled'
                ? `Scheduled: ${announcement.scheduledDate}`
                : announcement.status ===
                  'Published'
                ? `Published: ${announcement.publishedDate}`
                : `Expiry: ${announcement.expiryDate}`
            }
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
          Announcements
        </Text>

        <TouchableOpacity
          style={
            styles.addButton
          }
          onPress={
            openCreate
          }
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color="#7040D5"
          />

          <Text
            style={
              styles.addButtonText
            }
          >
            Create
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
          Announcement Management
        </Text>

        <Text
          style={
            styles.managementSubtitle
          }
        >
          Create, publish and manage institute announcements
        </Text>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryGrid
          }
        >
          {renderSummaryCard(
            'Total Announcements',
            String(
              totalAnnouncements
            ),
            'bullhorn-outline',
            'purple'
          )}

          {renderSummaryCard(
            'Published',
            String(published),
            'check-circle-outline',
            'green'
          )}

          {renderSummaryCard(
            'Drafts',
            String(drafts),
            'file-document-outline',
            'blue'
          )}

          {renderSummaryCard(
            'Scheduled',
            String(scheduled),
            'clock-outline',
            'orange'
          )}

          {renderSummaryCard(
            'High Priority',
            String(highPriority),
            'alert-circle-outline',
            'pink'
          )}

          {renderSummaryCard(
            'Expired',
            String(expired),
            'calendar-remove-outline',
            'purple'
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
            placeholder="Search title, ID, category, branch..."
            placeholderTextColor="#A2AABB"
            style={
              styles.searchInput
            }
          />

          {search.length >
            0 && (
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
            'Published',
            'Draft',
            'Scheduled',
            'High Priority',
            'Expired',
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() =>
                setActiveFilter(
                  filter as
                    | 'All'
                    | AnnouncementStatus
                    | 'High Priority'
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
          style={
            styles.listHeader
          }
        >
          <Text
            style={
              styles.listTitle
            }
          >
            Announcements
          </Text>

          <Text
            style={
              styles.recordCount
            }
          >
            {
              filteredAnnouncements.length
            }{' '}
            Records
          </Text>
        </View>

        {filteredAnnouncements.length ===
        0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <MaterialCommunityIcons
              name="bullhorn-outline"
              size={44}
              color="#A7AFBD"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No announcements found
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
          filteredAnnouncements.map(
            renderAnnouncementCard
          )
        )}
      </ScrollView>

      {/* =========================
          ACTION MODAL
      ========================== */}

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
                  Announcement Actions
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                  numberOfLines={1}
                >
                  {
                    selectedAnnouncement?.title
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
              text="View Announcement"
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
              text="Edit Announcement"
              onPress={() => {
                if (
                  selectedAnnouncement
                ) {
                  openEdit(
                    selectedAnnouncement
                  );
                }
              }}
            />

            {selectedAnnouncement?.status !==
              'Published' && (
              <ActionButton
                icon="publish"
                color="#35B878"
                text="Publish"
                onPress={() => {
                  if (
                    selectedAnnouncement
                  ) {
                    publishAnnouncement(
                      selectedAnnouncement
                    );
                  }
                }}
              />
            )}

            {selectedAnnouncement?.status !==
              'Scheduled' && (
              <ActionButton
                icon="calendar-clock"
                color="#F7941D"
                text="Schedule"
                onPress={() => {
                  if (
                    selectedAnnouncement
                  ) {
                    scheduleAnnouncement(
                      selectedAnnouncement
                    );
                  }
                }}
              />
            )}

            <ActionButton
              icon="content-copy"
              color="#2675E8"
              text="Duplicate"
              onPress={() => {
                if (
                  selectedAnnouncement
                ) {
                  duplicateAnnouncement(
                    selectedAnnouncement
                  );
                }
              }}
            />

            <ActionButton
              icon="delete-outline"
              color="#D84B63"
              text="Delete Announcement"
              onPress={() => {
                if (
                  selectedAnnouncement
                ) {
                  deleteAnnouncement(
                    selectedAnnouncement
                  );
                }
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          VIEW MODAL
      ========================== */}

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
                  Announcement Details
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedAnnouncement?.announcementId
                  }
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

            {selectedAnnouncement && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.detailAnnouncementHeader
                  }
                >
                  <View
                    style={
                      styles.detailAnnouncementIcon
                    }
                  >
                    <MaterialCommunityIcons
                      name="bullhorn-outline"
                      size={25}
                      color="#7040D5"
                    />
                  </View>

                  <Text
                    style={
                      styles.detailTitle
                    }
                  >
                    {
                      selectedAnnouncement.title
                    }
                  </Text>

                  <View
                    style={
                      styles.badgeRow
                    }
                  >
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            priorityColors[
                              selectedAnnouncement
                                .priority
                            ].bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          {
                            color:
                              priorityColors[
                                selectedAnnouncement
                                  .priority
                              ].text,
                          },
                        ]}
                      >
                        {
                          selectedAnnouncement.priority
                        }{' '}
                        Priority
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusColors[
                              selectedAnnouncement
                                .status
                            ].bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              statusColors[
                                selectedAnnouncement
                                  .status
                              ].text,
                          },
                        ]}
                      >
                        {
                          selectedAnnouncement.status
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
                  Announcement
                </Text>

                <View
                  style={
                    styles.descriptionBox
                  }
                >
                  <Text
                    style={
                      styles.detailDescription
                    }
                  >
                    {
                      selectedAnnouncement.description
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Target Information
                </Text>

                <DetailRow
                  icon="account-group-outline"
                  label="Audience"
                  value={
                    selectedAnnouncement.audience
                  }
                />

                <DetailRow
                  icon="office-building-outline"
                  label="Branch"
                  value={
                    selectedAnnouncement.branch
                  }
                />

                <DetailRow
                  icon="shape-outline"
                  label="Category"
                  value={
                    selectedAnnouncement.category
                  }
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Publishing Information
                </Text>

                <DetailRow
                  icon="account-outline"
                  label="Created By"
                  value={
                    selectedAnnouncement.createdBy
                  }
                />

                {selectedAnnouncement.publishedDate !==
                  '' && (
                  <DetailRow
                    icon="calendar-check-outline"
                    label="Published Date"
                    value={
                      selectedAnnouncement.publishedDate
                    }
                  />
                )}

                {selectedAnnouncement.scheduledDate !==
                  '' && (
                  <DetailRow
                    icon="clock-outline"
                    label="Scheduled Date"
                    value={
                      selectedAnnouncement.scheduledDate
                    }
                  />
                )}

                <DetailRow
                  icon="calendar-remove-outline"
                  label="Expiry Date"
                  value={
                    selectedAnnouncement.expiryDate
                  }
                />

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={() => {
                    setViewModalVisible(
                      false
                    );
                    openEdit(
                      selectedAnnouncement
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
                    Edit Announcement
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================
          CREATE / EDIT MODAL
      ========================== */}

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
                  {selectedAnnouncement
                    ? 'Edit Announcement'
                    : 'Create Announcement'}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Enter announcement information
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
              <Text
                style={
                  styles.inputLabel
                }
              >
                Announcement Title
              </Text>

              <TextInput
                value={formTitle}
                onChangeText={
                  setFormTitle
                }
                placeholder="Enter announcement title"
                placeholderTextColor="#A2AABB"
                style={
                  styles.input
                }
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                Description
              </Text>

              <TextInput
                value={
                  formDescription
                }
                onChangeText={
                  setFormDescription
                }
                placeholder="Enter announcement details"
                placeholderTextColor="#A2AABB"
                multiline
                style={[
                  styles.input,
                  styles.textArea,
                ]}
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                Category
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.optionContainer
                }
              >
                {categories.map(
                  (category) => (
                    <OptionButton
                      key={
                        category
                      }
                      label={
                        category
                      }
                      selected={
                        formCategory ===
                        category
                      }
                      onPress={() =>
                        setFormCategory(
                          category
                        )
                      }
                    />
                  )
                )}
              </ScrollView>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Priority
              </Text>

              <View
                style={
                  styles.inlineOptions
                }
              >
                {(
                  [
                    'High',
                    'Medium',
                    'Low',
                  ] as AnnouncementPriority[]
                ).map(
                  (priority) => (
                    <OptionButton
                      key={
                        priority
                      }
                      label={
                        priority
                      }
                      selected={
                        formPriority ===
                        priority
                      }
                      onPress={() =>
                        setFormPriority(
                          priority
                        )
                      }
                    />
                  )
                )}
              </View>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Target Audience
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.optionContainer
                }
              >
                {audiences.map(
                  (audience) => (
                    <OptionButton
                      key={
                        audience
                      }
                      label={
                        audience
                      }
                      selected={
                        formAudience ===
                        audience
                      }
                      onPress={() =>
                        setFormAudience(
                          audience
                        )
                      }
                    />
                  )
                )}
              </ScrollView>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Branch
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.optionContainer
                }
              >
                {branches.map(
                  (item) => (
                    <OptionButton
                      key={item}
                      label={item}
                      selected={
                        formBranch ===
                        item
                      }
                      onPress={() =>
                        setFormBranch(
                          item
                        )
                      }
                    />
                  )
                )}
              </ScrollView>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Status
              </Text>

              <View
                style={
                  styles.inlineOptions
                }
              >
                {(
                  [
                    'Draft',
                    'Published',
                    'Scheduled',
                  ] as AnnouncementStatus[]
                ).map(
                  (status) => (
                    <OptionButton
                      key={status}
                      label={status}
                      selected={
                        formStatus ===
                        status
                      }
                      onPress={() =>
                        setFormStatus(
                          status
                        )
                      }
                    />
                  )
                )}
              </View>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Expiry Date
              </Text>

              <TextInput
                value={
                  formExpiryDate
                }
                onChangeText={
                  setFormExpiryDate
                }
                placeholder="e.g. 30 Sep 2026"
                placeholderTextColor="#A2AABB"
                style={
                  styles.input
                }
              />

              <View
                style={
                  styles.infoNotice
                }
              >
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color="#7040D5"
                />

                <Text
                  style={
                    styles.infoNoticeText
                  }
                >
                  Scheduled announcements will be published
                  automatically at the configured schedule when
                  connected to the backend.
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={
                  saveAnnouncement
                }
              >
                <MaterialCommunityIcons
                  name={
                    selectedAnnouncement
                      ? 'content-save-outline'
                      : 'plus-circle-outline'
                  }
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  {selectedAnnouncement
                    ? 'Save Changes'
                    : 'Create Announcement'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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

function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected &&
          styles.optionButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected &&
            styles.optionTextActive,
        ]}
      >
        {label}
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

  /* ANNOUNCEMENT CARD */

  announcementCard: {
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

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  announcementIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  announcementTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 12.5,
    lineHeight: 17,
  },

  announcementId: {
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

  description: {
    fontFamily: 'PoppinsRegular',
    color: '#687386',
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 12,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 11,
  },

  priorityBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  priorityText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
  },

  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#F0F1F5',
  },

  categoryText: {
    fontFamily: 'PoppinsMedium',
    color: '#687386',
    fontSize: 8,
  },

  detailsBox: {
    marginTop: 11,
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
    fontSize: 8.8,
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

  /* VIEW */

  detailAnnouncementHeader: {
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    alignItems: 'center',
    padding: 16,
  },

  detailAnnouncementIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailTitle: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 9,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 13,
    marginTop: 17,
    marginBottom: 9,
  },

  descriptionBox: {
    backgroundColor: '#F8F9FC',
    borderRadius: 11,
    padding: 12,
  },

  detailDescription: {
    fontFamily: 'PoppinsRegular',
    color: '#59657A',
    fontSize: 10,
    lineHeight: 16,
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

  /* FORM */

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 9.5,
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    paddingHorizontal: 11,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    backgroundColor: '#FFFFFF',
  },

  textArea: {
    minHeight: 95,
    paddingTop: 10,
    textAlignVertical: 'top',
  },

  optionContainer: {
    gap: 7,
    paddingBottom: 2,
  },

  inlineOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  optionButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionButtonActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  optionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#687386',
  },

  optionTextActive: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
  },

  infoNotice: {
    marginTop: 13,
    backgroundColor: '#F1EAFF',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  infoNoticeText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    color: '#7040D5',
    fontSize: 8.5,
    lineHeight: 14,
  },
});