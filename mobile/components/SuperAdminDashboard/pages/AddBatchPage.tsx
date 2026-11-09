import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/config/api';
import * as SecureStore from 'expo-secure-store';

type Option = {
  label: string;
  value: string;
};

const standardOptions: Option[] = [
  { label: '8th', value: '8th' },
  { label: '9th', value: '9th' },
  { label: '10th', value: '10th' },
  { label: '11th', value: '11th' },
  { label: '12th', value: '12th' },
];

type BranchItem = { _id: string; name: string; code?: string; status?: string; isActive?: boolean; isRemoved?: boolean };
type AcademicYearItem = { _id: string; name: string; status?: string; isActive?: boolean; isRemoved?: boolean };

type ApiEnvelope = {
  success?: boolean;
  message?: string;
  data?: unknown;
  branches?: unknown;
  academicYears?: unknown;
};

function getRows<T>(payload: ApiEnvelope, key: 'branches' | 'academicYears'): T[] {
  const data = payload?.data;
  let rows: unknown;

  if (Array.isArray(data)) {
    rows = data;
  } else if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    rows = record[key] ?? record.items ?? record.results;
  }

  if (!Array.isArray(rows)) {
    rows = payload?.[key];
  }

  return Array.isArray(rows) ? (rows as T[]) : [];
}

function isActiveOption(item: { status?: string; isActive?: boolean; isRemoved?: boolean }): boolean {
  if (item.isRemoved === true || item.isActive === false) return false;
  if (!item.status) return true;
  const status = item.status.trim().toLowerCase();
  return status === 'active' || status === 'current' || status === 'ongoing';
}

async function readApiResponse(response: Response): Promise<ApiEnvelope> {
  const rawText = await response.text();
  let payload: ApiEnvelope = {};
  if (rawText.trim()) {
    try {
      payload = JSON.parse(rawText) as ApiEnvelope;
    } catch {
      throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
    }
  }
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Request failed (HTTP ${response.status}).`);
  }
  return payload;
}

function toApiDate(value: string): string | null {
  const text = value.trim();
  const dmy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const date = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    if (date.getFullYear() !== Number(dmy[3]) || date.getMonth() !== Number(dmy[2]) - 1 || date.getDate() !== Number(dmy[1])) return null;
    return `${dmy[3]}-${String(Number(dmy[2])).padStart(2, '0')}-${String(Number(dmy[1])).padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return null;
}

function toApiTime(value: string): string | null {
  const text = value.trim().toUpperCase();
  const match = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match) {
    let hour = Number(match[1]); const minute = Number(match[2]);
    if (hour < 1 || hour > 12 || minute > 59) return null;
    if (match[3] === 'AM') hour = hour === 12 ? 0 : hour;
    else hour = hour === 12 ? 12 : hour + 12;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  const h24 = text.match(/^(\d{2}):(\d{2})$/);
  if (h24 && Number(h24[1]) < 24 && Number(h24[2]) < 60) return text;
  return null;
}

const dayOptions: Option[] = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
  { label: 'Saturday', value: 'Saturday' },
  { label: 'Sunday', value: 'Sunday' },
];

