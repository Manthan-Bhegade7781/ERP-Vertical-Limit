import React, { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';

const branches = [
  'Pune Branch',
  'Mumbai Branch',
  'Nashik Branch',
  'Nagpur Branch',
  'Main Branch',
];

export default function AddStudentPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [branch, setBranch] = useState('');
  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState('');

  const [showBranches, setShowBranches] = useState(false);

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter the student name.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Required', 'Please enter the email address.');
      return;
    }

    if (!mobile.trim()) {
      Alert.alert('Required', 'Please enter the mobile number.');
      return;
    }

    if (!branch) {
      Alert.alert('Required', 'Please select a branch.');
      return;
    }

    Alert.alert(
      'Student Added',
      `${fullName} has been added successfully.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Add Student
          </Text>

          <Text style={styles.headerSubtitle}>
            Student Registration
          </Text>
        </View>
      </View>

      {/* FORM */}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>

            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={39}
                color="#7040D5"
              />
            </View>

            <Text style={styles.title}>
              Student Information
            </Text>

            <Text style={styles.description}>
              Enter the student details below.
            </Text>

            {/* FULL NAME */}

            <View style={styles.field}>
              <Text style={styles.label}>
                Full Name *
              </Text>

              <View style={styles.inputBox}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={19}
                  color="#8A98A9"
                />

                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter full name"
                  placeholderTextColor="#A3AFBE"
                  style={styles.input}
                />
              </View>
            </View>

            {/* EMAIL */}

            <View style={styles.field}>
              <Text style={styles.label}>
                Email Address *
              </Text>

              <View style={styles.inputBox}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={19}
                  color="#8A98A9"
                />

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  placeholderTextColor="#A3AFBE"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            {/* MOBILE */}

            <View style={styles.field}>
              <Text style={styles.label}>
                Mobile Number *
              </Text>

              <View style={styles.inputBox}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={19}
                  color="#8A98A9"
                />

                <TextInput
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#A3AFBE"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
            </View>

            {/* BRANCH */}

            <View style={styles.field}>
              <Text style={styles.label}>
                Branch *
              </Text>

              <TouchableOpacity
                style={styles.inputBox}
                onPress={() =>
                  setShowBranches(!showBranches)
                }
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={19}
                  color="#8A98A9"
                />

                <Text
                  style={[
                    styles.selectText,
                    !branch && styles.placeholder,
                  ]}
                >
                  {branch || 'Select branch'}
                </Text>

                <MaterialCommunityIcons
                  name={
                    showBranches
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={19}
                  color="#8A98A9"
                />
              </TouchableOpacity>

              {showBranches && (
                <View style={styles.dropdown}>
                  {branches.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setBranch(item);
                        setShowBranches(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownText}>
                        {item}
                      </Text>

                      {branch === item && (
                        <MaterialCommunityIcons
                          name="check"
                          size={18}
                          color="#7040D5"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* COURSE */}

            <View style={styles.field}>
              <Text style={styles.label}>
                Course
              </Text>

              <View style={styles.inputBox}>
                <MaterialCommunityIcons
                  name="book-open-outline"
                  size={19}
                  color="#8A98A9"
                />

                <TextInput
                  value={course}
                  onChangeText={setCourse}
                  placeholder="Enter course"
                  placeholderTextColor="#A3AFBE"
                  style={styles.input}
                />
              </View>
            </View>

            {/* BATCH */}

            <View style={styles.field}>
              <Text style={styles.label}>
                Batch
              </Text>

              <View style={styles.inputBox}>
                <MaterialCommunityIcons
                  name="account-multiple-outline"
                  size={19}
                  color="#8A98A9"
                />

                <TextInput
                  value={batch}
                  onChangeText={setBatch}
                  placeholder="Enter batch"
                  placeholderTextColor="#A3AFBE"
                  style={styles.input}
                />
              </View>
            </View>

            {/* BUTTONS */}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.saveText}>
                  Create Student
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    minHeight: 76,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 21,
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  iconContainer: {
    width: 78,
    height: 78,
    borderRadius: 23,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },

  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#172033',
    textAlign: 'center',
  },

  description: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#748096',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 22,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#445266',
    marginBottom: 6,
  },

  inputBox: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E6EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#172033',
    marginLeft: 8,
    paddingVertical: 0,
  },

  selectText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#172033',
    marginLeft: 8,
  },

  placeholder: {
    color: '#A3AFBE',
  },

  dropdown: {
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E6EC',
    overflow: 'hidden',
    elevation: 4,
  },

  dropdownItem: {
    minHeight: 43,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },

  dropdownText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#445266',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 7,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#66768A',
  },

  saveButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  saveText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
});