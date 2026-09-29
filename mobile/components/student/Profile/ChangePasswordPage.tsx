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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordValid = useMemo(() => {
    return (
      newPassword.length >= 8 &&
      /[A-Za-z]/.test(newPassword) &&
      /\d/.test(newPassword)
    );
  }, [newPassword]);

  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const isFormValid =
    currentPassword.length > 0 &&
    passwordValid &&
    passwordsMatch;

  const handleChangePassword = () => {
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

            if (onBack) {
              onBack();
            }
          },
        },
      ],
    );
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    setValue: (value: string) => void,
    visible: boolean,
    setVisible: (value: boolean) => void,
    placeholder: string,
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={19}
            color="#8A82A0"
          />

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#A9A2B7"
            secureTextEntry={!visible}
            autoCapitalize="none"
          />

          <Pressable
            onPress={() => setVisible(!visible)}
            hitSlop={10}
          >
            <Ionicons
              name={visible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#8A82A0"
            />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        <Pressable
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#6630D7"
          />
          <Text style={styles.backText}>Back to Profile</Text>
        </Pressable>

        <View style={styles.headerCard}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="lock-closed-outline"
              size={27}
              color="#6630D7"
            />
          </View>

          <Text style={styles.title}>Change Password</Text>

          <Text style={styles.subtitle}>
            Keep your account secure by using a strong
            password.
          </Text>
        </View>

        <View style={styles.formCard}>
          {renderPasswordInput(
            'Current Password',
            currentPassword,
            setCurrentPassword,
            showCurrent,
            setShowCurrent,
            'Enter current password',
          )}

          {renderPasswordInput(
            'New Password',
            newPassword,
            setNewPassword,
            showNew,
            setShowNew,
            'Enter new password',
          )}

          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>
              Password requirements
            </Text>

            <Requirement
              text="At least 8 characters"
              valid={newPassword.length >= 8}
            />

            <Requirement
              text="Contains at least one letter"
              valid={/[A-Za-z]/.test(newPassword)}
            />

            <Requirement
              text="Contains at least one number"
              valid={/\d/.test(newPassword)}
            />
          </View>

          {renderPasswordInput(
            'Confirm New Password',
            confirmPassword,
            setConfirmPassword,
            showConfirm,
            setShowConfirm,
            'Re-enter new password',
          )}

          {confirmPassword.length > 0 && (
            <View style={styles.matchRow}>
              <Ionicons
                name={
                  passwordsMatch
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={18}
                color={
                  passwordsMatch
                    ? '#27AE60'
                    : '#D64545'
                }
              />

              <Text
                style={[
                  styles.matchText,
                  {
                    color: passwordsMatch
                      ? '#27AE60'
                      : '#D64545',
                  },
                ]}
              >
                {passwordsMatch
                  ? 'Passwords match'
                  : 'Passwords do not match'}
              </Text>
            </View>
          )}

          <Pressable
            style={[
              styles.updateButton,
              !isFormValid && styles.updateButtonDisabled,
            ]}
            disabled={!isFormValid}
            onPress={handleChangePassword}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.updateButtonText}>
              Update Password
            </Text>
          </Pressable>
        </View>

        <View style={styles.securityCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color="#6630D7"
          />

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Account Security
            </Text>

            <Text style={styles.securityText}>
              Never share your password with anyone.
              Use a unique password for your account.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

type RequirementProps = {
  text: string;
  valid: boolean;
};

function Requirement({
  text,
  valid,
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
        color={valid ? '#27AE60' : '#A9A2B7'}
      />

      <Text
        style={[
          styles.requirementText,
          valid && styles.requirementTextValid,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FB',
  },

  content: {
    padding: 16,
    paddingBottom: 110,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 4,
  },

  backText: {
    marginLeft: 7,
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#6630D7',
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EFE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#25202F',
  },

  subtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#827B91',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 5,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
  },

  fieldContainer: {
    marginBottom: 15,
  },

  label: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#383142',
    marginBottom: 7,
  },

  inputWrapper: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E4DFEC',
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFBFE',
  },

  input: {
    flex: 1,
    marginHorizontal: 9,
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#292330',
  },

  requirementsCard: {
    backgroundColor: '#F7F3FF',
    borderRadius: 14,
    padding: 13,
    marginBottom: 15,
    marginTop: -2,
  },

  requirementsTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#4D4261',
    marginBottom: 8,
  },

  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  requirementText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#8A8297',
    marginLeft: 7,
  },

  requirementTextValid: {
    color: '#27AE60',
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -6,
    marginBottom: 14,
  },

  matchText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    marginLeft: 6,
  },

  updateButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#6630D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  updateButtonDisabled: {
    backgroundColor: '#C9C3D3',
  },

  updateButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 8,
  },

  securityCard: {
    marginTop: 14,
    backgroundColor: '#EEE8FF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  securityContent: {
    flex: 1,
    marginLeft: 10,
  },

  securityTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#49326E',
  },

  securityText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#716581',
    lineHeight: 17,
    marginTop: 3,
  },
});