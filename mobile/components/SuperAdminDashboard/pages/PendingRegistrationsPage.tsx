import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type RegistrationRole = 'teacher' | 'student';
type RegistrationStatus = 'pending' | 'active' | 'rejected' | 'inactive';

type Registration = {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  roles: string[];
  branchId?: string | { _id: string; name?: string; code?: string } | null;
  status: RegistrationStatus;
  registrationRole: RegistrationRole;
  rejectionReason?: string | null;
  createdAt?: string;
};

const PURPLE = '#7040D5';
const PURPLE_LIGHT = '#F1EAFF';
const TEXT = '#20283A';
const MUTED = '#7B8799';
const BORDER = '#E8EBF2';
const PAGE = '#F6F7FB';
const GREEN = '#209A68';
const RED = '#D64555';

const getBranchName = (branch: Registration['branchId']) => {
  if (branch && typeof branch === 'object') return branch.name || 'Branch assigned';
  return branch ? 'Branch assigned' : 'No branch assigned';
};

const formatDate = (value?: string) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function PendingRegistrationsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const contentWidth = isWide ? Math.min(width - 250 - 40, 1500) : width - 32;

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | RegistrationRole>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadRegistrations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setLoadError('');

    try {
      const token = await getToken();
      if (!token) {
        setLoadError('Your session could not be found. Please sign in again.');
        setRegistrations([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/registrations`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Unable to load registrations (${response.status}).`);
      }

      const list = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.users)
          ? result.data.users
          : Array.isArray(result.registrations)
            ? result.registrations
            : [];
      setRegistrations(list.filter((item: Registration) => item.status === 'pending'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while loading registrations.';
      setLoadError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRegistrations();
    }, [loadRegistrations]),
  );

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return registrations.filter((item) => {
      const matchesRole = selectedFilter === 'all' || item.registrationRole === selectedFilter;
      const matchesSearch = !query ||
        item.fullName?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.mobileNumber?.toLowerCase().includes(query) ||
        getBranchName(item.branchId).toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [registrations, search, selectedFilter]);

  const teacherCount = registrations.filter((item) => item.registrationRole === 'teacher').length;
  const studentCount = registrations.filter((item) => item.registrationRole === 'student').length;

  const performApproval = async (registration: Registration) => {
    setActionLoading(true);
    setActionId(registration._id);
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session could not be found. Please sign in again.');
      const response = await fetch(`${API_BASE_URL}/admin/registrations/${registration._id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to approve this registration.');
      }
      setRegistrations((current) => current.filter((item) => item._id !== registration._id));
      setDetailsVisible(false);
      setSelectedRegistration(null);
      Alert.alert('Registration approved', `${registration.fullName} has been approved successfully.`);
    } catch (error) {
      Alert.alert('Approval failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  };

  const confirmApproval = (registration: Registration) => {
    Alert.alert(
      'Approve registration?',
      `Approve ${registration.fullName} as a ${registration.registrationRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => { void performApproval(registration); } },
      ],
    );
  };

  const openRejectDialog = (registration: Registration) => {
    setSelectedRegistration(registration);
    setDetailsVisible(false);
    setRejectionReason('');
    setRejectVisible(true);
  };

  const performRejection = async () => {
    if (!selectedRegistration) return;
    const reason = rejectionReason.trim();
    if (!reason) {
      Alert.alert('Reason required', 'Please enter a reason for rejecting this registration.');
      return;
    }

    setActionLoading(true);
    setActionId(selectedRegistration._id);
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session could not be found. Please sign in again.');
      const response = await fetch(`${API_BASE_URL}/admin/registrations/${selectedRegistration._id}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to reject this registration.');
      }
      const rejectedName = selectedRegistration.fullName;
      setRegistrations((current) => current.filter((item) => item._id !== selectedRegistration._id));
      setRejectVisible(false);
      setDetailsVisible(false);
      setSelectedRegistration(null);
      setRejectionReason('');
      Alert.alert('Registration rejected', `${rejectedName}'s registration has been rejected.`);
    } catch (error) {
      Alert.alert('Rejection failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  };

  const openDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setDetailsVisible(true);
  };

  const renderRegistrationCard = (item: Registration) => {
    const isTeacher = item.registrationRole === 'teacher';
    const isWorking = actionId === item._id && actionLoading;
    return (
      <View key={item._id} style={[styles.registrationCard, isWide && styles.registrationCardWide]}>
        <View style={styles.cardTopRow}>
          <View style={[styles.avatar, isTeacher ? styles.teacherAvatar : styles.studentAvatar]}>
            <MaterialCommunityIcons
              name={isTeacher ? 'account-tie-outline' : 'school-outline'}
              size={25}
              color={isTeacher ? '#7040D5' : '#2675E8'}
            />
          </View>
          <View style={styles.nameColumn}>
            <Text style={styles.personName} numberOfLines={1}>{item.fullName}</Text>
            <Text style={styles.emailText} numberOfLines={1}>{item.email}</Text>
          </View>
          <View style={[styles.roleBadge, isTeacher ? styles.teacherBadge : styles.studentBadge]}>
            <Text style={[styles.roleBadgeText, { color: isTeacher ? PURPLE : '#2675E8' }]}>
              {isTeacher ? 'Teacher' : 'Student'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="office-building-outline" size={17} color={MUTED} />
          <Text style={styles.infoText} numberOfLines={1}>{getBranchName(item.branchId)}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone-outline" size={17} color={MUTED} />
          <Text style={styles.infoText}>{item.mobileNumber || 'Mobile number not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar-clock-outline" size={17} color={MUTED} />
          <Text style={styles.infoText}>Requested on {formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.detailsButton} onPress={() => openDetails(item)} activeOpacity={0.8}>
            <MaterialCommunityIcons name="eye-outline" size={17} color={PURPLE} />
            <Text style={styles.detailsButtonText}>View details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectButton, isWorking && styles.disabledButton]}
            onPress={() => openRejectDialog(item)}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close-circle-outline" size={17} color={RED} />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.approveButton, isWorking && styles.disabledButton]}
            onPress={() => confirmApproval(item)}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            {isWorking ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="check-circle-outline" size={17} color="#FFFFFF" />}
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8} accessibilityLabel="Go back">
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>Pending Registrations</Text>
            <Text style={styles.headerSubtitle}>Review teacher and student requests</Text>
          </View>
          <TouchableOpacity style={styles.headerAction} onPress={() => loadRegistrations(true)} activeOpacity={0.85} disabled={loading || refreshing} accessibilityLabel="Refresh registrations">
            {refreshing ? <ActivityIndicator size="small" color={PURPLE} /> : <MaterialCommunityIcons name="refresh" size={21} color={PURPLE} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRegistrations(true)} tintColor={PURPLE} colors={[PURPLE]} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <Text style={styles.pageTitle}>Registration Requests</Text>
              <Text style={styles.pageSubtitle}>Review and manage new teacher and student registrations.</Text>
            </View>
          </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F1EAFF' }]}><MaterialCommunityIcons name="account-clock-outline" size={22} color={PURPLE} /></View>
            <View style={styles.statTextWrap}><Text style={styles.statLabel}>Pending requests</Text><Text style={styles.statValue}>{registrations.length}</Text></View>
            <View style={styles.statAccentPurple} />
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F1EAFF' }]}><MaterialCommunityIcons name="account-tie-outline" size={22} color={PURPLE} /></View>
            <View style={styles.statTextWrap}><Text style={styles.statLabel}>Teacher requests</Text><Text style={styles.statValue}>{teacherCount}</Text></View>
            <View style={styles.statAccentPurple} />
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EAF2FF' }]}><MaterialCommunityIcons name="school-outline" size={22} color="#2675E8" /></View>
            <View style={styles.statTextWrap}><Text style={styles.statLabel}>Student requests</Text><Text style={styles.statValue}>{studentCount}</Text></View>
            <View style={styles.statAccentBlue} />
          </View>
        </View>

        <View style={styles.toolbarCard}>
          <View style={styles.toolbarTop}>
            <View>
              <Text style={styles.sectionTitle}>Registration requests</Text>
              <Text style={styles.sectionSubtitle}>{filteredRegistrations.length} request{filteredRegistrations.length === 1 ? '' : 's'} to review</Text>
            </View>
            <View style={styles.pendingPill}><View style={styles.pendingDot} /><Text style={styles.pendingPillText}>Awaiting review</Text></View>
          </View>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9AA4B5" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name, email, mobile or branch..."
              placeholderTextColor="#A0A8B7"
              style={styles.searchInput}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {!!search && <TouchableOpacity onPress={() => setSearch('')}><MaterialCommunityIcons name="close-circle" size={18} color="#A0A8B7" /></TouchableOpacity>}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {([
              { key: 'all', label: 'All requests', icon: 'view-grid-outline' },
              { key: 'teacher', label: 'Teachers', icon: 'account-tie-outline' },
              { key: 'student', label: 'Students', icon: 'school-outline' },
            ] as const).map((filter) => {
              const selected = selectedFilter === filter.key;
              return (
                <TouchableOpacity key={filter.key} onPress={() => setSelectedFilter(filter.key)} style={[styles.filterChip, selected && styles.filterChipSelected]} activeOpacity={0.8}>
                  <MaterialCommunityIcons name={filter.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={16} color={selected ? '#FFFFFF' : MUTED} />
                  <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{filter.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.stateCard}><ActivityIndicator size="large" color={PURPLE} /><Text style={styles.stateTitle}>Loading registrations</Text><Text style={styles.stateDescription}>Please wait while we fetch new requests.</Text></View>
        ) : loadError ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIconError}><MaterialCommunityIcons name="alert-circle-outline" size={28} color={RED} /></View>
            <Text style={styles.stateTitle}>Could not load requests</Text>
            <Text style={styles.stateDescription}>{loadError}</Text>
            <TouchableOpacity style={styles.stateRetryButton} onPress={() => loadRegistrations()}><MaterialCommunityIcons name="refresh" size={17} color="#FFFFFF" /><Text style={styles.stateRetryText}>Try again</Text></TouchableOpacity>
          </View>
        ) : filteredRegistrations.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIconSuccess}><MaterialCommunityIcons name={registrations.length === 0 ? 'check-decagram-outline' : 'account-search-outline'} size={30} color={registrations.length === 0 ? GREEN : PURPLE} /></View>
            <Text style={styles.stateTitle}>{registrations.length === 0 ? 'You are all caught up!' : 'No matching requests'}</Text>
            <Text style={styles.stateDescription}>{registrations.length === 0 ? 'There are no pending teacher or student registrations right now.' : 'Try another search term or select a different filter.'}</Text>
            {(search || selectedFilter !== 'all') && <TouchableOpacity style={styles.clearFilterButton} onPress={() => { setSearch(''); setSelectedFilter('all'); }}><Text style={styles.clearFilterText}>Clear filters</Text></TouchableOpacity>}
          </View>
        ) : (
          <View style={[styles.cardsGrid, isWide && styles.cardsGridWide]}>
            {filteredRegistrations.map(renderRegistrationCard)}
          </View>
        )}
        </View>
      </ScrollView>

      {/* Registration details modal */}
      <Modal visible={detailsVisible} transparent animationType="fade" onRequestClose={() => setDetailsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isWide && styles.modalCardWide]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalHeaderIcon}><MaterialCommunityIcons name="account-details-outline" size={21} color={PURPLE} /></View>
                <View style={styles.modalTitleColumn}><Text style={styles.modalTitle}>Registration details</Text><Text style={styles.modalSubtitle}>Review the applicant's information</Text></View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setDetailsVisible(false)}><MaterialCommunityIcons name="close" size={21} color={MUTED} /></TouchableOpacity>
            </View>
            {selectedRegistration && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailProfile}>
                  <View style={[styles.avatar, selectedRegistration.registrationRole === 'teacher' ? styles.teacherAvatar : styles.studentAvatar, styles.detailAvatar]}>
                    <MaterialCommunityIcons name={selectedRegistration.registrationRole === 'teacher' ? 'account-tie-outline' : 'school-outline'} size={30} color={selectedRegistration.registrationRole === 'teacher' ? PURPLE : '#2675E8'} />
                  </View>
                  <Text style={styles.detailName}>{selectedRegistration.fullName}</Text>
                  <Text style={styles.detailEmail}>{selectedRegistration.email}</Text>
                  <View style={[styles.roleBadge, selectedRegistration.registrationRole === 'teacher' ? styles.teacherBadge : styles.studentBadge]}><Text style={[styles.roleBadgeText, { color: selectedRegistration.registrationRole === 'teacher' ? PURPLE : '#2675E8' }]}>{selectedRegistration.registrationRole === 'teacher' ? 'Teacher applicant' : 'Student applicant'}</Text></View>
                </View>
                <View style={styles.detailRows}>
                  <DetailRow icon="email-outline" label="Email address" value={selectedRegistration.email} />
                  <DetailRow icon="phone-outline" label="Mobile number" value={selectedRegistration.mobileNumber || 'Not provided'} />
                  <DetailRow icon="office-building-outline" label="Branch" value={getBranchName(selectedRegistration.branchId)} />
                  <DetailRow icon="calendar-outline" label="Registration date" value={formatDate(selectedRegistration.createdAt)} />
                  <DetailRow icon="shield-account-outline" label="Account status" value="Pending approval" />
                </View>
                <Text style={styles.detailHint}>Approving will activate this user account. Rejecting requires a reason.</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.rejectButtonLarge} onPress={() => openRejectDialog(selectedRegistration)}><MaterialCommunityIcons name="close-circle-outline" size={18} color={RED} /><Text style={styles.rejectButtonText}>Reject request</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.approveButtonLarge} onPress={() => confirmApproval(selectedRegistration)}><MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" /><Text style={styles.approveButtonText}>Approve</Text></TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Rejection reason modal */}
      <Modal visible={rejectVisible} transparent animationType="fade" onRequestClose={() => { if (!actionLoading) setRejectVisible(false); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModalCard}>
            <View style={styles.rejectModalIcon}><MaterialCommunityIcons name="alert-octagon-outline" size={26} color={RED} /></View>
            <Text style={styles.rejectModalTitle}>Reject registration</Text>
            <Text style={styles.rejectModalDescription}>Please provide a reason for rejecting {selectedRegistration?.fullName || 'this applicant'}. This reason will be saved with the registration.</Text>
            <Text style={styles.inputLabel}>Reason for rejection <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter a clear reason..."
              placeholderTextColor="#A0A8B7"
              multiline
              textAlignVertical="top"
              editable={!actionLoading}
              style={styles.reasonInput}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{rejectionReason.length}/500</Text>
            <View style={styles.rejectModalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setRejectVisible(false)} disabled={actionLoading}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.confirmRejectButton, (actionLoading || !rejectionReason.trim()) && styles.disabledButton]} onPress={() => void performRejection()} disabled={actionLoading || !rejectionReason.trim()}>
                {actionLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="close-circle-outline" size={17} color="#FFFFFF" />}
                <Text style={styles.confirmRejectText}>Confirm rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailRowIcon}><MaterialCommunityIcons name={icon} size={18} color={PURPLE} /></View>
      <View style={styles.detailRowText}><Text style={styles.detailRowLabel}>{label}</Text><Text style={styles.detailRowValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { backgroundColor: '#7040D5', paddingHorizontal: 16, paddingBottom: 15 },
  headerInner: { width: '100%', maxWidth: 1500, alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  headerTitleArea: { flex: 1, minWidth: 0, marginLeft: 12, marginRight: 8 },
  headerTitle: { fontFamily: 'PoppinsSemiBold', fontSize: 18, color: '#FFFFFF', flexShrink: 1 },
  headerSubtitle: { fontFamily: 'PoppinsRegular', fontSize: 10, color: 'rgba(255,255,255,0.78)', marginTop: 1 },
  headerAction: { width: 42, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  scroll: { flex: 1 },
  scrollContent: { alignItems: 'center' },
  content: { paddingTop: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  sectionTitleArea: { flex: 1 },
  pageTitle: { fontFamily: 'PoppinsBold', fontSize: 22, color: '#172033' },
  pageSubtitle: { fontFamily: 'PoppinsRegular', fontSize: 11, color: '#7B8799', marginTop: 2 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  statCard: { flex: 1, minWidth: 155, backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: BORDER, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 11, overflow: 'hidden' },
  statIcon: { width: 43, height: 43, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statTextWrap: { flex: 1 },
  statLabel: { fontFamily: 'PoppinsRegular', color: MUTED, fontSize: 11, marginBottom: 4 },
  statValue: { fontFamily: 'PoppinsBold', color: TEXT, fontSize: 23 },
  statAccentPurple: { position: 'absolute', top: 0, right: 0, width: 4, height: '100%', backgroundColor: PURPLE },
  statAccentBlue: { position: 'absolute', top: 0, right: 0, width: 4, height: '100%', backgroundColor: '#2675E8' },
  toolbarCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 16 },
  toolbarTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  sectionTitle: { fontFamily: 'PoppinsSemiBold', color: TEXT, fontSize: 16 },
  sectionSubtitle: { fontFamily: 'PoppinsRegular', color: MUTED, fontSize: 11, marginTop: 4 },
  pendingPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF4E5', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  pendingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E99A2D' },
  pendingPillText: { color: '#A66B13', fontSize: 11, fontWeight: '700' },
  searchBox: { minHeight: 46, borderRadius: 11, borderWidth: 1, borderColor: BORDER, backgroundColor: '#FBFCFE', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 9 },
  searchInput: { flex: 1, fontFamily: 'PoppinsRegular', color: TEXT, fontSize: 12, paddingVertical: 10 },
  filterRow: { flexDirection: 'row', gap: 8, paddingTop: 13, paddingBottom: 1 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#F5F6FA', borderWidth: 1, borderColor: '#F0F1F5' },
  filterChipSelected: { backgroundColor: PURPLE, borderColor: PURPLE },
  filterChipText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  filterChipTextSelected: { color: '#FFFFFF' },
  cardsGrid: { gap: 13 },
  cardsGridWide: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' },
  registrationCard: { width: '100%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 16, marginBottom: 1 },
  registrationCardWide: { width: '48.5%' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  teacherAvatar: { backgroundColor: '#F1EAFF' },
  studentAvatar: { backgroundColor: '#EAF2FF' },
  nameColumn: { flex: 1, minWidth: 0 },
  personName: { fontFamily: 'PoppinsSemiBold', color: TEXT, fontSize: 14 },
  emailText: { fontFamily: 'PoppinsRegular', color: MUTED, fontSize: 11, marginTop: 4 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6, alignSelf: 'flex-start' },
  teacherBadge: { backgroundColor: '#F1EAFF' },
  studentBadge: { backgroundColor: '#EAF2FF' },
  roleBadgeText: { fontFamily: 'PoppinsSemiBold', fontSize: 10 },
  cardDivider: { height: 1, backgroundColor: '#F0F1F5', marginVertical: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 9 },
  infoText: { flex: 1, fontFamily: 'PoppinsRegular', color: '#596579', fontSize: 11 },
  cardActions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  detailsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9, borderWidth: 1, borderColor: '#DED3F8', backgroundColor: '#FBF9FF', paddingHorizontal: 11, paddingVertical: 9 },
  detailsButtonText: { fontFamily: 'PoppinsSemiBold', color: PURPLE, fontSize: 10 },
  rejectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 9, borderWidth: 1, borderColor: '#F4D5D9', backgroundColor: '#FFF8F8', paddingHorizontal: 11, paddingVertical: 9 },
  rejectButtonText: { fontFamily: 'PoppinsSemiBold', color: RED, fontSize: 10 },
  approveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 9, backgroundColor: PURPLE, paddingHorizontal: 12, paddingVertical: 10 },
  approveButtonText: { fontFamily: 'PoppinsSemiBold', color: '#FFFFFF', fontSize: 10 },
  disabledButton: { opacity: 0.55 },
  stateCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, borderRadius: 16, paddingHorizontal: 22, paddingVertical: 38, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stateIconError: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#FFF0F1', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  stateIconSuccess: { width: 60, height: 60, borderRadius: 19, backgroundColor: '#E7F8EF', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  stateTitle: { fontFamily: 'PoppinsSemiBold', color: TEXT, fontSize: 16, textAlign: 'center' },
  stateDescription: { fontFamily: 'PoppinsRegular', color: MUTED, fontSize: 11, lineHeight: 19, textAlign: 'center', marginTop: 7, maxWidth: 360 },
  stateRetryButton: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: PURPLE, borderRadius: 9, paddingHorizontal: 15, paddingVertical: 10, marginTop: 17 },
  stateRetryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  clearFilterButton: { marginTop: 15, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9, backgroundColor: PURPLE_LIGHT },
  clearFilterText: { color: PURPLE, fontSize: 12, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(18, 22, 35, 0.48)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 560, maxHeight: '90%', backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden' },
  modalCardWide: { maxWidth: 600 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 19, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  modalHeaderIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center' },
  modalTitleColumn: { flex: 1 },
  modalTitle: { color: TEXT, fontSize: 16, fontWeight: '800' },
  modalSubtitle: { color: MUTED, fontSize: 11, marginTop: 4 },
  closeButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center' },
  modalBody: { paddingHorizontal: 19, paddingVertical: 2, marginBottom: 10 },
  detailProfile: { alignItems: 'center', paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  detailAvatar: { width: 62, height: 62, borderRadius: 18, marginBottom: 10 },
  detailName: { fontFamily: 'PoppinsBold', color: TEXT, fontSize: 18, textAlign: 'center' },
  detailEmail: { fontFamily: 'PoppinsRegular', color: MUTED, fontSize: 11, marginTop: 5, marginBottom: 10, textAlign: 'center' },
  detailRows: { paddingTop: 7 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F3F4F7' },
  detailRowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F0FF', alignItems: 'center', justifyContent: 'center' },
  detailRowText: { flex: 1 },
  detailRowLabel: { fontFamily: 'PoppinsRegular', color: MUTED, fontSize: 10, marginBottom: 4 },
  detailRowValue: { fontFamily: 'PoppinsSemiBold', color: TEXT, fontSize: 12 },
  detailHint: { color: MUTED, fontSize: 11, lineHeight: 17, marginTop: 13, backgroundColor: '#FBFCFE', borderRadius: 10, padding: 11 },
  modalActions: { flexDirection: 'row', gap: 9, marginTop: 15, marginBottom: 4 },
  rejectButtonLarge: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, borderWidth: 1, borderColor: '#F4D5D9', backgroundColor: '#FFF8F8', paddingVertical: 12 },
  approveButtonLarge: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, backgroundColor: PURPLE, paddingVertical: 12 },
  rejectModalCard: { width: '100%', maxWidth: 480, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22 },
  rejectModalIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#FFF0F1', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 13 },
  rejectModalTitle: { color: TEXT, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  rejectModalDescription: { color: MUTED, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  inputLabel: { color: TEXT, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  requiredStar: { color: RED },
  reasonInput: { minHeight: 115, borderWidth: 1, borderColor: BORDER, backgroundColor: '#FBFCFE', borderRadius: 11, padding: 12, color: TEXT, fontSize: 13, lineHeight: 19 },
  characterCount: { color: '#9AA4B5', fontSize: 10, textAlign: 'right', marginTop: 5 },
  rejectModalActions: { flexDirection: 'row', gap: 9, marginTop: 18 },
  cancelButton: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingVertical: 12 },
  cancelButtonText: { color: MUTED, fontSize: 12, fontWeight: '800' },
  confirmRejectButton: { flex: 1.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: RED, borderRadius: 10, paddingVertical: 12 },
  confirmRejectText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
