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

type MessageStatus =
  | 'Unread'
  | 'Read'
  | 'Sent'
  | 'Archived';

type MessagePriority =
  | 'Important'
  | 'Normal';

type MessageRecord = {
  id: number;
  messageId: string;
  sender: string;
  senderRole: string;
  recipient: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  time: string;
  status: MessageStatus;
  priority: MessagePriority;
  category: string;
};

const initialMessages: MessageRecord[] = [
  {
    id: 1,
    messageId: 'VLCC-MSG-001',
    sender: 'Amit Kulkarni',
    senderRole: 'Branch Manager',
    recipient: 'Super Admin',
    subject: 'Pune Branch Monthly Report',
    preview:
      'The monthly student and branch performance report is ready for review.',
    body:
      'Hello,\n\nThe monthly student and branch performance report for Pune Branch is ready for review. The report includes student strength, attendance, fee collection and academic performance details.\n\nPlease review the report and let me know if any additional information is required.\n\nRegards,\nAmit Kulkarni',
    date: '05 Sep 2026',
    time: '09:35 AM',
    status: 'Unread',
    priority: 'Important',
    category: 'Reports',
  },
  {
    id: 2,
    messageId: 'VLCC-MSG-002',
    sender: 'Priya Mehta',
    senderRole: 'Branch Manager',
    recipient: 'Super Admin',
    subject: 'Teacher Training Confirmation',
    preview:
      'The Mumbai Branch teaching staff has confirmed attendance for the training session.',
    body:
      'Hello,\n\nThe Mumbai Branch teaching staff has confirmed their participation in the upcoming teacher training session.\n\nAll assigned teachers will attend the session as scheduled.\n\nRegards,\nPriya Mehta',
    date: '05 Sep 2026',
    time: '09:12 AM',
    status: 'Unread',
    priority: 'Normal',
    category: 'Training',
  },
  {
    id: 3,
    messageId: 'VLCC-MSG-003',
    sender: 'Karan Malhotra',
    senderRole: 'Accountant',
    recipient: 'Super Admin',
    subject: 'Fee Collection Update',
    preview:
      'Fee collection for the current cycle has reached ₹32,50,000.',
    body:
      'Hello,\n\nThis is an update regarding the current fee collection cycle. Total collections have reached ₹32,50,000 and the remaining pending amount is being followed up with the respective branches.\n\nRegards,\nKaran Malhotra',
    date: '04 Sep 2026',
    time: '05:25 PM',
    status: 'Read',
    priority: 'Important',
    category: 'Fees',
  },
  {
    id: 4,
    messageId: 'VLCC-MSG-004',
    sender: 'Rahul Patil',
    senderRole: 'Administrator',
    recipient: 'Super Admin',
    subject: 'Examination Schedule Update',
    preview:
      'The examination schedule has been updated for the September batches.',
    body:
      'Hello,\n\nThe September examination schedule has been updated. Please review the latest examination dates and timings for all batches.\n\nRegards,\nRahul Patil',
    date: '04 Sep 2026',
    time: '03:45 PM',
    status: 'Read',
    priority: 'Normal',
    category: 'Examination',
  },
  {
    id: 5,
    messageId: 'VLCC-MSG-005',
    sender: 'Sneha Joshi',
    senderRole: 'Administrator',
    recipient: 'Super Admin',
    subject: 'Nagpur Branch Student Event',
    preview:
      'A student engagement event has been planned for the Nagpur Branch.',
    body:
      'Hello,\n\nA student engagement event has been planned for Nagpur Branch. The event will include practical activities and a student showcase.\n\nRegards,\nSneha Joshi',
    date: '03 Sep 2026',
    time: '01:20 PM',
    status: 'Read',
    priority: 'Normal',
    category: 'Events',
  },
  {
    id: 6,
    messageId: 'VLCC-MSG-006',
    sender: 'Rohit Desai',
    senderRole: 'Teacher',
    recipient: 'Super Admin',
    subject: 'Assignment Evaluation Completed',
    preview:
      'Evaluation for the Professional Makeup assignment has been completed.',
    body:
      'Hello,\n\nEvaluation for the Professional Makeup assignment has been completed. Student scores have been updated in the performance records.\n\nRegards,\nRohit Desai',
    date: '02 Sep 2026',
    time: '04:40 PM',
    status: 'Sent',
    priority: 'Normal',
    category: 'Assignments',
  },
  {
    id: 7,
    messageId: 'VLCC-MSG-007',
    sender: 'Super Admin',
    senderRole: 'Super Admin',
    recipient: 'All Branch Managers',
    subject: 'Updated Attendance Policy',
    preview:
      'Please ensure that the updated attendance policy is communicated to all students.',
    body:
      'Hello Team,\n\nPlease ensure that the updated attendance policy is communicated to all students and teaching staff.\n\nThe new policy should be followed from the current academic cycle.\n\nRegards,\nSuper Admin',
    date: '01 Sep 2026',
    time: '11:10 AM',
    status: 'Sent',
    priority: 'Important',
    category: 'Academic',
  },
  {
    id: 8,
    messageId: 'VLCC-MSG-008',
    sender: 'Pooja Verma',
    senderRole: 'Staff',
    recipient: 'Super Admin',
    subject: 'Old Event Coordination Message',
    preview:
      'Previous coordination message regarding the August student event.',
    body:
      'Hello,\n\nThis message contains coordination information from the previous student event held in August.\n\nRegards,\nPooja Verma',
    date: '20 Aug 2026',
    time: '02:15 PM',
    status: 'Archived',
    priority: 'Normal',
    category: 'Events',
  },
];

