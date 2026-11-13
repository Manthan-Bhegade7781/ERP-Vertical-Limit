import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  verifyPasswordResetOtp,
} from '@/services/auth';

type ForgotPasswordModalProps = {
  visible: boolean;
  onClose: () => void;
  onResetSuccess?: (email: string) => void;
  initialEmail?: string;
};

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export default function ForgotPasswordModal({
  visible,
  onClose,
  onResetSuccess,
  initialEmail = '',
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Resend OTP countdown
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep('email');
      setEmail(initialEmail);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setCountdown(60);
      setCanResend(false);
    }
  }, [visible, initialEmail]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (step === 'otp' && countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

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

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await requestPasswordResetOtp(email.trim());
      if (res.success) {
        setStep('otp');
        setCountdown(60);
        setCanResend(false);
      } else {
        setErrorMessage(res.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await requestPasswordResetOtp(email.trim());
      if (res.success) {
        setCountdown(60);
        setCanResend(false);
        Alert.alert('Code Sent', 'A fresh 6-digit verification code has been emailed to you.');
      } else {
        setErrorMessage(res.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await verifyPasswordResetOtp(email.trim(), cleanOtp);
      if (res.success) {
        setStep('newPassword');
      } else {
        setErrorMessage(res.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!passwordValid) {
      setErrorMessage('Password must be at least 8 characters with 1 letter & 1 number.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await resetPasswordWithOtp(email.trim(), otp.trim(), newPassword);
      if (res.success) {
        setStep('success');
      } else {
        setErrorMessage(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onClose();
    if (onResetSuccess) {
      onResetSuccess(email.trim());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.dialogCard}>
          {/* TOP BAR / CLOSE BUTTON */}
          <View style={styles.dialogTopBar}>
            {step !== 'success' && step !== 'email' ? (
              <TouchableOpacity
                onPress={() => {
                  setErrorMessage('');
                  if (step === 'otp') setStep('email');
                  else if (step === 'newPassword') setStep('otp');
                }}
                style={styles.backButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color="#64748B" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 32 }} />
            )}

            {/* STEP PROGRESS DOTS */}
            {step !== 'success' && (
              <View style={styles.stepDotsRow}>
                <View style={[styles.stepDot, step === 'email' && styles.stepDotActive]} />
                <View style={[styles.stepDot, step === 'otp' && styles.stepDotActive]} />
                <View style={[styles.stepDot, step === 'newPassword' && styles.stepDotActive]} />
              </View>
            )}

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* ========================================================= */}
            {/* STEP 1: EMAIL */}
            {/* ========================================================= */}
            {step === 'email' && (
              <>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="lock-reset" size={34} color="#6630D7" />
                </View>

                <Text style={styles.dialogTitle}>Forgot Password?</Text>
                <Text style={styles.dialogSubtitle}>
                  Enter your registered email address. We will send you a 6-digit OTP code to reset your password.
                </Text>

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Registered Email</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#8A92A6" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. name@example.com"
                      placeholderTextColor="#9AA2B1"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (errorMessage) setErrorMessage('');
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Send OTP Code</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ========================================================= */}
            {/* STEP 2: OTP VERIFICATION */}
            {/* ========================================================= */}
            {step === 'otp' && (
              <>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="shield-key-outline" size={34} color="#6630D7" />
                </View>

                <Text style={styles.dialogTitle}>Verification Code</Text>
                <Text style={styles.dialogSubtitle}>
                  Please enter the 6-digit verification code sent to{'\n'}
                  <Text style={styles.highlightText}>{email}</Text>
                </Text>

                <View style={styles.emailSentNotice}>
                  <MaterialCommunityIcons name="email-check-outline" size={20} color="#6630D7" />
                  <Text style={styles.emailSentNoticeText}>
                    A verification code has been dispatched to your email address. Please check your inbox or spam folder.
                  </Text>
                </View>

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>6-Digit OTP</Text>
                  <View style={styles.otpInputWrapper}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="------"
                      placeholderTextColor="#CBD5E1"
                      value={otp}
                      onChangeText={(t) => {
                        const digits = t.replace(/\D/g, '').slice(0, 6);
                        setOtp(digits);
                        if (errorMessage) setErrorMessage('');
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                  </View>
                </View>

                {/* RESEND TIMER ROW */}
                <View style={styles.resendRow}>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                      <Text style={styles.resendActiveText}>Resend OTP Code</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.resendMutedText}>
                      Resend code in <Text style={{ color: '#6630D7', fontFamily: 'PoppinsSemiBold' }}>{countdown}s</Text>
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (otp.length !== 6 || loading) && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={otp.length !== 6 || loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ========================================================= */}
            {/* STEP 3: NEW PASSWORD */}
            {/* ========================================================= */}
            {step === 'newPassword' && (
              <>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="lock-check-outline" size={34} color="#6630D7" />
                </View>

                <Text style={styles.dialogTitle}>Set New Password</Text>
                <Text style={styles.dialogSubtitle}>
                  Create a new secure password for your account.
                </Text>

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* NEW PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color="#8A92A6" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="At least 8 characters"
                      placeholderTextColor="#9AA2B1"
                      value={newPassword}
                      onChangeText={(t) => {
                        setNewPassword(t);
                        if (errorMessage) setErrorMessage('');
                      }}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword((s) => !s)}
                      style={styles.eyeButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={18}
                        color="#8A92A6"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* CONFIRM PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="lock-check-outline" size={20} color="#8A92A6" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-enter new password"
                      placeholderTextColor="#9AA2B1"
                      value={confirmPassword}
                      onChangeText={(t) => {
                        setConfirmPassword(t);
                        if (errorMessage) setErrorMessage('');
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword((s) => !s)}
                      style={styles.eyeButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={18}
                        color="#8A92A6"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* REQUIREMENTS CHECKLIST */}
                <View style={styles.checklistCard}>
                  <View style={styles.checkItem}>
                    <Ionicons
                      name={newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={15}
                      color={newPassword.length >= 8 ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.checkText, newPassword.length >= 8 && styles.checkTextDone]}>
                      At least 8 characters
                    </Text>
                  </View>

                  <View style={styles.checkItem}>
                    <Ionicons
                      name={
                        /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword)
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={15}
                      color={
                        /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword)
                          ? '#10B981'
                          : '#94A3B8'
                      }
                    />
                    <Text
                      style={[
                        styles.checkText,
                        /[A-Za-z]/.test(newPassword) &&
                          /\d/.test(newPassword) &&
                          styles.checkTextDone,
                      ]}
                    >
                      Contains letters and numbers
                    </Text>
                  </View>

                  <View style={styles.checkItem}>
                    <Ionicons
                      name={passwordsMatch ? 'checkmark-circle' : 'ellipse-outline'}
                      size={15}
                      color={passwordsMatch ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.checkText, passwordsMatch && styles.checkTextDone]}>
                      Passwords match
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!passwordValid || !passwordsMatch || loading) && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={!passwordValid || !passwordsMatch || loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ========================================================= */}
            {/* STEP 4: SUCCESS */}
            {/* ========================================================= */}
            {step === 'success' && (
              <View style={styles.successContainer}>
                <View style={styles.successCircle}>
                  <Ionicons name="checkmark-sharp" size={42} color="#10B981" />
                </View>

                <Text style={styles.successTitle}>Password Changed!</Text>
                <Text style={styles.successSubtitle}>
                  Your password has been successfully reset. You can now use your new password to log in.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryButton, { width: '100%', marginTop: 20 }]}
                  onPress={handleFinish}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>Back to Login</Text>
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 22,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  dialogTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    width: 22,
    backgroundColor: '#6630D7',
  },
  scrollContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    textAlign: 'center',
    marginBottom: 6,
  },
  dialogSubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  highlightText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#111528',
  },
  errorBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'PoppinsMedium',
    color: '#DC2626',
  },
  emailSentNotice: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F0FF',
    borderWidth: 1,
    borderColor: '#DCD0FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  emailSentNoticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#5B21B6',
    lineHeight: 17,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#111528',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
  },
  otpInputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#6630D7',
    paddingHorizontal: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    letterSpacing: 12,
    textAlign: 'center',
    width: '100%',
  },
  resendRow: {
    marginBottom: 18,
    alignItems: 'center',
  },
  resendActiveText: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },
  resendMutedText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#94A3B8',
  },
  checklistCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  checkTextDone: {
    color: '#10B981',
    fontFamily: 'PoppinsMedium',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#6630D7',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6630D7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
});
