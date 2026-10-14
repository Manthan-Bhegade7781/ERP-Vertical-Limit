import React, { useState } from 'react';
import {
  Alert,
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

const academicYearOptions: Option[] = [
  { label: '2026-27', value: '2026-27' },
  { label: '2027-28', value: '2027-28' },
  { label: '2028-29', value: '2028-29' },
];

const branchOptions: Option[] = [
  { label: 'Pune Branch', value: 'pune' },
  { label: 'Mumbai Branch', value: 'mumbai' },
  { label: 'Nashik Branch', value: 'nashik' },
  { label: 'Nagpur Branch', value: 'nagpur' },
  { label: 'Main Branch', value: 'main' },
];

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
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Option[];
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <Pressable
        style={[
          styles.select,
          open && styles.selectOpen,
        ]}
        onPress={() => setOpen(!open)}
      >
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholderText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value || placeholder}
        </Text>

        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#7B7F8D"
        />
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={styles.dropdownItem}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  value === option.value &&
                    styles.dropdownTextSelected,
                ]}
              >
                {option.label}
              </Text>

              {value === option.value && (
                <MaterialCommunityIcons
                  name="check"
                  size={17}
                  color="#7040D5"
                />
              )}
            </Pressable>
          ))}
        </View>
      )}
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

  const toggleDay = (day: string) => {
    if (classDays.includes(day)) {
      setClassDays(
        classDays.filter((item) => item !== day)
      );
    } else {
      setClassDays([...classDays, day]);
    }
  };

  const handleAddBatch = () => {
    if (
      !batchName.trim() ||
      !batchCode.trim() ||
      !standard ||
      !academicYear ||
      !branch ||
      !startDate.trim() ||
      !endDate.trim() ||
      !startTime.trim() ||
      !endTime.trim() ||
      classDays.length === 0 ||
      !maximumStudents.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please fill all required fields marked with *.'
      );
      return;
    }

    const capacity = Number(maximumStudents);

    if (
      !Number.isInteger(capacity) ||
      capacity <= 0
    ) {
      Alert.alert(
        'Invalid Capacity',
        'Maximum Students must be a positive whole number.'
      );
      return;
    }

    Alert.alert(
      'Batch Added',
      `${batchName} has been added successfully.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
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
                    options={academicYearOptions}
                    required
                    onChange={setAcademicYear}
                  />
                </View>

                <View style={styles.halfField}>
                  <SelectField
                    label="Branch"
                    value={branch}
                    placeholder="Select branch"
                    options={branchOptions}
                    required
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
            >
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.addButtonText}>
                Add Batch
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