import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ChangePasswordPageProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

export default function ChangePasswordPage({
  onContentScroll,
  onBack,
}: ChangePasswordPageProps) {
  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const hasEightCharacters =
    newPassword.length >= 8;

  const hasLetter =
    /[A-Za-z]/.test(newPassword);

  const hasNumber =
    /\d/.test(newPassword);

  const passwordsMatch =
    newPassword.length > 0 &&
    newPassword === confirmPassword;

  const isFormValid = useMemo(
    () =>
      currentPassword.length > 0 &&
      hasEightCharacters &&
      hasLetter &&
      hasNumber &&
      passwordsMatch,
    [
      currentPassword,
      hasEightCharacters,
      hasLetter,
      hasNumber,
      passwordsMatch,
    ],
  );

  const handleUpdatePassword = () => {
    if (!isFormValid) {
      return;
    }

    Alert.alert(
      'Password Updated',
      'Your password has been changed successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            onBack?.();
          },
        },
      ],
    );
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    visible: boolean,
    onToggleVisibility: () => void,
    placeholder: string,
  ) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
        </Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={19}
            color="#5420D8"
          />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A0A3AD"
            style={styles.input}
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={onToggleVisibility}
            hitSlop={8}
            style={styles.eyeButton}
          >
            <Ionicons
              name={
                visible
                  ? 'eye-outline'
                  : 'eye-off-outline'
              }
              size={20}
              color="#777C89"
            />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#5420D8"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Change Password
          </Text>

          <Text style={styles.headerSubtitle}>
            Keep your account secure
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onContentScroll}
      >
        {/* INTRO */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={30}
              color="#5420D8"
            />
          </View>

          <View style={styles.introText}>
            <Text style={styles.introTitle}>
              Update your password
            </Text>

            <Text style={styles.introDescription}>
              Choose a strong password that you
              don't use on other accounts.
            </Text>
          </View>
        </View>

        {/* PASSWORD FORM */}
        <View style={styles.formCard}>
          {renderPasswordInput(
            'Current Password',
            currentPassword,
            setCurrentPassword,
            showCurrent,
            () => setShowCurrent(!showCurrent),
            'Enter your current password',
          )}

          {renderPasswordInput(
            'New Password',
            newPassword,
            setNewPassword,
            showNew,
            () => setShowNew(!showNew),
            'Enter your new password',
          )}

          {renderPasswordInput(
            'Confirm New Password',
            confirmPassword,
            setConfirmPassword,
            showConfirm,
            () => setShowConfirm(!showConfirm),
            'Re-enter your new password',
          )}

          {/* PASSWORD REQUIREMENTS */}
          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>
              Password requirements
            </Text>

            <Requirement
              valid={hasEightCharacters}
              text="At least 8 characters"
            />

            <Requirement
              valid={hasLetter}
              text="At least one letter"
            />

            <Requirement
              valid={hasNumber}
              text="At least one number"
            />

            <Requirement
              valid={passwordsMatch}
              text="Passwords match"
            />
          </View>

          {/* UPDATE BUTTON */}
          <Pressable
            style={({ pressed }) => [
              styles.updateButton,
              !isFormValid &&
                styles.updateButtonDisabled,
              pressed &&
                isFormValid &&
                styles.pressed,
            ]}
            onPress={handleUpdatePassword}
            disabled={!isFormValid}
          >
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.updateButtonText}>
              Update Password
            </Text>
          </Pressable>
        </View>

        {/* SECURITY NOTE */}
        <View style={styles.securityCard}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#5420D8"
          />

          <Text style={styles.securityText}>
            For your security, never share your
            password with anyone.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ======================================
   PASSWORD REQUIREMENT
====================================== */

type RequirementProps = {
  valid: boolean;
  text: string;
};

function Requirement({
  valid,
  text,
}: RequirementProps) {
  return (
    <View style={styles.requirementRow}>
      <Ionicons
        name={
          valid
            ? 'checkmark-circle'
            : 'ellipse-outline'
        }
        size={17}
        color={
          valid
            ? '#22A55A'
            : '#A0A3AD'
        }
      />

      <Text
        style={[
          styles.requirementText,
          valid &&
            styles.requirementTextValid,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

/* ======================================
   STYLES
====================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: '#111528',
    fontFamily: 'PoppinsBold',
    fontSize: 18,
  },

  headerSubtitle: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginTop: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 120,
  },

  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  introText: {
    flex: 1,
  },

  introTitle: {
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
  },

  introDescription: {
    color: '#777C89',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 2,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
  },

  inputGroup: {
    marginBottom: 13,
  },

  inputLabel: {
    color: '#343848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
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

  input: {
    flex: 1,
    color: '#171A2B',
    fontFamily: 'PoppinsMedium',
    fontSize: 12.5,
    marginLeft: 9,
    paddingVertical: 0,
  },

  eyeButton: {
    paddingLeft: 8,
  },

  requirements: {
    backgroundColor: '#F8F6FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 2,
    marginBottom: 14,
  },

  requirementsTitle: {
    color: '#343848',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
    marginBottom: 7,
  },

  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  requirementText: {
    color: '#858996',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    marginLeft: 7,
  },

  requirementTextValid: {
    color: '#22A55A',
    fontFamily: 'PoppinsMedium',
  },

  updateButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#5420D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  updateButtonDisabled: {
    backgroundColor: '#C8C8CE',
  },

  updateButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEE7FF',
    borderRadius: 14,
    padding: 12,
  },

  securityText: {
    flex: 1,
    color: '#665A82',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    lineHeight: 16,
    marginLeft: 8,
  },

  pressed: {
    opacity: 0.7,
  },
});