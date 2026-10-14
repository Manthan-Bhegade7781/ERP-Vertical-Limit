import React, { useEffect, useMemo, useState } from 'react';

import {

  ActivityIndicator,

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
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';



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

  senderId: string;

  recipientIds: string[];

  folder: 'inbox' | 'sent';

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



type MessageRecipient = {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
};

const getId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id ?? value.id ?? value.userId ?? value.recipientId ?? '');
};

const decodeUserIdFromToken = (token: string): string => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return '';
    const decoder = (globalThis as any).atob;
    if (typeof decoder !== 'function') return '';
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(decoder(normalized));
    return String(decoded.id ?? decoded._id ?? decoded.userId ?? decoded.sub ?? '');
  } catch {
    return '';
  }
};

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




const getName = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value.fullName ?? value.name ?? value.email ?? '');
};

const mapApiMessage = (
  raw: any,
  index: number,
  currentUserId = '',
): MessageRecord => {
  const sender = raw.sender;
  const recipients = Array.isArray(raw.recipients) ? raw.recipients : [];
  const getRecipientUser = (entry: any) =>
    entry?.user ?? entry?.recipient ?? entry?.userId ?? entry?.recipientId ?? entry;
  const recipientNames = recipients
    .map((entry: any) => getName(getRecipientUser(entry)))
    .filter(Boolean);
  const currentRecipient =
    recipients.find((entry: any) => getId(getRecipientUser(entry)) === currentUserId) ??
    recipients[0] ??
    {};

  const senderRoles = Array.isArray(sender?.roles)
    ? sender.roles
    : sender?.role
      ? [sender.role]
      : [];
  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
  };
  const rawRole = String(senderRoles[0] ?? '');
  const senderRole = (roleLabels[rawRole] ?? rawRole) || 'User';
  const archivedAt = currentRecipient.archivedAt;
  const readAt = currentRecipient.readAt;
  const isRead = Boolean(readAt || currentRecipient.isRead);
  const isImportant = Boolean(currentRecipient.isImportant || ['important', 'high'].includes(String(raw.priority ?? '').toLowerCase()));
  const folder: 'inbox' | 'sent' = raw.__folder === 'sent' ? 'sent' : 'inbox';

  let status: MessageStatus = 'Unread';
  if (folder === 'sent') status = 'Sent';
  else if (archivedAt) status = 'Archived';
  else if (isRead) status = 'Read';

  const createdAt = raw.createdAt ? new Date(raw.createdAt) : null;
  const validDate = Boolean(createdAt && !Number.isNaN(createdAt.getTime()));

  return {
    id: index + 1,
    messageId: String(raw._id ?? raw.id ?? ''),
    senderId: getId(sender),
    recipientIds: recipients.map((entry: any) => getId(getRecipientUser(entry))).filter(Boolean),
    folder,
    sender: getName(sender) || 'Unknown sender',
    senderRole,
    recipient: recipientNames.join(', ') || 'You',
    subject: String(raw.subject ?? '(No subject)'),
    preview: String(raw.body ?? '').replace(/\s+/g, ' ').slice(0, 120),
    body: String(raw.body ?? ''),
    date: validDate
      ? createdAt!.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    time: validDate
      ? createdAt!.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '',
    status,
    priority: isImportant ? 'Important' : 'Normal',
    category: String(raw.category ?? 'General'),
  };
};

