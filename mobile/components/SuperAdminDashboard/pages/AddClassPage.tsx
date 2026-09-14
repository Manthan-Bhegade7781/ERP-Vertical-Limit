import React, { useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const subjects = [
  'Physics',
  'Mathematics',
  'Chemistry',
  'Biology',
];

const batches = [
  '8th Standard',
  '9th Standard',
  '10th Standard',
  '11th Science',
  '12th Science',
  'JEE Batch',
  'NEET Batch',
  'MHT-CET Batch',
];

const branches = [
  'Pune Branch',
  'Mumbai Branch',
  'Nashik Branch',
  'Nagpur Branch',
  'Main Branch',
];

export default function AddClassPage() {
  const insets = useSafeAreaInsets();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [teacher, setTeacher] = useState('');
  const [batch, setBatch] = useState('');
  const [branch, setBranch] = useState('');
  const [room, setRoom] = useState('');

  const saveClass = () => {
    if (
      !date.trim() ||
      !startTime.trim() ||
      !endTime.trim() ||
      selectedSubjects.length === 0 ||
      !teacher.trim() ||
      !batch.trim() ||
      !branch.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please fill all required fields marked with *.'
      );
      return;
    }

    Alert.alert(
      'Class Added',
      'The class has been added to the timetable successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* =========================
          HEADER
      ========================== */}

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

        <Text style={styles.headerTitle}>
          Add Class
        </Text>

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.85}
          onPress={() => {
            Alert.alert(
              'Edit Class',
              'Edit mode is ready for this class form.'
            );
          }}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={17}
            color="#7040D5"
          />
          <Text style={styles.editButtonText}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================
          CONTENT
      ========================== */}

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* PAGE TITLE */}

        <Text style={styles.pageTitle}>
          Add Class
        </Text>

        {/* =========================
            CLASS INFORMATION
        ========================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="calendar-plus-outline"
                size={20}
                color="#7040D5"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Class Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Enter the timetable class details
              </Text>
            </View>
          </View>

          {/* DATE */}

          <FormLabel
            label="Date"
            required
          />

          <Input
            icon="calendar-outline"
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 14 Sep 2026"
          />

          {/* TIME ROW */}

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FormLabel
                label="Start Time"
                required
              />

              <Input
                icon="clock-outline"
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00 AM"
              />
            </View>

            <View style={styles.column}>
              <FormLabel
                label="End Time"
                required
              />

              <Input
                icon="clock-outline"
                value={endTime}
                onChangeText={setEndTime}
                placeholder="10:00 AM"
              />
            </View>
          </View>

          {/* SUBJECT - MULTI SELECT */}

          <FormLabel
            label="Subject"
            required
          />

          <View style={styles.optionWrap}>
            {subjects.map((item) => {
              const isSelected = selectedSubjects.includes(item);

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedSubjects((current) =>
                      current.includes(item)
                        ? current.filter((value) => value !== item)
                        : [...current, item]
                    );
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      isSelected
                        ? 'check-circle'
                        : 'circle-outline'
                    }
                    size={15}
                    color={isSelected ? '#7040D5' : '#7B8496'}
                  />

                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedSubjects.length > 0 && (
            <Text style={styles.selectedSubjectsText}>
              {selectedSubjects.length} subject
              {selectedSubjects.length > 1 ? 's' : ''} selected
            </Text>
          )}

          {/* TEACHER */}

          <FormLabel
            label="Teacher"
            required
          />

          <Input
            icon="account-outline"
            value={teacher}
            onChangeText={setTeacher}
            placeholder="Enter teacher name"
          />

          {/* BATCH */}

          <FormLabel
            label="Batch"
            required
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.horizontalOptions
            }
          >
            {batches.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionButton,
                  batch === item &&
                    styles.optionButtonActive,
                ]}
                onPress={() =>
                  setBatch(item)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    batch === item &&
                      styles.optionTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* BRANCH */}

          <FormLabel
            label="Branch"
            required
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.horizontalOptions
            }
          >
            {branches.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionButton,
                  branch === item &&
                    styles.optionButtonActive,
                ]}
                onPress={() =>
                  setBranch(item)
                }
              >
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={15}
                  color={
                    branch === item
                      ? '#7040D5'
                      : '#7B8496'
                  }
                />

                <Text
                  style={[
                    styles.optionText,
                    branch === item &&
                      styles.optionTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ROOM */}

          <FormLabel label="Room" />

          <Input
            icon="door-open"
            value={room}
            onChangeText={setRoom}
            placeholder="e.g. Room 204"
          />

        </View>

        {/* =========================
            REQUIRED INFORMATION
        ========================== */}

        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={19}
            color="#7040D5"
          />

          <Text style={styles.infoText}>
            Fields marked with * are required.
            Please enter the correct timetable
            information before saving the class.
          </Text>
        </View>

        {/* =========================
            ACTION BUTTONS
        ========================== */}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveClass}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              Save Class
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* =====================================================
   FORM LABEL
===================================================== */

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
      {required && (
        <Text style={styles.required}>
          {' '}
          *
        </Text>
      )}
    </Text>
  );
}

/* =====================================================
   INPUT
===================================================== */

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
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color="#7040D5"
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A2AABB"
        style={styles.input}
      />
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* HEADER */

  header: {
    minHeight: 64,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
  },

  editButton: {
    minHeight: 40,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  editButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#7040D5',
    marginLeft: 4,
  },

  /* CONTENT */

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#172033',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#7B8496',
    marginTop: 2,
    marginBottom: 14,
  },

  /* SECTION CARD */

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 13,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },

  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
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

  /* LABEL */

  formLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#59657A',
    marginTop: 13,
    marginBottom: 5,
  },

  required: {
    color: '#D84B63',
  },

  /* INPUT */

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
    minHeight: 50,
    marginLeft: 8,
    paddingVertical: 0,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
  },

  /* TIME */

  twoColumnRow: {
    flexDirection: 'row',
    gap: 8,
  },

  column: {
    flex: 1,
  },

  /* OPTIONS */

  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  horizontalOptions: {
    gap: 7,
    paddingBottom: 1,
  },

  optionButton: {
    minHeight: 40,
    paddingHorizontal: 11,
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

  selectedSubjectsText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#7040D5',
    marginTop: 6,
  },

  /* INFORMATION */

  infoBox: {
    marginTop: 13,
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

  /* ACTION BUTTONS */

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
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

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});