function SelectField({
  label,
  value,
  placeholder,
  options,
  required = false,
  onChange,
  disabled = false,
  loading = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Option[];
  required?: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const displayedValue = selectedOption?.label ?? '';

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${displayedValue || placeholder}`}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        style={[
          styles.select,
          open && styles.selectOpen,
          disabled && styles.selectDisabled,
        ]}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[
            styles.selectText,
            !displayedValue && styles.placeholderText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {loading ? 'Loading options...' : displayedValue || placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={disabled ? '#B8BAC4' : '#7B7F8D'}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityLabel="Close dropdown"
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close options"
              >
                <MaterialCommunityIcons name="close" size={22} color="#555866" />
              </Pressable>
            </View>

            {options.length === 0 ? (
              <View style={styles.emptyOptions}>
                <Text style={styles.emptyOptionsText}>
                  {loading ? 'Loading options...' : `No ${label.toLowerCase()} options available.`}
                </Text>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                keyboardShouldPersistTaps="handled"
                style={styles.optionsList}
                renderItem={({ item }) => {
                  const selected = item.value === value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        styles.dropdownItem,
                        selected && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        onChange(item.value);
                        setOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          selected && styles.dropdownTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {selected && (
                        <MaterialCommunityIcons
                          name="check"
                          size={18}
                          color="#7040D5"
                        />
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
  color = '#7040D5',
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  color?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionIcon,
          { backgroundColor: `${color}15` },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

export default function AddBatchPage() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [batchName, setBatchName] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [standard, setStandard] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  const [branch, setBranch] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [classDays, setClassDays] = useState<string[]>(
    []
  );

  const [maximumStudents, setMaximumStudents] =
    useState('');

  const [description, setDescription] = useState('');

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      const [branchResponse, yearResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/branches/active`, { headers }),
        fetch(`${API_BASE_URL}/academic-years`, { headers }),
      ]);

      const [branchResult, yearResult] = await Promise.all([
        readApiResponse(branchResponse),
        readApiResponse(yearResponse),
      ]);

      const branchRows = getRows<BranchItem>(branchResult, 'branches');
      const yearRows = getRows<AcademicYearItem>(yearResult, 'academicYears');

      const validBranches = branchRows.filter(
        (item) => Boolean(item?._id && item?.name) && isActiveOption(item),
      );
      const validYears = yearRows.filter(
        // Academic years may be marked Upcoming/Current rather than Active.
        // Keep every selectable year unless it is explicitly removed/disabled.
        (item) => Boolean(item?.name) && item?.isRemoved !== true && item?.isActive !== false,
      );

      setBranches(validBranches);
      setAcademicYears(validYears);

      // Reset selections only when the currently selected item is no longer available.
      setBranch((current) =>
        validBranches.some((item) => item._id === current) ? current : '',
      );
      setAcademicYear((current) =>
        validYears.some((item) => item.name === current) ? current : '',
      );

      if (validBranches.length === 0 || validYears.length === 0) {
        console.warn('Batch dropdown options are empty.', {
          branchCount: validBranches.length,
          academicYearCount: validYears.length,
        });
      }
    } catch (error) {
      Alert.alert(
        'Unable to load options',
        error instanceof Error
          ? error.message
          : 'Could not load branches and academic years. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => { void loadOptions(); } },
        ],
      );
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => { void loadOptions(); }, [loadOptions]);

  const toggleDay = (day: string) => {
    if (classDays.includes(day)) {
      setClassDays(
        classDays.filter((item) => item !== day)
      );
    } else {
      setClassDays([...classDays, day]);
    }
  };

  const handleAddBatch = async () => {
    if (!batchName.trim() || !batchCode.trim() || !standard || !academicYear || !branch || !startDate.trim() || !endDate.trim() || !startTime.trim() || !endTime.trim() || classDays.length === 0 || !maximumStudents.trim()) {
      Alert.alert('Required Fields', 'Please fill all required fields marked with *.');
      return;
    }
    const capacity = Number(maximumStudents);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      Alert.alert('Invalid Capacity', 'Maximum Students must be a positive whole number.');
      return;
    }
    const apiStartDate = toApiDate(startDate);
    const apiEndDate = toApiDate(endDate);
    const apiStartTime = toApiTime(startTime);
    const apiEndTime = toApiTime(endTime);
    if (!apiStartDate || !apiEndDate) {
      Alert.alert('Invalid Date', 'Enter dates as DD/MM/YYYY or YYYY-MM-DD.');
      return;
    }
    if (new Date(apiStartDate) > new Date(apiEndDate)) {
      Alert.alert('Invalid Date Range', 'Start date cannot be after end date.');
      return;
    }
    if (!apiStartTime || !apiEndTime) {
      Alert.alert('Invalid Time', 'Enter times like 08:00 AM or 17:00.');
      return;
    }
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) throw new Error('Please log in again to create a batch.');
      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: batchName.trim(), code: batchCode.trim().toUpperCase(), standard,
          academicYear: academicYear.trim(), branchId: branch,
          startDate: apiStartDate, endDate: apiEndDate,
          schedule: { startTime: apiStartTime, endTime: apiEndTime, days: classDays },
          capacity, description: description.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to create batch.');
      Alert.alert('Batch Added', result.message || `${batchName} has been added successfully.`, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Unable to add batch', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Add Batch
          </Text>

        </View>

        {/* CONTENT */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* PAGE HEADING */}
          <View style={styles.pageHeading}>
            <Text style={styles.pageTitle}>
              Batch Information
            </Text>

            <Text style={styles.pageSubtitle}>
              Create and configure an academic batch.
            </Text>
            {loadingOptions && <Text style={{ marginTop: 8, color: '#7B7F8D' }}>Loading branches and academic years...</Text>}
            {!loadingOptions && (branches.length === 0 || academicYears.length === 0) && (
              <View style={styles.optionsWarning}>
                <Text style={styles.optionsWarningText}>
                  {branches.length === 0 ? 'No active branches found. ' : ''}
                  {academicYears.length === 0 ? 'No active academic years found. ' : ''}
                  Check the backend records or retry loading.
                </Text>
                <Pressable style={styles.retryButton} onPress={() => { void loadOptions(); }}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* BASIC INFORMATION */}
          <View style={styles.card}>
            <SectionHeader
              icon="information-outline"
              title="Basic Information"
              color="#7040D5"
            />

            <View style={styles.fieldGroup}>
              <View style={styles.fullWidth}>
                <Text style={styles.label}>
                  Batch Name
                  <Text style={styles.required}>
                    {' '}
                    *
                  </Text>
                </Text>

                <TextInput
                  value={batchName}
                  onChangeText={setBatchName}
                  placeholder="Enter batch name"
                  placeholderTextColor="#A1A4AE"
                  style={styles.input}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>
                    Batch Code
                    <Text style={styles.required}>
                      {' '}
                      *
                    </Text>
                  </Text>

                  <TextInput
                    value={batchCode}
                    onChangeText={setBatchCode}
                    placeholder="e.g. 12JEE-M01"
                    placeholderTextColor="#A1A4AE"
                    style={styles.input}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.halfField}>
                  <SelectField
                    label="Standard"
                    value={standard}
                    placeholder="Select standard"
                    options={standardOptions}
                    required
                    onChange={setStandard}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <SelectField
                    label="Academic Year"
                    value={academicYear}
                    placeholder="Select year"
                    options={academicYears.map((item) => ({ label: item.name, value: item.name }))}
                    required
                    loading={loadingOptions}
                    disabled={loadingOptions}
                    onChange={setAcademicYear}
                  />
                </View>

                <View style={styles.halfField}>
                  <SelectField
                    label="Branch"
                    value={branch}
                    placeholder="Select branch"
                    options={branches.map((item) => ({
                      label: item.code ? `${item.name} (${item.code})` : item.name,
                      value: item._id,
                    }))}
                    required
                    loading={loadingOptions}
                    disabled={loadingOptions}
                    onChange={setBranch}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* BATCH DURATION */}
          <View style={styles.card}>
            <SectionHeader
              icon="calendar-range-outline"
              title="Batch Duration"
              color="#36A269"
            />

            <View style={styles.fieldGroup}>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>
                    Start Date
                    <Text style={styles.required}>
                      {' '}
                      *
                    </Text>
                  </Text>

                  <View style={styles.inputWithIcon}>
                    <TextInput
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A1A4AE"
                      style={styles.iconInput}
                    />

                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={18}
                      color="#858997"
                    />
                  </View>
                </View>

                <View style={styles.halfField}>
                  <Text style={styles.label}>
                    End Date
                    <Text style={styles.required}>
                      {' '}
                      *
                    </Text>
                  </Text>

                  <View style={styles.inputWithIcon}>
                    <TextInput
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A1A4AE"
                      style={styles.iconInput}
                    />

                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={18}
                      color="#858997"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* SCHEDULE */}
          <View style={styles.card}>
            <SectionHeader
              icon="clock-outline"
              title="Schedule"
              color="#F09A3E"
            />

            <View style={styles.fieldGroup}>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>
                    Start Time
                    <Text style={styles.required}>
                      {' '}
                      *
                    </Text>
                  </Text>

                  <View style={styles.inputWithIcon}>
                    <TextInput
                      value={startTime}
                      onChangeText={setStartTime}
                      placeholder="e.g. 08:00 AM"
                      placeholderTextColor="#A1A4AE"
                      style={styles.iconInput}
                    />

                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color="#858997"
                    />
                  </View>
                </View>

                <View style={styles.halfField}>
                  <Text style={styles.label}>
                    End Time
                    <Text style={styles.required}>
                      {' '}
                      *
                    </Text>
                  </Text>

                  <View style={styles.inputWithIcon}>
                    <TextInput
                      value={endTime}
                      onChangeText={setEndTime}
                      placeholder="e.g. 10:00 AM"
                      placeholderTextColor="#A1A4AE"
                      style={styles.iconInput}
                    />

                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color="#858997"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.daysContainer}>
                <Text style={styles.label}>
                  Class Days
                  <Text style={styles.required}>
                    {' '}
                    *
                  </Text>
                </Text>

                <View style={styles.daysWrap}>
                  {dayOptions.map((day) => {
                    const selected =
                      classDays.includes(day.value);

                    return (
                      <Pressable
                        key={day.value}
                        style={[
                          styles.dayButton,
                          selected &&
                            styles.dayButtonSelected,
                        ]}
                        onPress={() =>
                          toggleDay(day.value)
                        }
                      >
                        <Text
                          style={[
                            styles.dayButtonText,
                            selected &&
                              styles.dayButtonTextSelected,
                          ]}
                        >
                          {day.label.slice(0, 3)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* CAPACITY & STATUS */}
          <View style={styles.card}>
            <SectionHeader
              icon="account-group-outline"
              title="Capacity & Status"
              color="#E55B87"
            />

            <View style={styles.fieldGroup}>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>
                    Maximum Students
                    <Text style={styles.required}>
                      {' '}
                      *
                    </Text>
                  </Text>

                  <TextInput
                    value={maximumStudents}
                    onChangeText={setMaximumStudents}
                    placeholder="e.g. 60"
                    placeholderTextColor="#A1A4AE"
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.card}>
            <SectionHeader
              icon="text-box-outline"
              title="Description"
              color="#7040D5"
            />

            <Text style={styles.label}>
              Batch Description
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter batch description (optional)"
              placeholderTextColor="#A1A4AE"
              style={styles.textArea}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* INFORMATION NOTICE */}
          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color="#7040D5"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Batch Information
              </Text>

              <Text style={styles.infoText}>
                Fields marked with * are required. Subject and
                teacher assignments are managed separately
                after the batch is created.
              </Text>
            </View>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={styles.addButton}
              onPress={handleAddBatch}
          disabled={saving || loadingOptions || branches.length === 0 || academicYears.length === 0}
            >
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.addButtonText}>
                {saving ? 'Saving...' : 'Add Batch'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /*
   * The SafeAreaView itself is purple so the status-bar
   * area blends perfectly with the header.
   */
  safeArea: {
    flex: 1,
    backgroundColor: '#7040D5',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /*
   * HEADER
   */
  header: {
    height: 64,
    width: '100%',
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  /*
   * PAGE HEADING
   */
  pageHeading: {
    marginBottom: 14,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#29243C',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#858195',
    marginTop: 3,
  },

  /*
   * CARDS
   */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 15,
    marginBottom: 13,

    shadowColor: '#4B3B78',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#302B40',
  },

  fieldGroup: {
    gap: 12,
  },

  fieldContainer: {
    width: '100%',
    position: 'relative',
  },

  fullWidth: {
    width: '100%',
  },

  row: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },

  halfField: {
    flex: 1,
    minWidth: 0,
    maxWidth: '50%',
  },

  label: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#555866',
    marginBottom: 6,
  },

  required: {
    color: '#E15B7D',
  },

  /*
   * INPUTS
   */
  input: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: '#FFFFFF',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    includeFontPadding: false,
    color: '#34323E',
  },

  inputWithIcon: {
    width: '100%',
    minWidth: 0,
    height: 52,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E3E6ED',
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 11,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconInput: {
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
    height: 50,
    padding: 0,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#34323E',
  },

  textArea: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#34323E',
    includeFontPadding: false,
  },

  /*
   * SELECT
   */
  select: {
    width: '100%',
    minWidth: 0,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  selectOpen: {
    borderColor: '#7040D5',
  },

  selectDisabled: {
    backgroundColor: '#F4F5F8',
    borderColor: '#E8E9EF',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 16, 35, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  modalCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  modalHeader: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  modalTitle: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#302B40',
    marginRight: 12,
  },

  optionsList: {
    flexGrow: 0,
  },

  dropdownItemSelected: {
    backgroundColor: '#F5F1FF',
  },

  emptyOptions: {
    paddingHorizontal: 18,
    paddingVertical: 24,
  },

  emptyOptionsText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#7B7F8D',
    textAlign: 'center',
  },

  optionsWarning: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
  },

  optionsWarningText: {
    color: '#9A3412',
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: '#7040D5',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
  },

  selectText: {
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#34323E',
    marginRight: 6,
  },

  placeholderText: {
    color: '#A1A4AE',
  },

  /*
   * DROPDOWN
   */
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E4E5EC',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 5,

    shadowColor: '#4B3B78',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 100,
  },

  dropdownItem: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F5',
  },

  dropdownText: {
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#555866',
  },

  dropdownTextSelected: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  /*
   * CLASS DAYS
   */
  daysContainer: {
    marginTop: 1,
  },

  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  dayButton: {
    minWidth: 50,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E3EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayButtonSelected: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  dayButtonText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#707381',
  },

  dayButtonTextSelected: {
    color: '#FFFFFF',
  },

  /*
   * INFORMATION BOX
   */
  infoBox: {
    backgroundColor: '#F3F0FF',
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E6DFFF',
  },

  infoIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#4C3A88',
    marginBottom: 2,
  },

  infoText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 15,
    color: '#746B91',
  },

  /*
   * ACTION BUTTONS
   */
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 2,
  },

  cancelButton: {
    minWidth: 100,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCDDE5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#626572',
  },

  addButton: {
    minWidth: 125,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  addButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});