export default function MessagesPage() {

  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();



  const contentWidth = width - 32;

  const statGap = 10;



  const statCardWidth =

    (contentWidth - statGap * 2) / 3;



  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [recipients, setRecipients] = useState<MessageRecipient[]>([]);
  const [recipientPickerVisible, setRecipientPickerVisible] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);



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

    useState('');



  const [composeSubject, setComposeSubject] =

    useState('');



  const [composeBody, setComposeBody] =

    useState('');



  const [composePriority, setComposePriority] =

    useState<MessagePriority>('Normal');



  const [composeCategory, setComposeCategory] =

    useState('General');




  const apiRequest = async (path: string, options: any = {}) => {
    const token = await getToken();
    if (!token) throw new Error('Your session has expired. Please log in again.');

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
    });

    let result: any = {};
    try {
      result = await response.json();
    } catch {
      // Some successful DELETE responses may not contain JSON.
    }

    if (!response.ok || result.success === false) {
      throw new Error(result.message || `Request failed (${response.status}).`);
    }
    return result;
  };

  const loadMessages = async (showLoading = false, showError = false) => {
    try {
      if (showLoading) setLoadingMessages(true);
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please log in again.');
      const decodedUserId = decodeUserIdFromToken(token);
      if (decodedUserId) setCurrentUserId(decodedUserId);

      const fetchFolder = async (folder: 'inbox' | 'sent' | 'archived') => {
        const response = await fetch(`${API_BASE_URL}/messages?folder=${folder}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || `Unable to load ${folder} messages.`);
        }
        const records = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.messages)
            ? result.data.messages
            : [];
        return records.map((message: any) => ({ ...message, __folder: folder }));
      };

      const [inboxMessages, sentMessages, archivedMessages] = await Promise.all([
        fetchFolder('inbox'),
        fetchFolder('sent'),
        fetchFolder('archived'),
      ]);
      const allMessages = [...inboxMessages, ...sentMessages, ...archivedMessages];
      const uniqueMessages = Array.from(
        new Map(allMessages.map((message: any) => [String(message._id ?? message.id), message])).values(),
      );
      setMessages(uniqueMessages.map((message: any, index: number) =>
        mapApiMessage(message, index, decodedUserId),
      ));
    } catch (error) {
      if (showError) {
        Alert.alert('Unable to Load Messages', error instanceof Error ? error.message : 'Please try again.');
      }
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const loadRecipients = async (showError = false) => {
    try {
      const result = await apiRequest('/users/message-recipients');
      const records = Array.isArray(result.data) ? result.data : [];
      setRecipients(records.map((user: any) => ({
        id: String(user.id ?? user._id ?? ''),
        fullName: String(user.fullName ?? user.name ?? user.email ?? 'Unknown user'),
        email: String(user.email ?? ''),
        roles: Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [],
      })).filter((user: MessageRecipient) => Boolean(user.id)));
    } catch (error) {
      if (showError) {
        Alert.alert('Unable to Load Recipients', error instanceof Error ? error.message : 'Please try again.');
      }
    }
  };

  useEffect(() => {
    void loadMessages(true, true);
    void loadRecipients(false);
  }, []);

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



  const viewMessage = async (message: MessageRecord) => {
    setActionModalVisible(false);
    try {
      const result = await apiRequest(`/messages/${message.messageId}`);
      const raw = result.data?.message ?? result.data;
      const mapped = mapApiMessage({ ...raw, __folder: message.folder }, message.id - 1, currentUserId);
      const viewed = { ...message, ...mapped, id: message.id, status: message.status === 'Archived' ? 'Archived' : (message.folder === 'inbox' ? 'Read' : 'Sent') } as MessageRecord;
      setSelectedMessage(viewed);
      setMessages((current) => current.map((item) => item.messageId === message.messageId
        ? { ...item, status: item.status === 'Archived' ? 'Archived' : (item.folder === 'inbox' ? 'Read' : 'Sent') }
        : item));
      setViewModalVisible(true);
    } catch (error) {
      Alert.alert('Unable to Open Message', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const toggleReadStatus = async (message: MessageRecord) => {
    setActionModalVisible(false);
    if (message.folder === 'sent') {
      Alert.alert('Not Available', 'Read status can only be changed for messages in your inbox.');
      return;
    }
    const action = message.status === 'Unread' ? 'read' : 'unread';
    try {
      await apiRequest(`/messages/${message.messageId}/status`, {
        method: 'PATCH', body: JSON.stringify({ action }),
      });
      setMessages((current) => current.map((item) => item.messageId === message.messageId
        ? { ...item, status: item.status === 'Archived' ? 'Archived' : (action === 'read' ? 'Read' : 'Unread') }
        : item));
      setSelectedMessage((current) => current?.messageId === message.messageId
        ? { ...current, status: current.status === 'Archived' ? 'Archived' : (action === 'read' ? 'Read' : 'Unread') }
        : current);
    } catch (error) {
      Alert.alert('Unable to Update Message', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const toggleImportant = async (message: MessageRecord) => {
    setActionModalVisible(false);
    if (message.folder === 'sent') {
      Alert.alert('Not Available', 'Important status is managed for messages in your inbox.');
      return;
    }
    const action = message.priority === 'Important' ? 'normal' : 'important';
    try {
      await apiRequest(`/messages/${message.messageId}/status`, {
        method: 'PATCH', body: JSON.stringify({ action }),
      });
      const priority: MessagePriority = action === 'important' ? 'Important' : 'Normal';
      setMessages((current) => current.map((item) => item.messageId === message.messageId ? { ...item, priority } : item));
      setSelectedMessage((current) => current?.messageId === message.messageId ? { ...current, priority } : current);
    } catch (error) {
      Alert.alert('Unable to Update Importance', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const archiveMessage = async (message: MessageRecord) => {
    setActionModalVisible(false);
    if (message.folder === 'sent') {
      Alert.alert('Not Available', 'Only inbox messages can be archived.');
      return;
    }
    const action = message.status === 'Archived' ? 'unarchive' : 'archive';
    try {
      await apiRequest(`/messages/${message.messageId}/status`, {
        method: 'PATCH', body: JSON.stringify({ action }),
      });
      setMessages((current) => current.map((item) => item.messageId === message.messageId
        ? { ...item, status: action === 'archive' ? 'Archived' : (item.status === 'Archived' ? 'Read' : item.status) }
        : item));
      setSelectedMessage((current) => current?.messageId === message.messageId
        ? { ...current, status: action === 'archive' ? 'Archived' : 'Read' }
        : current);
      Alert.alert(action === 'archive' ? 'Message Archived' : 'Message Unarchived', action === 'archive'
        ? 'The message has been moved to archived messages.'
        : 'The message has been moved back to your inbox.');
    } catch (error) {
      Alert.alert('Unable to Update Archive', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const deleteMessage = (message: MessageRecord) => {
    setActionModalVisible(false);
    Alert.alert('Delete Message', `Are you sure you want to delete "${message.subject}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiRequest(`/messages/${message.messageId}`, { method: 'DELETE' });
            setMessages((current) => current.filter((item) => item.messageId !== message.messageId));
            if (selectedMessage?.messageId === message.messageId) setSelectedMessage(null);
            Alert.alert('Deleted', 'Message has been deleted.');
          } catch (error) {
            Alert.alert('Unable to Delete Message', error instanceof Error ? error.message : 'Please try again.');
          }
        },
      },
    ]);
  };

  const replyToMessage = (message: MessageRecord) => {
    setActionModalVisible(false);
    if (message.folder === 'sent') {
      Alert.alert('Reply Not Available', 'Open a message from your inbox to reply to its sender.');
      return;
    }
    if (!message.senderId) {
      Alert.alert('Unable to Reply', 'The sender ID was not included in the message response.');
      return;
    }
    setSelectedRecipientIds([message.senderId]);
    setComposeRecipient(message.sender);
    setReplyToId(message.messageId);
    setComposeSubject(`Re: ${message.subject.replace(/^Re:\s*/i, '')}`);
    setComposeBody('');
    setComposePriority(message.priority);
    setComposeCategory(message.category);
    setComposeModalVisible(true);
  };

  const openCompose = () => {
    setComposeRecipient('');
    setSelectedRecipientIds([]);
    setReplyToId(null);
    setComposeSubject('');
    setComposeBody('');
    setComposePriority('Normal');
    setComposeCategory('General');
    void loadRecipients(true);
    setComposeModalVisible(true);
  };

  const toggleRecipient = (recipient: MessageRecipient) => {
    const exists = selectedRecipientIds.includes(recipient.id);
    const next = exists
      ? selectedRecipientIds.filter((id) => id !== recipient.id)
      : [...selectedRecipientIds, recipient.id];
    setSelectedRecipientIds(next);
    const selectedNames = recipients
      .filter((item) => next.includes(item.id))
      .map((item) => item.fullName);
    setComposeRecipient(selectedNames.join(', '));
  };

  const sendMessage = async () => {
    if (!composeSubject.trim() || !composeBody.trim() || (!replyToId && selectedRecipientIds.length === 0)) {
      Alert.alert('Required Fields', replyToId
        ? 'Please enter subject and message.'
        : 'Please select at least one recipient, and enter subject and message.');
      return;
    }

    setSendingMessage(true);
    try {
      if (replyToId) {
        await apiRequest(`/messages/${replyToId}/reply`, {
          method: 'POST',
          body: JSON.stringify({ body: composeBody.trim() }),
        });
      } else {
        await apiRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            recipientIds: selectedRecipientIds,
            subject: composeSubject.trim(),
            body: composeBody.trim(),
            category: composeCategory,
            priority: composePriority,
          }),
        });
      }

      setComposeModalVisible(false);
      setRecipientPickerVisible(false);
      setReplyToId(null);
      setComposeBody('');
      setComposeSubject('');
      setComposeRecipient('');
      setSelectedRecipientIds([]);
      await loadMessages(false, false);
      Alert.alert('Message Sent', replyToId
        ? 'Your reply has been sent.'
        : `Your message has been sent to ${composeRecipient}.`);
    } catch (error) {
      Alert.alert('Unable to Send Message', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSendingMessage(false);
    }
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



        {loadingMessages ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color="#7040D5" />
            <Text style={styles.emptyTitle}>Loading messages...</Text>
          </View>
        ) : filteredMessages.length ===
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

              icon={selectedMessage?.status === 'Archived' ? "archive-arrow-up-outline" : "archive-outline"}

              color="#7040D5"

              text={selectedMessage?.status === 'Archived' ? "Unarchive" : "Archive"}

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



              <TouchableOpacity
                onPress={() => {
                  if (replyToId) {
                    Alert.alert('Reply Recipient', `Your reply will be sent to ${composeRecipient}.`);
                  } else {
                    void loadRecipients(true);
                    setRecipientPickerVisible(true);
                  }
                }}
                activeOpacity={0.8}
                style={[styles.input, { minHeight: 48, justifyContent: 'center' }]}
              >
                <Text style={{ color: composeRecipient ? '#202939' : '#A2AABB', fontSize: 14 }}>
                  {composeRecipient || 'Select recipient(s)'}
                </Text>
                {!replyToId && (
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#667085" style={{ position: 'absolute', right: 12, top: 13 }} />
                )}
              </TouchableOpacity>



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

                disabled={sendingMessage}

                onPress={() => void sendMessage()}

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

                  {sendingMessage ? 'Sending...' : (replyToId ? 'Send Reply' : 'Send Message')}

                </Text>

              </TouchableOpacity>

            </ScrollView>

          </View>

        </View>

      </Modal>

      {/* =========================
          RECIPIENT PICKER
      ========================== */}
      <Modal
        visible={recipientPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRecipientPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.largeModal, { maxHeight: '82%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Select Recipients</Text>
                <Text style={styles.modalSubtitle}>Choose one or more active users</Text>
              </View>
              <TouchableOpacity onPress={() => setRecipientPickerVisible(false)}>
                <MaterialCommunityIcons name="close" size={23} color="#667085" />
              </TouchableOpacity>
            </View>
            <TextInput
              value={recipientSearch}
              onChangeText={setRecipientSearch}
              placeholder="Search by name or email"
              placeholderTextColor="#A2AABB"
              style={styles.input}
            />
            <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
              {recipients
                .filter((user) => {
                  const q = recipientSearch.trim().toLowerCase();
                  return !q || user.fullName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.roles.join(' ').toLowerCase().includes(q);
                })
                .map((user) => {
                  const selected = selectedRecipientIds.includes(user.id);
                  const roleLabels = user.roles.map((role) => role.replace(/_/g, ' ')).join(', ');
                  return (
                    <TouchableOpacity
                      key={user.id}
                      onPress={() => toggleRecipient(user)}
                      activeOpacity={0.75}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#EEF0F4' }}
                    >
                      <MaterialCommunityIcons name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'} size={22} color={selected ? '#7040D5' : '#98A2B3'} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ color: '#202939', fontSize: 14, fontWeight: '600' }}>{user.fullName}</Text>
                        {!!user.email && <Text style={{ color: '#667085', fontSize: 12, marginTop: 2 }}>{user.email}</Text>}
                        {!!roleLabels && <Text style={{ color: '#8A5CE6', fontSize: 11, marginTop: 2, textTransform: 'capitalize' }}>{roleLabels}</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              {recipients.length === 0 && (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: '#667085', textAlign: 'center' }}>No eligible recipients were returned by the server.</Text>
                </View>
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setRecipientPickerVisible(false)}
              style={{ backgroundColor: '#7040D5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Done ({selectedRecipientIds.length} selected)</Text>
            </TouchableOpacity>
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