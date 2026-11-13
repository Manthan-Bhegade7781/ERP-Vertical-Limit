import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  fetchStudentPTGMeetings,
  PTGStatus,
  StudentPTGMeeting,
} from '../../../services/ptg';

type PTGPageProps = {
  onContentScroll?: (event: any) => void;
  onNavigateToMessages?: () => void;
};

const STATUS_FILTERS: { label: string; value: 'All' | PTGStatus }[] = [
  { label: 'All', value: 'All' },
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending', value: 'Pending' },
];

const statusStyles: Record<
  PTGStatus,
  { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap; border: string }
> = {
  Scheduled: {
    bg: '#EEF2FF',
    text: '#4F46E5',
    border: '#C7D2FE',
    icon: 'calendar-outline',
  },
  Completed: {
    bg: '#ECFDF5',
    text: '#059669',
    border: '#A7F3D0',
    icon: 'checkmark-circle-outline',
  },
  Pending: {
    bg: '#FFFBEB',
    text: '#D97706',
    border: '#FDE68A',
    icon: 'time-outline',
  },
};

export default function PTGPage({
  onContentScroll,
  onNavigateToMessages,
}: PTGPageProps) {
  const [meetings, setMeetings] = useState<StudentPTGMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'All' | PTGStatus>('All');
  const [selectedMeeting, setSelectedMeeting] = useState<StudentPTGMeeting | null>(null);

  const loadMeetings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchStudentPTGMeetings();
      setMeetings(data);
    } catch (err: any) {
      console.log('Error fetching PTG meetings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const onRefresh = useCallback(() => {
    void loadMeetings(true);
  }, [loadMeetings]);

  const filteredMeetings = useMemo(() => {
    if (selectedStatus === 'All') return meetings;
    return meetings.filter((m) => m.status === selectedStatus);
  }, [meetings, selectedStatus]);

  const stats = useMemo(() => {
    const total = meetings.length;
    const scheduled = meetings.filter((m) => m.status === 'Scheduled').length;
    const completed = meetings.filter((m) => m.status === 'Completed').length;
    return { total, scheduled, completed };
  }, [meetings]);

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
            <MaterialCommunityIcons
              name="account-group"
              size={28}
              color="#6630D7"
            />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Parent-Teacher Gathering (PTG)</Text>
            <Text style={styles.heroSubtitle}>
              Official progress meetings scheduled with your faculty mentor and parents.
            </Text>
          </View>
        </View>

        {/* MESSAGE INBOX SHORTCUT BANNER */}
        {onNavigateToMessages && (
          <TouchableOpacity
            style={styles.messagesBanner}
            onPress={onNavigateToMessages}
            activeOpacity={0.85}
          >
            <View style={styles.messagesBannerLeft}>
              <View style={styles.messagesBannerIcon}>
                <Ionicons name="mail-unread-outline" size={18} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.messagesBannerTitle}>PTG Schedule in Messages</Text>
                <Text style={styles.messagesBannerSub}>
                  View official notifications and PTG invitation letters in your inbox
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#0284C7" />
          </TouchableOpacity>
        )}

        {/* STATS OVERVIEW */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total PTGs</Text>
          </View>

          <View style={[styles.statCard, styles.statCardScheduled]}>
            <Text style={[styles.statValue, styles.statValueScheduled]}>
              {stats.scheduled}
            </Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>

          <View style={[styles.statCard, styles.statCardCompleted]}>
            <Text style={[styles.statValue, styles.statValueCompleted]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* STATUS FILTER CHIPS */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => {
            const isSelected = selectedStatus === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setSelectedStatus(f.value)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LIST / LOADING / EMPTY */}
        {loading && meetings.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#6630D7" />
            <Text style={styles.loadingText}>Loading your PTG schedule...</Text>
          </View>
        ) : filteredMeetings.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={40}
                color="#94A3B8"
              />
            </View>
            <Text style={styles.emptyTitle}>No PTG Meetings Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedStatus === 'All'
                ? 'No Parent-Teacher Gathering meetings have been scheduled for you yet.'
                : `No meetings currently under '${selectedStatus}' status.`}
            </Text>
          </View>
        ) : (
          <View style={styles.meetingsList}>
            {filteredMeetings.map((item) => {
              const statusConfig = statusStyles[item.status] || statusStyles.Scheduled;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.meetingCard}
                  onPress={() => setSelectedMeeting(item)}
                  activeOpacity={0.85}
                >
                  {/* CARD HEADER */}
                  <View style={styles.cardHeader}>
                    <View style={styles.dateTimeBadge}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#6630D7"
                      />
                      <Text style={styles.dateTimeText}>
                        {item.formattedDate} • {item.formattedTime}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusConfig.bg,
                          borderColor: statusConfig.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={statusConfig.icon}
                        size={12}
                        color={statusConfig.text}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: statusConfig.text },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* PURPOSE */}
                  <Text style={styles.purposeText} numberOfLines={2}>
                    {item.purpose}
                  </Text>

                  {/* TEACHER INFO BOX */}
                  <View style={styles.teacherBox}>
                    <View style={styles.teacherAvatar}>
                      <Ionicons name="person" size={16} color="#6630D7" />
                    </View>
                    <View style={styles.teacherInfo}>
                      <Text style={styles.teacherName}>{item.teacherName}</Text>
                      <Text style={styles.teacherSpec}>
                        {item.teacherSpecialization || 'Academic Faculty'}
                      </Text>
                    </View>
                  </View>

                  {/* GUARDIAN & NOTES PREVIEW */}
                  <View style={styles.cardFooter}>
                    <View style={styles.guardianRow}>
                      <Ionicons
                        name="people-outline"
                        size={13}
                        color="#64748B"
                      />
                      <Text style={styles.guardianText}>
                        Parent: <Text style={styles.boldText}>{item.guardianName}</Text>
                      </Text>
                    </View>

                    <View style={styles.viewDetailsRow}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={13}
                        color="#6630D7"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal
        visible={Boolean(selectedMeeting)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMeeting(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconBox}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={22}
                    color="#6630D7"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>PTG Meeting Details</Text>
                  <Text style={styles.modalSubTitle}>
                    Parent-Teacher Gathering Information
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedMeeting(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedMeeting && (
              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* DATE & STATUS BLOCK */}
                <View style={styles.modalMetaCard}>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar" size={18} color="#6630D7" />
                    <View style={styles.metaTextCol}>
                      <Text style={styles.metaLabel}>Date & Time</Text>
                      <Text style={styles.metaValue}>
                        {selectedMeeting.formattedDate} at {selectedMeeting.formattedTime}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalDivider} />

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color="#6630D7"
                    />
                    <View style={styles.metaTextCol}>
                      <Text style={styles.metaLabel}>Status</Text>
                      <Text style={styles.metaValue}>{selectedMeeting.status}</Text>
                    </View>
                  </View>
                </View>

                {/* PURPOSE */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Discussion Purpose</Text>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxText}>
                      {selectedMeeting.purpose}
                    </Text>
                  </View>
                </View>

                {/* TEACHER DETAILS */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Faculty / Mentor</Text>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailPrimaryText}>
                      {selectedMeeting.teacherName}
                    </Text>
                    <Text style={styles.detailSecondaryText}>
                      Subject: {selectedMeeting.teacherSpecialization}
                    </Text>
                    {selectedMeeting.teacherEmail ? (
                      <Text style={styles.detailSecondaryText}>
                        Email: {selectedMeeting.teacherEmail}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* STUDENT & GUARDIAN */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Student & Parent Info</Text>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailPrimaryText}>
                      Student: {selectedMeeting.studentName}
                    </Text>
                    {selectedMeeting.standard || selectedMeeting.batchName ? (
                      <Text style={styles.detailSecondaryText}>
                        Class: {selectedMeeting.standard} • {selectedMeeting.batchName}
                      </Text>
                    ) : null}
                    <Text style={styles.detailSecondaryText}>
                      Guardian: {selectedMeeting.guardianName}
                      {selectedMeeting.guardianMobile
                        ? ` (${selectedMeeting.guardianMobile})`
                        : ''}
                    </Text>
                  </View>
                </View>

                {/* REMARKS / NOTES */}
                {selectedMeeting.notes ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Teacher Remarks</Text>
                    <View style={[styles.detailBox, styles.notesBox]}>
                      <Text style={styles.notesText}>{selectedMeeting.notes}</Text>
                    </View>
                  </View>
                ) : null}

                <View style={styles.modalNotice}>
                  <Ionicons name="information-circle-outline" size={16} color="#6630D7" />
                  <Text style={styles.modalNoticeText}>
                    Please ensure that at least one parent or guardian is present during the scheduled PTG session.
                  </Text>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setSelectedMeeting(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDoneBtnText}>Close</Text>
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  heroIconBox: {
    width: 48,
    height: 48,
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
    fontSize: 15.5,
    color: '#1E1B4B',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // MESSAGES BANNER
  messagesBanner: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  messagesBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 8,
  },
  messagesBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesBannerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    color: '#0369A1',
  },
  messagesBannerSub: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#0284C7',
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEBF8',
    elevation: 1,
  },
  statCardScheduled: {
    borderColor: '#E0E7FF',
    backgroundColor: '#F8FAFF',
  },
  statCardCompleted: {
    borderColor: '#DCFCE7',
    backgroundColor: '#F7FEFA',
  },
  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#1E1B4B',
  },
  statValueScheduled: {
    color: '#4F46E5',
  },
  statValueCompleted: {
    color: '#059669',
  },
  statLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // FILTER ROW
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#6630D7',
    borderColor: '#6630D7',
  },
  filterChipText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
  },

  // LIST & CARDS
  meetingsList: {
    gap: 12,
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F0FF',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  dateTimeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
    color: '#6630D7',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
  },
  purposeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#1E1B4B',
    lineHeight: 20,
    marginBottom: 12,
  },
  teacherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  teacherAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    color: '#1E1B4B',
  },
  teacherSpec: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  guardianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  guardianText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#64748B',
  },
  boldText: {
    fontFamily: 'PoppinsMedium',
    color: '#334155',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDetailsText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
    color: '#6630D7',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#1E1B4B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
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
    maxHeight: '82%',
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
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#1E1B4B',
  },
  modalSubTitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#64748B',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingVertical: 14,
  },
  modalMetaCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaTextCol: {
    flex: 1,
  },
  metaLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#64748B',
  },
  metaValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#1E1B4B',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  detailSection: {
    marginBottom: 14,
  },
  detailSectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    color: '#475569',
    marginBottom: 6,
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailBoxText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#1E1B4B',
    lineHeight: 19,
  },
  detailPrimaryText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#1E1B4B',
    marginBottom: 2,
  },
  detailSecondaryText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#64748B',
  },
  notesBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  notesText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12.5,
    color: '#92400E',
    lineHeight: 18,
  },
  modalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F4F0FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  modalNoticeText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#6630D7',
    lineHeight: 16,
  },
  modalDoneBtn: {
    backgroundColor: '#6630D7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalDoneBtnText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
