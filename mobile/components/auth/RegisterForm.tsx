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

/* =========================================================
   TYPES
========================================================= */

type Branch = {
  _id: string;
  name: string;
  code: string;
};

type Batch = {
  _id: string;
  name: string;
  code: string;
  standard: string;
  academicYear: string;
  branchId: string | { _id: string; name?: string; code?: string };
  startDate: string;
  endDate: string;
  isRemoved?: boolean;
  status?: string;
};

/* =========================================================
   REGISTER FORM
========================================================= */

export function RegisterForm() {
  /* -------------------------------------------------------
     COMMON FIELDS
  ------------------------------------------------------- */

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] =
    useState(false);
  const [branchesError, setBranchesError] =
    useState('');

  const [role, setRole] = useState<UserRole | ''>('');

  /* -------------------------------------------------------
     PASSWORD
  ------------------------------------------------------- */

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  /* -------------------------------------------------------
     TEACHER
  ------------------------------------------------------- */

  const [specialization, setSpecialization] =
    useState('');

  const [qualification, setQualification] =
    useState('');

  const [experience, setExperience] =
    useState('');

  const [teacherAddress, setTeacherAddress] =
    useState('');

  /* -------------------------------------------------------
     STUDENT
  ------------------------------------------------------- */

  const [selectedBatch, setSelectedBatch] =
    useState<Batch | null>(null);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError, setBatchesError] = useState('');
  const [batchRetryKey, setBatchRetryKey] = useState(0);

  const [guardianName, setGuardianName] =
    useState('');

  const [guardianMobile, setGuardianMobile] =
    useState('');

  const [studentAddress, setStudentAddress] =
    useState('');

  /* -------------------------------------------------------
     MODALS
  ------------------------------------------------------- */

  const [branchModalVisible, setBranchModalVisible] =
    useState(false);

  const [batchModalVisible, setBatchModalVisible] =
    useState(false);

  /* =======================================================
     SELECTED BRANCH
  ======================================================= */

  const selectedBranch = branches.find(
    (item) => item._id === branch
  );

  /* =======================================================
     FETCH BRANCHES
  ======================================================= */

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
            result.message ||
              'Failed to fetch branches'
          );
        }

        setBranches(
          result.data?.branches || []
        );
      } catch (error) {
        console.error(
          'Fetch branches error:',
          error
        );

        setBranchesError(
          'Unable to load branches. Please try again.'
        );
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  /* =======================================================
     FETCH BATCHES FOR SELECTED BRANCH
  ======================================================= */

  useEffect(() => {
    if (role !== 'Student' || !branch) {
      setBatches([]);
      setSelectedBatch(null);
      setBatchesError('');
      setBatchesLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchBatches = async () => {
      try {
        setBatchesLoading(true);
        setBatchesError('');
        setBatches([]);
        setSelectedBatch(null);

        // The API may return all batches or support branchId filtering.
        // We filter again on the client so only the selected branch is shown.
        const response = await fetch(
          `${API_BASE_URL}/batches/registration?branchId=${encodeURIComponent(branch)}`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Failed to fetch batches'
          );
        }

        const returnedBatches: Batch[] = Array.isArray(result.data)
          ? result.data
          : result.data?.batches ?? result.batches ?? [];

        if (!Array.isArray(returnedBatches)) {
          throw new Error('Invalid batches response from server');
        }

        const branchBatches = returnedBatches.filter((item) => {
          const itemBranchId =
            typeof item.branchId === 'object'
              ? item.branchId?._id
              : item.branchId;

          return itemBranchId === branch && item.isRemoved !== true;
        });

        setBatches(branchBatches);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.error('Fetch batches error:', error);
        setBatchesError(
          error instanceof Error
            ? error.message
            : 'Unable to load batches. Please try again.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setBatchesLoading(false);
        }
      }
    };

    fetchBatches();

    return () => {
      controller.abort();
    };
  }, [role, branch, batchRetryKey]);

  /* =======================================================
     MOBILE
  ======================================================= */

  const handleMobileChange = (
    value: string
  ) => {
    const numbersOnly = value
      .replace(/\D/g, '')
      .slice(0, 10);

    setMobile(numbersOnly);
  };

  const handleGuardianMobileChange = (
    value: string
  ) => {
    const numbersOnly = value
      .replace(/\D/g, '')
      .slice(0, 10);

    setGuardianMobile(numbersOnly);
  };

  /* =======================================================
     ROLE CHANGE
  ======================================================= */

  const handleRoleChange = (
    selectedRole: UserRole
  ) => {
    setRole(selectedRole);

    if (selectedRole === 'Teacher') {
      setSelectedBatch(null);
      setGuardianName('');
      setGuardianMobile('');
      setStudentAddress('');
    }

    if (selectedRole === 'Student') {
      setSpecialization('');
      setQualification('');
      setExperience('');
      setTeacherAddress('');
    }
  };

  /* =======================================================
     REGISTER
  ======================================================= */

  const handleRegister = async () => {
    /* -----------------------------------------------------
       REQUIRED COMMON FIELDS
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       EMAIL
    ----------------------------------------------------- */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    /* -----------------------------------------------------
       MOBILE
    ----------------------------------------------------- */

    if (mobile.length !== 10) {
      Alert.alert(
        'Invalid Mobile',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    /* -----------------------------------------------------
       PASSWORD
    ----------------------------------------------------- */

    if (password.length < 6) {
      Alert.alert(
        'Invalid Password',
        'Password must contain at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Passwords do not match.'
      );
      return;
    }

    /* -----------------------------------------------------
       TEACHER VALIDATION
    ----------------------------------------------------- */

    if (role === 'Teacher') {
      if (!qualification.trim()) {
        Alert.alert(
          'Missing details',
          'Please enter your qualification.'
        );
        return;
      }

      if (!experience.trim()) {
        Alert.alert(
          'Missing details',
          'Please enter your teaching experience.'
        );
        return;
      }
    }

    /* -----------------------------------------------------
       STUDENT VALIDATION
    ----------------------------------------------------- */

    if (role === 'Student') {
      if (!selectedBatch?._id) {
        Alert.alert(
          'Missing details',
          'Please select a valid batch.'
        );
        return;
      }

      if (
        guardianMobile.trim() &&
        guardianMobile.length !== 10
      ) {
        Alert.alert(
          'Invalid Guardian Mobile',
          'Please enter a valid 10-digit guardian mobile number.'
        );
        return;
      }
    }

    /* -----------------------------------------------------
       PAYLOAD
    ----------------------------------------------------- */

    const payload: Record<
      string,
      unknown
    > = {
      fullName: name.trim(),

      email: email
        .trim()
        .toLowerCase(),

      password,

      mobileNumber: mobile.trim(),

      role: role.toLowerCase(),

      branchId: branch,
    };

    /* -----------------------------------------------------
       TEACHER DATA
    ----------------------------------------------------- */

    if (role === 'Teacher') {
      payload.specialization =
        specialization.trim();

      payload.qualification =
        qualification.trim();

      payload.experience =
        experience.trim();

      payload.address =
        teacherAddress.trim();
    }

    /* -----------------------------------------------------
       STUDENT DATA
    ----------------------------------------------------- */

    if (role === 'Student') {
    if (!selectedBatch?._id) {
      Alert.alert('Validation Error', 'Please select a batch.');
      return;
    }

    payload.batchId = selectedBatch._id;

    payload.guardianName = guardianName.trim();
    payload.guardianMobile = guardianMobile.trim();
    payload.address = studentAddress.trim();
  }
    /* -----------------------------------------------------
       API REQUEST
    ----------------------------------------------------- */

    try {
      console.log(
        'REGISTER PAYLOAD:',
        payload
      );

      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        Alert.alert(
          'Registration failed',
          result.message ||
            'Unable to create your account.'
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

            onPress: () => {
              router.replace('/');
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        'Registration error:',
        error
      );

      Alert.alert(
        'Connection error',
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <AuthScreen footer={false}>
      {/* =================================================
          HEADING
      ================================================= */}

      <View style={styles.heading}>
        <Text style={styles.title}>
          Create Account
        </Text>

        <Text style={styles.subtitle}>
          Register to get started with
          Vertical Classes
        </Text>
      </View>

      {/* =================================================
          FULL NAME
      ================================================= */}

      <AuthInput
        label="Full Name"
        icon="person-outline"
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        autoCapitalize="words"
      />

      {/* =================================================
          EMAIL
      ================================================= */}

      <AuthInput
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* =================================================
          MOBILE
      ================================================= */}

      <AuthInput
        label="Mobile Number"
        icon="call-outline"
        value={mobile}
        onChangeText={handleMobileChange}
        placeholder="Enter your 10-digit mobile number"
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      {/* =================================================
          BRANCH
      ================================================= */}

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Branch Name
        </Text>

        <TouchableOpacity
          style={[
            styles.branchSelector,
            selectedBranch &&
              styles.branchSelectorSelected,
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
            {selectedBranch?.name ||
              'Select your branch'}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color="#77767D"
          />
        </TouchableOpacity>
      </View>

      {/* =================================================
          BRANCH MODAL
      ================================================= */}

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
            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                Select Branch
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setBranchModalVisible(
                    false
                  )
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
              <Text
                style={
                  styles.branchStatus
                }
              >
                Loading branches...
              </Text>
            )}

            {branchesError && (
              <Text
                style={
                  styles.branchError
                }
              >
                {branchesError}
              </Text>
            )}

            {!branchesLoading &&
              !branchesError &&
              branches.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={[
                    styles.branchOption,
                    branch === item._id &&
                      styles.selectedBranchOption,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (branch !== item._id) {
                      setSelectedBatch(null);
                      setBatches([]);
                    }

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

      {/* =================================================
          ROLE
      ================================================= */}

      <Text style={styles.label}>
        Login As
      </Text>

      <RoleSelector
        value={role}
        onChange={handleRoleChange}
      />

      {/* =================================================
          PASSWORD
          SAME AS OLD REGISTER FORM
      ================================================= */}

      <AuthInput
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Create password"
        secureTextEntry
      />

      {/* =================================================
          CONFIRM PASSWORD
          SAME AS OLD REGISTER FORM
      ================================================= */}

      <AuthInput
        label="Confirm Password"
        icon="lock-closed-outline"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Re-enter password"
        secureTextEntry
      />

      {/* =================================================
          TEACHER FIELDS
      ================================================= */}

      {role === 'Teacher' && (
        <>
          <View
            style={styles.roleSection}
          >
            <Text
              style={
                styles.roleSectionTitle
              }
            >
              Teacher Information
            </Text>

            <Text
              style={
                styles.roleSectionSubtitle
              }
            >
              Enter your professional
              details
            </Text>
          </View>

          <AuthInput
            label="Specialization"
            icon="book-outline"
            value={specialization}
            onChangeText={
              setSpecialization
            }
            placeholder="e.g. Mathematics, Physics"
            autoCapitalize="words"
          />

          <AuthInput
            label="Qualification"
            icon="school-outline"
            value={qualification}
            onChangeText={
              setQualification
            }
            placeholder="e.g. M.Sc., M.Tech., B.Ed."
            autoCapitalize="words"
          />

          <AuthInput
            label="Teaching Experience"
            icon="briefcase-outline"
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g. 3 years"
            autoCapitalize="sentences"
          />

          <AuthInput
            label="Address"
            icon="location-outline"
            value={teacherAddress}
            onChangeText={
              setTeacherAddress
            }
            placeholder="Enter your address"
            autoCapitalize="sentences"
          />

          <View
            style={styles.infoBox}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#5A2EC4"
            />

            <Text
              style={styles.infoText}
            >
              Employee ID will be generated
              automatically by the system.
            </Text>
          </View>
        </>
      )}

      {/* =================================================
          STUDENT FIELDS
      ================================================= */}

      {role === 'Student' && (
        <>
          <View
            style={styles.roleSection}
          >
            <Text
              style={
                styles.roleSectionTitle
              }
            >
              Student Information
            </Text>

            <Text
              style={
                styles.roleSectionSubtitle
              }
            >
              Select your academic batch
            </Text>
          </View>

          {/* Batch */}

          <View
            style={styles.fieldContainer}
          >
            <Text style={styles.label}>
              Batch
            </Text>

            <TouchableOpacity
              style={[
                styles.branchSelector,
                selectedBatch &&
                  styles.branchSelectorSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (!branch) {
                  Alert.alert(
                    'Select Branch',
                    'Please select your branch before selecting a batch.'
                  );
                  return;
                }

                if (batchesLoading) return;
                setBatchModalVisible(true);
              }}
            >
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={22}
                color="#A5A9B8"
                style={styles.branchIcon}
              />

              <Text
                style={[
                  styles.branchText,
                  !selectedBatch &&
                    styles.branchPlaceholder,
                ]}
              >
                {selectedBatch?.name ||
                  (batchesLoading
                    ? 'Loading batches...'
                    : !branch
                      ? 'Select a branch first'
                      : 'Select your batch')}
              </Text>

              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
                color="#77767D"
              />
            </TouchableOpacity>
          </View>

          {/* Batch Modal */}

          <Modal
            visible={
              batchModalVisible
            }
            transparent
            animationType="fade"
            onRequestClose={() =>
              setBatchModalVisible(
                false
              )
            }
          >
            <Pressable
              style={
                styles.modalOverlay
              }
              onPress={() =>
                setBatchModalVisible(
                  false
                )
              }
            >
              <Pressable
                style={
                  styles.modalContainer
                }
                onPress={(event) =>
                  event.stopPropagation()
                }
              >
                <View
                  style={
                    styles.modalHeader
                  }
                >
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    Select Batch
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      setBatchModalVisible(
                        false
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color="#55515F"
                    />
                  </TouchableOpacity>
                </View>

                {batchesLoading && (
                  <Text style={styles.branchStatus}>
                    Loading batches...
                  </Text>
                )}

                {!batchesLoading && batchesError !== '' && (
                  <View>
                    <Text style={styles.branchError}>
                      {batchesError}
                    </Text>

                    <TouchableOpacity
                      style={styles.branchOption}
                      activeOpacity={0.7}
                      onPress={() => {
                        setBatchRetryKey((value) => value + 1);
                      }}
                    >
                      <Text style={styles.branchOptionText}>
                        Try again
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!batchesLoading &&
                  !batchesError &&
                  batches.length === 0 && (
                    <Text style={styles.branchStatus}>
                      No batches available for this branch.
                    </Text>
                  )}

                {!batchesLoading &&
                  !batchesError &&
                  batches.map((item) => {
                    const selected = selectedBatch?._id === item._id;

                    return (
                      <TouchableOpacity
                        key={item._id}
                        style={[
                          styles.branchOption,
                          selected && styles.selectedBranchOption,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedBatch(item);
                          setBatchModalVisible(false);
                        }}
                      >
                        <View style={styles.batchTextContainer}>
                          <Text
                            style={[
                              styles.branchOptionText,
                              selected && styles.selectedBranchOptionText,
                            ]}
                          >
                            {item.name}
                          </Text>

                          <Text style={styles.batchMeta}>
                            {item.standard} {' • '} {item.academicYear} {' • '} {item.code}
                          </Text>
                        </View>

                        {selected && (
                          <MaterialCommunityIcons
                            name="check"
                            size={21}
                            color="#5A2EC4"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </Pressable>
            </Pressable>
          </Modal>

          <Text
            style={
              styles.subSectionTitle
            }
          >
            Parent / Guardian
          </Text>

          <AuthInput
            label="Guardian Name"
            icon="person-outline"
            value={guardianName}
            onChangeText={
              setGuardianName
            }
            placeholder="Enter guardian name"
            autoCapitalize="words"
          />

          <AuthInput
            label="Guardian Mobile"
            icon="call-outline"
            value={guardianMobile}
            onChangeText={
              handleGuardianMobileChange
            }
            placeholder="Enter guardian mobile number"
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <AuthInput
            label="Address"
            icon="location-outline"
            value={studentAddress}
            onChangeText={
              setStudentAddress
            }
            placeholder="Enter your address"
            autoCapitalize="sentences"
          />

          <View
            style={styles.infoBox}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#5A2EC4"
            />

            <Text
              style={styles.infoText}
            >
              Standard is determined from
              the selected batch.
            </Text>
          </View>
        </>
      )}

      {/* =================================================
          CREATE ACCOUNT
      ================================================= */}

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.primaryButton}
        onPress={handleRegister}
      >
        <Text
          style={styles.primaryText}
        >
          Create Account
        </Text>
      </TouchableOpacity>

      {/* =================================================
          LOGIN
      ================================================= */}

      <View
        style={styles.loginRow}
      >
        <Text
          style={styles.loginText}
        >
          Already have an account?
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.replace('/')
          }
        >
          <Text
            style={styles.loginLink}
          >
            {' '}Login
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}

/* =========================================================
   STYLES
========================================================= */

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
    height: 55,
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

  /* Modal */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.45)',
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

  /* Role sections */

  roleSection: {
    marginTop: 12,
    marginBottom: 18,
    paddingTop: 6,
  },

  roleSectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#202126',
  },

  roleSectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#77767D',
    marginTop: 3,
  },

  subSectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#202126',
    marginTop: 4,
    marginBottom: 14,
  },

  /* Batch */

  batchTextContainer: {
    flex: 1,
  },

  batchMeta: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#88838F',
    marginTop: 2,
  },

  /* Info */

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F0FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 5,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    lineHeight: 17,
    color: '#665E77',
  },

  /* Create Account */

  primaryButton: {
    height: 55,
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

  /* Login */

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 14,
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
});