const categories = [
  'General',
  'Academic',
  'Examination',
  'Fees',
  'Reports',
  'Training',
  'Events',
  'Assignments',
];

export default function MessagesPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const contentWidth = width - 32;
  const statGap = 10;

  const statCardWidth =
    (contentWidth - statGap * 2) / 3;

  const [messages, setMessages] =
    useState<MessageRecord[]>(
      initialMessages
    );

  const [search, setSearch] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<
      'All' | MessageStatus | 'Important'
    >('All');

  const [selectedMessage, setSelectedMessage] =
    useState<MessageRecord | null>(
      null
    );

  const [actionModalVisible, setActionModalVisible] =
    useState(false);

  const [viewModalVisible, setViewModalVisible] =
    useState(false);

  const [composeModalVisible, setComposeModalVisible] =
    useState(false);

  const [composeRecipient, setComposeRecipient] =
    useState('All Branch Managers');

  const [composeSubject, setComposeSubject] =
    useState('');

  const [composeBody, setComposeBody] =
    useState('');

  const [composePriority, setComposePriority] =
    useState<MessagePriority>('Normal');

  const [composeCategory, setComposeCategory] =
    useState('General');

  const totalMessages =
    messages.length;

  const unreadMessages =
    messages.filter(
      (message) =>
        message.status === 'Unread'
    ).length;

  const readMessages =
    messages.filter(
      (message) =>
        message.status === 'Read'
    ).length;

  const sentMessages =
    messages.filter(
      (message) =>
        message.status === 'Sent'
    ).length;

  const importantMessages =
    messages.filter(
      (message) =>
        message.priority ===
        'Important'
    ).length;

  const archivedMessages =
    messages.filter(
      (message) =>
        message.status === 'Archived'
    ).length;

  const filteredMessages =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return messages.filter(
        (message) => {
          const matchesSearch =
            !query ||
            message.sender
              .toLowerCase()
              .includes(query) ||
            message.subject
              .toLowerCase()
              .includes(query) ||
            message.preview
              .toLowerCase()
              .includes(query) ||
            message.messageId
              .toLowerCase()
              .includes(query) ||
            message.category
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            activeFilter === 'All' ||
            message.status ===
              activeFilter ||
            (activeFilter ===
              'Important' &&
              message.priority ===
                'Important');

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      messages,
      search,
      activeFilter,
    ]);

  const openActions = (
    message: MessageRecord
  ) => {
    setSelectedMessage(message);
    setActionModalVisible(true);
  };

  const viewMessage = (
    message: MessageRecord
  ) => {
    setSelectedMessage({
      ...message,
      status:
        message.status ===
        'Unread'
          ? 'Read'
          : message.status,
    });

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id &&
        item.status === 'Unread'
          ? {
              ...item,
              status: 'Read',
            }
          : item
      )
    );

    setActionModalVisible(false);
    setViewModalVisible(true);
  };

  const toggleReadStatus = (
    message: MessageRecord
  ) => {
    setActionModalVisible(false);

    const nextStatus =
      message.status === 'Unread'
        ? 'Read'
        : message.status === 'Read'
        ? 'Unread'
        : message.status;

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );
  };

  const toggleImportant = (
    message: MessageRecord
  ) => {
    setActionModalVisible(false);

    const nextPriority =
      message.priority ===
      'Important'
        ? 'Normal'
        : 'Important';

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              priority:
                nextPriority,
            }
          : item
      )
    );
  };

  const archiveMessage = (
    message: MessageRecord
  ) => {
    setActionModalVisible(false);

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              status: 'Archived',
            }
          : item
      )
    );

    Alert.alert(
      'Message Archived',
      'The message has been moved to archived messages.'
    );
  };

  const deleteMessage = (
    message: MessageRecord
  ) => {
    setActionModalVisible(false);

    Alert.alert(
      'Delete Message',
      `Are you sure you want to delete "${message.subject}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMessages((current) =>
              current.filter(
                (item) =>
                  item.id !==
                  message.id
              )
            );

            Alert.alert(
              'Deleted',
              'Message has been deleted.'
            );
          },
        },
      ]
    );
  };

  const replyToMessage = (
    message: MessageRecord
  ) => {
    setActionModalVisible(false);

    setComposeRecipient(
      message.sender
    );

    setComposeSubject(
      `Re: ${message.subject}`
    );

    setComposeBody(
      `\n\n--- Original Message ---\n${message.body}`
    );

    setComposePriority(
      message.priority
    );

    setComposeCategory(
      message.category
    );

    setComposeModalVisible(true);
  };

  const openCompose = () => {
    setComposeRecipient(
      'All Branch Managers'
    );
    setComposeSubject('');
    setComposeBody('');
    setComposePriority('Normal');
    setComposeCategory('General');
    setComposeModalVisible(true);
  };

  const sendMessage = () => {
    if (
      !composeRecipient.trim() ||
      !composeSubject.trim() ||
      !composeBody.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please enter recipient, subject and message.'
      );
      return;
    }

    const newMessage: MessageRecord =
      {
        id:
          Math.max(
            0,
            ...messages.map(
              (message) =>
                message.id
            )
          ) + 1,
        messageId: `VLCC-MSG-${String(
          messages.length + 1
        ).padStart(3, '0')}`,
        sender: 'Super Admin',
        senderRole:
          'Super Admin',
        recipient:
          composeRecipient.trim(),
        subject:
          composeSubject.trim(),
        preview:
          composeBody
            .trim()
            .replace(/\n/g, ' ')
            .slice(0, 120),
        body:
          composeBody.trim(),
        date: '05 Sep 2026',
        time: '10:00 PM',
        status: 'Sent',
        priority:
          composePriority,
        category:
          composeCategory,
      };

    setMessages((current) => [
      newMessage,
      ...current,
    ]);

    setComposeModalVisible(false);

    Alert.alert(
      'Message Sent',
      `Your message has been sent to ${composeRecipient}.`
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

  const renderMessageCard = (
    message: MessageRecord
  ) => {
    const isUnread =
      message.status === 'Unread';

    const isImportant =
      message.priority ===
      'Important';

    return (
      <TouchableOpacity
        key={message.id}
        activeOpacity={0.9}
        style={[
          styles.messageCard,
          isUnread &&
            styles.unreadMessageCard,
        ]}
        onPress={() =>
          viewMessage(message)
        }
      >
        <View
          style={styles.cardTopRow}
        >
          <View
            style={styles.senderArea}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    isUnread
                      ? '#F1EAFF'
                      : '#F3F4F7',
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  {
                    color:
                      isUnread
                        ? '#7040D5'
                        : '#687386',
                  },
                ]}
              >
                {message.sender
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
              <View
                style={
                  styles.senderNameRow
                }
              >
                <Text
                  style={
                    styles.senderName
                  }
                  numberOfLines={1}
                >
                  {message.sender}
                </Text>

                {isUnread && (
                  <View
                    style={
                      styles.unreadDot
                    }
                  />
                )}
              </View>

              <Text
                style={
                  styles.senderRole
                }
              >
                {
                  message.senderRole
                }
              </Text>
            </View>
          </View>

          <View
            style={
              styles.dateArea
            }
          >
            <Text
              style={
                styles.messageTime
              }
            >
              {message.time}
            </Text>

            <TouchableOpacity
              style={
                styles.moreButton
              }
              onPress={(event) => {
                event.stopPropagation();
                openActions(message);
              }}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={22}
                color="#59657A"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={
            styles.subjectRow
          }
        >
          <Text
            style={[
              styles.subject,
              isUnread &&
                styles.unreadSubject,
            ]}
            numberOfLines={2}
          >
            {message.subject}
          </Text>

          {isImportant && (
            <MaterialCommunityIcons
              name="star"
              size={17}
              color="#F7941D"
            />
          )}
        </View>

        <Text
          style={
            styles.preview
          }
          numberOfLines={2}
        >
          {message.preview}
        </Text>

        <View
          style={
            styles.messageFooter
          }
        >
          <View
            style={
              styles.footerLeft
            }
          >
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
                {message.category}
              </Text>
            </View>

            <Text
              style={
                styles.messageDate
              }
            >
              {message.date}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  getStatusColor(
                    message.status
                  ).bg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    getStatusColor(
                      message.status
                    ).text,
                },
              ]}
            >
              {message.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
          Messages
        </Text>

        <TouchableOpacity
          style={
            styles.addButton
          }
          onPress={
            openCompose
          }
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={15}
            color="#7040D5"
          />

          <Text
            style={
              styles.addButtonText
            }
          >
            Compose
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
          Message Management
        </Text>

        <Text
          style={
            styles.managementSubtitle
          }
        >
          Manage messages, conversations and notifications
        </Text>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryGrid
          }
        >
          {renderSummaryCard(
            'Total Messages',
            String(totalMessages),
            'message-text-outline',
            'purple'
          )}

          {renderSummaryCard(
            'Unread',
            String(unreadMessages),
            'email-alert-outline',
            'pink'
          )}

          {renderSummaryCard(
            'Read',
            String(readMessages),
            'email-open-outline',
            'green'
          )}

          {renderSummaryCard(
            'Sent',
            String(sentMessages),
            'send-check-outline',
            'blue'
          )}

          {renderSummaryCard(
            'Important',
            String(importantMessages),
            'star-outline',
            'orange'
          )}

          {renderSummaryCard(
            'Archived',
            String(archivedMessages),
            'archive-outline',
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
            onChangeText={
              setSearch
            }
            placeholder="Search sender, subject, message..."
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
            'Unread',
            'Read',
            'Sent',
            'Important',
            'Archived',
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() =>
                setActiveFilter(
                  filter as
                    | 'All'
                    | MessageStatus
                    | 'Important'
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

        {/* LIST */}

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
            Messages
          </Text>

          <Text
            style={
              styles.recordCount
            }
          >
            {
              filteredMessages.length
            }{' '}
            Records
          </Text>
        </View>

        {filteredMessages.length ===
        0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <MaterialCommunityIcons
              name="message-text-outline"
              size={44}
              color="#A7AFBD"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No messages found
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
          filteredMessages.map(
            renderMessageCard
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
                  Message Actions
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                  numberOfLines={1}
                >
                  {
                    selectedMessage?.subject
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
              text="View Message"
              onPress={() => {
                if (
                  selectedMessage
                ) {
                  viewMessage(
                    selectedMessage
                  );
                }
              }}
            />

            <ActionButton
              icon={
                selectedMessage?.status ===
                'Unread'
                  ? 'email-open-outline'
                  : 'email-outline'
              }
              color="#2675E8"
              text={
                selectedMessage?.status ===
                'Unread'
                  ? 'Mark as Read'
                  : 'Mark as Unread'
              }
              onPress={() => {
                if (
                  selectedMessage
                ) {
                  toggleReadStatus(
                    selectedMessage
                  );
                }
              }}
            />

            <ActionButton
              icon={
                selectedMessage?.priority ===
                'Important'
                  ? 'star-off-outline'
                  : 'star-outline'
              }
              color="#F7941D"
              text={
                selectedMessage?.priority ===
                'Important'
                  ? 'Remove Important'
                  : 'Mark Important'
              }
              onPress={() => {
                if (
                  selectedMessage
                ) {
                  toggleImportant(
                    selectedMessage
                  );
                }
              }}
            />

            <ActionButton
              icon="reply-outline"
              color="#35B878"
              text="Reply"
              onPress={() => {
                if (
                  selectedMessage
                ) {
                  replyToMessage(
                    selectedMessage
                  );
                }
              }}
            />

            <ActionButton
              icon="archive-outline"
              color="#7040D5"
              text="Archive"
              onPress={() => {
                if (
                  selectedMessage
                ) {
                  archiveMessage(
                    selectedMessage
                  );
                }
              }}
            />

            <ActionButton
              icon="delete-outline"
              color="#D84B63"
              text="Delete Message"
              onPress={() => {
                if (
                  selectedMessage
                ) {
                  deleteMessage(
                    selectedMessage
                  );
                }
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          VIEW MESSAGE
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
                  Message
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedMessage?.messageId
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

            {selectedMessage && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.messageDetailHeader
                  }
                >
                  <View
                    style={
                      styles.detailSenderRow
                    }
                  >
                    <View
                      style={
                        styles.largeAvatar
                      }
                    >
                      <Text
                        style={
                          styles.largeAvatarText
                        }
                      >
                        {selectedMessage.sender
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
                          styles.detailSenderName
                        }
                      >
                        {
                          selectedMessage.sender
                        }
                      </Text>

                      <Text
                        style={
                          styles.detailSenderRole
                        }
                      >
                        {
                          selectedMessage.senderRole
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.detailMessageMeta
                    }
                  >
                    <Text
                      style={
                        styles.metaText
                      }
                    >
                      {
                        selectedMessage.date
                      }
                    </Text>

                    <Text
                      style={
                        styles.metaText
                      }
                    >
                      {
                        selectedMessage.time
                      }
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.detailSubjectRow
                  }
                >
                  <Text
                    style={
                      styles.detailSubject
                    }
                  >
                    {
                      selectedMessage.subject
                    }
                  </Text>

                  {selectedMessage.priority ===
                    'Important' && (
                    <MaterialCommunityIcons
                      name="star"
                      size={19}
                      color="#F7941D"
                    />
                  )}
                </View>

                <View
                  style={
                    styles.detailTags
                  }
                >
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
                        selectedMessage.category
                      }
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(
                            selectedMessage.status
                          ).bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            getStatusColor(
                              selectedMessage.status
                            ).text,
                        },
                      ]}
                    >
                      {
                        selectedMessage.status
                      }
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.recipientBox
                  }
                >
                  <Text
                    style={
                      styles.recipientLabel
                    }
                  >
                    To
                  </Text>

                  <Text
                    style={
                      styles.recipientValue
                    }
                  >
                    {
                      selectedMessage.recipient
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.messageBodyBox
                  }
                >
                  <Text
                    style={
                      styles.messageBody
                    }
                  >
                    {
                      selectedMessage.body
                    }
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={() =>
                    replyToMessage(
                      selectedMessage
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="reply-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Reply
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================
          COMPOSE MESSAGE
      ========================== */}

      <Modal
        visible={
          composeModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setComposeModalVisible(
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
                  Compose Message
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Send a new message
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setComposeModalVisible(
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
                Recipient
              </Text>

              <TextInput
                value={
                  composeRecipient
                }
                onChangeText={
                  setComposeRecipient
                }
                placeholder="Enter recipient"
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
                Subject
              </Text>

              <TextInput
                value={
                  composeSubject
                }
                onChangeText={
                  setComposeSubject
                }
                placeholder="Enter message subject"
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
                        composeCategory ===
                        category
                      }
                      onPress={() =>
                        setComposeCategory(
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
                    'Important',
                    'Normal',
                  ] as MessagePriority[]
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
                        composePriority ===
                        priority
                      }
                      onPress={() =>
                        setComposePriority(
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
                Message
              </Text>

              <TextInput
                value={
                  composeBody
                }
                onChangeText={
                  setComposeBody
                }
                placeholder="Type your message..."
                placeholderTextColor="#A2AABB"
                multiline
                style={[
                  styles.input,
                  styles.textArea,
                ]}
              />

              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={
                  sendMessage
                }
              >
                <MaterialCommunityIcons
                  name="send-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Send Message
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
   HELPERS
========================= */

function getStatusColor(
  status: MessageStatus
) {
  switch (status) {
    case 'Unread':
      return {
        bg: '#F1EAFF',
        text: '#7040D5',
      };

    case 'Read':
      return {
        bg: '#E7F8EF',
        text: '#22945F',
      };

    case 'Sent':
      return {
        bg: '#EAF2FF',
        text: '#2675E8',
      };

    case 'Archived':
      return {
        bg: '#F0F1F5',
        text: '#687386',
      };
  }
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

  /* MESSAGE CARD */

  messageCard: {
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

  unreadMessageCard: {
    borderColor: '#DDD1F8',
    backgroundColor: '#FEFDFF',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  senderArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 11.5,
  },

  senderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  senderName: {
    flexShrink: 1,
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 12.5,
  },

  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7040D5',
  },

  senderRole: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
    marginTop: 1,
  },

  dateArea: {
    alignItems: 'flex-end',
  },

  messageTime: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8,
  },

  moreButton: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  subjectRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  subject: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    color: '#313B4E',
    fontSize: 11.5,
    lineHeight: 16,
  },

  unreadSubject: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
  },

  preview: {
    fontFamily: 'PoppinsRegular',
    color: '#7B8496',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
  },

  messageFooter: {
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#F1EAFF',
  },

  categoryText: {
    fontFamily: 'PoppinsMedium',
    color: '#7040D5',
    fontSize: 7.5,
  },

  messageDate: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 7.5,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
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

  /* VIEW MESSAGE */

  messageDetailHeader: {
    backgroundColor: '#F8F9FC',
    borderRadius: 13,
    padding: 12,
  },

  detailSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  largeAvatar: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  largeAvatarText: {
    fontFamily: 'PoppinsBold',
    color: '#7040D5',
    fontSize: 15,
  },

  detailSenderName: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 13.5,
  },

  detailSenderRole: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9,
    marginTop: 1,
  },

  detailMessageMeta: {
    marginTop: 9,
    flexDirection: 'row',
    gap: 12,
  },

  metaText: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
  },

  detailSubjectRow: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  detailSubject: {
    flex: 1,
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 15,
    lineHeight: 21,
  },

  detailTags: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 9,
  },

  recipientBox: {
    marginTop: 14,
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    padding: 11,
    flexDirection: 'row',
    gap: 8,
  },

  recipientLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#8A93A4',
    fontSize: 9,
  },

  recipientValue: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    color: '#313B4E',
    fontSize: 9,
  },

  messageBodyBox: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 11,
    padding: 13,
  },

  messageBody: {
    fontFamily: 'PoppinsRegular',
    color: '#59657A',
    fontSize: 10,
    lineHeight: 17,
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
    minHeight: 125,
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
});