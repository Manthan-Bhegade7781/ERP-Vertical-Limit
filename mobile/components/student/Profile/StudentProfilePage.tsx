import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type StudentProfilePageProps = {
  onContentScroll?: (event: any) => void;
  onChangePasswordPress?: () => void;
  onHelpPress?: () => void;
  onLogout?: () => void;
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function StudentProfilePage({
  onContentScroll,
  onChangePasswordPress,
  onHelpPress,
  onLogout,
}: StudentProfilePageProps) {
  const [name, setName] = useState('Aarav Mehta');
  const [email, setEmail] = useState('aarav.mehta@gmail.com');
  const [phone, setPhone] = useState('9876543210');

  const [editVisible, setEditVisible] = useState(false);

  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);

  const [logoutVisible, setLogoutVisible] = useState(false);

  const isFormValid =
    editName.trim().length > 0 &&
    isValidEmail(editEmail.trim()) &&
    editPhone.length === 10;

  const openEditModal = () => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(phone);
    setEditVisible(true);
  };

  const handleSaveProfile = () => {
    if (!isFormValid) {
      return;
    }

    setName(editName.trim());
    setEmail(editEmail.trim());
    setPhone(editPhone);

    setEditVisible(false);
  };

  const handleLogout = () => {
    setLogoutVisible(false);

    if (onLogout) {
      onLogout();
    } else {
      Alert.alert('Logout', 'You have been logged out.');
    }
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
      >
        {/* PROFILE HEADER */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileMain}>
            <Text style={styles.profileName}>
              {name}
            </Text>

            <Text style={styles.profileRole}>
              10th Standard • Student
            </Text>

            <Text style={styles.profileId}>
              Student ID: STU1001
            </Text>
          </View>

          <Pressable
            style={styles.editIconButton}
            onPress={openEditModal}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#6630D7"
            />
          </Pressable>
        </View>

        {/* PERSONAL INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="person-outline"
              label="Full Name"
              value={name}
            />

            <View style={styles.divider} />

            <InfoRow
              icon="mail-outline"
              label="Email Address"
              value={email}
            />

            <View style={styles.divider} />

            <InfoRow
              icon="call-outline"
              label="Phone Number"
              value={`+91 ${phone}`}
            />
          </View>
        </View>

        {/* ACADEMIC INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Academic Information
          </Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="school-outline"
              label="Class"
              value="10th Standard"
            />

            <View style={styles.divider} />

            <InfoRow
              icon="people-outline"
              label="Batch"
              value="10th Standard A"
            />

            <View style={styles.divider} />

            <InfoRow
              icon="business-outline"
              label="Branch"
              value="Main Branch"
            />

            <View style={styles.divider} />

            <InfoRow
              icon="book-outline"
              label="Subjects"
              value="Physics, Mathematics, Chemistry"
            />
          </View>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <View style={styles.accountCard}>
            <AccountRow
              icon="lock-closed-outline"
              title="Change Password"
              subtitle="Update your account password"
              onPress={onChangePasswordPress}
            />

            <View style={styles.divider} />

            <AccountRow
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help or contact support"
              onPress={onHelpPress}
            />

            <View style={styles.divider} />

            <AccountRow
              icon="log-out-outline"
              title="Logout"
              subtitle="Sign out from your account"
              danger
              onPress={() => setLogoutVisible(true)}
            />
          </View>
        </View>

        {/* ACCOUNT INFORMATION */}
        <View style={styles.infoNotice}>
          <View style={styles.infoNoticeIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#6630D7"
            />
          </View>

          <View style={styles.infoNoticeContent}>
            <Text style={styles.infoNoticeTitle}>
              Your information is secure
            </Text>

            <Text style={styles.infoNoticeText}>
              Your profile information is visible only
              to you and authorized school staff.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit Profile
              </Text>

              <Pressable
                onPress={() => setEditVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#555"
                />
              </Pressable>
            </View>

            {/* NAME */}
            <Text style={styles.inputLabel}>
              Full Name
            </Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor="#AAA"
              style={styles.input}
            />

            {/* EMAIL */}
            <Text style={styles.inputLabel}>
              Email Address
            </Text>

            <TextInput
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter your email"
              placeholderTextColor="#AAA"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            {!isValidEmail(editEmail.trim()) &&
              editEmail.length > 0 && (
                <Text style={styles.errorText}>
                  Please enter a valid email address.
                </Text>
              )}

            {/* PHONE */}
            <Text style={styles.inputLabel}>
              Phone Number
            </Text>

            <View style={styles.phoneInputWrapper}>
              <Text style={styles.countryCode}>
                +91
              </Text>

              <TextInput
                value={editPhone}
                onChangeText={(value) => {
                  const numbersOnly =
                    value.replace(/\D/g, '').slice(0, 10);

                  setEditPhone(numbersOnly);
                }}
                placeholder="10 digit mobile number"
                placeholderTextColor="#AAA"
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.phoneInput}
              />
            </View>

            {editPhone.length > 0 &&
              editPhone.length !== 10 && (
                <Text style={styles.errorText}>
                  Phone number must contain 10 digits.
                </Text>
              )}

            {/* SAVE */}
            <Pressable
              disabled={!isFormValid}
              onPress={handleSaveProfile}
              style={[
                styles.saveButton,
                !isFormValid &&
                  styles.saveButtonDisabled,
              ]}
            >
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
      </Modal>

      {/* LOGOUT MODAL */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutCard}>
            <View style={styles.logoutIcon}>
              <Ionicons
                name="log-out-outline"
                size={25}
                color="#DC2626"
              />
            </View>

            <Text style={styles.logoutTitle}>
              Logout?
            </Text>

            <Text style={styles.logoutMessage}>
              Are you sure you want to logout from your
              student account?
            </Text>

            <View style={styles.logoutButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() =>
                  setLogoutVisible(false)
                }
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>
                  Logout
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* INFO ROW */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#6630D7"
        />
      </View>

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ACCOUNT ROW */

function AccountRow({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={styles.accountRow}
      onPress={onPress}
    >
      <View
        style={[
          styles.accountIcon,
          danger && styles.accountIconDanger,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={danger ? '#DC2626' : '#6630D7'}
        />
      </View>

      <View style={styles.accountText}>
        <Text
          style={[
            styles.accountTitle,
            danger && styles.accountTitleDanger,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.accountSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color="#AAA"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },

  profileCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6630D7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#FFFFFF',
  },

  profileMain: {
    flex: 1,
    marginLeft: 13,
  },

  profileName: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#292532',
  },

  profileRole: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#725AA8',
    marginTop: 2,
  },

  profileId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8A7AA8',
    marginTop: 4,
  },

  editIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: {
    marginTop: 18,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
    marginBottom: 9,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 13,
  },

  infoRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  infoValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#35313D',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0EDF5',
  },

  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 13,
  },

  accountRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },

  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  accountIconDanger: {
    backgroundColor: '#FEECEC',
  },

  accountText: {
    flex: 1,
  },

  accountTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#35313D',
  },

  accountTitleDanger: {
    color: '#DC2626',
  },

  accountSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 2,
  },

  infoNotice: {
    marginTop: 18,
    backgroundColor: '#F1EDFF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoNoticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoNoticeContent: {
    flex: 1,
  },

  infoNoticeTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#4D3A77',
  },

  infoNoticeText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#81759A',
    lineHeight: 11,
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#292532',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F5F3F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#4A4554',
    marginBottom: 6,
    marginTop: 8,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E1DCEB',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#292532',
    backgroundColor: '#FAF9FC',
  },

  phoneInputWrapper: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E1DCEB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9FC',
  },

  countryCode: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#55505E',
    paddingLeft: 12,
    paddingRight: 7,
  },

  phoneInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 5,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#292532',
  },

  errorText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#DC2626',
    marginTop: 4,
  },

  saveButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: '#6630D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  saveButtonDisabled: {
    backgroundColor: '#D9D6DF',
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },

  saveButtonTextDisabled: {
    color: '#99959F',
  },

  logoutCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 22,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },

  logoutIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FEECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#292532',
    marginTop: 12,
  },

  logoutMessage: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#77727F',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 5,
  },

  logoutButtons: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2F0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#55505E',
  },

  logoutButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});