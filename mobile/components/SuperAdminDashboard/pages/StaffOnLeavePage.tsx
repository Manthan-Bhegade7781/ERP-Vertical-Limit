import React, { useEffect, useMemo, useState } from 'react';

import {

  ActivityIndicator,
  Alert,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  TouchableOpacity,

  View,

  useWindowDimensions,

} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { router } from 'expo-router';

import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

type LeaveStatus = 'Approved' | 'Pending' | 'Rejected';

type LeaveRecord = {
  id: string;
  name: string;
  role: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
};

type ApiLeave = {
  _id?: string;
  id?: string;
  staffId?: any;
  staff?: any;
  staffName?: string;
  branchId?: any;
  branch?: any;
  leaveType?: string;
  fromDate?: string;
  toDate?: string;
  days?: number;
  totalDays?: number;
  reason?: string;
  status?: string;
};

function formatDisplayDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function normalizeStatus(value?: string): LeaveStatus {
  const status = (value || 'pending').toLowerCase();
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function normalizeLeaveRecord(item: ApiLeave): LeaveRecord {
  const staff = item.staffId && typeof item.staffId === 'object'
    ? item.staffId
    : item.staff && typeof item.staff === 'object'
      ? item.staff
      : {};
  const branch = item.branchId && typeof item.branchId === 'object'
    ? item.branchId
    : item.branch && typeof item.branch === 'object'
      ? item.branch
      : {};
  const roles = Array.isArray(staff.roles) ? staff.roles : [];
  const role = roles.length
    ? roles.map((value: string) => value.replace(/_/g, ' ')
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase())).join(', ')
    : (staff.role || 'Staff');
  const from = item.fromDate || '';
  const to = item.toDate || '';
  const calculatedDays = from && to
    ? Math.max(1, Math.floor((Date.parse(to) - Date.parse(from)) / 86400000) + 1)
    : 1;

  return {
    id: String(item._id || item.id || ''),
    name: staff.fullName || item.staffName || staff.name || 'Staff member',
    role,
    department: branch.name || branch.branchName || '—',
    leaveType: item.leaveType || 'Leave',
    fromDate: formatDisplayDate(from),
    toDate: formatDisplayDate(to),
    days: Number(item.days ?? item.totalDays ?? calculatedDays),
    reason: item.reason || '—',
    status: normalizeStatus(item.status),
  };
}

function extractLeaveArray(result: any): ApiLeave[] {
  const candidates = [
    result?.data,
    result?.data?.leaves,
    result?.data?.requests,
    result?.data?.items,
    result?.data?.records,
    result?.leaves,
    result?.requests,
  ];
  return candidates.find(Array.isArray) || [];
}

