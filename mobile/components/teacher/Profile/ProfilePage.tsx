import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

type ProfilePageProps = {
  name: string;
  email: string;
  phone: string;
  onSaveProfile: (
    name: string,
    email: string,
    phone: string,
  ) => void;
};

export default function ProfilePage({
  name,
  email,
  phone,
  onSaveProfile,
}: ProfilePageProps) {
  const { logout,user } = useAuth();
  const [editVisible, setEditVisible] = useState(false);

  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(
    extractPhoneDigits(phone),
  );

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(extractPhoneDigits(phone));
  }, [name, email, phone]);

  const openEditProfile = () => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(extractPhoneDigits(phone));

    clearErrors();
    setEditVisible(true);
  };

  const closeEditProfile = () => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(extractPhoneDigits(phone));

    clearErrors();
    setEditVisible(false);
  };

  const clearErrors = () => {
    setNameError('');
    setEmailError('');
    setPhoneError('');
  };

  /* ================= NAME ================= */

  const handleNameChange = (text: string) => {
    setEditName(text);

    if (text.trim().length > 0) {
      setNameError('');
    }
  };

  /* ================= EMAIL ================= */

  const handleEmailChange = (text: string) => {
    setEditEmail(text);

    if (isValidEmail(text.trim())) {
      setEmailError('');
    }
  };

  /* ================= PHONE ================= */

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');

    const limitedDigits = digitsOnly.slice(0, 10);

    setEditPhone(limitedDigits);

    if (limitedDigits.length === 10) {
      setPhoneError('');
    }
  };

  /* ================= FORM VALIDATION ================= */

  const isFormValid =
    editName.trim().length > 0 &&
    isValidEmail(editEmail.trim()) &&
    editPhone.length === 10;

  /* ================= SAVE ================= */

  const handleSave = () => {
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim();
    const phoneDigits = editPhone.replace(/\D/g, '');

    let hasError = false;

    /* NAME */

    if (!trimmedName) {
      setNameError('Name cannot be empty.');
      hasError = true;
    } else {
      setNameError('');
    }

    /* EMAIL */

    if (!trimmedEmail) {
      setEmailError('Email cannot be empty.');
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    } else {
      setEmailError('');
    }

    /* PHONE */

    if (!phoneDigits) {
      setPhoneError('Phone number cannot be empty.');
      hasError = true;
    } else if (phoneDigits.length !== 10) {
      setPhoneError(
        'Phone number must contain exactly 10 digits.',
      );
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (hasError) {
      return;
    }

    const formattedPhone = `+91 ${phoneDigits}`;

    onSaveProfile(
      trimmedName,
      trimmedEmail,
      formattedPhone,
    );

    setEditVisible(false);
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);

              Alert.alert(
                'Logout Failed',
                'Unable to logout. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <>
      {/* ================= PROFILE PAGE ================= */}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ================= PROFILE SUMMARY ================= */}

        <View style={styles.profileSummary}>
          <View style={styles.profileAvatar}>
            <Ionicons
              name="person-outline"
              size={46}
              color="#5420D8"
            />
          </View>

          <Text style={styles.profileName}>
            {name}
          </Text>

          <Text style={styles.profileRole}>
            {user?.roles || 'Not specified'}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
            onPress={openEditProfile}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color="#5420D8"
            />

            <Text style={styles.editButtonText}>
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* ================= PERSONAL INFORMATION ================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <ProfileRow
            icon="mail-outline"
            label="Email"
            value={email}
          />

          <ProfileRow
            icon="call-outline"
            label="Phone"
            value={phone}
          />

          <ProfileRow
            icon="id-card-outline"
            label="Employee ID"
            value="TCH-001"
            showDivider={false}
          />
        </View>

        {/* ================= TEACHING INFORMATION ================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Teaching Information
          </Text>

          <ProfileRow
            icon="book-outline"
            label="Subject"
            value="Physics"
          />

          <ProfileRow
            icon="people-outline"
            label="Classes"
            value="3 Classes"
          />

          <ProfileRow
            icon="school-outline"
            label="Students"
            value="68 Students"
            showDivider={false}
          />
        </View>

        {/* ================= ACCOUNT ================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <ProfileAction
            icon="lock-closed-outline"
            title="Change Password"
          />

          <ProfileAction
            icon="notifications-outline"
            title="Notification Settings"
          />

          <ProfileAction
            icon="help-circle-outline"
            title="Help & Support"
          />

          <ProfileAction
            icon="log-out-outline"
            title="Logout"
            danger
            showDivider={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* ================= EDIT PROFILE MODAL ================= */}

      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditProfile}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <Pressable
            style={styles.modalBackground}
            onPress={closeEditProfile}
          />

          <View style={styles.editModal}>
            {/* ================= MODAL HEADER ================= */}

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  Edit Profile
                </Text>

                <Text style={styles.modalSubtitle}>
                  Update your personal information
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeEditProfile}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#555B69"
                />
              </Pressable>
            </View>

            {/* ================= FULL NAME ================= */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Full Name
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  nameError && styles.inputError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={
                    nameError
                      ? '#D64545'
                      : '#5420D8'
                  }
                />

                <TextInput
                  value={editName}
                  onChangeText={handleNameChange}
                  placeholder="Enter your name"
                  placeholderTextColor="#A0A3AD"
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {nameError ? (
                <Text style={styles.errorText}>
                  {nameError}
                </Text>
              ) : null}
            </View>

            {/* ================= EMAIL ================= */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  emailError && styles.inputError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={
                    emailError
                      ? '#D64545'
                      : '#5420D8'
                  }
                />

                <TextInput
                  value={editEmail}
                  onChangeText={handleEmailChange}
                  placeholder="Enter your email"
                  placeholderTextColor="#A0A3AD"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* EMAIL HELPER TEXT */}

              <Text style={styles.emailHint}>
                Enter a valid email address
              </Text>

              {emailError ? (
                <Text style={styles.errorText}>
                  {emailError}
                </Text>
              ) : null}
            </View>

            {/* ================= PHONE ================= */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Phone Number
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  phoneError && styles.inputError,
                ]}
              >
                {/* FIXED +91 */}

                <Text style={styles.countryCode}>
                  +91
                </Text>

                <View style={styles.phoneDivider} />

                <TextInput
                  value={editPhone}
                  onChangeText={handlePhoneChange}
                  placeholder="10 digit number"
                  placeholderTextColor="#A0A3AD"
                  style={styles.phoneInput}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>

              {/* PHONE HELPER TEXT */}

              <Text style={styles.phoneHint}>
                Enter exactly 10 digits
              </Text>

              {phoneError ? (
                <Text style={styles.errorText}>
                  {phoneError}
                </Text>
              ) : null}
            </View>

            {/* ================= BUTTONS ================= */}

            <View style={styles.modalButtons}>
              {/* CANCEL */}

              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
                onPress={closeEditProfile}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              {/* SAVE */}

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,

                  /*
                   * GREY UNTIL ALL FIELDS ARE VALID
                   */
                  !isFormValid &&
                    styles.saveButtonDisabled,

                  pressed &&
                    isFormValid &&
                    styles.pressed,
                ]}
                onPress={handleSave}
                disabled={!isFormValid}
              >
                <Ionicons
                  name="checkmark"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={[
                    styles.saveButtonText,
                    !isFormValid &&
                      styles.saveButtonTextDisabled,
                  ]}
                >
                  Save Changes
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

