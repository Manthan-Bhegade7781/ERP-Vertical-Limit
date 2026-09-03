import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import AuthInput from './AuthInput';
import RoleSelector, { UserRole } from './RoleSelector';
import { AuthScreen } from './AuthScreen';
import { API_BASE_URL } from '@/config/api';

type Branch = {
  _id: string;
  name: string;
  code: string;
};

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [branchModalVisible, setBranchModalVisible] =
    useState(false);
  const selectedBranch = branches.find(
  (item) => item._id === branch
);

  useEffect(() => {
  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      setBranchesError('');

      const response = await fetch(
        `${API_BASE_URL}/branches`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to fetch branches'
        );
      }

      setBranches(result.data.branches);
    } catch (error) {
      console.error('Fetch branches error:', error);

      setBranchesError(
        'Unable to load branches. Please try again.'
      );
    } finally {
      setBranchesLoading(false);
    }
  };

  fetchBranches();
}, []);

  const handleRegister = async () => {
    // Required fields
    if (
      !name.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !branch ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Missing details',
        'Please fill in all required fields.'
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Passwords do not match.'
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: name.trim(),
            email: email.trim(),
            password,
            mobileNumber: mobile.trim(),
            role: role.toLowerCase(),
            branchId: branch,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        Alert.alert(
          'Registration failed',
          result.message || 'Unable to create your account.'
        );
        return;
      }

      Alert.alert(
        'Registration submitted',
        result.message ||
          'Your account has been submitted for Super Admin approval.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);

      Alert.alert(
        'Connection error',
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    }
  };

  return (
    <AuthScreen footer={false}>

      {/* Heading */}

      <View style={styles.heading}>
        <Text style={styles.title}>
          Create Account
        </Text>

        <Text style={styles.subtitle}>
          Register to get started with Vertical Classes
        </Text>
      </View>

      {/* Full Name */}

      <AuthInput
        label="Full Name"
        icon="person-outline"
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        autoCapitalize="words"
      />

      {/* Email */}

      <AuthInput
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Mobile Number */}

      <AuthInput
        label="Mobile Number"
        icon="call-outline"
        value={mobile}
        onChangeText={setMobile}
        placeholder="Enter your 10-digit mobile number"
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      {/* Branch */}

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Branch Name
        </Text>

        <TouchableOpacity
          style={[
            styles.branchSelector,
            selectedBranch &&
            styles.branchSelectorSelected
          ]}
          activeOpacity={0.8}
          onPress={() =>
            setBranchModalVisible(true)
          }
        >
          <MaterialCommunityIcons
            name="office-building-outline"
            size={22}
            color="#A5A9B8"
            style={styles.branchIcon}
          />

          <Text
            style={[
              styles.branchText,
              !branch &&
                styles.branchPlaceholder,
            ]}
          >
            {selectedBranch?.name || 'Select your branch'}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color="#77767D"
          />
        </TouchableOpacity>
      </View>

      {/* Branch Modal */}

      <Modal
        visible={branchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setBranchModalVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setBranchModalVisible(false)
          }
        >
          <Pressable
            style={styles.modalContainer}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Branch
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setBranchModalVisible(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#55515F"
                />
              </TouchableOpacity>
            </View>

            {branchesLoading && (
              <Text style={styles.branchStatus}>
                Loading branches...
              </Text>
            )}

            {branchesError && (
              <Text style={styles.branchError}>
                {branchesError}
              </Text>
            )}

            {branches.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={[
                  styles.branchOption,
                  branch === item._id &&
                    styles.selectedBranchOption,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  setBranch(item._id);
                  setBranchModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.branchOptionText,
                    branch === item._id &&
                      styles.selectedBranchOptionText,
                  ]}
                >
                  {item.name}
                </Text>

                {branch === item._id && (
                  <MaterialCommunityIcons
                    name="check"
                    size={21}
                    color="#5A2EC4"
                  />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Role */}
      <Text style={styles.label}>Login As</Text>
      <RoleSelector
        value={role}
        onChange={setRole}
      />

      {/* Password */}

      <AuthInput
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Create password"
        secureTextEntry
      />

      {/* Confirm Password */}

      <AuthInput
        label="Confirm Password"
        icon="lock-closed-outline"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Re-enter password"
        secureTextEntry
      />

      {/* Create Account */}

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.primaryButton}
        onPress={handleRegister}
      >
        <Text style={styles.primaryText}>
          Create Account
        </Text>
      </TouchableOpacity>

      {/* Login */}

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>
          Already have an account?
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.loginLink}>
            {' '}Login
          </Text>
        </TouchableOpacity>
      </View>

    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 25,
  },

  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 27,
    color: '#202126',
  },

  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    color: '#77767D',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  fieldContainer: {
    width: '100%',
    marginBottom: 18,
  },

  label: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#171724',
    marginBottom: 9,
  },

  branchSelector: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCDCE5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },

  branchSelectorSelected: {
    borderColor: '#7553C8',
  },

  branchIcon: {
    marginRight: 13,
  },

  branchText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    color: '#252538',
  },

  branchPlaceholder: {
    color: '#A5A9B8',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
  },

  modalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 19,
    color: '#202126',
  },

  branchOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFF3',
  },

  selectedBranchOption: {
    backgroundColor: '#F4F0FF',
    borderRadius: 8,
  },

  branchOptionText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    color: '#35333D',
  },

  selectedBranchOptionText: {
    color: '#5A2EC4',
    fontFamily: 'PoppinsSemiBold',
  },

  primaryButton: {
    height: 68,
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: '#5A2EC4',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#5A2EC4',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 5,
  },

  primaryText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
    fontSize: 17,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },

  loginText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#77767D',
  },

  loginLink: {
    fontFamily: 'PoppinsSemiBold',
    color: '#5A2EC4',
    fontSize: 13,
  },

  branchStatus: {
  fontFamily: 'PoppinsRegular',
  fontSize: 14,
  color: '#77767D',
  textAlign: 'center',
  paddingVertical: 20,
},

branchError: {
  fontFamily: 'PoppinsRegular',
  fontSize: 14,
  color: '#D64545',
  textAlign: 'center',
  paddingVertical: 20,
},
});