import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

import {
  deleteMessage,
  fetchMessageById,
  fetchMessageContacts,
  fetchMessages,
  replyToMessage,
  sendMessage,
  updateMessageStatus,
  MessageCategory,
  MessageContact,
  MessageFolder,
  MessageRecord,
} from "@/services/messages";

/* =========================================================
   TYPES
========================================================= */

type FolderOption = {
  label: string;
  value: MessageFolder;
  icon: keyof typeof Ionicons.glyphMap;
};

const FOLDERS: FolderOption[] = [
  { label: "Inbox", value: "inbox", icon: "mail-outline" },
  { label: "Sent", value: "sent", icon: "paper-plane-outline" },
  { label: "Unread", value: "unread", icon: "mail-unread-outline" },
  { label: "Important", value: "important", icon: "star-outline" },
  { label: "Archived", value: "archived", icon: "archive-outline" },
];

const CATEGORIES: MessageCategory[] = [
  "General",
  "Academic",
  "Examination",
  "Fees",
  "Reports",
  "Training",
  "Events",
  "Assignments",
];

/* =========================================================
   HELPERS
========================================================= */

const getUserName = (user: any): string => {
  if (!user) return "Unknown User";

  if (typeof user === "string") return "User";

  return user.fullName || user.name || user.email || "Unknown User";
};

const getUserId = (user: any): string => {
  if (!user) return "";

  if (typeof user === "string") return user;

  return String(user._id || user.id || "");
};

const formatDate = (date?: string): string => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date?: string): string => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";
};

const getMailboxStatus = (message: MessageRecord, currentUserId?: string) => {
  if (!message.recipients?.length) return undefined;

  if (currentUserId) {
    const ownStatus = message.recipients.find(
      (recipient) => getUserId(recipient.user) === currentUserId,
    );

    if (ownStatus) return ownStatus;
  }

  return message.recipients[0];
};

