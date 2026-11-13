import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getMessages,
  MessageFolder,
  updateMessageStatus,
} from '../../../services/messages';

type StudentMessagesPageProps = {
  onContentScroll?: (event: any) => void;
  onNavigateToPTG?: () => void;
};

type FormattedMessage = {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  category: string;
  priority: string;
  isRead: boolean;
  isImportant: boolean;
  createdAt: string;
  formattedDate: string;
  isPTG: boolean;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Recently';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default function StudentMessagesPage({
  onContentScroll,
  onNavigateToPTG,
}: StudentMessagesPageProps) {
  const [messages, setMessages] = useState<FormattedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFolder, setActiveFolder] = useState<MessageFolder>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<FormattedMessage | null>(null);

  const loadMessages = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await getMessages(activeFolder);
      const rawList: any[] = Array.isArray(res?.data) ? res.data : [];

      const parsed: FormattedMessage[] = rawList.map((m: any) => {
        const sender = m.sender || {};
        const senderName = sender.fullName || sender.name || 'Administration';
        const senderEmail = sender.email || '';
        const isPTG =
          (m.subject || '').toLowerCase().includes('ptg') ||
          (m.body || '').toLowerCase().includes('ptg') ||
          (m.body || '').toLowerCase().includes('parent-teacher');

        return {
          id: String(m._id || m.id),
          senderName,
          senderEmail,
          subject: m.subject || 'No Subject',
          body: m.body || '',
          category: m.category || 'General',
          priority: m.priority || 'Normal',
          isRead: Boolean(m.isRead),
          isImportant: Boolean(m.isImportant),
          createdAt: m.createdAt || '',
          formattedDate: formatDate(m.createdAt),
          isPTG,
        };
      });

      setMessages(parsed);
    } catch (err: any) {
      console.log('Error fetching student messages:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFolder]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const onRefresh = useCallback(() => {
    void loadMessages(true);
  }, [loadMessages]);

  const handleOpenMessage = async (msg: FormattedMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await updateMessageStatus(msg.id, 'read');
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
      } catch (e) {
        // ignore status update error
      }
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const subMatch = m.subject.toLowerCase().includes(q);
        const bodyMatch = m.body.toLowerCase().includes(q);
        const senderMatch = m.senderName.toLowerCase().includes(q);
        return subMatch || bodyMatch || senderMatch;
      }
      return true;
    });
  }, [messages, searchQuery]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6630D7']}
            tintColor="#6630D7"
          />
        }
      >
        {/* HERO BANNER */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <Ionicons name="mail-outline" size={26} color="#6630D7" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Student Messages</Text>
            <Text style={styles.heroSubtitle}>
              Official communications, PTG schedules, and updates from your teachers.
            </Text>
          </View>
        </View>

        {/* FOLDER TABS */}
        <View style={styles.folderRow}>
          {(
            [
              { label: 'Inbox', value: 'inbox', icon: 'mail-outline' },
              { label: 'Unread', value: 'unread', icon: 'mail-unread-outline' },
              { label: 'Important', value: 'important', icon: 'star-outline' },
            ] as const
          ).map((tab) => {
            const isSelected = activeFolder === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[
                  styles.folderTab,
                  isSelected && styles.folderTabActive,
                ]}
                onPress={() => setActiveFolder(tab.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={15}
                  color={isSelected ? '#6630D7' : '#64748B'}
                />
                <Text
                  style={[
                    styles.folderTabText,
                    isSelected && styles.folderTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* MESSAGES LIST / EMPTY / LOADING */}
        {loading && messages.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#6630D7" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : filteredMessages.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="file-tray-outline" size={38} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Messages</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'No messages matching your search query.'
                : activeFolder === 'unread'
                ? 'You have caught up with all your messages!'
                : 'No messages in this folder yet.'}
            </Text>
          </View>
        ) : (
          <View style={styles.messagesList}>
            {filteredMessages.map((msg) => (
              <TouchableOpacity
                key={msg.id}
                style={[
                  styles.messageCard,
                  !msg.isRead && styles.messageCardUnread,
                ]}
                onPress={() => handleOpenMessage(msg)}
                activeOpacity={0.85}
              >
                {/* CARD HEADER */}
                <View style={styles.cardHeader}>
                  <View style={styles.senderWrap}>
                    <View
                      style={[
                        styles.senderAvatar,
                        msg.isPTG && styles.senderAvatarPTG,
                      ]}
                    >
                      <Ionicons
                        name={msg.isPTG ? 'calendar' : 'person'}
                        size={14}
                        color={msg.isPTG ? '#0284C7' : '#6630D7'}
                      />
                    </View>
                    <View>
                      <Text style={styles.senderName}>{msg.senderName}</Text>
                      <Text style={styles.messageDate}>{msg.formattedDate}</Text>
                    </View>
                  </View>

                  <View style={styles.headerBadges}>
                    {msg.isPTG && (
                      <View style={styles.ptgBadge}>
                        <Text style={styles.ptgBadgeText}>PTG Meeting</Text>
                      </View>
                    )}
                    {!msg.isRead && <View style={styles.unreadDot} />}
                  </View>
                </View>

                {/* SUBJECT */}
                <Text style={styles.subjectText} numberOfLines={1}>
                  {msg.subject}
                </Text>

                {/* BODY PREVIEW */}
                <Text style={styles.bodyPreview} numberOfLines={2}>
                  {msg.body}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* MESSAGE DETAILS MODAL */}
      <Modal
        visible={Boolean(selectedMessage)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedMessage?.subject}
                </Text>
                <Text style={styles.modalSender}>
                  From: {selectedMessage?.senderName}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedMessage(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedMessage && (
              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalMetaRow}>
                  <View style={styles.metaBadge}>
                    <Ionicons name="calendar-outline" size={13} color="#6630D7" />
                    <Text style={styles.metaBadgeText}>
                      {selectedMessage.formattedDate}
                    </Text>
                  </View>

                  {selectedMessage.isPTG && (
                    <View style={styles.ptgHighlightBadge}>
                      <Ionicons name="calendar" size={13} color="#0284C7" />
                      <Text style={styles.ptgHighlightText}>PTG Schedule</Text>
                    </View>
                  )}
                </View>

                {/* MESSAGE BODY */}
                <View style={styles.bodyBox}>
                  <Text style={styles.bodyFullText}>{selectedMessage.body}</Text>
                </View>

                {/* IF PTG MEETING, DIRECT BUTTON TO PTG PAGE */}
                {selectedMessage.isPTG && onNavigateToPTG && (
                  <TouchableOpacity
                    style={styles.viewPTGBtn}
                    onPress={() => {
                      setSelectedMessage(null);
                      onNavigateToPTG();
                    }}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name="account-group"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.viewPTGBtnText}>
                      View Official PTG Schedule
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalCloseDoneBtn}
              onPress={() => setSelectedMessage(null)}
            >
              <Text style={styles.modalCloseDoneText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6FB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // HERO
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEBF8',
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#1E1B4B',
  },
  heroSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // FOLDERS
  folderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  folderTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  folderTabActive: {
    backgroundColor: '#F4F0FF',
    borderColor: '#6630D7',
  },
  folderTabText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#64748B',
  },
  folderTabTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },

  // SEARCH
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 12.5,
    color: '#1E1B4B',
  },

  // LIST & CARDS
  messagesList: {
    gap: 10,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    elevation: 1,
  },
  messageCardUnread: {
    borderColor: '#DDD6FE',
    backgroundColor: '#FAF9FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderAvatarPTG: {
    backgroundColor: '#E0F2FE',
  },
  senderName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    color: '#1E1B4B',
  },
  messageDate: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#94A3B8',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ptgBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ptgBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#0284C7',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6630D7',
  },
  subjectText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#1E1B4B',
    marginBottom: 4,
  },
  bodyPreview: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // EMPTY / LOADING
  centerBox: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEBF8',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#1E1B4B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#1E1B4B',
  },
  modalSender: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingVertical: 14,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F4F0FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaBadgeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#6630D7',
  },
  ptgHighlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ptgHighlightText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#0284C7',
  },
  bodyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  bodyFullText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#1E1B4B',
    lineHeight: 20,
  },
  viewPTGBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  viewPTGBtnText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  modalCloseDoneBtn: {
    backgroundColor: '#6630D7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseDoneText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
