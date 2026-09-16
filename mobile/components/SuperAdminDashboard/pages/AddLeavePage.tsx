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
import { SafeAreaView } from 'react-native-safe-area-context';

const staffMembers = [
  'Rahul Sharma',
  'Priya Singh',
  'Amit Kumar',
  'Neha Joshi',
  'Vikas Patil',
  'Sneha Kulkarni',
];

const leaveTypes = [
  'Casual Leave',
  'Sick Leave',
  'Earned Leave',
  'Emergency Leave',
  'Other',
];

export default function AddLeavePage() {
  const [staff, setStaff] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const saveLeave = () => {
    if (
      !staff.trim() ||
      !leaveType.trim() ||
      !fromDate.trim() ||
      !toDate.trim() ||
      !reason.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please fill all required fields marked with *.'
      );
      return;
    }

    Alert.alert(
      'Leave Added',
      'The staff leave request has been added successfully.',
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
      edges={['top', 'bottom']}
    >
      {/* HEADER */}
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

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.85}
          onPress={() => {
            Alert.alert(
              'Edit Leave',
              'Edit mode is ready for this leave form.'
            );
          }}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={17}
            color="#7040D5"
          />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Add Leave</Text>

        {/* LEAVE INFORMATION */}
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
              <Text style={styles.sectionTitle}>
                Leave Information
              </Text>
              <Text style={styles.sectionSubtitle}>
                Enter the staff leave details
              </Text>
            </View>
          </View>

          {/* STAFF */}
          <FormLabel label="Staff" required />

          <View style={styles.staffOptionWrap}>
            {staffMembers.map((item) => {
              const selected = staff === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.staffOptionButton,
                    selected && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setStaff(item)}
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
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* LEAVE TYPE */}
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

          {/* DATE ROW */}
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FormLabel label="From Date" required />
              <Input
                icon="calendar-outline"
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="e.g. 15 Sep 2026"
              />
            </View>

            <View style={styles.column}>
              <FormLabel label="To Date" required />
              <Input
                icon="calendar-outline"
                value={toDate}
                onChangeText={setToDate}
                placeholder="e.g. 17 Sep 2026"
              />
            </View>
          </View>

          {/* REASON */}
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

        {/* INFORMATION */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={19}
            color="#7040D5"
          />

          <Text style={styles.infoText}>
            Fields marked with * are required. Please enter
            the correct staff and leave information before
            saving the request.
          </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.85}
            onPress={saveLeave}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              Save Leave
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
      {required && (
        <Text style={styles.required}> *</Text>
      )}
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

  editButton: {
    minHeight: 36,
    minWidth: 88,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
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
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7B8496',
    marginTop: 1,
    marginBottom: 14,
  },

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
  },

  staffOptionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 6,
  },

  staffOptionButton: {
    minHeight: 40,
    flexGrow: 1,
    flexBasis: '30%',
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});