/* ============================================================
   VALIDATION
   ============================================================ */

function isValidEmail(email: string): boolean {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

/* ============================================================
   PHONE HELPER
   ============================================================ */

function extractPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (
    digits.length === 12 &&
    digits.startsWith('91')
  ) {
    return digits.slice(2);
  }

  return digits.slice(-10);
}

/* ============================================================
   PROFILE ROW
   ============================================================ */

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  showDivider?: boolean;
};

function ProfileRow({
  icon,
  label,
  value,
  showDivider = true,
}: ProfileRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.profileRow,
        !showDivider && styles.noDivider,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rowIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#5420D8"
        />
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>
          {label}
        </Text>

        <Text
          style={styles.rowValue}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={18}
        color="#9A9EAA"
      />
    </Pressable>
  );
}

/* ============================================================
   ACCOUNT ACTION
   ============================================================ */

type ProfileActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  showDivider?: boolean;
  danger?: boolean;
  onPress?: () => void;
};

function ProfileAction({
  icon,
  title,
  showDivider = true,
  danger = false,
  onPress,
}: ProfileActionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionRow,
        !showDivider && styles.noDivider,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.actionIcon,
          danger && styles.logoutIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            danger
              ? '#D64545'
              : '#5420D8'
          }
        />
      </View>

      <Text
        style={[
          styles.actionText,
          danger && styles.logoutText,
        ]}
      >
        {title}
      </Text>

      {!danger && (
        <Ionicons
          name="chevron-forward-outline"
          size={19}
          color="#9A9EAA"
        />
      )}
    </Pressable>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  /* ================= PAGE ================= */

  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 105,
  },

  /* ================= PROFILE SUMMARY ================= */

  profileSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 10,
  },

  profileAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  profileName: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },

  profileRole: {
    textTransform: 'capitalize',
    color: '#666B78',
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    marginTop: 1,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEE7FF',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginTop: 9,
  },

  editButtonText: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    marginLeft: 5,
  },

  /* ================= SECTIONS ================= */

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 2,
    marginBottom: 10,
  },

  sectionTitle: {
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    marginBottom: 2,
  },

  /* ================= PROFILE ROW ================= */

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 55,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
  },

  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  rowText: {
    flex: 1,
    minWidth: 0,
  },

  rowLabel: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
  },

  rowValue: {
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    marginTop: 0,
  },

  /* ================= ACCOUNT ================= */

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
  },

  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  actionText: {
    flex: 1,
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
  },

  logoutIcon: {
    backgroundColor: '#FDECEC',
  },

  logoutText: {
    color: '#D64545',
    fontFamily: 'PoppinsSemiBold',
  },

  /* ================= MODAL ================= */

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  editModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    elevation: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 21,
  },

  modalSubtitle: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    marginTop: 2,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  /* ================= INPUTS ================= */

  inputGroup: {
    marginBottom: 13,
  },

  inputLabel: {
    color: '#343848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    marginBottom: 6,
  },

  inputWrapper: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F6FA',
    borderWidth: 1,
    borderColor: '#E4E1EB',
    borderRadius: 12,
    paddingHorizontal: 13,
  },

  inputError: {
    borderColor: '#D64545',
    backgroundColor: '#FFF8F8',
  },

  input: {
    flex: 1,
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    marginLeft: 10,
    paddingVertical: 0,
  },

  /* ================= EMAIL HELPER ================= */

  emailHint: {
    color: '#9296A2',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 4,
  },

  /* ================= PHONE ================= */

  countryCode: {
    color: '#171A2B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
  },

  phoneDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#D5D2DC',
    marginHorizontal: 10,
  },

  phoneInput: {
    flex: 1,
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    paddingVertical: 0,
  },

  phoneHint: {
    color: '#9296A2',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 4,
  },

  errorText: {
    color: '#D64545',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 4,
  },

  /* ================= BUTTONS ================= */

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 7,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCDCE3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#555B69',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#5420D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  saveButtonDisabled: {
    backgroundColor: '#C8C8CE',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
  },

  saveButtonTextDisabled: {
    color: '#777984',
  },

  /* ================= COMMON ================= */

  noDivider: {
    borderBottomWidth: 0,
  },

  pressed: {
    opacity: 0.7,
  },
});