export default function StaffOnLeavePage() {

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const canManageLeaves = roles.includes('super_admin') || roles.includes('admin');
  const isDesktop = width >= 900;

  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'All' | LeaveStatus>('All');
  const [selectedRecord, setSelectedRecord] =
    useState<LeaveRecord | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadLeaves = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Your session has expired. Please log in again.');

        const response = await fetch(`${API_BASE_URL}/leaves`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || 'Unable to load leave requests.');
        }

        const records = extractLeaveArray(result).map(normalizeLeaveRecord);
        if (!cancelled) setLeaveRecords(records);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error
            ? error.message
            : 'Unable to load leave requests.';
          Alert.alert('Leave Loading Error', message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLeaves();
    return () => { cancelled = true; };
  }, []);

  const totalStaffOnLeave = leaveRecords.filter(
    (record) => record.status === 'Approved'
  ).length;
  const approvedCount = leaveRecords.filter(
    (record) => record.status === 'Approved'
  ).length;
  const pendingCount = leaveRecords.filter(
    (record) => record.status === 'Pending'
  ).length;
  const rejectedCount = leaveRecords.filter(
    (record) => record.status === 'Rejected'
  ).length;

  const filteredRecords = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return leaveRecords.filter((record) => {
      const matchesSearch =
        !search ||
        record.name.toLowerCase().includes(search) ||
        record.role.toLowerCase().includes(search) ||
        record.department.toLowerCase().includes(search) ||
        record.leaveType.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leaveRecords, searchText, statusFilter]);

  const openDetails = (record: LeaveRecord) => {
    setSelectedRecord(record);
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedRecord(null);
  };

  const updateLeaveStatus = async (record: LeaveRecord, nextStatus: 'approved' | 'rejected') => {
    if (!canManageLeaves || updatingRecordId) return;
    setUpdatingRecordId(record.id);
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please log in again.');

      const response = await fetch(`${API_BASE_URL}/leaves/${record.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || `Unable to ${nextStatus} leave request.`);
      }

      const displayStatus = normalizeStatus(nextStatus);
      setLeaveRecords((current) => current.map((item) =>
        item.id === record.id ? { ...item, status: displayStatus } : item
      ));
      setSelectedRecord((current) => current?.id === record.id
        ? { ...current, status: displayStatus }
        : current
      );
      Alert.alert(
        nextStatus === 'approved' ? 'Leave Approved' : 'Leave Rejected',
        `${record.name}'s leave request has been ${nextStatus}.`
      );
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : `Unable to ${nextStatus} leave request.`;
      Alert.alert('Update Failed', message);
    } finally {
      setUpdatingRecordId(null);
    }
  };

  const handleApprove = (record: LeaveRecord) => {
    Alert.alert('Approve Leave', `Approve leave request for ${record.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => { void updateLeaveStatus(record, 'approved'); } },
    ]);
  };

  const handleReject = (record: LeaveRecord) => {
    Alert.alert('Reject Leave', `Reject leave request for ${record.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => { void updateLeaveStatus(record, 'rejected'); } },
    ]);
  };

  const handleAddLeave = () => {

    router.push({

      pathname: '/(super_admin)/explore',

      params: {

        feature: 'Add Leave',

      },

    });

  };

  const getStatusStyle = (status: LeaveStatus) => {

    switch (status) {

      case 'Approved':

        return {

          backgroundColor: '#E7F8EF',

          color: '#35B878',

        };

      case 'Pending':

        return {

          backgroundColor: '#FFF1E2',

          color: '#F7941D',

        };

      case 'Rejected':

        return {

          backgroundColor: '#FFE9F0',

          color: '#E95386',

        };

    }

  };

  return (

    <View

      style={[

        styles.container,

        {

          paddingTop: insets.top,

        },

      ]}

    >

      {/* =====================================================

          HEADER

      ===================================================== */}

      <View style={styles.header}>

        <TouchableOpacity

          style={styles.backButton}

          activeOpacity={0.8}

          onPress={() => router.back()}

        >

          <MaterialCommunityIcons

            name="arrow-left"

            size={22}

            color="#FFFFFF"

          />

        </TouchableOpacity>

        <Text style={styles.headerTitle}>

          Staff on Leave

        </Text>

        <TouchableOpacity

          style={styles.addButton}

          activeOpacity={0.85}

          onPress={handleAddLeave}

        >

          <MaterialCommunityIcons

            name="plus"

            size={18}

            color="#7040D5"

          />

          <Text style={styles.addButtonText}>

            Add Leave

          </Text>

        </TouchableOpacity>

      </View>

      <ScrollView

        style={styles.scrollView}

        contentContainerStyle={[

          styles.scrollContent,

          {

            paddingBottom: Math.max(insets.bottom, 24),

          },

        ]}

        showsVerticalScrollIndicator={false}

      >

        {/* =====================================================

            TITLE

        ===================================================== */}

        <Text style={styles.managementTitle}>

          Staff Leave Management

        </Text>

        <Text style={styles.managementSubtitle}>

          View, track and manage staff leave requests.

        </Text>

        {/* =====================================================

            SUMMARY CARDS

        ===================================================== */}

        <View

          style={[

            styles.summaryGrid,

            isDesktop && styles.summaryGridDesktop,

          ]}

        >

          {/* Total */}

          <View

            style={[

              styles.summaryWrapper,

              isDesktop && styles.summaryWrapperDesktop,

            ]}

          >

            <View style={styles.summaryCard}>

              <View style={styles.summaryIconPurple}>

                <MaterialCommunityIcons

                  name="account-clock-outline"

                  size={22}

                  color="#7040D5"

                />

              </View>

              <View style={styles.summaryInfo}>

                <Text style={styles.summaryLabel}>

                  Staff on Leave

                </Text>

                <Text style={styles.summaryValue}>

                  {totalStaffOnLeave}

                </Text>

              </View>

            </View>

          </View>

          {/* Approved */}

          <View

            style={[

              styles.summaryWrapper,

              isDesktop && styles.summaryWrapperDesktop,

            ]}

          >

            <View style={styles.summaryCard}>

              <View style={styles.summaryIconGreen}>

                <MaterialCommunityIcons

                  name="check-circle-outline"

                  size={22}

                  color="#35B878"

                />

              </View>

              <View style={styles.summaryInfo}>

                <Text style={styles.summaryLabel}>

                  Approved

                </Text>

                <Text style={styles.summaryValue}>

                  {approvedCount}

                </Text>

              </View>

            </View>

          </View>

          {/* Pending */}

          <View

            style={[

              styles.summaryWrapper,

              isDesktop && styles.summaryWrapperDesktop,

            ]}

          >

            <View style={styles.summaryCard}>

              <View style={styles.summaryIconOrange}>

                <MaterialCommunityIcons

                  name="clock-alert-outline"

                  size={22}

                  color="#F7941D"

                />

              </View>

              <View style={styles.summaryInfo}>

                <Text style={styles.summaryLabel}>

                  Pending Requests

                </Text>

                <Text style={styles.summaryValue}>

                  {pendingCount}

                </Text>

              </View>

            </View>

          </View>

          {/* Rejected */}

          <View

            style={[

              styles.summaryWrapper,

              isDesktop && styles.summaryWrapperDesktop,

            ]}

          >

            <View style={styles.summaryCard}>

              <View style={styles.summaryIconPink}>

                <MaterialCommunityIcons

                  name="close-circle-outline"

                  size={22}

                  color="#E95386"

                />

              </View>

              <View style={styles.summaryInfo}>

                <Text style={styles.summaryLabel}>

                  Rejected

                </Text>

                <Text style={styles.summaryValue}>

                  {rejectedCount}

                </Text>

              </View>

            </View>

          </View>

        </View>

        {/* =====================================================

            SEARCH + FILTER

        ===================================================== */}

        <View style={styles.filterCard}>

          <View style={styles.searchBox}>

            <MaterialCommunityIcons

              name="magnify"

              size={20}

              color="#9AA5B5"

            />

            <TextInput

              value={searchText}

              onChangeText={setSearchText}

              placeholder="Search staff, department or leave type..."

              placeholderTextColor="#A5AFBC"

              style={styles.searchInput}

            />

            {searchText.length > 0 && (

              <TouchableOpacity

                activeOpacity={0.8}

                onPress={() => setSearchText('')}

              >

                <MaterialCommunityIcons

                  name="close-circle"

                  size={18}

                  color="#A5AFBC"

                />

              </TouchableOpacity>

            )}

          </View>

          <ScrollView

            horizontal

            showsHorizontalScrollIndicator={false}

            contentContainerStyle={styles.filterContainer}

          >

            {(

              [

                'All',

                'Approved',

                'Pending',

                'Rejected',

              ] as const

            ).map((filter) => {

              const active = statusFilter === filter;

              return (

                <TouchableOpacity

                  key={filter}

                  style={[

                    styles.filterButton,

                    active && styles.filterButtonActive,

                  ]}

                  activeOpacity={0.8}

                  onPress={() =>

                    setStatusFilter(filter)

                  }

                >

                  <Text

                    style={[

                      styles.filterButtonText,

                      active &&

                        styles.filterButtonTextActive,

                    ]}

                  >

                    {filter}

                  </Text>

                </TouchableOpacity>

              );

            })}

          </ScrollView>

        </View>

        {/* =====================================================

            LIST HEADER

        ===================================================== */}

        <View style={styles.listHeader}>

          <View>

            <Text style={styles.listTitle}>

              Leave Records

            </Text>

            <Text style={styles.listSubtitle}>

              {filteredRecords.length}{' '}

              {filteredRecords.length === 1

                ? 'record'

                : 'records'}{' '}

              found

            </Text>

          </View>

          <View style={styles.dateBadge}>

            <MaterialCommunityIcons

              name="calendar-month-outline"

              size={15}

              color="#7040D5"

            />

            <Text style={styles.dateBadgeText}>

              Leave Overview

            </Text>

          </View>

        </View>

        {/* =====================================================

            LEAVE CARDS

        ===================================================== */}

        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#7040D5" />
            <Text style={styles.emptySubtitle}>Loading leave requests...</Text>
          </View>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {

            const statusStyle =

              getStatusStyle(record.status);

            return (

              <View

                key={record.id}

                style={styles.leaveCard}

              >

                {/* TOP */}

                <View style={styles.leaveTopRow}>

                  <View style={styles.staffAvatar}>

                    <MaterialCommunityIcons

                      name="account"

                      size={23}

                      color="#7040D5"

                    />

                  </View>

                  <View style={styles.staffInfo}>

                    <Text

                      style={styles.staffName}

                      numberOfLines={1}

                    >

                      {record.name}

                    </Text>

                    <Text

                      style={styles.staffRole}

                      numberOfLines={1}

                    >

                      {record.role}

                    </Text>

                    <View style={styles.departmentRow}>

                      <MaterialCommunityIcons

                        name="domain"

                        size={13}

                        color="#9AA5B5"

                      />

                      <Text style={styles.departmentText}>

                        {record.department}

                      </Text>

                    </View>

                  </View>

                  <View

                    style={[

                      styles.statusBadge,

                      {

                        backgroundColor:

                          statusStyle.backgroundColor,

                      },

                    ]}

                  >

                    <View

                      style={[

                        styles.statusDot,

                        {

                          backgroundColor:

                            statusStyle.color,

                        },

                      ]}

                    />

                    <Text

                      style={[

                        styles.statusText,

                        {

                          color: statusStyle.color,

                        },

                      ]}

                    >

                      {record.status}

                    </Text>

                  </View>

                </View>

                {/* DETAILS */}

                <View style={styles.leaveDetails}>

                  <View style={styles.detailBox}>

                    <Text style={styles.detailLabel}>

                      Leave Type

                    </Text>

                    <View style={styles.detailValueRow}>

                      <MaterialCommunityIcons

                        name="calendar-edit-outline"

                        size={15}

                        color="#7040D5"

                      />

                      <Text style={styles.detailValue}>

                        {record.leaveType}

                      </Text>

                    </View>

                  </View>

                  <View style={styles.detailBox}>

                    <Text style={styles.detailLabel}>

                      Duration

                    </Text>

                    <View style={styles.detailValueRow}>

                      <MaterialCommunityIcons

                        name="calendar-range-outline"

                        size={15}

                        color="#2675E8"

                      />

                      <Text style={styles.detailValue}>

                        {record.fromDate} - {record.toDate}

                      </Text>

                    </View>

                  </View>

                  <View style={styles.detailBoxSmall}>

                    <Text style={styles.detailLabel}>

                      Days

                    </Text>

                    <Text style={styles.daysValue}>

                      {record.days}

                    </Text>

                  </View>

                </View>

                {/* REASON */}

                <View style={styles.reasonRow}>

                  <MaterialCommunityIcons

                    name="text-box-outline"

                    size={15}

                    color="#8D98A8"

                  />

                  <Text

                    style={styles.reasonText}

                    numberOfLines={1}

                  >

                    {record.reason}

                  </Text>

                </View>

                {/* ACTIONS */}

                <View style={styles.actionRow}>

                  <TouchableOpacity

                    style={styles.viewButton}

                    activeOpacity={0.8}

                    onPress={() => openDetails(record)}

                  >

                    <MaterialCommunityIcons

                      name="eye-outline"

                      size={16}

                      color="#7040D5"

                    />

                    <Text style={styles.viewButtonText}>

                      View

                    </Text>

                  </TouchableOpacity>

                  {canManageLeaves && record.status === 'Pending' && (

                    <>

                      <TouchableOpacity

                        style={styles.approveButton}

                        activeOpacity={0.8}

                        onPress={() =>

                          handleApprove(record)

                        }

                      >

                        <MaterialCommunityIcons

                          name="check"

                          size={16}

                          color="#35B878"

                        />

                        <Text

                          style={styles.approveButtonText}

                        >

                          Approve

                        </Text>

                      </TouchableOpacity>

                      <TouchableOpacity

                        style={styles.rejectButton}

                        activeOpacity={0.8}

                        onPress={() =>

                          handleReject(record)

                        }

                      >

                        <MaterialCommunityIcons

                          name="close"

                          size={16}

                          color="#E95386"

                        />

                        <Text

                          style={styles.rejectButtonText}

                        >

                          Reject

                        </Text>

                      </TouchableOpacity>

                    </>

                  )}

                </View>

              </View>

            );

          })

        ) : (

          <View style={styles.emptyCard}>

            <View style={styles.emptyIcon}>

              <MaterialCommunityIcons

                name="account-search-outline"

                size={36}

                color="#7040D5"

              />

            </View>

            <Text style={styles.emptyTitle}>

              No Leave Records Found

            </Text>

            <Text style={styles.emptySubtitle}>

              Try changing your search or filter.

            </Text>

          </View>

        )}

      </ScrollView>

      {/* =====================================================

          DETAILS MODAL

      ===================================================== */}

      {detailsVisible && selectedRecord && (

        <View style={styles.modalOverlay}>

          <TouchableOpacity

            style={styles.modalBackdrop}

            activeOpacity={1}

            onPress={closeDetails}

          />

          <View

            style={[

              styles.detailsModal,

              isDesktop && styles.detailsModalDesktop,

            ]}

          >

            <View style={styles.modalHeader}>

              <View>

                <Text style={styles.modalTitle}>

                  Leave Details

                </Text>

                <Text style={styles.modalSubtitle}>

                  Staff leave request information

                </Text>

              </View>

              <TouchableOpacity

                style={styles.closeButton}

                activeOpacity={0.8}

                onPress={closeDetails}

              >

                <MaterialCommunityIcons

                  name="close"

                  size={20}

                  color="#66768A"

                />

              </TouchableOpacity>

            </View>

            <View style={styles.modalProfile}>

              <View style={styles.modalAvatar}>

                <MaterialCommunityIcons

                  name="account"

                  size={30}

                  color="#7040D5"

                />

              </View>

              <View style={styles.modalProfileInfo}>

                <Text style={styles.modalStaffName}>

                  {selectedRecord.name}

                </Text>

                <Text style={styles.modalStaffRole}>

                  {selectedRecord.role}

                </Text>

              </View>

            </View>

            <View style={styles.modalDetailsGrid}>

              <View style={styles.modalDetailItem}>

                <Text style={styles.modalDetailLabel}>

                  Department

                </Text>

                <Text style={styles.modalDetailValue}>

                  {selectedRecord.department}

                </Text>

              </View>

              <View style={styles.modalDetailItem}>

                <Text style={styles.modalDetailLabel}>

                  Leave Type

                </Text>

                <Text style={styles.modalDetailValue}>

                  {selectedRecord.leaveType}

                </Text>

              </View>

              <View style={styles.modalDetailItem}>

                <Text style={styles.modalDetailLabel}>

                  From Date

                </Text>

                <Text style={styles.modalDetailValue}>

                  {selectedRecord.fromDate}

                </Text>

              </View>

              <View style={styles.modalDetailItem}>

                <Text style={styles.modalDetailLabel}>

                  To Date

                </Text>

                <Text style={styles.modalDetailValue}>

                  {selectedRecord.toDate}

                </Text>

              </View>

              <View style={styles.modalDetailItem}>

                <Text style={styles.modalDetailLabel}>

                  Total Days

                </Text>

                <Text style={styles.modalDetailValue}>

                  {selectedRecord.days}

                </Text>

              </View>

              <View style={styles.modalDetailItem}>

                <Text style={styles.modalDetailLabel}>

                  Status

                </Text>

                <Text

                  style={[

                    styles.modalDetailValue,

                    {

                      color:

                        getStatusStyle(

                          selectedRecord.status

                        ).color,

                    },

                  ]}

                >

                  {selectedRecord.status}

                </Text>

              </View>

            </View>

            <View style={styles.reasonBox}>

              <Text style={styles.modalDetailLabel}>

                Reason

              </Text>

              <Text style={styles.reasonModalText}>

                {selectedRecord.reason}

              </Text>

            </View>

            {canManageLeaves && selectedRecord.status === 'Pending' && (

              <View style={styles.modalActions}>

                <TouchableOpacity

                  style={styles.modalRejectButton}

                  activeOpacity={0.8}

                  onPress={() => {

                    closeDetails();

                    handleReject(selectedRecord);

                  }}

                >

                  <Text style={styles.modalRejectText}>

                    Reject

                  </Text>

                </TouchableOpacity>

                <TouchableOpacity

                  style={styles.modalApproveButton}

                  activeOpacity={0.8}

                  onPress={() => {

                    closeDetails();

                    handleApprove(selectedRecord);

                  }}

                >

                  <Text style={styles.modalApproveText}>

                    Approve Leave

                  </Text>

                </TouchableOpacity>

              </View>

            )}

          </View>

        </View>

      )}

    </View>

  );

}

