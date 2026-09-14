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

const roles = [
  'Branch Manager',
  'Teacher',
  'Accountant',
  'Staff',
];

const branches = [
  'Main Branch',
  'Pune Branch',
  'Nashik Branch',
  'Mumbai Branch',
];

export default function AddUserPage() {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [branch, setBranch] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = () => {
    if (
      !name.trim() ||
      !employeeId.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !role ||
      !branch ||
      !password.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please fill all required fields marked with *.'
      );
      return;
    }

    Alert.alert(
      'User Added',
      'The user has been added successfully.',
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

        <Text style={styles.headerTitle}>Add User</Text>

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              'Edit User',
              'Edit mode is ready for this user form.'
            )
          }
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
        <Text style={styles.pageTitle}>Add User</Text>

        <Text style={styles.pageSubtitle}>
          Create a new system user
        </Text>

        {/* USER INFORMATION */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={21}
                color="#7040D5"
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                User Information
              </Text>
              <Text style={styles.sectionSubtitle}>
                Enter the user's account details
              </Text>
            </View>
          </View>

          <FormLabel label="Full Name" required />
          <Input
            icon="account-outline"
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
          />

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FormLabel label="Employee ID" required />
              <Input
                icon="card-account-details-outline"
                value={employeeId}
                onChangeText={setEmployeeId}
                placeholder="e.g. VLCC-EMP-010"
              />
            </View>

            <View style={styles.column}>
              <FormLabel label="Phone" required />
              <Input
                icon="phone-outline"
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <FormLabel label="Email" required />
          <Input
            icon="email-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormLabel label="Role" required />

          <View style={styles.optionWrap}>
            {roles.map((item) => {
              const selected = role === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setRole(item)}
                >
                  <MaterialCommunityIcons
                    name={
                      selected
                        ? 'check-circle'
                        : 'account-badge-outline'
                    }
                    size={15}
                    color={
                      selected ? '#7040D5' : '#7B8496'
                    }
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

          <FormLabel label="Branch" required />

          <View style={styles.optionWrap}>
            {branches.map((item) => {
              const selected = branch === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setBranch(item)}
                >
                  <MaterialCommunityIcons
                    name={
                      selected
                        ? 'check-circle'
                        : 'office-building-outline'
                    }
                    size={15}
                    color={
                      selected ? '#7040D5' : '#7B8496'
                    }
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

          <FormLabel label="Password" required />
          <Input
            icon="lock-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter temporary password"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {/* INFO */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color="#7040D5"
          />

          <Text style={styles.infoText}>
            Fields marked with * are required. The user can
            change the temporary password after signing in.
          </Text>
        </View>

        {/* ACTIONS */}
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
            onPress={handleSave}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              Save User
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
  keyboardType,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
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
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
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
    fontSize: 18,
  },

  editButton: {
    minHeight: 36,
    minWidth: 82,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  editButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 4,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
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
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 13,
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
    fontSize: 13.5,
    color: '#172033',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A93A4',
    marginTop: 1,
  },

  formLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#59657A',
    marginTop: 10,
    marginBottom: 5,
  },

  required: {
    color: '#D84B63',
  },

  inputWrapper: {
    minHeight: 43,
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
    minHeight: 41,
    marginLeft: 8,
    paddingVertical: 0,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 8,
  },

  column: {
    flex: 1,
    minWidth: 0,
  },

  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  optionButton: {
    minHeight: 34,
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
    fontSize: 9,
    color: '#687386',
  },

  optionTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
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
    fontSize: 8.8,
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
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E3EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#687386',
  },

  saveButton: {
    flex: 1.4,
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },
});