const normalizeRole = (role: any): string => {
  const value =
    typeof role === "object" && role !== null
      ? role.name ?? role.value ?? role.role ?? role.slug ?? ""
      : role;

  return String(value)
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

const getRoles = (user: any): string[] => {
  const rawRoles = user?.roles ?? user?.role ?? [];
  const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  return [...new Set(roles.map(normalizeRole).filter(Boolean))];
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

type TeacherMessagesProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

export default function TeacherMessages({
  onContentScroll,
  onBack,
}: TeacherMessagesProps = {}) {
  const { user } = useAuth();
  const userRoles = getRoles(user);
  const isTeacher = userRoles.includes("teacher");
  const canManageMailbox =
    userRoles.includes("admin") || userRoles.includes("super_admin");
  const canCompose = isTeacher || canManageMailbox;
  const canViewInbox = isTeacher || canManageMailbox;
  const visibleFolders = isTeacher
    ? FOLDERS.filter((folder) => ["inbox", "unread"].includes(folder.value))
    : FOLDERS;

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [activeFolder, setActiveFolder] =
    useState<MessageFolder>("inbox");

  const [messages, setMessages] = useState<MessageRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedMessage, setSelectedMessage] =
    useState<MessageRecord | null>(null);

  const [detailsVisible, setDetailsVisible] = useState(false);

  const [composeVisible, setComposeVisible] = useState(false);

  const [contacts, setContacts] = useState<MessageContact[]>([]);

  const [contactsLoading, setContactsLoading] = useState(false);

  const [contactSearch, setContactSearch] = useState("");

  const [selectedRecipients, setSelectedRecipients] =
    useState<string[]>([]);

  const [subject, setSubject] = useState("");

  const [body, setBody] = useState("");

  const [category, setCategory] =
    useState<MessageCategory>("General");

  const [priority, setPriority] =
    useState<"Normal" | "Important">("Normal");

  const [replyText, setReplyText] = useState("");

  const [sending, setSending] = useState(false);

  const [replying, setReplying] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const currentUserId = String(user?.id || user?.id || "");

  // Reply is available only for received messages from the opposite side:
  // Teacher replies to Admin/Super Admin; Admin/Super Admin replies to Teacher.
  const selectedSenderRoles = selectedMessage
    ? getRoles(selectedMessage.sender)
    : [];

  const canReplyToSelected = Boolean(
    selectedMessage &&
      activeFolder !== "sent" &&
      ((isTeacher &&
        (selectedSenderRoles.includes("admin") ||
          selectedSenderRoles.includes("super_admin"))) ||
        (canManageMailbox && selectedSenderRoles.includes("teacher"))),
  );

  /* -------------------------------------------------------
     LOAD MESSAGES
  ------------------------------------------------------- */

  const loadMessages = useCallback(
    async (showLoader = true) => {
      if (!canViewInbox) {
        setMessages([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const result = await fetchMessages(activeFolder);

        setMessages(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load messages.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFolder, canViewInbox],
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadMessages(false);
  };

  /* -------------------------------------------------------
     LOAD CONTACTS
  ------------------------------------------------------- */

  const loadContacts = async () => {
    setContactsLoading(true);

    try {
      const result = await fetchMessageContacts();
      // Teachers may compose only to Admin and Super Admin.
      const allowedContacts = isTeacher
        ? result.filter((contact) => {
            const roles = (contact.roles || []).map(normalizeRole);
            return roles.includes("admin") || roles.includes("super_admin");
          })
        : result;
      setContacts(allowedContacts);
    } catch (err) {
      Alert.alert(
        "Unable to load recipients",
        err instanceof Error
          ? err.message
          : "Please try again.",
      );
    } finally {
      setContactsLoading(false);
    }
  };

  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return messages;

    return messages.filter((message) => {
      const senderName = getUserName(message.sender);

      const recipientNames = (message.recipients || [])
        .map((recipient) => getUserName(recipient.user))
        .join(" ");

      return (
        message.subject?.toLowerCase().includes(query) ||
        message.body?.toLowerCase().includes(query) ||
        senderName.toLowerCase().includes(query) ||
        recipientNames.toLowerCase().includes(query) ||
        message.category?.toLowerCase().includes(query)
      );
    });
  }, [messages, search]);

  const filteredContacts = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();

    if (!query) return contacts;

    return contacts.filter(
      (contact) =>
        contact.fullName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.roles?.join(" ").toLowerCase().includes(query),
    );
  }, [contacts, contactSearch]);

  /* -------------------------------------------------------
     UNREAD COUNT
  ------------------------------------------------------- */

  const unreadCount = useMemo(() => {
    return messages.filter((message) => {
      const status = getMailboxStatus(message, currentUserId);
      return !status?.readAt;
    }).length;
  }, [messages]);

  /* -------------------------------------------------------
     OPEN MESSAGE
  ------------------------------------------------------- */

  const openMessage = async (message: MessageRecord) => {
    setSelectedMessage(message);
    setReplyText("");
    setDetailsVisible(true);

    // The backend automatically marks received messages as read
    // when GET /messages/:id is called.
    try {
      const fullMessage = await fetchMessageById(message._id);

      setSelectedMessage(fullMessage);

      if (activeFolder !== "sent") {
        setMessages((previous) =>
          previous.map((item) =>
            item._id === message._id
              ? {
                  ...item,
                  recipients: item.recipients.map((recipient) =>
                    getUserId(recipient.user) === currentUserId
                      ? {
                          ...recipient,
                          readAt: recipient.readAt || new Date().toISOString(),
                        }
                      : recipient,
                  ),
                }
              : item,
          ),
        );
      }
    } catch (err) {
      Alert.alert(
        "Message details",
        err instanceof Error
          ? err.message
          : "Unable to load message details.",
      );
    }
  };

  /* -------------------------------------------------------
     CLOSE DETAILS
  ------------------------------------------------------- */

  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedMessage(null);
    setReplyText("");
  };

  /* -------------------------------------------------------
     OPEN COMPOSE
  ------------------------------------------------------- */

  const openCompose = () => {
    setSubject("");
    setBody("");
    setCategory("General");
    setPriority("Normal");
    setSelectedRecipients([]);
    setContactSearch("");

    setComposeVisible(true);

    void loadContacts();
  };

  /* -------------------------------------------------------
     SELECT RECIPIENT
  ------------------------------------------------------- */

  const toggleRecipient = (id: string) => {
    setSelectedRecipients((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  /* -------------------------------------------------------
     SEND MESSAGE
  ------------------------------------------------------- */

  const handleSendMessage = async () => {
    if (selectedRecipients.length === 0) {
      Alert.alert("Select recipient", "Please select at least one recipient.");
      return;
    }

    if (!subject.trim()) {
      Alert.alert("Subject required", "Please enter a message subject.");
      return;
    }

    if (!body.trim()) {
      Alert.alert("Message required", "Please enter your message.");
      return;
    }

    setSending(true);

    try {
      await sendMessage({
        recipientIds: selectedRecipients,
        subject: subject.trim(),
        body: body.trim(),
        category,
        priority,
      });

      setComposeVisible(false);

      Alert.alert("Success", "Your message has been sent successfully.");

      if (canManageMailbox && activeFolder === "sent") {
        await loadMessages(false);
      }
    } catch (err) {
      Alert.alert(
        "Message not sent",
        err instanceof Error
          ? err.message
          : "Unable to send message.",
      );
    } finally {
      setSending(false);
    }
  };

  /* -------------------------------------------------------
     REPLY
  ------------------------------------------------------- */

  const handleReply = async () => {
    if (!selectedMessage) return;

    if (!replyText.trim()) {
      Alert.alert("Reply required", "Please enter your reply.");
      return;
    }

    setReplying(true);

    try {
      await replyToMessage(
        selectedMessage._id,
        replyText.trim(),
      );

      setReplyText("");

      Alert.alert("Success", "Your reply has been sent.");

      closeDetails();

      await loadMessages(false);
    } catch (err) {
      Alert.alert(
        "Reply failed",
        err instanceof Error
          ? err.message
          : "Unable to send reply.",
      );
    } finally {
      setReplying(false);
    }
  };

  /* -------------------------------------------------------
     MESSAGE STATUS ACTION
  ------------------------------------------------------- */

  const handleStatusAction = async (
    action:
      | "read"
      | "unread"
      | "important"
      | "normal"
      | "archive"
      | "unarchive",
    message: MessageRecord,
  ) => {
    setActionLoading(true);

    try {
      await updateMessageStatus(message._id, action);

      if (action === "archive") {
        setMessages((previous) =>
          previous.filter((item) => item._id !== message._id),
        );

        if (selectedMessage?._id === message._id) {
          closeDetails();
        }
      } else if (action === "unarchive") {
        setMessages((previous) =>
          previous.filter((item) => item._id !== message._id),
        );

        if (selectedMessage?._id === message._id) {
          closeDetails();
        }
      } else {
        await loadMessages(false);

        if (selectedMessage?._id === message._id) {
          setSelectedMessage((previous) => {
            if (!previous) return null;

            const current = getMailboxStatus(previous, currentUserId);

            if (!current) return previous;

            return {
              ...previous,
              recipients: previous.recipients.map((recipient) => {
                if (getUserId(recipient.user) !== currentUserId) {
                  return recipient;
                }

                return {
                  ...recipient,
                  readAt:
                    action === "read"
                      ? new Date().toISOString()
                      : action === "unread"
                        ? null
                        : recipient.readAt,
                  isImportant:
                    action === "important"
                      ? true
                      : action === "normal"
                        ? false
                        : recipient.isImportant,
                };
              }),
            };
          });
        }
      }
    } catch (err) {
      Alert.alert(
        "Action failed",
        err instanceof Error
          ? err.message
          : "Unable to update message.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* -------------------------------------------------------
     DELETE MESSAGE
  ------------------------------------------------------- */

  const confirmDelete = (message: MessageRecord) => {
    Alert.alert(
      "Delete message",
      "Are you sure you want to delete this message from your inbox?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMessage(message._id);

              setMessages((previous) =>
                previous.filter((item) => item._id !== message._id),
              );

              if (selectedMessage?._id === message._id) {
                closeDetails();
              }

              Alert.alert("Deleted", "Message deleted successfully.");
            } catch (err) {
              Alert.alert(
                "Delete failed",
                err instanceof Error
                  ? err.message
                  : "Unable to delete message.",
              );
            }
          },
        },
      ],
    );
  };

  /* -------------------------------------------------------
     MESSAGE CARD
  ------------------------------------------------------- */

  const renderMessageCard = (message: MessageRecord) => {
    const senderName = getUserName(message.sender);

    const mailboxStatus = getMailboxStatus(message, currentUserId);

    const isRead = Boolean(mailboxStatus?.readAt);

    const isImportant = Boolean(mailboxStatus?.isImportant);

    const isSent = activeFolder === "sent";

    return (
      <Pressable
        key={message._id}
        onPress={() => openMessage(message)}
        style={[
          styles.messageCard,
          !isRead && !isSent && styles.unreadCard,
        ]}
      >
        <View style={styles.messageTopRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(senderName)}
            </Text>
          </View>

          <View style={styles.messageMain}>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.senderName,
                  !isRead && !isSent && styles.boldText,
                ]}
                numberOfLines={1}
              >
                {isSent
                  ? `To: ${
                      message.recipients
                        ?.map((item) => getUserName(item.user))
                        .join(", ") || "Recipients"
                    }`
                  : senderName}
              </Text>

              {isImportant && (
                <Ionicons name="star" size={15} color="#F2A900" />
              )}
            </View>

            <Text
              style={[
                styles.subject,
                !isRead && !isSent && styles.boldText,
              ]}
              numberOfLines={1}
            >
              {message.subject}
            </Text>

            <Text style={styles.preview} numberOfLines={2}>
              {message.body}
            </Text>

            <View style={styles.messageMeta}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {message.category || "General"}
                </Text>
              </View>

              {message.priority === "Important" && (
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>Important</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.messageDate}>
            <Text style={styles.dateText}>
              {formatDate(message.createdAt)}
            </Text>

            <Text style={styles.timeText}>
              {formatTime(message.createdAt)}
            </Text>

            {!isRead && !isSent && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  /* -------------------------------------------------------
     HEADER
  ------------------------------------------------------- */

  if (!canCompose) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Ionicons name="lock-closed-outline" size={44} color="#7040D5" />
        <Text style={[styles.emptyTitle, { marginTop: 14 }]}>Access Restricted</Text>
        <Text style={[styles.emptySubtitle, { textAlign: "center" }]}>
          Messaging is available only to Admin and Super Admin. Teachers can send messages to them.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5420D8"
            colors={["#5420D8"]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.headerCard}>
          <Pressable
            style={styles.backButton}
            onPress={onBack ?? (() => undefined)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous screen"
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color="#5420D8"
            />
          </Pressable>

          <View style={styles.headerIcon}>
            <Ionicons
              name="chatbubbles-outline"
              size={25}
              color="#5420D8"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>Messages</Text>

            <Text style={styles.subtitle}>
              Stay connected with your institute
            </Text>
          </View>

          {canCompose && (
            <Pressable
              style={styles.composeButton}
              onPress={openCompose}
            >
              <Ionicons name="create-outline" size={17} color="#FFFFFF" />
              <Text style={styles.composeButtonText}>Compose</Text>
            </Pressable>
          )}
        </View>

        {canViewInbox ? (
          <>
        {/* SUMMARY CARD */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="mail-open-outline" size={27} color="#FFFFFF" />
          </View>

          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Your Messages</Text>

            <Text style={styles.summarySubtitle}>
              {messages.length} messages in {activeFolder}
            </Text>
          </View>

          <View style={styles.unreadSummary}>
            <Text style={styles.unreadNumber}>{unreadCount}</Text>

            <Text style={styles.unreadLabel}>Unread</Text>
          </View>
        </View>

        {/* FOLDER TABS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.folderScroll}
          contentContainerStyle={styles.folderContainer}
        >
          {visibleFolders.map((folder) => {
            const active = activeFolder === folder.value;

            return (
              <Pressable
                key={folder.value}
                onPress={() => {
                  setActiveFolder(folder.value);
                  setSearch("");
                }}
                style={[
                  styles.folderButton,
                  active && styles.activeFolderButton,
                ]}
              >
                <Ionicons
                  name={folder.icon}
                  size={17}
                  color={active ? "#FFFFFF" : "#6B7280"}
                />

                <Text
                  style={[
                    styles.folderText,
                    active && styles.activeFolderText,
                  ]}
                >
                  {folder.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* SEARCH */}

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#8B93A3" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search messages..."
            placeholderTextColor="#A0A6B2"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={19} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* MESSAGE LIST HEADER */}

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            {FOLDERS.find((item) => item.value === activeFolder)?.label}
          </Text>

          <Text style={styles.messageCount}>
            {filteredMessages.length} messages
          </Text>
        </View>

        {/* LOADING */}

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#7040D5" />

            <Text style={styles.stateText}>Loading messages...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color="#DC5555"
            />

            <Text style={styles.errorText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => void loadMessages()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        ) : filteredMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="mail-open-outline" size={38} color="#7040D5" />
            </View>

            <Text style={styles.emptyTitle}>No messages found</Text>

            <Text style={styles.emptySubtitle}>
              {search
                ? "Try a different search keyword."
                : "Your messages will appear here."}
            </Text>
          </View>
        ) : (
          <View style={styles.messageList}>
            {filteredMessages.map(renderMessageCard)}
          </View>
        )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="paper-plane-outline" size={38} color="#7040D5" />
            </View>
            <Text style={styles.emptyTitle}>Send a message</Text>
            <Text style={styles.emptySubtitle}>
              You can compose messages to Admin and Super Admin. Messages sent to you by Admin or Super Admin will appear in your Inbox.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ===================================================
          MESSAGE DETAILS MODAL
      =================================================== */}

      <Modal
        visible={detailsVisible}
        animationType="slide"
        transparent
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message Details</Text>

              <Pressable onPress={closeDetails} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            {selectedMessage && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.detailSubject}>
                  {selectedMessage.subject}
                </Text>

                <View style={styles.detailSenderRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(getUserName(selectedMessage.sender))}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailSender}>
                      {getUserName(selectedMessage.sender)}
                    </Text>

                    <Text style={styles.detailDate}>
                      {formatDate(selectedMessage.createdAt)} at{" "}
                      {formatTime(selectedMessage.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailBadges}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      {selectedMessage.category}
                    </Text>
                  </View>

                  {selectedMessage.priority === "Important" && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>Important</Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                <Text style={styles.detailBody}>
                  {selectedMessage.body}
                </Text>

                {/* RECIPIENTS */}

                <View style={styles.divider} />

                <Text style={styles.detailLabel}>
                  {activeFolder === "sent" ? "Recipients" : "Message"}
                </Text>

                {selectedMessage.recipients?.map((recipient, index) => (
                  <View key={index} style={styles.recipientDetail}>
                    <Ionicons
                      name="person-circle-outline"
                      size={20}
                      color="#7040D5"
                    />

                    <Text style={styles.recipientDetailText}>
                      {getUserName(recipient.user)}
                    </Text>
                  </View>
                ))}

                {/* ADMIN / SUPER ADMIN MESSAGE MANAGEMENT */}
                {canManageMailbox && activeFolder !== "sent" && (
                  <>
                    <View style={styles.divider} />

                    <Text style={styles.detailLabel}>Actions</Text>

                    <View style={styles.actionGrid}>
                      <ActionButton
                        icon={
                          getMailboxStatus(selectedMessage, currentUserId)?.isImportant
                            ? "star"
                            : "star-outline"
                        }
                        label={
                          getMailboxStatus(selectedMessage, currentUserId)?.isImportant
                            ? "Remove Important"
                            : "Important"
                        }
                        onPress={() =>
                          void handleStatusAction(
                            getMailboxStatus(selectedMessage, currentUserId)?.isImportant
                              ? "normal"
                              : "important",
                            selectedMessage,
                          )
                        }
                      />

                      <ActionButton
                        icon="archive-outline"
                        label="Archive"
                        onPress={() =>
                          void handleStatusAction("archive", selectedMessage)
                        }
                      />

                      <ActionButton
                        icon="mail-unread-outline"
                        label="Mark Unread"
                        onPress={() =>
                          void handleStatusAction("unread", selectedMessage)
                        }
                      />

                      <ActionButton
                        icon="trash-outline"
                        label="Delete"
                        danger
                        onPress={() => confirmDelete(selectedMessage)}
                      />
                    </View>
                  </>
                )}

                {/* TWO-WAY REPLY: Teacher <-> Admin/Super Admin */}
                {canReplyToSelected && (
                  <>
                    <View style={styles.divider} />

                    <Text style={styles.detailLabel}>Reply</Text>

                    <TextInput
                      value={replyText}
                      onChangeText={setReplyText}
                      placeholder="Write your reply..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      textAlignVertical="top"
                      style={styles.replyInput}
                    />

                    <Pressable
                      style={[
                        styles.sendButton,
                        replying && styles.disabledButton,
                      ]}
                      onPress={handleReply}
                      disabled={replying || actionLoading}
                    >
                      {replying ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons
                            name="send-outline"
                            size={18}
                            color="#FFFFFF"
                          />

                          <Text style={styles.sendButtonText}>
                            Send Reply
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </>
                )}

                {actionLoading && (
                  <ActivityIndicator
                    color="#7040D5"
                    style={{ marginTop: 14 }}
                  />
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ===================================================
          COMPOSE MESSAGE MODAL
      =================================================== */}

      <Modal
        visible={composeVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setComposeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.composeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Compose Message</Text>

              <Pressable
                onPress={() => setComposeVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* RECIPIENTS */}

              <Text style={styles.inputLabel}>Recipients *</Text>

              <View style={styles.recipientSearch}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color="#8B93A3"
                />

                <TextInput
                  value={contactSearch}
                  onChangeText={setContactSearch}
                  placeholder="Search recipients..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.recipientSearchInput}
                />
              </View>

              <Text style={styles.selectedCount}>
                {selectedRecipients.length} recipient(s) selected
              </Text>

              {contactsLoading ? (
                <ActivityIndicator
                  color="#7040D5"
                  style={{ marginVertical: 18 }}
                />
              ) : (
                <View style={styles.contactList}>
                  {filteredContacts.map((contact) => {
                    const selected = selectedRecipients.includes(contact.id);

                    return (
                      <Pressable
                        key={contact.id}
                        onPress={() => toggleRecipient(contact.id)}
                        style={[
                          styles.contactItem,
                          selected && styles.selectedContact,
                        ]}
                      >
                        <View style={styles.contactAvatar}>
                          <Text style={styles.contactAvatarText}>
                            {getInitials(contact.fullName)}
                          </Text>
                        </View>

                        <View style={styles.contactInfo}>
                          <Text style={styles.contactName}>
                            {contact.fullName}
                          </Text>

                          <Text style={styles.contactEmail}>
                            {contact.email}
                          </Text>

                          <Text style={styles.contactRole}>
                            {contact.roles?.join(", ") || "User"}
                          </Text>
                        </View>

                        <Ionicons
                          name={
                            selected
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={23}
                          color={selected ? "#7040D5" : "#9CA3AF"}
                        />
                      </Pressable>
                    );
                  })}

                  {!contactsLoading && filteredContacts.length === 0 && (
                    <Text style={styles.noContacts}>
                      No recipients available.
                    </Text>
                  )}
                </View>
              )}

              {/* SUBJECT */}

              <Text style={styles.inputLabel}>Subject *</Text>

              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter message subject"
                placeholderTextColor="#9CA3AF"
                maxLength={200}
                style={styles.input}
              />

              {/* CATEGORY */}

              <Text style={styles.inputLabel}>Category</Text>

              <View style={styles.chipContainer}>
                {CATEGORIES.map((item) => {
                  const active = category === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => setCategory(item)}
                      style={[
                        styles.selectionChip,
                        active && styles.selectedChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectionChipText,
                          active && styles.selectedChipText,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* PRIORITY */}

              <Text style={styles.inputLabel}>Priority</Text>

              <View style={styles.priorityRow}>
                {(["Normal", "Important"] as const).map((item) => {
                  const active = priority === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => setPriority(item)}
                      style={[
                        styles.priorityOption,
                        active && styles.selectedPriorityOption,
                      ]}
                    >
                      <Ionicons
                        name={item === "Important" ? "star" : "mail-outline"}
                        size={17}
                        color={active ? "#7040D5" : "#667085"}
                      />

                      <Text
                        style={[
                          styles.priorityOptionText,
                          active && styles.selectedChipText,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* BODY */}

              <Text style={styles.inputLabel}>Message *</Text>

              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Write your message here..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                maxLength={10000}
                style={styles.messageInput}
              />

              <Text style={styles.characterCount}>
                {body.length}/10000 characters
              </Text>

              {/* SEND */}

              <Pressable
                style={[
                  styles.sendButton,
                  sending && styles.disabledButton,
                ]}
                onPress={handleSendMessage}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="send-outline"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text style={styles.sendButtonText}>
                      Send Message
                    </Text>
                  </>
                )}
              </Pressable>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Ionicons
        name={icon}
        size={20}
        color={danger ? "#DC5555" : "#7040D5"}
      />

      <Text
        style={[
          styles.actionButtonText,
          danger && { color: "#DC5555" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F9",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 35,
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 19,
  },

  subtitle: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  composeButton: {
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },

  composeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },

  summaryCard: {
    backgroundColor: "#5122C8",
    borderRadius: 19,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  summaryIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryInfo: {
    flex: 1,
    marginLeft: 13,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "PoppinsSemiBold",
  },

  summarySubtitle: {
    color: "#E3D8FF",
    fontSize: 10,
    fontFamily: "PoppinsRegular",
    marginTop: 4,
  },

  unreadSummary: {
    alignItems: "center",
    paddingHorizontal: 10,
  },

  unreadNumber: {
    color: "#FFFFFF",
    fontSize: 23,
    fontFamily: "PoppinsBold",
  },

  unreadLabel: {
    color: "#E3D8FF",
    fontSize: 10,
    fontFamily: "PoppinsMedium",
  },

  folderScroll: {
    marginBottom: 17,
  },

  folderContainer: {
    gap: 8,
    paddingRight: 5,
  },

  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 11,
    gap: 6,
    borderWidth: 1,
    borderColor: "#ECECF2",
  },

  activeFolderButton: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },

  folderText: {
    fontSize: 11,
    color: "#667085",
    fontFamily: "PoppinsMedium",
  },

  activeFolderText: {
    color: "#FFFFFF",
  },

  searchContainer: {
    height: 47,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECECF2",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    color: "#20253A",
    fontSize: 12,
    fontFamily: "PoppinsRegular",
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 15,
    color: "#20253A",
    fontFamily: "PoppinsSemiBold",
  },

  messageCount: {
    color: "#9299A8",
    fontSize: 10,
    fontFamily: "PoppinsRegular",
  },

  messageList: {
    gap: 11,
  },

  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: "#ECECF2",
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#7040D5",
    backgroundColor: "#FCFAFF",
  },

  messageTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#7040D5",
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
  },

  messageMain: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  senderName: {
    color: "#34394C",
    fontSize: 11,
    fontFamily: "PoppinsMedium",
    flex: 1,
  },

  boldText: {
    fontFamily: "PoppinsSemiBold",
    color: "#20253A",
  },

  subject: {
    color: "#41465A",
    fontSize: 12,
    fontFamily: "PoppinsMedium",
    marginTop: 5,
  },

  preview: {
    color: "#9299A8",
    fontSize: 10,
    lineHeight: 16,
    fontFamily: "PoppinsRegular",
    marginTop: 4,
  },

  messageMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },

  categoryBadge: {
    backgroundColor: "#F0EBFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  categoryText: {
    color: "#7040D5",
    fontSize: 9,
    fontFamily: "PoppinsMedium",
  },

  priorityBadge: {
    backgroundColor: "#FFF2E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  priorityText: {
    color: "#C77B21",
    fontSize: 9,
    fontFamily: "PoppinsMedium",
  },

  messageDate: {
    alignItems: "flex-end",
    marginLeft: 6,
    maxWidth: 74,
  },

  dateText: {
    color: "#9299A8",
    fontSize: 8,
    fontFamily: "PoppinsMedium",
  },

  timeText: {
    color: "#A5AAB5",
    fontSize: 8,
    fontFamily: "PoppinsRegular",
    marginTop: 3,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7040D5",
    marginTop: 9,
  },

  centerState: {
    paddingVertical: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  stateText: {
    marginTop: 12,
    color: "#9299A8",
    fontSize: 12,
    fontFamily: "PoppinsRegular",
  },

  errorText: {
    color: "#DC5555",
    fontSize: 12,
    fontFamily: "PoppinsMedium",
    marginTop: 10,
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: "#7040D5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9,
    marginTop: 14,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "PoppinsSemiBold",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },

  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "#F0EBFF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: "#34394C",
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    marginTop: 15,
  },

  emptySubtitle: {
    color: "#9299A8",
    fontSize: 10,
    fontFamily: "PoppinsRegular",
    marginTop: 5,
  },

  /* MODALS */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 35, 0.48)",
    justifyContent: "flex-end",
  },

  detailsModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "90%",
    minHeight: "65%",
  },

  composeModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "94%",
    minHeight: "75%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitle: {
    color: "#20253A",
    fontSize: 17,
    fontFamily: "PoppinsSemiBold",
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#F4F4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  detailSubject: {
    color: "#20253A",
    fontSize: 19,
    lineHeight: 27,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 17,
  },

  detailSenderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  detailSender: {
    color: "#34394C",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },

  detailDate: {
    color: "#9299A8",
    fontSize: 9,
    fontFamily: "PoppinsRegular",
    marginTop: 4,
  },

  detailBadges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#ECECF2",
    marginVertical: 17,
  },

  detailBody: {
    color: "#4B5264",
    fontSize: 12,
    lineHeight: 23,
    fontFamily: "PoppinsRegular",
  },

  detailLabel: {
    color: "#34394C",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 12,
  },

  recipientDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 9,
  },

  recipientDetailText: {
    color: "#5F6676",
    fontSize: 11,
    fontFamily: "PoppinsRegular",
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  actionButton: {
    width: "48%",
    backgroundColor: "#F7F5FC",
    borderRadius: 10,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  actionButtonText: {
    color: "#5B4B83",
    fontSize: 9,
    fontFamily: "PoppinsMedium",
    flexShrink: 1,
  },

  replyInput: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: "#E6E5ED",
    borderRadius: 12,
    padding: 13,
    color: "#34394C",
    fontSize: 11,
    fontFamily: "PoppinsRegular",
  },

  sendButton: {
    height: 48,
    backgroundColor: "#7040D5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 15,
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
  },

  disabledButton: {
    opacity: 0.65,
  },

  /* COMPOSE */

  inputLabel: {
    color: "#34394C",
    fontSize: 11,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 8,
    marginTop: 15,
  },

  recipientSearch: {
    height: 43,
    borderWidth: 1,
    borderColor: "#E6E5ED",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  recipientSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    fontFamily: "PoppinsRegular",
    color: "#34394C",
  },

  selectedCount: {
    color: "#7040D5",
    fontSize: 9,
    fontFamily: "PoppinsMedium",
    marginTop: 8,
    marginBottom: 8,
  },

  contactList: {
    maxHeight: 215,
    borderWidth: 1,
    borderColor: "#ECECF2",
    borderRadius: 11,
    overflow: "hidden",
  },

  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F4",
    gap: 9,
  },

  selectedContact: {
    backgroundColor: "#F7F3FF",
  },

  contactAvatar: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  contactAvatarText: {
    color: "#7040D5",
    fontSize: 11,
    fontFamily: "PoppinsSemiBold",
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    color: "#34394C",
    fontSize: 10,
    fontFamily: "PoppinsSemiBold",
  },

  contactEmail: {
    color: "#9299A8",
    fontSize: 9,
    fontFamily: "PoppinsRegular",
    marginTop: 2,
  },

  contactRole: {
    color: "#7040D5",
    fontSize: 8,
    fontFamily: "PoppinsMedium",
    marginTop: 2,
  },

  noContacts: {
    color: "#9299A8",
    fontSize: 10,
    fontFamily: "PoppinsRegular",
    textAlign: "center",
    padding: 20,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E6E5ED",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#34394C",
    fontSize: 11,
    fontFamily: "PoppinsRegular",
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  selectionChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F3F7",
  },

  selectedChip: {
    backgroundColor: "#EEE7FF",
    borderWidth: 1,
    borderColor: "#7040D5",
  },

  selectionChipText: {
    color: "#667085",
    fontSize: 9,
    fontFamily: "PoppinsMedium",
  },

  selectedChipText: {
    color: "#7040D5",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },

  priorityOption: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: "#E6E5ED",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  selectedPriorityOption: {
    borderColor: "#7040D5",
    backgroundColor: "#F7F3FF",
  },

  priorityOptionText: {
    color: "#667085",
    fontSize: 10,
    fontFamily: "PoppinsMedium",
  },

  messageInput: {
    minHeight: 135,
    borderWidth: 1,
    borderColor: "#E6E5ED",
    borderRadius: 11,
    padding: 12,
    color: "#34394C",
    fontSize: 11,
    fontFamily: "PoppinsRegular",
  },

  characterCount: {
    textAlign: "right",
    color: "#A0A6B2",
    fontSize: 9,
    fontFamily: "PoppinsRegular",
    marginTop: 5,
  },
});