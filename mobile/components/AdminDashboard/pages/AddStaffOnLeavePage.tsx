import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

type StaffOption = {
  id: string;
  name: string;
  email?: string;
  role?: string;
};

type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Emergency Leave' | 'Other';
const LEAVE_TYPES: LeaveType[] = [
  'Casual Leave', 'Sick Leave', 'Earned Leave', 'Emergency Leave', 'Other',
];

function getStaffArray(result: any): any[] {
  const candidates = [
    result?.data?.staff,
    result?.data?.users,
    result?.data?.staffOptions,
    result?.data?.items,
    result?.staff,
    result?.users,
    result?.data,
  ];
  return candidates.find(Array.isArray) || [];
}

function normalizeStaff(item: any): StaffOption | null {
  const id = String(item?._id || item?.id || item?.userId || '');
  if (!id) return null;
  const roles = Array.isArray(item?.roles) ? item.roles : [];
  return {
    id,
    name: item?.fullName || item?.name || item?.staffName || item?.email || 'Staff member',
    email: item?.email || undefined,
    role: roles.length
      ? roles.map((role: string) => role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())).join(', ')
      : item?.role || undefined,
  };
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export default function AddStaffOnLeavePage() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const canChooseStaff = roles.includes('super_admin') || roles.includes('admin');

  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffOption | null>(null);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [leaveTypeModalVisible, setLeaveTypeModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    if (!token) throw new Error('Your session has expired. Please log in again.');
    const response = await fetch(`${API_BASE_URL}/leaves${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || 'The request could not be completed.');
    }
    return result;
  }, []);

  const loadStaffOptions = useCallback(async () => {
    if (!canChooseStaff) return;
    setStaffLoading(true);
    try {
      const result = await request('/staff-options');
      const options = getStaffArray(result).map(normalizeStaff).filter(Boolean) as StaffOption[];
      setStaffOptions(options);
      if (options.length === 0) {
        Alert.alert('No Staff Found', 'No eligible staff members were returned by the server.');
      }
    } catch (error) {
      Alert.alert('Unable to Load Staff', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setStaffLoading(false);
    }
  }, [canChooseStaff, request]);

  useEffect(() => {
    void loadStaffOptions();
  }, [loadStaffOptions]);

  const filteredStaff = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    if (!query) return staffOptions;
    return staffOptions.filter((staff) =>
      staff.name.toLowerCase().includes(query) ||
      (staff.email || '').toLowerCase().includes(query) ||
      (staff.role || '').toLowerCase().includes(query)
    );
  }, [staffOptions, staffSearch]);

  const days = useMemo(() => {
    if (!isValidDate(fromDate) || !isValidDate(toDate)) return 0;
    const difference = Date.parse(`${toDate}T00:00:00.000Z`) - Date.parse(`${fromDate}T00:00:00.000Z`);
    return difference < 0 ? 0 : Math.floor(difference / 86400000) + 1;
  }, [fromDate, toDate]);

  const handleSubmit = async () => {
    if (canChooseStaff && !selectedStaff) {
      Alert.alert('Select Staff', 'Please select a staff member for this leave request.');
      return;
    }
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
      Alert.alert('Invalid Dates', 'Enter both dates in YYYY-MM-DD format, for example 2026-10-28.');
      return;
    }
    if (toDate < fromDate) {
      Alert.alert('Invalid Date Range', 'To Date must be the same as or later than From Date.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason for the leave.');
      return;
    }

    const payload: Record<string, string> = {
      leaveType,
      fromDate,
      toDate,
      reason: reason.trim(),
    };
    if (canChooseStaff && selectedStaff) payload.staffId = selectedStaff.id;

    setSaving(true);
    try {
      const result = await request('', { method: 'POST', body: JSON.stringify(payload) });
      Alert.alert('Leave Added', result?.message || 'The leave request was created successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Unable to Add Leave', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const FieldLabel = ({ children, required = false }: { children: string; required?: boolean }) => (
    <Text style={styles.fieldLabel}>{children}{required ? <Text style={styles.required}> *</Text> : null}</Text>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Add Leave</Text>
          <Text style={styles.headerSubtitle}>Create a staff leave request</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.introRow}>
            <View style={styles.introIcon}><MaterialCommunityIcons name="calendar-plus" size={25} color="#7040D5" /></View>
            <View style={styles.introText}>
              <Text style={styles.pageTitle}>Staff Leave Details</Text>
              <Text style={styles.pageSubtitle}>Fill in the details below to add a leave request.</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            {canChooseStaff && <>
              <FieldLabel required>Staff Member</FieldLabel>
              <TouchableOpacity style={styles.selectField} activeOpacity={0.8} onPress={() => setStaffModalVisible(true)}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#8B96A7" />
                <Text style={[styles.selectText, !selectedStaff && styles.placeholder]} numberOfLines={1}>
                  {selectedStaff?.name || (staffLoading ? 'Loading staff...' : 'Select staff member')}
                </Text>
                {staffLoading ? <ActivityIndicator size="small" color="#7040D5" /> : <MaterialCommunityIcons name="chevron-down" size={21} color="#8B96A7" />}
              </TouchableOpacity>
              {selectedStaff?.email ? <Text style={styles.helperText}>{selectedStaff.email}</Text> : null}
            </>}

            <FieldLabel required>Leave Type</FieldLabel>
            <TouchableOpacity style={styles.selectField} activeOpacity={0.8} onPress={() => setLeaveTypeModalVisible(true)}>
              <MaterialCommunityIcons name="format-list-bulleted-type" size={19} color="#7040D5" />
              <Text style={styles.selectText}>{leaveType}</Text>
              <MaterialCommunityIcons name="chevron-down" size={21} color="#8B96A7" />
            </TouchableOpacity>

            <View style={styles.dateRow}>
              <View style={styles.dateColumn}>
                <FieldLabel required>From Date</FieldLabel>
                <View style={styles.inputWithIcon}>
                  <MaterialCommunityIcons name="calendar-start" size={18} color="#7040D5" />
                  <TextInput value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" placeholderTextColor="#A5AFBC" style={styles.dateInput} autoCapitalize="none" maxLength={10} />
                </View>
              </View>
              <View style={styles.dateColumn}>
                <FieldLabel required>To Date</FieldLabel>
                <View style={styles.inputWithIcon}>
                  <MaterialCommunityIcons name="calendar-end" size={18} color="#2675E8" />
                  <TextInput value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" placeholderTextColor="#A5AFBC" style={styles.dateInput} autoCapitalize="none" maxLength={10} />
                </View>
              </View>
            </View>
            <Text style={styles.helperText}>Use YYYY-MM-DD format. Both dates are included in the total.</Text>

            <View style={styles.daysPreview}>
              <View style={styles.daysIcon}><MaterialCommunityIcons name="calendar-range" size={20} color="#7040D5" /></View>
              <View style={styles.daysTextWrap}>
                <Text style={styles.daysLabel}>Total Leave Days</Text>
                <Text style={styles.daysHint}>{days > 0 ? 'Calculated from the selected date range' : 'Select a valid date range to calculate days'}</Text>
              </View>
              <Text style={styles.daysNumber}>{days || '—'}</Text>
            </View>

            <FieldLabel required>Reason for Leave</FieldLabel>
            <TextInput value={reason} onChangeText={setReason} placeholder="Enter the reason for leave..." placeholderTextColor="#A5AFBC" style={styles.reasonInput} multiline numberOfLines={4} textAlignVertical="top" maxLength={1000} />
            <Text style={styles.characterCount}>{reason.length}/1000</Text>

            <View style={styles.notice}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#8A6A19" />
              <Text style={styles.noticeText}>New leave requests are submitted with Pending status. The backend calculates the final number of days.</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={saving} activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, saving && styles.disabledButton]} onPress={handleSubmit} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />}
                <Text style={styles.submitButtonText}>{saving ? 'Submitting...' : 'Add Leave'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={staffModalVisible} transparent animationType="fade" onRequestClose={() => setStaffModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setStaffModalVisible(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View><Text style={styles.modalTitle}>Select Staff</Text><Text style={styles.modalSubtitle}>{staffOptions.length} staff member(s) available</Text></View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setStaffModalVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity>
            </View>
            <View style={styles.modalSearch}>
              <MaterialCommunityIcons name="magnify" size={19} color="#9AA5B5" />
              <TextInput value={staffSearch} onChangeText={setStaffSearch} placeholder="Search staff name or email" placeholderTextColor="#A5AFBC" style={styles.modalSearchInput} />
            </View>
            <ScrollView style={styles.staffList} keyboardShouldPersistTaps="handled">
              {filteredStaff.map((staff) => (
                <TouchableOpacity key={staff.id} style={styles.staffOption} onPress={() => { setSelectedStaff(staff); setStaffModalVisible(false); setStaffSearch(''); }} activeOpacity={0.75}>
                  <View style={styles.staffAvatar}><MaterialCommunityIcons name="account" size={21} color="#7040D5" /></View>
                  <View style={styles.staffOptionInfo}><Text style={styles.staffOptionName}>{staff.name}</Text><Text style={styles.staffOptionSub}>{[staff.role, staff.email].filter(Boolean).join(' · ') || 'Staff member'}</Text></View>
                  {selectedStaff?.id === staff.id && <MaterialCommunityIcons name="check-circle" size={20} color="#7040D5" />}
                </TouchableOpacity>
              ))}
              {!staffLoading && filteredStaff.length === 0 && <Text style={styles.noStaffText}>No matching staff members found.</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={leaveTypeModalVisible} transparent animationType="fade" onRequestClose={() => setLeaveTypeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setLeaveTypeModalVisible(false)} />
          <View style={styles.typeModalCard}>
            <Text style={styles.modalTitle}>Select Leave Type</Text>
            {LEAVE_TYPES.map((type) => (
              <TouchableOpacity key={type} style={styles.typeOption} onPress={() => { setLeaveType(type); setLeaveTypeModalVisible(false); }} activeOpacity={0.8}>
                <Text style={[styles.typeOptionText, leaveType === type && styles.typeOptionTextActive]}>{type}</Text>
                {leaveType === type && <MaterialCommunityIcons name="check-circle" size={20} color="#7040D5" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { minHeight: 66, backgroundColor: '#7040D5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  backButton: { width: 40, height: 40, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  headerTextContainer: { flex: 1, marginLeft: 13 },
  headerTitle: { fontFamily: 'PoppinsSemiBold', fontSize: 17, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'PoppinsRegular', fontSize: 10, color: '#EDE6FF', marginTop: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 19 },
  introRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  introIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F1EAFF', alignItems: 'center', justifyContent: 'center' },
  introText: { flex: 1, marginLeft: 12 },
  pageTitle: { fontFamily: 'PoppinsSemiBold', fontSize: 18, color: '#202A3A' },
  pageSubtitle: { fontFamily: 'PoppinsRegular', fontSize: 10, lineHeight: 16, color: '#8490A2', marginTop: 2 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EEF0F5', padding: 16, marginBottom: 18, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  fieldLabel: { fontFamily: 'PoppinsMedium', fontSize: 10, color: '#344054', marginBottom: 7, marginTop: 14 },
  required: { color: '#E95386' },
  selectField: { minHeight: 47, borderWidth: 1, borderColor: '#E3E7ED', borderRadius: 10, backgroundColor: '#FAFBFD', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  selectText: { flex: 1, fontFamily: 'PoppinsRegular', fontSize: 10, color: '#344054' },
  placeholder: { color: '#A5AFBC' },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateColumn: { flex: 1, minWidth: 0 },
  inputWithIcon: { minHeight: 46, borderWidth: 1, borderColor: '#E3E7ED', borderRadius: 10, backgroundColor: '#FAFBFD', paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateInput: { flex: 1, minWidth: 0, fontFamily: 'PoppinsRegular', fontSize: 10, color: '#344054', paddingVertical: 10 },
  helperText: { fontFamily: 'PoppinsRegular', fontSize: 8.5, color: '#929CAB', marginTop: 5 },
  daysPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F5FF', borderWidth: 1, borderColor: '#E8DFFF', borderRadius: 11, padding: 12, marginTop: 16 },
  daysIcon: { width: 37, height: 37, borderRadius: 10, backgroundColor: '#EDE4FF', alignItems: 'center', justifyContent: 'center' },
  daysTextWrap: { flex: 1, marginLeft: 10 },
  daysLabel: { fontFamily: 'PoppinsSemiBold', fontSize: 10, color: '#40305F' },
  daysHint: { fontFamily: 'PoppinsRegular', fontSize: 8, color: '#8B7AA8', marginTop: 2 },
  daysNumber: { fontFamily: 'PoppinsBold', fontSize: 19, color: '#7040D5', marginLeft: 8 },
  reasonInput: { minHeight: 105, borderWidth: 1, borderColor: '#E3E7ED', borderRadius: 10, backgroundColor: '#FAFBFD', paddingHorizontal: 12, paddingTop: 12, fontFamily: 'PoppinsRegular', fontSize: 10, lineHeight: 17, color: '#344054' },
  characterCount: { alignSelf: 'flex-end', fontFamily: 'PoppinsRegular', fontSize: 8, color: '#929CAB', marginTop: 4 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E7', borderRadius: 9, padding: 10, marginTop: 17, gap: 8 },
  noticeText: { flex: 1, fontFamily: 'PoppinsRegular', fontSize: 8.5, lineHeight: 14, color: '#80631D' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 21 },
  cancelButton: { minHeight: 43, borderRadius: 10, borderWidth: 1, borderColor: '#E1E5EB', backgroundColor: '#FFFFFF', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontFamily: 'PoppinsSemiBold', fontSize: 10, color: '#667085' },
  submitButton: { minHeight: 43, borderRadius: 10, backgroundColor: '#7040D5', paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  submitButtonText: { fontFamily: 'PoppinsSemiBold', fontSize: 10, color: '#FFFFFF' },
  disabledButton: { opacity: 0.7 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(23,32,51,0.45)' },
  modalCard: { width: '100%', maxWidth: 520, maxHeight: '80%', backgroundColor: '#FFFFFF', borderRadius: 17, padding: 16 },
  typeModalCard: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 17, padding: 17 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontFamily: 'PoppinsSemiBold', fontSize: 14, color: '#202A3A' },
  modalSubtitle: { fontFamily: 'PoppinsRegular', fontSize: 9, color: '#929CAB', marginTop: 3 },
  closeButton: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#F6F7F9', alignItems: 'center', justifyContent: 'center' },
  modalSearch: { minHeight: 42, borderWidth: 1, borderColor: '#E3E7ED', borderRadius: 9, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 7, marginBottom: 9 },
  modalSearchInput: { flex: 1, fontFamily: 'PoppinsRegular', fontSize: 10, color: '#344054', paddingVertical: 8 },
  staffList: { flexGrow: 0 },
  staffOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F2F5', gap: 10 },
  staffAvatar: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#F1EAFF', alignItems: 'center', justifyContent: 'center' },
  staffOptionInfo: { flex: 1 },
  staffOptionName: { fontFamily: 'PoppinsMedium', fontSize: 10, color: '#344054' },
  staffOptionSub: { fontFamily: 'PoppinsRegular', fontSize: 8, color: '#929CAB', marginTop: 3 },
  noStaffText: { fontFamily: 'PoppinsRegular', fontSize: 10, color: '#929CAB', textAlign: 'center', paddingVertical: 22 },
  typeOption: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', paddingVertical: 9 },
  typeOptionText: { fontFamily: 'PoppinsRegular', fontSize: 10, color: '#536176' },
  typeOptionTextActive: { fontFamily: 'PoppinsSemiBold', color: '#7040D5' },
});
