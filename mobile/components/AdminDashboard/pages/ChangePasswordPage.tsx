import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { changePassword } from '@/services/auth';

export default function AdminChangePasswordPage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= 900;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleChangePassword = async () => {
    if (!isFormValid || submitting) return;

    try {
      setSubmitting(true);
      const res = await changePassword(currentPassword, newPassword);

      if (res.success) {
        Alert.alert(
          'Password Updated',
          res.message || 'Your password has been changed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Update Failed', res.message || 'Could not update password.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Network error while updating password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          isDesktop && styles.desktopContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isDesktop && styles.desktopCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-lock-outline" size={32} color="#7040D5" />
            </View>
            <Text style={styles.cardTitle}>Admin Password Security</Text>
            <Text style={styles.cardSubtitle}>
              Please enter your current administrator password, then choose a secure new one.
            </Text>
          </View>

          {/* CURRENT PASSWORD */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current Password *</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#7E889B" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#A3ADBA"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrent((s) => !s)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name={showCurrent ? 'eye-outline' : 'eye-off-outline'}
                  size={19}
                  color="#7E889B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* NEW PASSWORD */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>New Password *</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-plus-outline" size={20} color="#7E889B" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#A3ADBA"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNew((s) => !s)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name={showNew ? 'eye-outline' : 'eye-off-outline'}
                  size={19}
                  color="#7E889B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CONFIRM NEW PASSWORD */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm New Password *</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-check-outline" size={20} color="#7E889B" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor="#A3ADBA"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm((s) => !s)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                  size={19}
                  color="#7E889B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* REQUIREMENTS CHECKLIST */}
          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>Password Guidelines:</Text>

            <View style={styles.reqItem}>
              <MaterialCommunityIcons
                name={newPassword.length >= 8 ? 'check-circle' : 'circle-outline'}
                size={16}
                color={newPassword.length >= 8 ? '#10B981' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.reqText,
                  newPassword.length >= 8 && styles.reqTextSuccess,
                ]}
              >
                Minimum 8 characters
              </Text>
            </View>

            <View style={styles.reqItem}>
              <MaterialCommunityIcons
                name={
                  /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword)
                    ? 'check-circle'
                    : 'circle-outline'
                }
                size={16}
                color={
                  /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword)
                    ? '#10B981'
                    : '#94A3B8'
                }
              />
              <Text
                style={[
                  styles.reqText,
                  /[A-Za-z]/.test(newPassword) &&
                    /\d/.test(newPassword) &&
                    styles.reqTextSuccess,
                ]}
              >
                At least one letter and one number
              </Text>
            </View>

            <View style={styles.reqItem}>
              <MaterialCommunityIcons
                name={passwordsMatch ? 'check-circle' : 'circle-outline'}
                size={16}
                color={passwordsMatch ? '#10B981' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.reqText,
                  passwordsMatch && styles.reqTextSuccess,
                ]}
              >
                New passwords match
              </Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isFormValid || submitting) && styles.saveButtonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={!isFormValid || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save-check-outline" size={19} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveButtonText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    backgroundColor: '#7040D5',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  desktopContent: {
    alignItems: 'center',
    paddingTop: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    shadowColor: '#1A0B40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  desktopCard: {
    width: '100%',
    maxWidth: 600,
    padding: 28,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#172033',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#717D96',
    textAlign: 'center',
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'PoppinsMedium',
    color: '#344054',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#172033',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 6,
  },
  requirementsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAEFF5',
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#475569',
    marginBottom: 2,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  reqTextSuccess: {
    color: '#10B981',
    fontFamily: 'PoppinsMedium',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: '#64748B',
  },
  saveButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7040D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
  },
});
