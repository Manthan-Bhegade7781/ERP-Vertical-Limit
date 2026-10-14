
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

type StaffOption = {
  _id: string;
  fullName: string;
  email: string;
  roles: string[];
  branchId?: string | {
    _id: string;
    name?: string;
    code?: string;
  } | null;
  branch?: {
    _id: string;
    name?: string;
    code?: string;
  };
};

type StaffOptionsResponse = {
  success: boolean;
  message?: string;
  data?: {
    staff?: StaffOption[];
    staffOptions?: StaffOption[];
    users?: StaffOption[];
  };
};

type LeaveResponse = {
  success: boolean;
  message?: string;
  data?: {
    leave?: unknown;
  };
};

const leaveTypes = [
  'Casual Leave',
  'Sick Leave',
  'Earned Leave',
  'Emergency Leave',
  'Other',
];

function formatDateForApi(value: string): string | null {
  const trimmed = value.trim();

  // Accept YYYY-MM-DD or DD/MM/YYYY.
  let normalized = trimmed;

  const dmyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dmyMatch) {
    normalized = `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
  }

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return normalized;
}

export default function AddLeavePage() {
  const { user } = useAuth();

  const roles = user?.roles ?? [];
  const isTeacherOnly =
    roles.includes('teacher') &&
    !roles.includes('admin') &&
    !roles.includes('super_admin');

  const canChooseStaff =
    roles.includes('super_admin') || roles.includes('admin');

  const [staff, setStaff] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffOption[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canChooseStaff) {
      return;
    }

    let cancelled = false;

    const loadStaff = async () => {
      setLoadingStaff(true);

      try {
        const token = await getToken();

        if (!token) {
          throw new Error('Your session has expired. Please log in again.');
        }

        const response = await fetch(
          `${API_BASE_URL}/leaves/staff-options`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result: StaffOptionsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Unable to load staff members.'
          );
        }

        // The exact array key should match the controller response.
        const options =
          result.data?.staff ??
          result.data?.staffOptions ??
          result.data?.users ??
          [];

        if (!cancelled) {
          setStaffMembers(options);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to load staff members.';

          Alert.alert('Staff Loading Error', message);
        }
      } finally {
        if (!cancelled) {
          setLoadingStaff(false);
        }
      }
    };

    loadStaff();

    return () => {
      cancelled = true;
    };
  }, [canChooseStaff]);

  const saveLeave = async () => {
    if (saving) {
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in again.');
      return;
    }

    if (!isTeacherOnly && !canChooseStaff) {
      Alert.alert(
        'Access Denied',
        'Your account does not have permission to create leave requests.'
      );
      return;
    }

    if (!leaveType || !fromDate.trim() || !toDate.trim() || !reason.trim()) {
      Alert.alert(
        'Required Fields',
        'Please fill all required fields marked with *.'
      );
      return;
    }

    if (canChooseStaff && !staff) {
      Alert.alert('Required Fields', 'Please select a staff member.');
      return;
    }

    const normalizedFromDate = formatDateForApi(fromDate);
    const normalizedToDate = formatDateForApi(toDate);

    if (!normalizedFromDate || !normalizedToDate) {
      Alert.alert(
        'Invalid Date',
        'Enter dates as YYYY-MM-DD or DD/MM/YYYY, for example 2026-10-20.'
      );
      return;
    }

    if (normalizedToDate < normalizedFromDate) {
      Alert.alert(
        'Invalid Date Range',
        'The To Date cannot be earlier than the From Date.'
      );
      return;
    }

    setSaving(true);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const payload: {
        staffId?: string;
        leaveType: string;
        fromDate: string;
        toDate: string;
        reason: string;
      } = {
        leaveType,
        fromDate: normalizedFromDate,
        toDate: normalizedToDate,
        reason: reason.trim(),
      };

      // The backend derives the staff member from the Teacher's token.
      if (canChooseStaff) {
        payload.staffId = staff;
      }

      const response = await fetch(`${API_BASE_URL}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result: LeaveResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to create leave request.');
      }

      Alert.alert(
        'Leave Added',
        result.message || 'The leave request was created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while creating the leave request.';

      Alert.alert('Unable to Save Leave', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Leave</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Add Leave</Text>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="calendar-plus-outline"
                size={20}
                color="#7040D5"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Leave Information</Text>
              <Text style={styles.sectionSubtitle}>
                Enter the leave details
              </Text>
            </View>
          </View>

          {canChooseStaff && (
            <>
              <FormLabel label="Staff" required />

              {loadingStaff ? (
                <View style={styles.loadingStaff}>
                  <ActivityIndicator color="#7040D5" />
                  <Text style={styles.loadingText}>Loading staff...</Text>
                </View>
              ) : staffMembers.length === 0 ? (
                <Text style={styles.emptyStaffText}>
                  No eligible staff members found.
                </Text>
              ) : (
                <View style={styles.staffOptionWrap}>
                  {staffMembers.map((item) => {
                    const selected = staff === item._id;

                    return (
                      <TouchableOpacity
                        key={item._id}
                        style={[
                          styles.staffOptionButton,
                          selected && styles.optionButtonActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setStaff(item._id)}
                      >
                        <MaterialCommunityIcons
                          name={
                            selected
                              ? 'check-circle'
                              : 'account-outline'
                          }
                          size={14}
                          color={selected ? '#7040D5' : '#7B8496'}
                        />

                        <Text
                          numberOfLines={1}
                          style={[
                            styles.optionText,
                            selected && styles.optionTextActive,
                          ]}
                        >
                          {item.fullName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {isTeacherOnly && (
            <View style={styles.teacherInfo}>
              <MaterialCommunityIcons
                name="account-check-outline"
                size={18}
                color="#7040D5"
              />
              <Text style={styles.teacherInfoText}>
                Leave request will be created for {user?.fullName}.
              </Text>
            </View>
          )}

          <FormLabel label="Leave Type" required />

          <View style={styles.optionWrap}>
            {leaveTypes.map((item) => {
              const selected = leaveType === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setLeaveType(item)}
                >
                  <MaterialCommunityIcons
                    name={
                      selected
                        ? 'check-circle'
                        : 'calendar-blank-outline'
                    }
                    size={15}
                    color={selected ? '#7040D5' : '#7B8496'}
                  />

                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FormLabel label="From Date" required />
              <Input
                icon="calendar-outline"
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.column}>
              <FormLabel label="To Date" required />
              <Input
                icon="calendar-outline"
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <FormLabel label="Reason" required />

          <View style={styles.textAreaWrapper}>
            <MaterialCommunityIcons
              name="text-box-outline"
              size={18}
              color="#7040D5"
            />

            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Enter reason for leave"
              placeholderTextColor="#A2AABB"
              multiline
              textAlignVertical="top"
              style={styles.textArea}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={19}
            color="#7040D5"
          />

          <Text style={styles.infoText}>
            Fields marked with * are required. Leave duration and status are
            calculated by the server. New requests are submitted as pending.
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            disabled={saving}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.85}
            disabled={saving || loadingStaff}
            onPress={saveLeave}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={19}
                color="#FFFFFF"
              />
            )}

            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Leave'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.formLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

function Input({
  icon,
  value,
  onChangeText,
  placeholder,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputWrapper}>
      <MaterialCommunityIcons name={icon} size={18} color="#7040D5" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A2AABB"
        style={styles.input}
        autoCapitalize="none"
      />
    </View>
  );
}

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
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  headerTitle: {
    flex: 1,
    minWidth: 0,
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
  },

  headerSpacer: {
    width: 40,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 24,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#172033',
    marginBottom: 14,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#172033',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8A93A4',
    marginTop: 1,
  },

  formLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#59657A',
    marginTop: 10,
    marginBottom: 5,
  },

  required: {
    color: '#D84B63',
  },

  loadingStaff: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  loadingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7B8496',
  },

  emptyStaffText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#D84B63',
    paddingVertical: 10,
  },

  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1EAFF',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },

  teacherInfoText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7040D5',
  },

  
staffOptionWrap: {
  flexDirection: 'column',
  gap: 8,
  marginTop: 4,
},


  
staffOptionButton: {
  width: '100%',
  minHeight: 52,
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E2E5EC',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 10,
},


  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  optionButton: {
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  optionButtonActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  optionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#687386',
  },

  optionTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  inputWrapper: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
  },

  input: {
    flex: 1,
    minHeight: 52,
    marginLeft: 8,
    paddingVertical: 0,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 8,
  },

  column: {
    flex: 1,
    minWidth: 0,
  },

  textAreaWrapper: {
    minHeight: 92,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 11,
    paddingTop: 12,
  },

  textArea: {
    flex: 1,
    minHeight: 80,
    marginLeft: 8,
    padding: 0,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
  },

  infoBox: {
    marginTop: 11,
    borderRadius: 11,
    backgroundColor: '#F1EAFF',
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  infoText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#7040D5',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E3EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#687386',
  },

  saveButton: {
    flex: 1.4,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});