const styles = StyleSheet.create({

  /* =====================================================

     CONTAINER

  ===================================================== */

  container: {

    flex: 1,

    backgroundColor: '#F7F8FC',

  },

  scrollView: {

    flex: 1,

  },

  scrollContent: {

    paddingHorizontal: 16,

    paddingTop: 18,

  },

  /* =====================================================

     HEADER

  ===================================================== */

  header: {

    minHeight: 64,

    backgroundColor: '#7040D5',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 14,

    paddingVertical: 10,

    gap: 9,

  },

  backButton: {

    width: 40,

    height: 40,

    borderRadius: 11,

    backgroundColor: 'rgba(255,255,255,0.16)',

    alignItems: 'center',

    justifyContent: 'center',

  },

  headerTextContainer: {

    flex: 1,

    minWidth: 0,

    marginLeft: 13,

  },

  headerTitle: {

    flex: 1,

    minWidth: 0,

    fontFamily: 'PoppinsSemiBold',

    fontSize: 17,

    lineHeight: 22,

    color: '#FFFFFF',

  },

  headerSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    lineHeight: 15,

    color: '#EDE6FF',

    marginTop: 1,

  },

  addButton: {

    minHeight: 38,

    minWidth: 132,

    borderRadius: 10,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 10,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    flexShrink: 0,

  },

  addButtonText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 10,

    color: '#7040D5',

    marginLeft: 5,

  },

  /* =====================================================

     TITLE

  ===================================================== */

  managementTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 19,

    lineHeight: 27,

    color: '#172033',

  },

  managementSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 10.5,

    lineHeight: 17,

    color: '#8490A2',

    marginTop: 2,

    marginBottom: 15,

  },

  /* =====================================================

     SUMMARY

  ===================================================== */

  summaryGrid: {

    width: '100%',

  },

  summaryGridDesktop: {

    flexDirection: 'row',

    justifyContent: 'space-between',

  },

  summaryWrapper: {

    width: '100%',

  },

  summaryWrapperDesktop: {

    width: '24%',

  },

  summaryCard: {

    minHeight: 82,

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    padding: 13,

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 11,

    shadowColor: '#000000',

    shadowOffset: {

      width: 0,

      height: 3,

    },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 2,

  },

  summaryIconPurple: {

    width: 43,

    height: 43,

    borderRadius: 12,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',

    justifyContent: 'center',

  },

  summaryIconGreen: {

    width: 43,

    height: 43,

    borderRadius: 12,

    backgroundColor: '#E7F8EF',

    alignItems: 'center',

    justifyContent: 'center',

  },

  summaryIconOrange: {

    width: 43,

    height: 43,

    borderRadius: 12,

    backgroundColor: '#FFF1E2',

    alignItems: 'center',

    justifyContent: 'center',

  },

  summaryIconPink: {

    width: 43,

    height: 43,

    borderRadius: 12,

    backgroundColor: '#FFE9F0',

    alignItems: 'center',

    justifyContent: 'center',

  },

  summaryInfo: {

    flex: 1,

    minWidth: 0,

    marginLeft: 11,

  },

  summaryLabel: {

    fontFamily: 'PoppinsMedium',

    fontSize: 8.5,

    lineHeight: 14,

    color: '#8994A4',

  },

  summaryValue: {

    fontFamily: 'PoppinsBold',

    fontSize: 17,

    lineHeight: 24,

    color: '#202A3A',

    marginTop: 1,

  },

  /* =====================================================

     FILTER

  ===================================================== */

  filterCard: {

    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 15,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    padding: 13,

    marginTop: 4,

    marginBottom: 17,

    shadowColor: '#000000',

    shadowOffset: {

      width: 0,

      height: 3,

    },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 2,

  },

  searchBox: {

    minHeight: 44,

    width: '100%',

    borderWidth: 1,

    borderColor: '#E3E7ED',

    borderRadius: 10,

    backgroundColor: '#FAFBFD',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 11,

  },

  searchInput: {

    flex: 1,

    minWidth: 0,

    fontFamily: 'PoppinsRegular',

    fontSize: 9.5,

    color: '#344054',

    marginLeft: 7,

    paddingVertical: 8,

  },

  filterContainer: {

    paddingTop: 11,

  },

  filterButton: {

    minHeight: 31,

    borderRadius: 8,

    borderWidth: 1,

    borderColor: '#E2E6EC',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 12,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 7,

  },

  filterButtonActive: {

    backgroundColor: '#7040D5',

    borderColor: '#7040D5',

  },

  filterButtonText: {

    fontFamily: 'PoppinsMedium',

    fontSize: 8.5,

    color: '#748096',

  },

  filterButtonTextActive: {

    fontFamily: 'PoppinsSemiBold',

    color: '#FFFFFF',

  },

  /* =====================================================

     LIST HEADER

  ===================================================== */

  listHeader: {

    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 10,

  },

  listTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 14,

    lineHeight: 20,

    color: '#202A3A',

  },

  listSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 8.5,

    color: '#929CAB',

    marginTop: 1,

  },

  dateBadge: {

    minHeight: 30,

    borderRadius: 8,

    backgroundColor: '#F1EAFF',

    paddingHorizontal: 9,

    flexDirection: 'row',

    alignItems: 'center',

  },

  dateBadgeText: {

    fontFamily: 'PoppinsMedium',

    fontSize: 8,

    color: '#7040D5',

    marginLeft: 5,

  },

  /* =====================================================

     LEAVE CARD

  ===================================================== */

  leaveCard: {

    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 15,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    padding: 14,

    marginBottom: 11,

    shadowColor: '#000000',

    shadowOffset: {

      width: 0,

      height: 3,

    },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 2,

  },

  leaveTopRow: {

    width: '100%',

    flexDirection: 'row',

    alignItems: 'flex-start',

  },

  staffAvatar: {

    width: 45,

    height: 45,

    borderRadius: 13,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',

    justifyContent: 'center',

  },

  staffInfo: {

    flex: 1,

    minWidth: 0,

    marginLeft: 11,

  },

  staffName: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 11.5,

    lineHeight: 17,

    color: '#263247',

  },

  staffRole: {

    fontFamily: 'PoppinsRegular',

    fontSize: 8.5,

    lineHeight: 14,

    color: '#7D899A',

  },

  departmentRow: {

    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 2,

  },

  departmentText: {

    fontFamily: 'PoppinsRegular',

    fontSize: 7.5,

    color: '#9AA5B5',

    marginLeft: 4,

  },

  statusBadge: {

    minHeight: 26,

    borderRadius: 7,

    paddingHorizontal: 8,

    flexDirection: 'row',

    alignItems: 'center',

    alignSelf: 'flex-start',

  },

  statusDot: {

    width: 6,

    height: 6,

    borderRadius: 3,

  },

  statusText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 7.5,

    marginLeft: 5,

  },

  /* =====================================================

     DETAILS

  ===================================================== */

  leaveDetails: {

    width: '100%',

    marginTop: 14,

    paddingTop: 12,

    borderTopWidth: 1,

    borderTopColor: '#F0F2F5',

    flexDirection: 'row',

    flexWrap: 'wrap',

  },

  detailBox: {

    flex: 1,

    minWidth: 145,

    marginBottom: 7,

  },

  detailBoxSmall: {

    width: 60,

    marginBottom: 7,

  },

  detailLabel: {

    fontFamily: 'PoppinsMedium',

    fontSize: 7.5,

    lineHeight: 12,

    color: '#9AA4B2',

    marginBottom: 3,

  },

  detailValueRow: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  detailValue: {

    fontFamily: 'PoppinsMedium',

    fontSize: 8.5,

    lineHeight: 14,

    color: '#536176',

    marginLeft: 5,

  },

  daysValue: {

    fontFamily: 'PoppinsBold',

    fontSize: 12,

    color: '#202A3A',

  },

  reasonRow: {

    width: '100%',

    minHeight: 28,

    backgroundColor: '#FAFBFD',

    borderRadius: 7,

    paddingHorizontal: 8,

    flexDirection: 'row',

    alignItems: 'center',

  },

  reasonText: {

    flex: 1,

    fontFamily: 'PoppinsRegular',

    fontSize: 8,

    color: '#758195',

    marginLeft: 5,

  },

  /* =====================================================

     ACTIONS

  ===================================================== */

  actionRow: {

    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 11,

    paddingTop: 10,

    borderTopWidth: 1,

    borderTopColor: '#F0F2F5',

  },

  viewButton: {

    minHeight: 31,

    borderRadius: 8,

    backgroundColor: '#F1EAFF',

    paddingHorizontal: 10,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 7,

  },

  viewButtonText: {

    fontFamily: 'PoppinsMedium',

    fontSize: 8,

    color: '#7040D5',

    marginLeft: 5,

  },

  approveButton: {

    minHeight: 31,

    borderRadius: 8,

    backgroundColor: '#E7F8EF',

    paddingHorizontal: 10,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 7,

  },

  approveButtonText: {

    fontFamily: 'PoppinsMedium',

    fontSize: 8,

    color: '#35B878',

    marginLeft: 5,

  },

  rejectButton: {

    minHeight: 31,

    borderRadius: 8,

    backgroundColor: '#FFE9F0',

    paddingHorizontal: 10,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

  },

  rejectButtonText: {

    fontFamily: 'PoppinsMedium',

    fontSize: 8,

    color: '#E95386',

    marginLeft: 5,

  },

  /* =====================================================

     EMPTY

  ===================================================== */

  emptyCard: {

    width: '100%',

    minHeight: 220,

    backgroundColor: '#FFFFFF',

    borderRadius: 15,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 25,

    marginBottom: 15,

  },

  emptyIcon: {

    width: 65,

    height: 65,

    borderRadius: 20,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 12,

  },

  emptyTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 13,

    color: '#273246',

  },

  emptySubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 9,

    color: '#929CAB',

    textAlign: 'center',

    marginTop: 4,

  },

  /* =====================================================

     MODAL

  ===================================================== */

  modalOverlay: {

    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    bottom: 0,

    justifyContent: 'center',

    alignItems: 'center',

  },

  modalBackdrop: {

    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    bottom: 0,

    backgroundColor: 'rgba(23,32,51,0.45)',

  },

  detailsModal: {

    width: '91%',

    maxHeight: '88%',

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    padding: 18,

    shadowColor: '#000000',

    shadowOffset: {

      width: 0,

      height: 8,

    },

    shadowOpacity: 0.16,

    shadowRadius: 18,

    elevation: 8,

  },

  detailsModalDesktop: {

    width: 520,

  },

  modalHeader: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',

  },

  modalTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 15,

    lineHeight: 21,

    color: '#202A3A',

  },

  modalSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 8.5,

    color: '#929CAB',

    marginTop: 2,

  },

  closeButton: {

    width: 34,

    height: 34,

    borderRadius: 9,

    backgroundColor: '#F6F7F9',

    alignItems: 'center',

    justifyContent: 'center',

  },

  modalProfile: {

    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 18,

    padding: 12,

    borderRadius: 11,

    backgroundColor: '#F8F9FC',

  },

  modalAvatar: {

    width: 52,

    height: 52,

    borderRadius: 15,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',

    justifyContent: 'center',

  },

  modalProfileInfo: {

    marginLeft: 11,

  },

  modalStaffName: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 12,

    color: '#273246',

  },

  modalStaffRole: {

    fontFamily: 'PoppinsRegular',

    fontSize: 8.5,

    color: '#8C97A7',

    marginTop: 2,

  },

  modalDetailsGrid: {

    marginTop: 15,

    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between',

  },

  modalDetailItem: {

    width: '48%',

    minHeight: 58,

    marginBottom: 8,

    borderRadius: 9,

    backgroundColor: '#FAFBFD',

    paddingHorizontal: 10,

    paddingVertical: 8,

    justifyContent: 'center',

  },

  modalDetailLabel: {

    fontFamily: 'PoppinsMedium',

    fontSize: 7.5,

    color: '#9AA4B2',

    marginBottom: 3,

  },

  modalDetailValue: {

    fontFamily: 'PoppinsMedium',

    fontSize: 9,

    color: '#46546A',

  },

  reasonBox: {

    marginTop: 4,

    borderRadius: 9,

    backgroundColor: '#FAFBFD',

    padding: 11,

  },

  reasonModalText: {

    fontFamily: 'PoppinsRegular',

    fontSize: 9,

    lineHeight: 15,

    color: '#59677A',

  },

  modalActions: {

    flexDirection: 'row',

    justifyContent: 'flex-end',

    marginTop: 15,

  },

  modalRejectButton: {

    minHeight: 40,

    borderRadius: 9,

    backgroundColor: '#FFE9F0',

    paddingHorizontal: 15,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 8,

  },

  modalRejectText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 9,

    color: '#E95386',

  },

  modalApproveButton: {

    minHeight: 40,

    borderRadius: 9,

    backgroundColor: '#7040D5',

    paddingHorizontal: 15,

    alignItems: 'center',

    justifyContent: 'center',

  },

  modalApproveText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 9,

    color: '#FFFFFF',

  },

});